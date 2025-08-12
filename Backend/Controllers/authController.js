const User = require('../Models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'yourSuperSecretKey';

function signToken(user) {
  return jwt.sign(
    { id: user._id, username: user.username, email: user.email },
    JWT_SECRET,
    { expiresIn: '1d' }
  );
}

// POST /api/auth/register
exports.registerUser = async (req, res) => {
  try {
    const { firstName, lastName, username, email, password } = req.body;

    if (!firstName || !lastName || !username || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) return res.status(400).json({ message: 'Username already exists' });

    const existingEmail = await User.findOne({ email });
    if (existingEmail) return res.status(400).json({ message: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ firstName, lastName, username, email, password: hashed });

    const token = signToken(user);

    req.log?.info({ userId: user._id, username: user.username, email: user.email }, 'User registered');

    res.status(201).json({
      token,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    });
  } catch (error) {
    req.log?.error({ err: error }, 'registerUser failed');
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/auth/login  (username+password OR email+password)
exports.loginUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if ((!username && !email) || !password) {
      return res.status(400).json({ message: 'Username/email and password are required' });
    }

    const user = await User.findOne(username ? { username } : { email });
    if (!user) return res.status(400).json({ message: 'Invalid username/email or password' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ message: 'Invalid username/email or password' });

    const token = signToken(user);

    req.log?.info({ userId: user._id, username: user.username }, 'User logged in');

    res.json({
      token,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    });
  } catch (error) {
    req.log?.error({ err: error }, 'loginUser failed');
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user).select('firstName lastName username email');
    if (!user) return res.status(404).json({ message: 'User not found' });

    req.log?.info({ userId: req.user }, 'Fetched profile');

    res.json(user);
  } catch (error) {
    req.log?.error({ err: error, userId: req.user }, 'getMe failed');
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/auth/me
exports.updateMe = async (req, res) => {
  try {
    const { firstName, lastName, username } = req.body;
    if (!firstName || !lastName) {
      return res.status(400).json({ message: 'First name and last name are required' });
    }

    if (username) {
      const existing = await User.findOne({ username });
      if (existing && existing._id.toString() !== req.user) {
        return res.status(400).json({ message: 'Username already exists' });
      }
    }

    const updates = { firstName, lastName };
    if (username) updates.username = username;

    const updated = await User.findByIdAndUpdate(req.user, updates, {
      new: true,
      runValidators: true,
      select: 'firstName lastName username email',
    });

    if (!updated) return res.status(404).json({ message: 'User not found' });

    req.log?.info({ userId: req.user }, 'Profile updated');

    res.json(updated);
  } catch (error) {
    req.log?.error({ err: error, userId: req.user }, 'updateMe failed');
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/auth/me/password
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Both old and new password are required' });
    }

    const user = await User.findById(req.user);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const ok = await bcrypt.compare(oldPassword, user.password);
    if (!ok) return res.status(400).json({ message: 'Old password is incorrect' });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    req.log?.info({ userId: req.user }, 'Password changed');

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    req.log?.error({ err: error, userId: req.user }, 'changePassword failed');
    res.status(500).json({ message: 'Server error' });
  }
};
