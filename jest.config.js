const nextJest = require('next/jest');
const createJestConfig = nextJest({ dir: './vendorvault' });

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/vendorvault/jest.setup.js'],
  testEnvironment: 'jsdom',
  collectCoverage: true,
  collectCoverageFrom: [
    'vendorvault/**/*.{js,jsx,ts,tsx}',
    '!vendorvault/**/*.test.{js,jsx,ts,tsx}',
    '!vendorvault/app/pages/_*.{js,jsx,ts,tsx}'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': 'babel-jest',
  },
};

module.exports = createJestConfig(customJestConfig);
