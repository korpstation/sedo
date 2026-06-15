const env = require('./../config/env');

// Envoi d'emails. No-op en test ou sans clé SendGrid (l'intégration réelle
// SendGrid sera branchée dans un cycle ultérieur / en production).
async function sendVerificationEmail(to, token) {
  if (env.NODE_ENV === 'test' || !env.SENDGRID_API_KEY) return;
  // TODO: intégration SendGrid réelle.
  // lien: `${env.APP_URL}/verify-email?token=${token}`
}

module.exports = {
  sendVerificationEmail,
};
