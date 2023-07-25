const express = require("express");

const productController = require("../controllers/products");
const Auth = require("../middleware/auth");

const router = express.Router();

router.get("/", productController.index);
router.get("/Products", productController.getProducts);
router.get("/products/:productId", productController.getProduct);
router.get("/cart", Auth, productController.getCart);
router.post("/cart", Auth, productController.postCart);
router.post("/cart-delete-product", Auth, productController.deleteCartProduct);
router.get("/orders", Auth, productController.orders);
router.get("/checkout", Auth, productController.getCheckOut);
router.get("/checkout/success", Auth, productController.postOrder);
router.get("/checkout/cancel", Auth, productController.getCheckOut);
router.get("/orders/:orderId", Auth, productController.getInvoice);
router.post("/addOrder", Auth, productController.postOrder);

module.exports = { router };
