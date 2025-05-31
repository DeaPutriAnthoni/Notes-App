class LoadingIndicator extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.isVisible = false;
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        .loading-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(102, 126, 234, 0.1);
          backdrop-filter: blur(5px);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s ease;
        }

        .loading-overlay.visible {
          opacity: 1;
          visibility: visible;
        }

        .loading-content {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 2rem;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          text-align: center;
          min-width: 200px;
          animation: fadeInScale 0.3s ease-out;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }

        .loading-text {
          color: #333;
          font-size: 1rem;
          font-weight: 500;
          margin-bottom: 0.5rem;
        }

        .loading-subtext {
          color: #666;
          font-size: 0.9rem;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        .pulse {
          animation: pulse 2s infinite;
        }

        /* Enhanced animations */
        .loading-content {
          animation: fadeInScale 0.3s ease-out, pulse 2s infinite 1s;
        }

        /* Responsive design */
        @media (max-width: 480px) {
          .loading-content {
            padding: 1.5rem;
            min-width: 150px;
          }

          .spinner {
            width: 35px;
            height: 35px;
          }

          .loading-text {
            font-size: 0.9rem;
          }

          .loading-subtext {
            font-size: 0.8rem;
          }
        }
      </style>

      <div class="loading-overlay" id="loadingOverlay">
        <div class="loading-content">
          <div class="spinner"></div>
          <div class="loading-text" id="loadingText">Memuat...</div>
          <div class="loading-subtext" id="loadingSubtext">
            Mohon tunggu sebentar
          </div>
        </div>
      </div>
    `;
  }

  show(message = 'Memuat...', subtext = 'Mohon tunggu sebentar') {
    const overlay = this.shadowRoot.getElementById('loadingOverlay');
    const textElement = this.shadowRoot.getElementById('loadingText');
    const subtextElement = this.shadowRoot.getElementById('loadingSubtext');

    textElement.textContent = message;
    subtextElement.textContent = subtext;

    overlay.classList.add('visible');
    this.isVisible = true;

    // Auto hide after 30 seconds to prevent infinite loading
    setTimeout(() => {
      if (this.isVisible) {
        this.hide();
      }
    }, 30000);
  }

  hide() {
    const overlay = this.shadowRoot.getElementById('loadingOverlay');
    overlay.classList.remove('visible');
    this.isVisible = false;
  }

  setupEventListeners() {
    // Listen for global loading events
    document.addEventListener('showLoading', event => {
      const { message, subtext } = event.detail || {};
      this.show(message, subtext);
    });

    document.addEventListener('hideLoading', () => {
      this.hide();
    });
  }
}

customElements.define('loading-indicator', LoadingIndicator);