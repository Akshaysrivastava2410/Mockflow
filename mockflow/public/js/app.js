const $ = (id) => document.getElementById(id);

const colors = {
  GET: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  POST: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20',
  PUT: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  PATCH: 'text-sky-400 bg-sky-400/10 border-sky-400/20',
  DELETE: 'text-red-400 bg-red-400/10 border-red-400/20',
};

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function toast(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  clearTimeout(toast.t);
  toast.t = setTimeout(() => t.classList.add('hidden'), 1800);
}

const toggleModal = (show) => {
  $('modal').classList.toggle('hidden', !show);
  $('error').classList.add('hidden');
  if (show) $('route').focus();
};

async function load() {
  const res = await fetch('/list-apis');
  const apis = await res.json();
  $('statTotal').textContent = apis.length;
  $('statGet').textContent = apis.filter((a) => a.method === 'GET').length;
  $('statHits').textContent = apis.reduce((n, a) => n + (a.hits || 0), 0);
  $('empty').classList.toggle('hidden', apis.length > 0);
  $('tbody').innerHTML = apis
    .map((a) => {
      const url = `${location.origin}/mock/${a.routeName}`;
      const preview = esc(JSON.stringify(a.responseJson).slice(0, 60));
      return `
      <tr class="hover:bg-white/[0.02] transition">
        <td class="px-5 py-3"><span class="px-2 py-0.5 rounded border text-xs font-medium ${colors[a.method] || ''}">${a.method}</span></td>
        <td class="px-5 py-3 font-mono text-zinc-200">/mock/${esc(a.routeName)}</td>
        <td class="px-5 py-3 font-mono text-zinc-400">${a.statusCode || 200}${a.delayMs ? ` · ${a.delayMs}ms` : ''}</td>
        <td class="px-5 py-3 font-mono text-xs text-zinc-500 hidden md:table-cell max-w-xs truncate">${preview}</td>
        <td class="px-5 py-3 text-zinc-400 hidden md:table-cell">${a.hits || 0}</td>
        <td class="px-5 py-3 text-right whitespace-nowrap">
          <button data-copy="${esc(url)}" class="text-xs text-zinc-400 hover:text-white px-2 py-1 rounded hover:bg-white/5">Copy URL</button>
          <button data-del="${a._id}" class="text-xs text-zinc-400 hover:text-red-400 px-2 py-1 rounded hover:bg-white/5">Delete</button>
        </td>
      </tr>`;
    })
    .join('');
}

async function save() {
  const err = $('error');
  const showErr = (m) => { err.textContent = m; err.classList.remove('hidden'); };
  err.classList.add('hidden');

  const routeName = $('route').value.trim().replace(/^\/+/, '');
  if (!routeName) return showErr('Enter a route path, for example “users”.');

  let responseJson;
  try { responseJson = JSON.parse($('json').value); }
  catch { return showErr('The JSON response is not valid. Check for missing quotes or commas.'); }

  const res = await fetch('/create-api', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      routeName,
      method: $('method').value,
      responseJson,
      statusCode: $('status').value,
      delayMs: $('delay').value,
    }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return showErr(data.error || 'Could not create the API. Try again.');
  }

  toggleModal(false);
  $('route').value = '';
  toast('Endpoint created');
  load();
}

$('openModal').onclick = () => toggleModal(true);
$('closeModal').onclick = $('cancel').onclick = () => toggleModal(false);
$('modal').onclick = (e) => { if (e.target === $('modal')) toggleModal(false); };
$('save').onclick = save;
document.addEventListener('keydown', (e) => e.key === 'Escape' && toggleModal(false));

$('tbody').addEventListener('click', async (e) => {
  const { copy, del } = e.target.dataset;
  if (copy) { await navigator.clipboard.writeText(copy); toast('URL copied'); }
  if (del) { await fetch(`/delete-api/${del}`, { method: 'DELETE' }); toast('Endpoint deleted'); load(); }
});

load();
