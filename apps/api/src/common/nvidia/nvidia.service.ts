import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DifficultyLevel } from '@giaovienhay/shared-types';

export interface GeneratedQuestion {
  question_index: number;
  content: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  time_limit_seconds: number;
}

/**
 * Lý do tạo câu hỏi thất bại — được quizzes.service map về HTTP 502 với message rõ ràng.
 */
export type NvidiaFailureReason =
  | 'API_KEY_MISSING'
  | 'API_ERROR'
  | 'TIMEOUT'
  | 'EMPTY_RESPONSE'
  | 'INVALID_FORMAT';

export class NvidiaGenerationError extends Error {
  constructor(
    readonly reason: NvidiaFailureReason,
    message: string,
    readonly detail?: string,
  ) {
    super(message);
    this.name = 'NvidiaGenerationError';
  }
}

const ANSWER_LETTERS = ['A', 'B', 'C', 'D'];
const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
  [DifficultyLevel.EASY]: 'dễ',
  [DifficultyLevel.MEDIUM]: 'vừa',
  [DifficultyLevel.HARD]: 'khó',
  [DifficultyLevel.MIXED]: 'từ dễ đến khó',
};

@Injectable()
export class NvidiaService {
  private readonly logger = new Logger(NvidiaService.name);
  private readonly apiKey?: string;
  private readonly baseUrl: string;
  private readonly model: string;
  private readonly timeoutMs: number;
  private readonly rpm: number;
  private requestTimes: number[] = [];
  private slotLock: Promise<void> = Promise.resolve();

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('NVIDIA_API_KEY');
    this.baseUrl = (
      this.configService.get<string>('NVIDIA_BASE_URL') || 'https://integrate.api.nvidia.com/v1'
    ).replace(/\/+$/, '');
    this.model = this.configService.get<string>('NVIDIA_MODEL') || 'openai/gpt-oss-20b';
    this.timeoutMs = Number(this.configService.get<string>('NVIDIA_TIMEOUT_MS')) || 120000;
    this.rpm = Number(this.configService.get<string>('NVIDIA_RPM')) || 40;

    if (this.apiKey) {
      this.logger.log(
        `NVIDIA AI Service initialized. Model: ${this.model} · Shared-key limit: ${this.rpm} req/phút`,
      );
    } else {
      this.logger.warn('NVIDIA_API_KEY not configured. AI question generation will fail until configured.');
    }
  }

  /**
   * Toàn bộ giáo viên dùng chung một API key, nên phải tự giới hạn tần suất
   * để không vượt ngưỡng RPM của NVIDIA (mặc định 40 req/phút). Caller nào
   * vượt ngưỡng sẽ chờ tới khi có "slot" trống rồi mới gửi request.
   */
  private async acquireSlot(): Promise<void> {
    const previous = this.slotLock;
    let release!: () => void;
    this.slotLock = new Promise<void>((resolve) => {
      release = resolve;
    });
    await previous;
    try {
      const windowMs = 60_000;
      let now = Date.now();
      this.requestTimes = this.requestTimes.filter((t) => now - t < windowMs);
      while (this.requestTimes.length >= this.rpm) {
        const waitMs = windowMs - (now - this.requestTimes[0]) + 50;
        if (waitMs > 0) {
          await new Promise((resolve) => setTimeout(resolve, waitMs));
        }
        now = Date.now();
        this.requestTimes = this.requestTimes.filter((t) => now - t < windowMs);
      }
      this.requestTimes.push(Date.now());
    } finally {
      release();
    }
  }

  /**
   * Sinh câu hỏi trắc nghiệm từ nội dung giáo án.
   * KHÔNG còn fallback câu hỏi hardcode: mọi lỗi (API/timeout/format) đều
   * throw NvidiaGenerationError để caller báo lại người dùng.
   */
  async generateQuestionsFromLesson(
    lessonContent: string,
    subjectCode: string,
    numQuestions: number = 5,
    difficulty: DifficultyLevel = DifficultyLevel.MIXED,
  ): Promise<{ questions: GeneratedQuestion[]; source: 'nvidia_ai' }> {
    if (!this.apiKey) {
      throw new NvidiaGenerationError(
        'API_KEY_MISSING',
        'Máy chủ chưa cấu hình khóa NVIDIA_API_KEY nên không thể tạo câu hỏi bằng AI. Vui lòng liên hệ quản trị viên.',
      );
    }

    const targetCount = Math.min(Math.max(Number(numQuestions) || 5, 1), 20);
    const prompt = this.buildLessonPrompt(lessonContent, subjectCode, targetCount, difficulty);

    let text: string;
    try {
      text = await this.chatCompletion(prompt);
    } catch (err) {
      if (err instanceof NvidiaGenerationError) throw err;
      throw new NvidiaGenerationError(
        'API_ERROR',
        `Không gọi được NVIDIA API: ${err instanceof Error ? err.message : String(err)}`,
      );
    }

    const parsed = this.parseQuestions(text, targetCount);
    if (!parsed) {
      this.logger.warn(`AI response was not parseable as questions JSON. First 300 chars: ${text.slice(0, 300)}`);
      throw new NvidiaGenerationError(
        'INVALID_FORMAT',
        'AI trả về kết quả không đúng định dạng. Vui lòng thử lại hoặc giảm số lượng câu hỏi.',
        text.slice(0, 400),
      );
    }
    if (parsed.length < targetCount) {
      this.logger.warn(
        `AI only returned ${parsed.length}/${targetCount} valid questions; accepting the valid ones.`,
      );
    }
    return { questions: parsed, source: 'nvidia_ai' };
  }

  private buildLessonPrompt(
    lessonContent: string,
    subjectCode: string,
    numQuestions: number,
    difficulty: DifficultyLevel,
  ): string {
    const diffLabel = DIFFICULTY_LABELS[difficulty] || 'vừa';
    return `Bạn là chuyên gia sư phạm tiểu học của Việt Nam. Hãy đọc nội dung bài học môn ${subjectCode} sau đây và tạo đúng ${numQuestions} câu hỏi trắc nghiệm "kiểm tra bài cũ" với độ khó ${diffLabel}.

Nội dung bài học:
"""
${lessonContent}
"""

Quy tắc bắt buộc về nội dung:
- Câu hỏi, đáp án đúng và lời giải phải bám sát nội dung bài học trong dấu """ ở trên; tuyệt đối không bịa dữ kiện, số liệu hoặc kiến thức không có liên quan đến nội dung đó.
- Phương án nhiễu phải là lỗi sai thường gặp về cùng kiến thức đã nêu, phân biệt rõ ràng.
- Không sinh câu hỏi về chủ đề không xuất hiện trong nội dung bài học.

Yêu cầu định dạng: Trả về DUY NHẤT một mảng JSON thuần túy (không kèm chữ nào khác, không bọc trong \`\`\`json), mỗi phần tử gồm:
- question_index: số thứ tự (1, 2, ... tới ${numQuestions})
- content: nội dung câu hỏi
- options: mảng đúng 4 phương án trắc nghiệm ["phương án A", "phương án B", "phương án C", "phương án D"]
- correct_answer: chữ cái đáp án đúng, chỉ nhận "A", "B", "C" hoặc "D"
- explanation: giải thích ngắn gọn vì sao đáp án đúng (trích nguyên nhân từ nội dung bài học)
- time_limit_seconds: 30`;
  }

  private async chatCompletion(prompt: string): Promise<string> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      await this.acquireSlot();
      let response: Response;
      try {
        response = await fetch(`${this.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            model: this.model,
            messages: [{ role: 'user', content: prompt }],
            temperature: 1,
            top_p: 0.95,
            max_tokens: 8192,
            // gpt-oss là reasoning model: full reasoning có thể chạy 1-2 phút và
            // nuốt sạch max_tokens khiến content=null. Giảm effort để trả lời nhanh.
            reasoning_effort: 'low',
          }),
          signal: controller.signal,
        });
      } catch (err: any) {
        if (err?.name === 'AbortError') {
          throw new NvidiaGenerationError(
            'TIMEOUT',
            `NVIDIA API quá ${Math.round(this.timeoutMs / 1000)}s không phản hồi. Vui lòng thử lại sau ít phút.`,
          );
        }
        throw new NvidiaGenerationError('API_ERROR', `Không kết nối được NVIDIA API: ${err?.message || err}`);
      }

      if (!response.ok) {
        const body = await response.text();
        throw new NvidiaGenerationError(
          'API_ERROR',
          `NVIDIA API trả lỗi HTTP ${response.status}. Vui lòng thử lại sau ít phút.`,
          body.slice(0, 300),
        );
      }

      const data: any = await response.json();
      const message = data?.choices?.[0]?.message;
      let content = typeof message?.content === 'string' ? message.content : '';
      if (!content.trim()) {
        // Model reasoning có thể nhả JSON trong reasoning khi content rỗng
        content = String(message?.reasoning_content || message?.reasoning || '');
      }
      if (!content.trim()) {
        throw new NvidiaGenerationError('EMPTY_RESPONSE', 'NVIDIA API trả về nội dung rỗng. Vui lòng thử lại.');
      }
      return content;
    } finally {
      clearTimeout(timer);
    }
  }

  /**
   * Trích mảng JSON từ phản hồi AI và chuẩn hóa từng câu hỏi.
   * Trả về null khi không trích được JSON hoặc không còn câu hỏi hợp lệ nào.
   */
  private parseQuestions(text: string, limit: number): GeneratedQuestion[] | null {
    const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    const start = cleaned.indexOf('[');
    const end = cleaned.lastIndexOf(']');
    if (start === -1 || end <= start) return null;

    let rawList: any[];
    try {
      rawList = JSON.parse(cleaned.slice(start, end + 1));
    } catch {
      return null;
    }
    if (!Array.isArray(rawList)) return null;

    const questions: GeneratedQuestion[] = [];
    for (const raw of rawList) {
      const question = this.normalizeQuestion(raw);
      if (question) {
        question.question_index = questions.length + 1;
        questions.push(question);
      }
      if (questions.length >= limit) break;
    }
    return questions.length > 0 ? questions : null;
  }

  /** Chuẩn hóa 1 câu hỏi thô từ AI; trả null nếu câu không đủ chuẩn (thay vì vá mồi). */
  private normalizeQuestion(raw: any): GeneratedQuestion | null {
    if (!raw || typeof raw !== 'object') return null;

    const content = typeof raw.content === 'string' ? raw.content.replace(/\s+/g, ' ').trim() : '';
    if (!content) return null;

    const options = this.normalizeOptions(raw.options);
    if (!options) return null;

    const correctAnswer = this.normalizeCorrectAnswer(raw.correct_answer, options);
    if (!correctAnswer) return null;

    const explanation = typeof raw.explanation === 'string' ? raw.explanation.trim() : '';
    const timeLimit = Number(raw.time_limit_seconds);

    return {
      question_index: 0,
      content,
      options,
      correct_answer: correctAnswer,
      explanation,
      time_limit_seconds: Number.isFinite(timeLimit) && timeLimit > 0 ? Math.round(timeLimit) : 30,
    };
  }

  private normalizeOptions(rawOptions: unknown): string[] | null {
    if (!Array.isArray(rawOptions)) return null;
    const options: string[] = [];
    for (const raw of rawOptions) {
      const text =
        typeof raw === 'string'
          ? raw
          : typeof (raw as any)?.text === 'string'
            ? (raw as any).text
            : '';
      const cleaned = text.replace(/\s+/g, ' ').trim();
      if (cleaned && options.length < 4) options.push(cleaned);
    }
    return options.length === 4 ? options : null;
  }

  /**
   * Quy đổi đáp án AI trả về về chữ cái A-D:
   * 1) chữ cái đơn ("A" / "A." / "đáp án A...")
   * 2) số 1-4 coi như vị trí phương án
   * 3) nội dung đáp án trùng với text một phương án
   * Không khớp → null (bỏ câu, không gán mồi "A").
   */
  private normalizeCorrectAnswer(rawAnswer: unknown, options: string[]): string | null {
    const asText = String(rawAnswer ?? '').trim();
    if (!asText) return null;
    const upper = asText.toUpperCase();

    if (typeof rawAnswer === 'number' && Number.isInteger(rawAnswer) && rawAnswer >= 1 && rawAnswer <= 4) {
      return ANSWER_LETTERS[rawAnswer - 1];
    }
    if (/^[1-4]$/.test(upper)) return ANSWER_LETTERS[Number(upper) - 1];

    const onlyLetter = upper.replace(/[^A-D]/g, '');
    if (onlyLetter.length === 1) return onlyLetter;

    const normalizedTarget = this.matchKey(asText);
    if (!normalizedTarget) return null;
    const matchIndex = options.findIndex((o) => this.matchKey(o) === normalizedTarget);
    if (matchIndex !== -1) return ANSWER_LETTERS[matchIndex];

    if (normalizedTarget.length >= 6) {
      const loose = options
        .map((o, i) => ({ i, includes: this.matchKey(o).includes(normalizedTarget) }))
        .filter((r) => r.includes);
      if (loose.length === 1) return ANSWER_LETTERS[loose[0].i];
    }
    return null;
  }

  /** So sánh nội dung phương án đã bỏ tiền tố "A." / "A)" / "A)" và khoảng trắng dư. */
  private matchKey(text: string): string {
    return text
      .replace(/^\s*[A-D][.:)\-–—]\s*/i, '')
      .replace(/[.:)\s]+$/, '')
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim();
  }
}
