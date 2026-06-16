const User = require('../../src/models/user.model');
const { hashPassword } = require('../../src/utils/password');

// Crée un utilisateur en base avec des valeurs par défaut surchargeable.
async function createUser(overrides = {}) {
  const { motDePasse = 'Sedo@2026', ...rest } = overrides;
  return User.create({
    prenom: 'Test',
    nom: 'User',
    email: 'test@example.com',
    telephone: '+2290190010203',
    motDePasse: await hashPassword(motDePasse),
    ...rest,
  });
}

module.exports = { createUser };
