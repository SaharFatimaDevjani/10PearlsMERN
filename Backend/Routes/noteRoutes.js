// Backend/Routes/noteRoutes.js
// Defines the /api/notes/* endpoints. Every route requires `protect`
// (a valid JWT) because notes are always scoped to the logged-in user.

const express = require('express');
const router = express.Router();

const protect = require('../Middlewares/authMiddleware');
const { validate } = require('../Middlewares/validate');
const {
  noteCreateSchema,
  noteUpdateSchema,
  notesImportSchema,
} = require('../Schemas/authSchemas');

const {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
  exportNotes,
  importNotes,
} = require('../Controllers/noteController');

// Notes CRUD + search
// GET supports an optional ?q= search term (see getNotes in the controller).
router.get('/', protect, getNotes);
router.post('/', protect, validate(noteCreateSchema), createNote);
router.put('/:id', protect, validate(noteUpdateSchema), updateNote);
router.delete('/:id', protect, deleteNote);

// Export / Import
// NOTE: these are defined after the CRUD routes but before "/:id" would ever
// clash, since "/export/json" and "/import" are distinct static paths.
router.get('/export/json', protect, exportNotes);
router.post('/import', protect, validate(notesImportSchema), importNotes);

module.exports = router;
