// table rendering and pagination

function renderTable(type, data) {
  var wrap = el(type + '-table-wrap');

  if (type === 'program') {
    renderProgramTable(wrap, data);
    return;
  }

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
  html += renderRows(slice, cols, type, key, label);
  html += '</tbody></table>';
  html += buildPagination(type, data.length, page, totalPages);

  wrap.innerHTML = html;
}

function renderProgramTable(wrap, data) {
  var cols = [['Code','Code'],['Name','Name']];

  if ((!data || data.length === 0) && programCollegeFilter === null) {
    wrap.innerHTML = '<div class="empty"><div class="empty-icon">📭</div>No programs found</div>';
    rebuildDropdowns([]);
    return;
  }

  var ps         = pageSize();
  var totalPages = Math.max(1, Math.ceil((data.length || 1) / ps));
  var page       = Math.min(pages.program, totalPages);
  pages.program  = page;

  var start = (page - 1) * ps;
  var slice  = data.slice(start, start + ps);

  var html = '<table><thead><tr>';
  cols.forEach(function(c) {
    var arrow = sort.program.col === c[0] ? (sort.program.asc ? ' ↑' : ' ↓') : ' ↕';
    html += '<th onclick="sortTable(\'program\',\'' + c[0] + '\')" style="cursor:pointer">' + c[1] + arrow + '</th>';
  });
  html += '<th>Actions</th></tr></thead><tbody>';

  if (data.length === 0) {
    // active filter but no results — show the group header so tab is accessible
    var cc = programCollegeFilter === '__UNASSIGNED__' ? '' : programCollegeFilter;
    var college = colleges.find(function(c) { return c.Code === cc; });
    var collegeLabel = cc
      ? (college ? cc + ' \u2014 ' + college.Name : cc)
      : 'Programs w/ No College';
    var dropKey = cc || '__UNASSIGNED__';
    html += '<tr class="group-header group-header-active">'
      + '<td colspan="3" onclick="toggleCollegeDropdown(event,\'' + dropKey + '\')">'
      + '<span class="group-header-label">' + collegeLabel + '</span>'
      + '<span class="group-header-arrow">\u25be</span>'
      + '</td></tr>'
      + '<tr><td colspan="3" style="text-align:center;padding:32px;color:var(--text-muted);font-size:13px;">No programs in this college</td></tr>';
    rebuildDropdowns([dropKey]);
  } else {
    html += renderProgramGroups(slice, cols);
    // dropdowns rebuilt inside renderProgramGroups via setTimeout
  }

  html += '</tbody></table>';
  html += buildPagination('program', data.length, page, Math.ceil(data.length / ps) || 1);

  wrap.innerHTML = html;
}

// builds and appends all college filter dropdowns to body
// groupKeys = array of cc values ('COE', '__UNASSIGNED__', etc.) that got a header this render
// if empty, still builds one shared dropdown so the filter is always accessible
function rebuildDropdowns(groupKeys) {
  // always remove stale dropdowns first
  document.querySelectorAll('.college-dropdown').forEach(function(d) { d.remove(); });

  var hasUnassigned = programs.some(function(p) { return !p.CollegeCode; });

  // build the shared dropdown HTML — same items for every group header
  function buildItems() {
    var items = '';
    items += '<div class="college-dropdown-item' + (programCollegeFilter === null ? ' active' : '') + '" onclick="filterByCollege(null)">All Programs</div>';
    if (hasUnassigned) {
      items += '<div class="college-dropdown-item' + (programCollegeFilter === '__UNASSIGNED__' ? ' active' : '') + '" onclick="filterByCollege(\'__UNASSIGNED__\')">Programs w/ No College</div>';
    }
    colleges.forEach(function(c) {
      items += '<div class="college-dropdown-item' + (programCollegeFilter === c.Code ? ' active' : '') + '" onclick="filterByCollege(\'' + c.Code + '\')">'
        + c.Code + ' \u2014 ' + c.Name + '</div>';
    });
    return items;
  }

  var keys = groupKeys.length > 0 ? groupKeys : ['__shared__'];
  keys.forEach(function(key) {
    var drop = document.createElement('div');
    drop.className = 'college-dropdown';
    drop.id = 'cdrop-' + key;
    drop.innerHTML = buildItems();
    document.body.appendChild(drop);
  });
}

function renderRows(slice, cols, type, key, label) {
  var html = '';
  slice.forEach(function(row) {
    var rowClick = type === 'student'
      ? ' onclick="openStudentInfo(\'' + row[key] + '\')" style="cursor:pointer"'
      : '';
    html += '<tr' + rowClick + '>';
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
  if (totalPages <= 1)
    return '<div class="pagination"><span class="page-info">' + total + ' total</span></div>';

  var controls = ''
    + '<button class="page-btn" onclick="changePage(\'' + type + '\',-1)" ' + (page <= 1 ? 'disabled' : '') + '>&#8592;</button>'
    + '<button class="page-btn page-btn-active">' + page + '</button>'
    + (page < totalPages
        ? '<input class="page-jump" type="number" min="1" max="' + totalPages + '" placeholder="\u2026" onkeydown="jumpPage(event,\'' + type + '\',' + totalPages + ')" onclick="this.select()">'
        + '<button class="page-btn" onclick="goToPage(\'' + type + '\',' + totalPages + ')">' + totalPages + '</button>'
        : '')
    + '<button class="page-btn" onclick="changePage(\'' + type + '\',1)" ' + (page >= totalPages ? 'disabled' : '') + '>&#8594;</button>';

  return '<div class="pagination">'
    + '<span class="page-info">' + total + ' total</span>'
    + '<div class="page-controls">' + controls + '</div>'
    + '</div>';
}

function goToPage(type, p) {
  var totalPages = Math.ceil(filtered[type].length / pageSize());
  pages[type] = Math.min(Math.max(p, 1), totalPages);
  renderTable(type, filtered[type]);
}

function jumpPage(e, type, totalPages) {
  if (e.key !== 'Enter') return;
  var p = parseInt(e.target.value, 10);
  if (!p || p < 1 || p > totalPages) { e.target.value = ''; return; }
  goToPage(type, p);
}

function changePage(type, dir) {
  var ps         = pageSize();
  var totalPages = Math.ceil(filtered[type].length / ps);
  pages[type]    = Math.min(Math.max(pages[type] + dir, 1), totalPages);
  renderTable(type, filtered[type]);
}

function renderProgramGroups(slice, cols) {
  var html = '';
  var groups = {}, groupOrder = [];
  slice.forEach(function(row) {
    var cc = row.CollegeCode || '';
    if (!groups[cc]) { groups[cc] = []; groupOrder.push(cc); }
    groups[cc].push(row);
  });

  var hasUnassigned = programs.some(function(p) { return !p.CollegeCode; });

  groupOrder.forEach(function(cc) {
    var college      = colleges.find(function(c) { return c.Code === cc; });
    var collegeLabel = cc
      ? (college ? cc + ' \u2014 ' + college.Name : cc)
      : 'Programs w/ No College';
    var dropKey  = cc || '__UNASSIGNED__';
    var isActive = cc === ''
      ? programCollegeFilter === '__UNASSIGNED__'
      : programCollegeFilter === cc;

    html += '<tr class="group-header' + (isActive ? ' group-header-active' : '') + '">'
      + '<td colspan="' + (cols.length + 1) + '" onclick="toggleCollegeDropdown(event,\'' + dropKey + '\')">'
      + '<span class="group-header-label">' + collegeLabel + '</span>'
      + '<span class="group-header-arrow">\u25be</span>'
      + '</td></tr>';

    groups[cc].forEach(function(row) {
      html += '<tr>'
        + '<td>' + row.Code + '</td>'
        + '<td>' + row.Name + '</td>'
        + '<td>' + rowActions('program', row.Code, row.Name) + '</td></tr>';
    });
  });

  // rebuild body-appended dropdowns after html is injected
  setTimeout(function() { rebuildDropdowns(groupOrder.map(function(cc) { return cc || '__UNASSIGNED__'; })); }, 0);

  return html;
}

function toggleCollegeDropdown(event, cc) {
  event.stopPropagation();
  var drop = document.getElementById('cdrop-' + cc);
  if (!drop) return;
  var isOpen = drop.classList.contains('open');
  document.querySelectorAll('.college-dropdown').forEach(function(d) { d.classList.remove('open'); });
  if (!isOpen) {
    var tr   = event.target.closest('tr') || event.target;
    var rect = tr.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) return;
    drop.style.top  = (rect.bottom + 2) + 'px';
    drop.style.left = rect.left + 'px';
    drop.classList.add('open');
  }
}

function applySort(type) {
  var s = sort[type];
  if (!s.col) {
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
    s.col = col; s.asc = true;
  } else if (s.asc) {
    s.asc = false;
  } else {
    s.col = null;
  }
  applySort(type);
  renderTable(type, filtered[type]);
}

function fillDropdown(id, data, valKey, labelKey) {
  var sel = el(id);
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

  if (code === null) {
    filtered.program = base;
  } else if (code === '__UNASSIGNED__') {
    filtered.program = base.filter(function(p) { return !p.CollegeCode; });
  } else {
    filtered.program = base.filter(function(p) { return p.CollegeCode === code; });
  }

  renderTable('program', filtered.program);
  document.querySelectorAll('.college-dropdown').forEach(function(d) { d.classList.remove('open'); });
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
  if (!e.target.closest('.college-dropdown') && !e.target.closest('.group-header')) {
    document.querySelectorAll('.college-dropdown').forEach(function(d) { d.classList.remove('open'); });
  }
});

document.querySelector('.main').addEventListener('scroll', function() {
  document.querySelectorAll('.college-dropdown').forEach(function(d) { d.classList.remove('open'); });
});