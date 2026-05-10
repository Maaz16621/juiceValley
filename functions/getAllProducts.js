const functions = require("firebase-functions");
const admin = require("firebase-admin");

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

  const { id } = req.query;

  try {
    const db = admin.firestore();
    
    if (id) {
        const productDoc = await db.collection("products").doc(id).get();
        if (!productDoc.exists) {
            return res.status(404).json({ message: "Product not found" });
        }
        
        const product = { id: productDoc.id, ...productDoc.data() };
        let categoryName = "N/A";
        if (product.categoryId) {
            const categoryDoc = await db.collection("categories").doc(product.categoryId).get();
            if (categoryDoc.exists) {
                categoryName = categoryDoc.data().name;
            }
        }
        return res.status(200).json({ ...product, categoryName });
    }

    const productsCollection = db.collection("products");
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
            const categoryDoc = await admin.firestore().collection("categories").doc(product.categoryId).get();
            if (categoryDoc.exists) {
              categoryName = categoryDoc.data().name;
            }
          } catch (error) {
            console.error(`Error fetching category for product ${product.id}:`, error);
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
