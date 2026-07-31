const url = require('url');
const roomManager = require('./roomManager');

// Keep track of connected clients by roomCode
const clients = new Map();

function init(wss) {
  wss.on('connection', (ws, req) => {
    // Parse URL and params
    const parsedUrl = url.parse(req.url, true);
    const { playerId, sessionToken } = parsedUrl.query;

    // Extract roomCode from path: /demo/rooms/:code/ws
    const pathParts = parsedUrl.pathname.split('/');
    let roomCode = null;
    if (pathParts.length >= 4 && pathParts[1] === 'demo' && pathParts[2] === 'rooms' && pathParts[4] === 'ws') {
        roomCode = pathParts[3];
    }

    if (!roomCode || !playerId || !sessionToken) {
        ws.close(4000, 'Missing required parameters');
        return;
    }

    const room = roomManager.getRoom(roomCode);
    if (!room) {
        ws.close(4004, 'Room not found');
        return;
    }

    const player = room.players.get(playerId);
    if (!player || player.sessionToken !== sessionToken) {
        ws.close(4001, 'Unauthorized');
        return;
    }

    console.log(`[WS] Client connected: ${playerId} to room ${roomCode}`);

    // Setup client data
    ws.isAlive = true;
    ws.playerId = playerId;
    ws.roomCode = roomCode;

    // Add to clients map
    if (!clients.has(roomCode)) {
        clients.set(roomCode, new Set());
    }
    clients.get(roomCode).add(ws);

    // Send initial snapshot
    ws.send(JSON.stringify({
        type: 'room_snapshot',
        data: roomManager.getRoomSnapshot(roomCode)
    }));

    // Handle messages
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);

            // Handle keep-alive pong
            if (data.type === 'pong') {
                 ws.isAlive = true;
                 return;
            }

            // Client sending game input (jump, death, etc)
            if (data.type === 'gameplay_input' || data.type === 'player_jump' || data.type === 'player_death') {
                // Rate limit and update state if it's input
                if (data.type === 'gameplay_input' && data.payload) {
                     roomManager.handleInput(roomCode, playerId, data.payload);
                }

                // Broadcast to others
                broadcastToRoom(roomCode, {
                    type: data.type,
                    playerId: playerId,
                    payload: data.payload
                }, ws); // exclude sender
            }

        } catch (error) {
            console.error('[WS] Message error:', error);
        }
    });

    // Handle disconnect
    ws.on('close', () => {
        console.log(`[WS] Client disconnected: ${playerId} from room ${roomCode}`);
        if (clients.has(roomCode)) {
            clients.get(roomCode).delete(ws);
            if (clients.get(roomCode).size === 0) {
                clients.delete(roomCode);
            }
        }

        // Notify others
        broadcastToRoom(roomCode, {
            type: 'player_left',
            playerId: playerId
        });

        // Optional: auto-leave room if disconnected for a while, but for this demo,
        // we'll just broadcast player_left. Explicit /leave handles actual removal.
    });

    // Handle errors
    ws.on('error', (error) => {
        console.error(`[WS] Error for ${playerId}:`, error);
    });
  });

  // Ping interval to keep connections alive
  const pingInterval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.isAlive === false) return ws.terminate();

      ws.isAlive = false;
      ws.send(JSON.stringify({ type: 'ping' }));
    });
  }, 30000);

  wss.on('close', () => {
    clearInterval(pingInterval);
  });
}

function broadcastToRoom(roomCode, message, excludeWs = null) {
    const roomClients = clients.get(roomCode);
    if (!roomClients) return;

    const msgString = JSON.stringify(message);
    for (const client of roomClients) {
        if (client !== excludeWs && client.readyState === 1 /* WebSocket.OPEN */) {
            client.send(msgString);
        }
    }
}

module.exports = {
    init,
    broadcastToRoom
};
