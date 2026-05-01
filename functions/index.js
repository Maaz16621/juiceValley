const admin = require("firebase-admin");
const { deleteUser } = require("./deleteUser");
const { getAllProducts } = require("./getAllProducts");
const { getProducts } = require("./getProducts");
const { getDeals } = require("./getDeals");

admin.initializeApp();

exports.deleteUser = deleteUser;
exports.getAllProducts = getAllProducts;
exports.getProducts = getProducts;
exports.getDeals = getDeals;