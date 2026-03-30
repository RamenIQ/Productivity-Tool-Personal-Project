const STORAGE_KEY = 'studentTracker';

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
      alert('Storage is full. Please remove some files before adding more.');
    }
    return false;
  }
}

function defaultData() {
  return {
    weekLabel: getWeekStart(),
    assignments: [],
    classes: []
  };
}

function migrateData(data) {
  if (!data.classes) data.classes = [];
  return data;
}

function getWeekStart() {
  const now = new Date();
  const day = now.getDay(); // 0 = Sunday
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // adjust to Monday
  const monday = new Date(now.setDate(diff));
  return monday.toISOString().split('T')[0];
}
