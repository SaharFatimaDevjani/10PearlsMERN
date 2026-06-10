// Backend/Schemas/authSchemas.js
const Joi = require('joi');

const registerSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).required(),
  lastName:  Joi.string().min(2).max(50).required(),
  username:  Joi.string().alphanum().min(3).max(30).required(),
  email:     Joi.string().email().required(),
  password:  Joi.string().min(6).max(100).required(),
});

const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

const updateMeSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).required(),
  lastName:  Joi.string().min(2).max(50).required(),
  username:  Joi.string().alphanum().min(3).max(30).required(),
});

const changePasswordSchema = Joi.object({
  oldPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).max(100).required(),
});

const noteCreateSchema = Joi.object({
  title: Joi.string().min(1).max(200).required(),
  content: Joi.string().allow('').required(),
});

const noteUpdateSchema = Joi.object({
  title: Joi.string().min(1).max(200).required(),
  content: Joi.string().allow('').required(),
});

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
