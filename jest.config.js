module.exports = {
  collectCoverageFrom: [
    '**/*.js',
    '!jest/**/*.js',
    '!**/.*.js',
    '!**/coverage/**',
    '!**/node_modules/**',
    '!.*.js',
    '!*.config.js',
    '!config/**',
  ],
  setupFiles: ['<rootDir>/jest/setup'],
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.js', '**/*.test.js'],
};
