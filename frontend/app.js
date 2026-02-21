var students = [], programs = [], colleges = [];
var editType = '', editKey = '';
var deleteFn = null;

var go = window.go.main.App;

window.addEventListener('load', function() {
  loadAll();
  initTheme();

  // nav
  document.querySelectorAll('.nav-item').forEach(function(el) {
    el.addEventListener('click', function() {
      document.querySelectorAll('.nav-item').forEach(function(x) { x.classList.remove('active'); });
      document.querySelectorAll('.section').forEach(function(x) { x.classList.remove('active'); });
      el.classList.add('active');
      document.getElementById('section-' + el.dataset.section).classList.add('active');
    });
  });

  // cancel buttons
  document.querySelectorAll('.btn-cancel').forEach(function(el) {
    el.addEventListener('click', function() { closeModal(el.dataset.modal); });
  });

  // add buttons
  document.getElementById('btn-add-student').onclick = function() { openModal('student'); resetForm('student'); };
  document.getElementById('btn-add-program').onclick  = function() { openModal('program'); resetForm('program'); };
  document.getElementById('btn-add-college').onclick  = function() { openModal('college'); resetForm('college'); };

  // submit buttons
  document.getElementById('btn-submit-student').onclick = submitStudent;
  document.getElementById('btn-submit-program').onclick = submitProgram;
  document.getElementById('btn-submit-college').onclick = submitCollege;
  document.getElementById('btn-confirm-delete').onclick = function() { if (deleteFn) deleteFn(); };

  // search
  document.getElementById('student-search').oninput = function() {
    var q = this.value.toLowerCase();
    renderTable('student', students.filter(function(s) {
      return (s.ID + s.FirstName + s.LastName + s.ProgramCode).toLowerCase().includes(q);
    }));
  };
  document.getElementById('program-search').oninput = function() {
    var q = this.value.toLowerCase();
    renderTable('program', programs.filter(function(p) {
      return (p.Code + p.Name + p.CollegeCode).toLowerCase().includes(q);
    }));
  };
  document.getElementById('college-search').oninput = function() {
    var q = this.value.toLowerCase();
    renderTable('college', colleges.filter(function(c) {
      return (c.Code + c.Name).toLowerCase().includes(q);
    }));
  };
});

// theme
function initTheme() {
  var saved = localStorage.getItem('theme') || 'dark';
  setTheme(saved);

  document.getElementById('theme-toggle').addEventListener('click', function() {
    var current = document.documentElement.getAttribute('data-theme');
    setTheme(current === 'dark' ? 'light' : 'dark');
  });
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  document.getElementById('theme-label').textContent = theme === 'dark' ? 'Light Mode' : 'Dark Mode';
}

// data
function loadAll() {
  go.ListColleges().then(function(d) {
    colleges = d || [];
    renderTable('college', colleges);
    fillDropdown('f-program-college', colleges, 'Code', 'Name');
  });
  go.ListPrograms().then(function(d) {
    programs = d || [];
    renderTable('program', programs);
    fillDropdown('f-student-program', programs, 'Code', 'Name');
  });
  go.ListStudents().then(function(d) {
    students = d || [];
    renderTable('student', students);
  });
}

// render tables
function renderTable(type, data) {
  var wrap = document.getElementById(type + '-table-wrap');

  if (!data || data.length === 0) {
    wrap.innerHTML = '<div class="empty"><div class="empty-icon">📭</div>No ' + type + 's found</div>';
    return;
  }

  var cols = type === 'student'
    ? [['ID','ID'],['FirstName','First Name'],['LastName','Last Name'],['ProgramCode','Program'],['Year','Year'],['Gender','Gender']]
    : type === 'program'
    ? [['Code','Code'],['Name','Name'],['CollegeCode','College']]
    : [['Code','Code'],['Name','Name']];

  var key   = type === 'student' ? 'ID' : 'Code';
  var label = type === 'student'
    ? function(r) { return r.FirstName + ' ' + r.LastName; }
    : function(r) { return r.Name; };

  var html = '<table><thead><tr>';
  cols.forEach(function(c) { html += '<th>' + c[1] + '</th>'; });
  html += '<th>Actions</th></tr></thead><tbody>';

  data.forEach(function(row) {
    html += '<tr>';
    cols.forEach(function(c) {
      var val = row[c[0]] || '';
      // show unenrolled badge for empty foreign keys
      if (!val && (c[0] === 'ProgramCode' || c[0] === 'CollegeCode')) {
        html += '<td><span class="badge badge-warning">Unenrolled</span></td>';
      } else {
        html += '<td>' + val + '</td>';
      }
    });
    html += '<td>'
      + '<button class="btn-edit-sm" onclick="openEdit(\'' + type + '\',\'' + row[key] + '\')">Edit</button>'
      + '<button class="btn-delete-sm" onclick="askDelete(\'' + type + '\',\'' + row[key] + '\',\'' + label(row) + '\')">Delete</button>'
      + '</td></tr>';
  });

  wrap.innerHTML = html + '</tbody></table>';
}

function fillDropdown(id, data, valKey, labelKey) {
  var sel  = document.getElementById(id);
  var prev = sel.value;
  sel.innerHTML = '<option value="">Select…</option>';
  data.forEach(function(d) {
    sel.innerHTML += '<option value="' + d[valKey] + '">' + d[valKey] + ' — ' + d[labelKey] + '</option>';
  });
  sel.value = prev;
}

// modal helpers
function openModal(type)  { document.getElementById('modal-' + type).classList.add('open'); }
function closeModal(type) { document.getElementById('modal-' + type).classList.remove('open'); }

function resetForm(type) {
  document.querySelectorAll('#modal-' + type + ' input:not([type=hidden]), #modal-' + type + ' select').forEach(function(el) {
    el.value = '';
  });
  document.querySelectorAll('#modal-' + type + ' input[type=hidden]').forEach(function(el) {
    el.value = '';
  });
  document.querySelectorAll('#modal-' + type + ' .error').forEach(function(el) {
    el.textContent = '';
    el.classList.remove('show');
  });
  document.getElementById('modal-' + type + '-title').textContent =
    'Add ' + type.charAt(0).toUpperCase() + type.slice(1);
}

function openEdit(type, key) {
  resetForm(type);
  document.getElementById('modal-' + type + '-title').textContent =
    'Edit ' + type.charAt(0).toUpperCase() + type.slice(1);

  if (type === 'student') {
    var s = students.find(function(x) { return x.ID === key; }); if (!s) return;
    document.getElementById('student-orig-id').value        = s.ID;
    document.getElementById('f-student-id').value           = s.ID;
    document.getElementById('f-student-firstname').value    = s.FirstName;
    document.getElementById('f-student-lastname').value     = s.LastName;
    document.getElementById('f-student-program').value      = s.ProgramCode;
    document.getElementById('f-student-year').value         = s.Year;
    document.getElementById('f-student-gender').value       = s.Gender;
  } else if (type === 'program') {
    var p = programs.find(function(x) { return x.Code === key; }); if (!p) return;
    document.getElementById('program-orig-code').value      = p.Code;
    document.getElementById('f-program-code').value         = p.Code;
    document.getElementById('f-program-name').value         = p.Name;
    document.getElementById('f-program-college').value      = p.CollegeCode;
  } else {
    var c = colleges.find(function(x) { return x.Code === key; }); if (!c) return;
    document.getElementById('college-orig-code').value      = c.Code;
    document.getElementById('f-college-code').value         = c.Code;
    document.getElementById('f-college-name').value         = c.Name;
  }
  openModal(type);
}

// error display
function showErr(field, msg) {
  var el = document.getElementById('err-' + field);
  if (el) { el.textContent = msg; el.classList.add('show'); }
}

// submit handlers
function submitStudent() {
  var id = document.getElementById('f-student-id').value.trim();
  var fn = document.getElementById('f-student-firstname').value.trim();
  var ln = document.getElementById('f-student-lastname').value.trim();
  var pr = document.getElementById('f-student-program').value;
  var yr = document.getElementById('f-student-year').value;
  var gn = document.getElementById('f-student-gender').value;

  if (!id || !fn || !ln || !pr || !yr || !gn) {
    showErr('student-id', 'All fields are required');
    return;
  }

  var orig = document.getElementById('student-orig-id').value;
  var p = orig ? go.UpdateStudent(orig, id, fn, ln, pr, yr, gn) : go.AddStudent(id, fn, ln, pr, yr, gn);
  p.then(function() {
    toast('Student saved successfully');
    closeModal('student');
    go.ListStudents().then(function(d) { students = d || []; renderTable('student', students); });
  }).catch(function(e) { showErr('student-id', e); });
}

function submitProgram() {
  var code = document.getElementById('f-program-code').value.trim();
  var name = document.getElementById('f-program-name').value.trim();
  var col  = document.getElementById('f-program-college').value;

  if (!code || !name || !col) {
    showErr('program-code', 'All fields are required');
    return;
  }

  var orig = document.getElementById('program-orig-code').value;
  var p = orig ? go.UpdateProgram(orig, code, name, col) : go.AddProgram(code, name, col);
  p.then(function() {
    toast('Program saved successfully');
    closeModal('program');
    go.ListPrograms().then(function(d) {
      programs = d || [];
      renderTable('program', programs);
      fillDropdown('f-student-program', programs, 'Code', 'Name');
    });
  }).catch(function(e) { showErr('program-code', e); });
}

function submitCollege() {
  var code = document.getElementById('f-college-code').value.trim();
  var name = document.getElementById('f-college-name').value.trim();

  if (!code || !name) {
    showErr('college-code', 'All fields are required');
    return;
  }

  var orig = document.getElementById('college-orig-code').value;
  var p = orig ? go.UpdateCollege(orig, code, name) : go.AddCollege(code, name);
  p.then(function() {
    toast('College saved successfully');
    closeModal('college');
    go.ListColleges().then(function(d) {
      colleges = d || [];
      renderTable('college', colleges);
      fillDropdown('f-program-college', colleges, 'Code', 'Name');
    });
  }).catch(function(e) { showErr('college-code', e); });
}

// delete confirmation
function askDelete(type, key, label) {
  document.getElementById('confirm-text').innerHTML =
    'Are you sure you want to delete <strong>' + label + '</strong>? This action cannot be undone.';
  deleteFn = function() {
    var p = type === 'student'
      ? go.DeleteStudent(key)
      : type === 'program'
      ? go.DeleteProgram(key)
      : go.DeleteCollege(key);
    p.then(function() {
      toast(type.charAt(0).toUpperCase() + type.slice(1) + ' deleted');
      closeModal('confirm');
      loadAll();
    }).catch(function(e) {
      toast(e, 'error');
      closeModal('confirm');
    });
  };
  openModal('confirm');
}

// toast notifications
function toast(msg, type) {
  var el = document.createElement('div');
  el.className = 'toast' + (type === 'error' ? ' error' : '');
  el.textContent = msg;
  document.getElementById('toast-container').appendChild(el);
  setTimeout(function() {
    el.style.opacity = '0';
    el.style.transform = 'translateX(16px)';
    setTimeout(function() { el.remove(); }, 300);
  }, 2800);
}