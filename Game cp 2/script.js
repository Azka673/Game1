import questions from './data/questions.json' assert {type: 'json'};
import missions from './data/missions.json' assert {type: 'json'};

let player = { speed: 5, stamina: 100, hunger: 100 };
let usedQuestions = [];

// Sprint system
document.addEventListener('keydown', (e) => {
  if (e.key === 'Shift') sprint();
});

function sprint() {
  if (player.stamina > 0) {
    player.speed = 8;
    player.stamina -= 1;
    updateUI();
  }
}

// Hunger system
function eatFood(item) {
  player.hunger = Math.min(100, player.hunger + item.nutrition);
  playEatAnimation();
  updateUI();
}

function playEatAnimation() {
  console.log("🍖 Eating animation plays");
}

// Quiz system
function getRandomQuestion() {
  if (usedQuestions.length >= 10) return null;
  let q;
  do {
    q = questions[Math.floor(Math.random() * questions.length)];
  } while (usedQuestions.includes(q.id));
  usedQuestions.push(q.id);
  return q;
}

// Ending system
function checkEnding(missionsDone, correctAnswers, exploration, secretFound) {
  if (secretFound && missionsDone === missions.length) {
    return "SECRET ENDING: Kamu membangun kerajaan dan menjadi raja!";
  } else if (missionsDone === missions.length && correctAnswers >= 9) {
    return "TRUE ENDING: Kamu memahami perjalanan manusia...";
  } else if (missionsDone >= missions.length/2) {
    return "GOOD ENDING: Pemahamanmu cukup, tapi masih ada yang terlewat.";
  } else {
    return "BAD ENDING: Kamu mundur ke zaman arkeozoikum...";
  }
}

function updateUI() {
  document.querySelector('.stamina-fill').style.width = player.stamina + "%";
  document.querySelector('.hunger-fill').style.width = player.hunger + "%";
}
