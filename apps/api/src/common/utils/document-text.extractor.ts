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

/**
 * Chuyển HTML do mammoth sinh ra thành text thẳng hàng, giữ lại bảng
 * (mỗi ô ngăn bằng " | ", mỗi dòng bảng xuống dòng) — thứ tự nội dung vẫn
 * đúng như trong file Word, giúp AI đọc trọn đúng giáo án.
 */
function htmlToText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|h[1-6]|li|blockquote)\s*>/gi, '\n')
    .replace(/<\/t[dh]\s*>/gi, ' | ')
    .replace(/<\/tr\s*>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/[ \t]*\n[ \t]*\|[ \t]*/g, ' | ')
    .replace(/[ \t]*\|[ \t]*(?=\n)/g, '')
    .replace(/[ \t]{2,}/g, ' ');
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
      // Dùng convertToHtml thay vì extractRawText để giữ bảng và thứ tự đoạn (đọc giáo án chuẩn hơn)
      const parsed = await mammothLib.convertToHtml({ buffer: file.buffer });
      rawText = htmlToText(parsed?.value || '');
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
