(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  ready(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');
    if (menuButton && mobileMenu) {
      menuButton.addEventListener('click', function () {
        mobileMenu.classList.toggle('open');
      });
    }

    document.querySelectorAll('[data-hero-slider]').forEach(function (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
      var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
      var current = 0;
      var timer = null;

      function activate(index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle('active', slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle('active', dotIndex === current);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          activate(current + 1);
        }, 5200);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }

      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener('click', function () {
          activate(dotIndex);
          start();
        });
      });

      slider.addEventListener('mouseenter', stop);
      slider.addEventListener('mouseleave', start);
      activate(0);
      start();
    });

    document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
      var input = scope.querySelector('[data-filter-input]');
      var chips = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-chip]'));
      var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));
      var empty = scope.querySelector('[data-empty-state]');
      var activeChip = 'all';

      function applyFilter() {
        var query = normalize(input ? input.value : '');
        var shown = 0;
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-year'),
            card.getAttribute('data-type'),
            card.getAttribute('data-region'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-tags')
          ].join(' '));
          var chipOk = activeChip === 'all' || haystack.indexOf(normalize(activeChip)) !== -1;
          var queryOk = !query || haystack.indexOf(query) !== -1;
          var visible = chipOk && queryOk;
          card.style.display = visible ? '' : 'none';
          if (visible) {
            shown += 1;
          }
        });
        if (empty) {
          empty.style.display = shown ? 'none' : 'block';
        }
      }

      if (input) {
        input.addEventListener('input', applyFilter);
      }
      chips.forEach(function (chip) {
        chip.addEventListener('click', function () {
          activeChip = chip.getAttribute('data-filter-chip') || 'all';
          chips.forEach(function (item) {
            item.classList.toggle('active', item === chip);
          });
          applyFilter();
        });
      });
      applyFilter();
    });

    var searchResults = document.querySelector('[data-search-results]');
    if (searchResults && Array.isArray(window.MOVIE_INDEX)) {
      var searchInput = document.querySelector('[data-search-input]');
      var searchForm = document.querySelector('[data-search-form]');
      var searchEmpty = document.querySelector('[data-search-empty]');
      var params = new URLSearchParams(window.location.search);
      var initial = params.get('q') || '';
      if (searchInput) {
        searchInput.value = initial;
      }

      function buildCard(movie) {
        return [
          '<article class="movie-card" data-movie-card>',
          '<a href="' + movie.url + '">',
          '<div class="poster-wrap">',
          '<img src="' + movie.cover + '" alt="' + movie.title + '" loading="lazy">',
          '<span class="card-rating">★ ' + movie.rating + '</span>',
          '<span class="card-type">' + movie.type + '</span>',
          '</div>',
          '<div class="card-body">',
          '<h2 class="card-title">' + movie.title + '</h2>',
          '<p class="card-desc">' + movie.oneLine + '</p>',
          '<div class="card-meta">',
          '<span>' + movie.year + '</span>',
          '<span>' + movie.region + '</span>',
          '<span>' + movie.genre + '</span>',
          '</div>',
          '</div>',
          '</a>',
          '</article>'
        ].join('');
      }

      function renderSearch() {
        var query = normalize(searchInput ? searchInput.value : '');
        var results = window.MOVIE_INDEX.filter(function (movie) {
          var haystack = normalize([
            movie.title,
            movie.year,
            movie.type,
            movie.region,
            movie.genre,
            movie.tags,
            movie.oneLine
          ].join(' '));
          return !query || haystack.indexOf(query) !== -1;
        }).slice(0, 120);
        searchResults.innerHTML = results.map(buildCard).join('');
        if (searchEmpty) {
          searchEmpty.style.display = results.length ? 'none' : 'block';
        }
      }

      if (searchForm) {
        searchForm.addEventListener('submit', function (event) {
          event.preventDefault();
          var next = searchInput ? searchInput.value.trim() : '';
          var url = next ? 'search.html?q=' + encodeURIComponent(next) : 'search.html';
          window.history.replaceState(null, '', url);
          renderSearch();
        });
      }
      if (searchInput) {
        searchInput.addEventListener('input', renderSearch);
      }
      renderSearch();
    }
  });
})();
