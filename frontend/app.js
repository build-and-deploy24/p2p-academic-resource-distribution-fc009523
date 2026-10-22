const titleEl = document.getElementById("page-title");
const listEl = document.getElementById("item-list");
const backBtn = document.getElementById("back-button");
let backAction = null;

backBtn.addEventListener("click", function () {
  if (backAction) backAction();
});

function render(title, items, onBack) {
 document.getElementById("status-message").textContent = ""; 
  document.getElementById("filters").innerHTML = "";
  titleEl.textContent = title;
  listEl.innerHTML = "";
  if (items.length === 0) {
    listEl.appendChild(makeItem("Nothing here yet."));
  }
  items.forEach(function (item) {
    listEl.appendChild(item);
  });
  backAction = onBack;
  backBtn.hidden = !onBack;
}

function makeItem(text, onClick) {
  const li = document.createElement("li");
  li.textContent = text;
  if (onClick) {
    li.classList.add("clickable");
    li.addEventListener("click", onClick);
  }
  return li;
}

function formatSize(bytes) {
  return (bytes / 1024 / 1024).toFixed(1) + " MB";
}

function showSemesters() {
  const items = mockSemesters.data.map(function (semester) {
    return makeItem(semester.name, function () {
      showUnits(semester);
    });
  });
  render("Semesters", items, null);
}

function showUnits(semester) {
  const units = mockUnits[semester.id] || [];
  const items = units.map(function (unit) {
    return makeItem(unit.name, function () {
      showFiles(semester, unit);
    });
  });
  render(semester.name + " – Units", items, showSemesters);
}

function downloadFile(file) {
  const url = "/api/files/" + file.id + "/download";
  // Mock for now: the backend isn't built yet.
  // Later this will try P2P first, then fall back to this URL.
  document.getElementById("status-message").textContent =
    "Download requested: " + file.title + " (will call " + url + ")";
}

function makeFileItem(file) {
  const li = document.createElement("li");
  li.classList.add("file-row");

  const label = document.createElement("span");
  label.textContent = file.title + " (" + file.fileType.toUpperCase() + ", " + formatSize(file.sizeBytes) + ")";

  const button = document.createElement("button");
  button.textContent = "Download";
  button.className = "download-btn";
  button.addEventListener("click", function () {
    downloadFile(file);
  });

  li.appendChild(label);
  li.appendChild(button);
  return li;
}

function showFiles(semester, unit) {
  const files = mockFiles[unit.id] || [];

  const years = [];
  files.forEach(function (file) {
    if (file.year && years.indexOf(file.year) === -1) {
      years.push(file.year);
    }
  });
  years.sort(function (a, b) { return b - a; });

  function buildItems(selectedYear) {
    return files
      .filter(function (file) {
        return selectedYear === "all" || String(file.year) === selectedYear;
      })
            .map(function (file) {
        return makeFileItem(file);
      });
  }

  render(unit.name + " – Files", buildItems("all"), function () {
    showUnits(semester);
  });

  const select = document.createElement("select");
  select.innerHTML = '<option value="all">All years</option>' +
    years.map(function (y) { return '<option value="' + y + '">' + y + '</option>'; }).join("");

  select.addEventListener("change", function () {
    listEl.innerHTML = "";
    const items = buildItems(select.value);
    if (items.length === 0) {
      listEl.appendChild(makeItem("Nothing here yet."));
    }
    items.forEach(function (item) {
      listEl.appendChild(item);
    });
  });

  document.getElementById("filters").appendChild(select);
}

showSemesters();