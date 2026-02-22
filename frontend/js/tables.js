// table rendering and pagination
function renderTable(type, data) {
  var wrap = document.getElementById(type + '-table-wrap');

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
  cols.forEach(function(c) { html += '<th>' + c[1] + '</th>'; });
  html += '<th>Actions</th></tr></thead><tbody>';

  if (type === 'program') {
    html += renderProgramGroups(slice, cols);
  } else {
    slice.forEach(function(row) {
      html += '<tr>';
      cols.forEach(function(c) {
        var val = row[c[0]] || '';
        if (!val && c[0] === 'ProgramCode') {
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
  }

  html += '</tbody></table>';
  html += '<div class="pagination">'
    + '<span class="page-info">' + data.length + ' total</span>'
    + '<div class="page-controls">'
    + '<button class="page-btn" onclick="changePage(\'' + type + '\',-1)" ' + (page <= 1 ? 'disabled' : '') + '>&#8592;</button>'
    + '<span class="page-current">Page ' + page + ' of ' + totalPages + '</span>'
    + '<button class="page-btn" onclick="changePage(\'' + type + '\',1)" ' + (page >= totalPages ? 'disabled' : '') + '>&#8594;</button>'
    + '</div>'
    + '</div>';

  wrap.innerHTML = html;
}

function renderProgramGroups(slice, cols) {
  var html = '';
  var groups = {}, groupOrder = [];
  slice.forEach(function(row) {
    var cCode = row.CollegeCode || '';
    if (!groups[cCode]) { groups[cCode] = []; groupOrder.push(cCode); }
    groups[cCode].push(row);
  });

  groupOrder.forEach(function(cCode) {
    var college      = colleges.find(function(c) { return c.Code === cCode; });
    var collegeLabel = college ? cCode + ' \u2014 ' + college.Name : cCode || 'Unenrolled';
    var isActive     = programCollegeFilter === cCode;

    var opts = '<div class="college-dropdown" id="cdrop-' + cCode + '">'
      + '<div class="college-dropdown-item' + (!programCollegeFilter ? ' active' : '') + '" onclick="filterByCollege(null)">All Programs</div>';
    colleges.forEach(function(c) {
      var itemClass = programCollegeFilter === c.Code ? ' active' : '';
      opts += '<div class="college-dropdown-item' + itemClass + '" onclick="filterByCollege(\'' + c.Code + '\')">'
        + c.Code + ' \u2014 ' + c.Name + '</div>';
    });
    opts += '</div>';

    html += '<tr class="group-header' + (isActive ? ' group-header-active' : '') + '">'
      + '<td colspan="' + (cols.length + 1) + '" onclick="toggleCollegeDropdown(event, \'' + cCode + '\')">'
      + '<span class="group-header-label">' + collegeLabel + '</span>'
      + '<span class="group-header-arrow">\u25be</span>'
      + opts + '</td></tr>';

    groups[cCode].forEach(function(row) {
      html += '<tr>'
        + '<td>' + row.Code + '</td>'
        + '<td>' + row.Name + '</td>'
        + '<td>'
        + '<button class="btn-edit-sm" onclick="openEdit(\'program\',\'' + row.Code + '\')">Edit</button>'
        + '<button class="btn-delete-sm" onclick="askDelete(\'program\',\'' + row.Code + '\',\'' + row.Name + '\')">Delete</button>'
        + '</td></tr>';
    });
  });
  return html;
}

function changePage(type, dir) {
  var ps         = pageSize();
  var totalPages = Math.ceil(filtered[type].length / ps);
  pages[type]    = Math.min(Math.max(pages[type] + dir, 1), totalPages);
  renderTable(type, filtered[type]);
}

function fillDropdown(id, data, valKey, labelKey) {
  var sel  = document.getElementById(id);
  var prev = sel.value;
  sel.innerHTML = '<option value=""">Select\u2026</option>';
  data.forEach(function(d) {
    sel.innerHTML += '<option value="' + d[valKey] + '">' + d[valKey] + ' \u2014 ' + d[labelKey] + '</option>';
  });
  sel.value = prev;
}

function filterByCollege(code) {
  programCollegeFilter = code;
  pages.program = 1;
  var q = document.getElementById('program-search').value.toLowerCase();
  var base = programs.filter(function(p) {
    return (p.Code + p.Name + p.CollegeCode).toLowerCase().includes(q);
  });
  filtered.program = code ? base.filter(function(p) { return p.CollegeCode === code; }) : base;
  renderTable('program', filtered.program);
  document.querySelectorAll('.college-dropdown').forEach(function(d) { d.classList.remove('open'); });
}

function toggleCollegeDropdown(event, cCode) {
  event.stopPropagation();
  var drop = document.getElementById('cdrop-' + cCode);
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
