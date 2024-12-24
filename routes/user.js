const express = require("express");
const router = express.Router();
const User = require("../models/user.js"); 
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const userController = require("../controllers/users.js");

//signup router
router.route("/signup")
.get(userController.renderSignupFrom)
.post(wrapAsync(userController.signup));

//login router 
router.route("/login")
.get(userController.renderLoginFrom)
.post(saveRedirectUrl, passport.authenticate("local", { failureRedirect: "/login",failureFlash:true,}) ,wrapAsync(userController.login));


// logout
router.get("/logout", userController.logout)
module.exports = router;