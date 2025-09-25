import { notesData } from "./notes.js";

class AppBar extends HTMLElement {
  static get observedAttributes() {
    return ["title", "theme"];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.render();
    }
  }

  render() {
    const title = this.getAttribute("title") || "📒 Notes App";
    const theme = this.getAttribute("theme") || "primary";

    this.innerHTML = `<h1>${title}</h1>`;
    this.className = `app-bar-${theme}`;
  }
}
customElements.define("app-bar", AppBar);

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

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue && this._note) {
      this.render();
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
      <h3>${this._note.title}</h3>
      <p>${content}</p>
      ${showDate ? `<small>${dateString}</small>` : ""}
    `;
  }
}
customElements.define("note-item", NoteItem);

// Render
function renderNotes() {
  const notesList = document.getElementById("notesList");
  notesList.innerHTML = "";
  notesData.forEach((note) => {
    const noteItem = document.createElement("note-item");
    noteItem.note = note;
    notesList.appendChild(noteItem);
  });
}

renderNotes();

class FootBar extends HTMLElement {
  static get observedAttributes() {
    return ["copyright", "year", "theme"];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.render();
    }
  }

  render() {
    const copyright = this.getAttribute("copyright") || "Notes App";
    const year = this.getAttribute("year") || new Date().getFullYear();
    const theme = this.getAttribute("theme") || "primary";

    this.innerHTML = `<footer class="footer-${theme}"><p>&copy; ${year} ${copyright}</p></footer>`;
  }
}
customElements.define("foot-bar", FootBar);
