document.addEventListener('DOMContentLoaded', () => {
  // Referencias al DOM
  const currentScoreEl = document.getElementById('current-score');
  const timeRemainingEl = document.getElementById('time-remaining');
  const sessionRecordEl = document.getElementById('session-record');
  const bestMarkEl = document.getElementById('best-mark');
  const currentStreakEl = document.getElementById('current-streak');
  const timeProgressEl = document.getElementById('time-progress');
  const statusDotEl = document.getElementById('status-dot');
  const statusTextEl = document.getElementById('game-status-text');
  const modeBadgeEl = document.getElementById('mode-badge');
  const feedbackEl = document.getElementById('game-feedback');
  const rankingListEl = document.getElementById('ranking-list');

  // Botones
  const btnStart = document.getElementById('btn-start');
  const btnScore = document.getElementById('btn-score');
  const btnMiss = document.getElementById('btn-miss');
  const btnReset = document.getElementById('btn-reset');

  // Estado del juego
  const GAME_DURATION = 60;
  let timeLeft = GAME_DURATION;
  let score = 0;
  let streak = 0;
  let sessionRecord = 0;
  let globalBest = 42;
  let timerId = null;
  let isPlaying = false;

  // Datos iniciales del ranking
  let players = [
    { name: 'Martina', lastScore: 36, best: 42, color: 'orange' },
    { name: 'Diego', lastScore: 31, best: 38, color: 'cyan' },
    { name: 'Alex', lastScore: 28, best: 35, color: 'blue' }
  ];

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  function updateUI() {
    currentScoreEl.textContent = score;
    timeRemainingEl.textContent = formatTime(timeLeft);
    sessionRecordEl.textContent = sessionRecord;
    bestMarkEl.textContent = globalBest;
    currentStreakEl.textContent = streak;

    const percentage = (timeLeft / GAME_DURATION) * 100;
    timeProgressEl.style.width = `${percentage}%`;
  }

  function startGame() {
    if (isPlaying) return;

    isPlaying = true;
    score = 0;
    streak = 0;
    timeLeft = GAME_DURATION;

    btnStart.disabled = true;
    btnScore.disabled = false;
    btnMiss.disabled = false;

    statusDotEl.classList.add('active');
    statusTextEl.textContent = 'PARTIDA EN CURSO';
    modeBadgeEl.textContent = 'EN VIVO';
    feedbackEl.textContent = 'Haz clic en "Encestar (+1)" o presiona la barra espaciadora para anotar.';

    updateUI();

    timerId = setInterval(() => {
      timeLeft -= 1;
      updateUI();

      if (timeLeft <= 0) {
        endGame();
      }
    }, 1000);
  }

  function registerBasket() {
    if (!isPlaying) return;

    score += 1;
    streak += 1;

    if (score > sessionRecord) {
      sessionRecord = score;
    }

    if (score > globalBest) {
      globalBest = score;
    }

    updateUI();
  }

  function registerMiss() {
    if (!isPlaying) return;
    streak = 0;
    feedbackEl.textContent = 'Tiro fallado: racha reiniciada a 0. Sigue lanzando.';
    updateUI();
  }

  function endGame() {
    clearInterval(timerId);
    isPlaying = false;

    btnStart.disabled = false;
    btnScore.disabled = true;
    btnMiss.disabled = true;

    statusDotEl.classList.remove('active');
    statusTextEl.textContent = 'TIEMPO AGOTADO';
    modeBadgeEl.textContent = 'FINALIZADO';
    feedbackEl.textContent = `Partida terminada. Encestaste ${score} balones en 60 segundos.`;

    updateRanking('Tú (Sesión)', score);
  }

  function resetGame() {
    clearInterval(timerId);
    isPlaying = false;
    timeLeft = GAME_DURATION;
    score = 0;
    streak = 0;

    btnStart.disabled = false;
    btnScore.disabled = true;
    btnMiss.disabled = true;

    statusDotEl.classList.remove('active');
    statusTextEl.textContent = 'LISTO PARA INICIAR';
    modeBadgeEl.textContent = 'EN ESPERA';
    feedbackEl.textContent = 'Marcador reiniciado. Presiona "Iniciar 60s" para comenzar.';

    updateUI();
  }

  function updateRanking(playerName, finalScore) {
    const existing = players.find(p => p.name === playerName);
    if (existing) {
      existing.lastScore = finalScore;
      if (finalScore > existing.best) {
        existing.best = finalScore;
      }
    } else {
      players.push({
        name: playerName,
        lastScore: finalScore,
        best: finalScore,
        color: 'orange'
      });
    }

    // Ordenar por mejor récord descendente
    players.sort((a, b) => b.best - a.best);

    // Renderizar filas manteniendo la cabecera
    const headerHTML = `
      <div class="rank-row rank-head">
        <span>#</span>
        <span>JUGADOR</span>
        <span>ÚLTIMA PARTIDA</span>
        <span>RÉCORD</span>
      </div>
    `;

    const medalClasses = ['gold', 'silver', 'bronze'];
    const crownSVG = `
      <svg class="icon-crown" viewBox="0 0 24 24" fill="currentColor">
        <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 14h14v2H5v-2z"></path>
      </svg>
    `;

    const rowsHTML = players.map((player, index) => {
      const rankNum = String(index + 1).padStart(2, '0');
      const rankClass = medalClasses[index] || '';
      const crown = index === 0 ? crownSVG : '';

      return `
        <div class="rank-row">
          <span class="rank ${rankClass}">${rankNum}</span>
          <span class="player">
            <span class="avatar-ring ${player.color}">
              <img src="assets/avatar-usuario.png" alt="Avatar de ${player.name}">
            </span>
            ${player.name}
          </span>
          <b>${player.lastScore}</b>
          <span class="best">${player.best} ${crown}</span>
        </div>
      `;
    }).join('');

    rankingListEl.innerHTML = headerHTML + rowsHTML;
  }

  // Eventos de botones
  btnStart.addEventListener('click', startGame);
  btnScore.addEventListener('click', registerBasket);
  btnMiss.addEventListener('click', registerMiss);
  btnReset.addEventListener('click', resetGame);

  // Atajo de teclado: Barra espaciadora para encestar durante la partida
  document.addEventListener('keydown', (event) => {
    if (event.code === 'Space' && isPlaying) {
      event.preventDefault();
      registerBasket();
    }
  });

  updateUI();
});
