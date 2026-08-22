// Backend/Models/Note.js
// Mongoose schema/model for a single note. Every note belongs to exactly one
// user, and all queries in noteController.js filter by that owner so users
// can only ever see/edit/delete their own notes.

const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: String,
  // Sanitized HTML produced by the rich-text editor on the frontend (see
  // cleanHtml() in noteController.js, which strips dangerous tags/attrs
  // before this is saved).
  content: String,
  // Reference to the owning User document; required so a note can never be
  // created without an owner.
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true }); // adds createdAt/updatedAt, used to sort notes newest-first

module.exports = mongoose.model('Note', noteSchema);
