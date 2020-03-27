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
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.js', '**/*.test.js'],
};
