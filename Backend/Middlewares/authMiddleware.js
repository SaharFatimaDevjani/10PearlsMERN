// Backend/Middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'yourSuperSecretKey';

/**
 * Protect middleware
 * - Accepts Authorization header as either:
 *   - "Bearer <token>"  OR
 *   - "<token>" (raw)
 * - On success: sets req.user = userId and calls next()
 * - On failure: returns 401 JSON error
 */
function protect(req, res, next) {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : auth;

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    // we signed { id: user._id, username, email } in authController
    req.user = decoded.id;
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

module.exports = protect; // <<— IMPORTANT: export a FUNCTION
