import { chromium } from 'playwright';
import fs from 'fs';

async function discoverMara1080() {
  console.log('🏁 Starting Keyword-Based Mara1080 Discovery...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto('https://mara1080.com/', { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(5000); 

    const discoveredEvents = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('a[href*="/event/"]'));
      return cards.map(card => {
        const href = (card as HTMLAnchorElement).href;
        const fullText = (card as HTMLElement).innerText || '';
        const lines = fullText.split('\n').filter(l => l.trim() !== '');
        const name = lines[0] || '';
        let status = '접수중';
        if (fullText.includes('마감')) status = '접수마감';
        else if (fullText.includes('예정')) status = '접수예정';
        return { name, url: href, status };
      });
    });

    console.log(`✅ Found ${discoveredEvents.length} events on Platform.`);
    
    const registryPath = 'src/data/source_registry.json';
    const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));

    let updatedCount = 0;
    discoveredEvents.forEach(evt => {
      if (!evt.name) return;

      // 1. 이름에서 핵심 키워드 추출 (연도, 회차, 공백 제거)
      const coreKeyword = evt.name
        .replace(/202[56]/g, '')
        .replace(/제\d+회/g, '')
        .replace(/마라톤|대회/g, '')
        .trim();

      if (coreKeyword.length < 2) return;

      // 2. 레지스트리에서 이 키워드를 포함하는 대회 찾기
      const match = registry.find((r: any) => 
        r.name && r.name.includes(coreKeyword)
      );

      if (match) {
        console.log(`   ✨ Keyword Match: "${coreKeyword}" -> ${match.name}`);
        match.url = evt.url;
        match.status = 'analyzed';
        match.engine = 'mara1080';
        updatedCount++;
      }
    });

    fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2));
    console.log(`\n🚀 Final Sync Complete. ${updatedCount} links secured via Keyword.`);

  } catch (err) {
    console.error('Discovery failed:', err);
  } finally {
    await browser.close();
  }
}

discoverMara1080();
