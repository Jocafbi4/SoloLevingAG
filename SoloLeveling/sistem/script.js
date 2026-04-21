let xp = 0;
let nivel = 1;

let atributos = {
    forca: 10,
    vitalidade: 10,
    intelecto: 10,
    mental: 10,
    disciplina: 10,
    destreza: 10
};

let historico = [];

let radarChart;
let lineChart;

// =========================
// 🎯 RADAR CHART
// =========================
function iniciarRadar() {
    radarChart = new Chart(document.getElementById("radarChart"), {
        type: "radar",
        data: {
            labels: [
                "Força",
                "Vitalidade",
                "Intelecto",
                "Mental",
                "Disciplina",
                "Destreza"
            ],
            datasets: [{
                label: "Atributos",
                data: Object.values(atributos),
                backgroundColor: "rgba(106,0,255,0.2)",
                borderColor: "#9d4edd",
                borderWidth: 2,
                pointBackgroundColor: "#ffffff"
            }]
        },
        options: {
            animation: {
                duration: 800
            },
            scales: {
                r: {
                    min: 0,
                    max: 100,
                    grid: { color: "rgba(255,255,255,0.1)" },
                    angleLines: { color: "rgba(255,255,255,0.2)" },
                    pointLabels: {
                        color: "#fff",
                        font: { size: 14 }
                    },
                    ticks: {
                        backdropColor: "transparent",
                        color: "#aaa"
                    }
                }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}

// =========================
// 📈 LINE CHART (HISTÓRICO)
// =========================
function iniciarLinha() {
    lineChart = new Chart(document.getElementById("lineChart"), {
        type: "line",
        data: {
            labels: [],
            datasets: [{
                label: "XP",
                data: [],
                borderColor: "#00c3ff",
                tension: 0.3,
                fill: false
            }]
        },
        options: {
            plugins: {
                legend: {
                    labels: { color: "#fff" }
                }
            },
            scales: {
                x: {
                    ticks: { color: "#aaa" }
                },
                y: {
                    ticks: { color: "#aaa" }
                }
            }
        }
    });
}

// =========================
// ⚔ EXECUTAR MISSÃO
// =========================
function executarMissao() {
    let ganho = 0;

    let treino = document.getElementById("treino").checked;
    let meditacao = document.getElementById("meditacao").checked;
    let projeto = document.getElementById("projeto").checked;
    let horas = parseInt(document.getElementById("horas").value) || 0;

    if (treino) {
        ganho += 50;
        atributos.forca += 5;
        atributos.vitalidade += 5;
    } else ganho -= 50;

    if (meditacao) {
        ganho += 30;
        atributos.mental += 5;
        atributos.disciplina += 5;
    } else ganho -= 30;

    if (horas >= 3) {
        ganho += 300;
        atributos.intelecto += 10;
    } else ganho -= 80;

    if (projeto) {
        ganho += 200;
        atributos.destreza += 5;
    }

    // Limite máximo (balanceamento)
    for (let key in atributos) {
        atributos[key] = Math.min(atributos[key], 100);
    }

    xp += ganho;
    nivel = Math.floor(xp / 500) + 1;

    historico.push(xp);

    atualizarTela(ganho);
}

// =========================
// 🔄 UPDATE UI
// =========================
function atualizarTela(ganho) {
    document.getElementById("xp").innerText = xp;
    document.getElementById("nivel").innerText = nivel;
    document.getElementById("resultadoXP").innerText = "+" + ganho + " XP";

    document.getElementById("barraXP").value = xp % 500;

    // Atualiza radar
    radarChart.data.datasets[0].data = Object.values(atributos);
    radarChart.update();

    // Atualiza histórico
    lineChart.data.labels.push("Dia " + historico.length);
    lineChart.data.datasets[0].data = historico;
    lineChart.update();
}

// =========================
// 🌌 PARTÍCULAS (FUNDO)
// =========================
function iniciarParticulas() {
    const canvas = document.createElement("canvas");
    canvas.id = "particles";
    document.body.appendChild(canvas);

    const ctx = canvas.getContext("2d");

    canvas.style.position = "fixed";
    canvas.style.top = 0;
    canvas.style.left = 0;
    canvas.style.zIndex = "-1";

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particles = [];

    for (let i = 0; i < 80; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 2,
            dx: (Math.random() - 0.5) * 0.5,
            dy: (Math.random() - 0.5) * 0.5
        });
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = "#6a00ff";
            ctx.fill();

            p.x += p.dx;
            p.y += p.dy;

            if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
            if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
        });

        requestAnimationFrame(draw);
    }

    draw();
}

// =========================
// 🚀 INIT
// =========================
window.onload = () => {
    iniciarRadar();
    iniciarLinha();
    iniciarParticulas();
};