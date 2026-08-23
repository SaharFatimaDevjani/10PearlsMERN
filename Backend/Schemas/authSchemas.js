// Backend/Schemas/authSchemas.js
// Joi validation schemas used by the `validate` middleware to check request
// bodies before they reach a controller. Centralizing them here keeps the
// "shape" of every request documented in one place.

const Joi = require('joi');

// POST /api/auth/register body
const registerSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).required(),
  lastName:  Joi.string().min(2).max(50).required(),
  // alphanum() blocks spaces/symbols in usernames.
  username:  Joi.string().alphanum().min(3).max(30).required(),
  email:     Joi.string().email().required(),
  password:  Joi.string().min(6).max(100).required(),
});

// POST /api/auth/login body (login is by username; see authController.js)
const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

// PUT /api/auth/me body (update profile)
const updateMeSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).required(),
  lastName:  Joi.string().min(2).max(50).required(),
  username:  Joi.string().alphanum().min(3).max(30).required(),
});

// PUT /api/auth/me/password body
const changePasswordSchema = Joi.object({
  oldPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).max(100).required(),
});

// POST /api/notes body
const noteCreateSchema = Joi.object({
  title: Joi.string().min(1).max(200).required(),
  // allow('') because a note can be created with empty content, but the
  // field itself must still be present.
  content: Joi.string().allow('').required(),
});

// PUT /api/notes/:id body
const noteUpdateSchema = Joi.object({
  title: Joi.string().min(1).max(200).required(),
  content: Joi.string().allow('').required(),
});

// POST /api/notes/import body — a bulk array of { title, content } notes,
// capped at 1000 per request to avoid abuse.
const notesImportSchema = Joi.object({
  notes: Joi.array()
    .items(Joi.object({ title: Joi.string().required(), content: Joi.string().allow('').required() }))
    .max(1000)
    .required(),
});

module.exports = {
  registerSchema,
  loginSchema,
  updateMeSchema,
  changePasswordSchema,
  noteCreateSchema,
  noteUpdateSchema,
  notesImportSchema,
};
