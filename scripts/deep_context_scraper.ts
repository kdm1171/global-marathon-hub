import { chromium } from 'playwright';
import fs from 'fs';

async function deepContextScrape() {
  console.log('🕵️ Deep Context Scraper: Navigating Official Sites...');
  const marathons = JSON.parse(fs.readFileSync('src/data/marathons.json', 'utf8'));
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();

  const finalData = [];

  for (const m of marathons) {
    if (!m.link.startsWith('http')) {
      finalData.push(m);
      continue;
    }

    console.log(`
🌐 Deep Browsing: ${m.name} (${m.link})`);
    const page = await context.newPage();
    try {
      await page.goto(m.link, { waitUntil: 'networkidle', timeout: 30000 });
      
      // 1. 내부 핵심 링크 찾기 (대회안내, 코스, 요강 등)
      const subLinks = await page.evaluate(() => {
        const anchors = Array.from(document.querySelectorAll('a'));
        const keywords = ['안내', '요강', '코스', '신청', '개요'];
        return anchors
          .filter(a => keywords.some(k => a.innerText.includes(k)))
          .map(a => a.href)
          .slice(0, 3); // 상위 3개 핵심 페이지만 방문
      });

      console.log(`   - Found Sub-pages: ${subLinks.length}`);

      let combinedText = await page.evaluate(() => document.body.innerText);

      // 2. 서브 페이지 순회하며 텍스트 통합
      for (const sub of subLinks) {
        try {
          const subPage = await context.newPage();
          await subPage.goto(sub, { waitUntil: 'domcontentloaded', timeout: 10000 });
          const txt = await subPage.evaluate(() => document.body.innerText);
          combinedText += `

--- Page: ${sub} ---
` + txt;
          await subPage.close();
        } catch (e) {}
      }

      // 3. 지능형 데이터 추출 (Regex + Context Analysis)
      const extractInfo = (text: string) => {
        const info: any = {};
        
        // 참가비 (숫자 + 원 패턴)
        const feeMatch = text.match(/([\d,]+원)/);
        info.fee = feeMatch ? feeMatch[1] : null;

        // 시간 (00:00 패턴)
        const timeMatch = text.match(/(\d{1,2}:\d{2})/);
        info.start_time = timeMatch ? timeMatch[1] : null;

        // 종목 (풀, 하프, 10km 등)
        const types = [];
        if (text.includes('풀코스') || text.includes('Full')) types.push('Full');
        if (text.includes('하프') || text.includes('Half')) types.push('Half');
        if (text.includes('10km')) types.push('10km');
        if (text.includes('5km')) types.push('5km');
        info.race_types = types.length > 0 ? types : null;

        return info;
      };

      const extracted = extractInfo(combinedText);

      // 4. 데이터 보정 및 병합
      finalData.push({
        ...m,
        fee: extracted.fee || m.fee || '상세문의',
        start_time: extracted.start_time || m.start_time || '09:00',
        race_types: extracted.race_types || m.race_types || ['10km']
      });

      console.log(`   ✨ Synthesis Result: Fee(${extracted.fee}), Time(${extracted.start_time}), Types(${extracted.race_types?.join(',')})`);

    } catch (err) {
      console.log(`   ⚠️ Main site failed. Keeping old data.`);
      finalData.push(m);
    } finally {
      await page.close();
    }

    // 중간 저장
    if (finalData.length % 5 === 0) {
      fs.writeFileSync('src/data/marathons.json', JSON.stringify(finalData, null, 2));
    }
  }

  fs.writeFileSync('src/data/marathons.json', JSON.stringify(finalData, null, 2));
  await browser.close();
}

deepContextScrape();
