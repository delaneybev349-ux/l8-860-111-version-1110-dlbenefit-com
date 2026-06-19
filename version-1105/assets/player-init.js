import { H as Hls } from './player.js';

function startPlayer(shell) {
  var video = shell.querySelector('video');
  var button = shell.querySelector('[data-play-button]');
  var source = shell.getAttribute('data-src');
  if (!video || !source) {
    return;
  }

  function hideButton() {
    if (button) {
      button.classList.add('hidden');
    }
  }

  if (!shell.dataset.ready) {
    shell.dataset.ready = '1';
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else if (Hls && Hls.isSupported()) {
      var hls = new Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(source);
      hls.attachMedia(video);
      shell._hls = hls;
    } else {
      video.src = source;
    }
  }

  hideButton();
  var playPromise = video.play();
  if (playPromise && typeof playPromise.catch === 'function') {
    playPromise.catch(function () {
      if (button) {
        button.classList.remove('hidden');
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('[data-player-shell]').forEach(function (shell) {
    var video = shell.querySelector('video');
    var button = shell.querySelector('[data-play-button]');
    if (button) {
      button.addEventListener('click', function () {
        startPlayer(shell);
      });
    }
    if (video) {
      video.addEventListener('click', function () {
        if (!shell.dataset.ready) {
          startPlayer(shell);
        }
      });
      video.addEventListener('play', function () {
        if (button) {
          button.classList.add('hidden');
        }
      });
    }
  });
});
