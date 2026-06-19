(function () {
    window.initMoviePlayer = function (options) {
        const video = document.getElementById(options.videoId);
        const overlay = document.getElementById(options.overlayId);
        const button = document.getElementById(options.buttonId);
        const source = options.source;
        let prepared = false;
        let hlsInstance = null;

        if (!video || !overlay || !button || !source) {
            return;
        }

        function prepareVideo() {
            if (prepared) {
                return;
            }

            prepared = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                return;
            }

            video.src = source;
        }

        function startVideo(event) {
            if (event) {
                event.preventDefault();
            }

            prepareVideo();
            overlay.classList.add("is-hidden");
            video.controls = true;
            video.play().catch(function () {});
        }

        overlay.addEventListener("click", startVideo);
        button.addEventListener("click", startVideo);
        video.addEventListener("click", function () {
            if (video.paused) {
                startVideo();
            }
        });

        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        });
    };
})();
