const mongoose = require("mongoose");

const unitSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    semester: { type: String, ref: "Semester", required: true },
    name: { type: String, required: true, trim: true }
  },
  { versionKey: false }
);

unitSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  }
});

module.exports = mongoose.model("Unit", unitSchema);