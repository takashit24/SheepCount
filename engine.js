/* DOMから独立した状態機械。カウントは jump → exit（着地）の一度だけ。 */
(function(root){
function seeded(seed){let a=seed>>>0;return()=>{a+=0x6D2B79F5;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
class FarmGame{
 constructor(config,random=Math.random){this.config=config;this.random=random;this.reset();}
 reset(){this.time=0;this.net=0;this.next=0.8;this.id=0;this.right=Array.from({length:this.config.initialRight},()=>++this.id);this.active=[];this.queue=[];this.events=[];this.finished=false;}
 range(a,b){return a+(b-a)*this.random();}
 choose(stage){let n=this.random()*Object.values(stage.weights).reduce((a,b)=>a+b,0);for(const [k,v] of Object.entries(stage.weights)){n-=v;if(n<0)return k;}return 'normal';}
 spawn(kind,lane=0){if(this.active.some(s=>s.lane===lane))return null;const available=this.right.findIndex(id=>!this.active.some(s=>s.id===id));if(kind==='escape'&&available<0)return null;const id=kind==='escape'?this.right.splice(available,1)[0]:++this.id;const speed=this.range(.88,1.12)*(kind==='escape'?.85:1);const sheep={id,kind,lane,age:0,approach:.95*speed,jump:.85*speed,exit:.8*speed,counted:false,state:'approach'};this.active.push(sheep);return sheep;}
 update(dt){if(this.finished)return;this.time+=dt;if(this.time<this.config.duration){if(this.time>=this.next){const stage=this.config.stages.find(s=>this.time<s.until)||this.config.stages.at(-1);const size=Math.floor(this.range(stage.burst[0],stage.burst[1]+1));for(let i=0;i<size;i++)this.queue.push({at:this.time+i*.42,kind:this.choose(stage)});this.next=this.time+this.range(...stage.interval);}
 while(this.queue.length&&this.queue[0].at<=this.time){const lane=[0,1,2].find(l=>!this.active.some(s=>s.lane===l));if(lane===undefined)break;const event=this.queue.shift();this.spawn(event.kind==='escape'&&!this.right.some(id=>!this.active.some(s=>s.id===id))?'normal':event.kind,lane);}}
 else this.queue=[];
 for(const s of this.active){s.age+=dt;const land=s.approach+s.jump;s.state=s.age<s.approach?'approach':s.age<land?'jump':'exit';if(s.age>=land&&!s.counted){s.counted=true;if(s.kind==='normal'){this.net++;this.right.push(s.id);}else if(s.kind==='escape')this.net--;this.events.push({id:s.id,kind:s.kind,time:this.time,delta:s.kind==='normal'?1:s.kind==='escape'?-1:0});}}
 this.active=this.active.filter(s=>s.age<s.approach+s.jump+s.exit);if(this.time>=this.config.duration&&!this.active.length)this.finished=true;
 }
 pose(s){const dir=s.kind==='escape'?-1:1, start=dir===1?-65:965, fenceX=414+s.lane*40, near=fenceX-dir*115, far=fenceX+dir*115;const ground=330+s.lane*51;let x,y=ground,rotation=0;
 if(s.age<s.approach){const p=s.age/s.approach;x=start+(near-start)*(p*p*(3-2*p));y-=Math.abs(Math.sin(p*25))*5;}
 else if(s.age<s.approach+s.jump){const p=(s.age-s.approach)/s.jump;if(s.kind==='fail'){x=near+65*Math.sin(Math.PI*p);y-=48*Math.sin(Math.PI*p);rotation=-.3*Math.sin(Math.PI*p);}else{x=near+(far-near)*p;y-=145*4*p*(1-p);rotation=dir*.12*Math.sin(p*Math.PI*2);}}
 else{const p=Math.min(1,(s.age-s.approach-s.jump)/s.exit);const from=s.kind==='fail'?near:far;const target=s.kind==='fail'?-65:dir===1?965:-65;x=from+(target-from)*p;y-=Math.abs(Math.sin(p*20))*4;}
 return{x,y,dir:s.kind==='fail'&&s.age>s.approach+s.jump/2?-1:dir,rotation};}
}
root.FarmGame=FarmGame;root.seeded=seeded;if(typeof module!=='undefined')module.exports={FarmGame,seeded};
})(typeof window!=='undefined'?window:globalThis);
