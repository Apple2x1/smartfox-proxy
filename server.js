/**
 * File: server.js
 * Purpose: TCP proxy server jo app requests ko SmartFox server tak forward kare
 * Repo: https://github.com/<YOUR_USERNAME>/smartfox-proxy
 */

const net = require("net");
const cfg = require("./config");

// TCP proxy server
net.createServer(client => {

    // Connect to SmartFox server
    const sfs = net.connect(cfg.SMARTFOX_PORT, cfg.SMARTFOX_HOST);

    // Client -> SmartFox
    client.on("data", data => {
        // 🔹 Future: Chat delay logic yahi daal sakte ho
        sfs.write(data);
    });

    // SmartFox -> Client
    sfs.on("data", data => {
        client.write(data);
    });

    // Error handling
    client.on("error", err => console.log("Client error:", err));
    sfs.on("error", err => console.log("SFS error:", err));

}).listen(cfg.LISTEN_PORT, () => {
    console.log("SmartFox proxy running on port", cfg.LISTEN_PORT);
});
