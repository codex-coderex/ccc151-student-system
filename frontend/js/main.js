// entry point — wires up all event listeners on load
window.addEventListener('load', function() {
  loadAll();
  initTheme();
  initResize();

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
    filtered.student = students.filter(function(s) {
      return (s.ID + s.FirstName + s.LastName + s.ProgramCode).toLowerCase().includes(q);
    });
    pages.student = 1;
    renderTable('student', filtered.student);
  };
  document.getElementById('program-search').oninput = function() {
    var q = this.value.toLowerCase();
    var base = programs.filter(function(p) {
      return (p.Code + p.Name + p.CollegeCode).toLowerCase().includes(q);
    });
    filtered.program = programCollegeFilter
      ? base.filter(function(p) { return p.CollegeCode === programCollegeFilter; })
      : base;
    pages.program = 1;
    renderTable('program', filtered.program);
  };
  document.getElementById('college-search').oninput = function() {
    var q = this.value.toLowerCase();
    filtered.college = colleges.filter(function(c) {
      return (c.Code + c.Name).toLowerCase().includes(q);
    });
    pages.college = 1;
    renderTable('college', filtered.college);
  };
});
