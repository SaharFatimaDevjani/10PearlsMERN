// Backend/index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const pinoHttp = require('pino-http');
const { randomUUID } = require('crypto');
const baseLogger = require('./logger');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

dotenv.config();

const app = express();

// pino request/response logging + req.log
app.use(
  pinoHttp({
    logger: baseLogger,
    genReqId: (req) => req.headers['x-request-id'] || randomUUID(),
    autoLogging: { ignorePaths: ['/health'] },
    redact: {
      paths: ['req.headers.authorization', 'req.body.password', 'req.body.oldPassword', 'req.body.newPassword'],
      censor: '***',
    },
  })
);

app.use(helmet());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// routes
app.use('/api/auth', require('./Routes/authRoutes'));
app.use('/api/notes', require('./Routes/noteRoutes'));

// 404
app.use((_, res) => res.status(404).json({ message: 'Route not found' }));

// global error handler
app.use((err, req, res, next) => {
  req.log?.error({ err }, 'Unhandled error');
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

// start server (skip during tests)
if (process.env.NODE_ENV !== 'test') {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => baseLogger.info('MongoDB connected'))
    .catch((err) => baseLogger.error({ err }, 'MongoDB connection error'));

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => baseLogger.info(`Server running on port ${PORT}`));
}

module.exports = { app, mongoose };
