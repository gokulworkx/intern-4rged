const inputbox = document.getElementById("task-input");
const dueDateInput = document.getElementById("due-date");
const priorityInput = document.getElementById("priority");
const taskForm = document.getElementById("task-form");
const addbtn = document.getElementById("addbtn");
const todolist = document.querySelector("#todo-container ul");
const themeToggle = document.getElementById("theme-toggle");
let editingIndex = null;

let storedTodo = (JSON.parse(localStorage.getItem("todos")) || []).map((task) =>
    typeof task === "string"
        ? { text: task, dueDate: "", priority: "Medium" }
        : {
            text: task.text,
            dueDate: task.dueDate || "",
            priority: ["High", "Medium", "Low"].includes(task.priority)
                ? task.priority
                : "Medium"
        }
);

function saveTodos() {
    localStorage.setItem("todos", JSON.stringify(storedTodo));
}

function resetForm() {
    taskForm.reset();
    addbtn.textContent = "ADD";
    editingIndex = null;
}

function handleAddTask(event) {
    event.preventDefault();
    const task = {
        text: inputbox.value.trim(),
        dueDate: dueDateInput.value,
        priority: priorityInput.value
    };

    if (!task.text) return;

    if (editingIndex === null) {
        storedTodo.push(task);
    } else {
        storedTodo[editingIndex] = task;
    }

    saveTodos();
    displayTodo();
    resetForm();
}

function displayTodo() {
    todolist.replaceChildren();

    storedTodo.forEach((task, index) => {
        const list = document.createElement("li");
        list.className = `task-item priority-${task.priority.toLowerCase()}`;

        const title = document.createElement("p");
        title.className = "task";
        title.textContent = task.text;

        const metadata = document.createElement("div");
        metadata.className = "task-meta";

        const priorityBadge = document.createElement("span");
        priorityBadge.className = `priority-badge priority-${task.priority.toLowerCase()}`;
        priorityBadge.textContent = `${task.priority} priority`;
        metadata.append(priorityBadge);

        if (task.dueDate) {
            const dueDate = document.createElement("time");
            dueDate.dateTime = task.dueDate;
            dueDate.textContent = `Due ${new Date(`${task.dueDate}T00:00:00`).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric"
            })}`;
            metadata.append(dueDate);
        }

        const buttons = document.createElement("div");
        buttons.className = "btn-container";

        const editButton = document.createElement("button");
        editButton.className = "edit-btn";
        editButton.type = "button";
        editButton.dataset.action = "edit";
        editButton.dataset.index = index;
        editButton.textContent = "Edit";

        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-btn";
        deleteButton.type = "button";
        deleteButton.dataset.action = "delete";
        deleteButton.dataset.index = index;
        deleteButton.textContent = "Delete";

        buttons.append(editButton, deleteButton);
        list.append(title, metadata, buttons);
        todolist.append(list);
    });
}

function handleTaskAction(event) {
    const button = event.target.closest("button[data-action]");
    if (!button) return;

    const index = Number(button.dataset.index);
    if (button.dataset.action === "delete") {
        storedTodo.splice(index, 1);
        saveTodos();
        if (editingIndex !== null) resetForm();
        displayTodo();
        return;
    }

    const task = storedTodo[index];
    editingIndex = index;
    inputbox.value = task.text;
    dueDateInput.value = task.dueDate;
    priorityInput.value = task.priority;
    addbtn.textContent = "Save";
    inputbox.focus();
}

function setTheme(isDark) {
    document.documentElement.dataset.theme = isDark ? "dark" : "light";
    themeToggle.textContent = isDark ? "Light mode" : "Dark mode";
    themeToggle.setAttribute("aria-pressed", String(isDark));
    localStorage.setItem("theme", isDark ? "dark" : "light");
}

taskForm.addEventListener("submit", handleAddTask);
todolist.addEventListener("click", handleTaskAction);
themeToggle.addEventListener("click", () => {
    setTheme(document.documentElement.dataset.theme !== "dark");
});

setTheme(localStorage.getItem("theme") === "dark");
displayTodo();