// Homepage script for Webflow
const FUNCTIONS_BASE_URL = "https://us-central1-juicevalley-33052.cloudfunctions.net";
const MENU_PAGE_URL = "/menu";
const STORAGE_BASE_URL = "https://firebasestorage.googleapis.com/v0/b/juicevalley-33052.appspot.com/o";
const PRODUCTS_API_URL = `${FUNCTIONS_BASE_URL}/getAllProducts`;
const DEALS_API_URL = `${FUNCTIONS_BASE_URL}/getDeals`;

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

const fetchAllProducts = async () => {
  try {
    const response = await fetch(PRODUCTS_API_URL);
    if (!response.ok) throw new Error(`Status ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return [];
  }
};

const fetchDeals = async () => {
  try {
    const response = await fetch(DEALS_API_URL);
    if (!response.ok) throw new Error(`Status ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch deals:", error);
    return [];
  }
};

let productTemplateCard = null;
let dealTemplateCard = null;

const createProductShimmer = () => {
  const templateCard = productTemplateCard || document.querySelector("#item-card");
  if (!templateCard) return null;

  const card = templateCard.cloneNode(true);
  showElement(card, "block");
  card.classList.add("rendered-product-card", "shimmer-product-card");
  card.removeAttribute("id");

  const imageWrap = card.querySelector(".product-image-wrap");
  if (imageWrap) imageWrap.innerHTML = '<div class="js-shimmer js-shimmer-block" style="width:100%;height:220px;"></div>';

  const title = card.querySelector("#item-tittle");
  if (title) {
    title.textContent = "";
    title.classList.add("js-shimmer", "js-shimmer-block");
    title.style.height = "20px";
  }

  const priceEl = card.querySelector(".price-setting");
  if (priceEl) priceEl.remove();

  return card;
};

const renderProductShimmers = (count = 4) => {
  const container = document.querySelector("#item-list");
  const templateCard = document.querySelector("#item-card");
  
  if (!container || !templateCard) {
    console.error("Required elements not found for products:", { container: !!container, templateCard: !!templateCard });
    return;
  }

  if (!productTemplateCard) productTemplateCard = templateCard.cloneNode(true);

  container.innerHTML = "";
  templateCard.style.setProperty("display", "none", "important");

  for (let i = 0; i < count; i += 1) {
    const shimmer = createProductShimmer();
    if (shimmer) container.appendChild(shimmer);
  }

  $(container).owlCarousel({
    loop: false,
    margin: 20,
    nav: false,
    dots: false,
    responsive: { 0: { items: 1.2 }, 600: { items: 2.5 }, 1000: { items: 4 } }
  });
};

const renderProducts = (products) => {
  const container = document.querySelector("#item-list");
  if (!container || !productTemplateCard) return;

  $(container).trigger("destroy.owl.carousel").removeClass("owl-loaded");
  container.innerHTML = "";

  products.forEach((product) => {
    const card = productTemplateCard.cloneNode(true);
    showElement(card, "block");
    card.removeAttribute("id");

    const image = card.querySelector("#item-image");
    if (image) image.src = normalizeImageUrl(product.imageUrl || product.image || product.imagePath);

    const title = card.querySelector("#item-tittle");
    if (title) title.textContent = product.name || product.title || "Untitled Product";

    const energy = card.querySelector("#item-energy-value");
    if (energy) energy.textContent = product.energyValue ? `${product.energyValue} kcal` : "";

    const description = card.querySelector("#item-description");
    if (description) description.textContent = product.description || "";

    const priceEl = card.querySelector(".price-setting");
    if (priceEl) priceEl.remove();

    container.appendChild(card);
  });

  $(container).addClass("owl-carousel owl-theme").owlCarousel({
    loop: products.length > 4,
    margin: 20,
    nav: true,
    dots: true,
    autoplay: true,
    responsive: { 0: { items: 1.2 }, 600: { items: 2.5 }, 1000: { items: 4 } }
  });
};

const createDealShimmer = () => {
  const templateCard = document.querySelector("#deal-card");
  if (!templateCard) return null;

  const card = templateCard.cloneNode(true);
  showElement(card);
  card.classList.add("rendered-deal-card", "shimmer-deal-card");
  card.removeAttribute("id");

  const imageWrap = card.querySelector(".featured-product-image-wrap") || card.querySelector(".featured-product-inner");
  if (imageWrap) imageWrap.innerHTML = '<div class="js-shimmer js-shimmer-block" style="width:100%;height:220px;"></div>';

  const nameEl = card.querySelector("#deal-name");
  if (nameEl) {
    nameEl.textContent = "";
    nameEl.classList.add("js-shimmer", "js-shimmer-block");
    nameEl.style.height = "24px";
  }

  return card;
};

const renderDealShimmers = (count = 3) => {
  const container = document.querySelector(".featured-products-list");
  const templateCard = document.querySelector("#deal-card");
  if (!container || !templateCard) return;

  if (!dealTemplateCard) dealTemplateCard = templateCard.cloneNode(true);

  container.innerHTML = "";
  templateCard.style.setProperty("display", "none", "important");

  for (let i = 0; i < count; i += 1) {
    const shimmer = createDealShimmer();
    if (shimmer) container.appendChild(shimmer);
  }
};

const renderDeals = (deals) => {
  const container = document.querySelector(".featured-products-list");
  if (!container || !dealTemplateCard) return;

  container.innerHTML = "";
  deals.forEach((deal) => {
    const card = dealTemplateCard.cloneNode(true);
    showElement(card);
    card.removeAttribute("id");

    const image = card.querySelector("#deal-image");
    if (image) image.src = normalizeImageUrl(deal.imageUrl || deal.image);

    const nameEl = card.querySelector("#deal-name");
    if (nameEl) nameEl.textContent = deal.title || deal.name || "Untitled Deal";

    const descriptionEl = card.querySelector("#deal-description");
    if (descriptionEl) descriptionEl.textContent = deal.description || "";

    container.appendChild(card);
  });
};

document.addEventListener("DOMContentLoaded", async () => {
  console.log("Juice Valley Script Initialized");

  renderDealShimmers(3);
  renderProductShimmers(4);

  const [products, deals] = await Promise.all([fetchAllProducts(), fetchDeals()]);

  if (deals.length > 0) renderDeals(deals);
  if (products.length > 0) renderProducts(products);
});
