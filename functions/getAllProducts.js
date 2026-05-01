const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { getDoc } = require("firebase-admin/firestore");

const setCorsHeaders = (res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");
};

/**
 * Fetches all products from Firestore and includes their category names.
 */
const getAllProducts = functions.https.onRequest(async (req, res) => {
  setCorsHeaders(res);
  if (req.method === "OPTIONS") {
    return res.status(204).send("");
  }

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

        return {
          ...product,
          categoryName,
        };
      })
    );

    res.status(200).json(productsData);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

module.exports = { getAllProducts };
