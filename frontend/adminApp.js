const stats = mockStats.data;

const cards = [
  { label: "Active downloads", value: stats.activeDownloads },
  { label: "Average peers per file", value: stats.averagePeerCount },
  { label: "Fallback rate", value: Math.round(stats.fallbackRate * 100) + "%" }
];

const cardsEl = document.getElementById("stat-cards");
cards.forEach(function (card) {
  const div = document.createElement("div");
  div.className = "card";
  div.innerHTML = '<div class="card-value">' + card.value + '</div>' +
                  '<div class="card-label">' + card.label + '</div>';
  cardsEl.appendChild(div);
});

const tbody = document.querySelector("#health-table tbody");
mockFileHealth.forEach(function (file) {
  const tr = document.createElement("tr");
  if (file.peerCount < 3) tr.className = "low-peers";
  tr.innerHTML =
    "<td>" + file.title + "</td>" +
    "<td>" + file.peerCount + "</td>" +
    "<td>" + file.p2pDownloads + "</td>" +
    "<td>" + file.fallbackDownloads + "</td>";
  tbody.appendChild(tr);
});