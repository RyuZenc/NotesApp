class AppBar extends HTMLElement {
  static get observedAttributes() {
    return ['title', 'theme'];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  render() {
    const title = this.getAttribute('title');
    const theme = this.getAttribute('theme');

    this.innerHTML = `<h1>${title}</h1>`;
    this.className = `app-bar-${theme}`;
  }
}
customElements.define('app-bar', AppBar);
