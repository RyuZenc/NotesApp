import { NotesAPI } from "../api/notes-api.js";

export async function renderNotes() {
  const notesList = document.getElementById("notesList");
  const loadingIndicator = document.createElement("loading-indicator");

  notesList.innerHTML = "";
  notesList.appendChild(loadingIndicator);

  try {
    const notes = await NotesAPI.getAllNotes();

    notesList.innerHTML = "";
    notes.forEach((note) => {
      const noteItem = document.createElement("note-item");
      noteItem.setAttribute("show-date", "true");
      noteItem.setAttribute("date-format", "locale");
      noteItem.setAttribute("max-content-length", "200");
      noteItem.note = note;
      notesList.appendChild(noteItem);
    });
  } catch (error) {
    notesList.innerHTML = `<p class="error">Failed to load notes: ${error.message}</p>`;
  }
}
