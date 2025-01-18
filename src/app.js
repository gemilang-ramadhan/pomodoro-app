// DOM Elements
const startPauseButton = document.getElementById("startPause");
const resetButton = document.getElementById("reset");
const timerDisplay = document.getElementById("timer");
const sessionDisplay = document.getElementById("session");
const progressCircle = document.getElementById("progress");

const pomodoroInput = document.getElementById("pomodoro");
const breakInput = document.getElementById("break");
const longBreakInput = document.getElementById("longBreak");

const pomodoroMobile = document.getElementById("pomodoroMobile");
const breakMobile = document.getElementById("breakMobile");
const longBreakMobile = document.getElementById("longBreakMobile");

const sessionCountDisplay = document.getElementById("sessionCount");
const sessionHistory = document.getElementById("sessionHistory");
const clearHistoryButton = document.getElementById("clearHistoryButton");

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

/* =============================
   Load Settings from localStorage
   ============================= */
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
        pomodoroMobile.value = pomodoroInput.value;
    }
    if (storedBreak) {
        breakDuration = parseInt(storedBreak);
        breakInput.value = breakDuration / 60;
        breakMobile.value = breakInput.value;
    }
    if (storedLongBreak) {
        longBreakDuration = parseInt(storedLongBreak);
        longBreakInput.value = longBreakDuration / 60;
        longBreakMobile.value = longBreakInput.value;
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

/* =============================
   Save Settings to localStorage
   ============================= */
function saveSettings() {
    localStorage.setItem("pomodoroDuration", pomodoroDuration);
    localStorage.setItem("breakDuration", breakDuration);
    localStorage.setItem("longBreakDuration", longBreakDuration);
    localStorage.setItem("sessionCount", sessionCount);
    localStorage.setItem("cycleCount", cycleCount);
    localStorage.setItem("sessionHistory", sessionHistory.innerHTML);
    localStorage.setItem("isMuted", isMuted);
}

/* =============================
   +/- Buttons for desktop
   ============================= */
// Pomodoro
document.getElementById("increasePomodoro").addEventListener("click", () => {
    if (parseInt(pomodoroInput.value) < 60) {
        pomodoroInput.value = parseInt(pomodoroInput.value) + 1;
        pomodoroDuration = parseInt(pomodoroInput.value) * 60;
        pomodoroMobile.value = pomodoroInput.value;
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
        pomodoroMobile.value = pomodoroInput.value;
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
        breakMobile.value = breakInput.value;
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
        breakMobile.value = breakInput.value;
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
        longBreakMobile.value = longBreakInput.value;
        localStorage.setItem("longBreakDuration", longBreakDuration);
    }
});
document.getElementById("decreaseLongBreak").addEventListener("click", () => {
    if (parseInt(longBreakInput.value) > 1) {
        longBreakInput.value = parseInt(longBreakInput.value) - 1;
        longBreakDuration = parseInt(longBreakInput.value) * 60;
        longBreakMobile.value = longBreakInput.value;
        localStorage.setItem("longBreakDuration", longBreakDuration);
    }
});

/* =============================
   Mobile numeric inputs
   ============================= */
pomodoroMobile.addEventListener("input", () => {
    let val = parseInt(pomodoroMobile.value);
    if (isNaN(val) || val < 1) val = 1;
    if (val > 60) val = 60;

    pomodoroMobile.value = val;
    pomodoroInput.value = val;
    pomodoroDuration = val * 60;
    localStorage.setItem("pomodoroDuration", pomodoroDuration);

    if (isWorkSession) {
        resetTimer();
    }
});

breakMobile.addEventListener("input", () => {
    let val = parseInt(breakMobile.value);
    if (isNaN(val) || val < 1) val = 1;
    if (val > 30) val = 30;

    breakMobile.value = val;
    breakInput.value = val;
    breakDuration = val * 60;
    localStorage.setItem("breakDuration", breakDuration);

    if (!isWorkSession) {
        resetTimer();
    }
});

longBreakMobile.addEventListener("input", () => {
    let val = parseInt(longBreakMobile.value);
    if (isNaN(val) || val < 1) val = 1;
    if (val > 60) val = 60;

    longBreakMobile.value = val;
    longBreakInput.value = val;
    longBreakDuration = val * 60;
    localStorage.setItem("longBreakDuration", longBreakDuration);
});

/* =============================
   Start/Pause, Reset
   ============================= */
startPauseButton.addEventListener("click", () => {
    if (isRunning) {
        pauseTimer();
    } else {
        startTimer();
    }
});
resetButton.addEventListener("click", resetTimer);

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
        // Work session ended
        sessionCount++;
        cycleCount++;
        sessionCountDisplay.textContent = sessionCount;
        addSessionToHistory("Work");
        saveSettings();
        if (!isMuted) playSound(workEndSound);

        // Check if time for a long break
        if (cycleCount % 4 === 0) {
            isWorkSession = false;
            sessionDisplay.textContent = "Long Break";
            totalTime = longBreakDuration;
        } else {
            isWorkSession = false;
            sessionDisplay.textContent = "Break";
            totalTime = breakDuration;
        }
    } else {
        // Break ended
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

    // Update progress circle color
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

/* =============================
   Notifications
   ============================= */
function notify() {
    if (Notification.permission === "granted") {
        new Notification(isWorkSession ? "Break Time!" : "Work Time!", {
            body: isWorkSession ? "Time to take a break." : "Time to focus!",
            icon: "assets/tomato.png",
        });
    }
}

/* =============================
   Sound
   ============================= */
function playSound(sound) {
    sound.currentTime = 0;
    sound.play();
}

/* =============================
   Theme Toggle
   ============================= */
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

/* =============================
   Mute/Unmute
   ============================= */
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

/* =============================
   Session History
   ============================= */
function addSessionToHistory(sessionType) {
    const li = document.createElement("li");
    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    li.className = "text-gray-700 dark:text-gray-200 mb-1 break-words whitespace-normal";
    li.textContent = `${timestamp}: Completed a ${sessionType} session.`;
    sessionHistory.prepend(li);

    // Limit to last 10 sessions if desired
    if (sessionHistory.children.length > 10) {
        sessionHistory.removeChild(sessionHistory.lastChild);
    }
}

/* =============================
   Clear Session History
   ============================= */
clearHistoryButton.addEventListener("click", () => {
    // Clear out the sessionHistory list
    sessionHistory.innerHTML = "";
    // Reset counters
    sessionCount = 0;
    cycleCount = 0;
    sessionCountDisplay.textContent = 0;
    // Remove from localStorage
    localStorage.removeItem("sessionHistory");
    localStorage.removeItem("sessionCount");
    localStorage.removeItem("cycleCount");
});

/* =============================
   Info Modal (Open/Close)
   ============================= */
infoButton.addEventListener("click", () => {
    // Show modal: remove 'hidden', add 'flex'
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
    // Animate out
    modalContent.classList.remove("animate-fadeIn");
    modalContent.classList.add("animate-fadeOut");

    // Wait for fade-out, then hide
    setTimeout(() => {
        infoModal.classList.remove("flex");
        infoModal.classList.add("hidden");
    }, 300);
}

/* =============================
   To-Do List
   ============================= */
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
    li.className = "flex items-start justify-between bg-gray-100 dark:bg-gray-700 p-3 rounded-md mb-2 break-words";

    li.setAttribute("data-id", id);

    // Container for checkbox and task text
    const taskContainer = document.createElement("div");
    taskContainer.className = "flex items-start flex-1";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = completed;
    checkbox.className = "mt-1 mr-3 h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500";

    const span = document.createElement("span");
    span.textContent = text;
    span.className = completed
        ? "line-through text-gray-500 dark:text-gray-400 break-words whitespace-normal flex-1"
        : "text-gray-700 dark:text-gray-200 break-words whitespace-normal flex-1";

    taskContainer.appendChild(checkbox);
    taskContainer.appendChild(span);

    // Container for action buttons
    const actionButtons = document.createElement("div");
    actionButtons.className = "flex space-x-2 mt-1";

    const editButton = document.createElement("button");
    editButton.className = "text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-600 focus:outline-none p-1 rounded-full transition-transform duration-200 transform hover:scale-110 action-btn";
    editButton.innerHTML = '<i class="fas fa-edit"></i>';
    editButton.addEventListener("click", () => editTask(id));

    const deleteButton = document.createElement("button");
    deleteButton.className = "text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-600 focus:outline-none p-1 rounded-full transition-transform duration-200 transform hover:scale-110 action-btn";
    deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
    deleteButton.addEventListener("click", () => deleteTask(id));

    actionButtons.appendChild(editButton);
    actionButtons.appendChild(deleteButton);

    li.appendChild(taskContainer);
    li.appendChild(actionButtons);

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
    input.className = "flex-1 p-1 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none dark:bg-gray-700 dark:text-white mr-2";

    li.insertBefore(input, span);
    li.removeChild(span);

    const editButton = li.querySelector(".fa-edit").parentElement;
    editButton.innerHTML = '<i class="fas fa-save"></i>';

    // Remove existing listener
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
    span.className = "flex-1 text-gray-700 dark:text-gray-200 break-words whitespace-normal mr-2";

    li.insertBefore(span, input);
    li.removeChild(input);

    const editButton = li.querySelector(".fa-save").parentElement;
    editButton.innerHTML = '<i class="fas fa-edit"></i>';

    // Remove existing listener
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

/* =============================
   Save Tasks to localStorage
   ============================= */
function saveTasksToLocalStorage() {
    const tasks = [];
    taskList.querySelectorAll("li").forEach((li) => {
        const id = li.getAttribute("data-id");
        const textElement = li.querySelector("span") || li.querySelector("input[type='text']");
        const text = textElement ? textElement.textContent : "";
        const completed = li.querySelector("input[type='checkbox']").checked;
        tasks.push({ id, text, completed });
    });
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

/* =============================
   Initialize SortableJS
   ============================= */
new Sortable(taskList, {
    animation: 150,
    ghostClass: "bg-gray-200 dark:bg-gray-600",
    onEnd: function () {
        saveTasksToLocalStorage();
    },
});

/* =============================
   init()
   ============================= */
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
