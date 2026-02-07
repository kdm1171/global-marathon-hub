import { chromium } from 'playwright';
import fs from 'fs';

const regionMap: { [key: string]: string } = {
  '서울': '서울', '인천': '인천', '경기': '경기', '강원': '강원', '제주': '제주', '세종': '세종',
  '부산': '경상', '대구': '경상', '울산': '경상', '경북': '경상', '경남': '경상',
  '대전': '충청', '충북': '충청', '충남': '충청',
  '광주': '전라', '전북': '전라', '전남': '전라',
  '포항': '경상', '구미': '경상', '경주': '경상', '밀양': '경상', '창원': '경상',
  '수원': '경기', '용인': '경기', '고양': '경기', '화성': '경기', '성남': '경기',
  '청주': '충청', '천안': '충청', '아산': '충청', '충주': '충청', '금산': '충청',
  '전주': '전라', '나주': '전라', '여수': '전라', '순천': '전라', '목포': '전라'
};

const getRegion = (text: string) => {
  for (const [k, v] of Object.entries(regionMap)) {
    if (text.includes(k)) return v;
  }
  return '기타';
};

const getRaceTypes = (text: string) => {
  const types = [];
  if (text.toLowerCase().includes('full') || text.includes('풀')) types.push('Full');
  if (text.toLowerCase().includes('half') || text.includes('하프')) types.push('Half');
  if (text.includes('10km') || text.includes('10k')) types.push('10km');
  if (text.includes('5km') || text.includes('5k')) types.push('5km');
  if (text.includes('20km')) types.push('20km');
  return types.length > 0 ? types : ['기타'];
};

async function superParse() {
  console.log('🚀 Starting Super-Parser...');
  const marathons = JSON.parse(fs.readFileSync('src/data/marathons.json', 'utf8'));
  const browser = await chromium.launch({ headless: true });
  
  const finalData = [];
  const context = await browser.newContext();

  for (let i = 0; i < marathons.length; i += 5) {
    const chunk = marathons.slice(i, i + 5);
    await Promise.all(chunk.map(async (m: any) => {
      const p = await context.newPage();
      try {
        const roadrunId = m.link.match(/no=(\d+)/)?.[1];
        if (!roadrunId) { finalData.push(m); return; }

        await p.goto(`http://www.roadrun.co.kr/schedule/view.php?no=${roadrunId}`, { waitUntil: 'domcontentloaded', timeout: 10000 });
        
        const details = await p.evaluate(() => {
          const tds = Array.from(document.querySelectorAll('td'));
          const res: any = {};
          for (let j = 0; j < tds.length; j++) {
            const txt = tds[j].innerText.replace(/\s/g, '');
            if (txt === '지역') res.region = tds[j+1]?.innerText.trim();
            if (txt === '종목') res.courses = tds[j+1]?.innerText.trim();
            if (txt === '참가비') res.fee = tds[j+1]?.innerText.trim();
            if (txt === '장소') res.loc = tds[j+1]?.innerText.trim();
            if (txt === '대회시간') res.time = tds[j+1]?.innerText.trim();
          }
          return res;
        });

        finalData.push({
          ...m,
          region: getRegion(m.name + m.location + (details.region || '')),
          race_types: getRaceTypes(details.courses || ''),
          fee: details.fee || '무료/유료',
          location_full: details.loc || m.location,
          start_time: details.time || '별도공지'
        });
        console.log(`   ✅ Enriched: ${m.name}`);
      } catch (e) {
        finalData.push(m);
      } finally {
        await p.close();
      }
    }));
    fs.writeFileSync('src/data/marathons.json', JSON.stringify(finalData.sort((a,b)=>a.id-b.id), null, 2));
  }

  await browser.close();
  console.log('🎉 Done.');
}

superParse();