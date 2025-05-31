import NotesApi from '../services/notesApi.js';
import Swal from 'sweetalert2';

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
          animation: slideUp 0.8s ease-out;
        }

        .form-container:hover {
          transform: translateY(-3px);
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
        }

        .form-header {
          text-align: center;
          margin-bottom: 2rem;
          animation: fadeInUp 1s ease-out 0.2s both;
        }

        .form-header h2 {
          font-family: 'Oswald', sans-serif;
          font-size: 2rem;
          font-weight: 500;
          background: linear-gradient(135deg, #667eea, #764ba2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.5rem;
        }

        .form-header p {
          color: #666;
          font-size: 1rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
          animation: fadeInUp 1s ease-out 0.4s both;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          color: #333;
          font-weight: 500;
          font-size: 1rem;
        }

        .required {
          color: #e74c3c;
        }

        input[type="text"],
        textarea {
          width: 100%;
          padding: 1rem;
          border: 2px solid #e1e5e9;
          border-radius: 12px;
          font-size: 1rem;
          font-family: inherit;
          transition: all 0.3s ease;
          background: rgba(255, 255, 255, 0.8);
          resize: vertical;
        }

        input[type="text"]:focus,
        textarea:focus {
          outline: none;
          border-color: #667eea;
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(102, 126, 234, 0.1);
        }

        textarea {
          min-height: 120px;
          max-height: 300px;
        }

        .submit-btn {
          width: 100%;
          padding: 1rem 2rem;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 1.1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          animation: fadeInUp 1s ease-out 0.6s both;
        }

        .submit-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 30px rgba(102, 126, 234, 0.3);
        }

        .submit-btn:active {
          transform: translateY(-1px);
        }

        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        /* Animations */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideUp {
          from {
            transform: translateY(30px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        .animate-error {
          animation: shake 0.5s ease-in-out;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .form-container {
            margin: 1rem;
            padding: 1.5rem;
          }
          
          .form-header h2 {
            font-size: 1.8rem;
          }
          
          input[type="text"],
          textarea {
            padding: 0.8rem;
          }
          
          .submit-btn {
            padding: 0.8rem 1.5rem;
            font-size: 1rem;
          }
        }

        @media (max-width: 480px) {
          .form-container {
            margin: 0.5rem;
            padding: 1rem;
          }
          
          .form-header h2 {
            font-size: 1.5rem;
          }
          
          .form-header p {
            font-size: 0.9rem;
          }
          
          input[type="text"],
          textarea {
            padding: 0.7rem;
            font-size: 0.9rem;
          }
          
          .submit-btn {
            padding: 0.7rem 1.2rem;
            font-size: 0.9rem;
          }
        }
      </style>
      <div class="form-container">
        <div class="form-header">
          <h2>Tambah Catatan</h2>
          <p>Buat catatan baru di bawah ini</p>
        </div>
        <form id="noteForm">
          <div class="form-group">
            <label>Judul <span class="required">*</span></label>
            <input type="text" name="title" required maxlength="100" />
          </div>
          <div class="form-group">
            <label>Isi <span class="required">*</span></label>
            <textarea name="body" required maxlength="1000" placeholder="Tulis isi catatan Anda di sini..."></textarea>
          </div>
          <button type="submit" class="submit-btn">${buttonText}</button>
        </form>
      </div>
    `;
  }

  setupEventListeners() {
    const form = this.shadowRoot.querySelector('#noteForm');
    const submitBtn = this.shadowRoot.querySelector('.submit-btn');
    const titleInput = this.shadowRoot.querySelector('input[name="title"]');
    const bodyInput = this.shadowRoot.querySelector('textarea[name="body"]');

    // Add input validation styling
    const validateInput = input => {
      const value = input.value.trim();
      if (value.length === 0) {
        input.style.borderColor = '#e74c3c';
        return false;
      } else {
        input.style.borderColor = '#27ae60';
        return true;
      }
    };

    titleInput.addEventListener('blur', () => validateInput(titleInput));
    bodyInput.addEventListener('blur', () => validateInput(bodyInput));

    form.addEventListener('submit', async e => {
      e.preventDefault();
      
      const title = titleInput.value.trim();
      const body = bodyInput.value.trim();

      // Validate inputs
      const isTitleValid = validateInput(titleInput);
      const isBodyValid = validateInput(bodyInput);

      if (!isTitleValid || !isBodyValid) {
        // Add shake animation to form
        const formContainer = this.shadowRoot.querySelector('.form-container');
        formContainer.classList.add('animate-error');
        setTimeout(() => formContainer.classList.remove('animate-error'), 500);

        return Swal.fire({
          icon: 'warning',
          title: 'Data Tidak Lengkap',
          text: 'Judul dan isi catatan wajib diisi',
          confirmButtonColor: '#667eea',
        });
      }

      if (title.length > 100) {
        return Swal.fire({
          icon: 'warning',
          title: 'Judul Terlalu Panjang',
          text: 'Judul catatan maksimal 100 karakter',
          confirmButtonColor: '#667eea',
        });
      }

      if (body.length > 1000) {
        return Swal.fire({
          icon: 'warning',
          title: 'Isi Terlalu Panjang',
          text: 'Isi catatan maksimal 1000 karakter',
          confirmButtonColor: '#667eea',
        });
      }

      // Disable submit button
      submitBtn.disabled = true;
      submitBtn.textContent = 'Menyimpan...';

      document.dispatchEvent(
        new CustomEvent('showLoading', {
          detail: { 
            message: 'Menyimpan catatan...',
            subtext: 'Mengirim data ke server'
          },
        })
      );

      try {
        await NotesApi.createNote({ title, body });
        document.dispatchEvent(new CustomEvent('newNoteAdded'));
        
        // Reset form with animation
        form.reset();
        titleInput.style.borderColor = '#e1e5e9';
        bodyInput.style.borderColor = '#e1e5e9';

        await Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Catatan berhasil ditambahkan',
          timer: 2000,
          showConfirmButton: false,
          confirmButtonColor: '#667eea',
        });
      } catch (error) {
        console.error('Error creating note:', error);
        
        // Add shake animation on error
        const formContainer = this.shadowRoot.querySelector('.form-container');
        formContainer.classList.add('animate-error');
        setTimeout(() => formContainer.classList.remove('animate-error'), 500);

        await Swal.fire({
          icon: 'error',
          title: 'Gagal Menambahkan Catatan',
          text: error.message || 'Terjadi kesalahan saat menambah catatan',
          confirmButtonColor: '#667eea',
        });
      } finally {
        document.dispatchEvent(new CustomEvent('hideLoading'));
        
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.textContent = this.getAttribute('button-text') || 'Tambah Catatan';
      }
    });
  }
}

customElements.define('add-new-note', AddNewNote);