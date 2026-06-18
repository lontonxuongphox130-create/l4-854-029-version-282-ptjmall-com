(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      var open = mobilePanel.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.classList.toggle('menu-open', open);
    });
  }

  var carousel = document.querySelector('[data-hero-carousel]');
  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      if (timer || slides.length < 2) {
        return;
      }
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        stop();
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    start();
  }

  var filterPanel = document.querySelector('[data-filter-panel]');
  if (filterPanel) {
    var input = filterPanel.querySelector('[data-filter-input]');
    var yearSelect = filterPanel.querySelector('[data-year-filter]');
    var reset = filterPanel.querySelector('[data-reset-filter]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.filter-list [data-title]'));

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function applyFilter() {
      var keyword = normalize(input && input.value);
      var year = yearSelect ? yearSelect.value : '';
      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-tags')
        ].join(' '));
        var matchText = !keyword || haystack.indexOf(keyword) !== -1;
        var matchYear = !year || card.getAttribute('data-year') === year;
        card.classList.toggle('filter-hidden', !(matchText && matchYear));
      });
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }
    if (yearSelect) {
      yearSelect.addEventListener('change', applyFilter);
    }
    if (reset) {
      reset.addEventListener('click', function () {
        if (input) {
          input.value = '';
        }
        if (yearSelect) {
          yearSelect.value = '';
        }
        applyFilter();
      });
    }
  }

  var searchApp = document.querySelector('[data-search-app]');
  if (searchApp && window.MovieData) {
    var form = searchApp.querySelector('[data-search-form]');
    var searchInput = searchApp.querySelector('[data-search-input]');
    var categorySelect = searchApp.querySelector('[data-search-category]');
    var yearSelectSearch = searchApp.querySelector('[data-search-year]');
    var summary = searchApp.querySelector('[data-search-summary]');
    var results = searchApp.querySelector('[data-search-results]');
    var params = new URLSearchParams(window.location.search);
    var years = Array.from(new Set(window.MovieData.map(function (movie) {
      return movie.year;
    }).filter(Boolean))).sort().reverse();

    years.forEach(function (year) {
      var option = document.createElement('option');
      option.value = year;
      option.textContent = year;
      yearSelectSearch.appendChild(option);
    });

    searchInput.value = params.get('q') || '';
    categorySelect.value = params.get('category') || '';
    yearSelectSearch.value = params.get('year') || '';

    function makeCard(movie) {
      var article = document.createElement('a');
      article.className = 'search-result-card';
      article.href = movie.path;
      article.innerHTML = [
        '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '<span>',
        '<strong>' + escapeHtml(movie.title) + '</strong>',
        '<em>' + escapeHtml(movie.category) + ' · ' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.year) + '</em>',
        '<p>' + escapeHtml(movie.oneLine || movie.summary) + '</p>',
        '</span>'
      ].join('');
      return article;
    }

    function escapeHtml(value) {
      return String(value || '').replace(/[&<>"']/g, function (char) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;'
        }[char];
      });
    }

    function runSearch(updateUrl) {
      var keyword = String(searchInput.value || '').trim().toLowerCase();
      var category = categorySelect.value;
      var year = yearSelectSearch.value;
      var filtered = window.MovieData.filter(function (movie) {
        var haystack = [
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.category,
          movie.oneLine,
          movie.summary,
          movie.tags.join(' ')
        ].join(' ').toLowerCase();
        return (!keyword || haystack.indexOf(keyword) !== -1) &&
          (!category || movie.category === category) &&
          (!year || movie.year === year);
      }).slice(0, 120);

      results.innerHTML = '';
      if (!keyword && !category && !year) {
        summary.textContent = '输入关键词或选择条件即可查看结果';
        return;
      }

      summary.textContent = '共找到 ' + filtered.length + ' 条结果，最多显示前 120 条';
      filtered.forEach(function (movie) {
        results.appendChild(makeCard(movie));
      });

      if (updateUrl) {
        var next = new URLSearchParams();
        if (searchInput.value.trim()) {
          next.set('q', searchInput.value.trim());
        }
        if (category) {
          next.set('category', category);
        }
        if (year) {
          next.set('year', year);
        }
        var query = next.toString();
        window.history.replaceState(null, '', query ? './search.html?' + query : './search.html');
      }
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      runSearch(true);
    });
    searchInput.addEventListener('input', function () {
      runSearch(true);
    });
    categorySelect.addEventListener('change', function () {
      runSearch(true);
    });
    yearSelectSearch.addEventListener('change', function () {
      runSearch(true);
    });
    runSearch(false);
  }
})();
