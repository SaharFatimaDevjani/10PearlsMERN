// frontend/src/Pages/Dashboard.jsx
// The main notes screen: shows the current user's notes, and lets them
// create, edit, delete, search, export (download JSON), and import
// (upload JSON) notes. Rich text is edited with react-simple-wysiwyg and
// rendered back with dangerouslySetInnerHTML (safe here because the backend
// sanitizes all note HTML before saving it — see cleanHtml() in
// Backend/Controllers/noteController.js).

import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import Editor from "react-simple-wysiwyg";

export default function Dashboard() {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState({ title: "", content: "" });
  // Which note (by id) is currently being edited inline; null = none.
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingNote, setEditingNote] = useState({ title: "", content: "" });

  const [me, setMe] = useState(null); // current user's profile, used for the header greeting
  const [loadingMe, setLoadingMe] = useState(true);

  // NEW: search term
  const [q, setQ] = useState("");

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  // Memoized so the auth header object identity is stable across renders
  // (it's a dependency of the effects below, and re-creating it every
  // render would otherwise re-trigger them needlessly).
  const authHeader = useMemo(() => ({ Authorization: token }), [token]);

  // Fetch profile for header
  useEffect(() => {
    const run = async () => {
      try {
        const { data } = await axios.get("http://localhost:5000/api/auth/me", {
          headers: authHeader,
        });
        setMe(data);
      } catch {
        // Token missing/expired -> force a fresh login.
        toast.error("Session expired, please login again.");
        localStorage.removeItem("token");
        navigate("/login");
      } finally {
        setLoadingMe(false);
      }
    };
    run();
  }, [authHeader, navigate]);

  // Fetch notes (with optional search q)
  const fetchNotes = async (query = "") => {
    try {
      const url = query
        ? `http://localhost:5000/api/notes?q=${encodeURIComponent(query)}`
        : "http://localhost:5000/api/notes";
      const { data } = await axios.get(url, { headers: authHeader });
      setNotes(data);
    } catch (err) {
      toast.error("Failed to load notes.");
    }
  };

  // Re-fetch notes whenever the search box (`q`) changes, including on
  // first mount (q starts as "").
  useEffect(() => {
    fetchNotes(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  // Creates a note from the "Create a Note" form at the top of the page.
  const handleCreate = async () => {
    if (!newNote.title.trim()) return toast.error("Title is required");
    try {
      await axios.post("http://localhost:5000/api/notes", newNote, {
        headers: authHeader,
      });
      setNewNote({ title: "", content: "" }); // clear the form
      toast.success("Note created");
      fetchNotes(q); // refresh the list so the new note appears
    } catch {
      toast.error("Failed to create note");
    }
  };

  // Switches a note card into "edit" mode, seeding the edit form with its
  // current title/content.
  const startEdit = (n) => {
    setEditingNoteId(n._id);
    setEditingNote({ title: n.title, content: n.content });
  };

  const cancelEdit = () => {
    setEditingNoteId(null);
    setEditingNote({ title: "", content: "" });
  };

  // Persists the edited note and exits edit mode.
  const saveEdit = async (id) => {
    if (!editingNote.title.trim()) return toast.error("Title is required");
    try {
      await axios.put(`http://localhost:5000/api/notes/${id}`, editingNote, {
        headers: authHeader,
      });
      toast.success("Note updated");
      cancelEdit();
      fetchNotes(q);
    } catch {
      toast.error("Failed to update note");
    }
  };

  // Asks for confirmation via a SweetAlert2 dialog before deleting.
  const confirmDelete = async (id) => {
    const res = await Swal.fire({
      title: "Delete this note?",
      text: "This cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
    });
    if (res.isConfirmed) {
      try {
        await axios.delete(`http://localhost:5000/api/notes/${id}`, {
          headers: authHeader,
        });
        toast.success("Note deleted");
        fetchNotes(q);
      } catch {
        toast.error("Failed to delete");
      }
    }
  };

  // NEW: Export notes (download JSON)
  // Builds the JSON client-side from the notes already loaded in state and
  // triggers a browser download via a throwaway <a download> link. (The
  // backend also exposes GET /api/notes/export/json for the same data if a
  // server-generated file is ever needed instead.)
  const exportNotes = () => {
    const blob = new Blob([JSON.stringify(notes, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "notes-export.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url); // free the blob URL now that the download started
  };

  // NEW: Import notes (upload JSON)
  // Reads the chosen file as text, parses it as a JSON array of
  // {title, content} objects, and bulk-imports them via the backend.
  const importNotes = async (file) => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed)) throw new Error("File must be an array");
      // Send to backend import endpoint
      await axios.post(
        "http://localhost:5000/api/notes/import",
        { notes: parsed.map((n) => ({ title: n.title || "", content: n.content || "" })) },
        { headers: authHeader }
      );
      toast.success("Notes imported");
      fetchNotes(q);
    } catch (err) {
      toast.error("Invalid import file");
    }
  };

  if (loadingMe) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          {me ? `${me.firstName} ${me.lastName}'s Notes` : "Notes"}
        </h1>

        <div className="flex gap-2">
          {/* NEW: search box — updates `q`, which the effect above turns into a re-fetch */}
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search notes..."
            className="border rounded px-3 py-2"
          />

          {/* NEW: export button */}
          <button
            onClick={exportNotes}
            className="bg-gray-200 hover:bg-gray-300 px-3 py-2 rounded"
          >
            Export
          </button>

          {/* NEW: import button — a styled <label> wraps a hidden file input
              so the native file picker looks like the other buttons */}
          <label className="bg-gray-200 hover:bg-gray-300 px-3 py-2 rounded cursor-pointer">
            Import
            <input
              type="file"
              accept="application/json"
              onChange={(e) => e.target.files[0] && importNotes(e.target.files[0])}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Create new note */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h2 className="font-semibold mb-3">Create a Note</h2>
        <input
          value={newNote.title}
          onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
          placeholder="Title"
          className="w-full border rounded px-3 py-2 mb-3"
        />
        <Editor
          value={newNote.content}
          onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
        />
        <button
          onClick={handleCreate}
          className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Save Note
        </button>
      </div>

      {/* List */}
      <div className="space-y-4">
        {notes.map((n) => (
          <div key={n._id} className="bg-white rounded-lg shadow p-4">
            {editingNoteId === n._id ? (
              // Edit mode: show inputs bound to `editingNote` instead of the read-only view.
              <>
                <input
                  value={editingNote.title}
                  onChange={(e) =>
                    setEditingNote({ ...editingNote, title: e.target.value })
                  }
                  placeholder="Title"
                  className="w-full border rounded px-3 py-2 mb-3"
                />
                <Editor
                  value={editingNote.content}
                  onChange={(e) =>
                    setEditingNote({ ...editingNote, content: e.target.value })
                  }
                />
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => saveEdit(n._id)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                  >
                    Save
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              // Read-only view: render the sanitized HTML content directly.
              <>
                <h3 className="font-semibold text-lg">{n.title}</h3>
                <div
                  className="prose max-w-none mt-2"
                  dangerouslySetInnerHTML={{ __html: n.content }}
                />
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => startEdit(n)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => confirmDelete(n._id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
