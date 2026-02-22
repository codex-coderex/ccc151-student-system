// data loading and CRUD submit/delete handlers
function loadAll() {
  go.ListColleges().then(function(d) {
    colleges = d || []; filtered.college = colleges; pages.college = 1;
    renderTable('college', filtered.college);
    fillDropdown('f-program-college', colleges, 'Code', 'Name');
  });
  go.ListPrograms().then(function(d) {
    programs = d || []; filtered.program = programs; pages.program = 1;
    renderTable('program', filtered.program);
    fillDropdown('f-student-program', programs, 'Code', 'Name');
  });
  go.ListStudents().then(function(d) {
    students = d || []; filtered.student = students; pages.student = 1;
    renderTable('student', filtered.student);
  });
}

function submitStudent() {
  var id = document.getElementById('f-student-id').value.trim();
  var fn = document.getElementById('f-student-firstname').value.trim();
  var ln = document.getElementById('f-student-lastname').value.trim();
  var pr = document.getElementById('f-student-program').value;
  var yr = document.getElementById('f-student-year').value;
  var gn = document.getElementById('f-student-gender').value;
  if (!id || !fn || !ln || !pr || !yr || !gn) { showErr('student-id', 'All fields are required'); return; }
  var orig = document.getElementById('student-orig-id').value;
  var p = orig ? go.UpdateStudent(orig, id, fn, ln, pr, yr, gn) : go.AddStudent(id, fn, ln, pr, yr, gn);
  p.then(function() {
    toast('Student saved successfully'); closeModal('student');
    go.ListStudents().then(function(d) {
      students = d || []; filtered.student = students; pages.student = 1;
      renderTable('student', filtered.student);
    });
  }).catch(function(e) { showErr('student-id', e); });
}

function submitProgram() {
  var code = document.getElementById('f-program-code').value.trim();
  var name = document.getElementById('f-program-name').value.trim();
  var col  = document.getElementById('f-program-college').value;
  if (!code || !name || !col) { showErr('program-code', 'All fields are required'); return; }
  var orig = document.getElementById('program-orig-code').value;
  var p = orig ? go.UpdateProgram(orig, code, name, col) : go.AddProgram(code, name, col);
  p.then(function() {
    toast('Program saved successfully'); closeModal('program');
    go.ListPrograms().then(function(d) {
      programs = d || []; filtered.program = programs; pages.program = 1;
      renderTable('program', filtered.program);
      fillDropdown('f-student-program', programs, 'Code', 'Name');
    });
  }).catch(function(e) { showErr('program-code', e); });
}

function submitCollege() {
  var code = document.getElementById('f-college-code').value.trim();
  var name = document.getElementById('f-college-name').value.trim();
  if (!code || !name) { showErr('college-code', 'All fields are required'); return; }
  var orig = document.getElementById('college-orig-code').value;
  var p = orig ? go.UpdateCollege(orig, code, name) : go.AddCollege(code, name);
  p.then(function() {
    toast('College saved successfully'); closeModal('college');
    go.ListColleges().then(function(d) {
      colleges = d || []; filtered.college = colleges; pages.college = 1;
      renderTable('college', filtered.college);
      fillDropdown('f-program-college', colleges, 'Code', 'Name');
    });
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
