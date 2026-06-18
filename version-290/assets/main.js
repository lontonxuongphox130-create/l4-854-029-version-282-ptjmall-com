(function () {
  var toggle = document.querySelector('.menu-toggle');
  var panel = document.querySelector('.mobile-panel');
  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  document.querySelectorAll('.hero').forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    if (!slides.length) {
      return;
    }
    var current = 0;
    function activate(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        activate(index);
      });
    });
    activate(0);
    if (slides.length > 1) {
      window.setInterval(function () {
        activate(current + 1);
      }, 5200);
    }
  });

  document.querySelectorAll('.local-filter').forEach(function (input) {
    var target = input.getAttribute('data-target') || '.movie-card';
    var cards = Array.prototype.slice.call(document.querySelectorAll(target));
    input.addEventListener('input', function () {
      var query = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags'),
          card.textContent
        ].join(' ').toLowerCase();
        card.style.display = !query || haystack.indexOf(query) !== -1 ? '' : 'none';
      });
    });
  });

  document.querySelectorAll('.js-player').forEach(function (box) {
    var video = box.querySelector('video');
    var button = box.querySelector('.player-overlay');
    var src = box.getAttribute('data-hls');
    var started = false;
    var hlsInstance = null;
    if (!video || !src) {
      return;
    }
    function attachSource() {
      if (started) {
        return;
      }
      started = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(src);
        hlsInstance.attachMedia(video);
      } else {
        video.src = src;
      }
    }
    function playVideo() {
      attachSource();
      box.classList.add('is-playing');
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {
          box.classList.remove('is-playing');
        });
      }
    }
    if (button) {
      button.addEventListener('click', playVideo);
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo();
      }
    });
    video.addEventListener('play', function () {
      box.classList.add('is-playing');
    });
    video.addEventListener('pause', function () {
      if (!video.ended) {
        box.classList.remove('is-playing');
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });

  var results = document.querySelector('[data-search-results]');
  if (results && window.SITE_MOVIES) {
    var params = new URLSearchParams(window.location.search);
    var q = (params.get('q') || '').trim().toLowerCase();
    var source = window.SITE_MOVIES;
    var matches = q ? source.filter(function (item) {
      return [item.title, item.region, item.type, item.year, item.genre, item.tags, item.oneLine].join(' ').toLowerCase().indexOf(q) !== -1;
    }) : source.slice(0, 36);
    results.innerHTML = matches.slice(0, 120).map(function (item) {
      return '<article class="movie-card" data-title="' + escapeHtml(item.title) + '" data-genre="' + escapeHtml(item.genre) + '" data-tags="' + escapeHtml(item.tags) + '">' +
        '<a class="movie-thumb" href="' + item.url + '">' +
        '<img src="' + item.image + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
        '<span class="movie-badge">' + escapeHtml(item.year || item.type) + '</span>' +
        '<span class="movie-play">▶</span>' +
        '</a>' +
        '<div class="movie-card-body">' +
        '<div class="card-tags"><span>' + escapeHtml(item.region || '精选') + '</span><span>' + escapeHtml(item.type || '电影') + '</span></div>' +
        '<h3><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h3>' +
        '<p class="movie-desc">' + escapeHtml(item.oneLine || item.genre) + '</p>' +
        '<div class="movie-meta"><span>' + escapeHtml(item.genre) + '</span></div>' +
        '</div>' +
        '</article>';
    }).join('') || '<div class="empty-state">没有找到匹配的影片，请换一个关键词试试。</div>';
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"]/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[char];
    });
  }
})();
