import { NotesAPI } from "../api/notes-api.js";
import { renderNotes, renderArchivedNotes } from "../utils/render-notes.js";

class NoteItem extends HTMLElement {
  static get observedAttributes() {
    return ["show-date", "date-format"];
  }

  set note(note) {
    this._note = note;
    this.render();
  }

  get note() {
    return this._note;
  }

  connectedCallback() {
    this.setupEventListeners();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue && this._note) {
      this.render();
    }
  }

  async deleteNote() {
    if (!this._note) {
      return;
    }

    if (!confirm(`Are you sure you want to delete "${this._note.title}"?`)) {
      return;
    }

    const deleteBtn = this.querySelector(".delete-btn");
    const originalText = deleteBtn.textContent;

    // Create and show loading indicator
    const loadingIndicator = document.createElement("loading-indicator");
    document.body.appendChild(loadingIndicator);
    loadingIndicator.show();

    try {
      deleteBtn.disabled = true;
      deleteBtn.textContent = "Deleting...";

      await NotesAPI.deleteNote(this._note.id);

      loadingIndicator.hide();
      document.body.removeChild(loadingIndicator);

      // Re-render current view (could be active or archived)
      if (this._note.archived) {
        await renderArchivedNotes();
      } else {
        await renderNotes();
      }

      alert(`Note "${this._note.title}" deleted successfully!`);
    } catch (error) {
      loadingIndicator.hide();
      document.body.removeChild(loadingIndicator);
      alert(`Failed to delete note: ${error.message}`);
      deleteBtn.disabled = false;
      deleteBtn.textContent = originalText;
    }
  }

  async toggleArchive() {
    if (!this._note) {
      return;
    }

    const action = this._note.archived ? "unarchive" : "archive";
    const confirmMessage = this._note.archived
      ? `Are you sure you want to unarchive "${this._note.title}"?`
      : `Are you sure you want to archive "${this._note.title}"?`;

    if (!confirm(confirmMessage)) {
      return;
    }

    const archiveBtn = this.querySelector(".archive-btn");
    const originalText = archiveBtn.textContent;

    // Create and show loading indicator
    const loadingIndicator = document.createElement("loading-indicator");
    document.body.appendChild(loadingIndicator);
    loadingIndicator.show();

    try {
      archiveBtn.disabled = true;
      archiveBtn.textContent = this._note.archived
        ? "Unarchiving..."
        : "Archiving...";

      if (this._note.archived) {
        await NotesAPI.unarchiveNote(this._note.id);
        loadingIndicator.hide();
        document.body.removeChild(loadingIndicator);
        alert(`Note "${this._note.title}" unarchived successfully!`);
        await renderArchivedNotes(); // Update archived view
      } else {
        await NotesAPI.archiveNote(this._note.id);
        loadingIndicator.hide();
        document.body.removeChild(loadingIndicator);
        alert(`Note "${this._note.title}" archived successfully!`);
        await renderNotes(); // Update active view
      }
    } catch (error) {
      loadingIndicator.hide();
      document.body.removeChild(loadingIndicator);
      alert(`Failed to update archive status: ${error.message}`);
      archiveBtn.disabled = false;
      archiveBtn.textContent = originalText;
    }
  }

  setupEventListeners() {
    if (!this.clickHandler) {
      this.clickHandler = (e) => {
        if (e.target.classList.contains("delete-btn")) {
          this.deleteNote();
        } else if (e.target.classList.contains("archive-btn")) {
          this.toggleArchive();
        }
      };
      this.addEventListener("click", this.clickHandler);
    }
  }

  render() {
    if (!this._note) {
      return;
    }

    const showDate = this.getAttribute("show-date") !== "false";
    const dateFormat = this.getAttribute("date-format") || "locale";

    let dateString = "";
    if (showDate) {
      const date = new Date(this._note.createdAt);
      dateString =
        dateFormat === "short"
          ? date.toLocaleDateString()
          : date.toLocaleString();
    }

    // Button icon changes depending on archive status
    const archiveIcon = this._note.archived ? "📤" : "📥";
    const archiveTitle = this._note.archived
      ? "Unarchive this note"
      : "Archive this note";

    this.innerHTML = `
      <div class="note-header">
        <h3>${this._note.title}</h3>
        <div class="actions">
          <button class="delete-btn" title="Delete this note">🗑️</button>
          <button class="archive-btn" title="${archiveTitle}">${archiveIcon}</button>
        </div>
      </div>
      <p>${this._note.body}</p>
      ${showDate ? `<small>${dateString}</small>` : ""}
    `;
  }
}

customElements.define("note-item", NoteItem);
