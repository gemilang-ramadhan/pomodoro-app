// DOM Elements
const startPauseButton = document.getElementById("startPause");
const resetButton = document.getElementById("reset");
const timerDisplay = document.getElementById("timer");
const sessionDisplay = document.getElementById("session");
const progressCircle = document.getElementById("progress");

const pomodoroInput = document.getElementById("pomodoro");
const breakInput = document.getElementById("break");
const longBreakInput = document.getElementById("longBreak");

const sessionCountDisplay = document.getElementById("sessionCount");
const sessionHistory = document.getElementById("sessionHistory");

const themeToggle = document.getElementById("themeToggle");
const muteToggle = document.getElementById("muteToggle");
const infoButton = document.getElementById("infoButton");
const infoModal = document.getElementById("infoModal");
const closeModal = document.getElementById("closeModal");
const modalContent = document.getElementById("modalContent");

// To-Do List Elements
const newTaskInput = document.getElementById("newTaskInput");
const addTaskButton = document.getElementById("addTaskButton");
const taskList = document.getElementById("taskList");

// State Variables
let isRunning = false;
let isWorkSession = true;
let timer;
let totalTime;
let timeLeft;

let pomodoroDuration = parseInt(pomodoroInput.value) * 60; // in seconds
let breakDuration = parseInt(breakInput.value) * 60; // in seconds
let longBreakDuration = parseInt(longBreakInput.value) * 60; // in seconds

let sessionCount = 0; // number of completed work sessions
let cycleCount = 0; // tracks how many work sessions have happened consecutively

let isMuted = false;

// Sound Effects
const workEndSound = new Audio("https://www.soundjay.com/buttons/sounds/button-3.mp3");
const breakEndSound = new Audio("https://www.soundjay.com/buttons/sounds/button-10.mp3");

// Load Settings from localStorage
function loadSettings() {
    const storedPomodoro = localStorage.getItem("pomodoroDuration");
    const storedBreak = localStorage.getItem("breakDuration");
    const storedLongBreak = localStorage.getItem("longBreakDuration");
    const storedTheme = localStorage.getItem("theme");
    const storedSessionCount = localStorage.getItem("sessionCount");
    const storedCycleCount = localStorage.getItem("cycleCount");
    const storedSessionHistory = localStorage.getItem("sessionHistory");
    const storedMuteState = localStorage.getItem("isMuted");
    const storedTasks = localStorage.getItem("tasks");

    if (storedPomodoro) {
        pomodoroDuration = parseInt(storedPomodoro);
        pomodoroInput.value = pomodoroDuration / 60;
    }
    if (storedBreak) {
        breakDuration = parseInt(storedBreak);
        breakInput.value = breakDuration / 60;
    }
    if (storedLongBreak) {
        longBreakDuration = parseInt(storedLongBreak);
        longBreakInput.value = longBreakDuration / 60;
    }

    if (storedTheme === "dark") {
        document.documentElement.classList.add("dark");
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        document.documentElement.classList.remove("dark");
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    }

    if (storedSessionCount) {
        sessionCount = parseInt(storedSessionCount);
        sessionCountDisplay.textContent = sessionCount;
    }
    if (storedCycleCount) {
        cycleCount = parseInt(storedCycleCount);
    }
    if (storedSessionHistory) {
        sessionHistory.innerHTML = storedSessionHistory;
    }
    if (storedMuteState) {
        isMuted = storedMuteState === "true";
        updateMuteButton();
    }

    if (storedTasks) {
        const tasks = JSON.parse(storedTasks);
        tasks.forEach((task) => addTaskToDOM(task.text, task.id, task.completed));
    }
}

// Save Settings to localStorage
function saveSettings() {
    localStorage.setItem("pomodoroDuration", pomodoroDuration);
    localStorage.setItem("breakDuration", breakDuration);
    localStorage.setItem("longBreakDuration", longBreakDuration);
    localStorage.setItem("sessionCount", sessionCount);
    localStorage.setItem("cycleCount", cycleCount);
    localStorage.setItem("sessionHistory", sessionHistory.innerHTML);
    localStorage.setItem("isMuted", isMuted);
}

// Inputs: Update durations when changed via buttons

// Pomodoro
document.getElementById("increasePomodoro").addEventListener("click", () => {
    if (parseInt(pomodoroInput.value) < 60) {
        pomodoroInput.value = parseInt(pomodoroInput.value) + 1;
        pomodoroDuration = parseInt(pomodoroInput.value) * 60;
        localStorage.setItem("pomodoroDuration", pomodoroDuration);
        if (isWorkSession) {
            resetTimer();
        }
    }
});

document.getElementById("decreasePomodoro").addEventListener("click", () => {
    if (parseInt(pomodoroInput.value) > 1) {
        pomodoroInput.value = parseInt(pomodoroInput.value) - 1;
        pomodoroDuration = parseInt(pomodoroInput.value) * 60;
        localStorage.setItem("pomodoroDuration", pomodoroDuration);
        if (isWorkSession) {
            resetTimer();
        }
    }
});

// Break
document.getElementById("increaseBreak").addEventListener("click", () => {
    if (parseInt(breakInput.value) < 30) {
        breakInput.value = parseInt(breakInput.value) + 1;
        breakDuration = parseInt(breakInput.value) * 60;
        localStorage.setItem("breakDuration", breakDuration);
        if (!isWorkSession) {
            resetTimer();
        }
    }
});

document.getElementById("decreaseBreak").addEventListener("click", () => {
    if (parseInt(breakInput.value) > 1) {
        breakInput.value = parseInt(breakInput.value) - 1;
        breakDuration = parseInt(breakInput.value) * 60;
        localStorage.setItem("breakDuration", breakDuration);
        if (!isWorkSession) {
            resetTimer();
        }
    }
});

// Long Break
document.getElementById("increaseLongBreak").addEventListener("click", () => {
    if (parseInt(longBreakInput.value) < 60) {
        longBreakInput.value = parseInt(longBreakInput.value) + 1;
        longBreakDuration = parseInt(longBreakInput.value) * 60;
        localStorage.setItem("longBreakDuration", longBreakDuration);
    }
});

document.getElementById("decreaseLongBreak").addEventListener("click", () => {
    if (parseInt(longBreakInput.value) > 1) {
        longBreakInput.value = parseInt(longBreakInput.value) - 1;
        longBreakDuration = parseInt(longBreakInput.value) * 60;
        localStorage.setItem("longBreakDuration", longBreakDuration);
    }
});

// Buttons: Start/Pause, Reset
startPauseButton.addEventListener("click", () => {
    if (isRunning) {
        pauseTimer();
    } else {
        startTimer();
    }
});

resetButton.addEventListener("click", resetTimer);

// Timer Functions
function startTimer() {
    if (!isRunning) {
        isRunning = true;
        startPauseButton.innerHTML = '<i class="fas fa-pause mr-2"></i><span>Pause</span>';
        timer = setInterval(countdown, 1000);
    }
}

function pauseTimer() {
    if (isRunning) {
        isRunning = false;
        startPauseButton.innerHTML = '<i class="fas fa-play mr-2"></i><span>Start</span>';
        clearInterval(timer);
    }
}

function resetTimer() {
    pauseTimer();
    isWorkSession = true;
    sessionDisplay.textContent = "Work";
    totalTime = pomodoroDuration;
    timeLeft = totalTime;
    updateDisplay();
    updateProgress();
}

function countdown() {
    if (timeLeft > 0) {
        timeLeft--;
        updateDisplay();
        updateProgress();
    } else {
        clearInterval(timer);
        isRunning = false;
        startPauseButton.innerHTML = '<i class="fas fa-play mr-2"></i><span>Start</span>';
        switchSession();
        notify();
    }
}

function switchSession() {
    if (isWorkSession) {
        // Work session just ended
        sessionCount++;
        cycleCount++;
        sessionCountDisplay.textContent = sessionCount;
        addSessionToHistory("Work");
        saveSettings();
        if (!isMuted) playSound(workEndSound);

        // Check if it's time for a long break
        if (cycleCount % 4 === 0) {
            // Long Break
            isWorkSession = false;
            sessionDisplay.textContent = "Long Break";
            totalTime = longBreakDuration;
        } else {
            // Short Break
            isWorkSession = false;
            sessionDisplay.textContent = "Break";
            totalTime = breakDuration;
        }
    } else {
        // Break session just ended
        if (!isMuted) playSound(breakEndSound);
        isWorkSession = true;
        sessionDisplay.textContent = "Work";
        totalTime = pomodoroDuration;
    }

    timeLeft = totalTime;
    updateDisplay();
    updateProgress();
    startTimer();
}

function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

    // Update progress circle color based on session type
    if (isWorkSession) {
        progressCircle.setAttribute("stroke", "url(#gradient)");
    } else if (sessionDisplay.textContent === "Break") {
        progressCircle.setAttribute("stroke", "#F59E0B"); // Amber
    } else if (sessionDisplay.textContent === "Long Break") {
        progressCircle.setAttribute("stroke", "#10B981"); // Green
    }
}

function updateProgress() {
    const percent = (timeLeft / totalTime) * 100;
    const offset = 565 * (1 - percent / 100);
    progressCircle.style.strokeDasharray = `565`;
    progressCircle.style.strokeDashoffset = offset;
}

// Notifications
function notify() {
    if (Notification.permission === "granted") {
        new Notification(isWorkSession ? "Break Time!" : "Work Time!", {
            body: isWorkSession ? "Time to take a break." : "Time to focus!",
            icon: "assets/tomato.png",
        });
    }
}

// Sound
function playSound(sound) {
    sound.currentTime = 0;
    sound.play();
}

// Theme Toggle Button
themeToggle.addEventListener("click", () => {
    document.documentElement.classList.toggle("dark");
    if (document.documentElement.classList.contains("dark")) {
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        localStorage.setItem("theme", "dark");
    } else {
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        localStorage.setItem("theme", "light");
    }
});

// Mute/Unmute Button
muteToggle.addEventListener("click", () => {
    isMuted = !isMuted;
    updateMuteButton();
    localStorage.setItem("isMuted", isMuted);
});

function updateMuteButton() {
    if (isMuted) {
        muteToggle.innerHTML = '<i class="fas fa-volume-mute"></i>';
    } else {
        muteToggle.innerHTML = '<i class="fas fa-volume-up"></i>';
    }
}

// Session History
function addSessionToHistory(sessionType) {
    const li = document.createElement("li");
    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    li.className = "text-gray-700 dark:text-gray-200 mb-1";
    li.textContent = `${timestamp}: Completed a ${sessionType} session.`;
    sessionHistory.prepend(li);

    // Limit history to last 10 sessions
    if (sessionHistory.children.length > 10) {
        sessionHistory.removeChild(sessionHistory.lastChild);
    }
}

// Info Modal (Open/Close with fade animations)
infoButton.addEventListener("click", () => {
    // Show modal
    infoModal.classList.remove("hidden");
    infoModal.classList.add("flex");

    // Animate modal content in
    modalContent.classList.remove("animate-fadeOut");
    modalContent.classList.add("animate-fadeIn");
});

closeModal.addEventListener("click", closeInfoModal);

window.addEventListener("click", (e) => {
    if (e.target === infoModal) {
        closeInfoModal();
    }
});

function closeInfoModal() {
    // Animate modal content out
    modalContent.classList.remove("animate-fadeIn");
    modalContent.classList.add("animate-fadeOut");

    // Wait for fade-out animation to finish, then hide
    setTimeout(() => {
        infoModal.classList.remove("flex");
        infoModal.classList.add("hidden");
    }, 300); // match the animation duration
}

// To-Do List Functions
// Add Task
addTaskButton.addEventListener("click", addTask);
newTaskInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        addTask();
    }
});

function addTask() {
    const taskText = newTaskInput.value.trim();
    if (taskText === "") return;

    const taskId = Date.now();
    addTaskToDOM(taskText, taskId, false);
    saveTasksToLocalStorage();
    newTaskInput.value = "";
}

function addTaskToDOM(text, id, completed) {
    const li = document.createElement("li");
    li.className = "flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-3 rounded-md mb-2";
    li.setAttribute("data-id", id);

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = completed;
    checkbox.className = "mr-2";

    const span = document.createElement("span");
    span.textContent = text;
    span.className = completed ? "line-through text-gray-500 dark:text-gray-400 flex-1" : "flex-1 text-gray-700 dark:text-gray-200";

    const editButton = document.createElement("button");
    editButton.className = "text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-600 focus:outline-none mr-2";
    editButton.innerHTML = '<i class="fas fa-edit"></i>';
    editButton.addEventListener("click", () => editTask(id));

    const deleteButton = document.createElement("button");
    deleteButton.className = "text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-600 focus:outline-none";
    deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
    deleteButton.addEventListener("click", () => deleteTask(id));

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(editButton);
    li.appendChild(deleteButton);

    taskList.appendChild(li);
}

// Edit Task
function editTask(id) {
    const li = document.querySelector(`li[data-id="${id}"]`);
    const span = li.querySelector("span");
    const currentText = span.textContent;
    const input = document.createElement("input");
    input.type = "text";
    input.value = currentText;
    input.className = "flex-1 p-1 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none dark:bg-gray-700 dark:text-white";
    li.insertBefore(input, span);
    li.removeChild(span);

    const editButton = li.querySelector(".fa-edit").parentElement;
    editButton.innerHTML = '<i class="fas fa-save"></i>';
    // Remove existing click listener
    editButton.replaceWith(editButton.cloneNode(true));
    const newEditButton = li.querySelector(".fa-save").parentElement;
    newEditButton.addEventListener("click", () => saveTask(id, input.value));
}

function saveTask(id, newText) {
    if (newText.trim() === "") return;

    const li = document.querySelector(`li[data-id="${id}"]`);
    const input = li.querySelector("input[type='text']");
    const span = document.createElement("span");
    span.textContent = newText;
    span.className = "flex-1 text-gray-700 dark:text-gray-200";

    li.insertBefore(span, input);
    li.removeChild(input);

    const editButton = li.querySelector(".fa-save").parentElement;
    editButton.innerHTML = '<i class="fas fa-edit"></i>';
    // Remove existing click listener
    editButton.replaceWith(editButton.cloneNode(true));
    const newEditButton = li.querySelector(".fa-edit").parentElement;
    newEditButton.addEventListener("click", () => editTask(id));

    saveTasksToLocalStorage();
}

// Delete Task
function deleteTask(id) {
    const li = document.querySelector(`li[data-id="${id}"]`);
    if (li) {
        li.remove();
        saveTasksToLocalStorage();
    }
}

// Toggle Task Completion
taskList.addEventListener("change", (e) => {
    if (e.target.matches("input[type='checkbox']")) {
        const li = e.target.closest("li");
        const span = li.querySelector("span");
        if (e.target.checked) {
            span.classList.add("line-through", "text-gray-500", "dark:text-gray-400");
        } else {
            span.classList.remove("line-through", "text-gray-500", "dark:text-gray-400");
        }
        saveTasksToLocalStorage();
    }
});

// Save Tasks to localStorage
function saveTasksToLocalStorage() {
    const tasks = [];
    taskList.querySelectorAll("li").forEach((li) => {
        const id = li.getAttribute("data-id");
        const text = li.querySelector("span") ? li.querySelector("span").textContent : li.querySelector("input[type='text']").value;
        const completed = li.querySelector("input[type='checkbox']").checked;
        tasks.push({ id, text, completed });
    });
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Initialize SortableJS for Drag-and-Drop
new Sortable(taskList, {
    animation: 150,
    ghostClass: "bg-gray-200 dark:bg-gray-600",
    onEnd: function () {
        saveTasksToLocalStorage();
    },
});

// Initialization
function init() {
    loadSettings();

    // Set initial time
    totalTime = pomodoroDuration;
    timeLeft = totalTime;
    updateDisplay();
    updateProgress();

    // Update mute button state
    updateMuteButton();

    // Request notification permission
    if (Notification.permission !== "granted" && Notification.permission !== "denied") {
        Notification.requestPermission();
    }
}

init();
