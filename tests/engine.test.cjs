const {test}=require('node:test'),assert=require('node:assert/strict');
const {FarmGame,seeded}=require('../engine.js'),config=require('../config.js');
function fixture(n=4){const g=new FarmGame({...config,initialRight:n},seeded(42));g.next=Infinity;return g;}
function advance(g,t){for(let x=0;x<t;x+=.01)g.update(.01);}
test('成功+1、失敗0、脱走-1と一度だけの計上',()=>{for(const [kind,delta] of [['normal',1],['fail',0],['escape',-1]]){const g=fixture();g.spawn(kind);advance(g,4);assert.equal(g.net,delta);assert.equal(g.events.length,1);advance(g,5);assert.equal(g.events.length,1);assert.equal(g.right.length,4+delta);}});
test('失敗は全軌道で柵の手前、脱走は右から左',()=>{const g=fixture();let s=g.spawn('fail');for(let t=0;t<3;t+=.01){s.age=t;assert.ok(g.pose(s).x<431-30);}g.active=[];s=g.spawn('escape');s.age=0;assert.ok(g.pose(s).x>450);s.age=s.approach+s.jump;assert.ok(g.pose(s).x<450);});
test('同時3匹と脱走予約は在籍数を超えない',()=>{const g=fixture(1);assert.ok(g.spawn('escape',0));assert.equal(g.spawn('escape',1),null);g.spawn('normal',1);g.spawn('fail',2);advance(g,4);assert.equal(g.net,0);assert.equal(g.right.length,1);assert.equal(new Set(g.events.map(e=>e.id)).size,3);});
test('60秒で新規停止、進行中は完了まで待つ',()=>{const g=fixture();g.time=59.9;g.spawn('normal');g.update(.2);assert.equal(g.finished,false);assert.equal(g.events.length,0);advance(g,4);assert.equal(g.finished,true);assert.equal(g.net,1);assert.equal(g.queue.length,0);});
test('100固定シードで保存則、終了、リセットを検証',()=>{for(let seed=0;seed<100;seed++){const g=new FarmGame(config,seeded(seed));advance(g,66);assert.ok(g.finished);assert.equal(g.right.length,4+g.net);assert.equal(g.events.reduce((a,e)=>a+e.delta,0),g.net);g.reset();assert.equal(g.net,0);assert.equal(g.active.length,0);assert.equal(g.time,0);assert.equal(g.right.length,4);}});
test('右への移動完了前は同じIDを脱走させない',()=>{const g=fixture(0);const s=g.spawn('normal');advance(g,s.approach+s.jump+.02);assert.equal(g.right.length,1);assert.equal(g.spawn('escape',1),null);advance(g,1);assert.ok(g.spawn('escape',1));});
