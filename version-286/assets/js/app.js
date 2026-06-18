(function () {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
  let heroIndex = 0;
  let heroTimer = null;

  function showHeroSlide(index) {
    if (!slides.length) {
      return;
    }

    heroIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === heroIndex);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === heroIndex);
    });
  }

  function startHeroTimer() {
    if (heroTimer || slides.length < 2) {
      return;
    }

    heroTimer = window.setInterval(function () {
      showHeroSlide(heroIndex + 1);
    }, 5000);
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      const nextIndex = Number(dot.getAttribute('data-hero-dot')) || 0;
      showHeroSlide(nextIndex);
      window.clearInterval(heroTimer);
      heroTimer = null;
      startHeroTimer();
    });
  });

  showHeroSlide(0);
  startHeroTimer();

  const filterInput = document.querySelector('.js-filter-input');
  const cards = Array.from(document.querySelectorAll('[data-card]'));
  const countNode = document.querySelector('[data-filter-count]');
  const filterChips = Array.from(document.querySelectorAll('[data-filter-chip]'));
  let activeChip = '';

  function applyCardFilter() {
    if (!filterInput || !cards.length) {
      return;
    }

    const keyword = filterInput.value.trim().toLowerCase();
    let visibleCount = 0;

    cards.forEach(function (card) {
      const haystack = card.getAttribute('data-search') || '';
      const matchesText = !keyword || haystack.indexOf(keyword) !== -1;
      const matchesChip = !activeChip || haystack.indexOf(activeChip) !== -1;
      const shouldShow = matchesText && matchesChip;

      card.classList.toggle('is-hidden-card', !shouldShow);

      if (shouldShow) {
        visibleCount += 1;
      }
    });

    if (countNode) {
      countNode.textContent = String(visibleCount);
    }
  }

  if (filterInput) {
    filterInput.addEventListener('input', applyCardFilter);
  }

  filterChips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      activeChip = chip.getAttribute('data-filter-chip') || '';
      filterChips.forEach(function (item) {
        item.classList.toggle('is-active', item === chip);
      });
      applyCardFilter();
    });
  });

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function searchCard(movie) {
    return [
      '<article class="movie-card">',
      '  <a class="movie-poster-link" href="' + escapeHtml(movie.url) + '" aria-label="观看 ' + escapeHtml(movie.title) + '">',
      '    <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" decoding="async">',
      '    <span class="movie-poster-badge">' + escapeHtml(movie.year) + '</span>',
      '    <span class="movie-poster-play">▶</span>',
      '  </a>',
      '  <div class="movie-card-body">',
      '    <h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
      '    <p>' + escapeHtml(movie.oneLine) + '</p>',
      '    <div class="movie-meta-row">',
      '      <span>' + escapeHtml(movie.region) + '</span>',
      '      <span>' + escapeHtml(movie.year) + '</span>',
      '      <span>' + escapeHtml(movie.category) + '</span>',
      '    </div>',
      '  </div>',
      '</article>'
    ].join('');
  }

  const searchForm = document.querySelector('[data-search-form]');
  const searchInput = document.querySelector('[data-search-input]');
  const searchResults = document.querySelector('[data-search-results]');
  const searchTitle = document.querySelector('[data-search-title]');
  const params = new URLSearchParams(window.location.search);

  function runSearch(query) {
    if (!searchResults || !searchTitle || !window.MOVIE_SEARCH_INDEX) {
      return;
    }

    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      searchTitle.textContent = '请输入关键词开始搜索';
      searchResults.innerHTML = '';
      return;
    }

    const matched = window.MOVIE_SEARCH_INDEX.filter(function (movie) {
      return movie.search.indexOf(normalizedQuery) !== -1;
    }).slice(0, 120);

    searchTitle.textContent = '“' + query + '” 的搜索结果：' + matched.length + ' 部影片';
    searchResults.innerHTML = matched.map(searchCard).join('');
  }

  if (searchInput) {
    const initialQuery = params.get('q') || '';
    searchInput.value = initialQuery;
    runSearch(initialQuery);
  }

  if (searchForm && searchInput) {
    searchForm.addEventListener('submit', function (event) {
      event.preventDefault();
      const query = searchInput.value.trim();
      const nextUrl = query ? 'search.html?q=' + encodeURIComponent(query) : 'search.html';
      window.history.replaceState({}, '', nextUrl);
      runSearch(query);
    });
  }
})();
