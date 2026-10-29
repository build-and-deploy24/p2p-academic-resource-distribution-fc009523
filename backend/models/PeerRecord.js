const mongoose = require("mongoose");

const peerRecordSchema = new mongoose.Schema(
  {
    file: { type: String, ref: "File", required: true },
    userId: { type: String, required: true },
    lastActive: { type: Date, default: Date.now }
  },
  { versionKey: false }
);

// One record per student per file
peerRecordSchema.index({ file: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model("PeerRecord", peerRecordSchema);