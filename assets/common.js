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

// Local calendar date (YYYY-MM-DD) so day comparisons match the date strings
// events carry, regardless of UTC offset.
function todayStr() {
  const d = new Date();
  const pad = n => String(n).padStart(2, '0');
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
}

// Shown in place of a missing (or broken) event photo: the logo of the site the event
// came from. dark = white/light logo that needs the dark tile.
const SOURCE_LOGOS = {
  arcane_city: { file: 'arcane_city.png' },
  bottlerocket: { file: 'bottlerocket.png' },
  brillobox: { file: 'brillobox.png' },
  carnegie_museums: { file: 'carnegie_museums.svg', dark: true },
  contemporary_craft: { file: 'contemporary_craft.png' },
  east_end_brewing: { file: 'east_end_brewing.png', dark: true },
  eventbrite: { file: 'eventbrite.png' },
  new_hazlett: { file: 'new_hazlett.png' },
  spirit: { file: 'spirit.png', dark: true },
  ticketmaster: { file: 'ticketmaster.svg' },
  velum: { file: 'velum.png', dark: true },
  visitpittsburgh: { file: 'visitpittsburgh.svg', dark: true },
};

// {src, cls} for the fallback image: the first source with a logo, else the category placeholder.
function fallbackImage(e) {
  const s = e.sources.find(s => SOURCE_LOGOS[s.source]);
  if (!s) return { src: 'static/placeholders/' + e.category.css + '.svg', cls: 'card-media' };
  const logo = SOURCE_LOGOS[s.source];
  return { src: 'static/logos/' + logo.file, cls: 'card-media source-logo' + (logo.dark ? ' source-logo--dark' : '') };
}

// The card's image slot. Photos are shown whole (not cropped) over a blurred copy of
// themselves that fills the slot; a photo that fails to load swaps to the fallback.
function cardMedia(e) {
  const fallback = fallbackImage(e);
  const alt = escapeHtml(e.title);
  if (!e.image_url) {
    return '<div class="' + fallback.cls + '"><img loading="lazy" src="' + fallback.src + '" alt="' + alt + '"></div>';
  }
  const cssUrl = e.image_url.replace(/["'()\\\s]/g, c => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'));
  return '<div class="card-media photo" style="--media-bg:url(\'' + escapeHtml(cssUrl) + '\')">' +
    '<img loading="lazy" src="' + escapeHtml(e.image_url) + '" alt="' + alt + '" ' +
      'onerror="this.onerror=null;this.src=\'' + fallback.src + '\';this.parentNode.className=\'' + fallback.cls + '\'">' +
    '</div>';
}

function eventCard(e) {
  const tags = e.tags.map(t => '<span class="tag">' + escapeHtml(t) + '</span>').join('');
  const sources = e.sources.map(s => '<span class="source-link">[' + escapeHtml(s.source) + ']</span>').join('');
  return '<div class="card">' +
    cardMedia(e) +
    '<div class="card-body">' +
      '<div class="card-title-row">' +
        '<span class="cat-icon" title="' + escapeHtml(e.category.label) + '">' + e.category.icon + '</span>' +
        '<a class="card-title" href="' + escapeHtml(e.url) + '" target="_blank" rel="noopener">' + escapeHtml(e.title) + '</a>' +
        '<a class="btn-icon" href="' + escapeHtml(e.gcal_link) + '" target="_blank" rel="noopener" ' +
          'title="Add to Google Calendar" aria-label="Add to Google Calendar">&#128197;</a>' +
      '</div>' +
      '<div class="card-meta"><time datetime="' + escapeHtml(e.start_dt) + '">' + escapeHtml(e.date_short) + '</time>' + (e.time_range ? ' &middot; ' + escapeHtml(e.time_range) : '') +
        (e.venue_name ? ' &middot; ' + escapeHtml(e.venue_name) : '') + sources + '</div>' +
      (tags ? '<div>' + tags + '</div>' : '') +
      '<p class="blurb">' + escapeHtml(e.summary) + '</p>' +
    '</div></div>';
}

// Injects schema.org Event structured data for the soonest events, so search
// engines that execute the page script can surface event rich results.
function injectEventJsonLd(events, limit) {
  const items = events.slice(0, limit).map(e => {
    const item = {
      '@type': 'Event',
      name: e.title,
      startDate: e.all_day ? e.start_dt.slice(0, 10) : e.start_dt,
      eventStatus: 'https://schema.org/EventScheduled',
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      url: e.url,
    };
    if (e.end_dt) item.endDate = e.end_dt;
    if (e.image_url) item.image = e.image_url;
    if (e.summary) item.description = e.summary;
    if (e.venue_name || e.address) {
      item.location = { '@type': 'Place' };
      if (e.venue_name) item.location.name = e.venue_name;
      if (e.address) item.location.address = e.address;
    }
    return item;
  });
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify({ '@context': 'https://schema.org', '@graph': items });
  document.head.appendChild(script);
}

function dayHeading(isoDate) {
  const d = new Date(isoDate + 'T00:00:00');
  return '<div class="day-heading">' +
    d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) + '</div>';
}
