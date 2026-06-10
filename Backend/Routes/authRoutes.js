// Backend/Routes/authRoutes.js
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
router.post('/register', validate(registerSchema), registerUser);
router.post('/login', validate(loginSchema), loginUser);

// Profile
router.get('/me', protect, getMe);
router.put('/me', protect, validate(updateMeSchema), updateMe);
router.put('/me/password', protect, validate(changePasswordSchema), changePassword);

module.exports = router;
