const inputbox = document.querySelector("#input") || document.querySelector("input");
const addbtn = document.getElementById("addbtn");
const todolist = document.querySelector("ul");

let editingIndex = null;
let currentFilter = "all";

// Ensure Filter Buttons exist in the DOM (Auto-Inject if missing)
let filterContainer = document.getElementById("filter-container");
if (!filterContainer) {
    filterContainer = document.createElement("div");
    filterContainer.id = "filter-container";
    filterContainer.innerHTML = `
        <button class="filter-btn active" data-filter="all">All</button>
        <button class="filter-btn" data-filter="active">Active</button>
        <button class="filter-btn" data-filter="completed">Completed</button>
    `;
    const todoContainer = document.getElementById("todo-container");
    if (todoContainer && todoContainer.parentNode) {
        todoContainer.parentNode.insertBefore(filterContainer, todoContainer);
    } else {
        document.body.appendChild(filterContainer);
    }
}

const filterBtns = document.querySelectorAll(".filter-btn");

// Get stored todos with full compatibility
function getStoredTodos() {
    try {
        let raw = JSON.parse(localStorage.getItem("todos")) || [];
        return raw.map(item => {
            if (typeof item === "string") {
                return { text: item, completed: false };
            }
            return {
                text: item.text || "",
                completed: Boolean(item.completed)
            };
        });
    } catch (e) {
        return [];
    }
}

let storedTodo = getStoredTodos();

function saveTodos() {
    localStorage.setItem("todos", JSON.stringify(storedTodo));
}

// Initial standardize
saveTodos();

// Handle Add / Edit Save
function handleAddtask() {
    const textVal = inputbox.value.trim();
    if (textVal.length === 0) return;

    if (addbtn.innerHTML === "Save" && editingIndex !== null) {
        storedTodo[editingIndex].text = textVal;
        addbtn.innerHTML = "ADD";
        editingIndex = null;
    } else {
        storedTodo.push({ text: textVal, completed: false });
    }

    saveTodos();
    inputbox.value = "";
    displayTodo();
}

// Display Todos with Filter
function displayTodo() {
    todolist.innerHTML = "";

    storedTodo.forEach((task, index) => {
        // Filter logic: All / Active / Completed
        if (currentFilter === "active" && task.completed) return;
        if (currentFilter === "completed" && !task.completed) return;

        const list = document.createElement("li");
        list.setAttribute("data-index", index);

        list.innerHTML = `
            <div class="task-left">
                <input type="checkbox" class="task-checkbox" ${task.completed ? "checked" : ""}>
                <p class="task ${task.completed ? "strikethrough" : ""}">${task.text}</p>
            </div>
            <div class="btn-container">
                <button class="edit-btn">Edit</button>
                <button class="delete-btn">Delete</button>
            </div>
        `;
        todolist.appendChild(list);
    });
}

// Event Delegation for Task Actions
function handleUpdate(e) {
    const listElement = e.target.closest("li");
    if (!listElement) return;

    const index = parseInt(listElement.getAttribute("data-index"), 10);
    if (isNaN(index) || index < 0 || index >= storedTodo.length) return;

    // 1. Mark as Complete (Checkbox click or Task text click)
    if (e.target.classList.contains("task-checkbox") || e.target.classList.contains("task")) {
        if (e.target.classList.contains("task")) {
            storedTodo[index].completed = !storedTodo[index].completed;
        } else {
            storedTodo[index].completed = e.target.checked;
        }
        saveTodos();
        displayTodo();
        return;
    }

    // Delete
    if (e.target.innerHTML === "Delete" || e.target.classList.contains("delete-btn")) {
        storedTodo.splice(index, 1);
        if (editingIndex === index) {
            editingIndex = null;
            addbtn.innerHTML = "ADD";
            inputbox.value = "";
        }
        saveTodos();
        displayTodo();
        return;
    }

    // Edit
    if (e.target.innerHTML === "Edit" || e.target.classList.contains("edit-btn")) {
        editingIndex = index;
        inputbox.value = storedTodo[index].text;
        addbtn.innerHTML = "Save";
        inputbox.focus();
    }
}

// 2. Filter Tabs Click Event
filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        filterBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentFilter = btn.getAttribute("data-filter");
        displayTodo();
    });
});

// Event Listeners
addbtn.addEventListener("click", handleAddtask);
todolist.addEventListener("click", handleUpdate);

// Enter Key to Add/Save
inputbox.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        handleAddtask();
    }
});

// Initial Render
displayTodo();
// addBtn.addEventListener("click",handleUpdate);