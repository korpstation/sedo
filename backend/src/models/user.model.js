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

    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },

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

// Représentation publique (jamais motDePasse / pin / tokens) — voir UserPublic.
userSchema.methods.toPublic = function toPublic() {
  return {
    id: this._id.toString(),
    prenom: this.prenom,
    nom: this.nom,
    email: this.email,
    telephone: this.telephone,
    role: this.role,
    statut: this.statut,
    emailVerifie: this.emailVerifie,
    kycStatut: this.kycStatut,
    limiteMensuelle: this.limiteMensuelle,
    limiteUtilisee: this.limiteUtilisee,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('User', userSchema);
