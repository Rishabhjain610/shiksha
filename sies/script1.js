let timer;
let timeLeft = 60; // 1 minute timer
let currentQuestionIndex = 0;
let score = 0;
let answers = []; // To store user's answers

const questions = [
    {
        question: "What is the capital of France?",
        options: ["Berlin", "Madrid", "Paris", "Rome"],
        answer: 2
    },
    {
        question: "Which planet is known as the Red Planet?",
        options: ["Earth", "Mars", "Jupiter", "Saturn"],
        answer: 1
    },
    {
        question: "What is the largest ocean on Earth?",
        options: ["Atlantic", "Indian", "Arctic", "Pacific"],
        answer: 3
    }
];

// Function to shuffle arrays (questions and options)
function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
}

// Shuffle the questions and options
shuffleArray(questions);
questions.forEach(q => shuffleArray(q.options));

// Prevent right-click and text selection
document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    endTest("Right-click is disabled. Test has been ended.");
});
document.body.style.userSelect = "none";

// Disable copying, pasting, and selecting all text
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'a')) {
        e.preventDefault();
        endTest("Keyboard shortcuts are disabled. Test has been ended.");
    }
});

// Prevent switching tabs
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        endTest("Tab switch detected. Test has been ended.");
    }
});

// Limit the window size to prevent cheating
window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    if (width < 800 || height < 600) {
        endTest("Window size too small. Test has been ended.");
    }
});

// Function to start the camera
async function startCamera() {
    try {
        // Get the user's media (video and audio)
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        // Set the video element's source to the stream
        const localVideo = document.getElementById('localVideo');
        localVideo.srcObject = stream;
    } catch (err) {
        console.error('Error accessing media devices.', err);
    }
}

// Automatically start the camera when the page loads
window.onload = () => {
    startCamera();
    startTimer();
    showQuestion();
};

function startTimer() {
    timer = setInterval(() => {
        if (timeLeft <= 0) {
            clearInterval(timer);
            alert("Time's up!");
            endQuiz();
        } else {
            let minutes = Math.floor(timeLeft / 60);
            let seconds = timeLeft % 60;
            document.getElementById('timer').textContent = `Time Left: ${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
            timeLeft--;
        }
    }, 1000);
}

function showQuestion() {
    const question = questions[currentQuestionIndex];
    let optionsHTML = '';
    question.options.forEach((option, index) => {
        optionsHTML += `<label><input type="radio" name="answer" value="${index}"> ${option}</label><br>`;
    });

    document.getElementById('question-container').innerHTML = `
    <p>${question.question}</p>
    ${optionsHTML}
  `;
}

function nextQuestion() {
    const selectedAnswer = document.querySelector('input[name="answer"]:checked');
    if (selectedAnswer) {
        answers.push({
            question: questions[currentQuestionIndex].question,
            userAnswer: parseInt(selectedAnswer.value),
            correctAnswer: questions[currentQuestionIndex].answer,
            options: questions[currentQuestionIndex].options
        });
        if (parseInt(selectedAnswer.value) === questions[currentQuestionIndex].answer) {
            score++;
        }
    }

    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        showQuestion();
    } else {
        alert("Quiz Completed!");
        endQuiz();
    }
}

function endQuiz() {
    clearInterval(timer); // Stop the timer
    const resultWindow = window.open('', '_blank', 'width=600,height=400');
    let resultHTML = `<h1>Quiz Results</h1><p>Your Score: ${score} / ${questions.length}</p><ul>`;

    answers.forEach((answer, index) => {
        const isCorrect = answer.userAnswer === answer.correctAnswer;
        resultHTML += `
      <li>
        <strong>Q${index + 1}: ${answer.question}</strong><br>
        Your Answer: ${answer.options[answer.userAnswer]}<br>
        Correct Answer: ${answer.options[answer.correctAnswer]}<br>
        <strong style="color: ${isCorrect ? 'green' : 'red'};">${isCorrect ? 'Correct' : 'Incorrect'}</strong>
      </li>`;
    });

    resultHTML += '</ul>';
    resultWindow.document.write(resultHTML);
    document.getElementById('next-button').disabled = true; // Disable the Next button after quiz is finished
}

function endTest(message) {
    clearInterval(timer); // Stop the timer
    alert(message);
    endQuiz(); // End the quiz and show results
}