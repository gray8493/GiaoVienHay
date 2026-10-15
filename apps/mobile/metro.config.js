const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Cho Metro quan sát toàn bộ monorepo (root node_modules và shared packages)
config.watchFolders = [monorepoRoot];

// 2. Cho Metro giải quyết module từ mobile trước, sau đó fallback về monorepo root
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

module.exports = config;
