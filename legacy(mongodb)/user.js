// const getDb = require("../util/database").getDb;
// const mongodb = require("mongodb");

// class User {
//   constructor(name, email, cart, _id) {
//     this.name = name;
//     this.email = email;
//     this.cart = cart ? cart : { items: [] };
//     this._id = _id;
//     // this.cart.items = cart ? cart.items : [];
//   }

//   save() {
//     const db = getDb();
//     return db
//       .collection("users")
//       .insertOne(this)
//       .then(() => console.log("User Added"))
//       .catch((err) => console.log(err));
//   }

//   getCart() {
//     const db = getDb();
//     const productIds = this.cart.items.map((p) => {
//       return p.productId;
//     });
//     return db
//       .collection("products")
//       .find({ _id: { $in: productIds } })
//       .toArray()
//       .then((products) => {
//         return products.map((product) => {
//           return {
//             ...product,
//             quantity: this.cart.items.find((p) => {
//               return p.productId.toString() === product._id.toString();
//             }).quantity,
//           };
//         });
//       });
//   }

//   addToCart(product) {
//     const db = getDb();
//     const existingProductIndex = this.cart.items.findIndex((item) => {
//       return item.productId.toString() === product._id.toString();
//     });
//     let newQuantity = 1;
//     const updatedCartItems = [...this.cart.items];
//     console.log(existingProductIndex);
//     if (existingProductIndex >= 0) {
//       newQuantity = this.cart.items[existingProductIndex].quantity + 1;
//       updatedCartItems[existingProductIndex].quantity = newQuantity;
//     } else {
//       updatedCartItems.push({
//         productId: new mongodb.ObjectID(product._id),
//         quantity: 1,
//       });
//     }
//     const updatedCart = { items: updatedCartItems };

//     return db
//       .collection("users")
//       .updateOne(
//         { _id: new mongodb.ObjectID(this._id) },
//         { $set: { cart: updatedCart } }
//       )
//       .then(() => console.log("Added To Cart"))
//       .catch((err) => console.log(err));
//   }

//   deleteCartItem(productId) {
//     const db = getDb();
//     const updatedCartItems = this.cart.items.filter((prod) => {
//       return prod.productId.toString() !== productId.toString();
//     });
//     return db
//       .collection("users")
//       .updateOne(
//         { _id: new mongodb.ObjectID(this._id) },
//         { $set: { cart: { items: updatedCartItems } } }
//       );
//   }

//   addOrder() {
//     const db = getDb();
//     return this.getCart()
//       .then((products) => {
//         const order = {
//           items: products,
//           user: {
//             _id: new mongodb.ObjectId(this._id),
//             name: this.name,
//           },
//         };
//         return db.collection("orders").insertOne(order);
//       })
//       .then(() => {
//         this.cart = { items: [] };
//         return db
//           .collection("users")
//           .updateOne(
//             { _id: new mongodb.ObjectID(this._id) },
//             { $set: { cart: { items: [] } } }
//           );
//       });
//   }

//   getOrders() {
//     const db = getDb();
//     return db
//       .collection("orders")
//       .find({ "user._id": new mongodb.ObjectID(this._id) })
//       .toArray();
//   }

//   static findById(userId) {
//     const db = getDb();
//     return db
//       .collection("users")
//       .find({ _id: new mongodb.ObjectID(userId) })
//       .next()
//       .then((user) => {
//         return user;
//       })
//       .catch((err) => console.log(err));
//   }
// }

// module.exports = User;
