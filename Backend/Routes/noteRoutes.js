const express = require('express');
const router = express.Router();
const { getNotes, addNote, deleteNote } = require('../controllers/noteController');

router.get('/:user', getNotes);
router.post('/', addNote);
router.delete('/:id', deleteNote);

module.exports = router;
