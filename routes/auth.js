const express = require("express");
const { check } = require("express-validator/check");

const authController = require("../controllers/auth");
const User = require("../models/user");

const router = express.Router();

router.get("/login", authController.getLogin);
router.post("/login", authController.postLogin);
router.get("/signup", authController.getSignup);
router.post(
  "/signup",
  [
    check("email")
      .isEmail()
      .withMessage("Please Enter A Valid Email")
      .custom((value) => {
        return User.findOne({ email: value }).then((user) => {
          if (user) {
            return Promise.reject("Email Already Exists");
          }
        });
      })
      .normalizeEmail(),
    check(
      "password",
      "Password Should be atleast 4 characters long and only contain alphanumeric values"
    )
      .isLength({ min: 4 })
      .isAlphanumeric()
      .trim(),
    check("cpassword")
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("The two passwords do not match");
        }
        return true;
      })
      .trim(),
  ],
  authController.postSignup
);
router.post("/logout", authController.postLogOut);
router.get("/reset", authController.getReset);
router.post("/reset", authController.postReset);
router.get("/reset/:token", authController.getResetPassword);
router.post("/newPassword", authController.newPassword);

module.exports = { router };
