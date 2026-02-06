import fs from 'fs';
import path from 'path';

function mergeLinks() {
  const marathonsPath = path.join(process.cwd(), 'src/data/marathons.json');
  const linksPath = path.join(process.cwd(), 'src/data/marathons_official_links.json');

  const marathons = JSON.parse(fs.readFileSync(marathonsPath, 'utf8'));
  const links = JSON.parse(fs.readFileSync(linksPath, 'utf8'));

  let updatedCount = 0;

  const updatedMarathons = marathons.map((m: any) => {
    // 1. 공백 및 특수문자 제거하여 비교군 생성
    const cleanMain = m.name.replace(/[^가-힣a-zA-Z0-9]/g, '');
    
    // 2. 가장 유사한 링크 찾기
    const match = links.find((l: any) => {
      if (!l.name) return false;
      const cleanScrape = l.name.replace(/[^가-힣a-zA-Z0-9]/g, '');
      
      // 한쪽이 다른 한쪽을 포함하거나, 핵심 키워드(대회명)가 겹치는 경우
      return cleanMain.includes(cleanScrape) || cleanScrape.includes(cleanMain);
    });

    if (match && match.official_link) {
      updatedCount++;
      return { ...m, link: match.official_link };
    }
    return m;
  });

  fs.writeFileSync(marathonsPath, JSON.stringify(updatedMarathons, null, 2));
  console.log(`✅ Power Match Complete: ${updatedCount} marathons updated.`);
}

mergeLinks();
