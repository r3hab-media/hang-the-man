let selectedWord = "";
let remainingGuesses = 6;
let guessingWord = [];

document.addEventListener("DOMContentLoaded", () => {
	fetchRandomWord(); // Fetch a random word when the document loads
	setupLetters(); // Initialize letter buttons
	displayWordHistory();
});

function displayWord() {
	document.getElementById("wordToGuess").textContent = guessingWord.join(" ");
}

function updateRemainingGuesses() {
	document.getElementById("remainingGuesses").textContent = remainingGuesses;
}

function handleGuess(letter) {
	const button = document.getElementById(`btn_${letter}`);
	button.disabled = true;
	button.setAttribute("aria-disabled", "true");
	button.classList.add("used");

	if (selectedWord.includes(letter)) {
		selectedWord.split("").forEach((char, index) => {
			if (char === letter) {
				guessingWord[index] = char;
			}
		});
	} else {
		remainingGuesses--;
	}
	updateRemainingGuesses();
	displayWord();
	checkGameEnd();
}

function checkGameEnd() {
	if (!guessingWord.includes("_")) {
		document.getElementById("message").textContent = "Congratulations! You won!";
		saveWordHistory(selectedWord, true); // true for a win
		displayWordHistory();
		setTimeout(fetchRandomWord, 3000); // Fetch a new word after 3 seconds, also after a win
	} else if (remainingGuesses <= 0) {
		document.getElementById("message").textContent = "Game Over! Try again!";
		saveWordHistory(selectedWord, false); // false for a loss
		displayWordHistory();
		guessingWord = selectedWord.split("");
		displayWord();
		setTimeout(fetchRandomWord, 3000); // Fetch a new word after 3 seconds, also after a loss
	}
}

function saveWordHistory(word, won) {
	let wordHistory = JSON.parse(localStorage.getItem("wordHistory")) || [];
	wordHistory.push({ word: word, won: won });
	localStorage.setItem("wordHistory", JSON.stringify(wordHistory));
}

function displayWordHistory() {
	const wordHistory = JSON.parse(localStorage.getItem("wordHistory")) || [];
	const historyElement = document.getElementById("wordHistory");
	const clearHistoryButton = document.getElementById("clearHistoryButton");
	const historyMessage = document.getElementById("historyMessage");

	historyElement.innerHTML = "";

	if (wordHistory.length > 0) {
		clearHistoryButton.style.display = "block"; // Show the button if there is history
		historyMessage.style.display = "block"; // Show the history message

		// Create a single string from all history entries, coloring each word accordingly.
		let historyContent = wordHistory
			.map((entry, index) => {
				const color = entry.won ? "green" : "red";
				return `<a style="color: ${color};" href="https://www.merriam-webster.com/dictionary/${encodeURIComponent(
					entry.word
				)}" target="_blank" rel="noopener noreferrer">${entry.word}</a>${index < wordHistory.length - 1 ? ", " : " "}`;
			})
			.join("");

		historyElement.innerHTML = historyContent;
	} else {
		clearHistoryButton.style.display = "none"; // Hide the button if there is no history
		historyMessage.style.display = "none"; // Also hide the history message
	}
}

function clearHistory() {
	localStorage.removeItem("wordHistory");
	displayWordHistory(); // Update the display
}

function setupLetters() {
	const lettersContainer = document.getElementById("letters");
	lettersContainer.innerHTML = ""; // Clear previous letters
	"abcdefghijklmnopqrstuvwxyz".split("").forEach((letter) => {
		const button = document.createElement("button");
		button.textContent = letter;
		button.id = `btn_${letter}`;
		button.classList.add("btn", "btn-outline-primary");
		button.onclick = () => handleGuess(letter);
		button.setAttribute("aria-label", `Guess the letter ${letter}`);
		lettersContainer.appendChild(button);
	});
}

async function fetchRandomWord() {
	try {
		const response = await fetch("https://random-word-api.herokuapp.com/word?number=1");
		const wordArray = await response.json();
		selectedWord = wordArray[0]; // Assume we get exactly one word

		// Log the selected word to the console for testing purposes
		console.log("Selected word:", selectedWord);

		guessingWord = Array(selectedWord.length).fill("_");
		remainingGuesses = 6;
		document.querySelectorAll("#letters button").forEach((button) => {
			button.disabled = false;
			button.classList.remove("used");
		});
		displayWord();
		updateRemainingGuesses();
		document.getElementById("message").textContent = "";
	} catch (error) {
		console.error("Fetch error:", error);
		document.getElementById("message").textContent = "Failed to fetch word, check your connection.";
	}
}
