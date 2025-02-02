import { LitElement, html, css } from 'lit-element';

class LazyLoadingImage extends LitElement {
    static get properties() {
        return {
            src: { type: String },
            alt: { type: String }
        };
    }

    static get styles() {
        return css`
      :host {
        display: block;
      }
      img {
        max-width: 100%;
        height: auto;
      }
    `;
    }

    render() {
        return html`
      <img id="image" loading="lazy" src="${this.src}" alt="${this.alt}">
    `;
    }
}

customElements.define('lazy-loading-image', LazyLoadingImage);