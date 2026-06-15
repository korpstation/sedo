module.exports = {
  // rootDir ancré sur ce fichier : indépendant du répertoire d'invocation.
  rootDir: __dirname,
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testMatch: ['<rootDir>/tests/**/*.test.js'],
  // mongodb-memory-server télécharge le binaire mongod au 1er run
  testTimeout: 30000,
  clearMocks: true,
};
