const errorHandler = require('../../src/middlewares/errorHandler');
const AppError = require('../../src/utils/AppError');

function mockRes() {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
}

describe('errorHandler', () => {
  it('mappe une erreur de clé dupliquée Mongo (E11000) -> 409', () => {
    const err = Object.assign(new Error('dup'), { name: 'MongoServerError', code: 11000 });
    const res = mockRes();

    errorHandler(err, {}, res, () => {});

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json.mock.calls[0][0].error.code).toBe('EMAIL_ALREADY_USED');
  });

  it('mappe une CastError Mongoose -> 400', () => {
    const err = Object.assign(new Error('cast'), { name: 'CastError' });
    const res = mockRes();

    errorHandler(err, {}, res, () => {});

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json.mock.calls[0][0].error.code).toBe('VALIDATION_ERROR');
  });

  it('respecte un AppError (statut + code)', () => {
    const res = mockRes();

    errorHandler(new AppError('EMAIL_NOT_VERIFIED', 403, 'msg'), {}, res, () => {});

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json.mock.calls[0][0].error.code).toBe('EMAIL_NOT_VERIFIED');
  });

  it('renvoie 500 pour une erreur inconnue', () => {
    const res = mockRes();

    errorHandler(new Error('boom'), {}, res, () => {});

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json.mock.calls[0][0].error.code).toBe('INTERNAL_ERROR');
  });
});
