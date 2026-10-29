const mongoose = require("mongoose");

const downloadSessionSchema = new mongoose.Schema(
  {
    userId: { type: String, default: null },
    file: { type: String, ref: "File", required: true },
    mode: { type: String, enum: ["p2p", "fallback"], required: true },
    peerCount: { type: Number, default: 0 },
    durationMs: { type: Number, default: 0 }
  },
  { versionKey: false, timestamps: { createdAt: true, updatedAt: false } }
);

module.exports = mongoose.model("DownloadSession", downloadSessionSchema);