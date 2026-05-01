const functions = require("firebase-functions");
const admin = require("firebase-admin");

const setCorsHeaders = (res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");
};

const getDeals = functions.https.onRequest(async (req, res) => {
  setCorsHeaders(res);
  if (req.method === "OPTIONS") {
    return res.status(204).send("");
  }

  try {
    const dealsCollection = admin.firestore().collection("deals");
    const snapshot = await dealsCollection.get();

    const dealsData = snapshot.docs.map((dealDoc) => ({
      id: dealDoc.id,
      ...dealDoc.data(),
    }));

    res.status(200).json(dealsData);
  } catch (error) {
    console.error("Error fetching deals:", error);
    res.status(500).json({ message: "Failed to fetch deals" });
  }
});

module.exports = { getDeals };