/**
 * js/engine.js
 * Synthesizes retro sound effects using Web Audio API and runs the real-time collision, Platformer gravity, and Top-Down movement simulation loops.
 */

// Sound Synthesizer System using pure Web Audio API oscillator nodes
const retroAudio = {
  ctx: null,

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
  },

  play(type) {
    this.init();
    if (!this.ctx) return;

    // Resume AudioContext if suspended by browsers
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    if (type === "jump") {
      // Fast sweeping pitch upward
      osc.type = "triangle";
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.15);
      gainNode.gain.setValueAtTime(0.15, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (type === "coin") {
      // Double ding sound (high pitch)
      osc.type = "sine";
      osc.frequency.setValueAtTime(987.77, now); // B5
      osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6
      gainNode.gain.setValueAtTime(0.1, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === "hit") {
      // Lower sweeping explosive noise
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.linearRampToValueAtTime(60, now + 0.2);
      gainNode.gain.setValueAtTime(0.2, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
      osc.start(now);
      osc.stop(now + 0.22);
    } else if (type === "win") {
      // Play a quick retro major arpeggio
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      osc.type = "square";
      gainNode.gain.setValueAtTime(0.08, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.55);

      notes.forEach((freq, idx) => {
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);
      });

      osc.start(now);
      osc.stop(now + 0.55);
    }
  }
};

// Bind simple testing elements from the footer
document.getElementById("btn-sound-jump").addEventListener("click", () => retroAudio.play("jump"));
document.getElementById("btn-sound-coin").addEventListener("click", () => retroAudio.play("coin"));
document.getElementById("btn-sound-hit").addEventListener("click", () => retroAudio.play("hit"));
document.getElementById("btn-sound-win").addEventListener("click", () => retroAudio.play("win"));


// GAME CONTROLLER / ENGINE ENGINE SIMULATOR
const game = {
  running: false,
  animationId: null,

  // Live game statistics
  health: 100,
  score: 0,
  coinsCollected: 0,
  keys: 0,
  startingLives: 3,
  lives: 3,

  // Player state coordinates
  player: {
    x: 100,
    y: 100,
    w: 24,
    h: 24,
    vx: 0,
    vy: 0,
    grounded: false,
    facing: "right",
    emoji: "🧙"
  },

  // List of active level enemy entities moving on ticks
  enemies: [],

  // Tracking pressed keys
  keysPressed: {},

  start() {
    if (this.running) return;
    this.running = true;

    // Reset scores & lives HUD counters
    this.score = 0;
    this.coinsCollected = 0;
    this.keys = 0;
    this.health = 100;

    const livesSelected = document.getElementById("select-lives").value;
    this.startingLives = livesSelected === "Infinite" ? 9999 : Number(livesSelected);
    this.lives = this.startingLives;

    // Build the play simulation level environment
    this.spawnEntities();

    // Show GUI overlay
    const hud = document.getElementById("game-hud");
    hud.style.opacity = "1";
    hud.style.transform = "translateY(0)";

    // Show mobile controls if enabled
    if (typeof updateMobileControlsVisibility === "function") {
      updateMobileControlsVisibility();
    }

    // Bind Controls
    window.addEventListener("keydown", this.handleKeyDownBound);
    window.addEventListener("keyup", this.handleKeyUpBound);

    // Hide banners if any
    document.getElementById("game-win-banner").classList.add("hidden");
    document.getElementById("game-over-banner").classList.add("hidden");

    // Start engine render animation ticks loop
    this.lastTime = performance.now();
    this.loop();
  },

  stop() {
    this.running = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }

    // Hide HUD
    const hud = document.getElementById("game-hud");
    if (hud) {
      hud.style.opacity = "0";
      hud.style.transform = "translateY(8px)";
    }

    // Hide mobile controls
    if (typeof updateMobileControlsVisibility === "function") {
      updateMobileControlsVisibility();
    }

    // Unbind inputs
    window.removeEventListener("keydown", this.handleKeyDownBound);
    window.removeEventListener("keyup", this.handleKeyUpBound);

    // Re-render original static layout design
    renderGrid();
  },

  spawnEntities() {
    this.enemies = [];
    let foundSpawn = false;

    // Parse state grid blocks
    for (let r = 0; r < state.rows; r++) {
      for (let c = 0; c < state.cols; c++) {
        const tile = state.grid[r][c];
        if (tile) {
          if (tile.id === "player_spawn") {
            this.player.x = c * TILE_SIZE + (TILE_SIZE - this.player.w) / 2;
            this.player.y = r * TILE_SIZE + (TILE_SIZE - this.player.h) / 2;
            this.player.vx = 0;
            this.player.vy = 0;
            this.player.emoji = tile.emoji || "🧙";
            foundSpawn = true;
          } else if (tile.id === "patrol_enemy" || tile.category === "actor" && tile.id !== "player_spawn") {
            // Instantiate active moving game block enemy
            this.enemies.push({
              id: tile.id,
              originR: r,
              originC: c,
              x: c * TILE_SIZE + (TILE_SIZE - 24) / 2,
              y: r * TILE_SIZE + (TILE_SIZE - 24) / 2,
              w: 24,
              h: 24,
              vx: 1.5, // moving velocity
              vy: 0,
              dir: 1,
              emoji: tile.emoji || "👾",
              color: tile.color || "#d97706",
              damage: tile.damage !== undefined ? tile.damage : 10,
              scripts: tile.scripts || []
            });
          }
        }
      }
    }

    // Default player spawn coordinates if not explicitly placed in the builder grid
    if (!foundSpawn) {
      this.player.x = TILE_SIZE;
      this.player.y = TILE_SIZE;
      this.player.vx = 0;
      this.player.vy = 0;
      this.player.emoji = "🧙";
    }

    this.updateHUD();
  },

  updateHUD() {
    document.getElementById("hud-health").textContent = `${Math.max(0, Math.round(this.health))}%`;
    document.getElementById("hud-coins").textContent = this.score;
    document.getElementById("hud-keys").textContent = this.keys;
  },

  handleKeyDown(e) {
    game.keysPressed[e.key] = true;

    // Stop default spacebar scrolling
    if (["Spacebar", " ", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].indexOf(e.key) > -1) {
      e.preventDefault();
    }
  },

  handleKeyUp(e) {
    game.keysPressed[e.key] = false;
  },

  loop() {
    if (!game.running) return;

    game.update();
    game.draw();

    game.animationId = requestAnimationFrame(game.loop);
  },

  update() {
    // 1. Compute velocities based on pressed inputs & mode rules
    const moveSpeed = state.speed;

    if (state.genre === "platformer") {
      // Platformer Controls
      if (this.keysPressed["ArrowLeft"] || this.keysPressed["a"] || this.keysPressed["A"]) {
        this.player.vx = -moveSpeed;
        this.player.facing = "left";
      } else if (this.keysPressed["ArrowRight"] || this.keysPressed["d"] || this.keysPressed["D"]) {
        this.player.vx = moveSpeed;
        this.player.facing = "right";
      } else {
        this.player.vx *= 0.8; // decelerate slide friction
      }

      // Jump (Space or Arrow Up or W)
      if ((this.keysPressed["ArrowUp"] || this.keysPressed["w"] || this.keysPressed["W"] || this.keysPressed[" "]) && this.player.grounded) {
        this.player.vy = -9.5; // Jump vertical velocity force
        this.player.grounded = false;
        retroAudio.play("jump");
      }

      // Apply Gravity
      this.player.vy += state.gravity;
    } else {
      // Top-down Controls (8-directional free movement)
      this.player.vx = 0;
      this.player.vy = 0;

      if (this.keysPressed["ArrowLeft"] || this.keysPressed["a"] || this.keysPressed["A"]) {
        this.player.vx = -moveSpeed;
        this.player.facing = "left";
      }
      if (this.keysPressed["ArrowRight"] || this.keysPressed["d"] || this.keysPressed["D"]) {
        this.player.vx = moveSpeed;
        this.player.facing = "right";
      }
      if (this.keysPressed["ArrowUp"] || this.keysPressed["w"] || this.keysPressed["W"]) {
        this.player.vy = -moveSpeed;
      }
      if (this.keysPressed["ArrowDown"] || this.keysPressed["s"] || this.keysPressed["S"]) {
        this.player.vy = moveSpeed;
      }
    }

    // 2. Compute Player physics & cell wall collisions
    this.moveAndCollidePlayer();

    // 3. Move Patrol Enemies
    this.updateEnemies();

    // 4. Handle custom ticks events
    this.handleTickEvents();
  },

  moveAndCollidePlayer() {
    // We separate the axes updates for robust collision sliding
    const originalX = this.player.x;
    const originalY = this.player.y;

    // Update X
    this.player.x += this.player.vx;
    this.resolveCollisions("x");

    // Update Y
    this.player.y += this.player.vy;
    this.resolveCollisions("y");

    // Fall below bounds check
    if (this.player.y > state.rows * TILE_SIZE + 100) {
      this.damagePlayer(100, "Fell out of bounds!");
    }
  },

  resolveCollisions(axis) {
    const p = this.player;

    // Dynamic grid check limits
    const minCol = Math.max(0, Math.floor(p.x / TILE_SIZE));
    const maxCol = Math.min(state.cols - 1, Math.floor((p.x + p.w) / TILE_SIZE));
    const minRow = Math.max(0, Math.floor(p.y / TILE_SIZE));
    const maxRow = Math.min(state.rows - 1, Math.floor((p.y + p.h) / TILE_SIZE));

    for (let r = minRow; r <= maxRow; r++) {
      for (let c = minCol; c <= maxCol; c++) {
        const tile = state.grid[r][c];
        if (!tile) continue;

        // Perform overlapping bounding boxes check
        if (p.x < c * TILE_SIZE + TILE_SIZE &&
            p.x + p.w > c * TILE_SIZE &&
            p.y < r * TILE_SIZE + TILE_SIZE &&
            p.y + p.h > r * TILE_SIZE) {

          // Fire "collide" events of the touched tile instantly
          this.executeTileScripts(tile, r, c);

          // If tile is solid, resolve physical overlap bounds
          if (tile.solid) {
            if (axis === "x") {
              if (p.vx > 0) {
                p.x = c * TILE_SIZE - p.w;
              } else if (p.vx < 0) {
                p.x = c * TILE_SIZE + TILE_SIZE;
              }
              p.vx = 0;
            } else if (axis === "y") {
              if (p.vy > 0) {
                p.y = r * TILE_SIZE - p.h;
                p.grounded = true;
              } else if (p.vy < 0) {
                p.y = r * TILE_SIZE + TILE_SIZE;
              }
              p.vy = 0;
            }
          }
        }
      }
    }
  },

  updateEnemies() {
    this.enemies.forEach(enemy => {
      if (enemy.id === "ai_agent") {
        // SMART PATHFINDING/CHASE BEHAVIOR FOR THE AI AGENT BOT
        const targetX = this.player.x;
        const targetY = this.player.y;
        const speed = 1.2;

        if (state.genre === "platformer") {
          // Platformer Chase: Horizontal Chasing + Gravity/Jumping

          // Chasing logic
          if (enemy.x < targetX - 4) {
            enemy.vx = speed;
          } else if (enemy.x > targetX + 4) {
            enemy.vx = -speed;
          } else {
            enemy.vx = 0;
          }

          // Apply gravity to AI Agent
          if (!enemy.vy) enemy.vy = 0;
          enemy.vy += state.gravity;

          // Horizontal movement and cell wall collision
          enemy.x += enemy.vx;

          let cCheck = Math.floor((enemy.x + (enemy.vx > 0 ? enemy.w : 0)) / TILE_SIZE);
          let rCheck = Math.floor((enemy.y + enemy.h - 4) / TILE_SIZE);
          let blockedAhead = false;

          if (cCheck >= 0 && cCheck < state.cols && rCheck >= 0 && rCheck < state.rows) {
            const nextTile = state.grid[rCheck][cCheck];
            if (nextTile && nextTile.solid) {
              blockedAhead = true;
              // Resolve overlap
              if (enemy.vx > 0) {
                enemy.x = cCheck * TILE_SIZE - enemy.w;
              } else if (enemy.vx < 0) {
                enemy.x = cCheck * TILE_SIZE + TILE_SIZE;
              }
              enemy.vx = 0;
            }
          }

          // Vertical movement and floor collision
          enemy.y += enemy.vy;
          let rCheckBottom = Math.floor((enemy.y + enemy.h) / TILE_SIZE);
          let cCheckBottomLeft = Math.floor(enemy.x / TILE_SIZE);
          let cCheckBottomRight = Math.floor((enemy.x + enemy.w) / TILE_SIZE);
          let enemyGrounded = false;

          for (let col of [cCheckBottomLeft, cCheckBottomRight]) {
            if (col >= 0 && col < state.cols && rCheckBottom >= 0 && rCheckBottom < state.rows) {
              const tile = state.grid[rCheckBottom][col];
              if (tile && tile.solid) {
                enemy.y = rCheckBottom * TILE_SIZE - enemy.h;
                enemy.vy = 0;
                enemyGrounded = true;
              }
            }
          }

          // AI Smart Jump: If blocked ahead by a solid block, or if player is above and AI is grounded, trigger jump!
          if (enemyGrounded && (blockedAhead || (targetY < enemy.y - TILE_SIZE && Math.random() < 0.1))) {
            enemy.vy = -8.0; // Jump strength
            enemyGrounded = false;
          }

        } else {
          // Top-down mode: Smooth 2D Vector Chasing
          const dx = targetX - enemy.x;
          const dy = targetY - enemy.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist > 4) {
            enemy.vx = (dx / dist) * speed;
            enemy.vy = (dy / dist) * speed;
          } else {
            enemy.vx = 0;
            enemy.vy = 0;
          }

          // Move along X axis and resolve solid tile block collisions
          enemy.x += enemy.vx;
          let minCol = Math.max(0, Math.floor(enemy.x / TILE_SIZE));
          let maxCol = Math.min(state.cols - 1, Math.floor((enemy.x + enemy.w) / TILE_SIZE));
          let minRow = Math.max(0, Math.floor(enemy.y / TILE_SIZE));
          let maxRow = Math.min(state.rows - 1, Math.floor((enemy.y + enemy.h) / TILE_SIZE));

          for (let r = minRow; r <= maxRow; r++) {
            for (let c = minCol; c <= maxCol; c++) {
              const tile = state.grid[r][c];
              if (tile && tile.solid) {
                if (enemy.vx > 0) {
                  enemy.x = c * TILE_SIZE - enemy.w;
                } else if (enemy.vx < 0) {
                  enemy.x = c * TILE_SIZE + TILE_SIZE;
                }
                enemy.vx = 0;
              }
            }
          }

          // Move along Y axis and resolve solid tile block collisions
          enemy.y += enemy.vy;
          minCol = Math.max(0, Math.floor(enemy.x / TILE_SIZE));
          maxCol = Math.min(state.cols - 1, Math.floor((enemy.x + enemy.w) / TILE_SIZE));
          minRow = Math.max(0, Math.floor(enemy.y / TILE_SIZE));
          maxRow = Math.min(state.rows - 1, Math.floor((enemy.y + enemy.h) / TILE_SIZE));

          for (let r = minRow; r <= maxRow; r++) {
            for (let c = minCol; c <= maxCol; c++) {
              const tile = state.grid[r][c];
              if (tile && tile.solid) {
                if (enemy.vy > 0) {
                  enemy.y = r * TILE_SIZE - enemy.h;
                } else if (enemy.vy < 0) {
                  enemy.y = r * TILE_SIZE + TILE_SIZE;
                }
                enemy.vy = 0;
              }
            }
          }
        }
      } else {
        // Patrol back and forth horizontally for standard goblin enemy
        enemy.x += enemy.vx;

        // Obstacle walls turnaround detection
        const c = Math.floor((enemy.x + (enemy.vx > 0 ? enemy.w : 0)) / TILE_SIZE);
        const r = Math.floor(enemy.y / TILE_SIZE);

        if (c < 0 || c >= state.cols) {
          enemy.vx *= -1;
        } else {
          const nextTile = state.grid[r][c];
          if (nextTile && nextTile.solid) {
            enemy.vx *= -1;
          }
        }
      }

      // Overlap checks between enemy and player wizard
      if (this.player.x < enemy.x + enemy.w &&
          this.player.x + this.player.w > enemy.x &&
          this.player.y < enemy.y + enemy.h &&
          this.player.y + this.player.h > enemy.y) {

        // Custom visual scripted rows on the enemy
        if (enemy.scripts && enemy.scripts.length > 0) {
          enemy.scripts.forEach(script => {
            if (script.event === "collide") {
              this.runScriptAction(script.action, script.params, enemy.originR, enemy.originC);
            }
          });
        } else {
          // Fallback default enemy damage
          this.damagePlayer(enemy.damage || 10, "Touched an enemy!");
        }
      }
    });
  },

  handleTickEvents() {
    // Iterate over grid looking for tick triggers
    for (let r = 0; r < state.rows; r++) {
      for (let c = 0; c < state.cols; c++) {
        const tile = state.grid[r][c];
        if (tile && tile.scripts) {
          tile.scripts.forEach(script => {
            if (script.event === "tick") {
              this.runScriptAction(script.action, script.params, r, c);
            }
          });
        }
      }
    }
  },

  executeTileScripts(tile, r, c) {
    if (!tile.scripts) return;

    tile.scripts.forEach(script => {
      if (script.event === "collide") {
        this.runScriptAction(script.action, script.params, r, c);
      }
    });

    // Execute user custom JS sandbox scripts
    if (tile.js) {
      try {
        // Expose a helper API payload to the user written code
        const sandboxCtx = {
          player: this.player,
          tile: tile,
          game: {
            addCoins: (n) => {
              this.score += n;
              this.updateHUD();
            },
            harm: (n) => {
              this.damagePlayer(n, "Custom JS execution script!");
            },
            triggerWin: () => {
              this.triggerWin();
            }
          },
          sound: {
            play: (name) => retroAudio.play(name)
          }
        };

        // Standard sandboxed function run evaluation
        const userFunction = new Function("player", "tile", "game", "sound", tile.js);
        userFunction(sandboxCtx.player, sandboxCtx.tile, sandboxCtx.game, sandboxCtx.sound);
      } catch (e) {
        console.error("Custom Javascript execution runtime crash:", e);
        if (state && Array.isArray(state.runtimeErrors)) {
          // Check if same error already reported
          const alreadyExists = state.runtimeErrors.some(err => err.message === e.message && err.coordinate.r === r && err.coordinate.c === c);
          if (!alreadyExists) {
            state.runtimeErrors.push({
              message: e.message,
              coordinate: { r, c },
              tileName: tile.name,
              timestamp: Date.now()
            });
            if (typeof validateScriptsAndLevel === "function") {
              validateScriptsAndLevel();
            }
          }
        }
      }
    }
  },

  // Process Script Logic Node Actions
  runScriptAction(actionId, params, r, c) {
    switch (actionId) {
      case "harm_player":
        this.damagePlayer(params.amount !== undefined ? params.amount : 10, "Lethal hazard damage!");
        break;

      case "add_score":
        this.score += (params.amount !== undefined ? params.amount : 1);
        this.updateHUD();
        break;

      case "add_key":
        this.keys++;
        this.updateHUD();
        break;

      case "unlock_door":
        if (this.keys > 0) {
          this.keys--;
          state.grid[r][c] = null; // Open / remove locked door block instance
          this.updateHUD();
          retroAudio.play("win");
        }
        break;

      case "bounce_player":
        const strength = params.strength !== undefined ? params.strength : 12;
        this.player.vy = -strength;
        this.player.grounded = false;
        break;

      case "trigger_win":
        this.triggerWin();
        break;

      case "play_sound":
        retroAudio.play(params.type || "coin");
        break;

      case "destroy_tile":
        state.grid[r][c] = null;
        break;
    }
  },

  damagePlayer(amount, reason) {
    this.health -= amount;
    this.updateHUD();
    retroAudio.play("hit");

    if (this.health <= 0) {
      this.lives--;
      if (this.lives > 0) {
        // Respawn player
        this.health = 100;
        this.spawnEntities();
      } else {
        this.triggerFail(reason);
      }
    }
  },

  triggerWin() {
    this.running = false;
    retroAudio.play("win");
    document.getElementById("game-win-banner").classList.remove("hidden");
    if (typeof checkTutorialProgress === "function") {
      checkTutorialProgress();
    }
  },

  triggerFail(reason) {
    this.running = false;
    document.getElementById("game-over-reason").textContent = reason || "All lives depleted!";
    document.getElementById("game-over-banner").classList.remove("hidden");
  },

  draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Draw level static environment background tiles
    for (let r = 0; r < state.rows; r++) {
      for (let c = 0; c < state.cols; c++) {
        const tile = state.grid[r][c];
        const x = c * TILE_SIZE;
        const y = r * TILE_SIZE;

        if (tile) {
          // Render solid color block background
          ctx.fillStyle = tile.color || "#1e293b";
          ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

          // Draw item emojis
          ctx.fillStyle = "#ffffff";
          ctx.font = `${TILE_SIZE * 0.55}px Arial`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(tile.emoji || "", x + TILE_SIZE / 2, y + TILE_SIZE / 2);
        } else {
          ctx.fillStyle = (r + c) % 2 === 0 ? "#111827" : "#0f172a";
          ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        }
      }
    }

    // 2. Draw Moving Active Enemies
    this.enemies.forEach(enemy => {
      // Enemy Background circle glow
      ctx.fillStyle = enemy.color + "44"; // 25% opacity color
      ctx.beginPath();
      ctx.arc(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, enemy.w / 1.7, 0, Math.PI * 2);
      ctx.fill();

      // Draw emoji
      ctx.fillStyle = "#ffffff";
      ctx.font = `${enemy.w * 0.9}px Arial`;
      ctx.fillText(enemy.emoji, enemy.x + enemy.w / 2, enemy.y + enemy.h / 2);
    });

    // 3. Draw Player Wizard
    const p = this.player;
    ctx.fillStyle = "rgba(168, 85, 247, 0.35)"; // Purple shadow circle underneath player
    ctx.beginPath();
    ctx.arc(p.x + p.w / 2, p.y + p.h / 1.1, p.w / 2, 0, Math.PI * 2);
    ctx.fill();

    // Mirror rendering when facing left
    ctx.save();
    ctx.fillStyle = "#ffffff";
    ctx.font = `${p.w * 1.1}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(p.emoji, p.x + p.w / 2, p.y + p.h / 2);
    ctx.restore();
  }
};

// Bind Key handlers to global controller
game.handleKeyDownBound = game.handleKeyDown.bind(game);
game.handleKeyUpBound = game.handleKeyUp.bind(game);


// Setup Design-Play toggles buttons
const btnEditMode = document.getElementById("btn-edit-mode");
const btnPlayMode = document.getElementById("btn-play-mode");

btnEditMode.addEventListener("click", () => {
  if (!game.running) return;

  game.stop();

  // Active styles toggling
  btnEditMode.className = "px-3 py-1.5 rounded text-xs font-semibold flex items-center space-x-1.5 transition bg-purple-600 text-white shadow";
  btnPlayMode.className = "px-3 py-1.5 rounded text-xs font-semibold flex items-center space-x-1.5 transition text-gray-400 hover:text-white";

  if (typeof closeDrawers === "function") {
    closeDrawers();
  }
});

btnPlayMode.addEventListener("click", () => {
  if (game.running) return;

  // Active styles toggling
  btnPlayMode.className = "px-3 py-1.5 rounded text-xs font-semibold flex items-center space-x-1.5 transition bg-purple-600 text-white shadow";
  btnEditMode.className = "px-3 py-1.5 rounded text-xs font-semibold flex items-center space-x-1.5 transition text-gray-400 hover:text-white";

  game.start();
  if (typeof checkTutorialProgress === "function") {
    checkTutorialProgress();
  }

  if (typeof closeDrawers === "function") {
    closeDrawers();
  }
});

// Win-Fail action handlers
document.getElementById("btn-win-replay").addEventListener("click", () => {
  game.stop();
  game.start();
});
document.getElementById("btn-win-edit").addEventListener("click", () => {
  game.stop();
  btnEditMode.click();
});
document.getElementById("btn-fail-retry").addEventListener("click", () => {
  game.stop();
  game.start();
});
document.getElementById("btn-fail-edit").addEventListener("click", () => {
  game.stop();
  btnEditMode.click();
});
