(function () {
  document.querySelectorAll("[data-player-shell]").forEach(function (shell) {
    var video = shell.querySelector("[data-player-video]");
    var toggle = shell.querySelector("[data-player-toggle]");
    var status = shell.querySelector("[data-player-status]");
    var streamUrl = shell.getAttribute("data-stream");
    var started = false;
    var hlsInstance = null;

    if (!video || !streamUrl) {
      return;
    }

    function setStatus(text) {
      if (status) {
        status.textContent = text || "";
      }
    }

    function activate() {
      if (started) {
        playVideo();
        return;
      }

      started = true;
      if (toggle) {
        toggle.classList.add("is-hidden");
      }
      video.setAttribute("controls", "controls");

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
        playVideo();
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          playVideo();
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hlsInstance.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hlsInstance.recoverMediaError();
          } else {
            setStatus("播放暂时不可用，请稍后重试。");
            hlsInstance.destroy();
          }
        });
        return;
      }

      setStatus("当前浏览器暂时无法播放，请更换浏览器后重试。");
    }

    function playVideo() {
      var request = video.play();
      if (request && typeof request.catch === "function") {
        request.catch(function () {
          setStatus("点击播放按钮继续观看。");
        });
      }
    }

    if (toggle) {
      toggle.addEventListener("click", activate);
    }

    video.addEventListener("click", function () {
      if (!started) {
        activate();
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
