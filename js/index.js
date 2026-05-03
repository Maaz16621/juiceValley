const FUNCTIONS_BASE_URL = "https://us-central1-juicevalley-33052.cloudfunctions.net";
const STORAGE_BASE_URL = "https://firebasestorage.googleapis.com/v0/b/juicevalley-33052.appspot.com/o";
const PRODUCTS_API_URL = `${FUNCTIONS_BASE_URL}/getAllProducts`;

let productTemplateCard = null;

const renderProductShimmers = (count = 4) => {
  const container = document.querySelector("#item-list");
  const templateCard = document.querySelector("#item-card");
  if (!container || !templateCard) return;
  if (!productTemplateCard) productTemplateCard = templateCard.cloneNode(true);

  container.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const card = productTemplateCard.cloneNode(true);
    card.style.display = "block";
    card.removeAttribute("id");
    card.classList.add("shimmer-product-card");
    
    // 1. Clear Image and add Shimmer
    const imgWrap = card.querySelector(".product-image-wrap");
    if (imgWrap) imgWrap.innerHTML = '<div class="js-shimmer" style="width:100%;height:200px;border-radius:12px"></div>';
    
    // 2. Clear Title and add Shimmer
    const title = card.querySelector("#item-tittle");
    if (title) {
      title.textContent = "";
      title.classList.add("js-shimmer");
      title.style.height = "24px";
      title.style.width = "60%";
      title.style.marginBottom = "10px";
    }

    // 3. Clear Energy Value and add Shimmer
    const energy = card.querySelector("#item-energy-value");
    if (energy) {
      energy.textContent = "";
      energy.classList.add("js-shimmer");
      energy.style.height = "16px";
      energy.style.width = "40%";
      energy.style.marginBottom = "10px";
    }

    // 4. Clear Description and add Shimmer
    const desc = card.querySelector("#item-description");
    if (desc) {
      desc.textContent = "";
      desc.classList.add("js-shimmer");
      desc.style.height = "14px";
      desc.style.width = "85%";
      desc.style.marginBottom = "5px";
    }

    // 5. Clear Ingredient and add Shimmer
    const ingredient = card.querySelector("#item-ingredient");
    if (ingredient) {
      ingredient.textContent = "";
      ingredient.classList.add("js-shimmer");
      ingredient.style.height = "14px";
      ingredient.style.width = "70%";
    }

    // 6. Hide Price and Button during shimmer
    const price = card.querySelector(".price-setting");
    if (price) price.style.display = "none";
    
    const cartBtn = card.querySelector(".cart");
    if (cartBtn) cartBtn.style.display = "none";
    
    container.appendChild(card);
  }
};

const renderProducts = (products) => {
  const container = document.querySelector("#item-list");
  if (!container || !productTemplateCard) return;

  // Clear container
  container.innerHTML = "";

  products.forEach((product) => {
    const card = productTemplateCard.cloneNode(true);
    card.style.display = "block";
    card.removeAttribute("id");
    card.classList.add("rendered-product-card");

    const image = card.querySelector("#item-image");
    if (image) {
      const imgUrl = product.imageUrl || product.image || "";
      image.src = imgUrl.startsWith('http') ? imgUrl : `${STORAGE_BASE_URL}/${encodeURIComponent(imgUrl)}?alt=media`;
      image.style.opacity = "0";
      image.onload = () => image.style.opacity = "1";
      image.style.transition = "opacity 0.5s";
    }

    const title = card.querySelector("#item-tittle");
    if (title) title.textContent = product.name || "Untitled Product";

    const energy = card.querySelector("#item-energy-value");
    if (energy) {
      const category = product.categoryName && product.categoryName !== "N/A" ? product.categoryName : "";
      const energyVal = product.energyValue ? `${product.energyValue} kcal` : "";
      energy.textContent = [category, energyVal].filter(Boolean).join(" • ");
      if (!energy.textContent) energy.style.display = "none";
    }

    const description = card.querySelector("#item-description");
    if (description) {
      description.textContent = product.description || "";
      if (!description.textContent) description.style.display = "none";
    }

    const ingredient = card.querySelector("#item-ingredient");
    if (ingredient) {
      if (Array.isArray(product.ingredients)) {
        ingredient.textContent = product.ingredients.join(", ");
      } else {
        ingredient.textContent = product.ingredients || "";
      }
      if (!ingredient.textContent) ingredient.style.display = "none";
    }

    const priceEl = card.querySelector(".price-setting");
    if (priceEl) {
      if (product.price > 0) {
        priceEl.textContent = `$${product.price.toFixed(2)}`;
        priceEl.style.display = "block";
      } else {
        priceEl.style.display = "none";
      }
    }

    container.appendChild(card);
  });

  // Init Owl (Arrows Removed)
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

document.addEventListener("DOMContentLoaded", async () => {
  renderProductShimmers(4);
  try {
    const res = await fetch(PRODUCTS_API_URL);
    const data = await res.json();
    if (data && data.length > 0) renderProducts(data);
  } catch (e) { console.error(e); }
});
