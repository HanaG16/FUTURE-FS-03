/* ============================================================
   ASCEND — Forms.js   (JSONBin.io — single PUT per submit)
   ============================================================ */

var JSONBIN_BIN_ID  = '6a2b407bf5f4af5e29e2e86a';
var JSONBIN_API_KEY = '$2a$10$1lnq9.VdrdelJYhaiT2ON.9DDk96pPL.3WshQXlnWFf47wm9MmD8u';
var JSONBIN_BASE    = 'https://api.jsonbin.io/v3/b/' + JSONBIN_BIN_ID;

/* ── FETCH with timeout ────────────────────────────────── */
function fetchWithTimeout(url, options, ms) {
  ms = ms || 10000;
  var controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  var timer = controller
    ? setTimeout(function() { controller.abort(); }, ms)
    : null;
  var opts = controller
    ? Object.assign({}, options, { signal: controller.signal })
    : options;
  return fetch(url, opts).finally(function() { if (timer) clearTimeout(timer); });
}

/* ── READ current bin ──────────────────────────────────── */
function readBin() {
  return fetchWithTimeout(JSONBIN_BASE + '/latest', {
    headers: { 'X-Master-Key': JSONBIN_API_KEY }
  }).then(function(r) {
    if (!r.ok) throw new Error('Read failed: ' + r.status);
    return r.json();
  }).then(function(res) {
    var subs = res && res.record && Array.isArray(res.record.submissions)
      ? res.record.submissions : [];
    return subs;
  });
}

/* ── WRITE full list back ──────────────────────────────── */
function writeBin(list) {
  return fetchWithTimeout(JSONBIN_BASE, {
    method: 'PUT',
    headers: {
      'Content-Type':     'application/json',
      'X-Master-Key':     JSONBIN_API_KEY,
      'X-Bin-Versioning': 'false'
    },
    body: JSON.stringify({ submissions: list })
  }).then(function(r) {
    if (!r.ok) throw new Error('Write failed: ' + r.status);
    return r.json();
  });
}

/* ── SAVE a new submission ─────────────────────────────── */
function saveSubmission(type, data, onSuccess, onError) {
  var entry = {
    id:        Date.now(),
    type:      type,
    status:    'new',
    timestamp: new Date().toISOString(),
    data:      data
  };

  readBin()
    .then(function(list) {
      list.unshift(entry);
      return writeBin(list);
    })
    .then(function() {
      onSuccess && onSuccess();
    })
    .catch(function(err) {
      console.error('JSONBin error:', err);
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
      f.addEventListener('input', function() { f.style.borderColor = ''; }, { once: true });
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
  if (existing) return; // already showing

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
        firstName:      (document.getElementById('bFirstName')      || {}).value || '',
        lastName:       (document.getElementById('bLastName')        || {}).value || '',
        phone:          (document.getElementById('bPhone')           || {}).value || '',
        email:          (document.getElementById('bEmail')           || {}).value || '',
        vehicle:        (document.getElementById('bVehicle')         || {}).value || '',
        driveOption:    driveEl ? driveEl.value : '',
        pickupDate:     (document.getElementById('bPickupDate')      || {}).value || '',
        returnDate:     (document.getElementById('bReturnDate')      || {}).value || '',
        pickupLocation: (document.getElementById('bPickupLocation')  || {}).value || '',
        notes:          (bForm.querySelector('textarea')              || {}).value || ''
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