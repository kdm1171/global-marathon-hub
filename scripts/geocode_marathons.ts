import axios from 'axios';
import fs from 'fs';
import path from 'path';

const KAKAO_KEY = 'b4f079fede3fa7119fec14dc26ee8be9';

async function geocodeMarathons() {
  console.log('🌍 Starting Full-Scale Geocoding Operation...');
  const marathonsPath = 'src/data/marathons.json';
  const marathons = JSON.parse(fs.readFileSync(marathonsPath, 'utf8'));

  let successCount = 0;
  let failCount = 0;

  for (const m of marathons) {
    // 이미 좌표가 있고 정확하다면 스킵 (필요 시 주석 해제)
    // if (m.lat && m.lng) continue;

    const address = m.location_full || m.location;
    if (!address || address === '전국' || address === '별도공지') {
      console.log(`   ⏩ Skipping ambiguous location: ${m.name} (${address})`);
      continue;
    }

    try {
      // 1. 주소 검색 시도
      const response = await axios.get('https://dapi.kakao.com/v2/local/search/address.json', {
        params: { query: address.split('(')[0].trim() },
        headers: { Authorization: `KakaoAK ${KAKAO_KEY}` }
      });

      let result = response.data.documents[0];

      // 2. 주소 검색 실패 시 장소(키워드) 검색으로 재시도
      if (!result) {
        const keywordResponse = await axios.get('https://dapi.kakao.com/v2/local/search/keyword.json', {
          params: { query: address.split('(')[0].trim() },
          headers: { Authorization: `KakaoAK ${KAKAO_KEY}` }
        });
        result = keywordResponse.data.documents[0];
      }

      if (result) {
        m.lat = parseFloat(result.y);
        m.lng = parseFloat(result.x);
        m.formatted_address = result.address_name || result.road_address_name;
        successCount++;
        console.log(`   ✅ Geocoded: ${m.name} -> ${m.lat}, ${m.lng}`);
      } else {
        failCount++;
        console.log(`   ❌ Failed to find location: ${m.name} (${address})`);
      }
    } catch (e) {
      console.error(`   ⚠️ API Error for ${m.name}:`, (e as any).message);
    }

    // 10개마다 중간 저장 및 API 과부하 방지 대기
    if (successCount % 10 === 0) {
      fs.writeFileSync(marathonsPath, JSON.stringify(marathons, null, 2));
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  fs.writeFileSync(marathonsPath, JSON.stringify(marathons, null, 2));
  console.log(`
🎉 Geocoding Complete!`);
  console.log(`📊 Success: ${successCount}, Failed: ${failCount}`);
}

geocodeMarathons();
