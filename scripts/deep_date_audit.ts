import { chromium } from 'playwright';
import fs from 'fs';

async function deepDateAudit() {
  console.log('🧐 Starting Deep Date Audit from Official Sources...');
  const marathons = JSON.parse(fs.readFileSync('src/data/marathons.json', 'utf8'));
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();

  let updatedCount = 0;

  for (const m of marathons) {
    if (!m.is_official || !m.link.startsWith('http')) continue;

    console.log(`🔍 Auditing: ${m.name} via ${m.link}`);
    const page = await context.newPage();
    try {
      // 공식 홈페이지 접속 (네트워크 여유 있게 대기)
      await page.goto(m.link, { waitUntil: 'networkidle', timeout: 20000 });
      const pageText = await page.evaluate(() => document.body.innerText);

      // 텍스트 분석 로직
      // 1. 2026년도 날짜 패턴 탐색 (예: 2026년 3월 15일, 2026.03.15, 26.03.15)
      const dateRegex = /2026[.\-\s년]*(\d{1,2})[.\-\s월]*(\d{1,2})/;
      const match = pageText.match(dateRegex);

      if (match) {
        const newDate = `2026-${match[1].padStart(2, '0')}-${match[2].padStart(2, '0')}`;
        if (m.date !== newDate) {
          console.log(`   ✨ [DATE CORRECTED] ${m.date} -> ${newDate}`);
          m.date = newDate;
          updatedCount++;
        }
      } else if (pageText.includes('2026') && !m.name.includes('2026')) {
        console.log(`   💡 Found 2026 mention on site. Flagging for review.`);
      }

    } catch (e) {
      console.log(`   ⚠️ Audit failed for: ${m.name}`);
    } finally {
      await page.close();
    }

    if (updatedCount % 5 === 0) {
      fs.writeFileSync('src/data/marathons.json', JSON.stringify(marathons, null, 2));
    }
  }

  fs.writeFileSync('src/data/marathons.json', JSON.stringify(marathons, null, 2));
  console.log(`
🎉 Audit Complete: ${updatedCount} dates corrected based on Official Sources.`);
  await browser.close();
}

deepDateAudit();
