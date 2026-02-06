import { chromium } from 'playwright';
import fs from 'fs';

async function sniffMara1080() {
  console.log('🕵️ Sniffing ALL Mara1080 API Streams...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  let counter = 0;
  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('api/v1') && response.status() === 200) {
      try {
        const data = await response.json();
        const filename = `src/data/mara_api_${counter++}.json`;
        fs.writeFileSync(filename, JSON.stringify(data, null, 2));
        console.log(`📦 Captured: ${filename} (${url.substring(0, 60)}...)`);
      } catch (e) {}
    }
  });

  try {
    await page.goto('https://mara1080.com/', { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(10000); 
    console.log(`🔍 Total ${counter} API streams captured.`);
  } catch (err) {
    console.error('Sniffing failed:', err);
  } finally {
    await browser.close();
  }
}

sniffMara1080();