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
const taskInput = document.getElementById('taskInput');
const startTime = document.getElementById('startTime');
const endTime = document.getElementById('endTime');
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById('taskList');
const liveTime = document.getElementById('liveTime');

let tasks = JSON.parse(localStorage.getItem('studySlots') || '[]');
let alarmPlayedFor = new Set();

// LIVE CLOCK
setInterval(() => {
  const now = new Date();
  liveTime.textContent = now.toLocaleTimeString();
  checkAlarms(now);
}, 1000);

// ALARM CHECK - NOW AT START TIME
function checkAlarms(now) {
  const currentHM = now.getHours().toString().padStart(2,'0') + ':' + now.getMinutes().toString().padStart(2,'0');
  
  tasks.forEach(t => {
    // If current time == task START time
    if(t.start === currentHM && !alarmPlayedFor.has('start-'+t.id) && !t.done) {
      playAlarm(t, 'start');
      alarmPlayedFor.add('start-'+t.id);
    }
  });
}

function playAlarm(task, type) {
  // 1. LOUD ALARM SOUND (Web Audio API - no internet needed)
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    for(let i=0; i<3; i++){
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime + i*0.5);
      osc.connect(ctx.destination);
      osc.start(ctx.currentTime + i*0.5);
      osc.stop(ctx.currentTime + i*0.5 + 0.4);
    }
  } catch(e){}

  // 2. Vibration for mobile
  if(navigator.vibrate) navigator.vibrate([500,200,500,200,500]);

  // 3. ALERT MESSAGE
  alert(`⏰ IT'S TIME TO STUDY!\n\n📚 Subject: ${task.text}\n⏰ Time: ${task.start} - ${task.end}\n\nLet's start fnd! All the best!`);

  // 4. Also try browser notification
  if(Notification && Notification.permission === "granted"){
    new Notification(`Time to Study: ${task.text}`, {body: `Slot ${task.start} - ${task.end}`});
  }
}

function save(){ localStorage.setItem('studySlots', JSON.stringify(tasks)); }

addBtn.onclick = () => {
  if(!taskInput.value || !startTime.value || !endTime.value) return alert('Fnd, Time and Subject pettu!');
  tasks.push({id: Date.now(), text: taskInput.value, start: startTime.value, end: endTime.value, done:false});
  taskInput.value=''; 
  save(); 
  render();
  if(Notification) Notification.requestPermission();
};

function render() {
  taskList.innerHTML='';
  tasks.forEach(t => {
    const li = document.createElement('li');
    li.className = t.done ? 'done' : (isCurrent(t) ? 'current' : '');
    li.innerHTML = `<span><b>${t.start} - ${t.end}</b> : ${t.text} ${isCurrent(t)?'🔴 LIVE NOW':''}</span> <div><button onclick="toggle(${t.id})">${t.done?'Undo':'Done'}</button> <button onclick="del(${t.id})">X</button></div>`;
    taskList.appendChild(li);
  });
  document.getElementById('pendingCount').textContent = `${tasks.filter(t=>!t.done).length} slots pending`;
}

function isCurrent(t){
  const now = new Date(); const cur = now.getHours()*60+now.getMinutes();
  const [sh, sm] = t.start.split(':').map(Number); 
  const [eh, em] = t.end.split(':').map(Number);
  return cur >= sh*60+sm && cur <= eh*60+em;
}

window.toggle = (id)=>{ const t=tasks.find(x=>x.id===id); t.done=!t.done; save(); render(); }
window.del = (id)=>{ tasks=tasks.filter(x=>x.id!==id); save(); render(); }
render();

document.getElementById('themeBtn').onclick = ()=> document.body.classList.toggle('light');
document.getElementById('clearBtn').onclick = ()=>{ if(confirm('Clear all?')){ tasks=[]; save(); render(); } }
