const WebSocket = require('ws');
const http = require('http');
const { URL } = require('url');

const PROXY_PORT = 8080;
const CHATGUM_SERVER = 'wss://live2.chatgum.com';  // Original server

// Rate limit bypass storage
const roomCooldowns = new Map();

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('ChatGum Proxy Server Running!\n');
});

const wss = new WebSocket.Server({ 
    server, 
    port: PROXY_PORT 
});

console.log(`🚀 ChatGum Proxy started on port ${PROXY_PORT}`);

wss.on('connection', (ws, req) => {
    console.log('📱 ChatGum client connected');
    
    // Original ChatGum server se connect
    const chatgumWs = new WebSocket(CHATGUM_SERVER);
    
    // Client → Proxy → ChatGum
    ws.on('message', (data) => {
        try {
            const message = JSON.parse(data);
            console.log('📤 IN:', message);
            
            // RATE LIMIT BYPASS LOGIC
            if (message.type === 'sendMessage' || 
                message.action === 'message' || 
                message.cmd === 'send') {
                
                const roomId = message.roomId || message.room || 'unknown';
                const now = Date.now();
                
                // Fake timestamp - bypass 2sec check
                message.timestamp = now;
                message.sentAt = now;
                message.delay = 0;
                
                // Clear cooldown
                roomCooldowns.delete(roomId);
                
                console.log(`✅ ${roomId} - 2SEC BYPASS!`);
            }
            
            // Forward to ChatGum server
            chatgumWs.send(JSON.stringify(message));
            
        } catch (e) {
            console.log('❌ Parse error:', e);
            chatgumWs.send(data);  // Raw forward
        }
    });
    
    // ChatGum → Proxy → Client
    chatgumWs.on('message', (data) => {
        try {
            const response = JSON.parse(data);
            console.log('📥 OUT:', response);
            ws.send(JSON.stringify(response));
        } catch (e) {
            ws.send(data);
        }
    });
    
    chatgumWs.on('close', () => {
        console.log('🔌 ChatGum server disconnected');
        ws.close();
    });
    
    ws.on('close', () => {
        console.log('📴 Client disconnected');
        chatgumWs.close();
    });
});

server.listen(PROXY_PORT, '0.0.0.0', () => {
    console.log(`\n🌐 Proxy ready: ws://0.0.0.0:${PROXY_PORT}`);
    console.log(`📱 Termux IP check: ifconfig`);
});
