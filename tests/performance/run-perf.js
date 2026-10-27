#!/usr/bin/env node
// ============================================================
// GiaoVienHay - Performance Test Runner Script
// Chạy bằng: node tests/performance/run-perf.js <env> [scenario]
//
// Ví dụ:
//   node tests/performance/run-perf.js smoke
//   node tests/performance/run-perf.js load auth
//   node tests/performance/run-perf.js stress grades
//   node tests/performance/run-perf.js spike
// ============================================================

'use strict';

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// ---- Parse arguments ----
const args = process.argv.slice(2);
const ENV = args[0] || 'smoke';
const SCENARIO = args[1]; // optional: auth | classes | attendance | grades | students | all

const VALID_ENVS = ['smoke', 'load', 'stress', 'spike'];
const VALID_SCENARIOS = ['auth', 'classes', 'attendance', 'grades', 'students', 'all'];

if (!VALID_ENVS.includes(ENV)) {
  console.error(`\n❌ Môi trường không hợp lệ: "${ENV}"`);
  console.error(`   Giá trị hợp lệ: ${VALID_ENVS.join(', ')}\n`);
  process.exit(1);
}

if (SCENARIO && !VALID_SCENARIOS.includes(SCENARIO)) {
  console.error(`\n❌ Scenario không hợp lệ: "${SCENARIO}"`);
  console.error(`   Giá trị hợp lệ: ${VALID_SCENARIOS.join(', ')}\n`);
  process.exit(1);
}

// ---- Đường dẫn file ----
const PERF_DIR = path.join(__dirname);
const REPORTS_DIR = path.join(PERF_DIR, 'reports');

// Tạo thư mục reports nếu chưa có
if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

// ---- Timestamp cho tên file report ----
const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);

// ---- Xác định file config cần chạy ----
function getConfigFiles() {
  if (!SCENARIO || SCENARIO === 'all') {
    return [{ name: 'all', file: path.join(PERF_DIR, 'artillery.config.yml') }];
  }
  return [{
    name: SCENARIO,
    file: path.join(PERF_DIR, 'scenarios', `${SCENARIO}.yml`),
  }];
}

// ---- Chạy artillery ----
function runArtillery(configFile, scenarioName) {
  const reportJson = path.join(REPORTS_DIR, `report_${scenarioName}_${ENV}_${ts}.json`);
  const reportHtml = path.join(REPORTS_DIR, `report_${scenarioName}_${ENV}_${ts}.html`);

  const cmd = [
    'npx artillery run',
    `--environment ${ENV}`,
    `--output "${reportJson}"`,
    `"${configFile}"`,
  ].join(' ');

  console.log('\n' + '='.repeat(65));
  console.log(`🚀 GiaoVienHay Performance Test`);
  console.log(`   Scenario : ${scenarioName.toUpperCase()}`);
  console.log(`   Môi trường: ${ENV.toUpperCase()}`);
  console.log(`   Config   : ${configFile}`);
  console.log(`   Report   : ${reportJson}`);
  console.log('='.repeat(65) + '\n');

  try {
    execSync(cmd, { stdio: 'inherit' });
    console.log(`\n✅ Test hoàn thành! Đang tạo HTML report...`);

    // Tạo HTML report (nếu plugin/version hỗ trợ)
    try {
      execSync(
        `npx artillery report --output "${reportHtml}" "${reportJson}"`,
        { stdio: 'pipe' },
      );
      console.log(`📊 HTML Report: ${reportHtml}`);
    } catch (_reportErr) {
      console.log(`ℹ️  Dữ liệu chi tiết đã được lưu tại: ${reportJson}`);
    }
  } catch (err) {
    console.error(`\n❌ Artillery test thất bại với lỗi:`, err.message);
    process.exit(err.status || 1);
  }
}

// ---- Main ----
console.log('\n⚡ GiaoVienHay Performance Test Suite');
console.log('   Đảm bảo API đang chạy tại http://localhost:3000 trước khi test!\n');

const configs = getConfigFiles();
for (const c of configs) {
  if (!fs.existsSync(c.file)) {
    console.error(`❌ Không tìm thấy file config: ${c.file}`);
    process.exit(1);
  }
  runArtillery(c.file, c.name);
}

console.log('\n🎉 Tất cả performance tests hoàn thành!');
console.log(`📁 Xem reports tại: ${REPORTS_DIR}\n`);
