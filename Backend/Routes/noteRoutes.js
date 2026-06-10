// Backend/Routes/noteRoutes.js
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
router.get('/', protect, getNotes);
router.post('/', protect, validate(noteCreateSchema), createNote);
router.put('/:id', protect, validate(noteUpdateSchema), updateNote);
router.delete('/:id', protect, deleteNote);

// Export / Import
router.get('/export/json', protect, exportNotes);
router.post('/import', protect, validate(notesImportSchema), importNotes);

module.exports = router;
