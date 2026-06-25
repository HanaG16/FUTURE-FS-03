/* ============================================================
   ASCEND — Forms.js   (Supabase backend)
   ============================================================ */

var SUPABASE_URL  = 'https://vnxdlwfguobtogmphyio.supabase.co';
var SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZueGRsd2ZndW9idG9nbXBoeWlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxNzA3MjYsImV4cCI6MjA5Nzc0NjcyNn0.gNewGYvlaIyFazWe4vHn72alEn5yEPUqxh7QvqQkZcw';

/* ── SAVE a new submission to Supabase ─────────────────────
   One single INSERT — no read-then-write needed.
   The anon key can only INSERT (not read/update/delete)
   thanks to Row Level Security on the server.
──────────────────────────────────────────────────────────── */
function saveSubmission(type, data, onSuccess, onError) {
  fetch(SUPABASE_URL + '/rest/v1/submissions', {
    method: 'POST',
    headers: {
      'apikey':        SUPABASE_ANON,
      'Authorization': 'Bearer ' + SUPABASE_ANON,
      'Content-Type':  'application/json',
      'Prefer':        'return=minimal'
    },
    body: JSON.stringify({
      type:   type,    // 'booking' or 'quote'
      status: 'new',
      data:   data     // all form fields as an object
    })
  })
  .then(function(r) {
    if (!r.ok) throw new Error('Supabase error: ' + r.status);
    onSuccess && onSuccess();
  })
  .catch(function(err) {
    console.error('Submission error:', err);
    onError && onError(err);
  });
}

/* ── VALIDATE ──────────────────────────────────────────── */
function validateForm(form) {
  var valid = true;
  var firstInvalid = null;

  form.querySelectorAll('[required]').forEach(function(f) {
    f.style.borderColor = '';
    var empty = (f.tagName === 'SELECT') ? (f.value === '' || f.value == null) : !f.value.trim();
    if (empty) {
      valid = false;
      f.style.borderColor = '#e74c3c';
      if (!firstInvalid) firstInvalid = f;
      f.addEventListener('input',  function() { f.style.borderColor = ''; }, { once: true });
      f.addEventListener('change', function() { f.style.borderColor = ''; }, { once: true });
    }
  });

  if (!valid && firstInvalid) {
    firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
    firstInvalid.focus();
    showInlineWarning(form);
  }

  return valid;
}

/* ── Inline warning banner ─────────────────────────────── */
function showInlineWarning(form) {
  var existing = form.querySelector('.form-warning-banner');
  if (existing) return;

  var banner = document.createElement('div');
  banner.className = 'form-warning-banner';
  banner.style.cssText = 'background:#fdecea;color:#c0392b;border:1px solid #e74c3c;' +
    'border-radius:8px;padding:10px 14px;margin-bottom:14px;font-size:0.92rem;' +
    'display:flex;align-items:center;gap:8px;';
  banner.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Please fill in all required fields (marked *) before submitting.';
  form.insertBefore(banner, form.firstChild);

  setTimeout(function() {
    if (banner.parentNode) banner.parentNode.removeChild(banner);
  }, 5000);
}

/* ── BUTTON STATE ──────────────────────────────────────── */
function setBtn(btn, state, text) {
  if (!btn) return;
  if (state === 'loading') {
    btn.disabled  = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';
    btn.style.cssText = '';
  } else if (state === 'success') {
    btn.disabled  = false;
    btn.innerHTML = text || '<i class="fa-solid fa-check"></i> Submitted!';
    btn.style.background  = '#27ae60';
    btn.style.borderColor = '#27ae60';
    btn.style.color       = '#fff';
  } else if (state === 'error') {
    btn.disabled  = false;
    btn.innerHTML = text || '<i class="fa-solid fa-triangle-exclamation"></i> Failed — Try Again';
    btn.style.background  = '#e74c3c';
    btn.style.borderColor = '#e74c3c';
    btn.style.color       = '#fff';
  } else {
    btn.disabled  = false;
    btn.style.cssText = '';
  }
}

function resetBtn(btn, html) {
  setTimeout(function() {
    setBtn(btn, 'reset');
    btn.innerHTML = html;
  }, 4000);
}

/* ══════════════════════════════════════════════
   QUOTE FORM  — index.html  #contactForm
══════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', function() {

  var qForm = document.getElementById('contactForm');
  var qBtn  = document.getElementById('submitBtn');
  if (qForm) {
    qForm.addEventListener('submit', function(e) {
      e.preventDefault();
      e.stopPropagation();
      if (!validateForm(qForm)) return;

      var data = {
        firstName:  (document.getElementById('q_firstName')  || {}).value || '',
        lastName:   (document.getElementById('q_lastName')   || {}).value || '',
        email:      (document.getElementById('q_email')      || {}).value || '',
        phone:      (document.getElementById('q_phone')      || {}).value || '',
        service:    (document.getElementById('q_service')    || {}).value || '',
        travelDate: (document.getElementById('q_travelDate') || {}).value || '',
        groupSize:  (document.getElementById('q_groupSize')  || {}).value || '',
        message:    (document.getElementById('q_message')    || {}).value || ''
      };

      setBtn(qBtn, 'loading');
      saveSubmission('quote', data,
        function() {
          setBtn(qBtn, 'success', '<i class="fa-solid fa-check"></i> Request Sent!');
          qForm.reset();
          resetBtn(qBtn, 'Send Inquiry <i class="fa-solid fa-paper-plane"></i>');
        },
        function() {
          setBtn(qBtn, 'error');
          resetBtn(qBtn, 'Send Inquiry <i class="fa-solid fa-paper-plane"></i>');
        }
      );
    });
  }

  /* ══════════════════════════════════════════════
     FLEET BOOKING FORM  — fleet.html  #fleetBookingForm
  ══════════════════════════════════════════════ */
  var bForm = document.getElementById('fleetBookingForm');
  var bBtn  = document.getElementById('bSubmitBtn');
  if (bForm) {
    bForm.addEventListener('submit', function(e) {
      e.preventDefault();
      e.stopPropagation();
      if (!validateForm(bForm)) return;

      var driveEl = bForm.querySelector('[name="driveOption"]:checked');
      var data = {
        firstName:      (document.getElementById('bFirstName')     || {}).value || '',
        lastName:       (document.getElementById('bLastName')       || {}).value || '',
        phone:          (document.getElementById('bPhone')          || {}).value || '',
        email:          (document.getElementById('bEmail')          || {}).value || '',
        vehicle:        (document.getElementById('bVehicle')        || {}).value || '',
        driveOption:    driveEl ? driveEl.value : '',
        pickupDate:     (document.getElementById('bPickupDate')     || {}).value || '',
        returnDate:     (document.getElementById('bReturnDate')     || {}).value || '',
        pickupLocation: (document.getElementById('bPickupLocation') || {}).value || '',
        notes:          (bForm.querySelector('textarea')             || {}).value || ''
      };

      setBtn(bBtn, 'loading');
      saveSubmission('booking', data,
        function() {
          setBtn(bBtn, 'success', '<i class="fa-solid fa-check"></i> Booking Sent!');
          bForm.reset();
          var display = document.getElementById('selectedVehicleDisplay');
          if (display) display.textContent = '— Choose from above —';
          resetBtn(bBtn, 'Send Booking Request <i class="fa-solid fa-paper-plane"></i>');
        },
        function() {
          setBtn(bBtn, 'error');
          resetBtn(bBtn, 'Send Booking Request <i class="fa-solid fa-paper-plane"></i>');
        }
      );
    });
  }

});
