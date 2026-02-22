// utility functions
function showErr(field, msg) {
  var el = document.getElementById('err-' + field);
  if (el) { el.textContent = msg; el.classList.add('show'); }
}

function toast(msg, type) {
  var el = document.createElement('div');
  el.className = 'toast' + (type === 'error' ? ' error' : '');
  el.textContent = msg;
  document.getElementById('toast-container').appendChild(el);
  setTimeout(function() {
    el.style.opacity = '0';
    el.style.transform = 'translateX(16px)';
    setTimeout(function() { el.remove(); }, 300);
  }, 2800);
}
