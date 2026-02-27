const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;
const DATA_FILE = path.join(__dirname, 'badminton-data.json');
const TXT_FILE = path.join(__dirname, 'KetQua_GiaiCauLong.txt');

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Serve static frontend (including pickleball-pcb.html) from project root
app.use(express.static(__dirname));

// 1. Get current data
app.get('/api/data', (req, res) => {
    if (fs.existsSync(DATA_FILE)) {
        try {
            const data = fs.readFileSync(DATA_FILE, 'utf8');
            res.json(JSON.parse(data));
        } catch (e) {
            res.status(500).json({ error: 'Could not read data file' });
        }
    } else {
        res.json(null); // No data yet
    }
});

// 2. Save JSON state and TXT report
app.post('/api/save', (req, res) => {
    try {
        const { state, txtReport } = req.body;
        
        // Save JSON State
        fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2), 'utf8');
        
        // Save TXT Report
        if (txtReport) {
            fs.writeFileSync(TXT_FILE, txtReport, 'utf8');
        }

        res.json({ success: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to save data' });
    }
});

app.listen(PORT, () => {
    console.log(`Backend is running on http://localhost:${PORT}`);
    console.log(`Will save data to: ${DATA_FILE}`);
    console.log(`Will save TXT report to: ${TXT_FILE}`);
});
