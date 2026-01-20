module.exports = {
  testEnvironment: 'node',
  testTimeout: 30000,  // 30 seconds for Redis/DB operations
  clearMocks: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/index.js',
    '!src/worker.js',
  ],
};