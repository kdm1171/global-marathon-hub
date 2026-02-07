import { chromium } from 'playwright';
import fs from 'fs';

async function extractRegFinal() {
  console.log('🚀 Starting Final Registration Date Extraction...');
  const marathonsPath = 'src/data/marathons.json';
  const marathons = JSON.parse(fs.readFileSync(marathonsPath, 'utf8'));
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();

  for (let m of marathons) {
    if (m.reg_start && m.reg_end) continue; // 이미 있는 건 스킵
    if (!m.link || !m.link.startsWith('http')) continue;

    console.log(`🔍 Investigating: ${m.name}`);
    const page = await context.newPage();
    try {
      await page.goto(m.link, { waitUntil: 'networkidle', timeout: 30000 });
      
      const regData = await page.evaluate(() => {
        const bodyText = document.body.innerText;
        // 접수/신청 기간 패턴 (YYYY.MM.DD ~ YYYY.MM.DD)
        const rangeRegex = /(\d{4}[.\-/]\d{1,2}[.\-/]\d{1,2})\s*~\s*(\d{4}[.\-/]\d{1,2}[.\-/]\d{1,2})/;
        const match = bodyText.match(rangeRegex);
        
        if (match) return { start: match[1], end: match[2] };

        // 기간 패턴이 없으면 '마감' 날짜만이라도 탐색
        const deadlineRegex = /마감[:\s]*(\d{4}[.\-/]\d{1,2}[.\-/]\d{1,2})/;
        const deadMatch = bodyText.match(deadlineRegex);
        if (deadMatch) return { start: null, end: deadMatch[1] };

        return null;
      });

      if (regData) {
        m.reg_start = regData.start ? regData.start.replace(/[./]/g, '-') : null;
        m.reg_end = regData.end.replace(/[./]/g, '-');
        console.log(`   ✨ FOUND: ${m.reg_start || 'N/A'} ~ ${m.reg_end}`);
      } else {
        console.log(`   ❌ No period info on main page.`);
      }
    } catch (e) {
      console.log(`   ⚠️ Page load failed.`);
    } finally {
      await page.close();
    }

    // 데이터 안전 저장
    fs.writeFileSync(marathonsPath, JSON.stringify(marathons, null, 2));
  }

  await browser.close();
  console.log('🎉 Extraction Round Complete.');
}

extractRegFinal();
