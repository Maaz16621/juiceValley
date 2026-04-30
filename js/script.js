// ===== CONFIG =====
const API_BASE = "https://us-central1-YOUR_PROJECT.cloudfunctions.net";

// ===== DOM CACHE =====
const productContainer = document.querySelector(".products");

// ===== LOAD PRODUCTS =====
async function loadProducts() {
  try {
    productContainer.innerHTML = "Loading...";

    const res = await fetch(`${API_BASE}/getProducts`);
    const data = await res.json();

    renderProducts(data);
  } catch (err) {
    console.error(err);
    productContainer.innerHTML = "Failed to load products";
  }
}

// ===== RENDER =====
function renderProducts(products) {
  productContainer.innerHTML = products.map(p => `
    <div class="product-card">
      <h3>${p.name}</h3>
      <p>${p.price}</p>
    </div>
  `).join("");
}

// ===== FILTER =====
async function filterProducts(category) {
  const res = await fetch(`${API_BASE}/filterProducts?category=${category}`);
  const data = await res.json();

  renderProducts(data);
}

// ===== INIT =====
document.addEventListener("DOMContentLoaded", loadProducts);