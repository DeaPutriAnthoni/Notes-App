import notesData from '../components/notesData.js';

const BASE_URL = 'https://notes-api.dicoding.dev/v2';

class NotesApi {
  static STORAGE_KEY = 'notes-app-data';
  
  // Flag untuk menentukan apakah menggunakan data lokal atau API
  static USE_LOCAL_DATA = false;

  // Helper method untuk handling response
  static async handleResponse(response) {
    let responseJson;
    
    try {
      responseJson = await response.json();
    } catch (error) {
      throw new Error('Server tidak merespons dengan format JSON yang valid');
    }

    if (!response.ok) {
      // Handle different HTTP status codes
      switch (response.status) {
        case 400:
          throw new Error(responseJson.message || 'Data yang dikirim tidak valid');
        case 404:
          throw new Error(responseJson.message || 'Catatan tidak ditemukan');
        case 500:
          throw new Error(responseJson.message || 'Terjadi kesalahan pada server');
        default:
          throw new Error(responseJson.message || `HTTP Error: ${response.status}`);
      }
    }

    return responseJson;
  }

  // Helper method untuk mengelola data lokal
  static getLocalNotes() {
    // Mengembalikan copy dari notesData untuk menghindari mutasi langsung
    return JSON.parse(JSON.stringify(notesData));
  }

  // Helper method untuk generate ID baru
  static generateId() {
    return `notes-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  static async getAllNotes() {
    if (this.USE_LOCAL_DATA) {
      try {
        // Simulasi async operation dengan delay kecil
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const localNotes = this.getLocalNotes();
        // Filter hanya catatan yang tidak diarsipkan
        return localNotes.filter(note => !note.archived);
      } catch (error) {
        console.error('Error getting local notes:', error);
        throw new Error('Gagal memuat catatan lokal');
      }
    }

    // Fallback ke API eksternal
    try {
      const response = await fetch(`${BASE_URL}/notes`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      const responseJson = await this.handleResponse(response);
      return responseJson.data;
    } catch (error) {
      console.error('Error fetching notes:', error);
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
      }
      
      throw error;
    }
  }

  static async getArchivedNotes() {
    if (this.USE_LOCAL_DATA) {
      try {
        // Simulasi async operation dengan delay kecil
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const localNotes = this.getLocalNotes();
        // Filter hanya catatan yang diarsipkan
        return localNotes.filter(note => note.archived);
      } catch (error) {
        console.error('Error getting local archived notes:', error);
        throw new Error('Gagal memuat catatan arsip lokal');
      }
    }

    // Fallback ke API eksternal
    try {
      const response = await fetch(`${BASE_URL}/notes/archived`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      const responseJson = await this.handleResponse(response);
      return responseJson.data;
    } catch (error) {
      console.error('Error fetching archived notes:', error);
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
      }
      
      throw error;
    }
  }

  static async getNoteById(id) {
    if (this.USE_LOCAL_DATA) {
      try {
        if (!id) {
          throw new Error('ID catatan tidak boleh kosong');
        }

        // Simulasi async operation dengan delay kecil
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const localNotes = this.getLocalNotes();
        const note = localNotes.find(note => note.id === id);
        
        if (!note) {
          throw new Error('Catatan tidak ditemukan');
        }
        
        return note;
      } catch (error) {
        console.error('Error getting local note by id:', error);
        throw error;
      }
    }

    // Fallback ke API eksternal
    try {
      if (!id) {
        throw new Error('ID catatan tidak boleh kosong');
      }

      const response = await fetch(`${BASE_URL}/notes/${id}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      const responseJson = await this.handleResponse(response);
      return responseJson.data;
    } catch (error) {
      console.error('Error fetching note:', error);
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
      }
      
      throw error;
    }
  }

  static async createNote(note) {
    if (this.USE_LOCAL_DATA) {
      try {
        // Validasi input
        if (!note || !note.title || !note.body) {
          throw new Error('Judul dan isi catatan harus diisi');
        }

        if (note.title.trim().length === 0) {
          throw new Error('Judul catatan tidak boleh kosong');
        }

        if (note.body.trim().length === 0) {
          throw new Error('Isi catatan tidak boleh kosong');
        }

        // Simulasi async operation dengan delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Buat catatan baru
        const newNote = {
          id: this.generateId(),
          title: note.title.trim(),
          body: note.body.trim(),
          createdAt: new Date().toISOString(),
          archived: false
        };

        // Tambahkan ke array notesData (dalam memori)
        notesData.unshift(newNote);

        return newNote;
      } catch (error) {
        console.error('Error creating local note:', error);
        throw error;
      }
    }

    // Fallback ke API eksternal
    try {
      // Validasi input
      if (!note || !note.title || !note.body) {
        throw new Error('Judul dan isi catatan harus diisi');
      }

      if (note.title.trim().length === 0) {
        throw new Error('Judul catatan tidak boleh kosong');
      }

      if (note.body.trim().length === 0) {
        throw new Error('Isi catatan tidak boleh kosong');
      }

      const response = await fetch(`${BASE_URL}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          title: note.title.trim(),
          body: note.body.trim()
        }),
      });

      const responseJson = await this.handleResponse(response);
      return responseJson.data;
    } catch (error) {
      console.error('Error creating note:', error);
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
      }
      
      throw error;
    }
  }

  static async deleteNote(id) {
    if (this.USE_LOCAL_DATA) {
      try {
        if (!id) {
          throw new Error('ID catatan tidak boleh kosong');
        }

        // Simulasi async operation dengan delay
        await new Promise(resolve => setTimeout(resolve, 300));

        // Cari index catatan yang akan dihapus
        const noteIndex = notesData.findIndex(note => note.id === id);
        
        if (noteIndex === -1) {
          throw new Error('Catatan tidak ditemukan');
        }

        // Hapus catatan dari array
        notesData.splice(noteIndex, 1);

        return 'Catatan berhasil dihapus';
      } catch (error) {
        console.error('Error deleting local note:', error);
        throw error;
      }
    }

    // Fallback ke API eksternal
    try {
      if (!id) {
        throw new Error('ID catatan tidak boleh kosong');
      }

      const response = await fetch(`${BASE_URL}/notes/${id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
        }
      });

      const responseJson = await this.handleResponse(response);
      return responseJson.message;
    } catch (error) {
      console.error('Error deleting note:', error);
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
      }
      
      throw error;
    }
  }

  static async archiveNote(id) {
    if (this.USE_LOCAL_DATA) {
      try {
        if (!id) {
          throw new Error('ID catatan tidak boleh kosong');
        }

        // Simulasi async operation dengan delay
        await new Promise(resolve => setTimeout(resolve, 300));

        // Cari catatan yang akan diarsipkan
        const note = notesData.find(note => note.id === id);
        
        if (!note) {
          throw new Error('Catatan tidak ditemukan');
        }

        if (note.archived) {
          throw new Error('Catatan sudah diarsipkan');
        }

        // Arsipkan catatan
        note.archived = true;

        return 'Catatan berhasil diarsipkan';
      } catch (error) {
        console.error('Error archiving local note:', error);
        throw error;
      }
    }

    // Fallback ke API eksternal
    try {
      if (!id) {
        throw new Error('ID catatan tidak boleh kosong');
      }

      const response = await fetch(`${BASE_URL}/notes/${id}/archive`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        }
      });

      const responseJson = await this.handleResponse(response);
      return responseJson.message;
    } catch (error) {
      console.error('Error archiving note:', error);
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
      }
      
      throw error;
    }
  }

  static async unarchiveNote(id) {
    if (this.USE_LOCAL_DATA) {
      try {
        if (!id) {
          throw new Error('ID catatan tidak boleh kosong');
        }

        // Simulasi async operation dengan delay
        await new Promise(resolve => setTimeout(resolve, 300));

        // Cari catatan yang akan dibatalkan arsipnya
        const note = notesData.find(note => note.id === id);
        
        if (!note) {
          throw new Error('Catatan tidak ditemukan');
        }

        if (!note.archived) {
          throw new Error('Catatan tidak sedang diarsipkan');
        }

        // Batalkan arsip catatan
        note.archived = false;

        return 'Catatan berhasil dibatalkan dari arsip';
      } catch (error) {
        console.error('Error unarchiving local note:', error);
        throw error;
      }
    }

    // Fallback ke API eksternal
    try {
      if (!id) {
        throw new Error('ID catatan tidak boleh kosong');
      }

      const response = await fetch(`${BASE_URL}/notes/${id}/unarchive`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        }
      });

      const responseJson = await this.handleResponse(response);
      return responseJson.message;
    } catch (error) {
      console.error('Error unarchiving note:', error);
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
      }
      
      throw error;
    }
  }

  // Utility method untuk check koneksi
  static async checkConnection() {
    if (this.USE_LOCAL_DATA) {
      return true; // Selalu true untuk data lokal
    }

    try {
      const response = await fetch(`${BASE_URL}/notes`, {
        method: 'HEAD',
        timeout: 5000
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  // Method untuk toggle antara mode lokal dan API
  static toggleDataSource() {
    this.USE_LOCAL_DATA = !this.USE_LOCAL_DATA;
    console.log(`Data source changed to: ${this.USE_LOCAL_DATA ? 'Local' : 'API'}`);
    return this.USE_LOCAL_DATA;
  }

  // Method untuk mendapatkan status data source
  static getDataSource() {
    return this.USE_LOCAL_DATA ? 'Local' : 'API';
  }
}

export default NotesApi;