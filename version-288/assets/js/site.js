(function () {
  var body = document.body;
  var base = body.getAttribute("data-base") || "./";

  document.querySelectorAll("[data-search-form]").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var input = form.querySelector("input[name='q']");
      var query = input ? input.value.trim() : "";
      if (query) {
        window.location.href = base + "search.html?q=" + encodeURIComponent(query);
      }
    });
  });

  var toggle = document.querySelector("[data-mobile-toggle]");
  var panel = document.querySelector("[data-mobile-panel]");
  if (toggle && panel) {
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  var filterInput = document.querySelector("[data-filter-input]");
  var filterList = document.querySelector("[data-filter-list]");
  if (filterInput && filterList) {
    filterInput.addEventListener("input", function () {
      var query = filterInput.value.trim().toLowerCase();
      filterList.querySelectorAll("[data-card]").forEach(function (card) {
        var terms = (card.getAttribute("data-title") + " " + card.getAttribute("data-terms")).toLowerCase();
        card.classList.toggle("is-hidden", query && terms.indexOf(query) === -1);
      });
    });
  }

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var current = 0;
    var show = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    };

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }
  }

  if (body.getAttribute("data-page") === "search") {
    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();
    var searchInputs = document.querySelectorAll("input[name='q']");
    searchInputs.forEach(function (input) {
      input.value = query;
    });
    var results = document.getElementById("search-results");
    var summary = document.querySelector("[data-search-summary]");

    fetch(base + "assets/data/movies.json")
      .then(function (response) {
        return response.json();
      })
      .then(function (movies) {
        var normalized = query.toLowerCase();
        var matched = movies.filter(function (movie) {
          if (!normalized) {
            return true;
          }
          return movie.terms.toLowerCase().indexOf(normalized) !== -1;
        }).slice(0, 96);

        if (summary) {
          summary.textContent = query ? "找到与“" + query + "”相关的内容" : "展示片库精选内容";
        }

        if (!results) {
          return;
        }

        results.innerHTML = matched.map(function (movie) {
          return [
            "<article class=\"movie-card\" data-card>",
            "  <a href=\"" + movie.href + "\">",
            "    <div class=\"poster-wrap\">",
            "      <img src=\"" + movie.cover + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">",
            "      <span class=\"quality-badge\">HD</span>",
            "      <span class=\"play-mark\">▶</span>",
            "      <div class=\"poster-meta\"><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.year) + "</span></div>",
            "    </div>",
            "    <div class=\"movie-card-body\">",
            "      <h3>" + escapeHtml(movie.title) + "</h3>",
            "      <p>" + escapeHtml(movie.oneLine) + "</p>",
            "      <div class=\"movie-tags\"><span>" + escapeHtml(movie.category) + "</span><span>" + escapeHtml(movie.type) + "</span></div>",
            "    </div>",
            "  </a>",
            "</article>"
          ].join("");
        }).join("");
      });
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
})();
