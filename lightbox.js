(function () {
  var imgs = Array.prototype.slice.call(document.querySelectorAll('img.zoomable'));
  if (!imgs.length) return;
  var lb = document.getElementById('lightbox');
  var lbImg = document.getElementById('lb-img');
  var i = 0;
  function show(n) { i = (n + imgs.length) % imgs.length; lbImg.src = imgs[i].src; lbImg.alt = imgs[i].alt; }
  function open(n) { show(n); lb.classList.add('open'); lb.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; }
  function close() { lb.classList.remove('open'); lb.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; }
  imgs.forEach(function (im, idx) { im.addEventListener('click', function () { open(idx); }); });
  document.getElementById('lb-close').addEventListener('click', close);
  document.getElementById('lb-prev').addEventListener('click', function (e) { e.stopPropagation(); show(i - 1); });
  document.getElementById('lb-next').addEventListener('click', function (e) { e.stopPropagation(); show(i + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
  document.addEventListener('keydown', function (e) {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') show(i - 1);
    else if (e.key === 'ArrowRight') show(i + 1);
  });
})();
