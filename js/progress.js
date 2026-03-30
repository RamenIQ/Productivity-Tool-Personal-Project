let congratsDismissed = false;

function getMoodEmoji(pct, total) {
  if (total === 0 || pct === 0) return '😢';
  if (pct === 100) return '😄';
  if (pct >= 50) return '🙂';
  return '😐';
}

function updateProgress(data) {
  const total = data.assignments.length;
  const completed = data.assignments.filter(a => a.completed).length;
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);

  const fill = document.getElementById('progress-fill');
  const stats = document.getElementById('progress-stats');
  const banner = document.getElementById('congrats-banner');
  const emoji = document.getElementById('progress-emoji');

  fill.style.width = pct + '%';
  fill.classList.toggle('complete', pct === 100);

  emoji.textContent = getMoodEmoji(pct, total);
  emoji.className = 'progress-emoji' + (pct === 100 ? ' happy' : '');

  if (total === 0) {
    stats.textContent = 'No assignments yet';
  } else {
    stats.textContent = `${completed} of ${total} completed (${pct}%)`;
  }

  // Show congrats when 100%, hide when not
  if (pct === 100 && total > 0 && !congratsDismissed) {
    banner.classList.add('visible');
  } else {
    banner.classList.remove('visible');
    if (pct < 100) congratsDismissed = false;
  }
}

function initProgress() {
  const closeBtn = document.getElementById('congrats-close');
  closeBtn.addEventListener('click', () => {
    congratsDismissed = true;
    document.getElementById('congrats-banner').classList.remove('visible');
  });
}
