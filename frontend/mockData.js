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

const mockFiles = {
  "ZOOL 1": [
    { id: "file-1", title: "Past Paper 2024", fileType: "pdf", sizeBytes: 2048000 },
    { id: "file-2", title: "Lecture 1 Slides", fileType: "pptx", sizeBytes: 5120000 }
  ],
  "PHIL 104": [
    { id: "file-3", title: "Past Paper 2023", fileType: "pdf", sizeBytes: 1536000 }
  ],
  "MATH 112": [
    { id: "file-4", title: "Lecture Notes", fileType: "pdf", sizeBytes: 1024000 }
  ],
  "COMP 107": [
    { id: "file-5", title: "Past Paper 2024", fileType: "pdf", sizeBytes: 1843200 },
    { id: "file-6", title: "Revision Questions", fileType: "pdf", sizeBytes: 921600 }
  ],
  "SOEN 105": [
    { id: "file-7", title: "Past Paper 2023", fileType: "pdf", sizeBytes: 2252800 },
    { id: "file-8", title: "Process Scheduling Slides", fileType: "pptx", sizeBytes: 4300800 }
  ],
  "PHYS 213": [
    { id: "file-9", title: "Past Paper 2024", fileType: "pdf", sizeBytes: 1740800 }
  ],
  "MATH 111": [
    { id: "file-10", title: "Past Paper 2022", fileType: "pdf", sizeBytes: 1331200 },
    { id: "file-11", title: "Differentiation Slides", fileType: "pptx", sizeBytes: 3891200 }
  ]
};