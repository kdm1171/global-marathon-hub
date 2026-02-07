import axios from 'axios';
import fs from 'fs';

const REST_API_KEY = '6793651913743f59b1e0947971a61924';

async function runGeocoding() {
  console.log('🚀 Starting High-Precision Geocoding with REST API...');
  const marathonsPath = 'src/data/marathons.json';
  const marathons = JSON.parse(fs.readFileSync(marathonsPath, 'utf8'));

  let success = 0;
  let fail = 0;

  for (const m of marathons) {
    const address = m.location_full || m.location;
    if (!address || address === '전국' || address === '별도공지') continue;

    try {
      // 1. 주소 정밀 검색 (괄호 등 노이즈 제거)
      const cleanAddr = address.split('(')[0].split('~')[0].trim();
      const response = await axios.get('https://dapi.kakao.com/v2/local/search/address.json', {
        params: { query: cleanAddr },
        headers: { Authorization: `KakaoAK ${REST_API_KEY}` }
      });

      let result = response.data.documents[0];

      // 2. 주소 검색 실패 시 키워드(장소) 검색으로 재시도
      if (!result) {
        const kwResponse = await axios.get('https://dapi.kakao.com/v2/local/search/keyword.json', {
          params: { query: cleanAddr },
          headers: { Authorization: `KakaoAK ${REST_API_KEY}` }
        });
        result = kwResponse.data.documents[0];
      }

      if (result) {
        m.lat = parseFloat(result.y);
        m.lng = parseFloat(result.x);
        m.formatted_address = result.address_name;
        success++;
        console.log(`   ✅ [${success}] ${m.name} -> ${m.lat}, ${m.lng}`);
      } else {
        fail++;
        console.log(`   ❌ [FAIL] ${m.name} (${cleanAddr})`);
      }
    } catch (e: any) {
      console.error(`   ⚠️ API Error: ${e.response?.status || e.message}`);
      if (e.response?.status === 401) {
        console.log('🚨 API Key is invalid. Stopping operation.');
        break;
      }
    }

    // 과부하 방지 및 중간 저장
    if (success % 10 === 0) {
      fs.writeFileSync(marathonsPath, JSON.stringify(marathons, null, 2));
      await new Promise(r => setTimeout(resolve => r(resolve), 50));
    }
  }

  fs.writeFileSync(marathonsPath, JSON.stringify(marathons, null, 2));
  console.log(`
🎉 Geocoding Finished. Success: ${success}, Fail: ${fail}`);
}

runGeocoding();
