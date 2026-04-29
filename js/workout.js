function initWorkout(data) {
  const form    = document.getElementById('exercise-form');
  const input   = document.getElementById('exercise-input');
  const setsIn  = document.getElementById('exercise-sets');
  const typeSel = document.getElementById('exercise-type');

  form.addEventListener('submit', e => {
    e.preventDefault();
    data.workout.exercises.push({
      id:   genId(),
      name: input.value.trim(),
      sets: setsIn.value.trim() || null,
      type: typeSel.value,
      done: false
    });
    saveData(data);
    input.value  = '';
    setsIn.value = '';
    renderExercises(data);
    input.focus();
  });

  renderExercises(data);
}

function renderExercises(data) {
  const list  = document.getElementById('exercise-list');
  const empty = document.getElementById('workout-empty');

  if (data.workout.exercises.length === 0) {
    empty.style.display = 'block';
    list.innerHTML = '';
    updateWorkoutStat(data);
    return;
  }

  empty.style.display = 'none';
  list.innerHTML = data.workout.exercises.map(exerciseHTML).join('');

  list.querySelectorAll('.item-check').forEach(cb => {
    cb.addEventListener('change', () => {
      const id = cb.closest('[data-id]').dataset.id;
      const ex = data.workout.exercises.find(e => e.id === id);
      if (!ex) return;
      ex.done = cb.checked;
      saveData(data);
      cb.closest('.item-card').classList.toggle('completed', ex.done);
      updateWorkoutStat(data);
    });
  });

  list.querySelectorAll('.btn-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.closest('[data-id]').dataset.id;
      data.workout.exercises = data.workout.exercises.filter(e => e.id !== id);
      saveData(data);
      renderExercises(data);
    });
  });

  updateWorkoutStat(data);
}

function exerciseHTML(ex) {
  const typeClass  = `tag-exercise-${ex.type}`;
  const typeLabels = { strength: '🏋️ Strength', cardio: '🏃 Cardio', flexibility: '🧘 Flexibility', other: '⚡ Other' };
  const setsTag    = ex.sets ? `<span class="tag tag-due">${escapeHtml(ex.sets)}</span>` : '';

  return `
    <li class="item-card${ex.done ? ' completed' : ''}" data-id="${ex.id}">
      <input type="checkbox" class="item-check" ${ex.done ? 'checked' : ''} aria-label="Mark done">
      <div class="item-body">
        <div class="item-title">${escapeHtml(ex.name)}</div>
        <div class="item-meta">
          <span class="tag ${typeClass}">${typeLabels[ex.type] || ex.type}</span>
          ${setsTag}
        </div>
      </div>
      <div class="item-actions">
        <button class="btn-remove" aria-label="Remove">✕</button>
      </div>
    </li>`;
}

function updateWorkoutStat(data) {
  const total = data.workout.exercises.length;
  const done  = data.workout.exercises.filter(e => e.done).length;
  const pct   = total === 0 ? 0 : Math.round((done / total) * 100);
  document.getElementById('workout-fill').style.width = pct + '%';
  document.getElementById('workout-stat').textContent = total === 0
    ? 'No exercises yet'
    : `${done} / ${total} done`;
}
