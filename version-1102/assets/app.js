(function() {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        var toggle = document.querySelector(".mobile-toggle");
        var menu = document.querySelector("#mobile-menu");
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener("click", function() {
            var open = menu.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-target-slide]"));
        if (!slides.length) {
            return;
        }
        var current = 0;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function(slide, i) {
                slide.classList.toggle("is-active", i === current);
            });
            dots.forEach(function(dot, i) {
                dot.classList.toggle("is-active", i === current);
            });
        }
        dots.forEach(function(dot) {
            dot.addEventListener("click", function() {
                show(Number(dot.getAttribute("data-target-slide")) || 0);
            });
        });
        setInterval(function() {
            show(current + 1);
        }, 5200);
    }

    function setupFilters() {
        var lists = Array.prototype.slice.call(document.querySelectorAll(".filter-list"));
        lists.forEach(function(list) {
            var section = list.closest("section");
            if (!section) {
                return;
            }
            var input = section.querySelector(".local-search");
            var year = section.querySelector(".year-filter");
            var genre = section.querySelector(".genre-filter");
            var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
            var years = {};
            var genres = {};
            cards.forEach(function(card) {
                var y = card.getAttribute("data-year") || "";
                var g = card.getAttribute("data-genre") || "";
                if (y) {
                    years[y] = true;
                }
                g.split(/[，,\/、\s]+/).forEach(function(item) {
                    if (item) {
                        genres[item] = true;
                    }
                });
            });
            if (year) {
                Object.keys(years).sort().reverse().forEach(function(value) {
                    var option = document.createElement("option");
                    option.value = value;
                    option.textContent = value;
                    year.appendChild(option);
                });
            }
            if (genre) {
                Object.keys(genres).sort().forEach(function(value) {
                    var option = document.createElement("option");
                    option.value = value;
                    option.textContent = value;
                    genre.appendChild(option);
                });
            }
            function apply() {
                var q = input ? input.value.trim().toLowerCase() : "";
                var y = year ? year.value : "";
                var g = genre ? genre.value : "";
                cards.forEach(function(card) {
                    var haystack = [
                        card.getAttribute("data-title") || "",
                        card.getAttribute("data-year") || "",
                        card.getAttribute("data-region") || "",
                        card.getAttribute("data-genre") || ""
                    ].join(" ").toLowerCase();
                    var ok = (!q || haystack.indexOf(q) !== -1) && (!y || card.getAttribute("data-year") === y) && (!g || (card.getAttribute("data-genre") || "").indexOf(g) !== -1);
                    card.style.display = ok ? "" : "none";
                });
            }
            [input, year, genre].forEach(function(node) {
                if (node) {
                    node.addEventListener("input", apply);
                    node.addEventListener("change", apply);
                }
            });
        });
    }

    function setupSearchPage() {
        var root = document.querySelector("#search-results");
        var input = document.querySelector("#global-search-input");
        var heading = document.querySelector("#search-heading");
        if (!root || !window.SEARCH_MOVIES) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q") || "";
        if (input) {
            input.value = initial;
            input.addEventListener("input", function() {
                render(input.value);
            });
        }
        render(initial);
        function render(query) {
            var q = (query || "").trim().toLowerCase();
            var list = window.SEARCH_MOVIES.filter(function(item) {
                if (!q) {
                    return item.id <= 48;
                }
                return [item.title, item.region, item.type, item.year, item.genre, item.tags, item.category].join(" ").toLowerCase().indexOf(q) !== -1;
            }).slice(0, 120);
            if (heading) {
                heading.textContent = q ? "搜索：“" + query + "”" : "热门影片";
            }
            if (!list.length) {
                root.innerHTML = '<div class="no-results">没有匹配的影片，请更换关键词。</div>';
                return;
            }
            root.innerHTML = list.map(function(item) {
                return '<article class="movie-card">' +
                    '<a class="poster-link" href="' + item.href + '" aria-label="' + escapeHtml(item.title) + '">' +
                    '<img src="' + item.image + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
                    '<span class="poster-play">▶</span>' +
                    '</a>' +
                    '<div class="movie-card-body">' +
                    '<a class="movie-title" href="' + item.href + '">' + escapeHtml(item.title) + '</a>' +
                    '<div class="movie-meta"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span></div>' +
                    '<p>' + escapeHtml(item.one_line) + '</p>' +
                    '<div class="card-tags"><span>' + escapeHtml(item.category) + '</span><span>' + escapeHtml(item.genre) + '</span></div>' +
                    '</div>' +
                    '</article>';
            }).join("");
        }
    }

    function escapeHtml(value) {
        return String(value || "").replace(/[&<>"']/g, function(ch) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "\"": "&quot;",
                "'": "&#39;"
            }[ch] || ch;
        });
    }

    window.initMoviePlayer = function(videoId, coverId, source) {
        var video = document.getElementById(videoId);
        var cover = document.getElementById(coverId);
        if (!video || !cover || !source) {
            return;
        }
        var hlsReady = false;
        function attach() {
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                if (!video.getAttribute("src")) {
                    video.setAttribute("src", source);
                }
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                if (!hlsReady) {
                    var hls = new window.Hls({ enableWorker: true });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    hlsReady = true;
                }
                return;
            }
            if (!video.getAttribute("src")) {
                video.setAttribute("src", source);
            }
        }
        function play() {
            attach();
            cover.classList.add("is-hidden");
            video.controls = true;
            var promise = video.play();
            if (promise && promise.catch) {
                promise.catch(function() {});
            }
        }
        cover.addEventListener("click", play);
        video.addEventListener("click", function() {
            if (video.paused) {
                play();
            }
        });
    };

    ready(function() {
        setupMenu();
        setupHero();
        setupFilters();
        setupSearchPage();
    });
})();
