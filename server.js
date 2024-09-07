require("dotenv").config();
var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var indexRouter = require("./src/routes/index");
var usersRouter = require("./src/routes/users");
var DBConnect = require("./src/config/database");
var bodyParser = require("body-parser");
var helmet = require("helmet");
var cors = require("cors");

var https = require("https");
var fs = require("fs");
const Razorpay = require("razorpay");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

// var instance = new Razorpay({
//   key_id: 'YOUR_KEY_ID',
//   key_secret: 'YOUR_KEY_SECRET',
// });

// const options = {
//    key: fs.readFileSync('/etc/letsencrypt/live/crazygkaws.zetawiztechnologies.com/privkey.pem'),
//    cert: fs.readFileSync('/etc/letsencrypt/live/crazygkaws.zetawiztechnologies.com/fullchain.pem')
//  }

app.use(helmet());
app.use(cors());
// app.use(bodyParser.urlencoded({ extended: false }))
// app.use(bodyParser.json())

app.use(bodyParser.json({ limit: "500mb" }));
app.use(bodyParser.urlencoded({ limit: "500mb", extended: true }));

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use("/public", express.static(path.join(process.cwd(), "public")));
app.use("/upload", express.static("upload"));
DBConnect();
app.use("/api", indexRouter);
// app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  // console.log('err.message: fffffff', err.message);
  // res.locals.message = err.message;
  // res.locals.error = req.app.get('env') === 'development' ? err : {};
  // console.log('res.locals.error: ', res.locals.error);

  // // render the error page
  // res.status(err.status || 500);
  // res.render('error');

  var responce = {
    status: err.status || 500,
    message: err.message,
  };
  return res.status(err.status || 500).send(responce);
});

app.listen(3005, () => {
  console.log(`Example app listening on port ${3005}`);
});

//  https.createServer(options, app).listen(3005, console.log(`server runs on port ${3000}`))

module.exports = app;
