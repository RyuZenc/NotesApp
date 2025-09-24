import { notesData } from "../notes.js";

function renderNotes() {
  const notesList = document.getElementById("notesList");
  if (notesList) {
    notesList.innerHTML = "";
    notesData.forEach((note) => {
      const noteItem = document.createElement("note-item");
      noteItem.setAttribute("show-date", "true");
      noteItem.setAttribute("date-format", "locale");
      noteItem.setAttribute("max-content-length", "200");
      noteItem.note = note;
      notesList.appendChild(noteItem);
    });
  }
}

class NoteForm extends HTMLElement {
  static get observedAttributes() {
    return [
      "title-placeholder",
      "body-placeholder",
      "submit-text",
      "min-title-length",
      "min-body-length",
    ];
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.render();
      this.setupEventListeners();
    }
  }

  render() {
    const titlePlaceholder = this.getAttribute("title-placeholder") || "Title";
    const bodyPlaceholder = this.getAttribute("body-placeholder") || "Content";
    const submitText = this.getAttribute("submit-text") || "Add Note";
    const minTitleLength = parseInt(this.getAttribute("min-title-length")) || 3;
    const minBodyLength = parseInt(this.getAttribute("min-body-length")) || 5;
    this.innerHTML = `
      <form id="noteForm">
        <div>
          <input type="text" id="title" placeholder="${titlePlaceholder}" required />
          <small id="titleError" style="color:red; display:none;">Title must be at least ${minTitleLength} characters</small>
        </div>
        <div>
          <textarea id="body" placeholder="${bodyPlaceholder}" required></textarea>
          <small id="bodyError" style="color:red; display:none;">Content must be at least ${minBodyLength} characters</small>
        </div>
        <button type="submit">${submitText}</button>
      </form>

      <style>
        input, textarea {
          border: 2px solid #ccc;
          border-radius: 4px;
          padding: 8px;
          width: 100%;
          box-sizing: border-box;
          margin-bottom: 5px;
          transition: border-color 0.3s;
        }
        input.valid, textarea.valid {
          border-color: green;
        }
        input.invalid, textarea.invalid {
          border-color: red;
        }
      </style>
    `;
  }

  setupEventListeners() {
    const form = this.querySelector("#noteForm");
    const titleInput = this.querySelector("#title");
    const bodyInput = this.querySelector("#body");
    const submitBtn = form.querySelector("button");
    const titleError = this.querySelector("#titleError");
    const bodyError = this.querySelector("#bodyError");

    const minTitleLength = parseInt(this.getAttribute("min-title-length")) || 3;
    const minBodyLength = parseInt(this.getAttribute("min-body-length")) || 5;

    const validate = () => {
      const title = titleInput.value.trim();
      const body = bodyInput.value.trim();

      if (title.length > 0) {
        if (title.length < minTitleLength) {
          titleError.style.display = "block";
          titleInput.classList.add("invalid");
          titleInput.classList.remove("valid");
        } else {
          titleError.style.display = "none";
          titleInput.classList.add("valid");
          titleInput.classList.remove("invalid");
        }
      } else {
        titleError.style.display = "none";
        titleInput.classList.remove("valid", "invalid");
      }

      if (body.length > 0) {
        if (body.length < minBodyLength) {
          bodyError.style.display = "block";
          bodyInput.classList.add("invalid");
          bodyInput.classList.remove("valid");
        } else {
          bodyError.style.display = "none";
          bodyInput.classList.add("valid");
          bodyInput.classList.remove("invalid");
        }
      } else {
        bodyError.style.display = "none";
        bodyInput.classList.remove("valid", "invalid");
      }

      submitBtn.disabled = !(
        title.length >= minTitleLength && body.length >= minBodyLength
      );
    };

    titleInput.addEventListener("input", validate);
    bodyInput.addEventListener("input", validate);

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const title = titleInput.value.trim();
      const body = bodyInput.value.trim();

      if (title.length >= minTitleLength && body.length >= minBodyLength) {
        const newNote = {
          id: `notes-${Date.now()}`,
          title,
          body,
          createdAt: new Date().toISOString(),
          archived: false,
        };

        notesData.push(newNote);
        renderNotes();
        form.reset();
        validate();

        alert(`Note "${title}" added successfully!`);
      }
    });

    validate();
  }
}
customElements.define("note-form", NoteForm);
