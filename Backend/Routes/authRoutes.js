// Backend/Routes/authRoutes.js
// Defines the /api/auth/* endpoints and wires each one to its Joi validation
// schema, its `protect` (auth) requirement, and its controller function.

const express = require('express');
const router = express.Router();

const protect = require('../Middlewares/authMiddleware');
const { validate } = require('../Middlewares/validate');
const {
  registerSchema,
  loginSchema,
  updateMeSchema,
  changePasswordSchema,
} = require('../Schemas/authSchemas');

const {
  registerUser,
  loginUser,
  getMe,
  updateMe,
  changePassword,
} = require('../Controllers/authController');

// Auth
// Public endpoints — no `protect`, since the caller doesn't have a token yet.
router.post('/register', validate(registerSchema), registerUser);
router.post('/login', validate(loginSchema), loginUser);

// Profile
// All of these require a valid JWT (`protect` runs before the controller
// and populates req.user).
router.get('/me', protect, getMe);
router.put('/me', protect, validate(updateMeSchema), updateMe);
router.put('/me/password', protect, validate(changePasswordSchema), changePassword);

module.exports = router;
