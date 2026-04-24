const STORAGE_KEY = "solo_leveling_dashboard_v1";

const defaultState = {
  level: 12,
  xp: 2450,
  baseXpToLevel: 3000,
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

let state = loadState();

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? { ...structuredClone(defaultState), ...JSON.parse(raw) } : structuredClone(defaultState);
}

function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }

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
  authOverlay: document.getElementById('authOverlay'),
  loginForm: document.getElementById('loginForm'),
  registerForm: document.getElementById('registerForm'),
  toRegister: document.getElementById('toRegister'),
  toLogin: document.getElementById('toLogin'),
  authTitle: document.getElementById('authTitle'),
  authSubtitle: document.getElementById('authSubtitle'),
  authClose: document.getElementById('authClose')
};

// --- LÓGICA DE AUTH ---

function showLogin() {
  el.registerForm.classList.add('hidden');
  el.loginForm.classList.remove('hidden');
  el.authTitle.textContent = "ACESSO AO SISTEMA";
  el.authSubtitle.textContent = "Identifique-se, Caçador.";
}

function showRegister() {
  el.loginForm.classList.add('hidden');
  el.registerForm.classList.remove('hidden');
  el.authTitle.textContent = "REGISTRO DE CAÇADOR";
  el.authSubtitle.textContent = "Comece sua jornada do nível 0.";
}

// Ao clicar no X, volta para o Login
el.authClose.addEventListener('click', () => {
  showLogin();
});

el.toRegister.addEventListener('click', (e) => {
  e.preventDefault();
  showRegister();
});

el.toLogin.addEventListener('click', (e) => {
  e.preventDefault();
  showLogin();
});

const handleAuthSubmit = (e) => {
  e.preventDefault();
  el.authOverlay.style.opacity = '0';
  setTimeout(() => { el.authOverlay.style.display = 'none'; }, 500);
};

el.loginForm.addEventListener('submit', handleAuthSubmit);
el.registerForm.addEventListener('submit', handleAuthSubmit);

// --- LÓGICA DO DASHBOARD (Radar/Histórico/XP) ---
// (Mantenha suas funções de desenho originais aqui como drawRadar e drawHistory)

function renderAll() {
  const needed = Math.round(2500 + (state.level - 1) * 120);
  el.level.textContent = state.level;
  el.level2.textContent = state.level;
  el.xpText.textContent = `${state.xp.toLocaleString()} / ${needed.toLocaleString()}`;
  el.xpFill.style.width = `${(state.xp / needed) * 100}%`;
  
  el.vForca.textContent = `${Math.round(state.attrs.forca)}%`;
  el.vVitalidade.textContent = `${Math.round(state.attrs.vitalidade)}%`;
  el.vIntelecto.textContent = `${Math.round(state.attrs.intelecto)}%`;
  el.vMental.textContent = `${Math.round(state.attrs.mental)}%`;
  el.vDisciplina.textContent = `${Math.round(state.attrs.disciplina)}%`;
  el.vDestreza.textContent = `${Math.round(state.attrs.destreza)}%`;
  
  // Chame suas funções de Canvas aqui
  // drawRadar();
  // drawHistory();
}

renderAll();