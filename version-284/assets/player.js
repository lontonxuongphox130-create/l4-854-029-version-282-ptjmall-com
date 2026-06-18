(function () {
    var stream = typeof videoUrl !== 'undefined' ? videoUrl : '';
    var shell = document.querySelector('[data-player-shell]');
    var video = document.querySelector('[data-player-video]');
    var button = document.querySelector('[data-player-start]');
    var loaded = false;
    var hls = null;

    function attach() {
        if (!video || !stream || loaded) {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
            hls = new Hls();
            hls.loadSource(stream);
            hls.attachMedia(video);
        } else {
            video.src = stream;
        }

        loaded = true;
    }

    function begin() {
        attach();

        if (shell) {
            shell.classList.add('is-playing');
        }

        if (video) {
            var action = video.play();
            if (action && typeof action.catch === 'function') {
                action.catch(function () {});
            }
        }
    }

    if (button) {
        button.addEventListener('click', begin);
    }

    if (video) {
        video.addEventListener('click', function () {
            if (video.paused) {
                begin();
            }
        });

        video.addEventListener('play', function () {
            if (shell) {
                shell.classList.add('is-playing');
            }
        });
    }
})();
