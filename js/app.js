document.addEventListener('DOMContentLoaded', () => {
  const data = loadData();

  // Set week label in header
  setWeekLabel(data.weekLabel);

  // Init progress close button
  initProgress();

  // Initial render
  renderAssignments(data);
  updateProgress(data);

  // Add assignment form
  const form = document.getElementById('add-form');
  const input = document.getElementById('assignment-input');

  form.addEventListener('submit', e => {
    e.preventDefault();
    const title = input.value;
    const added = addAssignment(data, title);
    if (added) {
      input.value = '';
      renderAssignments(data);
      updateProgress(data);
      input.focus();
    }
  });
});

function setWeekLabel(weekStart) {
  const el = document.getElementById('week-label');
  const date = new Date(weekStart + 'T00:00:00'); // force local parse
  const options = { month: 'long', day: 'numeric', year: 'numeric' };
  el.textContent = 'Week of ' + date.toLocaleDateString(undefined, options);
}
