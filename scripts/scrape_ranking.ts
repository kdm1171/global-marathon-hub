import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function sniffRankingMarathon() {
  console.log('📡 Sniffing Ranking Marathon API...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  let capturedData: any = null;

  // API 응답 가로채기
  page.on('response', async response => {
    const url = response.url();
    if (url.includes('api') && url.includes('marathon')) {
      try {
        const json = await response.json();
        if (json.data || Array.isArray(json)) {
          console.log('🎯 Caught Marathon Data API!');
          capturedData = json;
        }
      } catch (e) {}
    }
  });

  try {
    await page.goto('https://rankingmarathon.com/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);

    if (capturedData) {
      const outPath = 'src/data/marathons_raw.json';
      fs.writeFileSync(outPath, JSON.stringify(capturedData, null, 2));
      console.log(`✅ Success! Raw data saved to ${outPath}`);
    } else {
      console.log('❌ Failed to sniff API. Trying DOM scraping...');
      // DOM 기반 스크래핑 보조 로직
    }
  } finally {
    await browser.close();
  }
}

sniffRankingMarathon();