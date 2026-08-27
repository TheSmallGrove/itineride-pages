(function () {
  var bar = document.getElementById('topbar');
  var onScroll = function () { bar.classList.toggle('scrolled', window.scrollY > 8); };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  var items = document.querySelectorAll('.reveal');

  if (!('IntersectionObserver' in window) ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    Array.prototype.forEach.call(items, function (el) { el.classList.add('is-in'); });
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });

  // Cards and plans come in one after the other, so a grid does not pop in all at once.
  var seen = 0;
  Array.prototype.forEach.call(items, function (el) {
    if (el.classList.contains('card') || el.classList.contains('plan')) {
      el.style.transitionDelay = ((seen % 3) * 80) + 'ms';
      seen++;
    }
    io.observe(el);
  });
})();

// The language menu is a <details>: it works without JavaScript, and this only
// adds what markup alone cannot do — close it on Escape or on an outside click.
(function () {
  var menu = document.querySelector('details.lang');
  if (!menu) return;

  document.addEventListener('click', function (e) {
    if (menu.open && !menu.contains(e.target)) menu.open = false;
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menu.open) {
      menu.open = false;
      var s = menu.querySelector('summary');
      if (s) s.focus();
    }
  });
})();

// Every language link in the menu and in the footer carries ?lang=xx. Arriving
// with it means the visitor picked this language by hand, so it is remembered:
// from then on the entry page serves that choice instead of guessing from the
// browser. The marker travels in the URL rather than in a click handler so it
// survives a middle-click, a bookmark, or a link passed to someone else.
//
// index.html reads the marker itself, in the script in its head — it has to
// decide whether to redirect long before this file is parsed. Here it is handled
// for the four translated pages; on index.html the URL is already clean by now.
// Wrapped in try/catch: a browser with storage blocked still works, it just
// forgets the choice.
(function () {
  var asked = (location.search.match(/[?&]lang=([a-zA-Z-]+)/) || [])[1];
  if (!asked) return;

  var code = String(asked).toLowerCase().split('-')[0];
  if (['en', 'it', 'fr', 'es', 'de'].indexOf(code) === -1) return;

  try { localStorage.setItem('itineride.lang', code); } catch (err) {}

  // Keep the address bar clean, and keep what gets bookmarked or shared free of
  // a marker meant for one visit.
  if (window.history && history.replaceState) {
    history.replaceState(null, '', location.pathname + location.hash);
  }
})();

// The storage notice. It asks for nothing: the language preference it describes
// is exempt from consent under Article 5(3), so there is no Accept and no Reject
// — only an acknowledgement, remembered so the bar does not come back. If storage
// is blocked the bar simply returns next visit, which is the harmless failure.
(function () {
  var bar = document.getElementById('notice');
  if (!bar) return;

  var KEY = 'itineride.notice';

  var seen = null;
  try { seen = localStorage.getItem(KEY); } catch (e) {}
  if (seen) return;

  bar.hidden = false;

  var ok = bar.querySelector('button');
  if (!ok) return;

  ok.addEventListener('click', function () {
    bar.hidden = true;
    try { localStorage.setItem(KEY, '1'); } catch (e) {}
  });
})();
