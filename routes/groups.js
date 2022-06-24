const express = require("express");
const router = express.Router();
const path = require("path");
const { ensureAuthenticated } = require("../config/auth");
const multer = require("multer");
const fs = require("fs");

// Group Model
const Group = require("../models/Group");

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

//INDEX - Show all Groups
router.get("/", (req, res) => {
  // Get all groups from DB
  Group.find({}, (err, allGroups) => {
    if (err) {
      console.log(err);
    } else {
      function getMultipleRandom(allGroups, num) {
        const shuffled = [...allGroups].sort(() => 0.5 - Math.random());

        return shuffled.slice(0, num);
      }
      let randGroups = getMultipleRandom(allGroups, 10);
      res.render("groups/index", {
        groups: randGroups,
      });
    }
  });
});

//NEW - Show form to create new group
router.get("/new", ensureAuthenticated, (req, res) => {
  res.render("groups/new");
});

// CREATE - Create new group
router.post(
  "/",
  ensureAuthenticated,
  upload.single("coverImage"),
  (req, res) => {
    // get data from form and add to groups array
    const groupName = req.body.groupName;
    const description = req.body.description;
    const course = req.body.course;
    const coverImage = req.file.filename;
    const groupType = req.body.groupType;
    const inviteUrl = req.body.inviteUrl;
    const author = {
      id: req.user._id,
      username: req.user.username,
      image: req.user.image,
    };

    const newGroup = new Group({
      groupName,
      description,
      course,
      coverImage,
      groupType,
      inviteUrl,
      author,
    });

    //  Create a new group and save to DB
    Group.create(newGroup, (err, newlyCreated) => {
      if (err) {
        console.log(err);
      } else {
        req.flash("success_msg", "Group Added");
        // redirect back to group page
        res.redirect("/dashboard");
      }
    });
  }
);

// Search for group
router.post("/search", (req, res) => {
  const search = req.body.search;
  const newSearch = new RegExp(search, 'i');
  Group.find(
    {
      $or: [
        { groupName: newSearch },
        { course: newSearch },
        { groupType: newSearch },
        { "author.username": newSearch },
      ],
    },
    (err, allSearch) => {
      if (err) {
        console.log(err);
      } else {
        res.render("groups/search", {
          groups: allSearch,
          search: search,
        });
      }
    }
  );
});

// EDIT GROUP ROUTE
router.get("/:id/edit", (req, res) => {
  Group.findById(req.params.id, (err, foundGroup) => {
    if (err) {
      res.status(500).redirect("back");
    } else {
      res.status(200).render("groups/edit", { group: foundGroup });
    }
  });
});

// UPDATE GROUP ROUTE
router.put("/:id", upload.single("coverImage"), (req, res) => {
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

  Group.findByIdAndUpdate(
    req.params.id,
    {
      groupName: req.body.groupName,
      description: req.body.description,
      course: req.body.course,
      coverImage: new_image,
      groupType: req.body.groupType,
      inviteUrl: req.body.inviteUrl,
    },
    (err, updatedGroup) => {
      if (err) {
        res.status(500).redirect("/groups");
      } else {
        req.flash("success_msg", "Group Updated");
        res.status(200).redirect("/dashboard");
      }
    }
  );
});

// DESTROY ITEM ROUTE
router.delete("/:id", (req, res) => {
  Group.findByIdAndRemove(req.params.id, (err, result) => {
    if (result.coverImage != "") {
      try {
        fs.unlinkSync("./uploads/" + result.coverImage);
      } catch {
        console.log(err);
      }
    }
    if (err) {
      res.status(500).redirect("/groups");
    } else {
      req.flash("error_msg", "Group Deleted");
      res.status(200).redirect("/dashboard");
    }
  });
});

module.exports = router;
