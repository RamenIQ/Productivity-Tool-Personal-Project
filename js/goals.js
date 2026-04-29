const GOAL_QUOTES = [
  { text: "The secret of getting ahead is getting started.", cite: "— Mark Twain" },
  { text: "It always seems impossible until it's done.", cite: "— Nelson Mandela" },
  { text: "Dream big and dare to fail.", cite: "— Norman Vaughan" },
  { text: "You don't have to be great to start, but you have to start to be great.", cite: "— Zig Ziglar" },
  { text: "A goal without a plan is just a wish.", cite: "— Antoine de Saint-Exupéry" },
  { text: "The only way to do great work is to love what you do.", cite: "— Steve Jobs" },
  { text: "Push yourself, because no one else is going to do it for you.", cite: "— Unknown" }
];

let activeGoalType = 'short';

function initGoals(data) {
  // Rotating quote
  const q = GOAL_QUOTES[Math.floor(Math.random() * GOAL_QUOTES.length)];
  document.getElementById('goals-quote').textContent = q.text;
  document.getElementById('goals-cite').textContent  = q.cite;

  // Type toggle
  document.querySelectorAll('.goal-type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      activeGoalType = btn.dataset.gtype;
      document.querySelectorAll('.goal-type-btn').forEach(b => b.classList.toggle('active', b.dataset.gtype === activeGoalType));
      document.getElementById('section-short').style.display = activeGoalType === 'short' ? 'block' : 'none';
      document.getElementById('section-long').style.display  = activeGoalType === 'long'  ? 'block' : 'none';
    });
  });

  // Short-term form
  const shortForm  = document.getElementById('short-goal-form');
  const shortInput = document.getElementById('short-goal-input');
  const shortDate  = document.getElementById('short-goal-date');
  const shortCat   = document.getElementById('short-goal-category');

  shortForm.addEventListener('submit', e => {
    e.preventDefault();
    data.goals.unshift({
      id:         genId(),
      title:      shortInput.value.trim(),
      targetDate: shortDate.value || null,
      category:   shortCat.value,
      type:       'short',
      done:       false,
      createdAt:  Date.now()
    });
    saveData(data);
    shortInput.value = '';
    shortDate.value  = '';
    renderGoals(data);
    shortInput.focus();
  });

  // Long-term form
  const longForm  = document.getElementById('long-goal-form');
  const longInput = document.getElementById('long-goal-input');
  const longDate  = document.getElementById('long-goal-date');
  const longCat   = document.getElementById('long-goal-category');

  longForm.addEventListener('submit', e => {
    e.preventDefault();
    data.goals.unshift({
      id:         genId(),
      title:      longInput.value.trim(),
      targetDate: longDate.value || null,
      category:   longCat.value,
      type:       'long',
      progress:   0,
      createdAt:  Date.now()
    });
    saveData(data);
    longInput.value = '';
    longDate.value  = '';
    renderGoals(data);
    longInput.focus();
  });

  renderGoals(data);
}

function renderGoals(data) {
  const shortGoals = data.goals.filter(g => g.type === 'short');
  const longGoals  = data.goals.filter(g => g.type === 'long');

  // Update type counts
  document.getElementById('short-count').textContent = shortGoals.length;
  document.getElementById('long-count').textContent  = longGoals.length;

  renderShortGoals(shortGoals, data);
  renderLongGoals(longGoals, data);
  updateGoalsStat(data);
}

function renderShortGoals(goals, data) {
  const list  = document.getElementById('short-goal-list');
  const empty = document.getElementById('short-goals-empty');

  if (goals.length === 0) {
    empty.style.display = 'block';
    list.innerHTML = '';
    return;
  }

  empty.style.display = 'none';
  list.innerHTML = goals.map(shortGoalHTML).join('');

  list.querySelectorAll('.goal-check').forEach(cb => {
    cb.addEventListener('change', () => {
      const id   = cb.closest('[data-id]').dataset.id;
      const goal = data.goals.find(g => g.id === id);
      if (!goal) return;
      goal.done = cb.checked;
      saveData(data);
      cb.closest('.goal-card').classList.toggle('goal-done', goal.done);
      updateGoalsStat(data);
    });
  });

  list.querySelectorAll('.btn-remove-goal').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.closest('[data-id]').dataset.id;
      data.goals = data.goals.filter(g => g.id !== id);
      saveData(data);
      renderGoals(data);
    });
  });
}

function shortGoalHTML(goal) {
  const catIcons = { health: '❤️', career: '💼', learning: '📚', finance: '💰', personal: '🌟' };
  const catLabels = { health: 'Health', career: 'Career', learning: 'Learning', finance: 'Finance', personal: 'Personal' };
  const icon  = catIcons[goal.category]  || '🌟';
  const label = catLabels[goal.category] || goal.category;
  const today = todayStr();
  const overdue = goal.targetDate && goal.targetDate < today && !goal.done;
  const dueTag  = goal.targetDate
    ? `<span class="tag tag-due${overdue ? ' overdue' : ''}">${formatDate(goal.targetDate)}</span>`
    : '';
  const doneBadge = goal.done ? `<span class="achieved-badge">✓ Done!</span>` : '';

  return `
    <div class="goal-card${goal.done ? ' goal-done' : ''}" data-id="${goal.id}">
      <input type="checkbox" class="goal-check" ${goal.done ? 'checked' : ''} aria-label="Mark done">
      <div class="goal-body">
        <div class="goal-title">${escapeHtml(goal.title)}</div>
        <div class="goal-meta">
          <span class="tag tag-cat-${goal.category}">${icon} ${label}</span>
          ${dueTag}
          ${doneBadge}
        </div>
      </div>
      <button class="btn-remove-goal" type="button" aria-label="Remove">✕</button>
    </div>`;
}

function renderLongGoals(goals, data) {
  const list  = document.getElementById('long-goal-list');
  const empty = document.getElementById('long-goals-empty');

  if (goals.length === 0) {
    empty.style.display = 'block';
    list.innerHTML = '';
    return;
  }

  empty.style.display = 'none';
  list.innerHTML = goals.map(longGoalHTML).join('');

  list.querySelectorAll('.goal-card').forEach(card => {
    const id   = card.dataset.id;
    const goal = data.goals.find(g => g.id === id);
    if (!goal) return;

    const pctInput = card.querySelector('.goal-pct-input');
    const fill     = card.querySelector('.goal-progress-fill');
    const label    = card.querySelector('.goal-pct-label');

    const apply = val => {
      val = Math.max(0, Math.min(100, val));
      goal.progress = val;
      saveData(data);
      fill.style.width    = val + '%';
      label.textContent   = val + '%';
      pctInput.value      = val + '%';
      card.classList.toggle('goal-achieved', val === 100);
      updateGoalsStat(data);
    };

    pctInput.addEventListener('focus', () => {
      pctInput.value = parseInt(pctInput.value) || 0;
      pctInput.select();
    });
    pctInput.addEventListener('blur',    () => apply(parseInt(pctInput.value) || 0));
    pctInput.addEventListener('keydown', e => { if (e.key === 'Enter') pctInput.blur(); });

    card.querySelector('.btn-remove-goal').addEventListener('click', () => {
      data.goals = data.goals.filter(g => g.id !== id);
      saveData(data);
      renderGoals(data);
    });
  });
}

function longGoalHTML(goal) {
  const catIcons  = { health: '❤️', career: '💼', learning: '📚', finance: '💰', personal: '🌟' };
  const catLabels = { health: 'Health', career: 'Career', learning: 'Learning', finance: 'Finance', personal: 'Personal' };
  const icon      = catIcons[goal.category]  || '🌟';
  const label     = catLabels[goal.category] || goal.category;
  const progress  = goal.progress || 0;
  const achieved  = progress === 100;
  const dateTag   = goal.targetDate
    ? `<span class="tag tag-due">Target: ${formatDate(goal.targetDate)}</span>`
    : '';
  const achBadge  = achieved ? `<span class="achieved-badge">✓ Achieved!</span>` : '';

  return `
    <div class="goal-card goal-card-long${achieved ? ' goal-achieved' : ''}" data-id="${goal.id}">
      <div class="goal-card-top">
        <span class="goal-cat-icon">${icon}</span>
        <div class="goal-info">
          <div class="goal-title">${escapeHtml(goal.title)}</div>
          <div class="goal-meta">
            <span class="tag tag-cat-${goal.category}">${label}</span>
            ${dateTag}
            ${achBadge}
          </div>
        </div>
        <button class="btn-remove-goal" type="button" aria-label="Remove">✕</button>
      </div>
      <div class="goal-footer">
        <span class="goal-pct-label">${progress}%</span>
        <div class="goal-progress-track">
          <div class="goal-progress-fill" style="width:${progress}%"></div>
        </div>
        <input type="text" class="goal-pct-input" value="${progress}%" aria-label="Progress %">
      </div>
    </div>`;
}

function updateGoalsStat(data) {
  const total    = data.goals.length;
  const short    = data.goals.filter(g => g.type === 'short');
  const long     = data.goals.filter(g => g.type === 'long');
  const achieved = short.filter(g => g.done).length + long.filter(g => (g.progress || 0) === 100).length;
  const avgPct   = total === 0 ? 0 : Math.round(
    data.goals.reduce((s, g) => {
      return s + (g.type === 'short' ? (g.done ? 100 : 0) : (g.progress || 0));
    }, 0) / total
  );

  document.getElementById('goals-fill').style.width = avgPct + '%';
  document.getElementById('goals-stat').textContent = total === 0
    ? '0 / 0 achieved'
    : `${achieved} / ${total} achieved`;
}
