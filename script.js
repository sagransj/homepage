const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
const arena = document.getElementById("arena");
const startScreen = document.getElementById("start-screen");
const endScreen = document.getElementById("end-screen");
const startButton = document.getElementById("start-button");
const restartButton = document.getElementById("restart-button");
const crosshair = document.getElementById("crosshair");
const scoreElement = document.getElementById("score");
const timeElement = document.getElementById("time");
const finalScoreElement = document.getElementById("final-score");

const GAME_LENGTH = 30;
let width = 0;
let height = 0;
let score = 0;
let timeLeft = GAME_LENGTH;
let playing = false;
let lastFrame = 0;
let spawnTimer = 0;
let targets = [];
let particles = [];
let crossX = 0;
let crossY = 0;

function resizeCanvas() {
  const rect = arena.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  width = rect.width;
  height = rect.height;
  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function formatScore(value) {
  return String(value).padStart(3, "0");
}

function drawBackground(time) {
  ctx.clearRect(0, 0, width, height);

  const sky = ctx.createLinearGradient(0, 0, 0, height);
  sky.addColorStop(0, "#c8d2aa");
  sky.addColorStop(1, "#91a77d");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "rgba(232, 236, 189, 0.9)";
  ctx.beginPath();
  ctx.arc(width * 0.78, height * 0.18, Math.min(width, height) * 0.075, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#7d9872";
  ctx.beginPath();
  ctx.moveTo(0, height * 0.62);
  ctx.lineTo(width * 0.14, height * 0.45);
  ctx.lineTo(width * 0.29, height * 0.58);
  ctx.lineTo(width * 0.46, height * 0.38);
  ctx.lineTo(width * 0.64, height * 0.56);
  ctx.lineTo(width * 0.82, height * 0.42);
  ctx.lineTo(width, height * 0.58);
  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#607d63";
  ctx.beginPath();
  ctx.moveTo(0, height * 0.76);
  ctx.lineTo(width * 0.19, height * 0.61);
  ctx.lineTo(width * 0.37, height * 0.73);
  ctx.lineTo(width * 0.56, height * 0.54);
  ctx.lineTo(width * 0.72, height * 0.68);
  ctx.lineTo(width * 0.89, height * 0.57);
  ctx.lineTo(width, height * 0.65);
  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "rgba(22, 54, 47, 0.08)";
  ctx.lineWidth = 1;
  for (let x = 0; x < width; x += 42) {
    ctx.beginPath();
    ctx.moveTo(x, height);
    ctx.lineTo(x + (Math.sin(time * 0.0002 + x) * 12), height * 0.68);
    ctx.stroke();
  }
}

function spawnTarget() {
  const radius = 24 + Math.random() * 18;
  targets.push({
    x: radius + Math.random() * (width - radius * 2),
    y: height * 0.25 + Math.random() * (height * 0.58),
    radius,
    age: 0,
    lifetime: 1.45 + Math.random() * 1.2,
  });
}

function drawTarget(target) {
  const pulse = 1 + Math.sin(target.age * 7) * 0.035;
  ctx.save();
  ctx.translate(target.x, target.y);
  ctx.scale(pulse, pulse);

  ctx.fillStyle = "#f8f1d8";
  ctx.beginPath();
  ctx.arc(0, 0, target.radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#c96f50";
  ctx.beginPath();
  ctx.arc(0, 0, target.radius * 0.68, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#f8f1d8";
  ctx.beginPath();
  ctx.arc(0, 0, target.radius * 0.36, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#16362f";
  ctx.beginPath();
  ctx.arc(0, 0, target.radius * 0.13, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function burst(x, y) {
  for (let i = 0; i < 12; i++) {
    const angle = (Math.PI * 2 * i) / 12;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * (2 + Math.random() * 3),
      vy: Math.sin(angle) * (2 + Math.random() * 3),
      life: 1,
    });
  }
}

function updateParticles(delta) {
  particles = particles.filter((particle) => particle.life > 0);
  particles.forEach((particle) => {
    particle.x += particle.vx * delta * 60;
    particle.y += particle.vy * delta * 60;
    particle.vy += 0.08 * delta * 60;
    particle.life -= delta * 2;
    ctx.fillStyle = `rgba(219, 231, 167, ${particle.life})`;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
    ctx.fill();
  });
}

function gameLoop(time) {
  if (!lastFrame) lastFrame = time;
  const delta = Math.min((time - lastFrame) / 1000, 0.05);
  lastFrame = time;

  drawBackground(time);

  if (playing) {
    spawnTimer -= delta;
    if (spawnTimer <= 0) {
      spawnTarget();
      spawnTimer = Math.max(0.28, 0.72 - (GAME_LENGTH - timeLeft) * 0.012);
    }

    targets.forEach((target) => {
      target.age += delta;
      drawTarget(target);
    });
    targets = targets.filter((target) => target.age < target.lifetime);
  } else {
    targets.forEach(drawTarget);
  }

  updateParticles(delta);

  if (playing) requestAnimationFrame(gameLoop);
}

function startGame() {
  score = 0;
  timeLeft = GAME_LENGTH;
  targets = [];
  particles = [];
  spawnTimer = 0;
  playing = true;
  scoreElement.textContent = "000";
  timeElement.textContent = String(GAME_LENGTH);
  startScreen.hidden = true;
  endScreen.hidden = true;
  crosshair.classList.add("visible");
  lastFrame = 0;

  const timer = window.setInterval(() => {
    timeLeft -= 1;
    timeElement.textContent = String(timeLeft).padStart(2, "0");
    if (timeLeft <= 0) {
      window.clearInterval(timer);
      endGame();
    }
  }, 1000);

  requestAnimationFrame(gameLoop);
}

function endGame() {
  playing = false;
  crosshair.classList.remove("visible");
  finalScoreElement.textContent = formatScore(score);
  endScreen.hidden = false;
}

function setCrosshair(event) {
  const rect = arena.getBoundingClientRect();
  crossX = event.clientX - rect.left;
  crossY = event.clientY - rect.top;
  crosshair.style.left = `${crossX}px`;
  crosshair.style.top = `${crossY}px`;
  crosshair.classList.add("visible");
}

arena.addEventListener("pointermove", setCrosshair);

arena.addEventListener("pointerdown", (event) => {
  if (!playing) return;
  setCrosshair(event);

  let hitIndex = -1;
  let closestDistance = Infinity;
  targets.forEach((target, index) => {
    const distance = Math.hypot(crossX - target.x, crossY - target.y);
    if (distance <= target.radius && distance < closestDistance) {
      hitIndex = index;
      closestDistance = distance;
    }
  });

  if (hitIndex >= 0) {
    const target = targets[hitIndex];
    score += 10;
    scoreElement.textContent = formatScore(score);
    burst(target.x, target.y);
    targets.splice(hitIndex, 1);
  } else {
    burst(crossX, crossY);
  }
});

startButton.addEventListener("click", startGame);
restartButton.addEventListener("click", startGame);

window.addEventListener("resize", resizeCanvas);
resizeCanvas();
drawBackground(0);
