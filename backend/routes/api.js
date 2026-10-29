const express = require("express");
const { getSemesters, getUnits, getFiles } = require("../controllers/browseController");

const router = express.Router();

router.get("/semesters", getSemesters);
router.get("/semesters/:semesterId/units", getUnits);
router.get("/units/:unitId/files", getFiles);

module.exports = router;