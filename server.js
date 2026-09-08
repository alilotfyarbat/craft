// فایل server.js - نسخه اصلاح شده
const express = require('express');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ارائه دادن فایل HTML بازی
app.use(express.static(__dirname));

const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// وب‌سوکت برای اتصال بازیکن‌ها
const wss = new WebSocket.Server({ server });

// تولید کد شناسایی یکتا برای هر بازیکن
function generateId() {
    return Math.random().toString(36).substring(2, 9);
}

wss.on('connection', (ws) => {
    // به محض اتصال بازیکن جدید، یک ID به او اختصاص بده وبفرست
    ws.id = generateId();
    ws.send(JSON.stringify({ type: 'init', id: ws.id }));
    console.log('New player connected with ID:', ws.id);

    // وقتی پیامی از یک بازیکن می‌آید، ID او را به پیام اضافه کن و برای بقیه بفرست
    ws.on('message', (message) => {
        let data;
        try {
            data = JSON.parse(message);
        } catch (e) {
            return;
        }
        
        // اضافه کردن آیدی فرستنده به پیام
        data.id = ws.id;
        const msgToSend = JSON.stringify(data);

        // ارسال پیام به همه بازیکن‌ها به جز فرستنده
        wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(msgToSend);
            }
        });
    });

    // وقتی بازیکن قطع می‌شود، به بقیه اطلاع بده
    ws.on('close', () => {
        console.log('Player disconnected:', ws.id);
        const leaveMsg = JSON.stringify({ type: 'leave', id: ws.id });
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(leaveMsg);
            }
        });
    });
});
