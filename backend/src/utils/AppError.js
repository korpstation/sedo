// Erreur applicative typée : code machine + statut HTTP + détails optionnels.
class AppError extends Error {
  constructor(code, statusCode, message, details) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    if (details) this.details = details;
  }
}

module.exports = AppError;
