const Sequelize = require("sequelize");
const sequelize = new Sequelize("node_shop", "root", "Spipanther@1234", {
  dialect: "mysql",
  host: "localhost",
});

module.exports = sequelize;