import { NotesAPI } from '../api/notes-api.js';
import Swal from 'sweetalert2';

export async function renderNotes() {
  const notesList = document.getElementById('notesList');
  const loadingIndicator = document.createElement('loading-indicator');

  document.body.appendChild(loadingIndicator);
  loadingIndicator.show();

  notesList.innerHTML = '';

  try {
    const notes = await NotesAPI.getAllNotes();
    loadingIndicator.hide();
    document.body.removeChild(loadingIndicator);

    if (notes.length === 0) {
      notesList.innerHTML = `<p class="empty-message">No active notes found. Create your first note above!</p>`;
      return;
    }

    notes.forEach((note, index) => {
      const noteItem = document.createElement('note-item');
      noteItem.setAttribute('show-date', 'true');
      noteItem.setAttribute('date-format', 'locale');
      noteItem.setAttribute('max-content-length', '200');
      noteItem.note = note;

      // Add staggered animation delay
      noteItem.style.animationDelay = `${index * 0.1}s`;

      notesList.appendChild(noteItem);
    });
  } catch (error) {
    loadingIndicator.hide();
    document.body.removeChild(loadingIndicator);

    notesList.innerHTML = `<p class="error">Failed to load notes: ${error.message}</p>`;

    Swal.fire({
      icon: 'error',
      title: 'Failed to Load Notes',
      text: error.message,
      confirmButtonText: 'Retry',
      showCancelButton: true,
      cancelButtonText: 'Cancel',
    }).then(result => {
      if (result.isConfirmed) {
        window.location.reload();
      }
    });
  }
}

export async function renderArchivedNotes() {
  const notesList = document.getElementById('notesList');
  const loadingIndicator = document.createElement('loading-indicator');

  document.body.appendChild(loadingIndicator);
  loadingIndicator.show();

  notesList.innerHTML = '';

  try {
    const archivedNotes = await NotesAPI.getArchivedNotes();
    loadingIndicator.hide();
    document.body.removeChild(loadingIndicator);

    if (archivedNotes.length === 0) {
      notesList.innerHTML = `<p class="empty-message">No archived notes found. Archive some notes to see them here!</p>`;
      return;
    }

    archivedNotes.forEach((note, index) => {
      const noteItem = document.createElement('note-item');
      noteItem.setAttribute('show-date', 'true');
      noteItem.setAttribute('date-format', 'locale');
      noteItem.setAttribute('max-content-length', '200');
      noteItem.note = note;

      // Add staggered animation delay
      noteItem.style.animationDelay = `${index * 0.1}s`;

      notesList.appendChild(noteItem);
    });
  } catch (error) {
    loadingIndicator.hide();
    document.body.removeChild(loadingIndicator);

    notesList.innerHTML = `<p class="error">Failed to load archived notes: ${error.message}</p>`;

    Swal.fire({
      icon: 'error',
      title: 'Failed to Load Archived Notes',
      text: error.message,
      confirmButtonText: 'Retry',
      showCancelButton: true,
      cancelButtonText: 'Cancel',
    }).then(result => {
      if (result.isConfirmed) {
        window.location.reload();
      }
    });
  }
}
