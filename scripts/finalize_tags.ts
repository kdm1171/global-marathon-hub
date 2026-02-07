import fs from 'fs';

function finalizeTags() {
  const dataPath = 'src/data/marathons.json';
  const marathons = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const updated = marathons.map((m: any) => {
    // 유효하지 않은 날짜(00월 등) 보정
    let safeDateStr = m.date;
    if (safeDateStr.includes('-00-')) safeDateStr = safeDateStr.replace('-00-', '-01-');
    
    const compDate = new Date(safeDateStr);
    if (isNaN(compDate.getTime())) {
      console.log(`⚠️ Invalid date for ${m.name}: ${m.date}`);
      return m;
    }

    // 1. 접수 종료일(reg_end) 보정
    if (!m.reg_end) {
      const fallbackEnd = new Date(compDate);
      fallbackEnd.setDate(fallbackEnd.getDate() - 10);
      m.reg_end = fallbackEnd.toISOString().split('T')[0];
    }

    // 2. 접수 시작일(reg_start) 보정
    if (!m.reg_start) {
      const fallbackStart = new Date(new Date(m.reg_end));
      fallbackStart.setDate(fallbackStart.getDate() - 40);
      m.reg_start = fallbackStart.toISOString().split('T')[0];
    }

    // 3. 4단계 상태 판별
    const regStart = new Date(m.reg_start);
    const regEnd = new Date(m.reg_end);

    let status = '접수중';
    if (now > compDate) status = '대회종료';
    else if (now > regEnd) status = '접수마감';
    else if (now < regStart) status = '접수전';

    return { ...m, status, date: safeDateStr };
  });

  fs.writeFileSync(dataPath, JSON.stringify(updated, null, 2));
  console.log('✅ All Marathons tagged with 4-stage logic.');
}

finalizeTags();