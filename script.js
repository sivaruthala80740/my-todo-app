let tasks = JSON.parse(localStorage.getItem("proTasks") || "[]");
let currentFilter = "all";

window.onload = () => { renderTasks(); updateTheme(); }

function save() { localStorage.setItem("proTasks", JSON.stringify(tasks)); }

function addTask() {
  let input = document.getElementById("taskInput");
  let prio = document.getElementById("priority");
  if(!input.value.trim()) return;
  
  tasks.push({ id: Date.now(), text: input.value.trim(), priority: prio.value, done: false });
  input.value = ""; save(); renderTasks();
}

function toggleDone(id) {
  tasks = tasks.map(t => t.id === id ? {...t, done: !t.done} : t);
  save(); renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  save(); renderTasks();
}

function editTask(id) {
  let newText = prompt("Edit task:", tasks.find(t=>t.id===id).text);
  if(newText) {
    tasks = tasks.map(t => t.id === id ? {...t, text: newText} : t);
    save(); renderTasks();
  }
}

function renderTasks() {
  let list = document.getElementById("taskList");
  list.innerHTML = "";
  let filtered = tasks.filter(t => currentFilter === "all" ? true : currentFilter === "done" ? t.done : !t.done);
  
  filtered.forEach(t => {
    let li = document.createElement("li");
    li.className = `${t.priority} ${t.done ? 'done' : ''}`;
    li.innerHTML = `<span onclick="toggleDone(${t.id})">${t.done ? '✅' : '⬜'} ${t.text}</span>
      <div class="actions"><button class="edit" onclick="editTask(${t.id})">Edit</button><button class="del" onclick="deleteTask(${t.id})">X</button></div>`;
    list.appendChild(li);
  });
  document.getElementById("count").innerText = `${tasks.length} tasks, ${tasks.filter(t=>!t.done).length} pending`;
}

function filterTasks(f) {
  currentFilter = f;
  document.querySelectorAll(".filters button").forEach(b=>b.classList.remove("active"));
  event.target.classList.add("active");
  renderTasks();
}

function clearAll() { if(confirm("Clear all?")){ tasks=[]; save(); renderTasks(); } }

function toggleTheme() {
  document.body.classList.toggle("dark");
  localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
  updateTheme();
}
function updateTheme() {
  if(localStorage.getItem("theme")==="dark") document.body.classList.add("dark");
  document.getElementById("themeBtn").innerText = document.body.classList.contains("dark") ? "☀️" : "🌙";
}