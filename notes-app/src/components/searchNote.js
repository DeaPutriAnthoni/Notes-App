class SearchBar extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
        this.setupEventListeners();
    }

    static get observedAttributes() {
        return ['placeholder', 'max-length'];
    }

    attributeChangedCallback() {
        this.render();
    }

    render() {
        const placeholder = this.getAttribute('placeholder') || 'Cari catatan...';
        const maxLength = this.getAttribute('max-length') || '100';
        
        this.shadowRoot.innerHTML = `
            <style>
                .search-container {
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(10px);
                    border-radius: 20px;
                    padding: 1.5rem;
                    margin-bottom: 2rem;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    transition: all 0.3s ease;
                    position: relative;
                }

                .search-container:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
                }

                .search-input-container {
                    position: relative;
                    display: flex;
                    align-items: center;
                }

                .search-input {
                    width: 100%;
                    padding: 1rem 1.5rem 1rem 3rem;
                    border: 2px solid #e1e5e9;
                    border-radius: 12px;
                    font-size: 1.1rem;
                    background: rgba(255, 255, 255, 0.8);
                    transition: all 0.3s ease;
                }

                .search-input:focus {
                    outline: none;
                    border-color: #667eea;
                    transform: translateY(-2px);
                    box-shadow: 0 10px 20px rgba(102, 126, 234, 0.1);
                }

                .search-input::placeholder {
                    color: #999;
                }

                .search-icon {
                    position: absolute;
                    left: 1rem;
                    color: #999;
                    font-size: 1.2rem;
                    z-index: 1;
                }

                .clear-button {
                    position: absolute;
                    right: 1rem;
                    background: none;
                    border: none;
                    color: #999;
                    cursor: pointer;
                    font-size: 1.2rem;
                    padding: 0.25rem;
                    border-radius: 50%;
                    transition: all 0.3s ease;
                    display: none;
                }

                .clear-button:hover {
                    background: #f0f0f0;
                    color: #333;
                }

                .search-stats {
                    margin-top: 0.5rem;
                    font-size: 0.9rem;
                    color: #666;
                    text-align: center;
                    display: none;
                }

                .search-stats.active {
                    display: block;
                }

                @media (max-width: 768px) {
                    .search-container {
                        margin: 1rem;
                        padding: 1rem;
                    }
                    
                    .search-input {
                        font-size: 1rem;
                        padding: 0.8rem 1.2rem 0.8rem 2.5rem;
                    }
                    
                    .search-icon {
                        left: 0.8rem;
                    }
                    
                    .clear-button {
                        right: 0.8rem;
                    }
                }

                @media (max-width: 480px) {
                    .search-container {
                        margin: 0.5rem;
                        padding: 0.8rem;
                    }
                    
                    .search-input {
                        font-size: 0.9rem;
                        padding: 0.7rem 1rem 0.7rem 2.2rem;
                    }
                    
                    .search-icon {
                        left: 0.7rem;
                        font-size: 1rem;
                    }
                    
                    .clear-button {
                        right: 0.7rem;
                        font-size: 1rem;
                    }
                }
            </style>

            <div class="search-container">
                <div class="search-input-container">
                    <span class="search-icon">🔍</span>
                    <input type="text" class="search-input" placeholder="${placeholder}" id="searchInput" maxlength="${maxLength}">
                    <button class="clear-button" id="clearButton" title="Bersihkan pencarian">✕</button>
                </div>
                <div class="search-stats" id="searchStats"></div>
            </div>
        `;
    }

    setupEventListeners() {
        const searchInput = this.shadowRoot.getElementById('searchInput');
        const clearButton = this.shadowRoot.getElementById('clearButton');
        const searchStats = this.shadowRoot.getElementById('searchStats');
        
        let searchTimeout;
        
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            
            // Show/hide clear button
            if (searchTerm.length > 0) {
                clearButton.style.display = 'block';
            } else {
                clearButton.style.display = 'none';
            }
            
            // Debounce search untuk performa yang lebih baik
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                document.dispatchEvent(new CustomEvent('searchNotes', {
                    detail: { searchTerm }
                }));
            }, 300);
        });

        clearButton.addEventListener('click', () => {
            searchInput.value = '';
            clearButton.style.display = 'none';
            searchStats.classList.remove('active');
            document.dispatchEvent(new CustomEvent('searchNotes', {
                detail: { searchTerm: '' }
            }));
        });

        // Listen untuk update statistik pencarian
        document.addEventListener('searchResults', (e) => {
            const { totalResults, searchTerm } = e.detail;
            if (searchTerm) {
                searchStats.textContent = `Ditemukan ${totalResults} catatan untuk "${searchTerm}"`;
                searchStats.classList.add('active');
            } else {
                searchStats.classList.remove('active');
            }
        });
    }
}

customElements.define('search-bar', SearchBar);