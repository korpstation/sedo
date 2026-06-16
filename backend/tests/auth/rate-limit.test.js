const request = require('supertest');
const app = require('../../src/app');

// Réactive le rate-limit (désactivé par défaut en test) le temps de ce fichier.
describe('Rate limiting', () => {
  beforeAll(() => {
    process.env.DISABLE_RATE_LIMIT = 'false';
  });
  afterAll(() => {
    process.env.DISABLE_RATE_LIMIT = 'true';
  });

  it('bloque le login après 5 tentatives (429 RATE_LIMITED)', async () => {
    const creds = { email: 'rl@example.com', motDePasse: 'NeMarchePas@1' };

    for (let i = 0; i < 5; i++) {
      await request(app).post('/api/v1/auth/login').send(creds);
    }
    const res = await request(app).post('/api/v1/auth/login').send(creds);

    expect(res.status).toBe(429);
    expect(res.body.error.code).toBe('RATE_LIMITED');
  });
});
