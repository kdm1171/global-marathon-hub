import fs from 'fs';

function syncRegistry() {
  const marathons = JSON.parse(fs.readFileSync('src/data/marathons.json', 'utf8'));
  const registryPath = 'src/data/source_registry.json';
  
  let registry: any[] = [];
  if (fs.existsSync(registryPath)) {
    registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
  }

  const existingUrls = new Set(registry.map(r => r.url));
  let added = 0;

  marathons.forEach((m: any) => {
    // 로드런이 아닌 진짜 공식 홈페이지가 있는 경우만 등록
    if (m.link && !m.link.includes('roadrun.co.kr')) {
      if (!existingUrls.has(m.link)) {
        registry.push({
          id: m.id,
          name: m.name,
          url: m.link,
          engine: 'unknown',
          selector: null,
          status: 'pending',
          last_analyzed: null
        });
        added++;
      }
    }
  });

  fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2));
  console.log(`📦 Registry Manager: ${added} new sources added. Total managed: ${registry.length}`);
}

syncRegistry();