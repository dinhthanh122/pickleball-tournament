const puppeteer = require('puppeteer');
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ['--start-maximized']
    });

    const page = await browser.newPage();

    page.on('dialog', async dialog => {
        console.log(`💬 Alert: ${dialog.message()}`);
        await dialog.accept();
    });

    await page.goto('http://localhost:3001/pickleball-pcb.html', { waitUntil: 'networkidle2' });
    await sleep(2000);

    console.log('🚀 Khởi tạo giải đấu...');
    await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const target = btns.find(b => b.textContent.toUpperCase().includes('KHỞI TẠO'));
        if (target) target.click();
    });
    await sleep(2000);

    console.log('🎲 Click nút Mô Phỏng...');
    await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const target = btns.find(b => b.textContent.includes('Mô Phỏng'));
        if (target) target.click();
    });
    await sleep(2000);

    console.log('🏆 Chuyển sang tab Thành Tích...');
    await page.evaluate(() => {
        const tabs = Array.from(document.querySelectorAll('.tab-btn'));
        const target = tabs.find(t => t.textContent.includes('Thành Tích'));
        if (target) target.click();
    });
    await sleep(2000);

    if (!require('fs').existsSync('test-screenshots')) require('fs').mkdirSync('test-screenshots');
    await page.screenshot({ path: 'test-screenshots/simulation-result.png', fullPage: true });

    console.log('📊 Chuyển sang tab Nhập Kết Quả để check wrapping...');
    await page.evaluate(() => {
        const tabs = Array.from(document.querySelectorAll('.tab-btn'));
        const target = tabs.find(t => t.textContent.includes('Nhập Kết Quả'));
        if (target) target.click();
    });
    await sleep(2000);
    await page.screenshot({ path: 'test-screenshots/name-wrapping-check.png', fullPage: true });

    console.log('\n🎉 VERIFICATION HOÀN THÀNH!');
    await browser.close();
})();
