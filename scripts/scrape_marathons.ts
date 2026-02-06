import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function scrapeMarathon() {
  console.log('🏁 Starting Marathon Scraper (Stealth Mode)...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();

  const marathons: any[] = [];

  try {
    // 1. 마라톤 온라인 접속 (타임아웃 연장)
    await page.goto('http://www.marathon.pe.kr/schedule/index.html', { 
      waitUntil: 'networkidle',
      timeout: 60000 
    });
    console.log('Main page loaded.');

    const rows = await page.locator('table tr').all();
    for (const row of rows) {
      const text = await row.innerText();
      if (text.match(/\d{4}-\d{2}-\d{2}/)) {
        const cells = await row.locator('td').allInnerTexts();
        if (cells.length >= 5) {
          marathons.push({
            date: cells[0].trim(),
            name: cells[1].trim(),
            location: cells[2].trim(),
            distance: cells[3].trim(),
            organizer: cells[4].trim()
          });
        }
      }
    }

    if (marathons.length > 0) {
      fs.writeFileSync('src/data/marathons.json', JSON.stringify(marathons, null, 2));
      console.log(`✅ Success! Extracted ${marathons.length} marathons.`);
    } else {
      console.log('⚠️ No data found on this source. Switching to alternate source...');
      // 여기에 대체 소스(랭킹마라톤) 로직 추가 예정
    }

  } catch (err) {
    console.error('Stealth scraping failed:', err.message);
  } finally {
    await browser.close();
  }
}

scrapeMarathon();