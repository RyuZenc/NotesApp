import { renderNotes, renderArchivedNotes } from "../utils/render-notes.js";

class ViewToggle extends HTMLElement {
  constructor() {
    super();
    this.currentView = "active"; // "active" or "archived"
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
  }

  setupEventListeners() {
    if (!this.clickHandler) {
      this.clickHandler = async (e) => {
        if (e.target.classList.contains("toggle-btn")) {
          const { view } = e.target.dataset;
          await this.switchView(view);
        }
      };
      this.addEventListener("click", this.clickHandler);
    }
  }

  async switchView(view) {
    if (this.currentView === view) {
      return;
    }

    this.currentView = view;
    this.render();

    // Update the notes list
    if (view === "active") {
      await renderNotes();
    } else {
      await renderArchivedNotes();
    }
  }

  render() {
    this.innerHTML = `
      <div class="view-toggle">
        <button 
          class="toggle-btn ${this.currentView === "active" ? "active" : ""}" 
          data-view="active"
        >
          📝 Active Notes
        </button>
        <button 
          class="toggle-btn ${this.currentView === "archived" ? "active" : ""}" 
          data-view="archived"
        >
          📦 Archived Notes
        </button>
      </div>
    `;
  }
}

customElements.define("view-toggle", ViewToggle);
