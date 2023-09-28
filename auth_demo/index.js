const express = require("express");

const app = express();

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const session = require("express-session");

const User = require("./models/user");

mongoose
  .connect("mongodb://127.0.0.1/auth_demo")

  .then((result) => {
    console.log("connect to mongodb");
  })
  .catch((err) => {
    console.log(err);
  });

app.set("view engine", "ejs");
app.set("views", "views");

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(
  session({
    secret: "notssecreet",
    resave: false,
    saveUninitialized: false,
  })
);

app.get("/", (req, res) => {
  res.send("HomePage");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const user = new User({
    username,
    password: hashedPassword,
  });
  await user.save();
  res.redirect("/");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (user) {
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      req.session.user_id = user._id;
      res.redirect("/admin");
    } else {
      res.redirect("/login");
    }
  } else {
    res.redirect("/login");
  }
});

app.get("/admin", (req, res) => {
  if (!req.session.user_id) {
    res.redirect("/login");
  }
  res.send("Halaman admin hanya bisa diakses jika kamu login");
});

app.listen(3000, () => {
  console.log("app listening on port http://localhost:3000");
});
