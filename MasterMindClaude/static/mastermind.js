// static/script.js
document.addEventListener('DOMContentLoaded', function() {
    const MAX_ATTEMPTS = 5;
    let currentAttempt = 0;
    let currentGuess = Array(4).fill(null);
    let gameOver = false;
    
    const attemptsContainer = document.getElementById('attempts');
    const checkButton = document.getElementById('check-button');
    const newGameButton = document.getElementById('new-game-button');
    const messageDiv = document.getElementById('message');
    
    // Create attempt rows
    for (let i = 0; i < MAX_ATTEMPTS; i++) {
        const row = document.createElement('div');
        row.className = 'attempt-row';
        row.dataset.attempt = i;
        
        const codeSlots = document.createElement('div');
        codeSlots.className = 'code-slots';
        
        for (let j = 0; j < 4; j++) {
            const slot = document.createElement('div');
            slot.className = 'code-slot';
            slot.dataset.position = j;
            slot.dataset.attempt = i;
            setupDropZone(slot);
            setupClickToRemove(slot);
            codeSlots.appendChild(slot);
        }
        
        const feedback = document.createElement('div');
        feedback.className = 'feedback';
        
        for (let j = 0; j < 4; j++) {
            const peg = document.createElement('div');
            peg.className = 'feedback-peg';
            peg.dataset.position = j;
            feedback.appendChild(peg);
        }
        
        row.appendChild(codeSlots);
        row.appendChild(feedback);
        attemptsContainer.appendChild(row);
    }
    
    // Set up the first row as active
    activateRow(0);
    
    // Set up drag and drop for color pegs
    const colorPegs = document.querySelectorAll('.color-peg');
    colorPegs.forEach(peg => {
        // Setup drag functionality
        peg.addEventListener('dragstart', function(e) {
            e.dataTransfer.setData('color', peg.classList[1]);
        });
        
        // Setup click to place functionality
        peg.addEventListener('click', function() {
            if (gameOver) return;
            
            const color = peg.classList[1];
            const nextEmptySlot = findNextEmptySlot();
            
            if (nextEmptySlot) {
                nextEmptySlot.className = 'code-slot ' + color;
                const position = parseInt(nextEmptySlot.dataset.position);
                currentGuess[position] = color;
            }
        });
    });
    
    // Find the next empty slot in the current row
    function findNextEmptySlot() {
        for (let i = 0; i < 4; i++) {
            if (currentGuess[i] === null) {
                return document.querySelector(`.code-slot[data-attempt="${currentAttempt}"][data-position="${i}"]`);
            }
        }
        return null;
    }
    
    // Set up drop zones
    function setupDropZone(element) {
        element.addEventListener('dragover', function(e) {
            e.preventDefault();
        });
        
        element.addEventListener('drop', function(e) {
            e.preventDefault();
            if (gameOver || parseInt(element.dataset.attempt) !== currentAttempt) return;
            
            const color = e.dataTransfer.getData('color');
            element.className = 'code-slot ' + color;
            currentGuess[parseInt(element.dataset.position)] = color;
        });
    }
    
    // Setup click to remove functionality
    function setupClickToRemove(element) {
        element.addEventListener('click', function() {
            if (gameOver || parseInt(element.dataset.attempt) !== currentAttempt) return;
            
            // Only remove if the slot has a color
            if (element.classList.length > 1) {
                const position = parseInt(element.dataset.position);
                element.className = 'code-slot';
                currentGuess[position] = null;
            }
        });
    }
    
    // Check button functionality
    checkButton.addEventListener('click', function() {
        if (gameOver) return;
        if (currentGuess.includes(null)) {
            messageDiv.textContent = 'Please fill all slots!';
            return;
        }
        
        // Send guess to server for checking
        fetch('/mastermind/check_guess', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ guess: currentGuess }),
        })
        .then(response => response.json())
        .then(data => {
            displayFeedback(data.feedback);
            
            if (data.won) {
                revealSecretCode(data.secretCode);
                messageDiv.textContent = 'You won! Congratulations!';
                checkButton.style.display = "none";
                gameOver = true;
            } else if (currentAttempt === MAX_ATTEMPTS - 1) {
                // Ensure secret code is revealed when game is over
                fetch('/mastermind/get_secret_code', {
                    method: 'GET'
                })
                .then(response => response.json())
                .then(data => {
                    revealSecretCode(data.secretCode);
                    activateRow(null);
                    checkButton.style.display = "none";
                    messageDiv.textContent = 'Game over! You ran out of attempts.';
                    gameOver = true;
                });
            } else {
                currentAttempt++;
                currentGuess = Array(4).fill(null);
                activateRow(currentAttempt);
                messageDiv.textContent = '';
            }
        });
    });
    
    // New game button functionality
    newGameButton.addEventListener('click', function() {
        fetch('/mastermind/new_game', {
            method: 'POST',
        })
        .then(response => response.json())
        .then(data => {
            resetGame();
        });
    });
    
    // Display feedback on the board with position-specific feedback
    function displayFeedback(feedback) {
        const currentRow = document.querySelector(`.attempt-row[data-attempt="${currentAttempt}"]`);
        const feedbackPegs = currentRow.querySelectorAll('.feedback-peg');
        
        feedback.forEach((result, index) => {
            feedbackPegs[index].className = 'feedback-peg ' + result;
        });
    }
    
    // Reveal the secret code
    function revealSecretCode(code) {
        const secretCodePegs = document.querySelectorAll('.secret-code .code-peg');
        code.forEach((color, index) => {
            secretCodePegs[index].classList.remove('hidden');
            secretCodePegs[index].classList.add(color);
        });
    }
    
    // Activate a specific row
    function activateRow(rowIndex) {
        const rows = document.querySelectorAll('.attempt-row');
        rows.forEach(row => {
            row.style.opacity = parseInt(row.dataset.attempt) === rowIndex ? '1' : '0.6';
        });
    }
    
    // Reset the game
    function resetGame() {
        // Reset variables
        currentAttempt = 0;
        currentGuess = Array(4).fill(null);
        gameOver = false;
        messageDiv.textContent = '';
        
        // Clear the board
        const slots = document.querySelectorAll('.code-slot');
        slots.forEach(slot => {
            slot.className = 'code-slot';
        });
        
        const feedbackPegs = document.querySelectorAll('.feedback-peg');
        feedbackPegs.forEach(peg => {
            peg.className = 'feedback-peg';
        });
        
        // Hide secret code
        const secretCodePegs = document.querySelectorAll('.secret-code .code-peg');
        secretCodePegs.forEach(peg => {
            peg.className = 'code-peg hidden';
        });
        
        checkButton.style.display = "";

        // Activate first row
        activateRow(0);
    }
});