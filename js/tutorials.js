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
  },
  {
    id: "enemy_patrol_combat",
    title: "6. Enemy Patrol & Combat",
    desc: "Introduce hostile Goblins to your level. Dodge or lure patrol enemies away and reach the Goal Portal.",
    steps: [
      {
        title: "Paint 2 Goblin Enemies (👾)",
        check: () => {
          let count = 0;
          for (let r = 0; r < state.rows; r++) {
            for (let c = 0; c < state.cols; c++) {
              if (state.grid[r][c] && state.grid[r][c].id === "patrol_enemy") {
                count++;
              }
            }
          }
          return count >= 2;
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
        title: "Enter Play Mode & Win",
        check: () => {
          const winBanner = document.getElementById("game-win-banner");
          return winBanner && !winBanner.classList.contains("hidden");
        }
      }
    ]
  },
  {
    id: "interactive_speed_pads",
    title: "7. Interactive Speed Pads",
    desc: "Inspect bouncy pad properties and experiment with trampoline physics and sound effects.",
    steps: [
      {
        title: "Paint 3 Bouncy Pads (🍄)",
        check: () => {
          let count = 0;
          for (let r = 0; r < state.rows; r++) {
            for (let c = 0; c < state.cols; c++) {
              if (state.grid[r][c] && state.grid[r][c].id === "bouncy_pad") {
                count++;
              }
            }
          }
          return count >= 3;
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
        title: "Win playmode using high bounce pads!",
        check: () => {
          const winBanner = document.getElementById("game-win-banner");
          return winBanner && !winBanner.classList.contains("hidden");
        }
      }
    ]
  },
  {
    id: "treasure_hunt",
    title: "8. Treasure Hunt",
    desc: "Create an exploration challenge filled with scattered riches. Collect coins and high-value gems.",
    steps: [
      {
        title: "Paint 5 Gold Coins (🪙)",
        check: () => {
          let count = 0;
          for (let r = 0; r < state.rows; r++) {
            for (let c = 0; c < state.cols; c++) {
              if (state.grid[r][c] && state.grid[r][c].id === "coin") {
                count++;
              }
            }
          }
          return count >= 5;
        }
      },
      {
        title: "Paint 2 Ruby Gems (💎)",
        check: () => {
          let count = 0;
          for (let r = 0; r < state.rows; r++) {
            for (let c = 0; c < state.cols; c++) {
              if (state.grid[r][c] && state.grid[r][c].id === "gem") {
                count++;
              }
            }
          }
          return count >= 2;
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
        title: "Win Play Mode!",
        check: () => {
          const winBanner = document.getElementById("game-win-banner");
          return winBanner && !winBanner.classList.contains("hidden");
        }
      }
    ]
  },
  {
    id: "custom_block_designer",
    title: "9. Custom Block Designer",
    desc: "Construct entirely new game block concepts using the Custom Block Builder modal.",
    steps: [
      {
        title: "Create a Custom Block type",
        check: () => {
          return Object.keys(state.customBlocks).length >= 1;
        }
      },
      {
        title: "Select your Custom Block",
        check: () => {
          return state.customBlocks[state.activeBlockId] !== undefined;
        }
      },
      {
        title: "Paint at least 3 Custom Blocks",
        check: () => {
          let count = 0;
          const customKeys = Object.keys(state.customBlocks);
          for (let r = 0; r < state.rows; r++) {
            for (let c = 0; c < state.cols; c++) {
              if (state.grid[r][c] && customKeys.includes(state.grid[r][c].id)) {
                count++;
              }
            }
          }
          return count >= 3;
        }
      },
      {
        title: "Win Play Mode!",
        check: () => {
          const winBanner = document.getElementById("game-win-banner");
          return winBanner && !winBanner.classList.contains("hidden");
        }
      }
    ]
  },
  {
    id: "gravity_flipping",
    title: "10. Gravity & Speed Sandbox",
    desc: "Experiment with level-wide physics engine parameters. Change starting speed and gravity to customize movement.",
    steps: [
      {
        title: "Change Game Speed to 5 or higher",
        check: () => {
          return state.speed >= 5.0;
        }
      },
      {
        title: "Set Gravity to 0.7 or higher",
        check: () => {
          return state.gravity >= 0.7;
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
        title: "Win Play Mode!",
        check: () => {
          const winBanner = document.getElementById("game-win-banner");
          return winBanner && !winBanner.classList.contains("hidden");
        }
      }
    ]
  },
  {
    id: "ai_bot_integration",
    title: "11. AI Bot Integration",
    desc: "Introduce smart chasing AI bots. Test AI bot navigation as it actively tracks your position in top-down or platformer.",
    steps: [
      {
        title: "Select AI Agent Bot (🤖)",
        check: () => {
          return state.activeBlockId === "ai_agent";
        }
      },
      {
        title: "Paint an AI Agent Bot (🤖)",
        check: () => {
          for (let r = 0; r < state.rows; r++) {
            for (let c = 0; c < state.cols; c++) {
              if (state.grid[r][c] && state.grid[r][c].id === "ai_agent") {
                return true;
              }
            }
          }
          return false;
        }
      },
      {
        title: "Inspect properties of AI Agent Bot",
        check: () => {
          const activeBlock = getInspectedBlock();
          return activeBlock && activeBlock.id === "ai_agent";
        }
      },
      {
        title: "Win Play Mode!",
        check: () => {
          const winBanner = document.getElementById("game-win-banner");
          return winBanner && !winBanner.classList.contains("hidden");
        }
      }
    ]
  },
  {
    id: "sprite_styling",
    title: "12. Sprite Styling Studio",
    desc: "Customize default block emojis and palette colors. Reinvent the default Ground block style under the Sprites tab.",
    steps: [
      {
        title: "Open Sprites Tab",
        check: () => {
          const spritesContent = document.getElementById("content-sprites");
          return spritesContent && !spritesContent.classList.contains("hidden");
        }
      },
      {
        title: "Customize Ground Block Visuals",
        check: () => {
          const groundBlock = DEFAULT_BLOCKS["ground"];
          const originalGround = ORIGINAL_DEFAULT_BLOCKS["ground"];
          return groundBlock && originalGround && (groundBlock.emoji !== originalGround.emoji || groundBlock.color !== originalGround.color);
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
        title: "Win Play Mode!",
        check: () => {
          const winBanner = document.getElementById("game-win-banner");
          return winBanner && !winBanner.classList.contains("hidden");
        }
      }
    ]
  },
  {
    id: "ww1_game",
    title: "13. WW1 Trench Warfare",
    desc: "Navigate through enemy trenches, dodge spike traps and hostile soldier patrols, and reach the command post portal.",
    steps: [
      {
        title: "Switch Genre to Top-Down",
        check: () => {
          return state.genre === "topdown";
        }
      },
      {
        title: "Paint 8 Brick Wall Trenches (🧱)",
        check: () => {
          let count = 0;
          for (let r = 0; r < state.rows; r++) {
            for (let c = 0; c < state.cols; c++) {
              if (state.grid[r][c] && state.grid[r][c].id === "brick") {
                count++;
              }
            }
          }
          return count >= 8;
        }
      },
      {
        title: "Paint 2 Spike Traps (⚠️)",
        check: () => {
          let count = 0;
          for (let r = 0; r < state.rows; r++) {
            for (let c = 0; c < state.cols; c++) {
              if (state.grid[r][c] && state.grid[r][c].id === "spikes") {
                count++;
              }
            }
          }
          return count >= 2;
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
        title: "Reach Command Portal & Win!",
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

  // Find or append the procedural tutorial in the TUTORIALS array
  let procIdx = TUTORIALS.findIndex(t => t.id.startsWith("procedural_"));
  if (procIdx === -1) {
    procIdx = TUTORIALS.length;
  }
  TUTORIALS[procIdx] = proceduralTutorial;

  // Execute selecting this generated tutorial
  selectTutorial(procIdx);
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

  // Set standard grid size for tutorials to prevent out of bounds crash and misalignment
  state.cols = 30;
  state.rows = 16;
  adjustGridDimensions();

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
    // Enemy Patrol & Combat
    state.genre = "platformer";
    state.gravity = 0.5;
    state.speed = 4.0;
    const g = getBlockById;
    for (let c = 0; c < 30; c++) {
      state.grid[15][c] = g("ground");
    }
    state.grid[14][2] = g("player_spawn");
    state.grid[14][28] = g("portal");
    // Pre-place platform for enemies
    for (let c = 12; c < 18; c++) {
      state.grid[11][c] = g("brick");
    }
  } else if (idx === 6) {
    // Interactive Speed Pads
    state.genre = "platformer";
    state.gravity = 0.5;
    state.speed = 4.0;
    const g = getBlockById;
    for (let c = 0; c < 30; c++) {
      state.grid[15][c] = g("ground");
    }
    state.grid[14][2] = g("player_spawn");
    state.grid[10][28] = g("portal");
    // Higher ledge
    for (let c = 26; c < 30; c++) {
      state.grid[11][c] = g("stone");
    }
  } else if (idx === 7) {
    // Treasure Hunt
    state.genre = "topdown";
    state.gravity = 0;
    state.speed = 4.0;
    const g = getBlockById;
    for (let c = 0; c < 30; c++) {
      state.grid[0][c] = g("brick");
      state.grid[15][c] = g("brick");
    }
    state.grid[1][28] = g("portal");
  } else if (idx === 8) {
    // Custom Block Designer
    state.genre = "platformer";
    state.gravity = 0.5;
    state.speed = 4.0;
    const g = getBlockById;
    for (let c = 0; c < 30; c++) {
      state.grid[15][c] = g("ground");
    }
    state.grid[14][2] = g("player_spawn");
    state.grid[14][28] = g("portal");
  } else if (idx === 9) {
    // Gravity & Speed Sandbox
    state.genre = "platformer";
    state.gravity = 0.5;
    state.speed = 4.0;
    const g = getBlockById;
    for (let c = 0; c < 30; c++) {
      state.grid[15][c] = g("ground");
    }
    state.grid[14][28] = g("portal");
  } else if (idx === 10) {
    // AI Bot Integration
    state.genre = "platformer";
    state.gravity = 0.5;
    state.speed = 4.0;
    const g = getBlockById;
    for (let c = 0; c < 30; c++) {
      state.grid[15][c] = g("ground");
    }
    state.grid[14][2] = g("player_spawn");
    state.grid[14][28] = g("portal");
  } else if (idx === 11) {
    // Sprite Styling Studio
    state.genre = "platformer";
    state.gravity = 0.5;
    state.speed = 4.0;
    const g = getBlockById;
    state.grid[14][2] = g("player_spawn");
    state.grid[14][28] = g("portal");
  } else if (idx === 12) {
    // WW1 Trench Warfare
    state.genre = "topdown";
    state.gravity = 0;
    state.speed = 4.0;
    const g = getBlockById;
    // Outer border walls
    for (let c = 0; c < 30; c++) {
      state.grid[0][c] = g("brick");
      state.grid[15][c] = g("brick");
    }
    for (let r = 0; r < 16; r++) {
      state.grid[r][0] = g("brick");
      state.grid[r][29] = g("brick");
    }
    // Trench corridors
    for (let r = 2; r < 14; r += 3) {
      for (let c = 2; c < 28; c += 2) {
        state.grid[r][c] = g("brick");
      }
    }
    // Pre-place player spawn, key, locked door, goal portal, spikes & patrol enemy
    state.grid[1][2] = g("player_spawn");
    state.grid[14][15] = g("key");
    state.grid[1][27] = g("locked_door");
    state.grid[1][28] = g("portal");
    state.grid[5][10] = g("spikes");
    state.grid[8][18] = g("spikes");
    state.grid[4][20] = g("patrol_enemy");
  } else if (TUTORIALS[idx] && TUTORIALS[idx].proceduralConfig) {
    // PROCEDURAL GENERATED SETUP
    const config = TUTORIALS[idx].proceduralConfig;
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

  // Reset zoom, pan, and canvas size after setup is complete
  state.zoom = getFitZoom();
  state.panX = 0;
  state.panY = 0;
  resizeCanvas();

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

function getDifficultyBadge(idx) {
  const difficulties = [
    { label: "Intro", bg: "bg-purple-950", text: "text-purple-300" },          // 1. Drawing Basics
    { label: "Intermediate", bg: "bg-amber-950", text: "text-amber-300" },     // 2. Hazards & Goals
    { label: "Advanced", bg: "bg-emerald-950", text: "text-emerald-300" },     // 3. Keys & Locked Doors
    { label: "Creative", bg: "bg-purple-950", text: "text-purple-300" },       // 4. Top-Down Maze Raider
    { label: "Expert", bg: "bg-amber-950", text: "text-amber-300" },           // 5. Bouncy Mushroom Playground
    { label: "Intermediate", bg: "bg-amber-950", text: "text-amber-300" },     // 6. Enemy Patrol & Combat
    { label: "Intermediate", bg: "bg-amber-950", text: "text-amber-300" },     // 7. Interactive Speed Pads
    { label: "Advanced", bg: "bg-emerald-950", text: "text-emerald-300" },     // 8. Treasure Hunt
    { label: "Expert", bg: "bg-amber-950", text: "text-amber-300" },           // 9. Custom Block Designer
    { label: "Advanced", bg: "bg-emerald-950", text: "text-emerald-300" },     // 10. Gravity & Speed Sandbox
    { label: "Creative", bg: "bg-purple-950", text: "text-purple-300" },       // 11. AI Bot Integration
    { label: "Creative", bg: "bg-purple-950", text: "text-purple-300" },       // 12. Sprite Styling Studio
    { label: "Expert", bg: "bg-red-950", text: "text-red-300" }                // 13. WW1 Trench Warfare
  ];
  return difficulties[idx] || { label: "Creative", bg: "bg-purple-950", text: "text-purple-300" };
}

function getTutorialEmoji(idx) {
  const emojis = ["🎨", "🔥", "🔑", "🧱", "🍄", "👾", "🍄", "🪙", "🛠️", "🪐", "🤖", "🎨", "🪖"];
  return emojis[idx] || "📚";
}

function renderAcademyTutorials() {
  const container = document.getElementById("tutorials-academy-tab");
  if (!container) return;

  // We only render the standard tutorials in the Academy tab.
  // Standard tutorials are everything in TUTORIALS except any procedural tutorial that might have been dynamically appended/injected.
  const standards = TUTORIALS.filter(t => !t.id.startsWith("procedural_"));

  // Clear and add description
  container.innerHTML = `
    <p class="text-xs text-gray-400 leading-relaxed font-sans mb-1">
      Learn how to build, test, and program retro games step-by-step with real-time feedback and validation checklists!
    </p>
  `;

  standards.forEach((t, idx) => {
    const badge = getDifficultyBadge(idx);
    const emoji = getTutorialEmoji(idx);

    const card = document.createElement("div");
    card.className = "bg-gray-950 p-4 border border-gray-800 hover:border-purple-500/50 rounded-xl transition cursor-pointer flex items-start space-x-3.5";
    card.setAttribute("onclick", `selectTutorial(${idx})`);

    card.innerHTML = `
      <div class="bg-purple-950/50 p-2.5 rounded-lg border border-purple-900/50 flex items-center justify-center text-xl text-purple-400">
        ${emoji}
      </div>
      <div class="flex-1">
        <h4 class="font-bold text-sm text-white flex items-center justify-between">
          <span>${t.title}</span>
          <span class="text-[9px] font-mono font-bold ${badge.bg} ${badge.text} px-1.5 py-0.5 rounded uppercase">${badge.label}</span>
        </h4>
        <p class="text-[11px] text-gray-400 mt-1 leading-normal">${t.desc}</p>
      </div>
    `;

    container.appendChild(card);
  });
}

// Attach setup to window load
window.addEventListener("DOMContentLoaded", () => {
  setupTutorialEventListeners();
  renderAcademyTutorials();
});

// Expose globally
window.selectTutorial = selectTutorial;
window.checkTutorialProgress = checkTutorialProgress;
window.renderAcademyTutorials = renderAcademyTutorials;
