const Product = require("../models/product");
const fileHelper = require("../util/file");

exports.getAdminProducts = (req, res, next) => {
  Product.find({ userId: req.user._id })
    .then((products) => {
      res.render("admin/products", {
        prods: products,
        path: "admin/products",
        pageTitle: "Admin-Products",
        isLoggedIn: req.session.isLoggedIn,
      });
    })
    .catch((err) => console.log(err));
};

exports.getAddProducts = (req, res, next) => {
  res.render("admin/edit-product", {
    path: "/add-Products",
    pageTitle: "Add-Products",
    editing: false,
    isLoggedIn: req.session.isLoggedIn,
  });
};

exports.postAddProducts = (req, res, next) => {
  const { title, price, description } = req.body;
  const image = req.file;
  console.log(image);
  if (!image) {
    return res.status(422).render("admin/edit-product", {
      path: "/add-Products",
      pageTitle: "Add-Products",
      editing: false,
      isLoggedIn: req.session.isLoggedIn,
    });
  }
  const imageUrl = image.path;
  const product = new Product({
    title: title,
    imageUrl: imageUrl,
    price: price,
    description: description,
    userId: req.user,
  });
  product
    .save()
    .then(() => res.redirect("/"))
    .catch((err) => console.log(err));
};

exports.geteditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  const prodId = req.params.productId;
  if (!editMode) {
    return res.redirect("/");
  }
  Product.findById(prodId).then((product) => {
    if (!product) {
      res.redirect("/");
    }
    res.render("admin/edit-product", {
      product: product,
      pageTitle: "Edit Products",
      editing: editMode,
      isLoggedIn: req.session.isLoggedIn,
    });
  });
};

exports.posteditProduct = (req, res, next) => {
  const { prodId, title, price, description } = req.body;
  const image = req.file;

  Product.findById(prodId)
    .then((product) => {
      if (product.userId.toString() !== req.user._id.toString()) {
        return res.redirect("/");
      }
      product.title = title;
      if (image) {
        fileHelper.fileDelete(product.imageUrl);
        product.imageUrl = image.path;
      }
      product.price = price;
      product.description = description;
      return product.save().then(() => {
        console.log("Updated");
        res.redirect("/admin/products");
      });
    })

    .catch((err) => console.log(err));
};

exports.deleteAdminProducts = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById({ _id: prodId })
    .then((product) => {
      fileHelper.fileDelete(product.imageUrl);
      return Product.deleteOne({ _id: prodId, userId: req.user._id });
    })
    .then(() => {
      res.status(200).json({ msg: "Success!!" });
    })
    .catch((err) => console.log(err));
};
