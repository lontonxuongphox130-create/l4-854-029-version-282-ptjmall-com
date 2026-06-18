(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    var toggle = document.querySelector(".mobile-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        panel.classList.toggle("open");
      });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("active", i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("active", i === index);
        });
      }

      function startTimer() {
        clearInterval(timer);
        timer = setInterval(function () {
          show(index + 1);
        }, 5200);
      }

      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          show(i);
          startTimer();
        });
      });

      if (prev) {
        prev.addEventListener("click", function () {
          show(index - 1);
          startTimer();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
          startTimer();
        });
      }

      show(0);
      startTimer();
    }

    document.querySelectorAll(".filter-bar").forEach(function (bar) {
      var input = bar.querySelector(".filter-input");
      var select = bar.querySelector(".filter-select");
      var reset = bar.querySelector(".filter-reset");
      var scope = bar.parentElement;
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
      var empty = scope.querySelector(".empty-state");

      function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
      }

      function applyFilter() {
        var keyword = normalize(input ? input.value : "");
        var year = normalize(select ? select.value : "");
        var visible = 0;

        cards.forEach(function (card) {
          var text = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-region"),
            card.getAttribute("data-tags"),
            card.getAttribute("data-year")
          ].join(" "));
          var cardYear = normalize(card.getAttribute("data-year"));
          var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
          var matchYear = !year || cardYear === year;
          var showCard = matchKeyword && matchYear;
          card.style.display = showCard ? "" : "none";
          if (showCard) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("show", visible === 0 && cards.length > 0);
        }
      }

      if (input) {
        input.addEventListener("input", applyFilter);
      }

      if (select) {
        select.addEventListener("change", applyFilter);
      }

      if (reset) {
        reset.addEventListener("click", function () {
          if (input) {
            input.value = "";
          }
          if (select) {
            select.value = "";
          }
          applyFilter();
        });
      }

      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");
      if (q && input && document.body.contains(input)) {
        input.value = q;
      }
      applyFilter();
    });

    document.querySelectorAll(".player-shell").forEach(function (shell) {
      var video = shell.querySelector("video");
      var button = shell.querySelector(".play-overlay");
      var initialized = false;
      var hls = null;

      function attachVideo() {
        if (!video || initialized) {
          return;
        }
        initialized = true;
        var stream = video.getAttribute("data-stream");
        if (!stream) {
          return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
          return;
        }
        video.src = stream;
      }

      function playVideo() {
        attachVideo();
        shell.classList.add("is-playing");
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            shell.classList.remove("is-playing");
          });
        }
      }

      if (button && video) {
        button.addEventListener("click", playVideo);
      }

      if (video) {
        video.addEventListener("play", function () {
          shell.classList.add("is-playing");
        });
        video.addEventListener("ended", function () {
          shell.classList.remove("is-playing");
        });
      }

      window.addEventListener("beforeunload", function () {
        if (hls && typeof hls.destroy === "function") {
          hls.destroy();
        }
      });
    });
  });
})();
