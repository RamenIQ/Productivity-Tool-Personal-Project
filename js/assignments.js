// Tracks which resource panel is open (by assignment id)
let openPanelId = null;

function generateId() {
  return (typeof crypto !== 'undefined' && crypto.randomUUID)
    ? crypto.randomUUID()
    : Date.now().toString() + Math.random().toString(36).slice(2);
}

function createAssignment(title) {
  return {
    id: generateId(),
    title: title.trim(),
    completed: false,
    createdAt: Date.now(),
    resources: []
  };
}

function addAssignment(data, title) {
  if (!title.trim()) return false;
  data.assignments.push(createAssignment(title));
  saveData(data);
  return true;
}

function removeAssignment(data, id) {
  data.assignments = data.assignments.filter(a => a.id !== id);
  if (openPanelId === id) openPanelId = null;
  saveData(data);
}

function toggleAssignment(data, id) {
  const assignment = data.assignments.find(a => a.id === id);
  if (assignment) {
    assignment.completed = !assignment.completed;
    saveData(data);
  }
}

function renderAssignments(data) {
  const list = document.getElementById('assignment-list');
  const emptyState = document.getElementById('empty-state');

  list.innerHTML = '';

  if (data.assignments.length === 0) {
    emptyState.style.display = 'block';
    return;
  }

  emptyState.style.display = 'none';

  data.assignments.forEach(assignment => {
    const li = document.createElement('li');
    li.className = 'assignment-item' + (assignment.completed ? ' completed' : '');
    li.dataset.id = assignment.id;

    const resourceCount = assignment.resources.length;
    const resourceLabel = resourceCount > 0
      ? `Resources (${resourceCount})`
      : 'Resources';
    const panelOpen = openPanelId === assignment.id;

    li.innerHTML = `
      <div class="assignment-row">
        <input
          type="checkbox"
          class="assignment-checkbox"
          id="cb-${assignment.id}"
          ${assignment.completed ? 'checked' : ''}
          aria-label="Mark '${escapeHtml(assignment.title)}' as complete"
        >
        <label class="assignment-title" for="cb-${assignment.id}">
          ${escapeHtml(assignment.title)}
        </label>
        <div class="assignment-actions">
          <button class="btn-resources ${panelOpen ? 'open' : ''}" data-id="${assignment.id}">
            ${escapeHtml(resourceLabel)} ${panelOpen ? '▾' : '▸'}
          </button>
          <button class="btn-remove" data-id="${assignment.id}" aria-label="Remove assignment">
            Remove
          </button>
        </div>
      </div>
      <div class="resource-panel ${panelOpen ? 'open' : ''}" id="panel-${assignment.id}">
        ${buildResourcePanel(assignment)}
      </div>
    `;

    list.appendChild(li);
  });

  // Re-attach event listeners after render
  attachAssignmentListeners(data);
  attachResourceListeners(data);
}

function buildResourcePanel(assignment) {
  const fileChips = assignment.resources.map(file => `
    <div class="file-chip" data-file-id="${file.id}">
      <span class="file-icon">${fileIcon(file.type)}</span>
      <div class="file-info">
        <div class="file-name" title="${escapeHtml(file.name)}">${escapeHtml(file.name)}</div>
        <div class="file-size">${formatBytes(file.size)}</div>
      </div>
      <button class="btn-remove-file" data-assignment-id="${assignment.id}" data-file-id="${file.id}" aria-label="Remove file">✕</button>
    </div>
  `).join('');

  return `
    <div class="drop-zone" id="drop-${assignment.id}" data-assignment-id="${assignment.id}">
      <input type="file" multiple data-assignment-id="${assignment.id}" aria-label="Upload files">
      <div class="drop-zone-icon">📁</div>
      <div class="drop-zone-text">
        Drag &amp; drop files here, or <strong>browse</strong>
      </div>
      <div class="drop-zone-hint">Max 500KB per file</div>
    </div>
    <div class="file-error" id="file-error-${assignment.id}"></div>
    <div class="file-list" id="file-list-${assignment.id}">
      ${fileChips}
    </div>
  `;
}

function attachAssignmentListeners(data) {
  // Checkbox toggles
  document.querySelectorAll('.assignment-checkbox').forEach(cb => {
    cb.addEventListener('change', () => {
      toggleAssignment(data, cb.closest('.assignment-item').dataset.id);
      renderAssignments(data);
      updateProgress(data);
    });
  });

  // Remove buttons
  document.querySelectorAll('.btn-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      removeAssignment(data, btn.dataset.id);
      renderAssignments(data);
      updateProgress(data);
    });
  });

  // Resource panel toggles
  document.querySelectorAll('.btn-resources').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      openPanelId = openPanelId === id ? null : id;
      renderAssignments(data);
    });
  });
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function fileIcon(mimeType) {
  if (!mimeType) return '📄';
  if (mimeType.startsWith('image/')) return '🖼️';
  if (mimeType === 'application/pdf') return '📕';
  if (mimeType.includes('word')) return '📝';
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return '📊';
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return '📊';
  if (mimeType.includes('zip') || mimeType.includes('compressed')) return '🗜️';
  if (mimeType.startsWith('text/')) return '📄';
  return '📎';
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}
