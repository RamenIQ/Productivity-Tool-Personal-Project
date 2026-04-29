const TAB_COLORS = {
  tasks:     '#6366f1',
  diet:      '#10b981',
  workout:   '#f97316',
  reminders: '#0ea5e9',
  goals:     '#f59e0b'
};

function initTabs() {
  const nav       = document.getElementById('tab-nav');
  const indicator = document.getElementById('tab-indicator');
  const buttons   = nav.querySelectorAll('.tab-btn');

  function activateTab(tabName) {
    buttons.forEach(btn => {
      const active = btn.dataset.tab === tabName;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-selected', active);
    });

    document.querySelectorAll('.tab-panel').forEach(panel => {
      const active = panel.id === 'panel-' + tabName;
      if (active) {
        panel.removeAttribute('hidden');
      } else {
        panel.setAttribute('hidden', '');
      }
    });

    const color = TAB_COLORS[tabName] || '#6366f1';
    indicator.style.background = color;
    nav.style.setProperty('--active-tab-color', color);

    // Shift full page background tint
    document.body.className = 'tab-' + tabName;

    positionIndicator(tabName);
  }

  function positionIndicator(tabName) {
    const activeBtn = nav.querySelector(`[data-tab="${tabName}"]`);
    if (!activeBtn) return;
    const btnRect = activeBtn.getBoundingClientRect();
    const navRect = nav.getBoundingClientRect();
    indicator.style.left  = (btnRect.left - navRect.left) + 'px';
    indicator.style.width = btnRect.width + 'px';
  }

  buttons.forEach(btn => {
    btn.addEventListener('click', () => activateTab(btn.dataset.tab));
  });

  requestAnimationFrame(() => positionIndicator('tasks'));

  window.addEventListener('resize', () => {
    const active = nav.querySelector('.tab-btn.active');
    if (active) positionIndicator(active.dataset.tab);
  });
}
