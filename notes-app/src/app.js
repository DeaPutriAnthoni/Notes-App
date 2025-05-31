import './styles.css';
import './components/loadingIndicator.js';
import './components/addNewNote.js';
import './components/noteList.js';
import './components/searchNote.js';

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('Notes App initialized');

  // Show initial loading
  document.dispatchEvent(
    new CustomEvent('showLoading', {
      detail: {
        message: 'Memuat aplikasi...',
        subtext: 'Menginisialisasi komponen',
      },
    })
  );

  // Initialize archive toggle functionality
  initializeArchiveToggle();

  // Add smooth scroll behavior
  initializeSmoothAnimations();

  // Hide loading after components are ready
  setTimeout(() => {
    document.dispatchEvent(new CustomEvent('hideLoading'));
  }, 1500);
});

function initializeArchiveToggle() {
  const toggleButtons = document.querySelectorAll('.toggle-btn');
  const notesList = document.querySelector('notes-list');

  toggleButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Remove active class from all buttons
      toggleButtons.forEach(btn => btn.classList.remove('active'));

      // Add active class to clicked button
      button.classList.add('active');

      // Get mode and update notes list
      const mode = button.dataset.mode;
      notesList.setAttribute('mode', mode);

      // Dispatch mode change event
      document.dispatchEvent(
        new CustomEvent('modeChanged', {
          detail: { mode },
        })
      );
    });
  });
}

function initializeSmoothAnimations() {
  // Add intersection observer for smooth animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
  };

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  // Observe elements that need animation
  setTimeout(() => {
    const elementsToObserve = document.querySelectorAll(
      'add-new-note, search-bar, notes-list'
    );
    elementsToObserve.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      observer.observe(el);
    });
  }, 100);

  // Add smooth scroll for any anchor links
  document.addEventListener('click', e => {
    if (e.target.tagName === 'A' && e.target.getAttribute('href')?.startsWith('#')) {
      e.preventDefault();
      const targetId = e.target.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    }
  });
}

// Handle global errors
window.addEventListener('error', event => {
  console.error('Global error:', event.error);
  document.dispatchEvent(new CustomEvent('hideLoading'));
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', event => {
  console.error('Unhandled promise rejection:', event.reason);
  document.dispatchEvent(new CustomEvent('hideLoading'));
});