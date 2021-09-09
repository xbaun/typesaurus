module.exports = {
  roots: ['<rootDir>/src/'],
  ...(process.env.FIRESTORE_EMULATOR_HOST
    ? {
        setupFilesAfterEnv: [
          '<rootDir>/test/setupJestLocal.ts',
          '<rootDir>/test/setupJestAfterEnv.ts'
        ]
      }
    : {
        setupFiles: ['<rootDir>/test/setupJestSystem.ts'],
        setupFilesAfterEnv: ['<rootDir>/test/setupJestAfterEnv.ts']
      })
}
