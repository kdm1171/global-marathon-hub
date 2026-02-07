import { chromium } from 'playwright';
import fs from 'fs';

async function extractRegDates() {
  console.log('📅 Extracting Registration Dates...');
  const marathonsPath = 'src/data/marathons.json';
  const marathons = JSON.parse(fs.readFileSync(marathonsPath, 'utf8'));
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();

  for (let m of marathons) {
    if (!m.link.startsWith('http')) continue;

    const page = await context.newPage();
    try {
      await page.goto(m.link, { waitUntil: 'domcontentloaded', timeout: 15000 });
      const text = await page.evaluate(() => document.body.innerText);

      // 접수 기간 패턴 매칭 (예: 2026.01.01 ~ 2026.02.15)
      const periodRegex = /(\d{4}[.\-/]\d{1,2}[.\-/]\d{1,2})\s*~\s*(\d{4}[.\-/]\d{1,2}[.\-/]\d{1,2})/;
      const match = text.match(periodRegex);

      if (match) {
        m.reg_start = match[1].replace(/[./]/g, '-');
        m.reg_end = match[2].replace(/[./]/g, '-');
        console.log(`   ✅ [PERIOD FOUND] ${m.name}: ${m.reg_start} ~ ${m.reg_end}`);
      } else {
        // 단일 날짜 마감일만 있는 경우
        const deadlineRegex = /마감[일]*[:\s]*(\d{4}[.\-/]\d{1,2}[.\-/]\d{1,2})/;
        const deadMatch = text.match(deadlineRegex);
        if (deadMatch) {
          m.reg_end = deadMatch[1].replace(/[./]/g, '-');
          console.log(`   ✅ [DEADLINE FOUND] ${m.name}: ~ ${m.reg_end}`);
        }
      }
    } catch (e) {
      console.log(`   ⚠️ Failed: ${m.name}`);
    } finally {
      await page.close();
    }
    
    if (marathons.indexOf(m) % 10 === 0) {
      fs.writeFileSync(marathonsPath, JSON.stringify(marathons, null, 2));
    }
  }

  fs.writeFileSync(marathonsPath, JSON.stringify(marathons, null, 2));
  await browser.close();
  console.log('🎉 Registration dates synced.');
}

extractRegDates();
