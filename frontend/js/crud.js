// data loading and CRUD submit/delete handlers

function loadAll() {
  go.ListColleges().then(function(d) {
    colleges = d || []; filtered.college = colleges; original.college = colleges.slice(); pages.college = 1;
    renderTable('college', filtered.college);
  });
  go.ListPrograms().then(function(d) {
    programs = d || []; filtered.program = programs; original.program = programs.slice(); pages.program = 1;
    renderTable('program', filtered.program);
  });
  go.ListStudents().then(function(d) {
    students = d || []; filtered.student = students; original.student = students.slice(); pages.student = 1;
    renderTable('student', filtered.student);
  });
}

function submitStudent() {
  var yr_part = val('f-student-id-year');
  var seq_part = val('f-student-id-seq');
  var id = yr_part && seq_part ? yr_part + '-' + seq_part : '';
  var fn = val('f-student-firstname');
  var ln = val('f-student-lastname');
  var pr = val('f-student-program');
  var yr = val('f-student-year');
  var gn = val('f-student-gender');

  var valid = runValidations([
    ['student-id',        validateStudentID(id)],
    ['student-firstname', validateName(fn, 'First name')],
    ['student-lastname',  validateName(ln, 'Last name')],
    ['student-program',   !pr ? 'Program is required' : null],
    ['student-year',      !yr ? 'Year level is required' : null],
    ['student-gender',    !gn ? 'Gender is required' : null],
  ]);
  if (!valid) return;

  var orig = val('student-orig-id');
  var p = orig ? go.UpdateStudent(orig, id, fn, ln, pr, yr, gn) : go.AddStudent(id, fn, ln, pr, yr, gn);
  p.then(function() {
    toast('Student saved successfully'); closeModal('student');
    go.ListStudents().then(function(d) { students = d || []; filtered.student = students; original.student = students.slice(); pages.student = 1; renderTable('student', filtered.student); });
  }).catch(function(e) { showErr('student-id', e); });
}

function submitProgram() {
  var code = val('f-program-code');
  var name = val('f-program-name');
  var col  = val('f-program-college');

  var valid = runValidations([
    ['program-code', validateCode(code, 'Program code')],
    ['program-name', validateLabel(name, 'Program name')],
    ['program-college', !col ? 'College is required' : null],
  ]);
  if (!valid) return;

  var orig = val('program-orig-code');
  var p = orig ? go.UpdateProgram(orig, code, name, col) : go.AddProgram(code, name, col);
  p.then(function() {
    toast('Program saved successfully'); closeModal('program');
    go.ListPrograms().then(function(d) { programs = d || []; filtered.program = programs; original.program = programs.slice(); pages.program = 1; renderTable('program', filtered.program); fillDropdown('f-student-program', programs, 'Code', 'Name'); });
  }).catch(function(e) { showErr('program-code', e); });
}

function submitCollege() {
  var code = val('f-college-code');
  var name = val('f-college-name');

  var valid = runValidations([
    ['college-code', validateCode(code, 'College code')],
    ['college-name', validateLabel(name, 'College name')],
  ]);
  if (!valid) return;

  var orig = val('college-orig-code');
  var p = orig ? go.UpdateCollege(orig, code, name) : go.AddCollege(code, name);
  p.then(function() {
    toast('College saved successfully'); closeModal('college');
    go.ListColleges().then(function(d) { colleges = d || []; filtered.college = colleges; original.college = colleges.slice(); pages.college = 1; renderTable('college', filtered.college); fillDropdown('f-program-college', colleges, 'Code', 'Name'); });
  }).catch(function(e) { showErr('college-code', e); });
}

function askDelete(type, key, label) {
  document.getElementById('confirm-text').innerHTML =
    'Are you sure you want to delete <strong>' + label + '</strong>? This action cannot be undone.';
  deleteFn = function() {
    var p = type === 'student' ? go.DeleteStudent(key) : type === 'program' ? go.DeleteProgram(key) : go.DeleteCollege(key);
    p.then(function() {
      toast(type.charAt(0).toUpperCase() + type.slice(1) + ' deleted');
      closeModal('confirm');
      loadAll();
    }).catch(function(e) { toast(e, 'error'); closeModal('confirm'); });
  };
  openModal('confirm');
}