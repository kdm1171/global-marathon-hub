import { chromium, devices } from 'playwright';
import fs from 'fs';

async function stealthScrape() {
  console.log('🕶️ Deploying Stealth Scraper to MarathonGo...');
  
  // iPhone 13 Pro 환경 모사
  const iPhone = devices['iPhone 13 Pro'];
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    ...iPhone,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
    viewport: { width: 390, height: 844 },
    locale: 'ko-KR',
    timezoneId: 'Asia/Seoul'
  });

  const page = await context.newPage();

  try {
    // 1. 메인 페이지 먼저 방문 (쿠키 확보 및 일반 사용자 행동 위장)
    await page.goto('https://marathongo.co.kr/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // 2. 일정 페이지로 이동
    console.log('🔗 Navigating to Schedule List...');
    await page.goto('https://marathongo.co.kr/schedule/list', { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(5000);

    // 3. 스크린샷 캡처 (실제 화면이 뜨는지 확인용)
    await page.screenshot({ path: 'mg_check.png' });

    // 4. 강제 텍스트 덤프 (최후의 수단)
    const rawContent = await page.content();
    fs.writeFileSync('src/data/mg_raw_page.html', rawContent);
    
    const textData = await page.evaluate(() => document.body.innerText);
    console.log(`📄 Captured Page Text Length: ${textData.length}`);
    
    if (textData.includes('마라톤')) {
      console.log('✅ FOUND MARATHON KEYWORD!');
      fs.writeFileSync('src/data/mg_final_text.txt', textData);
    } else {
      console.log('❌ Keyword not found. Bot detected or content hidden.');
    }

  } catch (err) {
    console.error('Stealth failed:', err);
  } finally {
    await browser.close();
  }
}

stealthScrape();
