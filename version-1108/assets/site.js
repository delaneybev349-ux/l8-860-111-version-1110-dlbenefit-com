(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function initMenu() {
        var button = document.querySelector(".menu-toggle");
        var nav = document.querySelector(".mobile-nav");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("open");
        });
    }

    function initHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        var prev = document.querySelector(".hero-prev");
        var next = document.querySelector(".hero-next");
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;
        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === index);
            });
        }
        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }
        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                start();
            });
        });
        start();
    }

    function initFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll(".filter-panel"));
        panels.forEach(function (panel) {
            var section = panel.parentElement;
            var cards = Array.prototype.slice.call(section.querySelectorAll(".movie-card"));
            var search = panel.querySelector(".movie-search-input");
            var region = panel.querySelector(".movie-region-select");
            var type = panel.querySelector(".movie-type-select");
            function apply() {
                var q = search ? search.value.trim().toLowerCase() : "";
                var r = region ? region.value : "";
                var t = type ? type.value : "";
                cards.forEach(function (card) {
                    var text = [
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-tags")
                    ].join(" ").toLowerCase();
                    var okSearch = !q || text.indexOf(q) !== -1;
                    var okRegion = !r || (card.getAttribute("data-region") || "").indexOf(r) !== -1;
                    var okType = !t || (card.getAttribute("data-type") || "").indexOf(t) !== -1;
                    card.classList.toggle("is-hidden", !(okSearch && okRegion && okType));
                });
            }
            [search, region, type].forEach(function (el) {
                if (el) {
                    el.addEventListener("input", apply);
                    el.addEventListener("change", apply);
                }
            });
            var params = new URLSearchParams(window.location.search);
            var query = params.get("q");
            if (query && search) {
                search.value = query;
            }
            apply();
        });
    }

    ready(function () {
        initMenu();
        initHero();
        initFilters();
    });
})();

function createMoviePlayer(videoId, buttonId, coverId, streamUrl) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var cover = document.getElementById(coverId);
    var hlsInstance = null;
    if (!video || !cover || !streamUrl) {
        return;
    }
    function load() {
        if (video.getAttribute("data-ready") === "1") {
            return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(streamUrl);
            hlsInstance.attachMedia(video);
        } else {
            video.src = streamUrl;
        }
        video.setAttribute("data-ready", "1");
    }
    function play() {
        load();
        cover.classList.add("is-hidden");
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
            promise.catch(function () {
                cover.classList.remove("is-hidden");
            });
        }
    }
    cover.addEventListener("click", play);
    if (button) {
        button.addEventListener("click", function (event) {
            event.preventDefault();
            event.stopPropagation();
            play();
        });
    }
    video.addEventListener("play", function () {
        cover.classList.add("is-hidden");
    });
    video.addEventListener("pause", function () {
        if (!video.currentTime) {
            cover.classList.remove("is-hidden");
        }
    });
    window.addEventListener("pagehide", function () {
        if (hlsInstance && typeof hlsInstance.destroy === "function") {
            hlsInstance.destroy();
        }
    });
}
