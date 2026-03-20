import { useState, useEffect, useCallback, useRef } from "react";
import bgmUrl from "./daiboukenBGM.mp3";

const STAT_CAPS={hp:99,atk:30,def:30,mag:30,res:30,spd:30};
const MAX_LV=20,PURSUIT=5,MAX_ITEMS=3;
const SN={hp:"HP",atk:"攻撃",def:"防御",mag:"魔法",res:"抵抗",spd:"速さ"};
const BC={
  youkun:{id:"youkun",name:"ようくん",cls:"魔法使い",icon:"🧙",bs:{hp:18,atk:3,def:2,mag:8,res:6,spd:5},gr:{hp:2.5,atk:0.6,def:0.5,mag:1.6,res:1.0,spd:1.0},mov:3,rng:[1,2],at:"mag",canCC:false,wp:{name:"魔法の杖",atk:0,mag:2}},
  soukun:{id:"soukun",name:"そうくん",cls:"戦士",icon:"🤺",bs:{hp:25,atk:8,def:6,mag:2,res:3,spd:4},gr:{hp:3.0,atk:1.5,def:1.2,mag:0.3,res:0.5,spd:0.8},mov:4,rng:[1,1],at:"phys",canCC:false,wp:{name:"鉄の剣",atk:3,mag:0}},
  batta:{id:"batta",name:"バッタ",cls:"虫",icon:"🦗",bs:{hp:20,atk:6,def:4,mag:3,res:4,spd:7},gr:{hp:2.2,atk:1.2,def:0.8,mag:0.5,res:0.8,spd:1.5},mov:5,rng:[1,1],at:"phys",canCC:true,ccLv:20,ccTo:"kamakiri",wp:{name:"鋭い脚",atk:2,mag:0}},
};
const CC_D={
  kamakiri:{id:"kamakiri",name:"カマキリ",cls:"カマキリ",icon:"🗡️",bs:{hp:20,atk:6,def:4,mag:3,res:4,spd:7},gr:{hp:2.8,atk:1.8,def:1.0,mag:0.5,res:0.8,spd:1.2},mov:5,rng:[1,1],at:"phys",canCC:false,wp:{name:"鎌",atk:5,mag:0}},
  aisearchrobo:{id:"aisearchrobo",name:"AI搭載ロボ",cls:"AIロボ",icon:"🦾",bs:{hp:22,atk:7,def:8,mag:1,res:5,spd:3},gr:{hp:3.0,atk:1.5,def:1.5,mag:1.0,res:1.2,spd:0.5},mov:4,rng:[1,2],at:"phys",canCC:false,wp:{name:"ビームキャノン",atk:6,mag:3}},
  kiba:{id:"kiba",name:"騎馬兵",cls:"騎馬兵",icon:"🐴",bs:{hp:24,atk:7,def:5,mag:4,res:4,spd:5},gr:{hp:2.8,atk:1.5,def:1.0,mag:1.0,res:0.8,spd:1.5},mov:6,rng:[1,1],at:"phys",canCC:false,wp:{name:"ランス",atk:6,mag:0}},
  same:{id:"same",name:"サメ",cls:"サメ",icon:"🦈",bs:{hp:30,atk:5,def:9,mag:2,res:7,spd:2},gr:{hp:3.5,atk:1.8,def:1.5,mag:0.5,res:1.0,spd:0.8},mov:4,rng:[1,1],at:"phys",canCC:false,wp:{name:"鋭い牙",atk:7,mag:0}},
  keseran2:{id:"keseran2",name:"ケセランII",cls:"精霊",icon:"🌟",bs:{hp:15,atk:4,def:3,mag:7,res:6,spd:8},gr:{hp:2.0,atk:0.8,def:0.5,mag:1.8,res:1.5,spd:1.5},mov:5,rng:[1,2],at:"mag",canCC:true,ccLv:20,ccTo:"keseran2",wp:{name:"星の輝き",atk:0,mag:6}},
};
const RC={
  guardrobo:{id:"guardrobo",name:"ガードロボ",cls:"ロボット",icon:"🤖",bs:{hp:22,atk:7,def:8,mag:1,res:5,spd:3},gr:{hp:2.8,atk:1.2,def:1.5,mag:0.5,res:1.0,spd:0.5},mov:3,rng:[1,1],at:"phys",canCC:true,ccLv:20,ccTo:"aisearchrobo",wp:{name:"アームハンマー",atk:4,mag:0},rc:[{s:"youkun"}],hint:"ようくんなら再起動できそうだ"},
  otona6:{id:"otona6",name:"おとな6",cls:"大人",icon:"👨",bs:{hp:24,atk:7,def:5,mag:4,res:4,spd:5},gr:{hp:2.5,atk:1.3,def:1.0,mag:0.8,res:0.8,spd:1.2},mov:4,rng:[1,1],at:"phys",canCC:true,ccLv:20,ccTo:"kiba",wp:{name:"棍棒",atk:3,mag:0},rc:[{s:"youkun"},{s:"soukun"}],hint:"ようくん→そうくんの順で話しかけよう"},
  kame3:{id:"kame3",name:"カメ3",cls:"カメ",icon:"🐢",bs:{hp:30,atk:5,def:9,mag:2,res:7,spd:2},gr:{hp:3.5,atk:0.8,def:1.8,mag:0.3,res:1.5,spd:0.3},mov:3,rng:[1,1],at:"phys",canCC:true,ccLv:20,ccTo:"same",wp:{name:"甲羅アタック",atk:3,mag:0},rc:[{s:"any"}],hint:"誰かに話しかけられるのを待っている"},
  keseran:{id:"keseran",name:"ケセランパサラン",cls:"妖精",icon:"✨",bs:{hp:15,atk:4,def:3,mag:7,res:6,spd:8},gr:{hp:2.0,atk:0.8,def:0.5,mag:1.5,res:1.2,spd:1.5},mov:4,rng:[1,2],at:"mag",canCC:true,ccLv:20,ccTo:"keseran2",wp:{name:"風の粒",atk:0,mag:4},rc:[{s:"kamakiri"},{s:"soukun"}],hint:"カマキリ→そうくんの順で話しかけよう"},
};
const ET={
  tonbo:{n:"トンボ",i:"🪰",s:{hp:12,atk:6,def:3,mag:2,res:3,spd:8},mv:4,rn:[1,1],at:"phys",xp:8},kaeru:{n:"カエル",i:"🐸",s:{hp:18,atk:8,def:5,mag:3,res:4,spd:4},mv:3,rn:[1,1],at:"phys",xp:10},hachi:{n:"ハチ",i:"🐝",s:{hp:10,atk:10,def:2,mag:4,res:3,spd:10},mv:5,rn:[1,1],at:"phys",xp:12},otona:{n:"おとな",i:"👤",s:{hp:22,atk:9,def:7,mag:5,res:5,spd:5},mv:4,rn:[1,1],at:"phys",xp:15},guardrobo_e:{n:"ガードロボ",i:"🤖",s:{hp:28,atk:7,def:10,mag:2,res:6,spd:3},mv:3,rn:[1,1],at:"phys",xp:18},kame:{n:"カメ",i:"🐢",s:{hp:32,atk:6,def:12,mag:3,res:8,spd:2},mv:2,rn:[1,1],at:"phys",xp:15},obake:{n:"おばけ",i:"👻",s:{hp:16,atk:4,def:2,mag:10,res:9,spd:7},mv:4,rn:[1,2],at:"mag",xp:14},usagi:{n:"うさぎ",i:"🐰",s:{hp:14,atk:7,def:4,mag:5,res:5,spd:12},mv:5,rn:[1,1],at:"phys",xp:13},slime:{n:"スライム",i:"🫧",s:{hp:20,atk:5,def:6,mag:6,res:6,spd:5},mv:3,rn:[1,1],at:"mag",xp:11},robo:{n:"ロボ",i:"⚙️",s:{hp:26,atk:10,def:9,mag:3,res:7,spd:4},mv:3,rn:[1,1],at:"phys",xp:20},oni:{n:"おに",i:"👹",s:{hp:35,atk:13,def:8,mag:7,res:6,spd:6},mv:4,rn:[1,1],at:"phys",xp:25},keseran_e:{n:"ケセランパサラン",i:"💫",s:{hp:13,atk:4,def:3,mag:8,res:7,spd:9},mv:4,rn:[1,2],at:"mag",xp:16},suzumebachi:{n:"スズメバチ",i:"🐝",s:{hp:12,atk:13,def:3,mag:5,res:4,spd:13},mv:6,rn:[1,1],at:"phys",xp:22},gamagaeru:{n:"ガマガエル",i:"🐸",s:{hp:30,atk:11,def:8,mag:7,res:6,spd:3},mv:3,rn:[1,2],at:"phys",xp:24},maou:{n:"まおう",i:"😈",s:{hp:99,atk:25,def:20,mag:25,res:20,spd:15},mv:5,rn:[1,2],at:"mag",xp:100},
};
const IT={hpPotion:{id:"hpPotion",name:"回復薬",eff:"heal",val:15,desc:"HP15回復"},hpPotionL:{id:"hpPotionL",name:"上回復薬",eff:"heal",val:30,desc:"HP30回復"},atkBoost:{id:"atkBoost",name:"力の種",eff:"buff",stat:"atk",val:2,desc:"攻撃+2"},defBoost:{id:"defBoost",name:"守りの種",eff:"buff",stat:"def",val:2,desc:"防御+2"},spdBoost:{id:"spdBoost",name:"速さの種",eff:"buff",stat:"spd",val:2,desc:"速さ+2"}};
const WP={ironSword:{name:"鉄の剣",atk:3,mag:0},steelSword:{name:"鋼の剣",atk:6,mag:0},silverSword:{name:"銀の剣",atk:10,mag:0},fireRod:{name:"炎の杖",atk:0,mag:4},thunderRod:{name:"雷の杖",atk:0,mag:7},legendRod:{name:"伝説の杖",atk:0,mag:12},spear:{name:"槍",atk:5,mag:0},axe:{name:"戦斧",atk:8,mag:0},holyBlade:{name:"聖剣",atk:12,mag:5}};
const SD=[
  {id:0,name:"チュートリアル",w:6,h:6,en:[{t:"tonbo",x:4,y:1,sc:.5},{t:"tonbo",x:5,y:2,sc:.5}],rec:[{t:"batta",x:3,y:3}],ps:[{id:"youkun",x:0,y:4},{id:"soukun",x:1,y:4}],dr:[{it:"hpPotion",x:2,y:2}],txt:"ようくんとそうくんの冒険が始まる！\n「そうくん」でバッタに話しかけて仲間にしよう！"},
  {id:1,name:"Stage1 草原",w:8,h:7,en:[{t:"tonbo",x:5,y:1,sc:1},{t:"tonbo",x:6,y:2,sc:1},{t:"tonbo",x:7,y:1,sc:1},{t:"kaeru",x:6,y:4,sc:1},{t:"kaeru",x:7,y:5,sc:1}],ps:[{id:"youkun",x:0,y:5},{id:"soukun",x:1,y:5},{id:"batta",x:0,y:4}],dr:[{it:"hpPotion",x:3,y:3}],wd:{wp:"ironSword",x:4,y:2},txt:"草原に敵！油断するとやられるぞ…"},
  {id:2,name:"Stage2 毒の森",w:8,h:7,en:[{t:"hachi",x:5,y:0,sc:1},{t:"hachi",x:7,y:2,sc:1},{t:"kaeru",x:6,y:3,sc:1.1},{t:"tonbo",x:4,y:1,sc:1.2},{t:"slime",x:7,y:5,sc:1},{t:"slime",x:6,y:6,sc:1}],ps:[{id:"youkun",x:0,y:5},{id:"soukun",x:1,y:5},{id:"batta",x:0,y:4}],dr:[{it:"hpPotion",x:3,y:2}],wd:{wp:"fireRod",x:5,y:4},txt:"毒の森。ハチとスライムに注意"},
  {id:3,name:"Stage3 廃工場",w:8,h:8,en:[{t:"guardrobo_e",x:6,y:1,sc:1},{t:"slime",x:5,y:3,sc:1.2},{t:"robo",x:7,y:4,sc:.8},{t:"tonbo",x:4,y:2,sc:1.3},{t:"hachi",x:6,y:5,sc:1.1},{t:"kaeru",x:7,y:6,sc:1.2}],rec:[{t:"guardrobo",x:3,y:1}],ps:[{id:"youkun",x:0,y:6},{id:"soukun",x:1,y:6},{id:"batta",x:0,y:5}],dr:[{it:"hpPotionL",x:2,y:3}],txt:"ガードロボがいる…ようくんで話しかけよう"},
  {id:4,name:"Stage4 さびれた街",w:9,h:7,en:[{t:"otona",x:7,y:1,sc:1},{t:"otona",x:8,y:2,sc:1},{t:"obake",x:6,y:3,sc:1},{t:"obake",x:7,y:4,sc:1},{t:"usagi",x:5,y:1,sc:1},{t:"slime",x:8,y:5,sc:1.3},{t:"kaeru",x:6,y:6,sc:1.3}],rec:[{t:"otona6",x:4,y:3}],ps:[{id:"youkun",x:0,y:5},{id:"soukun",x:1,y:5},{id:"batta",x:0,y:4}],dr:[{it:"atkBoost",x:5,y:5}],wd:{wp:"steelSword",x:3,y:1},txt:"おとな6が倒れている…ようくん→そうくんの順で"},
  {id:5,name:"Stage5 海岸洞窟",w:9,h:8,en:[{t:"kame",x:7,y:1,sc:1},{t:"kame",x:8,y:3,sc:1},{t:"obake",x:6,y:2,sc:1.2},{t:"usagi",x:5,y:0,sc:1.2},{t:"robo",x:7,y:5,sc:1},{t:"hachi",x:8,y:6,sc:1.3},{t:"slime",x:6,y:7,sc:1.4}],rec:[{t:"kame3",x:3,y:2}],ps:[{id:"youkun",x:0,y:6},{id:"soukun",x:1,y:6},{id:"batta",x:0,y:5}],dr:[{it:"defBoost",x:4,y:4},{it:"hpPotionL",x:7,y:7}],txt:"カメ3は誰かを待っている"},
  {id:6,name:"Stage6 灼熱の山",w:9,h:8,en:[{t:"oni",x:7,y:1,sc:.9},{t:"robo",x:8,y:3,sc:1.2},{t:"suzumebachi",x:5,y:0,sc:1},{t:"suzumebachi",x:6,y:2,sc:1},{t:"obake",x:7,y:5,sc:1.3},{t:"otona",x:8,y:6,sc:1.3},{t:"gamagaeru",x:6,y:7,sc:.9}],ps:[{id:"youkun",x:0,y:6},{id:"soukun",x:1,y:6},{id:"batta",x:0,y:5}],dr:[{it:"spdBoost",x:4,y:3}],wd:{wp:"thunderRod",x:7,y:4},txt:"灼熱の山！おにが現れた！"},
  {id:7,name:"Stage7 精霊の森",w:10,h:8,en:[{t:"oni",x:8,y:1,sc:1},{t:"obake",x:7,y:2,sc:1.4},{t:"obake",x:9,y:3,sc:1.4},{t:"keseran_e",x:6,y:1,sc:1},{t:"usagi",x:8,y:5,sc:1.5},{t:"suzumebachi",x:7,y:6,sc:1.2},{t:"robo",x:9,y:7,sc:1.3},{t:"gamagaeru",x:6,y:6,sc:1}],rec:[{t:"keseran",x:4,y:2}],ps:[{id:"youkun",x:0,y:6},{id:"soukun",x:1,y:6},{id:"batta",x:0,y:5}],dr:[{it:"hpPotionL",x:5,y:4}],wd:{wp:"spear",x:3,y:1},txt:"ケセランパサラン！カマキリ→そうくんで"},
  {id:8,name:"Stage8 闇の城門",w:10,h:8,en:[{t:"oni",x:8,y:1,sc:1.2},{t:"oni",x:9,y:3,sc:1.2},{t:"robo",x:7,y:2,sc:1.5},{t:"guardrobo_e",x:9,y:5,sc:1.5},{t:"suzumebachi",x:6,y:0,sc:1.3},{t:"suzumebachi",x:8,y:6,sc:1.3},{t:"gamagaeru",x:7,y:7,sc:1.2},{t:"obake",x:6,y:4,sc:1.5}],ps:[{id:"youkun",x:0,y:6},{id:"soukun",x:1,y:6},{id:"batta",x:0,y:5}],dr:[{it:"hpPotionL",x:4,y:3},{it:"atkBoost",x:8,y:4}],wd:{wp:"silverSword",x:5,y:1},txt:"闇の城門！強敵揃い！"},
  {id:9,name:"Stage9 魔王回廊",w:10,h:8,en:[{t:"oni",x:8,y:0,sc:1.4},{t:"oni",x:9,y:2,sc:1.4},{t:"gamagaeru",x:7,y:3,sc:1.4},{t:"gamagaeru",x:9,y:5,sc:1.4},{t:"suzumebachi",x:6,y:1,sc:1.5},{t:"robo",x:8,y:4,sc:1.6},{t:"obake",x:7,y:6,sc:1.6},{t:"keseran_e",x:9,y:7,sc:1.5},{t:"usagi",x:6,y:5,sc:1.6}],ps:[{id:"youkun",x:0,y:6},{id:"soukun",x:1,y:6},{id:"batta",x:0,y:5}],dr:[{it:"hpPotionL",x:4,y:4}],wd:{wp:"legendRod",x:5,y:2},txt:"魔王の回廊…もうすぐだ！"},
  {id:10,name:"Stage10 魔王の間",w:10,h:9,en:[{t:"maou",x:8,y:1,sc:1},{t:"oni",x:7,y:0,sc:1.5},{t:"oni",x:9,y:0,sc:1.5},{t:"gamagaeru",x:6,y:2,sc:1.5},{t:"gamagaeru",x:9,y:3,sc:1.5},{t:"suzumebachi",x:7,y:4,sc:1.5},{t:"robo",x:8,y:5,sc:1.7},{t:"obake",x:9,y:6,sc:1.7},{t:"oni",x:6,y:6,sc:1.5}],ps:[{id:"youkun",x:0,y:7},{id:"soukun",x:1,y:7},{id:"batta",x:0,y:6}],dr:[{it:"hpPotionL",x:4,y:3}],wd:{wp:"holyBlade",x:5,y:1},txt:"ついに魔王の間！"},
];

// --- Utils ---
const clamp=(s,v)=>Math.min(v,STAT_CAPS[s]||99);
const dst=(a,b)=>Math.abs(a.x-b.x)+Math.abs(a.y-b.y);
const dmgCalc=(a,d)=>{const p=a.at==="phys";return Math.max(1,(p?a.stats.atk+(a.wp?.atk||0):a.stats.mag+(a.wp?.mag||0))-(p?d.stats.def:d.stats.res));};
const canPur=(a,b)=>a.stats.spd-b.stats.spd>=PURSUIT;
const movCells=(u,all,w,h)=>{const c=[],v=new Set(),q=[{x:u.x,y:u.y,s:0}];v.add(`${u.x},${u.y}`);while(q.length){const{x,y,s}=q.shift();c.push({x,y});if(s>=u.mov)continue;for(const[dx,dy]of[[0,1],[0,-1],[1,0],[-1,0]]){const nx=x+dx,ny=y+dy,k=`${nx},${ny}`;if(nx<0||ny<0||nx>=w||ny>=h||v.has(k))continue;if(all.find(u2=>u2.x===nx&&u2.y===ny&&u2.hp>0&&u2.team!==u.team))continue;v.add(k);q.push({x:nx,y:ny,s:s+1});}}return c;};
const atkCells=(u,fx,fy,all,w,h)=>{const c=[];for(let x=0;x<w;x++)for(let y=0;y<h;y++){const d=Math.abs(fx-x)+Math.abs(fy-y);if(d>=u.rng[0]&&d<=u.rng[1]){const t=all.find(u2=>u2.x===x&&u2.y===y&&u2.hp>0);if(t&&t.team!==u.team)c.push({x,y,target:t});}}return c;};
const talkTgts=(u,all)=>{const t=[];for(const[dx,dy]of[[0,1],[0,-1],[1,0],[-1,0]]){const f=all.find(u2=>u2.x===u.x+dx&&u2.y===u.y+dy&&u2.hp>0&&u2.rec_able);if(f)t.push(f);}return t;};
// T4 FIX: clamp in guaranteed +1
const lvUp=c=>{const ns={...c.stats};for(const s of Object.keys(c.gr))if(Math.random()*100<c.gr[s]*100)ns[s]=clamp(s,ns[s]+1);if(JSON.stringify(ns)===JSON.stringify(c.stats)){const ks=Object.keys(c.gr);const k=ks[Math.floor(Math.random()*ks.length)];ns[k]=clamp(k,ns[k]+1);}return ns;};

const mkEnemy=(tp,sc,x,y,i)=>{const t=ET[tp],stats={};for(const k of Object.keys(t.s))stats[k]=clamp(k,Math.floor(t.s[k]*sc));return{uid:`e${i}_${tp}`,id:tp,name:t.n,icon:t.i,stats,maxHp:stats.hp,hp:stats.hp,mov:t.mv,rng:t.rn,at:t.at,level:Math.max(1,Math.floor(sc*5)),team:"enemy",acted:false,exp:t.xp,x,y,wp:null,gr:{}};};
const mkAlly=(cd,gb)=>{const stats={};for(const k of Object.keys(cd.bs))stats[k]=clamp(k,cd.bs[k]+(gb?.[cd.id]?.[k]||0));return{uid:cd.id,id:cd.id,name:cd.name,cls:cd.cls,icon:cd.icon,stats:{...stats},maxHp:stats.hp,hp:stats.hp,gr:cd.gr,mov:cd.mov,rng:[...cd.rng],at:cd.at,canCC:cd.canCC,ccLv:cd.ccLv,ccTo:cd.ccTo,level:1,team:"player",acted:false,exp:0,wp:cd.wp?{...cd.wp}:null,items:[],x:0,y:0};};
const mkRec=(rd,x,y)=>({uid:`r_${rd.id}`,id:rd.id,name:rd.name,cls:rd.cls,icon:rd.icon,stats:{...rd.bs},maxHp:rd.bs.hp,hp:rd.bs.hp,gr:rd.gr,mov:rd.mov,rng:[...rd.rng],at:rd.at,canCC:rd.canCC,ccLv:rd.ccLv,ccTo:rd.ccTo,level:1,team:"neutral",acted:false,exp:0,wp:rd.wp?{...rd.wp}:null,items:[],x,y,rec_able:true,rc:[...rd.rc],rp:0,hint:rd.hint});
const genInf=f=>{const w=8+Math.min(f,4),h=7+Math.min(f,3),sc=1+f*.15,en=[];const ts=Object.keys(ET).filter(t=>t!=="maou");for(let i=0;i<Math.min(5+f,12);i++){let x,y;do{x=2+Math.floor(Math.random()*(w-2));y=Math.floor(Math.random()*h);}while(en.some(e=>e.x===x&&e.y===y));en.push({t:ts[Math.floor(Math.random()*ts.length)],x,y,sc});}return{id:100+f,name:`無限回廊 B${f}F`,w,h,en,rec:[],dr:[],ps:[{id:"youkun",x:0,y:h-2},{id:"soukun",x:1,y:h-2},{id:"batta",x:0,y:h-3}],txt:`無限回廊 地下${f}階…`};};

// snapParty: save ALL player units (dead=revive with full HP next stage)
const snapParty=(units)=>units.filter(u=>u.team==="player").map(u=>({uid:u.uid,id:u.id,origId:u.origId||u.uid,name:u.name,cls:u.cls,icon:u.icon,stats:{...u.stats},maxHp:u.maxHp,hp:u.maxHp,gr:u.gr,mov:u.mov,rng:[...u.rng],at:u.at,canCC:u.canCC,ccLv:u.ccLv,ccTo:u.ccTo,level:u.level,exp:u.exp,wp:u.wp?{...u.wp}:null,items:u.items?[...u.items]:[]}));
// Hero death check
const isHeroDead=(units)=>{const y=units.find(u=>u.uid==="youkun"||u.id==="youkun");const s=units.find(u=>u.uid==="soukun"||u.id==="soukun");return (y&&y.hp<=0)||(s&&s.hp<=0);};

const P={bg:"#181a20",panel:"#1c1f2e",bdr:"#2e3148",blue:"#4a8af4",red:"#e05252",grn:"#36b37e",gold:"#f0c040",txt:"#e8eaf2",dim:"#8b92b0",t1:"#283028",t2:"#243024",movT:"rgba(74,138,244,0.38)",atkT:"rgba(224,82,82,0.28)",selT:"rgba(240,192,64,0.45)",
  atkPreview:"rgba(200,60,60,0.18)",
  atkTarget:"rgba(239,68,68,0.50)",
};
const CL=52;

export default function Game(){
  const[gb,setGb]=useState({youkun:{},soukun:{},batta:{}});
  const[tgp,setTgp]=useState(0);const[wpns,setWpns]=useState([]);const[bst,setBst]=useState(0);const[runs,setRuns]=useState(0);const[clr,setClr]=useState(false);const[rec,setRec]=useState([]);const[ft,setFt]=useState(true);const[ld,setLd]=useState(false);
  // T1/T2: party snapshot persists stats/levels/CC between stages within a run
  const[snap,setSnap]=useState(null);
  // allySnaps: ALL recruited allies' stats persist across time leaps {origId: snapshot}
  const[allySnaps,setAllySnaps]=useState({});
  const[ph,setPh]=useState("title");const[stg,setStg]=useState(0);const[us,setUs]=useState([]);const[mp,setMp]=useState(null);
  const[sel,setSel]=useState(null);const[mvd,setMvd]=useState(null);const[mcs,setMcs]=useState([]);const[acs,setAcs]=useState([]);const[tts,setTts]=useState([]);
  const[menu,setMenu]=useState(null);const[fc,setFc]=useState(null);const[turn,setTurn]=useState(1);const[logs,setLogs]=useState([]);const[hov,setHov]=useState(null);
  const[targeting,setTargeting]=useState(null);
  const[gpp,setGpp]=useState(0);const[gppOrig,setGppOrig]=useState(0);
  const[pnd,setPnd]=useState({youkun:{},soukun:{},batta:{}});const[kills,setKills]=useState(0);
  const[lvInfo,setLvInfo]=useState(null);const[ccP,setCcP]=useState(null);const[banner,setBanner]=useState(null);const[modal,setModal]=useState(null);
  const[anim,setAnim]=useState(false);const[dpop,setDpop]=useState(null);const[ifl,setIfl]=useState(1);const[stxt,setStxt]=useState("");
  const[btl,setBtl]=useState(null);
  // Fix5: map zoom
  const[zoom,setZoom]=useState(1);
  const bgmRef=useRef(null);
  useEffect(()=>{const a=new Audio(bgmUrl);a.loop=true;a.volume=0.4;bgmRef.current=a;return()=>{a.pause();};},[]);
  useEffect(()=>{const a=bgmRef.current;if(!a)return;if(ph==="title"||ph==="battle"||ph==="ep"||ph==="pre"||ph==="alloc"){a.play().catch(()=>{});}else{a.pause();}},[ph]);
  const lr=useRef(null);const gbR=useRef(gb);gbR.current=gb;const recR=useRef(rec);recR.current=rec;const wpR=useRef(wpns);wpR.current=wpns;const stgR=useRef(stg);stgR.current=stg;const iflR=useRef(ifl);iflR.current=ifl;
  const snapR=useRef(snap);snapR.current=snap;
  const allySnapsR=useRef(allySnaps);allySnapsR.current=allySnaps;
  const log=useCallback(m=>setLogs(p=>[...p.slice(-40),m]),[]);
  useEffect(()=>{if(lr.current)lr.current.scrollTop=lr.current.scrollHeight;},[logs]);
  useEffect(()=>{try{const v=localStorage.getItem("srpg4");if(v){const s=JSON.parse(v);if(s.gb)setGb(s.gb);if(s.tgp)setTgp(s.tgp);if(s.wpns)setWpns(s.wpns);if(s.bst)setBst(s.bst);if(s.runs)setRuns(s.runs);if(s.clr)setClr(s.clr);if(s.rec)setRec(s.rec);if(s.ft===false)setFt(false);if(s.allySnaps)setAllySnaps(s.allySnaps);}}catch(e){}setLd(true);},[]);
  useEffect(()=>{if(!ld)return;try{localStorage.setItem("srpg4",JSON.stringify({gb,tgp,wpns,bst,runs,clr,rec,ft,allySnaps}));}catch(e){};},[gb,tgp,wpns,bst,runs,clr,rec,ft,allySnaps,ld]);

  const showBnr=(t,cb)=>{setBanner(t);setTimeout(()=>{setBanner(null);cb?.();},1200);};

  // T1/T2 FIX: init restores from snapshot if available
  const init=useCallback((idx,inf=false,fl=1)=>{
    const sd=inf?genInf(fl):SD[idx];if(!sd)return;
    const g=gbR.current,ri=recR.current,cw=wpR.current,sn=snapR.current,as=allySnapsR.current,all=[];
    for(const pid of["youkun","soukun",...ri]){
      // Check run snapshot first, then allySnaps for cross-leap persistence
      let saved=sn?.find(s=>s.uid===pid||s.id===pid);
      // allySnaps only for recruited allies, NOT youkun/soukun (they reset via guts)
      if(!saved&&pid!=="youkun"&&pid!=="soukun"){
        const snap2=as[pid]||Object.values(as).find(s=>s.uid===pid||s.id===pid||s.origId===pid);
        if(snap2)saved=snap2;
      }
      if(saved){
        const u={...saved,uid:saved.uid||saved.id,team:"player",acted:false,
          hp:saved.maxHp, // Always full HP on stage start
          level:saved.level||1, // Preserve level explicitly
          stats:{...saved.stats},
          items:saved.items?[...saved.items]:[]};
        const oid=saved.origId||saved.uid||saved.id;
        const sp=sd.ps.find(s=>s.id===pid)||sd.ps.find(s=>s.id===oid)||sd.ps.find(s=>s.id==="batta");
        if(sp){u.x=sp.x;u.y=sp.y;}else{u.x=sd.ps[0].x;u.y=Math.max(0,sd.ps[0].y-["youkun","soukun",...ri].indexOf(pid));}
        u.origId=oid;
        const best=cw.filter(w=>u.at==="mag"?(w.mag||0)>0:(w.atk||0)>0).sort((a,b)=>((b.atk||0)+(b.mag||0))-((a.atk||0)+(a.mag||0)))[0];
        if(best&&((best.atk||0)+(best.mag||0))>((u.wp?.atk||0)+(u.wp?.mag||0)))u.wp={...best};
        all.push(u);
      } else {
        const cd=BC[pid]||RC[pid]||CC_D[pid];if(!cd)continue;
        const u=mkAlly(cd,g);const sp=sd.ps.find(s=>s.id===pid);
        if(sp){u.x=sp.x;u.y=sp.y;}else{u.x=sd.ps[0].x;u.y=Math.max(0,sd.ps[0].y-["youkun","soukun",...ri].indexOf(pid));}
        const best=cw.filter(w=>u.at==="mag"?(w.mag||0)>0:(w.atk||0)>0).sort((a,b)=>((b.atk||0)+(b.mag||0))-((a.atk||0)+(a.mag||0)))[0];
        if(best&&((best.atk||0)+(best.mag||0))>((u.wp?.atk||0)+(u.wp?.mag||0)))u.wp={...best};
        all.push(u);
      }
    }
    let ei=0;for(const e of sd.en)all.push(mkEnemy(e.t,e.sc,e.x,e.y,ei++));
    if(sd.rec)for(const r of sd.rec){if(!ri.includes(r.t)){
      const rd=r.t==="batta"?{...BC.batta,rc:[{s:"soukun"}],hint:"そうくんで話しかけよう"}:RC[r.t];
      if(rd){
        const ru=mkRec(rd,r.x,r.y);
        // Restore saved stats from allySnaps if available
        const savedAlly=as[r.t]||as[rd.id];
        if(savedAlly){ru.stats={...savedAlly.stats};ru.maxHp=savedAlly.maxHp;ru.hp=savedAlly.maxHp;ru.level=savedAlly.level;ru.exp=savedAlly.exp||0;ru.gr=savedAlly.gr;if(savedAlly.wp)ru.wp={...savedAlly.wp};}
        all.push(ru);
      }
    }}
    setUs(all);setMp({...sd,dr:sd.dr?[...sd.dr]:[],wd:sd.wd?{...sd.wd}:null});
    setTurn(1);setLogs([]);setSel(null);setMvd(null);setMcs([]);setAcs([]);setTts([]);setMenu(null);setFc(null);setHov(null);setLvInfo(null);setCcP(null);setDpop(null);setModal(null);setTargeting(null);setBtl(null);setZoom(1);
    setStxt(sd.txt||"");setPh("pre");
  },[]);

  // T1: manually clear ref before init to prevent stale snapshot
  const startGame=()=>{setKills(0);setSnap(null);snapR.current=null;if(ft){setGpp(2);setGppOrig(2);setPnd({youkun:{},soukun:{},batta:{}});setPh("alloc");}else{setStg(1);init(1);}};
  // T5: manually update ref before init to avoid setTimeout race
  const confirmAlloc=()=>{const ng={...gb};for(const c of Object.keys(pnd)){if(!ng[c])ng[c]={};for(const s of Object.keys(pnd[c]))ng[c][s]=(ng[c][s]||0)+pnd[c][s];}setGb(ng);gbR.current=ng;setPnd({youkun:{},soukun:{},batta:{}});if(ft){setFt(false);setStg(0);init(0);}else{setStg(1);init(1);}};
  const allocG=(c,s)=>{if(gpp<=0)return;const cur=(gb[c]?.[s]||0)+(pnd[c]?.[s]||0);if(cur+(BC[c]?.bs[s]||0)>=STAT_CAPS[s])return;setPnd(p=>({...p,[c]:{...p[c],[s]:(p[c]?.[s]||0)+1}}));setGpp(p=>p-1);};
  // T9: reset allocation
  const resetAlloc=()=>{setPnd({youkun:{},soukun:{},batta:{}});setGpp(gppOrig);};

  // CLICK
  const click=(x,y)=>{
    if(ph!=="battle"||anim||banner||lvInfo||ccP||modal||btl)return;
    if(fc){setFc(null);return;}
    const cu=us.find(u=>u.x===x&&u.y===y&&u.hp>0);

    // T3: If in targeting mode, handle target selection or cancel
    if(targeting){
      if(targeting==="atk"){
        const ac=acs.find(c=>c.x===x&&c.y===y);
        if(ac?.target){showFC(ac.target);setTargeting(null);return;}
      }
      if(targeting==="talk"){
        const tt=tts.find(u2=>u2.x===x&&u2.y===y);
        if(tt){doTalk(tt.uid);setTargeting(null);return;}
      }
      // Cancel targeting: undo move
      if(mvd){setUs(p=>p.map(u=>u.uid===sel.uid?{...u,x:mvd.x,y:mvd.y}:u));setSel(null);}else setSel(null);
      setMenu(null);setAcs([]);setTts([]);setMcs([]);setMvd(null);setTargeting(null);
      return;
    }

    if(menu){if(mvd){setUs(p=>p.map(u=>u.uid===sel.uid?{...u,x:mvd.x,y:mvd.y}:u));setSel(null);}else setSel(null);setMenu(null);setAcs([]);setTts([]);setMcs([]);setMvd(null);return;}

    // T11: set hover on click
    if(cu)setHov(cu);

    if(!sel){
      if(cu?.team==="player"&&!cu.acted){setSel(cu);const mc=movCells(cu,us,mp.w,mp.h);setMcs(mc);
        // T10: preview attack range (lighter color, stored separately)
        const ar=new Set();for(const c of mc)for(let ax=0;ax<mp.w;ax++)for(let ay=0;ay<mp.h;ay++){const d=Math.abs(c.x-ax)+Math.abs(c.y-ay);if(d>=cu.rng[0]&&d<=cu.rng[1]&&!mc.some(c2=>c2.x===ax&&c2.y===ay))ar.add(`${ax},${ay}`);}
        setAcs([...ar].map(s=>{const[ax,ay]=s.split(",");return{x:+ax,y:+ay,preview:true};}));
      }return;
    }
    if(cu?.uid===sel.uid){
      // Fix6: show command menu at current position (attack without moving)
      setMcs([]);
      const uu=[...us];
      const ac=atkCells(sel,sel.x,sel.y,uu,mp.w,mp.h),tt=talkTgts(sel,uu);
      setAcs(ac.map(a=>({...a,preview:false})));setTts(tt);
      const hasDr=mp.dr?.some(d=>d.x===sel.x&&d.y===sel.y),hasWp=mp.wd?.x===sel.x&&mp.wd?.y===sel.y;
      const items=[];
      if(ac.length)items.push({l:"攻撃",k:"atk",ic:"⚔"});
      if(tt.length)items.push({l:"話す",k:"talk",ic:"💬"});
      if(sel.items?.length)items.push({l:"道具",k:"item",ic:"🎒"});
      if(hasDr||hasWp)items.push({l:"拾う",k:"pick",ic:"📦"});
      items.push({l:"待機",k:"wait",ic:"⏸"});
      setMenu({x:sel.x,y:sel.y,items});
      return;
    }
    if(mcs.some(c=>c.x===x&&c.y===y)){
      if(us.find(u=>u.x===x&&u.y===y&&u.hp>0&&u.uid!==sel.uid))return;
      setMvd({x:sel.x,y:sel.y});const mu={...sel,x,y};
      setUs(p=>p.map(u=>u.uid===sel.uid?{...u,x,y}:u));setSel(mu);setMcs([]);
      const uu=us.map(u=>u.uid===sel.uid?{...u,x,y}:u);
      const ac=atkCells(mu,x,y,uu,mp.w,mp.h),tt=talkTgts(mu,uu);
      // T10: real targets (not preview)
      setAcs(ac.map(a=>({...a,preview:false})));setTts(tt);
      const hasDr=mp.dr?.some(d=>d.x===x&&d.y===y),hasWp=mp.wd?.x===x&&mp.wd?.y===y;
      const items=[];
      if(ac.length)items.push({l:"攻撃",k:"atk",ic:"⚔"});
      if(tt.length)items.push({l:"話す",k:"talk",ic:"💬"});
      if(mu.items?.length)items.push({l:"道具",k:"item",ic:"🎒"});
      if(hasDr||hasWp)items.push({l:"拾う",k:"pick",ic:"📦"});
      items.push({l:"待機",k:"wait",ic:"⏸"});
      setMenu({x,y,items});
    }
  };

  const menuAct=k=>{
    if(!sel)return;
    if(k==="wait"){doWait();return;}
    // T3/T5: enter targeting mode for atk/talk
    if(k==="atk"){setMenu(null);if(acs.length===1&&acs[0].target){showFC(acs[0].target);}else{setTargeting("atk");}return;}
    if(k==="talk"){setMenu(null);if(tts.length===1){doTalk(tts[0].uid);}else{setTargeting("talk");}return;}
    if(k==="item"){setMenu(null);setModal({t:"items",u:sel});return;}
    if(k==="pick"){
      const dr=mp.dr?.find(d=>d.x===sel.x&&d.y===sel.y);if(dr)pickItem(sel,dr);
      if(mp.wd?.x===sel.x&&mp.wd?.y===sel.y)pickWp(sel);doWait();return;
    }
  };

  // T6: store attacker coords explicitly
  const showFC=tgt=>{
    const a=sel,ax=sel.x,ay=sel.y;
    const d=dmgCalc(a,tgt),pu=canPur(a,tgt),td=d*(pu?2:1);
    const dd=Math.abs(ax-tgt.x)+Math.abs(ay-tgt.y);
    const cc=dd>=(tgt.rng?.[0]||1)&&dd<=(tgt.rng?.[1]||1);
    const cd=cc?dmgCalc(tgt,a):0,cp=cc&&canPur(tgt,a),ct=cd*(cp?2:1);
    setFc({a,d:tgt,dmg:d,pu,td,cc,cd,cp,ct,ax,ay});
  };

  const confirmAtk=()=>{
    if(!fc)return;const{a,d:tgt,dmg,pu,cc,cd,cp}=fc;setFc(null);setTargeting(null);
    const td=dmg+(pu?dmg:0),nh=Math.max(0,tgt.hp-td);
    let cDmg=0;if(nh>0&&cc){cDmg=cd+(cp?cd:0);}
    const nah=Math.max(0,a.hp-cDmg);
    // Show battle scene
    setBtl({atk:a,def:tgt,atkDmg:td,defDmg:cDmg,atkDmgBase:dmg,defDmgBase:cd,atkPur:pu,defPur:cp&&cc,atkHpAfter:nah,defHpAfter:nh,counter:cc&&nh>0,phase:1});
    // Phase 1: attacker hits (0.6s), Phase 2: counter (0.6s), Phase 3: result (0.5s)
    const t1=600, t2=cc&&nh>0?600:0, t3=500;
    setTimeout(()=>{ if(cc&&nh>0)setBtl(p=>p?{...p,phase:2}:null); },t1);
    setTimeout(()=>{ setBtl(p=>p?{...p,phase:3}:null); },t1+t2);
    setTimeout(()=>{
      setBtl(null);
      const killed=nh<=0;
      let l=`${a.name}→${tgt.name} ${dmg}dmg`;if(pu)l+=`(追撃+${dmg})`;
      if(cDmg>0){l+=` ←反撃${cd}dmg`;if(cp)l+="(追撃)";}
      log(l);
      setUs(prev=>{let nu=prev.map(u=>{if(u.uid===tgt.uid)return{...u,hp:nh};if(u.uid===a.uid)return{...u,hp:nah,acted:true};return u;});
        if(killed){setKills(k=>k+1);log(`${tgt.name}を撃破！`);
          const xp=(a.exp||0)+(tgt.exp||10),need=a.level*10;
          if(xp>=need&&a.level<MAX_LV){const ns=lvUp(a),nl=a.level+1;nu=nu.map(u=>{if(u.uid!==a.uid)return u;const hpGain=Math.max(0,ns.hp-u.maxHp);return{...u,stats:ns,maxHp:ns.hp,hp:Math.min(ns.hp,u.hp+hpGain),level:nl,exp:0};});log(`${a.name}→Lv.${nl}`);setLvInfo({n:a.name,lv:nl,ns,os:a.stats});if(a.canCC&&nl>=(a.ccLv||20))setTimeout(()=>setCcP({uid:a.uid,n:a.name,to:a.ccTo}),1500);}
          else nu=nu.map(u=>u.uid===a.uid?{...u,exp:xp}:u);
        }return nu;});
      setSel(null);setMenu(null);setAcs([]);setMvd(null);
      if(killed)setTimeout(chkWin,400);
      // Hero death check: youkun or soukun dying = game over
      if(nah<=0)setTimeout(()=>setUs(cu=>{
        if(isHeroDead(cu)){log("⚠ 主人公が倒れた…タイムリープ！");defeat(cu);}
        return cu;
      }),500);
    },t1+t2+t3);
  };

  const doTalk=uid=>{
    const t=us.find(u=>u.uid===uid);if(!t?.rec_able)return;
    const step=t.rp||0,req=t.rc[step];if(!req)return;
    const ok=req.s==="any"||sel.id===req.s||(sel.id==="kamakiri"&&req.s==="kamakiri");
    if(ok){if(step+1>=t.rc.length){log(`${t.name}が仲間になった！`);setUs(p=>p.map(u=>u.uid===t.uid?{...u,team:"player",rec_able:false,acted:true,uid:t.id}:u));setRec(p=>[...p,t.id]);}
    else{log(`${sel.name}→${t.name}に話した(${step+1}/${t.rc.length})`);setUs(p=>p.map(u=>u.uid===t.uid?{...u,rp:step+1}:u));}}
    else{log(`${sel.name}では説得できない…`);if(t.hint)log(`💡 ${t.hint}`);}
    setUs(p=>p.map(u=>u.uid===sel.uid?{...u,acted:true}:u));setSel(null);setMenu(null);setTts([]);setMvd(null);setTargeting(null);
  };
  const doWait=()=>{setUs(p=>p.map(u=>u.uid===sel.uid?{...u,acted:true}:u));setSel(null);setMenu(null);setAcs([]);setTts([]);setMcs([]);setMvd(null);setTargeting(null);};
  const useIt=i=>{const it=sel.items[i];if(!it)return;
    if(it.eff==="heal"){const nh=Math.min(sel.maxHp,sel.hp+it.val);log(`${sel.name}→${it.name} HP+${it.val}`);setUs(p=>p.map(u=>u.uid===sel.uid?{...u,hp:nh,items:u.items.filter((_,j)=>j!==i),acted:true}:u));}
    else if(it.eff==="buff"){log(`${sel.name}→${it.name} ${SN[it.stat]}+${it.val}`);setUs(p=>p.map(u=>{if(u.uid!==sel.uid)return u;const ns={...u.stats,[it.stat]:clamp(it.stat,u.stats[it.stat]+it.val)};return{...u,stats:ns,maxHp:it.stat==="hp"?ns.hp:u.maxHp,items:u.items.filter((_,j)=>j!==i),acted:true};}));}
    setModal(null);setSel(null);setMenu(null);setMvd(null);};
  const pickItem=(u,dr)=>{const it=IT[dr.it];if(!it)return;if(u.items.length<MAX_ITEMS){setUs(p=>p.map(u2=>u2.uid===u.uid?{...u2,items:[...u2.items,{...it}]}:u2));log(`${u.name}→${it.name}を拾った`);}else{setModal({t:"replace",uid:u.uid,ni:it});return;}setMp(p=>({...p,dr:p.dr.filter(d=>d!==dr)}));};
  const pickWp=u=>{const w=mp.wd;if(!w)return;const wp=WP[w.wp];if(!wp)return;log(`${u.name}→${wp.name}を発見！`);setWpns(p=>p.some(c=>c.name===wp.name)?p:[...p,{...wp}]);setUs(p=>p.map(u2=>{if(u2.uid!==u.uid)return u2;if((wp.atk||0)+(wp.mag||0)>(u2.wp?.atk||0)+(u2.wp?.mag||0))return{...u2,wp:{...wp}};return u2;}));setMp(p=>({...p,wd:null}));};
  const doCC=uid=>{const u=us.find(u2=>u2.uid===uid);if(!u)return;const cd=CC_D[u.ccTo];if(!cd)return;log(`✨${u.name}→${cd.name}にCC！`);setUs(p=>p.map(u2=>u2.uid===uid?{...u2,id:cd.id,name:cd.name,cls:cd.cls,icon:cd.icon,gr:cd.gr,mov:cd.mov,rng:[...cd.rng],at:cd.at,canCC:cd.canCC||false,ccLv:cd.ccLv,ccTo:cd.ccTo,level:1,exp:0,wp:cd.wp?{...cd.wp}:u2.wp,origId:u2.origId||u2.uid}:u2));setCcP(null);};

  const endTurn=()=>{if(anim||banner)return;setUs(p=>p.map(u=>u.team==="player"?{...u,acted:false}:u));setSel(null);setMcs([]);setAcs([]);setMenu(null);setFc(null);setTargeting(null);showBnr("enemy",()=>{setPh("ep");runEP();});};

  // Enemy Phase: sequential 1-by-1 animation
  const runEP=()=>{
    setAnim(true);
    // Pre-compute all enemy actions from current state
    setUs(prev=>{
      const ens=prev.filter(u=>u.team==="enemy"&&u.hp>0);
      let upd=[...prev]; const actions=[];
      for(const en of ens){
        const ce=upd.find(u=>u.uid===en.uid);if(!ce||ce.hp<=0)continue;
        const alive=upd.filter(u=>u.team==="player"&&u.hp>0);if(!alive.length)break;
        const cl=alive.reduce((a,b)=>dst(ce,a)<dst(ce,b)?a:b);
        const mc=movCells(ce,upd,mp.w,mp.h);let best={x:ce.x,y:ce.y},bd=dst(ce,cl);
        for(const c of mc){if(upd.some(u=>u.x===c.x&&u.y===c.y&&u.hp>0&&u.uid!==ce.uid))continue;const d=dst(c,cl);if(d<bd){bd=d;best=c;}}
        upd=upd.map(u=>u.uid===ce.uid?{...u,x:best.x,y:best.y}:u);
        const me={...ce,x:best.x,y:best.y};
        const act={uid:ce.uid,from:{x:ce.x,y:ce.y},to:best,attack:null};
        const tgts2=atkCells(me,best.x,best.y,upd,mp.w,mp.h);
        if(tgts2.length){
          const tgt=tgts2.reduce((a,b)=>{const ua=upd.find(u=>u.uid===a.target.uid),ub=upd.find(u=>u.uid===b.target.uid);return (ua?.hp||999)<(ub?.hp||999)?a:b;});
          const tu=upd.find(u=>u.uid===tgt.target.uid);
          if(tu){
            const dm=dmgCalc(me,tu),pu2=canPur(me,tu),td=dm+(pu2?dm:0),nh=Math.max(0,tu.hp-td);
            let cd2=0,cdBase=0,cPur=false;
            if(nh>0){const d2=dst(me,tu);if(d2>=(tu.rng?.[0]||1)&&d2<=(tu.rng?.[1]||1)){cdBase=dmgCalc(tu,me);cPur=canPur(tu,me);cd2=cdBase+(cPur?cdBase:0);}}
            act.attack={tgtUid:tu.uid,me:{...me},tu:{...tu},dm,pu:pu2,td,nh,cd2,cdBase,cPur,meHpAfter:Math.max(0,me.hp-cd2),tuHpAfter:nh};
            upd=upd.map(u=>{if(u.uid===tu.uid)return{...u,hp:nh};if(u.uid===me.uid)return{...u,hp:Math.max(0,u.hp-cd2)};return u;});
          }
        }
        actions.push(act);
      }
      // Store actions queue, play back sequentially
      epQueueRef.current=actions;
      epStateRef.current=prev; // start from actual current state
      setTimeout(()=>playNextEP(),100);
      return prev; // don't change state yet
    });
  };

  const epQueueRef=useRef([]);
  const epStateRef=useRef([]);

  const playNextEP=()=>{
    const q=epQueueRef.current;
    if(!q.length){finishEP();return;}
    const act=q.shift();
    let cur=epStateRef.current;
    const ce=cur.find(u=>u.uid===act.uid);
    if(!ce||ce.hp<=0){playNextEP();return;}
    // Step 1: Move (highlight + move)
    cur=cur.map(u=>u.uid===act.uid?{...u,x:act.to.x,y:act.to.y}:u);
    epStateRef.current=cur;
    setUs([...cur]);
    if(!act.attack){
      // No attack, just moved - brief pause then next
      setTimeout(()=>playNextEP(),300);
      return;
    }
    // Step 2: Show battle scene after movement
    const a=act.attack;
    const atkUnit=cur.find(u=>u.uid===act.uid);
    const defUnit=cur.find(u=>u.uid===a.tgtUid);
    if(!atkUnit||!defUnit){playNextEP();return;}
    setTimeout(()=>{
      const hasCounter=a.cd2>0&&a.nh>0;
      setBtl({atk:atkUnit,def:defUnit,atkDmg:a.td,defDmg:a.cd2,defDmgBase:a.cdBase,atkDmgBase:a.dm,atkPur:a.pu,defPur:a.cPur,atkHpAfter:a.meHpAfter,defHpAfter:a.nh,counter:hasCounter,phase:1});
      const t1=600,t2=hasCounter?600:0,t3=400;
      if(hasCounter)setTimeout(()=>setBtl(p=>p?{...p,phase:2}:null),t1);
      setTimeout(()=>setBtl(p=>p?{...p,phase:3}:null),t1+t2);
      setTimeout(()=>{
        setBtl(null);
        let l2=`${atkUnit.name}→${defUnit.name} ${a.dm}dmg`;if(a.pu)l2+=`(追撃+${a.dm})`;
        if(a.cd2>0){l2+=` ←反撃${a.cdBase}dmg`;if(a.cPur)l2+=`(追撃+${a.cdBase})`;}
        log(l2);
        let upd2=epStateRef.current.map(u=>{
          if(u.uid===a.tgtUid)return{...u,hp:a.nh};
          if(u.uid===act.uid)return{...u,hp:a.meHpAfter};
          return u;
        });
        if(a.nh<=0)log(`${defUnit.name}が倒れた…`);
        if(a.cd2>0&&a.meHpAfter<=0){log(`${atkUnit.name}撃破！`);setKills(k=>k+1);
          // Fix1: EXP to player on counter-kill
          const xp2=(defUnit.exp||0)+(atkUnit.exp||10),need2=defUnit.level*10;
          if(xp2>=need2&&defUnit.level<MAX_LV){const ns2=lvUp(defUnit),nl2=defUnit.level+1;upd2=upd2.map(u=>{if(u.uid!==a.tgtUid)return u;const hg=Math.max(0,ns2.hp-u.maxHp);return{...u,stats:ns2,maxHp:ns2.hp,hp:Math.min(ns2.hp,u.hp+hg),level:nl2,exp:0};});log(`${defUnit.name}→Lv.${nl2}`);setTimeout(()=>setLvInfo({n:defUnit.name,lv:nl2,ns:ns2,os:defUnit.stats}),100);}
          else{upd2=upd2.map(u=>u.uid===a.tgtUid?{...u,exp:xp2}:u);}
        }
        epStateRef.current=upd2;
        setUs([...upd2]);
        // Hero death check: youkun/soukun dying = game over
        if(isHeroDead(upd2)){log("⚠ 主人公が倒れた…タイムリープ！");setTimeout(()=>{setAnim(false);setBtl(null);defeat(upd2);},500);return;}
        setTimeout(()=>playNextEP(),250);
      },t1+t2+t3);
    },350);
  };

  const finishEP=()=>{
    const upd=epStateRef.current;
    setUs([...upd]);
    setTimeout(()=>{
      setAnim(false);
      const ap=upd.filter(u=>u.team==="player"&&u.hp>0),ae=upd.filter(u=>u.team==="enemy"&&u.hp>0);
      if(isHeroDead(upd))defeat(upd);
      else if(!ae.length){const s=stgR.current;
        setSnap(snapParty(upd));
        if(s===0&&!recR.current.includes("batta"))setRec(p=>[...p,"batta"]);
        if(s>=100){setIfl(f=>f+1);setPh("win");}else if(s>=10){setPh("end");setClr(true);}else setPh("win");}
      else{setTurn(t=>t+1);setUs(p=>p.map(u=>u.team==="player"?{...u,acted:false}:u));showBnr("player",()=>setPh("battle"));}
    },400);
  };
  const chkWin=()=>{setTimeout(()=>setUs(cu=>{if(!cu.filter(u=>u.team==="enemy"&&u.hp>0).length){const s=stgR.current;
    // T7: auto-add batta on tutorial clear
    if(s===0&&!recR.current.includes("batta")){setRec(p=>[...p,"batta"]);}
    if(s>=100){setIfl(f=>f+1);setPh("win");}else if(s>=10){setPh("end");setClr(true);}else setPh("win");
    // T1: save party snapshot on victory
    setSnap(snapParty(cu));
  }return cu;}),300);};
  const defeat=cu=>{const s=stgR.current,tl=cu.filter(u=>u.team==="player").reduce((a,u)=>a+u.level,0),gp=s*3+Math.floor(kills/5)+Math.floor(tl/10);setGpp(gp);setGppOrig(gp);setRuns(r=>r+1);setTgp(t=>t+gp);setBst(b=>Math.max(b,s));setPh("lose");};
  const nextStg=()=>{if(stg>=100){init(0,true,ifl);return;}const ns=stg+1;if(ns>10){setPh("end");return;}setStg(ns);init(ns);};
  const timeLeap=()=>{
    // Save recruited allies' stats for cross-leap persistence (NOT youkun/soukun)
    setUs(cu=>{
      const newSnaps={...allySnapsR.current};
      cu.filter(u=>u.team==="player"&&u.uid!=="youkun"&&u.uid!=="soukun").forEach(u=>{
        const oid=u.origId||u.uid;
        newSnaps[oid]=snapParty([u])[0];
      });
      setAllySnaps(newSnaps);allySnapsR.current=newSnaps;
      return cu;
    });
    // Only batta/kamakiri stays in party, others need re-recruiting
    const battaId=rec.find(r=>r==="batta"||r==="kamakiri");
    setRec(battaId?[battaId]:[]);
    if(!battaId)setRec(["batta"]);
    setPnd({youkun:{},soukun:{},batta:{}});setKills(0);setStg(1);setSnap(null);snapR.current=null;
    if(gpp>0)setPh("alloc");else init(1);
  };

  // ==== RENDER ====
  const Chip=({u,sz=CL})=>{const c=u.team==="player"?P.blue:u.team==="enemy"?P.red:"#eab308",hp=u.hp/u.maxHp;
    return (<div style={{width:sz,height:sz,position:"relative",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{position:"absolute",inset:2,borderRadius:6,background:`${c}22`,border:`2px solid ${c}88`,boxShadow:u.acted&&u.team==="player"?"none":`0 0 8px ${c}33`}}/>
      <span style={{fontSize:sz*.46,position:"relative",zIndex:1,filter:u.acted&&u.team==="player"?"brightness(0.35) grayscale(1)":"drop-shadow(0 1px 2px rgba(0,0,0,0.9))"}}>{u.icon}</span>
      <div style={{position:"absolute",bottom:3,left:4,right:4,height:5,background:"#000",borderRadius:2,overflow:"hidden",zIndex:2}}>
        <div style={{height:"100%",width:`${hp*100}%`,background:hp>.5?"#36b37e":hp>.25?"#f0c040":"#e05252",borderRadius:2,transition:"width .3s"}}/>
      </div>
      <div style={{position:"absolute",top:1,left:3,fontSize:10,color:"#fff",fontWeight:700,textShadow:"0 0 3px #000,0 0 3px #000",zIndex:2}}>{u.level}</div>
      {u.rec_able&&<div style={{position:"absolute",top:-2,right:1,fontSize:12,zIndex:2}}>💬</div>}
    </div>);};

  const SR=({l,v,mx,c=P.blue})=>(<div style={{display:"flex",alignItems:"center",gap:5,height:20}}>
    <span style={{width:32,fontSize:12,color:P.dim,textAlign:"right"}}>{l}</span>
    <div style={{flex:1,height:6,background:"#252838",borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:`${Math.min(100,v/mx*100)}%`,background:c,borderRadius:3}}/></div>
    <span style={{width:24,fontSize:13,color:P.txt,textAlign:"right",fontWeight:700,fontFamily:"monospace"}}>{v}</span>
  </div>);

  const Info=({u})=>{if(!u)return null;const tc=u.team==="player"?P.blue:u.team==="enemy"?P.red:"#eab308",pw=u.at==="phys"?u.stats.atk+(u.wp?.atk||0):u.stats.mag+(u.wp?.mag||0);
    return (<div style={{background:P.panel,border:`1px solid ${P.bdr}`,borderTop:`3px solid ${tc}`,borderRadius:8,padding:"10px 12px",minWidth:190,maxWidth:240}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
        <span style={{fontSize:26}}>{u.icon}</span>
        <div><div style={{fontSize:15,fontWeight:700,color:P.txt}}>{u.name}</div><div style={{fontSize:12,color:P.dim}}>Lv.{u.level} {u.cls||""}{u.wp?` [${u.wp.name}]`:""}</div></div>
      </div>
      <SR l="HP" v={u.hp} mx={u.maxHp} c={u.hp/u.maxHp>.5?P.grn:P.red}/>
      <SR l="威力" v={pw} mx={30} c="#f97316"/>
      <SR l="防御" v={u.stats.def} mx={30} c="#6366f1"/>
      <SR l="抵抗" v={u.stats.res} mx={30} c="#8b5cf6"/>
      <SR l="速さ" v={u.stats.spd} mx={30} c={P.gold}/>
      <div style={{fontSize:11,color:P.dim,marginTop:3}}>移動:{u.mov} 射程:{u.rng?.join("-")}</div>
      {u.hint&&u.rec_able&&<div style={{fontSize:12,color:P.gold,marginTop:4,fontStyle:"italic",lineHeight:1.4}}>「{u.hint}」</div>}
    </div>);};

  const FC=()=>{if(!fc)return null;const{a,d,dmg,pu,td,cc,cd,cp,ct}=fc,ahA=Math.max(0,a.hp-(cc?ct:0)),dhA=Math.max(0,d.hp-td);
    return (<div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",zIndex:50,background:"rgba(8,8,18,0.96)",border:`2px solid ${P.gold}`,borderRadius:12,minWidth:310,boxShadow:"0 8px 32px rgba(0,0,0,.8)"}}>
      <div style={{textAlign:"center",padding:"7px 0",background:"linear-gradient(90deg,#1a2040,#2a1840)",borderRadius:"10px 10px 0 0",fontSize:13,color:P.gold,fontWeight:700,letterSpacing:4}}>戦 闘 予 測</div>
      <div style={{display:"flex",padding:12,gap:10}}>
        <div style={{flex:1,textAlign:"center"}}>
          <div style={{fontSize:28,marginBottom:2}}>{a.icon}</div>
          <div style={{fontSize:12,fontWeight:700,color:P.blue}}>{a.name}</div>
          <div style={{fontSize:10,color:P.dim}}>Lv.{a.level}</div>
          <div style={{margin:"6px 0",background:"#141726",borderRadius:6,padding:6}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:P.txt}}><span>HP</span><span style={{color:ahA<a.hp?P.red:P.grn}}>{a.hp}→{ahA}</span></div>
            <div style={{height:6,background:"#282b3a",borderRadius:3,margin:"4px 0",overflow:"hidden"}}><div style={{height:"100%",width:`${ahA/a.maxHp*100}%`,background:ahA/a.maxHp>.5?P.grn:P.red,borderRadius:3}}/></div>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:11}}><span style={{color:P.dim}}>威力</span><span style={{color:"#f97316",fontWeight:700}}>{dmg}{pu?" ×2":""}</span></div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",fontSize:18,color:P.gold,fontWeight:900}}>VS</div>
        <div style={{flex:1,textAlign:"center"}}>
          <div style={{fontSize:28,marginBottom:2}}>{d.icon}</div>
          <div style={{fontSize:12,fontWeight:700,color:P.red}}>{d.name}</div>
          <div style={{fontSize:10,color:P.dim}}>Lv.{d.level}</div>
          <div style={{margin:"6px 0",background:"#141726",borderRadius:6,padding:6}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:P.txt}}><span>HP</span><span style={{color:dhA<d.hp?P.red:P.grn}}>{d.hp}→{dhA}</span></div>
            <div style={{height:6,background:"#282b3a",borderRadius:3,margin:"4px 0",overflow:"hidden"}}><div style={{height:"100%",width:`${dhA/d.maxHp*100}%`,background:dhA/d.maxHp>.5?P.grn:P.red,borderRadius:3}}/></div>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:11}}><span style={{color:P.dim}}>反撃</span><span style={{color:cc?"#f97316":"#444",fontWeight:700}}>{cc?`${cd}${cp?" ×2":""}`:"-"}</span></div>
          </div>
        </div>
      </div>
      <div style={{display:"flex",gap:8,padding:"0 12px 12px",justifyContent:"center"}}>
        <button onClick={confirmAtk} style={{flex:1,padding:"9px 0",background:P.red,color:"#fff",border:"none",borderRadius:6,fontWeight:700,fontSize:14,cursor:"pointer"}}>攻撃する</button>
        <button onClick={()=>setFc(null)} style={{flex:1,padding:"9px 0",background:"#3a3d52",color:P.txt,border:"none",borderRadius:6,fontSize:13,cursor:"pointer"}}>やめる</button>
      </div>
    </div>);};

  const Banner=()=>{if(!banner)return null;const ip=banner==="player";
    return (<div style={{position:"absolute",inset:0,zIndex:60,display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none"}}>
      <div style={{background:ip?"linear-gradient(90deg,transparent,rgba(74,138,244,.88),rgba(74,138,244,.88),transparent)":"linear-gradient(90deg,transparent,rgba(224,82,82,.88),rgba(224,82,82,.88),transparent)",width:"120%",padding:"16px 0",textAlign:"center",animation:"bnrSlide 1.2s ease-out"}}>
        <div style={{fontSize:22,fontWeight:900,color:"#fff",letterSpacing:8,textShadow:"0 2px 8px rgba(0,0,0,.5)"}}>{ip?"自 軍 フ ェ イ ズ":"敵 軍 フ ェ イ ズ"}</div>
      </div>
    </div>);};

  // BATTLE SCENE - FE-style combat animation overlay
  const BattleScene=()=>{
    if(!btl)return null;
    const{atk,def,atkDmg,defDmg,atkDmgBase,defDmgBase,atkPur,defPur,atkHpAfter,defHpAfter,counter,phase}=btl;
    const isAtkPhase=phase===1, isCounterPhase=phase===2, isResult=phase===3;
    const atkColor=atk.team==="player"?P.blue:P.red;
    const defColor=def.team==="player"?P.blue:P.red;
    return (<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.82)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:80}}>
      <div style={{width:340,background:"linear-gradient(180deg,#0c0e1a,#141828)",border:`2px solid ${P.gold}`,borderRadius:14,overflow:"hidden",boxShadow:"0 8px 40px rgba(0,0,0,0.9)"}}>
        {/* Header */}
        <div style={{textAlign:"center",padding:"6px 0",background:"linear-gradient(90deg,#1a2050,#2a1850)",fontSize:12,color:P.gold,fontWeight:700,letterSpacing:3}}>
          {isAtkPhase?"攻 撃":isCounterPhase?"反 撃":"結 果"}
        </div>
        {/* Combatants */}
        <div style={{display:"flex",padding:"16px 12px",gap:8,alignItems:"center"}}>
          {/* Attacker */}
          <div style={{flex:1,textAlign:"center",opacity:isCounterPhase?0.5:1,transition:"opacity 0.3s"}}>
            <div style={{fontSize:40,marginBottom:4,animation:isAtkPhase?"atkShake 0.4s ease-in-out":"none"}}>{atk.icon}</div>
            <div style={{fontSize:12,fontWeight:700,color:atkColor}}>{atk.name}</div>
            <div style={{fontSize:10,color:P.dim}}>Lv.{atk.level}</div>
            {/* HP bar */}
            <div style={{margin:"6px auto",width:"80%"}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:P.txt}}>
                <span>HP</span>
                <span style={{color:isResult&&atkHpAfter<atk.hp?P.red:P.grn,fontWeight:700}}>
                  {isResult?atkHpAfter:atk.hp}/{atk.maxHp}
                </span>
              </div>
              <div style={{height:6,background:"#222",borderRadius:3,overflow:"hidden",marginTop:2}}>
                <div style={{height:"100%",width:`${((isResult?atkHpAfter:atk.hp)/atk.maxHp)*100}%`,background:((isResult?atkHpAfter:atk.hp)/atk.maxHp)>.5?P.grn:P.red,borderRadius:3,transition:"width 0.4s"}}/>
              </div>
            </div>
            {(isAtkPhase||isResult)&&<div style={{fontSize:16,fontWeight:900,color:"#f97316",marginTop:4}}>{atkDmgBase||atkDmg}dmg{atkPur?" ×2":""}</div>}
          </div>
          {/* VS / slash */}
          <div style={{fontSize:24,color:P.gold,fontWeight:900,animation:isAtkPhase||isCounterPhase?"none":"none"}}>
            {isAtkPhase?"💥":isCounterPhase?"💥":"⚔"}
          </div>
          {/* Defender */}
          <div style={{flex:1,textAlign:"center",opacity:isAtkPhase?0.5:1,transition:"opacity 0.3s"}}>
            <div style={{fontSize:40,marginBottom:4,animation:isCounterPhase?"atkShake 0.4s ease-in-out":isAtkPhase?"hitFlash 0.3s ease-out":"none"}}>{def.icon}</div>
            <div style={{fontSize:12,fontWeight:700,color:defColor}}>{def.name}</div>
            <div style={{fontSize:10,color:P.dim}}>Lv.{def.level}</div>
            <div style={{margin:"6px auto",width:"80%"}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:P.txt}}>
                <span>HP</span>
                <span style={{color:isResult&&defHpAfter<def.hp?P.red:P.grn,fontWeight:700}}>
                  {isResult||isAtkPhase?defHpAfter:def.hp}/{def.maxHp}
                </span>
              </div>
              <div style={{height:6,background:"#222",borderRadius:3,overflow:"hidden",marginTop:2}}>
                <div style={{height:"100%",width:`${(((isResult||isAtkPhase)?defHpAfter:def.hp)/def.maxHp)*100}%`,background:(((isResult||isAtkPhase)?defHpAfter:def.hp)/def.maxHp)>.5?P.grn:P.red,borderRadius:3,transition:"width 0.4s"}}/>
              </div>
            </div>
            {counter&&(isCounterPhase||isResult)&&<div style={{fontSize:16,fontWeight:900,color:"#60a5fa",marginTop:4}}>{defDmgBase||defDmg}dmg{defPur?" ×2":""}</div>}
            {!counter&&isResult&&<div style={{fontSize:11,color:P.dim,marginTop:4}}>反撃不可</div>}
          </div>
        </div>
        {/* Result footer */}
        {isResult && <div style={{textAlign:"center",padding:"6px 0 10px",fontSize:13,fontWeight:700,color:defHpAfter<=0?P.gold:atkHpAfter<=0?P.red:P.txt}}>
          {defHpAfter<=0?`${def.name}を撃破！`:atkHpAfter<=0?`${atk.name}が倒れた…`:""}
        </div>}
      </div>
    </div>);
  };

  const RenderMap=()=>{if(!mp)return null;const{w,h}=mp,alive=us.filter(u=>u.hp>0);
    const sz=Math.round(CL*zoom);
    return (<div style={{position:"relative",overflow:"auto",border:`2px solid ${P.bdr}`,borderRadius:4,background:"#111",maxHeight:"55vh",WebkitOverflowScrolling:"touch"}}>
      <div style={{display:"grid",gridTemplateColumns:`repeat(${w},${sz}px)`,gridTemplateRows:`repeat(${h},${sz}px)`,width:w*sz,height:h*sz}}>
        {Array.from({length:h}).map((_,y)=>Array.from({length:w}).map((_,x)=>{
          const u=alive.find(u2=>u2.x===x&&u2.y===y),isMov=mcs.some(c=>c.x===x&&c.y===y);
          const ac=acs.find(c=>c.x===x&&c.y===y);
          const isAtkPreview=ac&&ac.preview; // T10
          const isAtkReal=ac&&!ac.preview;
          const isSel=sel?.x===x&&sel?.y===y;
          const isDr=mp.dr?.some(d=>d.x===x&&d.y===y),isWp=mp.wd?.x===x&&mp.wd?.y===y;
          const hasDm=dpop?.x===x&&dpop?.y===y;
          let bg=(x+y)%2===0?P.t1:P.t2;
          if(isMov&&!u)bg=P.movT;
          if(isAtkPreview)bg=P.atkPreview; // T10: lighter
          if(isAtkReal)bg=P.atkTarget; // T10: brighter
          if(isSel)bg=P.selT;
          // T3: highlight targets during targeting
          const isTargetable=targeting==="atk"&&isAtkReal;

          return (<div key={`${x}-${y}`} onClick={()=>{if(fc)return;click(x,y);}}
            onMouseEnter={()=>{const hu=alive.find(u2=>u2.x===x&&u2.y===y);if(hu)setHov(hu);}}
            // T11: don't clear hover on leave, only clear when hovering empty or leaving map
            onMouseLeave={()=>{if(!alive.find(u2=>u2.x===x&&u2.y===y))setHov(null);}}
            style={{width:sz,height:sz,background:bg,borderRight:"1px solid rgba(255,255,255,.05)",borderBottom:"1px solid rgba(255,255,255,.05)",display:"flex",alignItems:"center",justifyContent:"center",cursor:isTargetable?"crosshair":"pointer",position:"relative",transition:"background .15s"}}>
            {(isDr||isWp)&&<span style={{fontSize:u?10:14,opacity:u?.5:.7,position:"absolute",top:u?0:undefined,right:u?0:undefined,zIndex:u?3:0}}>{isWp?"⚔":"💊"}</span>}
            {u&&<Chip u={u} sz={sz}/>}
            {hasDm&&<div style={{position:"absolute",top:-4,left:"50%",transform:"translateX(-50%)",color:"#ff4444",fontWeight:700,fontSize:16,textShadow:"0 0 4px #000",animation:"dmgF .9s ease-out forwards",zIndex:10}}>-{dpop.v}</div>}
            {/* T3: pulsing border for targetable cells */}
            {isTargetable&&<div style={{position:"absolute",inset:1,border:"2px solid #ff6666",borderRadius:4,animation:"pulse 1s infinite",zIndex:5}}/>}
          </div>);
        }))}
      </div>
      <FC/><Banner/>
    </div>);};

  const CmdMenu=()=>{if(!menu||!mp)return null;const sz=Math.round(CL*zoom);
    return (<div style={{position:"absolute",zIndex:40,left:menu.x*sz>mp.w*sz/2?8:mp.w*sz-148,top:Math.min(menu.y*sz,mp.h*sz-menu.items.length*44-16)}}>
      <div style={{background:"rgba(18,20,34,.97)",border:`2px solid ${P.gold}`,borderRadius:8,overflow:"hidden",minWidth:130,boxShadow:"0 4px 20px rgba(0,0,0,.6)"}}>
        {menu.items.map((it,i)=>(<button key={it.k} onClick={()=>menuAct(it.k)} style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"12px 18px",background:i%2===0?"rgba(255,255,255,.02)":"transparent",border:"none",borderBottom:"1px solid rgba(255,255,255,.05)",color:P.txt,fontSize:15,cursor:"pointer",textAlign:"left",fontWeight:it.k==="atk"?"bold":"normal"}}
          onMouseOver={e=>e.currentTarget.style.background="rgba(74,138,244,.2)"} onMouseOut={e=>e.currentTarget.style.background=i%2===0?"rgba(255,255,255,.02)":"transparent"}>
          <span style={{fontSize:16}}>{it.ic}</span>{it.l}
        </button>))}
      </div>
    </div>);};

  const css=`@keyframes dmgF{0%{opacity:1;transform:translateX(-50%) translateY(0)}100%{opacity:0;transform:translateX(-50%) translateY(-24px)}}@keyframes bnrSlide{0%{transform:translateX(-100%);opacity:0}15%{transform:translateX(0);opacity:1}85%{transform:translateX(0);opacity:1}100%{transform:translateX(100%);opacity:0}}@keyframes pulse{0%,100%{opacity:.6}50%{opacity:1}}@keyframes atkShake{0%{transform:translateX(0)}20%{transform:translateX(12px)}40%{transform:translateX(-8px)}60%{transform:translateX(6px)}80%{transform:translateX(-3px)}100%{transform:translateX(0)}}@keyframes hitFlash{0%{filter:brightness(3)}50%{filter:brightness(0.5)}100%{filter:brightness(1)}}button:active{transform:scale(.97)}::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:#444;border-radius:2px}`;
  const F="'Hiragino Kaku Gothic ProN','Noto Sans JP',sans-serif";

  if(!ld)return <div style={{minHeight:"100vh",background:P.bg,display:"flex",alignItems:"center",justifyContent:"center",color:P.dim,fontFamily:F}}><style>{css}</style>ロード中...</div>;

  if(ph==="title")return (<div style={{minHeight:"100vh",background:`linear-gradient(180deg,${P.bg},#0d1117)`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:F,padding:20}}><style>{css}</style>
    <div style={{fontSize:56,marginBottom:4}}>🧙🤺</div>
    <h1 style={{fontSize:24,fontWeight:900,color:P.txt,margin:"0 0 4px",letterSpacing:2}}>ようくんそうくんの大冒険</h1>
    <div style={{height:28}}/>
    {runs>0&&<div style={{background:"rgba(255,255,255,.04)",borderRadius:8,padding:"8px 20px",marginBottom:16,border:`1px solid ${P.bdr}`,fontSize:12,color:P.dim}}>周回:{runs} | 最高:Stage{bst} | 総GP:{tgp}</div>}
    <button onClick={startGame} style={{padding:"14px 52px",fontSize:17,fontWeight:700,background:P.blue,color:"#fff",border:"none",borderRadius:8,cursor:"pointer",boxShadow:`0 4px 16px ${P.blue}44`}}>{runs>0?"タイムリープ開始":"ぼうけんスタート"}</button>
    {clr&&<button onClick={()=>{setIfl(1);setStg(100);setKills(0);setSnap(null);init(0,true,1);}} style={{marginTop:10,padding:"10px 36px",fontSize:14,background:"#7c3aed",color:"#fff",border:"none",borderRadius:8,cursor:"pointer"}}>無限回廊に挑む</button>}
    {runs>0&&<button onClick={()=>{if(confirm("セーブデータ削除？")){localStorage.removeItem("srpg4");location.reload();}}} style={{marginTop:24,padding:"4px 16px",fontSize:11,background:"transparent",color:"#444",border:"1px solid #333",borderRadius:4,cursor:"pointer"}}>データ削除</button>}
  </div>);

  if(ph==="alloc")return (<div style={{minHeight:"100vh",background:P.bg,display:"flex",flexDirection:"column",alignItems:"center",padding:20,fontFamily:F}}><style>{css}</style>
    <h2 style={{color:P.gold,fontSize:20,margin:"0 0 4px"}}>ガッツポイント割り振り</h2>
    <p style={{color:P.dim,fontSize:13,marginBottom:16}}>残り: <span style={{color:P.gold,fontSize:20,fontWeight:700}}>{gpp}</span> GP</p>
    {["youkun","soukun","batta"].map(cid=>{const ch=BC[cid],bo=gb[cid]||{},pe=pnd[cid]||{};
      return (<div key={cid} style={{background:P.panel,borderRadius:8,padding:"10px 14px",marginBottom:10,width:"100%",maxWidth:380,border:`1px solid ${P.bdr}`}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}><span style={{fontSize:22}}>{ch.icon}</span><span style={{color:P.txt,fontWeight:700,fontSize:14}}>{ch.name}</span><span style={{color:P.dim,fontSize:11}}>{ch.cls}</span></div>
        {Object.keys(SN).map(s=>{const total=ch.bs[s]+(bo[s]||0)+(pe[s]||0);return (<div key={s} style={{display:"flex",alignItems:"center",gap:4,marginBottom:2}}>
          <span style={{width:28,fontSize:10,color:P.dim,textAlign:"right"}}>{SN[s]}</span>
          <div style={{flex:1,height:5,background:"#252838",borderRadius:2,overflow:"hidden"}}><div style={{height:"100%",width:`${total/STAT_CAPS[s]*100}%`,background:(pe[s]||0)>0?P.gold:P.blue,borderRadius:2}}/></div>
          <span style={{width:20,color:P.txt,fontSize:11,textAlign:"right",fontFamily:"monospace"}}>{total}</span>
          {(pe[s]||0)>0&&<span style={{color:P.gold,fontSize:9}}>+{pe[s]}</span>}
          <button onClick={()=>allocG(cid,s)} disabled={gpp<=0||total>=STAT_CAPS[s]} style={{width:20,height:20,borderRadius:4,border:"none",background:gpp>0&&total<STAT_CAPS[s]?P.gold:"#333",color:"#000",fontWeight:700,cursor:gpp>0?"pointer":"default",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
        </div>);})}
      </div>);
    })}
    <div style={{display:"flex",gap:8,marginTop:12}}>
      {/* T9: reset button */}
      <button onClick={resetAlloc} style={{padding:"12px 24px",fontSize:14,background:"#3a3d52",color:P.txt,border:"none",borderRadius:8,cursor:"pointer"}}>リセット</button>
      <button onClick={confirmAlloc} style={{padding:"12px 44px",fontSize:15,fontWeight:700,background:gpp===0?P.grn:"#555",color:"#fff",border:"none",borderRadius:8,cursor:"pointer"}}>{gpp===0?"決定！":`決定（残${gpp}）`}</button>
    </div>
  </div>);

  if(ph==="pre")return (<div style={{minHeight:"100vh",background:P.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:20,fontFamily:F,textAlign:"center"}}><style>{css}</style>
    <h2 style={{color:P.txt,fontSize:20,marginBottom:12}}>{mp?.name}</h2>
    <div style={{background:P.panel,borderRadius:8,padding:20,maxWidth:420,border:`1px solid ${P.bdr}`,marginBottom:24,whiteSpace:"pre-line"}}><p style={{color:"#ddd",fontSize:15,lineHeight:1.8}}>{stxt}</p></div>
    <button onClick={()=>showBnr("player",()=>setPh("battle"))} style={{padding:"14px 48px",fontSize:18,fontWeight:700,background:P.red,color:"#fff",border:"none",borderRadius:8,cursor:"pointer",boxShadow:`0 4px 16px ${P.red}44`}}>出 撃</button>
  </div>);

  if(ph==="battle"||ph==="ep"){const pu=us.filter(u=>u.team==="player"&&u.hp>0),ec=us.filter(u=>u.team==="enemy"&&u.hp>0).length;
    return (<div style={{minHeight:"100vh",background:P.bg,display:"flex",flexDirection:"column",alignItems:"center",fontFamily:F,padding:"6px 4px"}}><style>{css}</style>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",width:"100%",maxWidth:640,marginBottom:6,padding:"0 6px"}}>
        <span style={{color:P.txt,fontSize:15,fontWeight:700}}>{mp?.name}</span>
        <div style={{display:"flex",gap:12,fontSize:14,alignItems:"center"}}><span style={{color:P.blue}}>ターン {turn}</span><span style={{color:P.red}}>敵 {ec}体</span>
          {targeting&&<span style={{color:P.gold,fontWeight:700,fontSize:13,animation:"pulse 1s infinite"}}>▶ {targeting==="atk"?"攻撃":"話す"}対象を選択</span>}
        </div>
      </div>
      <div style={{position:"relative"}} onMouseLeave={()=>setHov(null)}>
        <RenderMap/><CmdMenu/>
        <div style={{position:"absolute",top:4,right:4,zIndex:45,display:"flex",gap:4}}>
          <button onClick={()=>setZoom(z=>Math.max(0.5,z-0.15))} style={{width:32,height:32,borderRadius:6,border:"none",background:"rgba(0,0,0,0.7)",color:"#fff",fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>−</button>
          <button onClick={()=>setZoom(z=>Math.min(1.5,z+0.15))} style={{width:32,height:32,borderRadius:6,border:"none",background:"rgba(0,0,0,0.7)",color:"#fff",fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
        </div>
      </div>
      <div style={{display:"flex",gap:8,marginTop:8,width:"100%",maxWidth:640,alignItems:"flex-start",flexWrap:"wrap"}}>
        {(hov||sel)?<Info u={hov||sel}/>:
          <div style={{background:P.panel,border:`1px solid ${P.bdr}`,borderRadius:8,padding:"12px 14px",minWidth:190,maxWidth:240,textAlign:"center"}}>
            <p style={{color:P.dim,fontSize:13,margin:0}}>味方をタップして選択<br/>敵をタップでステータス確認</p>
          </div>
        }
        <div style={{flex:1,background:P.panel,borderRadius:8,padding:8,border:`1px solid ${P.bdr}`,minWidth:150}}>
          <div style={{fontSize:12,color:P.dim,marginBottom:5,fontWeight:700}}>パーティ</div>
          {pu.map(u=>(<div key={u.uid} style={{display:"flex",alignItems:"center",gap:6,marginBottom:5,opacity:u.acted?.35:1}}>
            <span style={{fontSize:18}}>{u.icon}</span>
            <div style={{flex:1}}><div style={{fontSize:13,color:P.txt,fontWeight:u.acted?400:600}}>{u.name} Lv.{u.level}</div>
              <div style={{height:5,background:"#252838",borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:`${u.hp/u.maxHp*100}%`,background:u.hp/u.maxHp>.5?P.grn:u.hp/u.maxHp>.25?P.gold:P.red,borderRadius:3}}/></div>
            </div><span style={{fontSize:12,color:P.dim,fontFamily:"monospace"}}>{u.hp}/{u.maxHp}</span>
          </div>))}
        </div>
        <button onClick={endTurn} disabled={anim||ph==="ep"} style={{padding:"12px 24px",fontSize:15,fontWeight:700,background:pu.every(u=>u.acted)?"#f97316":"#3a3d52",color:"#fff",border:"none",borderRadius:8,cursor:anim?"default":"pointer",alignSelf:"flex-start",boxShadow:pu.every(u=>u.acted)?"0 2px 12px rgba(249,115,22,.3)":"none"}}>ターン終了</button>
      </div>
      <div ref={lr} style={{marginTop:6,width:"100%",maxWidth:640,maxHeight:100,overflowY:"auto",background:"rgba(0,0,0,.5)",borderRadius:8,padding:"6px 12px",border:`1px solid ${P.bdr}`}}>
        {logs.map((l,i)=><div key={i} style={{fontSize:14,color:"#c8cce0",lineHeight:1.6}}>{l}</div>)}
      </div>
      {lvInfo&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.75)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:70}} onClick={()=>setLvInfo(null)}>
        <div style={{background:P.panel,borderRadius:12,padding:24,border:`2px solid ${P.gold}`,textAlign:"center",minWidth:260}}>
          <div style={{fontSize:36}}>🎉</div><h3 style={{color:P.gold,margin:"6px 0",fontSize:20}}>レベルアップ！</h3>
          <p style={{color:P.txt,fontSize:16,marginBottom:8}}>{lvInfo.n} → Lv.{lvInfo.lv}</p>
          {Object.keys(SN).map(s=>{const d=lvInfo.ns[s]-lvInfo.os[s];return d>0?<div key={s} style={{color:P.grn,fontSize:15,lineHeight:1.6}}>{SN[s]} +{d}</div>:null;})}
          <p style={{color:P.dim,fontSize:12,marginTop:10}}>タップで閉じる</p>
        </div></div>}
      {ccP&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.75)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:70}}>
        <div style={{background:P.panel,borderRadius:12,padding:24,border:"2px solid #a855f7",textAlign:"center",minWidth:280}}>
          <div style={{fontSize:36}}>✨</div><h3 style={{color:"#a855f7",margin:"6px 0 14px",fontSize:20}}>クラスチェンジ</h3>
          <p style={{color:P.txt,fontSize:16,marginBottom:20}}>{ccP.n} → {CC_D[ccP.to]?.name}</p>
          <div style={{display:"flex",gap:10,justifyContent:"center"}}>
            <button onClick={()=>doCC(ccP.uid)} style={{padding:"10px 24px",fontSize:15,background:"#a855f7",color:"#fff",border:"none",borderRadius:8,fontWeight:700,cursor:"pointer"}}>チェンジ！</button>
            <button onClick={()=>setCcP(null)} style={{padding:"10px 24px",fontSize:15,background:"#3a3d52",color:P.txt,border:"none",borderRadius:8,cursor:"pointer"}}>後で</button>
          </div></div></div>}
      {modal?.t==="items"&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.7)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:70}}>
        <div style={{background:P.panel,borderRadius:12,padding:20,border:`1px solid ${P.bdr}`,minWidth:260}}>
          <h3 style={{color:P.txt,margin:"0 0 12px",fontSize:18}}>アイテム</h3>
          {modal.u.items?.map((it,i)=>(<button key={i} onClick={()=>useIt(i)} style={{display:"block",width:"100%",padding:"12px 14px",marginBottom:6,background:"rgba(255,255,255,.04)",border:`1px solid ${P.bdr}`,borderRadius:8,color:P.txt,cursor:"pointer",textAlign:"left",fontSize:15}}>{it.name} — {it.desc}</button>))}
          <button onClick={()=>setModal(null)} style={{marginTop:8,padding:"10px 20px",background:"#3a3d52",color:P.txt,border:"none",borderRadius:8,cursor:"pointer",fontSize:14}}>閉じる</button>
        </div></div>}
      {modal?.t==="replace"&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.7)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:70}}>
        <div style={{background:P.panel,borderRadius:12,padding:20,border:"1px solid #f97316",minWidth:280}}>
          <h3 style={{color:"#f97316",margin:"0 0 10px",fontSize:16}}>持ち物がいっぱい！</h3>
          <p style={{color:P.dim,fontSize:14,marginBottom:10}}>「{modal.ni.name}」と入れ替え？</p>
          {(()=>{const u=us.find(u2=>u2.uid===modal.uid);return u?.items?.map((it,i)=>(<button key={i} onClick={()=>{const ni=[...u.items];ni[i]={...modal.ni};setUs(p=>p.map(u2=>u2.uid===u.uid?{...u2,items:ni}:u2));log(`${it.name}→${modal.ni.name}`);setMp(p=>({...p,dr:p.dr.filter(d=>!(d.x===u.x&&d.y===u.y))}));setModal(null);}} style={{display:"block",width:"100%",padding:"10px 14px",marginBottom:6,background:"#2a1a1a",border:"1px solid #444",borderRadius:8,color:P.txt,cursor:"pointer",textAlign:"left",fontSize:14}}>捨てる: {it.name}</button>));})()}
          <button onClick={()=>{log("拾わなかった");setModal(null);}} style={{marginTop:8,padding:"10px 20px",background:"#3a3d52",color:P.txt,border:"none",borderRadius:8,cursor:"pointer",fontSize:14}}>拾わない</button>
        </div></div>}
      <BattleScene/>
    </div>);
  }

  if(ph==="win")return (<div style={{minHeight:"100vh",background:P.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:20,fontFamily:F,textAlign:"center"}}><style>{css}</style>
    <div style={{fontSize:48}}>🏆</div><h2 style={{color:P.gold,fontSize:22,margin:"8px 0"}}>{mp?.name} クリア！</h2>
    <button onClick={nextStg} style={{padding:"12px 40px",fontSize:15,fontWeight:700,background:P.grn,color:"#fff",border:"none",borderRadius:8,cursor:"pointer",marginTop:16}}>次のステージへ</button>
  </div>);

  if(ph==="lose"){const gp=stg*3+Math.floor(kills/5)+Math.floor(us.filter(u=>u.team==="player").reduce((a,u)=>a+u.level,0)/10);
    return (<div style={{minHeight:"100vh",background:`linear-gradient(180deg,#1a0808,${P.bg})`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:20,fontFamily:F,textAlign:"center"}}><style>{css}</style>
      <div style={{fontSize:48}}>⏰</div><h2 style={{color:P.red,fontSize:22,margin:"8px 0"}}>全滅…タイムリープ！</h2>
      <div style={{background:P.panel,borderRadius:8,padding:16,marginBottom:16,minWidth:260,border:`1px solid ${P.bdr}`}}>
        <div style={{color:P.dim,fontSize:12,marginBottom:6}}>ガッツポイント</div>
        <div style={{color:P.txt,fontSize:12}}>Stage {stg}×3={stg*3}</div>
        <div style={{color:P.txt,fontSize:12}}>撃破 {kills}÷5={Math.floor(kills/5)}</div>
        <div style={{color:P.gold,fontSize:18,fontWeight:700,marginTop:8}}>+{gp} GP</div>
      </div>
      <button onClick={timeLeap} style={{padding:"12px 40px",fontSize:15,fontWeight:700,background:"#f97316",color:"#fff",border:"none",borderRadius:8,cursor:"pointer",boxShadow:"0 4px 16px rgba(249,115,22,.4)"}}>タイムリープ</button>
    </div>);
  }

  if(ph==="end")return (<div style={{minHeight:"100vh",background:"linear-gradient(180deg,#0a0a2a,#1a0a3a)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:20,fontFamily:F,textAlign:"center"}}><style>{css}</style>
    <div style={{fontSize:64}}>👑</div><h1 style={{color:P.gold,fontSize:28,margin:"8px 0",textShadow:`0 0 20px ${P.gold}44`}}>クリアおめでとう！</h1>
    <p style={{color:"#ccc",fontSize:14,maxWidth:400,marginBottom:16}}>幾度ものタイムリープを乗り越え、ついに魔王を打ち倒した！</p>
    <div style={{background:P.panel,borderRadius:8,padding:12,border:`1px solid ${P.bdr}`,marginBottom:16}}><div style={{color:P.dim,fontSize:12}}>総周回:{runs+1} | 総GP:{tgp} | 撃破:{kills}</div></div>
    <div style={{display:"flex",gap:10}}>
      <button onClick={()=>setPh("title")} style={{padding:"10px 28px",fontSize:14,background:P.blue,color:"#fff",border:"none",borderRadius:8,cursor:"pointer"}}>タイトルへ</button>
      <button onClick={()=>{setClr(true);setIfl(1);setStg(100);setKills(0);setSnap(null);init(0,true,1);}} style={{padding:"10px 28px",fontSize:14,background:"#7c3aed",color:"#fff",border:"none",borderRadius:8,cursor:"pointer"}}>無限回廊</button>
    </div>
  </div>);

  return null;
}
