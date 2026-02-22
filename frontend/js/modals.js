// modal open/close and form handling
function openModal(type)  { document.getElementById('modal-' + type).classList.add('open'); }
function closeModal(type) { document.getElementById('modal-' + type).classList.remove('open'); }

function resetForm(type) {
  document.querySelectorAll('#modal-' + type + ' input:not([type=hidden]), #modal-' + type + ' select').forEach(function(el) { el.value = ''; });
  document.querySelectorAll('#modal-' + type + ' input[type=hidden]').forEach(function(el) { el.value = ''; });
  document.querySelectorAll('#modal-' + type + ' .error').forEach(function(el) { el.textContent = ''; el.classList.remove('show'); });
  document.getElementById('modal-' + type + '-title').textContent = 'Add ' + type.charAt(0).toUpperCase() + type.slice(1);
}

function openEdit(type, key) {
  resetForm(type);
  document.getElementById('modal-' + type + '-title').textContent = 'Edit ' + type.charAt(0).toUpperCase() + type.slice(1);

  if (type === 'student') {
    var s = students.find(function(x) { return x.ID === key; }); if (!s) return;
    document.getElementById('student-orig-id').value     = s.ID;
    document.getElementById('f-student-id').value        = s.ID;
    document.getElementById('f-student-firstname').value = s.FirstName;
    document.getElementById('f-student-lastname').value  = s.LastName;
    document.getElementById('f-student-program').value   = s.ProgramCode;
    document.getElementById('f-student-year').value      = s.Year;
    document.getElementById('f-student-gender').value    = s.Gender;
  } else if (type === 'program') {
    var p = programs.find(function(x) { return x.Code === key; }); if (!p) return;
    document.getElementById('program-orig-code').value   = p.Code;
    document.getElementById('f-program-code').value      = p.Code;
    document.getElementById('f-program-name').value      = p.Name;
    document.getElementById('f-program-college').value   = p.CollegeCode;
  } else {
    var c = colleges.find(function(x) { return x.Code === key; }); if (!c) return;
    document.getElementById('college-orig-code').value   = c.Code;
    document.getElementById('f-college-code').value      = c.Code;
    document.getElementById('f-college-name').value      = c.Name;
  }
  openModal(type);
}
