const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;

let db;

const mongoConnect = (cb) => {
  MongoClient.connect(
    "mongodb+srv://shubhu:Uzumakisasuke@1234@nodeshop.dzrl9.mongodb.net/shop?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
    .then((client) => {
      console.log("Connected");
      db = client.db();
      cb();
    })
    .catch((err) => console.log(err));
};

const getDb = () => {
  if (db) {
    return db;
  } else {
    throw "Connection Error";
  }
};

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
