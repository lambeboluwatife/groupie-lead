const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../config/auth");

// Group Model
const Group = require("../models/Group");

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
router.post("/", ensureAuthenticated, (req, res) => {
  // get data from form and add to groups array
  const groupName = req.body.groupName.toLowerCase();
  const description = req.body.description.toLowerCase();
  const course = req.body.course.toLowerCase();
  const groupType = req.body.groupType.toLowerCase();
  const inviteUrl = req.body.inviteUrl;
  const author = {
    id: req.user._id,
    username: req.user.username,
  };

  const newGroup = new Group({
    groupName,
    description,
    course,
    groupType,
    inviteUrl,
    author,
  });

  //  Create a new group and save to DB
  Group.create(newGroup, (err, newlyCreated) => {
    if (err) {
      console.log(err);
    } else {
      req.flash(
        "success_msg",
        "Group Created"
      );
      // redirect back to group page
      res.redirect("/dashboard");
    }
  });
});

// Search for group
router.post("/search", (req, res) => {
  const search = req.body.search.toLowerCase();
  Group.find(
    { $or: [{ groupName: search }, { course: { $regex: /search/ } }, { groupType: search }] },
    (err, allSearch) => {
      if (err) {
        console.log(err);
      } else {
        if (allSearch == "") {
          console.log(search);
          console.log("not found");
          res.redirect("/groups");
        } else {
          res.render("groups/search", {
            groups: allSearch, search: search
          })
        }
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

// UPDATE ITEM ROUTE
router.put("/:id", (req, res) => {
  let group = Group.findById(req.params.id);

  group = Group.findOneAndUpdate(req.params.id, req.body, (err, updatedGroup) => {
    if (err) {
      res.status(500).redirect("/groups");
    } else {
      req.flash(
        "success_msg",
        "Group Edited"
      );
      res.status(200).redirect("/dashboard");
    }
  });
});

// DESTROY ITEM ROUTE
router.delete("/:id", (req, res) => {
  Group.findByIdAndRemove(req.params.id, (err) => {
    if (err) {
      res.status(500).redirect("/groups");
    } else {
      req.flash(
        "error_msg",
        "Group Deleted"
      );
      res.status(200).redirect("/dashboard");
    }
  });
});

module.exports = router;
