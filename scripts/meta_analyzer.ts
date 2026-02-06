import { chromium } from 'playwright';
import fs from 'fs';

async function metaAnalyze() {
  console.log('🧪 Starting Intelligent Meta-Analysis...');
  const registryPath = 'src/data/source_registry.json';
  const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });

  // 분석이 필요한(pending) 사이트만 추출
  const pendingSites = registry.filter((s: any) => s.status === 'pending' || s.status === 'failed');
  console.log(`Targeting ${pendingSites.length} sites for analysis.`);

  for (const site of pendingSites) {
    console.log(`🔍 Analyzing: ${site.name} (${site.url})`);
    const page = await context.newPage();
    
    try {
      await page.goto(site.url, { waitUntil: 'networkidle', timeout: 30000 });
      
      const analysis = await page.evaluate(() => {
        const html = document.documentElement.innerHTML.toLowerCase();
        let engine: any = 'custom';
        if (html.includes('imweb')) engine = 'imweb';
        else if (html.includes('wp-content')) engine = 'wordpress';
        else if (html.includes('notion.so')) engine = 'notion';

        // 상태 추출용 셀렉터 탐색 (접수, 신청, 마감 키워드 기반)
        const keywords = ['접수', '신청', '마감', '등록'];
        const elements = Array.from(document.querySelectorAll('a, button, span, strong, b'));
        
        let bestSelector = '';
        for (const el of elements) {
          const text = el.textContent?.trim() || '';
          if (keywords.some(k => text.includes(k)) && text.length < 15) {
            // 정밀한 셀렉터 생성을 위해 ID나 고유 클래스 탐색
            if (el.id) {
              bestSelector = `#${el.id}`;
            } else if (el.className) {
              const firstClass = String(el.className).split(' ')[0];
              if (firstClass && !firstClass.includes(':')) {
                bestSelector = `${el.tagName.toLowerCase()}.${firstClass}`;
              }
            }
            if (bestSelector) break;
          }
        }
        return { engine, bestSelector };
      });

      site.engine = analysis.engine;
      site.selector = analysis.bestSelector;
      site.status = 'analyzed';
      site.last_checked = new Date().toISOString();
      console.log(`   ✅ Success: [${analysis.engine}] Selector: ${analysis.bestSelector}`);

    } catch (err) {
      console.log(`   ❌ Failed to load site.`);
      site.status = 'failed';
    } finally {
      await page.close();
    }
    
    // 중간 저장 (안정성)
    fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2));
  }

  await browser.close();
  console.log('🚀 Meta-Analysis Round Complete.');
}

metaAnalyze();
