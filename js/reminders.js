function initReminders(data) {
  const form      = document.getElementById('reminder-form');
  const input     = document.getElementById('reminder-input');
  const dateIn    = document.getElementById('reminder-date');
  const timeIn    = document.getElementById('reminder-time');
  const repeatSel = document.getElementById('reminder-repeat');
  const catSel    = document.getElementById('reminder-category');

  form.addEventListener('submit', e => {
    e.preventDefault();
    data.reminders.push({
      id:       genId(),
      title:    input.value.trim(),
      date:     dateIn.value  || null,
      time:     timeIn.value  || null,
      repeat:   repeatSel.value,
      category: catSel.value,
      done:     false,
      createdAt: Date.now()
    });
    saveData(data);
    input.value = '';
    dateIn.value = '';
    timeIn.value = '';
    renderReminders(data);
    input.focus();
  });

  renderReminders(data);
}

function renderReminders(data) {
  const empty    = document.getElementById('reminders-empty');
  const overdueSec  = document.getElementById('overdue-section');
  const todaySec    = document.getElementById('today-section');
  const upcomingSec = document.getElementById('upcoming-section');
  const overdueList  = document.getElementById('overdue-list');
  const todayList    = document.getElementById('today-list');
  const upcomingList = document.getElementById('upcoming-list');

  const today = todayStr();
  const active = data.reminders.filter(r => !r.done || r.repeat !== 'none');

  const overdue  = data.reminders.filter(r => !r.done && r.date && r.date < today);
  const todayRem = data.reminders.filter(r => !r.done && r.date === today);
  const upcoming = data.reminders.filter(r => !r.done && (!r.date || r.date > today));
  const doneAll  = data.reminders.filter(r => r.done && r.repeat === 'none');

  const allVisible = overdue.length + todayRem.length + upcoming.length + doneAll.length;

  if (allVisible === 0) {
    empty.style.display = 'block';
  } else {
    empty.style.display = 'none';
  }

  // Overdue section
  if (overdue.length > 0) {
    overdueSec.style.display = 'block';
    overdueList.innerHTML = overdue.map(r => reminderHTML(r, 'overdue')).join('');
    bindReminderEvents(overdueList, data);
  } else {
    overdueSec.style.display = 'none';
  }

  // Today section
  if (todayRem.length > 0) {
    todaySec.style.display = 'block';
    todayList.innerHTML = todayRem.map(r => reminderHTML(r, 'today')).join('');
    bindReminderEvents(todayList, data);
  } else {
    todaySec.style.display = 'none';
  }

  // Upcoming + done
  const upcomingAll = [...upcoming, ...doneAll];
  if (upcomingAll.length > 0) {
    upcomingSec.style.display = 'block';
    upcomingList.innerHTML = upcomingAll.map(r => reminderHTML(r, r.done ? 'done' : 'upcoming')).join('');
    bindReminderEvents(upcomingList, data);
  } else {
    upcomingSec.style.display = 'none';
  }

  updateRemindersStat(data);
}

function reminderHTML(r, state) {
  const catIcons = { health: '❤️', work: '💼', personal: '🌟', other: '📌' };
  const icon     = catIcons[r.category] || '📌';

  const catClass = `tag-cat-${r.category || 'none'}`;
  const catLabel = { health: 'Health', work: 'Work', personal: 'Personal', other: 'Other' }[r.category] || r.category;

  const repeatTag = r.repeat !== 'none'
    ? `<span class="tag tag-repeat-${r.repeat}">${r.repeat === 'daily' ? '🔁 Daily' : '📆 Weekly'}</span>`
    : '';

  const dtStr = formatDateTime(r.date, r.time);
  const dtTag = dtStr ? `<span class="tag tag-due${state === 'overdue' ? ' overdue' : state === 'today' ? ' today' : ''}">${dtStr}</span>` : '';

  const stateClass = state === 'overdue' ? 'reminder-overdue'
    : state === 'today' ? 'reminder-today'
    : state === 'done'  ? 'reminder-done'
    : '';

  return `
    <li class="item-card ${stateClass}" data-id="${r.id}">
      <span style="font-size:1.3rem;flex-shrink:0">${icon}</span>
      <div class="item-body">
        <div class="item-title">${escapeHtml(r.title)}</div>
        <div class="item-meta">
          <span class="tag ${catClass}">${catLabel}</span>
          ${dtTag}
          ${repeatTag}
        </div>
      </div>
      <div class="item-actions">
        <button class="btn-done-reminder" aria-label="${r.done ? 'Undo' : 'Mark done'}">${r.done ? '↩ Undo' : '✓ Done'}</button>
        <button class="btn-remove" aria-label="Delete">✕</button>
      </div>
    </li>`;
}

function bindReminderEvents(container, data) {
  container.querySelectorAll('.btn-done-reminder').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.closest('[data-id]').dataset.id;
      const r  = data.reminders.find(x => x.id === id);
      if (!r) return;
      r.done = !r.done;
      // Auto-advance repeat reminders
      if (r.done && r.repeat !== 'none' && r.date) {
        const d = new Date(r.date + 'T00:00:00');
        d.setDate(d.getDate() + (r.repeat === 'daily' ? 1 : 7));
        r.date = d.toISOString().split('T')[0];
        r.done = false;
      }
      saveData(data);
      renderReminders(data);
    });
  });

  container.querySelectorAll('.btn-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.closest('[data-id]').dataset.id;
      data.reminders = data.reminders.filter(x => x.id !== id);
      saveData(data);
      renderReminders(data);
    });
  });
}

function updateRemindersStat(data) {
  const today    = todayStr();
  const total    = data.reminders.length;
  const done     = data.reminders.filter(r => r.done).length;
  const overdue  = data.reminders.filter(r => !r.done && r.date && r.date < today).length;
  const todayRem = data.reminders.filter(r => !r.done && r.date === today).length;

  let pct = total === 0 ? 0 : Math.round((done / total) * 100);
  document.getElementById('reminders-fill').style.width = pct + '%';

  if (total === 0) {
    document.getElementById('reminders-stat').textContent = 'No reminders yet';
  } else if (overdue > 0) {
    document.getElementById('reminders-stat').textContent = `${overdue} overdue`;
  } else if (todayRem > 0) {
    document.getElementById('reminders-stat').textContent = `${todayRem} due today`;
  } else {
    document.getElementById('reminders-stat').textContent = `${done} / ${total} done`;
  }
}
