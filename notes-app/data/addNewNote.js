class AddNewNote extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.isFormVisible = this.getAttribute('show-form') === 'true';
    }

    connectedCallback() {
        this.render();
        this.setupEventListeners();
    }

    static get observedAttributes() {
        return ['show-form', 'button-text'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'show-form') {
            this.isFormVisible = newValue === 'true';
            this.render();
        } else if (name === 'button-text') {
            this.render();
        }
    }

    render() {
        const buttonText = this.getAttribute('button-text') || 'Tambah Catatan';
        
        this.shadowRoot.innerHTML = `
            <style>
                .form-container {
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(10px);
                    border-radius: 20px;
                    padding: 2rem;
                    margin-bottom: 2rem;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    transition: all 0.3s ease;
                }

                .form-container:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
                }

                .form-header {
                    text-align: center;
                    margin-bottom: 2rem;
                }

                .form-header h2 {
                    font-family: 'Oswald', sans-serif;
                    color: #333;
                    font-size: 2rem;
                    margin-bottom: 0.5rem;
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .form-header p {
                    color: #666;
                    font-size: 1rem;
                }

                .form-group {
                    margin-bottom: 1.5rem;
                }

                label {
                    display: block;
                    font-weight: 500;
                    color: #333;
                    margin-bottom: 0.5rem;
                    font-size: 1rem;
                }

                .required {
                    color: #e74c3c;
                }

                input[type="text"], textarea {
                    width: 100%;
                    padding: 1rem;
                    border: 2px solid #e1e5e9;
                    border-radius: 12px;
                    font-size: 1rem;
                    font-family: inherit;
                    transition: all 0.3s ease;
                    background: rgba(255, 255, 255, 0.8);
                }

                input[type="text"]:focus, textarea:focus {
                    outline: none;
                    border-color: #667eea;
                    transform: translateY(-2px);
                    box-shadow: 0 10px 20px rgba(102, 126, 234, 0.1);
                }

                textarea {
                    resize: vertical;
                    min-height: 120px;
                    font-family: inherit;
                }

                .submit-btn {
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    color: white;
                    padding: 1rem 2rem;
                    border: none;
                    border-radius: 12px;
                    font-size: 1rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    width: 100%;
                    font-family: 'Oswald', sans-serif;
                    letter-spacing: 1px;
                }

                .submit-btn:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 15px 30px rgba(102, 126, 234, 0.3);
                }

                .submit-btn:active {
                    transform: translateY(-1px);
                }

                .error-message {
                    color: #e74c3c;
                    font-size: 0.9rem;
                    margin-top: 0.5rem;
                    display: none;
                }

                .success-message {
                    color: #27ae60;
                    font-size: 0.9rem;
                    margin-top: 0.5rem;
                    display: none;
                }

                .input-error {
                    border-color: #e74c3c !important;
                    animation: shake 0.5s ease-in-out;
                }

                .input-success {
                    border-color: #27ae60 !important;
                }

                .character-count {
                    font-size: 0.8rem;
                    color: #999;
                    text-align: right;
                    margin-top: 0.25rem;
                }

                .character-count.warning {
                    color: #f39c12;
                }

                .character-count.error {
                    color: #e74c3c;
                }

                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }

                @media (max-width: 768px) {
                    .form-container {
                        padding: 1.5rem;
                        margin: 1rem;
                    }
                    
                    .form-header h2 {
                        font-size: 1.5rem;
                    }
                }

                @media (max-width: 480px) {
                    .form-container {
                        padding: 1rem;
                        margin: 0.5rem;
                    }
                    
                    .form-header h2 {
                        font-size: 1.3rem;
                    }
                    
                    input[type="text"], textarea {
                        padding: 0.8rem;
                    }
                    
                    .submit-btn {
                        padding: 0.8rem 1.5rem;
                    }
                }
            </style>

            <div class="form-container">
                <div class="form-header">
                    <h2>Tambah Catatan Baru</h2>
                    <p>Tuangkan pikiran dan ide Anda</p>
                </div>
                
                <form id="noteForm">
                    <div class="form-group">
                        <label for="title">Judul <span class="required">*</span></label>
                        <input type="text" id="title" name="title" required maxlength="50">
                        <div class="character-count" id="titleCount">0/50</div>
                        <div class="error-message" id="titleError">Judul wajib diisi</div>
                        <div class="success-message" id="titleSuccess">Judul sudah sesuai</div>
                    </div>
                    
                    <div class="form-group">
                        <label for="body">Isi Catatan <span class="required">*</span></label>
                        <textarea id="body" name="body" placeholder="Tulis catatan Anda di sini..." required maxlength="500"></textarea>
                        <div class="character-count" id="bodyCount">0/500</div>
                        <div class="error-message" id="bodyError">Isi catatan wajib diisi</div>
                        <div class="success-message" id="bodySuccess">Isi catatan sudah sesuai</div>
                    </div>
                    
                    <button type="submit" class="submit-btn">${buttonText}</button>
                </form>
            </div>
        `;
    }

    setupEventListeners() {
        const form = this.shadowRoot.getElementById('noteForm');
        const titleInput = this.shadowRoot.getElementById('title');
        const bodyInput = this.shadowRoot.getElementById('body');

        // Real-time validation dan character count
        titleInput.addEventListener('input', () => {
            this.updateCharacterCount(titleInput, 'titleCount', 50);
            this.validateField(titleInput, 'titleError', 'titleSuccess');
        });
        
        bodyInput.addEventListener('input', () => {
            this.updateCharacterCount(bodyInput, 'bodyCount', 500);
            this.validateField(bodyInput, 'bodyError', 'bodySuccess');
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const isValid = this.validateForm();
            if (isValid) {
                const formData = new FormData(form);
                const noteData = {
                    title: formData.get('title').trim(),
                    body: formData.get('body').trim()
                };
                
                // Dispatch custom event
                document.dispatchEvent(new CustomEvent('newNoteAdded', { 
                    detail: noteData 
                }));
                
                form.reset();
                this.clearValidation();
                this.updateCharacterCount(titleInput, 'titleCount', 50);
                this.updateCharacterCount(bodyInput, 'bodyCount', 500);
            }
        });
    }

    updateCharacterCount(input, countId, maxLength) {
        const countElement = this.shadowRoot.getElementById(countId);
        const currentLength = input.value.length;
        
        countElement.textContent = `${currentLength}/${maxLength}`;
        
        if (currentLength >= maxLength * 0.9) {
            countElement.className = 'character-count error';
        } else if (currentLength >= maxLength * 0.7) {
            countElement.className = 'character-count warning';
        } else {
            countElement.className = 'character-count';
        }
    }

    validateField(input, errorId, successId) {
        const errorElement = this.shadowRoot.getElementById(errorId);
        const successElement = this.shadowRoot.getElementById(successId);
        
        if (!input.value.trim()) {
            input.classList.add('input-error');
            input.classList.remove('input-success');
            errorElement.style.display = 'block';
            successElement.style.display = 'none';
            return false;
        } else {
            input.classList.remove('input-error');
            input.classList.add('input-success');
            errorElement.style.display = 'none';
            successElement.style.display = 'block';
            return true;
        }
    }

    validateForm() {
        const titleInput = this.shadowRoot.getElementById('title');
        const bodyInput = this.shadowRoot.getElementById('body');
        
        const titleValid = this.validateField(titleInput, 'titleError', 'titleSuccess');
        const bodyValid = this.validateField(bodyInput, 'bodyError', 'bodySuccess');
        
        return titleValid && bodyValid;
    }

    clearValidation() {
        const inputs = this.shadowRoot.querySelectorAll('input, textarea');
        const errors = this.shadowRoot.querySelectorAll('.error-message');
        const successes = this.shadowRoot.querySelectorAll('.success-message');
        
        inputs.forEach(input => {
            input.classList.remove('input-error', 'input-success');
        });
        errors.forEach(error => error.style.display = 'none');
        successes.forEach(success => success.style.display = 'none');
    }
}

customElements.define('add-new-note', AddNewNote);