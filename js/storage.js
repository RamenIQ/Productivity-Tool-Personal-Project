const STORAGE_KEY = 'momentum_v2';

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultData();
    return migrateData(JSON.parse(raw));
  } catch {
    return defaultData();
  }
}

function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (e) {
    if (e.name === 'QuotaExceededError') {
      alert('Storage is full. Please remove some items.');
    }
    return false;
  }
}

function defaultData() {
  return {
    tasks: [],
    diet: {
      meals: [],
      water: 0,
      waterGoal: 8,
      calorieGoal: 2000,
      customGoals: [],
      lastReset: todayStr()
    },
    workout: {
      exercises: [],
      lastReset: todayStr()
    },
    reminders: [],
    goals: []
  };
}

function migrateData(data) {
  if (!data.tasks)     data.tasks = [];
  if (!data.reminders) data.reminders = [];
  if (!data.goals)     data.goals = [];

  if (!data.diet) {
    data.diet = { meals: [], water: 0, waterGoal: 8, calorieGoal: 2000, customGoals: [], lastReset: todayStr() };
  } else {
    if (data.diet.waterGoal   == null) data.diet.waterGoal   = 8;
    if (data.diet.calorieGoal == null) data.diet.calorieGoal = 2000;
    if (!data.diet.customGoals)        data.diet.customGoals  = [];
  }

  if (!data.workout) {
    data.workout = { exercises: [], lastReset: todayStr() };
  }

  // Daily reset for diet & workout
  if (data.diet.lastReset !== todayStr()) {
    data.diet.meals  = [];
    data.diet.water  = 0;
    data.diet.customGoals = data.diet.customGoals.map(g => ({ ...g, done: false }));
    data.diet.lastReset = todayStr();
  }
  if (data.workout.lastReset !== todayStr()) {
    data.workout.exercises = [];
    data.workout.lastReset = todayStr();
  }

  // Ensure goals have type field
  data.goals = data.goals.map(g => ({
    type: 'short',
    progress: 0,
    done: false,
    ...g
  }));

  return data;
}

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function formatDateTime(dateStr, timeStr) {
  const parts = [];
  if (dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    parts.push(d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }));
  }
  if (timeStr) {
    const [h, m] = timeStr.split(':').map(Number);
    const d = new Date(); d.setHours(h, m);
    parts.push(d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  }
  return parts.join(' · ');
}
