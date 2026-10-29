const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const Unit = require("../models/Unit");
const File = require("../models/File");

function sendError(res, status, code, message) {
  return res.status(status).json({ success: false, error: { code, message } });
}

// Reads the saved file piece by piece and returns its SHA-256 fingerprint
function hashFile(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash("sha256");
    const stream = fs.createReadStream(filePath);
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("end", () => resolve(hash.digest("hex")));
    stream.on("error", reject);
  });
}

// POST /api/files
async function uploadFile(req, res, next) {
  try {
    if (!req.file) {
      return sendError(res, 400, "INVALID_INPUT", "A file is required (form field name: file).");
    }

    const { unitId, title, category, year } = req.body;

    const unit = await Unit.findById(unitId);
    if (!unit) {
      fs.unlinkSync(req.file.path); // remove the file we just received
      return sendError(res, 400, "INVALID_INPUT", "unitId is missing or does not exist.");
    }

    if (category && !["past-paper", "slides"].includes(category)) {
      fs.unlinkSync(req.file.path);
      return sendError(res, 400, "INVALID_INPUT", 'category must be "past-paper" or "slides".');
    }

    let yearNumber = null;
    if (year) {
      yearNumber = Number(year);
      if (!Number.isInteger(yearNumber)) {
        fs.unlinkSync(req.file.path);
        return sendError(res, 400, "INVALID_INPUT", "year must be a number.");
      }
    }

    const sha256 = await hashFile(req.file.path);
    const extension = path.extname(req.file.originalname).slice(1).toLowerCase() || "bin";

    const file = await File.create({
      _id: "file-" + Date.now(),
      unit: unit._id,
      title: title || path.parse(req.file.originalname).name,
      fileType: extension,
      sizeBytes: req.file.size,
      category: category || "past-paper",
      year: yearNumber,
      fileHash: sha256,
      storedName: req.file.filename
    });

    const result = file.toJSON();
    delete result.storedName;
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

// GET /api/files/:fileId/download
async function downloadFile(req, res, next) {
  try {
    const file = await File.findById(req.params.fileId);
    if (!file) {
      return sendError(res, 404, "RESOURCE_NOT_FOUND", "File not found.");
    }
    if (!file.storedName) {
      return sendError(res, 404, "RESOURCE_NOT_FOUND", "No document has been uploaded for this file yet.");
    }

    const filePath = path.join(__dirname, "..", "uploads", file.storedName);
    if (!fs.existsSync(filePath)) {
      return sendError(res, 404, "RESOURCE_NOT_FOUND", "The stored document is missing.");
    }

    // res.download sets Content-Type and Content-Disposition for us
    res.download(filePath, file.title + "." + file.fileType);
  } catch (error) {
    next(error);
  }
}

module.exports = { uploadFile, downloadFile };