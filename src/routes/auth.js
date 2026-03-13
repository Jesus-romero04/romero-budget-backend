const express = require("express");
const router  = express.Router();
const { register, login, profile, updateProfile } = require("../controllers/authController");
const auth = require("../middlewares/auth");

router.post("/register", register);
router.post("/login",    login);
router.get("/profile",   auth, profile);
router.put("/profile",   auth, updateProfile);

module.exports = router;