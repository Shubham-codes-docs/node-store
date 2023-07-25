const Product = require("../models/product");
const Cart = require("../models/cart");
const product = require("../models/product");
exports.getAddProducts = (req, res, next) => {
  res.render("admin/edit-product", {
    path: "/add-Products",
    pageTitle: "Add-Products",
    editing: false,
  });
};

exports.geteditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  const prodId = req.params.productId;
  if (!editMode) {
    return res.redirect("/");
  }
  req.user.getProducts({ where: { id: prodId } }).then((product) => {
    if (!product) {
      res.redirect("/");
    }
    res.render("admin/edit-product", {
      product: product[0],
      pageTitle: "Edit Products",
      editing: editMode,
    });
  });
};

exports.posteditProduct = (req, res, next) => {
  const { prodId, title, imageUrl, price, description } = req.body;
  Product.findByPk(prodId)
    .then((product) => {
      product.title = title;
      product.imageUrl = imageUrl;
      product.price = price;
      product.description = description;
      res.redirect("/admin/products");
      return product.save();
    })
    .then((result) => console.log("Updated"))
    .catch((err) => console.log(err));
};

exports.postAddProducts = (req, res, next) => {
  const { title, imageUrl, price, description } = req.body;
  req.user
    .createProduct({
      title,
      price,
      imageUrl,
      description,
    })
    .then(() => res.redirect("/"))
    .catch((err) => console.log(err));
};
exports.getProducts = (req, res, next) => {
  Product.findAll()
    .then((products) => {
      res.render("shop/product-list", {
        prods: products,
        path: "/Products",
        pageTitle: "Products",
      });
    })
    .catch((err) => console.log(err));
};

exports.getCheckOut = (req, res, next) => {
  res.render("shop/checkout", { path: "/checkout", pageTitle: "CheckOut" });
};

exports.getCart = (req, res, next) => {
  req.user
    .getCart()
    .then((cart) => {
      return cart.getProducts();
    })
    .then((products) => {
      res.render("shop/cart", {
        path: "/cart",
        pageTitle: "Carts",
        products: products,
      });
    })
    .catch((err) => console.log(err));
};

exports.postCart = (req, res, next) => {
  const productId = req.body.productId;
  let fetchedCart;
  let newQuantity = 1;
  req.user
    .getCart()
    .then((cart) => {
      fetchedCart = cart;
      return cart.getProducts({ where: { id: productId } });
    })
    .then((product) => {
      let existingproduct;
      if (product.length > 0) {
        existingproduct = product[0];
      }
      if (existingproduct) {
        const oldQuantity = existingproduct.cartItem.quantity;
        newQuantity = oldQuantity + 1;
        return existingproduct;
      }
      return Product.findByPk(productId);
    })
    .then((product) => {
      return fetchedCart
        .addProduct(product, {
          through: { quantity: newQuantity },
        })
        .then(() => res.redirect("/cart"));
    })
    .catch((err) => console.log(err));
};

exports.deleteCartProduct = (req, res, next) => {
  const productId = req.body.productId;
  req.user
    .getCart()
    .then((cart) => {
      return cart.getProducts({ where: { id: productId } });
    })
    .then((products) => {
      const product = products[0];
      return product.cartItem.destroy();
    })
    .then(() => {
      res.redirect("/cart");
    })
    .catch((err) => console.log(err));
};

exports.orders = (req, res, next) => {
  req.user
    .getOrders({ include: ["products"] })
    .then((orders) => {
      res.render("shop/orders", {
        path: "/orders",
        pageTitle: "Orders",
        orders: orders,
      });
    })
    .catch((err) => console.log(err));
};

exports.postOrder = (req, res, next) => {
  req.user
    .getCart()
    .then((cart) => {
      return cart.getProducts();
    })
    .then((products) => {
      return req.user
        .createOrder()
        .then((order) =>
          order.addProducts(
            products.map((product) => {
              product.OrderItem = {
                quantity: product.cartItem.quantity,
              };
              return product;
            })
          )
        )
        .catch((err) => console.log(err));
    })
    .then(() => {
      res.redirect("/orders");
    })
    .catch((err) => console.log(err));
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findByPk(prodId)
    .then((products) => {
      res.render("shop/product-details", {
        product: products,
        path: "/Products",
        pageTitle: products.title,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.index = (req, res, next) => {
  Product.findAll()
    .then((products) => {
      res.render("shop/index", {
        path: "/index",
        pageTitle: "Home",
        prods: products,
      });
    })
    .catch((err) => console.log(err));
};

exports.getAdminProducts = (req, res, next) => {
  req.user
    .getProducts()
    .then((products) => {
      res.render("admin/products", {
        prods: products,
        path: "admin/products",
        pageTitle: "Admin-Products",
      });
    })
    .catch((err) => console.log(err));
};

exports.deleteAdminProducts = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findByPk(prodId)
    .then((result) => {
      return result.destroy();
    })
    .then((result) => {
      res.redirect("/admin/products");
    })
    .catch((err) => console.log(err));
};
