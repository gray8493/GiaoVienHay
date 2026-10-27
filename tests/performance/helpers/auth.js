// ============================================================
// GiaoVienHay - Artillery Helper: Authentication
// Quản lý JWT token cho toàn bộ performance tests
//
// Artillery v2: các function phải là async (return Promise)
// KHÔNG dùng callback done() — dùng return / await thay thế
// ============================================================

'use strict';

const http = require('http');

// Cache token để tránh login quá nhiều lần
let cachedToken = null;
let tokenExpiry = 0;

const DEFAULT_PHONE = process.env.PERF_TEACHER_PHONE || '0909999999';
const DEFAULT_PASSWORD = process.env.PERF_TEACHER_PASS || 'Password@123';

/**
 * Gọi HTTP POST để lấy JWT từ /auth/login — trả về Promise
 */
function fetchToken(baseUrl, phone, password) {
  return new Promise((resolve) => {
    const body = JSON.stringify({ phone, password });
    const url = new URL('/api/v1/auth/login', baseUrl);

    const options = {
      hostname: url.hostname,
      port: parseInt(url.port) || 3000,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const token = json?.data?.access_token || json?.access_token;
          resolve(token || null);
        } catch (_e) {
          resolve(null);
        }
      });
    });

    req.on('error', () => resolve(null));
    req.write(body);
    req.end();
  });
}

/**
 * Đăng ký tài khoản nếu chưa tồn tại
 */
function autoRegisterUser(baseUrl, phone, password) {
  return new Promise((resolve) => {
    const body = JSON.stringify({
      phone,
      password,
      full_name: 'Test Perf Teacher',
      role: 'TEACHER_HOMEROOM',
      school_name: 'Trường Tiểu Học Chu Văn An',
      teaching_subjects: ['TOAN'],
    });
    const url = new URL('/api/v1/auth/register', baseUrl);

    const options = {
      hostname: url.hostname,
      port: parseInt(url.port) || 3000,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const token = json?.data?.access_token || json?.access_token;
          resolve(token || null);
        } catch (_e) {
          resolve(null);
        }
      });
    });

    req.on('error', () => resolve(null));
    req.write(body);
    req.end();
  });
}

/**
 * Lấy hoặc cache lại JWT access token từ API /auth/login
 * Artillery v2: async function, không có done callback
 */
async function loginAndGetToken(context, events) {
  const now = Date.now();
  const phone = DEFAULT_PHONE;
  const password = DEFAULT_PASSWORD;

  context.vars['phone'] = phone;
  context.vars['password'] = password;

  // Còn token hợp lệ thì dùng lại (cache 55 phút)
  if (cachedToken && now < tokenExpiry) {
    context.vars['authToken'] = cachedToken;
    return;
  }

  const baseUrl = context._config?.target || 'http://localhost:3000';
  let token = await fetchToken(baseUrl, phone, password);

  if (!token) {
    // Thử auto-register phòng khi DB mới reset
    token = await autoRegisterUser(baseUrl, phone, password);
  }

  if (token) {
    cachedToken = token;
    tokenExpiry = now + 55 * 60 * 1000; // cache 55 phút
    context.vars['authToken'] = token;
  } else {
    context.vars['authToken'] = 'INVALID_TOKEN_FOR_PERF_TEST';
  }
}

/**
 * Đặt authToken từ cache — Artillery v2: async function
 */
async function setAuthHeader(context, events) {
  const now = Date.now();
  if (!cachedToken || now >= tokenExpiry) {
    await loginAndGetToken(context, events);
  } else {
    context.vars['authToken'] = cachedToken;
    context.vars['phone'] = DEFAULT_PHONE;
    context.vars['password'] = DEFAULT_PASSWORD;
  }
}

/**
 * Hook: log response time nếu vượt ngưỡng cảnh báo
 * (afterResponse hook — Artillery v2 vẫn dùng next() ở đây)
 */
function logSlowResponse(requestParams, response, context, ee, next) {
  const WARN_THRESHOLD_MS = 1000;
  if (response && response.timings && response.timings.response > WARN_THRESHOLD_MS) {
    console.warn(
      `[SLOW] ${requestParams.method} ${requestParams.url} => ${response.timings.response}ms`,
    );
  }
  return next();
}

/**
 * Tạo ngẫu nhiên dữ liệu điểm danh cho stress test ghi
 * Artillery v2: async function
 */
async function generateAttendancePayload(context, events) {
  const statuses = ['PRESENT', 'ABSENT_UNEXCUSED', 'LATE', 'ABSENT_EXCUSED'];
  const studentCount = 30;
  const records = [];
  for (let i = 1; i <= studentCount; i++) {
    records.push({
      student_id: `stu_perf_${String(i).padStart(3, '0')}`,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      note: '',
    });
  }
  context.vars['attendanceRecords'] = records;
  context.vars['attendanceDate'] = new Date().toISOString().split('T')[0];
}

/**
 * Tạo payload nhập điểm batch ngẫu nhiên
 * Artillery v2: async function
 */
async function generateGradesPayload(context, events) {
  const scoreTypes = ['TEST_15P', 'MID_TERM', 'FINAL', 'ORAL_TEST'];
  const studentCount = 30;
  const scores = [];
  for (let i = 1; i <= studentCount; i++) {
    scores.push({
      student_id: `stu_perf_${String(i).padStart(3, '0')}`,
      score_type: scoreTypes[Math.floor(Math.random() * scoreTypes.length)],
      score_value: parseFloat((Math.random() * 10).toFixed(1)),
    });
  }
  context.vars['gradesBatchPayload'] = {
    class_id: process.env.PERF_CLASS_ID || 'cls_demo_001',
    subject_code: 'MATH',
    semester: 1,
    scores,
  };
}

module.exports = {
  loginAndGetToken,
  setAuthHeader,
  logSlowResponse,
  generateAttendancePayload,
  generateGradesPayload,
};
