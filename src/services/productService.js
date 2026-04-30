import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase";

/**
 * Fetches products from the backend with optional filters.
 * 
 * @param {Object} filters - Filter parameters.
 * @param {string} [filters.categoryId] - Filter by category ID.
 * @param {string} [filters.searchQuery] - Search by product name.
 * @param {number} [filters.minPrice] - Minimum price.
 * @param {number} [filters.maxPrice] - Maximum price.
 * @param {number} [filters.limit] - Limit results.
 * @returns {Promise<Array>} List of products.
 */
export const getProducts = async (filters = {}) => {
  try {
    const getProductsFn = httpsCallable(functions, "getProducts");
    const result = await getProductsFn(filters);
    return result.data.products || [];
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

/**
 * Fetches a single product by ID from the backend.
 * 
 * @param {string} id - The product ID.
 * @returns {Promise<Object>} The product data with category details.
 */
export const getProductById = async (id) => {
  try {
    const getProductsFn = httpsCallable(functions, "getProducts");
    const result = await getProductsFn({ id });
    return result.data.product || null;
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    throw error;
  }
};
