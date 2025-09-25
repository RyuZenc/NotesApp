import { renderNotes } from "./utils/render-notes.js";

import "./components/app-bar.js";
import "./components/note-item.js";
import "./components/note-form.js";
import "./components/foot-bar.js";
import "./components/loading.js";

import "./styles/main.css";

document.addEventListener("DOMContentLoaded", renderNotes);
