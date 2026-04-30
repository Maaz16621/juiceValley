const functions = require("firebase-functions");
const admin = require("firebase-admin");

/**
 * Fetches products with optional filters or a single product by ID.
 * Includes category details for the products.
 * 
 * @param {Object} data - The input parameters.
 * @param {string} [data.id] - Optional. If provided, fetches a single product by ID.
 * @param {string} [data.categoryId] - Optional. Filter by category ID.
 * @param {string} [data.searchQuery] - Optional. Search by product name (case-insensitive).
 * @param {number} [data.minPrice] - Optional. Filter by minimum price.
 * @param {number} [data.maxPrice] - Optional. Filter by maximum price.
 * @param {number} [data.limit=50] - Optional. Limit the number of products returned.
 */
const getProducts = functions.https.onCall(async (data, context) => {
  const db = admin.firestore();
  const { id, categoryId, searchQuery, minPrice, maxPrice, limit = 50 } = data;

  try {
    // 1. Handle Single Product Fetch
    if (id) {
      const productDoc = await db.collection("products").doc(id).get();
      if (!productDoc.exists) {
        throw new functions.https.HttpsError("not-found", "Product not found.");
      }

      const productData = { id: productDoc.id, ...productDoc.data() };

      // Fetch category details
      if (productData.categoryId) {
        const categoryDoc = await db.collection("categories").doc(productData.categoryId).get();
        if (categoryDoc.exists) {
          productData.category = { id: categoryDoc.id, ...categoryDoc.data() };
          productData.categoryName = categoryDoc.data().name;
        } else {
          productData.category = null;
          productData.categoryName = "N/A";
        }
      }

      return { success: true, product: productData };
    }

    // 2. Handle Search and Filters
    let query = db.collection("products");

    // Apply filters that Firestore supports directly
    if (categoryId) {
      query = query.where("categoryId", "==", categoryId);
    }

    if (minPrice !== undefined && minPrice !== null) {
      query = query.where("price", ">=", Number(minPrice));
    }

    if (maxPrice !== undefined && maxPrice !== null) {
      query = query.where("price", "<=", Number(maxPrice));
    }

    // Fetch products
    const snapshot = await query.limit(limit).get();
    let products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Apply text search filter manually (Firestore doesn't support partial string match well)
    if (searchQuery) {
      const lowerSearch = searchQuery.toLowerCase();
      products = products.filter(product => 
        product.name && product.name.toLowerCase().includes(lowerSearch)
      );
    }

    // 3. Enrich products with category data
    const categoryIds = [...new Set(products.map(p => p.categoryId).filter(id => id))];
    const categoryMap = {};

    if (categoryIds.length > 0) {
      // Chunk category IDs as 'in' query supports max 10-30 IDs (depending on Firebase version)
      // For simplicity here we assume < 30 unique categories per page
      const categoriesSnapshot = await db.collection("categories")
        .where(admin.firestore.FieldPath.documentId(), "in", categoryIds.slice(0, 30))
        .get();

      categoriesSnapshot.forEach(doc => {
        categoryMap[doc.id] = { id: doc.id, ...doc.data() };
      });
    }

    const enrichedProducts = products.map(product => ({
      ...product,
      category: categoryMap[product.categoryId] || null,
      categoryName: categoryMap[product.categoryId]?.name || "N/A"
    }));

    return { success: true, products: enrichedProducts };

  } catch (error) {
    console.error("Error in getProducts function:", error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError("internal", "An error occurred while fetching products.", error.message);
  }
});

module.exports = { getProducts };
