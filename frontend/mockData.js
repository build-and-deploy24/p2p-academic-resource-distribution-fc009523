const mockSemesters = {
  success: true,
  data: [
    { id: "y1s1", name: "Year 1 Semester 1" },
    { id: "y1s2", name: "Year 1 Semester 2" },
    { id: "y2s1", name: "Year 2 Semester 1" },
    { id: "y2s2", name: "Year 2 Semester 2" },
    { id: "y3s1", name: "Year 3 Semester 1" },
    { id: "y3s2", name: "Year 3 Semester 2" },
    { id: "y4s1", name: "Year 4 Semester 1" },
    { id: "y4s2", name: "Year 4 Semester 2" }
  ]
};
const mockUnits = {
  "y1s1": [
    { id: "ZOOL 1", name: "Biology of HIV/AIDS and Society" },
    { id: "PHIL 104", name: "Philosophy and Society" },
    { id: "MATH 112", name: "Basic Mathematics" },
    { id: "COMS 101", name: "Communication Skills" },
    { id: "COMP 107", name: "Foundations of Computing" },
    { id: "SOEN 105", name: "Software development" },
  ],
  "y1s2": [
    { id: "MATH 111", name: "Calculus 1" },
    { id: "COMP 100", name: "Computer Architecture" },
    { id: "SOEN 102", name: "Structured Programming" },
    { id: "COMP 113", name: "Operating Systems" },
    { id: "PHYS 213", name: "Introductory Electronics" },
    { id: "SOEN 112", name: "Systems Analysis and Design" },
  ],
  "y2s1": [],
  "y2s2": [],
  "y3s1": [],
  "y3s2": [],
  "y4s1": [],
  "y4s2": []
};

const FIRST_YEAR = 2000;
const LATEST_YEAR = 2026; // change this to the year of the most recent exam

const mockFiles = {};

mockUnits["y1s1"].forEach(function (unit) {
  const files = [];

  for (let year = LATEST_YEAR; year >= FIRST_YEAR; year--) {
    files.push({
      id: unit.id + "-pp-" + year,
      title: unit.name + " Past Paper " + year,
      fileType: "pdf",
      sizeBytes: 1000000 + (year % 7) * 150000,
      category: "past-paper",
      year: year
    });
  }

  files.push({
    id: unit.id + "-slides-1",
    title: unit.name + " Lecture Slides",
    fileType: "pptx",
    sizeBytes: 4200000,
    category: "slides",
    year: null
  });

  mockFiles[unit.id] = files;
});