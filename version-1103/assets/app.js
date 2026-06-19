(function () {
    const menuButton = document.querySelector('[data-menu-button]');
    const mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
        });
    }

    const hero = document.querySelector('[data-hero-carousel]');

    if (hero) {
        const slides = Array.from(hero.querySelectorAll('.hero-slide'));
        const dots = Array.from(hero.querySelectorAll('.hero-dot'));
        let index = 0;

        const show = function (next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        };

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
            });
        });

        if (slides.length > 1) {
            setInterval(function () {
                show(index + 1);
            }, 5200);
        }
    }

    const params = new URLSearchParams(window.location.search);
    const queryParam = params.get('q') || '';
    const searchInputs = Array.from(document.querySelectorAll('[data-search-input]'));
    const filterButtons = Array.from(document.querySelectorAll('[data-filter-button]'));
    const cards = Array.from(document.querySelectorAll('.movie-card'));
    const emptyState = document.querySelector('[data-empty-state]');
    let activeFilter = 'all';

    const normalize = function (value) {
        return String(value || '').trim().toLowerCase();
    };

    const applyFilters = function () {
        const terms = searchInputs.map(function (input) {
            return normalize(input.value);
        }).filter(Boolean);
        const term = terms[0] || '';
        let visible = 0;

        cards.forEach(function (card) {
            const keywords = normalize(card.getAttribute('data-keywords'));
            const cardFilter = card.getAttribute('data-filter') || '';
            const matchesText = !term || keywords.indexOf(term) !== -1;
            const matchesFilter = activeFilter === 'all' || cardFilter === activeFilter;
            const keep = matchesText && matchesFilter;
            card.style.display = keep ? '' : 'none';
            if (keep) {
                visible += 1;
            }
        });

        if (emptyState) {
            emptyState.classList.toggle('is-visible', visible === 0);
        }
    };

    if (queryParam && searchInputs.length) {
        searchInputs.forEach(function (input) {
            input.value = queryParam;
        });
    }

    searchInputs.forEach(function (input) {
        input.addEventListener('input', applyFilters);
    });

    filterButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            activeFilter = button.getAttribute('data-filter-button') || 'all';
            filterButtons.forEach(function (item) {
                item.classList.toggle('is-active', item === button);
            });
            applyFilters();
        });
    });

    if (cards.length && (searchInputs.length || filterButtons.length)) {
        applyFilters();
    }
})();

window.initMoviePlayback = function (streamUrl) {
    const video = document.getElementById('movieVideo');
    const cover = document.getElementById('playCover');
    let ready = false;
    let hls = null;

    if (!video || !cover || !streamUrl) {
        return;
    }

    const prepare = function () {
        if (ready) {
            return;
        }
        ready = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls();
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
            return;
        }

        video.src = streamUrl;
    };

    const start = function () {
        prepare();
        cover.classList.add('is-hidden');
        video.controls = true;
        const playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
                cover.classList.remove('is-hidden');
            });
        }
    };

    cover.addEventListener('click', start);
    video.addEventListener('click', function () {
        if (video.paused) {
            start();
        }
    });

    window.addEventListener('pagehide', function () {
        if (hls) {
            hls.destroy();
            hls = null;
        }
    });
};
