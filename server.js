require("dotenv").config();
var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var indexRouter = require("./src/routes/index");
var DBConnect = require("./src/config/database");
var bodyParser = require("body-parser");
var helmet = require("helmet");
var cors = require("cors");

const { ADMIN_SITEURL, FRONTEND_SITEURL } = require("./utils/config");

var app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "blob:", ADMIN_SITEURL, FRONTEND_SITEURL],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
      },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(cors());
app.use(bodyParser.json({ limit: "500mb" }));
app.use(bodyParser.urlencoded({ limit: "500mb", extended: true }));

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/public", express.static(path.join(process.cwd(), "public")));
app.use("/upload", express.static("upload"));
DBConnect();
app.use("/api", indexRouter);

app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  var responce = {
    status: err.status || 500,
    message: err.message,
  };
  return res.status(err.status || 500).send(responce);
});

app.listen(3005, () => {
  console.log(`Example app listening on port ${3005}`);
});

module.exports = app;
