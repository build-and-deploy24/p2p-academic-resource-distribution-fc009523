const express = require("express");
const path = require("path");
const multer = require("multer");
const { getSemesters, getUnits, getFiles } = require("../controllers/browseController");
const { uploadFile, downloadFile } = require("../controllers/fileController");
const p2p = require("../controllers/p2pController");

const router = express.Router();

const upload = multer({
  dest: path.join(__dirname, "..", "uploads"),
  limits: { fileSize: 50 * 1024 * 1024 } // 50 MB maximum
});

// Browse
router.get("/semesters", getSemesters);
router.get("/semesters/:semesterId/units", getUnits);
router.get("/units/:unitId/files", getFiles);

// Upload and download
router.post("/files", upload.single("file"), uploadFile);
router.get("/files/:fileId/download", downloadFile);

// P2P
router.get("/files/:fileId/peers", p2p.getPeers);
router.get("/files/:fileId/magnet", p2p.getMagnet);
router.post("/files/:fileId/peers", p2p.registerPeer);
router.delete("/files/:fileId/peers/:userId", p2p.removePeer);
router.patch("/users/:userId/seeding", p2p.updateSeeding);
router.post("/sessions", p2p.logSession);

// Admin
router.get("/admin/stats", p2p.getStats);
router.get("/admin/files/health", p2p.getFileHealth);

module.exports = router;