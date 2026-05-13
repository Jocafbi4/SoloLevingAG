const STORAGE_KEY = "solo_leveling_dashboard_v1";

const defaultState = {
  level: 12,
  xp: 2450,
  attrs: { forca: 78, vitalidade: 82, intelecto: 71, mental: 68, disciplina: 90, destreza: 65 },
  historyLabels: ["18/05","19/05","20/05","21/05","22/05","23/05","24/05"],
  history: {
    forca: [45, 52, 56, 60, 63, 68, 72],
    vitalidade: [30, 38, 44, 48, 52, 57, 60],
    intelecto: [20, 25, 29, 32, 35, 39, 42],
    mental: [14, 19, 22, 25, 28, 31, 35],
    disciplina: [28, 33, 37, 40, 42, 45, 48],
    destreza: [12, 16, 18, 21, 24, 28, 31]
  },
  lastGain: 0
};

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const fmt = new Intl.NumberFormat("pt-BR");

function clone(obj){
  // evita depender de structuredClone (alguns browsers)
  return JSON.parse(JSON.stringify(obj));
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...clone(defaultState), ...JSON.parse(raw) } : clone(defaultState);
  } catch {
    return clone(defaultState);
  }
}

let state = loadState();
function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }

function xpToNextLevel(level) {
  // mesma lógica que você usava (cresce por nível)
  return Math.round(2500 + (level - 1) * 120);
}

function totalXpFromLevels(level){
  let total = 0;
  for(let lv = 1; lv < level; lv++){
    total += xpToNextLevel(lv);
  }
  return total;
}

function levelUpIfNeeded() {
  let needed = xpToNextLevel(state.level);
  while (state.xp >= needed) {
    state.xp -= needed;
    state.level += 1;

    // bônus pequeno por nível
    for (const k of Object.keys(state.attrs)) {
      state.attrs[k] = clamp(state.attrs[k] + 1, 0, 100);
    }

    needed = xpToNextLevel(state.level);
  }
}

function pushHistoryPoint() {
  const today = new Date();
  const label = today.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });

  state.historyLabels.push(label);
  if (state.historyLabels.length > 7) state.historyLabels.shift();

  for (const k of Object.keys(state.history)) {
    state.history[k].push(Math.round(state.attrs[k]));
    if (state.history[k].length > 7) state.history[k].shift();
  }
}

const el = {
  level: document.getElementById("level"),
  level2: document.getElementById("level2"),
  xpText: document.getElementById("xpText"),
  xpFill: document.getElementById("xpFill"),
  nextText: document.getElementById("nextText"),
  xpAccum: document.getElementById("xpAccum"),
  xpGainBadge: document.getElementById("xpGainBadge"),

  tTreino: document.getElementById("tTreino"),
  tMeditacao: document.getElementById("tMeditacao"),
  tHoras: document.getElementById("tHoras"),
  tProjeto: document.getElementById("tProjeto"),

  btnMissao: document.getElementById("btnMissao"),
  btnReset: document.getElementById("btnReset"),

  vForca: document.getElementById("vForca"),
  vVitalidade: document.getElementById("vVitalidade"),
  vIntelecto: document.getElementById("vIntelecto"),
  vMental: document.getElementById("vMental"),
  vDisciplina: document.getElementById("vDisciplina"),
  vDestreza: document.getElementById("vDestreza"),

  radar: document.getElementById("radar"),
  history: document.getElementById("history"),

  // Auth
  authOverlay: document.getElementById("authOverlay"),
  loginForm: document.getElementById("loginForm"),
  registerForm: document.getElementById("registerForm"),
  toRegister: document.getElementById("toRegister"),
  toLogin: document.getElementById("toLogin"),
  authTitle: document.getElementById("authTitle"),
  authSubtitle: document.getElementById("authSubtitle"),
  authClose: document.getElementById("authClose")
};

// ===== AUTH (fake) =====
function showLogin() {
  el.registerForm.classList.add("hidden");
  el.loginForm.classList.remove("hidden");
  el.authTitle.textContent = "ACESSO AO SISTEMA";
  el.authSubtitle.textContent = "Identifique-se, Caçador.";
}

function showRegister() {
  el.loginForm.classList.add("hidden");
  el.registerForm.classList.remove("hidden");
  el.authTitle.textContent = "REGISTRO DE CAÇADOR";
  el.authSubtitle.textContent = "Comece sua jornada do nível 0.";
}
// X da HOME: voltar para cadastro (register)
const homeClose = document.getElementById("homeClose");
if (homeClose) {
  homeClose.addEventListener("click", () => {
    // mostra o overlay novamente
    el.authOverlay.style.display = "flex";
    el.authOverlay.style.opacity = "1";

    // vai direto para o cadastro
    showRegister();
  });
}

el.authClose.addEventListener("click", () => showLogin());

el.toRegister.addEventListener("click", (e) => { e.preventDefault(); showRegister(); });
el.toLogin.addEventListener("click", (e) => { e.preventDefault(); showLogin(); });

const handleAuthSubmit = (e) => {
  e.preventDefault();
  el.authOverlay.style.opacity = "0";
  setTimeout(() => { el.authOverlay.style.display = "none"; }, 500);
};
el.loginForm.addEventListener("submit", handleAuthSubmit);
el.registerForm.addEventListener("submit", handleAuthSubmit);

// ===== CANVAS HELPERS =====
function crispCanvas(canvas){
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  const rect = canvas.getBoundingClientRect();
  const w = Math.round(rect.width * dpr);
  const h = Math.round(rect.height * dpr);
  if(canvas.width !== w || canvas.height !== h){
    canvas.width = w;
    canvas.height = h;
  }
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr,0,0,dpr,0,0);
  return ctx;
}

// ===== RADAR =====
function drawRadar(){
  const canvas = el.radar;
  if(!canvas) return;

  const ctx = crispCanvas(canvas);
  const rect = canvas.getBoundingClientRect();
  const W = rect.width, H = rect.height;

  ctx.clearRect(0,0,W,H);

  const cx = W/2, cy = H/2;
  const maxR = Math.min(W,H) * 0.34;

  const axes = ["forca","vitalidade","intelecto","mental","disciplina","destreza"];
  const n = axes.length;
  const start = -Math.PI/2;

  ctx.save();
  ctx.translate(cx, cy);

  // grid rings
  for(let ring=1; ring<=4; ring++){
    const r = (maxR/4)*ring;
    ctx.beginPath();
    for(let i=0;i<n;i++){
      const a = start + (Math.PI*2*i)/n;
      const x = Math.cos(a)*r;
      const y = Math.sin(a)*r;
      if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    }
    ctx.closePath();
    ctx.strokeStyle = "rgba(178,107,255,0.18)";
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // axes lines
  for(let i=0;i<n;i++){
    const a = start + (Math.PI*2*i)/n;
    ctx.beginPath();
    ctx.moveTo(0,0);
    ctx.lineTo(Math.cos(a)*maxR, Math.sin(a)*maxR);
    ctx.strokeStyle = "rgba(255,255,255,0.10)";
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // polygon points
  const points = axes.map((k,i)=>{
    const v = clamp((state.attrs[k] ?? 0)/100, 0, 1);
    const r = v * maxR;
    const a = start + (Math.PI*2*i)/n;
    return { x: Math.cos(a)*r, y: Math.sin(a)*r };
  });

  // fill
  ctx.beginPath();
  points.forEach((p,i)=> i===0 ? ctx.moveTo(p.x,p.y) : ctx.lineTo(p.x,p.y));
  ctx.closePath();
  ctx.fillStyle = "rgba(123,44,255,0.20)";
  ctx.fill();

  // stroke glow
  ctx.strokeStyle = "rgba(178,107,255,0.85)";
  ctx.lineWidth = 2;
  ctx.shadowColor = "rgba(178,107,255,0.35)";
  ctx.shadowBlur = 18;
  ctx.stroke();

  // points
  ctx.shadowBlur = 0;
  for(const p of points){
    ctx.beginPath();
    ctx.arc(p.x,p.y,4.2,0,Math.PI*2);
    ctx.fillStyle = "rgba(233,236,255,0.95)";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(p.x,p.y,6.6,0,Math.PI*2);
    ctx.strokeStyle = "rgba(178,107,255,0.65)";
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // scale labels
  ctx.fillStyle = "rgba(166,176,212,0.65)";
  ctx.font = "12px Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  [25,50,75,100].forEach((v, idx)=>{
    ctx.fillText(String(v), 0, -(maxR/4)*(idx+1));
  });

  ctx.restore();
}

// ===== HISTORY =====
function drawHistory(){
  const canvas = el.history;
  if(!canvas) return;

  const ctx = crispCanvas(canvas);
  const rect = canvas.getBoundingClientRect();
  const W = rect.width, H = rect.height;

  ctx.clearRect(0,0,W,H);

  const pad = {l:42, r:18, t:18, b:34};
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  // grid + y labels
  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 1;
  [0,25,50,75,100].forEach(v=>{
    const y = pad.t + innerH - (v/100)*innerH;
    ctx.beginPath();
    ctx.moveTo(pad.l,y);
    ctx.lineTo(W-pad.r,y);
    ctx.stroke();

    ctx.fillStyle = "rgba(166,176,212,0.65)";
    ctx.font = "12px Inter, sans-serif";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillText(String(v), pad.l-8, y);
  });

  const labels = state.historyLabels || [];
  const n = labels.length || 7;

  // x labels
  for(let i=0;i<n;i++){
    const x = pad.l + (i/(n-1))*innerW;
    const text = labels[i] ?? "";
    ctx.fillStyle = "rgba(166,176,212,0.65)";
    ctx.font = "12px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(text, x, pad.t + innerH + 10);
  }

  const series = [
    {key:"forca", color:"#b26bff"},
    {key:"vitalidade", color:"#ff4b6e"},
    {key:"intelecto", color:"#3da2ff"},
    {key:"mental", color:"#48ffd5"},
    {key:"disciplina", color:"#ffd34a"},
    {key:"destreza", color:"#64ff7a"},
  ];

  function xy(i, v){
    const x = pad.l + (i/(n-1))*innerW;
    const y = pad.t + innerH - (clamp(v,0,100)/100)*innerH;
    return {x,y};
  }

  series.forEach(s=>{
    const arr = state.history?.[s.key] ?? Array(n).fill(0);

    ctx.beginPath();
    for(let i=0;i<n;i++){
      const v = arr[i] ?? 0;
      const p = xy(i, v);
      if(i===0) ctx.moveTo(p.x,p.y);
      else ctx.lineTo(p.x,p.y);
    }
    ctx.strokeStyle = s.color;
    ctx.lineWidth = 2;
    ctx.shadowColor = s.color;
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.shadowBlur = 0;

    const last = xy(n-1, arr[n-1] ?? 0);
    ctx.beginPath();
    ctx.arc(last.x,last.y,3.8,0,Math.PI*2);
    ctx.fillStyle = s.color;
    ctx.fill();
  });
}

// ===== DASHBOARD LOGIC =====
function calcDailyXpGain(){
  let gain = 120;
  if(el.tTreino.checked) gain += 220;
  if(el.tMeditacao.checked) gain += 90;
  if(el.tProjeto.checked) gain += 110;

  const h = clamp(parseInt(el.tHoras.value || "0", 10), 0, 24);
  gain += Math.min(h, 8) * 30;
  return gain;
}

function applyDailyAttributeEffects(){
  const h = clamp(parseInt(el.tHoras.value || "0", 10), 0, 24);

  if(el.tTreino.checked){
    state.attrs.forca = clamp(state.attrs.forca + 1.2, 0, 100);
    state.attrs.vitalidade = clamp(state.attrs.vitalidade + 1.0, 0, 100);
    state.attrs.destreza = clamp(state.attrs.destreza + 0.6, 0, 100);
  }
  if(el.tMeditacao.checked){
    state.attrs.mental = clamp(state.attrs.mental + 1.3, 0, 100);
    state.attrs.disciplina = clamp(state.attrs.disciplina + 0.8, 0, 100);
  }
  if(el.tProjeto.checked){
    state.attrs.disciplina = clamp(state.attrs.disciplina + 1.0, 0, 100);
  }
  if(h > 0){
    state.attrs.intelecto = clamp(state.attrs.intelecto + Math.min(h, 6) * 0.35, 0, 100);
    state.attrs.disciplina = clamp(state.attrs.disciplina + Math.min(h, 6) * 0.15, 0, 100);
  }
}

function renderAll(){
  const needed = xpToNextLevel(state.level);
  const current = Math.round(state.xp);

  el.level.textContent = state.level;
  el.level2.textContent = state.level;

  el.xpText.textContent = `${fmt.format(current)} / ${fmt.format(needed)}`;
  el.xpFill.style.width = `${clamp(current/needed,0,1)*100}%`;
  el.nextText.textContent = `Próximo nível: ${fmt.format(Math.max(0, needed-current))} XP`;

  el.xpAccum.textContent = fmt.format(totalXpFromLevels(state.level) + current);
  el.xpGainBadge.textContent = `+${fmt.format(state.lastGain)} XP`;

  el.vForca.textContent = `${Math.round(state.attrs.forca)}%`;
  el.vVitalidade.textContent = `${Math.round(state.attrs.vitalidade)}%`;
  el.vIntelecto.textContent = `${Math.round(state.attrs.intelecto)}%`;
  el.vMental.textContent = `${Math.round(state.attrs.mental)}%`;
  el.vDisciplina.textContent = `${Math.round(state.attrs.disciplina)}%`;
  el.vDestreza.textContent = `${Math.round(state.attrs.destreza)}%`;

  drawRadar();
  drawHistory();
}

// ===== EVENTS =====
el.btnMissao.addEventListener("click", ()=>{
  state.lastGain = 0;

  const gain = calcDailyXpGain();
  state.lastGain = gain;

  applyDailyAttributeEffects();
  state.xp += gain;

  levelUpIfNeeded();
  pushHistoryPoint();

  // limpa checklist (opcional)
  el.tTreino.checked = false;
  el.tMeditacao.checked = false;
  el.tProjeto.checked = false;

  saveState();
  renderAll();
});

el.btnReset.addEventListener("click", ()=>{
  const ok = confirm("Tem certeza que deseja reiniciar TODO o progresso? (Nível e XP voltarão para 0)");
  if(!ok) return;

  // zera
  state = clone(defaultState);
  state.level = 0;
  state.xp = 0;
  state.lastGain = 0;

  // opcional: zera atributos e histórico também
  state.attrs = { forca:0, vitalidade:0, intelecto:0, mental:0, disciplina:0, destreza:0 };
  const today = new Date().toLocaleDateString("pt-BR", { day:"2-digit", month:"2-digit" });
  state.historyLabels = Array(7).fill(today);
  state.history = {
    forca: Array(7).fill(0),
    vitalidade: Array(7).fill(0),
    intelecto: Array(7).fill(0),
    mental: Array(7).fill(0),
    disciplina: Array(7).fill(0),
    destreza: Array(7).fill(0)
  };

  el.tTreino.checked = false;
  el.tMeditacao.checked = false;
  el.tProjeto.checked = false;
  el.tHoras.value = 0;

  saveState();
  renderAll();
});

window.addEventListener("resize", ()=>{
  drawRadar();
  drawHistory();
});

// ===== INIT =====
renderAll();