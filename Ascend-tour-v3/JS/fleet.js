/* ============================================================
   FLEET PAGE — fleet.js
   ============================================================ */

/* ── FILTER SYSTEM ─────────────────────────────────────── */
(function () {
  var filterBtns = document.querySelectorAll('.filter-btn');
  var cards      = document.querySelectorAll('.fcard');
  var countEl    = document.getElementById('vehicleCount');
  var noResults  = document.getElementById('noResults');

  if (!filterBtns.length) return;

  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var filter = this.getAttribute('data-filter');

      // Update active button
      filterBtns.forEach(function (b) { b.classList.remove('active'); });
      this.classList.add('active');

      // Filter cards
      var visible = 0;
      cards.forEach(function (card) {
        var type = card.getAttribute('data-type');
        var show = filter === 'all' || type === filter;
        card.classList.toggle('hidden', !show);
        if (show) {
          visible++;
          // Re-trigger fade-up for visible cards
          card.classList.remove('visible');
          setTimeout(function () { card.classList.add('visible'); }, 50);
        }
      });

      // Update count
      if (countEl) countEl.textContent = visible;

      // Show/hide no results
      if (noResults) {
        noResults.style.display = visible === 0 ? 'block' : 'none';
      }
    });
  });
})();


/* ── RESET FILTER ──────────────────────────────────────── */
function resetFilter() {
  var allBtn = document.querySelector('.filter-btn[data-filter="all"]');
  if (allBtn) allBtn.click();
}


/* ── SET VEHICLE IN FORM ───────────────────────────────── */
function setVehicle(name) {
  var hidden  = document.getElementById('selectedVehicle');
  var select  = document.getElementById('bVehicle');
  var display = document.getElementById('selectedVehicleDisplay');

  if (hidden)  hidden.value  = name;
  if (display) display.textContent = name;

  // Also select in dropdown
  if (select) {
    for (var i = 0; i < select.options.length; i++) {
      if (select.options[i].value === name || select.options[i].text === name) {
        select.selectedIndex = i;
        break;
      }
    }
  }
}


/* ── SYNC DROPDOWN → DISPLAY ───────────────────────────── */
(function () {
  var select  = document.getElementById('bVehicle');
  var display = document.getElementById('selectedVehicleDisplay');
  var hidden  = document.getElementById('selectedVehicle');

  if (!select) return;

  select.addEventListener('change', function () {
    var val = this.value;
    if (display) display.textContent = val || '— Choose from above —';
    if (hidden)  hidden.value = val;
  });
})();


/* ── SET MIN DATE TO TODAY ─────────────────────────────── */
(function () {
  var today = new Date().toISOString().split('T')[0];
  var pickup = document.getElementById('bPickupDate');
  var ret    = document.getElementById('bReturnDate');
  if (pickup) pickup.min = today;
  if (ret)    ret.min    = today;

  // Return date must be >= pickup date
  if (pickup && ret) {
    pickup.addEventListener('change', function () {
      ret.min = this.value;
      if (ret.value && ret.value < this.value) ret.value = this.value;
    });
  }
})();

/* ── BOOKING FORM SUBMIT — handled by forms.js ─────────── */