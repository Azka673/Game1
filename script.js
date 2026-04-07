import questions from './data/questions.json' assert { type: 'json' };
import missions from './data/missions.json' assert { type: 'json' };

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const loadingScreen = document.getElementById('loading-screen');
const mainMenu = document.getElementById('main-menu');
const libraryMenu = document.getElementById('library-menu');
const settingsMenu = document.getElementById('settings-menu');
const tutorialMenu = document.getElementById('tutorial-menu');
const gameContainer = document.getElementById('game-container');
const dialogOverlay = document.getElementById('dialog-overlay');
const quizOverlay = document.getElementById('quiz-overlay');
const factOverlay = document.getElementById('fact-overlay');
const inventoryOverlay = document.getElementById('inventory-overlay');
const craftingOverlay = document.getElementById('crafting-overlay');
const endingOverlay = document.getElementById('ending-overlay');
const dialogText = document.getElementById('dialog-text');
const quizQuestion = document.getElementById('quiz-question');
const quizOptions = document.getElementById('quiz-options');
const factText = document.getElementById('fact-text');
const taskList = document.getElementById('task-list');
const questionCount = document.getElementById('question-count');
const inventoryCount = document.getElementById('inventory-count');
const woodCount = document.getElementById('wood-count');
const stoneCount = document.getElementById('stone-count');
const metalCount = document.getElementById('metal-count');
const foodCount = document.getElementById('food-count');
const swordStatus = document.getElementById('sword-status');
const healthFill = document.getElementById('health-fill');
const staminaFill = document.getElementById('stamina-fill');
const hungerFill = document.getElementById('hunger-fill');
const endingTitle = document.getElementById('ending-title');
const endingDialogue = document.getElementById('ending-dialogue');
const loadingTitle = document.getElementById('loading-title');
const loadingText = document.getElementById('loading-text');
const loadingProgress = document.getElementById('loading-progress');
const tutorialText = document.getElementById('tutorial-text');
const startBtn = document.getElementById('start-btn');
const libraryBtn = document.getElementById('library-btn');
const settingsBtn = document.getElementById('settings-btn');
const tutorialNext = document.getElementById('tutorial-next');
const retryBtn = document.getElementById('retry-btn');

canvas.width = 1000;
canvas.height = 600;

const input = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false,
  w: false,
  a: false,
  s: false,
  d: false,
  Shift: false,
  e: false,
  g: false,
  f: false,
};

const state = {
  phase: 'loading',
  player: {
    x: 520,
    y: 320,
    width: 28,
    height: 38,
    speed: 2.8,
    baseSpeed: 2.8,
    sprintSpeed: 6.5,
    health: 100,
    stamina: 100,
    hunger: 100,
    exploration: 0,
  },
  inventory: {
    wood: 0,
    stone: 0,
    metal: 0,
    food: 1,
    sword: false,
    tool: false,
  },
  tasks: missions.map((mission) => ({ ...mission, complete: false })),
  animals: [],
  nodes: [],
  npcs: [],
  portal: { x: 860, y: 120, size: 52, found: false },
  usedQuestionIds: [],
  answerCount: 0,
  correctCount: 0,
  currentQuestion: null,
  currentOptions: [],
  currentMission: 0,
  dialogQueue: [],
  dialogActive: false,
  quizActive: false,
  factActive: false,
  inventoryOpen: false,
  craftingOpen: false,
  ended: false,
  lastTime: 0,
  visitedAreas: new Set(),
  tasksCompleted: 0,
};

const facts = {
  1: 'Fakta: Bertani membuat manusia membangun desa dan saling bekerja sama.',
  2: 'Fakta: Bertani mengubah cara hidup karena orang bekerja bersama untuk memanen hasil.',
  3: 'Fakta: Logam mengubah manusia karena alat menjadi lebih kuat dan pekerjaan lebih cepat.',
  4: 'Fakta: Paleolitikum dikenal dengan alat batu kasar dan pola hidup berburu.',
  5: 'Fakta: Mesolitikum menunjukkan manusia mulai memilih area yang lebih stabil.',
  6: 'Fakta: Neolitikum membuat manusia mulai bertani dan menetap di desa.',
  7: 'Fakta: Perundagian menciptakan teknik baru dengan logam dan hidup lebih efisien.',
  8: 'Fakta: Berburu hewan memberi makanan dan bahan untuk alat dan pakaian.',
  9: 'Fakta: Teknologi mengubah pola hidup menjadi lebih terorganisir dan kompleks.',
 10: 'Fakta: Manusia praaksara hidup sangat bergantung pada alam sekitar mereka.',
};

const wrongAnswers = {
  1: ['Karena ingin menjadi lebih cepat berkeliling.', 'Karena ingin tinggal di kota besar.'],
  2: ['Karena membuat manusia lebih sendiri.', 'Karena menghilangkan kerja sama.'],
  3: ['Karena logam membuat manusia takut alam.', 'Karena manusia kehilangan kemampuan berkreasi.'],
  4: ['Karena manusia mulai bercocok tanam.', 'Karena manusia hidup di gedung-gedung.'],
  5: ['Karena manusia membuat mobil.', 'Karena manusia hidup di laut.'],
  6: ['Karena manusia mulai membuat roket.', 'Karena manusia hidup di gua.'],
  7: ['Karena manusia mulai makan sayur.', 'Karena manusia tidak lagi bekerja.'],
  8: ['Karena hewan membuat manusia pintar.', 'Karena hewan dipelihara di kastil.'],
  9: ['Karena manusia berhenti berkomunikasi.', 'Karena manusia kehabisan tenaga.'],
 10: ['Karena manusia tidak pernah melihat air.', 'Karena manusia tidak peduli alam.'],
};

const missionHints = {
  1: 'Pelajari lingkungan sebelum berburu. Catat tempat makanan dan air.',
  2: 'Pilih apakah kamu akan tetap di satu tempat atau berpindah mengikuti hewan.',
  3: 'Bertani berarti membangun desa. Berburu lebih bebas, tetapi pilihanmu memengaruhi akhir.',
  4: 'Gunakan logam untuk membuat alat lebih efisien dan menyelesaikan misi lebih cepat.',
};

const ui = {
  questionCount,
  inventoryCount,
  woodCount,
  stoneCount,
  metalCount,
  foodCount,
  swordStatus,
  taskList,
  healthFill,
  staminaFill,
  hungerFill,
};

function start() {
  bindEvents();
  setupWorld();
  startLoading();
}

function bindEvents() {
  document.addEventListener('keydown', handleKeyDown);
  document.addEventListener('keyup', handleKeyUp);
  startBtn.addEventListener('click', showTutorial);
  libraryBtn.addEventListener('click', () => togglePanel(libraryMenu, true));
  settingsBtn.addEventListener('click', () => togglePanel(settingsMenu, true));
  tutorialNext.addEventListener('click', beginGame);
  retryBtn.addEventListener('click', () => location.reload());
  document.querySelectorAll('.close-btn').forEach((button) => button.addEventListener('click', () => closeAllPanels()));
  document.getElementById('dialog-continue').addEventListener('click', closeDialog);
  document.getElementById('craft-sword').addEventListener('click', () => craftItem('sword'));
  document.getElementById('craft-tool').addEventListener('click', () => craftItem('tool'));
}

function startLoading() {
  const steps = [
    'Memuat dunia praaksara...',
    'Membangun peta open world...',
    'Menyiapkan NPC dan quest...',
    'Menyusun pertanyaan edukatif...',
    'Menyiapkan perjalanan waktu...',
  ];
  let index = 0;
  const interval = setInterval(() => {
    if (index >= steps.length) {
      clearInterval(interval);
      setTimeout(() => {
        loadingScreen.classList.add('hidden');
        mainMenu.classList.remove('hidden');
        state.phase = 'menu';
      }, 800);
      return;
    }
    loadingText.innerText = '';
    typeText(steps[index], loadingText, 30);
    loadingProgress.style.width = `${((index + 1) / steps.length) * 100}%`;
    index += 1;
  }, 1400);
}

function showTutorial() {
  mainMenu.classList.add('hidden');
  tutorialMenu.classList.remove('hidden');
  const intro = 'Di mana aku? Gedung-gedung hilang. Pohon dan api unggun mengelilingi. Ini bukan masa sekarang. Pelajari pola hidup, jelajahi, dan temukan jawabanmu.';
  typeText(intro, tutorialText, 28);
}

function beginGame() {
  tutorialMenu.classList.add('hidden');
  gameContainer.classList.remove('hidden');
  state.phase = 'playing';
  state.lastTime = performance.now();
  requestAnimationFrame(gameLoop);
  showDialog('Gunakan W/A/S/D untuk bergerak, Shift untuk sprint, E untuk interaksi, G untuk inventory, F untuk crafting. Cari NPC untuk misi dan jawaban quiz.');
}

function setupWorld() {
  state.nodes = [
    { x: 140, y: 130, type: 'tree', label: 'Pohon', collected: false },
    { x: 250, y: 320, type: 'stone', label: 'Batu', collected: false },
    { x: 420, y: 180, type: 'tree', label: 'Pohon', collected: false },
    { x: 620, y: 450, type: 'stone', label: 'Batu', collected: false },
    { x: 760, y: 260, type: 'metal', label: 'Logam', collected: false },
    { x: 180, y: 500, type: 'tree', label: 'Pohon', collected: false },
  ];

  state.animals = [
    { x: 320, y: 220, type: 'boar', alive: true, speed: 0.45, dir: 1 },
    { x: 570, y: 120, type: 'deer', alive: true, speed: 0.35, dir: -1 },
    { x: 760, y: 520, type: 'boar', alive: true, speed: 0.4, dir: 1 },
  ];

  state.npcs = [
    { x: 120, y: 380, name: 'Penjaga Api', message: 'Pelajari lingkungan sebelum memilih strategi berburu.', id: 1, talkCount: 0 },
    { x: 520, y: 80, name: 'Nenek Cerita', message: 'Kamu dapat bertani atau terus berburu. Pilihanmu akan memberi akhir berbeda.', id: 2, talkCount: 0 },
    { x: 880, y: 420, name: 'Pandai Besi', message: 'Logam membantu membuat alat baru. Temukan batu dan kayu untuk crafting.', id: 3, talkCount: 0 },
  ];

  updateTaskUI();
  updateInventoryUI();
}

function handleKeyDown(e) {
  if (input[e.key] !== undefined) input[e.key] = true;
  if (e.key === 'g') toggleInventory();
  if (e.key === 'f') toggleCrafting();
  if (e.key === 'e' && state.phase === 'playing' && !state.dialogActive && !state.quizActive && !state.factActive) handleInteraction();
}

function handleKeyUp(e) {
  if (input[e.key] !== undefined) input[e.key] = false;
}

function togglePanel(panel, show) {
  panel.classList.toggle('hidden', !show);
}

function closeAllPanels() {
  [libraryMenu, settingsMenu, inventoryOverlay, craftingOverlay].forEach((panel) => panel.classList.add('hidden'));
  state.inventoryOpen = false;
  state.craftingOpen = false;
}

function toggleInventory() {
  if (state.inventoryOpen) {
    inventoryOverlay.classList.add('hidden');
  } else {
    inventoryOverlay.classList.remove('hidden');
  }
  state.inventoryOpen = !state.inventoryOpen;
}

function toggleCrafting() {
  if (state.craftingOpen) {
    craftingOverlay.classList.add('hidden');
  } else {
    craftingOverlay.classList.remove('hidden');
  }
  state.craftingOpen = !state.craftingOpen;
}

function handleInteraction() {
  const playerRect = getRect(state.player);
  const nearNode = state.nodes.find((node) => !node.collected && rectIntersect(playerRect, getRect(node, 28, 28)));
  if (nearNode) {
    collectNode(nearNode);
    return;
  }

  const nearNPC = state.npcs.find((npc) => rectIntersect(playerRect, getRect(npc, 40, 40)));
  if (nearNPC) {
    interactNPC(nearNPC);
    return;
  }

  const nearAnimal = state.animals.find((animal) => animal.alive && rectIntersect(playerRect, getRect(animal, 32, 28)));
  if (nearAnimal) {
    huntAnimal(nearAnimal);
    return;
  }

  const portalRect = getRect(state.portal, state.portal.size, state.portal.size);
  if (rectIntersect(playerRect, portalRect)) {
    tryTriggerEnding();
    return;
  }

  showDialog('Tidak ada interaksi di dekatmu. Jelajahi lagi untuk menemukan pohon, batu, NPC, hewan, dan celah dimensi.');
}

function collectNode(node) {
  node.collected = true;
  if (node.type === 'tree') {
    state.inventory.wood += 2;
    openFact(`Kamu memukul pohon dan mendapatkan kayu. Kayu membantu membuat alat.`, false);
  }
  if (node.type === 'stone') {
    state.inventory.stone += 2;
    openFact(`Batu ditemukan. Batu akan digunakan untuk membuat kapak atau pedang.`, false);
  }
  if (node.type === 'metal') {
    state.inventory.metal += 1;
    openFact(`Logam langka ditemukan! Logam mengubah hidup karena alat menjadi lebih kuat.`, false);
  }
  updateInventoryUI();
}

function interactNPC(npc) {
  const mission = state.tasks.find((task) => task.id === npc.id);
  if (mission && !mission.complete) {
    mission.complete = true;
    state.tasksCompleted += 1;
    state.answerCount = state.answerCount; // no-op for clarity
    showDialog(`${npc.name}: ${npc.message} Mission ${mission.era} selesai.`);
    openQuiz();
  } else {
    showDialog(`${npc.name}: ${npc.message}`);
  }
  updateTaskUI();
}

function huntAnimal(animal) {
  if (!state.inventory.sword && !state.inventory.tool) {
    showDialog('Kamu belum punya alat. Craft pedang atau kapak dulu untuk berburu dengan aman.');
    return;
  }
  animal.alive = false;
  state.inventory.food += 1;
  state.player.hunger = Math.min(100, state.player.hunger + 18);
  openFact('Kamu berhasil berburu dan mendapatkan makanan. Makanan mengisi energi dan membantu kelangsungan hidup.', true);
  updateInventoryUI();
}

function tryTriggerEnding() {
  if (state.answerCount < 10) {
    showDialog('Lengkapi 10 soal terlebih dahulu sebelum menikmati akhir ceritamu.');
    return;
  }
  if (state.tasksCompleted < missions.length && !state.portal.found) {
    showDialog('Rahasia akhir belum terbuka. Selesaikan semua misi dan jelajahi area tersembunyi.');
    return;
  }

  state.ended = true;
  const endingType = computeEndingType();
  showEnding(endingType);
}

function computeEndingType() {
  const correct = state.correctCount;
  const done = state.tasksCompleted;
  const explored = state.player.exploration;
  const secret = state.portal.found && done === missions.length;

  if (secret && done === missions.length && state.answerCount === 10 && explored >= 3) return 'SECRET';
  if (done === missions.length && correct >= 9 && state.answerCount === 10) return 'TRUE';
  if (done >= 2 && correct >= 6 && state.answerCount === 10) return 'GOOD';
  return 'BAD';
}

function updateTaskUI() {
  ui.taskList.innerHTML = '';
  state.tasks.forEach((task) => {
    const item = document.createElement('div');
    item.className = 'task-item';
    item.innerHTML = `<strong>${task.era}</strong><br>${task.task}<br><span style="color: ${task.complete ? '#7cff7c' : '#d8d8d8'};">${task.complete ? 'Selesai' : 'Belum selesai'}</span>`;
    ui.taskList.appendChild(item);
  });
}

function updateInventoryUI() {
  ui.inventoryCount.innerText = state.inventory.wood + state.inventory.stone + state.inventory.metal + state.inventory.food;
  ui.woodCount.innerText = state.inventory.wood;
  ui.stoneCount.innerText = state.inventory.stone;
  ui.metalCount.innerText = state.inventory.metal;
  ui.foodCount.innerText = state.inventory.food;
  ui.swordStatus.innerText = state.inventory.sword ? 'Ya' : 'Tidak';
}

function updateHealthUI() {
  ui.healthFill.style.width = `${state.player.health}%`;
  ui.staminaFill.style.width = `${state.player.stamina}%`;
  ui.hungerFill.style.width = `${state.player.hunger}%`;
}

function updateUI() {
  updateInventoryUI();
  updateHealthUI();
}

function showDialog(text) {
  dialogText.innerText = '';
  dialogOverlay.classList.remove('hidden');
  state.dialogActive = true;
  typeText(text, dialogText, 28);
}

function closeDialog() {
  dialogOverlay.classList.add('hidden');
  state.dialogActive = false;
}

function openQuiz() {
  const question = chooseRandomQuestion();
  if (!question) {
    const message = 'Semua soal sudah terjawab. Kembali ke celah dimensi untuk melihat ending.';
    showDialog(message);
    return;
  }
  state.currentQuestion = question;
  state.currentOptions = createOptions(question);
  quizQuestion.innerText = question.question;
  quizOptions.innerHTML = '';
  state.currentOptions.forEach((option, index) => {
    const button = document.createElement('button');
    button.className = 'quiz-option';
    button.innerText = option.text;
    button.addEventListener('click', () => answerQuestion(option));
    quizOptions.appendChild(button);
  });
  quizOverlay.classList.remove('hidden');
  state.quizActive = true;
}

function chooseRandomQuestion() {
  const available = questions.filter((q) => !state.usedQuestionIds.includes(q.id));
  if (available.length === 0) return null;
  const chosen = available[Math.floor(Math.random() * available.length)];
  state.usedQuestionIds.push(chosen.id);
  return chosen;
}

function createOptions(question) {
  const wrong = wrongAnswers[question.id] ?? ['Coba ulangi lagi.', 'Itu bukan pilihan yang tepat.'];
  const options = [
    { text: question.answer, correct: true },
    { text: wrong[0], correct: false },
    { text: wrong[1], correct: false },
  ];
  return shuffle(options);
}

function answerQuestion(option) {
  if (!state.quizActive) return;
  state.quizActive = false;
  quizOverlay.classList.add('hidden');
  state.answerCount += 1;
  questionCount.innerText = `${state.answerCount}/10`;
  if (option.correct) {
    state.correctCount += 1;
    openFact(facts[state.currentQuestion.id], true);
  } else {
    openFact(facts[state.currentQuestion.id], false);
  }
}

function openFact(text) {
  factText.innerText = text;
  factOverlay.classList.remove('hidden');
  state.factActive = true;
  setTimeout(() => {
    factOverlay.classList.add('hidden');
    state.factActive = false;
    if (state.answerCount === 10) {
      showDialog('Kamu telah menyelesaikan semua soal! Pergilah ke celah dimensi untuk melihat endingmu.');
    }
  }, 3600);
}

function craftItem(itemName) {
  if (itemName === 'sword') {
    if (state.inventory.wood >= 4 && state.inventory.stone >= 2) {
      state.inventory.wood -= 4;
      state.inventory.stone -= 2;
      state.inventory.sword = true;
      openFact('Pedang primitif selesai dibuat. Sekarang kamu dapat berburu lebih efisien.', false);
    } else {
      showDialog('Butuh 4 kayu dan 2 batu untuk membuat pedang. Cari lagi di dunia.');
    }
  }
  if (itemName === 'tool') {
    if (state.inventory.wood >= 2 && state.inventory.stone >= 3) {
      state.inventory.wood -= 2;
      state.inventory.stone -= 3;
      state.inventory.tool = true;
      openFact('Kapak batu selesai dibuat. Kamu dapat memanen lebih banyak sumber daya.', false);
    } else {
      showDialog('Butuh 2 kayu dan 3 batu untuk membuat perlengkapan batu. Cari lagi.');
    }
  }
  updateInventoryUI();
}

function typeText(text, container, speed = 45) {
  container.innerText = '';
  let index = 0;
  const interval = setInterval(() => {
    container.innerText += text[index] || '';
    index += 1;
    if (index >= text.length) clearInterval(interval);
  }, speed);
}

function gameLoop(timestamp) {
  const delta = (timestamp - state.lastTime) / 1000;
  state.lastTime = timestamp;
  update(delta);
  render();
  if (!state.ended) requestAnimationFrame(gameLoop);
}

function update(delta) {
  if (state.phase !== 'playing') return;
  handleMovement(delta);
  updateHunger(delta);
  moveAnimals(delta);
  updateUI();
  updateHealthUI();
  trackExploration();
}

function handleMovement(delta) {
  let speed = state.player.baseSpeed;
  if (input.Shift && state.player.stamina > 0) {
    speed = state.player.sprintSpeed;
    state.player.stamina = Math.max(0, state.player.stamina - 24 * delta);
  } else {
    state.player.stamina = Math.min(100, state.player.stamina + 12 * delta);
  }

  let dx = 0;
  let dy = 0;
  if (input.w || input.ArrowUp) dy -= 1;
  if (input.s || input.ArrowDown) dy += 1;
  if (input.a || input.ArrowLeft) dx -= 1;
  if (input.d || input.ArrowRight) dx += 1;
  if (dx !== 0 && dy !== 0) {
    dx *= Math.SQRT1_2;
    dy *= Math.SQRT1_2;
  }
  state.player.x = clamp(state.player.x + dx * speed * 60 * delta, 20, canvas.width - 40);
  state.player.y = clamp(state.player.y + dy * speed * 60 * delta, 20, canvas.height - 40);
}

function updateHunger(delta) {
  state.player.hunger = Math.max(0, state.player.hunger - 5 * delta);
  if (state.player.hunger <= 0) {
    state.player.health = Math.max(0, state.player.health - 18 * delta);
    if (state.player.health === 0) triggerBadEnd();
  }
}

function triggerBadEnd() {
  state.ended = true;
  showEnding('BAD');
}

function moveAnimals(delta) {
  state.animals.forEach((animal) => {
    if (!animal.alive) return;
    animal.x += animal.speed * animal.dir * 60 * delta;
    const left = 60;
    const right = canvas.width - 60;
    if (animal.x < left || animal.x > right) animal.dir *= -1;
  });
}

function trackExploration() {
  const zoneX = Math.floor(state.player.x / 200);
  const zoneY = Math.floor(state.player.y / 150);
  const zoneKey = `${zoneX}:${zoneY}`;
  if (!state.visitedAreas.has(zoneKey)) {
    state.visitedAreas.add(zoneKey);
    state.player.exploration = state.visitedAreas.size;
  }
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();
  drawWater();
  drawNodes();
  drawAnimals();
  drawNPCs();
  drawPortal();
  drawPlayer();
  drawHudTips();
}

function drawBackground() {
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, '#10223d');
  gradient.addColorStop(1, '#04101b');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  for (let y = 0; y < canvas.height; y += 80) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
}

function drawWater() {
  ctx.fillStyle = 'rgba(40, 150, 210, 0.18)';
  ctx.fillRect(0, 0, 220, 140);
  ctx.fillStyle = 'rgba(70, 180, 255, 0.12)';
  ctx.fillRect(140, 420, 250, 120);
}

function drawNodes() {
  state.nodes.forEach((node) => {
    if (node.collected) return;
    if (node.type === 'tree') drawTree(node.x, node.y);
    if (node.type === 'stone') drawRock(node.x, node.y, '#969696');
    if (node.type === 'metal') drawRock(node.x, node.y, '#a2ffec');
  });
}

function drawTree(x, y) {
  ctx.fillStyle = '#2c6c28';
  ctx.beginPath();
  ctx.ellipse(x + 12, y + 8, 26, 30, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#5c3c1a';
  ctx.fillRect(x + 8, y + 24, 12, 18);
}

function drawRock(x, y, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x + 0, y + 20);
  ctx.lineTo(x + 15, y + 0);
  ctx.lineTo(x + 35, y + 6);
  ctx.lineTo(x + 45, y + 28);
  ctx.lineTo(x + 5, y + 34);
  ctx.fill();
}

function drawAnimals() {
  state.animals.forEach((animal) => {
    if (!animal.alive) return;
    ctx.fillStyle = animal.type === 'boar' ? '#c77c2a' : '#d8c76d';
    ctx.fillRect(animal.x, animal.y, 26, 18);
    ctx.fillStyle = '#111';
    ctx.fillRect(animal.x + 8, animal.y + 4, 10, 6);
  });
}

function drawNPCs() {
  state.npcs.forEach((npc) => {
    ctx.fillStyle = '#ffe08e';
    ctx.beginPath();
    ctx.arc(npc.x, npc.y, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#162b4a';
    ctx.fillRect(npc.x - 6, npc.y - 4, 12, 14);
  });
}

function drawPortal() {
  ctx.save();
  ctx.translate(state.portal.x + state.portal.size / 2, state.portal.y + state.portal.size / 2);
  ctx.rotate(performance.now() / 2000);
  ctx.strokeStyle = 'rgba(120, 190, 255, 0.9)';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(0, 0, 28, 0, Math.PI * 1.5);
  ctx.stroke();
  ctx.restore();
  ctx.fillStyle = 'rgba(50, 110, 250, 0.14)';
  ctx.fillRect(state.portal.x, state.portal.y, state.portal.size, state.portal.size);
}

function drawPlayer() {
  ctx.fillStyle = '#82d3ff';
  ctx.fillRect(state.player.x, state.player.y, state.player.width, state.player.height);
  if (state.inventory.sword) {
    ctx.strokeStyle = '#90e8ff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(state.player.x + 22, state.player.y + 6);
    ctx.lineTo(state.player.x + 34, state.player.y - 8);
    ctx.stroke();
  }
}

function drawHudTips() {
  if (state.portal.found) return;
  if (state.player.exploration >= 3) {
    state.portal.found = true;
    showDialog('Kamu menemukan celah dimensi! Interaksi dengan E untuk melihat akhir petualanganmu setelah menjawab semua soal.');
  }
}

function getRect(obj, width = obj.width, height = obj.height) {
  return { x: obj.x, y: obj.y, width, height };
}

function rectIntersect(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

function showEnding(type) {
  endingOverlay.classList.remove('hidden');
  const data = {
    TRUE: {
      title: 'TRUE ENDING',
      text: 'Kamu kembali ke dunia asalmu dengan pemahaman baru tentang perjalanan manusia dari bertahan hidup hingga berkembang.',
    },
    GOOD: {
      title: 'GOOD ENDING',
      text: 'Kamu berhasil mengerti banyak, tetapi masih ada pelajaran yang belum lengkap. Perjalananmu tetap berarti.',
    },
    BAD: {
      title: 'BAD ENDING',
      text: 'Kamu mundur ke zaman arkeozoikum dan berakhir tragis. Pelajaran penting: sejarah harus dipelajari dengan serius.',
    },
    SECRET: {
      title: 'SECRET ENDING',
      text: 'Kamu memilih tinggal di masa lalu, membangun kerajaan dan menjadi raja yang bijak. Petualanganmu jadi legenda.',
    },
  };
  endingTitle.innerText = data[type].title;
  endingDialogue.innerText = '';
  typeText(data[type].text, endingDialogue, 40);
}

start();
