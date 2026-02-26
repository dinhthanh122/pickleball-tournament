// Script to seed 11 men and 5 women names, resetting the tournament state
const http = require('http');

const men = [
    { id: 'man1', name: 'Đào Minh Hiển', rank: 1 },
    { id: 'man2', name: 'Tuấn', rank: 2 },
    { id: 'man3', name: 'Nguyễn Khắc Duy', rank: 3 },
    { id: 'man4', name: 'Quân', rank: 4 },
    { id: 'man5', name: 'Dương Văn Cảnh', rank: 5 },
    { id: 'man6', name: 'Trần Văn Mão', rank: 6 },
    { id: 'man7', name: 'Khôi', rank: 7 },
    { id: 'man8', name: 'HoaNN', rank: 8 },
    { id: 'man9', name: 'Cương', rank: 9 },
    { id: 'man10', name: 'LongDD', rank: 10 },
    { id: 'man11', name: 'HuyNN', rank: 11 },
];

const women = [
    { id: 'woman1', name: 'Tuyết Chinh', rank: 1 },
    { id: 'woman2', name: 'Chị Hường', rank: 2 },
    { id: 'woman3', name: 'Chị Thảo', rank: 3 },
    { id: 'woman4', name: 'Vy Nguyễn', rank: 4 },
    { id: 'woman5', name: 'Giang Thùy Linh', rank: 5 },
];

const payload = JSON.stringify({
    state: {
        players: { men, women },
        mdTeams: [],
        msData: { rounds: [], matches: {} },
        mdData: { rounds: [], matches: {} },
        initialized: false
    },
    txtReport: `KHỞI TẠO DỮ LIỆU TEST: 11 NAM, 5 NỮ\n=================================\n`
});

const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/save',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
    }
};

const req = http.request(options, (res) => {
    console.log(`✅ Đã reset và lưu danh sách VĐV test! Status: ${res.statusCode}`);
    console.log(`➡️  Hãy chạy puppeteer-test.js để tự động khởi tạo giải đấu.`);
});

req.on('error', (e) => {
    console.error(`❌ Lỗi kết nối server: ${e.message}`);
});

req.write(payload);
req.end();
