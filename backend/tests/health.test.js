const request = require('supertest');
const app = require('../src/app');
const db = require('../src/config/db');

describe('GET /health', () => {
  it('renvoie 200 quand Mongo répond', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('renvoie 503 quand Mongo ne répond pas', async () => {
    jest.spyOn(db, 'ping').mockRejectedValueOnce(new Error('mongo down'));

    const res = await request(app).get('/health');

    expect(res.status).toBe(503);
    expect(res.body.status).not.toBe('ok');
  });
});
