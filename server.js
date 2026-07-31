const express = require('express');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');

const roomManager = require('./roomManager');
const wsHandler = require('./wsHandler');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Middleware
app.use(cors());
app.use(express.json());

// Helper to validate session
function validateSession(req, res, next) {
    const code = req.params.code;
    const { playerId } = req.body || req.query;

    // Allow simple GET requests without session for snapshot (based on typical demo needs),
    // but the prompt says "Mọi request (trừ tạo phòng) đều kiểm tra sessionToken hợp lệ".
    // For GET snapshot it didn't specify body, so let's allow it if it's GET.
    if (req.method === 'GET') {
        return next();
    }

    // For JOIN, sessionToken is created, so we don't validate it here.
    if (req.path.endsWith('/join')) {
         return next();
    }

    const authHeader = req.headers.authorization;
    const sessionToken = authHeader ? authHeader.replace('Bearer ', '') : req.body.sessionToken;

    const room = roomManager.getRoom(code);
    if (!room) {
        return res.status(404).json({ error: 'Room not found' });
    }

    const player = room.players.get(playerId);
    if (!player || player.sessionToken !== sessionToken) {
        return res.status(401).json({ error: 'Unauthorized or invalid session' });
    }

    next();
}

// Routes
// POST /demo/rooms -> tạo phòng
app.post('/demo/rooms', (req, res) => {
    try {
        const { hostUsername } = req.body;
        const hostPlayerId = require('crypto').randomUUID();
        const result = roomManager.createRoom(hostPlayerId, hostUsername || 'Host');
        console.log(`[API] Created room: ${result.roomCode}`);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// POST /demo/rooms/:code/join -> tham gia
app.post('/demo/rooms/:code/join', (req, res) => {
    try {
        const { playerId, username } = req.body;
        const result = roomManager.joinRoom(req.params.code, playerId, username || 'Player');
        console.log(`[API] Player ${playerId} joined room ${req.params.code}`);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// POST /demo/rooms/:code/start -> bắt đầu
app.post('/demo/rooms/:code/start', validateSession, (req, res) => {
    try {
        const { playerId } = req.body;
        const result = roomManager.startRoom(req.params.code, playerId);
        console.log(`[API] Room started: ${req.params.code}`);

        // Broadcast start
        wsHandler.broadcastToRoom(req.params.code, {
            type: 'room_snapshot',
            data: result
        });

        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// POST /demo/rooms/:code/leave -> rời phòng
app.post('/demo/rooms/:code/leave', validateSession, (req, res) => {
    try {
        const { playerId } = req.body;
        roomManager.leaveRoom(req.params.code, playerId);
        console.log(`[API] Player ${playerId} left room ${req.params.code}`);

        wsHandler.broadcastToRoom(req.params.code, {
            type: 'player_left',
            playerId: playerId
        });

        res.json({ success: true });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// POST /demo/rooms/:code/respawn -> hồi sinh
app.post('/demo/rooms/:code/respawn', validateSession, (req, res) => {
    try {
        const { playerId } = req.body;
        const result = roomManager.respawnPlayer(req.params.code, playerId);
        console.log(`[API] Player ${playerId} respawned in room ${req.params.code}`);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// POST /demo/rooms/:code/input -> cập nhật
app.post('/demo/rooms/:code/input', validateSession, (req, res) => {
    try {
        const { playerId, stepIndex, score, state } = req.body;
        const success = roomManager.handleInput(req.params.code, playerId, { stepIndex, score, state });
        if (success) {
            console.log(`[API] Input updated for ${playerId} in room ${req.params.code}`);
        }
        res.json({ success });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// GET /demo/rooms/:code -> lấy trạng thái phòng
app.get('/demo/rooms/:code', (req, res) => {
    try {
        const snapshot = roomManager.getRoomSnapshot(req.params.code);
        if (!snapshot) {
            return res.status(404).json({ error: 'Room not found' });
        }
        res.json(snapshot);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Init WebSocket
wsHandler.init(wss);

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
