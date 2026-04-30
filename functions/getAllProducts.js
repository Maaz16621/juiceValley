const admin = require("firebase-admin");
const { getDoc } = require("firebase-admin/firestore");

/**
 * Fetches all products from Firestore and includes their category names.
 */
const getAllProducts = async (req, res) => {
  try {
    const productsCollection = admin.firestore().collection("products");
    const snapshot = await productsCollection.get();

    const productsData = await Promise.all(
      snapshot.docs.map(async (productDoc) => {
        const product = {
          id: productDoc.id,
          ...productDoc.data(),
        };

        let categoryName = "N/A";
        if (product.categoryId) {
          try {
            const categoryDocRef = admin.firestore().doc(`categories/${product.categoryId}`);
            const categoryDoc = await getDoc(categoryDocRef);
            if (categoryDoc.exists()) {
              categoryName = categoryDoc.data().name;
            }
          } catch (error) {
            console.error(`Error fetching category for product ${product.id}:`, error);
            // Keep categoryName as 'N/A' or handle as appropriate
          }
        }
        // Ensure the structure matches frontend expectations
        return {
          ...product,
          categoryName: categoryName,
        };
      })
    );

    res.status(200).json(productsData);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Failed to fetch products" });
  }
};

module.exports = { getAllProducts };
