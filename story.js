// Scroll story: which step is in the middle of the viewport decides which
// layer the sticky frame shows, and how far through that step the reader is
// drives the pan of a tall page or a slight drift of a crop. Everything is
// computed from scroll position in one animation frame, so it is cheap and
// stays in sync with the page rather than running on its own clock.
(function () {
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var stories = Array.prototype.slice.call(document.querySelectorAll('.story'));
  if (!stories.length) return;

  function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

  // A step whose page pans through the frame is made tall enough that the
  // page moves at most one pixel per pixel scrolled: the pan runs over the
  // middle 80% of the step, so the step is the pan distance over 0.8, with
  // the stylesheet's height as the floor. Re-run when an image arrives or
  // the viewport changes, since both move the answer.
  function sizeLongSteps() {
    stories.forEach(function (story) {
      var stage = story.querySelector('.stage');
      var shown = stage && getComputedStyle(stage).display !== 'none';
      Array.prototype.forEach.call(story.querySelectorAll('.step--long'), function (step) {
        var layer = story.querySelector('.layer[data-layer="' + step.getAttribute('data-step') + '"]');
        var pan = layer && layer.querySelector('img.pan');
        if (!shown || !pan || !pan.naturalWidth) { step.style.minHeight = ''; return; }
        var frameH = layer.clientHeight, imgH = pan.naturalHeight / pan.naturalWidth * layer.clientWidth;
        var need = (imgH - frameH) / 0.8;
        step.style.minHeight = '';
        step.style.minHeight = Math.max(step.getBoundingClientRect().height, need) + 'px';
      });
    });
  }

  function update() {
    var vh = window.innerHeight, mid = vh * 0.5;
    stories.forEach(function (story) {
      var stage = story.querySelector('.stage');
      if (!stage || getComputedStyle(stage).display === 'none') return;
      var steps = Array.prototype.slice.call(story.querySelectorAll('.step'));
      var active = steps[0], progress = 0;
      steps.forEach(function (step) {
        var r = step.getBoundingClientRect();
        if (r.top <= mid) { active = step; progress = clamp((mid - r.top) / r.height); }
      });
      var key = active.getAttribute('data-step');
      Array.prototype.forEach.call(story.querySelectorAll('.layer'), function (layer) {
        var on = layer.getAttribute('data-layer') === key;
        layer.classList.toggle('active', on);
        if (!on || reduce) return;
        var pan = layer.querySelector('img.pan');
        var flip = layer.querySelector('.flip');
        if (flip) {
          // Before gives way to after across the middle of the step.
          flip.style.setProperty('--flip', clamp((progress - 0.35) / 0.3).toFixed(3));
        }
        if (pan) {
          // Pan the long page through the frame over the middle 80% of the step.
          var frameH = layer.clientHeight, imgH = pan.getBoundingClientRect().height;
          var p = clamp((progress - 0.1) / 0.8);
          pan.style.transform = 'translateY(' + (-(imgH - frameH) * p).toFixed(1) + 'px)';
        } else {
          Array.prototype.forEach.call(layer.querySelectorAll('.crop img'), function (img) {
            img.style.transform = 'translateY(' + ((0.5 - progress) * 4).toFixed(2) + '%)';
          });
        }
      });
    });
  }

  // The header's small brand only appears once the big wordmark has gone.
  var header = document.querySelector('header'), wordmark = document.getElementById('wordmark');
  function updateHeader() {
    if (!header) return;
    var passed = !wordmark || wordmark.getBoundingClientRect().bottom < 0;
    header.classList.toggle('scrolled', passed);
  }

  var queued = false;
  function schedule() { if (!queued) { queued = true; requestAnimationFrame(function () { queued = false; update(); updateHeader(); }); } }
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', function () { sizeLongSteps(); schedule(); });
  window.addEventListener('load', function () { sizeLongSteps(); update(); updateHeader(); });
  Array.prototype.forEach.call(document.querySelectorAll('img.pan'), function (img) {
    img.addEventListener('load', function () { sizeLongSteps(); schedule(); });
  });
  sizeLongSteps(); update(); updateHeader();
})();
