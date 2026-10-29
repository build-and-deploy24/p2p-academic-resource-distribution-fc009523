const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    unit: { type: String, ref: "Unit", required: true },
    title: { type: String, required: true, trim: true },
    fileType: { type: String, required: true, lowercase: true },
    sizeBytes: { type: Number, default: 0 },
    category: { type: String, enum: ["past-paper", "slides"], default: "past-paper" },
    year: { type: Number, default: null },
    fileHash: { type: String, default: null },
    magnetLink: { type: String, default: null },
    storedName: { type: String, default: null }
  },
  { versionKey: false, timestamps: true }
);

fileSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  }
});

module.exports = mongoose.model("File", fileSchema);