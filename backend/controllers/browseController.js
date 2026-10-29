const Semester = require("../models/Semester");
const Unit = require("../models/Unit");
const File = require("../models/File");

function sendError(res, status, code, message) {
  return res.status(status).json({ success: false, error: { code, message } });
}

// GET /api/semesters
async function getSemesters(req, res, next) {
  try {
    const semesters = await Semester.find().sort({ _id: 1 });
    res.json({ success: true, data: semesters });
  } catch (error) {
    next(error);
  }
}

// GET /api/semesters/:semesterId/units
async function getUnits(req, res, next) {
  try {
    const semester = await Semester.findById(req.params.semesterId);
    if (!semester) {
      return sendError(res, 404, "RESOURCE_NOT_FOUND", "Semester not found.");
    }
    const units = await Unit.find({ semester: semester._id }).sort({ name: 1 });
    res.json({ success: true, data: units });
  } catch (error) {
    next(error);
  }
}

// GET /api/units/:unitId/files   (optional: ?year=2024)
async function getFiles(req, res, next) {
  try {
    const unit = await Unit.findById(req.params.unitId);
    if (!unit) {
      return sendError(res, 404, "RESOURCE_NOT_FOUND", "Unit not found.");
    }

    const filter = { unit: unit._id };
    if (req.query.year !== undefined) {
      const year = Number(req.query.year);
      if (!Number.isInteger(year)) {
        return sendError(res, 400, "INVALID_INPUT", "year must be a number.");
      }
      filter.year = year;
    }

    const files = await File.find(filter)
      .select("-fileHash -storedName -magnetLink")
      .sort({ year: -1 });
    res.json({ success: true, data: files });
  } catch (error) {
    next(error);
  }
}

module.exports = { getSemesters, getUnits, getFiles };