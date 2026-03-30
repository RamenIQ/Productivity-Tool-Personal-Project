const CAL_DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function renderCalendar(data) {
  const container = document.getElementById('calendar-grid');
  if (!container) return;
  container.innerHTML = '';

  const weekDates = getWeekDates(data.weekLabel);
  const today = new Date().toISOString().split('T')[0];

  weekDates.forEach((date, i) => {
    const dateStr = date.toISOString().split('T')[0];
    const isToday = dateStr === today;
    const dayName = CAL_DAY_NAMES[i];

    const dueAssignments = data.assignments.filter(a => a.dueDate === dateStr);
    const dayClasses = (data.classes || []).filter(c => c.days.includes(dayName));

    const col = document.createElement('div');
    col.className = 'cal-col' + (isToday ? ' today' : '');

    const classChips = dayClasses.map(cls => `
      <div class="cal-chip cal-class-chip" style="background:${cls.color}18;border-left:3px solid ${cls.color}">
        <span class="cal-chip-dot" style="background:${cls.color}"></span>
        <span class="cal-chip-name">${escapeHtml(cls.name)}</span>
        ${cls.startTime ? `<span class="cal-chip-time">${formatTime(cls.startTime)}</span>` : ''}
      </div>
    `).join('');

    const assignmentChips = dueAssignments.map(a => `
      <div class="cal-chip cal-assignment-chip ${a.completed ? 'done' : ''}">
        <span class="cal-chip-status">${a.completed ? '✓' : '○'}</span>
        <span class="cal-chip-name">${escapeHtml(a.title)}</span>
      </div>
    `).join('');

    col.innerHTML = `
      <div class="cal-day-header">
        <div class="cal-day-name">${dayName}</div>
        <div class="cal-day-date">${date.getDate()}</div>
      </div>
      <div class="cal-day-body">
        ${classChips}
        ${assignmentChips}
        ${dayClasses.length === 0 && dueAssignments.length === 0
          ? '<div class="cal-day-empty"></div>'
          : ''}
      </div>
    `;

    container.appendChild(col);
  });
}

function getWeekDates(weekStart) {
  const monday = new Date(weekStart + 'T00:00:00');
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}
