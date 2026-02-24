// entry point 
window.addEventListener('load', function() {
  loadAll();
  initTheme();
  initResize();
  initComboboxes();
  initImportExport();

  // set default student ID year
  setVal('f-student-id-year', new Date().getFullYear());

  // nav
  document.querySelectorAll('.nav-item').forEach(function(navEl) {
    navEl.addEventListener('click', function() {
      document.querySelectorAll('.nav-item').forEach(function(x) { x.classList.remove('active'); });
      document.querySelectorAll('.section').forEach(function(x) { x.classList.remove('active'); });
      navEl.classList.add('active');
      el('section-' + navEl.dataset.section).classList.add('active');
    });
  });

  // cancel buttons
  document.querySelectorAll('.btn-cancel').forEach(function(btn) {
    btn.addEventListener('click', function() { closeModal(btn.dataset.modal); });
  });

  // add buttons
  el('btn-add-student').onclick = function() { openModal('student'); resetForm('student'); };
  el('btn-add-program').onclick = function() { openModal('program'); resetForm('program'); };
  el('btn-add-college').onclick = function() { openModal('college'); resetForm('college'); };

  // submit buttons
  el('btn-submit-student').onclick = submitStudent;
  el('btn-submit-program').onclick = submitProgram;
  el('btn-submit-college').onclick = submitCollege;
  el('btn-confirm-delete').onclick = function() { if (deleteFn) deleteFn(); };

  // search
  el('student-search').oninput = function() {
    var q = this.value.toLowerCase();
    filtered.student = students.filter(function(s) {
      return (s.ID + s.FirstName + s.LastName + s.ProgramCode).toLowerCase().includes(q);
    });
    pages.student = 1;
    renderTable('student', filtered.student);
  };

  el('program-search').oninput = function() {
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

  el('college-search').oninput = function() {
    var q = this.value.toLowerCase();
    filtered.college = colleges.filter(function(c) {
      return (c.Code + c.Name).toLowerCase().includes(q);
    });
    pages.college = 1;
    renderTable('college', filtered.college);
  };
});
