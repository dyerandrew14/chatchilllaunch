// Simple script to keep Render server awake
// Run this in a separate terminal: node keep-alive.js

const https = require('https');

function pingServer() {
  const options = {
    hostname: 'chatchilllaunch.onrender.com',
    port: 443,
    path: '/health',
    method: 'GET'
  };

  const req = https.request(options, (res) => {
    console.log(`✅ Ping successful - Status: ${res.statusCode} at ${new Date().toLocaleTimeString()}`);
  });

  req.on('error', (error) => {
    console.log(`❌ Ping failed: ${error.message} at ${new Date().toLocaleTimeString()}`);
  });

  req.end();
}

// Ping every 5 minutes (300 seconds)
console.log('🔄 Starting keep-alive pings to Render server...');
pingServer(); // Initial ping
setInterval(pingServer, 300000); // 5 minutes = 300,000 ms
