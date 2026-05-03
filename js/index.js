// Homepage script for Webflow
const FUNCTIONS_BASE_URL = "https://us-central1-juicevalley-33052.cloudfunctions.net";
const STORAGE_BASE_URL = "https://firebasestorage.googleapis.com/v0/b/juicevalley-33052.appspot.com/o";
const PRODUCTS_API_URL = `${FUNCTIONS_BASE_URL}/getAllProducts`;

const normalizeImageUrl = (value) => {
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  return `${STORAGE_BASE_URL}/${encodeURIComponent(value)}?alt=media`;
};

const showElement = (element, display = "block") => {
  if (!element) return;
  element.style.setProperty("display", display, "important");
  element.style.setProperty("opacity", "1", "important");
  element.style.setProperty("visibility", "visible", "important");
  element.classList.remove("hidden", "w-hidden", "w-condition-invisible");
};

let productTemplateCard = null;

const renderProductShimmers = (count = 4) => {
  const container = document.querySelector("#item-list");
  const templateCard = document.querySelector("#item-card");
  
  if (!container || !templateCard) return;
  if (!productTemplateCard) productTemplateCard = templateCard.cloneNode(true);

  container.innerHTML = "";
  templateCard.style.display = "none";

  for (let i = 0; i < count; i += 1) {
    const card = productTemplateCard.cloneNode(true);
    showElement(card, "block");
    card.removeAttribute("id");
    card.classList.add("shimmer-product-card");

    const imageWrap = card.querySelector(".product-image-wrap");
    if (imageWrap) imageWrap.innerHTML = '<div class="js-shimmer js-shimmer-block" style="width:100%;height:220px;"></div>';

    const title = card.querySelector("#item-tittle");
    if (title) {
        title.textContent = "";
        title.classList.add("js-shimmer", "js-shimmer-block");
        title.style.height = "20px";
        title.style.width = "60%";
    }
    
    container.appendChild(card);
  }

  // Init Carousel if Owl is loaded
  if (typeof $.fn.owlCarousel === 'function') {
    $(container).owlCarousel({
        loop: false, margin: 20, nav: false, dots: false,
        responsive: { 0: { items: 1.2 }, 600: { items: 2.5 }, 1000: { items: 4 } }
    });
  }
};

const renderProducts = (products) => {
  const container = document.querySelector("#item-list");
  if (!container || !productTemplateCard) return;

  // Destroy previous Owl
  if (typeof $.fn.owlCarousel === 'function' && $(container).data('owl.carousel')) {
    $(container).trigger("destroy.owl.carousel").removeClass("owl-loaded");
  }
  
  container.innerHTML = "";

  products.forEach((product) => {
    const card = productTemplateCard.cloneNode(true);
    showElement(card, "block");
    card.removeAttribute("id");
    card.classList.add("rendered-product-card");

    const image = card.querySelector("#item-image");
    if (image) {
        image.src = normalizeImageUrl(product.imageUrl || product.image);
        // Ensure image is hidden until loaded to prevent jumpy layout
        image.style.opacity = "0";
        image.style.transition = "opacity 0.3s ease-in-out";
        image.onload = () => image.style.opacity = "1";
    }

    const title = card.querySelector("#item-tittle");
    if (title) title.textContent = product.name || product.title || "Untitled Product";

    const energy = card.querySelector("#item-energy-value");
    if (energy) energy.textContent = product.energyValue ? `${product.energyValue} kcal` : "";

    container.appendChild(card);
  });

  // Re-init Owl
  if (typeof $.fn.owlCarousel === 'function') {
    $(container).addClass("owl-carousel owl-theme").owlCarousel({
        loop: products.length > 4,
        margin: 20,
        nav: true,
        dots: true,
        autoplay: true,
        responsive: { 0: { items: 1.2 }, 600: { items: 2.5 }, 1000: { items: 4 } }
    });
  }
};

document.addEventListener("DOMContentLoaded", async () => {
  renderProductShimmers(4);

  try {
    const response = await fetch(PRODUCTS_API_URL);
    const products = await response.json();
    if (products && products.length > 0) {
        renderProducts(products);
    }
  } catch (e) {
    console.error("Data load failed", e);
  }
});
