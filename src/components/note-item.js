import { NotesAPI } from "../api/notes-api.js";
import { renderNotes, renderArchivedNotes } from "../utils/render-notes.js";
import Swal from "sweetalert2";

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

    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You want to delete "${this._note.title}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) {
      return;
    }

    const deleteBtn = this.querySelector(".delete-btn");
    const originalText = deleteBtn.textContent;

    const loadingIndicator = document.createElement("loading-indicator");
    document.body.appendChild(loadingIndicator);
    loadingIndicator.show();

    try {
      deleteBtn.disabled = true;
      deleteBtn.textContent = "Deleting...";

      await NotesAPI.deleteNote(this._note.id);

      loadingIndicator.hide();
      document.body.removeChild(loadingIndicator);

      if (this._note.archived) {
        await renderArchivedNotes();
      } else {
        await renderNotes();
      }

      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: `Note "${this._note.title}" has been deleted.`,
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: "top-end",
      });
    } catch (error) {
      loadingIndicator.hide();
      document.body.removeChild(loadingIndicator);
      Swal.fire({
        icon: "error",
        title: "Delete Failed",
        text: error.message,
        confirmButtonText: "OK",
      });
      deleteBtn.disabled = false;
      deleteBtn.textContent = originalText;
    }
  }

  async toggleArchive() {
    if (!this._note) {
      return;
    }

    const action = this._note.archived ? "unarchive" : "archive";
    const title = this._note.archived ? "Unarchive Note?" : "Archive Note?";
    const text = this._note.archived
      ? `You want to unarchive "${this._note.title}"?`
      : `You want to archive "${this._note.title}"?`;
    const confirmButtonText = this._note.archived
      ? "Yes, unarchive it!"
      : "Yes, archive it!";

    const result = await Swal.fire({
      title: title,
      text: text,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#81bfda",
      cancelButtonColor: "#6c757d",
      confirmButtonText: confirmButtonText,
    });

    if (!result.isConfirmed) {
      return;
    }

    const archiveBtn = this.querySelector(".archive-btn");
    const originalText = archiveBtn.textContent;

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
        Swal.fire({
          icon: "success",
          title: "Unarchived!",
          text: `Note "${this._note.title}" has been unarchived.`,
          timer: 2000,
          showConfirmButton: false,
          toast: true,
          position: "top-end",
        });
        await renderArchivedNotes();
      } else {
        await NotesAPI.archiveNote(this._note.id);
        loadingIndicator.hide();
        document.body.removeChild(loadingIndicator);
        Swal.fire({
          icon: "success",
          title: "Archived!",
          text: `Note "${this._note.title}" has been archived.`,
          timer: 2000,
          showConfirmButton: false,
          toast: true,
          position: "top-end",
        });
        await renderNotes();
      }
    } catch (error) {
      loadingIndicator.hide();
      document.body.removeChild(loadingIndicator);
      Swal.fire({
        icon: "error",
        title: "Archive Failed",
        text: error.message,
        confirmButtonText: "OK",
      });
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
