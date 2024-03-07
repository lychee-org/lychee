module.exports = {
  transform: { '^.+\\.ts?$': 'ts-jest' },
  testRegex: '/test/.*\\.(test|spec)?\\.(ts|tsx)$',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
};
