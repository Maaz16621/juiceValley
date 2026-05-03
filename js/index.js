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
    
    // Add gray shimmer boxes
    const img = card.querySelector(".product-image-wrap");
    if (img) img.innerHTML = '<div class="js-shimmer" style="width:100%;height:200px;border-radius:12px"></div>';
    
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
    if (title) title.textContent = product.name || "Product";

    container.appendChild(card);
  });

  // Init Owl
  if (typeof $.fn.owlCarousel === 'function') {
    $(container).addClass("owl-carousel owl-theme").owlCarousel({
      loop: products.length > 4,
      margin: 20,
      nav: true,
      dots: true,
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
