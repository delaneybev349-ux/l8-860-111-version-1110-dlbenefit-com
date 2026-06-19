(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function initMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function initHero() {
    var root = document.querySelector('[data-hero]');
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
    var prev = root.querySelector('[data-hero-prev]');
    var next = root.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  function initFilter() {
    var input = document.querySelector('[data-filter-input]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-filter-card]'));
    if (!input || !cards.length) {
      return;
    }
    input.addEventListener('input', function () {
      var keyword = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var content = [
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-category')
        ].join(' ').toLowerCase();
        card.hidden = keyword && content.indexOf(keyword) === -1;
      });
    });
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function renderSearchCard(movie) {
    return '' +
      '<article class="movie-card">' +
      '<a href="' + escapeHtml(movie.href) + '">' +
      '<div class="card-cover">' +
      '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
      '<span class="card-badge">' + escapeHtml(movie.category) + '</span>' +
      '<span class="card-play">▶</span>' +
      '</div>' +
      '<div class="card-body">' +
      '<h3>' + escapeHtml(movie.title) + '</h3>' +
      '<p>' + escapeHtml(movie.oneLine) + '</p>' +
      '<div class="card-meta">' +
      '<span>' + escapeHtml(movie.year) + '</span>' +
      '<span>' + escapeHtml(movie.region) + '</span>' +
      '<span>' + escapeHtml(movie.type) + '</span>' +
      '</div>' +
      '</div>' +
      '</a>' +
      '</article>';
  }

  function initSearchPage() {
    var results = document.querySelector('[data-search-results]');
    var summary = document.querySelector('[data-search-summary]');
    var input = document.querySelector('[data-search-input]');
    if (!results || !summary || !window.MOVIE_INDEX) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var keyword = params.get('q') || '';
    if (input) {
      input.value = keyword;
    }
    keyword = keyword.trim().toLowerCase();
    if (!keyword) {
      results.innerHTML = '';
      summary.textContent = '输入关键词即可查看匹配影片。';
      return;
    }
    var matched = window.MOVIE_INDEX.filter(function (movie) {
      return [movie.title, movie.year, movie.region, movie.type, movie.genre, movie.category, movie.tags, movie.oneLine]
        .join(' ')
        .toLowerCase()
        .indexOf(keyword) !== -1;
    }).slice(0, 240);
    summary.textContent = matched.length ? '已找到相关影片，点击卡片可进入详情页。' : '暂无匹配影片，可更换关键词重新搜索。';
    results.innerHTML = matched.map(renderSearchCard).join('');
  }

  function initPlayer() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    players.forEach(function (player) {
      var video = player.querySelector('video');
      var button = player.querySelector('.player-play-button');
      if (!video || !button) {
        return;
      }
      var source = video.getAttribute('data-source');
      var initialized = false;
      var hlsInstance = null;

      function attachSource() {
        if (initialized || !source) {
          return;
        }
        if (/\.m3u8(\?|$)/i.test(source) && window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else {
          video.src = source;
        }
        initialized = true;
      }

      function playVideo() {
        attachSource();
        video.setAttribute('controls', 'controls');
        player.classList.add('is-playing');
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            player.classList.remove('is-playing');
          });
        }
      }

      button.addEventListener('click', function (event) {
        event.preventDefault();
        playVideo();
      });

      player.addEventListener('click', function (event) {
        if (event.target === video || player.classList.contains('is-playing')) {
          return;
        }
        playVideo();
      });

      video.addEventListener('play', function () {
        player.classList.add('is-playing');
      });

      video.addEventListener('pause', function () {
        if (!video.ended) {
          player.classList.remove('is-playing');
        }
      });

      window.addEventListener('beforeunload', function () {
        if (hlsInstance && typeof hlsInstance.destroy === 'function') {
          hlsInstance.destroy();
        }
      });
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initFilter();
    initSearchPage();
    initPlayer();
  });
})();
