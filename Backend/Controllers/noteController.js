// Backend/Controllers/noteController.js
const sanitizeHtml = require('sanitize-html');
const Note = require('../Models/Note');

// sanitize helper
function cleanHtml(html) {
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2', 'h3']),
    allowedAttributes: {
      a: ['href', 'name', 'target', 'rel'],
      img: ['src', 'alt'],
      '*': ['style'],
    },
    allowedSchemes: ['http', 'https', 'data', 'mailto'],
  });
}

// GET /api/notes?q=term
exports.getNotes = async (req, res, next) => {
  try {
    const q = (req.query.q || '').trim();
    const base = { user: req.user };
    const where = q
      ? {
          ...base,
          $or: [
            { title: { $regex: q, $options: 'i' } },
            { content: { $regex: q, $options: 'i' } },
          ],
        }
      : base;

    const notes = await Note.find(where).sort({ createdAt: -1 });
    req.log?.info({ userId: req.user, count: notes.length, q }, 'Notes fetched');
    res.json(notes);
  } catch (err) {
    req.log?.error({ err, userId: req.user }, 'getNotes failed');
    next(err);
  }
};

// POST /api/notes
exports.createNote = async (req, res, next) => {
  try {
    const { title, content } = req.body;
    const note = await Note.create({
      title,
      content: cleanHtml(content || ''),
      user: req.user,
    });
    req.log?.info({ userId: req.user, noteId: note._id }, 'Note created');
    res.status(201).json(note);
  } catch (err) {
    req.log?.error({ err, userId: req.user }, 'createNote failed');
    next(err);
  }
};

// PUT /api/notes/:id
exports.updateNote = async (req, res, next) => {
  try {
    const { title, content } = req.body;
    const updated = await Note.findOneAndUpdate(
      { _id: req.params.id, user: req.user },
      { title, content: cleanHtml(content || '') },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Note not found' });

    req.log?.info({ userId: req.user, noteId: req.params.id }, 'Note updated');
    res.json(updated);
  } catch (err) {
    req.log?.error({ err, userId: req.user }, 'updateNote failed');
    next(err);
  }
};

// DELETE /api/notes/:id
exports.deleteNote = async (req, res, next) => {
  try {
    const deleted = await Note.findOneAndDelete({ _id: req.params.id, user: req.user });
    if (!deleted) return res.status(404).json({ message: 'Note not found' });

    req.log?.info({ userId: req.user, noteId: req.params.id }, 'Note deleted');
    res.json({ message: 'Deleted' });
  } catch (err) {
    req.log?.error({ err, userId: req.user }, 'deleteNote failed');
    next(err);
  }
};

// NEW: GET /api/notes/export/json
exports.exportNotes = async (req, res, next) => {
  try {
    const notes = await Note.find({ user: req.user }).sort({ createdAt: -1 });
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="notes-export.json"');
    res.send(JSON.stringify(notes.map(n => ({ title: n.title, content: n.content })), null, 2));
  } catch (err) {
    next(err);
  }
};

// NEW: POST /api/notes/import { notes: [{title, content}, ...] }
exports.importNotes = async (req, res, next) => {
  try {
    const { notes } = req.body;
    const docs = (notes || []).map(n => ({
      title: n.title,
      content: cleanHtml(n.content || ''),
      user: req.user,
    }));
    if (!docs.length) return res.status(400).json({ message: 'No notes to import' });

    await Note.insertMany(docs);
    res.json({ message: 'Imported', count: docs.length });
  } catch (err) {
    next(err);
  }
};
