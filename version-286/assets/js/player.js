import { H as Hls } from './video-player-dru42stk.js';

const video = document.querySelector('[data-player]');
const playButton = document.getElementById('player-start');
const statusNode = document.querySelector('[data-player-status]');
let hlsInstance = null;
let playerReady = false;

function setStatus(message) {
  if (statusNode) {
    statusNode.textContent = message;
  }
}

function attachNativeSource(sourceUrl) {
  video.src = sourceUrl;
  playerReady = true;
  setStatus('播放源已就绪。');
  return Promise.resolve();
}

function attachHlsSource(sourceUrl) {
  return new Promise(function (resolve, reject) {
    hlsInstance = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90
    });

    hlsInstance.on(Hls.Events.MEDIA_ATTACHED, function () {
      hlsInstance.loadSource(sourceUrl);
    });

    hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
      playerReady = true;
      setStatus('播放源已就绪。');
      resolve();
    });

    hlsInstance.on(Hls.Events.ERROR, function (event, data) {
      if (data && data.fatal) {
        setStatus('播放源加载失败，请刷新页面重试。');
        reject(new Error(data.details || 'HLS source error'));
      }
    });

    hlsInstance.attachMedia(video);
  });
}

function preparePlayer() {
  if (!video) {
    return Promise.reject(new Error('Video element missing'));
  }

  if (playerReady) {
    return Promise.resolve();
  }

  const sourceUrl = video.getAttribute('data-src');

  if (!sourceUrl) {
    setStatus('未找到播放源。');
    return Promise.reject(new Error('Source url missing'));
  }

  setStatus('正在加载高清播放源...');

  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    return attachNativeSource(sourceUrl);
  }

  if (Hls.isSupported()) {
    return attachHlsSource(sourceUrl);
  }

  setStatus('当前浏览器不支持 HLS 播放。');
  return Promise.reject(new Error('HLS is not supported'));
}

async function playMovie() {
  try {
    await preparePlayer();

    if (playButton) {
      playButton.classList.add('is-hidden');
    }

    await video.play();
    setStatus('正在播放。');
  } catch (error) {
    if (playButton) {
      playButton.classList.remove('is-hidden');
    }
  }
}

if (playButton) {
  playButton.addEventListener('click', playMovie);
}

if (video) {
  video.addEventListener('play', function () {
    if (playButton) {
      playButton.classList.add('is-hidden');
    }
  });

  video.addEventListener('pause', function () {
    if (!video.ended && playButton) {
      playButton.classList.remove('is-hidden');
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
