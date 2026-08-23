// Backend/Models/User.js
// Mongoose schema/model for application users (account holders who own notes).

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName:  { type: String, required: true },
  // `unique: true` creates a MongoDB unique index so two users can't share
  // the same username or email; the controllers additionally pre-check this
  // with findOne() to return a friendlier 400 instead of a raw duplicate-key
  // error.
  username:  { type: String, required: true, unique: true },
  email:     { type: String, required: true, unique: true },
  // Stores the bcrypt hash, never the plaintext password. Hashing happens in
  // authController.js before a document is created/updated.
  password:  { type: String, required: true }
}, { timestamps: true }); // adds createdAt/updatedAt automatically

module.exports = mongoose.model("User", userSchema);
