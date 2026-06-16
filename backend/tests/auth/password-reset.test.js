jest.mock('../../src/utils/mailer');

const request = require('supertest');
const app = require('../../src/app');
const User = require('../../src/models/user.model');
const mailer = require('../../src/utils/mailer');
const { createUser } = require('../helpers/factories');

const oldPassword = 'Sedo@2026';
const newPassword = 'Nouveau@2027';

async function seedVerified(email = 'user@example.com') {
  return createUser({ email, statut: 'VERIFIED', emailVerifie: true, motDePasse: oldPassword });
}

const forgot = (email) =>
  request(app).post('/api/v1/auth/forgot-password').send({ email });
const reset = (token, motDePasse) =>
  request(app).post('/api/v1/auth/reset-password').send({ token, motDePasse });
const login = (email, motDePasse) =>
  request(app).post('/api/v1/auth/login').send({ email, motDePasse });

describe('POST /api/v1/auth/forgot-password', () => {
  it('génère un token et envoie l’email pour un compte existant (200)', async () => {
    await seedVerified();

    const res = await forgot('user@example.com');

    expect(res.status).toBe(200);
    const user = await User.findOne({ email: 'user@example.com' });
    expect(user.resetPasswordToken).toEqual(expect.any(String));
    expect(mailer.sendPasswordResetEmail).toHaveBeenCalledTimes(1);
  });

  it('réponse neutre (200) sans email si le compte est inconnu', async () => {
    const res = await forgot('inconnu@example.com');

    expect(res.status).toBe(200);
    expect(mailer.sendPasswordResetEmail).not.toHaveBeenCalled();
  });
});

describe('POST /api/v1/auth/reset-password', () => {
  it('réinitialise le mot de passe avec un token valide (200)', async () => {
    await seedVerified();
    await forgot('user@example.com');
    const { resetPasswordToken } = await User.findOne({ email: 'user@example.com' });

    const res = await reset(resetPasswordToken, newPassword);
    expect(res.status).toBe(200);

    expect((await login('user@example.com', newPassword)).status).toBe(200);
    expect((await login('user@example.com', oldPassword)).status).toBe(401);

    const user = await User.findOne({ email: 'user@example.com' });
    expect(user.resetPasswordToken).toBeFalsy();
  });

  it('rejette un token de reset invalide (400 INVALID_TOKEN)', async () => {
    const res = await reset('token-bidon', newPassword);

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_TOKEN');
  });

  it('révoque toutes les sessions existantes', async () => {
    await seedVerified();
    const { body } = await login('user@example.com', oldPassword);
    await forgot('user@example.com');
    const { resetPasswordToken } = await User.findOne({ email: 'user@example.com' });

    await reset(resetPasswordToken, newPassword);

    const after = await request(app)
      .post('/api/v1/auth/refresh-token')
      .send({ refreshToken: body.refreshToken });
    expect(after.status).toBe(401);
  });

  it('rejette un mot de passe faible (422)', async () => {
    await seedVerified();
    await forgot('user@example.com');
    const { resetPasswordToken } = await User.findOne({ email: 'user@example.com' });

    const res = await reset(resetPasswordToken, 'faible');
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});
