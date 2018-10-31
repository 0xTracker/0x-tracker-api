module.exports = {
  collectCoverageFrom: [
    '**/*.js',
    '!**/.*.js',
    '!**/coverage/**',
    '!**/node_modules/**',
    '!.*.js',
    '!*.config.js',
    '!config/**',
  ],
  setupFiles: ['<rootDir>/config/jest/setup'],
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.js', '**/*.test.js'],
};
