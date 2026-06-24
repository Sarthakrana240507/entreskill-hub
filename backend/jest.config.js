module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js'],
  collectCoverageFrom: ['src/**/*.js', '!src/server.js', '!src/seed/**'],
  coverageDirectory: 'coverage',
  setupFiles: ['dotenv/config'],
  testTimeout: 15000,
};
