(function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobileMenu = document.querySelector("[data-mobile-menu]");

    if (menuButton && mobileMenu) {
        menuButton.addEventListener("click", function () {
            mobileMenu.classList.toggle("is-open");
        });
    }

    document.querySelectorAll("[data-search-form]").forEach(function (form) {
        form.addEventListener("submit", function (event) {
            var input = form.querySelector("input[name='q']");
            if (!input) {
                return;
            }

            var value = input.value.trim();
            if (!value) {
                event.preventDefault();
                window.location.href = "./search.html";
            }
        });
    });

    var hero = document.querySelector("[data-hero]");

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function startHero() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5000);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
                startHero();
            });
        });

        startHero();
    }

    var filterInput = document.querySelector("[data-filter-input]");
    var filterCards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    var queryInput = document.querySelector("[data-query-input]");

    if (queryInput) {
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";
        queryInput.value = query;
    }

    if (filterInput && filterCards.length) {
        function filterCardsByValue() {
            var value = filterInput.value.trim().toLowerCase();
            filterCards.forEach(function (card) {
                var content = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
                card.classList.toggle("is-filtered-out", value && content.indexOf(value) === -1);
            });
        }

        filterInput.addEventListener("input", filterCardsByValue);
        filterCardsByValue();
    }

    function ensureHls(callback, fallback) {
        if (window.Hls) {
            callback();
            return;
        }

        var script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js";
        script.async = true;
        script.onload = callback;
        script.onerror = fallback;
        document.head.appendChild(script);
    }

    document.querySelectorAll("[data-player]").forEach(function (player) {
        var video = player.querySelector("video");
        var button = player.querySelector("[data-play]");
        var state = player.querySelector(".player-state");
        var stream = player.getAttribute("data-stream");
        var started = false;
        var hlsInstance = null;

        function setState(message) {
            if (state) {
                state.textContent = message || "";
            }
        }

        function playVideo() {
            if (!video) {
                return;
            }

            var request = video.play();
            if (request && typeof request.catch === "function") {
                request.catch(function () {
                    setState("请再次点击播放");
                });
            }
        }

        function useVideoElement() {
            video.src = stream;
            video.load();
            playVideo();
        }

        function startPlayer() {
            if (!video || !stream) {
                setState("播放暂时不可用");
                return;
            }

            if (button) {
                button.classList.add("is-hidden");
            }

            if (started) {
                playVideo();
                return;
            }

            started = true;
            setState("正在加载...");

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                useVideoElement();
                return;
            }

            ensureHls(function () {
                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });

                    hlsInstance.loadSource(stream);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        setState("");
                        playVideo();
                    });
                    hlsInstance.on(window.Hls.Events.ERROR, function (_, data) {
                        if (data && data.fatal) {
                            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                                hlsInstance.startLoad();
                            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                                hlsInstance.recoverMediaError();
                            } else {
                                hlsInstance.destroy();
                                useVideoElement();
                            }
                        }
                    });
                } else {
                    useVideoElement();
                }
            }, useVideoElement);
        }

        if (button) {
            button.addEventListener("click", startPlayer);
        }

        if (video) {
            video.addEventListener("click", function () {
                if (video.paused) {
                    startPlayer();
                } else {
                    video.pause();
                }
            });
            video.addEventListener("playing", function () {
                setState("");
            });
            video.addEventListener("error", function () {
                setState("播放暂时不可用，请稍后重试");
            });
            video.addEventListener("emptied", function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                    hlsInstance = null;
                }
            });
        }
    });
})();
