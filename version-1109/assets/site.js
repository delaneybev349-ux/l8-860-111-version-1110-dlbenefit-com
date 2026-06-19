const nav = document.querySelector('[data-main-nav]');
const menuToggle = document.querySelector('[data-menu-toggle]');

if (menuToggle && nav) {
  menuToggle.addEventListener('click', () => {
    nav.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', nav.classList.contains('is-open') ? 'true' : 'false');
  });
}

const hero = document.querySelector('[data-hero-carousel]');

if (hero) {
  const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
  let index = 0;

  const activate = (next) => {
    if (!slides.length) {
      return;
    }

    index = (next + slides.length) % slides.length;
    slides.forEach((slide, position) => {
      slide.classList.toggle('is-active', position === index);
    });
    dots.forEach((dot, position) => {
      dot.classList.toggle('is-active', position === index);
    });
  };

  dots.forEach((dot, position) => {
    dot.addEventListener('click', () => activate(position));
  });

  activate(0);
  window.setInterval(() => activate(index + 1), 5200);
}

const params = new URLSearchParams(window.location.search);
const query = params.get('q') || '';

document.querySelectorAll('[data-query-input]').forEach((input) => {
  if (query && !input.value) {
    input.value = query;
  }
});

document.querySelectorAll('[data-filter-scope]').forEach((scope) => {
  const input = scope.querySelector('[data-filter-input]');
  const cards = Array.from(scope.querySelectorAll('[data-card]'));
  const buttons = Array.from(scope.querySelectorAll('[data-filter-value]'));
  const count = scope.querySelector('[data-result-count]');
  const empty = scope.querySelector('[data-no-results]');
  let active = '';

  const apply = () => {
    const words = (input ? input.value : '').trim().toLowerCase().split(/\s+/).filter(Boolean);
    let visible = 0;

    cards.forEach((card) => {
      const text = (card.getAttribute('data-search') || '').toLowerCase();
      const tags = (card.getAttribute('data-tags') || '').toLowerCase();
      const textMatched = words.every((word) => text.includes(word));
      const tagMatched = !active || tags.includes(active.toLowerCase()) || text.includes(active.toLowerCase());
      const matched = textMatched && tagMatched;

      card.classList.toggle('hide-card', !matched);
      if (matched) {
        visible += 1;
      }
    });

    if (count) {
      count.textContent = String(visible);
    }

    if (empty) {
      empty.classList.toggle('is-visible', visible === 0);
    }
  };

  if (input) {
    input.addEventListener('input', apply);
  }

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      active = button.getAttribute('data-filter-value') || '';
      buttons.forEach((item) => item.classList.toggle('is-active', item === button));
      apply();
    });
  });

  apply();
});

let hlsClassPromise = null;

const getHlsClass = async () => {
  if (!hlsClassPromise) {
    hlsClassPromise = import('./hls-dru42stk.js').then((module) => module.H);
  }

  return hlsClassPromise;
};

document.querySelectorAll('[data-player]').forEach((panel) => {
  const video = panel.querySelector('video');
  const cover = panel.querySelector('.player-cover');
  const configNode = panel.querySelector('script[type="application/json"]');

  if (!video || !configNode) {
    return;
  }

  let config = {};

  try {
    config = JSON.parse(configNode.textContent || '{}');
  } catch (error) {
    config = {};
  }

  const src = config.src;
  let ready = false;
  let instance = null;

  const prepare = async () => {
    if (ready || !src) {
      return;
    }

    const nativeType = 'application/vnd.apple.mpegurl';

    if (video.canPlayType(nativeType)) {
      video.src = src;
    } else {
      const Hls = await getHlsClass();
      if (Hls && Hls.isSupported()) {
        instance = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        instance.loadSource(src);
        instance.attachMedia(video);
      } else {
        video.src = src;
      }
    }

    ready = true;
  };

  const play = async () => {
    await prepare();
    if (cover) {
      cover.hidden = true;
    }
    try {
      await video.play();
    } catch (error) {
      video.controls = true;
    }
  };

  if (cover) {
    cover.addEventListener('click', play);
  }

  video.addEventListener('click', () => {
    if (video.paused) {
      play();
    }
  });

  video.addEventListener('play', () => {
    if (cover) {
      cover.hidden = true;
    }
  });

  window.addEventListener('pagehide', () => {
    if (instance) {
      instance.destroy();
      instance = null;
    }
  });
});
