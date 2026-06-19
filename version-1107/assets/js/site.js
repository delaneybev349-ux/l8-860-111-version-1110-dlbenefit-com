(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function setupMenu() {
    var button = $("[data-menu-toggle]");
    var menu = $("[data-mobile-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var slider = $("[data-hero-slider]");
    if (!slider) {
      return;
    }

    var slides = $all(".hero-slide", slider);
    var dots = $all(".hero-dot");
    var active = 0;
    var timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle("is-active", itemIndex === active);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle("is-active", itemIndex === active);
      });
    }

    function start() {
      if (timer || slides.length < 2) {
        return;
      }
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    function stop() {
      if (!timer) {
        return;
      }
      window.clearInterval(timer);
      timer = null;
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        stop();
        start();
      });
    });

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupCatalogFilters() {
    var panel = $("[data-filter-panel]");
    var grid = $("[data-catalog-grid]");
    if (!panel || !grid) {
      return;
    }

    var cards = $all(".movie-card", grid);
    var searchInput = $("[data-catalog-search]", panel);
    var emptyMessage = $("[data-empty-message]");
    var activeYear = "all";
    var activeRegion = "all";
    var activeGenre = "all";

    function matches(card) {
      var q = normalize(searchInput ? searchInput.value : "");
      var title = normalize(card.getAttribute("data-title"));
      var year = normalize(card.getAttribute("data-year"));
      var region = normalize(card.getAttribute("data-region"));
      var genre = normalize(card.getAttribute("data-genre"));
      var searchText = normalize([
        card.getAttribute("data-title"),
        card.getAttribute("data-year"),
        card.getAttribute("data-region"),
        card.getAttribute("data-genre"),
        card.textContent
      ].join(" "));

      if (q && searchText.indexOf(q) === -1) {
        return false;
      }

      if (activeYear !== "all" && year !== activeYear) {
        return false;
      }

      if (activeRegion !== "all" && region !== activeRegion) {
        return false;
      }

      if (activeGenre !== "all" && genre.indexOf(activeGenre) === -1 && title.indexOf(activeGenre) === -1) {
        return false;
      }

      return true;
    }

    function refresh() {
      var visible = 0;
      cards.forEach(function (card) {
        var ok = matches(card);
        card.style.display = ok ? "" : "none";
        if (ok) {
          visible += 1;
        }
      });
      if (emptyMessage) {
        emptyMessage.classList.toggle("is-visible", visible === 0);
      }
    }

    panel.addEventListener("click", function (event) {
      var chip = event.target.closest("[data-filter-kind]");
      if (!chip) {
        return;
      }

      event.preventDefault();
      var kind = chip.getAttribute("data-filter-kind");
      var value = chip.getAttribute("data-filter-value") || "all";
      $all("[data-filter-kind='" + kind + "']", panel).forEach(function (item) {
        item.classList.toggle("is-active", item === chip);
      });

      if (kind === "year") {
        activeYear = normalize(value);
      }

      if (kind === "region") {
        activeRegion = normalize(value);
      }

      if (kind === "genre") {
        activeGenre = normalize(value);
      }

      refresh();
    });

    if (searchInput) {
      searchInput.addEventListener("input", refresh);
    }

    refresh();
  }

  function setupSearchPage() {
    var page = $("[data-search-page]");
    if (!page) {
      return;
    }

    var input = $("[data-main-search]", page);
    var grid = $("[data-search-grid]", page);
    var emptyMessage = $("[data-empty-message]", page);
    if (!input || !grid) {
      return;
    }

    var cards = $all(".movie-card", grid);
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    input.value = initial;

    function refresh() {
      var q = normalize(input.value);
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-year"),
          card.getAttribute("data-region"),
          card.getAttribute("data-genre"),
          card.textContent
        ].join(" "));
        var ok = !q || haystack.indexOf(q) !== -1;
        card.style.display = ok ? "" : "none";
        if (ok) {
          visible += 1;
        }
      });
      if (emptyMessage) {
        emptyMessage.classList.toggle("is-visible", visible === 0);
      }
    }

    input.addEventListener("input", refresh);
    refresh();
  }

  function setupPlayers() {
    $all(".movie-player").forEach(function (player) {
      var video = $(".player-video", player);
      var button = $(".player-start", player);
      if (!video || !button) {
        return;
      }

      var source = video.getAttribute("data-m3u8");
      var ready = false;

      function prepareVideo() {
        if (ready || !source) {
          return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          video._hls = hls;
        } else {
          video.src = source;
        }

        video.setAttribute("controls", "controls");
        ready = true;
      }

      function playVideo(event) {
        if (event) {
          event.preventDefault();
        }
        prepareVideo();
        player.classList.add("is-playing");
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {
            player.classList.remove("is-playing");
          });
        }
      }

      button.addEventListener("click", playVideo);
      player.addEventListener("click", function (event) {
        if (event.target === video) {
          return;
        }
        playVideo(event);
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupMenu();
    setupHero();
    setupCatalogFilters();
    setupSearchPage();
    setupPlayers();
  });
})();
