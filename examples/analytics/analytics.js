/* Anonymous, allowlisted participation events. Never capture form values or identities. */
(function () {
  if (window.ideaHubTrack) return;
  var hosts = ['YOUR_COMMUNITY_HOST'];
  var events = ['$pageview', 'vote_cast', 'idea_submitted', 'contribution_submitted', 'interest_signed_up', 'demo_clicked'];
  var paths = ['/', '/ideas', '/submit', '/participate', '/join', '/about', '/resources', '/tv', '/guide', '/room', '/slides'];
  var url = new URL(location.href), memory = {}, seen = new Set();
  function read(storage, key) { try { return storage.getItem(key); } catch { return memory[key] || null; } }
  function write(storage, key, value) { memory[key] = value; try { storage.setItem(key, value); } catch { /* Storage is optional. */ } }
  // Storage access itself can throw in privacy-restricted browsers.
  var local, tab;
  try { local = window.localStorage; tab = window.sessionStorage; } catch { /* Use memory. */ }
  var test = url.searchParams.get('analytics_test');
  if (test === '1' || document.querySelector('[data-analytics-owner]')) write(local, 'sac_analytics_excluded', '1');
  if (test === '0') write(local, 'sac_analytics_excluded', '0');
  var verification = test === 'verify'; // One-page diagnostic only; every event is marked as test data.
  function blocked() { return (!verification && (navigator.webdriver === true || /headlesschrome|lighthouse|bot\b|crawler|spider/i.test(navigator.userAgent || ''))) || !hosts.includes(location.hostname) || location.pathname.startsWith('/admin') || navigator.doNotTrack === '1' || navigator.globalPrivacyControl || (!verification && read(local, 'sac_analytics_excluded') === '1'); }
  function label(value) { return typeof value === 'string' && /^[a-z0-9_-]{1,80}$/i.test(value) ? value.toLowerCase() : ''; }
  function path() { return paths.includes(location.pathname) ? location.pathname : '/other'; }
  function parsed(storage, key) { try { return JSON.parse(read(storage, key) || 'null'); } catch { return null; } }
  var id = read(local, 'sac_analytics_id') || crypto.randomUUID();
  var session = parsed(tab, 'sac_analytics_session');
  if (!session || !session.last || Date.now() - session.last > 1800000) session = {id: crypto.randomUUID()};
  var referrer = '';
  try { var host = new URL(document.referrer).hostname; if (!hosts.includes(host)) referrer = host; } catch { /* Direct arrival. */ }
  var utms = {};
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(function (key) { var value = label(url.searchParams.get(key)); if (value) utms[key] = value; });
  if (!session.attribution || utms.utm_source || referrer) {
    var source = utms.utm_source || referrer || 'direct';
    if (!utms.utm_source) {
      if (/(^|\.)reddit\.com$/.test(referrer)) source = 'reddit';
      if (/(^|\.)linkedin\.com$/.test(referrer)) source = 'linkedin';
      if (/(^|\.)(twitter\.com|x\.com|t\.co)$/.test(referrer)) source = 'x';
      if (/(^|\.)instagram\.com$/.test(referrer)) source = 'instagram';
    }
    session.attribution = Object.assign({}, utms, {source: source, medium: utms.utm_medium || (referrer ? 'referral' : 'none'), campaign: utms.utm_campaign || 'none', referrer_domain: referrer || '$direct', landing_page: path()});
  }
  var first = parsed(local, 'sac_analytics_first');
  if (!first || !first.at || Date.now() - first.at > 2592000000) first = {at: Date.now(), source: session.attribution.source, medium: session.attribution.medium, campaign: session.attribution.campaign};
  function track(event, supplied, once) {
    try {
      if (blocked() || !events.includes(event)) return;
      if (once && seen.has(once)) return;
      var dedupeKey = once ? 'sac_event_' + once : '';
      if (dedupeKey && read(tab, dedupeKey)) return;
      var properties = Object.assign({}, session.attribution, {$process_person_profile: false, $geoip_disable: true, $session_id: session.id, $host: location.host, $pathname: path(), $current_url: location.origin + path(), $referring_domain: session.attribution.referrer_domain, $lib: 'idea-hub', tracking_version: 3, is_test: verification, first_source: first.source, first_medium: first.medium, first_campaign: first.campaign});
      supplied = supplied || {};
      if (/^(?:[a-z0-9]+(?:-[a-z0-9]+)*)$/.test(supplied.idea_id || '') && supplied.idea_id.length <= 100) properties.idea_id = supplied.idea_id;
      if (['support','solution','resources','funding'].includes(supplied.contribution_kind)) properties.contribution_kind = supplied.contribution_kind;
      if (['board','quick_form','wizard','interest_form','project_card','idea_detail'].includes(supplied.placement)) properties.placement = supplied.placement;
      if (typeof supplied.vote_changed === 'boolean') properties.vote_changed = supplied.vote_changed;
      var eventId = crypto.randomUUID();
      properties.$insert_id = eventId;
      session.last = Date.now();
      write(local, 'sac_analytics_id', id); write(tab, 'sac_analytics_session', JSON.stringify(session)); write(local, 'sac_analytics_first', JSON.stringify(first));
      if (once) seen.add(once);
      if (dedupeKey) write(tab, dedupeKey, '1');
      fetch('https://us.i.posthog.com/i/v0/e/', {method:'POST',headers:{'Content-Type':'application/json'},keepalive:true,body:JSON.stringify({api_key:'YOUR_POSTHOG_PROJECT_TOKEN',uuid:eventId,distinct_id:id,event:event,properties:properties,timestamp:new Date().toISOString()})}).catch(function () { /* Analytics never blocks participation. */ });
    } catch { /* Analytics never blocks participation. */ }
  }
  window.ideaHubTrack = track;
  track('$pageview');
  (window.ideaHubQueue || []).forEach(function (args) { track.apply(null, args); });
  window.ideaHubQueue = [];
  function demoClick(e) {
    if (e.type === 'auxclick' && e.button !== 1) return;
    var link = e.target && e.target.closest && e.target.closest('a[data-analytics-demo]');
    if (!link) return;
    try { if (hosts.includes(new URL(link.href).hostname) || new URL(link.href).protocol !== 'https:') return; } catch { return; }
    track('demo_clicked', {idea_id:link.getAttribute('data-analytics-demo'),placement:link.getAttribute('data-analytics-placement')});
  }
  document.addEventListener('click', demoClick);
  document.addEventListener('auxclick', demoClick);
})();
