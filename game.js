// Cosmic Dodger Neon - improved version
// Bigger canvas, smoother visuals, and no weird asteroid artifacts in corners.

// Canvas & context
const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

// UI elements
const scoreLabel = document.getElementById("score-label");
const bestLabel = document.getElementById("best-label");
const livesLabel = document.getElementById("lives-label");
const messageOverlay = document.getElementById("message-overlay");
const messageTitle = document.getElementById("message-title");
const messageBody = document.getElementById("message-body");
const restartBtn = document.getElementById("restart-btn");
const startBtn = document.getElementById("start-btn");
const pauseBtn = document.getElementById("pause-btn");
const themeToggleBtn = document.getElementById("theme-toggle");

const BEST_KEY = "cosmic-dodger-neon-best";
const THEME_KEY = "cosmic-dodger-neon-theme";

// Game state
let player;
let asteroids = [];
let stars = [];
let pressed = { left: false, right: false };
let score = 0;
let bestScore = 0;
let lives = 3;
let running = false;
let paused = false;
let lastTime = 0;
let spawnTimer = 0;

// Helpers
function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

// Stars (pre-generated for smoother background)
function createStars(count) {
  stars = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3,
      alpha: 0.4 + Math.random() * 0.6,
      speed: 10 + Math.random() * 20
    });
  }
}

function updateStars(dt) {
  for (const s of stars) {
    s.y += s.speed * dt * 0.3;
    if (s.y > canvas.height) {
      s.y = -2;
      s.x = Math.random() * canvas.width;
    }
  }
}

function drawStars() {
  ctx.save();
  ctx.fillStyle = "#020617";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (const s of stars) {
    ctx.globalAlpha = s.alpha;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fillStyle = "#e5e7eb";
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}

// Entities
function createPlayer() {
  const w = 40;
  const h = 30;
  return {
    x: canvas.width / 2,
    y: canvas.height - 60,
    w,
    h,
    speed: 320
  };
}

function createAsteroid() {
  const radius = 14 + Math.random() * 18;
  const margin = 24;
  const x = margin + radius + Math.random() * (canvas.width - radius * 2 - margin * 2);
  const y = -radius - 10;
  const speed = 90 + Math.random() * 110;
  return { x, y, radius, speed };
}

// Theme
function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === "light") {
    document.body.classList.add("light-mode");
  }
  updateThemeIcon();
}

function updateThemeIcon() {
  const isLight = document.body.classList.contains("light-mode");
  themeToggleBtn.textContent = isLight ? "☀︎" : "◐";
}

function toggleTheme() {
  document.body.classList.toggle("light-mode");
  const isLight = document.body.classList.contains("light-mode");
  localStorage.setItem(THEME_KEY, isLight ? "light" : "dark");
  updateThemeIcon();
}

// Best score
function loadBestScore() {
  const raw = localStorage.getItem(BEST_KEY);
  const val = raw ? parseInt(raw, 10) : 0;
  bestScore = isNaN(val) ? 0 : val;
  bestLabel.textContent = bestScore.toString();
}

function saveBestScore() {
  if (score > bestScore) {
    bestScore = score;
    bestLabel.textContent = bestScore.toString();
    localStorage.setItem(BEST_KEY, bestScore.toString());
  }
}

// Game lifecycle
function resetGame() {
  player = createPlayer();
  asteroids = [];
  score = 0;
  lives = 3;
  scoreLabel.textContent = "0";
  livesLabel.textContent = lives.toString();
  spawnTimer = 0;
  lastTime = 0;
}

function startGame() {
  if (running && !paused) return;
  resetGame();
  running = true;
  paused = false;
  hideOverlay();
  requestAnimationFrame(loop);
}

function pauseGame() {
  if (!running) return;
  paused = !paused;
  if (!paused) {
    hideOverlay();
    lastTime = performance.now();
    requestAnimationFrame(loop);
  } else {
    showOverlay("Game Paused", "Press Pause again or Start to resume.");
  }
}

// Overlay
function showOverlay(title, body) {
  messageTitle.textContent = title;
  messageBody.textContent = body;
  messageOverlay.classList.remove("hidden");
}

function hideOverlay() {
  messageOverlay.classList.add("hidden");
}

// Input
window.addEventListener("keydown", e => {
  if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
    pressed.left = true;
  }
  if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
    pressed.right = true;
  }
  if (e.key === " " && !running) {
    startGame();
  }
});

window.addEventListener("keyup", e => {
  if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
    pressed.left = false;
  }
  if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
    pressed.right = false;
  }
});

startBtn.addEventListener("click", () => {
  if (!running || paused) {
    startGame();
  }
});

pauseBtn.addEventListener("click", () => {
  pauseGame();
});

restartBtn.addEventListener("click", () => {
  startGame();
});

themeToggleBtn.addEventListener("click", toggleTheme);

// Game loop
function loop(timestamp) {
  if (!running || paused) return;

  if (!lastTime) lastTime = timestamp;
  const dt = (timestamp - lastTime) / 1000;
  lastTime = timestamp;

  update(dt);
  draw();

  requestAnimationFrame(loop);
}

function update(dt) {
  // Increase score over time
  score += dt * 12;
  scoreLabel.textContent = Math.floor(score).toString();

  // Update background stars for smooth motion
  updateStars(dt);

  // Player movement
  const dir = (pressed.right ? 1 : 0) - (pressed.left ? 1 : 0);
  player.x += dir * player.speed * dt;
  const margin = 20;
  player.x = clamp(player.x, player.w / 2 + margin, canvas.width - player.w / 2 - margin);

  // Difficulty scaling
  const difficulty = 1 + score / 250;

  // Spawn asteroids
  spawnTimer -= dt;
  if (spawnTimer <= 0) {
    asteroids.push(createAsteroid());
    spawnTimer = Math.max(0.45 / difficulty, 0.14);
  }

  // Update asteroids
  for (const a of asteroids) {
    a.y += a.speed * dt * difficulty;
  }
  // Remove off-screen
  asteroids = asteroids.filter(a => a.y - a.radius < canvas.height + 60);

  // Collision detection
  for (const a of asteroids) {
    if (circleRectCollide(a.x, a.y, a.radius, player)) {
      // Move asteroid off-screen and lose life
      a.y = canvas.height + 999;
      lives -= 1;
      livesLabel.textContent = lives.toString();
      if (lives <= 0) {
        endGame();
        return;
      }
    }
  }
}

function circleRectCollide(cx, cy, r, rect) {
  // rect.x, rect.y are center coordinates
  const rx = rect.x - rect.w / 2;
  const ry = rect.y - rect.h / 2;

  const closestX = clamp(cx, rx, rx + rect.w);
  const closestY = clamp(cy, ry, ry + rect.h);

  const dx = cx - closestX;
  const dy = cy - closestY;
  return dx * dx + dy * dy < r * r;
}

function endGame() {
  running = false;
  paused = false;
  saveBestScore();
  showOverlay("Game Over", `Final score: ${Math.floor(score)}.`);
}

// Drawing
function drawBackground() {
  drawStars();

  // Add a subtle vertical gradient overlay for extra depth
  const g = ctx.createLinearGradient(0, 0, 0, canvas.height);
  g.addColorStop(0, "rgba(30, 64, 175, 0.6)");
  g.addColorStop(0.4, "rgba(17, 24, 39, 0.3)");
  g.addColorStop(1, "rgba(0, 0, 0, 0.7)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawPlayer() {
  const { x, y, w, h } = player;

  ctx.save();
  ctx.translate(x, y);

  // Glow
  const glow = ctx.createRadialGradient(0, 0, 4, 0, 0, 34);
  glow.addColorStop(0, "rgba(167, 139, 250, 0.9)");
  glow.addColorStop(1, "rgba(15, 23, 42, 0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 0, 34, 0, Math.PI * 2);
  ctx.fill();

  // Ship body
  ctx.fillStyle = "#a855f7";
  ctx.beginPath();
  ctx.moveTo(0, -h / 2);
  ctx.lineTo(-w / 2, h / 2);
  ctx.lineTo(w / 2, h / 2);
  ctx.closePath();
  ctx.fill();

  // Cockpit
  ctx.fillStyle = "#e0f2fe";
  ctx.beginPath();
  ctx.arc(0, -h * 0.12, 7, 0, Math.PI * 2);
  ctx.fill();

  // Engine flame
  ctx.beginPath();
  ctx.moveTo(-w * 0.18, h / 2);
  ctx.lineTo(0, h / 2 + 12 + Math.random() * 7);
  ctx.lineTo(w * 0.18, h / 2);
  ctx.fillStyle = "#f97316";
  ctx.fill();

  ctx.restore();
}

function drawAsteroids() {
  for (const a of asteroids) {
    const grd = ctx.createRadialGradient(
      a.x - a.radius * 0.3,
      a.y - a.radius * 0.3,
      2,
      a.x,
      a.y,
      a.radius
    );
    grd.addColorStop(0, "#facc15");
    grd.addColorStop(0.4, "#fb7185");
    grd.addColorStop(1, "#7c2d12");

    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(a.x, a.y, a.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(15, 23, 42, 0.7)";
    ctx.beginPath();
    ctx.arc(a.x - a.radius * 0.3, a.y - a.radius * 0.2, a.radius * 0.25, 0, Math.PI * 2);
    ctx.arc(a.x + a.radius * 0.2, a.y + a.radius * 0.1, a.radius * 0.18, 0, Math.PI * 2);
    ctx.fill();
  }
}

function draw() {
  drawBackground();
  drawPlayer();
  drawAsteroids();
}

// Init
(function init() {
  initTheme();
  loadBestScore();
  createStars(80);
  showOverlay("Cosmic Dodger Neon", "Press Start or Space to begin.");
})();
