const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const flash = require("connect-flash");
const cookieparser = require("cookie-parser");
const errorController = require("./controllers/error");
const User = require("./models/user");

const bcrypt = require('bcryptjs');


// require("dotenv").config({
//   path: "./config/config.env",
// });

const MONGODB_URI = process.env.MONGODB_DATABASE;

const app = express();
const store = new MongoDBStore({
  uri: process.env.MONGODB_DATABASE,
  collection: "sessions",
});

const csrfProtection = csrf();




app.set("view engine", "ejs");
app.set("views", "views");
const adminRoutes = require("./routes/admin");
const user = require("./routes/user");
const feed = require("./routes/feed");
const authRoutes = require("./routes/auth");

app.use(cookieparser(process.env.COOKIS_SECRET));
// app.use(fileUpload())


app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));

app.use(express.static(path.join(__dirname, "public")));
app.use('/images',express.static(path.join(__dirname, "images")));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

app.use(flash());
app.use(csrfProtection);
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfTokenss = req.csrfToken();
  next();
});
app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      if (!user) {
        return next()
      }
      req.user = user;
      next();
    })
    .catch((err) => console.log(err));
});


app.use('/admin/*',(req, res, next) => {
  if (!req.session.admin) {
    return next();
  }
  Admin.findById(req.session.admin._id)
    .then(admin => {
      req.admin = admin;
      next();
    })
    .catch(err => console.log(err));
});



app.use("/admin", adminRoutes);

app.use(feed);
app.use(user);
app.use(authRoutes);


app.get('/500',errorController.get500)
app.get('/404',errorController.get404)

mongoose
  .connect(MONGODB_URI, { useUnifiedTopology: true, useNewUrlParser: true })
  .then((result) => {
    User.findOne().then(user => {
      if (!user) {
        
        bcrypt
          .hash(process.env.ADMINE_PASSWORD, 12)
          .then(hashedPassword => {
            const user = new User({
              name: process.env.ADMINUSER,
              email: process.env.ADMINEMAIL,
              password: hashedPassword,
              isAdmin: process.env.ADMIN_ACCESS,
              phone: process.env.ADMIN_PHONE,
           
            });
            user.save();
          })
      }
    });
    const PORT =process.env.PORT || 4000
    app.listen(PORT);
    console.log("server is running");
  })
  .catch((err) => {
    console.log(err);
  });
