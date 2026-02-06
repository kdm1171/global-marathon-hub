import fs from 'fs';
import path from 'path';

function integrateMara() {
  const marathonsPath = 'src/data/marathons.json';
  const registryPath = 'src/data/source_registry.json';
  const marathons = JSON.parse(fs.readFileSync(marathonsPath, 'utf8'));
  const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));

  // 전마협 API 데이터들 (2번과 3번 위주)
  const api2 = JSON.parse(fs.readFileSync('src/data/mara_api_2.json', 'utf8'));
  const api3 = JSON.parse(fs.readFileSync('src/data/mara_api_3.json', 'utf8'));

  const maraEvents: any[] = [];

  // File 2 분석 (월별 데이터)
  Object.values(api2).forEach((monthEvents: any) => {
    if (Array.isArray(monthEvents)) {
      monthEvents.forEach(e => {
        maraEvents.push({
          id: e.eventId,
          name: e.eventNameKr.replace(/\(신규\)|\(취소\)|\[대회취소\]/g, '').trim(),
          status: e.status === 'CLOSED' ? '접수마감' : '접수중',
          url: `https://mara1080.com/event/${e.eventId}`
        });
      });
    }
  });

  // File 3 분석 (배너 데이터)
  api3.forEach((e: any) => {
    maraEvents.push({
      id: e.eventId,
      name: e.title,
      status: '접수중', // 배너는 보통 활성 대회
      url: `https://mara1080.com/event/${e.eventId}`
    });
  });

  console.log(`💡 Extracted ${maraEvents.length} distinct events from Mara1080 API.`);

  let updateCount = 0;
  maraEvents.forEach(me => {
    // 우리 DB에서 이름으로 찾기 (유연한 매칭)
    const match = marathons.find((m: any) => 
      m.name.includes(me.name) || me.name.includes(m.name)
    );

    if (match) {
      console.log(`   ✅ Matched: ${match.name} -> ${me.url} [${me.status}]`);
      match.link = me.url;
      match.status = me.status;
      match.is_official = true;
      updateCount++;

      // Registry 정보도 업데이트 (자율 운영용)
      const regMatch = registry.find((r: any) => r.id === match.id);
      if (regMatch) {
        regMatch.url = me.url;
        regMatch.engine = 'mara1080';
        regMatch.status = 'analyzed';
      }
    }
  });

  fs.writeFileSync(marathonsPath, JSON.stringify(marathons, null, 2));
  fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2));
  console.log(`
🚀 Integration Complete. ${updateCount} marathons secured with direct API data.`);
}

integrateMara();
