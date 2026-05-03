const FUNCTIONS_BASE_URL = "https://us-central1-juicevalley-33052.cloudfunctions.net";
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

let productTemplateCard = null;
let dealTemplateCard = null;

const renderProductShimmers = (count = 4) => {
  const container = document.querySelector("#item-list");
  const templateCard = document.querySelector("#item-card");
  if (!container || !templateCard) return;
  if (!productTemplateCard) productTemplateCard = templateCard.cloneNode(true);

  container.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const card = productTemplateCard.cloneNode(true);
    showElement(card, "block");
    card.removeAttribute("id");
    card.classList.add("shimmer-product-card");
    
    const imgWrap = card.querySelector(".product-image-wrap");
    if (imgWrap) imgWrap.innerHTML = '<div class="js-shimmer" style="width:100%;height:220px;"></div>';
    
    const title = card.querySelector("#item-tittle");
    if (title) {
      title.textContent = "";
      title.classList.add("js-shimmer");
      title.style.height = "24px";
      title.style.width = "60%";
      title.style.marginBottom = "10px";
    }

    const desc = card.querySelector("#item-description");
    if (desc) {
      desc.textContent = "";
      desc.classList.add("js-shimmer");
      desc.style.height = "16px";
      desc.style.width = "80%";
      desc.style.marginTop = "10px";
    }
    
    const ingredient = card.querySelector("#item-ingredient");
    if (ingredient) ingredient.style.display = "none";
    
    const energy = card.querySelector("#item-energy-value");
    if (energy) energy.style.display = "none";

    container.appendChild(card);
  }
};

const renderProducts = (products) => {
  const container = document.querySelector("#item-list");
  if (!container || !productTemplateCard) return;

  container.innerHTML = "";
  products.forEach((product) => {
    const card = productTemplateCard.cloneNode(true);
    showElement(card, "block");
    card.removeAttribute("id");
    card.classList.add("rendered-product-card");

    const image = card.querySelector("#item-image");
    if (image) {
      image.src = normalizeImageUrl(product.imageUrl || product.image);
      image.style.opacity = "0";
      image.onload = () => image.style.opacity = "1";
      image.style.transition = "opacity 0.5s";
    }

    const title = card.querySelector("#item-tittle");
    if (title) title.textContent = product.name || "Untitled Product";

    const energy = card.querySelector("#item-energy-value");
    if (energy) {
      const energyVal = product.energyValue ? `${product.energyValue} kcal` : "";
      energy.textContent = energyVal;
      if (!energyVal) energy.style.display = "none";
    }

    const description = card.querySelector("#item-description");
    if (description) {
      description.textContent = product.description || "";
      if (!description.textContent) description.style.display = "none";
    }

    const ingredientContainer = card.querySelector("#item-ingredient");
    if (ingredientContainer) {
      ingredientContainer.innerHTML = "";
      const ingredients = Array.isArray(product.ingredients) ? product.ingredients : (product.ingredients ? product.ingredients.split(",") : []);
      ingredients.forEach(ing => {
        if (ing.trim()) {
          const span = document.createElement("span");
          span.className = "ingredient-tag";
          span.textContent = ing.trim();
          ingredientContainer.appendChild(span);
        }
      });
    }

    container.appendChild(card);
  });

  if (typeof $.fn.owlCarousel === 'function') {
    $(container).addClass("owl-carousel owl-theme").owlCarousel({
      loop: products.length > 4,
      margin: 20,
      nav: false,
      dots: true,
      autoplay: true,
      responsive: { 0: { items: 1.2 }, 600: { items: 2.5 }, 1000: { items: 4 } }
    });
  }
};

const renderDealShimmers = (count = 2) => {
  const container = document.querySelector(".featured-products-list");
  const templateCard = document.querySelector("#deal-card");
  if (!container || !templateCard) return;
  if (!dealTemplateCard) dealTemplateCard = templateCard.cloneNode(true);

  container.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const card = dealTemplateCard.cloneNode(true);
    showElement(card, "block");
    card.removeAttribute("id");
    card.classList.add("shimmer-deal-card");

    const imgWrap = card.querySelector(".featured-product-image-wrap") || card.querySelector(".featured-product-inner");
    if (imgWrap) {
        imgWrap.innerHTML = '<div class="js-shimmer" style="width:100%;height:300px;display:block !important;"></div>';
    }

    const name = card.querySelector("#deal-name");
    if (name) {
      name.textContent = "";
      name.classList.add("js-shimmer");
      name.style.height = "30px";
      name.style.width = "70%";
      name.style.display = "block !important";
    }

    const desc = card.querySelector("#deal-description");
    if (desc) {
      desc.textContent = "";
      desc.classList.add("js-shimmer");
      desc.style.height = "20px";
      desc.style.width = "50%";
      desc.style.marginTop = "10px";
      desc.style.display = "block !important";
    }

    container.appendChild(card);
  }
};

const renderDeals = (deals) => {
  const container = document.querySelector(".featured-products-list");
  if (!container || !dealTemplateCard) return;

  container.innerHTML = "";
  deals.forEach((deal) => {
    const card = dealTemplateCard.cloneNode(true);
    showElement(card, "block");
    card.removeAttribute("id");
    card.classList.add("rendered-deal-card");

    const image = card.querySelector("#deal-image");
    if (image) {
      image.src = normalizeImageUrl(deal.imageUrl || deal.image);
    }

    const name = card.querySelector("#deal-name");
    if (name) name.textContent = deal.title || deal.name || "Special Deal";

    const description = card.querySelector("#deal-description");
    if (description) description.textContent = deal.description || "";

    container.appendChild(card);
  });
};

document.addEventListener("DOMContentLoaded", async () => {
  renderProductShimmers(4);
  renderDealShimmers(2);

  try {
    const [productsRes, dealsRes] = await Promise.all([
      fetch(PRODUCTS_API_URL),
      fetch(DEALS_API_URL)
    ]);
    const products = await productsRes.json();
    const deals = await dealsRes.json();

    if (products && products.length > 0) renderProducts(products);
    if (deals && deals.length > 0) renderDeals(deals);
  } catch (e) {
    console.error("Data load failed", e);
  }
});
