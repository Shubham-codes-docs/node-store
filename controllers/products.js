const fs = require("fs");
const path = require("path");
const pdfDocument = require("pdfkit");
const stripe = require("stripe")(
  "sk_test_51J4q22SJmqn6llqezJlrZOG50QBAJGWJy46pt9N33K0IH3FgpN3p2rIm3gK4rVdSQRKPdOLhqO0n1ow6WN5hpVUa00umAHR3Gt"
);

const Product = require("../models/product");
const Order = require("../models/order");
const product = require("../models/product");

const ITEMS_PER_PAGE = 2;
let totalItems;

exports.index = (req, res, next) => {
  const page = +req.query.page || 1;
  Product.countDocuments()
    .then((count) => {
      totalItems = count;
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then((products) => {
      res.render("shop/index", {
        path: "/index",
        pageTitle: "Home",
        prods: products,
        isLoggedIn: req.session.isLoggedIn,
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
      });
    })
    .catch((err) => console.log(err));
};

exports.getProducts = (req, res, next) => {
  Product.find()
    .then((products) => {
      res.render("shop/product-list", {
        prods: products,
        path: "/Products",
        pageTitle: "Products",
        isLoggedIn: req.session.isLoggedIn,
      });
    })
    .catch((err) => console.log(err));
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then((products) => {
      res.render("shop/product-details", {
        product: products,
        path: "/Products",
        pageTitle: products.title,
        isLoggedIn: req.session.isLoggedIn,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getCart = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .execPopulate()
    .then((user) => {
      const cartproducts = user.cart.items;
      res.render("shop/cart", {
        path: "/cart",
        pageTitle: "Carts",
        products: cartproducts,
        isLoggedIn: req.session.isLoggedIn,
      });
    })
    .catch((err) => console.log(err));
};

exports.postCart = (req, res, next) => {
  const productId = req.body.productId;
  Product.findById(productId)
    .then((productItem) => {
      return req.user.addToCart(productItem);
    })
    .then(() => {
      res.redirect("/cart");
    })
    .catch((err) => console.log(err));
};

exports.deleteCartProduct = (req, res, next) => {
  const productId = req.body.productId;
  req.user
    .removeFormCart(productId)
    .then(() => {
      res.redirect("/cart");
    })
    .catch((err) => console.log(err));
};

exports.orders = (req, res, next) => {
  Order.find({ "user.userId": req.user._id })
    .then((orders) => {
      res.render("shop/orders", {
        path: "/orders",
        pageTitle: "Orders",
        orders: orders,
        isLoggedIn: req.session.isLoggedIn,
      });
    })
    .catch((err) => console.log(err));
};

exports.postOrder = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .execPopulate()
    .then((user) => {
      const products = user.cart.items.map((item) => {
        return {
          quantity: item.quantity,
          product: { ...item.productId._doc },
        };
      });
      console.log(products);
      const orders = new Order({
        user: {
          name: req.user.name,
          userId: req.user,
        },
        products: products,
      });
      console.log(orders);
      return orders.save();
    })
    .then(() => {
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect("/orders");
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getCheckOut = (req, res, next) => {
  let cartproducts;
  let total = 0;
  req.user
    .populate("cart.items.productId")
    .execPopulate()
    .then((user) => {
      cartproducts = user.cart.items;
      total = 0;
      cartproducts.forEach((prod) => {
        total += prod.quantity * prod.productId.price;
      });
      return stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: cartproducts.map((product) => {
          return {
            name: product.productId.title,
            description: product.productId.description,
            amount: product.productId.price ,
            currency: "INR",
            quantity: product.quantity,
          };
        }),
        success_url:
          req.protocol + "://" + req.get("host") + "/checkout/success",
        cancel_url: req.protocol + "://" + req.get("host") + "/checkout/cancel",
      });
    })
    .then((session) => {
      console.log(session.id);
      res.render("shop/checkout", {
        path: "/checkout",
        pageTitle: "CheckOut",
        products: cartproducts,
        total: total,
        isLoggedIn: req.session.isLoggedIn,
        sessionId: session.id,
      });
    })
    .catch((err) => console.log(err));
};

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;
  Order.findById({ _id: orderId })
    .then((order) => {
      if (order.user.userId.toString() !== req.user._id.toString()) {
        return next();
      }
      const invoiceName = `invoice-${orderId}.pdf`;
      const invoicePath = path.join("data", "invoices", invoiceName);
      const pdfDoc = new pdfDocument();
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `inline;fileName=${invoiceName}`);
      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.pipe(res);
      pdfDoc.fontSize(24).text("Invoice Details", { underline: true });
      pdfDoc.text("------------------");
      let totalPrice = 0;
      order.products.forEach((prod) => {
        totalPrice += prod.product.price * prod.quantity;
        pdfDoc
          .fontSize(14)
          .text(`${prod.product.title}-${prod.quantity}*${prod.product.price}`);
      });
      pdfDoc.text("-----------");
      pdfDoc.fontSize(20).text(`Total Price:${totalPrice}`);
      pdfDoc.end();
    })
    .catch((err) => console.log(err));
};
