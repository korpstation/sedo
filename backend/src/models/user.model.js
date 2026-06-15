const mongoose = require('mongoose');
const { ACCOUNT_STATUS, ROLES, KYC_STATUS } = require('../config/constants');

const userSchema = new mongoose.Schema(
  {
    prenom: { type: String, required: true, trim: true },
    nom: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    telephone: { type: String, required: true, trim: true },
    motDePasse: { type: String, required: true },

    role: { type: String, enum: Object.values(ROLES), default: ROLES.USER },
    statut: {
      type: String,
      enum: Object.values(ACCOUNT_STATUS),
      default: ACCOUNT_STATUS.PENDING,
    },

    emailVerifie: { type: Boolean, default: false },
    emailVerifToken: { type: String },

    kycStatut: {
      type: String,
      enum: Object.values(KYC_STATUS),
      default: KYC_STATUS.NONE,
    },

    // Montants en entiers (FCFA). Limite mensuelle = 0 avant KYC validé.
    limiteMensuelle: { type: Number, default: 0 },
    limiteUtilisee: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
