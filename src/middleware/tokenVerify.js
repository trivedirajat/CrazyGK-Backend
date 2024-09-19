var jwt = require("jsonwebtoken");
const user = require("../models/user");

async function verifyToken(req, res, next) {
  const { token } = req.headers;
  // console.log('token: ', token);
  if (!token) {
    // var responseErr = {
    //     status: 400,
    //     message: 'Token not provided.'
    // };
    // return res.status(400).send(responseErr);
    next();
  }

  jwt.verify(token, process.env.JWTKEY, function (err, decoded) {
    console.log("decoded", decoded);
    if (decoded) {
      if (decoded.type === "logged") {
        req["user_id"] = decoded.user_id;
        req["email"] = decoded.email;
        req["name"] = decoded.name;
        req["user_type"] = decoded.user_type;
        req["type"] = decoded.type;
        next();
      } else {
        req.user = {
          user_id: decoded.user_id,
          email: decoded.email,
          name: decoded.name,
          user_type: decoded.user_type,
          type: decoded.type,
        };
        next();
      }
    }
  });
}
const verifyTokenDb = async (req, res, next) => {
  console.log("🚀 ~ verifyTokenDb ~ requireAuth:", req);
  const requireAuth = req.headers["require-auth"] === "true";

  if (!requireAuth) {
    return next();
  }

  const token = req.header("Authorization")?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access Denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    const UserDetails = await user.findById(decoded._id);

    if (!UserDetails) {
      return res.status(404).json({ error: "User not found." });
    }

    req.user = {
      _id: UserDetails._id,
      name: UserDetails.name,
      email: UserDetails.email,
    };

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ error: "Token expired. Please authenticate again." });
    } else if (error.name === "JsonWebTokenError") {
      return res
        .status(401)
        .json({ error: "Invalid token. Please authenticate again." });
    } else {
      console.error("🚀 ~ verifyTokenDb ~ error:", error);
      return res.status(500).json({ error: "Internal Server Error." });
    }
  }
};

async function verifyRole(req, res, next) {
  const user_id = req?.user_id || req?.user?.user_id;
  if (!user_id) {
    var responseErr = {
      status: 403,
      message: "Unauthorized access.",
    };
    return res.status(403).send(responseErr);
  }
  next();
}

module.exports = { verifyToken, verifyRole, verifyTokenDb };
