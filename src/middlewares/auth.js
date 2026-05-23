const User = require("../models/User");
const jwt = require("jsonwebtoken");

const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;

    if (!token) return res.status(401).json("no token provided");

    const decodedToken = await jwt.verify(token, process.env.JWT_SECRET);

    const { _id } = decodedToken;
    const user = await User.findById(_id);
    if (!user) return res.status(404).json("user not found");
    req.user = user;
    next();
  } catch (error) {
    console.log("error:", error);
    return res.status(401).json("something went wrong");
  }
};

module.exports = userAuth;
