import { NotesAPI } from "../api/notes-api.js";
import { renderNotes } from "../utils/render-notes.js";

class NoteItem extends HTMLElement {
  static get observedAttributes() {
    return ["show-date", "date-format", "max-content-length"];
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

    try {
      deleteBtn.disabled = true;
      deleteBtn.textContent = "Deleting...";

      await NotesAPI.deleteNote(this._note.id);
      await renderNotes();

      alert(`Note "${this._note.title}" deleted successfully!`);
    } catch (error) {
      alert(`Failed to delete note: ${error.message}`);
      deleteBtn.disabled = false;
      deleteBtn.textContent = originalText;
    }
  }

  setupEventListeners() {
    // Use event delegation - attach listener to the custom element itself
    if (!this.clickHandler) {
      this.clickHandler = (e) => {
        if (e.target.classList.contains("delete-btn")) {
          this.deleteNote();
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
    const maxLength = parseInt(this.getAttribute("max-content-length")) || null;

    let content = this._note.body;
    if (maxLength && content.length > maxLength) {
      content = content.substring(0, maxLength) + "...";
    }

    let dateString = "";
    if (showDate) {
      const date = new Date(this._note.createdAt);
      dateString =
        dateFormat === "short"
          ? date.toLocaleDateString()
          : date.toLocaleString();
    }

    this.innerHTML = `
      <div class="note-header">
        <h3>${this._note.title}</h3>
        <button class="delete-btn" title="Delete this note">🗑️</button>
      </div>
      <p>${content}</p>
      ${showDate ? `<small>${dateString}</small>` : ""}
    `;
  }
}

customElements.define("note-item", NoteItem);
