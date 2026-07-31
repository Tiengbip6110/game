const crypto = require('crypto');

// Configuration
const MAX_PLAYERS = 6;
const BLOCK_DROP_INTERVAL_MS = 200;
const RESPAWN_INVINCIBLE_MS = 3000;
const RESPAWN_COOLDOWN_MS = 5000;
const STEP_MS = 1000; // Simplified step MS logic from frontend

// State
const rooms = new Map();
const playerLastActions = new Map(); // For rate limiting: playerId -> lastActionTime Map

// Utility functions
function generateRoomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function generateId() {
  return crypto.randomUUID();
}

function checkRateLimit(playerId, actionType, limitMs) {
  if (!playerLastActions.has(playerId)) {
    playerLastActions.set(playerId, new Map());
  }
  const actions = playerLastActions.get(playerId);
  const now = Date.now();
  const lastAction = actions.get(actionType) || 0;

  if (now - lastAction < limitMs) {
    return false;
  }
  actions.set(actionType, now);
  return true;
}

// Room Management Functions
function createRoom(hostPlayerId, hostUsername) {
  if (!checkRateLimit(hostPlayerId, 'createRoom', 1500)) {
    throw new Error('Rate limit exceeded for creating room');
  }

  const roomCode = generateRoomCode();
  const sessionToken = generateId();

  const room = {
    roomCode,
    hostPlayerId,
    players: new Map(),
    status: 'waiting', // waiting, playing
    sharedSeed: null,
    checkpointPlan: [],
    countdownEndsAt: null,
    blockDropTimer: null
  };

  room.players.set(hostPlayerId, {
    id: hostPlayerId,
    username: hostUsername,
    sessionToken,
    stepIndex: 0,
    score: 0,
    state: 'waiting',
    isHost: true,
    invincibleUntil: 0,
    cooldownUntil: 0,
    lastStepTime: Date.now()
  });

  rooms.set(roomCode, room);

  return { roomCode, playerId: hostPlayerId, sessionToken, room: getRoomSnapshot(roomCode) };
}

function joinRoom(roomCode, playerId, username) {
  if (!checkRateLimit(playerId, 'joinRoom', 1000)) {
    throw new Error('Rate limit exceeded for joining room');
  }

  const room = rooms.get(roomCode);
  if (!room) throw new Error('Room not found');
  if (room.players.size >= MAX_PLAYERS) throw new Error('Room is full');
  if (room.status !== 'waiting') throw new Error('Game already started');

  // If player already exists in room, just return their existing token
  if (room.players.has(playerId)) {
      return { sessionToken: room.players.get(playerId).sessionToken, room: getRoomSnapshot(roomCode) };
  }

  const sessionToken = generateId();
  room.players.set(playerId, {
    id: playerId,
    username,
    sessionToken,
    stepIndex: 0,
    score: 0,
    state: 'waiting',
    isHost: false,
    invincibleUntil: 0,
    cooldownUntil: 0,
    lastStepTime: Date.now()
  });

  return { sessionToken, room: getRoomSnapshot(roomCode) };
}

function leaveRoom(roomCode, playerId) {
  const room = rooms.get(roomCode);
  if (!room) return;

  room.players.delete(playerId);

  if (room.players.size === 0) {
    if (room.blockDropTimer) clearInterval(room.blockDropTimer);
    rooms.delete(roomCode);
  } else if (room.hostPlayerId === playerId) {
    // Reassign host
    const nextHostId = room.players.keys().next().value;
    if (nextHostId) {
      room.hostPlayerId = nextHostId;
      room.players.get(nextHostId).isHost = true;
    }
  }
}

function startRoom(roomCode, playerId) {
  if (!checkRateLimit(playerId, 'startRoom', 1200)) {
    throw new Error('Rate limit exceeded for starting room');
  }

  const room = rooms.get(roomCode);
  if (!room) throw new Error('Room not found');
  if (room.hostPlayerId !== playerId) throw new Error('Only host can start the game');
  if (room.status !== 'waiting') throw new Error('Game already started');

  room.status = 'playing';
  room.sharedSeed = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);

  // Generate checkpoint plan (every 10 to 20 steps)
  room.checkpointPlan = [0];
  let nextCheckpoint = 0;
  for (let i = 0; i < 50; i++) { // Generate enough checkpoints
    nextCheckpoint += Math.floor(Math.random() * 11) + 10;
    room.checkpointPlan.push(nextCheckpoint);
  }

  // Update players
  for (const player of room.players.values()) {
    player.state = 'playing';
    player.stepIndex = 0;
    player.score = 0;
    player.lastStepTime = Date.now();
  }

  startBlockDropTimer(room);

  return getRoomSnapshot(roomCode);
}

function startBlockDropTimer(room) {
    if (room.blockDropTimer) clearInterval(room.blockDropTimer);

    room.blockDropTimer = setInterval(() => {
        if (room.status !== 'playing') return;

        let minStepIndex = Infinity;
        let lowestPlayer = null;
        const now = Date.now();

        for (const player of room.players.values()) {
            if (player.state === 'playing') {
                if (player.stepIndex < minStepIndex) {
                    minStepIndex = player.stepIndex;
                    lowestPlayer = player;
                }
            }
        }

        if (lowestPlayer && minStepIndex >= 10) {
           // Simulate block drop timing logic
           if (now - lowestPlayer.lastStepTime > STEP_MS) {
                const wsHandler = require('./wsHandler');
                wsHandler.broadcastToRoom(room.roomCode, {
                    type: 'block_drop',
                    stepIndex: minStepIndex
                });
           }
        }
    }, BLOCK_DROP_INTERVAL_MS);
}

function handleInput(roomCode, playerId, inputData) {
  if (!checkRateLimit(playerId, 'input', 125)) { // Max 2 steps per 250ms = 1 step / 125ms
     return false; // Ignore without error for rate limit
  }

  const room = rooms.get(roomCode);
  if (!room || room.status !== 'playing') return false;

  const player = room.players.get(playerId);
  if (!player) return false;

  if (inputData.stepIndex !== undefined && inputData.stepIndex > player.stepIndex) {
      player.stepIndex = inputData.stepIndex;
      player.lastStepTime = Date.now();
  }
  if (inputData.score !== undefined) player.score = inputData.score;
  if (inputData.state !== undefined) player.state = inputData.state;

  return true;
}

function respawnPlayer(roomCode, playerId) {
    const room = rooms.get(roomCode);
    if (!room || room.status !== 'playing') throw new Error('Room not playing');

    const player = room.players.get(playerId);
    if (!player) throw new Error('Player not found');

    // Find closest checkpoint <= current stepIndex
    let respawnStep = 0;
    for (let i = room.checkpointPlan.length - 1; i >= 0; i--) {
        if (room.checkpointPlan[i] <= player.stepIndex) {
            respawnStep = room.checkpointPlan[i];
            break;
        }
    }

    const now = Date.now();
    player.stepIndex = respawnStep;
    player.state = 'playing';
    player.invincibleUntil = now + RESPAWN_INVINCIBLE_MS;
    player.cooldownUntil = now + RESPAWN_COOLDOWN_MS;
    player.lastStepTime = now;

    return {
        stepIndex: player.stepIndex,
        invincibleUntil: player.invincibleUntil,
        cooldownUntil: player.cooldownUntil
    };
}

function getRoomSnapshot(roomCode) {
  const room = rooms.get(roomCode);
  if (!room) return null;

  const playersArr = Array.from(room.players.values()).map(p => ({
    id: p.id,
    username: p.username,
    stepIndex: p.stepIndex,
    score: p.score,
    state: p.state,
    isHost: p.isHost,
    invincibleUntil: p.invincibleUntil,
    cooldownUntil: p.cooldownUntil
  }));

  return {
    code: room.roomCode,
    status: room.status,
    players: playersArr,
    sharedSeed: room.sharedSeed,
    checkpointPlan: room.checkpointPlan,
    countdownEndsAt: room.countdownEndsAt,
    serverNow: Date.now()
  };
}

function getRoom(roomCode) {
    return rooms.get(roomCode);
}

module.exports = {
  createRoom,
  joinRoom,
  leaveRoom,
  startRoom,
  handleInput,
  respawnPlayer,
  getRoomSnapshot,
  getRoom
};
