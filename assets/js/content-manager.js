(() => {
  'use strict';
  const files = ['site.json','software.json','photography.json','research.json','music.json','fitness.json','education.json','_media-template.json'];
  const select = document.getElementById('fileSelect');
  const editor = document.getElementById('editor');
  const status = document.getElementById('status');
  files.forEach(f => select.insertAdjacentHTML('beforeend', `<option value="${f}">${f}</option>`));

  function setStatus(message, type='') {
    status.className = `manager-status mb-3 ${type}`;
    status.textContent = message;
  }
  async function load() {
    const file = select.value;
    try {
      const r = await fetch(`data/${file}`, {cache:'no-store'});
      if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
      const data = await r.json();
      editor.value = JSON.stringify(data, null, 2);
      setStatus(`${file} loaded successfully.`, 'ok');
    } catch (e) { setStatus(`Could not load ${file}: ${e.message}. Use Live Server.`, 'error'); }
  }
  function parse() {
    try { return JSON.parse(editor.value); }
    catch (e) { setStatus(`Invalid JSON: ${e.message}`, 'error'); return null; }
  }
  function validate() {
    const d = parse(); if (!d) return false;
    setStatus(`${select.value} is valid JSON.`, 'ok'); return true;
  }
  function format() {
    const d = parse(); if (!d) return;
    editor.value = JSON.stringify(d, null, 2); setStatus('JSON formatted.', 'ok');
  }
  function download() {
    const d = parse(); if (!d) return;
    const blob = new Blob([JSON.stringify(d, null, 2) + '\n'], {type:'application/json'});
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = select.value; a.click(); URL.revokeObjectURL(a.href);
    setStatus(`${select.value} downloaded. Replace the matching file in data/.`, 'ok');
  }
  select.addEventListener('change', load);
  document.getElementById('reloadBtn').addEventListener('click', load);
  document.getElementById('formatBtn').addEventListener('click', format);
  document.getElementById('validateBtn').addEventListener('click', validate);
  document.getElementById('downloadBtn').addEventListener('click', download);
  load();
})();
