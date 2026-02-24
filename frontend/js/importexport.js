var pendingImport = null;

// export
function exportCSV(type) {
  var fn = type === 'student' ? go.ExportStudents.bind(go)
         : type === 'program' ? go.ExportPrograms.bind(go)
         : go.ExportColleges.bind(go);

  fn().then(function(csvText) {
    if (!csvText) { toast('Nothing to export', 'error'); return; }
    var today    = new Date().toISOString().slice(0, 10);
    var filename = type + 's-' + today + '.csv';
    var blob     = new Blob([csvText], { type: 'text/csv' });
    var url      = URL.createObjectURL(blob);
    var a        = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
    toast('Exported ' + type + 's');
  }).catch(function(e) { toast(e, 'error'); });
}

// import
function importCSV(type, file) {
  var reader = new FileReader();
  reader.onload = function(e) {
    var csvText = e.target.result;
    var previewFn = type === 'student' ? go.PreviewImportStudents.bind(go)
                  : type === 'program' ? go.PreviewImportPrograms.bind(go)
                  : go.PreviewImportColleges.bind(go);

    previewFn(csvText).then(function(result) {
      if (result.Errors && result.Errors.length > 0 && result.Imported === 0 && !result.HasDupes) {
        showImportResult('Import Failed', buildResultHTML(result));
        return;
      }

      if (result.HasDupes) {
        pendingImport = { type: type, csvText: csvText };
        showDupePrompt(result);
      } else {
        commitImport(type, csvText, false);
      }
    }).catch(function(e) { toast(e, 'error'); });
  };
  reader.readAsText(file);
}

function commitImport(type, csvText, merge) {
  var commitFn = type === 'student' ? go.CommitImportStudents.bind(go)
               : type === 'program' ? go.CommitImportPrograms.bind(go)
               : go.CommitImportColleges.bind(go);

  commitFn(csvText, merge).then(function(result) {
    loadAll();
    showImportResult('Import Complete', buildResultHTML(result));
  }).catch(function(e) { toast(e, 'error'); });
}

// ui helpers
function showDupePrompt(result) {
  var count = result.Duplicates ? result.Duplicates.length : 0;
  el('import-dupes-text').textContent = count + ' duplicate' + (count !== 1 ? 's' : '') + ' found:';
  var list = (result.Duplicates || []).map(function(d) {
    return '<div style="padding:4px 0;border-bottom:1px solid var(--border-subtle)">' + d + '</div>';
  }).join('');
  el('import-dupes-list').innerHTML = list;
  openModal('import-dupes');
}

function showImportResult(title, html) {
  el('import-result-title').textContent = title;
  el('import-result-body').innerHTML = html;
  openModal('import-result');
}

function buildResultHTML(result) {
  var html = '';
  if (result.Imported > 0)  html += '<div>✓ ' + result.Imported + ' record(s) imported</div>';
  if (result.Merged > 0)    html += '<div>✓ ' + result.Merged + ' record(s) merged</div>';
  if (result.Skipped > 0)   html += '<div>— ' + result.Skipped + ' duplicate(s) skipped</div>';
  if (result.Warnings && result.Warnings.length > 0) {
    html += '<div style="margin-top:10px;color:var(--warning)">⚠ Warnings:</div>';
    result.Warnings.forEach(function(w) { html += '<div style="color:var(--warning);font-size:12px">' + w + '</div>'; });
  }
  if (result.Errors && result.Errors.length > 0) {
    html += '<div style="margin-top:10px;color:var(--danger)">✕ Errors:</div>';
    result.Errors.forEach(function(e) { html += '<div style="color:var(--danger);font-size:12px">' + e + '</div>'; });
  }
  return html || '<div>No changes made.</div>';
}

// init
function initImportExport() {
  ['student', 'program', 'college'].forEach(function(type) {
    el('btn-export-' + type).onclick = function() { exportCSV(type); };
    el('btn-import-' + type).onclick = function() { el('file-import-' + type).click(); };
    el('file-import-' + type).onchange = function() {
      if (this.files[0]) { importCSV(type, this.files[0]); this.value = ''; }
    };
  });

  el('btn-dupe-merge').onclick = function() {
    if (!pendingImport) return;
    closeModal('import-dupes');
    commitImport(pendingImport.type, pendingImport.csvText, true);
    pendingImport = null;
  };

  el('btn-dupe-skip').onclick = function() {
    if (!pendingImport) return;
    closeModal('import-dupes');
    commitImport(pendingImport.type, pendingImport.csvText, false);
    pendingImport = null;
  };
}