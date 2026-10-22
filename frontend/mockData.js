const mockSemesters = {
  success: true,
  data: [
    { id: "sem-1", name: "Year 1 Semester 1" },
    { id: "sem-2", name: "Year 1 Semester 2" }
  ]
};
const mockUnits = {
  "sem-1": [
    { id: "unit-1", name: "Introduction to Programming" },
    { id: "unit-2", name: "Calculus I" }
    
  ],
  "sem-2": [
    { id: "unit-3", name: "Data Structures" }
  ]
};

const mockFiles = {
  "unit-1": [
    { id: "file-1", title: "Past Paper 2024", fileType: "pdf", sizeBytes: 2048000 },
    { id: "file-2", title: "Lecture 1 Slides", fileType: "pptx", sizeBytes: 5120000 }
  ],
  "unit-2": [
    { id: "file-3", title: "Past Paper 2023", fileType: "pdf", sizeBytes: 1536000 }
  ],
  "unit-3": []
};