import { chromium } from 'playwright';
import fs from 'fs';

async function deepScrapeRoadrun() {
  console.log('🚀 Starting Full-Scale Deep Scraper (180+ sites)...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();

  try {
    const page = await context.newPage();
    await page.goto('http://www.roadrun.co.kr/schedule/list.php', { waitUntil: 'networkidle' });
    
    const marathonItems = await page.evaluate(() => {
      const anchors = Array.from(document.querySelectorAll('a[href*="view.php?no="]'));
      return anchors.map(a => {
        const match = a.getAttribute('href')?.match(/no=(\d+)/);
        return match ? { id: match[1], name: a.textContent?.trim() } : null;
      }).filter(item => item !== null && item.name !== '');
    });

    console.log(`Found ${marathonItems.length} marathons to check.`);
    const finalLinks: any[] = [];

    // 병렬 처리를 위한 청크 분할 (동시 5개씩)
    const chunks = [];
    for (let i = 0; i < marathonItems.length; i += 5) {
      chunks.push(marathonItems.slice(i, i + 5));
    }

    for (const chunk of chunks) {
      await Promise.all(chunk.map(async (item: any) => {
        const p = await context.newPage();
        try {
          await p.goto(`http://www.roadrun.co.kr/schedule/view.php?no=${item.id}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
          const officialLink = await p.evaluate(() => {
            const links = Array.from(document.querySelectorAll('a[href^="http"]'));
            const home = links.find(a => {
              const h = (a as HTMLAnchorElement).href;
              return !h.includes('roadrun.co.kr') && !h.includes('javascript');
            });
            return home ? (home as HTMLAnchorElement).href : null;
          });

          if (officialLink) {
            console.log(`✅ [${item.id}] ${item.name} -> ${officialLink}`);
            finalLinks.push({ id: item.id, name: item.name, official_link: officialLink });
          }
        } catch (e) {
          console.log(`❌ [${item.id}] Failed to load`);
        } finally {
          await p.close();
        }
      }));
    }

    fs.writeFileSync('src/data/marathons_official_links.json', JSON.stringify(finalLinks, null, 2));
    console.log(`\n🎉 Finished! Saved ${finalLinks.links} official links.`);

  } catch (err) {
    console.error('Full scrape failed:', err);
  } finally {
    await browser.close();
  }
}

deepScrapeRoadrun();