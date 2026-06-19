// Shared leaderboard logic for both languages.
// Each page defines window.LB_LABELS = { user, points, prize } before loading this.
(function () {
  const LABELS = Object.assign(
    { user: "User", points: "Points", prize: "Prize" },
    window.LB_LABELS || {},
  );

  const PER_PAGE = 10; // 10 winners per page, numbers keep going
  const PAGES = 6;
  const TOTAL = PER_PAGE * PAGES; // 6 pages of 10
  const TR_OFFSET = 3 * 60 * 60 * 1000; // Turkey = UTC+3 (no DST)

  let entries = [];
  let currentPage = 1;
  let resetAt = nextResetTime();

  // ---------- helpers ----------
  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function randLetter() {
    return String.fromCharCode(97 + Math.floor(Math.random() * 26));
  }

  function maskName() {
    return randLetter() + randLetter() + "*****";
  }

  function prizeFor(rank) {
    const map = { 1: 2000, 2: 1000, 3: 400, 4: 200, 5: 150, 6: 100, 7: 80, 8: 60, 9: 50, 10: 40 };
    return map[rank] || 40;
  }

  function fmtPoints(n) {
    return n.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  function pad2(n) {
    return String(n).padStart(2, "0");
  }

  // ---------- data ----------
  function generateEntries() {
    const points = [];

    // Top 3 — much higher, descending
    let p = rand(60000, 70000);
    for (let i = 0; i < 3; i++) {
      points.push(p);
      p -= rand(15000, 24000);
    }

    // The rest — descending with a floor
    let q = rand(1700, 2000);
    for (let i = 3; i < TOTAL; i++) {
      points.push(q);
      q -= rand(12, 45);
      if (q < 300) q = rand(300, 520);
    }

    entries = points.map((pt, idx) => ({
      rank: idx + 1,
      name: maskName(),
      points: Math.max(pt, 0),
      prize: prizeFor(idx + 1),
    }));
  }

  // ---------- render ----------
  function rowHTML(e, isTop) {
    return `
      <div class="row${isTop ? " top" : ""}">
        <div class="rank">#${e.rank}</div>
        <div class="col-user">
          <div class="cell-label">${LABELS.user}</div>
          <div class="cell-value">${e.name}</div>
        </div>
        <div class="col-points">
          <div class="cell-label">${LABELS.points}</div>
          <div class="cell-value">${fmtPoints(e.points)}</div>
        </div>
        <div class="col-prize">
          <div class="cell-label">${LABELS.prize}</div>
          <div class="cell-value">$${e.prize.toLocaleString("en-US")}</div>
        </div>
      </div>`;
  }

  function renderList() {
    const list = document.getElementById("list");
    let html = "";

    // Current page slice — 10 per page, ranks keep going across pages
    const start = (currentPage - 1) * PER_PAGE;
    const slice = entries.slice(start, start + PER_PAGE);
    for (const e of slice) html += rowHTML(e, e.rank <= 3);

    list.innerHTML = html;
  }

  function renderPagination() {
    const pag = document.getElementById("pagination");
    let html = `<div class="page-btn arrow" data-go="prev">&lsaquo;</div>`;
    for (let p = 1; p <= PAGES; p++) {
      html += `<div class="page-btn${p === currentPage ? " active" : ""}" data-page="${p}">${p}</div>`;
    }
    html += `<div class="page-btn arrow" data-go="next">&rsaquo;</div>`;
    pag.innerHTML = html;

    pag.querySelectorAll(".page-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (btn.dataset.page) currentPage = Number(btn.dataset.page);
        else if (btn.dataset.go === "prev") currentPage = Math.max(1, currentPage - 1);
        else if (btn.dataset.go === "next") currentPage = Math.min(PAGES, currentPage + 1);
        renderList();
        renderPagination();
      });
    });
  }

  // ---------- countdown (resets daily at Turkey 00:00) ----------
  function nextResetTime() {
    const ist = new Date(Date.now() + TR_OFFSET);
    const target = Date.UTC(
      ist.getUTCFullYear(),
      ist.getUTCMonth(),
      ist.getUTCDate() + 1,
      0, 0, 0, 0,
    );
    return target - TR_OFFSET;
  }

  function tick() {
    let diff = resetAt - Date.now();

    if (diff <= 0) {
      // New day — regenerate the list and reset the timer
      generateEntries();
      currentPage = 1;
      resetAt = nextResetTime();
      diff = resetAt - Date.now();
      renderList();
      renderPagination();
    }

    const totalSec = Math.floor(diff / 1000);
    document.getElementById("cd-days").textContent = Math.floor(totalSec / 86400);
    document.getElementById("cd-hours").textContent = pad2(Math.floor(totalSec / 3600) % 24);
    document.getElementById("cd-mins").textContent = pad2(Math.floor(totalSec / 60) % 60);
    document.getElementById("cd-secs").textContent = pad2(totalSec % 60);
  }

  // ---------- init ----------
  generateEntries();
  renderList();
  renderPagination();
  tick();
  setInterval(tick, 1000);
})();
