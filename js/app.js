document.addEventListener('DOMContentLoaded', () => {
  const dateEl = document.getElementById('header-date');
  if (dateEl) {
    dateEl.textContent = new Date().toLocaleDateString(undefined, {
      weekday: 'short', month: 'short', day: 'numeric'
    });
  }

  const data = loadData();

  initTabs();
  initTasks(data);
  initDiet(data);
  initWorkout(data);
  initReminders(data);
  initGoals(data);
});
