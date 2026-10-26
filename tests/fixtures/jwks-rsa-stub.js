// Stub nhẹ jwks-rsa để Jest không phải parse ESM của package thật
// (firebase-admin chỉ dùng khi verify token thật, unit test không cần)
class JwksClient {
  constructor(_options) {}
  getSigningKey(_kid) {
    return Promise.reject(new Error('jwks-rsa stub: không hỗ trợ trong unit test'));
  }
}

module.exports = { JwksClient };
module.exports.default = { JwksClient };
