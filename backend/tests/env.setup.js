// setupFiles : s'exécute AVANT le framework de test et tout require de module.
// C'est l'endroit déterministe pour fixer les variables d'env de test.
process.env.NODE_ENV = 'test';
process.env.JWT_ACCESS_SECRET = 'test-access-secret-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb';
process.env.JWT_REGISTRATION_SECRET = 'test-registration-secret-cccccccccccccccccccccccccccccc';
