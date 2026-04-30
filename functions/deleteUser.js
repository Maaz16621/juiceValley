const functions = require("firebase-functions");
const admin = require("firebase-admin");

/**
 * Deletes a user from Firebase Authentication and their corresponding document in Firestore.
 * @param {object} data - The data passed to the function.
 * @param {string} data.uid - The UID of the user to delete.
 * @param {string} data.collection - The Firestore collection name ('staff' or 'users').
 * @param {object} context - The context of the function call.
 * @param {object} context.auth - The authentication information of the calling user.
 */
const deleteUser = functions.https.onCall(async (data, context) => {
  // Check if the user calling the function is authenticated.
  // For production, you should also check if the user is an admin.
  // Example: if (!context.auth || !context.auth.token.admin) {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called by an authenticated user."
    );
  }

  const { uid, collection } = data;

  if (!uid || !collection) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "The function must be called with a 'uid' and 'collection' argument."
    );
  }

  try {
    // Delete the user from Firebase Authentication
    await admin.auth().deleteUser(uid);
    console.log(`Successfully deleted user ${uid} from Authentication.`);

    // Find and delete the user's document in the specified Firestore collection
    const querySnapshot = await admin.firestore().collection(collection).where("uid", "==", uid).get();

    if (querySnapshot.empty) {
      console.warn(`No document found for user ${uid} in collection ${collection}.`);
      // Still return success as the auth user was deleted.
      return { success: true, message: `Auth user ${uid} deleted. No Firestore document found.` };
    }

    const deletePromises = [];
    querySnapshot.forEach((doc) => {
      deletePromises.push(doc.ref.delete());
    });

    await Promise.all(deletePromises);
    console.log(`Successfully deleted document(s) for user ${uid} from collection ${collection}.`);

    return { success: true, message: `Successfully deleted user ${uid}.` };
  } catch (error) {
    console.error("Error deleting user:", error);
    throw new functions.https.HttpsError("internal", "Unable to delete user.", error);
  }
});

module.exports = {
    deleteUser,
};
