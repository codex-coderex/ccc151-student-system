// theme toggle
function initTheme() {
  var saved = localStorage.getItem('theme') || 'light';
  setTheme(saved);
  document.getElementById('theme-toggle').addEventListener('click', function() {
    var current = document.documentElement.getAttribute('data-theme');
    setTheme(current === 'light' ? 'dark' : 'light');
  });
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  document.getElementById('theme-label').textContent = theme === 'light' ? 'Light Mode' : 'Dark Mode';
}
