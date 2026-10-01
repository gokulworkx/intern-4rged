const inputbox = document.getElementById("input");
const categorySelect = document.getElementById("category-select");
const addbtn = document.getElementById("addbtn");
const clearCompletedBtn = document.getElementById("clear-completed");
const searchInput = document.getElementById("search-input");
const todolist = document.getElementById("task-list");
const progressBar = document.getElementById("progress-bar");
const progressStats = document.getElementById("progress-stats");

let editingIndex = null;
let draggedIndex = null;

function normalizeTodo(item) {
    if (typeof item === "string") {
        return { text: item, category: "Personal", completed: false };
    }

    return {
        text: item.text || "",
        category: item.category || "Personal",
        completed: Boolean(item.completed)
    };
}

let storedTodo = (JSON.parse(localStorage.getItem("todos")) || []).map(normalizeTodo);

function saveToLocalStorage() {
    localStorage.setItem("todos", JSON.stringify(storedTodo));
}

function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}

function updateProgress() {
    const total = storedTodo.length;
    const completed = storedTodo.filter(task => task.completed).length;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

    if (progressBar) {
        progressBar.style.width = `${percentage}%`;
    }

    if (progressStats) {
        progressStats.textContent = `${percentage}% Completed (${completed}/${total})`;
    }
}

function renderTodoList() {
    todolist.innerHTML = "";
    const query = searchInput.value.trim().toLowerCase();

    const visibleTodos = storedTodo.filter(task => {
        if (!query) return true;
        return task.text.toLowerCase().includes(query) || task.category.toLowerCase().includes(query);
    });

    if (visibleTodos.length === 0) {
        const emptyItem = document.createElement("li");
        emptyItem.className = "empty-state";
        emptyItem.textContent = "No tasks match your search.";
        todolist.appendChild(emptyItem);
        updateProgress();
        return;
    }

    visibleTodos.forEach((task) => {
        const realIndex = storedTodo.indexOf(task);
        const list = document.createElement("li");
        list.dataset.index = String(realIndex);
        list.draggable = true;

        if (task.completed) {
            list.classList.add("completed");
        }

        const categoryClass = `tag-${(task.category || "Personal").toLowerCase()}`;

        list.innerHTML = `
            <div class="card-header">
                <span class="category-tag ${categoryClass}">${escapeHtml(task.category || "Personal")}</span>
                <label class="status-toggle">
                    <input type="checkbox" class="task-checkbox" data-index="${realIndex}" ${task.completed ? "checked" : ""}>
                    <span>${task.completed ? "Done" : "Pending"}</span>
                </label>
            </div>
            <p class="task ${task.completed ? "completed-text" : ""}">${escapeHtml(task.text)}</p>
            <div class="btn-container">
                <button class="edit-btn" data-index="${realIndex}" type="button">Edit</button>
                <button class="delete-btn" data-index="${realIndex}" type="button">Delete</button>
            </div>
        `;

        todolist.appendChild(list);
    });

    updateProgress();
}

function resetForm() {
    inputbox.value = "";
    categorySelect.value = "Work";
    addbtn.textContent = "ADD";
    editingIndex = null;
}

function handleAddtask() {
    const textValue = inputbox.value.trim();
    if (textValue.length === 0) return;

    const selectedCategory = categorySelect.value;

    if (editingIndex !== null && editingIndex >= 0 && editingIndex < storedTodo.length) {
        storedTodo[editingIndex].text = textValue;
        storedTodo[editingIndex].category = selectedCategory;
    } else {
        storedTodo.push({ text: textValue, category: selectedCategory, completed: false });
    }

    saveToLocalStorage();
    renderTodoList();
    resetForm();
}

function handleListAction(event) {
    const target = event.target;

    if (target.classList.contains("task-checkbox")) {
        const index = Number(target.dataset.index);
        if (!Number.isNaN(index) && storedTodo[index]) {
            storedTodo[index].completed = target.checked;
            saveToLocalStorage();
            renderTodoList();
        }
        return;
    }

    if (target.classList.contains("delete-btn")) {
        const index = Number(target.dataset.index);
        if (!Number.isNaN(index) && storedTodo[index]) {
            if (editingIndex === index) {
                resetForm();
            } else if (editingIndex !== null && editingIndex > index) {
                editingIndex--;
            }

            storedTodo.splice(index, 1);
            saveToLocalStorage();
            renderTodoList();
        }
        return;
    }

    if (target.classList.contains("edit-btn")) {
        const index = Number(target.dataset.index);
        if (!Number.isNaN(index) && storedTodo[index]) {
            editingIndex = index;
            inputbox.value = storedTodo[index].text;
            categorySelect.value = storedTodo[index].category || "Work";
            addbtn.textContent = "Save";
            inputbox.focus();
        }
    }
}

function handleClearCompleted() {
    storedTodo = storedTodo.filter(task => !task.completed);
    saveToLocalStorage();
    renderTodoList();
    resetForm();
}

function handleDragStart(event) {
    const item = event.target.closest("li");
    if (!item) return;
    draggedIndex = Number(item.dataset.index);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", String(draggedIndex));
}

function handleDragOver(event) {
    event.preventDefault();
    const target = event.target.closest("li");
    if (!target) return;
    target.classList.add("drag-over");
}

function handleDragLeave(event) {
    const target = event.target.closest("li");
    if (target) {
        target.classList.remove("drag-over");
    }
}

function handleDrop(event) {
    event.preventDefault();
    const target = event.target.closest("li");
    if (!target) return;

    const dropIndex = Number(target.dataset.index);
    if (Number.isNaN(dropIndex) || draggedIndex === null || Number.isNaN(draggedIndex)) {
        return;
    }

    if (draggedIndex === dropIndex) {
        target.classList.remove("drag-over");
        return;
    }

    const [movedTask] = storedTodo.splice(draggedIndex, 1);
    storedTodo.splice(dropIndex, 0, movedTask);

    saveToLocalStorage();
    renderTodoList();
    draggedIndex = null;
}

addbtn.addEventListener("click", handleAddtask);
clearCompletedBtn.addEventListener("click", handleClearCompleted);
searchInput.addEventListener("input", renderTodoList);

todolist.addEventListener("click", handleListAction);
inputbox.addEventListener("keydown", event => {
    if (event.key === "Enter") {
        handleAddtask();
    }
});

todolist.addEventListener("dragstart", handleDragStart);
todolist.addEventListener("dragover", handleDragOver);
todolist.addEventListener("dragleave", handleDragLeave);
todolist.addEventListener("drop", handleDrop);

renderTodoList();
