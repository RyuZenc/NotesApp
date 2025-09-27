class FootBar extends HTMLElement {
  static get observedAttributes() {
    return ["year", "copyright", "theme"];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  render() {
    const year = this.getAttribute("year");
    const copyright = this.getAttribute("copyright");
    const theme = this.getAttribute("theme");

    this.innerHTML = `
      <footer class="footer-${theme}">
        <p>&copy; ${year} ${copyright}</p>
      </footer>
    `;
  }
}
customElements.define("foot-bar", FootBar);
