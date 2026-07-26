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

function setupTutorialEventListeners() {
  const btnTutorials = document.getElementById("btn-tutorials");
  const modalTutorials = document.getElementById("modal-tutorials");
  const btnClose = document.getElementById("btn-tutorials-close");
  const btnCancel = document.getElementById("btn-tutorials-cancel");

  const btnCloseHelper = document.getElementById("btn-tutorial-close-helper");
  const btnPrev = document.getElementById("btn-tutorial-prev");
  const btnNext = document.getElementById("btn-tutorial-next");

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
