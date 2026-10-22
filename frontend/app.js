const list = document.getElementById("semester-list");

mockSemesters.data.forEach(function (semester) {
  const item = document.createElement("li");
  item.textContent = semester.name;
  list.appendChild(item);
});