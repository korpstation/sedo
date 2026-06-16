const request = require('supertest');
const app = require('../../src/app');
const { createUser } = require('../helpers/factories');

const password = 'Sedo@2026';

async function login(email, motDePasse = password) {
  return request(app).post('/api/v1/auth/login').send({ email, motDePasse });
}

describe('POST /api/v1/auth/login', () => {
  it('authentifie un compte VERIFIED (200) et renvoie les tokens + utilisateur', async () => {
    await createUser({
      email: 'verified@example.com',
      statut: 'VERIFIED',
      emailVerifie: true,
      motDePasse: password,
    });

    const res = await login('verified@example.com');

    expect(res.status).toBe(200);
    expect(typeof res.body.accessToken).toBe('string');
    expect(typeof res.body.refreshToken).toBe('string');
    expect(res.body.utilisateur.email).toBe('verified@example.com');
    expect(res.body.utilisateur.motDePasse).toBeUndefined();
  });

  it('rejette un mot de passe incorrect (401 INVALID_CREDENTIALS)', async () => {
    await createUser({
      email: 'verified@example.com',
      statut: 'VERIFIED',
      emailVerifie: true,
      motDePasse: password,
    });

    const res = await login('verified@example.com', 'MauvaisMdp@1');

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('rejette un email inconnu (401 INVALID_CREDENTIALS)', async () => {
    const res = await login('inconnu@example.com');

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('refuse un compte non vérifié (403 EMAIL_NOT_VERIFIED)', async () => {
    await createUser({
      email: 'pending@example.com',
      statut: 'PENDING',
      emailVerifie: false,
      motDePasse: password,
    });

    const res = await login('pending@example.com');

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('EMAIL_NOT_VERIFIED');
  });

  it('refuse un compte suspendu (403 ACCOUNT_SUSPENDED)', async () => {
    await createUser({
      email: 'suspended@example.com',
      statut: 'SUSPENDED',
      emailVerifie: true,
      motDePasse: password,
    });

    const res = await login('suspended@example.com');

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('ACCOUNT_SUSPENDED');
  });

  it('refuse un compte banni (403 ACCOUNT_BANNED)', async () => {
    await createUser({
      email: 'banned@example.com',
      statut: 'BANNED',
      emailVerifie: true,
      motDePasse: password,
    });

    const res = await login('banned@example.com');

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('ACCOUNT_BANNED');
  });
});
