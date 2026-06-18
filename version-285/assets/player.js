(function () {
  function mount(sourceUrl) {
    var video = document.querySelector('.movie-video');
    var overlay = document.querySelector('[data-player-overlay]');
    var frame = document.querySelector('[data-player-root]');
    var hls = null;
    var ready = false;

    if (!video || !sourceUrl) {
      return;
    }

    function showMessage(text) {
      if (!frame) {
        return;
      }
      var message = frame.querySelector('.player-message');
      if (!message) {
        message = document.createElement('div');
        message.className = 'player-message';
        frame.appendChild(message);
      }
      message.textContent = text;
    }

    function prepare() {
      if (ready) {
        return;
      }
      ready = true;
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            showMessage('视频暂时无法加载，请稍后重试');
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = sourceUrl;
      } else {
        showMessage('当前浏览器暂不支持播放');
      }
    }

    function play() {
      prepare();
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          if (overlay) {
            overlay.classList.remove('is-hidden');
          }
        });
      }
    }

    if (overlay) {
      overlay.addEventListener('click', play);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      } else {
        video.pause();
      }
    });

    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });

    video.addEventListener('pause', function () {
      if (video.currentTime === 0 && overlay) {
        overlay.classList.remove('is-hidden');
      }
    });

    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  window.MovieStaticPlayer = {
    mount: mount
  };
})();
