const request = require('supertest');
const app = require('../../src/app');
const { createUser } = require('../helpers/factories');

const password = 'Sedo@2026';

async function loginFresh(email = 'verified@example.com') {
  await createUser({ email, statut: 'VERIFIED', emailVerifie: true, motDePasse: password });
  const res = await request(app).post('/api/v1/auth/login').send({ email, motDePasse: password });
  return res.body; // { accessToken, refreshToken, utilisateur }
}

const refresh = (refreshToken) =>
  request(app).post('/api/v1/auth/refresh-token').send({ refreshToken });

describe('POST /api/v1/auth/refresh-token', () => {
  it('rote les tokens avec un refresh valide (200)', async () => {
    const { refreshToken } = await loginFresh();

    const res = await refresh(refreshToken);

    expect(res.status).toBe(200);
    expect(typeof res.body.accessToken).toBe('string');
    expect(typeof res.body.refreshToken).toBe('string');
    expect(res.body.refreshToken).not.toBe(refreshToken);
    expect(res.body.utilisateur.email).toBe('verified@example.com');
  });

  it('rejette un refresh token invalide (401 INVALID_TOKEN)', async () => {
    const res = await refresh('refresh-bidon');

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_TOKEN');
  });

  it('détecte la réutilisation: rejouer un refresh consommé révoque la famille', async () => {
    const { refreshToken: r1 } = await loginFresh();

    const ok = await refresh(r1); // r1 consommé -> r2
    const r2 = ok.body.refreshToken;
    expect(ok.status).toBe(200);

    const reuse = await refresh(r1); // r1 rejoué -> détection
    expect(reuse.status).toBe(401);
    expect(reuse.body.error.code).toBe('INVALID_TOKEN');

    const r2AfterReuse = await refresh(r2); // toute la famille est révoquée
    expect(r2AfterReuse.status).toBe(401);
  });
});

describe('POST /api/v1/auth/logout', () => {
  it('révoque le refresh (200) et le rend inutilisable', async () => {
    const { accessToken, refreshToken } = await loginFresh();

    const out = await request(app)
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ refreshToken });
    expect(out.status).toBe(200);

    const after = await refresh(refreshToken);
    expect(after.status).toBe(401);
  });

  it('rejette un logout sans token d’accès (401)', async () => {
    const { refreshToken } = await loginFresh();

    const res = await request(app).post('/api/v1/auth/logout').send({ refreshToken });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });
});
