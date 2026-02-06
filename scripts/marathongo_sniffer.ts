import { chromium } from 'playwright';
import fs from 'fs';

async function sniffMarathonGo() {
  console.log('🕵️ Brute-Force Sniffing MarathonGo...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  let counter = 0;
  page.on('response', async (response) => {
    const contentType = response.headers()['content-type'] || '';
    if (contentType.includes('application/json') || contentType.includes('text/plain')) {
      try {
        const data = await response.text();
        if (data.includes('마라톤')) {
          const filename = `src/data/mg_api_${counter++}.json`;
          fs.writeFileSync(filename, data);
          console.log(`✨ Bingo! Data chunk captured: ${filename}`);
        }
      } catch (e) {}
    }
  });

  try {
    await page.goto('https://marathongo.co.kr/schedule/list', { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(10000); // 데이터가 뜰 때까지 넉넉히 대기
    console.log('🔍 Brute-force complete.');
  } catch (err) {
    console.error('Failed:', err);
  } finally {
    await browser.close();
  }
}

sniffMarathonGo();