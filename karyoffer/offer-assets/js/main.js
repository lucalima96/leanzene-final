// Ingredients Slider
class IngredientsSlider {
  constructor() {
    this.track = document.querySelector(".slider-track");
    this.prevBtn = document.querySelector(".slider-btn.prev");
    this.nextBtn = document.querySelector(".slider-btn.next");
    this.cards = document.querySelectorAll(".ingredient-card");

    if (!this.track || !this.prevBtn || !this.nextBtn) return;

    this.currentIndex = 0;
    this.cardsPerView = this.getCardsPerView();

    this.init();
  }

  getCardsPerView() {
    if (window.innerWidth <= 600) return 1;
    if (window.innerWidth <= 900) return 2;
    return 3;
  }

  init() {
    // Button click events
    this.prevBtn.addEventListener("click", () => this.prev());
    this.nextBtn.addEventListener("click", () => this.next());

    // Touch events for swipe
    let startX = 0;
    let currentX = 0;
    let isDragging = false;

    this.track.addEventListener("touchstart", (e) => {
      startX = e.touches[0].clientX;
      isDragging = true;
    });

    this.track.addEventListener("touchmove", (e) => {
      if (!isDragging) return;
      currentX = e.touches[0].clientX;
    });

    this.track.addEventListener("touchend", () => {
      if (!isDragging) return;
      isDragging = false;

      const diff = startX - currentX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          this.next();
        } else {
          this.prev();
        }
      }
    });

    // Mouse events for desktop drag
    let startMouseX = 0;
    let endMouseX = 0;
    let isMouseDragging = false;
    let hasMoved = false;

    this.track.addEventListener("mousedown", (e) => {
      startMouseX = e.clientX;
      endMouseX = e.clientX;
      isMouseDragging = true;
      hasMoved = false;
      this.track.style.cursor = "grabbing";
    });

    this.track.addEventListener("mousemove", (e) => {
      if (!isMouseDragging) return;
      endMouseX = e.clientX;

      // Check if there's significant horizontal movement
      if (Math.abs(startMouseX - endMouseX) > 5) {
        hasMoved = true;
      }
    });

    this.track.addEventListener("mouseup", () => {
      if (!isMouseDragging) return;
      isMouseDragging = false;
      this.track.style.cursor = "grab";

      if (hasMoved) {
        const diff = startMouseX - endMouseX;
        if (Math.abs(diff) > 30) {
          if (diff > 0) {
            this.next();
          } else {
            this.prev();
          }
        }
      }
    });

    this.track.addEventListener("mouseleave", () => {
      if (isMouseDragging && hasMoved) {
        const diff = startMouseX - endMouseX;
        if (Math.abs(diff) > 30) {
          if (diff > 0) {
            this.next();
          } else {
            this.prev();
          }
        }
      }
      isMouseDragging = false;
      hasMoved = false;
      this.track.style.cursor = "grab";
    });

    // Resize handler
    window.addEventListener("resize", () => {
      this.cardsPerView = this.getCardsPerView();
      this.updateSlider();
    });

    // Initial state
    this.updateSlider();
    this.track.style.cursor = "grab";
  }

  next() {
    const maxIndex = this.cards.length - this.cardsPerView;
    if (this.currentIndex < maxIndex) {
      this.currentIndex++;
      this.updateSlider();
    }
  }

  prev() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.updateSlider();
    }
  }

  updateSlider() {
    // Calculate the exact width of one card including gap
    const containerWidth = this.track.parentElement.offsetWidth;
    const gap = 20;
    const cardWidth =
      (containerWidth - gap * (this.cardsPerView - 1)) / this.cardsPerView;

    // Move by the width of cards + gaps
    const offset = this.currentIndex * (cardWidth + gap);
    this.track.style.transform = `translateX(-${offset}px)`;

    // Update button states
    this.prevBtn.disabled = this.currentIndex === 0;
    this.nextBtn.disabled =
      this.currentIndex >= this.cards.length - this.cardsPerView;
  }
}

// Initialize slider when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    new IngredientsSlider();
  });
} else {
  new IngredientsSlider();
}

// FAQ Accordion - cada item funciona independentemente
document.querySelectorAll(".accordion .item .header").forEach((header) => {
  header.addEventListener("click", function () {
    const item = this.parentNode;
    if (item.classList.contains("active")) {
      item.classList.remove("active");
    } else {
      item.classList.add("active");
    }
  });
});

// Função para combinar os parâmetros do href original com os parâmetros da URL atual
function combineParams(originalHref, currentParams) {
  let [baseUrl, originalParamsString] = originalHref.split("?");
  let originalParams = new URLSearchParams(originalParamsString || "");

  // Adiciona os parâmetros atuais da URL aos parâmetros originais
  currentParams.forEach((value, key) => {
    // Verifica se o parâmetro já existe para evitar duplicação
    if (!originalParams.has(key)) {
      originalParams.append(key, value);
    }
  });

  // Monta a URL final
  let finalParamsString = originalParams.toString();
  return finalParamsString ? `${baseUrl}?${finalParamsString}` : baseUrl;
}

// Adiciona os parâmetros da URL aos links de checkout
document.addEventListener("DOMContentLoaded", function () {
  let buttons = document.querySelectorAll(".area-kits a");
  let currentParams = getQueryParams();

  buttons.forEach(function (button) {
    let originalHref = button.getAttribute("href");
    button.setAttribute("href", combineParams(originalHref, currentParams));
  });
});
