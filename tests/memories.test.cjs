const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const context=vm.createContext({window:{}});
for(const file of ['content.js','memories.js','places.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../dist',file),'utf8'),context);
const {MW_CONTENT:content,MW_MEMORIES:memories,MW_PLACES:atlas}=context.window;
test('Anthology has five months, 40 unique memories and 200 literal quotes',()=>{
  assert.equal(memories.months.length,5);
  assert.equal(memories.items.length,40);
  assert.equal(new Set(memories.items.map(m=>m.id)).size,40);
  assert.equal(memories.items.reduce((n,m)=>n+m.quotes.length,0),200);
  for(const memory of memories.items){
    assert.ok(memories.months.some(m=>memory.date.startsWith(m.key)));
    assert.ok(memory.quotes.every(q=>['W','M'].includes(q.who)&&q.text&&/^\d{2}:\d{2}$/.test(q.time)));
    assert.ok(!/(wxid_|aeskey|<msg|1[3-9]\d{9}|\d+号楼|\d+单元)/i.test(JSON.stringify(memory)));
  }
});
test('Original confirmed meetings remain intact and map to correct cities',()=>{
  for(const who of ['W','M']){
    assert.equal(atlas.locate(who,'2026-05-31',content.events).place,'beijing');
    assert.equal(atlas.locate(who,'2026-07-17',content.events).place,'hangzhou');
    assert.equal(atlas.locate(who,'2026-09-25',content.events).place,'beijing');
  }
});
test('Xinjiang coincidence is not a meeting; nine September shows actual arrival',()=>{
  assert.equal(atlas.locate('W','2026-06-17',content.events).place,'xinjiang');
  assert.equal(atlas.locate('M','2026-06-17',content.events).place,'korla');
  assert.ok(!content.events.some(e=>e.kind==='meeting'&&e.startDate<='2026-06-17'&&e.endDate>='2026-06-17'));
  assert.equal(atlas.locate('M','2026-09-09',content.events).exact,true);
  assert.equal(atlas.locate('M','2026-09-09',content.events).place,'korla');
  assert.equal(atlas.locate('W','2026-09-09',content.events).exact,false);
});
test('Gaps and future dates never become invented current positions',()=>{
  assert.equal(atlas.locate('M','2026-05-18',content.events),null);
  assert.equal(atlas.locate('M','2026-12-20',content.events),null);
  const stale=atlas.locate('W','2026-09-29',content.events);
  assert.equal(stale.date,'2026-09-27');assert.equal(stale.exact,false);
  const sameDayReturn=atlas.locate('W','2026-08-30',content.events);
  assert.equal(sameDayReturn.place,'hangzhou');assert.equal(sameDayReturn.exact,true);
});
test('Every city projects inside the local map',()=>{
  for(const place of Object.values(atlas.places)){
    const [x,y]=atlas.project(place.lon,place.lat);assert.ok(x>=0&&x<=720&&y>=0&&y<=400);
  }
});
test('Root and canonical entry load all files locally, in the same order',()=>{
  const root=path.join(__dirname,'..');
  for(const entry of ['index.html','dist/index.html']){
    const html=fs.readFileSync(path.join(root,entry),'utf8');
    const sources=[...html.matchAll(/<script src="([^"]+)"/g)].map(m=>m[1]);
    assert.equal(sources.length,5);
    for(const source of sources)assert.ok(fs.existsSync(path.resolve(root,path.dirname(entry),source)));
    assert.ok(html.indexOf('id="calendar"')<html.indexOf('id="stories"'));
  }
});
