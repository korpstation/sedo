const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const env = require('./config/env');
const authRoutes = require('./modules/auth/auth.routes');
const healthRoutes = require('./modules/health/health.routes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(helmet());

// CORS : origines explicites depuis l'env, jamais de wildcard.
app.use(
  cors({
    origin: env.CORS_ORIGINS_LIST,
    credentials: true,
  })
);

if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

app.use(express.json());

app.use('/health', healthRoutes);
app.use('/api/v1/auth', authRoutes);

// Swagger UI — exposé hors production uniquement.
if (env.NODE_ENV !== 'production') {
  // eslint-disable-next-line global-require
  const swagger = require('./docs/swagger');
  app.use('/api/docs', swagger.serve, swagger.setup);
}

app.use(errorHandler);

module.exports = app;
