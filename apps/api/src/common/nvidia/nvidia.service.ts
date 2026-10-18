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

@Injectable()
export class NvidiaService {
  private readonly logger = new Logger(NvidiaService.name);
  private readonly apiKey?: string;
  private readonly baseUrl: string;
  private readonly model: string;
  private readonly timeoutMs: number;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('NVIDIA_API_KEY');
    this.baseUrl = (
      this.configService.get<string>('NVIDIA_BASE_URL') || 'https://integrate.api.nvidia.com/v1'
    ).replace(/\/+$/, '');
    this.model = this.configService.get<string>('NVIDIA_MODEL') || 'z-ai/glm-5.3-flash';
    this.timeoutMs = Number(this.configService.get<string>('NVIDIA_TIMEOUT_MS')) || 120000;

    if (this.apiKey) {
      this.logger.log(`NVIDIA AI Service initialized successfully. Model: ${this.model}`);
    } else {
      this.logger.warn('NVIDIA_API_KEY not configured. Falling back to intelligent mock generator.');
    }
  }

  async generateQuestionsFromLesson(
    lessonContent: string,
    subjectCode: string,
    numQuestions: number = 5,
    difficulty: DifficultyLevel = DifficultyLevel.MIXED,
  ): Promise<GeneratedQuestion[]> {
    if (this.apiKey) {
      try {
        const prompt = `Bạn là chuyên gia sư phạm Việt Nam. Hãy đọc nội dung giáo án bài học môn ${subjectCode} sau đây và tạo chính xác ${numQuestions} câu hỏi trắc nghiệm kiểm tra bài cũ với độ khó ${difficulty}:
Nội dung bài học:
"""
${lessonContent}
"""

Yêu cầu định dạng: Trả về DUY NHẤT một mảng JSON thuần túy (không kèm markdown \`\`\`json), mỗi phần tử gồm:
- question_index: số thứ tự (1, 2, ...)
- content: nội dung câu hỏi ngắn gọn, sư phạm
- options: mảng 4 phương án trắc nghiệm ["phương án A", "phương án B", "phương án C", "phương án D"]
- correct_answer: chữ cái đáp án đúng ("A", "B", "C", hoặc "D")
- explanation: giải thích ngắn gọn vì sao đáp án đúng
- time_limit_seconds: thời gian trả lời gợi ý (30)`;

        const text = await this.chatCompletion(prompt);
        const parsed = this.parseQuestions(text);
        if (parsed) {
          return parsed;
        }
        this.logger.warn('NVIDIA API returned an unparseable payload. Using pedagogical fallback.');
      } catch (err: any) {
        this.logger.error(
          `Error calling NVIDIA API: ${err?.message || err}. Using high-quality pedagogical fallback.`,
        );
      }
    }

    return this.generateMockPedagogicalQuestions(subjectCode, numQuestions, difficulty);
  }

  private async chatCompletion(prompt: string): Promise<string> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
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
          max_tokens: 4096,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(`HTTP ${response.status}: ${body.slice(0, 300)}`);
      }

      const data: any = await response.json();
      const content = data?.choices?.[0]?.message?.content;
      if (typeof content !== 'string' || content.trim().length === 0) {
        throw new Error('Empty response from NVIDIA API');
      }
      return content;
    } finally {
      clearTimeout(timer);
    }
  }

  private parseQuestions(text: string): GeneratedQuestion[] | null {
    const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    const start = cleaned.indexOf('[');
    const end = cleaned.lastIndexOf(']');
    const candidate = start !== -1 && end !== -1 ? cleaned.slice(start, end + 1) : cleaned;

    try {
      const parsed = JSON.parse(candidate);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((q: any, i: number) => ({
          question_index: Number(q?.question_index) || i + 1,
          content: String(q?.content ?? ''),
          options: Array.isArray(q?.options) ? q.options.map((o: any) => String(o)) : [],
          correct_answer: String(q?.correct_answer ?? 'A'),
          explanation: String(q?.explanation ?? ''),
          time_limit_seconds: Number(q?.time_limit_seconds) || 30,
        }));
      }
    } catch {
      // ignore parse errors and fall back
    }
    return null;
  }

  private generateMockPedagogicalQuestions(
    subjectCode: string,
    count: number,
    difficulty: DifficultyLevel,
  ): GeneratedQuestion[] {
    const sampleQuestions: Record<string, GeneratedQuestion[]> = {
      MATH: [
        {
          question_index: 1,
          content: 'Muốn cộng hai phân số cùng mẫu số, ta thực hiện như thế nào?',
          options: [
            'Cộng tử số với tử số và giữ nguyên mẫu số',
            'Cộng cả tử số và mẫu số với nhau',
            'Nhân tử số với mẫu số',
            'Giữ nguyên tử số và cộng mẫu số',
          ],
          correct_answer: 'A',
          explanation: 'Theo quy tắc Toán tiểu học: Muốn cộng hai phân số cùng mẫu số, ta cộng hai tử số và giữ nguyên mẫu số.',
          time_limit_seconds: 30,
        },
        {
          question_index: 2,
          content: 'Kết quả của phép tính 3/5 + 1/5 là:',
          options: ['4/10', '4/5', '3/25', '2/5'],
          correct_answer: 'B',
          explanation: '3/5 + 1/5 = (3 + 1)/5 = 4/5.',
          time_limit_seconds: 30,
        },
        {
          question_index: 3,
          content: 'Muốn rút gọn một phân số, ta làm thế nào?',
          options: [
            'Chia cả tử số và mẫu số cho cùng một số tự nhiên lớn hơn 1 mà cả hai cùng chia hết',
            'Cộng thêm 1 vào cả tử và mẫu',
            'Trừ bớt tử số đi mẫu số',
            'Đổi chỗ tử số và mẫu số',
          ],
          correct_answer: 'A',
          explanation: 'Rút gọn phân số nghĩa là chia cả tử và mẫu cho một ước chung lớn hơn 1 để được phân số tối giản.',
          time_limit_seconds: 30,
        },
      ],
      LITERATURE: [
        {
          question_index: 1,
          content: 'Từ đồng nghĩa là những từ có đặc điểm gì?',
          options: [
            'Có nghĩa giống nhau hoặc gần giống nhau',
            'Có cách phát âm hoàn toàn giống nhau',
            'Có nghĩa trái ngược nhau hoàn toàn',
            'Có chữ viết giống nhau nhưng nghĩa khác xa nhau',
          ],
          correct_answer: 'A',
          explanation: 'Từ đồng nghĩa là những từ có nghĩa giống nhau hoặc gần giống nhau.',
          time_limit_seconds: 30,
        },
      ],
    };

    const pool = sampleQuestions[subjectCode] || sampleQuestions.MATH;
    const result: GeneratedQuestion[] = [];
    for (let i = 0; i < count; i++) {
      const template = pool[i % pool.length];
      result.push({
        ...template,
        question_index: i + 1,
        content: `[Độ khó: ${difficulty}] Câu ${i + 1}: ${template.content}`,
      });
    }
    return result;
  }
}
