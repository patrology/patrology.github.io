(function () {
  // Мягкая защита: без контекстного меню и перетаскивания картинок
  document.addEventListener('contextmenu', function (e) {
    if (e.target.closest('img, .frame, .thumbs')) e.preventDefault();
  });
  document.addEventListener('dragstart', function (e) {
    if (e.target.tagName === 'IMG') e.preventDefault();
  });

  var v = document.querySelector('.viewer');
  if (!v) return;
  var count = +v.dataset.count, base = v.dataset.base;
  var img = document.getElementById('slide');
  var counter = document.getElementById('counter');
  var prev = v.querySelector('.nav.prev'), next = v.querySelector('.nav.next');
  var thumbs = document.getElementById('thumbs');
  var frame = v.querySelector('.frame');
  var cur = 1;
  function src(i) { return base + (i < 10 ? '0' : '') + i + '.jpg'; }

  for (var i = 1; i <= count; i++) {
    var b = document.createElement('button');
    b.setAttribute('aria-label', 'Слайд ' + i);
    b.innerHTML = '<img loading="lazy" draggable="false" alt="" src="' + src(i) + '"><span>' + i + '</span>';
    b.addEventListener('click', go.bind(null, i, true));
    thumbs.appendChild(b);
  }

  function go(i, push) {
    cur = Math.max(1, Math.min(count, i));
    img.src = src(cur);
    img.alt = 'Слайд ' + cur;
    counter.textContent = 'Слайд ' + cur + ' из ' + count;
    prev.disabled = cur === 1;
    next.disabled = cur === count;
    [].forEach.call(thumbs.children, function (t, k) { t.classList.toggle('on', k + 1 === cur); });
    if (push) {
      history.replaceState(null, '', '#' + cur);
      var t = thumbs.children[cur - 1];
      if (t && t.scrollIntoView && !document.fullscreenElement) t.scrollIntoView({ block: 'nearest' });
    }
    if (cur < count) new Image().src = src(cur + 1);
    var box = document.getElementById('slide-media');
    if (box) {
      var m = (window.SLIDE_MEDIA || {})[cur];
      box.innerHTML = m || '';
      box.hidden = !m;
    }
  }

  prev.addEventListener('click', function () { go(cur - 1, true); });
  next.addEventListener('click', function () { go(cur + 1, true); });
  frame.addEventListener('click', function (e) {
    var r = frame.getBoundingClientRect();
    go(e.clientX - r.left < r.width / 3 ? cur - 1 : cur + 1, true);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') { e.preventDefault(); go(cur + 1, true); }
    if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); go(cur - 1, true); }
    if (e.key === 'Home') go(1, true);
    if (e.key === 'End') go(count, true);
  });
  var x0 = null;
  frame.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  frame.addEventListener('touchend', function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 40) go(dx < 0 ? cur + 1 : cur - 1, true);
    x0 = null;
  });
  document.getElementById('fs').addEventListener('click', function () {
    if (document.fullscreenElement) document.exitFullscreen();
    else if (frame.requestFullscreen) frame.requestFullscreen();
  });
  window.addEventListener('hashchange', function () { go(parseInt(location.hash.slice(1), 10) || 1, false); });
  go(parseInt(location.hash.slice(1), 10) || 1, false);
})();
