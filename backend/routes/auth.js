const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/User");

const router = express.Router();

router.post("/signup", async (req, res) => {
  try {
    const { username, firstname, lastname, password } = req.body;

    if (!username || !firstname || !lastname || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const existing = await User.findOne({ username });
    if (existing) return res.status(409).json({ message: "Username already exists." });

    const hashed = await bcrypt.hash(password, 10);
    await User.create({
      username,
      firstname,
      lastname,
      password: hashed,
      createon: new Date(),
    });

    res.json({ message: "Signup successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    res.json({
      message: "Login successful",
      user: { username: user.username, firstname: user.firstname, lastname: user.lastname },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/users", async (req, res) => {
  const users = await User.find({}, { username: 1, _id: 0 }).sort({ username: 1 }).lean();
  res.json(users);
});

module.exports = router;
