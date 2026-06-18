(function () {
    function select(selector, root) {
        return (root || document).querySelector(selector);
    }

    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function playVideo(video) {
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
            promise.catch(function () {});
        }
    }

    function initMenu() {
        var button = select("[data-menu-button]");
        var panel = select("[data-mobile-panel]");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function initHeroSlider() {
        var slider = select("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = selectAll("[data-hero-slide]", slider);
        var dots = selectAll("[data-hero-dot]", slider);
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function start() {
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                if (timer) {
                    window.clearInterval(timer);
                }
                show(dotIndex);
                start();
            });
        });
        show(0);
        start();
    }

    function initSearchPage() {
        var page = select("[data-search-page]");
        if (!page) {
            return;
        }
        var input = select("[data-search-input]", page);
        var cards = selectAll("[data-search-card]", page);
        var chips = selectAll("[data-filter-chip]", page);
        var empty = select("[data-empty-result]", page);
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";
        var category = "all";

        if (input && query) {
            input.value = query;
        }

        function apply() {
            var value = normalize(input ? input.value : "");
            var hasVisible = false;
            cards.forEach(function (card) {
                var text = normalize(card.getAttribute("data-search"));
                var cardCategory = card.getAttribute("data-category") || "";
                var matchText = !value || text.indexOf(value) !== -1;
                var matchCategory = category === "all" || category === cardCategory;
                var visible = matchText && matchCategory;
                card.hidden = !visible;
                if (visible) {
                    hasVisible = true;
                }
            });
            if (empty) {
                empty.hidden = hasVisible;
            }
        }

        chips.forEach(function (chip) {
            chip.addEventListener("click", function () {
                category = chip.getAttribute("data-filter-chip") || "all";
                chips.forEach(function (item) {
                    item.classList.toggle("is-active", item === chip);
                });
                apply();
            });
        });

        if (input) {
            input.addEventListener("input", apply);
        }
        apply();
    }

    window.initMoviePlayer = function (source) {
        var video = select("#movie-video");
        var shell = select("[data-player-shell]");
        var button = select("[data-player-button]");
        var ready = false;
        var hls = null;

        if (!video || !source) {
            return;
        }

        function attach() {
            if (ready) {
                playVideo(video);
                if (shell) {
                    shell.classList.add("is-playing");
                }
                return;
            }
            ready = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
            if (shell) {
                shell.classList.add("is-playing");
            }
            playVideo(video);
        }

        if (button) {
            button.addEventListener("click", attach);
        }
        video.addEventListener("click", function () {
            if (!ready || video.paused) {
                attach();
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hls && typeof hls.destroy === "function") {
                hls.destroy();
            }
        });
    };

    document.addEventListener("DOMContentLoaded", function () {
        initMenu();
        initHeroSlider();
        initSearchPage();
    });
})();
