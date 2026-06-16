const request = require('supertest');
const app = require('../../src/app');
const { createUser } = require('../helpers/factories');

const password = 'Sedo@2026';

async function accessTokenFor(email = 'verified@example.com') {
  await createUser({ email, statut: 'VERIFIED', emailVerifie: true, motDePasse: password });
  const res = await request(app).post('/api/v1/auth/login').send({ email, motDePasse: password });
  return res.body.accessToken;
}

describe('GET /api/v1/auth/me', () => {
  it("renvoie l'utilisateur courant avec un token valide (200)", async () => {
    const token = await accessTokenFor();

    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe('verified@example.com');
    expect(res.body.motDePasse).toBeUndefined();
  });

  it('rejette une requête sans token (401 UNAUTHORIZED)', async () => {
    const res = await request(app).get('/api/v1/auth/me');

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('rejette un token invalide (401 UNAUTHORIZED)', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', 'Bearer token-bidon');

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });
});
