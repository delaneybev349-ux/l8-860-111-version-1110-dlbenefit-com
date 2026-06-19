(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            var open = mobilePanel.classList.toggle('is-open');
            menuButton.setAttribute('aria-expanded', String(open));
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('hero-slide-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('hero-dot-active', dotIndex === current);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5600);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(current - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(current + 1);
                restart();
            });
        }

        restart();
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-search-form]')).forEach(function (form) {
        form.addEventListener('submit', function (event) {
            var input = form.querySelector('input[name="q"]');
            var query = input ? input.value.trim() : '';
            if (query) {
                event.preventDefault();
                window.location.href = './search.html?q=' + encodeURIComponent(query);
            }
        });
    });

    var panel = document.querySelector('[data-filter-panel]');

    if (panel) {
        var searchInput = panel.querySelector('[data-search-input]');
        var yearFilter = panel.querySelector('[data-year-filter]');
        var categoryFilter = panel.querySelector('[data-category-filter]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';

        if (searchInput && initialQuery) {
            searchInput.value = initialQuery;
        }

        function containsText(card, query) {
            if (!query) {
                return true;
            }
            var haystack = [
                card.getAttribute('data-title'),
                card.getAttribute('data-region'),
                card.getAttribute('data-type'),
                card.getAttribute('data-year'),
                card.getAttribute('data-genre'),
                card.getAttribute('data-tags'),
                card.textContent
            ].join(' ').toLowerCase();
            return haystack.indexOf(query.toLowerCase()) !== -1;
        }

        function matchesYear(card, value) {
            if (!value) {
                return true;
            }
            return card.getAttribute('data-year') === value;
        }

        function matchesCategory(card, value) {
            if (!value) {
                return true;
            }
            return card.getAttribute('data-category') === value;
        }

        function applyFilters() {
            var query = searchInput ? searchInput.value.trim() : '';
            var year = yearFilter ? yearFilter.value : '';
            var category = categoryFilter ? categoryFilter.value : '';

            cards.forEach(function (card) {
                var visible = containsText(card, query) && matchesYear(card, year) && matchesCategory(card, category);
                card.classList.toggle('hidden-card', !visible);
            });
        }

        [searchInput, yearFilter, categoryFilter].forEach(function (item) {
            if (item) {
                item.addEventListener('input', applyFilters);
                item.addEventListener('change', applyFilters);
            }
        });

        applyFilters();
    }
})();
