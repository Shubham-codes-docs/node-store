const fs = require("fs");

exports.fileDelete = (path) => {
  fs.unlink(path, (err) => {
    console.log(err);
  });
};
