// Product page script for Webflow
// Add product-specific JavaScript here.

console.log("Product page script loaded");

document.addEventListener("DOMContentLoaded", () => {
  // Example: enhance product page behavior
  const addToCartButton = document.querySelector(".add-to-cart-button");
  if (addToCartButton) {
    addToCartButton.addEventListener("click", () => {
      console.log("Add to cart clicked");
      // Add product page logic here
    });
  }
});
