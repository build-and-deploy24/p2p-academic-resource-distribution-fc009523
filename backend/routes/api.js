const express = require("express");
const path = require("path");
const multer = require("multer");
const { getSemesters, getUnits, getFiles } = require("../controllers/browseController");
const { uploadFile, downloadFile } = require("../controllers/fileController");

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

module.exports = router;