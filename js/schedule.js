const CLASS_COLORS = ['#667eea', '#fc8181', '#f6ad55', '#4fd1c5', '#b794f4', '#68d391'];

function addScheduleClass(data, classData) {
  data.classes.push({
    id: generateId(),
    name: classData.name.trim(),
    days: classData.days,
    startTime: classData.startTime,
    endTime: classData.endTime,
    room: classData.room.trim(),
    color: classData.color
  });
  saveData(data);
}

function removeScheduleClass(data, id) {
  data.classes = data.classes.filter(c => c.id !== id);
  saveData(data);
}

function renderSchedule(data) {
  const container = document.getElementById('schedule-list');
  const emptyState = document.getElementById('schedule-empty');

  container.innerHTML = '';

  if (!data.classes || data.classes.length === 0) {
    emptyState.style.display = 'block';
    return;
  }

  emptyState.style.display = 'none';

  data.classes.forEach(cls => {
    const card = document.createElement('div');
    card.className = 'class-card';
    card.style.borderLeftColor = cls.color;

    const timeStr = cls.startTime
      ? `${formatTime(cls.startTime)}${cls.endTime ? ' – ' + formatTime(cls.endTime) : ''}`
      : '';

    card.innerHTML = `
      <div class="class-card-dot" style="background:${cls.color}"></div>
      <div class="class-card-info">
        <div class="class-name">${escapeHtml(cls.name)}</div>
        <div class="class-meta">
          <span class="class-days">${cls.days.join(' · ')}</span>
          ${timeStr ? `<span class="class-time">${timeStr}</span>` : ''}
          ${cls.room ? `<span class="class-room">${escapeHtml(cls.room)}</span>` : ''}
        </div>
      </div>
      <button class="btn-remove-class" data-id="${cls.id}" aria-label="Remove class">✕</button>
    `;

    container.appendChild(card);
  });

  container.querySelectorAll('.btn-remove-class').forEach(btn => {
    btn.addEventListener('click', () => {
      removeScheduleClass(data, btn.dataset.id);
      renderSchedule(data);
      renderCalendar(data);
    });
  });
}

function initSchedule(data) {
  // Build color swatches
  const colorPicker = document.getElementById('class-color-picker');
  CLASS_COLORS.forEach((color, i) => {
    const swatch = document.createElement('button');
    swatch.type = 'button';
    swatch.className = 'color-swatch' + (i === 0 ? ' selected' : '');
    swatch.style.background = color;
    swatch.dataset.color = color;
    swatch.setAttribute('aria-label', `Color ${i + 1}`);
    swatch.addEventListener('click', () => {
      colorPicker.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
      swatch.classList.add('selected');
    });
    colorPicker.appendChild(swatch);
  });

  // Toggle add-class form
  const toggleBtn = document.getElementById('toggle-add-class');
  const formBox = document.getElementById('add-class-form-box');
  toggleBtn.addEventListener('click', () => {
    const open = formBox.classList.toggle('open');
    toggleBtn.textContent = open ? '− Cancel' : '+ Add Class';
  });

  // Submit form
  const form = document.getElementById('add-class-form');
  form.addEventListener('submit', e => {
    e.preventDefault();

    const name = document.getElementById('class-name-input').value.trim();
    if (!name) return;

    const days = Array.from(document.querySelectorAll('.day-checkbox:checked')).map(cb => cb.value);
    if (days.length === 0) {
      document.getElementById('class-form-error').textContent = 'Select at least one day.';
      document.getElementById('class-form-error').style.display = 'block';
      return;
    }

    document.getElementById('class-form-error').style.display = 'none';

    const startTime = document.getElementById('class-start').value;
    const endTime = document.getElementById('class-end').value;
    const room = document.getElementById('class-room').value;
    const selectedSwatch = colorPicker.querySelector('.color-swatch.selected');
    const color = selectedSwatch ? selectedSwatch.dataset.color : CLASS_COLORS[0];

    addScheduleClass(data, { name, days, startTime, endTime, room, color });
    renderSchedule(data);
    renderCalendar(data);

    // Reset form and close
    form.reset();
    colorPicker.querySelectorAll('.color-swatch').forEach((s, i) => {
      s.classList.toggle('selected', i === 0);
    });
    formBox.classList.remove('open');
    toggleBtn.textContent = '+ Add Class';
  });

  renderSchedule(data);
}

function formatTime(time) {
  if (!time) return '';
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
}
