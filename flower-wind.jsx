import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import * as d3 from "d3";
import * as Tone from "tone";

const C={bg:"#f4ece0",bg2:"#ebe0d0",accent:"#c06040",accent2:"#a87050",
  text:"#3a2818",tl:"#8a7a68",border:"#4a8a98",river:"#4a88a0",mtn:"#8a7a5a"};
const SM={spring:{l:"春",i:"🌸",c:"#d4756b",bg:"#f0e8e0",poem:"桃花一簇开无主\n可爱深红爱浅红",poet:"杜甫",scene:"春风拂面·万物复苏"},
  summer:{l:"夏",i:"🌿",c:"#5a8a50",bg:"#e8f0e0",poem:"小荷才露尖尖角\n早有蜻蜓立上头",poet:"杨万里",scene:"蝉鸣夏日·碧荷连天"},
  autumn:{l:"秋",i:"🍁",c:"#c8703a",bg:"#f0e8d8",poem:"停车坐爱枫林晚\n霜叶红于二月花",poet:"杜牧",scene:"秋高气爽·层林尽染"},
  winter:{l:"冬",i:"❄",c:"#6a8aaa",bg:"#e8eef4",poem:"忽如一夜春风来\n千树万树梨花开",poet:"岑参",scene:"银装素裹·暗香浮动"}};

// ── Species-specific SVG icons ──
function FloraIcon({species,size,color}){
  const s=size||16;const co=color||"#e080a0";
  const icons={
    "樱花":()=><svg viewBox="0 0 24 24" width={s} height={s}><g fill={co} opacity=".9">
      <ellipse cx="12" cy="6" rx="3" ry="4.5" transform="rotate(0,12,12)"/>
      <ellipse cx="12" cy="6" rx="3" ry="4.5" transform="rotate(72,12,12)"/>
      <ellipse cx="12" cy="6" rx="3" ry="4.5" transform="rotate(144,12,12)"/>
      <ellipse cx="12" cy="6" rx="3" ry="4.5" transform="rotate(216,12,12)"/>
      <ellipse cx="12" cy="6" rx="3" ry="4.5" transform="rotate(288,12,12)"/>
      <circle cx="12" cy="12" r="2.5" fill="#f8e0a0"/></g></svg>,
    "桃花":()=><svg viewBox="0 0 24 24" width={s} height={s}><g fill={co} opacity=".9">
      <ellipse cx="12" cy="5" rx="3.5" ry="5" transform="rotate(0,12,12)"/>
      <ellipse cx="12" cy="5" rx="3.5" ry="5" transform="rotate(72,12,12)"/>
      <ellipse cx="12" cy="5" rx="3.5" ry="5" transform="rotate(144,12,12)"/>
      <ellipse cx="12" cy="5" rx="3.5" ry="5" transform="rotate(216,12,12)"/>
      <ellipse cx="12" cy="5" rx="3.5" ry="5" transform="rotate(288,12,12)"/>
      <circle cx="12" cy="12" r="2" fill="#ffe0e8"/></g></svg>,
    "梅花":()=><svg viewBox="0 0 24 24" width={s} height={s}><g fill={co} opacity=".9">
      <circle cx="12" cy="5.5" r="3.2" transform="rotate(0,12,12)"/>
      <circle cx="12" cy="5.5" r="3.2" transform="rotate(72,12,12)"/>
      <circle cx="12" cy="5.5" r="3.2" transform="rotate(144,12,12)"/>
      <circle cx="12" cy="5.5" r="3.2" transform="rotate(216,12,12)"/>
      <circle cx="12" cy="5.5" r="3.2" transform="rotate(288,12,12)"/>
      <circle cx="12" cy="12" r="2.5" fill="#ffe088"/></g></svg>,
    "牡丹":()=><svg viewBox="0 0 24 24" width={s} height={s}><g fill={co} opacity=".85">
      {[0,45,90,135,180,225,270,315].map(a=><ellipse key={a} cx="12" cy="6" rx="3.5" ry="4.5" transform={`rotate(${a},12,12)`}/>)}
      <circle cx="12" cy="12" r="3.5" fill={co} opacity=".6"/>
      <circle cx="12" cy="12" r="2" fill="#f8d870"/></g></svg>,
    "芍药":()=><svg viewBox="0 0 24 24" width={s} height={s}><g fill={co} opacity=".85">
      {[0,60,120,180,240,300].map(a=><ellipse key={a} cx="12" cy="5.5" rx="3" ry="5" transform={`rotate(${a},12,12)`}/>)}
      <circle cx="12" cy="12" r="2.5" fill="#f0d080"/></g></svg>,
    "杜鹃花":()=><svg viewBox="0 0 24 24" width={s} height={s}><g fill={co} opacity=".9">
      {[0,72,144,216,288].map(a=><path key={a} d="M12,3 Q15,7 14,12 Q12,10 10,12 Q9,7 12,3" transform={`rotate(${a},12,12)`}/>)}
      <circle cx="12" cy="12" r="2" fill="#f8e0a0"/><circle cx="11" cy="11" r=".5" fill="#333" opacity=".3"/>
      </g></svg>,
    "高山杜鹃":()=>icons["杜鹃花"](),
    "云锦杜鹃":()=>icons["杜鹃花"](),
    "郁金香":()=><svg viewBox="0 0 24 24" width={s} height={s}><g fill={co} opacity=".9">
      <path d="M12,2 Q16,6 15,12 Q12,14 12,14 Q12,14 9,12 Q8,6 12,2"/>
      <path d="M12,14 L12,22" stroke="#6a9a50" strokeWidth="1.5" fill="none"/>
      <path d="M12,17 Q9,15 7,16" stroke="#6a9a50" strokeWidth="1" fill="none"/>
      </g></svg>,
    "油菜花":()=><svg viewBox="0 0 24 24" width={s} height={s}><g fill={co} opacity=".9">
      {[0,90,180,270].map(a=><ellipse key={a} cx="12" cy="8" rx="2.5" ry="3.5" transform={`rotate(${a},12,12)`}/>)}
      <circle cx="12" cy="12" r="2" fill="#e8c020"/>
      </g></svg>,
    "野杏花":()=>icons["桃花"](),
    "蓝花楹":()=><svg viewBox="0 0 24 24" width={s} height={s}><g fill={co} opacity=".85">
      {[0,51,103,154,206,257,309].map(a=><ellipse key={a} cx="12" cy="7" rx="2" ry="3.5" transform={`rotate(${a},12,12)`}/>)}
      <circle cx="12" cy="12" r="1.5" fill="#e0d0f0"/></g></svg>,
    "梨花":()=><svg viewBox="0 0 24 24" width={s} height={s}><g fill="#f0ece4" opacity=".95" stroke={co} strokeWidth=".3">
      {[0,72,144,216,288].map(a=><ellipse key={a} cx="12" cy="6" rx="3" ry="4" transform={`rotate(${a},12,12)`}/>)}
      <circle cx="12" cy="12" r="2" fill="#d0e8a0"/></g></svg>,
    "荷花":()=><svg viewBox="0 0 24 24" width={s} height={s}><g fill={co} opacity=".85">
      <ellipse cx="12" cy="8" rx="3" ry="6"/>
      <ellipse cx="8" cy="10" rx="2.5" ry="5" transform="rotate(-20,8,10)"/>
      <ellipse cx="16" cy="10" rx="2.5" ry="5" transform="rotate(20,16,10)"/>
      <ellipse cx="6" cy="12" rx="2" ry="4" transform="rotate(-35,6,12)"/>
      <ellipse cx="18" cy="12" rx="2" ry="4" transform="rotate(35,18,12)"/>
      <circle cx="12" cy="14" r="2" fill="#f0d858"/></g></svg>,
    "薰衣草":()=><svg viewBox="0 0 24 24" width={s} height={s}><g fill={co} opacity=".85">
      <path d="M12,22 L12,8" stroke="#7a9a50" strokeWidth="1.2" fill="none"/>
      {[3,5,7,9,11].map(y=><g key={y}><ellipse cx="10" cy={y} rx="2" ry="1.2" fill={co}/>
        <ellipse cx="14" cy={y} rx="2" ry="1.2" fill={co}/></g>)}
      </g></svg>,
    "格桑花":()=><svg viewBox="0 0 24 24" width={s} height={s}><g fill={co} opacity=".9">
      {[0,45,90,135,180,225,270,315].map(a=><ellipse key={a} cx="12" cy="7" rx="2" ry="4" transform={`rotate(${a},12,12)`}/>)}
      <circle cx="12" cy="12" r="2.5" fill="#f0d060"/></g></svg>,
    "野花草甸":()=><svg viewBox="0 0 24 24" width={s} height={s}><g opacity=".85">
      <path d="M6,22 Q6,14 8,10" stroke="#6a9a50" strokeWidth="1" fill="none"/>
      <path d="M12,22 Q12,12 12,8" stroke="#7aaa50" strokeWidth="1" fill="none"/>
      <path d="M18,22 Q18,14 16,10" stroke="#6a9a50" strokeWidth="1" fill="none"/>
      <circle cx="8" cy="9" r="2.5" fill={co}/><circle cx="12" cy="7" r="2.5" fill="#e8a040"/>
      <circle cx="16" cy="9" r="2.5" fill="#d070a0"/></g></svg>,
    "银杏":()=><svg viewBox="0 0 24 24" width={s} height={s}><g fill={co} opacity=".9">
      <path d="M12,20 L12,12 Q6,8 4,4 Q8,2 12,6 Q16,2 20,4 Q18,8 12,12" fill={co}/>
      <path d="M12,12 L12,22" stroke="#8a7a40" strokeWidth="1.2" fill="none"/>
      </g></svg>,
    "胡杨":()=><svg viewBox="0 0 24 24" width={s} height={s}><g fill={co} opacity=".9">
      <path d="M12,22 L12,10" stroke="#8a6a30" strokeWidth="2" fill="none"/>
      <circle cx="8" cy="8" r="3.5" fill={co}/><circle cx="16" cy="7" r="3" fill={co}/>
      <circle cx="12" cy="5" r="3.5" fill={co} opacity=".8"/>
      </g></svg>,
    "彩林":()=><svg viewBox="0 0 24 24" width={s} height={s}><g opacity=".85">
      <circle cx="7" cy="9" r="4" fill="#d86830"/><circle cx="17" cy="8" r="3.5" fill="#e8a030"/>
      <circle cx="12" cy="6" r="4" fill="#c84020"/><circle cx="12" cy="4" r="2.5" fill="#d8a828"/>
      <path d="M12,22 L12,12" stroke="#6a5030" strokeWidth="1.5" fill="none"/>
      </g></svg>,
    "白桦林":()=><svg viewBox="0 0 24 24" width={s} height={s}><g opacity=".85">
      <rect x="11" y="8" width="2" height="14" rx="1" fill="#e8e0d0"/>
      <rect x="11" y="10" width="2" height="1" fill="#555" opacity=".3"/>
      <rect x="11" y="14" width="2" height="1" fill="#555" opacity=".3"/>
      <circle cx="12" cy="6" r="5" fill={co}/>
      </g></svg>,
    "黄栌":()=>icons["彩林"](),
    "红枫":()=><svg viewBox="0 0 24 24" width={s} height={s}><g fill={co} opacity=".9">
      <path d="M12,2 L14,8 L20,8 L15,12 L17,19 L12,15 L7,19 L9,12 L4,8 L10,8Z"/>
      <path d="M12,15 L12,22" stroke="#8a5a30" strokeWidth="1" fill="none"/>
      </g></svg>,
    "雾凇":()=><svg viewBox="0 0 24 24" width={s} height={s}><g fill={co} opacity=".8">
      <path d="M12,2 L12,22 M5,7 L19,17 M19,7 L5,17" stroke={co} strokeWidth="1.5" fill="none"/>
      <circle cx="12" cy="2" r="1.5" fill={co}/><circle cx="12" cy="22" r="1.5" fill={co}/>
      <circle cx="5" cy="7" r="1.5" fill={co}/><circle cx="19" cy="17" r="1.5" fill={co}/>
      <circle cx="19" cy="7" r="1.5" fill={co}/><circle cx="5" cy="17" r="1.5" fill={co}/>
      <circle cx="12" cy="12" r="2" fill={co}/>
      </g></svg>,
    "冬樱花":()=>icons["樱花"](),
  };
  const render=icons[species];
  if(render)return render();
  // Fallback: generic flower
  return <svg viewBox="0 0 24 24" width={s} height={s}><g fill={co} opacity=".8">
    {[0,72,144,216,288].map(a=><ellipse key={a} cx="12" cy="7" rx="2.5" ry="4" transform={`rotate(${a},12,12)`}/>)}
    <circle cx="12" cy="12" r="2" fill="#f0d870"/></g></svg>;
}

// ── Full-year accumulated temp estimates (realistic) ──
// For "全年" mode: what the AT was at peak bloom time last year
const FULL_YEAR_AT={
  // Spring (values at their bloom peak)
  1:325,2:288,3:260,4:295,5:305,6:315,7:340,8:275,9:250,10:305,
  11:350,12:380,13:310,14:340,15:300,16:295,
  // Summer (AT at June-July peak)
  20:510,21:660,22:430,23:390,24:370,25:640,
  // Autumn (cold accumulation equivalent at peak)
  40:410,41:375,42:375,43:360,44:385,45:395,46:375,47:385,48:365,
  // Winter (AT at Dec-Jan)
  60:32,61:125,
};

function calcSt(at,th,s,mode){
  if(mode==="current"){
    const cs=getSeason();
    if(s!==cs){
      if(s==="winter"&&cs!=="winter")return{st:"季节已过",l:0};
      if(["summer","autumn"].includes(s)&&cs==="spring")return{st:"未到花季",l:0};
      return{st:"休眠中",l:0};
    }
  }
  // In full-year mode or matching season: calculate normally
  const p=th>0?at/th:0;
  if(p>=1.2)return{st:"已谢",l:0};if(p>=1)return{st:"盛花期",l:4};
  if(p>=.85)return{st:"初花期",l:3};if(p>=.7)return{st:"含苞待放",l:2};
  return{st:"积温中",l:1};
}

function getSeason(){const m=new Date().getMonth();if(m>=2&&m<=4)return"spring";if(m>=5&&m<=7)return"summer";if(m>=8&&m<=10)return"autumn";return"winter";}

const FLORA=[
  {id:1,n:"洛阳·国花园",sp:"牡丹",lat:34.62,lon:112.45,th:320,s:"spring",c:"#e868a0",rg:"华中",po:"唯有牡丹真国色",tp:"宜：国色天香"},
  {id:2,n:"毕节·百里杜鹃",sp:"杜鹃花",lat:27.30,lon:105.28,th:280,s:"spring",c:"#e04070",rg:"西南",po:"百里花海映天红",tp:"宜：花海骑行"},
  {id:3,n:"伊犁·杏花沟",sp:"野杏花",lat:43.35,lon:82.65,th:250,s:"spring",c:"#f0b8c0",rg:"西北",po:"杏花春雨满天山",tp:"宜：策马花谷"},
  {id:4,n:"杭州·太子湾",sp:"郁金香",lat:30.24,lon:120.15,th:290,s:"spring",c:"#e84060",rg:"华东",po:"西湖春色满太子",tp:"宜：湖畔漫步"},
  {id:5,n:"林芝·嘎拉",sp:"桃花",lat:29.65,lon:94.36,th:300,s:"spring",c:"#f8a0b0",rg:"西藏",po:"雪域桃源人未识",tp:"宜：雪山映桃"},
  {id:6,n:"大理·苍山",sp:"高山杜鹃",lat:25.59,lon:100.19,th:310,s:"spring",c:"#d84070",rg:"西南",po:"苍山雪映杜鹃红",tp:"宜：登山寻花"},
  {id:7,n:"昆明·教场中路",sp:"蓝花楹",lat:25.04,lon:102.68,th:330,s:"spring",c:"#9878c8",rg:"西南",po:"春城无处不飞花",tp:"宜：紫雾漫城"},
  {id:8,n:"丹巴·藏寨",sp:"梨花",lat:30.88,lon:101.88,th:270,s:"spring",c:"#d8ccc0",rg:"西南",po:"忽如一夜春风来",tp:"宜：藏寨观花"},
  {id:9,n:"洛阳·白马寺",sp:"芍药",lat:34.70,lon:112.55,th:380,s:"spring",c:"#f080b0",rg:"华中",po:"芍药承春宠",tp:"宜：接力牡丹"},
  {id:10,n:"天台·华顶",sp:"云锦杜鹃",lat:29.13,lon:121.03,th:300,s:"spring",c:"#e050a0",rg:"华东",po:"千年杜鹃王",tp:"宜：古树新花"},
  {id:11,n:"武汉·东湖",sp:"樱花",lat:30.55,lon:114.37,th:280,s:"spring",c:"#ffb7c5",rg:"华中",po:"烟花三月下江城",tp:"宜：雨后观樱"},
  {id:12,n:"南京·梅花山",sp:"梅花",lat:32.05,lon:118.85,th:200,s:"spring",c:"#f0d0d8",rg:"华东",po:"遥知不是雪",tp:"宜：踏雪寻梅"},
  {id:13,n:"无锡·鼋头渚",sp:"樱花",lat:31.52,lon:120.22,th:285,s:"spring",c:"#ffb7c5",rg:"华东",po:"太湖佳绝处",tp:"宜：泛舟赏樱"},
  {id:14,n:"婺源·篁岭",sp:"油菜花",lat:29.33,lon:117.86,th:260,s:"spring",c:"#e8c840",rg:"华东",po:"篁岭晒秋今晒春",tp:"宜：登阁远眺"},
  {id:15,n:"成都·龙泉驿",sp:"桃花",lat:30.57,lon:104.27,th:270,s:"spring",c:"#f8a0b0",rg:"西南",po:"锦城花满龙泉",tp:"宜：踏青赏桃"},
  {id:16,n:"西安·青龙寺",sp:"樱花",lat:34.23,lon:108.97,th:290,s:"spring",c:"#ffb7c5",rg:"西北",po:"长安花事满青龙",tp:"宜：古寺赏樱"},
  {id:20,n:"伊犁·薰衣草",sp:"薰衣草",lat:43.50,lon:82.0,th:500,s:"summer",c:"#9070b0",rg:"西北",po:"紫色花海接天涯",tp:"六月盛放"},
  {id:21,n:"杭州·曲院",sp:"荷花",lat:30.24,lon:120.13,th:650,s:"summer",c:"#f080a0",rg:"华东",po:"接天莲叶无穷碧",tp:"七月盛放"},
  {id:22,n:"门源·油菜花",sp:"油菜花",lat:37.37,lon:101.62,th:420,s:"summer",c:"#f0d040",rg:"西北",po:"百里花海祁连下",tp:"七月再约"},
  {id:23,n:"呼伦贝尔",sp:"野花草甸",lat:49.21,lon:119.77,th:380,s:"summer",c:"#80c868",rg:"东北",po:"风吹草低见牛羊",tp:"六月草原"},
  {id:24,n:"色达·格桑花",sp:"格桑花",lat:31.8,lon:100.33,th:360,s:"summer",c:"#e060a0",rg:"西南",po:"高原格桑映佛光",tp:"六月绽放"},
  {id:25,n:"济南·大明湖",sp:"荷花",lat:36.68,lon:117.02,th:620,s:"summer",c:"#f080a0",rg:"华东",po:"四面荷花三面柳",tp:"七月赏荷"},
  {id:40,n:"北京·地坛",sp:"银杏",lat:39.95,lon:116.42,th:400,s:"autumn",c:"#e8c840",rg:"华北",po:"满城尽带黄金甲",tp:"十月踏叶"},
  {id:41,n:"额济纳·胡杨林",sp:"胡杨",lat:41.97,lon:101.07,th:370,s:"autumn",c:"#d8a030",rg:"西北",po:"千年不死大漠魂",tp:"十月金林"},
  {id:42,n:"九寨沟",sp:"彩林",lat:33.16,lon:103.92,th:370,s:"autumn",c:"#d86830",rg:"西南",po:"翠海叠瀑映彩林",tp:"十月栈道"},
  {id:43,n:"喀纳斯",sp:"白桦林",lat:48.70,lon:87.0,th:350,s:"autumn",c:"#e0a828",rg:"西北",po:"白桦林里金如画",tp:"九月穿林"},
  {id:44,n:"北京·香山",sp:"黄栌",lat:39.99,lon:116.19,th:380,s:"autumn",c:"#d04830",rg:"华北",po:"看万山红遍",tp:"十一月晴雪"},
  {id:45,n:"苏州·天平山",sp:"红枫",lat:31.25,lon:120.55,th:390,s:"autumn",c:"#d04030",rg:"华东",po:"霜叶红于二月花",tp:"十一月煮茶"},
  {id:46,n:"长沙·岳麓山",sp:"红枫",lat:28.17,lon:112.94,th:370,s:"autumn",c:"#d04030",rg:"华中",po:"停车坐爱枫林晚",tp:"十一月登高"},
  {id:60,n:"吉林·雾凇岛",sp:"雾凇",lat:43.88,lon:126.67,th:30,s:"winter",c:"#b0d0e8",rg:"东北",po:"千树万树梨花开",tp:"一月日出"},
  {id:61,n:"无量山·冬樱花",sp:"冬樱花",lat:24.44,lon:100.83,th:120,s:"winter",c:"#f090a8",rg:"西南",po:"无量冬樱一梦红",tp:"十二月茶山"},
];

const RIVERS=[{name:"黄河",coords:[[96,35.5],[100,36],[103,37],[106,38],[108,40.5],[110,40.2],[110,37],[113,35.5],[116,36],[119,37.8]],w:.4},
  {name:"长江",coords:[[94,33],[97,32],[100,29],[104,30],[108,30.5],[112,30],[116,30.5],[118,31.5],[121,31.2]],w:.5},
  {name:"珠江",coords:[[104,24],[108,23],[112,22.8],[114,22.5]],w:.3}];
const MTNS=[{name:"秦岭",coords:[[104,34],[108,34.5],[112,34]],dash:"4,3"},
  {name:"大兴安岭",coords:[[119,50],[121,46],[122,44]],dash:"3,3"},
  {name:"太行山",coords:[[113,40],[114,38],[113,35]],dash:"3,3"},
  {name:"天山",coords:[[78,43],[86,43],[90,42.5]],dash:"4,3"},
  {name:"南岭",coords:[[110,26],[114,25],[116,25.5]],dash:"3,3"}];
const REGIONS=[{id:"all",n:"全览",cx:104.5,cy:35,z:1},{id:"dongbei",n:"东北",cx:126,cy:45,z:4},
  {id:"huabei",n:"华北",cx:116,cy:39,z:4.5},{id:"xibei",n:"西北",cx:85,cy:40,z:2.5},
  {id:"huadong",n:"华东",cx:120,cy:30,z:5},{id:"huazhong",n:"华中",cx:112,cy:31,z:4.5},
  {id:"xinan",n:"西南",cx:102,cy:28,z:3.5},{id:"huanan",n:"华南",cx:110,cy:23,z:4.5},
  {id:"qingzang",n:"青藏",cx:90,cy:32,z:2.5}];

async function fetchAT(lat,lon){
  const now=new Date(),y=now.getFullYear(),pad=n=>String(n).padStart(2,"0");
  try{const r=await fetch(`https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${y}-01-01&end_date=${y}-${pad(now.getMonth()+1)}-${pad(Math.max(1,now.getDate()-1))}&daily=temperature_2m_mean&timezone=Asia%2FShanghai`);
    if(!r.ok)throw 0;const d=await r.json();if(!d.daily?.temperature_2m_mean)throw 0;
    let a=0;d.daily.temperature_2m_mean.forEach(t=>{if(t!=null&&t>5)a+=(t-5);});return Math.round(a);
  }catch{return null;}}

// ═══ Music - 高山流水 structured phrases ═══
let mInit=false,mPlay=false,mSynth=null,mPad=null,mRev=null,mTimer=null;
const PH=[["E5","D5","C5","A4",null,"G4","A4","C5"],["D5","E5","G5","E5",null,"D5","C5","D5"],
  ["A4","C5","D5","C5",null,"A4","G4","A4"],["G5","E5","D5","C5",null,"D5","E5","G5"],
  ["C5","D5","E5","G5",null,"A5","G5","E5"],["E5","G5","A5","G5",null,"E5","D5","C5"],
  ["G4","A4","C5","D5",null,null,"E5","D5"],["A4","G4","E4","G4",null,"A4","C5","A4"]];
const BD=["C3","G2","A2","D3","E3"];

function startMusic(){
  if(mInit&&mPlay)return;
  Tone.start().then(()=>{
    if(!mInit){
      mRev=new Tone.Reverb({decay:5,wet:0.45}).toDestination();
      mSynth=new Tone.PolySynth(Tone.Synth,{
        oscillator:{type:"triangle"},envelope:{attack:0.02,decay:0.8,sustain:0.05,release:1.5},volume:-16
      }).toDestination();
      mSynth.connect(mRev);
      mPad=new Tone.Synth({oscillator:{type:"sine"},envelope:{attack:2,decay:.5,sustain:.6,release:3},volume:-28}).toDestination();
      mPad.connect(mRev);
      mInit=true;
    }
    mPlay=true;
    let pi=0,ni=0,step=0;
    const tick=()=>{
      if(!mPlay){mTimer=null;return;}
      const ph=PH[pi%PH.length];const note=ph[ni%ph.length];
      if(note&&mSynth){
        try{mSynth.triggerAttackRelease(note,"8n",Tone.now(),.12+Math.random()*.18);}catch{}
        if(Math.random()>.7){
          const lo=note.replace(/\d/,n=>""+(Math.max(3,+n-1)));
          try{mSynth.triggerAttackRelease(lo,"4n",Tone.now()+.06,.06);}catch{}}
      }
      ni++;
      if(ni>=ph.length){ni=0;pi++;
        if(step%2===0&&mPad){try{mPad.triggerRelease(Tone.now());}catch{}
          try{mPad.triggerAttack(BD[Math.floor(Math.random()*BD.length)],Tone.now()+.2);}catch{}}}
      step++;
      mTimer=setTimeout(tick,(note?(.25+Math.random()*.35):(.5+Math.random()*.7))*1000);
    };
    tick();
  });
}
function stopMusic(){mPlay=false;if(mTimer){clearTimeout(mTimer);mTimer=null;}
  try{mSynth?.releaseAll();}catch{}try{mPad?.triggerRelease(Tone.now());}catch{}}

// ═══ Scroll Landing ═══
function ScrollLanding({onEnter}){
  const cs=getSeason();const sm=SM[cs];
  const [dx,setDx]=useState(0);const [dragging,setDragging]=useState(false);
  const [entered,setEntered]=useState(false);const startRef=useRef(null);const cRef=useRef(null);

  const hs=e=>{e.preventDefault();const x=e.touches?e.touches[0].clientX:e.clientX;
    startRef.current={x,d:dx};setDragging(true);};
  const hm=e=>{if(!dragging||!startRef.current)return;const x=e.touches?e.touches[0].clientX:e.clientX;
    const w=cRef.current?.offsetWidth||600;setDx(Math.max(0,Math.min(1,startRef.current.d+(x-startRef.current.x)/(w*.4))));};
  const he=()=>{setDragging(false);
    if(dx>.55){setDx(1);setTimeout(()=>{setEntered(true);startMusic();setTimeout(onEnter,400);},250);}
    else setDx(0);};

  useEffect(()=>{const t=setTimeout(()=>{if(dx===0){setDx(.1);setTimeout(()=>setDx(0),500);}},2000);return()=>clearTimeout(t);},[]);

  return(
    <div ref={cRef} style={{position:"fixed",inset:0,zIndex:200,background:sm.bg,
      display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
      opacity:entered?0:1,transition:"opacity .4s",userSelect:"none",touchAction:"none"
    }} onPointerMove={hm} onPointerUp={he} onPointerLeave={he} onTouchMove={hm} onTouchEnd={he}>
      <div style={{position:"absolute",inset:0,overflow:"hidden",opacity:.12}}>
        {Array.from({length:18}).map((_,i)=>(
          <div key={i} style={{position:"absolute",left:`${Math.random()*100}%`,top:`${Math.random()*100}%`,
            fontSize:12+Math.random()*14,opacity:.3+Math.random()*.4,
            transform:`rotate(${Math.random()*360}deg)`,color:sm.c}}>{sm.i}</div>))}
      </div>
      <div style={{marginBottom:24,textAlign:"center",opacity:1-dx*1.5,transform:`translateY(${-dx*25}px)`,transition:dragging?"none":"all .35s"}}>
        <div style={{fontSize:44,fontWeight:900,fontFamily:"'Noto Serif SC',serif",color:C.text,letterSpacing:12}}>花信风</div>
        <div style={{fontSize:12,color:C.tl,letterSpacing:4,marginTop:5}}>跟着天地节律 · 追一场中国色</div>
      </div>
      <div style={{position:"relative",width:"min(480px,78vw)",height:160}}>
        <div style={{position:"absolute",left:0,top:0,bottom:0,width:20,zIndex:5,borderRadius:10,
          background:"linear-gradient(90deg,#a07848,#c8a070,#b89060,#a07848)",boxShadow:"2px 0 8px rgba(0,0,0,.2)",
          transition:dragging?"none":"all .35s"}}>
          <div style={{position:"absolute",top:-4,left:-2,right:-2,height:8,background:"#9a7040",borderRadius:"4px 4px 0 0"}}/>
          <div style={{position:"absolute",bottom:-4,left:-2,right:-2,height:8,background:"#9a7040",borderRadius:"0 0 4px 4px"}}/></div>
        <div style={{position:"absolute",left:20,right:20,top:0,bottom:0,overflow:"hidden"}}>
          <div style={{position:"absolute",left:0,top:0,bottom:0,width:`${dx*100}%`,
            background:"linear-gradient(180deg,#f8f2e8,#f0e8dc,#f8f2e8)",
            transition:dragging?"none":"width .35s cubic-bezier(.22,1,.36,1)",
            display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden"}}>
            {dx>.25&&<div style={{textAlign:"center",padding:14,opacity:Math.min(1,(dx-.25)*3),whiteSpace:"pre-line",minWidth:180}}>
              <div style={{fontSize:13,color:sm.c,letterSpacing:3,lineHeight:2}}>{sm.poem}</div>
              <div style={{fontSize:9,color:C.tl,marginTop:6,letterSpacing:2}}>— {sm.poet}</div>
              <div style={{fontSize:8.5,color:sm.c,marginTop:8,letterSpacing:2.5,opacity:.6}}>{sm.scene}</div>
            </div>}</div></div>
        <div onPointerDown={hs} onTouchStart={hs}
          style={{position:"absolute",left:`${18+dx*60}%`,top:0,bottom:0,width:20,zIndex:5,borderRadius:10,
            background:"linear-gradient(90deg,#a07848,#c8a070,#b89060,#a07848)",
            boxShadow:"-2px 0 8px rgba(0,0,0,.2)",cursor:"grab",transition:dragging?"none":"all .35s"}}>
          <div style={{position:"absolute",top:-4,left:-2,right:-2,height:8,background:"#9a7040",borderRadius:"4px 4px 0 0"}}/>
          <div style={{position:"absolute",bottom:-4,left:-2,right:-2,height:8,background:"#9a7040",borderRadius:"0 0 4px 4px"}}/>
          <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",display:"flex",flexDirection:"column",gap:2.5,opacity:.35}}>
            {[0,1,2].map(i=><div key={i} style={{width:7,height:1.5,background:"#fff",borderRadius:1}}/>)}</div></div>
      </div>
      <div style={{marginTop:20,fontSize:10,color:C.tl,letterSpacing:3,opacity:.45}}>← 拖动卷轴，展卷入画 →</div>
      <button onClick={()=>{setDx(1);setTimeout(()=>{setEntered(true);startMusic();setTimeout(onEnter,300);},150);}}
        style={{position:"absolute",bottom:20,border:"none",background:"transparent",cursor:"pointer",
          fontSize:9.5,color:C.tl,letterSpacing:2,opacity:.35,padding:"5px 14px"}}>点此直接进入 →</button>
    </div>);
}

// ═══ Particles ═══
function Particles(){const ref=useRef(null),raf=useRef(null);
  useEffect(()=>{const c=ref.current;if(!c)return;const ctx=c.getContext("2d");
    let W=c.width=c.offsetWidth*2,H=c.height=c.offsetHeight*2;
    const cs=["#ffb7c5","#ffd0d8","#f8a0b0","#e8c840","#d080a0"];
    const mk=()=>({x:Math.random()*W,y:-8-Math.random()*40,s:1.5+Math.random()*2,
      vx:-.05+Math.random()*.1,vy:.12+Math.random()*.22,r:Math.random()*6.28,
      vr:-.004+Math.random()*.008,cl:cs[Math.random()*cs.length|0],
      o:.07+Math.random()*.14,w:Math.random()*6.28,ws:.002+Math.random()*.003});
    const ps=Array.from({length:8},mk);
    const draw=()=>{ctx.clearRect(0,0,W,H);for(const p of ps){
      p.w+=p.ws;p.x+=p.vx+Math.sin(p.w)*.1;p.y+=p.vy;p.r+=p.vr;
      if(p.y>H+8)Object.assign(p,mk());ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.r);
      ctx.globalAlpha=p.o;ctx.fillStyle=p.cl;ctx.beginPath();ctx.ellipse(0,0,p.s*.4,p.s,0,0,6.28);
      ctx.fill();ctx.restore();}raf.current=requestAnimationFrame(draw);};draw();
    return()=>cancelAnimationFrame(raf.current);},[]);
  return <canvas ref={ref} style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none",zIndex:5}}/>;
}

// ═══ Marker with flower SVG icon ═══
function Mk({s,px,py,zoom,flt,onClick}){
  const [hov,setHov]=useState(false);const [sh,setSh]=useState(false);
  const st=s._st||{st:"加载中",l:1};const hot=st.l>=3,dead=st.l===0;const sm=SM[s.s];
  useEffect(()=>{const t=setTimeout(()=>setSh(true),50+s.id*18);return()=>clearTimeout(t);},[s.id]);
  const base=hot?11:7;const sz=Math.max(base,base*Math.sqrt(zoom)/1.1);
  if(dead&&zoom<2.5)return null;
  return(
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} onClick={onClick}
      style={{position:"absolute",left:px,top:py,
        transform:`translate(-50%,-50%) scale(${sh?(hov?1.2:1):0})`,
        opacity:sh?(dead?.12:1):0,transition:"all .3s cubic-bezier(.34,1.56,.64,1)",
        cursor:"pointer",zIndex:hov?20:10,textAlign:"center"}}>
      {hot&&<div style={{position:"absolute",left:"50%",top:"50%",transform:"translate(-50%,-50%)",
        width:sz*2.8,height:sz*2.8,borderRadius:"50%",
        background:`radial-gradient(circle,${s.c}22,transparent 70%)`,animation:"pulse 2.5s ease-in-out infinite"}}/>}
      {/* Species-specific icon */}
      <div style={{width:sz,height:sz,borderRadius:"50%",margin:"0 auto",
        background:dead?"#e0d8d0":"rgba(255,255,255,0.85)",
        border:`${Math.max(1,zoom*.3)}px solid ${dead?"#c0b8b0":s.c}66`,
        boxShadow:dead?"none":`0 1px ${Math.max(2,zoom*1.2)}px ${s.c}44`,
        display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden"}}>
        {dead?<span style={{fontSize:sz*.45,opacity:.3}}>·</span>
          :<FloraIcon species={s.sp} size={sz*.75} color={s.c}/>}
      </div>
      {zoom>=2.2&&!dead&&<div style={{marginTop:1,fontSize:Math.min(10,7+zoom*.4),color:C.text,whiteSpace:"nowrap",
        textShadow:`0 1px 2px ${C.bg}`,fontWeight:600,letterSpacing:.4,opacity:hov?1:.6}}>
        {s.n.split("·")[1]||s.n}</div>}
      {hov&&<div style={{position:"absolute",bottom:"calc(100% + 4px)",left:"50%",transform:"translateX(-50%)",
        background:"rgba(250,245,237,.95)",backdropFilter:"blur(6px)",padding:"4px 8px",borderRadius:5,
        boxShadow:"0 2px 10px rgba(0,0,0,.07)",whiteSpace:"nowrap",fontFamily:"'Noto Serif SC',serif",zIndex:50}}>
        <div style={{fontSize:10,fontWeight:700,color:C.text,letterSpacing:1.5}}>{s.n}</div>
        <div style={{fontSize:8.5,color:dead?"#aaa":s.c,marginTop:1}}>{s.sp}·{st.st}</div>
        {s._at!=null&&<div style={{fontSize:7.5,color:C.tl,marginTop:1}}>积温{s._at}°C·d / 阈值{s.th}</div>}
        {(flt==="all"||flt!=="current")&&<div style={{fontSize:7,color:sm.c,marginTop:1}}>{sm.i}{sm.l}季</div>}
        {!dead&&<div style={{fontSize:6.5,color:C.tl,marginTop:1}}>点击展开 →</div>}
      </div>}
    </div>);
}

// ═══ Card ═══
function Card({s,onClose}){const [v,setV]=useState(false);useEffect(()=>{setTimeout(()=>setV(true),15);},[]);
  const cl=()=>{setV(false);setTimeout(onClose,160);};
  const st=s._st||{st:"...",l:1};const dead=st.l===0;const sm=SM[s.s];
  const pct=s.th>0&&s._at!=null?Math.min(120,(s._at/s.th)*100):0;
  const rl={height:11,background:"linear-gradient(90deg,#b08858,#d4b088,#c8a070,#b08858)",position:"relative"};
  return(
    <div style={{position:"fixed",inset:0,zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",
      background:v?"rgba(40,30,20,.3)":"transparent",transition:"background .15s",backdropFilter:v?"blur(3px)":"none"}} onClick={cl}>
      <div onClick={e=>e.stopPropagation()} style={{width:"min(340px,85vw)",
        transform:v?"translateY(0) scaleY(1)":"translateY(10px) scaleY(.96)",opacity:v?1:0,
        transition:"all .22s cubic-bezier(.22,1,.36,1)",transformOrigin:"top center"}}>
        <div style={{...rl,borderRadius:"5px 5px 0 0",boxShadow:"0 1px 4px rgba(0,0,0,.08)"}}>
          <div style={{position:"absolute",top:-2,left:-2,right:-2,height:4,background:"#9a7040",borderRadius:"2px 2px 0 0"}}/></div>
        <div style={{background:"linear-gradient(180deg,#faf5ed,#f5ece0,#faf5ed)",padding:"14px 14px 10px",
          borderLeft:"1.5px solid rgba(180,150,100,.08)",borderRight:"1.5px solid rgba(180,150,100,.08)",position:"relative"}}>
          {/* Flora icon as seal */}
          <div style={{position:"absolute",top:8,right:10,width:36,height:36,
            display:"flex",alignItems:"center",justifyContent:"center",
            transform:"rotate(-8deg)",opacity:dead?.3:.8}}>
            <FloraIcon species={s.sp} size={30} color={dead?"#bbb":s.c}/></div>
          <div style={{display:"flex",alignItems:"center",gap:3,marginBottom:1}}>
            <span style={{fontSize:9,color:sm.c}}>{sm.i}</span><span style={{fontSize:7.5,color:sm.c,letterSpacing:2}}>{sm.l}季</span></div>
          <h2 style={{fontSize:14,fontWeight:700,color:C.text,margin:0,letterSpacing:2.5}}>{s.n}</h2>
          <div style={{fontSize:9.5,color:C.tl,marginTop:1.5,letterSpacing:1.2}}>{s.sp}·{st.st}·{s.rg}</div>
          <div style={{margin:"6px 0",padding:"4px 7px",background:`${dead?"#e0d8d0":s.c}0c`,
            borderLeft:`2.5px solid ${dead?"#bbb":s.c}44`,borderRadius:"0 3px 3px 0",
            fontSize:10.5,fontStyle:"italic",color:C.text,letterSpacing:2.5,lineHeight:1.5}}>「{s.po}」</div>
          <div style={{fontSize:9,margin:"3px 0"}}><span style={{opacity:.35}}>建议：</span>{s.tp}</div>
          <div style={{margin:"4px 0",padding:"5px 6px",background:"rgba(0,0,0,.01)",borderRadius:3}}>
            <div style={{fontSize:8,fontWeight:600,marginBottom:2}}>🌡 积温模型 <span style={{fontWeight:400,color:C.tl,fontSize:6.5}}>(≥5°C)</span></div>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:7.5,opacity:.5,marginBottom:1.5}}>
              <span>{s._at!=null?`${s._at}°C·d`:""}{s._src==="api"?" ✓":" (估)"}</span><span>阈值 {s.th}</span></div>
            <div style={{height:4,borderRadius:2,background:"rgba(0,0,0,.03)",overflow:"hidden"}}>
              <div style={{height:"100%",borderRadius:2,width:`${Math.min(100,pct)}%`,
                background:dead?"#c0b8b0":pct>=100?`linear-gradient(90deg,${s.c},#e8a040)`:`linear-gradient(90deg,${s.c}88,${s.c})`,
                transition:"width .5s"}}/></div></div>
          <div style={{fontSize:6.5,color:C.tl,opacity:.5,marginTop:2}}>📍 {s.lat.toFixed(2)}°N, {s.lon.toFixed(2)}°E</div>
        </div>
        <div style={{...rl,borderRadius:"0 0 5px 5px",boxShadow:"0 -1px 3px rgba(0,0,0,.05)"}}>
          <div style={{position:"absolute",bottom:-2,left:-2,right:-2,height:4,background:"#9a7040",borderRadius:"0 0 2px 2px"}}/></div>
      </div></div>);
}

function Rank({spots,onSel}){
  const li=spots.filter(s=>(s._st?.l||0)>=2).sort((a,b)=>(b._st?.l||0)-(a._st?.l||0)||(b._at||0)-(a._at||0)).slice(0,10);
  if(!li.length)return null;
  return(<div style={{position:"absolute",right:4,top:38,zIndex:25,background:"rgba(250,245,237,.85)",
      backdropFilter:"blur(8px)",borderRadius:5,padding:"5px 6px",boxShadow:"0 1px 5px rgba(0,0,0,.02)",
      maxHeight:"min(300px,46vh)",overflowY:"auto",width:125,fontFamily:"'Noto Serif SC',serif"}}>
      <div style={{fontSize:7,color:C.tl,marginBottom:3,letterSpacing:2,borderBottom:"1px solid rgba(180,150,100,.06)",paddingBottom:2}}>花事排行</div>
      {li.map((s,i)=>{const sm=SM[s.s];return(
        <div key={s.id} onClick={()=>onSel(s)} style={{display:"flex",alignItems:"center",gap:2,padding:"2px 0",
          borderBottom:i<li.length-1?"1px solid rgba(0,0,0,.012)":"none",cursor:"pointer"}}>
          <span style={{fontSize:6.5,fontWeight:700,color:i<3?C.accent:C.tl,width:9}}>{i+1}</span>
          <div style={{width:14,height:14,flexShrink:0}}><FloraIcon species={s.sp} size={14} color={s.c}/></div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:8,color:C.text,fontWeight:600,letterSpacing:.3,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
              {s.n.split("·")[1]||s.n}</div>
            <div style={{fontSize:5.5,color:s.c}}>{s.sp}·{s._st?.st}</div></div>
        </div>);})}
    </div>);
}

// ═══ MAIN ═══
export default function App(){
  const [entered,setEntered]=useState(false);
  const [geo,setGeo]=useState(null);
  const [flora,setFlora]=useState(()=>FLORA.map(f=>{
    const at=FULL_YEAR_AT[f.id]||200;
    return{...f,_at:at,_st:calcSt(at,f.th,f.s,"current"),_src:"est"};
  }));
  const [filter,setFilter]=useState("current");
  const [region,setRegion]=useState("all");
  const [sel,setSel]=useState(null);
  const [drag,setDrag]=useState(null);
  const [pan,setPan]=useState({x:0,y:0});
  const [wz,setWz]=useState(1);
  const [wc,setWc]=useState([104.5,35]);
  const [mus,setMus]=useState(true);
  const mapRef=useRef(null);const touchD=useRef(null);
  const W=1000,H=850;const cs=getSeason();const cr=REGIONS.find(r=>r.id===region)||REGIONS[0];

  const proj=useMemo(()=>d3.geoMercator().center([104.5,35.5]).scale(580).translate([W/2,H/2]),[]);
  const pathGen=useMemo(()=>d3.geoPath().projection(proj),[proj]);

  useEffect(()=>{fetch("https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json")
    .then(r=>r.json()).then(setGeo).catch(()=>{
      fetch("https://geo.datav.aliyun.com/areas_v3/bound/100000.json").then(r=>r.json()).then(setGeo).catch(()=>{});});},[]);

  // Fetch real AT for spring spots
  useEffect(()=>{(async()=>{const sp=FLORA.filter(f=>f.s==="spring");
    for(let i=0;i<sp.length;i+=3){const ch=sp.slice(i,i+3);
      const res=await Promise.allSettled(ch.map(f=>fetchAT(f.lat,f.lon)));
      setFlora(prev=>prev.map(p=>{const idx=ch.findIndex(c=>c.id===p.id);if(idx===-1)return p;
        const at=res[idx].status==="fulfilled"&&res[idx].value!=null?res[idx].value:p._at;
        const src=res[idx].status==="fulfilled"&&res[idx].value!=null?"api":"est";
        return{...p,_at:at,_st:calcSt(at,p.th,p.s,"current"),_src:src};}));
      if(i+3<sp.length)await new Promise(r=>setTimeout(r,350));}})();},[]);

  // Recalculate statuses when filter changes
  const displayFlora=useMemo(()=>{
    const mode=filter==="current"?"current":"full";
    return flora.map(f=>{
      const at=mode==="full"?(FULL_YEAR_AT[f.id]||f._at):f._at;
      return{...f,_at:at,_st:calcSt(at,f.th,f.s,mode),_src:f._src};
    });
  },[flora,filter]);

  const ez=region==="all"?wz:cr.z;
  const ecx=region==="all"?wc:[cr.cx,cr.cy];const pc=proj(ecx);
  useEffect(()=>{setPan({x:0,y:0});},[region]);
  useEffect(()=>{if(region!=="all"){setWz(1);setWc([104.5,35]);}},[region]);

  useEffect(()=>{const el=mapRef.current;if(!el)return;
    const h=e=>{e.preventDefault();const isPinch=e.ctrlKey;
      const factor=isPinch?e.deltaY*-.01:e.deltaY<0?.17:-.15;
      const rect=el.getBoundingClientRect();
      const gx=proj.invert?.([(e.clientX-rect.left)/rect.width*W,(e.clientY-rect.top)/rect.height*H]);
      setWz(prev=>{const next=Math.max(1,Math.min(8,prev*(1+factor)));
        if(next>1.05&&gx){const t=Math.min(.15,.05*(next-1));setWc(c=>[c[0]+(gx[0]-c[0])*t,c[1]+(gx[1]-c[1])*t]);}
        else setWc([104.5,35]);return next;});};
    el.addEventListener("wheel",h,{passive:false});return()=>el.removeEventListener("wheel",h);
  },[proj]);

  useEffect(()=>{const el=mapRef.current;if(!el)return;
    const ts=e=>{if(e.touches.length===2){e.preventDefault();const dx=e.touches[0].clientX-e.touches[1].clientX;
      const dy=e.touches[0].clientY-e.touches[1].clientY;touchD.current=Math.sqrt(dx*dx+dy*dy);}};
    const tm=e=>{if(e.touches.length===2&&touchD.current){e.preventDefault();
      const dx=e.touches[0].clientX-e.touches[1].clientX;const dy=e.touches[0].clientY-e.touches[1].clientY;
      const d=Math.sqrt(dx*dx+dy*dy);setWz(p=>Math.max(1,Math.min(8,p*(d/touchD.current))));touchD.current=d;}};
    const te=()=>{touchD.current=null;};
    el.addEventListener("touchstart",ts,{passive:false});el.addEventListener("touchmove",tm,{passive:false});
    el.addEventListener("touchend",te);
    return()=>{el.removeEventListener("touchstart",ts);el.removeEventListener("touchmove",tm);el.removeEventListener("touchend",te);};},[]);

  useEffect(()=>{const h=e=>{const s=30;
    if(e.key==="ArrowLeft")setPan(p=>({...p,x:p.x+s}));else if(e.key==="ArrowRight")setPan(p=>({...p,x:p.x-s}));
    else if(e.key==="ArrowUp")setPan(p=>({...p,y:p.y+s}));else if(e.key==="ArrowDown")setPan(p=>({...p,y:p.y-s}));
    else if(e.key==="+"||e.key==="=")setWz(z=>Math.min(8,z*1.2));
    else if(e.key==="-")setWz(z=>Math.max(1,z*.83));else return;e.preventDefault();};
    window.addEventListener("keydown",h);return()=>window.removeEventListener("keydown",h);},[]);

  const onPD=useCallback(e=>{if(ez<=1.05&&region==="all")return;setDrag({x:e.clientX-pan.x,y:e.clientY-pan.y});},[ez,pan,region]);
  const onPM=useCallback(e=>{if(!drag)return;setPan({x:e.clientX-drag.x,y:e.clientY-drag.y});},[drag]);
  const onPU=useCallback(()=>setDrag(null),[]);
  const tx=(W/2-pc[0])*ez+pan.x;const ty=(H/2-pc[1])*ez+pan.y;
  const spots=useMemo(()=>{if(filter==="current")return displayFlora.filter(f=>f.s===cs);
    if(filter==="all")return displayFlora;return displayFlora.filter(f=>f.s===filter);},[filter,displayFlora,cs]);
  const rP=useMemo(()=>RIVERS.map(r=>({...r,d:d3.line().x(d=>proj(d)?.[0]).y(d=>proj(d)?.[1]).curve(d3.curveBasis)(r.coords.map(c=>[c[0],c[1]]))})),[proj]);
  const mP=useMemo(()=>MTNS.map(m=>({...m,d:d3.line().x(d=>proj(d)?.[0]).y(d=>proj(d)?.[1]).curve(d3.curveBasis)(m.coords.map(c=>[c[0],c[1]]))})),[proj]);
  const sP=useMemo(()=>{const m=new Map();FLORA.forEach(f=>{const p=proj([f.lon,f.lat]);if(p)m.set(f.id,{x:(p[0]/W*100)+"%",y:(p[1]/H*100)+"%"});});return m;},[proj]);

  if(!entered)return <ScrollLanding onEnter={()=>setEntered(true)}/>;

  return(
    <div style={{width:"100%",height:"100vh",minHeight:600,position:"relative",overflow:"hidden",
      fontFamily:"'Noto Serif SC',serif",background:`linear-gradient(155deg,${C.bg},${C.bg2})`}} tabIndex={0}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700;900&display=swap');
        @keyframes pulse{0%,100%{transform:translate(-50%,-50%) scale(1);opacity:.35}50%{transform:translate(-50%,-50%) scale(1.5);opacity:0}}
        *{box-sizing:border-box;margin:0;padding:0}::-webkit-scrollbar{width:2px}::-webkit-scrollbar-thumb{background:rgba(0,0,0,.04)}`}</style>

      {ez>1.5&&<><div style={{position:"absolute",left:0,top:0,bottom:0,width:9,zIndex:15,background:"linear-gradient(90deg,#b08858,#d4b088,#c8a070)",boxShadow:"2px 0 4px rgba(0,0,0,.04)"}}/>
        <div style={{position:"absolute",right:0,top:0,bottom:0,width:9,zIndex:15,background:"linear-gradient(90deg,#c8a070,#d4b088,#b08858)",boxShadow:"-2px 0 4px rgba(0,0,0,.04)"}}/></>}

      <div ref={mapRef} onPointerDown={onPD} onPointerMove={onPM} onPointerUp={onPU} onPointerLeave={onPU}
        style={{position:"absolute",inset:0,cursor:ez>1.05||region!=="all"?(drag?"grabbing":"grab"):"default",touchAction:"none"}}>
        <div style={{position:"absolute",left:"50%",top:"50%",width:W,height:H,marginLeft:-W/2,marginTop:-H/2,
          transform:`scale(${ez}) translate(${tx/ez}px,${ty/ez}px)`,
          transition:drag?"none":"transform .5s cubic-bezier(.22,1,.36,1)",transformOrigin:"center center"}}>
          <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:"100%",position:"absolute"}}>
            {geo&&(geo.features||[geo]).map((f,i)=>{const d=pathGen(f);if(!d)return null;
              return <path key={i} d={d} fill="#eee8dc" fillOpacity=".14" stroke={C.border}
                strokeWidth={f.properties?.name?.length>0?.22:.4} strokeLinejoin="round"
                opacity={f.properties?.name?.length>0?.2:.38}/>;
            })}
            {rP.map((r,i)=>r.d&&<g key={`r${i}`}><path d={r.d} fill="none" stroke={C.river} strokeWidth={r.w*1.3} strokeLinecap="round" opacity=".22"/>
              <path id={`rv${i}`} d={r.d} fill="none"/><text fontSize="8" fill={C.river} opacity=".28" fontWeight="600">
                <textPath href={`#rv${i}`} startOffset="35%">{r.name}</textPath></text></g>)}
            {mP.map((m,i)=>m.d&&<g key={`m${i}`}><path d={m.d} fill="none" stroke={C.mtn} strokeWidth=".8" opacity=".1"
                strokeDasharray={m.dash} strokeLinecap="round"/><path id={`mt${i}`} d={m.d} fill="none"/>
              <text fontSize="7" fill={C.mtn} opacity=".18" fontWeight="600"><textPath href={`#mt${i}`} startOffset="25%">{m.name}</textPath></text></g>)}
          </svg>
          <Particles/>
          {spots.map(s=>{const pos=sP.get(s.id);if(!pos)return null;
            return <Mk key={s.id} s={s} px={pos.x} py={pos.y} zoom={ez} flt={filter} onClick={()=>setSel(s)}/>;
          })}
        </div>
      </div>

      {/* Title */}
      <div style={{position:"absolute",top:5,left:ez>1.5?14:4,zIndex:30,transition:"left .25s"}}>
        <div style={{display:"flex",alignItems:"center",gap:4}}>
          <div style={{width:20,height:20,borderRadius:"50%",background:`linear-gradient(135deg,${C.accent},${C.accent2})`,
            display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:8}}>風</div>
          <h1 style={{fontSize:12,fontWeight:900,color:C.text,letterSpacing:3}}>花信风</h1></div></div>

      {/* Filter tabs */}
      <div style={{position:"absolute",bottom:7,left:"50%",transform:"translateX(-50%)",zIndex:30,
        display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
        {filter!=="current"&&<div style={{display:"flex",background:"rgba(250,245,237,.85)",backdropFilter:"blur(5px)",
          borderRadius:10,padding:"1.5px",gap:1}}>
          {[{k:"all",l:"全部",ic:"🌺"},{k:"spring",l:"春",ic:"🌸"},{k:"summer",l:"夏",ic:"🌿"},
            {k:"autumn",l:"秋",ic:"🍁"},{k:"winter",l:"冬",ic:"❄"}].map(m=>(
            <button key={m.k} onClick={()=>setFilter(m.k)} style={{border:"none",borderRadius:8,padding:"2px 7px",
              cursor:"pointer",display:"flex",alignItems:"center",gap:1,fontSize:9,
              background:filter===m.k?`${(SM[m.k]||{c:C.accent}).c}18`:"transparent",
              color:filter===m.k?(SM[m.k]||{c:C.accent}).c:"#aaa",fontWeight:filter===m.k?700:400}}>
              <span style={{fontSize:9}}>{m.ic}</span><span>{m.l}</span></button>))}</div>}
        <div style={{display:"flex",background:"rgba(250,245,237,.9)",backdropFilter:"blur(8px)",
          borderRadius:13,padding:"1.5px",gap:1}}>
          <button onClick={()=>setFilter("current")} style={{border:"none",borderRadius:10,padding:"3px 10px",
            cursor:"pointer",display:"flex",alignItems:"center",gap:2,fontSize:9.5,
            background:filter==="current"?`${SM[cs].c}18`:"transparent",
            color:filter==="current"?SM[cs].c:"#999",fontWeight:filter==="current"?700:400}}>
            <span>{SM[cs].i}</span>当季</button>
          <button onClick={()=>setFilter(filter==="current"?"all":filter)} style={{border:"none",borderRadius:10,padding:"3px 10px",
            cursor:"pointer",display:"flex",alignItems:"center",gap:2,fontSize:9.5,
            background:filter!=="current"?`${C.accent}18`:"transparent",
            color:filter!=="current"?C.accent:"#999",fontWeight:filter!=="current"?700:400}}>
            <span>🗺</span>全年</button>
        </div>
      </div>

      {/* Region nav */}
      <div style={{position:"absolute",left:ez>1.5?12:3,bottom:7,zIndex:30,display:"flex",flexDirection:"column",gap:.5,
        background:"rgba(250,245,237,.82)",backdropFilter:"blur(5px)",borderRadius:4,padding:"2px 2px"}}>
        {REGIONS.map(r=>(
          <button key={r.id} onClick={()=>{setRegion(r.id);if(r.id==="all"){setWz(1);setWc([104.5,35]);}}}
            style={{border:"none",borderRadius:2,padding:"1.5px 4px",cursor:"pointer",fontSize:7,
              background:region===r.id?`${C.accent}18`:"transparent",
              color:region===r.id?C.accent:C.tl,fontWeight:region===r.id?700:400,letterSpacing:1}}>{r.n}</button>))}
      </div>

      {/* Music */}
      <button onClick={()=>{if(mus){stopMusic();setMus(false);}else{startMusic();setMus(true);}}}
        style={{position:"absolute",top:5,right:4,zIndex:30,border:"none",borderRadius:10,padding:"2px 7px",
          cursor:"pointer",background:"rgba(250,245,237,.82)",fontSize:8,
          color:mus?C.accent:C.tl,display:"flex",alignItems:"center",gap:2}}>
        <span style={{fontSize:9}}>{mus?"🎵":"🔇"}</span><span>{mus?"古韵":"静音"}</span></button>

      <Rank spots={spots} onSel={setSel}/>
      <div style={{position:"absolute",bottom:50,left:"50%",transform:"translateX(-50%)",zIndex:25,
        fontSize:6.5,color:C.tl,letterSpacing:1,opacity:.25}}>滚轮/双指缩放 · 方向键/拖动漫游</div>

      {sel&&<Card s={sel} onClose={()=>setSel(null)}/>}
    </div>
  );
}
