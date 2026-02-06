import { chromium, BrowserContext, Page } from 'playwright';
import fs from 'fs';

// --- 전략 인터페이스 ---
interface ScrapeStrategy {
  name: string;
  canHandle(engine: string): boolean;
  scrape(page: Page, site: any): Promise<{ status: string; link?: string } | null>;
}

// 1. 일반 사이트 전략 (Selector 기반)
class StandardStrategy implements ScrapeStrategy {
  name = 'Standard';
  canHandle(engine: string) { return ['imweb', 'wordpress', 'custom'].includes(engine); }
  async scrape(page: Page, site: any) {
    if (!site.selector) return null;
    await page.goto(site.url, { waitUntil: 'networkidle', timeout: 20000 });
    const text = await page.evaluate((sel) => document.querySelector(sel)?.textContent?.trim(), site.selector);
    if (!text) return null;
    
    if (text.includes('마감') || text.includes('종료')) return { status: '접수마감' };
    if (text.includes('접수중') || text.includes('신청')) return { status: '접수중' };
    return { status: '접수예정' };
  }
}

// 2. 전마협 전략 (API Sniffing 모사)
class Mara1080Strategy implements ScrapeStrategy {
  name = 'Mara1080';
  canHandle(engine: string) { return engine === 'mara1080'; }
  async scrape(page: Page, site: any) {
    // API를 직접 호출하는 방식으로 모사 (UUID 기반)
    const eventId = site.url.split('/').pop();
    const apiUrl = `https://user-api.mara1080.com/api/v1/public/event/${eventId}/guide/overview`;
    
    try {
      const response = await page.request.get(apiUrl);
      const data = await response.json();
      return {
        status: data.status === 'CLOSED' ? '접수마감' : '접수중'
      };
    } catch (e) { return null; }
  }
}

// 3. 마라톤고 전략 (신규 소스 교차 검증)
class MarathonGoStrategy implements ScrapeStrategy {
  name = 'MarathonGo';
  canHandle(engine: string) { return engine === 'marathongo'; }
  async scrape(page: Page, site: any) {
    // MarathonGo는 나중에 리스트 교차 검증용으로 확장 가능
    return null;
  }
}

// --- 메인 파이프라인 가동기 ---
async function runPipeline() {
  console.log('🚀 NoHuman Autonomous Pipeline v2.0 Starting...');
  const registry = JSON.parse(fs.readFileSync('src/data/source_registry.json', 'utf8'));
  const marathons = JSON.parse(fs.readFileSync('src/data/marathons.json', 'utf8'));
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  
  const strategies: ScrapeStrategy[] = [new StandardStrategy(), new Mara1080Strategy()];
  let updates = 0;

  for (const site of registry) {
    const strategy = strategies.find(s => strategy.canHandle(site.engine));
    if (!strategy) continue;

    console.log(`📡 [${strategy.name}] Syncing: ${site.name}`);
    const page = await context.newPage();
    try {
      const result = await strategy.scrape(page, site);
      if (result) {
        const m = marathons.find((m: any) => m.id === site.id);
        if (m && m.status !== result.status) {
          console.log(`   ✨ Updated: ${m.status} -> ${result.status}`);
          m.status = result.status;
          updates++;
        }
      }
    } catch (e) {
      console.log(`   ⚠️ Failed.`);
    } finally {
      await page.close();
    }
  }

  if (updates > 0) {
    fs.writeFileSync('src/data/marathons.json', JSON.stringify(marathons, null, 2));
    console.log(`✅ Pipeline Success: ${updates} changes applied.`);
  } else {
    console.log('😴 Everything up to date.');
  }

  await browser.close();
}

runPipeline();
