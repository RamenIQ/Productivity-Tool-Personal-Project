const MAX_FILE_SIZE = 500 * 1024; // 500KB

function attachResourceListeners(data) {
  // File input change (browse)
  document.querySelectorAll('.resource-panel input[type="file"]').forEach(input => {
    input.addEventListener('change', e => {
      const assignmentId = input.dataset.assignmentId;
      handleFiles(Array.from(e.target.files), assignmentId, data);
      // Reset input so the same file can be re-added after removal
      input.value = '';
    });
  });

  // Drag and drop
  document.querySelectorAll('.drop-zone').forEach(zone => {
    const assignmentId = zone.dataset.assignmentId;

    zone.addEventListener('dragover', e => {
      e.preventDefault();
      zone.classList.add('drag-over');
    });

    zone.addEventListener('dragleave', () => {
      zone.classList.remove('drag-over');
    });

    zone.addEventListener('drop', e => {
      e.preventDefault();
      zone.classList.remove('drag-over');
      const files = Array.from(e.dataTransfer.files);
      handleFiles(files, assignmentId, data);
    });
  });

  // Remove file buttons
  document.querySelectorAll('.btn-remove-file').forEach(btn => {
    btn.addEventListener('click', () => {
      const { assignmentId, fileId } = btn.dataset;
      removeFile(data, assignmentId, fileId);
    });
  });
}

function handleFiles(files, assignmentId, data) {
  const errorEl = document.getElementById(`file-error-${assignmentId}`);
  errorEl.textContent = '';
  errorEl.classList.remove('visible');

  const oversized = files.filter(f => f.size > MAX_FILE_SIZE);
  const valid = files.filter(f => f.size <= MAX_FILE_SIZE);

  if (oversized.length > 0) {
    const names = oversized.map(f => f.name).join(', ');
    errorEl.textContent = `File(s) too large (max 500KB): ${names}`;
    errorEl.classList.add('visible');
  }

  valid.forEach(file => readAndStore(file, assignmentId, data));
}

function readAndStore(file, assignmentId, data) {
  const reader = new FileReader();

  reader.onload = function (e) {
    const assignment = data.assignments.find(a => a.id === assignmentId);
    if (!assignment) return;

    const fileRecord = {
      id: generateFileId(),
      name: file.name,
      type: file.type,
      size: file.size,
      data: e.target.result // base64 data URI
    };

    assignment.resources.push(fileRecord);
    const saved = saveData(data);

    if (saved) {
      // Re-render only the file list inside this panel (avoid full re-render to keep panel open)
      renderFileList(assignment);
      // Update resources button label
      updateResourceButtonLabel(assignment);
    }
  };

  reader.onerror = function () {
    const errorEl = document.getElementById(`file-error-${assignmentId}`);
    if (errorEl) {
      errorEl.textContent = `Failed to read file: ${file.name}`;
      errorEl.classList.add('visible');
    }
  };

  reader.readAsDataURL(file);
}

function removeFile(data, assignmentId, fileId) {
  const assignment = data.assignments.find(a => a.id === assignmentId);
  if (!assignment) return;

  assignment.resources = assignment.resources.filter(f => f.id !== fileId);
  saveData(data);

  renderFileList(assignment);
  updateResourceButtonLabel(assignment);
}

function renderFileList(assignment) {
  const fileListEl = document.getElementById(`file-list-${assignment.id}`);
  if (!fileListEl) return;

  fileListEl.innerHTML = assignment.resources.map(file => `
    <div class="file-chip" data-file-id="${file.id}">
      <span class="file-icon">${fileIcon(file.type)}</span>
      <div class="file-info">
        <div class="file-name" title="${escapeHtml(file.name)}">${escapeHtml(file.name)}</div>
        <div class="file-size">${formatBytes(file.size)}</div>
      </div>
      <button class="btn-remove-file" data-assignment-id="${assignment.id}" data-file-id="${file.id}" aria-label="Remove file">✕</button>
    </div>
  `).join('');

  // Re-attach remove listeners for newly rendered chips
  fileListEl.querySelectorAll('.btn-remove-file').forEach(btn => {
    btn.addEventListener('click', () => {
      const { assignmentId, fileId } = btn.dataset;
      removeFile(data, assignmentId, fileId);
    });
  });
}

function updateResourceButtonLabel(assignment) {
  const btn = document.querySelector(`.btn-resources[data-id="${assignment.id}"]`);
  if (!btn) return;
  const count = assignment.resources.length;
  const label = count > 0 ? `Resources (${count})` : 'Resources';
  const isOpen = btn.classList.contains('open');
  btn.textContent = `${label} ${isOpen ? '▾' : '▸'}`;
}

function generateFileId() {
  return (typeof crypto !== 'undefined' && crypto.randomUUID)
    ? crypto.randomUUID()
    : Date.now().toString() + Math.random().toString(36).slice(2);
}
