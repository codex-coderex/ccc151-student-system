// table rendering and pagination

function renderTable(type, data) {
  var wrap = el(type + '-table-wrap');

  if (!data || data.length === 0) {
    wrap.innerHTML = '<div class="empty"><div class="empty-icon">📭</div>No ' + type + 's found</div>';
    return;
  }

  var ps         = pageSize();
  var totalPages = Math.ceil(data.length / ps);
  var page       = Math.min(pages[type], totalPages);
  pages[type]    = page;

  var start = (page - 1) * ps;
  var slice = data.slice(start, start + ps);

  var cols = type === 'student'
    ? [['ID','ID'],['FirstName','First Name'],['LastName','Last Name'],['ProgramCode','Program'],['Year','Year'],['Gender','Gender']]
    : [['Code','Code'],['Name','Name']];

  var key   = type === 'student' ? 'ID' : 'Code';
  var label = type === 'student'
    ? function(r) { return r.FirstName + ' ' + r.LastName; }
    : function(r) { return r.Name; };

  var html = '<table><thead><tr>';
  cols.forEach(function(c) {
    var arrow = sort[type].col === c[0] ? (sort[type].asc ? ' ↑' : ' ↓') : ' ↕';
    html += '<th onclick="sortTable(\'' + type + '\',\'' + c[0] + '\')" style="cursor:pointer">' + c[1] + arrow + '</th>';
  });
  html += '<th>Actions</th></tr></thead><tbody>';

  html += type === 'program'
    ? renderProgramGroups(slice, cols)
    : renderRows(slice, cols, type, key, label);

  html += '</tbody></table>';
  html += buildPagination(type, data.length, page, totalPages);

  wrap.innerHTML = html;
}

function renderRows(slice, cols, type, key, label) {
  var html = '';
  slice.forEach(function(row) {
    html += '<tr>';
    cols.forEach(function(c) {
      var v = row[c[0]] || '';
      html += !v && c[0] === 'ProgramCode'
        ? '<td><span class="badge badge-warning">Unenrolled</span></td>'
        : '<td>' + v + '</td>';
    });
    html += '<td>' + rowActions(type, row[key], label(row)) + '</td></tr>';
  });
  return html;
}

function rowActions(type, key, label) {
  return '<button class="btn-edit-sm" onclick="openEdit(\'' + type + '\',\'' + key + '\')">Edit</button>'
       + '<button class="btn-delete-sm" onclick="askDelete(\'' + type + '\',\'' + key + '\',\'' + label + '\')">Delete</button>';
}

function buildPagination(type, total, page, totalPages) {
  return '<div class="pagination">'
    + '<span class="page-info">' + total + ' total</span>'
    + '<div class="page-controls">'
    + '<button class="page-btn" onclick="changePage(\'' + type + '\',-1)" ' + (page <= 1 ? 'disabled' : '') + '>&#8592;</button>'
    + '<span class="page-current">Page ' + page + ' of ' + totalPages + '</span>'
    + '<button class="page-btn" onclick="changePage(\'' + type + '\',1)" ' + (page >= totalPages ? 'disabled' : '') + '>&#8594;</button>'
    + '</div></div>';
}

function renderProgramGroups(slice, cols) {
  var html = '';
  var groups = {}, groupOrder = [];
  slice.forEach(function(row) {
    var cc = row.CollegeCode || '';
    if (!groups[cc]) { groups[cc] = []; groupOrder.push(cc); }
    groups[cc].push(row);
  });

  groupOrder.forEach(function(cc) {
    var college      = colleges.find(function(c) { return c.Code === cc; });
    var collegeLabel = college ? cc + ' \u2014 ' + college.Name : cc || 'Unenrolled';
    var isActive     = programCollegeFilter === cc;

    var opts = '<div class="college-dropdown" id="cdrop-' + cc + '">'
      + '<div class="college-dropdown-item' + (!programCollegeFilter ? ' active' : '') + '" onclick="filterByCollege(null)">All Programs</div>';
    colleges.forEach(function(c) {
      opts += '<div class="college-dropdown-item' + (programCollegeFilter === c.Code ? ' active' : '') + '" onclick="filterByCollege(\'' + c.Code + '\')">'
        + c.Code + ' \u2014 ' + c.Name + '</div>';
    });
    opts += '</div>';

    html += '<tr class="group-header' + (isActive ? ' group-header-active' : '') + '">'
      + '<td colspan="' + (cols.length + 1) + '" onclick="toggleCollegeDropdown(event, \'' + cc + '\')">'
      + '<span class="group-header-label">' + collegeLabel + '</span>'
      + '<span class="group-header-arrow">\u25be</span>'
      + opts + '</td></tr>';

    groups[cc].forEach(function(row) {
      html += '<tr>'
        + '<td>' + row.Code + '</td>'
        + '<td>' + row.Name + '</td>'
        + '<td>' + rowActions('program', row.Code, row.Name) + '</td></tr>';
    });
  });
  return html;
}

function applySort(type) {
  var s = sort[type];
  if (!s.col) {
    // restore original load order
    filtered[type] = original[type].slice();
    return;
  }
  filtered[type].sort(function(a, b) {
    var av = (a[s.col] || '').toLowerCase();
    var bv = (b[s.col] || '').toLowerCase();
    return av < bv ? (s.asc ? -1 : 1) : av > bv ? (s.asc ? 1 : -1) : 0;
  });
}

function sortTable(type, col) {
  var s = sort[type];
  if (s.col !== col) {
    s.col = col; s.asc = true;          // new column — start ascending
  } else if (s.asc) {
    s.asc = false;                       // second click — descending
  } else {
    s.col = null;                        // third click — back to neutral
  }
  applySort(type);
  renderTable(type, filtered[type]);
}

function changePage(type, dir) {
  var ps         = pageSize();
  var totalPages = Math.ceil(filtered[type].length / ps);
  pages[type]    = Math.min(Math.max(pages[type] + dir, 1), totalPages);
  renderTable(type, filtered[type]);
}

function fillDropdown(id, data, valKey, labelKey) {
  var sel  = el(id);
  if (!sel) return;
  var prev = sel.value;
  sel.innerHTML = '<option value="">Select\u2026</option>';
  data.forEach(function(d) {
    sel.innerHTML += '<option value="' + d[valKey] + '">' + d[valKey] + ' \u2014 ' + d[labelKey] + '</option>';
  });
  sel.value = prev;
}

function filterByCollege(code) {
  programCollegeFilter = code;
  pages.program = 1;
  var q = el('program-search').value.toLowerCase();
  var base = programs.filter(function(p) {
    return (p.Code + p.Name + p.CollegeCode).toLowerCase().includes(q);
  });
  filtered.program = code ? base.filter(function(p) { return p.CollegeCode === code; }) : base;
  renderTable('program', filtered.program);
  document.querySelectorAll('.college-dropdown').forEach(function(d) { d.classList.remove('open'); });
}

function toggleCollegeDropdown(event, cc) {
  event.stopPropagation();
  var drop = el('cdrop-' + cc);
  if (!drop) return;
  var isOpen = drop.classList.contains('open');
  document.querySelectorAll('.college-dropdown').forEach(function(d) { d.classList.remove('open'); });
  if (!isOpen) {
    var rect = event.currentTarget.getBoundingClientRect();
    drop.style.top  = (rect.bottom + 2) + 'px';
    drop.style.left = rect.left + 'px';
    drop.classList.add('open');
  }
}

function initResize() {
  var timer;
  window.addEventListener('resize', function() {
    clearTimeout(timer);
    timer = setTimeout(function() {
      renderTable('student', filtered.student);
      renderTable('program', filtered.program);
      renderTable('college', filtered.college);
    }, 150);
  });
}

document.addEventListener('click', function(e) {
  if (!e.target.closest('.group-header')) {
    document.querySelectorAll('.college-dropdown').forEach(function(d) { d.classList.remove('open'); });
  }
});

document.addEventListener('scroll', function() {
  document.querySelectorAll('.college-dropdown').forEach(function(d) { d.classList.remove('open'); });
}, true);
