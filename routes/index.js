const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../config/auth");

// Group Model
const Group = require("../models/Group");

// Welcome Page
router.get("/", (req, res) => {
  return res.status(200).render("home");
});

// About Page
router.get("/about", (req, res) => {
  return res.status(200).render("about");
});

// Contact Page
router.get("/contact", (req, res) => {
  return res.status(200).render("contact");
});

// Dashboard
router.get("/dashboard", ensureAuthenticated, (req, res) => {
  // Get all groups from DB
  Group.find({}, (err, allGroups) => {
    if (err) {
      console.log(err);
    } else {
      res.render("dashboard", {
        name: req.user.name,
        image: req.user.image,
        username: req.user.username,
        groups: allGroups,
      });
    }
  });
});

module.exports = router;
