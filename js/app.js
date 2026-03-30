document.addEventListener('DOMContentLoaded', () => {
  const data = loadData();

  setWeekLabel(data.weekLabel);
  initProgress();
  renderAssignments(data);
  updateProgress(data);
  initSchedule(data);
  renderCalendar(data);

  // Add assignment form
  const form = document.getElementById('add-form');
  const input = document.getElementById('assignment-input');
  const dateInput = document.getElementById('assignment-date');

  form.addEventListener('submit', e => {
    e.preventDefault();
    const title = input.value;
    const dueDate = dateInput.value || null;
    const added = addAssignment(data, title, dueDate);
    if (added) {
      input.value = '';
      dateInput.value = '';
      renderAssignments(data);
      updateProgress(data);
      renderCalendar(data);
      input.focus();
    }
  });
});

function setWeekLabel(weekStart) {
  const el = document.getElementById('week-label');
  const date = new Date(weekStart + 'T00:00:00');
  const options = { month: 'long', day: 'numeric', year: 'numeric' };
  el.textContent = 'Week of ' + date.toLocaleDateString(undefined, options);
}
