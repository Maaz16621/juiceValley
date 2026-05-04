const FUNCTIONS_BASE_URL = "https://us-central1-juicevalley-33052.cloudfunctions.net";
const STORAGE_BASE_URL = "https://firebasestorage.googleapis.com/v0/b/juicevalley-33052.firebasestorage.app/o";
const PRODUCTS_API_URL = `${FUNCTIONS_BASE_URL}/getAllProducts`;
const PLACEHOLDER_IMAGE = "https://via.placeholder.com/400x300?text=Juice+Valley";

const normalizeImageUrl = (value) => {
  if (!value) return PLACEHOLDER_IMAGE;
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

let allProducts = [];
let favoriteIds = JSON.parse(localStorage.getItem("favorites") || "[]");
let currentTab = "menu"; // "menu" or "fav"
let productTemplateCard = null;

const cleanTemplate = (template) => {
  if (!template) return;
  const imgs = template.querySelectorAll("img");
  imgs.forEach((img) => {
    img.removeAttribute("srcset");
    img.removeAttribute("sizes");
    img.srcset = "";
  });
};

const renderShimmers = (count = 8) => {
  const container = document.querySelector("._4-column-grid");
  const templateCard = document.querySelector("#item-card");
  if (!container || !templateCard) return;

  if (!productTemplateCard) {
    productTemplateCard = templateCard.cloneNode(true);
    cleanTemplate(productTemplateCard);
  }

  container.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const card = productTemplateCard.cloneNode(true);
    showElement(card, "flex");
    card.removeAttribute("id");
    card.classList.add("shimmer-product-card");
    card.style.pointerEvents = "none";

    const imgWrap = card.querySelector("#item-image");
    if (imgWrap) {
        imgWrap.innerHTML = '<div class="js-shimmer" style="width:100%; height:200px; border-radius:12px;"></div>';
        imgWrap.style.background = "none";
        imgWrap.style.height = "200px";
    }

    const title = card.querySelector("#item-name");
    if (title) {
      title.innerHTML = '<div class="js-shimmer" style="height: 24px; width: 70%;"></div>';
    }

    const energy = card.querySelector("#item-energy-value");
    if (energy) {
        energy.innerHTML = '<div class="js-shimmer" style="height: 14px; width: 40%;"></div>';
    }

    const desc = card.querySelector("#item-description");
    if (desc) {
      desc.innerHTML = '<div class="js-shimmer" style="height: 16px; width: 90%;"></div>';
    }

    container.appendChild(card);
  }
};

const renderProducts = (products) => {
  const container = document.querySelector("._4-column-grid");
  if (!container || !productTemplateCard) return;

  container.innerHTML = "";
  
  if (products.length === 0) {
      container.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 40px;">
        <h3 style="color: #666;">No products found</h3>
      </div>`;
      return;
  }

  products.forEach((product) => {
    const card = productTemplateCard.cloneNode(true);
    showElement(card, "flex"); // Card is a link/block
    card.removeAttribute("id");
    card.classList.add("rendered-product-card");
    card.href = `/product?id=${product.id}`;

    const image = card.querySelector("#item-image img");
    if (image) {
      image.classList.add("img-loading");
      image.onload = () => image.classList.replace("img-loading", "img-loaded");
      image.src = normalizeImageUrl(product.imageUrl || product.image);
    }

    const title = card.querySelector("#item-name");
    if (title) title.textContent = product.name || "Untitled";

    const energy = card.querySelector("#item-energy-value");
    if (energy) {
      energy.textContent = product.energyValue ? `${product.energyValue} kcal` : "";
      if (!energy.textContent) energy.style.display = "none";
    }

    const description = card.querySelector("#item-description");
    if (description) {
      description.textContent = product.description || "";
      if (!description.textContent) description.style.display = "none";
    }

    // Add Favorite Icon/Button logic if needed
    // For now, let's just render the card.

    container.appendChild(card);
  });
};

const filterProducts = () => {
    const searchTerm = document.querySelector("#Search")?.value.toLowerCase() || "";
    let filtered = allProducts;

    if (currentTab === "fav") {
        filtered = filtered.filter(p => favoriteIds.includes(p.id));
    }

    if (searchTerm) {
        filtered = filtered.filter(p => 
            p.name?.toLowerCase().includes(searchTerm) || 
            p.description?.toLowerCase().includes(searchTerm) ||
            p.categoryName?.toLowerCase().includes(searchTerm)
        );
    }

    renderProducts(filtered);
};

document.addEventListener("DOMContentLoaded", async () => {
  const menuSelector = document.querySelector("#menu-selector");
  const favSelector = document.querySelector("#fav-selector");
  const searchInput = document.querySelector("#Search");

  // Initial State
  if (menuSelector) menuSelector.classList.add("active");
  renderShimmers(8);

  // Tab switching
  if (menuSelector) {
      menuSelector.addEventListener("click", (e) => {
          e.preventDefault();
          currentTab = "menu";
          menuSelector.classList.add("active");
          favSelector?.classList.remove("active");
          filterProducts();
      });
  }

  if (favSelector) {
      favSelector.addEventListener("click", () => {
          currentTab = "fav";
          favSelector.classList.add("active");
          menuSelector?.classList.remove("active");
          filterProducts();
      });
  }

  if (searchInput) {
      searchInput.addEventListener("input", filterProducts);
      // Prevent form submission
      searchInput.closest("form")?.addEventListener("submit", (e) => e.preventDefault());
  }

  try {
    const res = await fetch(PRODUCTS_API_URL);
    allProducts = await res.json();
    filterProducts();
  } catch (e) {
    console.error("Failed to load products", e);
    const container = document.querySelector("._4-column-grid");
    if (container) container.innerHTML = "Error loading products.";
  }
});
