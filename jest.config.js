module.exports = {
  resetMocks: true,
  testTimeout: 30_000,
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: [
    '/node_modules/',
    '/build/'
  ],
  testMatch: ['<rootDir>/**/*.test.(ts|tsx)'],
  roots: [
    '<rootDir>'
  ],
  moduleDirectories: [
    'node_modules',
    './'
  ]
};
