const admin = require("firebase-admin");
const { deleteUser } = require("./deleteUser");
const { getAllProducts } = require("./getAllProducts");
const { getProducts } = require("./getProducts");

admin.initializeApp();

exports.deleteUser = deleteUser;
exports.getAllProducts = getAllProducts;
exports.getProducts = getProducts;