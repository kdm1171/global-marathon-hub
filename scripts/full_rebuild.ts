import { chromium } from 'playwright';
import fs from 'fs';

async function fullRebuild() {
  console.log('🏗️ Full-Scale Data Conquest: Fetching 180+ Official Links...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto('http://www.roadrun.co.kr/schedule/list.php', { waitUntil: 'networkidle' });
    
    const listItems = await page.evaluate(() => {
      const results: any[] = [];
      const rows = Array.from(document.querySelectorAll('tr'));
      rows.forEach(row => {
        const cells = Array.from(row.querySelectorAll('td'));
        if (cells.length >= 4) {
          const dateText = cells[0].textContent?.trim() || '';
          if (dateText.includes('/') && dateText.includes('(')) {
            const nameAnchor = cells[1].querySelector('a');
            const roadrunId = nameAnchor?.getAttribute('href')?.match(/no=(\d+)/)?.[1];
            if (nameAnchor && roadrunId) {
              results.push({
                date: dateText,
                name: nameAnchor.textContent?.trim(),
                location: cells[2].textContent?.trim(),
                organizer: cells[3].textContent?.trim(),
                roadrun_id: roadrunId
              });
            }
          }
        }
      });
      return results;
    });

    console.log(`📡 Found ${listItems.length} marathons. Starting Deep Scrape...`);

    const finalData = [];
    const chunks = [];
    for (let i = 0; i < listItems.length; i += 10) {
      chunks.push(listItems.slice(i, i + 10));
    }

    for (const chunk of chunks) {
      await Promise.all(chunk.map(async (item: any) => {
        const p = await context.newPage();
        try {
          await p.goto(`http://www.roadrun.co.kr/schedule/view.php?no=${item.roadrun_id}`, { waitUntil: 'domcontentloaded', timeout: 10000 });
          const officialLink = await p.evaluate(() => {
            const anchors = Array.from(document.querySelectorAll('a[href^="http"]'));
            const home = anchors.find(a => {
              const h = (a as HTMLAnchorElement).href;
              return !h.includes('roadrun.co.kr') && !h.includes('javascript') && !h.includes('facebook') && !h.includes('instagram');
            });
            return home ? home.href : null;
          });

          finalData.push({
            id: finalData.length + 1,
            name: item.name,
            date: item.date,
            location: item.location,
            organizer: item.organizer,
            status: '접수중',
            link: officialLink || `http://www.roadrun.co.kr/schedule/view.php?no=${item.roadrun_id}`,
            is_official: !!officialLink
          });
          console.log(`   ✅ Link Secured: ${item.name}`);
        } catch (e) {
          console.log(`   ⚠️ Link Failed: ${item.name}`);
        } finally {
          await p.close();
        }
      }));
    }

    fs.writeFileSync('src/data/marathons.json', JSON.stringify(finalData, null, 2));
    console.log(`\n🎉 Database Conquest Complete. ${finalData.length} entries saved.`);

  } catch (err) {
    console.error('Conquest failed:', err);
  } finally {
    await browser.close();
  }
}

fullRebuild();
