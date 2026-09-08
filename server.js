const express = require('express');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// نمایش فایل بازی
app.use(express.static(__dirname));

const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// سرور برای اتصال بازیکن‌ها
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    console.log('یک بازیکن جدید متصل شد');
    
    ws.on('message', (message) => {
        // ارسال حرکات بازیکن به بازیکن دیگر
        wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });
});