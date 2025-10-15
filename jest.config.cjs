module.exports = {
  // Delegate to the Backend project's Jest config
  projects: ['<rootDir>/Flexi-Backend'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '<rootDir>/postgres_data',
    '<rootDir>/postgres_data2',
  ],
};