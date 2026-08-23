// Backend/index.js
// This is the entry point of the backend server. It wires together all the
// middleware (logging, security, parsing), mounts the API routes, and starts
// listening for requests. Run it with `npm run dev` (nodemon) or `npm start`.

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const pinoHttp = require('pino-http');
const { randomUUID } = require('crypto');
const baseLogger = require('./logger');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Load variables from a local .env file (PORT, MONGO_URI, JWT_SECRET, ...)
// into process.env. Must run before anything reads process.env below.
dotenv.config();

const app = express();

// pino request/response logging + req.log
// Attaches a `req.log` instance to every request so controllers can log
// structured events (see req.log?.info(...) calls in the controllers).
app.use(
  pinoHttp({
    logger: baseLogger,
    // Reuse an incoming X-Request-Id header (useful behind a proxy/gateway)
    // or generate a fresh UUID so every request can be traced end-to-end.
    genReqId: (req) => req.headers['x-request-id'] || randomUUID(),
    // Don't spam the logs with health-check pings.
    autoLogging: { ignorePaths: ['/health'] },
    // Never let secrets leak into log output.
    redact: {
      paths: ['req.headers.authorization', 'req.body.password', 'req.body.oldPassword', 'req.body.newPassword'],
      censor: '***',
    },
  })
);

// Sets a batch of security-related HTTP response headers (XSS protection,
// no-sniff, hides "X-Powered-By", etc).
app.use(helmet());
// Basic abuse protection: max 300 requests per IP per 15-minute window.
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));

// Only the Vite dev server origin is allowed to call this API by default.
app.use(cors({ origin: 'http://localhost:5173' }));
// Parse incoming JSON request bodies into req.body.
app.use(express.json());

// routes
// Everything under /api/auth handles registration/login/profile.
app.use('/api/auth', require('./Routes/authRoutes'));
// Everything under /api/notes handles the notes CRUD/search/export/import.
app.use('/api/notes', require('./Routes/noteRoutes'));

// 404
// Catches any request that didn't match a route above.
app.use((_, res) => res.status(404).json({ message: 'Route not found' }));

// global error handler
// Express recognizes this as an error handler because it takes 4 arguments.
// Any `next(err)` call in a controller (see noteController.js) ends up here.
app.use((err, req, res, next) => {
  req.log?.error({ err }, 'Unhandled error');
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

// start server (skip during tests)
// Test files import { app } and drive it with supertest without needing a
// real Mongo connection or an open port, so we skip this block when
// NODE_ENV=test (see Backend/tests and the "test" npm script).
if (process.env.NODE_ENV !== 'test') {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => baseLogger.info('MongoDB connected'))
    .catch((err) => baseLogger.error({ err }, 'MongoDB connection error'));

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => baseLogger.info(`Server running on port ${PORT}`));
}

// Exported so the test suite can `require('../index')` and hit the app with
// supertest without starting a real network listener.
module.exports = { app, mongoose };
