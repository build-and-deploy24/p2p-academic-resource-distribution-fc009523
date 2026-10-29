const mongoose = require("mongoose");

const semesterSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true, trim: true }
  },
  { versionKey: false }
);

// When sent to the frontend, show "id" instead of "_id"
semesterSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  }
});

module.exports = mongoose.model("Semester", semesterSchema);