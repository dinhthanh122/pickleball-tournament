const puppeteer = require('puppeteer');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const fs = require('fs');

if (!fs.existsSync('test-screenshots')) fs.mkdirSync('test-screenshots');

(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ['--start-maximized']
    });

    const page = await browser.newPage();

    // Handle alert dialogs automatically
    page.on('dialog', async dialog => {
        console.log(`💬 Alert: ${dialog.message()}`);
        await dialog.accept();
    });

    await page.goto('http://localhost:3001/pickleball-pcb.html', { waitUntil: 'networkidle2' });
    await sleep(2000);

    console.log('✅ Trang đã tải xong');

    // --- Click KHỞI TẠO GIẢI ĐẤU button ---
    console.log('🚀 Khởi tạo giải đấu...');
    await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const target = btns.find(b => b.textContent.toUpperCase().includes('KHỞI TẠO'));
        if (target) target.click();
    });
    await sleep(2000);

    // --- Switch to Scoring Tab ---
    console.log('📈 Chuyển sang tab Nhập Kết Quả...');
    await page.evaluate(() => {
        const tabs = Array.from(document.querySelectorAll('.tab-btn'));
        const target = tabs.find(t => t.textContent.includes('Nhập Kết Quả'));
        if (target) target.click();
    });
    await sleep(1000);

    // --- Full Tournament Simulation Loop ---
    console.log('🧪 Bắt đầu mô phỏng toàn bộ giải đấu...');

    let iterations = 0;
    const MAX_ITERATIONS = 100; // Increased to ensure long tournaments finish

    while (iterations < MAX_ITERATIONS) {
        iterations++;

        // Find all matches that need scoring
        const matchIds = await page.evaluate(() => {
            const cards = Array.from(document.querySelectorAll('.glass-panel.p-6.mb-8 .grid > div'));
            return cards
                .filter(c => !c.textContent.includes('● Kết Thúc'))
                .map((c, i) => i); // Just get indices for now since IDs aren't easily selectable from here
        });

        if (matchIds.length === 0) {
            console.log('✨ Không còn trận đấu nào cần nhập điểm.');
            break;
        }

        console.log(`🔄 Vòng lặp mô phỏng #${iterations}: Còn ${matchIds.length} trận đấu sẵn sàng.`);

        // Score the first available match
        const success = await page.evaluate(async () => {
            const cards = Array.from(document.querySelectorAll('.glass-panel.p-6.mb-8 .grid > div'));
            const card = cards.find(c => !c.textContent.includes('● Kết Thúc'));
            if (!card) return false;

            const inputs = Array.from(card.querySelectorAll('input.score-input'));
            if (inputs.length < 6) return false;

            // Winner logic: Give 11-0 to team 1 for 3 sets
            inputs[0].value = '11'; inputs[1].value = '0';
            inputs[2].value = '11'; inputs[3].value = '0';
            inputs[4].value = '11'; inputs[5].value = '0';

            inputs.forEach(inp => {
                inp.dispatchEvent(new Event('input', { bubbles: true }));
                inp.dispatchEvent(new Event('change', { bubbles: true }));
            });

            await new Promise(r => setTimeout(r, 100)); // Small pause

            const saveBtn = Array.from(card.querySelectorAll('button')).find(b => b.textContent.includes('Lưu'));
            if (saveBtn) {
                saveBtn.click();
                return true;
            }
            return false;
        });

        if (success) {
            await sleep(1000); // Wait for save
        } else {
            console.log('⚠️ Không thể lưu điểm cho trận này. Có thể chưa xác định đủ VĐV? Thử trận tiếp theo...');
            await sleep(500);
            // If we can't score ANY match, we might be stuck
            if (matchIds.length === 1) break;
        }
    }

    // --- Final Verification ---
    console.log('🏆 Kiểm tra Bảng Thành Tích...');
    await page.evaluate(() => {
        const tabs = Array.from(document.querySelectorAll('.tab-btn'));
        const target = tabs.find(t => t.textContent.includes('Thành Tích'));
        if (target) target.click();
    });
    await sleep(2000);
    await page.screenshot({ path: 'test-screenshots/final-podium.png', fullPage: true });

    console.log('📊 Kiểm tra Bracket cuối cùng...');
    await page.evaluate(() => {
        const tabs = Array.from(document.querySelectorAll('.tab-btn'));
        const target = tabs.find(t => t.textContent.includes('Bracket'));
        if (target) target.click();
    });
    await sleep(2000);
    await page.screenshot({ path: 'test-screenshots/final-bracket.png', fullPage: true });

    console.log('\n🎉 MÔ PHỎNG HOÀN THÀNH!');
    await browser.close();
})();
