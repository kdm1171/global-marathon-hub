import { chromium } from 'playwright';
import fs from 'fs';

async function scrapeMgDOM() {
  console.log('🏗️ Scraping MarathonGo Rendered DOM (Fixed)...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto('https://marathongo.co.kr/schedule/list', { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(5000);

    const results = await page.evaluate(() => {
      // 리스트 아이템들이 모여 있는 테이블 혹은 리스트 노드 탐색
      const items = Array.from(document.querySelectorAll('tr, li, .item-card'));
      return items
        .map(el => (el as HTMLElement).innerText)
        .filter(t => t && t.includes('마라톤'))
        .map(t => t.split('\n').map(s => s.trim()).filter(s => s));
    });

    console.log(`✅ Captured ${results.length} competition blocks.`);
    fs.writeFileSync('src/data/mg_dom_data.json', JSON.stringify(results, null, 2));

  } catch (err) {
    console.error('Failed:', err);
  } finally {
    await browser.close();
  }
}

scrapeMgDOM();