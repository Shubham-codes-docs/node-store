const User = require("../models/user");
const bcrypt = require("bcrypt");
const nodeMailer = require("nodemailer");
const crypto = require("crypto");
const { validationResult } = require("express-validator/check");

const transport = nodeMailer.createTransport({
  host: "smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "8ecdb859e81654",
    pass: "d46f049cf60f7d",
  },
});

exports.getSignup = (req, res, next) => {
  let errorMsg = req.flash("errorMessage");
  if (errorMsg.length > 0) {
    errorMsg = errorMsg[0];
  } else {
    errorMsg = null;
  }
  res.render("auth/signup", {
    title: "Signup",
    path: "/signup",
    errorMessage: errorMsg,
    input: {
      name: "",
      email: "",
      password: "",
      cpassword: "",
    },
  });
};

exports.postSignup = (req, res, next) => {
  const { name, email, password, cpassword } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/signup", {
      title: "Signup",
      path: "/signup",
      errorMessage: errors.array()[0].msg,
      input: {
        name,
        email,
        password,
        cpassword,
      },
    });
  }
  bcrypt
    .hash(password, 12)
    .then((hashed) => {
      const newUser = new User({
        name: name,
        email: email,
        password: hashed,
      });
      return newUser.save();
    })
    .then(() => {
      res.redirect("/login");
      return transport.sendMail({
        from: "nodemaster@node.com",
        to: email,
        subject: "Hello from us",
        html: "<h1>Hello mail is working</h1>",
      });
    })
    .catch((err) => console.log(err))

    .catch((err) => console.log(err));
};

exports.getLogin = (req, res, next) => {
  let errorMsg = req.flash("errorMessage");
  if (errorMsg.length > 0) {
    errorMsg = errorMsg[0];
  } else {
    errorMsg = null;
  }
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    errorMessage: errorMsg,
  });
};

exports.postLogin = (req, res, next) => {
  const { email, password } = req.body;
  User.findOne({ email: email }).then((user) => {
    if (!user) {
      req.flash("errorMessage", "Invalid Email");
      return res.redirect("/login");
    }
    bcrypt
      .compare(password, user.password)
      .then((result) => {
        if (result) {
          req.session.isLoggedIn = true;
          req.session.user = user;
          return req.session.save((err) => {
            console.log(err);
            res.redirect("/");
          });
        } else {
          req.flash("errorMessage", "Invalid Password");
          res.redirect("/login");
        }
      })
      .catch((err) => console.log(err));
  });
};

exports.postLogOut = (req, res, next) => {
  req.session.destroy((err) => {
    res.redirect("/");
    console.log(err);
  });
};

exports.getReset = (req, res, next) => {
  let errorMsg = req.flash("errorMessage");
  if (errorMsg.length > 0) {
    errorMsg = errorMsg[0];
  } else {
    errorMsg = null;
  }
  res.render("auth/reset", {
    path: "/reset",
    pageTitle: "Reset Password",
    errorMessage: errorMsg,
  });
};

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect("/reset");
    }
    const token = buffer.toString("hex");
    User.findOne({ email: req.body.email })
      .then((user) => {
        if (!user) {
          req.flash("errorMessage", "Invalid Backup Email");
          return res.redirect("/reset");
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        return user.save();
      })
      .then(() => {
        res.redirect("/");
        return transport.sendMail({
          from: "nodemaster@node.com",
          to: req.body.email,
          subject: "Password Reset",
          html: `<p>You Requested A Password Reset</p>
               <p>Click on <a href="http://localhost:3000/reset/${token}">link</a> to reset the password</p>       
        `,
        });
      })
      .catch((err) => console.log(err));
  });
};

exports.getResetPassword = (req, res, next) => {
  const token = req.params.token;
  let errorMsg = req.flash("errorMessage");
  if (errorMsg.length > 0) {
    errorMsg = errorMsg[0];
  } else {
    errorMsg = null;
  }
  User.findOne({
    resetToken: token,
    resetTokenExpiration: { $gt: Date.now() },
  }).then((user) => {
    let errorMsg = req.flash("errorMessage");
    if (errorMsg.length > 0) {
      errorMsg = errorMsg[0];
    } else {
      errorMsg = null;
    }
    res.render("auth/newPassword", {
      path: "/newPassword",
      pageTitle: "Reset Password",
      errorMessage: errorMsg,
      userId: user._id.toString(),
      token: token,
    });
  });
};

exports.newPassword = (req, res, next) => {
  const { userId, password, token } = req.body;
  let resetUser;
  User.findOne({
    _id: userId,
    resetToken: token,
    resetTokenExpiration: { $gt: Date.now() },
  })
    .then((user) => {
      resetUser = user;
      return bcrypt.hash(password, 12);
    })
    .then((hashed) => {
      resetUser.password = hashed;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();
    })
    .then(() => {
      res.redirect("/login");
    })
    .catch((err) => console.log(err));
};
