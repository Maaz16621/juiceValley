// Homepage script for Webflow
// Add page-specific JavaScript here.

const FUNCTIONS_BASE_URL = "https://us-central1-juicevalley-33052.cloudfunctions.net";
const MENU_PAGE_URL = "/menu";
const STORAGE_BASE_URL = "https://firebasestorage.googleapis.com/v0/b/juicevalley-33052.appspot.com/o";
const PRODUCTS_API_URL = `${FUNCTIONS_BASE_URL}/getAllProducts`;
const DEALS_API_URL = `${FUNCTIONS_BASE_URL}/getDeals`;

const normalizeImageUrl = (value) => {
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) {
    return value;
  }
  return `${STORAGE_BASE_URL}/${encodeURIComponent(value)}?alt=media`;
};

const fetchAllProducts = async () => {
  try {
    const response = await fetch(PRODUCTS_API_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Products request failed with status ${response.status}`);
    }

    const products = await response.json();
    console.log("Loaded products:", products);
    return products;
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return [];
  }
};

const fetchDeals = async () => {
  try {
    const response = await fetch(DEALS_API_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Deals request failed with status ${response.status}`);
    }

    const deals = await response.json();
    console.log("Loaded deals:", deals);
    return deals;
  } catch (error) {
    console.error("Failed to fetch deals:", error);
    return [];
  }
};

let productTemplateSlide = null;
let dealTemplateCard = null;

const handleSearchSubmit = (event) => {
  if (event) {
    event.preventDefault();
  }

  const searchInput = document.querySelector("#Search");
  const searchTerm = searchInput ? searchInput.value.trim() : "";
  const destination = searchTerm
    ? `${MENU_PAGE_URL}?search=${encodeURIComponent(searchTerm)}`
    : MENU_PAGE_URL;

  window.location.href = destination;
};

const addShimmerStyles = () => {
  if (document.getElementById("js-shimmer-styles")) return;

  const style = document.createElement("style");
  style.id = "js-shimmer-styles";
  style.textContent = `
    @keyframes js-shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    .js-shimmer {
      background: linear-gradient(90deg, #f3f3f3 25%, #e8e8e8 50%, #f3f3f3 75%);
      background-size: 200% 100%;
      animation: js-shimmer 1.2s linear infinite;
    }
    .js-shimmer-card {
      border-radius: 20px;
      background-color: #fdfdfd;
      box-shadow: 0 10px 30px rgba(0,0,0,0.05);
      padding: 20px;
      margin-bottom: 20px;
    }
    .js-shimmer-block {
      border-radius: 12px;
    }
  `;
  document.head.appendChild(style);
};

const createDealShimmer = () => {
  const card = document.createElement("div");
  card.className = "js-shimmer-card shimmer-deal-card";
  card.innerHTML = `
    <div style="display:grid;gap:12px;">
      <div class="js-shimmer js-shimmer-block" style="width:100%;height:220px;"></div>
      <div class="js-shimmer js-shimmer-block" style="width:60%;height:22px;"></div>
      <div class="js-shimmer js-shimmer-block" style="width:40%;height:16px;"></div>
    </div>
  `;
  return card;
};

const createProductShimmer = () => {
  const slide = document.createElement("div");
  slide.className = "w-slide rendered-product-slide shimmer-product-slide";
  slide.style.padding = "12px";
  slide.style.boxSizing = "border-box";
  slide.innerHTML = `
    <div style="display:grid; gap:12px; border-radius:20px; background:#fff; padding:18px; min-height:360px; box-shadow:0 10px 30px rgba(0,0,0,0.05);">
      <div class="js-shimmer js-shimmer-block" style="width:100%; height:220px;"></div>
      <div class="js-shimmer js-shimmer-block" style="width:55%; height:20px;"></div>
      <div class="js-shimmer js-shimmer-block" style="width:40%; height:16px;"></div>
      <div class="js-shimmer js-shimmer-block" style="width:80%; height:16px;"></div>
    </div>
  `;
  return slide;
};

const renderDealShimmers = (count = 3) => {
  const container = document.querySelector(".featured-products-list");
  if (!container) return;

  clearRenderedDeals(container);
  clearRenderedDealShimmers(container);
  addShimmerStyles();

  for (let i = 0; i < count; i += 1) {
    container.appendChild(createDealShimmer());
  }
};

const clearRenderedDealShimmers = (container) => {
  const placeholderCards = container.querySelectorAll(".shimmer-deal-card");
  placeholderCards.forEach((card) => card.remove());
};

const renderProductShimmers = (count = 3) => {
  const sliderMask = document.querySelector("#item-list .w-slider-mask");
  if (!sliderMask) return;

  clearRenderedProducts(sliderMask);
  clearRenderedProductShimmers(sliderMask);
  addShimmerStyles();

  for (let i = 0; i < count; i += 1) {
    sliderMask.appendChild(createProductShimmer());
  }
};

const clearRenderedProductShimmers = (mask) => {
  const placeholderSlides = mask.querySelectorAll(".shimmer-product-slide");
  placeholderSlides.forEach((slide) => slide.remove());
};

const clearRenderedDeals = (container) => {
  const renderedCards = container.querySelectorAll(".rendered-deal-card");
  renderedCards.forEach((card) => card.remove());
};

const createDealCard = (deal) => {
  const templateCard = dealTemplateCard || document.querySelector("#deal-card");
  if (!templateCard) {
    return null;
  }

  const card = templateCard.cloneNode(true);
  card.classList.add("rendered-deal-card");
  card.removeAttribute("id");

  const image = card.querySelector("#deal-image");
  if (image) {
    image.removeAttribute("id");
    image.src = normalizeImageUrl(deal.imageUrl || deal.image || deal.imagePath || deal.imagePathName);
    image.alt = deal.title || "Deal image";
  }

  const nameEl = card.querySelector("#deal-name");
  if (nameEl) {
    nameEl.removeAttribute("id");
    nameEl.textContent = deal.title || deal.name || "Untitled Deal";
  }

  const descriptionEl = card.querySelector("#deal-description");
  if (descriptionEl) {
    descriptionEl.removeAttribute("id");
    descriptionEl.textContent = deal.description || deal.subtitle || "";
  }

  const priceEl = card.querySelector(".price-setting");
  if (priceEl) {
    priceEl.remove();
  }

  return card;
};

const renderDeals = (deals) => {
  const container = document.querySelector(".featured-products-list");
  const templateCard = document.querySelector("#deal-card");

  if (!container || !templateCard) {
    console.warn("Deal container or template card not found.");
    return;
  }

  clearRenderedDealShimmers(container);
  clearRenderedDeals(container);
  if (!dealTemplateCard) {
    dealTemplateCard = templateCard.cloneNode(true);
  }
  templateCard.remove();

  deals.forEach((deal) => {
    const card = createDealCard(deal);
    if (card) {
      container.appendChild(card);
    }
  });
};

const clearRenderedProducts = (mask) => {
  const renderedSlides = mask.querySelectorAll(".rendered-product-slide");
  renderedSlides.forEach((slide) => slide.remove());
};

const createProductSlide = (product) => {
  const templateSlide = productTemplateSlide || document.querySelector("#item-card")?.closest(".w-slide");
  if (!templateSlide) {
    return null;
  }

  const slide = templateSlide.cloneNode(true);
  slide.classList.add("rendered-product-slide");
  slide.removeAttribute("aria-label");
  slide.removeAttribute("role");
  slide.style.opacity = "";
  slide.style.transform = "";

  const card = slide.querySelector("#item-card");
  if (card) {
    card.removeAttribute("id");
  }

  const image = slide.querySelector("#item-image");
  if (image) {
    image.removeAttribute("id");
    image.src = normalizeImageUrl(product.imageUrl || product.image || product.imagePath || product.imagePathName);
    image.alt = product.title || product.name || "Product image";
  }

  const title = slide.querySelector("#item-tittle");
  if (title) {
    title.removeAttribute("id");
    title.textContent = product.title || product.name || "Untitled Product";
  }

  const energy = slide.querySelector("#item-energy-value");
  if (energy) {
    energy.removeAttribute("id");
    energy.textContent = product.subtitle || product.categoryName || "";
  }

  const description = slide.querySelector("#item-description");
  if (description) {
    description.removeAttribute("id");
    description.textContent = product.description || "";
  }

  const ingredient = slide.querySelector("#item-ingredient");
  if (ingredient) {
    ingredient.removeAttribute("id");
    ingredient.textContent = product.ingredients || product.ingredientsList || "";
  }

  const priceEl = slide.querySelector(".price-setting");
  if (priceEl) {
    priceEl.remove();
  }

  return slide;
};

const renderProducts = (products) => {
  const sliderMask = document.querySelector("#item-list .w-slider-mask");
  const templateSlide = document.querySelector("#item-card")?.closest(".w-slide");

  if (!sliderMask || !templateSlide) {
    console.warn("Product slider mask or template slide not found.");
    return;
  }

  clearRenderedProductShimmers(sliderMask);
  clearRenderedProducts(sliderMask);
  if (!productTemplateSlide) {
    productTemplateSlide = templateSlide.cloneNode(true);
  }
  templateSlide.remove();

  products.forEach((product) => {
    const slide = createProductSlide(product);
    if (slide) {
      sliderMask.appendChild(slide);
    }
  });
};

document.addEventListener("DOMContentLoaded", async () => {
  console.log("Homepage script loaded");

  const heroTitle = document.querySelector(".hero-title");
  if (heroTitle) {
    heroTitle.textContent = "Welcome to Juice Valley";
  }

  const searchForm = document.querySelector("form#wf-form-") || document.querySelector("form[name='wf-form-']");
  if (searchForm) {
    searchForm.addEventListener("submit", handleSearchSubmit);
  }

  renderDealShimmers(3);
  renderProductShimmers(3);

  const [products, deals] = await Promise.all([fetchAllProducts(), fetchDeals()]);
  console.log("Homepage data:", { products, deals });

  renderDeals(deals);
  renderProducts(products);
});
