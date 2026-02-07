import { chromium } from 'playwright';
import fs from 'fs';

async function fixDateContext() {
  console.log('🧐 Starting Context-Aware Date Correction...');
  const marathonsPath = 'src/data/marathons.json';
  const marathons = JSON.parse(fs.readFileSync(marathonsPath, 'utf8'));
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();

  for (let m of marathons) {
    if (!m.link || !m.link.startsWith('http')) continue;

    console.log(`🔍 Auditing: ${m.name}`);
    const page = await context.newPage();
    try {
      await page.goto(m.link, { waitUntil: 'networkidle', timeout: 20000 });
      
      const realDates = await page.evaluate(() => {
        const text = document.body.innerText;
        const res: any = {};

        // 1. 대회 개최일 탐색 (키워드: 일시, 개최, 대회일)
        const eventMatch = text.match(/(?:일시|개최|대회일)[^\d]*(\d{4}[.\-/]\d{1,2}[.\-/]\d{1,2})/);
        if (eventMatch) res.date = eventMatch[1];

        // 2. 접수 기간 탐색 (키워드: 접수, 신청)
        const regMatch = text.match(/(?:접수|신청)[^\d]*(\d{4}[.\-/]\d{1,2}[.\-/]\d{1,2})\s*~\s*(\d{4}[.\-/]\d{1,2}[.\-/]\d{1,2})/);
        if (regMatch) {
          res.reg_start = regMatch[1];
          res.reg_end = regMatch[2];
        }

        return res;
      });

      if (realDates.date) {
        const newDate = realDates.date.replace(/[./]/g, '-');
        if (m.date !== newDate) {
          console.log(`   ✨ [COMP DATE FIX] ${m.date} -> ${newDate}`);
          m.date = newDate;
        }
      }
      if (realDates.reg_start) {
        m.reg_start = realDates.reg_start.replace(/[./]/g, '-');
        m.reg_end = realDates.reg_end.replace(/[./]/g, '-');
        console.log(`   ✨ [REG DATE FIX] ${m.reg_start} ~ ${m.reg_end}`);
      }

    } catch (e) {
      console.log(`   ⚠️ Failed to load.`);
    } finally {
      await page.close();
    }
    
    // 안전한 주기적 저장
    fs.writeFileSync(marathonsPath, JSON.stringify(marathons, null, 2));
  }

  await browser.close();
  console.log('🎉 Context correction complete.');
}

fixDateContext();
