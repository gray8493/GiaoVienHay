// Stub nhẹ mammoth để Jest không phải parse ESM của package thật
// (unit test của QuizzesService không extract nội dung tệp thật)
const mammothStub = {
  extractRawText: async () => ({ value: '', messages: [] }),
};

module.exports = mammothStub;
module.exports.default = mammothStub;
