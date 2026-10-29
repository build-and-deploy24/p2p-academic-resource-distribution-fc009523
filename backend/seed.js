require("dotenv").config();

const mongoose = require("mongoose");
const Semester = require("./models/Semester");
const Unit = require("./models/Unit");
const File = require("./models/File");

const unitNames = [
  ["unit-1", "Biology of HIV/AIDS"],
  ["unit-2", "Philosophy and Society"],
  ["unit-3", "Communication Skills"],
  ["unit-4", "Basic Mathematics"],
  ["unit-5", "Operating Systems"],
  ["unit-6", "Introductory Electronics"],
  ["unit-7", "Calculus1"]
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to " + mongoose.connection.name);

  // Clear old data so this script can be run again safely
  await Semester.deleteMany({});
  await Unit.deleteMany({});
  await File.deleteMany({});

  const semesters = [];
  for (let y = 1; y <= 4; y++) {
    for (let s = 1; s <= 2; s++) {
      semesters.push({ _id: "y" + y + "s" + s, name: "Year " + y + " Semester " + s });
    }
  }
  await Semester.insertMany(semesters);

  const units = unitNames.map(([id, name]) => ({ _id: id, semester: "y1s1", name }));
  await Unit.insertMany(units);

  const files = [];
  unitNames.forEach(([unitId, unitName]) => {
    for (let year = 2026; year >= 2000; year--) {
      files.push({
        _id: unitId + "-pp-" + year,
        unit: unitId,
        title: unitName + " Past Paper " + year,
        fileType: "pdf",
        sizeBytes: 1000000 + (year % 7) * 150000,
        category: "past-paper",
        year: year
      });
    }
    files.push({
      _id: unitId + "-slides-1",
      unit: unitId,
      title: unitName + " Lecture Slides",
      fileType: "pptx",
      sizeBytes: 4200000,
      category: "slides",
      year: null
    });
  });
  await File.insertMany(files);

  console.log("Saved " + semesters.length + " semesters, " + units.length + " units, " + files.length + " files.");
  await mongoose.disconnect();
}

seed().catch((error) => {
  console.error("Seeding failed:", error.message);
  process.exit(1);
});