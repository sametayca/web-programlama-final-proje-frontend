export default {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  },
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/main.jsx',
    '!src/tests/**',
    '!**/*.stories.{js,jsx}',
    '!**/node_modules/**'
  ],
  coverageDirectory: 'coverage',
  // Backend'deki gibi detaylı coverage raporu
  coverageReporters: ['text', 'text-summary', 'json', 'lcov', 'html'],
  coverageProvider: 'v8',
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  testMatch: [
    '**/__tests__/**/*.{js,jsx}',
    '**/?(*.)+(spec|test).{js,jsx}'
  ],
  moduleFileExtensions: ['js', 'jsx', 'json'],
  verbose: true,
  testTimeout: 10000
};

