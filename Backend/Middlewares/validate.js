// Backend/Middlewares/validate.js
// Generic Express middleware factory that validates req.body against a Joi
// schema before the request reaches a controller. Keeps controllers free of
// manual field-checking boilerplate.

// `validate(schema)` returns an actual middleware function, so routes use it
// like: router.post('/register', validate(registerSchema), registerUser).
const validate = (schema) => (req, res, next) => {
  // abortEarly: false -> collect every validation error, not just the first.
  // stripUnknown: true -> drop any fields not defined in the schema (avoids
  // mass-assignment of unexpected fields).
  const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    return res.status(400).json({
      message: 'Validation failed',
      details: error.details.map((d) => d.message),
    });
  }
  // Replace req.body with the validated/sanitized value so downstream
  // controllers only ever see clean data.
  req.body = value;
  next();
};

module.exports = { validate };
