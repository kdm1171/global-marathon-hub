import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function deepScrapeRoadrun() {
  console.log('🔍 Starting Deep-Dive Scraper on Roadrun...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const finalAssets: any[] = [];

  try {
    // 1. 리스트 페이지 접속
    await page.goto('http://www.roadrun.co.kr/schedule/list.php', { waitUntil: 'networkidle' });
    console.log('List page loaded.');

    // 2. 리스트에서 상세 페이지 링크들 추출 (no=... 패턴)
    const detailLinks = await page.evaluate(() => {
      const anchors = Array.from(document.querySelectorAll('a[href*="view.php?no="]'));
      return anchors.map(a => (a as HTMLAnchorElement).href);
    });

    console.log(`Found ${detailLinks.length} detail pages to analyze.`);

    // 3. 각 상세 페이지 진입하여 '원천 데이터' 추출 (자산화)
    for (const link of detailLinks.slice(0, 10)) { // 우선 상위 10개 테스트
      await page.goto(link, { waitUntil: 'domcontentloaded' });
      
      const detail = await page.evaluate(() => {
        const title = document.querySelector('.view_title')?.textContent?.trim();
        const infoTable = document.querySelector('.view_table');
        const rows = Array.from(infoTable?.querySelectorAll('tr') || []);
        
        const info: any = {};
        rows.forEach(row => {
          const th = row.querySelector('th')?.textContent?.trim();
          const td = row.querySelector('td')?.textContent?.trim();
          if (th && td) info[th] = td;
        });

        return {
          title,
          ...info,
          source_url: window.location.href,
          captured_at: new Date().toISOString()
        };
      });

      console.log(`✅ Asset Captured: ${detail.title}`);
      finalAssets.push(detail);
    }

    // 4. 자산 저장
    const outPath = 'src/data/marathons_assets.json';
    fs.writeFileSync(outPath, JSON.stringify(finalAssets, null, 2));
    console.log(`🚀 Successfully archived ${finalAssets.length} deep assets.`);

  } catch (err) {
    console.error('Deep scrape failed:', err);
  } finally {
    await browser.close();
  }
}

deepScrapeRoadrun();
