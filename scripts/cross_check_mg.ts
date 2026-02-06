import fs from 'fs';

function crossCheck() {
  const ourData = JSON.parse(fs.readFileSync('src/data/marathons.json', 'utf8'));
  const mgText = fs.readFileSync('src/data/mg_final_text.txt', 'utf8');
  
  console.log('🔍 Cross-Checking: MarathonGo vs. Our DB...');
  
  const lines = mgText.split('\n').filter(l => l.trim() !== '');
  const discoveredNames: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // 날짜 패턴 (00.00) 매칭
    if (/^\d{2}\.\d{2}/.test(line)) {
      const potentialName = lines[i+1];
      if (potentialName && potentialName.length > 5) {
        discoveredNames.push(potentialName.trim());
      }
    }
  }

  const uniqueMgNames = Array.from(new Set(discoveredNames));
  console.log(`📡 MarathonGo shows ${uniqueMgNames.length} events.`);

  const missingEvents: string[] = [];
  uniqueMgNames.forEach(name => {
    const exists = ourData.find((m: any) => 
      m.name.includes(name) || name.includes(m.name)
    );
    if (!exists) {
      missingEvents.push(name);
    }
  });

  console.log(`\n✨ Found ${missingEvents.length} NEW potential events!`);
  missingEvents.slice(0, 10).forEach(e => console.log(`   - [NEW] ${e}`));

  fs.writeFileSync('src/data/missing_events.json', JSON.stringify(missingEvents, null, 2));
}

crossCheck();