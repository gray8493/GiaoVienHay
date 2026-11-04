/**
 * Unit test NvidiaService — đảm bảo:
 *  1. Nội dung giáo án (từ file Word) được đưa vào prompt gửi AI
 *  2. KHÔNG còn fallback câu hỏi hardcode: lỗi AI → throw, không trả câu hỏi mẫu
 *  3. Chuẩn hóa đáp án AI (chữ cái / số thứ tự / nội dung đáp án) về A-D chặt chẽ
 */
import { NvidiaService, NvidiaGenerationError } from '../../apps/api/src/common/nvidia/nvidia.service';
import { DifficultyLevel } from '@giaovienhay/shared-types';

const envWithKey = {
  NVIDIA_API_KEY: 'nvapi-test-key',
  NVIDIA_BASE_URL: 'https://mock.nvidia/v1',
  NVIDIA_MODEL: 'openai/gpt-oss-20b',
  NVIDIA_TIMEOUT_MS: '10000',
};

function buildService(env: Record<string, string> = envWithKey): NvidiaService {
  const configService: any = { get: (key: string) => env[key] };
  return new NvidiaService(configService);
}

function okFetch(content: string) {
  return jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ choices: [{ message: { content } }] }),
  });
}

function aiJson(questions: any[]): string {
  return '```json\n' + JSON.stringify(questions) + '\n```';
}

const CAU_HOI_JSON = aiJson([
  {
    question_index: 1,
    content: 'Sông Ba bắt nguồn từ đâu?',
    options: ['Dãy Trường Sơn', 'Hà Nội', 'Miền Đông', 'Đảo Côn Đảo'],
    correct_answer: 'A',
    explanation: 'Sông Ba bắt nguồn từ dãy Trường Sơn.',
    time_limit_seconds: 30,
  },
  {
    question_index: 2,
    content: 'Sông Ba đổ ra biển ở tỉnh nào?',
    options: ['Phú Yên', 'Quảng Ngãi', 'Bình Thuận', 'Khánh Hòa'],
    correct_answer: 'Phú Yên',
    explanation: 'Sông Ba đổ biển tại Phú Yên.',
    time_limit_seconds: 30,
  },
]);

describe('NvidiaService — đọc nội dung giáo án & sinh câu hỏi (KHÔNG hardcode)', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    // @ts-expect-error global
    delete global.fetch;
  });

  it('Gửi đúng nội dung lessonContent (text từ file Word/PDF) vào prompt gọi AI', async () => {
    const fetchMock = okFetch(CAU_HOI_JSON);
    global.fetch = fetchMock as any;

    const lessonContent = 'Giáo án môn LITERATURE lớp 3: Sông Ba - dòng sông lớn nhất Nam Trung Bộ.';
    await buildService().generateQuestionsFromLesson(lessonContent, 'LITERATURE', 2);

    const call = fetchMock.mock.calls[0];
    const body = JSON.parse(call[1].body);
    expect(body.messages[0].role).toBe('user');
    expect(body.messages[0].content).toContain(lessonContent);
    expect(body.messages[0].content).toContain('LITERATURE');
    expect(body.messages[0].content).toContain('tạo đúng 2 câu hỏi');
  });

  it('Chuẩn hóa output: đáp án dạng chữ A-D, đánh lại question_index, source luôn nvidia_ai', async () => {
    global.fetch = okFetch(CAU_HOI_JSON) as any;

    const res = await buildService().generateQuestionsFromLesson('Nội dung giáo án Sông Ba', 'LITERATURE', 2);

    expect(res.source).toBe('nvidia_ai');
    expect(res.questions).toHaveLength(2);
    expect(res.questions[0]).toMatchObject({
      question_index: 1,
      correct_answer: 'A',
      content: 'Sông Ba bắt nguồn từ đâu?',
    });
    expect(res.questions[1]).toMatchObject({
      question_index: 2,
      correct_answer: 'A',
      options: ['Phú Yên', 'Quảng Ngãi', 'Bình Thuận', 'Khánh Hòa'],
    });
  });

  it('Nhận đáp án số 1-4 và object {text} cho options', async () => {
    global.fetch = okFetch(
      aiJson([
        {
          content: 'Sông Ba chảy qua vùng nào?',
          options: [
            { text: 'Tây Nguyên' },
            { text: 'Miền núi phía Bắc' },
            { text: 'Đồng bằng sông Cửu Long' },
            { text: 'Bắc Bộ' },
          ],
          correct_answer: 1,
        },
      ]),
    ) as any;

    const res = await buildService().generateQuestionsFromLesson('Nội dung giáo án Sông Ba', 'LITERATURE', 1);

    expect(res.questions).toHaveLength(1);
    expect(res.questions[0]).toMatchObject({
      correct_answer: 'A',
      options: ['Tây Nguyên', 'Miền núi phía Bắc', 'Đồng bằng sông Cửu Long', 'Bắc Bộ'],
    });
  });

  it('BỎ câu hỏi AI trả đáp án không quy được về A-D (không gán mồi "A")', async () => {
    global.fetch = okFetch(
      aiJson([
        {
          content: 'Câu chuẩn',
          options: ['A1', 'B1', 'C1', 'D1'],
          correct_answer: 'C',
        },
        {
          content: 'Câu rác đáp án ngoài A-D',
          options: ['X1', 'X2', 'X3', 'X4'],
          correct_answer: 'E',
        },
      ]),
    ) as any;

    const res = await buildService().generateQuestionsFromLesson('Nội dung giáo án', 'LITERATURE', 2);

    expect(res.questions).toHaveLength(1);
    expect(res.questions[0].correct_answer).toBe('C');
    expect(res.questions[0].content).toBe('Câu chuẩn');
  });

  it('API trả HTTP lỗi → throw lỗi, KHÔNG dùng câu hỏi hardcode', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 429,
      text: async () => 'rate limited',
    }) as any;

    await expect(
      buildService().generateQuestionsFromLesson('Giáo án Toán', 'MATH', 5, DifficultyLevel.MEDIUM),
    ).rejects.toMatchObject({
      name: 'NvidiaGenerationError',
      reason: 'API_ERROR',
    });
  });

  it('AI trả JSON hỏng (không parse được) → throw INVALID_FORMAT', async () => {
    global.fetch = okFetch('Xin lỗi, tôi không thể tạo câu hỏi hôm nay.') as any;

    await expect(
      buildService().generateQuestionsFromLesson('Giáo án Toán', 'MATH', 5),
    ).rejects.toMatchObject({ reason: 'INVALID_FORMAT' });
  });

  it('Một câu thiếu dấu " đóng chuỗi → bỏ câu đó, vẫn giữ các câu còn lại', async () => {
    const good = (n: number) =>
      `{"question_index": ${n}, "content": "Câu ${n}", "options": ["a", "b", "c", "d"], "correct_answer": "B", "explanation": "Vì sao", "time_limit_seconds": 30}`;
    const broken =
      '{"question_index": 2, "content": "Câu 2", "options": ["a", "b", "c", "d"], "correct_answer": "B", "explanation": "Thiếu dấu đóng.*\n "time_limit_seconds": 30}';
    global.fetch = okFetch(`[${good(1)}, ${broken}, ${good(3)}]`) as any;

    const res = await buildService().generateQuestionsFromLesson('Giáo án Toán', 'MATH', 3);

    expect(res.questions.map((q) => q.content)).toEqual(['Câu 1', 'Câu 3']);
    expect(res.questions.map((q) => q.question_index)).toEqual([1, 2]);
  });

  it('Escape LaTeX không hợp lệ ($\\ge 10$) → vá được, không mất câu hỏi', async () => {
    const raw =
      '[{"question_index": 1, "content": "Khi tổng $\\ge 10$ thì sao?", "options": ["a", "b", "c", "d"], "correct_answer": "A", "explanation": "Nhớ 1", "time_limit_seconds": 30}]';
    expect(() => JSON.parse(raw)).toThrow();
    global.fetch = okFetch(raw) as any;

    const res = await buildService().generateQuestionsFromLesson('Giáo án Toán', 'MATH', 1);

    expect(res.questions).toHaveLength(1);
    expect(res.questions[0].content).toContain('10');
  });

  it('AI trả mảng JSON nhưng rỗng/không câu hợp lệ → throw', async () => {
    global.fetch = okFetch(aiJson([])) as any;

    await expect(
      buildService().generateQuestionsFromLesson('Giáo án Toán', 'MATH', 5),
    ).rejects.toMatchObject({ reason: 'INVALID_FORMAT' });
  });

  it('Chưa cấu hình NVIDIA_API_KEY → throw API_KEY_MISSING thay vì trả câu hỏi mẫu', async () => {
    await expect(
      buildService({ NVIDIA_API_KEY: '' }).generateQuestionsFromLesson('Giáo án', 'MATH', 5),
    ).rejects.toMatchObject({ reason: 'API_KEY_MISSING', name: 'NvidiaGenerationError' });
  });

  it('Lỗi mạng abort trước khi gọi API → TIMEOUT', async () => {
    const abortError: any = new Error('The operation was aborted');
    abortError.name = 'AbortError';
    global.fetch = jest.fn().mockRejectedValue(abortError) as any;

    await expect(
      buildService().generateQuestionsFromLesson('Giáo án', 'MATH', 5),
    ).rejects.toMatchObject({ reason: 'TIMEOUT' });
  });

  it('Answer dạng nội dung đáp án trùng một phương án → tự map về đúng chữ cái', async () => {
    global.fetch = okFetch(
      aiJson([
        {
          content: 'Đơn vị đo đường chạy của sông ngắn là gì?',
          options: ['Ki-lô-mét', 'Tấn', 'Lít', 'Gam'],
          correct_answer: 'Ki-lô-mét',
        },
      ]),
    ) as any;

    const res = await buildService().generateQuestionsFromLesson('Giáo án Lịch sử', 'HISTORY', 1);
    expect(res.questions).toHaveLength(1);
    expect(res.questions[0].correct_answer).toBe('A');
  });
});
