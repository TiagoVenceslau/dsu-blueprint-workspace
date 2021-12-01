module.exports = {
  verbose: true,
  testEnvironment: 'node',
  testRegex: '/tests/.*\\.(test|spec)\\.(js$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverage: true,
  coverageDirectory: "./workdocs/coverage",
  coverageReporters: [
    "json-summary"
  ]
};