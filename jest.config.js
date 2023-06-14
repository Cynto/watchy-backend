/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/setEnvVars.ts'],
  moduleDirectories: ['node_modules', 'src'],
  moduleNameMapper: {
    '@src/(.*)': '<rootDir>/src/$1',
  },
};
