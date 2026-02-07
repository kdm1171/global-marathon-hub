import { chromium } from 'playwright';
import fs from 'fs';

async function ultimateParse() {
  console.log('💎 Starting Ultimate Data Conquest...');
  const marathonsPath = 'src/data/marathons.json';
  const marathons = JSON.parse(fs.readFileSync(marathonsPath, 'utf8'));
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();

  for (let m of marathons) {
    const isComplete = m.fee && !m.fee.includes('안내') && !m.fee.includes('문의') && 
                       m.start_time && m.start_time !== '별도공지' &&
                       m.race_types && !m.race_types.includes('기타');
    
    if (isComplete && m.is_official) continue;

    console.log(`\n🎯 TARGET: ${m.name}`);
    const page = await context.newPage();
    try {
      if (!m.link || !m.link.startsWith('http')) throw new Error('No link');
      await page.goto(m.link, { waitUntil: 'networkidle', timeout: 20000 });
      
      const siteData = await page.evaluate(() => {
        const keywords = ['요강', '안내', '정보', '신청', '코스'];
        const links = Array.from(document.querySelectorAll('a'))
          .filter(a => keywords.some(k => a.innerText.includes(k)))
          .map(a => a.href);
        return { text: document.body.innerText, links };
      });

      const extract = (text: string) => {
        const res: any = {};
        const fee = text.match(/([\d,]{4,6}원)/);
        res.fee = fee ? fee[0] : null;
        const time = text.match(/(\d{1,2}:\d{2})/);
        res.start_time = time ? time[0] : null;
        const types = [];
        if (text.includes('풀코스')) types.push('Full');
        if (text.includes('하프')) types.push('Half');
        if (text.includes('10km')) types.push('10km');
        if (text.includes('5km')) types.push('5km');
        res.race_types = types.length > 0 ? types : null;
        return res;
      };

      let result = extract(siteData.text);

      if (!result.fee || !result.race_types) {
        for (const sub of siteData.links.slice(0, 2)) {
          try {
            const sp = await context.newPage();
            await sp.goto(sub, { waitUntil: 'domcontentloaded', timeout: 10000 });
            const st = await sp.evaluate(() => document.body.innerText);
            const se = extract(st);
            if (se.fee) result.fee = se.fee;
            if (se.race_types) result.race_types = se.race_types;
            await sp.close();
          } catch (e) {}
        }
      }

      if (result.fee) m.fee = result.fee;
      if (result.start_time) m.start_time = result.start_time;
      if (result.race_types) m.race_types = result.race_types;
      
      console.log(`   ✨ SYNC: Fee(${m.fee}), Time(${m.start_time}), Types(${m.race_types?.join(',')})`);

    } catch (e) {
      console.log(`   ⚠️ Failed to penetrate.`);
    } finally {
      await page.close();
    }
    fs.writeFileSync(marathonsPath, JSON.stringify(marathons, null, 2));
  }

  await browser.close();
  console.log('🎉 Round Complete.');
}

ultimateParse();