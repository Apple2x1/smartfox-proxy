// server.js
const net = require('net');

// ChatGum original server details
const ORIGINAL_HOST = 'live2.chatgum.com';
const ORIGINAL_PORT = 9933;

// Proxy listen port
const LOCAL_PORT = 9933;

// Simple TCP proxy server
const server = net.createServer((clientSocket) => {
  const remoteSocket = new net.Socket();

  // Connect to original server
  remoteSocket.connect(ORIGINAL_PORT, ORIGINAL_HOST, () => {
    console.log('Connected to original ChatGum server');
  });

  // Data from client -> remote (handle delay here)
  clientSocket.on('data', (data) => {
    // Check if message data (replace below condition with exact message identifier)
    // For now, delay all data by 2 seconds
    setTimeout(() => {
      remoteSocket.write(data);
    }, 2000); // 2 second delay
  });

  // Data from remote -> client
  remoteSocket.on('data', (data) => {
    clientSocket.write(data);
  });

  // Handle close / errors
  clientSocket.on('close', () => remoteSocket.end());
  remoteSocket.on('close', () => clientSocket.end());
  clientSocket.on('error', () => remoteSocket.end());
  remoteSocket.on('error', () => clientSocket.end());
});

server.listen(LOCAL_PORT, () => {
  console.log(`SmartFox proxy running on port ${LOCAL_PORT}`);
});
