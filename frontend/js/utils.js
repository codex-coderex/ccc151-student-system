// utility functions

// dom helpers
function el(id) { return document.getElementById(id); }
function val(id) { return el(id).value.trim(); }
function setVal(id, v) { el(id).value = v || ''; }

// error display
function showErr(field, msg) {
  var e = el('err-' + field);
  if (e) { e.textContent = msg; e.classList.add('show'); }
}

function clearErrors(modalType) {
  document.querySelectorAll('#modal-' + modalType + ' .error').forEach(function(e) {
    e.textContent = ''; e.classList.remove('show');
  });
}

// toast container
function toast(msg, type) {
  var t = document.createElement('div');
  t.className = 'toast' + (type === 'error' ? ' error' : '');
  t.textContent = msg;
  el('toast-container').appendChild(t);
  setTimeout(function() {
    t.style.opacity = '0';
    t.style.transform = 'translateX(16px)';
    setTimeout(function() { t.remove(); }, 300);
  }, 2800);
}

// validation functions
function validateStudentID(id) {
  if (!id) return 'Student ID is required';
  if (!/^\d{4}-\d{4}$/.test(id)) return 'Student ID must be in YYYY-NNNN format (e.g. 2024-0001)';
  return null;
}

function validateName(name, field) {
  if (!name) return field + ' is required';
  if (name.length > 64) return field + ' must be 64 characters or fewer';
  if (!/^[a-zA-Z\s\-'.]+$/.test(name)) return field + ' contains invalid characters';
  return null;
}

function validateCode(code, field) {
  if (!code) return field + ' is required';
  if (code.length > 16) return field + ' must be 16 characters or fewer';
  if (!/^[A-Za-z0-9\-]+$/.test(code)) return field + ' must only contain letters, numbers, or hyphens only';
  return null;
}

function validateLabel(name, field, maxLen) {
  if (!name) return field + ' is required';
  if (name.length > (maxLen || 128)) return field + ' must be ' + (maxLen || 128) + ' characters or fewer';
  if (!/^[a-zA-Z\s\-'.]+$/.test(name)) return field + ' contains invalid characters';
  return null;
}

// check pairs of [fieldId, errorMsg] and show errors if any fails
function runValidations(pairs) {
  var valid = true;
  pairs.forEach(function(pair) {
    if (pair[1]) { showErr(pair[0], pair[1]); valid = false; }
  });
  return valid;
}
