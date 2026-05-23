const User = require("../models/User");
const bcrypt = require("bcrypt");
const { validateSignUpData } = require("../utils/validations");

const signup = async (req, res) => {
  try {
    validateSignUpData(req);
    const { password, email } = req.body;

    const user = await User.findOne({ email });

    if (user) return res.status(400).send("user already exists");

    try {
      const hasedPassword = await bcrypt.hash(password, 10);

      const newUser = new User({ ...req.body, password: hasedPassword });

      await newUser.save();

      const token = await newUser.getJWT();

      res.cookie("token", token, {
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
        sameSite: "none",
      });

      res.status(201).json({ success: true, message: "user created", newUser });
    } catch (error) {
      res.status(500).send(error.message);
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) return res.status(400).send("user not found");
  try {
    const isPasswordValid = await user.validatePassword(password); // method defined in User.j

    if (!isPasswordValid) {
      return res.status(400).send("invalid credentials");
    }

    const token = await user.getJWT();

    res.cookie("token", token, {
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      sameSite: "none",
    });
    // Sanitize user object before sending
    const sanitizedUser = user.toObject(); // Convert Mongoose doc to plain JS object
    delete sanitizedUser.password;
    delete sanitizedUser.createdAt;
    delete sanitizedUser.updatedAt;

    res.status(200).json({ success: true, sanitizedUser });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const logout = async (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    sameSite: "none",
  });
  res.status(200).send("logout successful");
};

module.exports = { signup, login, logout };
