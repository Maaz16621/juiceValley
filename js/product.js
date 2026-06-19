const FUNCTIONS_BASE_URL = "https://us-central1-juicevalley-33052.cloudfunctions.net";
const STORAGE_BASE_URL = "https://firebasestorage.googleapis.com/v0/b/juicevalley-33052.firebasestorage.app/o";
const PRODUCTS_API_URL = `${FUNCTIONS_BASE_URL}/getAllProducts`;
const PLACEHOLDER_IMAGE = "https://via.placeholder.com/400x300?text=Juice+Valley";

const normalizeImageUrl = (value) => {
  if (!value) return PLACEHOLDER_IMAGE;
  if (/^https?:\/\//i.test(value)) return value;
  return `${STORAGE_BASE_URL}/${encodeURIComponent(value)}?alt=media`;
};

document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get("id");
    
    if (!productId) {
        console.warn("No product ID found in URL, redirecting to home...");
        window.location.href = "/";
        return;
    }

    renderShimmers();

    try {
        const response = await fetch(`${PRODUCTS_API_URL}?id=${productId}`);
        if (!response.ok) {
            console.error("Product fetch failed, redirecting to home...");
            window.location.href = "/";
            return;
        }
        
        const product = await response.json();
        renderProductDetails(product);
    } catch (error) {
        console.error("Failed to load product details", error);
        window.location.href = "/";
    }
});

function renderShimmers() {
    const name = document.querySelector("#item-name");
    if (name) {
        name.textContent = "";
        name.classList.add("js-shimmer");
        name.style.height = "40px";
        name.style.width = "80%";
    }

    const description = document.querySelector("#item-description");
    if (description) {
        description.textContent = "";
        description.classList.add("js-shimmer");
        description.style.height = "100px";
        description.style.width = "100%";
    }

    // Improved Image Shimmer: Create a placeholder div
    const image = document.querySelector("#item-image");
    if (image && !document.querySelector("#image-skeleton")) {
        const skeleton = document.createElement("div");
        skeleton.id = "image-skeleton";
        skeleton.className = "js-shimmer";
        skeleton.style.width = "100%";
        skeleton.style.height = "400px"; // Match your hero image height
        skeleton.style.borderRadius = "8px";
        image.style.display = "none";
        image.parentNode.insertBefore(skeleton, image);
    }

    const sizePicker = document.querySelector("#size-picker");
    if (sizePicker) sizePicker.style.visibility = "hidden";
}

function renderProductDetails(product) {
    const image = document.querySelector("#item-image");
    const skeleton = document.querySelector("#image-skeleton");

    if (image) {
        image.removeAttribute("srcset");
        image.removeAttribute("sizes");
        image.srcset = "";
        
        // Load the image in the background
        const tempImg = new Image();
        tempImg.onload = () => {
            image.src = tempImg.src;
            image.style.display = "block";
            if (skeleton) skeleton.remove();
        };
        tempImg.src = normalizeImageUrl(product.imageUrl || product.image);
    }

    // Populate Name
    const name = document.querySelector("#item-name");
    if (name) {
        name.classList.remove("js-shimmer");
        name.style.height = "auto";
        name.style.width = "auto";
        name.textContent = product.name || "Untitled Product";
    }

    // Populate Description
    const description = document.querySelector("#item-description");
    if (description) {
        description.classList.remove("js-shimmer");
        description.style.height = "auto";
        description.textContent = product.description || "";
    }

    // Show Size Picker
    const sizePicker = document.querySelector("#size-picker");
    if (sizePicker) sizePicker.style.display = "none";

    // Populate Ingredients
    const ingredientsList = document.querySelector("#item-ingredients");
    if (ingredientsList) {
        ingredientsList.innerHTML = "";
        const ingredients = Array.isArray(product.ingredients) ? product.ingredients : (product.ingredients ? product.ingredients.split(",") : []);
        ingredients.forEach(ing => {
            if (ing.trim()) {
                const li = document.createElement("li");
                li.textContent = ing.trim();
                ingredientsList.appendChild(li);
            }
        });
    }

    // Handle Sizes
    setupSizePicker(product);
}

function setupSizePicker(product) {
    const sizePicker = document.querySelector("#size-picker");
    if (!sizePicker) return;

    const sizes = product.sizePrices || {
        S: { enabled: false, price: "" },
        M: { enabled: true, price: "" },
        L: { enabled: false, price: "" }
    };

    const sizeElements = {
        S: document.querySelector("#is-small"),
        M: document.querySelector("#is-medium"),
        L: document.querySelector("#is-large")
    };

    let firstAvailable = null;

    Object.keys(sizeElements).forEach(size => {
        const el = sizeElements[size];
        if (el) {
            if (sizes[size] && sizes[size].enabled) {
                el.style.display = "flex";
                el.onclick = (e) => {
                    e.preventDefault();
                    setActiveSize(size, sizes[size].price || product.price);
                };
                if (!firstAvailable) firstAvailable = { size, price: sizes[size].price || product.price };
            } else {
                el.style.display = "none";
            }
        }
    });

    if (firstAvailable) {
        setActiveSize(firstAvailable.size, firstAvailable.price);
    } else {
        // Fallback to base price if no sizes enabled
        updatePriceDisplay(product.price);
    }

    function setActiveSize(size, price) {
        Object.keys(sizeElements).forEach(s => {
            const el = sizeElements[s];
            if (el) {
                if (s === size) {
                    el.classList.add("is-active");
                } else {
                    el.classList.remove("is-active");
                }
            }
        });
        updatePriceDisplay(price);
    }
}

function updatePriceDisplay(price) {
    const priceDisplay = document.querySelector("#item-price");
    if (priceDisplay) {
        priceDisplay.textContent = price ? `$${price}` : "";
    }
}
