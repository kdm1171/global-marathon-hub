import { chromium } from 'playwright';
import fs from 'fs';

async function pulseUpdate() {
  console.log('💓 Starting Pulse Update: Syncing live status...');
  const registry = JSON.parse(fs.readFileSync('src/data/source_registry.json', 'utf8'));
  const marathons = JSON.parse(fs.readFileSync('src/data/marathons.json', 'utf8'));
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();

  let updateCount = 0;

  for (const site of registry) {
    if (site.status !== 'analyzed' || !site.selector) continue;

    console.log(`📡 Checking: ${site.name}`);
    const page = await context.newPage();
    try {
      await page.goto(site.url, { waitUntil: 'networkidle', timeout: 20000 });
      
      const liveText = await page.evaluate((sel) => {
        const el = document.querySelector(sel);
        return el ? el.textContent?.trim() : null;
      }, site.selector);

      if (liveText) {
        console.log(`   - Live Text: ${liveText}`);
        
        // 상태 매핑 로직 (Heuristic)
        let newStatus = '';
        if (liveText.includes('마감') || liveText.includes('종료')) newStatus = '접수마감';
        else if (liveText.includes('접수중') || liveText.includes('신청하기')) newStatus = '접수중';
        else if (liveText.includes('예정')) newStatus = '접수예정';

        if (newStatus) {
          const marathon = marathons.find((m: any) => m.id === site.id);
          if (marathon && marathon.status !== newStatus) {
            console.log(`   ✨ Status Change: ${marathon.status} -> ${newStatus}`);
            marathon.status = newStatus;
            updateCount++;
          }
        }
      }
    } catch (err) {
      console.log(`   ⚠️ Failed to reach site.`);
    } finally {
      await page.close();
    }
  }

  if (updateCount > 0) {
    fs.writeFileSync('src/data/marathons.json', JSON.stringify(marathons, null, 2));
    console.log(`
✅ Database Updated. ${updateCount} statuses changed.`);
  } else {
    console.log('
😴 No status changes detected today.');
  }

  await browser.close();
}

pulseUpdate();
