import { chromium } from 'playwright';
import fs from 'fs';

interface SiteConfig {
  marathon_id: number;
  official_url: string;
  engine?: string;
  status_selector?: string;
  last_analyzed: string;
}

async function analyzeSourceSites() {
  console.log('🧠 Starting Meta-Analysis of Official Sites...');
  const marathons = JSON.parse(fs.readFileSync('src/data/marathons.json', 'utf8'));
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const registry: SiteConfig[] = [];

  // 우선 상위 20개 사이트에 대해 메타 분석 실시
  for (const m of marathons.slice(0, 20)) {
    if (!m.link || m.link.includes('roadrun.co.kr')) continue;

    console.log(`
🌐 Analyzing: ${m.name} (${m.link})`);
    try {
      await page.goto(m.link, { waitUntil: 'networkidle', timeout: 15000 });
      const content = await page.content();

      // 메타 분석 로직: 사이트 성격 파악
      const meta = await page.evaluate(() => {
        const html = document.documentElement.innerHTML;
        let engine = 'custom';
        if (html.includes('imweb')) engine = 'imweb';
        if (html.includes('wp-content')) engine = 'wordpress';
        if (html.includes('notion')) engine = 'notion';

        // '접수' 관련 텍스트가 포함된 요소 찾기 (Heuristic)
        const keywords = ['접수중', '신청하기', '접수마감', '마감', '신청마감'];
        let foundSelector = '';
        
        // 버튼이나 강조된 텍스트 위주로 검색
        const elements = Array.from(document.querySelectorAll('a, button, span, div, em, strong'));
        for (const el of elements) {
          const text = el.textContent?.trim() || '';
          if (keywords.some(k => text.includes(k)) && text.length < 20) {
            // 셀렉터 경로 생성 (단순화)
            foundSelector = el.tagName.toLowerCase();
            if (el.className) foundSelector += `.${String(el.className).split(' ')[0]}`;
            break; 
          }
        }

        return { engine, foundSelector };
      });

      console.log(`   - Engine: ${meta.engine}`);
      console.log(`   - Found Potential Selector: ${meta.foundSelector}`);

      registry.push({
        marathon_id: m.id,
        official_url: m.link,
        engine: meta.engine,
        status_selector: meta.foundSelector,
        last_analyzed: new Date().toISOString()
      });

    } catch (err) {
      console.log(`   ⚠️ Failed to analyze: ${m.link}`);
    }
  }

  fs.writeFileSync('src/data/source_registry.json', JSON.stringify(registry, null, 2));
  console.log(`
🚀 Meta-Analysis Complete. Registry saved.`);
  await browser.close();
}

analyzeSourceSites();
