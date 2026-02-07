import { chromium } from 'playwright';
import fs from 'fs';

// --- 지능형 지역 매핑 테이블 ---
const regionMap: { [key: string]: string } = {
  '서울': '서울', '인천': '인천', '경기': '경기', '강원': '강원', '제주': '제주', '세종': '세종',
  '부산': '경상', '대구': '경상', '울산': '경상', '경북': '경상', '경남': '경상',
  '대전': '충청', '충북': '충청', '충남': '충청',
  '광주': '전라', '전북': '전라', '전남': '전라'
};

const cityToRegion = (text: string): string => {
  for (const [city, region] of Object.entries(regionMap)) {
    if (text.includes(city)) return region;
  }
  // 추가 키워드 매핑
  if (text.includes('수원') || text.includes('고양') || text.includes('부천')) return '경기';
  if (text.includes('금산') || text.includes('청주') || text.includes('무주')) return '충청';
  if (text.includes('밀양') || text.includes('창원') || text.includes('경주')) return '경상';
  if (text.includes('나주') || text.includes('순천') || text.includes('여수')) return '전라';
  return '기타';
};

async function sanitizeData() {
  console.log('🧪 Starting Advanced Sanitization (Region Mapping & Year Fix)...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto('http://www.roadrun.co.kr/schedule/list.php', { waitUntil: 'networkidle' });
    
    const listItems = await page.evaluate(() => {
      const results: any[] = [];
      const rows = Array.from(document.querySelectorAll('tr'));
      rows.forEach(row => {
        const cells = Array.from(row.querySelectorAll('td'));
        if (cells.length >= 4) {
          const dateText = cells[0].textContent?.trim() || '';
          if (dateText.includes('/') && dateText.includes('(')) {
            const nameAnchor = cells[1].querySelector('a');
            const roadrunId = nameAnchor?.getAttribute('href')?.match(/no=(\d+)/)?.[1];
            if (nameAnchor && roadrunId) {
              results.push({
                rawDate: dateText,
                name: nameAnchor.textContent?.trim(),
                location: cells[2].textContent?.trim(),
                organizer: cells[3].textContent?.trim(),
                roadrun_id: roadrunId
              });
            }
          }
        }
      });
      return results;
    });

    const finalData = [];
    for (const item of listItems) {
      // 1. 연도 추출: 이름에서 2026이나 2025를 먼저 찾음
      let year = '2026'; // 기본값
      const yearMatch = item.name.match(/202[4567]/);
      if (yearMatch) {
        year = yearMatch[0];
      } else {
        // 이름에 없으면 날짜를 보고 추정 (1, 2월은 2026년으로 간주)
        const month = parseInt(item.rawDate.split('/')[0]);
        year = month <= 2 ? '2026' : '2025';
      }

      const [month, day] = item.rawDate.split('(')[0].split('/');
      const normalizedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

      // 2. 지능형 지역 할당
      const region = cityToRegion(item.name + item.location + item.organizer);

      finalData.push({
        id: finalData.length + 1,
        name: item.name,
        date: normalizedDate,
        location: item.location,
        region: region,
        distance: 'Multi', // 상세 스킵 (속도와 정확도를 위해)
        organizer: item.organizer,
        status: '접수중',
        link: `http://www.roadrun.co.kr/schedule/view.php?no=${item.roadrun_id}`
      });
    }

    fs.writeFileSync('src/data/marathons.json', JSON.stringify(finalData, null, 2));
    console.log(`✅ ${finalData.length} entries sanitized with intelligent mapping.`);

  } catch (err) {
    console.error(err);
  } finally {
    await browser.close();
  }
}

sanitizeData();