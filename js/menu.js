// Menu script for Webflow
// Add menu-specific JavaScript here.

console.log("Menu script loaded");

document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.querySelector(".menu-toggle");
  const menu = document.querySelector(".menu");

  if (menuToggle && menu) {
    menuToggle.addEventListener("click", () => {
      menu.classList.toggle("menu-open");
      console.log("Menu toggled");
    });
  }
});
