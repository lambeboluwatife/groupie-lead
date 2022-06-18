const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema({
  groupName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  course: {
    type: String,
    required: true,
  },
  coverImage: {
    type: String,
    required: true,
  },
  groupType: {
    type: String,
    required: true,
  },
  inviteUrl: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  author: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    username: String,
  },
});

const Group = mongoose.model("Group", groupSchema);

module.exports = Group;
