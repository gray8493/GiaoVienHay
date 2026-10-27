// Stub nhẹ pdf-parse để Jest không phải parse ESM của package thật
// (unit test của QuizzesService không extract nội dung tệp thật)
const pdfParseStub = async () => ({
  text: '',
  numpages: 0,
  numrender: 0,
  info: {},
  metadata: {},
  version: 'pdf-parse-stub',
});

module.exports = pdfParseStub;
module.exports.default = pdfParseStub;
