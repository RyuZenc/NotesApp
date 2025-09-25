// Import API and utilities
import { NotesAPI } from "./api/notes-api.js";

// Import components
import "./components/app-bar.js";
import "./components/note-item.js";
import "./components/note-form.js";
import "./components/foot-bar.js";
import "./components/loading.js";

// Import styles
import "./styles/main.css";

// Render
async function renderNotes() {
  const notesList = document.getElementById("notesList");
  const loadingIndicator = document.createElement("loading-indicator");

  notesList.innerHTML = "";
  notesList.appendChild(loadingIndicator);

  try {
    const notes = await NotesAPI.getAllNotes();

    notesList.innerHTML = "";
    notes.forEach((note) => {
      const noteItem = document.createElement("note-item");
      noteItem.note = note;
      notesList.appendChild(noteItem);
    });
  } catch (error) {
    notesList.innerHTML = `<p class="error">Failed to load notes: ${error.message}</p>`;
  }
}

// Call renderNotes when page loads
document.addEventListener("DOMContentLoaded", renderNotes);

// Main application logic
