// modal open/close and form handling

function openModal(type)  { el('modal-' + type).classList.add('open'); }
function closeModal(type) { el('modal-' + type).classList.remove('open'); }

function resetForm(type) {
  document.querySelectorAll('#modal-' + type + ' input:not([type=hidden]), #modal-' + type + ' select')
    .forEach(function(e) { e.value = ''; });
  document.querySelectorAll('#modal-' + type + ' input[type=hidden]')
    .forEach(function(e) { e.value = ''; });
  document.querySelectorAll('#modal-' + type + ' .error')
    .forEach(function(e) { e.textContent = ''; e.classList.remove('show'); });
  el('modal-' + type + '-title').textContent = 'Add ' + capitalize(type);

  if (type === 'student') {
    collegeCombobox.clear();
    programCombobox.clear();
    setVal('f-student-id-year', new Date().getFullYear());
  }
  if (type === 'program') programCollegeCombobox.clear();
}

function openEdit(type, key) {
  resetForm(type);
  el('modal-' + type + '-title').textContent = 'Edit ' + capitalize(type);

  if (type === 'student') {
    var s = students.find(function(x) { return x.ID === key; }); if (!s) return;
    var parts = s.ID.split('-');
    setVal('student-orig-id', s.ID);
    setVal('f-student-id-year', parts[0]);
    setVal('f-student-id-seq',  parts[1]);
    setVal('f-student-firstname', s.FirstName);
    setVal('f-student-lastname',  s.LastName);
    setVal('f-student-year',   s.Year);
    setVal('f-student-gender', s.Gender);
    var prog = programs.find(function(x) { return x.Code === s.ProgramCode; });
    collegeCombobox.set(prog ? prog.CollegeCode : null);
    programCombobox.set(s.ProgramCode);

  } else if (type === 'program') {
    var p = programs.find(function(x) { return x.Code === key; }); if (!p) return;
    setVal('program-orig-code', p.Code);
    setVal('f-program-code',    p.Code);
    setVal('f-program-name',    p.Name);
    programCollegeCombobox.set(p.CollegeCode);

  } else {
    var c = colleges.find(function(x) { return x.Code === key; }); if (!c) return;
    setVal('college-orig-code', c.Code);
    setVal('f-college-code',    c.Code);
    setVal('f-college-name',    c.Name);
  }

  openModal(type);
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
