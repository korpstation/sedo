jest.mock('../../src/utils/mailer');

const request = require('supertest');
const app = require('../../src/app');
const User = require('../../src/models/user.model');
const mailer = require('../../src/utils/mailer');
const { createUser } = require('../helpers/factories');

const identity = {
  prenom: 'Amina',
  nom: 'Dossou',
  email: 'amina@example.com',
  telephone: '+2290190010203',
};
const strongPassword = 'Sedo@2026';

async function register(id = identity) {
  const r1 = await request(app).post('/api/v1/auth/register').send(id);
  await request(app)
    .post('/api/v1/auth/register/security')
    .send({ registrationToken: r1.body.registrationToken, motDePasse: strongPassword });
  return User.findOne({ email: id.email });
}

describe('Vérification email', () => {
  it("envoie un email de vérification à l'inscription (étape 2)", async () => {
    const user = await register();

    expect(user.emailVerifToken).toEqual(expect.any(String));
    expect(mailer.sendVerificationEmail).toHaveBeenCalledTimes(1);
    expect(mailer.sendVerificationEmail).toHaveBeenCalledWith(
      user.email,
      user.emailVerifToken
    );
  });

  it('vérifie l’email avec un token valide (200) et active le compte', async () => {
    const created = await register();

    const res = await request(app)
      .post('/api/v1/auth/verify-email')
      .send({ token: created.emailVerifToken });

    expect(res.status).toBe(200);

    const user = await User.findOne({ email: identity.email });
    expect(user.emailVerifie).toBe(true);
    expect(user.statut).toBe('VERIFIED');
    expect(user.emailVerifToken).toBeFalsy();
  });

  it('rejette un token de vérification invalide (400)', async () => {
    const res = await request(app)
      .post('/api/v1/auth/verify-email')
      .send({ token: 'token-bidon' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_TOKEN');
  });

  it('rejette un token de vérification expiré (400)', async () => {
    await createUser({
      email: 'expired@example.com',
      emailVerifToken: 'token-expire',
      emailVerifTokenExpires: new Date(Date.now() - 1000),
    });

    const res = await request(app)
      .post('/api/v1/auth/verify-email')
      .send({ token: 'token-expire' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_TOKEN');
  });

  it('renvoie l’email pour un compte non vérifié (200) et déclenche le mailer', async () => {
    await createUser({
      email: 'pending@example.com',
      statut: 'PENDING',
      emailVerifie: false,
      emailVerifToken: 'ancien-token',
    });

    const res = await request(app)
      .post('/api/v1/auth/resend-verification')
      .send({ email: 'pending@example.com' });

    expect(res.status).toBe(200);
    expect(mailer.sendVerificationEmail).toHaveBeenCalledTimes(1);
  });

  it('réponse neutre (200) sans email si le compte est inconnu', async () => {
    const res = await request(app)
      .post('/api/v1/auth/resend-verification')
      .send({ email: 'inconnu@example.com' });

    expect(res.status).toBe(200);
    expect(mailer.sendVerificationEmail).not.toHaveBeenCalled();
  });
});
