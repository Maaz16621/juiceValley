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
let currentCategory = "All";
let productTemplateCard = null;

const renderCategories = (products) => {
    const categoryContainer = document.querySelector(".menu-categories-wrap");
    if (!categoryContainer) return;

    // Extract unique categories from products, excluding "N/A" and falsy values
    const uniqueCategories = [...new Set(products.map(p => p.categoryName).filter(cat => cat && cat !== "N/A"))];
    const categories = ["All", ...uniqueCategories.sort()];
    
    categoryContainer.innerHTML = "";
    categories.forEach(cat => {
        const btn = document.createElement("a");
        btn.href = "#";
        btn.className = `menu-fillter w-inline-block ${cat === currentCategory ? "active" : ""}`;
        btn.innerHTML = `<div class="menu-category-text">${cat}</div>`;
        btn.onclick = (e) => {
            e.preventDefault();
            currentCategory = cat;
            document.querySelectorAll(".menu-fillter").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            filterProducts();
        };
        categoryContainer.appendChild(btn);
    });
};

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

    const imgWrap = card.querySelector(".menu-list-image-wrap");
    if (imgWrap) {
        imgWrap.innerHTML = '<div class="js-shimmer" style="width:100%; height:100%; border-radius:12px;"></div>';
    }

    const title = card.querySelector("#item-name");
    if (title) {
        title.textContent = "";
        title.classList.add("js-shimmer");
        title.style.height = "24px";
        title.style.width = "70%";
    }

    const energy = card.querySelector("#item-energy-value");
    if (energy) {
        energy.textContent = "";
        energy.classList.add("js-shimmer");
        energy.style.height = "14px";
        energy.style.width = "40%";
        energy.style.marginTop = "10px";
    }

    const desc = card.querySelector("#item-description");
    if (desc) {
      desc.textContent = "";
      desc.classList.add("js-shimmer");
      desc.style.height = "16px";
      desc.style.width = "90%";
      desc.style.marginTop = "10px";
    }

    container.appendChild(card);
  }
};

const renderProducts = (products) => {
  const container = document.querySelector("._4-column-grid");
  if (!container || !productTemplateCard) return;

  container.innerHTML = "";
  
  if (products.length === 0) {
      const noFound = document.createElement("div");
      noFound.style.cssText = "grid-column: 1 / -1; text-align: center; padding: 40px;";
      noFound.innerHTML = '<h3 style="color: #666;">No products found</h3>';
      container.appendChild(noFound);
  }

  products.forEach((product) => {
    const card = productTemplateCard.cloneNode(true);
    showElement(card, "flex");
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

    container.appendChild(card);
  });
};

const filterProducts = () => {
    const searchTerm = document.querySelector("#Search")?.value.toLowerCase().trim() || "";
    let filtered = allProducts;

    if (currentTab === "fav") {
        filtered = filtered.filter(p => favoriteIds.includes(p.id));
    }

    if (currentCategory !== "All") {
        filtered = filtered.filter(p => p.categoryName && p.categoryName.trim() === currentCategory.trim());
    }

    if (searchTerm) {
        filtered = filtered.filter(p => 
            (p.name && p.name.toLowerCase().includes(searchTerm)) || 
            (p.description && p.description.toLowerCase().includes(searchTerm)) ||
            (p.categoryName && p.categoryName.toLowerCase().includes(searchTerm))
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
    renderCategories(allProducts);
    filterProducts();
  } catch (e) {
    console.error("Failed to load products", e);
    const container = document.querySelector("._4-column-grid");
    if (container) container.innerHTML = "Error loading products.";
  }
});
