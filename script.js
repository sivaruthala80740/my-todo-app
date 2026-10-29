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
*{margin:0;padding:0;box-sizing:border-box;font-family:Segoe UI,sans-serif}
body{background:#121212;color:#fff;min-height:100vh;padding:20px}
.container{max-width:600px;margin:auto;background:#1e1e1e;border-radius:16px;padding:20px}
header{display:flex;justify-content:space-between;margin-bottom:20px}
#liveTime{color:#ff9800;font-size:13px}
.add-box{background:#2a2a2a;padding:15px;border-radius:12px;margin-bottom:15px}
.time-inputs{display:flex;gap:10px;margin-bottom:10px}
const taskInput = document.getElementById('taskInput');
const startTime = document.getElementById('startTime');
const endTime = document.getElementById('endTime');
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById('taskList');
const liveTime = document.getElementById('liveTime');

let tasks = JSON.parse(localStorage.getItem('studySlots') || '[]');
let alarmPlayedFor = new Set();
let currentFilter = 'all';

setInterval(() => {
  const now = new Date();
  liveTime.textContent = now.toLocaleDateString() + ' ' + now.toLocaleTimeString();
  checkAlarms(now);
  render();
}, 1000);

function checkAlarms(now) {
  const currentHM = now.getHours().toString().padStart(2,'0') + ':' + now.getMinutes().toString().padStart(2,'0');
  if(now.getSeconds() !== 0) return;
  tasks.forEach(t => {
    if(t.start === currentHM && !alarmPlayedFor.has('start-'+t.id) && !t.done) {
      playAlarm(t);
      alarmPlayedFor.add('start-'+t.id);
    }
  });
}

function playAlarm(task) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    for(let i=0; i<4; i++){
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.frequency.setValueAtTime(880, ctx.currentTime + i*0.6);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i*0.6); osc.stop(ctx.currentTime + i*0.6 + 0.5);
    }
  } catch(e){}
  if(navigator.vibrate) navigator.vibrate([500,200,500,200,500]);
  alert(`⏰ IT'S TIME TO STUDY!\n\n📚 Subject: ${task.text}\n⏰ Time: ${task.start} - ${task.end}`);
}

function save(){ localStorage.setItem('studySlots', JSON.stringify(tasks)); }

addBtn.onclick = () => {
  if(!taskInput.value || !startTime.value || !endTime.value) return alert('Time and Subject pettu fnd!');
  tasks.push({id: Date.now(), text: taskInput.value, start: startTime.value, end: endTime.value, done:false});
  taskInput.value=''; save(); render();
};

function render() {
  taskList.innerHTML='';
  let filtered = tasks;
  if(currentFilter === 'current') filtered = tasks.filter(t => isCurrent(t) && !t.done);
  if(currentFilter === 'done') filtered = tasks.filter(t => t.done);
  filtered.forEach(t => {
    const li = document.createElement('li');
    li.className = t.done ? 'done' : (isCurrent(t) ? 'current' : '');
    li.innerHTML = `<div class="task-info"><span class="time">${t.start} - ${t.end}</span><span class="subject">${t.text}</span>${isCurrent(t)?'<span class="live-badge">🔴 LIVE NOW 🔔</span>':''}</div><div class="task-actions"><button class="done-btn" onclick="toggle(${t.id})">${t.done?'Undo':'Done'}</button><button class="del-btn" onclick="del(${t.id})">X</button></div>`;
    taskList.appendChild(li);
  });
  document.getElementById('pendingCount').textContent = `${tasks.filter(t=>!t.done).length} pending • ${tasks.filter(t=>t.done).length} completed`;
}
function isCurrent(t){
  const now = new Date(); const cur = now.getHours()*60+now.getMinutes();
  const [sh, sm] = t.start.split(':').map(Number); const [eh, em] = t.end.split(':').map(Number);
  return cur >= sh*60+sm && cur < eh*60+em;
}
window.toggle = (id)=>{ const t=tasks.find(x=>x.id===id); t.done=!t.done; save(); render(); }
window.del = (id)=>{ tasks=tasks.filter(x=>x.id!==id); save(); render(); }
document.querySelectorAll('.filter').forEach(btn=>{
  btn.onclick = ()=>{ document.querySelectorAll('.filter').forEach(b=>b.classList.remove('active')); btn.classList.add('active'); currentFilter = btn.dataset.filter; render(); }
});
document.getElementById('themeBtn').onclick = ()=> document.body.classList.toggle('light');
document.getElementById('clearBtn').onclick = ()=>{ if(confirm('Clear all?')){ tasks=[]; save(); render(); alarmPlayedFor.clear(); } }
render();.time-inputs div{flex:1}
.time-inputs label{font-size:12px;color:#aaa}
.time-inputs input,.subject-input input{width:100%;padding:10px;border-radius:8px;border:none;background:#333;color:#fff}
.subject-input{display:flex;gap:10px}
#addBtn{padding:12px 18px;background:#2196F3;color:#fff;border:none;border-radius:8px;font-weight:bold;cursor:pointer}
.filters{display:flex;gap:8px;margin-bottom:15px}
.filter{padding:8px 14px;border:none;border-radius:20px;background:#333;color:#fff;cursor:pointer}
.filter.active{background:#4CAF50}
#clearBtn{margin-left:auto;background:#f44336;color:#fff;border:none;border-radius:20px;padding:8px 14px}
#taskList{list-style:none}
#taskList li{display:flex;justify-content:space-between;background:#2a2a2a;padding:12px;border-radius:10px;margin-bottom:10px}
#taskList li.current{border:2px solid #4CAF50;animation:pulse 1.5s infinite}
@keyframes pulse{0%{box-shadow:0 0 0 0 rgba(76,175,80,.7)}70%{box-shadow:0 0 0 10px rgba(76,175,80,0)}100%{box-shadow:0 0 0 0 rgba(76,175,80,0)}}
.time{font-weight:bold;color:#2196F3;font-size:14px}
.live-badge{background:#f44336;color:#fff;font-size:11px;padding:2px 6px;border-radius:10px;margin-top:4px;display:inline-block}
.done-btn,.del-btn{padding:6px 10px;border:none;border-radius:6px;cursor:pointer}
.done-btn{background:#4CAF50;color:#fff}
.del-btn{background:#555;color:#fff}
#pendingCount{text-align:center;margin-top:15px;color:#aaa}
