import NotesApi from '../services/notesApi.js';
import Swal from 'sweetalert2';

class NotesList extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.notes = [];
    this.filteredNotes = [];
    this.currentSearchTerm = '';
    this.currentMode = 'active'; // 'active' or 'archived'
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
    this.loadNotes();
  }

  static get observedAttributes() {
    return ['grid-columns', 'show-date', 'mode'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'mode' && oldValue !== newValue) {
      this.currentMode = newValue || 'active';
      this.loadNotes();
    } else {
      this.render();
    }
  }

  async loadNotes() {
    try {
      document.dispatchEvent(new CustomEvent('showLoading', {
        detail: {
          message: 'Memuat catatan...',
          subtext: 'Mengambil data dari server'
        }
      }));

      let notes;
      if (this.currentMode === 'archived') {
        notes = await NotesApi.getArchivedNotes();
      } else {
        notes = await NotesApi.getAllNotes();
      }

      this.notes = notes || [];
      this.filteredNotes = this.currentSearchTerm 
        ? this.filterNotes(this.currentSearchTerm) 
        : [...this.notes];
      
      this.render();
      
      document.dispatchEvent(new CustomEvent('hideLoading'));
    } catch (error) {
      console.error('Error loading notes:', error);
      document.dispatchEvent(new CustomEvent('hideLoading'));
      
      await Swal.fire({
        icon: 'error',
        title: 'Gagal Memuat Catatan',
        text: error.message || 'Terjadi kesalahan saat memuat catatan',
        confirmButtonColor: '#667eea'
      });
    }
  }

  render() {
    const gridColumns = this.getAttribute('grid-columns') || '3';
    const showDate = this.getAttribute('show-date') === 'true';
    
    this.shadowRoot.innerHTML = `
      <style>
        .notes-container {
          width: 100%;
        }

        .notes-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          padding: 1rem 1.5rem;
          border-radius: 15px;
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05);
          animation: slideDown 0.5s ease-out;
        }

        .notes-count {
          font-size: 1.1rem;
          color: #666;
          font-weight: 500;
        }

        .view-toggle {
          display: flex;
          gap: 0.5rem;
        }

        .view-btn {
          padding: 0.5rem 1rem;
          border: 2px solid #e1e5e9;
          background: white;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.9rem;
        }

        .view-btn.active {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border-color: transparent;
        }

        .notes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 2rem;
          padding: 1rem 0;
        }

        .notes-grid.grid-1 { grid-template-columns: 1fr; }
        .notes-grid.grid-2 { grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); }
        .notes-grid.grid-3 { grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); }
        .notes-grid.grid-4 { grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); }

        .note-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 2rem;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          animation: fadeInUp 0.6s ease-out;
        }

        .note-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          transform: translateX(-100%);
          transition: transform 0.3s ease;
        }

        .note-card:hover {
          transform: translateY(-10px) scale(1.02);
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.2);
        }

        .note-card:hover::before {
          transform: translateX(0);
        }

        .note-title {
          font-family: 'Oswald', sans-serif;
          font-size: 1.5rem;
          font-weight: 500;
          color: #333;
          margin-bottom: 1rem;
          line-height: 1.3;
          background: linear-gradient(135deg, #667eea, #764ba2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          word-wrap: break-word;
        }

        .note-body {
          color: #666;
          line-height: 1.6;
          font-size: 1rem;
          margin-bottom: 1rem;
          display: -webkit-box;
          -webkit-line-clamp: 4;
          -webkit-box-orient: vertical;
          overflow: hidden;
          word-wrap: break-word;
        }

        .note-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(0, 0, 0, 0.1);
        }

        .action-btn {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.3s ease;
          font-weight: 500;
        }

        .delete-btn {
          background: #e74c3c;
          color: white;
        }

        .delete-btn:hover {
          background: #c0392b;
          transform: translateY(-2px);
        }

        .archive-btn {
          background: #f39c12;
          color: white;
        }

        .archive-btn:hover {
          background: #e67e22;
          transform: translateY(-2px);
        }

        .unarchive-btn {
          background: #27ae60;
          color: white;
        }

        .unarchive-btn:hover {
          background: #229954;
          transform: translateY(-2px);
        }

        .note-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: auto;
          font-size: 0.9rem;
          color: #999;
        }

        .note-date {
          font-style: italic;
        }

        .note-id {
          font-family: monospace;
          font-size: 0.8rem;
        }

        .no-notes {
          text-align: center;
          color: rgba(255, 255, 255, 0.9);
          font-size: 1.2rem;
          padding: 3rem;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          grid-column: 1 / -1;
          animation: fadeIn 0.5s ease-out;
        }

        .no-notes h3 {
          font-family: 'Oswald', sans-serif;
          font-size: 1.8rem;
          margin-bottom: 1rem;
          background: linear-gradient(135deg, #667eea, #764ba2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .highlight {
          background: linear-gradient(135deg, #667eea, #764ba2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: bold;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

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

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 1200px) {
          .notes-grid {
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 1.5rem;
          }
        }

        @media (max-width: 768px) {
          .notes-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
            padding: 0 1rem;
          }
          
          .note-card {
            padding: 1.5rem;
          }
          
          .notes-header {
            flex-direction: column;
            gap: 1rem;
            padding: 1rem;
          }
          
          .view-toggle {
            width: 100%;
            justify-content: center;
          }
        }

        @media (max-width: 480px) {
          .note-card {
            padding: 1rem;
          }
          
          .note-title {
            font-size: 1.3rem;
          }
          
          .note-body {
            font-size: 0.9rem;
          }
          
          .notes-header {
            padding: 0.8rem;
          }
          
          .view-btn {
            padding: 0.4rem 0.8rem;
            font-size: 0.8rem;
          }
        }
      </style>

      <div class="notes-container">
        <div class="notes-header">
          <div class="notes-count" id="notesCount">
            ${this.getNotesCountText()}
          </div>
          <div class="view-toggle">
            <button class="view-btn ${gridColumns === '1' ? 'active' : ''}" data-columns="1">1 Kolom</button>
            <button class="view-btn ${gridColumns === '2' ? 'active' : ''}" data-columns="2">2 Kolom</button>
            <button class="view-btn ${gridColumns === '3' ? 'active' : ''}" data-columns="3">3 Kolom</button>
            <button class="view-btn ${gridColumns === '4' ? 'active' : ''}" data-columns="4">4 Kolom</button>
          </div>
        </div>
        <div class="notes-grid grid-${gridColumns}" id="notesGrid">
          ${this.renderNotes(showDate)}
        </div>
      </div>
    `;
  }

  getNotesCountText() {
    const total = this.notes.length;
    const filtered = this.filteredNotes.length;
    const modeText = this.currentMode === 'archived' ? 'arsip' : 'aktif';
    
    if (this.currentSearchTerm) {
      return `Menampilkan ${filtered} dari ${total} catatan ${modeText}`;
    }
    return `Total ${total} catatan ${modeText}`;
  }

  renderNotes(showDate) {
    if (this.filteredNotes.length === 0) {
      if (this.currentSearchTerm) {
        return `
          <div class="no-notes">
            <h3>Tidak Ditemukan</h3>
            <p>Tidak ada catatan yang cocok dengan pencarian "${this.currentSearchTerm}"</p>
            <p>Coba gunakan kata kunci yang berbeda</p>
          </div>
        `;
      }
      
      const modeText = this.currentMode === 'archived' ? 'arsip' : 'aktif';
      return `
        <div class="no-notes">
          <h3>Belum Ada Catatan ${this.currentMode === 'archived' ? 'Arsip' : 'Aktif'}</h3>
          <p>${this.currentMode === 'archived' 
            ? 'Belum ada catatan yang diarsipkan'
            : 'Buat catatan pertama Anda menggunakan formulir di atas!'
          }</p>
        </div>
      `;
    }

    return this.filteredNotes.map(note => `
      <div class="note-card" data-note-id="${note.id}">
        <h3 class="note-title">${this.highlightText(this.escapeHtml(note.title))}</h3>
        <p class="note-body">${this.highlightText(this.escapeHtml(note.body))}</p>
        <div class="note-actions">
          <button class="action-btn delete-btn" data-action="delete" data-id="${note.id}">
            🗑️ Hapus
          </button>
          ${this.currentMode === 'archived' 
            ? `<button class="action-btn unarchive-btn" data-action="unarchive" data-id="${note.id}">
                📤 Batal Arsip
              </button>`
            : `<button class="action-btn archive-btn" data-action="archive" data-id="${note.id}">
                📁 Arsipkan
              </button>`
          }
        </div>
        ${showDate ? `
          <div class="note-meta">
            <div class="note-date">${this.formatDate(note.createdAt)}</div>
            <div class="note-id">${note.id}</div>
          </div>
        ` : ''}
      </div>
    `).join('');
  }

  highlightText(text) {
    if (!this.currentSearchTerm) return text;
    
    const regex = new RegExp(`(${this.escapeRegex(this.currentSearchTerm)})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
  }

  escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return 'Kemarin';
    } else if (diffDays < 7) {
      return `${diffDays} hari yang lalu`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} minggu yang lalu`;
    } else {
      return date.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  }

  filterNotes(searchTerm) {
    return this.notes.filter(note =>
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.body.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  searchNotes(searchTerm) {
    this.currentSearchTerm = searchTerm;
    
    if (!searchTerm.trim()) {
      this.filteredNotes = [...this.notes];
    } else {
      this.filteredNotes = this.filterNotes(searchTerm);
    }
    
    this.render();
    
    document.dispatchEvent(new CustomEvent('searchResults', {
      detail: { 
        totalResults: this.filteredNotes.length,
        searchTerm: searchTerm.trim()
      }
    }));
  }

  changeGridColumns(columns) {
    this.setAttribute('grid-columns', columns);
  }

  async handleNoteAction(action, noteId) {
    try {
      document.dispatchEvent(new CustomEvent('showLoading', {
        detail: {
          message: `${action === 'delete' ? 'Menghapus' : action === 'archive' ? 'Mengarsipkan' : 'Membatalkan arsip'} catatan...`,
          subtext: 'Mohon tunggu sebentar'
        }
      }));

      let result;
      let successMessage;

      switch (action) {
        case 'delete':
          result = await NotesApi.deleteNote(noteId);
          successMessage = 'Catatan berhasil dihapus!';
          break;
        case 'archive':
          result = await NotesApi.archiveNote(noteId);
          successMessage = 'Catatan berhasil diarsipkan!';
          break;
        case 'unarchive':
          result = await NotesApi.unarchiveNote(noteId);
          successMessage = 'Catatan berhasil dibatalkan dari arsip!';
          break;
      }

      document.dispatchEvent(new CustomEvent('hideLoading'));

      await Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: successMessage,
        timer: 2000,
        showConfirmButton: false,
        confirmButtonColor: '#667eea'
      });

      // Reload notes after action
      await this.loadNotes();

    } catch (error) {
      console.error(`Error ${action} note:`, error);
      document.dispatchEvent(new CustomEvent('hideLoading'));
      
      await Swal.fire({
        icon: 'error',
        title: 'Gagal!',
        text: error.message || `Terjadi kesalahan saat ${action === 'delete' ? 'menghapus' : action === 'archive' ? 'mengarsipkan' : 'membatalkan arsip'} catatan`,
        confirmButtonColor: '#667eea'
      });
    }
  }

  setupEventListeners() {
    // Event listener untuk menambah catatan baru
    document.addEventListener('newNoteAdded', () => {
      this.loadNotes();
    });

    // Event listener untuk pencarian
    document.addEventListener('searchNotes', (e) => {
      this.searchNotes(e.detail.searchTerm);
    });

    // Event listener untuk perubahan mode (active/archived)
    document.addEventListener('modeChanged', (e) => {
      this.currentMode = e.detail.mode;
      this.setAttribute('mode', this.currentMode);
    });

    // Event listener untuk tombol view toggle
    this.shadowRoot.addEventListener('click', (e) => {
      if (e.target.classList.contains('view-btn')) {
        const columns = e.target.dataset.columns;
        this.changeGridColumns(columns);
      }
    });

    // Event listener untuk aksi catatan (delete, archive, unarchive)
    this.shadowRoot.addEventListener('click', async (e) => {
      if (e.target.classList.contains('action-btn')) {
        e.preventDefault();
        e.stopPropagation();
        
        const action = e.target.dataset.action;
        const noteId = e.target.dataset.id;
        
        if (action === 'delete') {
          const result = await Swal.fire({
            title: 'Hapus Catatan?',
            text: 'Catatan yang dihapus tidak dapat dikembalikan!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e74c3c',
            cancelButtonColor: '#95a5a6',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal'
          });

          if (result.isConfirmed) {
            await this.handleNoteAction(action, noteId);
          }
        } else {
          await this.handleNoteAction(action, noteId);
        }
      }
    });
  }
}

customElements.define('notes-list', NotesList);