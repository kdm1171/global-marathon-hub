import { chromium } from 'playwright';
import fs from 'fs';

async function enhancedDeepScrape() {
  console.log('🕵️ Launching Enhanced Deep-Dive Scraper...');
  const marathonsPath = 'src/data/marathons.json';
  const marathons = JSON.parse(fs.readFileSync(marathonsPath, 'utf8'));
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();

  for (let m of marathons) {
    if (!m.link || !m.link.startsWith('http')) continue;

    console.log(`\n🌐 Deep Investigating: ${m.name}`);
    const page = await context.newPage();
    try {
      await page.goto(m.link, { waitUntil: 'networkidle', timeout: 20000 });
      
      const subLinks = await page.evaluate(() => {
        const anchors = Array.from(document.querySelectorAll('a'));
        const infoKeywords = ['안내', '개요', '요강', '일정'];
        const regKeywords = ['신청', '접수', '등록'];
        
        const info = anchors
          .filter(a => infoKeywords.some(k => a.innerText.includes(k)))
          .map(a => a.href).filter(h => h && h.startsWith('http'));
          
        const reg = anchors
          .filter(a => regKeywords.some(k => a.innerText.includes(k)))
          .map(a => a.href).filter(h => h && h.startsWith('http'));

        return { infoLinks: [...new Set(info)], regLinks: [...new Set(reg)] };
      });

      let eventDate = null;
      let regRange = { start: null, end: null };

      for (const link of subLinks.infoLinks.slice(0, 2)) {
        try {
          const sp = await context.newPage();
          await sp.goto(link, { waitUntil: 'domcontentloaded', timeout: 10000 });
          const text = await sp.evaluate(() => document.body.innerText);
          const match = text.match(/(?:일시|개최|대회일)[^\d]*(\d{4}[.\-/]\d{1,2}[.\-/]\d{1,2})/);
          if (match) eventDate = match[1].replace(/[./]/g, '-');
          await sp.close();
          if (eventDate) break;
        } catch (e) {}
      }

      for (const link of subLinks.regLinks.slice(0, 2)) {
        try {
          const sp = await context.newPage();
          await sp.goto(link, { waitUntil: 'domcontentloaded', timeout: 10000 });
          const text = await sp.evaluate(() => document.body.innerText);
          const rangeMatch = text.match(/(?:접수|신청)[^\d]*(\d{4}[.\-/]\d{1,2}[.\-/]\d{1,2})\s*~\s*(\d{4}[.\-/]\d{1,2}[.\-/]\d{1,2})/);
          if (rangeMatch) {
            regRange.start = rangeMatch[1].replace(/[./]/g, '-');
            regRange.end = rangeMatch[2].replace(/[./]/g, '-');
          }
          await sp.close();
          if (regRange.end) break;
        } catch (e) {}
      }

      if (eventDate) {
        console.log(`   ✨ [EVENT DATE] ${eventDate}`);
        m.date = eventDate;
      }
      if (regRange.start && regRange.end) {
        console.log(`   ✨ [REG PERIOD] ${regRange.start} ~ ${regRange.end}`);
        m.reg_start = regRange.start;
        m.reg_end = regRange.end;
      }

    } catch (err) {
      console.log(`   ⚠️ Failed: ${m.name}`);
    } finally {
      await page.close();
    }
    fs.writeFileSync(marathonsPath, JSON.stringify(marathons, null, 2));
  }

  await browser.close();
  console.log('🎉 Done.');
}

enhancedDeepScrape();