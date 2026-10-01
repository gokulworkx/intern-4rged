// ==========================================
// 4RGED TODO — SCRIPT LOGIC (CLEAN & MINIMALIST)
// ==========================================

// Ensure dynamic title
function updateBranding() {
    document.title = "4rged Todo";
}

// Auto-Construct 4rged Todo UI if missing from static HTML
function ensureEverDoLayout() {
    if (!document.querySelector(".window-container")) {
        document.body.innerHTML = `
            <div class="window-container">
                <aside class="sidebar">
                    <div class="sidebar-top">
                        <div class="sidebar-brand">
                            <div class="brand-icon-box">
                                <i class="fa-solid fa-layer-group"></i>
                            </div>
                            <div class="brand-details">
                                <span class="brand-title">4rged</span>
                                <span class="brand-subtitle">WORKSPACE</span>
                            </div>
                        </div>
                    </div>
                    <nav class="sidebar-nav">
                        <button class="nav-item filter-btn active" data-filter="all">
                            <i class="fa-solid fa-inbox"></i>
                            <span>All Tasks</span>
                        </button>
                        <button class="nav-item filter-btn" data-filter="active">
                            <i class="fa-regular fa-circle-dot"></i>
                            <span>Active</span>
                        </button>
                        <button class="nav-item filter-btn" data-filter="completed">
                            <i class="fa-solid fa-circle-check"></i>
                            <span>Completed</span>
                        </button>
                    </nav>
                    <div class="sidebar-bottom">
                        <button id="quick-add-btn" class="floating-add-btn" title="Add New Task">
                            <i class="fa-solid fa-plus"></i>
                        </button>
                    </div>
                </aside>
                <main class="main-content">
                    <header class="content-header">
                        <div class="header-titles">
                            <span class="sub-badge">4rged — MVP</span>
                            <h1 class="main-title">4rged Todo</h1>
                        </div>
                        <div id="filter-container" class="top-filter-pills">
                            <button class="filter-btn active" data-filter="all">All</button>
                            <button class="filter-btn" data-filter="active">Active</button>
                            <button class="filter-btn" data-filter="completed">Completed</button>
                        </div>
                    </header>
                    <div id="input-container">
                        <section id="inner_cont">
                            <div class="input-field-box">
                                <i class="fa-solid fa-pen-to-square input-icon"></i>
                                <input id="input" placeholder="Enter a new task..." autocomplete="off">
                            </div>
                            <div class="custom-dropdown" id="category-dropdown-wrapper">
                                <button type="button" class="category-dropdown-btn" id="category-dropdown-btn" aria-label="Select Task Category">
                                    <span class="category-dot dot-work" id="selected-category-dot"></span>
                                    <span id="selected-category-text">Work</span>
                                    <i class="fa-solid fa-chevron-down dropdown-arrow"></i>
                                </button>
                                <div class="custom-dropdown-menu" id="category-dropdown-menu">
                                    <div class="dropdown-item active" data-value="Work">
                                        <span class="category-dot dot-work"></span>
                                        <span>Work</span>
                                    </div>
                                    <div class="dropdown-item" data-value="Personal">
                                        <span class="category-dot dot-personal"></span>
                                        <span>Personal</span>
                                    </div>
                                    <div class="dropdown-item" data-value="Urgent">
                                        <span class="category-dot dot-urgent"></span>
                                        <span>Urgent</span>
                                    </div>
                                </div>
                                <input type="hidden" id="category-select" value="Work">
                            </div>
                            <button id="addbtn">ADD</button>
                        </section>
                    </div>
                    <div id="progress-container">
                        <div class="progress-header">
                            <span class="progress-title"><i class="fa-solid fa-chart-pie"></i> Completion Progress</span>
                            <span id="progress-stats">0% (0 of 0 completed)</span>
                        </div>
                        <div class="progress-track">
                            <div id="progress-bar"></div>
                        </div>
                    </div>
                    <div class="section-heading">
                        <h2 id="section-heading-text">Task Items</h2>
                    </div>
                    <div id="todo-container">
                        <ul id="task-list"></ul>
                    </div>
                </main>
            </div>
        `;
    }
    updateBranding();
}

// Ensure Font Awesome & Fonts are present
if (!document.querySelector("link[href*='font-awesome']")) {
    const fa = document.createElement("link");
    fa.rel = "stylesheet";
    fa.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css";
    document.head.appendChild(fa);
}

ensureEverDoLayout();

// DOM Element References
const inputbox = document.querySelector("#input");
const categorySelect = document.getElementById("category-select");
const addbtn = document.getElementById("addbtn");
const todolist = document.querySelector("#task-list") || document.querySelector("ul");
const filterBtns = document.querySelectorAll(".filter-btn");
const quickAddBtn = document.getElementById("quick-add-btn");
const progressBar = document.getElementById("progress-bar");
const progressStats = document.getElementById("progress-stats");

// Custom Curvy Dropdown References & Logic
const dropdownWrapper = document.getElementById("category-dropdown-wrapper");
const dropdownBtn = document.getElementById("category-dropdown-btn");
const dropdownMenu = document.getElementById("category-dropdown-menu");
const selectedCategoryText = document.getElementById("selected-category-text");
const selectedCategoryDot = document.getElementById("selected-category-dot");

function setCategoryValue(val) {
    if (categorySelect) categorySelect.value = val;
    if (selectedCategoryText) selectedCategoryText.textContent = val;
    if (selectedCategoryDot) {
        selectedCategoryDot.className = `category-dot dot-${val.toLowerCase()}`;
    }
    if (dropdownMenu) {
        dropdownMenu.querySelectorAll(".dropdown-item").forEach(item => {
            if (item.getAttribute("data-value") === val) {
                item.classList.add("active");
            } else {
                item.classList.remove("active");
            }
        });
    }
}

if (dropdownBtn && dropdownWrapper) {
    dropdownBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        dropdownWrapper.classList.toggle("open");
    });

    if (dropdownMenu) {
        dropdownMenu.querySelectorAll(".dropdown-item").forEach(item => {
            item.addEventListener("click", (e) => {
                e.stopPropagation();
                const val = item.getAttribute("data-value");
                setCategoryValue(val);
                dropdownWrapper.classList.remove("open");
            });
        });
    }

    document.addEventListener("click", () => {
        dropdownWrapper.classList.remove("open");
    });
}

let editingIndex = null;
let currentFilter = "all";

// Load stored todos with backward compatibility
function getStoredTodos() {
    try {
        let raw = JSON.parse(localStorage.getItem("todos")) || [];
        return raw.map(item => {
            if (typeof item === "string") {
                return { text: item, category: "Personal", completed: false };
            }
            return {
                text: item.text || "",
                category: item.category || "Personal",
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

// Helper: Escape HTML to avoid XSS
function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}

// Progress Bar Calculation
function updateProgress() {
    const total = storedTodo.length;
    const completed = storedTodo.filter(t => t.completed).length;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

    if (progressBar) {
        progressBar.style.width = `${percentage}%`;
    }
    if (progressStats) {
        progressStats.textContent = `${percentage}% (${completed} of ${total} completed)`;
    }
}

// Handle Add / Edit Task
function handleAddtask() {
    const textVal = inputbox.value.trim();
    if (textVal.length === 0) return;

    const catVal = categorySelect ? categorySelect.value : "Work";

    if (addbtn.innerHTML.includes("Save") && editingIndex !== null) {
        storedTodo[editingIndex].text = textVal;
        if (categorySelect) storedTodo[editingIndex].category = catVal;
        addbtn.innerHTML = "ADD";
        editingIndex = null;
    } else {
        storedTodo.push({
            text: textVal,
            category: catVal,
            completed: false
        });
    }

    saveTodos();
    inputbox.value = "";
    setCategoryValue("Work");
    displayTodo();
}

// Display Todos with Clearly Defined Boxes
function displayTodo() {
    todolist.innerHTML = "";

    storedTodo.forEach((task, index) => {
        // Filter logic: All / Active / Completed
        if (currentFilter === "active" && task.completed) return;
        if (currentFilter === "completed" && !task.completed) return;

        const isDone = task.completed;
        const list = document.createElement("li");
        list.setAttribute("data-index", index);
        if (isDone) {
            list.classList.add("completed");
        }

        const category = task.category || "Personal";
        const categoryClass = `tag-${category.toLowerCase()}`;

        const statusBadge = isDone 
            ? `<span class="status-badge completed-badge"><i class="fa-solid fa-check"></i> Done</span>`
            : `<span class="status-badge active-badge"><i class="fa-regular fa-circle-dot"></i> Active</span>`;

        list.innerHTML = `
            <div class="card-header-row">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <input type="checkbox" class="task-checkbox" ${isDone ? "checked" : ""}>
                    <span class="category-tag ${categoryClass}">${escapeHtml(category)}</span>
                </div>
                ${statusBadge}
            </div>
            <div class="task-content-wrapper">
                <p class="task">${escapeHtml(task.text)}</p>
            </div>
            <div class="btn-container">
                <button class="edit-btn"><i class="fa-solid fa-pen"></i> Edit</button>
                <button class="delete-btn"><i class="fa-regular fa-trash-can"></i> Delete</button>
            </div>
        `;
        todolist.appendChild(list);
    });

    updateProgress();
}

// Event Delegation for Task Actions (Checkbox, Edit, Delete)
function handleUpdate(e) {
    const listElement = e.target.closest("li");
    if (!listElement) return;

    const index = parseInt(listElement.getAttribute("data-index"), 10);
    if (isNaN(index) || index < 0 || index >= storedTodo.length) return;

    // 1. Mark as Complete (Checkbox or Task text click)
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

    // 2. Delete Task
    if (e.target.classList.contains("delete-btn") || e.target.closest(".delete-btn")) {
        storedTodo.splice(index, 1);
        if (editingIndex === index) {
            editingIndex = null;
            addbtn.innerHTML = "ADD";
            inputbox.value = "";
            setCategoryValue("Work");
        }
        saveTodos();
        displayTodo();
        return;
    }

    // 3. Edit Task
    if (e.target.classList.contains("edit-btn") || e.target.closest(".edit-btn")) {
        editingIndex = index;
        inputbox.value = storedTodo[index].text;
        setCategoryValue(storedTodo[index].category || "Work");
        addbtn.innerHTML = "Save";
        inputbox.focus();
    }
}

// Filter Tabs Sync (Sidebar & Top Pills)
filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        const filterVal = btn.getAttribute("data-filter");
        currentFilter = filterVal;

        // Sync all filter buttons with matching data-filter
        document.querySelectorAll(".filter-btn").forEach(b => {
            if (b.getAttribute("data-filter") === filterVal) {
                b.classList.add("active");
            } else {
                b.classList.remove("active");
            }
        });

        displayTodo();
    });
});

// Quick Add Button in Sidebar
if (quickAddBtn) {
    quickAddBtn.addEventListener("click", () => {
        inputbox.focus();
    });
}

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
updateBranding();
