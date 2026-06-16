const express = require('express');
const db = require('../../config/db');

const router = express.Router();

// GET /health — liveness/readiness : 200 seulement si Mongo répond, sinon 503.
router.get('/', async (req, res) => {
  try {
    await db.ping();
    res.status(200).json({ status: 'ok' });
  } catch (err) {
    res.status(503).json({ status: 'unavailable' });
  }
});

module.exports = router;
