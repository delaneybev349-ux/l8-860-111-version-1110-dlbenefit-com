(function () {
    const toggle = document.querySelector(".nav-toggle");
    const nav = document.querySelector(".site-nav");

    if (toggle && nav) {
        toggle.addEventListener("click", function () {
            const opened = nav.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", opened ? "true" : "false");
        });
    }

    const slides = Array.from(document.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(document.querySelectorAll("[data-hero-dot]"));
    let activeSlide = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        activeSlide = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("is-active", slideIndex === activeSlide);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("is-active", dotIndex === activeSlide);
        });
    }

    dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
            const index = Number(dot.getAttribute("data-hero-dot"));
            showSlide(index);
        });
    });

    if (slides.length > 1) {
        window.setInterval(function () {
            showSlide(activeSlide + 1);
        }, 5600);
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function setupSearch(scope) {
        const input = scope.querySelector("[data-search-input]");
        const categorySelect = scope.querySelector("[data-category-filter]");
        const regionSelect = scope.querySelector("[data-region-filter]");
        const yearSelect = scope.querySelector("[data-year-filter]");
        const resultCount = scope.querySelector("[data-result-count]");
        const emptyState = scope.querySelector("[data-empty-state]");
        const cards = Array.from(scope.querySelectorAll("[data-movie-card]"));

        if (!cards.length) {
            return;
        }

        const params = new URLSearchParams(window.location.search);
        const initialQuery = params.get("q");

        if (initialQuery && input && !input.value) {
            input.value = initialQuery;
        }

        function applyFilters() {
            const keyword = input ? normalize(input.value) : "";
            const category = categorySelect ? normalize(categorySelect.value) : "";
            const region = regionSelect ? normalize(regionSelect.value) : "";
            const year = yearSelect ? normalize(yearSelect.value) : "";
            let visibleCount = 0;

            cards.forEach(function (card) {
                const searchText = normalize(card.getAttribute("data-search") + " " + card.getAttribute("data-title") + " " + card.getAttribute("data-genre"));
                const cardCategory = normalize(card.getAttribute("data-category"));
                const cardRegion = normalize(card.getAttribute("data-region"));
                const cardYear = normalize(card.getAttribute("data-year"));

                const matched = (!keyword || searchText.indexOf(keyword) !== -1)
                    && (!category || cardCategory === category)
                    && (!region || cardRegion === region)
                    && (!year || cardYear === year);

                card.classList.toggle("is-hidden", !matched);

                if (matched) {
                    visibleCount += 1;
                }
            });

            if (resultCount) {
                resultCount.textContent = "当前显示 " + visibleCount + " 部影片";
            }

            if (emptyState) {
                emptyState.classList.toggle("is-visible", visibleCount === 0);
            }
        }

        [input, categorySelect, regionSelect, yearSelect].forEach(function (control) {
            if (control) {
                control.addEventListener("input", applyFilters);
                control.addEventListener("change", applyFilters);
            }
        });

        applyFilters();
    }

    document.querySelectorAll("[data-search-scope]").forEach(setupSearch);
})();
