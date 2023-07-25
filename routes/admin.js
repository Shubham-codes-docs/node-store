const express = require("express");
const adminController = require("../controllers/admin");
const Auth = require("../middleware/auth");

const router = express.Router();

router.use("/add-Products", Auth, adminController.getAddProducts);
router.post("/product", Auth, adminController.postAddProducts);
router.get("/products", Auth, adminController.getAdminProducts);
router.get("/edit-products/:productId", Auth, adminController.geteditProduct);
router.post("/edit-product", Auth, adminController.posteditProduct);
router.delete("/product/:productId", Auth, adminController.deleteAdminProducts);

module.exports = { router };
