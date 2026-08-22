// Backend/logger.js
// Central Pino logger instance shared by index.js (via pino-http) and every
// controller (via req.log). Keeping it in one file means log formatting and
// redaction rules are defined once.

const pino = require('pino');

const isProd = process.env.NODE_ENV === 'production';

const logger = pino({
  // Minimum severity to actually print; override with LOG_LEVEL env var
  // (e.g. "debug" for more verbose local logs).
  level: process.env.LOG_LEVEL || 'info',
  // In production we emit plain newline-delimited JSON (fast, machine
  // readable, easy to ship to a log aggregator). Locally/in dev we pretty
  // print with colors via pino-pretty for readability.
  transport: isProd
    ? undefined
    : {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      },
  // Replace sensitive fields with "***" instead of ever writing them to
  // logs, even if a controller accidentally logs the whole req/res object.
  redact: {
    paths: [
      'req.headers.authorization',
      'req.body.password',
      'req.body.oldPassword',
      'req.body.newPassword',
      'res.headers["set-cookie"]',
    ],
    censor: '***',
  },
});

module.exports = logger;
