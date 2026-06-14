// Infra de test : variables d'env de test + MongoDB en mémoire.
// Doit s'exécuter AVANT l'import de l'app (setupFilesAfterEnv).
process.env.NODE_ENV = 'test';
process.env.JWT_ACCESS_SECRET = 'test-access-secret-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb';
process.env.JWT_REGISTRATION_SECRET = 'test-registration-secret-cccccccccccccccccccccccccccccc';

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongo;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
});

afterEach(async () => {
  const { collections } = mongoose.connection;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongo) await mongo.stop();
});
