const Note = require('../Models/Note');

exports.getNotes = async (req, res) => {
  const notes = await Note.find({ user: req.params.user });
  res.json(notes);
};

exports.addNote = async (req, res) => {
  const { title, content, user } = req.body;
  const note = new Note({ title, content, user });
  await note.save();
  res.json(note);
};

exports.deleteNote = async (req, res) => {
  await Note.findByIdAndDelete(req.params.id);
  res.json({ msg: 'Note deleted' });
};
