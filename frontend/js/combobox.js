
// usage: var cb = createCombobox(inputId, listId, hiddenId, getItems, onSelect, dependentId)
// getItems()   — returns array of {Code, Name} objects to show
// onSelect(item|null) — called when user picks an item or clears
// dependentId  — optional hidden input id to clear when this combobox clears

// generic combobox factory
function createCombobox(inputId, listId, hiddenId, getItems, onSelect) {
  var input  = el(inputId);
  var list   = el(listId);
  var hidden = el(hiddenId);

  function renderList(query) {
    var q = (query || '').toLowerCase();
    var items = getItems().filter(function(item) {
      return (item.Code + item.Name).toLowerCase().includes(q);
    });

    list.innerHTML = '';

    if (items.length === 0) {
      list.innerHTML = '<div class="combobox-empty">No results found</div>';
    } else {
      items.forEach(function(item) {
        var div = document.createElement('div');
        div.className = 'combobox-item';
        div.textContent = item.Code + ' \u2014 ' + item.Name;
        div.addEventListener('mousedown', function(e) {
          e.preventDefault();
          input.value  = item.Code + ' \u2014 ' + item.Name;
          hidden.value = item.Code;
          list.classList.remove('open');
          if (onSelect) onSelect(item);
        });
        list.appendChild(div);
      });
    }

    list.classList.add('open');
  }

  function clear() {
    input.value  = '';
    hidden.value = '';
    list.classList.remove('open');
    if (onSelect) onSelect(null);
  }

  input.addEventListener('input', function() {
    if (!this.value.trim()) { hidden.value = ''; if (onSelect) onSelect(null); }
    renderList(this.value);
  });

  input.addEventListener('focus', function() {
    renderList(this.value);
  });

  input.addEventListener('blur', function() {
    setTimeout(function() { list.classList.remove('open'); }, 150);
    if (!hidden.value) input.value = '';
  });

  var comboEl = input.closest('.combobox');
  document.addEventListener('click', function(e) {
    if (comboEl && !comboEl.contains(e.target)) list.classList.remove('open');
  });

  return {
    set: function(code) {
      if (!code) { clear(); return; }
      var item = getItems().find(function(x) { return x.Code === code; });
      if (item) { input.value = item.Code + ' \u2014 ' + item.Name; hidden.value = item.Code; }
    },
    clear: clear
  };
}

// combobox instances 
var collegeCombobox;        // student modal: college
var programCombobox;        // student modal: program
var programCollegeCombobox; // program modal: college

function initComboboxes() {
  // student modal — college (filters program combobox on select)
  collegeCombobox = createCombobox(
    'f-student-college-search',
    'college-combobox-list',
    'f-student-college',
    function() { return colleges; },
    function(c) {
      // reset program when college changes
      if (programCombobox) programCombobox.clear();
    }
  );

  // student modal — program (filtered by selected college)
  programCombobox = createCombobox(
    'f-student-program-search',
    'program-combobox-list',
    'f-student-program',
    function() {
      var code = el('f-student-college').value;
      return code
        ? programs.filter(function(p) { return p.CollegeCode === code; })
        : programs;
    },
    function(p) {
      // when program is selected, populate college from program's college code
      if (p && p.CollegeCode) collegeCombobox.set(p.CollegeCode);
    }
  );

  // program modal — college
  programCollegeCombobox = createCombobox(
    'f-program-college-search',
    'program-college-combobox-list',
    'f-program-college',
    function() { return colleges; },
    null
  );
}
