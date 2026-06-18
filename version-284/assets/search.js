(function () {
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    var input = document.getElementById('searchInput');
    var target = document.getElementById('searchResult');

    if (input) {
        input.value = query;
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

    function card(movie) {
        var tags = (movie.tags || []).slice(0, 5).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');

        return '<a class="movie-card" href="' + escapeHtml(movie.url) + '">' +
            '<figure class="poster-frame">' +
            '<img src="./' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
            '<figcaption>' + escapeHtml(movie.category) + '</figcaption>' +
            '<span class="year-badge">' + escapeHtml(movie.year) + '</span>' +
            '</figure>' +
            '<div class="movie-card-body">' +
            '<h3>' + escapeHtml(movie.title) + '</h3>' +
            '<p class="card-meta">' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.type) + '</p>' +
            '<p class="card-desc">' + escapeHtml(movie.oneLine) + '</p>' +
            '<div class="tag-row">' + tags + '</div>' +
            '</div>' +
            '</a>';
    }

    function search() {
        if (!target || !query || !Array.isArray(MOVIES)) {
            return;
        }

        var words = query.toLowerCase().split(/\s+/).filter(Boolean);
        var results = MOVIES.filter(function (movie) {
            var haystack = [
                movie.title,
                movie.region,
                movie.type,
                movie.year,
                movie.genre,
                movie.category,
                movie.oneLine,
                (movie.tags || []).join(' ')
            ].join(' ').toLowerCase();

            return words.every(function (word) {
                return haystack.indexOf(word) !== -1;
            });
        });

        if (!results.length) {
            target.className = 'empty-result';
            target.innerHTML = '<h2>暂无匹配影片</h2><p>可以尝试更换片名、地区、年份或题材关键词。</p>';
            return;
        }

        target.className = 'movie-grid home-grid';
        target.innerHTML = results.map(card).join('');
    }

    search();
})();
