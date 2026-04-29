function initTasks(data) {
  const form     = document.getElementById('task-form');
  const input    = document.getElementById('task-input');
  const dateIn   = document.getElementById('task-date');
  const priorSel = document.getElementById('task-priority');

  form.addEventListener('submit', e => {
    e.preventDefault();
    data.tasks.unshift({
      id:        genId(),
      title:     input.value.trim(),
      dueDate:   dateIn.value || null,
      priority:  priorSel.value,
      done:      false,
      createdAt: Date.now()
    });
    saveData(data);
    input.value  = '';
    dateIn.value = '';
    renderTasks(data);
    input.focus();
  });

  renderTasks(data);
}

function renderTasks(data) {
  const list  = document.getElementById('task-list');
  const empty = document.getElementById('tasks-empty');

  if (data.tasks.length === 0) {
    empty.style.display = 'block';
    list.innerHTML = '';
    updateTaskProgress(data);
    return;
  }

  empty.style.display = 'none';
  list.innerHTML = data.tasks.map(taskHTML).join('');

  list.querySelectorAll('.item-check').forEach(cb => {
    cb.addEventListener('change', () => {
      const id   = cb.closest('[data-id]').dataset.id;
      const task = data.tasks.find(t => t.id === id);
      if (!task) return;
      task.done = cb.checked;
      saveData(data);
      const card = cb.closest('.item-card');
      card.classList.toggle('completed', task.done);
      card.querySelector('.item-title').style.textDecoration = task.done ? 'line-through' : '';
      updateTaskProgress(data);
    });
  });

  list.querySelectorAll('.btn-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.closest('[data-id]').dataset.id;
      data.tasks = data.tasks.filter(t => t.id !== id);
      saveData(data);
      renderTasks(data);
    });
  });

  updateTaskProgress(data);
}

function taskHTML(task) {
  const priorClass = { high: 'tag-priority-high', med: 'tag-priority-med', low: 'tag-priority-low' }[task.priority] || 'tag-priority-low';
  const priorLabel = { high: 'High', med: 'Medium', low: 'Low' }[task.priority] || 'Low';

  let dueBadge = '';
  if (task.dueDate) {
    const overdue = !task.done && task.dueDate < todayStr();
    dueBadge = `<span class="tag tag-due${overdue ? ' overdue' : ''}">${formatDate(task.dueDate)}</span>`;
  }

  return `
    <li class="item-card${task.done ? ' completed' : ''}" data-id="${task.id}">
      <input type="checkbox" class="item-check" ${task.done ? 'checked' : ''} aria-label="Mark done">
      <div class="item-body">
        <div class="item-title">${escapeHtml(task.title)}</div>
        <div class="item-meta">
          <span class="tag ${priorClass}">${priorLabel}</span>
          ${dueBadge}
        </div>
      </div>
      <div class="item-actions">
        <button class="btn-remove" aria-label="Remove">✕</button>
      </div>
    </li>`;
}

function updateTaskProgress(data) {
  const total = data.tasks.length;
  const done  = data.tasks.filter(t => t.done).length;
  const pct   = total === 0 ? 0 : Math.round((done / total) * 100);

  document.getElementById('tasks-fill').style.width = pct + '%';
  document.getElementById('tasks-stat').textContent = total === 0
    ? 'No tasks yet'
    : `${done} / ${total} done`;

  const emoji    = document.getElementById('tasks-emoji');
  const newEmoji = total === 0 ? '🙂'
    : pct === 100 ? '🎉'
    : pct >= 75   ? '😄'
    : pct >= 50   ? '🙂'
    : pct >= 25   ? '😐'
    : '😤';

  if (emoji.textContent !== newEmoji) {
    emoji.textContent = newEmoji;
    emoji.classList.remove('bounce');
    void emoji.offsetWidth;
    emoji.classList.add('bounce');
  }
}
