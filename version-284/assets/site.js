(function () {
    var toggle = document.querySelector('[data-nav-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');

    if (toggle && menu) {
        toggle.addEventListener('click', function () {
            menu.classList.toggle('open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        current = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('active', slideIndex === current);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('active', dotIndex === current);
        });
    }

    function startHero() {
        if (timer || slides.length < 2) {
            return;
        }

        timer = window.setInterval(function () {
            showSlide(current + 1);
        }, 5000);
    }

    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
            startHero();
        });
    });

    startHero();

    var filterInput = document.querySelector('[data-filter-input]');
    var chips = Array.prototype.slice.call(document.querySelectorAll('[data-filter-chip]'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    var activeFilter = 'all';

    function isSeries(type) {
        return /剧|综艺|动画|Series|TV/i.test(type || '');
    }

    function isAsian(region) {
        return /中国|日本|韩国|香港|台湾|泰国|印度|亚洲|新加坡|马来西亚|越南|菲律宾/i.test(region || '');
    }

    function applyFilter() {
        var query = filterInput ? filterInput.value.trim().toLowerCase() : '';

        cards.forEach(function (card) {
            var haystack = (card.getAttribute('data-search') || '').toLowerCase();
            var type = card.getAttribute('data-type') || '';
            var region = card.getAttribute('data-region') || '';
            var year = parseInt(card.getAttribute('data-year') || '0', 10) || 0;
            var matched = !query || haystack.indexOf(query) !== -1;

            if (activeFilter === 'movie') {
                matched = matched && /电影|片|Movie/i.test(type);
            }

            if (activeFilter === 'series') {
                matched = matched && isSeries(type);
            }

            if (activeFilter === 'asia') {
                matched = matched && isAsian(region);
            }

            if (activeFilter === 'recent') {
                matched = matched && year >= 2020;
            }

            card.classList.toggle('hidden', !matched);
        });
    }

    chips.forEach(function (chip) {
        chip.addEventListener('click', function () {
            activeFilter = chip.getAttribute('data-filter-chip') || 'all';
            chips.forEach(function (item) {
                item.classList.toggle('active', item === chip);
            });
            applyFilter();
        });
    });

    if (filterInput) {
        filterInput.addEventListener('input', applyFilter);
    }
})();
