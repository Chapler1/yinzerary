// Shared helpers for the static Event Bot site. No build step: pages load this
// file plus the JSON the backend publishes to data/ each day.

function escapeHtml(s) {
  const div = document.createElement('div');
  div.textContent = s == null ? '' : s;
  return div.innerHTML;
}

async function loadJson(path) {
  const resp = await fetch(path, { cache: 'no-cache' });
  if (!resp.ok) throw new Error(path + ': HTTP ' + resp.status);
  return resp.json();
}

function showLoadError(container, err) {
  container.innerHTML = '<div class="empty">Couldn\'t load event data (' + escapeHtml(err.message) +
    '). If you opened this file directly, serve the folder instead, e.g. ' +
    '<code>python -m http.server -d docs</code>.</div>';
}

function stampText(generatedAt) {
  const d = new Date(generatedAt);
  return isNaN(d) ? '' : 'Data updated ' + d.toLocaleString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  });
}

function placeholderFor(e) {
  return 'static/placeholders/' + e.category.css + '.svg';
}

function eventCard(e) {
  const tags = e.tags.map(t => '<span class="tag">' + escapeHtml(t) + '</span>').join('');
  const sources = e.sources.map(s => '<span class="source-link">[' + escapeHtml(s.source) + ']</span>').join('');
  return '<div class="card">' +
    '<img loading="lazy" src="' + escapeHtml(e.image_url || placeholderFor(e)) + '" alt="" ' +
      'onerror="this.onerror=null;this.src=\'' + placeholderFor(e) + '\'">' +
    '<div class="card-body">' +
      '<div class="card-title-row">' +
        '<span class="cat-icon" title="' + escapeHtml(e.category.label) + '">' + e.category.icon + '</span>' +
        '<a class="card-title" href="' + escapeHtml(e.url) + '" target="_blank" rel="noopener">' + escapeHtml(e.title) + '</a>' +
      '</div>' +
      '<div class="card-meta">' + escapeHtml(e.date_short) + ' &middot; ' + escapeHtml(e.time_range) +
        (e.venue_name ? ' &middot; ' + escapeHtml(e.venue_name) : '') + sources + '</div>' +
      (tags ? '<div>' + tags + '</div>' : '') +
      '<p class="blurb">' + escapeHtml(e.summary) + '</p>' +
    '</div></div>';
}

function dayHeading(isoDate) {
  const d = new Date(isoDate + 'T00:00:00');
  return '<div class="day-heading">' +
    d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) + '</div>';
}
