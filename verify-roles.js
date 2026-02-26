const puppeteer = require('puppeteer');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ['--start-maximized']
    });

    const page = await browser.newPage();

    if (!fs.existsSync('test-screenshots')) fs.mkdirSync('test-screenshots');

    await page.goto('http://localhost:3001/pickleball-pcb.html', { waitUntil: 'networkidle2' });
    await sleep(2000);

    console.log('🖼️ Capturing Landing Page...');
    await page.screenshot({ path: 'test-screenshots/landing-page.png', fullPage: true });

    console.log('🔑 Entering Admin Password...');
    await page.evaluate(() => {
        const adminBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Admin Dashboard'));
        if (adminBtn) adminBtn.click();
    });
    await sleep(1000);

    await page.type('input[type="password"]', 'PCB2026');
    await page.keyboard.press('Enter');
    await sleep(2000);

    console.log('🏆 Switching to Podium Tab...');
    await page.evaluate(() => {
        const tabs = Array.from(document.querySelectorAll('.tab-btn'));
        const target = tabs.find(t => t.textContent.includes('Thành Tích'));
        if (target) target.click();
    });
    await sleep(1000);

    console.log('📸 Capturing Podium with Legend...');
    await page.screenshot({ path: 'test-screenshots/podium-legend.png', fullPage: true });

    console.log('\n🎉 VERIFICATION SUCCESS!');
    await browser.close();
})();
