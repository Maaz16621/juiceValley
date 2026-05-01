// Homepage script for Webflow
// Add page-specific JavaScript here.

const FUNCTIONS_BASE_URL = "https://us-central1-juicevalley-33052.cloudfunctions.net";
const PRODUCTS_API_URL = `${FUNCTIONS_BASE_URL}/getAllProducts`;
const DEALS_API_URL = `${FUNCTIONS_BASE_URL}/getDeals`;

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

document.addEventListener("DOMContentLoaded", async () => {
  console.log("Homepage script loaded");

  const heroTitle = document.querySelector(".hero-title");
  if (heroTitle) {
    heroTitle.textContent = "Welcome to Juice Valley";
  }

  const [products, deals] = await Promise.all([fetchAllProducts(), fetchDeals()]);
  console.log("Homepage data:", { products, deals });

  // TODO: render products and deals into your UI here
});
