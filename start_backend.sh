#!/bin/bash
set -e

echo "Setting up Cube Jump Backend Demo..."
mkdir -p cubejump-backend-demo
cd cubejump-backend-demo

echo "Creating package.json..."
cat << 'PKG' > package.json
{
  "name": "cubejump-backend",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": { "start": "node server.js" },
  "dependencies": { "cors": "^2.8.5", "express": "^4.18.2", "ws": "^8.16.0" }
}
PKG

echo "Creating server.js..."
cat << 'SRV' > server.js
const express = require('express');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
const roomManager = require('./roomManager');
const wsHandler = require('./wsHandler');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors());
app.use(express.json());

function validateSession(req, res, next) {
    if (req.method === 'GET' || req.path.endsWith('/join')) return next();
    const code = req.params.code;
    const { playerId } = req.body || req.query;
    const authHeader = req.headers.authorization;
    const sessionToken = authHeader ? authHeader.replace('Bearer ', '') : req.body?.sessionToken;
    const room = roomManager.getRoom(code);
    if (!room) return res.status(404).json({ error: 'Room not found' });
    const player = room.players.get(playerId);
    if (!player || player.sessionToken !== sessionToken) return res.status(401).json({ error: 'Unauthorized' });
    next();
}

app.post('/demo/rooms', (req, res) => res.json(roomManager.createRoom(require('crypto').randomUUID(), req.body.hostUsername || 'Host')));
app.post('/demo/rooms/:code/join', (req, res) => res.json(roomManager.joinRoom(req.params.code, req.body.playerId, req.body.username || 'Player')));
app.post('/demo/rooms/:code/start', validateSession, (req, res) => {
    const result = roomManager.startRoom(req.params.code, req.body.playerId);
    wsHandler.broadcastToRoom(req.params.code, { type: 'room_snapshot', data: result });
    res.json(result);
});
app.post('/demo/rooms/:code/leave', validateSession, (req, res) => {
    roomManager.leaveRoom(req.params.code, req.body.playerId);
    wsHandler.broadcastToRoom(req.params.code, { type: 'player_left', playerId: req.body.playerId });
    res.json({ success: true });
});
app.post('/demo/rooms/:code/respawn', validateSession, (req, res) => res.json(roomManager.respawnPlayer(req.params.code, req.body.playerId)));
app.post('/demo/rooms/:code/input', validateSession, (req, res) => res.json({ success: roomManager.handleInput(req.params.code, req.body.playerId, req.body) }));
app.get('/demo/rooms/:code', (req, res) => {
    const s = roomManager.getRoomSnapshot(req.params.code);
    s ? res.json(s) : res.status(404).json({ error: 'Not found' });
});

wsHandler.init(wss);
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`\n✅ Server is running on http://localhost:${PORT}`));
SRV

echo "Creating roomManager.js..."
cat << 'RM' > roomManager.js
const crypto = require('crypto');
const rooms = new Map(), playerLastActions = new Map();
function checkRateLimit(id, type, ms) {
    if (!playerLastActions.has(id)) playerLastActions.set(id, new Map());
    const m = playerLastActions.get(id), now = Date.now(), last = m.get(type) || 0;
    if (now - last < ms) return false;
    m.set(type, now); return true;
}
function generateRoomCode() { return Math.random().toString(36).substring(2, 8).toUpperCase(); }
module.exports = {
    createRoom: (hostId, name) => {
        const code = generateRoomCode(), token = crypto.randomUUID();
        const r = { roomCode: code, hostPlayerId: hostId, players: new Map(), status: 'waiting', sharedSeed: null, checkpointPlan: [], countdownEndsAt: null, timer: null };
        r.players.set(hostId, { id: hostId, username: name, sessionToken: token, stepIndex: 0, score: 0, state: 'waiting', isHost: true, lastStepTime: Date.now() });
        rooms.set(code, r); return { roomCode: code, playerId: hostId, sessionToken: token, room: module.exports.getRoomSnapshot(code) };
    },
    joinRoom: (code, pId, name) => {
        const r = rooms.get(code); if (!r) throw new Error('Not found');
        if (r.players.has(pId)) return { sessionToken: r.players.get(pId).sessionToken, room: module.exports.getRoomSnapshot(code) };
        const t = crypto.randomUUID(); r.players.set(pId, { id: pId, username: name, sessionToken: t, stepIndex: 0, score: 0, state: 'waiting', isHost: false, lastStepTime: Date.now() });
        return { sessionToken: t, room: module.exports.getRoomSnapshot(code) };
    },
    leaveRoom: (code, pId) => {
        const r = rooms.get(code); if (!r) return; r.players.delete(pId);
        if (r.players.size === 0) { clearInterval(r.timer); rooms.delete(code); }
    },
    startRoom: (code, pId) => {
        const r = rooms.get(code); if (!r || r.hostPlayerId !== pId) throw new Error('Invalid');
        r.status = 'playing'; r.sharedSeed = Math.floor(Math.random() * 1e9); r.checkpointPlan = [0, 15, 30, 45, 60, 75];
        for (let p of r.players.values()) { p.state = 'playing'; p.stepIndex = 0; p.score = 0; }
        clearInterval(r.timer); r.timer = setInterval(() => {
            if (r.status !== 'playing') return;
            let min = Infinity, lp = null, now = Date.now();
            for (let p of r.players.values()) if (p.state === 'playing' && p.stepIndex < min) { min = p.stepIndex; lp = p; }
            if (lp && min >= 10 && now - lp.lastStepTime > 1000) require('./wsHandler').broadcastToRoom(code, { type: 'block_drop', stepIndex: min });
        }, 200);
        return module.exports.getRoomSnapshot(code);
    },
    respawnPlayer: (code, pId) => {
        const r = rooms.get(code), p = r?.players.get(pId); if (!p) throw new Error('Error');
        let cp = 0; for (let i = r.checkpointPlan.length - 1; i >= 0; i--) if (r.checkpointPlan[i] <= p.stepIndex) { cp = r.checkpointPlan[i]; break; }
        p.stepIndex = cp; p.state = 'playing'; p.lastStepTime = Date.now();
        return { stepIndex: p.stepIndex };
    },
    handleInput: (code, pId, d) => {
        const r = rooms.get(code), p = r?.players.get(pId); if (!p || !checkRateLimit(pId, 'in', 125)) return false;
        if (d.stepIndex > p.stepIndex) { p.stepIndex = d.stepIndex; p.lastStepTime = Date.now(); }
        if (d.score !== undefined) p.score = d.score;
        if (d.state !== undefined) p.state = d.state; return true;
    },
    getRoomSnapshot: c => {
        const r = rooms.get(c); if (!r) return null;
        return { code: r.roomCode, status: r.status, players: Array.from(r.players.values()), sharedSeed: r.sharedSeed, checkpointPlan: r.checkpointPlan, serverNow: Date.now() };
    },
    getRoom: c => rooms.get(c)
};
RM

echo "Creating wsHandler.js..."
cat << 'WS' > wsHandler.js
const url = require('url'), roomManager = require('./roomManager'), clients = new Map();
module.exports = {
    init: wss => {
        wss.on('connection', (ws, req) => {
            const { query: { playerId, sessionToken }, pathname } = url.parse(req.url, true);
            const parts = pathname.split('/');
            const roomCode = parts[3];
            const room = roomManager.getRoom(roomCode);
            if (!room || !room.players.get(playerId) || room.players.get(playerId).sessionToken !== sessionToken) return ws.close();
            ws.isAlive = true; ws.playerId = playerId; ws.roomCode = roomCode;
            if (!clients.has(roomCode)) clients.set(roomCode, new Set());
            clients.get(roomCode).add(ws);
            ws.send(JSON.stringify({ type: 'room_snapshot', data: roomManager.getRoomSnapshot(roomCode) }));
            ws.on('message', m => {
                const d = JSON.parse(m);
                if (d.type === 'pong') return ws.isAlive = true;
                if (['gameplay_input', 'player_jump', 'player_death'].includes(d.type)) {
                    if (d.type === 'gameplay_input') roomManager.handleInput(roomCode, playerId, d.payload);
                    module.exports.broadcastToRoom(roomCode, { type: d.type, playerId, payload: d.payload }, ws);
                }
            });
            ws.on('close', () => {
                if (clients.has(roomCode)) clients.get(roomCode).delete(ws);
                module.exports.broadcastToRoom(roomCode, { type: 'player_left', playerId });
            });
        });
        setInterval(() => wss.clients.forEach(ws => { if (!ws.isAlive) return ws.terminate(); ws.isAlive = false; ws.send(JSON.stringify({ type: 'ping' })); }), 30000);
    },
    broadcastToRoom: (code, msg, ex) => {
        const c = clients.get(code); if (!c) return;
        const str = JSON.stringify(msg);
        for (let ws of c) if (ws !== ex && ws.readyState === 1) ws.send(str);
    }
};
WS

echo "Installing dependencies..."
npm install > /dev/null 2>&1

echo "Starting server..."
npm start &
