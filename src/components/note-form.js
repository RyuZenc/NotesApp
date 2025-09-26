import { NotesAPI } from "../api/notes-api.js";
import { renderNotes } from "../utils/render-notes.js";

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

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const title = titleInput.value.trim();
      const body = bodyInput.value.trim();

      if (title.length >= minTitleLength && body.length >= minBodyLength) {
        // Create and show loading indicator
        const loadingIndicator = document.createElement("loading-indicator");
        document.body.appendChild(loadingIndicator);
        loadingIndicator.show();

        submitBtn.disabled = true;
        submitBtn.textContent = "Adding...";

        try {
          await NotesAPI.createNote({ title, body });

          loadingIndicator.hide();
          document.body.removeChild(loadingIndicator);

          await renderNotes();
          form.reset();
          validate();

          alert(`Note "${title}" added successfully!`);
        } catch (error) {
          loadingIndicator.hide();
          document.body.removeChild(loadingIndicator);
          alert(`Failed to add note: ${error.message}`);
        } finally {
          submitBtn.disabled = false;
          submitBtn.textContent =
            this.getAttribute("submit-text") || "Add Note";
        }
      }
    });

    validate();
  }
}
customElements.define("note-form", NoteForm);
