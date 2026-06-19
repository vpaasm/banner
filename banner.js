// Shared live-bets feed logic for both languages.
// The generated rows contain no translatable words (masked names, game
// titles and $ amounts), so this file is identical for every language.
(function () {
  const CURRENCY = "$";
  const MIN_DELAY = 800;
  const MAX_DELAY = 1500;
  const INITIAL_ROWS = 10;

  // Grid columns shared by header + rows
  document.documentElement.style.setProperty(
    "--cols",
    "auto 1fr 1.1fr 1fr 1.2fr",
  );

  let MAX_ROWS = INITIAL_ROWS;

  const sampleUsernames = [
    "Maximus", "AceHigh", "LuckyBet", "BetKing", "SpinMaster",
    "Kerem", "BigWin", "JackpotMan", "SlotPro", "CardShark",
    "Tornado", "GoldRush", "DragonPlay", "Phoenix", "StarPlayer",
    "NightOwl", "Thunder", "CashKing", "QuickSpin", "RoyalFlush",
    "Iron", "SilverFox", "BlackJack", "RedSeven", "WildCard",
    "TopBet", "FireSpin", "Diamond", "AcePlayer", "MoonShot",
    "Emir", "Burak", "Deniz", "Polat", "Sertac", "Cenk",
  ];

  // Each game maps to a thumbnail image in the folder
  const sampleGames = [
    { name: "Sweet Bonanza", img: "sweet bom.webp" },
    { name: "Sugar Rush", img: "sugar rush.webp" },
    { name: "Sugar Rush 1000", img: "sugar rush 2.webp" },
    { name: "Gates of Olympus", img: "gates of.webp" },
    { name: "The Dog House", img: "dog house.webp" },
    { name: "Starlight Princess", img: "princess.webp" },
    { name: "Shining Crown", img: "shining crown.webp" },
    { name: "Burning Hot", img: "burninghot.webp" },
    { name: "40 Super Hot", img: "40superhot.webp" },
    { name: "Wild West Gold", img: "wild west gold.webp" },
    { name: "Buffalo King", img: "bufflo.webp" },
    { name: "Big Bass Bonanza", img: "bigbassbonanza.webp" },
    { name: "Big Bass Megaways", img: "bigbassbonnaza megaways.webp" },
  ];

  // Realistic USD bet sizes — varied, non-round amounts
  const commonBets = [
    0.2, 0.3, 0.5, 0.7, 0.9, 1.2, 1.7, 2.5, 3.3, 4.4, 5.5, 7.5, 8.8,
    10.9, 12.5, 15.0, 18.7, 22.4, 27.5, 33.3, 44.0, 55.5, 67.8, 80.0, 99.9,
  ];
  const highBets = [125.5, 150.0, 175.7, 222.2, 300.0, 444.4, 500.0]; // >$100, shown rarely

  function fmt(n) {
    return n.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  function maskUsername(name) {
    return name.slice(0, 2) + "*****";
  }

  function generateRandomBet() {
    const name =
      sampleUsernames[Math.floor(Math.random() * sampleUsernames.length)];
    const game =
      sampleGames[Math.floor(Math.random() * sampleGames.length)];
    // ~12% of bets are high (>$100), the rest are common (<=$100)
    const pool = Math.random() < 0.12 ? highBets : commonBets;
    const bet = pool[Math.floor(Math.random() * pool.length)];

    // ~25% of spins return nothing (loss)
    let multiplier;
    if (Math.random() < 0.25) {
      multiplier = 0;
    } else {
      // weighted toward small multipliers, occasional big hit
      const r = Math.random();
      if (r < 0.6) multiplier = 0.2 + Math.random() * 2; // 0.2x–2.2x
      else if (r < 0.9) multiplier = 2 + Math.random() * 8; // 2x–10x
      else multiplier = 10 + Math.random() * 90; // 10x–100x
    }

    const winnings = bet * multiplier;
    return {
      player: maskUsername(name),
      game,
      bet,
      multiplier,
      winnings,
      isWin: multiplier > 0,
    };
  }

  function createRowElement(b, animate = true) {
    const row = document.createElement("div");
    row.className = "win-row" + (b.isWin ? " win" : "");
    if (!animate) row.style.animation = "none";

    const multClass = b.isWin ? "win" : "loss";
    const winClass = b.isWin ? "win" : "loss";
    const winText = b.isWin
      ? "+" + CURRENCY + fmt(b.winnings)
      : CURRENCY + "0.00";

    row.innerHTML = `
      <div class="game-cell">
        <img class="game-thumb" src="${encodeURI(b.game.img)}" alt="${b.game.name}" loading="lazy" />
      </div>
      <div class="player">${b.player}</div>
      <div class="amount">${CURRENCY}${fmt(b.bet)}</div>
      <div class="multiplier ${multClass}">${b.multiplier.toFixed(2)}x</div>
      <div class="winnings ${winClass}">${winText}</div>
    `;
    return row;
  }

  function initialFill() {
    const list = document.getElementById("feed-list");
    list.innerHTML = "";

    // Always exactly 10 rows; they flex to fill the height
    for (let i = 0; i < INITIAL_ROWS; i++) {
      list.appendChild(createRowElement(generateRandomBet(), false));
    }

    MAX_ROWS = INITIAL_ROWS;
  }

  function addBet(b) {
    const list = document.getElementById("feed-list");
    list.prepend(createRowElement(b, true));
    while (list.children.length > MAX_ROWS) {
      list.removeChild(list.lastChild);
    }
  }

  function scheduleNextBet() {
    const delay = MIN_DELAY + Math.random() * (MAX_DELAY - MIN_DELAY);
    setTimeout(() => {
      addBet(generateRandomBet());
      scheduleNextBet();
    }, delay);
  }

  window.addEventListener("load", () => {
    initialFill();
    scheduleNextBet();
  });

  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(initialFill, 200);
  });
})();
