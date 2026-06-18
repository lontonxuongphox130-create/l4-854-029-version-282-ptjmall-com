(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function setupMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-menu]');
    if (!toggle || !menu) return;
    toggle.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) return;
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    if (!slides.length) return;
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function restart(next) {
      if (timer) window.clearInterval(timer);
      show(next);
      start();
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        restart(i);
      });
    });
    start();
  }

  function setupLocalFilter() {
    var input = document.querySelector('[data-local-filter]');
    var list = document.querySelector('[data-filter-list]');
    if (!input || !list) return;
    var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
    input.addEventListener('input', function () {
      var value = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = card.textContent.toLowerCase();
        card.style.display = text.indexOf(value) === -1 ? 'none' : '';
      });
    });
  }

  function setupSearchPage() {
    var status = document.querySelector('[data-search-status]');
    var results = document.querySelector('[data-search-results]');
    var input = document.querySelector('[data-search-input]');
    if (!status || !results) return;
    var params = new URLSearchParams(window.location.search);
    var q = (params.get('q') || '').trim();
    if (input) input.value = q;
    if (!q) return;
    var source = window.SEARCH_INDEX || [];
    var query = q.toLowerCase();
    var matched = source.filter(function (item) {
      return [item.title, item.region, item.year, item.genre, item.tags, item.oneLine]
        .join(' ')
        .toLowerCase()
        .indexOf(query) !== -1;
    }).slice(0, 80);
    status.textContent = matched.length ? '找到相关影片：' + matched.length + ' 条' : '没有找到相关影片。';
    results.innerHTML = matched.map(function (item) {
      return '<a class="search-result-card" href="./' + item.file + '">' +
        '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
        '<span><strong>' + escapeHtml(item.title) + '</strong>' +
        '<em>' + escapeHtml(item.region + ' · ' + item.year + ' · ' + item.genre) + '</em>' +
        '<span>' + escapeHtml(item.oneLine) + '</span></span></a>';
    }).join('');
  }

  function escapeHtml(text) {
    return String(text).replace(/[&<>"]/g, function (ch) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[ch];
    });
  }

  function setupPlayer() {
    var panel = document.querySelector('[data-player]');
    if (!panel) return;
    var video = panel.querySelector('video');
    var overlay = panel.querySelector('.play-overlay');
    if (!video || !overlay) return;
    var src = video.getAttribute('data-play-src');
    var loaded = false;
    var hls = null;

    function bind() {
      if (loaded || !src) return;
      loaded = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(src);
        hls.attachMedia(video);
      } else {
        video.src = src;
      }
    }

    function play() {
      bind();
      overlay.classList.add('is-hidden');
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {
          overlay.classList.remove('is-hidden');
        });
      }
    }

    overlay.addEventListener('click', play);
    video.addEventListener('click', function () {
      if (video.paused) play();
    });
    video.addEventListener('play', function () {
      overlay.classList.add('is-hidden');
    });
    video.addEventListener('pause', function () {
      if (video.currentTime === 0 || video.ended) {
        overlay.classList.remove('is-hidden');
      }
    });
    window.addEventListener('pagehide', function () {
      if (hls && hls.destroy) hls.destroy();
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupLocalFilter();
    setupSearchPage();
    setupPlayer();
  });
})();
