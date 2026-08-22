// Backend/Middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');

// Falls back to a default only for local/dev convenience — always set a real
// JWT_SECRET in production via the .env file.
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
    // Support both "Bearer <token>" and a bare token so the frontend can be
    // a little sloppy about the header format (see authHeader usage in the
    // React pages, which sends the raw token without the "Bearer " prefix).
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : auth;

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Throws if the token is missing, malformed, expired, or signed with a
    // different secret — caught below and turned into a 401.
    const decoded = jwt.verify(token, JWT_SECRET);
    // we signed { id: user._id, username, email } in authController
    // Downstream controllers read req.user as the current user's ObjectId.
    req.user = decoded.id;
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

module.exports = protect; // <<— IMPORTANT: export a FUNCTION
