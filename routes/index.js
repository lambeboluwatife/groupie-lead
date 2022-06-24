const express = require("express");
const router = express.Router();
const path = require("path");
const { ensureAuthenticated } = require("../config/auth");
const multer = require("multer");
const fs = require("fs");

// Group Model
const Group = require("../models/Group");
const User = require("../models/User");

// Set Storage Engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "_" + Date.now() + "_" + path.extname(file.originalname)
    );
  },
});

// Init Upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 2000000 },
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

// Check File Type
function checkFileType(file, cb) {
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb("Error: Images Only!");
  }
}

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

// User Dashboard
router.get("/dashboard", ensureAuthenticated, (req, res) => {
  // Get all groups from DB
  Group.find({ "author.id": req.user.id }, (err, allGroups) => {
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

// User Profile
router.get("/profile", ensureAuthenticated, (req, res) => {
  // Get all groups from DB
  Group.find({ "author.id": req.user.id }, (err, allGroups) => {
    if (err) {
      console.log(err);
    } else {
      res.render("profile", {
        name: req.user.name,
        image: req.user.image,
        username: req.user.username,
        image: req.user.image,
        id: req.user.id,
      });
    }
  });
});

// update user route
router.put("/profile/:id", upload.single("image"), (req, res) => {
  let id = req.params.id;
  let new_image = "";

  if (req.file) {
    new_image = req.file.filename;
    try {
      fs.unlinkSync("./uploads/" + req.body.old_image);
    } catch (err) {
      console.log(err);
    }
  } else {
    new_image = req.body.old_image;
  }

  User.findByIdAndUpdate(
    req.params.id,
    {
      username: req.body.username,
      image: new_image,
    },
    (err, updatedUser) => {
      if (err) {
        req.flash("error_msg", "There was an error while updating");
        res.status(500).redirect("/profile");
      } else {
        req.flash("success_msg", "Profile updated");
        res.status(200).redirect("/profile");
      }
    }
  );
});

module.exports = router;
