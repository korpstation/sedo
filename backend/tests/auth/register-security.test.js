const request = require('supertest');
const app = require('../../src/app');
const User = require('../../src/models/user.model');
const { comparePassword } = require('../../src/utils/password');
const { createUser } = require('../helpers/factories');

const identity = {
  prenom: 'Amina',
  nom: 'Dossou',
  email: 'amina@example.com',
  telephone: '+2290190010203',
};
const strongPassword = 'Sedo@2026';

async function registrationTokenFor(id = identity) {
  const res = await request(app).post('/api/v1/auth/register').send(id);
  return res.body.registrationToken;
}

describe('POST /api/v1/auth/register/security (étape 2 — mot de passe)', () => {
  it('crée un compte PENDING (201) avec un mot de passe hashé', async () => {
    const registrationToken = await registrationTokenFor();

    const res = await request(app)
      .post('/api/v1/auth/register/security')
      .send({ registrationToken, motDePasse: strongPassword });

    expect(res.status).toBe(201);
    expect(res.body.message).toBeDefined();

    const user = await User.findOne({ email: 'amina@example.com' });
    expect(user).not.toBeNull();
    expect(user.statut).toBe('PENDING');
    expect(user.emailVerifie).toBe(false);
    expect(user.role).toBe('USER');
    expect(user.kycStatut).toBe('NONE');
    expect(user.motDePasse).not.toBe(strongPassword);
    expect(await comparePassword(strongPassword, user.motDePasse)).toBe(true);
  });

  it('rejette un registrationToken invalide (401 INVALID_TOKEN)', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register/security')
      .send({ registrationToken: 'jeton-bidon', motDePasse: strongPassword });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_TOKEN');
  });

  it('rejette un mot de passe faible (422)', async () => {
    const registrationToken = await registrationTokenFor();

    const res = await request(app)
      .post('/api/v1/auth/register/security')
      .send({ registrationToken, motDePasse: 'faible' });

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details.some((d) => d.champ === 'motDePasse')).toBe(true);
  });

  it('rejette un email déjà utilisé (409 EMAIL_ALREADY_USED)', async () => {
    await createUser({ email: 'amina@example.com' });
    const registrationToken = await registrationTokenFor();

    const res = await request(app)
      .post('/api/v1/auth/register/security')
      .send({ registrationToken, motDePasse: strongPassword });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('EMAIL_ALREADY_USED');
  });
});
