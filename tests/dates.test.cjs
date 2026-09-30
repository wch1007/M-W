const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const scope=vm.createContext({window:{}});
for(const name of ['dates.js','content.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../dist',name),'utf8'),scope);
const {MW_CONTENT:data,MW_DATES:dates}=scope.window;
test('All supplied stories are present, with only confirmed meeting days counted',()=>{
  assert.equal(data.events.length,15);
  const days=dates.expandDays(data.events.filter(e=>e.kind==='meeting'));
  assert.equal(days.size,21);
  for(const key of ['2026-07-31','2026-08-01','2026-08-02','2026-09-24','2026-09-25','2026-09-26'])assert.ok(days.has(key));
  for(const key of ['2026-05-18','2026-08-19','2026-09-09'])assert.ok(!days.has(key));
});
test('Overlapping date ranges count a day only once',()=>{
  assert.equal(dates.expandDays([{startDate:'2026-07-31',endDate:'2026-08-02'},{startDate:'2026-08-01',endDate:'2026-08-03'}]).size,4);
});
test('Together clock uses China midnight, rolls over correctly, and never goes negative',()=>{
  const elapsed=now=>JSON.parse(JSON.stringify(dates.elapsed('2026-05-18',Date.parse(now))));
  assert.deepEqual(elapsed('2026-05-18T00:00:00+08:00'),{days:0,hours:0,minutes:0,seconds:0});
  assert.deepEqual(elapsed('2026-09-29T00:00:00+08:00'),{days:134,hours:0,minutes:0,seconds:0});
  assert.deepEqual(elapsed('2026-09-28T15:59:59Z'),{days:133,hours:23,minutes:59,seconds:59});
  assert.deepEqual(elapsed('2026-09-29T16:00:00Z'),{days:135,hours:0,minutes:0,seconds:0});
  assert.deepEqual(elapsed('2026-05-17T00:00:00+08:00'),{days:0,hours:0,minutes:0,seconds:0});
});
