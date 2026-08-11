/**
 * Progressive enhancement only.
 *
 * Routing is the URL fragment and the layout is driven by CSS
 * (`:target` + `:has()`), so the page is fully navigable with this
 * file removed. What it adds:
 *   - Escape closes an open case study.
 *   - Fragment navigation lands at the top of the work section
 *     (or on the panel itself, when the layout is stacked).
 *   - An exit animation on the panel being closed.
 *   - Section reveals, and the pipeline diagram building in sequence.
 *
 * Anything that starts an element hidden is gated on the `.motion`
 * class set by the head script — see index.html. If that class is
 * absent, every rule here is a no-op and the page is simply static.
 */
(function () {
  'use strict';

  var HOME = '#top';
  var EXIT_MS = 200; // must match the panelOut duration in styles.css
  var root = document.documentElement;
  var motion = root.classList.contains('motion');

  // Below this the rail stacks above the panel instead of beside it.
  var stacked = window.matchMedia('(max-width: 900px)');

  var busy = false;

  function openPanel() {
    return document.querySelector('.panel:target');
  }

  /**
   * Design behaviour: jump (not smooth-scroll) to just above #work.
   * Stacked layouts land on the panel itself — landing on #work there
   * would put the collapsed index between you and what you tapped.
   */
  function settleScroll() {
    var panel = openPanel();
    var anchor = null;

    if (panel) anchor = stacked.matches ? panel : document.getElementById('work');

    var top = anchor ? Math.max(0, anchor.offsetTop - 28) : 0;
    window.scrollTo({ top: top, behavior: 'auto' });
  }

  function commit(hash) {
    // Suppress the smooth scroll the hash change would otherwise trigger,
    // so the state swap reads as one cut rather than a scroll animation.
    var previous = root.style.scrollBehavior;
    var settled = false;

    function settle() {
      if (settled) return;
      settled = true;
      settleScroll();
      root.style.scrollBehavior = previous;
      busy = false;
    }

    root.style.scrollBehavior = 'auto';
    location.hash = hash;

    // rAF lands before paint; the timer is a fallback for when rAF is
    // parked (background tab), so scroll-behavior can never stay stuck.
    requestAnimationFrame(settle);
    setTimeout(settle, 120);
  }

  function navigate(hash) {
    if (busy) return;
    if (location.hash === hash) {
      settleScroll();
      return;
    }

    var leaving = openPanel();
    if (!leaving || !motion) {
      commit(hash);
      return;
    }

    busy = true;
    leaving.classList.add('is-leaving');

    var done = false;
    function finish() {
      if (done) return;
      done = true;
      leaving.removeEventListener('animationend', onEnd);
      leaving.classList.remove('is-leaving');
      commit(hash);
    }
    // Descendant animations bubble, so only the panel's own counts.
    function onEnd(event) {
      if (event.target === leaving) finish();
    }

    leaving.addEventListener('animationend', onEnd);
    setTimeout(finish, EXIT_MS + 120);
  }

  document.addEventListener('click', function (event) {
    var link = event.target.closest('a[data-nav]');
    if (!link || event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
    event.preventDefault();
    navigate(link.getAttribute('href'));
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && openPanel()) navigate(HOME);
  });

  // Once the reader has navigated even once, the deep-link suppression
  // has served its purpose — returning to that panel should animate.
  window.addEventListener('hashchange', function () {
    root.removeAttribute('data-deep-link');
  }, { once: true });

  var sections = document.querySelectorAll('.panel-section');

  if (motion && !('IntersectionObserver' in window)) {
    // Sections start hidden in CSS; without an observer to reveal them
    // the case studies would be blank. Show everything instead.
    sections.forEach(function (section) { section.classList.add('is-visible'); });
  } else if (motion) {
    // Reveal panel sections as they come into view, and let the section
    // holding the pipeline diagram trigger its build. Sections inside a
    // display:none panel report no intersection until the panel opens.
    var reveal = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        reveal.unobserve(entry.target); // once only
      });
    }, { rootMargin: '0px 0px -12% 0px' });

    sections.forEach(function (section) { reveal.observe(section); });
  }

  if (motion) {
    // Retire the arrival sequence so it cannot replay on return home.
    setTimeout(function () { root.classList.add('entered'); }, 1300);
  }

  // Deep link: land in the right place on first paint.
  if (openPanel()) requestAnimationFrame(settleScroll);
})();
