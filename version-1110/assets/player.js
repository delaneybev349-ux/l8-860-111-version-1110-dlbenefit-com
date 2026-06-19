import { H as Hls } from './hls.js';

export function initMoviePlayer(streamUrl) {
    var video = document.getElementById('movie-player');
    var trigger = document.getElementById('play-toggle');

    if (!video || !trigger || !streamUrl) {
        return;
    }

    var ready = false;
    var hls = null;

    function prepare() {
        if (ready) {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
        } else if (Hls && Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
        } else {
            video.src = streamUrl;
        }

        ready = true;
    }

    function play() {
        prepare();
        trigger.classList.add('is-hidden');
        var attempt = video.play();

        if (attempt && typeof attempt.catch === 'function') {
            attempt.catch(function () {
                trigger.classList.remove('is-hidden');
            });
        }
    }

    trigger.addEventListener('click', play);

    video.addEventListener('click', function () {
        if (video.paused) {
            play();
        }
    });

    video.addEventListener('play', function () {
        trigger.classList.add('is-hidden');
    });

    video.addEventListener('pause', function () {
        if (!video.ended) {
            trigger.classList.remove('is-hidden');
        }
    });

    window.addEventListener('pagehide', function () {
        if (hls) {
            hls.destroy();
            hls = null;
        }
    });
}
