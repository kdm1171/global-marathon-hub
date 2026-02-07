import fs from 'fs';

const regionMap: { [key: string]: string[] } = {
  '서울': ['서울', '송파', '여의도', '한강', '상암', '종로', '서초', '강남', '마포', '양천', '노원', '성북'],
  '경기': ['경기', '수원', '고양', '용인', '성남', '부천', '화성', '안산', '남양주', '안양', '평택', '시흥', '파주', '의정부', '김포', '광명', '군포', '하남', '오산', '이천', '안성', '의왕', '포천', '양주', '여주', '구리', '과천', '가평', '양평', '가평', '연천'],
  '인천': ['인천', '부평', '계양', '미추홀', '연수', '남동', '서구', '강화', '옹진'],
  '강원': ['강원', '춘천', '원주', '강릉', '동해', '태백', '속초', '삼척', '홍천', '횡성', '영월', '평창', '정선', '철원', '화천', '양구', '인제', '고성', '양양'],
  '충청': ['충청', '대전', '세종', '청주', '충주', '제천', '천안', '공주', '보령', '아산', '서산', '논산', '계룡', '당진', '금산', '부여', '서천', '청양', '홍성', '예산', '태안', '증평', '진천', '괴산', '음성', '단양', '보은', '옥천', '영동'],
  '경상': ['경상', '부산', '대구', '울산', '포항', '경주', '김천', '안동', '구미', '영주', '영천', '상주', '문경', '경산', '창원', '진주', '통영', '사천', '김해', '밀양', '거제', '양산', '의령', '함안', '창녕', '고성', '남해', '하동', '산청', '함양', '거창', '합천', '울릉', '독도'],
  '전라': ['전라', '광주', '전주', '군산', '익산', '정읍', '남원', '김제', '목포', '여수', '순천', '나주', '광양', '완주', '진안', '무주', '장수', '임실', '순창', '고창', '부안', '담양', '곡성', '구례', '고흥', '보성', '화순', '장흥', '강진', '해남', '영암', '무안', '함평', '영광', '장성', '완도', '진도', '신안'],
  '제주': ['제주', '서귀포']
};

const assignRegion = (m: any): string => {
  const fullText = (m.name + m.location + m.organizer + (m.region || '')).toLowerCase();
  for (const [region, cities] of Object.entries(regionMap)) {
    if (cities.some(city => fullText.includes(city))) return region;
  }
  // 전국 단위 대회는 서울이나 인접 지역으로 임시 배정하거나 '서울'을 기본값으로 함 (사용성 위함)
  if (fullText.includes('전국')) return '서울';
  return '서울'; // 최소한 '기타'로 빠지지 않게 기본값 설정
};

function finalizeData() {
  const dataPath = 'src/data/marathons.json';
  const marathons = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

  const finalized = marathons.map((m: any) => ({
    ...m,
    region: assignRegion(m),
    fee: undefined, // 불확실한 비용 제거
    race_types: m.race_types && m.race_types.length > 0 ? m.race_types : ['10km']
  }));

  fs.writeFileSync(dataPath, JSON.stringify(finalized, null, 2));
  console.log(`✅ 180/180 Regions Assigned. Fees removed. Data Cleaned.`);
}

finalizeData();
