/**
 * js/exporter.js
 * Combines index.html + js/blocks.js + js/engine.js + js/editor.js into a single standalone self-contained webpage.
 * This file runs instantly and contains the complete exported level payload ready for GitHub Pages.
 */

function generateStandaloneBundle() {
  const allBlocksDef = { ...DEFAULT_BLOCKS, ...state.customBlocks };
  const currentGridJSON = JSON.stringify(state.grid);
  const customBlocksJSON = JSON.stringify(state.customBlocks);

  // HTML shell boilerplate ready to self-execute instantly when loaded as a GitHub Pages web deployment
  const bundle = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Blocks Retro Playable Level</title>
  <!-- Tailwind CSS -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- FontAwesome Icons -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    .custom-canvas {
      image-rendering: pixelated;
    }
    @keyframes pulse-soft {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.6; }
    }
    .pulse-playing {
      animation: pulse-soft 2s infinite;
    }
  </style>
</head>
<body class="bg-gray-950 text-gray-100 min-h-screen flex flex-col items-center justify-center overflow-hidden font-sans">

  <!-- Connection Status Banner -->
  <div id="offline-banner" class="fixed top-4 left-1/2 -translate-x-1/2 z-50 hidden transition-all duration-300">
    <div id="offline-banner-content" class="bg-red-600 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-3 font-sans text-sm font-semibold border border-red-500 z-50">
      <div id="offline-banner-icon-bg" class="bg-red-700 p-1.5 rounded-lg flex items-center justify-center">
        <i id="offline-banner-icon" class="fas fa-wifi-slash text-lg"></i>
      </div>
      <div>
        <p id="offline-banner-title" class="font-bold">No Internet Connection</p>
        <p id="offline-banner-desc" class="text-[11px] text-red-100 font-normal">Please check your network settings. Some features may not work.</p>
      </div>
    </div>
  </div>

  <!-- Main Game Box Panel -->
  <div class="w-full max-w-4xl bg-gray-900 border border-purple-500/30 rounded-xl shadow-2xl p-4 md:p-6 space-y-4">
    <!-- Header info -->
    <div class="flex items-center justify-between border-b border-gray-800 pb-3">
      <div class="flex items-center space-x-3">
        <div class="bg-purple-600 text-white p-2 rounded-lg flex items-center justify-center shadow-lg shadow-purple-900/30">
          <i class="fas fa-gamepad text-lg"></i>
        </div>
        <div>
          <h1 class="font-bold text-lg tracking-wide bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">BLOCKS: PLAYABLE LEVEL</h1>
          <p class="text-[10px] text-gray-400 font-mono">Exported Standalone Bundle</p>
        </div>
      </div>

      <!-- Key Stats HUD -->
      <div id="game-hud" class="flex items-center space-x-4 bg-gray-950/70 p-1.5 px-3 border border-purple-500/20 rounded-lg text-xs font-mono">
        <div class="flex items-center space-x-1">
          <i class="fas fa-heart text-red-500"></i>
          <span id="hud-health" class="text-red-400 font-bold">100%</span>
        </div>
        <div class="h-3 w-[1px] bg-gray-800"></div>
        <div class="flex items-center space-x-1">
          <i class="fas fa-star text-yellow-400"></i>
          <span id="hud-coins" class="text-yellow-400 font-bold">0</span>
        </div>
        <div class="flex items-center space-x-1">
          <i class="fas fa-key text-blue-400"></i>
          <span id="hud-keys" class="text-blue-400 font-bold">0</span>
        </div>
      </div>
    </div>

    <!-- Active Canvas Container -->
    <div class="relative bg-gray-950 border border-purple-900/20 rounded-lg flex items-center justify-center overflow-hidden min-h-[400px]">
      <canvas id="game-canvas" class="custom-canvas bg-gray-900 shadow-xl transition-all duration-75"></canvas>

      <!-- Win Banner -->
      <div id="game-win-banner" class="absolute hidden inset-0 bg-black/85 flex flex-col items-center justify-center z-20 space-y-4">
        <h2 class="text-4xl font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-teal-400 drop-shadow-lg">VICTORY!</h2>
        <p class="text-sm text-gray-300">Level Cleared successfully!</p>
        <button id="btn-win-replay" class="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg text-xs transition">Play Again</button>
      </div>

      <!-- Game Over Banner -->
      <div id="game-over-banner" class="absolute hidden inset-0 bg-black/85 flex flex-col items-center justify-center z-20 space-y-4">
        <h2 class="text-4xl font-extrabold tracking-widest text-red-500 drop-shadow-lg">GAME OVER</h2>
        <p id="game-over-reason" class="text-xs text-gray-400 font-mono">All lives depleted!</p>
        <button id="btn-fail-retry" class="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-xs transition">Retry Level</button>
      </div>
    </div>

    <!-- Instruction Help details -->
    <div class="flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 bg-gray-950/40 p-3 rounded-lg border border-gray-800">
      <div class="flex items-center space-x-4">
        <span><b class="text-purple-400">Move:</b> A / D or Arrow Keys</span>
        <span><b class="text-purple-400">Jump / Up:</b> Space or W / Up Key</span>
      </div>
      <div class="mt-2 sm:mt-0 text-[10px] text-purple-400 font-mono">
        Built with <a href="https://github.com" target="_blank" class="underline">Blocks Game Maker</a> on GitHub Pages
      </div>
    </div>
  </div>

  <!-- BUNDLED JAVASCRIPT GAME RUNTIME PAYLOAD -->
  <script>
    const DEFAULT_BLOCKS = ${JSON.stringify(DEFAULT_BLOCKS)};
    const state = {
      cols: ${state.cols},
      rows: ${state.rows},
      customBlocks: ${customBlocksJSON},
      gravity: ${state.gravity},
      speed: ${state.speed},
      lives: ${state.lives},
      genre: "${state.genre}",
      grid: ${currentGridJSON}
    };

    const TILE_SIZE = 32;
    const canvas = document.getElementById("game-canvas");
    const ctx = canvas.getContext("2d");

    // Retro Audio oscillator synthesize
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
        if (this.ctx.state === "suspended") this.ctx.resume();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();
        osc.connect(gainNode);
        gainNode.connect(this.ctx.destination);

        if (type === "jump") {
          osc.type = "triangle";
          osc.frequency.setValueAtTime(150, now);
          osc.frequency.exponentialRampToValueAtTime(800, now + 0.15);
          gainNode.gain.setValueAtTime(0.15, now);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
          osc.start(now); osc.stop(now + 0.15);
        } else if (type === "coin") {
          osc.type = "sine";
          osc.frequency.setValueAtTime(987.77, now);
          osc.frequency.setValueAtTime(1318.51, now + 0.08);
          gainNode.gain.setValueAtTime(0.1, now);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
          osc.start(now); osc.stop(now + 0.35);
        } else if (type === "hit") {
          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(300, now);
          osc.frequency.linearRampToValueAtTime(60, now + 0.2);
          gainNode.gain.setValueAtTime(0.2, now);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
          osc.start(now); osc.stop(now + 0.22);
        } else if (type === "win") {
          const notes = [523.25, 659.25, 783.99, 1046.50];
          osc.type = "square";
          gainNode.gain.setValueAtTime(0.08, now);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.55);
          notes.forEach((freq, idx) => {
            osc.frequency.setValueAtTime(freq, now + idx * 0.1);
          });
          osc.start(now); osc.stop(now + 0.55);
        }
      }
    };

    // Game simulator loops
    const game = {
      running: false,
      animationId: null,
      health: 100,
      score: 0,
      keys: 0,
      lives: 3,

      player: {
        x: 100, y: 100, w: 24, h: 24, vx: 0, vy: 0, grounded: false, facing: "right", emoji: "🧙"
      },
      enemies: [],
      keysPressed: {},

      start() {
        this.running = true;
        this.score = 0;
        this.keys = 0;
        this.health = 100;
        this.lives = state.lives;

        canvas.width = state.cols * TILE_SIZE;
        canvas.height = state.rows * TILE_SIZE;

        this.spawnEntities();
        window.addEventListener("keydown", (e) => {
          this.keysPressed[e.key] = true;
          if (["Spacebar", " ", "ArrowUp", "ArrowDown"].indexOf(e.key) > -1) e.preventDefault();
        });
        window.addEventListener("keyup", (e) => {
          this.keysPressed[e.key] = false;
        });

        document.getElementById("game-win-banner").classList.add("hidden");
        document.getElementById("game-over-banner").classList.add("hidden");

        this.loop();
      },

      spawnEntities() {
        this.enemies = [];
        let foundSpawn = false;
        for (let r = 0; r < state.rows; r++) {
          for (let c = 0; c < state.cols; c++) {
            const tile = state.grid[r][c];
            if (tile) {
              if (tile.id === "player_spawn") {
                this.player.x = c * TILE_SIZE + (TILE_SIZE - this.player.w) / 2;
                this.player.y = r * TILE_SIZE + (TILE_SIZE - this.player.h) / 2;
                this.player.vx = 0; this.player.vy = 0;
                this.player.emoji = tile.emoji || "🧙";
                foundSpawn = true;
              } else if (tile.id === "patrol_enemy" || (tile.category === "actor" && tile.id !== "player_spawn")) {
                this.enemies.push({
                  id: tile.id, originR: r, originC: c,
                  x: c * TILE_SIZE + (TILE_SIZE - 24) / 2, y: r * TILE_SIZE + (TILE_SIZE - 24) / 2,
                  w: 24, h: 24, vx: 1.5, vy: 0, emoji: tile.emoji || "👾", color: tile.color || "#d97706",
                  damage: tile.damage !== undefined ? tile.damage : 10, scripts: tile.scripts || []
                });
              }
            }
          }
        }
        if (!foundSpawn) {
          this.player.x = TILE_SIZE; this.player.y = TILE_SIZE;
          this.player.vx = 0; this.player.vy = 0;
        }
        this.updateHUD();
      },

      updateHUD() {
        document.getElementById("hud-health").textContent = \`\${Math.max(0, Math.round(this.health))}%\`;
        document.getElementById("hud-coins").textContent = this.score;
        document.getElementById("hud-keys").textContent = this.keys;
      },

      loop() {
        if (!game.running) return;
        game.update();
        game.draw();
        game.animationId = requestAnimationFrame(game.loop);
      },

      update() {
        const moveSpeed = state.speed;
        if (state.genre === "platformer") {
          if (this.keysPressed["ArrowLeft"] || this.keysPressed["a"] || this.keysPressed["A"]) {
            this.player.vx = -moveSpeed;
          } else if (this.keysPressed["ArrowRight"] || this.keysPressed["d"] || this.keysPressed["D"]) {
            this.player.vx = moveSpeed;
          } else {
            this.player.vx *= 0.8;
          }

          if ((this.keysPressed["ArrowUp"] || this.keysPressed["w"] || this.keysPressed["W"] || this.keysPressed[" "]) && this.player.grounded) {
            this.player.vy = -9.5;
            this.player.grounded = false;
            retroAudio.play("jump");
          }
          this.player.vy += state.gravity;
        } else {
          this.player.vx = 0; this.player.vy = 0;
          if (this.keysPressed["ArrowLeft"] || this.keysPressed["a"] || this.keysPressed["A"]) this.player.vx = -moveSpeed;
          if (this.keysPressed["ArrowRight"] || this.keysPressed["d"] || this.keysPressed["D"]) this.player.vx = moveSpeed;
          if (this.keysPressed["ArrowUp"] || this.keysPressed["w"] || this.keysPressed["W"]) this.player.vy = -moveSpeed;
          if (this.keysPressed["ArrowDown"] || this.keysPressed["s"] || this.keysPressed["S"]) this.player.vy = moveSpeed;
        }

        this.player.x += this.player.vx;
        this.resolveCollisions("x");
        this.player.y += this.player.vy;
        this.resolveCollisions("y");

        if (this.player.y > state.rows * TILE_SIZE + 100) {
          this.damagePlayer(100, "Fell out of bounds!");
        }

        // Enemies patrol & chase AI Agent
        this.enemies.forEach(enemy => {
          if (enemy.id === "ai_agent") {
            const targetX = this.player.x;
            const targetY = this.player.y;
            const speed = 1.2;

            if (state.genre === "platformer") {
              if (enemy.x < targetX - 4) enemy.vx = speed;
              else if (enemy.x > targetX + 4) enemy.vx = -speed;
              else enemy.vx = 0;

              if (!enemy.vy) enemy.vy = 0;
              enemy.vy += state.gravity;
              enemy.x += enemy.vx;

              let cCheck = Math.floor((enemy.x + (enemy.vx > 0 ? enemy.w : 0)) / TILE_SIZE);
              let rCheck = Math.floor((enemy.y + enemy.h - 4) / TILE_SIZE);
              let blockedAhead = false;

              if (cCheck >= 0 && cCheck < state.cols && rCheck >= 0 && rCheck < state.rows) {
                const nextTile = state.grid[rCheck][cCheck];
                if (nextTile && nextTile.solid) {
                  blockedAhead = true;
                  if (enemy.vx > 0) enemy.x = cCheck * TILE_SIZE - enemy.w;
                  else if (enemy.vx < 0) enemy.x = cCheck * TILE_SIZE + TILE_SIZE;
                  enemy.vx = 0;
                }
              }

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

              if (enemyGrounded && (blockedAhead || (targetY < enemy.y - TILE_SIZE && Math.random() < 0.1))) {
                enemy.vy = -8.0;
                enemyGrounded = false;
              }
            } else {
              const dx = targetX - enemy.x;
              const dy = targetY - enemy.y;
              const dist = Math.sqrt(dx * dx + dy * dy);

              if (dist > 4) {
                enemy.vx = (dx / dist) * speed;
                enemy.vy = (dy / dist) * speed;
              } else {
                enemy.vx = 0; enemy.vy = 0;
              }

              enemy.x += enemy.vx;
              let minCol = Math.max(0, Math.floor(enemy.x / TILE_SIZE));
              let maxCol = Math.min(state.cols - 1, Math.floor((enemy.x + enemy.w) / TILE_SIZE));
              let minRow = Math.max(0, Math.floor(enemy.y / TILE_SIZE));
              let maxRow = Math.min(state.rows - 1, Math.floor((enemy.y + enemy.h) / TILE_SIZE));

              for (let r = minRow; r <= maxRow; r++) {
                for (let c = minCol; c <= maxCol; c++) {
                  const tile = state.grid[r][c];
                  if (tile && tile.solid) {
                    if (enemy.vx > 0) enemy.x = c * TILE_SIZE - enemy.w;
                    else if (enemy.vx < 0) enemy.x = c * TILE_SIZE + TILE_SIZE;
                    enemy.vx = 0;
                  }
                }
              }

              enemy.y += enemy.vy;
              minCol = Math.max(0, Math.floor(enemy.x / TILE_SIZE));
              maxCol = Math.min(state.cols - 1, Math.floor((enemy.x + enemy.w) / TILE_SIZE));
              minRow = Math.max(0, Math.floor(enemy.y / TILE_SIZE));
              maxRow = Math.min(state.rows - 1, Math.floor((enemy.y + enemy.h) / TILE_SIZE));

              for (let r = minRow; r <= maxRow; r++) {
                for (let c = minCol; c <= maxCol; c++) {
                  const tile = state.grid[r][c];
                  if (tile && tile.solid) {
                    if (enemy.vy > 0) enemy.y = r * TILE_SIZE - enemy.h;
                    else if (enemy.vy < 0) enemy.y = r * TILE_SIZE + TILE_SIZE;
                    enemy.vy = 0;
                  }
                }
              }
            }
          } else {
            enemy.x += enemy.vx;
            const c = Math.floor((enemy.x + (enemy.vx > 0 ? enemy.w : 0)) / TILE_SIZE);
            const r = Math.floor(enemy.y / TILE_SIZE);
            if (c < 0 || c >= state.cols) enemy.vx *= -1;
            else {
              const nextTile = state.grid[r][c];
              if (nextTile && nextTile.solid) enemy.vx *= -1;
            }
          }

          if (this.player.x < enemy.x + enemy.w && this.player.x + this.player.w > enemy.x &&
              this.player.y < enemy.y + enemy.h && this.player.y + this.player.h > enemy.y) {
            if (enemy.scripts && enemy.scripts.length > 0) {
              enemy.scripts.forEach(script => {
                if (script.event === "collide") this.runScriptAction(script.action, script.params, enemy.originR, enemy.originC);
              });
            } else {
              this.damagePlayer(enemy.damage || 10, "Touched an enemy!");
            }
          }
        });

        // Tick events
        for (let r = 0; r < state.rows; r++) {
          for (let c = 0; c < state.cols; c++) {
            const tile = state.grid[r][c];
            if (tile && tile.scripts) {
              tile.scripts.forEach(script => {
                if (script.event === "tick") this.runScriptAction(script.action, script.params, r, c);
              });
            }
          }
        }
      },

      resolveCollisions(axis) {
        const p = this.player;
        const minCol = Math.max(0, Math.floor(p.x / TILE_SIZE));
        const maxCol = Math.min(state.cols - 1, Math.floor((p.x + p.w) / TILE_SIZE));
        const minRow = Math.max(0, Math.floor(p.y / TILE_SIZE));
        const maxRow = Math.min(state.rows - 1, Math.floor((p.y + p.h) / TILE_SIZE));

        for (let r = minRow; r <= maxRow; r++) {
          for (let c = minCol; c <= maxCol; c++) {
            const tile = state.grid[r][c];
            if (!tile) continue;

            if (p.x < c * TILE_SIZE + TILE_SIZE && p.x + p.w > c * TILE_SIZE &&
                p.y < r * TILE_SIZE + TILE_SIZE && p.y + p.h > r * TILE_SIZE) {

              this.executeTileScripts(tile, r, c);

              if (tile.solid) {
                if (axis === "x") {
                  if (p.vx > 0) p.x = c * TILE_SIZE - p.w;
                  else if (p.vx < 0) p.x = c * TILE_SIZE + TILE_SIZE;
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

      executeTileScripts(tile, r, c) {
        if (!tile.scripts) return;
        tile.scripts.forEach(script => {
          if (script.event === "collide") this.runScriptAction(script.action, script.params, r, c);
        });

        if (tile.js) {
          try {
            const sandboxCtx = {
              player: this.player,
              tile: tile,
              game: {
                addCoins: (n) => { this.score += n; this.updateHUD(); },
                harm: (n) => { this.damagePlayer(n, "Custom JS execution script!"); },
                triggerWin: () => { this.triggerWin(); }
              },
              sound: { play: (name) => retroAudio.play(name) }
            };
            const userFunction = new Function("player", "tile", "game", "sound", tile.js);
            userFunction(sandboxCtx.player, sandboxCtx.tile, sandboxCtx.game, sandboxCtx.sound);
          } catch (e) {
            console.error("Custom Javascript execution runtime crash:", e);
            alert("Runtime Script Crash on Tile [" + tile.name + "] at (" + c + ", " + r + "):\\n" + e.message);
          }
        }
      },

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
              state.grid[r][c] = null;
              this.updateHUD();
              retroAudio.play("win");
            }
            break;
          case "bounce_player":
            this.player.vy = -(params.strength !== undefined ? params.strength : 12);
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
      },

      triggerFail(reason) {
        this.running = false;
        document.getElementById("game-over-reason").textContent = reason || "All lives depleted!";
        document.getElementById("game-over-banner").classList.remove("hidden");
      },

      draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let r = 0; r < state.rows; r++) {
          for (let c = 0; c < state.cols; c++) {
            const tile = state.grid[r][c];
            const x = c * TILE_SIZE; const y = r * TILE_SIZE;
            if (tile) {
              ctx.fillStyle = tile.color || "#1e293b";
              ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
              ctx.fillStyle = "#ffffff";
              ctx.font = \`\${TILE_SIZE * 0.55}px Arial\`;
              ctx.textAlign = "center"; ctx.textBaseline = "middle";
              ctx.fillText(tile.emoji || "", x + TILE_SIZE / 2, y + TILE_SIZE / 2);
            } else {
              ctx.fillStyle = (r + c) % 2 === 0 ? "#111827" : "#0f172a";
              ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
            }
          }
        }

        this.enemies.forEach(enemy => {
          ctx.fillStyle = enemy.color + "44";
          ctx.beginPath();
          ctx.arc(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, enemy.w / 1.7, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#ffffff";
          ctx.font = \`\${enemy.w * 0.9}px Arial\`;
          ctx.fillText(enemy.emoji, enemy.x + enemy.w / 2, enemy.y + enemy.h / 2);
        });

        const p = this.player;
        ctx.fillStyle = "rgba(168, 85, 247, 0.35)";
        ctx.beginPath();
        ctx.arc(p.x + p.w / 2, p.y + p.h / 1.1, p.w / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.font = \`\${p.w * 1.1}px Arial\`;
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(p.emoji, p.x + p.w / 2, p.y + p.h / 2);
      }
    };

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

    // Register online/offline status changes
    window.addEventListener("online", updateConnectionStatus);
    window.addEventListener("offline", updateConnectionStatus);

    // Auto starts on pageload
    window.addEventListener("DOMContentLoaded", () => {
      updateConnectionStatus();
      game.start();
      document.getElementById("btn-win-replay").addEventListener("click", () => { game.start(); });
      document.getElementById("btn-fail-retry").addEventListener("click", () => { game.start(); });
    });
  </script>
</body>
</html>`;

  // Create a Blob containing raw HTML data
  const blob = new Blob([bundle], { type: "text/html;charset=utf-8" });
  const blobUrl = URL.createObjectURL(blob);

  // Trigger self-contained document file downloads
  const dlAnchorElem = document.createElement('a');
  dlAnchorElem.setAttribute("href", blobUrl);
  dlAnchorElem.setAttribute("download", "index_published_game.html");
  dlAnchorElem.click();

  // Revoke Blob resources
  setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
}

// Bind publish bundle click actions
document.getElementById("btn-publish").addEventListener("click", generateStandaloneBundle);
document.getElementById("btn-publish-bottom").addEventListener("click", generateStandaloneBundle);
