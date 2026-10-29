const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    seedingEnabled: { type: Boolean, default: true }
  },
  { versionKey: false }
);

module.exports = mongoose.model("User", userSchema);