const request = require('supertest');
const app = require('../../src/app');
const { createUser } = require('../helpers/factories');

const validIdentity = {
  prenom: 'Amina',
  nom: 'Dossou',
  email: 'amina@example.com',
  telephone: '+2290190010203',
};

describe('POST /api/v1/auth/register (étape 1 — identité)', () => {
  it("renvoie un registrationToken pour une identité valide", async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(validIdentity);

    expect(res.status).toBe(200);
    expect(typeof res.body.registrationToken).toBe('string');
    expect(res.body.registrationToken.length).toBeGreaterThan(0);
    expect(res.body.expiresIn).toBe(900);
  });

  it("rejette un email invalide en 422 avec le détail du champ", async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ ...validIdentity, email: 'pas-un-email' });

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(Array.isArray(res.body.error.details)).toBe(true);
    expect(res.body.error.details.some((d) => d.champ === 'email')).toBe(true);
  });

  it("rejette un champ requis manquant en 422", async () => {
    const { prenom, ...sansPrenom } = validIdentity;
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(sansPrenom);

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details.some((d) => d.champ === 'prenom')).toBe(true);
  });

  it("rejette un numéro de téléphone invalide en 422", async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ ...validIdentity, telephone: '12345' });

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details.some((d) => d.champ === 'telephone')).toBe(true);
  });

  it("rejette une identité dont l'email est déjà utilisé en 409", async () => {
    await createUser({ email: validIdentity.email });

    const res = await request(app).post('/api/v1/auth/register').send(validIdentity);

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('EMAIL_ALREADY_USED');
  });
});
