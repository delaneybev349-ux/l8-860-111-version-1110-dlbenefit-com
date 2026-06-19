(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function initMenu() {
        var button = document.querySelector('[data-menu-button]');
        var menu = document.querySelector('[data-mobile-nav]');
        if (!button || !menu) {
            return;
        }
        button.addEventListener('click', function () {
            menu.classList.toggle('is-open');
        });
    }

    function initHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        if (slides.length < 2) {
            return;
        }
        var activeIndex = 0;
        var timer = null;

        function showSlide(index) {
            activeIndex = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('hero-slide-active', i === activeIndex);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === activeIndex);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                showSlide(activeIndex + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        start();
    }

    function normalize(text) {
        return String(text || '').toLowerCase().trim();
    }

    function initCategoryFilters() {
        var panel = document.querySelector('[data-category-filter]');
        var list = document.querySelector('[data-card-list]');
        if (!panel || !list) {
            return;
        }
        var search = panel.querySelector('.category-search');
        var year = panel.querySelector('.category-year');
        var region = panel.querySelector('.category-region');
        var sort = panel.querySelector('.category-sort');
        var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));

        function apply() {
            var keyword = normalize(search && search.value);
            var selectedYear = year ? year.value : '';
            var selectedRegion = region ? region.value : '';
            cards.forEach(function (card) {
                var text = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-genre'),
                    card.textContent
                ].join(' '));
                var matchedKeyword = !keyword || text.indexOf(keyword) > -1;
                var matchedYear = !selectedYear || card.getAttribute('data-year') === selectedYear;
                var matchedRegion = !selectedRegion || card.getAttribute('data-region') === selectedRegion;
                card.hidden = !(matchedKeyword && matchedYear && matchedRegion);
            });
            if (sort && sort.value !== 'default') {
                var visible = cards.slice().sort(function (a, b) {
                    if (sort.value === 'score') {
                        return Number(b.getAttribute('data-score')) - Number(a.getAttribute('data-score'));
                    }
                    return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
                });
                visible.forEach(function (card) {
                    list.appendChild(card);
                });
            }
        }

        [search, year, region, sort].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });
    }

    function movieCardTemplate(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');
        return '' +
            '<article class="movie-card grid" data-title="' + escapeHtml(movie.title) + '" data-year="' + escapeHtml(movie.year) + '" data-region="' + escapeHtml(movie.region) + '" data-genre="' + escapeHtml(movie.genre) + '" data-score="' + escapeHtml(movie.rating) + '">' +
                '<a class="movie-poster" href="' + escapeHtml(movie.url) + '" aria-label="' + escapeHtml(movie.title) + '">' +
                    '<img src="' + escapeHtml(movie.image) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
                    '<span class="poster-score">' + escapeHtml(movie.rating) + '</span>' +
                '</a>' +
                '<div class="movie-card-body">' +
                    '<div class="movie-meta-row">' +
                        '<a href="' + escapeHtml(movie.categoryUrl) + '">' + escapeHtml(movie.categoryName) + '</a>' +
                        '<span>' + escapeHtml(movie.year) + '</span>' +
                    '</div>' +
                    '<h2><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h2>' +
                    '<p>' + escapeHtml(movie.oneLine) + '</p>' +
                    '<div class="movie-tags">' + tags + '</div>' +
                '</div>' +
            '</article>';
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function initSearchPage() {
        var results = document.querySelector('[data-search-results]');
        var title = document.querySelector('[data-search-title]');
        var input = document.querySelector('[data-search-input]');
        if (!results || !window.SEARCH_INDEX) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';
        if (input) {
            input.value = query;
        }
        if (!query.trim()) {
            return;
        }
        var keyword = normalize(query);
        var matched = window.SEARCH_INDEX.filter(function (movie) {
            var content = normalize([
                movie.title,
                movie.region,
                movie.type,
                movie.year,
                movie.genre,
                (movie.tags || []).join(' '),
                movie.oneLine
            ].join(' '));
            return content.indexOf(keyword) > -1;
        }).slice(0, 80);
        if (title) {
            title.textContent = '搜索结果：' + query;
        }
        results.innerHTML = matched.length ? matched.map(movieCardTemplate).join('') : '<div class="detail-section"><h2>未找到相关影片</h2><p>可以尝试更换片名、类型、地区或年份。</p></div>';
    }

    function startPlayer(box) {
        var video = box.querySelector('video');
        var overlay = box.querySelector('[data-play-button]');
        if (!video) {
            return;
        }
        var source = video.getAttribute('data-src');
        if (!source) {
            return;
        }
        if (!video.getAttribute('src')) {
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.setAttribute('src', source);
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({ enableWorker: true });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.setAttribute('src', source);
            }
        }
        if (overlay) {
            overlay.classList.add('is-hidden');
        }
        video.controls = true;
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {});
        }
    }

    function initPlayers() {
        var boxes = Array.prototype.slice.call(document.querySelectorAll('[data-player-box]'));
        boxes.forEach(function (box) {
            var overlay = box.querySelector('[data-play-button]');
            if (overlay) {
                overlay.addEventListener('click', function () {
                    startPlayer(box);
                });
            }
        });
    }

    ready(function () {
        initMenu();
        initHero();
        initCategoryFilters();
        initSearchPage();
        initPlayers();
    });
}());
