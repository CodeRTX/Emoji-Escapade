// Define the set of emoji puzzles with optional hints
let puzzles = [
  { emojis: "🎬👻🍿", answer: "Ghostbusters", hint: "Who ya gonna call?" },
  { emojis: "🚀🌌✨", answer: "Space Odyssey", hint: "A journey beyond the stars" },
  { emojis: "🦁👑🏜️", answer: "The Lion King", hint: "A royal family in Africa" },
  { emojis: "🧙‍♂️⚡👓", answer: "Harry Potter", hint: "A boy wizard" },
  { emojis: "🚢🧊💔", answer: "Titanic", hint: "A ship that sank" },
  { emojis: "🏰👸🍎", answer: "Snow White", hint: "A princess and a poisoned apple" },
  { emojis: "🌐🕸️🕷️", answer: "World Wide Web", hint: "The global network" },
  { emojis: "🎸🔥🌟", answer: "Rockstar", hint: "A famous musician" },
  // Add more puzzles as needed!
];

let currentPuzzle = null;
let score = 0;
let bestScore = localStorage.getItem('bestScore') || 0;
let timer;
let timeLeft = 30;

// Get DOM elements
const emojiDisplay = document.getElementById('emojiDisplay');
const guessInput = document.getElementById('guessInput');
const submitBtn = document.getElementById('submitBtn');
const feedbackDiv = document.getElementById('feedback');
const nextPuzzleBtn = document.getElementById('nextPuzzleBtn');
const toggleHintBtn = document.getElementById('toggleHintBtn');
const hintContainer = document.getElementById('hintContainer');
const scoreDisplay = document.getElementById('scoreDisplay');
const bestScoreDisplay = document.getElementById('bestScoreDisplay');
const resetGameBtn = document.getElementById('resetGameBtn');
const timerDisplay = document.getElementById('timerDisplay');

// Add communication with Devvit
// Inform Devvit that the web view is ready when the page loads
window.addEventListener('load', () => {
  window.parent.postMessage({ type: 'webViewReady' }, '*');
  bestScoreDisplay.textContent = "Best Score: " + bestScore;
  loadNewPuzzle();
});

// Listen for messages from Devvit
window.addEventListener('message', (event) => {
  if (event.data.type === 'devvit-message') {
    const { message } = event.data;
    console.log('Received from Devvit:', message);
    
    // If Devvit sends initial data
    if (message.type === 'initialData') {
      if (message.data && message.data.bestScore) {
        bestScore = message.data.bestScore;
        bestScoreDisplay.textContent = "Best Score: " + bestScore;
      }
    }
  }
});

// Function to load a new random puzzle
function loadNewPuzzle() {
  clearInterval(timer);
  timeLeft = 30;
  timerDisplay.textContent = `Time Left: ${timeLeft}s`;
  const randomPuzzle = puzzles[Math.floor(Math.random() * puzzles.length)];
  currentPuzzle = randomPuzzle;
  emojiDisplay.textContent = randomPuzzle.emojis;
  guessInput.value = "";
  feedbackDiv.textContent = "";
  nextPuzzleBtn.style.display = "none";
  // Show the hint button only if the puzzle has a hint
  if (randomPuzzle.hint) {
    toggleHintBtn.style.display = "inline-block";
    hintContainer.style.display = "none";
    toggleHintBtn.textContent = "Show Hint";
  } else {
    toggleHintBtn.style.display = "none";
  }
  startTimer();
}

// Function to check the user's guess
function checkAnswer() {
  const userGuess = guessInput.value.trim();
  if (!currentPuzzle) return;
  if (userGuess.toLowerCase() === currentPuzzle.answer.toLowerCase()) {
    feedbackDiv.textContent = "Correct! 🎉";
    score++;
    scoreDisplay.textContent = "Score: " + score;
    if (score > bestScore) {
      bestScore = score;
      localStorage.setItem('bestScore', bestScore);
      bestScoreDisplay.textContent = "Best Score: " + bestScore;
    }
    // Send the updated score to Devvit
      window.parent.postMessage({
        type: 'updateScore',
        data: { score: score, bestScore: bestScore }
      }, '*');
    nextPuzzleBtn.style.display = "inline-block";
    clearInterval(timer);
  } else {
    feedbackDiv.textContent = "Not quite! Give it another shot! 🤔";
  }
}

// Function to toggle the display of the hint
function toggleHint() {
  if (!currentPuzzle || !currentPuzzle.hint) return;
  if (hintContainer.style.display === "none") {
    hintContainer.textContent = "Hint: " + currentPuzzle.hint;
    hintContainer.style.display = "block";
    toggleHintBtn.textContent = "Hide Hint";
  } else {
    hintContainer.style.display = "none";
    toggleHintBtn.textContent = "Show Hint";
  }
}

// Function to reset the game
function resetGame() {
  score = 0;
  scoreDisplay.textContent = "Score: " + score;
  loadNewPuzzle();
}

// Function to start the timer
function startTimer() {
  timer = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = `Time Left: ${timeLeft}s`;
    if (timeLeft <= 0) {
      clearInterval(timer);
      feedbackDiv.textContent = "Time's up! Try the next puzzle!";
      nextPuzzleBtn.style.display = "inline-block";
    }
  }, 1000);
}

// Event listeners
submitBtn.addEventListener('click', checkAnswer);
nextPuzzleBtn.addEventListener('click', loadNewPuzzle);
toggleHintBtn.addEventListener('click', toggleHint);
resetGameBtn.addEventListener('click', resetGame);

// Load the initial puzzle when the page loads
window.onload = () => {
  bestScoreDisplay.textContent = "Best Score: " + bestScore;
  loadNewPuzzle();
};

// Optional: Allow players to submit their own puzzles
function submitCustomPuzzle(emojis, answer, hint) {
  puzzles.push({ emojis, answer, hint });

  // Notify Devvit about the new puzzle
  window.parent.postMessage({
    type: 'newPuzzle',
    data: { emojis, answer, hint }
  }, '*');

  alert("Your puzzle has been submitted!");
}

// Example of how players might submit a puzzle
// submitCustomPuzzle("🐶🏠🌆", "Home Alone", "A classic holiday movie");
