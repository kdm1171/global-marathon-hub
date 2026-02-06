import { chromium } from 'playwright';
import fs from 'fs';

async function targetScrape() {
  const marathons = JSON.parse(fs.readFileSync('src/data/marathons.json', 'utf8'));
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  let updated = 0;

  for (const m of marathons) {
    // 검색어 정제: '2026 ', '(...)', '제...회' 등 노이즈 제거
    const query = m.name
      .replace(/2026|2025/g, '')
      .replace(/\(.*\)/g, '')
      .replace(/제\d+회/g, '')
      .trim();

    console.log(`🔍 Searching Core: "${query}" (from ${m.name})`);
    
    try {
      await page.goto(`http://www.roadrun.co.kr/schedule/list.php?keyfield=all&key=${encodeURIComponent(query)}`, { waitUntil: 'networkidle' });
      
      const detailLink = await page.evaluate(() => {
        const anchor = document.querySelector('a[href*="view.php?no="]');
        return anchor ? (anchor as HTMLAnchorElement).href : null;
      });

      if (detailLink) {
        await page.goto(detailLink, { waitUntil: 'domcontentloaded' });
        const officialLink = await page.evaluate(() => {
          const links = Array.from(document.querySelectorAll('a[href^="http"]'));
          const home = links.find(a => {
            const h = (a as HTMLAnchorElement).href;
            return !h.includes('roadrun.co.kr') && !h.includes('javascript') && !h.includes('facebook') && !h.includes('instagram');
          });
          return home ? (home as HTMLAnchorElement).href : null;
        });

        if (officialLink) {
          console.log(`✅ FOUND: ${officialLink}`);
          m.link = officialLink;
          updated++;
        }
      }
    } catch (err) {
      console.log(`❌ Skipped: ${query}`);
    }
  }

  fs.writeFileSync('src/data/marathons.json', JSON.stringify(marathons, null, 2));
  console.log(`🚀 Total Updated: ${updated} marathons.`);
  await browser.close();
}

targetScrape();