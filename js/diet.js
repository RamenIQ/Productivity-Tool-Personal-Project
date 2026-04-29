function initDiet(data) {
  initDietSettings(data);
  renderWaterGlasses(data);
  initMealForm(data);
  renderMeals(data);
  initCustomGoals(data);
}

/* ---- Settings (edit water/calorie goals) ---- */
function initDietSettings(data) {
  const btn         = document.getElementById('diet-settings-btn');
  const panel       = document.getElementById('diet-settings-panel');
  const waterInput  = document.getElementById('water-goal-input');
  const calInput    = document.getElementById('cal-goal-input');
  const saveBtn     = document.getElementById('save-diet-goals');
  const cancelBtn   = document.getElementById('cancel-diet-goals');

  btn.addEventListener('click', () => {
    waterInput.value = data.diet.waterGoal;
    calInput.value   = data.diet.calorieGoal;
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
  });

  saveBtn.addEventListener('click', () => {
    const wg = Math.max(1, Math.min(30, parseInt(waterInput.value) || 8));
    const cg = Math.max(500, Math.min(10000, parseInt(calInput.value) || 2000));
    data.diet.waterGoal   = wg;
    data.diet.calorieGoal = cg;
    saveData(data);
    panel.style.display = 'none';
    updateGoalsEditBar(data);
    renderWaterGlasses(data);
    updateWaterStat(data);
    updateCalStat(data);
  });

  cancelBtn.addEventListener('click', () => {
    panel.style.display = 'none';
  });

  updateGoalsEditBar(data);
}

function updateGoalsEditBar(data) {
  document.getElementById('water-goal-display').textContent = data.diet.waterGoal;
  document.getElementById('cal-goal-display').textContent   = data.diet.calorieGoal.toLocaleString();
  document.getElementById('custom-goal-count').textContent  = data.diet.customGoals.length;
  document.getElementById('hero-water-label').textContent   = `${data.diet.water}/${data.diet.waterGoal}`;
  document.getElementById('hero-cal-label').textContent     = `${data.diet.meals.reduce((s,m) => s + (m.calories||0), 0)}/${data.diet.calorieGoal}`;
}

/* ---- Water glasses ---- */
function renderWaterGlasses(data) {
  const container = document.getElementById('water-glasses');
  const goal      = data.diet.waterGoal;
  const filled    = data.diet.water;
  container.innerHTML = '';

  for (let i = 0; i < goal; i++) {
    const btn = document.createElement('button');
    btn.type      = 'button';
    btn.className = 'glass-btn' + (i < filled ? ' filled' : '');
    btn.setAttribute('aria-label', `Glass ${i + 1}`);
    btn.innerHTML = `<span class="glass-icon">🥤</span>`;
    btn.addEventListener('click', () => {
      data.diet.water = i < data.diet.water ? i : i + 1;
      saveData(data);
      renderWaterGlasses(data);
      updateWaterStat(data);
      updateGoalsEditBar(data);
    });
    container.appendChild(btn);
  }

  updateWaterStat(data);
}

function updateWaterStat(data) {
  const count = data.diet.water;
  const goal  = data.diet.waterGoal;
  const pct   = Math.min(Math.round((count / goal) * 100), 100);
  document.getElementById('water-fill').style.width = pct + '%';
  document.getElementById('water-stat').textContent = `${count} / ${goal} glasses`;
}

/* ---- Meals ---- */
function initMealForm(data) {
  const form     = document.getElementById('meal-form');
  const input    = document.getElementById('meal-input');
  const calInput = document.getElementById('meal-calories');
  const typeSel  = document.getElementById('meal-type');

  form.addEventListener('submit', e => {
    e.preventDefault();
    data.diet.meals.unshift({
      id:       genId(),
      name:     input.value.trim(),
      calories: parseInt(calInput.value) || 0,
      type:     typeSel.value,
      time:     new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    saveData(data);
    input.value    = '';
    calInput.value = '';
    renderMeals(data);
    updateGoalsEditBar(data);
    input.focus();
  });
}

function renderMeals(data) {
  const list  = document.getElementById('meal-list');
  const empty = document.getElementById('diet-empty');

  if (data.diet.meals.length === 0) {
    empty.style.display = 'block';
    list.innerHTML = '';
    updateCalStat(data);
    return;
  }

  empty.style.display = 'none';
  list.innerHTML = data.diet.meals.map(mealHTML).join('');

  list.querySelectorAll('.btn-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.closest('[data-id]').dataset.id;
      data.diet.meals = data.diet.meals.filter(m => m.id !== id);
      saveData(data);
      renderMeals(data);
      updateGoalsEditBar(data);
    });
  });

  updateCalStat(data);
}

function mealHTML(meal) {
  const icons  = { breakfast: '☀️', lunch: '🌤️', dinner: '🌙', snack: '🍎' };
  const labels = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', snack: 'Snack' };
  const calTag = meal.calories ? `<span class="tag tag-cal">${meal.calories} kcal</span>` : '';
  return `
    <li class="item-card" data-id="${meal.id}">
      <span style="font-size:1.35rem;flex-shrink:0;line-height:1">${icons[meal.type] || '🍽️'}</span>
      <div class="item-body">
        <div class="item-title">${escapeHtml(meal.name)}</div>
        <div class="item-meta">
          <span class="tag tag-meal-${meal.type}">${labels[meal.type] || meal.type}</span>
          ${calTag}
          <span class="tag tag-due">${meal.time}</span>
        </div>
      </div>
      <div class="item-actions">
        <button class="btn-remove" aria-label="Remove">✕</button>
      </div>
    </li>`;
}

function updateCalStat(data) {
  const total = data.diet.meals.reduce((s, m) => s + (m.calories || 0), 0);
  const goal  = data.diet.calorieGoal;
  const pct   = Math.min(Math.round((total / goal) * 100), 100);
  document.getElementById('cal-fill').style.width = pct + '%';
  document.getElementById('cal-stat').textContent = `${total.toLocaleString()} / ${goal.toLocaleString()} kcal`;
  document.getElementById('hero-cal-label').textContent = `${total}/${goal}`;
}

/* ---- Custom diet goals ---- */
function initCustomGoals(data) {
  const form  = document.getElementById('custom-goal-form');
  const input = document.getElementById('custom-goal-input');

  form.addEventListener('submit', e => {
    e.preventDefault();
    data.diet.customGoals.push({ id: genId(), title: input.value.trim(), done: false });
    saveData(data);
    input.value = '';
    renderCustomGoals(data);
    updateGoalsEditBar(data);
    input.focus();
  });

  renderCustomGoals(data);
}

function renderCustomGoals(data) {
  const list  = document.getElementById('custom-goal-list');
  const empty = document.getElementById('custom-goals-empty');

  if (data.diet.customGoals.length === 0) {
    empty.style.display = 'block';
    list.innerHTML = '';
    return;
  }

  empty.style.display = 'none';
  list.innerHTML = data.diet.customGoals.map(g => `
    <li class="item-card${g.done ? ' completed' : ''}" data-id="${g.id}">
      <input type="checkbox" class="item-check" ${g.done ? 'checked' : ''} aria-label="Mark done">
      <div class="item-body">
        <div class="item-title">${escapeHtml(g.title)}</div>
      </div>
      <div class="item-actions">
        <button class="btn-remove" aria-label="Remove">✕</button>
      </div>
    </li>`).join('');

  list.querySelectorAll('.item-check').forEach(cb => {
    cb.addEventListener('change', () => {
      const id   = cb.closest('[data-id]').dataset.id;
      const goal = data.diet.customGoals.find(g => g.id === id);
      if (!goal) return;
      goal.done = cb.checked;
      saveData(data);
      cb.closest('.item-card').classList.toggle('completed', goal.done);
    });
  });

  list.querySelectorAll('.btn-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.closest('[data-id]').dataset.id;
      data.diet.customGoals = data.diet.customGoals.filter(g => g.id !== id);
      saveData(data);
      renderCustomGoals(data);
      updateGoalsEditBar(data);
    });
  });
}
