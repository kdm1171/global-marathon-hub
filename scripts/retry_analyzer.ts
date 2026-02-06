import { chromium } from 'playwright';
import fs from 'fs';

async function retryAnalyze() {
  console.log('🛡️ Starting Hard-Scraper for Failed Sites...');
  const registryPath = 'src/data/source_registry.json';
  const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
  
  const failedSites = registry.filter((s: any) => s.status === 'failed');
  console.log(`Retrying ${failedSites.length} sites with advanced settings.`);

  const browser = await chromium.launch({ headless: true });
  // 고급 설정: SSL 에러 무시 + 모바일 뷰포트 모사 (차단 우회)
  const context = await browser.newContext({
    ignoreHTTPSErrors: true,
    viewport: { width: 375, height: 812 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1'
  });

  for (const site of failedSites) {
    console.log(`
🕵️ Re-Analyzing: ${site.name}`);
    const page = await context.newPage();
    
    try {
      // 대기 시간을 넉넉히 주어 노션 등의 무거운 페이지 대응
      await page.goto(site.url, { waitUntil: 'networkidle', timeout: 45000 });
      await page.waitForTimeout(5000); // 렌더링 추가 대기

      const analysis = await page.evaluate(() => {
        const html = document.documentElement.innerHTML.toLowerCase();
        let engine = 'unknown';
        if (html.includes('notion')) engine = 'notion';
        if (html.includes('imweb')) engine = 'imweb';
        if (html.includes('mara1080')) engine = 'mara1080';

        // 노션의 경우 특정 클래스 패턴 탐색
        const elements = Array.from(document.querySelectorAll('div, span, a, button'));
        let bestSelector = '';
        const keywords = ['접수', '마감', '신청', '등록'];

        for (const el of elements) {
          const text = el.textContent?.trim() || '';
          if (keywords.some(k => text.includes(k)) && text.length < 20) {
            // 노션은 보통 div 내부에 텍스트가 깊게 박힘
            bestSelector = el.tagName.toLowerCase();
            if (el.className) bestSelector += `.${String(el.className).split(' ')[0]}`;
            break;
          }
        }
        return { engine, bestSelector };
      });

      site.engine = analysis.engine;
      site.selector = analysis.selector || analysis.bestSelector;
      site.status = 'analyzed';
      console.log(`   ✨ [RETRY SUCCESS] Engine: ${analysis.engine}, Selector: ${analysis.bestSelector}`);

    } catch (err) {
      console.log(`   💀 Still Failed: ${site.url}`);
      site.status = 'permanent_failure';
    } finally {
      await page.close();
    }
    
    fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2));
  }

  await browser.close();
}

retryAnalyze();
