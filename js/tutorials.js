/**
 * js/tutorials.js
 * Interactive Retro Game Maker Tutorial System & Real-Time Checklist Verification.
 */

const TUTORIALS = [
  {
    id: "drawing_basics",
    title: "1. Drawing Basics",
    desc: "Learn how to paint ground tiles, place the Player Spawn block, and switch to Play Mode to test.",
    steps: [
      {
        title: "Select Ground Block",
        check: () => {
          return state.activeBlockId === "ground";
        }
      },
      {
        title: "Paint 5 Ground Blocks",
        check: () => {
          let count = 0;
          for (let r = 0; r < state.rows; r++) {
            for (let c = 0; c < state.cols; c++) {
              if (state.grid[r][c] && state.grid[r][c].id === "ground") {
                count++;
              }
            }
          }
          return count >= 5;
        }
      },
      {
        title: "Place Player Spawn",
        check: () => {
          for (let r = 0; r < state.rows; r++) {
            for (let c = 0; c < state.cols; c++) {
              if (state.grid[r][c] && state.grid[r][c].id === "player_spawn") {
                return true;
              }
            }
          }
          return false;
        }
      },
      {
        title: "Enter Play Mode",
        check: () => {
          return game.running;
        }
      }
    ]
  },
  {
    id: "hazards_goals",
    title: "2. Hazards & Goals",
    desc: "Design a platformer gap with a lava hazard, place a goal portal, and trigger the level victory condition.",
    steps: [
      {
        title: "Paint a Lava Hazard (🔥)",
        check: () => {
          for (let r = 0; r < state.rows; r++) {
            for (let c = 0; c < state.cols; c++) {
              if (state.grid[r][c] && state.grid[r][c].id === "lava") {
                return true;
              }
            }
          }
          return false;
        }
      },
      {
        title: "Paint a Goal Portal (🌀)",
        check: () => {
          for (let r = 0; r < state.rows; r++) {
            for (let c = 0; c < state.cols; c++) {
              if (state.grid[r][c] && state.grid[r][c].id === "portal") {
                return true;
              }
            }
          }
          return false;
        }
      },
      {
        title: "Place a Player Spawn (🧙)",
        check: () => {
          for (let r = 0; r < state.rows; r++) {
            for (let c = 0; c < state.cols; c++) {
              if (state.grid[r][c] && state.grid[r][c].id === "player_spawn") {
                return true;
              }
            }
          }
          return false;
        }
      },
      {
        title: "Reach Goal Portal & Win!",
        check: () => {
          const winBanner = document.getElementById("game-win-banner");
          return winBanner && !winBanner.classList.contains("hidden");
        }
      }
    ]
  },
  {
    id: "keys_doors",
    title: "3. Keys & Locked Doors",
    desc: "Gate the portal behind a Locked Door. Hide a Golden Key and inspect blocks to customize visual scripting trigger rules.",
    steps: [
      {
        title: "Paint a Locked Door (🔒)",
        check: () => {
          for (let r = 0; r < state.rows; r++) {
            for (let c = 0; c < state.cols; c++) {
              if (state.grid[r][c] && state.grid[r][c].id === "locked_door") {
                return true;
              }
            }
          }
          return false;
        }
      },
      {
        title: "Paint a Golden Key (🔑)",
        check: () => {
          for (let r = 0; r < state.rows; r++) {
            for (let c = 0; c < state.cols; c++) {
              if (state.grid[r][c] && state.grid[r][c].id === "key") {
                return true;
              }
            }
          }
          return false;
        }
      },
      {
        title: "Inspect Locked Door properties",
        check: () => {
          const activeBlock = getInspectedBlock();
          return activeBlock && activeBlock.id === "locked_door";
        }
      },
      {
        title: "Win playmode using Golden Key!",
        check: () => {
          const winBanner = document.getElementById("game-win-banner");
          return winBanner && !winBanner.classList.contains("hidden");
        }
      }
    ]
  },
  {
    id: "maze_raider",
    title: "4. Top-Down Maze Raider",
    desc: "Build a maze, select the Top-Down genre, paint walls, and lead the Player to the exit portal.",
    steps: [
      {
        title: "Switch Genre to Top-Down",
        check: () => {
          return state.genre === "topdown";
        }
      },
      {
        title: "Paint 10 Brick Walls (🧱)",
        check: () => {
          let count = 0;
          for (let r = 0; r < state.rows; r++) {
            for (let c = 0; c < state.cols; c++) {
              if (state.grid[r][c] && state.grid[r][c].id === "brick") {
                count++;
              }
            }
          }
          return count >= 10;
        }
      },
      {
        title: "Place a Player Spawn (🧙)",
        check: () => {
          for (let r = 0; r < state.rows; r++) {
            for (let c = 0; c < state.cols; c++) {
              if (state.grid[r][c] && state.grid[r][c].id === "player_spawn") {
                return true;
              }
            }
          }
          return false;
        }
      },
      {
        title: "Win playmode!",
        check: () => {
          const winBanner = document.getElementById("game-win-banner");
          return winBanner && !winBanner.classList.contains("hidden");
        }
      }
    ]
  },
  {
    id: "bouncy_playground",
    title: "5. Bouncy Mushroom Playground",
    desc: "Setup high-jumping springboards. Bounce off bouncy pads to reach floating ruby gems and high goals.",
    steps: [
      {
        title: "Paint 2 Bouncy Pads (🍄)",
        check: () => {
          let count = 0;
          for (let r = 0; r < state.rows; r++) {
            for (let c = 0; c < state.cols; c++) {
              if (state.grid[r][c] && state.grid[r][c].id === "bouncy_pad") {
                count++;
              }
            }
          }
          return count >= 2;
        }
      },
      {
        title: "Paint a Ruby Gem (💎)",
        check: () => {
          for (let r = 0; r < state.rows; r++) {
            for (let c = 0; c < state.cols; c++) {
              if (state.grid[r][c] && state.grid[r][c].id === "gem") {
                return true;
              }
            }
          }
          return false;
        }
      },
      {
        title: "Inspect Bouncy Pad properties",
        check: () => {
          const activeBlock = getInspectedBlock();
          return activeBlock && activeBlock.id === "bouncy_pad";
        }
      },
      {
        title: "Reach Goal Portal & Win!",
        check: () => {
          const winBanner = document.getElementById("game-win-banner");
          return winBanner && !winBanner.classList.contains("hidden");
        }
      }
    ]
  }
];

let activeTutorialIdx = null;
let currentTutorialStepIdx = 0;

// Seeded Mulberry32 pseudo-random number generator
function createPRNG(seed) {
  return function() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Lists of vocabulary for constructing millions of unique game-making tutorial titles
const GEN_NOUNS = [
  "Odyssey", "Chamber", "Labyrinth", "Ruins", "Sanctuary", "Fortress", "Crypt",
  "Nexus", "Grid", "Ascent", "Descent", "Haven", "Domain", "Sector", "Void",
  "Outpost", "Cathedral", "Passage", "Basin", "Spires", "Gorge", "Peak", "Valleys"
];

const GEN_ADJECTIVES = [
  "Cosmic", "Lava", "Neon", "Cyber", "Shadow", "Crystal", "Radiant", "Infernal",
  "Abyssal", "Gilded", "Volcanic", "Frozen", "Prismatic", "Solar", "Lunar", "Runic",
  "Spectral", "Techno", "Astral", "Verdant", "Boreal", "Eolian", "Tectonic"
];

const GEN_VERBS = [
  "Raider", "Architect", "Designer", "Survivor", "Master", "Chronicles", "Trial",
  "Explorer", "Legacy", "Escape", "Quest", "Origins", "Crucible", "Showdown"
];

// Handles compiling dynamic procedural checklists and generating starting setups
function generateProceduralTutorial() {
  const seedInput = document.getElementById("gen-tutorial-seed");
  let seed = parseInt(seedInput ? seedInput.value : "12345") || 12345;

  const genreSelect = document.getElementById("gen-tutorial-genre");
  let genre = genreSelect ? genreSelect.value : "random";

  const difficultySelect = document.getElementById("gen-tutorial-difficulty");
  let difficulty = difficultySelect ? difficultySelect.value : "random";

  const mechanicSelect = document.getElementById("gen-tutorial-mechanic");
  let mechanic = mechanicSelect ? mechanicSelect.value : "random";

  const rand = createPRNG(seed);

  // Resolve random options
  if (genre === "random") {
    genre = rand() < 0.5 ? "platformer" : "topdown";
  }
  if (difficulty === "random") {
    const diffs = ["easy", "medium", "hard"];
    difficulty = diffs[Math.floor(rand() * diffs.length)];
  }
  if (mechanic === "random") {
    const mechs = ["hazards", "keys", "physics", "collectibles"];
    mechanic = mechs[Math.floor(rand() * mechs.length)];
  }

  // Synthesize a unique title
  const adj = GEN_ADJECTIVES[Math.floor(rand() * GEN_ADJECTIVES.length)];
  const noun = GEN_NOUNS[Math.floor(rand() * GEN_NOUNS.length)];
  const verb = GEN_VERBS[Math.floor(rand() * GEN_VERBS.length)];
  const uniqueTitle = `${adj} ${noun} ${verb}`;
  const displayTitle = `★ Procedural: ${uniqueTitle} (Seed #${seed})`;

  // Configure description based on difficulty and mechanic
  const desc = `Procedural challenge (${difficulty.toUpperCase()} difficulty) focused on ${mechanic.replace("_", " ")}. Master this customized layout, complete the dynamic check list, and win Play Mode!`;

  // Build Checklist Steps
  const steps = [];

  // Step 1: Tool & Block selection
  let focusBlockId = "ground";
  let targetPaintCount = 3;

  if (mechanic === "hazards") {
    focusBlockId = rand() < 0.5 ? "lava" : "spikes";
    targetPaintCount = difficulty === "easy" ? 2 : difficulty === "medium" ? 4 : 6;
  } else if (mechanic === "keys") {
    focusBlockId = rand() < 0.5 ? "key" : "locked_door";
    targetPaintCount = difficulty === "easy" ? 1 : 2;
  } else if (mechanic === "physics") {
    focusBlockId = "bouncy_pad";
    targetPaintCount = difficulty === "easy" ? 2 : difficulty === "medium" ? 3 : 4;
  } else if (mechanic === "collectibles") {
    focusBlockId = rand() < 0.5 ? "coin" : "gem";
    targetPaintCount = difficulty === "easy" ? 3 : difficulty === "medium" ? 6 : 9;
  }

  const focusBlock = DEFAULT_BLOCKS[focusBlockId] || DEFAULT_BLOCKS.ground;

  steps.push({
    title: `Select ${focusBlock.name} (${focusBlock.emoji})`,
    check: () => {
      return state.activeBlockId === focusBlockId;
    }
  });

  steps.push({
    title: `Paint at least ${targetPaintCount} ${focusBlock.name} blocks`,
    check: () => {
      let count = 0;
      for (let r = 0; r < state.rows; r++) {
        for (let c = 0; c < state.cols; c++) {
          if (state.grid[r][c] && state.grid[r][c].id === focusBlockId) {
            count++;
          }
        }
      }
      return count >= targetPaintCount;
    }
  });

  // Step 2: Inspection property rule check
  steps.push({
    title: `Inspect properties of ${focusBlock.name} block`,
    check: () => {
      const activeBlock = getInspectedBlock();
      return activeBlock && activeBlock.id === focusBlockId;
    }
  });

  // Step 3: Spawn placement check
  steps.push({
    title: "Place a Player Spawn block (🧙)",
    check: () => {
      for (let r = 0; r < state.rows; r++) {
        for (let c = 0; c < state.cols; c++) {
          if (state.grid[r][c] && state.grid[r][c].id === "player_spawn") {
            return true;
          }
        }
      }
      return false;
    }
  });

  // Step 4: Finish/Win state check
  steps.push({
    title: "Launch Play Mode & Win procedural challenge!",
    check: () => {
      const winBanner = document.getElementById("game-win-banner");
      return winBanner && !winBanner.classList.contains("hidden");
    }
  });

  // Compile full tutorial payload
  const proceduralTutorial = {
    id: `procedural_${seed}_${genre}_${difficulty}_${mechanic}`,
    title: displayTitle,
    desc: desc,
    steps: steps,
    // Add custom generators info for setup payload
    proceduralConfig: {
      genre,
      difficulty,
      mechanic,
      seed,
      rand
    }
  };

  // Inject or overwrite into standard TUTORIALS array (keeping the first 5 standard, and appending/replacing at index 5)
  TUTORIALS[5] = proceduralTutorial;

  // Execute selecting this generated tutorial
  selectTutorial(5);
}

function setupTutorialEventListeners() {
  const btnTutorials = document.getElementById("btn-tutorials");
  const modalTutorials = document.getElementById("modal-tutorials");
  const btnClose = document.getElementById("btn-tutorials-close");
  const btnCancel = document.getElementById("btn-tutorials-cancel");

  const btnCloseHelper = document.getElementById("btn-tutorial-close-helper");
  const btnPrev = document.getElementById("btn-tutorial-prev");
  const btnNext = document.getElementById("btn-tutorial-next");

  // Tab switching inside Tutorials Selection Modal
  const btnTabAcademy = document.getElementById("btn-tab-academy");
  const btnTabGenerator = document.getElementById("btn-tab-generator");
  const tabAcademyContent = document.getElementById("tutorials-academy-tab");
  const tabGeneratorContent = document.getElementById("tutorials-generator-tab");

  const btnRoll = document.getElementById("btn-gen-tutorial-roll");
  const btnConstruct = document.getElementById("btn-construct-tutorial");

  if (btnTabAcademy && btnTabGenerator && tabAcademyContent && tabGeneratorContent) {
    btnTabAcademy.addEventListener("click", () => {
      btnTabAcademy.className = "flex-1 py-1.5 text-center text-xs font-bold rounded-md transition-all bg-purple-600 text-white focus:outline-none";
      btnTabGenerator.className = "flex-1 py-1.5 text-center text-xs font-bold rounded-md transition-all text-gray-400 hover:text-white focus:outline-none";
      tabAcademyContent.classList.remove("hidden");
      tabGeneratorContent.classList.add("hidden");
    });

    btnTabGenerator.addEventListener("click", () => {
      btnTabGenerator.className = "flex-1 py-1.5 text-center text-xs font-bold rounded-md transition-all bg-purple-600 text-white focus:outline-none";
      btnTabAcademy.className = "flex-1 py-1.5 text-center text-xs font-bold rounded-md transition-all text-gray-400 hover:text-white focus:outline-none";
      tabGeneratorContent.classList.remove("hidden");
      tabAcademyContent.classList.add("hidden");
    });
  }

  if (btnRoll) {
    btnRoll.addEventListener("click", () => {
      const randSeed = Math.floor(Math.random() * 99999999) + 1;
      const input = document.getElementById("gen-tutorial-seed");
      if (input) input.value = randSeed;
      retroAudio.play("jump");
    });
  }

  if (btnConstruct) {
    btnConstruct.addEventListener("click", () => {
      generateProceduralTutorial();
    });
  }

  if (btnTutorials) {
    btnTutorials.addEventListener("click", () => {
      modalTutorials.classList.remove("opacity-0", "pointer-events-none");
    });
  }

  const closeModal = () => {
    modalTutorials.classList.add("opacity-0", "pointer-events-none");
  };

  if (btnClose) btnClose.addEventListener("click", closeModal);
  if (btnCancel) btnCancel.addEventListener("click", closeModal);

  if (btnCloseHelper) {
    btnCloseHelper.addEventListener("click", () => {
      hideTutorialHelper();
    });
  }

  if (btnPrev) {
    btnPrev.addEventListener("click", () => {
      if (currentTutorialStepIdx > 0) {
        currentTutorialStepIdx--;
        renderTutorialStep();
        retroAudio.play("jump");
      }
    });
  }

  if (btnNext) {
    btnNext.addEventListener("click", () => {
      const tutorial = TUTORIALS[activeTutorialIdx];
      if (currentTutorialStepIdx < tutorial.steps.length - 1) {
        currentTutorialStepIdx++;
        renderTutorialStep();
        retroAudio.play("coin");
      } else {
        // Finished last step!
        retroAudio.play("win");
        alert("Congratulations! You completed this interactive tutorial!");
        hideTutorialHelper();
      }
    });
  }
}

function selectTutorial(idx) {
  activeTutorialIdx = idx;
  currentTutorialStepIdx = 0;

  // Close selection modal
  const modalTutorials = document.getElementById("modal-tutorials");
  if (modalTutorials) modalTutorials.classList.add("opacity-0", "pointer-events-none");

  // Show Helper Panel
  const helper = document.getElementById("tutorial-helper");
  if (helper) {
    helper.classList.remove("opacity-0", "pointer-events-none");
    helper.classList.add("translate-y-0");
  }

  // Clear level and setup context depending on selected tutorial
  resetGridToEmpty();

  if (idx === 0) {
    // Drawing basics tutorial: start with empty grid and platformer genre
    state.genre = "platformer";
    state.gravity = 0.5;
    state.speed = 4.0;
  } else if (idx === 1) {
    // Hazards & Goals: pre-place a basic ledge
    state.genre = "platformer";
    const g = getBlockById;
    for (let c = 0; c < 10; c++) {
      state.grid[14][c] = g("ground");
    }
    for (let c = 18; c < 30; c++) {
      state.grid[14][c] = g("ground");
    }
  } else if (idx === 2) {
    // Keys & Doors: setup simple platformer grid
    state.genre = "platformer";
    const g = getBlockById;
    for (let c = 0; c < 30; c++) {
      state.grid[14][c] = g("ground");
    }
    state.grid[13][2] = g("player_spawn");
    state.grid[13][28] = g("portal");
  } else if (idx === 3) {
    // Top-Down Maze Raider: start with empty grid (or minor helper blocks) and topdown genre
    state.genre = "topdown";
    state.gravity = 0;
    state.speed = 4.0;
    const g = getBlockById;
    // pre-place basic outline / helper blocks
    for (let c = 0; c < 30; c++) {
      state.grid[0][c] = g("brick");
      state.grid[15][c] = g("brick");
    }
    state.grid[1][28] = g("portal");
  } else if (idx === 4) {
    // Bouncy Mushroom Playground: setup standard platformer grid with gems and high goals
    state.genre = "platformer";
    state.gravity = 0.5;
    state.speed = 4.0;
    const g = getBlockById;
    for (let c = 0; c < 30; c++) {
      state.grid[15][c] = g("ground");
    }
    state.grid[14][2] = g("player_spawn");
    state.grid[5][28] = g("portal");
    // Place some high-up floating platforms
    for (let c = 26; c < 30; c++) {
      state.grid[6][c] = g("stone");
    }
  } else if (idx === 5) {
    // PROCEDURAL GENERATED SETUP
    const config = TUTORIALS[5].proceduralConfig;
    const g = getBlockById;
    const rand = config.rand;

    state.genre = config.genre;
    if (state.genre === "platformer") {
      state.gravity = 0.5;
      state.speed = 4.0;
      // Pre-place simple bottom structure with gaps
      for (let c = 0; c < 30; c++) {
        if (c < 8 || c > 20 || rand() > 0.3) {
          state.grid[15][c] = g("ground");
        }
      }
      // Put a portal
      state.grid[14][28] = g("portal");
    } else {
      state.gravity = 0;
      state.speed = 4.0;
      // Top-Down: Pre-place basic outer bounds
      for (let c = 0; c < 30; c++) {
        state.grid[0][c] = g("brick");
        state.grid[15][c] = g("brick");
      }
      for (let r = 0; r < 16; r++) {
        state.grid[r][0] = g("brick");
        state.grid[r][29] = g("brick");
      }
      // Put a portal
      state.grid[1][28] = g("portal");
    }
  }

  syncFormControls();
  renderGrid();
  saveToLocalStorage();

  renderTutorialStep();
  retroAudio.play("win");
}

function hideTutorialHelper() {
  const helper = document.getElementById("tutorial-helper");
  if (helper) {
    helper.classList.add("opacity-0", "pointer-events-none");
    helper.classList.remove("translate-y-0");
  }
  activeTutorialIdx = null;
}

function renderTutorialStep() {
  if (activeTutorialIdx === null) return;

  const tutorial = TUTORIALS[activeTutorialIdx];
  const step = tutorial.steps[currentTutorialStepIdx];

  const titleEl = document.getElementById("tutorial-title");
  const descEl = document.getElementById("tutorial-desc");
  const stepsCountEl = document.getElementById("tutorial-steps-count");
  const btnPrev = document.getElementById("btn-tutorial-prev");
  const btnNext = document.getElementById("btn-tutorial-next");

  if (titleEl) titleEl.textContent = tutorial.title;
  if (descEl) descEl.textContent = tutorial.desc;
  if (stepsCountEl) stepsCountEl.textContent = `Step ${currentTutorialStepIdx + 1}/${tutorial.steps.length}`;

  if (btnPrev) {
    btnPrev.disabled = currentTutorialStepIdx === 0;
  }

  if (btnNext) {
    if (currentTutorialStepIdx === tutorial.steps.length - 1) {
      btnNext.innerHTML = `<span>Finish</span> <i class="fas fa-check text-[8px]"></i>`;
    } else {
      btnNext.innerHTML = `<span>Next</span> <i class="fas fa-arrow-right text-[8px]"></i>`;
    }
  }

  checkTutorialProgress();
}

function checkTutorialProgress() {
  if (activeTutorialIdx === null) return;

  const tutorial = TUTORIALS[activeTutorialIdx];
  const checklistContainer = document.getElementById("tutorial-checklist");
  if (!checklistContainer) return;

  checklistContainer.innerHTML = "";

  let allCompleted = true;

  tutorial.steps.forEach((step, idx) => {
    const isCompleted = step.check();
    const isCurrent = idx === currentTutorialStepIdx;

    // We only expect the current step's checklist to be active, or we show all steps' status.
    // Let's render all items, with highlighting on the current step!
    const row = document.createElement("div");
    row.className = `flex items-center space-x-2 text-xs transition duration-150 ${isCurrent ? "text-purple-300 font-bold bg-purple-950/20 p-1.5 rounded border border-purple-900/30" : "text-gray-400 p-1.5"}`;

    const iconClass = isCompleted ? "fas fa-check-circle text-emerald-500 text-sm" : "far fa-circle text-gray-600 text-sm";
    row.innerHTML = `
      <i class="${iconClass}"></i>
      <span class="truncate">${step.title}</span>
    `;

    checklistContainer.appendChild(row);

    if (isCurrent && !isCompleted) {
      allCompleted = false;
    }
  });

  const btnNext = document.getElementById("btn-tutorial-next");
  if (btnNext) {
    btnNext.disabled = !allCompleted;
    if (allCompleted) {
      btnNext.classList.add("animate-pulse", "bg-emerald-600");
      btnNext.classList.remove("bg-purple-600");
    } else {
      btnNext.classList.remove("animate-pulse", "bg-emerald-600");
      btnNext.classList.add("bg-purple-600");
    }
  }
}

// Attach setup to window load
window.addEventListener("DOMContentLoaded", () => {
  setupTutorialEventListeners();
});

// Expose globally
window.selectTutorial = selectTutorial;
window.checkTutorialProgress = checkTutorialProgress;
