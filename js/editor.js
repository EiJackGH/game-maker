/**
 * js/editor.js
 * Handles palette rendering, painting/erasing grid, pan, zoom, custom block dialogs, properties and logic editing UI.
 */

// Application and Editor State
const state = {
  currentTool: "brush", // brush, eraser, bucket, select
  activeBlockId: "ground",
  customBlocks: {}, // user created custom blocks

  // Grid level settings
  cols: 30,
  rows: 16,
  grid: [], // 2D array [row][col] storing block instances or null

  // Selection state
  selectedCell: null, // { r, c } or { paletteId: 'xxx' }
  inspectingPaletteId: null,

  // Pan & Zoom
  zoom: 1,
  panX: 0,
  panY: 0,
  gridlines: true,

  // Global game physics & configurations
  gravity: 0.5,
  speed: 4.0,
  lives: 3,
  genre: "platformer", // platformer or topdown
  mobileMode: false,

  // History for Undo/Redo
  undoStack: [],
  redoStack: [],

  // Captured runtime exceptions/errors
  runtimeErrors: [],

  // File Manager State
  currentFileId: null, // unique file ID if loaded/saved, e.g. "file_xxxxxx"
  currentFileName: ""  // user-visible name
};

const ORIGINAL_DEFAULT_BLOCKS = JSON.parse(JSON.stringify(DEFAULT_BLOCKS));

// Canvas element refs
const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
const container = document.getElementById("canvas-container");

// Block dimensions (base size)
const TILE_SIZE = 32;

function getFitZoom() {
  const containerW = container.clientWidth || window.innerWidth;
  const containerH = container.clientHeight || window.innerHeight;
  const calculatedW = state.cols * TILE_SIZE;
  const calculatedH = state.rows * TILE_SIZE;

  const padding = 24; // 12px margin on each side
  const fitW = (containerW - padding) / calculatedW;
  const fitH = (containerH - padding) / calculatedH;

  let fitZoom = Math.min(fitW, fitH);
  fitZoom = Math.max(0.3, Math.min(1.0, fitZoom));
  return Number(fitZoom.toFixed(2));
}

// Initialize Editor
function initEditor() {
  loadFromLocalStorage();
  buildPalettes();
  setupEventListeners();
  state.zoom = getFitZoom();
  state.panX = 0;
  state.panY = 0;
  resizeCanvas();
  renderGrid();
  updateSelectionPanel();
  updateConnectionStatus();
  if (typeof validateScriptsAndLevel === "function") {
    validateScriptsAndLevel();
  }
}

// Mobile drawer helper functions
function openPalette() {
  const leftPalette = document.getElementById("left-palette");
  const backdrop = document.getElementById("mobile-drawer-backdrop");
  if (leftPalette && backdrop) {
    leftPalette.classList.remove("-translate-x-full");
    backdrop.classList.remove("hidden");
  }
}

function openSidebar() {
  const rightSidebar = document.getElementById("right-sidebar");
  const backdrop = document.getElementById("mobile-drawer-backdrop");
  if (rightSidebar && backdrop) {
    rightSidebar.classList.remove("translate-x-full");
    backdrop.classList.remove("hidden");
  }
}

function closeDrawers() {
  const leftPalette = document.getElementById("left-palette");
  const rightSidebar = document.getElementById("right-sidebar");
  const backdrop = document.getElementById("mobile-drawer-backdrop");
  if (leftPalette) leftPalette.classList.add("-translate-x-full");
  if (rightSidebar) rightSidebar.classList.add("translate-x-full");
  if (backdrop) backdrop.classList.add("hidden");
}

window.openPalette = openPalette;
window.openSidebar = openSidebar;
window.closeDrawers = closeDrawers;

// File Manager LocalStorage and operations logic
function getSavedFiles() {
  try {
    const raw = localStorage.getItem("blocks_saved_files");
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.error("Error reading saved files list:", e);
    return {};
  }
}

function saveSavedFiles(files) {
  try {
    localStorage.setItem("blocks_saved_files", JSON.stringify(files));
  } catch (e) {
    console.error("Error saving files list:", e);
  }
}

function updateActiveFileDisplay() {
  const titleEl = document.getElementById("active-file-title");
  const inputEl = document.getElementById("file-name-input");

  if (state.currentFileId) {
    titleEl.textContent = state.currentFileName || "Untitled Level";
    inputEl.value = state.currentFileName || "";
  } else {
    titleEl.textContent = "Unsaved / Sandbox Level";
    inputEl.value = "";
  }
}

function renderSavedFilesList() {
  const listDiv = document.getElementById("saved-files-list");
  const countBadge = document.getElementById("saved-files-count");
  if (!listDiv) return;

  const files = getSavedFiles();
  const fileKeys = Object.keys(files);
  countBadge.textContent = fileKeys.length;

  if (fileKeys.length === 0) {
    listDiv.innerHTML = `<p class="text-[11px] text-gray-500 italic font-mono text-center py-2">No saved local files found.</p>`;
    return;
  }

  listDiv.innerHTML = "";
  // Sort files by last saved timestamp
  const sortedKeys = fileKeys.sort((a, b) => (files[b].updatedAt || 0) - (files[a].updatedAt || 0));

  sortedKeys.forEach(id => {
    const file = files[id];
    const isCurrent = state.currentFileId === id;

    const card = document.createElement("div");
    card.className = `p-2 rounded-lg border text-xs font-sans transition duration-150 flex flex-col space-y-1.5 ${isCurrent ? 'bg-purple-950/30 border-purple-800' : 'bg-gray-950 border-gray-800 hover:border-gray-700'}`;

    // Format timestamp nicely
    const dateStr = file.updatedAt ? new Date(file.updatedAt).toLocaleDateString() + " " + new Date(file.updatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "Unknown Date";

    card.innerHTML = `
      <div class="flex items-start justify-between min-w-0">
        <div class="truncate flex-1 pr-2">
          <h5 class="font-bold text-gray-200 truncate">${file.name}</h5>
          <p class="text-[9px] text-gray-500 font-mono">${file.genre.toUpperCase()} • ${file.cols}x${file.rows} • ${dateStr}</p>
        </div>
        <div class="flex items-center space-x-1 flex-shrink-0">
          <button class="btn-load-file px-1.5 py-1 bg-purple-900/50 hover:bg-purple-800 border border-purple-700/60 rounded text-[10px] text-purple-200 transition" title="Load Level">
            <i class="fas fa-folder-open"></i>
          </button>
          <button class="btn-download-file px-1.5 py-1 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded text-[10px] text-gray-300 hover:text-white transition" title="Download JSON">
            <i class="fas fa-download"></i>
          </button>
          <button class="btn-delete-file px-1.5 py-1 bg-red-950/50 hover:bg-red-900 border border-red-900 rounded text-[10px] text-red-300 transition" title="Delete Level">
            <i class="fas fa-trash-alt"></i>
          </button>
        </div>
      </div>
    `;

    // Bind item buttons
    card.querySelector(".btn-load-file").addEventListener("click", () => {
      loadSavedFile(id);
    });
    card.querySelector(".btn-download-file").addEventListener("click", () => {
      downloadSavedFileJSON(id);
    });
    card.querySelector(".btn-delete-file").addEventListener("click", () => {
      if (confirm(`Are you sure you want to delete the file "${file.name}"?`)) {
        deleteSavedFile(id);
      }
    });

    listDiv.appendChild(card);
  });
}

function loadSavedFile(id) {
  const files = getSavedFiles();
  const file = files[id];
  if (!file) return;

  state.cols = file.cols || 30;
  state.rows = file.rows || 16;
  state.grid = file.grid || [];
  state.customBlocks = file.customBlocks || {};
  state.gravity = file.gravity !== undefined ? file.gravity : 0.5;
  state.speed = file.speed !== undefined ? file.speed : 4.0;
  state.lives = file.lives || 3;
  state.genre = file.genre || "platformer";
  state.mobileMode = file.mobileMode !== undefined ? file.mobileMode : false;

  // Restore modified default block visuals if available in the file
  applyDefaultBlockVisuals(file.defaultBlockVisuals);

  state.currentFileId = id;
  state.currentFileName = file.name;

  adjustGridDimensions();
  syncFormControls();
  buildPalettes();
  state.zoom = getFitZoom();
  state.panX = 0;
  state.panY = 0;
  resizeCanvas();
  renderGrid();
  updateActiveFileDisplay();
  renderSavedFilesList();

  // Persist the last-loaded active session structure so page reload brings us back here
  saveSessionMetadataOnly();

  if (typeof validateScriptsAndLevel === "function") {
    validateScriptsAndLevel();
  }
}

function createSavedFile(name) {
  if (!name.trim()) return;
  const id = "file_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);

  const files = getSavedFiles();
  files[id] = {
    id: id,
    name: name,
    cols: state.cols,
    rows: state.rows,
    grid: state.grid,
    customBlocks: state.customBlocks,
    gravity: state.gravity,
    speed: state.speed,
    lives: state.lives,
    genre: state.genre,
    mobileMode: state.mobileMode,
    defaultBlockVisuals: getDefaultBlockVisuals(),
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  saveSavedFiles(files);
  state.currentFileId = id;
  state.currentFileName = name;

  updateActiveFileDisplay();
  renderSavedFilesList();
  saveToLocalStorage();
}

function saveActiveFile() {
  if (!state.currentFileId) {
    // If not saved yet, prompt for a name
    const nameInput = document.getElementById("file-name-input");
    const name = nameInput ? nameInput.value.trim() : "";
    if (!name) {
      alert("Please enter a File Name first!");
      return;
    }
    createSavedFile(name);
    return;
  }

  const nameInput = document.getElementById("file-name-input");
  const name = nameInput ? nameInput.value.trim() : state.currentFileName;
  if (!name) {
    alert("Please enter a valid File Name!");
    return;
  }

  const files = getSavedFiles();
  if (files[state.currentFileId]) {
    state.currentFileName = name;
    files[state.currentFileId].name = name;
    files[state.currentFileId].cols = state.cols;
    files[state.currentFileId].rows = state.rows;
    files[state.currentFileId].grid = state.grid;
    files[state.currentFileId].customBlocks = state.customBlocks;
    files[state.currentFileId].gravity = state.gravity;
    files[state.currentFileId].speed = state.speed;
    files[state.currentFileId].lives = state.lives;
    files[state.currentFileId].genre = state.genre;
    files[state.currentFileId].mobileMode = state.mobileMode;
    files[state.currentFileId].updatedAt = Date.now();

    saveSavedFiles(files);
    updateActiveFileDisplay();
    renderSavedFilesList();
    saveToLocalStorage();
  }
}

function saveAsNewFile(name) {
  if (!name.trim()) {
    alert("Please enter a File Name!");
    return;
  }
  createSavedFile(name);
}

function deleteSavedFile(id) {
  const files = getSavedFiles();
  if (files[id]) {
    delete files[id];
    saveSavedFiles(files);

    if (state.currentFileId === id) {
      state.currentFileId = null;
      state.currentFileName = "";
      updateActiveFileDisplay();
    }
    renderSavedFilesList();
    saveToLocalStorage();
  }
}

function downloadSavedFileJSON(id) {
  const files = getSavedFiles();
  const file = files[id];
  if (!file) return;

  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(file, null, 2));
  const dlAnchorElem = document.createElement('a');
  dlAnchorElem.setAttribute("href", dataStr);
  dlAnchorElem.setAttribute("download", `blocks_${file.name.toLowerCase().replace(/\s+/g, "_")}.json`);
  dlAnchorElem.click();
}

function saveSessionMetadataOnly() {
  const meta = {
    currentFileId: state.currentFileId,
    currentFileName: state.currentFileName
  };
  localStorage.setItem("blocks_session_metadata", JSON.stringify(meta));
}

function loadSessionMetadata() {
  try {
    const raw = localStorage.getItem("blocks_session_metadata");
    if (raw) {
      const parsed = JSON.parse(raw);
      state.currentFileId = parsed.currentFileId || null;
      state.currentFileName = parsed.currentFileName || "";
    }
  } catch (e) {
    console.error("Error reading session metadata:", e);
  }
}

// Helper to extract default block custom visuals
function getDefaultBlockVisuals() {
  const visuals = {};
  Object.keys(DEFAULT_BLOCKS).forEach(id => {
    if (ORIGINAL_DEFAULT_BLOCKS[id]) {
      const isEmojiChanged = DEFAULT_BLOCKS[id].emoji !== ORIGINAL_DEFAULT_BLOCKS[id].emoji;
      const isColorChanged = DEFAULT_BLOCKS[id].color !== ORIGINAL_DEFAULT_BLOCKS[id].color;
      if (isEmojiChanged || isColorChanged) {
        visuals[id] = {
          emoji: DEFAULT_BLOCKS[id].emoji,
          color: DEFAULT_BLOCKS[id].color
        };
      }
    }
  });
  return visuals;
}

// Helper to apply default block custom visuals
function applyDefaultBlockVisuals(visuals) {
  // Always start by resetting default blocks to original settings
  Object.keys(DEFAULT_BLOCKS).forEach(id => {
    if (ORIGINAL_DEFAULT_BLOCKS[id]) {
      DEFAULT_BLOCKS[id].emoji = ORIGINAL_DEFAULT_BLOCKS[id].emoji;
      DEFAULT_BLOCKS[id].color = ORIGINAL_DEFAULT_BLOCKS[id].color;
    }
  });

  // Apply customizations if present
  if (visuals) {
    Object.keys(visuals).forEach(id => {
      if (DEFAULT_BLOCKS[id]) {
        DEFAULT_BLOCKS[id].emoji = visuals[id].emoji;
        DEFAULT_BLOCKS[id].color = visuals[id].color;
      }
    });
  }
}

// Save & Load to/from LocalStorage
function saveToLocalStorage() {
  const data = {
    cols: state.cols,
    rows: state.rows,
    grid: state.grid,
    customBlocks: state.customBlocks,
    gravity: state.gravity,
    speed: state.speed,
    lives: state.lives,
    genre: state.genre,
    mobileMode: state.mobileMode,
    defaultBlockVisuals: getDefaultBlockVisuals()
  };
  localStorage.setItem("blocks_game_maker_data", JSON.stringify(data));
  saveSessionMetadataOnly();

  // If we are working on a currently saved file, auto-sync its contents too!
  if (state.currentFileId) {
    const files = getSavedFiles();
    if (files[state.currentFileId]) {
      files[state.currentFileId].cols = state.cols;
      files[state.currentFileId].rows = state.rows;
      files[state.currentFileId].grid = state.grid;
      files[state.currentFileId].customBlocks = state.customBlocks;
      files[state.currentFileId].gravity = state.gravity;
      files[state.currentFileId].speed = state.speed;
      files[state.currentFileId].lives = state.lives;
      files[state.currentFileId].genre = state.genre;
      files[state.currentFileId].mobileMode = state.mobileMode;
      files[state.currentFileId].defaultBlockVisuals = getDefaultBlockVisuals();
      files[state.currentFileId].updatedAt = Date.now();
      saveSavedFiles(files);
    }
  }

  if (typeof validateScriptsAndLevel === "function") {
    validateScriptsAndLevel();
  }
}

function loadFromLocalStorage() {
  try {
    loadSessionMetadata();
    const raw = localStorage.getItem("blocks_game_maker_data");
    if (raw) {
      const parsed = JSON.parse(raw);
      state.cols = parsed.cols || 30;
      state.rows = parsed.rows || 16;
      state.customBlocks = parsed.customBlocks || {};
      state.gravity = parsed.gravity !== undefined ? parsed.gravity : 0.5;
      state.speed = parsed.speed !== undefined ? parsed.speed : 4.0;
      state.lives = parsed.lives || 3;
      state.genre = parsed.genre || "platformer";
      state.mobileMode = parsed.mobileMode !== undefined ? parsed.mobileMode : false;
      state.grid = parsed.grid || [];

      // Apply default block visual modifications if saved
      applyDefaultBlockVisuals(parsed.defaultBlockVisuals);

      // Validate/resize level grid array
      adjustGridDimensions();
      syncFormControls();
      updateActiveFileDisplay();
      renderSavedFilesList();
    } else {
      loadTemplate("platformer_demo");
    }
  } catch (e) {
    console.error("Error loading local level data, starting fresh:", e);
    loadTemplate("platformer_demo");
  }
}

function syncFormControls() {
  document.getElementById("input-grid-cols").value = state.cols;
  document.getElementById("input-grid-rows").value = state.rows;
  document.getElementById("input-gravity").value = state.gravity;
  document.getElementById("label-gravity").textContent = state.gravity;
  document.getElementById("input-speed").value = state.speed;
  document.getElementById("label-speed").textContent = state.speed;
  document.getElementById("select-lives").value = state.lives;
  document.getElementById("select-genre").value = state.genre;
  updateMobileButtonUI();
}

function updateMobileButtonUI() {
  const lbl = document.getElementById("label-mobile-mode");
  if (!lbl) return;
  if (state.mobileMode) {
    lbl.textContent = "ON";
    lbl.className = "text-xs font-mono font-bold text-emerald-400 animate-pulse";
  } else {
    lbl.textContent = "OFF";
    lbl.className = "text-xs font-mono font-bold text-red-500";
  }
}

function updateMobileControlsVisibility() {
  const controls = document.getElementById("mobile-controls");
  if (!controls) return;

  // Mobile mode controls only show during running simulation (Play Mode)
  if (state.mobileMode && typeof game !== "undefined" && game.running) {
    controls.classList.remove("opacity-0", "translate-y-4", "pointer-events-none");
    controls.classList.add("opacity-100", "translate-y-0");

    // Adjust control layout depending on Genre
    const btnUp = document.getElementById("mbtn-up");
    const btnDown = document.getElementById("mbtn-down");
    const btnJump = document.getElementById("mbtn-jump");

    if (state.genre === "platformer") {
      // In platformer: up/down buttons are hidden or inactive, JUMP button is shown
      if (btnUp) btnUp.classList.add("invisible");
      if (btnDown) btnDown.classList.add("invisible");
      if (btnJump) {
        btnJump.classList.remove("hidden");
        btnJump.classList.add("flex");
      }
    } else {
      // In top-down: up/down buttons are visible, JUMP button is hidden
      if (btnUp) btnUp.classList.remove("invisible");
      if (btnDown) btnDown.classList.remove("invisible");
      if (btnJump) {
        btnJump.classList.add("hidden");
        btnJump.classList.remove("flex");
      }
    }
  } else {
    controls.classList.add("opacity-0", "translate-y-4", "pointer-events-none");
    controls.classList.remove("opacity-100", "translate-y-0");
  }
}

function resetGridToEmpty() {
  state.grid = [];
  for (let r = 0; r < state.rows; r++) {
    const row = [];
    for (let c = 0; c < state.cols; c++) {
      row.push(null);
    }
    state.grid.push(row);
  }
  saveToLocalStorage();
  if (typeof validateScriptsAndLevel === "function") {
    validateScriptsAndLevel();
  }
}

function adjustGridDimensions() {
  // Pad or trim row dimension
  while (state.grid.length < state.rows) {
    state.grid.push(new Array(state.cols).fill(null));
  }
  if (state.grid.length > state.rows) {
    state.grid = state.grid.slice(0, state.rows);
  }

  // Pad or trim col dimension per row
  for (let r = 0; r < state.rows; r++) {
    if (!state.grid[r]) {
      state.grid[r] = new Array(state.cols).fill(null);
    }
    while (state.grid[r].length < state.cols) {
      state.grid[r].push(null);
    }
    if (state.grid[r].length > state.cols) {
      state.grid[r] = state.grid[r].slice(0, state.cols);
    }
  }
}

// Help fetch block properties
function getBlockById(id) {
  if (DEFAULT_BLOCKS[id]) return DEFAULT_BLOCKS[id];
  if (state.customBlocks[id]) return state.customBlocks[id];
  return null;
}

// Build Drawing Palette Categories
function buildPalettes() {
  if (typeof validateScriptsAndLevel === "function") {
    validateScriptsAndLevel();
  }
  const solidsDiv = document.getElementById("palette-solids");
  const hazardsDiv = document.getElementById("palette-hazards");
  const interactivesDiv = document.getElementById("palette-interactives");
  const actorsDiv = document.getElementById("palette-actors");
  const customDiv = document.getElementById("palette-custom");

  // Clear original contents
  [solidsDiv, hazardsDiv, interactivesDiv, actorsDiv, customDiv].forEach(el => el.innerHTML = "");

  const allBlocks = { ...DEFAULT_BLOCKS, ...state.customBlocks };

  Object.values(allBlocks).forEach(block => {
    // Generate Palette Item Node
    const btn = document.createElement("button");
    btn.className = `palette-item flex items-center space-x-2 p-2 bg-gray-800 hover:bg-gray-700 border rounded text-left transition text-xs ${state.activeBlockId === block.id ? 'border-purple-500 ring-2 ring-purple-500/30' : 'border-gray-700'}`;
    btn.setAttribute("data-id", block.id);
    btn.innerHTML = `
      <span class="text-lg">${block.emoji || '🧱'}</span>
      <span class="truncate font-semibold text-gray-200">${block.name}</span>
    `;

    btn.addEventListener("click", () => {
      // Remove style ring from all other items
      document.querySelectorAll(".palette-item").forEach(item => {
        item.classList.remove("border-purple-500", "ring-2", "ring-purple-500/30");
        item.classList.add("border-gray-700");
      });
      btn.classList.add("border-purple-500", "ring-2", "ring-purple-500/30");
      btn.classList.remove("border-gray-700");

      state.activeBlockId = block.id;

      // Automatically inspect the palette item properties
      state.selectedCell = null;
      state.inspectingPaletteId = block.id;
      updateSelectionPanel();
      if (typeof checkTutorialProgress === "function") {
        checkTutorialProgress();
      }
      closeDrawers();
    });

    // Sort into tabs
    if (state.customBlocks[block.id]) {
      customDiv.appendChild(btn);
    } else {
      switch (block.category) {
        case "solid":
          solidsDiv.appendChild(btn);
          break;
        case "hazard":
          hazardsDiv.appendChild(btn);
          break;
        case "collectible":
          interactivesDiv.appendChild(btn);
          break;
        case "actor":
          actorsDiv.appendChild(btn);
          break;
      }
    }
  });
}

// Update Right Panel Sidebar values on Block Inspect Select
function updateSelectionPanel() {
  const panelNoSelection = document.getElementById("property-no-selection");
  const panelInfo = document.getElementById("property-selected-info");
  const inputsDiv = document.getElementById("property-inputs");
  const logicNoSel = document.getElementById("logic-no-selection");
  const logicPanel = document.getElementById("logic-builder-panel");

  let activeBlock = null;

  if (state.selectedCell) {
    // Grid cell inspection
    const tileInstance = state.grid[state.selectedCell.r][state.selectedCell.c];
    if (tileInstance) {
      activeBlock = tileInstance;
    }
  } else if (state.inspectingPaletteId) {
    // Palette selection properties inspect
    activeBlock = getBlockById(state.inspectingPaletteId);
  }

  if (!activeBlock) {
    // Show empty defaults
    panelNoSelection.classList.remove("hidden");
    panelInfo.classList.add("hidden");
    inputsDiv.classList.add("hidden");
    logicNoSel.classList.remove("hidden");
    logicPanel.classList.add("hidden");
    return;
  }

  // Populate visual details
  panelNoSelection.classList.add("hidden");
  panelInfo.classList.remove("hidden");
  inputsDiv.classList.remove("hidden");
  logicNoSel.classList.add("hidden");
  logicPanel.classList.remove("hidden");

  // Load properties details
  document.getElementById("selected-block-preview").textContent = activeBlock.emoji || "🧱";
  document.getElementById("selected-block-preview").style.backgroundColor = activeBlock.color + "22"; // 10% opacity border bg
  document.getElementById("selected-block-preview").style.borderColor = activeBlock.color;
  document.getElementById("selected-block-name").textContent = activeBlock.name;
  document.getElementById("selected-block-type").textContent = activeBlock.category.toUpperCase();

  // Load customizable inputs
  document.getElementById("prop-tile-name").value = activeBlock.name;
  document.getElementById("prop-tile-color").value = activeBlock.color;
  document.getElementById("prop-tile-color-lbl").textContent = activeBlock.color.toUpperCase();
  document.getElementById("prop-tile-emoji").value = activeBlock.emoji || "";
  document.getElementById("prop-tile-solid").checked = !!activeBlock.solid;
  document.getElementById("prop-tile-damage").value = activeBlock.damage !== undefined ? activeBlock.damage : 0;
  document.getElementById("prop-tile-score").value = activeBlock.score !== undefined ? activeBlock.score : 0;

  // Visual Custom Javascript script hook
  document.getElementById("prop-tile-js").value = activeBlock.js || "";

  // Render Visual Script Rows
  renderVisualScriptRows(activeBlock);
}

// Render the Logic Event-Action cards
function renderVisualScriptRows(activeBlock) {
  const container = document.getElementById("script-rows-container");
  container.innerHTML = "";

  if (!activeBlock.scripts) activeBlock.scripts = [];

  activeBlock.scripts.forEach((script, idx) => {
    const row = document.createElement("div");
    row.className = "bg-gray-950 p-2.5 border border-gray-800 rounded-lg space-y-2 text-xs relative";

    // Build event selector options
    let eventOptions = SCRIPT_EVENTS.map(ev =>
      `<option value="${ev.id}" ${script.event === ev.id ? 'selected' : ''}>${ev.name}</option>`
    ).join("");

    // Build action selector options
    let actionOptions = SCRIPT_ACTIONS.map(ac =>
      `<option value="${ac.id}" ${script.action === ac.id ? 'selected' : ''}>${ac.name}</option>`
    ).join("");

    // Delete trigger button
    row.innerHTML = `
      <button class="absolute top-1 right-2 text-red-500 hover:text-red-400 font-bold" onclick="removeScriptRow(${idx})">
        <i class="fas fa-trash-alt text-[10px]"></i>
      </button>

      <!-- Event select -->
      <div class="space-y-1">
        <label class="text-[9px] uppercase font-bold text-gray-500 font-mono block">When event trigger</label>
        <select class="w-full bg-gray-900 border border-gray-700 rounded px-1.5 py-1 text-xs text-purple-300 font-mono" onchange="updateScriptEvent(${idx}, this.value)">
          ${eventOptions}
        </select>
      </div>

      <!-- Action select -->
      <div class="space-y-1">
        <label class="text-[9px] uppercase font-bold text-gray-500 font-mono block">Then instant action</label>
        <select class="w-full bg-gray-900 border border-gray-700 rounded px-1.5 py-1 text-xs text-yellow-300 font-mono" onchange="updateScriptAction(${idx}, this.value)">
          ${actionOptions}
        </select>
      </div>

      <!-- Parameters Subpanel dynamically drawn based on action properties -->
      <div class="script-params-panel space-y-1.5 pt-1.5 border-t border-gray-800/60">
        ${renderActionParamsInputs(idx, script)}
      </div>
    `;

    container.appendChild(row);
  });
}

function renderActionParamsInputs(scriptIndex, script) {
  const actionDef = SCRIPT_ACTIONS.find(a => a.id === script.action);
  if (!actionDef || !actionDef.params || actionDef.params.length === 0) return "";

  if (!script.params) script.params = {};

  return actionDef.params.map(param => {
    const val = script.params[param.key] !== undefined ? script.params[param.key] : param.default;

    if (param.type === "number") {
      return `
        <div class="flex items-center justify-between">
          <span class="text-[10px] text-gray-400 font-mono">${param.label}:</span>
          <input type="number" class="w-16 bg-gray-900 border border-gray-700 rounded px-1 text-right text-gray-200" value="${val}" onchange="updateScriptParam(${scriptIndex}, '${param.key}', this.value)" />
        </div>
      `;
    } else if (param.type === "select") {
      let options = param.options.map(o =>
        `<option value="${o}" ${val === o ? 'selected' : ''}>${o}</option>`
      ).join("");
      return `
        <div class="flex items-center justify-between">
          <span class="text-[10px] text-gray-400 font-mono">${param.label}:</span>
          <select class="bg-gray-900 border border-gray-700 rounded px-1 text-gray-200" onchange="updateScriptParam(${scriptIndex}, '${param.key}', this.value)">
            ${options}
          </select>
        </div>
      `;
    }
    return "";
  }).join("");
}

// Global scope logic modifiers accessible to generated nodes
window.removeScriptRow = function(idx) {
  let activeBlock = getInspectedBlock();
  if (activeBlock && activeBlock.scripts) {
    activeBlock.scripts.splice(idx, 1);
    updateSelectionPanel();
    saveToLocalStorage();
  }
};

window.updateScriptEvent = function(idx, eventId) {
  let activeBlock = getInspectedBlock();
  if (activeBlock && activeBlock.scripts) {
    activeBlock.scripts[idx].event = eventId;
    saveToLocalStorage();
  }
};

window.updateScriptAction = function(idx, actionId) {
  let activeBlock = getInspectedBlock();
  if (activeBlock && activeBlock.scripts) {
    const actionDef = SCRIPT_ACTIONS.find(a => a.id === actionId);
    activeBlock.scripts[idx].action = actionId;
    activeBlock.scripts[idx].params = {};
    if (actionDef && actionDef.params) {
      actionDef.params.forEach(p => {
        activeBlock.scripts[idx].params[p.key] = p.default;
      });
    }
    updateSelectionPanel();
    saveToLocalStorage();
  }
};

window.updateScriptParam = function(idx, key, val) {
  let activeBlock = getInspectedBlock();
  if (activeBlock && activeBlock.scripts) {
    if (!activeBlock.scripts[idx].params) activeBlock.scripts[idx].params = {};
    activeBlock.scripts[idx].params[key] = isNaN(val) ? val : Number(val);
    saveToLocalStorage();
  }
};

function getInspectedBlock() {
  if (state.selectedCell) {
    return state.grid[state.selectedCell.r][state.selectedCell.c];
  } else if (state.inspectingPaletteId) {
    return getBlockById(state.inspectingPaletteId);
  }
  return null;
}

// Global exposure for UI elements
window.navigateToCoordinate = function(r, c) {
  state.selectedCell = { r: Number(r), c: Number(c) };
  state.inspectingPaletteId = null;
  setTool("select");
  updateSelectionPanel();
  renderGrid();
  if (typeof checkTutorialProgress === "function") {
    checkTutorialProgress();
  }
};

window.navigateToPaletteBlock = function(id) {
  state.selectedCell = null;
  state.inspectingPaletteId = id;
  setTool("select");
  updateSelectionPanel();
  renderGrid();

  // highlight block button inside palettes
  document.querySelectorAll(".palette-item").forEach(item => {
    item.classList.remove("border-purple-500", "ring-2", "ring-purple-500/30");
    item.classList.add("border-gray-700");
    if (item.getAttribute("data-id") === id) {
      item.classList.add("border-purple-500", "ring-2", "ring-purple-500/30");
      item.classList.remove("border-gray-700");
    }
  });
};

// Real-time Static Analysis & Level Validation Engine
function validateScriptsAndLevel() {
  const rawProblems = [];

  let playerSpawnsCount = 0;
  let portalsCount = 0;
  let hasLockedDoors = false;
  let hasKeys = false;
  let hasSolids = false;

  // Scan grid for blocks and state-level problems
  for (let r = 0; r < state.rows; r++) {
    for (let c = 0; c < state.cols; c++) {
      const tile = state.grid[r][c];
      if (tile) {
        if (tile.id === "player_spawn") {
          playerSpawnsCount++;
        }
        if (tile.id === "portal") {
          portalsCount++;
        }
        if (tile.id === "locked_door") {
          hasLockedDoors = true;
        }
        if (tile.id === "key") {
          hasKeys = true;
        }
        if (tile.solid) {
          hasSolids = true;
        }

        // 1. Check custom JS syntax for grid tiles
        if (tile.js && tile.js.trim().length > 0) {
          try {
            new Function("player", "tile", "game", "sound", tile.js);
          } catch (err) {
            rawProblems.push({
              type: "error",
              source: "code",
              message: `Syntax error in tile custom JS: ${err.message}`,
              coordinate: { r, c },
              tileId: tile.id,
              tileName: tile.name,
              group: "tile_js_syntax_error",
              groupName: "Tile Custom JS Syntax Errors"
            });
          }

          // Check if custom JS is empty (comments/spaces only)
          const codeWithoutComments = tile.js.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '').trim();
          if (codeWithoutComments.length === 0) {
            rawProblems.push({
              type: "warning",
              source: "code",
              message: `Custom JS for tile "${tile.name}" contains no executable code (only spaces or comments).`,
              coordinate: { r, c },
              tileId: tile.id,
              tileName: tile.name,
              group: "empty_js",
              groupName: "Empty Custom JS"
            });
          }
        }

        // 2. Warn if tile script triggers are set but missing actions, or have invalid params
        if (tile.scripts) {
          tile.scripts.forEach((script, idx) => {
            if (!script.action) {
              rawProblems.push({
                type: "warning",
                source: "script",
                message: `Script #${idx+1} is missing an action`,
                coordinate: { r, c },
                tileId: tile.id,
                tileName: tile.name,
                group: "missing_action",
                groupName: "Scripts Missing Actions"
              });
            } else if (script.action === "bounce_player") {
              const strength = script.params && script.params.strength;
              if (strength !== undefined && (isNaN(strength) || strength < 1 || strength > 20)) {
                rawProblems.push({
                  type: "warning",
                  source: "script",
                  message: `Bounce strength parameter (${strength}) in script #${idx+1} is out of the safe 1-20 range.`,
                  coordinate: { r, c },
                  tileId: tile.id,
                  tileName: tile.name,
                  group: "invalid_script_param",
                  groupName: "Invalid Script Parameters"
                });
              }
            }
          });
        }

        // Check if collectible is marked solid
        if (tile.category === "collectible" && tile.solid) {
          rawProblems.push({
            type: "error",
            source: "level",
            message: `Collectible block "${tile.name}" is marked as solid, which may block the player.`,
            coordinate: { r, c },
            tileId: tile.id,
            tileName: tile.name,
            group: "solid_collectible",
            groupName: "Solid Collectibles"
          });
        }

        // Floating Player Spawn check
        if (tile.id === "player_spawn" && state.genre === "platformer") {
          let hasSolidBeneath = false;
          if (r + 1 < state.rows) {
            const beneathTile = state.grid[r + 1][c];
            if (beneathTile && beneathTile.solid) {
              hasSolidBeneath = true;
            }
          }
          if (!hasSolidBeneath) {
            rawProblems.push({
              type: "warning",
              source: "level",
              message: "Player Spawn is floating in mid-air. The player will fall instantly on start.",
              coordinate: { r, c },
              tileId: tile.id,
              tileName: tile.name,
              group: "floating_spawn",
              groupName: "Floating Player Spawns"
            });
          }
        }

        // Spawn adjacent to hazard or enemy actor check
        if (tile.id === "player_spawn") {
          const neighbors = [
            [r - 1, c],
            [r + 1, c],
            [r, c - 1],
            [r, c + 1]
          ];
          let nearDanger = false;
          let dangerTileName = "";
          for (const [nr, nc] of neighbors) {
            if (nr >= 0 && nr < state.rows && nc >= 0 && nc < state.cols) {
              const neighborTile = state.grid[nr][nc];
              if (neighborTile && (neighborTile.category === "hazard" || neighborTile.id === "patrol_enemy" || neighborTile.id === "ai_agent")) {
                nearDanger = true;
                dangerTileName = neighborTile.name;
                break;
              }
            }
          }
          if (nearDanger) {
            rawProblems.push({
              type: "warning",
              source: "level",
              message: `Player Spawn is placed directly adjacent to hazard/enemy "${dangerTileName}". This may cause immediate damage/death on start.`,
              coordinate: { r, c },
              tileId: tile.id,
              tileName: tile.name,
              group: "spawn_near_hazard",
              groupName: "Spawns Near Hazards/Enemies"
            });
          }
        }

        // Trapped/Boxed in Player Spawn (top-down mode)
        if (tile.id === "player_spawn" && state.genre === "topdown") {
          const neighbors = [
            [r - 1, c],
            [r + 1, c],
            [r, c - 1],
            [r, c + 1]
          ];
          let openCount = 0;
          neighbors.forEach(([nr, nc]) => {
            if (nr >= 0 && nr < state.rows && nc >= 0 && nc < state.cols) {
              const neighborTile = state.grid[nr][nc];
              if (!neighborTile || !neighborTile.solid) {
                openCount++;
              }
            }
          });
          if (openCount === 0) {
            rawProblems.push({
              type: "warning",
              source: "level",
              message: "Player Spawn is completely trapped/boxed in by solid blocks. The player will be unable to move.",
              coordinate: { r, c },
              tileId: tile.id,
              tileName: tile.name,
              group: "spawn_trapped",
              groupName: "Trapped Player Spawns"
            });
          }
        }
      }
    }
  }

  // Scan Custom Palette Blocks for JS syntax errors too
  Object.keys(state.customBlocks).forEach(id => {
    const block = state.customBlocks[id];
    if (block) {
      if (block.js && block.js.trim().length > 0) {
        try {
          new Function("player", "tile", "game", "sound", block.js);
        } catch (err) {
          rawProblems.push({
            type: "error",
            source: "code",
            message: `Syntax error in Custom Palette Block [${block.name}] JS: ${err.message}`,
            paletteId: id,
            tileName: block.name,
            group: "palette_js_syntax_error",
            groupName: "Custom Palette Block Syntax Errors"
          });
        }
        const codeWithoutComments = block.js.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '').trim();
        if (codeWithoutComments.length === 0) {
          rawProblems.push({
            type: "warning",
            source: "code",
            message: `Custom JS for Palette Block [${block.name}] contains no executable code.`,
            paletteId: id,
            tileName: block.name,
            group: "empty_js",
            groupName: "Empty Custom JS"
          });
        }
      }
      if (block.scripts) {
        block.scripts.forEach((script, idx) => {
          if (!script.action) {
            rawProblems.push({
              type: "warning",
              source: "script",
              message: `Palette Block [${block.name}] Script #${idx+1} is missing an action.`,
              paletteId: id,
              tileName: block.name,
              group: "missing_action",
              groupName: "Scripts Missing Actions"
            });
          } else if (script.action === "bounce_player") {
            const strength = script.params && script.params.strength;
            if (strength !== undefined && (isNaN(strength) || strength < 1 || strength > 20)) {
              rawProblems.push({
                type: "warning",
                source: "script",
                message: `Palette Block [${block.name}] script #${idx+1} bounce strength (${strength}) is out of safe 1-20 range.`,
                paletteId: id,
                tileName: block.name,
                group: "invalid_script_param",
                groupName: "Invalid Script Parameters"
              });
            }
          }
        });
      }
    }
  });

  // Level requirements warnings
  if (playerSpawnsCount === 0) {
    rawProblems.push({
      type: "error",
      source: "level",
      message: "No Player Spawn found! Add exactly one 🧙 Spawn block."
    });
  } else if (playerSpawnsCount > 1) {
    rawProblems.push({
      type: "warning",
      source: "level",
      message: `Multiple (${playerSpawnsCount}) Player Spawns found. Only the last one will be active.`,
      group: "multiple_spawns",
      groupName: "Multiple Player Spawns"
    });
  }

  if (portalsCount === 0) {
    rawProblems.push({
      type: "warning",
      source: "level",
      message: "No Goal Portal (🌀) placed. Level cannot be cleared/won by the player."
    });
  } else if (portalsCount > 1) {
    rawProblems.push({
      type: "warning",
      source: "level",
      message: `Multiple (${portalsCount}) Goal Portals found. Placing more than one portal is usually redundant.`,
      group: "multiple_portals",
      groupName: "Multiple Goal Portals"
    });
  }

  if (hasLockedDoors && !hasKeys) {
    rawProblems.push({
      type: "error",
      source: "level",
      message: "Locked Door (🔒) exists but no Golden Key (🔑) is available to unlock it!"
    });
  } else if (!hasLockedDoors && hasKeys) {
    rawProblems.push({
      type: "warning",
      source: "level",
      message: "Golden Key (🔑) placed on level but no Locked Door (🔒) exists to unlock."
    });
  }

  if (state.genre === "platformer" && !hasSolids) {
    rawProblems.push({
      type: "warning",
      source: "level",
      message: "Platformer genre is selected with gravity enabled, but no solid platform blocks are placed."
    });
  }

  // Non-zero gravity in top-down mode warning
  if (state.genre === "topdown" && state.gravity > 0) {
    rawProblems.push({
      type: "warning",
      source: "level",
      message: `Genre is set to Top-Down, but Gravity is configured to a non-zero value (${state.gravity}). This can cause unintended drift/movement issues.`,
      group: "topdown_gravity",
      groupName: "Top-Down Mode Gravity Configuration"
    });
  }

  // Add captured runtime errors to the list of displayed problems
  state.runtimeErrors.forEach(err => {
    rawProblems.push({
      type: "error",
      source: "runtime",
      message: `Runtime Crash: ${err.message}`,
      coordinate: err.coordinate,
      tileName: err.tileName,
      timestamp: err.timestamp,
      group: "runtime_crash",
      groupName: "Runtime Crashes"
    });
  });

  // Perform aggregation / grouping to enforce the "no high volume" constraint
  const problems = [];
  const groups = {};

  rawProblems.forEach(p => {
    if (p.group) {
      if (!groups[p.group]) {
        groups[p.group] = {
          name: p.groupName || p.group,
          items: [],
          type: p.type || "warning"
        };
      }
      if (p.type === "error") {
        groups[p.group].type = "error";
      }
      groups[p.group].items.push(p);
    } else {
      problems.push(p);
    }
  });

  Object.keys(groups).forEach(groupId => {
    const group = groups[groupId];
    const items = group.items;
    if (items.length <= 3) {
      items.forEach(item => problems.push(item));
    } else {
      // Show first 3 items in detail
      for (let i = 0; i < 3; i++) {
        problems.push(items[i]);
      }
      // Add a summary card
      problems.push({
        type: group.type,
        source: items[0].source || "level",
        message: `...and ${items.length - 3} more similar issues of type: ${group.name}`,
        groupSummary: true
      });
    }
  });

  // Render errors inside problems list UI element
  const problemsListDiv = document.getElementById("problems-list");
  const problemsCountBadge = document.getElementById("problems-count-badge");
  const badgeLogic = document.getElementById("badge-logic");
  const runtimeControls = document.getElementById("runtime-error-controls");

  if (!problemsListDiv) return;

  problemsListDiv.innerHTML = "";
  problemsCountBadge.textContent = problems.length;

  // Show/Hide badge-logic dot notification based on errors count
  const errorCount = problems.filter(p => p.type === "error").length;
  if (errorCount > 0) {
    badgeLogic.classList.remove("hidden");
  } else {
    badgeLogic.classList.add("hidden");
  }

  // Show/Hide runtime error clean triggers
  if (state.runtimeErrors.length > 0) {
    runtimeControls.classList.remove("hidden");
  } else {
    runtimeControls.classList.add("hidden");
  }

  if (problems.length === 0) {
    problemsListDiv.innerHTML = `<p class="text-[11px] text-gray-500 italic font-mono">No errors or warnings found.</p>`;
    return;
  }

  problems.forEach(p => {
    const isError = p.type === "error";
    const bgClass = isError ? "bg-red-950/35 border-red-900/40 hover:bg-red-950/60" : "bg-yellow-950/20 border-yellow-900/30 hover:bg-yellow-950/40";
    const borderClass = "border";
    const textClass = isError ? "text-red-400" : "text-yellow-400";
    const subTextClass = isError ? "text-red-300/70" : "text-yellow-300/70";
    const iconClass = isError ? "fa-times-circle" : "fa-exclamation-triangle";

    let labelTarget = "";
    let clickHandler = "";

    if (p.coordinate) {
      labelTarget = `@ (${p.coordinate.c}, ${p.coordinate.r})`;
      clickHandler = `onclick="navigateToCoordinate(${p.coordinate.r}, ${p.coordinate.c})"`;
    } else if (p.paletteId) {
      labelTarget = `Palette: ${p.tileName}`;
      clickHandler = `onclick="navigateToPaletteBlock('${p.paletteId}')"`;
    } else {
      labelTarget = "Global";
    }

    const card = document.createElement("div");
    card.className = `${bgClass} ${borderClass} rounded p-2 text-[11px] font-mono transition duration-150 cursor-pointer flex flex-col space-y-1`;
    if (clickHandler) {
      card.setAttribute("onclick", clickHandler.match(/"([^"]+)"/)[1]);
      card.style.cursor = "pointer";
    }

    card.innerHTML = `
      <div class="flex items-start justify-between">
        <span class="${textClass} font-semibold flex items-center">
          <i class="fas ${iconClass} mr-1.5 text-xs"></i>
          <span>${isError ? 'ERROR' : 'WARNING'}</span>
        </span>
        <span class="text-[9px] font-bold uppercase ${subTextClass} border border-current/25 px-1 rounded font-mono">
          ${labelTarget}
        </span>
      </div>
      <p class="text-gray-300 leading-normal text-xs font-sans">${p.message}</p>
      <div class="pt-1 flex justify-end">
        <button class="btn-explain-ai px-2 py-0.5 text-[9px] bg-purple-900/60 hover:bg-purple-800 text-purple-200 border border-purple-700/60 rounded flex items-center space-x-1 font-semibold transition" title="Explain with AI">
          <i class="fas fa-brain text-[9px]"></i>
          <span>Explain with AI</span>
        </button>
      </div>
    `;

    // Ensure double-clicking or clicking works properly via inline binding or event listener
    if (clickHandler) {
      card.addEventListener("click", () => {
        if (p.coordinate) {
          window.navigateToCoordinate(p.coordinate.r, p.coordinate.c);
        } else if (p.paletteId) {
          window.navigateToPaletteBlock(p.paletteId);
        }
      });
    }

    const btnExplain = card.querySelector(".btn-explain-ai");
    if (btnExplain) {
      btnExplain.addEventListener("click", (e) => {
        e.stopPropagation();
        explainProblemWithAI(p);
      });
    }

    problemsListDiv.appendChild(card);
  });
}

// Window sizing setup
function resizeCanvas() {
  const containerW = container.clientWidth;
  const containerH = container.clientHeight;

  // Level grid canvas size calculation
  const calculatedW = state.cols * TILE_SIZE;
  const calculatedH = state.rows * TILE_SIZE;

  canvas.width = calculatedW;
  canvas.height = calculatedH;

  // Center elements if bounds fit nicely, otherwise apply pan transform
  applyCanvasTransform();
}

function applyCanvasTransform() {
  canvas.style.transform = `translate(${state.panX}px, ${state.panY}px) scale(${state.zoom})`;
  document.getElementById("label-zoom").textContent = `${Math.round(state.zoom * 100)}%`;
}

// Drawing Logic
function renderGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let r = 0; r < state.rows; r++) {
    for (let c = 0; c < state.cols; c++) {
      const tile = state.grid[r][c];
      const x = c * TILE_SIZE;
      const y = r * TILE_SIZE;

      if (tile) {
        // Render block solid color backgrounds
        ctx.fillStyle = tile.color || "#1e293b";
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

        // Highlight solid blocks with slight outer borders
        if (tile.solid) {
          ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
          ctx.strokeRect(x + 1, y + 1, TILE_SIZE - 2, TILE_SIZE - 2);
        }

        // Draw emojis
        ctx.fillStyle = "#ffffff";
        ctx.font = `${TILE_SIZE * 0.55}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(tile.emoji || "", x + TILE_SIZE / 2, y + TILE_SIZE / 2);
      } else {
        // Draw checkered blank background colors
        ctx.fillStyle = (r + c) % 2 === 0 ? "#111827" : "#0f172a";
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
      }

      // Draw active coordinates selection outline rings
      if (state.selectedCell && state.selectedCell.r === r && state.selectedCell.c === c) {
        ctx.strokeStyle = "#a855f7"; // Magenta-Purple
        ctx.lineWidth = 3;
        ctx.strokeRect(x + 1.5, y + 1.5, TILE_SIZE - 3, TILE_SIZE - 3);
        ctx.lineWidth = 1;
      }
    }
  }

  // Draw Grid Lines if requested
  if (state.gridlines) {
    ctx.strokeStyle = "rgba(139, 92, 246, 0.15)"; // Soft purple line borders
    ctx.beginPath();
    for (let r = 0; r <= state.rows; r++) {
      ctx.moveTo(0, r * TILE_SIZE);
      ctx.lineTo(state.cols * TILE_SIZE, r * TILE_SIZE);
    }
    for (let c = 0; c <= state.cols; c++) {
      ctx.moveTo(c * TILE_SIZE, 0);
      ctx.lineTo(c * TILE_SIZE, state.rows * TILE_SIZE);
    }
    ctx.stroke();
  }

  // Recalculate total level coin goals
  let totalCoins = 0;
  for (let r = 0; r < state.rows; r++) {
    for (let c = 0; c < state.cols; c++) {
      const tile = state.grid[r][c];
      if (tile && tile.category === "collectible" && tile.id === "coin") {
        totalCoins++;
      }
    }
  }
  document.getElementById("label-coins").textContent = totalCoins;
}

// Map Editor interaction events
let isDrawing = false;
let isPanning = false;
let lastMouseX = 0;
let lastMouseY = 0;

function setupEventListeners() {
  // Zoom & Pan Actions
  container.addEventListener("wheel", (e) => {
    e.preventDefault();
    const zoomIntensity = 0.08;
    if (e.deltaY < 0) {
      state.zoom = Math.min(2.5, state.zoom + zoomIntensity);
    } else {
      state.zoom = Math.max(0.4, state.zoom - zoomIntensity);
    }
    applyCanvasTransform();
  });

  // Drag pan if shift key or mouse middle button
  container.addEventListener("mousedown", (e) => {
    if (e.shiftKey || e.button === 1 || state.currentTool === "pan") {
      isPanning = true;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
      container.style.cursor = "grabbing";
      e.preventDefault();
      return;
    }

    // Grid coordinates extraction
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / state.zoom;
    const y = (e.clientY - rect.top) / state.zoom;

    const col = Math.floor(x / TILE_SIZE);
    const row = Math.floor(y / TILE_SIZE);

    if (col >= 0 && col < state.cols && row >= 0 && row < state.rows) {
      isDrawing = true;
      handleCanvasClickOrDrag(row, col, e.button === 2); // true if right click
    }
  });

  window.addEventListener("mousemove", (e) => {
    // Coordinate HUD tracking
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / state.zoom;
    const y = (e.clientY - rect.top) / state.zoom;
    const col = Math.floor(x / TILE_SIZE);
    const row = Math.floor(y / TILE_SIZE);

    if (col >= 0 && col < state.cols && row >= 0 && row < state.rows) {
      document.getElementById("label-cursor").textContent = `${col}, ${row}`;
    }

    if (isPanning) {
      const dx = e.clientX - lastMouseX;
      const dy = e.clientY - lastMouseY;
      state.panX += dx;
      state.panY += dy;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
      applyCanvasTransform();
      return;
    }

    if (isDrawing && col >= 0 && col < state.cols && row >= 0 && row < state.rows) {
      handleCanvasClickOrDrag(row, col, e.buttons === 2);
    }
  });

  window.addEventListener("mouseup", () => {
    isDrawing = false;
    isPanning = false;
    container.style.cursor = "crosshair";
  });

  // Stop default Right Click menu inside canvas
  canvas.addEventListener("contextmenu", (e) => {
    e.preventDefault();
  });

  // Toolbar state selection hooks
  document.getElementById("tool-brush").addEventListener("click", () => setTool("brush"));
  document.getElementById("tool-eraser").addEventListener("click", () => setTool("eraser"));
  document.getElementById("tool-bucket").addEventListener("click", () => setTool("bucket"));
  document.getElementById("tool-select").addEventListener("click", () => setTool("select"));

  // Canvas zoom/pan controls
  document.getElementById("btn-zoom-in").addEventListener("click", () => {
    state.zoom = Math.min(2.5, state.zoom + 0.15);
    applyCanvasTransform();
  });
  document.getElementById("btn-zoom-out").addEventListener("click", () => {
    state.zoom = Math.max(0.4, state.zoom - 0.15);
    applyCanvasTransform();
  });
  document.getElementById("btn-zoom-reset").addEventListener("click", () => {
    state.zoom = getFitZoom();
    state.panX = 0;
    state.panY = 0;
    applyCanvasTransform();
  });
  document.getElementById("btn-toggle-grid").addEventListener("click", (e) => {
    state.gridlines = !state.gridlines;
    e.currentTarget.classList.toggle("bg-gray-800");
    e.currentTarget.classList.toggle("bg-purple-900/50");
    renderGrid();
  });
  document.getElementById("btn-clear-grid").addEventListener("click", () => {
    if (confirm("Reset current map layout to clear state?")) {
      resetGridToEmpty();
      renderGrid();
    }
  });

  // Sidebar changes callback
  document.getElementById("prop-tile-name").addEventListener("input", (e) => {
    let block = getInspectedBlock();
    if (block) {
      block.name = e.target.value;
      buildPalettes();
      renderGrid();
      saveToLocalStorage();
      if (typeof validateScriptsAndLevel === "function") {
        validateScriptsAndLevel();
      }
    }
  });

  // Set to Default Button logic
  document.getElementById("btn-prop-reset").addEventListener("click", () => {
    const block = getInspectedBlock();
    const statusMsg = document.getElementById("reset-status-msg");
    if (!block) return;

    if (ORIGINAL_DEFAULT_BLOCKS[block.id]) {
      const orig = ORIGINAL_DEFAULT_BLOCKS[block.id];
      // Reset properties of this block instance
      block.name = orig.name;
      block.color = orig.color;
      block.emoji = orig.emoji;
      block.solid = orig.solid;
      block.damage = orig.damage;
      block.score = orig.score;
      block.scripts = JSON.parse(JSON.stringify(orig.scripts || []));
      block.js = orig.js || "";

      // Rebuild palette, update selection details, redraw grid and persist state
      buildPalettes();
      updateSelectionPanel();
      renderGrid();
      saveToLocalStorage();

      statusMsg.className = "text-[10px] text-center font-mono text-emerald-400 transition duration-300 min-h-[16px]";
      statusMsg.textContent = "Properties reset to default!";
    } else {
      statusMsg.className = "text-[10px] text-center font-mono text-red-400 transition duration-300 min-h-[16px]";
      statusMsg.textContent = "Custom blocks cannot be reset!";
    }

    // Auto-clear message after 3 seconds
    if (window.resetMsgTimeout) clearTimeout(window.resetMsgTimeout);
    window.resetMsgTimeout = setTimeout(() => {
      statusMsg.textContent = "";
    }, 3000);
  });
  document.getElementById("prop-tile-color").addEventListener("input", (e) => {
    let block = getInspectedBlock();
    if (block) {
      block.color = e.target.value;
      document.getElementById("prop-tile-color-lbl").textContent = e.target.value.toUpperCase();
      buildPalettes();
      renderGrid();
      saveToLocalStorage();
      if (typeof validateScriptsAndLevel === "function") {
        validateScriptsAndLevel();
      }
    }
  });
  document.getElementById("prop-tile-emoji").addEventListener("input", (e) => {
    let block = getInspectedBlock();
    if (block) {
      block.emoji = e.target.value;
      buildPalettes();
      renderGrid();
      saveToLocalStorage();
      if (typeof validateScriptsAndLevel === "function") {
        validateScriptsAndLevel();
      }
    }
  });
  document.getElementById("prop-tile-solid").addEventListener("change", (e) => {
    let block = getInspectedBlock();
    if (block) {
      block.solid = e.target.checked;
      renderGrid();
      saveToLocalStorage();
      if (typeof validateScriptsAndLevel === "function") {
        validateScriptsAndLevel();
      }
    }
  });
  document.getElementById("prop-tile-damage").addEventListener("input", (e) => {
    let block = getInspectedBlock();
    if (block) {
      block.damage = Number(e.target.value);
      saveToLocalStorage();
    }
  });
  document.getElementById("prop-tile-score").addEventListener("input", (e) => {
    let block = getInspectedBlock();
    if (block) {
      block.score = Number(e.target.value);
      saveToLocalStorage();
    }
  });
  document.getElementById("prop-tile-js").addEventListener("input", (e) => {
    let block = getInspectedBlock();
    if (block) {
      block.js = e.target.value;
      saveToLocalStorage();
      if (typeof validateScriptsAndLevel === "function") {
        validateScriptsAndLevel();
      }
    }
  });

  // Adding Script Action node Row inside Inspect Block Scripts tab
  document.getElementById("btn-add-script-row").addEventListener("click", () => {
    let block = getInspectedBlock();
    if (block) {
      if (!block.scripts) block.scripts = [];
      block.scripts.push({
        event: "collide",
        action: "play_sound",
        params: { type: "coin" }
      });
      updateSelectionPanel();
      saveToLocalStorage();
    }
  });

  // Right Panel tab toggle selectors
  document.getElementById("tab-properties").addEventListener("click", () => {
    toggleRightPanelTab("properties");
  });
  document.getElementById("tab-logic").addEventListener("click", () => {
    toggleRightPanelTab("logic");
  });
  document.getElementById("tab-sprites").addEventListener("click", () => {
    toggleRightPanelTab("sprites");
  });
  document.getElementById("tab-ai-copilot").addEventListener("click", () => {
    toggleRightPanelTab("ai-copilot");
  });
  document.getElementById("tab-files").addEventListener("click", () => {
    toggleRightPanelTab("files");
  });

  // Local File Manager actions
  document.getElementById("btn-file-save").addEventListener("click", () => {
    const input = document.getElementById("file-name-input");
    const name = input ? input.value.trim() : "";
    if (state.currentFileId) {
      saveActiveFile();
    } else {
      if (!name) {
        alert("Please enter a file name!");
        return;
      }
      createSavedFile(name);
    }
  });

  document.getElementById("btn-file-save-as").addEventListener("click", () => {
    const input = document.getElementById("file-name-input");
    const name = input ? input.value.trim() : "";
    if (!name) {
      alert("Please enter a file name to Save As!");
      return;
    }
    saveAsNewFile(name);
  });

  document.getElementById("btn-file-new").addEventListener("click", () => {
    if (confirm("Create a brand new clean layout? Any unsaved changes will be lost.")) {
      state.currentFileId = null;
      state.currentFileName = "";
      resetGridToEmpty();
      syncFormControls();
      updateActiveFileDisplay();
      renderSavedFilesList();
      renderGrid();
    }
  });

  document.getElementById("btn-file-import-mgr").addEventListener("click", () => {
    document.getElementById("file-import-mgr-input").click();
  });

  document.getElementById("file-import-mgr-input").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        const name = parsed.name || file.name.replace(/\.json$/i, "") || "Imported Level";

        // Let's create this imported JSON straight as a new file in manager
        const id = "file_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);
        const files = getSavedFiles();
        files[id] = {
          id: id,
          name: name,
          cols: parsed.cols || 30,
          rows: parsed.rows || 16,
          grid: parsed.grid || [],
          customBlocks: parsed.customBlocks || {},
          gravity: parsed.gravity !== undefined ? parsed.gravity : 0.5,
          speed: parsed.speed !== undefined ? parsed.speed : 4.0,
          lives: parsed.lives || 3,
          genre: parsed.genre || "platformer",
        mobileMode: parsed.mobileMode !== undefined ? parsed.mobileMode : false,
          defaultBlockVisuals: parsed.defaultBlockVisuals || {},
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
        saveSavedFiles(files);
        loadSavedFile(id);
        alert(`Successfully imported file "${name}" into saved list!`);
      } catch (err) {
        alert("Invalid file format. Ensure it is correct JSON level configuration.");
      }
    };
    reader.readAsText(file);
  });

  // Clear runtime errors button
  document.getElementById("btn-clear-runtime").addEventListener("click", () => {
    state.runtimeErrors = [];
    validateScriptsAndLevel();
  });

  // Global Level configs
  document.getElementById("input-grid-cols").addEventListener("change", (e) => {
    state.cols = Math.max(10, Math.min(100, Number(e.target.value)));
    adjustGridDimensions();
    resizeCanvas();
    renderGrid();
    saveToLocalStorage();
  });
  document.getElementById("input-grid-rows").addEventListener("change", (e) => {
    state.rows = Math.max(10, Math.min(100, Number(e.target.value)));
    adjustGridDimensions();
    resizeCanvas();
    renderGrid();
    saveToLocalStorage();
  });
  document.getElementById("input-gravity").addEventListener("input", (e) => {
    state.gravity = Number(e.target.value);
    document.getElementById("label-gravity").textContent = state.gravity;
    saveToLocalStorage();
  });
  document.getElementById("input-speed").addEventListener("input", (e) => {
    state.speed = Number(e.target.value);
    document.getElementById("label-speed").textContent = state.speed;
    saveToLocalStorage();
  });
  document.getElementById("select-lives").addEventListener("change", (e) => {
    state.lives = Number(e.target.value);
    saveToLocalStorage();
  });

  // Genre select event
  document.getElementById("select-genre").addEventListener("change", (e) => {
    state.genre = e.target.value;
    // Update mobile controls layout/visibility when genre changes
    if (typeof updateMobileControlsVisibility === "function") {
      updateMobileControlsVisibility();
    }
    saveToLocalStorage();
    if (typeof validateScriptsAndLevel === "function") {
      validateScriptsAndLevel();
    }
  });

  // Mobile Mode toggle button click handler
  const btnMobileMode = document.getElementById("btn-mobile-mode");
  if (btnMobileMode) {
    btnMobileMode.addEventListener("click", () => {
      state.mobileMode = !state.mobileMode;
      updateMobileButtonUI();
      if (state.mobileMode) {
        state.zoom = getFitZoom();
        state.panX = 0;
        state.panY = 0;
        resizeCanvas();
        renderGrid();
      }
      if (typeof updateMobileControlsVisibility === "function") {
        updateMobileControlsVisibility();
      }
      saveToLocalStorage();
    });
  }

  // Custom Block Builder Modal Actions
  document.getElementById("btn-add-custom-block").addEventListener("click", () => {
    document.getElementById("modal-custom-block").classList.remove("opacity-0", "pointer-events-none");
  });
  document.getElementById("btn-modal-close").addEventListener("click", () => {
    closeCustomBlockModal();
  });
  document.getElementById("btn-modal-cancel").addEventListener("click", () => {
    closeCustomBlockModal();
  });
  document.getElementById("modal-block-color").addEventListener("input", (e) => {
    document.getElementById("modal-block-color-lbl").textContent = e.target.value.toUpperCase();
  });
  document.getElementById("btn-modal-save").addEventListener("click", () => {
    const rawId = document.getElementById("modal-block-id").value.trim().toLowerCase().replace(/\s+/g, "_");
    const name = document.getElementById("modal-block-name").value.trim();
    const emoji = document.getElementById("modal-block-emoji").value.trim() || "🧱";
    const color = document.getElementById("modal-block-color").value;
    const cat = document.querySelector('input[name="modal-category"]:checked').value;

    if (!rawId || !name) {
      alert("Please provide a valid block ID and Name.");
      return;
    }

    if (DEFAULT_BLOCKS[rawId] || state.customBlocks[rawId]) {
      alert("A block type with this ID already exists!");
      return;
    }

    // Build brand new custom definition block
    state.customBlocks[rawId] = {
      id: rawId,
      name: name,
      category: cat,
      color: color,
      emoji: emoji,
      solid: cat === "solid",
      damage: cat === "hazard" ? 25 : 0,
      score: cat === "collectible" ? 1 : 0,
      scripts: []
    };

    saveToLocalStorage();
    buildPalettes();
    closeCustomBlockModal();
  });

  // Level file import-export triggers
  document.getElementById("btn-export").addEventListener("click", () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      cols: state.cols,
      rows: state.rows,
      grid: state.grid,
      customBlocks: state.customBlocks,
      gravity: state.gravity,
      speed: state.speed,
      lives: state.lives,
      genre: state.genre,
      defaultBlockVisuals: getDefaultBlockVisuals()
    }, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `blocks_level_${state.genre}.json`);
    dlAnchorElem.click();
  });

  document.getElementById("btn-import").addEventListener("click", () => {
    document.getElementById("import-file-input").click();
  });
  document.getElementById("import-file-input").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        state.cols = parsed.cols || 30;
        state.rows = parsed.rows || 16;
        state.customBlocks = parsed.customBlocks || {};
        state.gravity = parsed.gravity !== undefined ? parsed.gravity : 0.5;
        state.speed = parsed.speed !== undefined ? parsed.speed : 4.0;
        state.lives = parsed.lives || 3;
        state.genre = parsed.genre || "platformer";
        state.mobileMode = parsed.mobileMode !== undefined ? parsed.mobileMode : false;
        state.grid = parsed.grid || [];

        // Apply imported default block visual modifications if any
        applyDefaultBlockVisuals(parsed.defaultBlockVisuals);

        adjustGridDimensions();
        syncFormControls();
        buildPalettes();
        resizeCanvas();
        renderGrid();
        saveToLocalStorage();
        alert("Level JSON imported successfully!");
      } catch (err) {
        alert("Invalid level config format file. Ensure it is correct JSON.");
      }
    };
    reader.readAsText(file);
  });

  // AI Copilot Actions
  document.getElementById("btn-ai-gen-script").addEventListener("click", () => {
    const prompt = document.getElementById("ai-prompt-input").value;
    if (!prompt.trim()) {
      aiLog("Please write a description/prompt first!", "error");
      return;
    }
    generateAiScript(prompt);
  });

  document.getElementById("btn-ai-gen-level").addEventListener("click", () => {
    const prompt = document.getElementById("ai-prompt-input").value;
    if (!prompt.trim()) {
      aiLog("Please write a description/prompt first!", "error");
      return;
    }
    generateAiLevel(prompt);
  });

  document.querySelectorAll(".ai-suggestion-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const p = btn.getAttribute("data-prompt");
      document.getElementById("ai-prompt-input").value = p;
      aiLog(`Selected prompt: "${p}"`);
    });
  });

  // Template dropdown load listener
  document.getElementById("select-template").addEventListener("change", (e) => {
    loadTemplate(e.target.value);
  });

  // Watch for system resizing
  window.addEventListener("resize", () => {
    // Dynamically adjust zoom on mobile layouts to prevent canvas size overflow
    if (window.innerWidth < 1024 || state.mobileMode) {
      state.zoom = getFitZoom();
      state.panX = 0;
      state.panY = 0;
    }
    resizeCanvas();
    renderGrid();
  });

  // Watch for online/offline status changes
  window.addEventListener("online", updateConnectionStatus);
  window.addEventListener("offline", updateConnectionStatus);

  // Mobile drawer controls
  const btnTogglePalette = document.getElementById("btn-toggle-palette");
  const btnToggleProperties = document.getElementById("btn-toggle-properties");
  const btnClosePalette = document.getElementById("btn-close-palette");
  const btnCloseProperties = document.getElementById("btn-close-properties");
  const mobileBackdrop = document.getElementById("mobile-drawer-backdrop");

  if (btnTogglePalette) btnTogglePalette.addEventListener("click", openPalette);
  if (btnToggleProperties) btnToggleProperties.addEventListener("click", openSidebar);
  if (btnClosePalette) btnClosePalette.addEventListener("click", closeDrawers);
  if (btnCloseProperties) btnCloseProperties.addEventListener("click", closeDrawers);
  if (mobileBackdrop) mobileBackdrop.addEventListener("click", closeDrawers);

  // Bind Virtual Touch Controls
  setupVirtualControlListeners();

  // Sprites Tab Interactive Elements Listeners
  const quickSelect = document.getElementById("sprite-emoji-quick-select");
  if (quickSelect) {
    quickSelect.addEventListener("change", (e) => {
      const val = e.target.value;
      if (val) {
        document.getElementById("sprite-emoji-custom-input").value = val;
      }
    });
  }

  const colorInput = document.getElementById("sprite-color-input");
  if (colorInput) {
    colorInput.addEventListener("input", (e) => {
      document.getElementById("sprite-color-lbl").textContent = e.target.value.toUpperCase();
    });
  }

  const btnApply = document.getElementById("btn-sprite-apply");
  if (btnApply) {
    btnApply.addEventListener("click", () => {
      applySpriteVisualChanges();
    });
  }
}

function applySpriteVisualChanges() {
  const id = state.selectedSpriteId;
  if (!id) return;

  const emoji = document.getElementById("sprite-emoji-custom-input").value.trim() || "🧱";
  const color = document.getElementById("sprite-color-input").value;

  // 1. Mutate blocks configurations in memory
  if (DEFAULT_BLOCKS[id]) {
    DEFAULT_BLOCKS[id].emoji = emoji;
    DEFAULT_BLOCKS[id].color = color;
  } else if (state.customBlocks[id]) {
    state.customBlocks[id].emoji = emoji;
    state.customBlocks[id].color = color;
  }

  // 2. Scan state.grid and mutate any matching placed block instance
  for (let r = 0; r < state.rows; r++) {
    for (let c = 0; c < state.cols; c++) {
      if (state.grid[r][c] && state.grid[r][c].id === id) {
        state.grid[r][c].emoji = emoji;
        state.grid[r][c].color = color;
      }
    }
  }

  // 3. Rebuild palettes, save changes, and redraw grid
  buildPalettes();
  saveToLocalStorage();
  renderGrid();

  // Refresh Sprites Tab UI preview
  selectSpriteForEditing(id);

  if (typeof validateScriptsAndLevel === "function") {
    validateScriptsAndLevel();
  }
}

function setupVirtualControlListeners() {
  const bindings = [
    { id: "mbtn-up", key: "ArrowUp" },
    { id: "mbtn-down", key: "ArrowDown" },
    { id: "mbtn-left", key: "ArrowLeft" },
    { id: "mbtn-right", key: "ArrowRight" },
    { id: "mbtn-jump", key: " " }
  ];

  bindings.forEach(binding => {
    const btn = document.getElementById(binding.id);
    if (!btn) return;

    // We support both Mouse and Touch events to ensure seamless operation
    const press = (e) => {
      e.preventDefault();
      if (typeof game !== "undefined") {
        game.keysPressed[binding.key] = true;
      }
    };

    const release = (e) => {
      e.preventDefault();
      if (typeof game !== "undefined") {
        game.keysPressed[binding.key] = false;
      }
    };

    btn.addEventListener("mousedown", press);
    btn.addEventListener("touchstart", press);
    btn.addEventListener("mouseup", release);
    btn.addEventListener("touchend", release);
    btn.addEventListener("mouseleave", release);
  });
}

// Check and update browser online/offline connection state banner display
function updateConnectionStatus() {
  const banner = document.getElementById("offline-banner");
  if (!banner) return;
  const content = document.getElementById("offline-banner-content");
  const iconBg = document.getElementById("offline-banner-icon-bg");
  const icon = document.getElementById("offline-banner-icon");
  const title = document.getElementById("offline-banner-title");
  const desc = document.getElementById("offline-banner-desc");

  if (!navigator.onLine) {
    // Show offline banner
    banner.classList.remove("hidden");

    // Set offline styles
    if (content) content.className = "bg-red-600 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-3 font-sans text-sm font-semibold border border-red-500 z-50";
    if (iconBg) iconBg.className = "bg-red-700 p-1.5 rounded-lg flex items-center justify-center";
    if (icon) icon.className = "fas fa-wifi-slash text-lg";
    if (title) title.textContent = "No Internet Connection";
    if (desc) desc.textContent = "Please check your network settings. Some features may not work.";

    // Clear any auto-hide timeout
    if (window.offlineBannerTimeout) {
      clearTimeout(window.offlineBannerTimeout);
      window.offlineBannerTimeout = null;
    }
  } else {
    // If the banner was already visible (meaning we just transitioned from offline to online)
    if (!banner.classList.contains("hidden")) {
      // Switch to online success style
      if (content) content.className = "bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-3 font-sans text-sm font-semibold border border-emerald-500 z-50";
      if (iconBg) iconBg.className = "bg-emerald-700 p-1.5 rounded-lg flex items-center justify-center";
      if (icon) icon.className = "fas fa-wifi text-lg";
      if (title) title.textContent = "Internet Connection Restored";
      if (desc) desc.textContent = "You are back online.";

      // Auto-hide after 3 seconds
      if (window.offlineBannerTimeout) {
        clearTimeout(window.offlineBannerTimeout);
      }
      window.offlineBannerTimeout = setTimeout(() => {
        banner.classList.add("hidden");
      }, 3000);
    } else {
      // Just to be safe, if already online and banner not shown, keep hidden
      banner.classList.add("hidden");
    }
  }
}

// Built-in Level templates pre-configs
const TEMPLATES = {
  platformer_demo: {
    cols: 30,
    rows: 16,
    genre: "platformer",
    gravity: 0.5,
    speed: 4.5,
    lives: 3,
    customBlocks: {},
    grid_init: (grid) => {
      const g = getBlockById;
      // Draw ground at the bottom
      for (let c = 0; c < 30; c++) {
        grid[15][c] = g("ground");
        if (c < 10 || c > 18) {
          grid[14][c] = g("ground");
        }
      }

      // Spawn Player on left
      grid[13][2] = g("player_spawn");

      // Add a default Ruby Gem block on the canvas above player spawn
      grid[11][2] = g("gem");

      // Place lava gap in middle ground
      for (let c = 10; c <= 18; c++) {
        grid[15][c] = g("lava");
      }

      // Some higher brick blocks and floating platforms
      grid[11][6] = g("brick");
      grid[11][7] = g("brick");
      grid[11][8] = g("brick");

      grid[11][13] = g("brick");
      grid[11][14] = g("brick");
      grid[11][15] = g("brick");

      // Place bouncy mushroom pad near right ledge to jump high
      grid[13][20] = g("bouncy_pad");

      // Some floating stone ledges
      grid[7][23] = g("stone");
      grid[7][24] = g("stone");
      grid[7][25] = g("stone");

      // Spikes trap
      grid[13][12] = g("spikes");

      // Gold Coins to collect
      grid[10][7] = g("coin");
      grid[10][14] = g("coin");
      grid[13][25] = g("coin");
      grid[13][26] = g("coin");
      grid[6][24] = g("gem");

      // Patrol Goblin enemies walking on ledges
      grid[10][13] = g("patrol_enemy");

      // Exit goal portal locked behind a keyed locked door block
      grid[13][28] = g("portal");
      grid[13][27] = g("locked_door");

      // Gold Key hidden on the high left ledge
      grid[6][7] = g("key");
      grid[7][7] = g("stone");
    }
  },

  maze_demo: {
    cols: 30,
    rows: 16,
    genre: "topdown",
    gravity: 0,
    speed: 4,
    lives: 3,
    customBlocks: {},
    grid_init: (grid) => {
      const g = getBlockById;
      // Build border outer walls
      for (let r = 0; r < 16; r++) {
        for (let c = 0; c < 30; c++) {
          if (r === 0 || r === 15 || c === 0 || c === 29) {
            grid[r][c] = g("brick");
          }
        }
      }

      // Maze corridors walls
      for (let r = 2; r < 14; r += 2) {
        for (let c = 2; c < 28; c++) {
          if (c % 4 !== 0) {
            grid[r][c] = g("brick");
          }
        }
      }

      // Open a few pass-through pathways
      grid[4][12] = null;
      grid[8][8] = null;
      grid[10][20] = null;
      grid[6][16] = null;

      // Spawns
      grid[1][1] = g("player_spawn");

      // Coins scattered
      grid[1][15] = g("coin");
      grid[5][5] = g("coin");
      grid[5][25] = g("coin");
      grid[9][3] = g("coin");
      grid[9][15] = g("gem");
      grid[13][13] = g("coin");

      // Danger lava spikes
      grid[7][15] = g("lava");
      grid[11][5] = g("spikes");

      // Goblin Patrols in corridors
      grid[3][10] = g("patrol_enemy");
      grid[7][22] = g("patrol_enemy");

      // Key, locked door and Portal exit goal
      grid[13][28] = g("portal");
      grid[13][27] = g("locked_door");
      grid[1][28] = g("key");
    }
  },

  logic_demo: {
    cols: 30,
    rows: 16,
    genre: "platformer",
    gravity: 0.5,
    speed: 4,
    lives: 3,
    customBlocks: {},
    grid_init: (grid) => {
      const g = getBlockById;

      // Ground floor
      for (let c = 0; c < 30; c++) {
        grid[15][c] = g("ground");
      }

      // Spawns
      grid[14][2] = g("player_spawn");

      // Create a Custom JS active block that boosts the player upwards when touched
      const customSling = JSON.parse(JSON.stringify(g("stone")));
      customSling.id = "custom_js_sling";
      customSling.name = "Hyper Slinger Pad";
      customSling.color = "#ec4899";
      customSling.emoji = "🛸";
      customSling.solid = true;
      customSling.js = `player.vy = -18; // hyper launch force\nsound.play('jump');\ngame.addCoins(5);`;

      grid[14][10] = customSling;

      // High coins above custom launcher block
      grid[5][10] = g("gem");
      grid[6][10] = g("coin");
      grid[7][10] = g("coin");

      // Exit goal portal
      grid[14][28] = g("portal");
    }
  }
};

function loadTemplate(templateId) {
  const tmpl = TEMPLATES[templateId];
  if (!tmpl) return;

  // Reset default blocks to original settings before loading a template
  applyDefaultBlockVisuals(null);

  state.cols = tmpl.cols;
  state.rows = tmpl.rows;
  state.genre = tmpl.genre;
  state.gravity = tmpl.gravity;
  state.speed = tmpl.speed;
  state.lives = tmpl.lives;
  state.customBlocks = JSON.parse(JSON.stringify(tmpl.customBlocks));

  // Build grid
  state.grid = [];
  for (let r = 0; r < state.rows; r++) {
    state.grid.push(new Array(state.cols).fill(null));
  }

  // Populate blocks
  tmpl.grid_init(state.grid);

  // Sync editor controls
  syncFormControls();
  buildPalettes();
  state.zoom = getFitZoom();
  state.panX = 0;
  state.panY = 0;
  resizeCanvas();
  renderGrid();
  saveToLocalStorage();

  // Synchronize the template dropdown selector in the UI
  const selectTmpl = document.getElementById("select-template");
  if (selectTmpl) {
    selectTmpl.value = templateId;
  }
  closeDrawers();
}

function closeCustomBlockModal() {
  document.getElementById("modal-custom-block").classList.add("opacity-0", "pointer-events-none");
  // reset inputs
  document.getElementById("modal-block-id").value = "";
  document.getElementById("modal-block-name").value = "";
  document.getElementById("modal-block-emoji").value = "";
}

function toggleRightPanelTab(tabName) {
  const tabProp = document.getElementById("tab-properties");
  const tabLogic = document.getElementById("tab-logic");
  const tabSprites = document.getElementById("tab-sprites");
  const tabAi = document.getElementById("tab-ai-copilot");
  const tabFiles = document.getElementById("tab-files");
  const contentProp = document.getElementById("content-properties");
  const contentLogic = document.getElementById("content-logic");
  const contentSprites = document.getElementById("content-sprites");
  const contentAi = document.getElementById("content-ai-copilot");
  const contentFiles = document.getElementById("content-files");

  // Reset styles
  [tabProp, tabLogic, tabSprites, tabAi, tabFiles].forEach(t => {
    if (t) {
      t.className = "flex-1 py-2 text-center text-[10px] font-bold border-b-2 border-transparent text-gray-400 hover:text-white hover:bg-gray-900/50 focus:outline-none";
    }
  });
  [contentProp, contentLogic, contentSprites, contentAi, contentFiles].forEach(c => {
    if (c) c.classList.add("hidden");
  });

  if (tabName === "properties") {
    tabProp.className = "flex-1 py-2 text-center text-[10px] font-bold border-b-2 border-purple-500 text-purple-400 bg-gray-900 focus:outline-none";
    contentProp.classList.remove("hidden");
  } else if (tabName === "logic") {
    tabLogic.className = "flex-1 py-2 text-center text-[10px] font-bold border-b-2 border-purple-500 text-purple-400 bg-gray-900 focus:outline-none";
    contentLogic.classList.remove("hidden");
  } else if (tabName === "sprites") {
    tabSprites.className = "flex-1 py-2 text-center text-[10px] font-bold border-b-2 border-purple-500 text-purple-400 bg-gray-900 focus:outline-none";
    contentSprites.classList.remove("hidden");
    renderSpritesTab();
  } else if (tabName === "ai-copilot") {
    tabAi.className = "flex-1 py-2 text-center text-[10px] font-bold border-b-2 border-purple-500 text-purple-400 bg-gray-900 focus:outline-none";
    contentAi.classList.remove("hidden");
  } else if (tabName === "files") {
    if (tabFiles) tabFiles.className = "flex-1 py-2 text-center text-[10px] font-bold border-b-2 border-purple-500 text-purple-400 bg-gray-900 focus:outline-none";
    if (contentFiles) contentFiles.classList.remove("hidden");
  }
}

// Render the Sprites list inside Sprites tab
function renderSpritesTab() {
  const container = document.getElementById("sprites-list");
  if (!container) return;

  container.innerHTML = "";

  const allBlocks = { ...DEFAULT_BLOCKS, ...state.customBlocks };
  Object.values(allBlocks).forEach(block => {
    const card = document.createElement("button");
    card.className = "flex flex-col items-center justify-center p-2 rounded-lg bg-gray-900 border hover:border-purple-500 transition space-y-1";
    card.style.borderColor = state.selectedSpriteId === block.id ? "#a855f7" : "#1f2937";
    if (state.selectedSpriteId === block.id) {
      card.classList.add("ring-1", "ring-purple-500/50");
    }

    card.innerHTML = `
      <span class="text-xl">${block.emoji || "🧱"}</span>
      <span class="text-[9px] font-mono text-gray-400 truncate max-w-full" style="color: ${block.color}">${block.name}</span>
    `;

    card.addEventListener("click", () => {
      selectSpriteForEditing(block.id);
    });

    container.appendChild(card);
  });
}

function selectSpriteForEditing(id) {
  state.selectedSpriteId = id;
  renderSpritesTab();

  const block = getBlockById(id);
  if (!block) return;

  const editPanel = document.getElementById("sprite-edit-panel");
  editPanel.classList.remove("hidden");

  document.getElementById("sprite-edit-preview").textContent = block.emoji || "🧱";
  document.getElementById("sprite-edit-preview").style.backgroundColor = block.color + "22";
  document.getElementById("sprite-edit-preview").style.borderColor = block.color;
  document.getElementById("sprite-edit-title").textContent = block.name;
  document.getElementById("sprite-edit-subtitle").textContent = block.category.toUpperCase();

  document.getElementById("sprite-emoji-quick-select").value = "";
  document.getElementById("sprite-emoji-custom-input").value = block.emoji || "";
  document.getElementById("sprite-color-input").value = block.color;
  document.getElementById("sprite-color-lbl").textContent = block.color.toUpperCase();
}

// Helper to print in the AI console log
function aiLog(msg, type = "info") {
  const consoleLog = document.getElementById("ai-console-log");
  if (!consoleLog) return;
  const colorClass = type === "error" ? "text-red-400" : type === "success" ? "text-emerald-300" : "text-purple-300";
  consoleLog.innerHTML += `<br><span class="${colorClass}">&gt; ${msg}</span>`;
  consoleLog.scrollTop = consoleLog.scrollHeight;
}

// Generate AI explanation for errors and warnings
function generateProblemExplanation(p) {
  const msg = (p.message || "").toLowerCase();
  const group = p.group || "";

  if (group === "tile_js_syntax_error" || group === "palette_js_syntax_error") {
    return {
      explanation: "The custom JavaScript snippet attached to this block contains a syntax error, which prevents execution or may cause scripts to fail.",
      fix: "Select the block and inspect its Custom Javascript field in the Scripts tab. Ensure brackets, quotes, and syntax are valid (e.g. ending statements with semicolons).",
      prompt: "speed pad script"
    };
  }

  if (group === "empty_js") {
    return {
      explanation: "A custom JS section exists for this block but contains no executable code (only whitespace or comments).",
      fix: "Add valid JavaScript code (e.g., `player.vy = -12; sound.play('jump');`) or clear the textarea if no custom behavior is needed.",
      prompt: "speed pad script"
    };
  }

  if (group === "missing_action") {
    return {
      explanation: "A script trigger rule has an event defined (like 'On Collision Touch') but no target action is assigned.",
      fix: "Select the block, open the Scripts panel, and assign an action to the script rule (or click the trash icon to remove the incomplete rule).",
      prompt: "trampoline bounce script"
    };
  }

  if (group === "invalid_script_param") {
    return {
      explanation: "A parameter value in a visual scripting rule is outside the safe operating range.",
      fix: "Adjust the script parameter value (e.g. bounce strength) to be within the safe range of 1 to 20.",
      prompt: "trampoline bounce script"
    };
  }

  if (group === "solid_collectible") {
    return {
      explanation: "A collectible item (such as a coin or key) is marked as a solid obstacle, which blocks the player from touching and collecting it.",
      fix: "Select the block and uncheck 'Is Solid Obstacle' in the Properties panel so the player can pass through and collect it.",
      prompt: "Help fix solid collectible issue"
    };
  }

  if (group === "floating_spawn") {
    return {
      explanation: "The Player Spawn location is placed floating in mid-air in Platformer mode with gravity active.",
      fix: "Place solid ground tiles directly beneath the 🧙 Player Spawn block, or lower the spawn block onto a platform so the player doesn't instantly fall.",
      prompt: "generate floating sky level"
    };
  }

  if (group === "spawn_near_hazard") {
    return {
      explanation: "The Player Spawn block is placed directly adjacent to a hazard (lava/spikes) or an enemy actor.",
      fix: "Move the Player Spawn at least 1-2 tiles away from hazards and enemies to avoid taking immediate damage on level start.",
      prompt: "Help fix spawn location hazard"
    };
  }

  if (group === "spawn_trapped") {
    return {
      explanation: "The Player Spawn block is completely surrounded by solid walls with no open path in Top-Down mode.",
      fix: "Remove at least one surrounding solid block to create a clear pathway for player movement.",
      prompt: "generate spiral maze"
    };
  }

  if (group === "multiple_spawns") {
    return {
      explanation: "More than one 🧙 Player Spawn block exists on the level grid.",
      fix: "Keep only one Player Spawn location. Use the Eraser tool to remove duplicate spawn blocks.",
      prompt: "Help clean up extra player spawn blocks"
    };
  }

  if (group === "multiple_portals") {
    return {
      explanation: "Multiple 🌀 Goal Portals are placed on the level.",
      fix: "Remove extra Goal Portals so that there is a single clear finish goal for the level.",
      prompt: "Help fix goal portal placement"
    };
  }

  if (group === "topdown_gravity") {
    return {
      explanation: "Top-Down genre is selected, but Gravity is configured to a non-zero value, which causes downward acceleration drift.",
      fix: "In the bottom toolbar settings, set the Gravity slider value to 0.0 for Top-Down games.",
      prompt: "gravity flip script"
    };
  }

  if (group === "runtime_crash") {
    return {
      explanation: "A JavaScript runtime exception occurred while running the game simulation.",
      fix: "Inspect custom script logic on the block where the exception occurred and verify variable references.",
      prompt: "Fix runtime error in game script"
    };
  }

  // Text message heuristic fallbacks
  if (msg.includes("no player spawn")) {
    return {
      explanation: "The level lacks a starting point for the player character.",
      fix: "Select the 🧙 Player Spawn block from the palette and place it on the level grid.",
      prompt: "generate floating sky level"
    };
  }

  if (msg.includes("no goal portal")) {
    return {
      explanation: "The level has no exit portal, making it impossible for the player to complete or win.",
      fix: "Select the 🌀 Goal Portal from the palette and place it where the player should finish the level.",
      prompt: "generate castle of doom"
    };
  }

  if (msg.includes("locked door") && msg.includes("no golden key")) {
    return {
      explanation: "A 🔒 Locked Door is present on the level, but no 🔑 Golden Key exists to unlock it.",
      fix: "Place a 🔑 Golden Key block somewhere reachable on the level so the player can pick it up and open the door.",
      prompt: "generate spiral maze"
    };
  }

  if (msg.includes("golden key") && msg.includes("no locked door")) {
    return {
      explanation: "A 🔑 Golden Key is placed on the level, but there is no 🔒 Locked Door to unlock.",
      fix: "Add a 🔒 Locked Door blocking an important path or portal, or erase the unused key.",
      prompt: "generate spiral maze"
    };
  }

  if (msg.includes("platformer") && msg.includes("no solid")) {
    return {
      explanation: "Platformer genre is active with gravity, but there are no solid platform blocks placed on the grid.",
      fix: "Paint some 🧱 Ground or 🪨 Stone platform blocks for the player to stand on.",
      prompt: "generate floating sky level"
    };
  }

  return {
    explanation: `The system detected a potential issue: "${p.message}"`,
    fix: "Review your level layout or tile properties to address this condition.",
    prompt: `Help fix issue: ${p.message}`
  };
}

// "Explain with AI" button click handler
function explainProblemWithAI(p) {
  // 1. Switch right panel to AI Copilot tab
  toggleRightPanelTab("ai-copilot");
  if (typeof openSidebar === "function") {
    openSidebar();
  }

  // 2. Generate explanation and fix suggestion
  const exp = generateProblemExplanation(p);

  // 3. Print analysis in AI Copilot console log
  aiLog(`🤖 <strong>AI Problem Diagnostic</strong> [${p.type ? p.type.toUpperCase() : 'ISSUE'}]`, "info");
  if (p.coordinate) {
    aiLog(`<strong>Target:</strong> Grid Coordinate (${p.coordinate.c}, ${p.coordinate.r})`, "info");
  } else if (p.paletteId) {
    aiLog(`<strong>Target:</strong> Palette Block [${p.tileName || p.paletteId}]`, "info");
  } else {
    aiLog(`<strong>Target:</strong> Global Level Configuration`, "info");
  }
  aiLog(`<strong>Message:</strong> ${p.message}`, "error");
  aiLog(`<strong>Explanation:</strong> ${exp.explanation}`, "info");
  aiLog(`<strong>Recommended Fix:</strong> ${exp.fix}`, "success");

  // 4. Set prompt input value
  const promptInput = document.getElementById("ai-prompt-input");
  if (promptInput) {
    promptInput.value = exp.prompt || `Help fix: ${p.message}`;
  }
}

// Procedural client-side heuristics AI generation parsers
function generateAiScript(prompt) {
  prompt = prompt.toLowerCase().trim();
  aiLog(`Analyzing prompt for script generation: "${prompt}"...`);

  let scriptJs = "";
  let name = "AI Generated Block";
  let color = "#a855f7";
  let emoji = "⚙️";

  if (prompt.includes("speed") || prompt.includes("velocity") || prompt.includes("dash")) {
    name = "AI Speed Boost";
    color = "#3b82f6";
    emoji = "⚡";
    scriptJs = `// AI Speed booster block
player.vx = (player.facing === 'left') ? -state.speed * 2.5 : state.speed * 2.5;
sound.play('coin');
aiLog('Speed Boost Triggered!');`;
  } else if (prompt.includes("gravity") || prompt.includes("flip") || prompt.includes("invert")) {
    name = "AI Gravity Inverter";
    color = "#f43f5e";
    emoji = "🪐";
    scriptJs = `// AI Gravity Flipper script
if (typeof state.originalGravity === 'undefined') {
  state.originalGravity = state.gravity;
}
state.gravity = -state.gravity;
sound.play('jump');
aiLog('Gravity flipped to: ' + state.gravity);`;
  } else if (prompt.includes("trampoline") || prompt.includes("bounce") || prompt.includes("spring")) {
    name = "AI Trampoline";
    color = "#eab308";
    emoji = "🍄";
    scriptJs = `// AI Trampoline super bouncer
player.vy = -16;
sound.play('jump');
aiLog('Super bounce jump executed!');`;
  } else if (prompt.includes("teleport") || prompt.includes("portal") || prompt.includes("warp")) {
    name = "AI Teleporter";
    color = "#10b981";
    emoji = "🌀";
    scriptJs = `// AI Teleporter script
const colTarget = Math.floor(Math.random() * state.cols);
const rowTarget = Math.floor(Math.random() * (state.rows - 2));
player.x = colTarget * 32;
player.y = rowTarget * 32;
sound.play('win');
aiLog('Warped player to coordinates: ' + colTarget + ', ' + rowTarget);`;
  } else if (prompt.includes("heal") || prompt.includes("health") || prompt.includes("life")) {
    name = "AI Recovery Core";
    color = "#22c55e";
    emoji = "💖";
    scriptJs = `// AI Health restorer
game.health = Math.min(100, game.health + 50);
sound.play('coin');
aiLog('Restored 50% Health!');`;
  } else if (prompt.includes("coin") || prompt.includes("score") || prompt.includes("points")) {
    name = "AI Lucky block";
    color = "#fbbf24";
    emoji = "🪙";
    scriptJs = `// AI Lucky bonus point block
game.addCoins(10);
sound.play('coin');
aiLog('+10 Gold coins received!');`;
  } else {
    // Generates a random fun effect script
    name = "AI Randomizer";
    color = "#a855f7";
    emoji = "🎲";
    scriptJs = `// Random AI Block Actions
const choices = [
  () => { player.vy = -12; sound.play('jump'); },
  () => { game.addCoins(3); sound.play('coin'); },
  () => { game.health = Math.max(10, game.health - 20); sound.play('hit'); }
];
choices[Math.floor(Math.random() * choices.length)]();`;
  }

  aiLog(`Synthesizing new Custom Block "${name}"...`, "success");

  // Generate unique ID
  const rawId = "ai_" + Math.random().toString(36).substring(2, 9);

  // Create and inject custom block
  state.customBlocks[rawId] = {
    id: rawId,
    name: name,
    category: "collectible",
    color: color,
    emoji: emoji,
    solid: false,
    damage: 0,
    score: 0,
    scripts: [],
    js: scriptJs
  };

  saveToLocalStorage();
  buildPalettes();

  // Highlight and select this block automatically
  state.activeBlockId = rawId;
  state.selectedCell = null;
  state.inspectingPaletteId = rawId;
  updateSelectionPanel();

  aiLog(`Success! Custom Block "${name}" has been added to your palette and is ready to paint.`, "success");
}

function generateAiLevel(prompt) {
  prompt = prompt.toLowerCase().trim();
  aiLog(`Generating procedural layout for prompt: "${prompt}"...`);

  // Clear current layout first
  resetGridToEmpty();

  const g = getBlockById;

  if (prompt.includes("maze") || prompt.includes("spiral") || prompt.includes("labyrinth")) {
    aiLog("Constructing procedural Top-Down labyrinth layout...");
    state.genre = "topdown";
    state.gravity = 0;
    state.speed = 4;
    syncFormControls();

    // Fill borders with bricks
    for (let r = 0; r < state.rows; r++) {
      for (let c = 0; c < state.cols; c++) {
        if (r === 0 || r === state.rows - 1 || c === 0 || c === state.cols - 1) {
          state.grid[r][c] = g("brick");
        } else if (r % 2 === 0 && c % 2 === 0 && Math.random() < 0.6) {
          state.grid[r][c] = g("stone");
        }
      }
    }

    // Ensure player start spawn and key, locked door, portal placement
    state.grid[1][1] = g("player_spawn");
    state.grid[1][state.cols - 2] = g("key");
    state.grid[state.rows - 2][state.cols - 2] = g("portal");
    state.grid[state.rows - 2][state.cols - 3] = g("locked_door");

    // Scatter some coins and AI Agents
    for (let i = 0; i < 6; i++) {
      const r = Math.floor(Math.random() * (state.rows - 2)) + 1;
      const c = Math.floor(Math.random() * (state.cols - 2)) + 1;
      if (!state.grid[r][c]) state.grid[r][c] = g("coin");
    }
    state.grid[state.rows - 2][1] = g("ai_agent");

    aiLog("Labyrinth construction complete!", "success");

  } else if (prompt.includes("castle") || prompt.includes("doom") || prompt.includes("dungeon") || prompt.includes("spooky")) {
    aiLog("Constructing procedural Castle of Doom platformer...");
    state.genre = "platformer";
    state.gravity = 0.5;
    state.speed = 4.5;
    syncFormControls();

    // Fill bottom ground
    for (let c = 0; c < state.cols; c++) {
      state.grid[state.rows - 1][c] = g("brick");
    }

    // Create castle rooms / ledges
    for (let c = 4; c < state.cols - 4; c += 6) {
      // Columns / pillars
      for (let r = state.rows - 4; r < state.rows - 1; r++) {
        state.grid[r][c] = g("brick");
      }
      // Floating bridge stones
      state.grid[state.rows - 5][c + 1] = g("stone");
      state.grid[state.rows - 5][c + 2] = g("stone");
      state.grid[state.rows - 5][c + 3] = g("stone");
    }

    // Lava gaps
    state.grid[state.rows - 1][10] = g("lava");
    state.grid[state.rows - 1][11] = g("lava");
    state.grid[state.rows - 1][18] = g("lava");
    state.grid[state.rows - 1][19] = g("lava");

    // Spawn player
    state.grid[state.rows - 2][2] = g("player_spawn");

    // Add Key, Locked door, Portal, AI Agents & Spikes
    state.grid[state.rows - 6][15] = g("key");
    state.grid[state.rows - 2][state.cols - 3] = g("locked_door");
    state.grid[state.rows - 2][state.cols - 2] = g("portal");

    // Spikes on bridges
    state.grid[state.rows - 6][11] = g("spikes");
    // Placing AI agent chases
    state.grid[state.rows - 6][12] = g("ai_agent");
    state.grid[state.rows - 2][state.cols - 5] = g("ai_agent");

    aiLog("Castle of Doom successfully generated!", "success");

  } else {
    // Default: Floating Sky Ledges / Parkour
    aiLog("Constructing floating sky ledges parkour platformer...");
    state.genre = "platformer";
    state.gravity = 0.55;
    state.speed = 4;
    syncFormControls();

    // Safe starting platform
    for (let c = 0; c < 5; c++) {
      state.grid[state.rows - 2][c] = g("stone");
    }
    state.grid[state.rows - 3][2] = g("player_spawn");

    // Create floating blocks with gaps
    let currRow = state.rows - 3;
    for (let c = 6; c < state.cols - 5; c += 4) {
      currRow += (Math.random() < 0.5 ? -1 : 1);
      currRow = Math.max(state.rows - 7, Math.min(state.rows - 2, currRow));

      state.grid[currRow][c] = g("stone");
      state.grid[currRow][c + 1] = g("stone");

      // Place collectible gems or spring mushroom bouncy pads
      if (Math.random() < 0.4) {
        state.grid[currRow - 1][c] = g("gem");
      } else if (Math.random() < 0.3) {
        state.grid[currRow - 1][c] = g("bouncy_pad");
      }
    }

    // Goal sky island on the far right
    const rightCol = state.cols - 4;
    for (let c = rightCol; c < state.cols; c++) {
      state.grid[state.rows - 3][c] = g("stone");
    }
    state.grid[state.rows - 4][state.cols - 2] = g("portal");
    state.grid[state.rows - 4][state.cols - 3] = g("locked_door");
    state.grid[state.rows - 4][8] = g("key");

    // Place an AI Agent Bot to chase the player across the sky!
    state.grid[state.rows - 4][state.cols - 4] = g("ai_agent");

    aiLog("Sky platformer level generated successfully!", "success");
  }

  saveToLocalStorage();
  buildPalettes();
  resizeCanvas();
  renderGrid();

  aiLog("Ready! Switch to Play Mode to test the procedural level.", "success");
}

// Tool switching handler
function setTool(tool) {
  state.currentTool = tool;

  const btnBrush = document.getElementById("tool-brush");
  const btnEraser = document.getElementById("tool-eraser");
  const btnBucket = document.getElementById("tool-bucket");
  const btnSelect = document.getElementById("tool-select");

  [btnBrush, btnEraser, btnBucket, btnSelect].forEach(btn => {
    btn.classList.remove("bg-purple-600", "text-white");
    btn.classList.add("bg-gray-800", "text-gray-400");
  });

  let activeBtn = btnBrush;
  if (tool === "eraser") activeBtn = btnEraser;
  if (tool === "bucket") activeBtn = btnBucket;
  if (tool === "select") activeBtn = btnSelect;

  activeBtn.classList.add("bg-purple-600", "text-white");
  activeBtn.classList.remove("bg-gray-800", "text-gray-400");

  document.getElementById("active-tool-display").textContent = tool.charAt(0).toUpperCase() + tool.slice(1);
  closeDrawers();
}

// Handle Paint Brush & Eraser Drag Drawing Click events
function handleCanvasClickOrDrag(row, col, isRightClick) {
  // If right click, act as ERASER regardless of current tool selection
  const activeTool = isRightClick ? "eraser" : state.currentTool;

  if (activeTool === "brush") {
    const palBlock = getBlockById(state.activeBlockId);
    if (palBlock) {
      // Create a unique clone copy of palette block definition to support unique logic scripting per tile instance
      state.grid[row][col] = JSON.parse(JSON.stringify(palBlock));
    }
  } else if (activeTool === "eraser") {
    state.grid[row][col] = null;
    if (state.selectedCell && state.selectedCell.r === row && state.selectedCell.c === col) {
      state.selectedCell = null;
      updateSelectionPanel();
    }
  } else if (activeTool === "bucket") {
    floodFill(row, col);
  } else if (activeTool === "select") {
    state.selectedCell = { r: row, c: col };
    state.inspectingPaletteId = null;
    updateSelectionPanel();
    openSidebar();
  }

  renderGrid();
  saveToLocalStorage();
  if (typeof checkTutorialProgress === "function") {
    checkTutorialProgress();
  }
}

// Visual bucket tool: flood fill grid cells
function floodFill(startR, startC) {
  const targetBlock = state.grid[startR][startC];
  const targetId = targetBlock ? targetBlock.id : null;
  const fillBlock = getBlockById(state.activeBlockId);

  // Avoid infinite loops
  if (targetId === fillBlock.id) return;

  const queue = [[startR, startC]];
  const visited = new Set();

  while (queue.length > 0) {
    const [r, c] = queue.shift();
    const key = `${r},${c}`;

    if (visited.has(key)) continue;
    visited.add(key);

    const currentBlock = state.grid[r][c];
    const currentId = currentBlock ? currentBlock.id : null;

    if (currentId === targetId) {
      state.grid[r][c] = JSON.parse(JSON.stringify(fillBlock));

      // Check neighbors
      const neighbors = [
        [r - 1, c],
        [r + 1, c],
        [r, c - 1],
        [r, c + 1]
      ];

      for (const [nr, nc] of neighbors) {
        if (nr >= 0 && nr < state.rows && nc >= 0 && nc < state.cols) {
          queue.push([nr, nc]);
        }
      }
    }
  }
}

// Run init on window load
window.addEventListener("DOMContentLoaded", initEditor);
