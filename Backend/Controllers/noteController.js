// Backend/Controllers/noteController.js
// CRUD + search + export/import for notes. Every handler here is mounted
// behind the `protect` auth middleware (see Routes/noteRoutes.js), so
// req.user is always the current user's id, and every query is scoped to
// `{ user: req.user }` so users can never read or modify each other's notes.

const sanitizeHtml = require('sanitize-html');
const Note = require('../Models/Note');

// sanitize helper
// The note editor on the frontend is a WYSIWYG (react-simple-wysiwyg) that
// produces raw HTML. Before that HTML is stored/rendered again via
// dangerouslySetInnerHTML on the frontend, we strip anything dangerous
// (e.g. <script> tags, event handler attributes) while still allowing the
// formatting tags a notes app actually needs.
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
// Lists the current user's notes, newest first. If a `q` query param is
// given, filters to notes whose title OR content contains it
// (case-insensitive substring match via a Mongo regex).
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
    next(err); // forwarded to the global error handler in index.js
  }
};

// POST /api/notes
// Creates a note owned by the current user. Content is sanitized before
// being persisted.
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
// Updates a note, but only if it belongs to the current user — the filter
// `{ _id: req.params.id, user: req.user }` means another user's note id
// simply won't match, resulting in a 404 rather than leaking its existence.
exports.updateNote = async (req, res, next) => {
  try {
    const { title, content } = req.body;
    const updated = await Note.findOneAndUpdate(
      { _id: req.params.id, user: req.user },
      { title, content: cleanHtml(content || '') },
      { new: true } // return the updated document, not the pre-update one
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
// Same ownership check as updateNote — a note can only be deleted by its owner.
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
// Streams all of the current user's notes back as a downloadable JSON file
// (only title/content are included — no ids/timestamps/user field).
exports.exportNotes = async (req, res, next) => {
  try {
    const notes = await Note.find({ user: req.user }).sort({ createdAt: -1 });
    res.setHeader('Content-Type', 'application/json');
    // Content-Disposition: attachment tells the browser to download the
    // response instead of trying to display it inline.
    res.setHeader('Content-Disposition', 'attachment; filename="notes-export.json"');
    res.send(JSON.stringify(notes.map(n => ({ title: n.title, content: n.content })), null, 2));
  } catch (err) {
    next(err);
  }
};

// NEW: POST /api/notes/import { notes: [{title, content}, ...] }
// Bulk-creates notes for the current user from a previously exported (or
// hand-crafted) JSON array. Each note's content is sanitized just like a
// normal create.
exports.importNotes = async (req, res, next) => {
  try {
    const { notes } = req.body;
    const docs = (notes || []).map(n => ({
      title: n.title,
      content: cleanHtml(n.content || ''),
      user: req.user,
    }));
    if (!docs.length) return res.status(400).json({ message: 'No notes to import' });

    // insertMany is a single bulk write, much faster than looping Note.create().
    await Note.insertMany(docs);
    res.json({ message: 'Imported', count: docs.length });
  } catch (err) {
    next(err);
  }
};
