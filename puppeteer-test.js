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
    await sleep(3000);

    console.log('✅ Trang đã tải xong');
    await page.screenshot({ path: 'test-screenshots/01-initial.png', fullPage: true });

    // --- Click KHỞI TẠO GIẢI ĐẤU button ---
    console.log('🚀 Đang quét tìm nút KHỞI TẠO...');
    const clicked = await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const target = btns.find(b => b.textContent.toUpperCase().includes('KHỞI TẠO'));
        if (target) {
            target.click();
            return true;
        }
        return false;
    });

    if (clicked) {
        console.log('✅ Đã click nút KHỞI TẠO');
    }

    await sleep(3000);
    await page.screenshot({ path: 'test-screenshots/02-initialized.png', fullPage: true });
    console.log('📸 Screenshot 2: Sau khi khởi tạo giải đấu');

    // --- Click tabs to verify layout ---
    for (let i = 0; i < 3; i++) {
        const tabLabel = await page.evaluate((idx) => {
            const tabs = Array.from(document.querySelectorAll('.tab-btn'));
            if (tabs[idx]) {
                tabs[idx].click();
                return tabs[idx].textContent;
            }
            return null;
        }, i);

        if (tabLabel) {
            console.log(`✅ Đã chuyển sang tab: ${tabLabel}`);
            await sleep(2000);
            const safeName = tabLabel.replace(/[./\s]/g, '_');
            await page.screenshot({ path: `test-screenshots/tab-${safeName}.png`, fullPage: true });
        }
    }

    // --- Scoring test ---
    console.log('🧪 Đang thử nhập điểm...');
    const matchScored = await page.evaluate(() => {
        // Go back to scoring tab (usually index 1)
        const tabs = Array.from(document.querySelectorAll('.tab-btn'));
        if (tabs[1]) tabs[1].click();
        return new Promise(r => setTimeout(() => {
            const inputs = Array.from(document.querySelectorAll('input.score-input'));
            if (inputs.length >= 6) {
                // Set best-of-5 scores (3 sets for team 1)
                inputs[0].value = '11'; inputs[1].value = '5';
                inputs[2].value = '11'; inputs[3].value = '7';
                inputs[4].value = '11'; inputs[5].value = '9';

                inputs.forEach(inp => inp.dispatchEvent(new Event('change', { bubbles: true })));

                const saveBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Lưu'));
                if (saveBtn) {
                    saveBtn.click();
                    return r(true);
                }
            }
            r(false);
        }, 1000));
    });

    if (matchScored) {
        console.log('✅ Đã lưu điểm trận đầu');
        await sleep(2000);
        await page.screenshot({ path: 'test-screenshots/06-scored.png', fullPage: true });
    } else {
        console.log('❌ Không tìm thấy ô nhập điểm hoặc nút Lưu');
    }

    console.log('\n🎉 TEST HOÀN THÀNH!');
    await browser.close();
})();
