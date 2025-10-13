module.exports = {
  resolver: 'jest-haste-resolver',
  haste: {
    providesModuleNodeModules: ['src/generated', 'dist/src/generated'],
  },
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
    '^dist/(.*)$': '<rootDir>/dist/$1',
  },
};