/**
 * TEAR-OFF CALENDAR • SKEUOMORPHIC JAVASCRIPT
 * Handles real-time date management, calendar progression, Web Audio paper-tear
 * sound synthesis, local personal notes storage, and full keyboard accessibility.
 */

(function () {
  'use strict';

  /* --------------------------------------------------------------------------
     1. Constants and DOM References
     -------------------------------------------------------------------------- */
  const STORAGE_NOTE_PREFIX = 'calendar-note-';
  const STORAGE_MUTE_KEY = 'calendar-sound-muted';

  // Default uplifting vintage quotes when no user note exists
  const DEFAULT_QUOTES = [
    'Make today count.',
    'Every moment is a fresh beginning.',
    'Small steps every day.',
    'Create your own sunshine.',
    'Do what you love today.',
    'Focus on the journey.',
    'Today is full of possibilities.',
    'A quiet mind achieves wonders.',
    'Courage starts with showing up.',
    'Enjoy the little things today.'
  ];

  // DOM Elements
  const activeSheet = document.getElementById('active-sheet');
  const underSheet = document.getElementById('under-sheet');
  const activeWeekday = document.getElementById('active-weekday');
  const activeDay = document.getElementById('active-day');
  const activeMonthYear = document.getElementById('active-month-year');
  const activeNoteText = document.getElementById('active-note-text');
  const noteTrigger = document.getElementById('note-trigger');

  const underWeekday = document.getElementById('under-weekday');
  const underDay = document.getElementById('under-day');
  const underMonthYear = document.getElementById('under-month-year');
  const underNoteText = document.getElementById('under-note-text');

  const soundToggleBtn = document.getElementById('sound-toggle');
  const soundIcon = document.getElementById('sound-icon');
  const soundLabel = document.getElementById('sound-label');
  const resetBtn = document.getElementById('reset-btn');
  const srAnnouncements = document.getElementById('sr-announcements');

  // Dialog Elements
  const noteDialog = document.getElementById('note-dialog');
  const noteForm = document.getElementById('note-form');
  const noteTextarea = document.getElementById('note-textarea');
  const charCount = document.getElementById('char-count');
  const dialogDateSubtitle = document.getElementById('dialog-date-subtitle');
  const saveNoteBtn = document.getElementById('save-note-btn');
  const clearNoteBtn = document.getElementById('clear-note-btn');
  const cancelNoteBtn = document.getElementById('cancel-note-btn');

  /* --------------------------------------------------------------------------
     2. Application State
     -------------------------------------------------------------------------- */
  let currentDate = new Date();
  let isTearing = false;
  let isMuted = loadMuteState();

  // Web Audio Context (lazy-loaded on first user interaction)
  let audioCtx = null;

  /* --------------------------------------------------------------------------
     3. Date Helpers & Formatting
     -------------------------------------------------------------------------- */
  const WEEKDAYS = [
    'SUNDAY',
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY'
  ];

  const MONTHS = [
    'JANUARY',
    'FEBRUARY',
    'MARCH',
    'APRIL',
    'MAY',
    'JUNE',
    'JULY',
    'AUGUST',
    'SEPTEMBER',
    'OCTOBER',
    'NOVEMBER',
    'DECEMBER'
  ];

  /**
   * Formats a date object into YYYY-MM-DD format for storage keys
   * @param {Date} date
   * @returns {string}
   */
  function formatDateKey(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  /**
   * Generates a date object offset by +N days from a given date
   * @param {Date} date
   * @param {number} days
   * @returns {Date}
   */
  function getOffsetDate(date, days) {
    const next = new Date(date.getTime());
    next.setDate(next.getDate() + days);
    return next;
  }

  /**
   * Returns a deterministic default quote based on date if no personal note
   * @param {Date} date
   * @returns {string}
   */
  function getDefaultQuote(date) {
    const dayOfYear = Math.floor(
      (date - new Date(date.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24
    );
    return DEFAULT_QUOTES[Math.abs(dayOfYear) % DEFAULT_QUOTES.length];
  }

  /* --------------------------------------------------------------------------
     4. Safe Local Storage Management
     -------------------------------------------------------------------------- */
  function getStoredNote(date) {
    const key = STORAGE_NOTE_PREFIX + formatDateKey(date);
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn('localStorage is unavailable:', e);
      return null;
    }
  }

  function saveStoredNote(date, text) {
    const key = STORAGE_NOTE_PREFIX + formatDateKey(date);
    try {
      if (text && text.trim().length > 0) {
        localStorage.setItem(key, text.trim());
      } else {
        localStorage.removeItem(key);
      }
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
  }

  function removeStoredNote(date) {
    const key = STORAGE_NOTE_PREFIX + formatDateKey(date);
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn('Failed to remove from localStorage:', e);
    }
  }

  function loadMuteState() {
    try {
      const stored = localStorage.getItem(STORAGE_MUTE_KEY);
      return stored === 'true';
    } catch (e) {
      return false;
    }
  }

  function saveMuteState(muted) {
    try {
      localStorage.setItem(STORAGE_MUTE_KEY, String(muted));
    } catch (e) {
      console.warn('Could not save mute state:', e);
    }
  }

  /* --------------------------------------------------------------------------
     5. Web Audio API Paper-Tear Sound Synthesizer
     -------------------------------------------------------------------------- */
  function getAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  /**
   * Generates a realistic paper-tearing audio burst using Web Audio API
   * Simulates perforation resistance, fiber snaps, and friction scrape
   */
  function playPaperTearSound() {
    if (isMuted) return;

    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const duration = 0.35; // 350ms tearing sound
      const sampleRate = ctx.sampleRate;
      const bufferSize = Math.floor(sampleRate * duration);
      const buffer = ctx.createBuffer(1, bufferSize, sampleRate);
      const data = buffer.getChannelData(0);

      // Generate stochastic textured noise with micro burst pops (fibers snapping)
      for (let i = 0; i < bufferSize; i++) {
        const t = i / bufferSize;
        // Base white noise
        let sample = Math.random() * 2 - 1;

        // Modulate with randomized pops along perforation teeth
        const pop = Math.sin(t * 80 * Math.PI) * (Math.random() > 0.7 ? 1.6 : 0.8);
        data[i] = sample * 0.7 + pop * 0.3;
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = buffer;

      // Bandpass filter to isolate paper crispness
      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.setValueAtTime(2200, ctx.currentTime);
      bandpass.Q.setValueAtTime(1.8, ctx.currentTime);

      // Highpass filter to eliminate unnatural low thuds
      const highpass = ctx.createBiquadFilter();
      highpass.type = 'highpass';
      highpass.frequency.setValueAtTime(900, ctx.currentTime);

      // Dynamic gain envelope modeling the rip action
      const gainNode = ctx.createGain();
      const now = ctx.currentTime;
      gainNode.gain.setValueAtTime(0.001, now);
      // Fast attack (initial paper puncture/pull)
      gainNode.gain.linearRampToValueAtTime(0.38, now + 0.025);
      // Rapid flutter while tearing through perforations
      gainNode.gain.linearRampToValueAtTime(0.22, now + 0.08);
      gainNode.gain.linearRampToValueAtTime(0.42, now + 0.14);
      gainNode.gain.linearRampToValueAtTime(0.18, now + 0.22);
      // Smooth decay as sheet releases completely
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

      // Connect nodes
      noiseSource.connect(bandpass);
      bandpass.connect(highpass);
      highpass.connect(gainNode);
      gainNode.connect(ctx.destination);

      noiseSource.start(now);
      noiseSource.stop(now + duration);
    } catch (e) {
      console.warn('Audio playback not supported or blocked:', e);
    }
  }

  /* --------------------------------------------------------------------------
     6. Rendering Date to Sheets
     -------------------------------------------------------------------------- */
  /**
   * Safely updates text content on sheet DOM nodes without innerHTML
   */
  function renderSheet(date, weekdayEl, dayEl, monthYearEl, noteEl) {
    weekdayEl.textContent = WEEKDAYS[date.getDay()];
    dayEl.textContent = date.getDate();
    monthYearEl.textContent = `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;

    const savedNote = getStoredNote(date);
    if (savedNote && savedNote.trim().length > 0) {
      noteEl.textContent = `“${savedNote}”`;
    } else {
      noteEl.textContent = getDefaultQuote(date);
    }
  }

  /**
   * Refreshes both active sheet and underlying next-day sheet
   */
  function updateCalendarDisplay() {
    renderSheet(currentDate, activeWeekday, activeDay, activeMonthYear, activeNoteText);

    // Prepare next day immediately underneath
    const nextDate = getOffsetDate(currentDate, 1);
    renderSheet(nextDate, underWeekday, underDay, underMonthYear, underNoteText);

    // Update accessibility label
    const fullDateText = `${WEEKDAYS[currentDate.getDay()]}, ${MONTHS[currentDate.getMonth()]} ${currentDate.getDate()}, ${currentDate.getFullYear()}`;
    activeSheet.setAttribute(
      'aria-label',
      `Current date: ${fullDateText}. Click or press Enter to tear off this day.`
    );
  }

  function announceToScreenReader(message) {
    if (srAnnouncements) {
      srAnnouncements.textContent = '';
      setTimeout(() => {
        srAnnouncements.textContent = message;
      }, 50);
    }
  }

  /* --------------------------------------------------------------------------
     7. Tear-off Interaction & Animation
     -------------------------------------------------------------------------- */
  function tearOffPage() {
    if (isTearing) return;

    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    isTearing = true;

    // Play synthesized tear sound
    playPaperTearSound();

    if (prefersReducedMotion) {
      // Immediate switch without 3D animation
      currentDate.setDate(currentDate.getDate() + 1);
      updateCalendarDisplay();
      announceToScreenReader(
        `Torn off. New date: ${MONTHS[currentDate.getMonth()]} ${currentDate.getDate()}, ${currentDate.getFullYear()}`
      );
      isTearing = false;
      return;
    }

    // Add 3D tearing animation class
    activeSheet.classList.add('tearing');

    const handleAnimationEnd = () => {
      activeSheet.removeEventListener('animationend', handleAnimationEnd);
      activeSheet.classList.remove('tearing');

      // Advance date by exactly 1 calendar day
      currentDate.setDate(currentDate.getDate() + 1);

      // Re-render sheets with updated date
      updateCalendarDisplay();

      announceToScreenReader(
        `Torn off. New date: ${MONTHS[currentDate.getMonth()]} ${currentDate.getDate()}, ${currentDate.getFullYear()}`
      );

      isTearing = false;
    };

    activeSheet.addEventListener('animationend', handleAnimationEnd, { once: true });

    // Fallback timer in case animationend fails to fire in background tab
    setTimeout(() => {
      if (isTearing) {
        handleAnimationEnd();
      }
    }, 1000);
  }

  /* --------------------------------------------------------------------------
     8. Reset to Today
     -------------------------------------------------------------------------- */
  function resetToToday() {
    if (isTearing) return;
    currentDate = new Date();
    updateCalendarDisplay();
    announceToScreenReader('Calendar reset to today’s date.');
  }

  /* --------------------------------------------------------------------------
     9. Sound Toggle Handling
     -------------------------------------------------------------------------- */
  function updateSoundUI() {
    if (isMuted) {
      soundToggleBtn.setAttribute('aria-pressed', 'false');
      soundToggleBtn.setAttribute('aria-label', 'Sound effects: Off');
      soundIcon.textContent = '🔇';
      soundLabel.textContent = 'Sound OFF';
    } else {
      soundToggleBtn.setAttribute('aria-pressed', 'true');
      soundToggleBtn.setAttribute('aria-label', 'Sound effects: On');
      soundIcon.textContent = '🔊';
      soundLabel.textContent = 'Sound ON';
    }
  }

  function toggleSound() {
    isMuted = !isMuted;
    saveMuteState(isMuted);
    updateSoundUI();
    // Warm up AudioContext on un-mute user click
    if (!isMuted) {
      getAudioContext();
    }
  }

  /* --------------------------------------------------------------------------
     10. Personal Note Modal Dialog
     -------------------------------------------------------------------------- */
  function openNoteDialog() {
    if (isTearing) return;

    const formattedSubtitle = `${MONTHS[currentDate.getMonth()]} ${currentDate.getDate()}, ${currentDate.getFullYear()}`;
    dialogDateSubtitle.textContent = formattedSubtitle;

    const existingNote = getStoredNote(currentDate) || '';
    noteTextarea.value = existingNote;
    charCount.textContent = existingNote.length;

    if (typeof noteDialog.showModal === 'function') {
      noteDialog.showModal();
    } else {
      // Fallback for older browsers without HTML5 dialog element
      noteDialog.setAttribute('open', '');
    }

    noteTextarea.focus();
  }

  function closeNoteDialog() {
    if (typeof noteDialog.close === 'function') {
      noteDialog.close();
    } else {
      noteDialog.removeAttribute('open');
    }
    // Return focus to note trigger
    noteTrigger.focus();
  }

  function saveCurrentNote() {
    const text = noteTextarea.value;
    saveStoredNote(currentDate, text);
    updateCalendarDisplay();
    closeNoteDialog();
    announceToScreenReader('Note saved successfully.');
  }

  function clearCurrentNote() {
    removeStoredNote(currentDate);
    updateCalendarDisplay();
    closeNoteDialog();
    announceToScreenReader('Note cleared.');
  }

  /* --------------------------------------------------------------------------
     11. Event Listeners & Initializations
     -------------------------------------------------------------------------- */
  // Page Tear Click & Keyboard triggers
  activeSheet.addEventListener('click', (e) => {
    // Prevent tearing if the user clicked inside the note section
    if (e.target.closest('#note-trigger')) return;
    tearOffPage();
  });

  activeSheet.addEventListener('keydown', (e) => {
    if (e.target === activeSheet && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      tearOffPage();
    }
  });

  // Note Section Click & Keyboard triggers
  noteTrigger.addEventListener('click', (e) => {
    e.stopPropagation();
    openNoteDialog();
  });

  noteTrigger.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      openNoteDialog();
    }
  });

  // Dialog Form Handlers
  noteForm.addEventListener('submit', (e) => {
    e.preventDefault();
    saveCurrentNote();
  });

  clearNoteBtn.addEventListener('click', (e) => {
    e.preventDefault();
    clearCurrentNote();
  });

  cancelNoteBtn.addEventListener('click', (e) => {
    e.preventDefault();
    closeNoteDialog();
  });

  noteTextarea.addEventListener('input', () => {
    charCount.textContent = noteTextarea.value.length;
  });

  // Close dialog on backdrop click
  noteDialog.addEventListener('click', (e) => {
    const rect = noteDialog.getBoundingClientRect();
    const isInDialog = (
      rect.top <= e.clientY &&
      e.clientY <= rect.top + rect.height &&
      rect.left <= e.clientX &&
      e.clientX <= rect.left + rect.width
    );
    if (!isInDialog) {
      closeNoteDialog();
    }
  });

  // Header Controls
  soundToggleBtn.addEventListener('click', toggleSound);
  resetBtn.addEventListener('click', resetToToday);

  // Initialize display and sound state on load
  updateCalendarDisplay();
  updateSoundUI();

})();
