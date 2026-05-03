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

const showElement = (element, display = "block") => {
  if (!element) return;
  element.style.setProperty("display", display, "important");
  element.style.setProperty("opacity", "1", "important");
  element.style.setProperty("visibility", "visible", "important");
  element.classList.remove("hidden", "w-hidden", "w-condition-invisible");
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

let productTemplateCard = null;
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

const createDealShimmer = () => {
  const templateCard = document.querySelector("#deal-card");
  if (!templateCard) return null;

  const card = templateCard.cloneNode(true);
  showElement(card);
  card.classList.add("rendered-deal-card", "shimmer-deal-card");
  card.removeAttribute("id");

  const imageWrap = card.querySelector(".featured-product-image-wrap") || card.querySelector(".featured-product-inner");
  if (imageWrap) {
    imageWrap.innerHTML = '<div class="js-shimmer js-shimmer-block" style="width:100%;height:220px;"></div>';
  }

  const nameEl = card.querySelector("#deal-name");
  if (nameEl) {
    nameEl.removeAttribute("id");
    nameEl.textContent = "";
    nameEl.classList.add("js-shimmer", "js-shimmer-block");
    nameEl.style.width = "50%";
    nameEl.style.height = "24px";
  }

  const descriptionEl = card.querySelector("#deal-description");
  if (descriptionEl) {
    descriptionEl.removeAttribute("id");
    descriptionEl.textContent = "";
    descriptionEl.classList.add("js-shimmer", "js-shimmer-block");
    descriptionEl.style.width = "70%";
    descriptionEl.style.height = "16px";
  }

  const priceEl = card.querySelector(".price-setting");
  if (priceEl) priceEl.remove();

  return card;
};

const renderDealShimmers = (count = 3) => {
  const container = document.querySelector(".featured-products-list");
  if (!container) return;

  container.innerHTML = "";
  for (let i = 0; i < count; i += 1) {
    const shimmer = createDealShimmer();
    if (shimmer) container.appendChild(shimmer);
  }
};

const createDealCard = (deal) => {
  const templateCard = dealTemplateCard || document.querySelector("#deal-card");
  if (!templateCard) return null;

  const card = templateCard.cloneNode(true);
  showElement(card);
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
  if (priceEl) priceEl.remove();

  return card;
};

const renderDeals = (deals) => {
  const container = document.querySelector(".featured-products-list");
  const templateCard = document.querySelector("#deal-card");

  if (!container || !templateCard) return;

  if (!dealTemplateCard) {
    dealTemplateCard = templateCard.cloneNode(true);
  }
  templateCard.style.setProperty("display", "none", "important");
  container.innerHTML = "";

  deals.forEach((deal) => {
    const card = createDealCard(deal);
    if (card) container.appendChild(card);
  });
};

const createProductShimmer = () => {
  const templateCard = productTemplateCard || document.querySelector("#item-card");
  if (!templateCard) return null;

  const card = templateCard.cloneNode(true);
  showElement(card, "block");
  card.classList.add("rendered-product-card", "shimmer-product-card");
  card.removeAttribute("id");

  const imageWrap = card.querySelector(".product-image-wrap");
  if (imageWrap) {
    imageWrap.innerHTML = '<div class="js-shimmer js-shimmer-block" style="width:100%;height:220px;"></div>';
  }

  const title = card.querySelector("#item-tittle");
  if (title) {
    title.removeAttribute("id");
    title.textContent = "";
    title.classList.add("js-shimmer", "js-shimmer-block");
    title.style.width = "50%";
    title.style.height = "20px";
  }

  const energy = card.querySelector("#item-energy-value");
  if (energy) {
    energy.removeAttribute("id");
    energy.textContent = "";
    energy.classList.add("js-shimmer", "js-shimmer-block");
    energy.style.width = "45%";
    energy.style.height = "16px";
  }

  const desc = card.querySelector("#item-description");
  if (desc) {
    desc.removeAttribute("id");
    desc.textContent = "";
    desc.classList.add("js-shimmer", "js-shimmer-block");
    desc.style.width = "80%";
    desc.style.height = "16px";
  }

  const ingredient = card.querySelector("#item-ingredient");
  if (ingredient) {
    ingredient.removeAttribute("id");
    ingredient.textContent = "";
    ingredient.classList.add("js-shimmer", "js-shimmer-block");
    ingredient.style.width = "70%";
    ingredient.style.height = "16px";
  }

  const priceEl = card.querySelector(".price-setting");
  if (priceEl) priceEl.remove();

  return card;
};

const renderProductShimmers = (count = 4) => {
  const container = document.querySelector("#item-list");
  const templateCard = document.querySelector("#item-card");
  if (!container || !templateCard) return;

  if (!productTemplateCard) {
    productTemplateCard = templateCard.cloneNode(true);
  }

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
    responsive: {
      0: { items: 1.2 },
      600: { items: 2.5 },
      1000: { items: 4 }
    }
  });
};

const createProductCard = (product) => {
  const templateCard = productTemplateCard || document.querySelector("#item-card");
  if (!templateCard) return null;

  const card = templateCard.cloneNode(true);
  showElement(card, "block");
  card.classList.add("rendered-product-card");
  card.removeAttribute("id");

  const image = card.querySelector("#item-image");
  if (image) {
    image.removeAttribute("id");
    image.src = normalizeImageUrl(product.imageUrl || product.image || product.imagePath || product.imagePathName);
    image.alt = product.name || product.title || "Product image";
  }

  const title = card.querySelector("#item-tittle");
  if (title) {
    title.removeAttribute("id");
    title.textContent = product.name || product.title || "Untitled Product";
  }

  const energy = card.querySelector("#item-energy-value");
  if (energy) {
    energy.removeAttribute("id");
    const category = product.categoryName && product.categoryName !== "N/A" ? product.categoryName : "";
    const energyVal = product.energyValue ? `${product.energyValue} kcal` : "";
    energy.textContent = [category, energyVal].filter(Boolean).join(" • ");
    if (!energy.textContent) energy.style.display = "none";
  }

  const description = card.querySelector("#item-description");
  if (description) {
    description.removeAttribute("id");
    description.textContent = product.description || "";
  }

  const ingredient = card.querySelector("#item-ingredient");
  if (ingredient) {
    ingredient.removeAttribute("id");
    if (Array.isArray(product.ingredients)) {
      ingredient.textContent = product.ingredients.join(", ");
    } else {
      ingredient.textContent = product.ingredients || product.ingredientsList || "";
    }
    if (!ingredient.textContent) ingredient.style.display = "none";
  }

  const priceEl = card.querySelector(".price-setting");
  if (priceEl) priceEl.remove();

  return card;
};

const renderProducts = (products) => {
  const container = document.querySelector("#item-list");
  if (!container) return;

  $(container).trigger("destroy.owl.carousel").removeClass("owl-loaded");
  container.innerHTML = "";

  products.forEach((product) => {
    const card = createProductCard(product);
    if (card) container.appendChild(card);
  });

  $(container).addClass("owl-carousel owl-theme").owlCarousel({
    loop: products.length > 4,
    margin: 20,
    nav: true,
    dots: true,
    autoplay: true,
    autoplayTimeout: 5000,
    autoplayHoverPause: true,
    responsive: {
      0: { items: 1.2 },
      600: { items: 2.5 },
      1000: { items: 4 }
    }
  });
};

document.addEventListener("DOMContentLoaded", async () => {
  console.log("Homepage script loaded");

  const searchForm = document.querySelector("form#wf-form-") || document.querySelector("form[name='wf-form-']");
  if (searchForm) {
    searchForm.addEventListener("submit", handleSearchSubmit);
  }

  renderDealShimmers(3);
  renderProductShimmers(4);

  const [products, deals] = await Promise.all([fetchAllProducts(), fetchDeals()]);
  console.log("Homepage data loaded");

  renderDeals(deals);
  renderProducts(products);
});
