const express = require('express');
const app = express();

app.use(express.json());

// Токен будет добавлен позже
const BOT_TOKEN = process.env.BOT_TOKEN;
const YOUR_TELEGRAM_ID = '8467166855';

let reminders = [];

app.get('/', (req, res) => {
    res.send('🚀 NEO Bot работает!');
});

app.get('/keep-alive', (req, res) => {
    res.send('alive');
});

app.post('/add-reminder', (req, res) => {
    const { text, date, time } = req.body;
    const [year, month, day] = date.split('-');
    const [hours, minutes] = time.split(':');
    const reminderTime = new Date(year, month-1, day, hours, minutes, 0);
    
    reminders.push({
        id: Date.now(),
        text: text,
        date: date,
        time: time,
        timestamp: reminderTime.getTime(),
        sent: false
    });
    
    console.log(`⏰ Напоминание: "${text}" на ${date} ${time}`);
    res.json({ success: true });
});

app.post('/add-task', (req, res) => {
    console.log('📝 Задача:', req.body.text);
    res.json({ success: true });
});

async function sendToTelegram(text) {
    if (!BOT_TOKEN) return false;
    
    try {
        const fetch = await import('node-fetch');
        const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
        const response = await fetch.default(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: YOUR_TELEGRAM_ID,
                text: text
            })
        });
        const result = await response.json();
        return result.ok;
    } catch(e) {
        return false;
    }
}

setInterval(() => {
    const now = Date.now();
    const toSend = reminders.filter(r => r.timestamp <= now && !r.sent);
    
    for (const r of toSend) {
        const msg = `🔔 НАПОМИНАНИЕ!\n📅 ${r.date}\n⏰ ${r.time}\n📝 ${r.text}`;
        sendToTelegram(msg);
        r.sent = true;
    }
}, 60000);

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`🚀 Сервер на порту ${port}`);
});
