const request = require('supertest');
const app = require('../../src/app');

const validIdentity = {
  prenom: 'Amina',
  nom: 'Dossou',
  email: 'amina@example.com',
  telephone: '+22901900102',
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
});
