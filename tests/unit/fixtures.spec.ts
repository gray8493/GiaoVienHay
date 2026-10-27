import * as path from 'path';

const fixturesDir = path.resolve(__dirname, '../fixtures');
const JWK_STUB_PATH = path.join(fixturesDir, 'jwks-rsa-stub.js');
const CACHE_MOCK_PATH = path.join(fixturesDir, 'cache-manager-mock.js');
const MAMMOTH_STUB_PATH = path.join(fixturesDir, 'mammoth-stub.js');
const PDF_PARSE_STUB_PATH = path.join(fixturesDir, 'pdf-parse-stub.js');

describe('Test Fixtures (UT00 - Test Infrastructure)', () => {
  describe('UT00_Fixture_TC01: jwks-rsa-stub expose class JwksClient', () => {
    it('export JwksClient là một class và khởi tạo không lỗi', () => {
      const stub = require(JWK_STUB_PATH);
      expect(typeof stub.JwksClient).toBe('function');
      expect(
        () => new stub.JwksClient({ jwksUri: 'https://example.com/.well-known/jwks.json' }),
      ).not.toThrow();
    });

    it('hỗ trợ ESM interop qua module.exports.default', () => {
      const stub = require(JWK_STUB_PATH);
      expect(stub.default).toBeDefined();
      expect(stub.default.JwksClient).toBe(stub.JwksClient);
    });

    it('getSigningKey luôn trả về Promise bị từ chối vì stub không verify thật', async () => {
      const { JwksClient } = require(JWK_STUB_PATH);
      const client = new JwksClient({ jwksUri: 'https://example.com/.well-known/jwks.json' });
      await expect(client.getSigningKey('kid_01')).rejects.toThrow('jwks-rsa stub');
    });

    it('constructor bỏ qua options và không phát sinh lỗi khi thiếu jwksUri', () => {
      const stub = require(JWK_STUB_PATH);
      expect(() => new stub.JwksClient(undefined)).not.toThrow();
    });
  });

  describe('UT00_Fixture_TC02: cache-manager-mock export token CACHE_MANAGER', () => {
    it('tên token khớp với token của @nestjs/cache-manager để DI hoạt động', () => {
      const mock = require(CACHE_MOCK_PATH);
      expect(mock.CACHE_MANAGER).toBe('CACHE_MANAGER');
    });

    it('module export token và CacheModule cần thiết cho injection', () => {
      const mock = require(CACHE_MOCK_PATH);
      expect(Object.keys(mock).sort()).toEqual(['CACHE_MANAGER', 'CacheModule'].sort());
    });
  });

  describe('UT00_Fixture_TC03: moduleNameMapper trỏ đúng về fixtures', () => {
    it("require('jwks-rsa') được ánh xạ về tests/fixtures/jwks-rsa-stub.js", () => {
      const bare = require('jwks-rsa');
      const direct = require(JWK_STUB_PATH);
      expect(bare.JwksClient).toBe(direct.JwksClient);
    });

    it("require('jwks-rsa/<subpath>') cũng ánh xạ về jwks-rsa-stub.js", () => {
      const bare = require('jwks-rsa/dist/key-storer');
      const direct = require(JWK_STUB_PATH);
      expect(bare.JwksClient).toBe(direct.JwksClient);
    });

    it("require('@nestjs/cache-manager') được ánh xạ về tests/fixtures/cache-manager-mock.js", () => {
      const bare = require('@nestjs/cache-manager');
      const direct = require(CACHE_MOCK_PATH);
      expect(bare.CACHE_MANAGER).toBe(direct.CACHE_MANAGER);
      expect(bare.CACHE_MANAGER).toBe('CACHE_MANAGER');
    });
  });

  describe('UT00_Fixture_TC04: mammoth-stub đáp ứng API của document-text.extractor', () => {
    it('extractRawText trả về { value, messages } cho buffer .docx', async () => {
      const stub = require(MAMMOTH_STUB_PATH);
      const parsed = await stub.extractRawText({ buffer: Buffer.from('noi dung giao an') });
      expect(parsed).toEqual({ value: '', messages: [] });
    });

    it('hỗ trợ ESM interop qua module.exports.default', () => {
      const stub = require(MAMMOTH_STUB_PATH);
      expect(stub.default.extractRawText).toBe(stub.extractRawText);
    });
  });

  describe('UT00_Fixture_TC05: pdf-parse-stub đáp ứng API của document-text.extractor', () => {
    it('gọi trực tiếp với buffer trả về { text: "" }', async () => {
      const stub = require(PDF_PARSE_STUB_PATH);
      const parsed = await stub(Buffer.from('%PDF-1.4 gobvivien hay'));
      expect(parsed.text).toBe('');
      expect(parsed.numpages).toBe(0);
    });

    it('hỗ trợ ESM interop qua module.exports.default', () => {
      const stub = require(PDF_PARSE_STUB_PATH);
      expect(typeof stub.default).toBe('function');
      expect(stub.default).toBe(stub);
    });
  });

  describe('UT00_Fixture_TC06: stubs cho document extractor ánh xạ đúng', () => {
    it("require('mammoth') được ánh xạ về tests/fixtures/mammoth-stub.js", () => {
      const bare = require('mammoth');
      const direct = require(MAMMOTH_STUB_PATH);
      expect(bare.extractRawText).toBe(direct.extractRawText);
    });

    it("require('pdf-parse') được ánh xạ về tests/fixtures/pdf-parse-stub.js", () => {
      const bare = require('pdf-parse');
      const direct = require(PDF_PARSE_STUB_PATH);
      expect(bare).toBe(direct);
    });
  });
});
