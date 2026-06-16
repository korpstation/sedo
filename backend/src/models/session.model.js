const mongoose = require('mongoose');

// Une Session = un refresh token émis. familyId relie une chaîne de rotation ;
// le token n'est jamais stocké en clair (sha256). `used` = déjà roté,
// `revoked` = invalidé (logout / reset / détection de réutilisation).
const sessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    familyId: { type: String, required: true, index: true },
    tokenHash: { type: String, required: true, unique: true },
    used: { type: Boolean, default: false },
    revoked: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

// Purge automatique des sessions expirées.
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Session', sessionSchema);
