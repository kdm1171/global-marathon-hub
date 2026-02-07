import { chromium } from 'playwright';
import fs from 'fs';

async function sourceRescue() {
  console.log('🚁 Launching Source Rescue Operation...');
  const marathons = JSON.parse(fs.readFileSync('src/data/marathons.json', 'utf8'));
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();

  let rescuedCount = 0;

  for (const m of marathons) {
    if (!m.link.includes('roadrun.co.kr')) continue;

    console.log(`🔍 Rescuing: ${m.name}`);
    const page = await context.newPage();
    try {
      await page.goto(m.link, { waitUntil: 'domcontentloaded', timeout: 10000 });
      
      const officialLink = await page.evaluate(() => {
        // 상세 페이지 내의 모든 외부 링크 탐색
        const links = Array.from(document.querySelectorAll('a[href^="http"]'));
        const blackList = ['roadrun.co.kr', 'javascript', 'facebook', 'instagram', 'twitter', 'naver.com', 'daum.net'];
        
        const found = links.find(a => {
          const h = (a as HTMLAnchorElement).href.toLowerCase();
          return !blackList.some(b => h.includes(b));
        });
        
        return found ? (found as HTMLAnchorElement).href : null;
      });

      if (officialLink) {
        console.log(`   ✨ FOUND: ${officialLink}`);
        m.link = officialLink;
        m.is_official = true;
        rescuedCount++;
      } else {
        console.log(`   ❌ Still no official link for ${m.name}. Marked for search.`);
        m.is_official = false;
      }
    } catch (e) {
      console.log(`   ⚠️ Failed to load detail page.`);
    } finally {
      await page.close();
    }
    
    // 10개마다 저장
    if (rescuedCount % 10 === 0) {
      fs.writeFileSync('src/data/marathons.json', JSON.stringify(marathons, null, 2));
    }
  }

  fs.writeFileSync('src/data/marathons.json', JSON.stringify(marathons, null, 2));
  console.log(`
🎉 Mission Accomplished: ${rescuedCount} official links rescued.`);
  await browser.close();
}

sourceRescue();
