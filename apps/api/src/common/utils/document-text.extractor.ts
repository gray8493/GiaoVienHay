import { BadRequestException } from '@nestjs/common';
import * as path from 'path';


const SUPPORTED_EXTENSIONS = ['.pdf', '.docx', '.txt'];
const MAX_EXTRACTED_CHARS = 30000;

export interface ExtractedDocument {
  text: string;
  fileName: string;
  extension: string;
  truncated: boolean;
}

function normalizeText(raw: string): string {
  return raw
    .split(String.fromCharCode(0))
    .join(' ')
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export async function extractDocumentText(
  file: Express.Multer.File,
): Promise<ExtractedDocument> {
  const fileName = file.originalname || 'giao_an';
  const extension = path.extname(fileName).toLowerCase();

  if (!SUPPORTED_EXTENSIONS.includes(extension)) {
    throw new BadRequestException({
      error_code: 'QUIZ_FILE_UNSUPPORTED',
      message: 'Định dạng tệp không được hỗ trợ. Chỉ chấp nhận .pdf, .docx hoặc .txt.',
    });
  }

  if (!file.buffer || file.buffer.length === 0) {
    throw new BadRequestException({
      error_code: 'QUIZ_FILE_EMPTY',
      message: 'Tệp tải lên rỗng. Vui lòng chọn lại tệp giáo án.',
    });
  }

  let rawText = '';

  try {
    if (extension === '.pdf') {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParseLib = require('pdf-parse');
      const parsed = await pdfParseLib(file.buffer);
      rawText = parsed?.text || '';
    } else if (extension === '.docx') {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const mammothLib = require('mammoth');
      const parsed = await mammothLib.extractRawText({ buffer: file.buffer });
      rawText = parsed?.value || '';
    } else {
      rawText = file.buffer.toString('utf8');
    }
  } catch {
    throw new BadRequestException({
      error_code: 'QUIZ_FILE_UNREADABLE',
      message: `Không thể đọc nội dung tệp "${fileName}". Tệp có thể bị hỏng hoặc được bảo vệ bằng mật khẩu.`,
    });
  }

  const text = normalizeText(rawText);

  if (text.length < 30) {
    throw new BadRequestException({
      error_code: 'QUIZ_FILE_NO_TEXT',
      message:
        'Không tìm thấy đủ nội dung văn bản trong tệp. Nếu là bản scan, vui lòng dùng tệp PDF có lớp văn bản hoặc tệp .docx.',
    });
  }

  return {
    text: text.slice(0, MAX_EXTRACTED_CHARS),
    fileName,
    extension,
    truncated: text.length > MAX_EXTRACTED_CHARS,
  };
}
