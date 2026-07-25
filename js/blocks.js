/**
 * js/blocks.js
 * Contains core tile types and custom script action blocks configuration.
 */

// Core predefined block types
const DEFAULT_BLOCKS = {
  // SOLIDS
  ground: {
    id: "ground",
    name: "Ground Block",
    category: "solid",
    color: "#4f46e5", // Indigo
    emoji: "🧱",
    solid: true,
    damage: 0,
    score: 0,
    scripts: []
  },
  brick: {
    id: "brick",
    name: "Brick Wall",
    category: "solid",
    color: "#b45309", // Amber/Brown
    emoji: "🧱",
    solid: true,
    damage: 0,
    score: 0,
    scripts: []
  },
  stone: {
    id: "stone",
    name: "Stone Block",
    category: "solid",
    color: "#6b7280", // Gray
    emoji: "🪨",
    solid: true,
    damage: 0,
    score: 0,
    scripts: []
  },

  // HAZARDS
  lava: {
    id: "lava",
    name: "Lava Hazard",
    category: "hazard",
    color: "#dc2626", // Red
    emoji: "🔥",
    solid: false,
    damage: 100, // instant kill by default
    score: 0,
    scripts: [
      { event: "collide", action: "harm_player", params: { amount: 100 } }
    ]
  },
  spikes: {
    id: "spikes",
    name: "Spikes Trap",
    category: "hazard",
    color: "#ef4444", // Lighter Red
    emoji: "⚠️",
    solid: false,
    damage: 25,
    score: 0,
    scripts: [
      { event: "collide", action: "harm_player", params: { amount: 25 } },
      { event: "collide", action: "play_sound", params: { type: "hit" } }
    ]
  },

  // COLLECTIBLES & INTERACTIVES
  coin: {
    id: "coin",
    name: "Gold Coin",
    category: "collectible",
    color: "#eab308", // Yellow
    emoji: "🪙",
    solid: false,
    damage: 0,
    score: 1,
    scripts: [
      { event: "collide", action: "add_score", params: { amount: 1 } },
      { event: "collide", action: "play_sound", params: { type: "coin" } },
      { event: "collide", action: "destroy_tile", params: {} }
    ]
  },
  gem: {
    id: "gem",
    name: "Ruby Gem",
    category: "collectible",
    color: "#ec4899", // Pink
    emoji: "💎",
    solid: false,
    damage: 0,
    score: 5,
    scripts: [
      { event: "collide", action: "add_score", params: { amount: 5 } },
      { event: "collide", action: "play_sound", params: { type: "coin" } },
      { event: "collide", action: "destroy_tile", params: {} }
    ]
  },
  key: {
    id: "key",
    name: "Golden Key",
    category: "collectible",
    color: "#3b82f6", // Blue
    emoji: "🔑",
    solid: false,
    damage: 0,
    score: 0,
    scripts: [
      { event: "collide", action: "add_key", params: {} },
      { event: "collide", action: "play_sound", params: { type: "coin" } },
      { event: "collide", action: "destroy_tile", params: {} }
    ]
  },
  locked_door: {
    id: "locked_door",
    name: "Locked Door",
    category: "collectible",
    color: "#059669", // Green
    emoji: "🔒",
    solid: true,
    damage: 0,
    score: 0,
    scripts: [
      { event: "collide", action: "unlock_door", params: {} }
    ]
  },
  portal: {
    id: "portal",
    name: "Goal Portal",
    category: "collectible",
    color: "#8b5cf6", // Purple
    emoji: "🌀",
    solid: false,
    damage: 0,
    score: 0,
    scripts: [
      { event: "collide", action: "trigger_win", params: {} }
    ]
  },

  // ACTORS & CHARACTERS
  player_spawn: {
    id: "player_spawn",
    name: "Player Spawn",
    category: "actor",
    color: "#10b981", // Emerald Green
    emoji: "🧙",
    solid: false,
    damage: 0,
    score: 0,
    scripts: []
  },
  patrol_enemy: {
    id: "patrol_enemy",
    name: "Goblin Enemy",
    category: "actor",
    color: "#d97706", // Orange/Amber
    emoji: "👾",
    solid: false,
    damage: 10,
    score: 0,
    scripts: [
      { event: "collide", action: "harm_player", params: { amount: 20 } },
      { event: "collide", action: "play_sound", params: { type: "hit" } }
    ]
  },
  bouncy_pad: {
    id: "bouncy_pad",
    name: "Bouncy Pad",
    category: "collectible",
    color: "#f43f5e", // Rose
    emoji: "🍄",
    solid: true,
    damage: 0,
    score: 0,
    scripts: [
      { event: "collide", action: "bounce_player", params: { strength: 12 } },
      { event: "collide", action: "play_sound", params: { type: "jump" } }
    ]
  }
};

// Available Events in the visual block scripting tab
const SCRIPT_EVENTS = [
  { id: "collide", name: "On Collision Touch" },
  { id: "tick", name: "Every Frame Tick" }
];

// Available Actions in the visual block scripting tab
const SCRIPT_ACTIONS = [
  { id: "harm_player", name: "Damage Player", params: [{ key: "amount", label: "Amount", type: "number", default: 10 }] },
  { id: "add_score", name: "Add Level Score", params: [{ key: "amount", label: "Points", type: "number", default: 1 }] },
  { id: "add_key", name: "Give Key", params: [] },
  { id: "unlock_door", name: "Unlock Door if Keyed", params: [] },
  { id: "bounce_player", name: "Super Bounce Player", params: [{ key: "strength", label: "Strength (1-20)", type: "number", default: 12 }] },
  { id: "trigger_win", name: "Complete / Win Level", params: [] },
  { id: "play_sound", name: "Play Retro SFX", params: [{ key: "type", label: "Sound", type: "select", options: ["jump", "coin", "hit", "win"] }] },
  { id: "destroy_tile", name: "Destroy / Remove Tile", params: [] }
];
