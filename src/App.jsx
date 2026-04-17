import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import * as d3 from "d3";

const C={bg:"#f4ece0",bg2:"#ebe0d0",accent:"#c06040",accent2:"#a87050",text:"#3a2818",tl:"#8a7a68",border:"#4a8a98",river:"#4a88a0",mtn:"#8a7a5a"};
const SM={spring:{l:"春",i:"🌸",c:"#d4756b"},summer:{l:"夏",i:"🌿",c:"#5a8a50"},autumn:{l:"秋",i:"🍁",c:"#c8703a"},winter:{l:"冬",i:"❄",c:"#6a8aaa"}};
function getSeason(){const m=new Date().getMonth();if(m>=2&&m<=4)return"spring";if(m>=5&&m<=7)return"summer";if(m>=8&&m<=10)return"autumn";return"winter";}
function distKm(a,b,c,d){const R=6371,dL=(c-a)*Math.PI/180,dO=(d-b)*Math.PI/180;const x=Math.sin(dL/2)**2+Math.cos(a*Math.PI/180)*Math.cos(c*Math.PI/180)*Math.sin(dO/2)**2;return R*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x));}

// ── Flora Icons ──
function FI({sp,sz,co}){const s=sz||14,cl=co||"#e080a0";
const P5=r=>[0,72,144,216,288].map(a=><ellipse key={a} cx="12" cy={12-r} rx="3" ry={r} transform={`rotate(${a},12,12)`} fill={cl}/>);
const ic={"樱花":()=><svg viewBox="0 0 24 24" width={s} height={s}><g opacity=".9">{P5(4.5)}<circle cx="12" cy="12" r="2.5" fill="#f8e0a0"/></g></svg>,
"桃花":()=><svg viewBox="0 0 24 24" width={s} height={s}><g opacity=".9">{P5(5)}<circle cx="12" cy="12" r="2" fill="#ffe0e8"/></g></svg>,
"梅花":()=><svg viewBox="0 0 24 24" width={s} height={s}><g opacity=".9">{[0,72,144,216,288].map(a=><circle key={a} cx="12" cy="6.5" r="3.2" transform={`rotate(${a},12,12)`} fill={cl}/>)}<circle cx="12" cy="12" r="2.5" fill="#ffe088"/></g></svg>,
"牡丹":()=><svg viewBox="0 0 24 24" width={s} height={s}><g opacity=".85">{[0,45,90,135,180,225,270,315].map(a=><ellipse key={a} cx="12" cy="6" rx="3.5" ry="4.5" transform={`rotate(${a},12,12)`} fill={cl}/>)}<circle cx="12" cy="12" r="2" fill="#f8d870"/></g></svg>,
"杜鹃花":()=><svg viewBox="0 0 24 24" width={s} height={s}><g opacity=".9">{[0,72,144,216,288].map(a=><path key={a} d="M12,3Q15,7 14,12Q12,10 10,12Q9,7 12,3" transform={`rotate(${a},12,12)`} fill={cl}/>)}<circle cx="12" cy="12" r="2" fill="#f8e0a0"/></g></svg>,
"郁金香":()=><svg viewBox="0 0 24 24" width={s} height={s}><g opacity=".9"><path d="M12,2Q16,6 15,12Q12,14 12,14Q12,14 9,12Q8,6 12,2" fill={cl}/><path d="M12,14L12,22" stroke="#6a9a50" strokeWidth="1.5" fill="none"/></g></svg>,
"油菜花":()=><svg viewBox="0 0 24 24" width={s} height={s}><g opacity=".9">{[0,90,180,270].map(a=><ellipse key={a} cx="12" cy="8" rx="2.5" ry="3.5" transform={`rotate(${a},12,12)`} fill={cl}/>)}<circle cx="12" cy="12" r="2" fill="#e8c020"/></g></svg>,
"蓝花楹":()=><svg viewBox="0 0 24 24" width={s} height={s}><g opacity=".85">{[0,51,103,154,206,257,309].map(a=><ellipse key={a} cx="12" cy="7" rx="2" ry="3.5" transform={`rotate(${a},12,12)`} fill={cl}/>)}</g></svg>,
"梨花":()=><svg viewBox="0 0 24 24" width={s} height={s}><g opacity=".9" fill="#f0ece4" stroke={cl} strokeWidth=".3">{P5(4)}<circle cx="12" cy="12" r="2" fill="#d0e8a0"/></g></svg>,
"荷花":()=><svg viewBox="0 0 24 24" width={s} height={s}><g fill={cl} opacity=".85"><ellipse cx="12" cy="8" rx="3" ry="6"/><ellipse cx="8" cy="10" rx="2.5" ry="5" transform="rotate(-20,8,10)"/><ellipse cx="16" cy="10" rx="2.5" ry="5" transform="rotate(20,16,10)"/><circle cx="12" cy="14" r="2" fill="#f0d858"/></g></svg>,
"薰衣草":()=><svg viewBox="0 0 24 24" width={s} height={s}><g opacity=".85"><path d="M12,22L12,8" stroke="#7a9a50" strokeWidth="1.2" fill="none"/>{[3,5,7,9,11].map(y=><g key={y}><ellipse cx="10" cy={y} rx="2" ry="1.2" fill={cl}/><ellipse cx="14" cy={y} rx="2" ry="1.2" fill={cl}/></g>)}</g></svg>,
"格桑花":()=><svg viewBox="0 0 24 24" width={s} height={s}><g opacity=".9">{[0,45,90,135,180,225,270,315].map(a=><ellipse key={a} cx="12" cy="7" rx="2" ry="4" transform={`rotate(${a},12,12)`} fill={cl}/>)}<circle cx="12" cy="12" r="2.5" fill="#f0d060"/></g></svg>,
"银杏":()=><svg viewBox="0 0 24 24" width={s} height={s}><g fill={cl} opacity=".9"><path d="M12,20L12,12Q6,8 4,4Q8,2 12,6Q16,2 20,4Q18,8 12,12"/></g></svg>,
"胡杨":()=><svg viewBox="0 0 24 24" width={s} height={s}><g opacity=".9"><path d="M12,22L12,10" stroke="#8a6a30" strokeWidth="2" fill="none"/><circle cx="8" cy="8" r="3.5" fill={cl}/><circle cx="16" cy="7" r="3" fill={cl}/><circle cx="12" cy="5" r="3.5" fill={cl} opacity=".8"/></g></svg>,
"彩林":()=><svg viewBox="0 0 24 24" width={s} height={s}><g opacity=".85"><circle cx="7" cy="9" r="4" fill="#d86830"/><circle cx="17" cy="8" r="3.5" fill="#e8a030"/><circle cx="12" cy="6" r="4" fill="#c84020"/><path d="M12,22L12,12" stroke="#6a5030" strokeWidth="1.5" fill="none"/></g></svg>,
"白桦林":()=><svg viewBox="0 0 24 24" width={s} height={s}><g opacity=".85"><rect x="11" y="8" width="2" height="14" rx="1" fill="#e8e0d0"/><circle cx="12" cy="6" r="5" fill={cl}/></g></svg>,
"红枫":()=><svg viewBox="0 0 24 24" width={s} height={s}><g fill={cl} opacity=".9"><path d="M12,2L14,8L20,8L15,12L17,19L12,15L7,19L9,12L4,8L10,8Z"/></g></svg>,
"雾凇":()=><svg viewBox="0 0 24 24" width={s} height={s}><g stroke={cl} strokeWidth="1.5" fill="none" opacity=".8"><path d="M12,2L12,22M5,7L19,17M19,7L5,17"/><circle cx="12" cy="12" r="2" fill={cl}/></g></svg>,
"黄栌":()=>ic["彩林"](),
"桂花":()=><svg viewBox="0 0 24 24" width={s} height={s}><g opacity=".9">{[0,60,120,180,240,300].map(a=><circle key={a} cx="12" cy="9" r="1.8" transform={`rotate(${a},12,12)`} fill={cl}/>)}<circle cx="12" cy="12" r="1.5" fill="#f0d060"/></g></svg>,
"三角梅":()=><svg viewBox="0 0 24 24" width={s} height={s}><g opacity=".9"><path d="M12,3L6,14L18,14Z" fill={cl}/><path d="M12,4L8,13L16,13Z" fill={cl} opacity=".6"/><circle cx="12" cy="11" r="1.5" fill="#f0e8d0"/></g></svg>,
"丁香花":()=><svg viewBox="0 0 24 24" width={s} height={s}><g opacity=".85">{[0,90,180,270].map(a=><ellipse key={a} cx="12" cy="8" rx="1.8" ry="3.5" transform={`rotate(${a},12,12)`} fill={cl}/>)}<circle cx="12" cy="12" r="1.2" fill="#e8d8f0"/>{[-3,3].map(x=><g key={x}>{[0,90,180,270].map(a=><ellipse key={a} cx={12+x} cy={8+Math.abs(x)} rx="1.2" ry="2.5" transform={`rotate(${a},${12+x},${8+Math.abs(x)})`} fill={cl} opacity=".6"/>)}</g>)}</g></svg>,
"野花草甸":()=><svg viewBox="0 0 24 24" width={s} height={s}><g opacity=".85"><circle cx="8" cy="9" r="2.5" fill={cl}/><circle cx="12" cy="7" r="2.5" fill="#e8a040"/><circle cx="16" cy="9" r="2.5" fill="#d070a0"/></g></svg>};
const alt={"高山杜鹃":"杜鹃花","云锦杜鹃":"杜鹃花","野杏花":"桃花","芍药":"牡丹","冬樱花":"樱花","苹果梨花":"梨花"};
const r=ic[sp]||ic[alt[sp]];return r?r():<svg viewBox="0 0 24 24" width={s} height={s}><g opacity=".8">{P5(4)}<circle cx="12" cy="12" r="2" fill="#f0d870"/></g></svg>;}

// ── Flora Data with 3-year historical bloom dates ──
// pk: [startMonth, endMonth], hist: past 3 years bloom peak dates [mm-dd, mm-dd, mm-dd]
const FLORA=[
  {id:1,n:"洛阳·国花园",sp:"牡丹",lat:34.62,lon:112.45,th:320,s:"spring",c:"#e868a0",rg:"华中",po:"唯有牡丹真国色",tp:"宜：国色天香",pk:[4,4],hist:["04-12","04-08","04-15"],mfw:"洛阳国花园"},
  {id:2,n:"毕节·百里杜鹃",sp:"杜鹃花",lat:27.30,lon:105.28,th:280,s:"spring",c:"#e04070",rg:"西南",po:"百里花海映天红",tp:"宜：花海骑行",pk:[3,4],hist:["03-25","03-20","03-28"],mfw:"百里杜鹃"},
  {id:3,n:"伊犁·杏花沟",sp:"野杏花",lat:43.35,lon:82.65,th:250,s:"spring",c:"#f0b8c0",rg:"西北",po:"杏花春雨满天山",tp:"宜：策马花谷",pk:[4,5],hist:["04-10","04-15","04-08"],mfw:"伊犁杏花沟"},
  {id:4,n:"杭州·太子湾",sp:"郁金香",lat:30.24,lon:120.15,th:290,s:"spring",c:"#e84060",rg:"华东",po:"西湖春色满太子",tp:"宜：湖畔漫步",pk:[3,4],hist:["03-20","03-18","03-25"],mfw:"太子湾公园"},
  {id:5,n:"林芝·嘎拉",sp:"桃花",lat:29.65,lon:94.36,th:300,s:"spring",c:"#f8a0b0",rg:"西藏",po:"雪域桃源人未识",tp:"宜：雪山映桃",pk:[3,4],hist:["03-28","04-02","03-25"],mfw:"林芝桃花沟"},
  {id:6,n:"大理·苍山",sp:"高山杜鹃",lat:25.59,lon:100.19,th:310,s:"spring",c:"#d84070",rg:"西南",po:"苍山雪映杜鹃红",tp:"宜：登山寻花",pk:[4,5],hist:["04-18","04-22","04-15"],mfw:"苍山"},
  {id:7,n:"昆明·教场中路",sp:"蓝花楹",lat:25.04,lon:102.68,th:330,s:"spring",c:"#9878c8",rg:"西南",po:"春城无处不飞花",tp:"宜：紫雾漫城",pk:[4,5],hist:["04-25","04-20","04-28"],mfw:"教场中路蓝花楹"},
  {id:8,n:"丹巴·藏寨",sp:"梨花",lat:30.88,lon:101.88,th:270,s:"spring",c:"#d8ccc0",rg:"西南",po:"忽如一夜春风来",tp:"宜：藏寨观花",pk:[3,4],hist:["03-22","03-18","03-25"],mfw:"丹巴藏寨"},
  {id:9,n:"洛阳·白马寺",sp:"芍药",lat:34.70,lon:112.55,th:380,s:"spring",c:"#f080b0",rg:"华中",po:"芍药承春宠",tp:"宜：接力牡丹",pk:[5,5],hist:["05-02","04-28","05-05"],mfw:"白马寺"},
  {id:10,n:"天台·华顶",sp:"云锦杜鹃",lat:29.13,lon:121.03,th:300,s:"spring",c:"#e050a0",rg:"华东",po:"千年杜鹃王",tp:"宜：古树新花",pk:[4,5],hist:["04-20","04-25","04-18"],mfw:"华顶国家森林公园"},
  {id:11,n:"武汉·东湖",sp:"樱花",lat:30.55,lon:114.37,th:280,s:"spring",c:"#ffb7c5",rg:"华中",po:"烟花三月下江城",tp:"宜：雨后观樱",pk:[3,3],hist:["03-15","03-12","03-18"],mfw:"东湖樱花园"},
  {id:12,n:"南京·梅花山",sp:"梅花",lat:32.05,lon:118.85,th:200,s:"spring",c:"#f0d0d8",rg:"华东",po:"遥知不是雪",tp:"宜：踏雪寻梅",pk:[2,3],hist:["02-18","02-15","02-22"],mfw:"梅花山"},
  {id:13,n:"无锡·鼋头渚",sp:"樱花",lat:31.52,lon:120.22,th:285,s:"spring",c:"#ffb7c5",rg:"华东",po:"太湖佳绝处",tp:"宜：泛舟赏樱",pk:[3,4],hist:["03-22","03-18","03-25"],mfw:"鼋头渚"},
  {id:14,n:"婺源·篁岭",sp:"油菜花",lat:29.33,lon:117.86,th:260,s:"spring",c:"#e8c840",rg:"华东",po:"篁岭晒秋今晒春",tp:"宜：登阁远眺",pk:[3,4],hist:["03-10","03-08","03-15"],mfw:"篁岭"},
  {id:15,n:"成都·龙泉驿",sp:"桃花",lat:30.57,lon:104.27,th:270,s:"spring",c:"#f8a0b0",rg:"西南",po:"锦城花满龙泉",tp:"宜：踏青赏桃",pk:[3,3],hist:["03-12","03-08","03-15"],mfw:"龙泉驿桃花故里"},
  {id:16,n:"西安·青龙寺",sp:"樱花",lat:34.23,lon:108.97,th:290,s:"spring",c:"#ffb7c5",rg:"西北",po:"长安花事满青龙",tp:"宜：古寺赏樱",pk:[3,4],hist:["03-28","03-25","04-02"],mfw:"青龙寺"},
  {id:20,n:"伊犁·薰衣草",sp:"薰衣草",lat:43.50,lon:82.0,th:500,s:"summer",c:"#9070b0",rg:"西北",po:"紫色花海接天涯",tp:"六月盛放",pk:[6,7],hist:["06-15","06-10","06-18"],mfw:"解忧公主薰衣草园"},
  {id:21,n:"杭州·曲院",sp:"荷花",lat:30.24,lon:120.13,th:650,s:"summer",c:"#f080a0",rg:"华东",po:"接天莲叶无穷碧",tp:"七月盛放",pk:[7,8],hist:["07-05","07-01","07-08"],mfw:"曲院风荷"},
  {id:22,n:"门源·油菜花",sp:"油菜花",lat:37.37,lon:101.62,th:420,s:"summer",c:"#f0d040",rg:"西北",po:"百里花海祁连下",tp:"七月盛放",pk:[7,7],hist:["07-12","07-08","07-15"],mfw:"门源油菜花"},
  {id:23,n:"呼伦贝尔",sp:"野花草甸",lat:49.21,lon:119.77,th:380,s:"summer",c:"#80c868",rg:"东北",po:"风吹草低见牛羊",tp:"六月草原",pk:[6,7],hist:["06-20","06-15","06-22"],mfw:"呼伦贝尔大草原"},
  {id:24,n:"色达·格桑花",sp:"格桑花",lat:31.8,lon:100.33,th:360,s:"summer",c:"#e060a0",rg:"西南",po:"高原格桑映佛光",tp:"六月绽放",pk:[6,7],hist:["06-25","06-20","06-28"],mfw:"色达"},
  {id:25,n:"济南·大明湖",sp:"荷花",lat:36.68,lon:117.02,th:620,s:"summer",c:"#f080a0",rg:"华东",po:"四面荷花三面柳",tp:"七月赏荷",pk:[7,8],hist:["07-08","07-05","07-12"],mfw:"大明湖"},
  {id:40,n:"北京·地坛",sp:"银杏",lat:39.95,lon:116.42,th:400,s:"autumn",c:"#e8c840",rg:"华北",po:"满城尽带黄金甲",tp:"十月踏叶",pk:[10,11],hist:["10-25","10-20","10-28"],mfw:"地坛公园"},
  {id:41,n:"额济纳·胡杨林",sp:"胡杨",lat:41.97,lon:101.07,th:370,s:"autumn",c:"#d8a030",rg:"西北",po:"千年不死大漠魂",tp:"十月金林",pk:[10,10],hist:["10-08","10-05","10-12"],mfw:"额济纳胡杨林"},
  {id:42,n:"九寨沟",sp:"彩林",lat:33.16,lon:103.92,th:370,s:"autumn",c:"#d86830",rg:"西南",po:"翠海叠瀑映彩林",tp:"十月栈道",pk:[10,10],hist:["10-15","10-12","10-18"],mfw:"九寨沟"},
  {id:43,n:"喀纳斯",sp:"白桦林",lat:48.70,lon:87.0,th:350,s:"autumn",c:"#e0a828",rg:"西北",po:"白桦林里金如画",tp:"九月穿林",pk:[9,10],hist:["09-18","09-15","09-22"],mfw:"喀纳斯"},
  {id:44,n:"北京·香山",sp:"黄栌",lat:39.99,lon:116.19,th:380,s:"autumn",c:"#d04830",rg:"华北",po:"看万山红遍",tp:"十一月晴雪",pk:[10,11],hist:["10-28","10-25","11-02"],mfw:"香山公园"},
  {id:45,n:"苏州·天平山",sp:"红枫",lat:31.25,lon:120.55,th:390,s:"autumn",c:"#d04030",rg:"华东",po:"霜叶红于二月花",tp:"十一月煮茶",pk:[11,11],hist:["11-10","11-08","11-15"],mfw:"天平山"},
  {id:46,n:"长沙·岳麓山",sp:"红枫",lat:28.17,lon:112.94,th:370,s:"autumn",c:"#d04030",rg:"华中",po:"停车坐爱枫林晚",tp:"十一月登高",pk:[10,11],hist:["11-05","11-02","11-08"],mfw:"岳麓山"},
  {id:60,n:"吉林·雾凇岛",sp:"雾凇",lat:43.88,lon:126.67,th:30,s:"winter",c:"#b0d0e8",rg:"东北",po:"千树万树梨花开",tp:"一月日出",pk:[1,1],hist:["01-10","01-08","01-12"],mfw:"雾凇岛"},
  {id:61,n:"无量山·冬樱花",sp:"冬樱花",lat:24.44,lon:100.83,th:120,s:"winter",c:"#f090a8",rg:"西南",po:"无量冬樱一梦红",tp:"十二月茶山",pk:[12,12],hist:["12-05","12-02","12-08"],mfw:"无量山樱花谷"},
  // ── 补充数据：每种花至少3-5个观赏地 ──
  // 郁金香
  {id:100,n:"上海·鲜花港",sp:"郁金香",lat:31.12,lon:121.80,th:280,s:"spring",c:"#e84060",rg:"华东",po:"浦江春色满花港",tp:"宜：拍照打卡",pk:[3,4],hist:["03-18","03-15","03-20"],mfw:"上海鲜花港"},
  {id:101,n:"北京·国际花园",sp:"郁金香",lat:40.00,lon:116.47,th:300,s:"spring",c:"#e84060",rg:"华北",po:"京城春色无边",tp:"宜：赏花踏青",pk:[4,5],hist:["04-10","04-08","04-15"],mfw:"北京国际鲜花港"},
  {id:102,n:"昆明·翠湖",sp:"郁金香",lat:25.04,lon:102.67,th:260,s:"spring",c:"#e84060",rg:"西南",po:"春城郁金香海",tp:"宜：湖畔漫步",pk:[2,3],hist:["02-20","02-18","02-25"],mfw:"翠湖公园"},
  // 樱花补充
  {id:103,n:"北京·玉渊潭",sp:"樱花",lat:39.91,lon:116.32,th:295,s:"spring",c:"#ffb7c5",rg:"华北",po:"玉渊潭畔樱如云",tp:"宜：踏春赏樱",pk:[3,4],hist:["03-25","03-22","03-28"],mfw:"玉渊潭公园"},
  {id:104,n:"昆明·圆通山",sp:"樱花",lat:25.05,lon:102.72,th:260,s:"spring",c:"#ffb7c5",rg:"西南",po:"圆通花潮涌春城",tp:"宜：登山赏樱",pk:[3,3],hist:["03-05","03-02","03-08"],mfw:"圆通山"},
  {id:105,n:"大连·旅顺",sp:"樱花",lat:38.81,lon:121.26,th:310,s:"spring",c:"#ffb7c5",rg:"东北",po:"北国樱花第一枝",tp:"宜：海滨赏樱",pk:[4,5],hist:["04-15","04-12","04-18"],mfw:"旅顺樱花园"},
  // 梅花补充
  {id:106,n:"苏州·香雪海",sp:"梅花",lat:31.24,lon:120.46,th:195,s:"spring",c:"#f0d0d8",rg:"华东",po:"香雪海中梅万树",tp:"宜：邓尉探梅",pk:[2,3],hist:["02-15","02-12","02-18"],mfw:"香雪海"},
  {id:107,n:"武汉·磨山梅园",sp:"梅花",lat:30.55,lon:114.40,th:210,s:"spring",c:"#f0d0d8",rg:"华中",po:"磨山梅花香满城",tp:"宜：冬末寻梅",pk:[2,3],hist:["02-10","02-08","02-15"],mfw:"东湖梅园"},
  // 银杏补充
  {id:108,n:"成都·锦里",sp:"银杏",lat:30.65,lon:104.05,th:380,s:"autumn",c:"#e8c840",rg:"西南",po:"锦里银杏映古巷",tp:"十一月古韵",pk:[11,11],hist:["11-08","11-05","11-12"],mfw:"锦里"},
  {id:109,n:"南京·中山陵",sp:"银杏",lat:32.06,lon:118.84,th:390,s:"autumn",c:"#e8c840",rg:"华东",po:"梧桐大道满金黄",tp:"十一月漫步",pk:[11,12],hist:["11-15","11-12","11-18"],mfw:"中山陵"},
  {id:110,n:"腾冲·银杏村",sp:"银杏",lat:25.02,lon:98.50,th:380,s:"autumn",c:"#e8c830",rg:"西南",po:"满地翻黄银杏叶",tp:"十一月古村",pk:[11,12],hist:["11-20","11-15","11-25"],mfw:"银杏村"},
  // 红枫补充
  {id:111,n:"南京·栖霞山",sp:"红枫",lat:32.10,lon:118.95,th:385,s:"autumn",c:"#d04030",rg:"华东",po:"栖霞丹枫天下知",tp:"十一月古寺",pk:[11,11],hist:["11-08","11-05","11-12"],mfw:"栖霞山"},
  {id:112,n:"广州·石门",sp:"红枫",lat:23.47,lon:113.78,th:400,s:"autumn",c:"#d04030",rg:"华南",po:"南国红叶别样红",tp:"十二月广州",pk:[12,12],hist:["12-10","12-08","12-15"],mfw:"石门国家森林公园"},
  // 荷花补充
  {id:113,n:"扬州·瘦西湖",sp:"荷花",lat:32.40,lon:119.43,th:640,s:"summer",c:"#f080a0",rg:"华东",po:"瘦西湖畔荷花开",tp:"七月泛舟",pk:[7,8],hist:["07-05","07-02","07-08"],mfw:"瘦西湖"},
  {id:114,n:"洛阳·白园",sp:"荷花",lat:34.60,lon:112.43,th:630,s:"summer",c:"#f080a0",rg:"华中",po:"白园荷香满洛阳",tp:"七月赏荷",pk:[7,8],hist:["07-08","07-05","07-12"],mfw:"白园"},
  // 油菜花补充
  {id:115,n:"汉中·洋县",sp:"油菜花",lat:33.22,lon:107.55,th:270,s:"spring",c:"#e8c840",rg:"西北",po:"汉中花海金万顷",tp:"宜：高铁直达",pk:[3,4],hist:["03-15","03-12","03-18"],mfw:"汉中油菜花"},
  {id:116,n:"贵定·金海雪山",sp:"油菜花",lat:26.58,lon:107.23,th:255,s:"spring",c:"#e8c840",rg:"西南",po:"金海雪山春如画",tp:"宜：梯田花海",pk:[3,3],hist:["03-08","03-05","03-12"],mfw:"金海雪山"},
  // 桃花补充
  {id:117,n:"上海·南汇",sp:"桃花",lat:31.02,lon:121.74,th:275,s:"spring",c:"#f8a0b0",rg:"华东",po:"南汇桃花笑春风",tp:"宜：近郊踏青",pk:[3,4],hist:["03-20","03-18","03-22"],mfw:"南汇桃花村"},
  // 杜鹃花补充
  {id:118,n:"井冈山",sp:"杜鹃花",lat:26.58,lon:114.17,th:290,s:"spring",c:"#e04070",rg:"华东",po:"井冈杜鹃红似火",tp:"宜：革命圣地",pk:[4,5],hist:["04-15","04-12","04-18"],mfw:"井冈山杜鹃"},
  // 薰衣草补充
  {id:119,n:"荆门·紫薇花海",sp:"薰衣草",lat:31.03,lon:112.20,th:490,s:"summer",c:"#9070b0",rg:"华中",po:"荆门紫色梦幻",tp:"六月花海",pk:[6,7],hist:["06-12","06-10","06-15"],mfw:"紫薇花海"},
  // 梨花补充
  {id:120,n:"砀山·梨花",sp:"梨花",lat:34.44,lon:116.35,th:265,s:"spring",c:"#d8ccc0",rg:"华东",po:"砀山梨花白如雪",tp:"宜：花海骑行",pk:[3,4],hist:["03-25","03-22","03-28"],mfw:"砀山梨花"},
  // 冬季补充
  {id:121,n:"南京·明孝陵",sp:"梅花",lat:32.06,lon:118.85,th:195,s:"winter",c:"#f0d0d8",rg:"华东",po:"钟山腊梅香如故",tp:"一月闻香",pk:[1,2],hist:["01-15","01-12","01-18"],mfw:"明孝陵"},
  {id:122,n:"昆明·黑龙潭",sp:"梅花",lat:25.10,lon:102.72,th:180,s:"winter",c:"#f0d0d8",rg:"西南",po:"龙泉探梅暗香来",tp:"十二月寻梅",pk:[12,1],hist:["12-20","12-18","12-25"],mfw:"黑龙潭公园"},
  // ── 全国主要城市热门景点补充 ──
  // 北京
  {id:130,n:"北京·颐和园",sp:"桃花",lat:39.99,lon:116.27,th:285,s:"spring",c:"#f8a0b0",rg:"华北",po:"昆明湖畔桃花笑",tp:"宜：皇家园林",pk:[4,4],hist:["04-05","04-02","04-08"],mfw:"颐和园"},
  {id:131,n:"北京·故宫",sp:"梅花",lat:39.92,lon:116.40,th:210,s:"spring",c:"#f0d0d8",rg:"华北",po:"红墙映雪梅",tp:"宜：古都探梅",pk:[3,3],hist:["03-05","03-02","03-08"],mfw:"故宫博物院"},
  {id:132,n:"北京·奥森",sp:"银杏",lat:40.02,lon:116.39,th:395,s:"autumn",c:"#e8c840",rg:"华北",po:"奥森银杏金大道",tp:"十月跑步赏秋",pk:[10,11],hist:["10-22","10-18","10-25"],mfw:"奥林匹克森林公园"},
  // 上海
  {id:133,n:"上海·顾村公园",sp:"樱花",lat:31.39,lon:121.39,th:280,s:"spring",c:"#ffb7c5",rg:"华东",po:"顾村樱花漫天飞",tp:"宜：亲子赏樱",pk:[3,4],hist:["03-20","03-18","03-23"],mfw:"顾村公园"},
  {id:134,n:"上海·辰山",sp:"油菜花",lat:31.08,lon:121.18,th:255,s:"spring",c:"#e8c840",rg:"华东",po:"辰山春色如画",tp:"宜：植物园探秘",pk:[3,3],hist:["03-12","03-10","03-15"],mfw:"辰山植物园"},
  {id:135,n:"上海·世纪公园",sp:"梅花",lat:31.21,lon:121.54,th:205,s:"spring",c:"#f0d0d8",rg:"华东",po:"浦东探梅香满园",tp:"宜：冬末寻梅",pk:[2,3],hist:["02-15","02-12","02-18"],mfw:"世纪公园"},
  {id:136,n:"上海·共青森林",sp:"银杏",lat:31.32,lon:121.52,th:390,s:"autumn",c:"#e8c840",rg:"华东",po:"共青银杏秋色浓",tp:"十一月赏秋",pk:[11,12],hist:["11-12","11-10","11-15"],mfw:"共青森林公园"},
  // 广州
  {id:137,n:"广州·华南植物园",sp:"荷花",lat:23.18,lon:113.36,th:600,s:"summer",c:"#f080a0",rg:"华南",po:"羊城夏日荷花香",tp:"六月赏荷",pk:[6,8],hist:["06-15","06-12","06-18"],mfw:"华南植物园"},
  {id:138,n:"广州·白云山",sp:"桃花",lat:23.17,lon:113.30,th:240,s:"spring",c:"#f8a0b0",rg:"华南",po:"白云山上桃花开",tp:"宜：登山踏青",pk:[2,3],hist:["02-20","02-18","02-25"],mfw:"白云山"},
  {id:139,n:"广州·流花湖",sp:"梅花",lat:23.14,lon:113.25,th:170,s:"winter",c:"#f0d0d8",rg:"华南",po:"花城冬暖梅花开",tp:"一月赏梅",pk:[1,2],hist:["01-15","01-12","01-18"],mfw:"流花湖公园"},
  // 深圳
  {id:140,n:"深圳·仙湖",sp:"杜鹃花",lat:22.58,lon:114.17,th:240,s:"spring",c:"#e04070",rg:"华南",po:"仙湖杜鹃漫山红",tp:"宜：登山赏花",pk:[3,4],hist:["03-10","03-08","03-12"],mfw:"仙湖植物园"},
  {id:141,n:"深圳·洪湖",sp:"荷花",lat:22.57,lon:114.12,th:580,s:"summer",c:"#f080a0",rg:"华南",po:"洪湖荷色映鹏城",tp:"七月赏荷",pk:[6,8],hist:["06-20","06-18","06-25"],mfw:"洪湖公园"},
  // 重庆
  {id:142,n:"重庆·南山",sp:"樱花",lat:29.53,lon:106.58,th:270,s:"spring",c:"#ffb7c5",rg:"西南",po:"山城春色满南山",tp:"宜：火锅赏樱",pk:[3,3],hist:["03-12","03-10","03-15"],mfw:"南山植物园"},
  {id:143,n:"重庆·潼南",sp:"油菜花",lat:30.19,lon:105.84,th:250,s:"spring",c:"#e8c840",rg:"西南",po:"潼南花海金万顷",tp:"宜：田园骑行",pk:[3,3],hist:["03-05","03-02","03-08"],mfw:"潼南油菜花"},
  // 成都补充
  {id:144,n:"成都·杜甫草堂",sp:"梅花",lat:30.66,lon:104.04,th:200,s:"spring",c:"#f0d0d8",rg:"西南",po:"草堂梅花诗意浓",tp:"宜：诗圣寻梅",pk:[2,3],hist:["02-10","02-08","02-15"],mfw:"杜甫草堂"},
  {id:145,n:"成都·望江楼",sp:"银杏",lat:30.64,lon:104.09,th:385,s:"autumn",c:"#e8c840",rg:"西南",po:"望江秋色金满楼",tp:"十一月品茶",pk:[11,11],hist:["11-10","11-08","11-15"],mfw:"望江楼公园"},
  // 西安补充
  {id:146,n:"西安·大明宫",sp:"牡丹",lat:34.28,lon:108.95,th:315,s:"spring",c:"#e868a0",rg:"西北",po:"大明宫里花似锦",tp:"宜：古都赏花",pk:[4,4],hist:["04-10","04-08","04-14"],mfw:"大明宫"},
  // 天津
  {id:147,n:"天津·水上公园",sp:"桃花",lat:39.09,lon:117.17,th:290,s:"spring",c:"#f8a0b0",rg:"华北",po:"海河春色桃花红",tp:"宜：泛舟赏花",pk:[4,4],hist:["04-05","04-02","04-08"],mfw:"水上公园"},
  // 哈尔滨
  {id:148,n:"哈尔滨·太阳岛",sp:"丁香花",lat:45.78,lon:126.63,th:350,s:"spring",c:"#c090d0",rg:"东北",po:"冰城丁香满城香",tp:"宜：初夏漫步",pk:[5,6],hist:["05-15","05-12","05-18"],mfw:"太阳岛"},
  // 长春
  {id:149,n:"长春·净月潭",sp:"红枫",lat:43.80,lon:125.48,th:360,s:"autumn",c:"#d04030",rg:"东北",po:"净月秋色映潭清",tp:"十月赏红叶",pk:[10,10],hist:["10-05","10-02","10-08"],mfw:"净月潭"},
  // 沈阳
  {id:150,n:"沈阳·北陵",sp:"银杏",lat:41.84,lon:123.43,th:385,s:"autumn",c:"#e8c840",rg:"东北",po:"皇陵银杏染金秋",tp:"十月寻秋",pk:[10,10],hist:["10-12","10-08","10-15"],mfw:"北陵公园"},
  // 厦门
  {id:151,n:"厦门·万石",sp:"三角梅",lat:24.44,lon:118.10,th:300,s:"spring",c:"#e040a0",rg:"华东",po:"鹭岛三角梅如火",tp:"全年可赏",pk:[3,5],hist:["03-10","03-08","03-12"],mfw:"万石植物园"},
  // 福州
  {id:152,n:"福州·西湖",sp:"桃花",lat:26.10,lon:119.28,th:260,s:"spring",c:"#f8a0b0",rg:"华东",po:"榕城春暖桃花开",tp:"宜：湖畔漫步",pk:[3,3],hist:["03-08","03-05","03-12"],mfw:"福州西湖"},
  // 南昌
  {id:153,n:"南昌·凤凰沟",sp:"樱花",lat:28.43,lon:115.98,th:275,s:"spring",c:"#ffb7c5",rg:"华东",po:"凤凰沟里樱似雪",tp:"宜：踏青赏樱",pk:[3,4],hist:["03-15","03-12","03-18"],mfw:"凤凰沟"},
  // 合肥
  {id:154,n:"合肥·包公园",sp:"荷花",lat:31.86,lon:117.27,th:630,s:"summer",c:"#f080a0",rg:"华东",po:"包河清荷映古祠",tp:"七月赏荷",pk:[7,8],hist:["07-05","07-02","07-08"],mfw:"包公园"},
  // 郑州
  {id:155,n:"郑州·碧沙岗",sp:"樱花",lat:34.76,lon:113.64,th:285,s:"spring",c:"#ffb7c5",rg:"华中",po:"碧沙岗畔樱花雨",tp:"宜：中原赏樱",pk:[3,4],hist:["03-25","03-22","03-28"],mfw:"碧沙岗公园"},
  // 太原
  {id:156,n:"太原·迎泽公园",sp:"牡丹",lat:37.87,lon:112.56,th:330,s:"spring",c:"#e868a0",rg:"华北",po:"迎泽牡丹别样红",tp:"宜：晋阳赏花",pk:[5,5],hist:["05-02","04-28","05-05"],mfw:"迎泽公园"},
  // 兰州
  {id:157,n:"兰州·五泉山",sp:"牡丹",lat:36.04,lon:103.84,th:340,s:"spring",c:"#e868a0",rg:"西北",po:"五泉牡丹映黄河",tp:"宜：西北赏花",pk:[5,5],hist:["05-05","05-02","05-08"],mfw:"五泉山公园"},
  // 桂林
  {id:158,n:"桂林·七星公园",sp:"桂花",lat:25.28,lon:110.32,th:360,s:"autumn",c:"#f0c848",rg:"华南",po:"桂林桂花甲天下",tp:"九月满城飘香",pk:[9,10],hist:["09-22","09-18","09-25"],mfw:"七星公园"},
  // 南宁
  {id:159,n:"南宁·青秀山",sp:"樱花",lat:22.79,lon:108.40,th:230,s:"spring",c:"#ffb7c5",rg:"华南",po:"邕城春色樱如云",tp:"宜：登山赏樱",pk:[2,3],hist:["02-20","02-18","02-25"],mfw:"青秀山"},
  // 贵阳
  {id:160,n:"贵阳·花溪",sp:"樱花",lat:26.41,lon:106.67,th:265,s:"spring",c:"#ffb7c5",rg:"西南",po:"花溪河畔樱花舞",tp:"宜：河畔漫步",pk:[3,3],hist:["03-10","03-08","03-15"],mfw:"花溪公园"},
  // 拉萨
  {id:161,n:"拉萨·罗布林卡",sp:"桃花",lat:29.65,lon:91.10,th:320,s:"spring",c:"#f8a0b0",rg:"西藏",po:"宫墙桃花红",tp:"宜：圣城赏春",pk:[4,5],hist:["04-15","04-12","04-18"],mfw:"罗布林卡"},
  // 洛阳补充
  {id:162,n:"洛阳·龙门石窟",sp:"牡丹",lat:34.47,lon:112.47,th:318,s:"spring",c:"#e868a0",rg:"华中",po:"龙门春色牡丹红",tp:"宜：古迹赏花",pk:[4,4],hist:["04-10","04-08","04-14"],mfw:"龙门石窟"},
  // 苏州补充
  {id:163,n:"苏州·拙政园",sp:"荷花",lat:31.32,lon:120.63,th:635,s:"summer",c:"#f080a0",rg:"华东",po:"拙政荷香满园来",tp:"七月园林赏荷",pk:[7,8],hist:["07-02","06-28","07-05"],mfw:"拙政园"},
  {id:164,n:"苏州·虎丘",sp:"桂花",lat:31.32,lon:120.57,th:355,s:"autumn",c:"#f0c848",rg:"华东",po:"虎丘桂香千年传",tp:"九月品茶闻香",pk:[9,10],hist:["09-20","09-18","09-25"],mfw:"虎丘"},
  // 杭州补充
  {id:165,n:"杭州·孤山",sp:"梅花",lat:30.25,lon:120.14,th:195,s:"spring",c:"#f0d0d8",rg:"华东",po:"疏影横斜水清浅",tp:"宜：西湖探梅",pk:[2,3],hist:["02-12","02-10","02-15"],mfw:"孤山"},
  // 黄山
  {id:166,n:"黄山·汤口",sp:"杜鹃花",lat:30.13,lon:118.17,th:305,s:"spring",c:"#e04070",rg:"华东",po:"黄山杜鹃云中开",tp:"宜：登山赏花",pk:[4,5],hist:["04-20","04-18","04-25"],mfw:"黄山风景区"},
  // 武汉补充
  {id:167,n:"武汉·黄鹤楼",sp:"桂花",lat:30.55,lon:114.31,th:360,s:"autumn",c:"#f0c848",rg:"华中",po:"黄鹤楼前桂花香",tp:"九月登楼闻香",pk:[9,10],hist:["09-25","09-22","09-28"],mfw:"黄鹤楼"},
  // 长沙补充
  {id:168,n:"长沙·橘子洲",sp:"桃花",lat:28.18,lon:112.96,th:265,s:"spring",c:"#f8a0b0",rg:"华中",po:"橘洲春色桃花笑",tp:"宜：江边踏青",pk:[3,3],hist:["03-10","03-08","03-15"],mfw:"橘子洲"},
  // 丽江
  {id:169,n:"丽江·玉龙雪山",sp:"杜鹃花",lat:27.10,lon:100.23,th:330,s:"spring",c:"#d84070",rg:"西南",po:"雪山杜鹃映云霞",tp:"宜：雪山赏花",pk:[5,6],hist:["05-10","05-08","05-15"],mfw:"玉龙雪山"},
  // 青岛补充
  {id:170,n:"青岛·中山公园",sp:"樱花",lat:36.06,lon:120.35,th:290,s:"spring",c:"#ffb7c5",rg:"华东",po:"青岛樱花大道",tp:"宜：海滨赏樱",pk:[4,4],hist:["04-10","04-08","04-15"],mfw:"中山公园"},
  // 西双版纳
  {id:171,n:"西双版纳·热带花卉园",sp:"三角梅",lat:22.00,lon:100.80,th:250,s:"winter",c:"#e040a0",rg:"西南",po:"版纳四季花不断",tp:"全年可赏",pk:[11,3],hist:["12-01","11-28","12-05"],mfw:"热带花卉园"},
  // ── 秋色景点大补充 ──
  {id:180,n:"杭州·北山路",sp:"银杏",lat:30.25,lon:120.14,th:380,s:"autumn",c:"#e8c840",rg:"华东",po:"北山路上金叶铺",tp:"十一月散步",pk:[11,11],hist:["11-15","11-12","11-18"],mfw:"北山路"},
  {id:181,n:"四川·光雾山",sp:"彩林",lat:32.48,lon:106.95,th:365,s:"autumn",c:"#d86830",rg:"西南",po:"光雾彩林绝天下",tp:"十月秋色",pk:[10,11],hist:["10-25","10-22","11-01"],mfw:"光雾山"},
  {id:182,n:"本溪·关门山",sp:"红枫",lat:41.10,lon:123.77,th:340,s:"autumn",c:"#d04030",rg:"东北",po:"辽东枫叶红似火",tp:"九月观枫",pk:[9,10],hist:["09-28","09-25","10-02"],mfw:"关门山"},
  {id:183,n:"米亚罗",sp:"彩林",lat:31.93,lon:102.77,th:370,s:"autumn",c:"#d86830",rg:"西南",po:"米亚罗彩林天堂",tp:"十月越野",pk:[10,10],hist:["10-15","10-12","10-18"],mfw:"米亚罗"},
  {id:184,n:"新疆·禾木",sp:"白桦林",lat:48.60,lon:87.10,th:345,s:"autumn",c:"#e0a828",rg:"西北",po:"禾木金秋图腾柱",tp:"九月童话村",pk:[9,10],hist:["09-20","09-18","09-25"],mfw:"禾木村"},
  {id:185,n:"南京·栖霞寺",sp:"红枫",lat:32.15,lon:118.94,th:395,s:"autumn",c:"#d04030",rg:"华东",po:"栖霞红叶满古寺",tp:"十一月古寺",pk:[11,12],hist:["11-15","11-12","11-18"],mfw:"栖霞寺"},
  {id:186,n:"北京·坡峰岭",sp:"黄栌",lat:39.70,lon:115.80,th:375,s:"autumn",c:"#d04830",rg:"华北",po:"坡峰红叶京郊艳",tp:"十月登高",pk:[10,11],hist:["10-25","10-22","10-28"],mfw:"坡峰岭"},
  {id:187,n:"贵州·加榜梯田",sp:"油菜花",lat:25.74,lon:108.55,th:245,s:"spring",c:"#e8c840",rg:"西南",po:"梯田如练金波涌",tp:"宜：云海梯田",pk:[3,4],hist:["03-18","03-15","03-22"],mfw:"加榜梯田"},
  {id:188,n:"江西·三清山",sp:"杜鹃花",lat:28.92,lon:118.08,th:305,s:"spring",c:"#e04070",rg:"华东",po:"三清杜鹃云中红",tp:"宜：云上赏花",pk:[4,5],hist:["04-25","04-22","04-28"],mfw:"三清山"},
  {id:189,n:"武汉·大学樱花",sp:"樱花",lat:30.54,lon:114.36,th:278,s:"spring",c:"#ffb7c5",rg:"华中",po:"珞珈山下樱如雪",tp:"宜：高校赏樱",pk:[3,3],hist:["03-18","03-15","03-22"],mfw:"武汉大学樱花"},
  {id:190,n:"贵州·万峰林",sp:"油菜花",lat:25.11,lon:105.00,th:235,s:"spring",c:"#e8c840",rg:"西南",po:"万峰林下金波涌",tp:"宜：喀斯特花海",pk:[2,3],hist:["02-25","02-22","03-02"],mfw:"万峰林"},
  {id:191,n:"厦门·鼓浪屿",sp:"三角梅",lat:24.45,lon:118.07,th:280,s:"spring",c:"#e040a0",rg:"华东",po:"鼓浪屿上花满墙",tp:"全年可赏",pk:[3,6],hist:["03-15","03-12","03-18"],mfw:"鼓浪屿"},
  {id:192,n:"青海湖",sp:"油菜花",lat:36.89,lon:99.68,th:410,s:"summer",c:"#f0d040",rg:"西北",po:"青海湖畔金万顷",tp:"七月最美",pk:[7,8],hist:["07-15","07-12","07-18"],mfw:"青海湖"},
  {id:193,n:"延边·龙井",sp:"苹果梨花",lat:42.77,lon:129.43,th:300,s:"spring",c:"#d8ccc0",rg:"东北",po:"延边梨花雪满园",tp:"宜：朝鲜族村",pk:[4,5],hist:["04-25","04-22","04-28"],mfw:"龙井梨花"},
  {id:194,n:"无锡·梅园",sp:"梅花",lat:31.55,lon:120.22,th:205,s:"spring",c:"#f0d0d8",rg:"华东",po:"荣氏梅园暗香浮",tp:"二月踏雪寻梅",pk:[2,3],hist:["02-20","02-18","02-25"],mfw:"梅园"},
  {id:195,n:"上海·醉白池",sp:"牡丹",lat:31.03,lon:121.24,th:325,s:"spring",c:"#e868a0",rg:"华东",po:"松江醉白牡丹开",tp:"宜：古园赏花",pk:[4,5],hist:["04-15","04-12","04-18"],mfw:"醉白池"},
  {id:196,n:"日照·海岸",sp:"樱花",lat:35.42,lon:119.52,th:295,s:"spring",c:"#ffb7c5",rg:"华东",po:"海滨樱花一片粉",tp:"宜：海景赏樱",pk:[3,4],hist:["03-30","03-28","04-03"],mfw:"日照海滨"},
  {id:197,n:"威海·刘公岛",sp:"樱花",lat:37.51,lon:122.19,th:300,s:"spring",c:"#ffb7c5",rg:"华东",po:"刘公岛上樱花海",tp:"宜：海岛赏樱",pk:[4,4],hist:["04-10","04-08","04-15"],mfw:"刘公岛"},
  {id:198,n:"鞍山·千山",sp:"梨花",lat:41.00,lon:123.11,th:275,s:"spring",c:"#d8ccc0",rg:"东北",po:"千山梨花满寺开",tp:"宜：古寺梨花",pk:[4,5],hist:["04-22","04-20","04-28"],mfw:"千山"},
  {id:199,n:"泰山",sp:"红枫",lat:36.25,lon:117.10,th:365,s:"autumn",c:"#d04030",rg:"华东",po:"泰山红叶满岱岳",tp:"十月登山",pk:[10,11],hist:["10-18","10-15","10-22"],mfw:"泰山"},
  {id:200,n:"北京·明十三陵",sp:"油菜花",lat:40.28,lon:116.23,th:280,s:"spring",c:"#e8c840",rg:"华北",po:"皇陵春色金万顷",tp:"宜：古陵花海",pk:[4,5],hist:["04-20","04-18","04-25"],mfw:"十三陵油菜花"},
  {id:201,n:"成都·花舞人间",sp:"杜鹃花",lat:30.47,lon:103.60,th:285,s:"spring",c:"#e04070",rg:"西南",po:"花舞人间杜鹃海",tp:"宜：花海游玩",pk:[3,4],hist:["03-20","03-18","03-25"],mfw:"花舞人间"},
  {id:202,n:"西岭雪山",sp:"杜鹃花",lat:30.72,lon:103.20,th:320,s:"spring",c:"#e04070",rg:"西南",po:"窗含西岭千秋雪",tp:"宜：雪山杜鹃",pk:[5,6],hist:["05-15","05-12","05-18"],mfw:"西岭雪山"},
  {id:203,n:"峨眉山",sp:"高山杜鹃",lat:29.52,lon:103.33,th:315,s:"spring",c:"#d84070",rg:"西南",po:"峨眉云雾杜鹃红",tp:"宜：佛山赏花",pk:[4,5],hist:["04-25","04-22","04-28"],mfw:"峨眉山"},
  {id:204,n:"庐山",sp:"樱花",lat:29.55,lon:115.98,th:285,s:"spring",c:"#ffb7c5",rg:"华东",po:"不识庐山真面目",tp:"宜：云中赏樱",pk:[3,4],hist:["03-28","03-25","04-02"],mfw:"庐山"},
  {id:205,n:"张家界·天门山",sp:"红枫",lat:29.05,lon:110.47,th:380,s:"autumn",c:"#d04030",rg:"华中",po:"天门山色秋意浓",tp:"十一月绝壁",pk:[11,11],hist:["11-08","11-05","11-12"],mfw:"天门山"},
  {id:206,n:"恩施·大峡谷",sp:"彩林",lat:30.40,lon:109.48,th:375,s:"autumn",c:"#d86830",rg:"华中",po:"恩施彩林秘境藏",tp:"十月秘境",pk:[10,11],hist:["10-28","10-25","11-02"],mfw:"恩施大峡谷"},
  {id:207,n:"长白山·地下森林",sp:"彩林",lat:42.08,lon:128.05,th:340,s:"autumn",c:"#d86830",rg:"东北",po:"长白彩林秋意浓",tp:"九月秋色",pk:[9,10],hist:["09-22","09-18","09-28"],mfw:"长白山"},
  {id:208,n:"婺源·石城",sp:"红枫",lat:29.35,lon:117.78,th:385,s:"autumn",c:"#d04030",rg:"华东",po:"石城红叶晨雾里",tp:"十一月古村",pk:[11,11],hist:["11-15","11-12","11-18"],mfw:"石城村"},
  {id:209,n:"洛阳·隋唐城",sp:"牡丹",lat:34.65,lon:112.45,th:318,s:"spring",c:"#e868a0",rg:"华中",po:"隋唐花海倾国色",tp:"宜：国际花会",pk:[4,4],hist:["04-12","04-08","04-15"],mfw:"隋唐城遗址"},
  {id:210,n:"菏泽·曹州牡丹园",sp:"牡丹",lat:35.23,lon:115.48,th:330,s:"spring",c:"#e868a0",rg:"华东",po:"曹州牡丹甲天下",tp:"宜：万亩花海",pk:[4,5],hist:["04-18","04-15","04-22"],mfw:"曹州牡丹园"},
];
const FAT={1:325,2:288,3:260,4:295,5:305,6:315,7:340,8:275,9:250,10:305,11:350,12:380,13:310,14:340,15:300,16:295,20:510,21:660,22:430,23:390,24:370,25:640,40:410,41:375,42:375,43:360,44:385,45:395,46:375,60:32,61:125,
  100:285,101:280,102:270,103:300,104:265,105:280,106:200,107:215,108:385,109:395,110:385,111:390,112:405,113:645,114:635,115:275,116:260,117:280,118:295,119:495,120:270,121:200,122:185,
  130:290,131:215,132:400,133:285,134:260,135:210,136:395,137:610,138:245,139:175,140:245,141:585,142:275,143:255,144:205,145:390,146:320,147:295,148:355,149:365,150:390,151:305,152:265,153:280,154:635,155:290,156:335,157:345,158:365,159:235,160:270,161:325,162:320,163:640,164:360,165:200,166:310,167:365,168:270,169:335,170:295,171:255,
  180:385,181:370,182:345,183:375,184:350,185:400,186:380,187:250,188:310,189:283,190:240,191:285,192:415,193:305,194:210,195:330,196:300,197:305,198:280,199:370,200:285,201:290,202:325,203:320,204:290,205:385,206:380,207:345,208:390,209:320,210:335};

// ── Bloom prediction from 3-year history ──
function predictBloom(f){
  if(!f.hist||f.hist.length===0)return null;
  // Parse dates, average day-of-year, then apply current year adjustment
  const doys=f.hist.map(d=>{const[m,dd]=d.split("-").map(Number);
    return(m-1)*30.44+dd;}); // approximate day of year
  const avgDoy=doys.reduce((a,b)=>a+b,0)/doys.length;
  // Current year adjustment: if warmer, earlier; if colder, later
  // Simulate with AT ratio
  const atRatio=(FAT[f.id]||200)/f.th;
  const adjust=atRatio>1?-3:atRatio>.85?0:Math.round((1-atRatio)*20);
  const predDoy=Math.round(avgDoy+adjust);
  const predMonth=Math.min(12,Math.max(1,Math.ceil(predDoy/30.44)));
  const predDay=Math.min(28,Math.max(1,Math.round(predDoy-(predMonth-1)*30.44)));
  // Confidence: higher when closer to predicted date
  const now=new Date();const nowDoy=(now.getMonth())*30.44+now.getDate();
  const daysUntil=predDoy-nowDoy;
  const confidence=daysUntil<=0?95:daysUntil<15?88:daysUntil<30?75:daysUntil<60?60:45;
  return{month:predMonth,day:predDay,daysUntil:Math.round(daysUntil),confidence,
    dateStr:`${predMonth}月${predDay}日`};
}

function calcSt(at,th,pred){
  const p=th>0?at/th:0;
  // If we have a prediction and the bloom date is well past, mark as 已谢
  if(pred&&pred.daysUntil<-14) return{st:"已谢",l:0};
  if(pred&&pred.daysUntil<-7) return{st:"末花期",l:1};
  if(p>=1.2)return{st:"已谢",l:0};if(p>=1)return{st:"盛花期",l:4};
  if(p>=.85)return{st:"初花期",l:3};if(p>=.7)return{st:"含苞待放",l:2};
  return{st:"积温中",l:1};
}

const RIVERS=[{n:"黄河",co:[[96,35.5],[100,36],[103,37],[106,38],[108,40.5],[110,40.2],[110,37],[113,35.5],[116,36],[119,37.8]],w:.4},
  {n:"长江",co:[[94,33],[97,32],[100,29],[104,30],[108,30.5],[112,30],[116,30.5],[118,31.5],[121,31.2]],w:.5},
  {n:"珠江",co:[[104,24],[108,23],[112,22.8],[114,22.5]],w:.3}];
const MTNS=[{n:"秦岭",co:[[104,34],[108,34.5],[112,34]],d:"4,3"},{n:"太行山",co:[[113,40],[114,38],[113,35]],d:"3,3"},
  {n:"天山",co:[[78,43],[86,43],[90,42.5]],d:"4,3"},{n:"南岭",co:[[110,26],[114,25],[116,25.5]],d:"3,3"}];
const REGIONS=[{id:"all",n:"全 览",cx:104.5,cy:35,z:1},{id:"dongbei",n:"东 北",cx:126,cy:45,z:4},
  {id:"huabei",n:"华 北",cx:116,cy:39,z:4.5},{id:"xibei",n:"西 北",cx:85,cy:40,z:2.5},
  {id:"huadong",n:"华 东",cx:120,cy:30,z:5},{id:"huazhong",n:"华 中",cx:112,cy:31,z:4.5},
  {id:"xinan",n:"西 南",cx:102,cy:28,z:3.5},{id:"huanan",n:"华 南",cx:110,cy:23,z:4.5},
  {id:"qingzang",n:"青 藏",cx:90,cy:32,z:2.5}];

// ═══ Instrument SVG Icons ═══
function InstrIcon({type,sz}){const s=sz||20;const o=.8;
  if(type==="guqin")return <svg viewBox="0 0 32 32" width={s} height={s}><g opacity={o}><rect x="4" y="13" width="24" height="5" rx="2.5" fill="#8a6a40"/><line x1="6" y1="14" x2="6" y2="17" stroke="#c8a060" strokeWidth=".6"/><line x1="10" y1="14" x2="10" y2="17" stroke="#c8a060" strokeWidth=".6"/><line x1="14" y1="14" x2="14" y2="17" stroke="#c8a060" strokeWidth=".6"/><line x1="6" y1="15.5" x2="28" y2="15.5" stroke="#d0b880" strokeWidth=".3"/><line x1="6" y1="14.8" x2="28" y2="14.8" stroke="#d0b880" strokeWidth=".3"/><line x1="6" y1="16.2" x2="28" y2="16.2" stroke="#d0b880" strokeWidth=".3"/></g></svg>;
  if(type==="guzheng")return <svg viewBox="0 0 32 32" width={s} height={s}><g opacity={o}><path d="M3,18 Q16,10 29,14" stroke="#8a6a40" strokeWidth="2.5" fill="none" strokeLinecap="round"/>{[8,12,16,20,24].map(x=><line key={x} x1={x} y1={11+x*.15} x2={x} y2={17-x*.05} stroke="#d0b880" strokeWidth=".4"/>)}<circle cx="6" cy="17" r="1" fill="#c8a060"/></g></svg>;
  if(type==="pipa")return <svg viewBox="0 0 32 32" width={s} height={s}><g opacity={o}><ellipse cx="16" cy="20" rx="6" ry="7" fill="#c8a060"/><rect x="14.5" y="5" width="3" height="15" rx="1.5" fill="#a08050"/>{[7,9,11,13].map(y=><line key={y} x1="13" y1={y} x2="19" y2={y} stroke="#8a6a40" strokeWidth=".5"/>)}<line x1="15" y1="13" x2="15" y2="26" stroke="#d0b880" strokeWidth=".3"/><line x1="16" y1="13" x2="16" y2="26" stroke="#d0b880" strokeWidth=".3"/><line x1="17" y1="13" x2="17" y2="26" stroke="#d0b880" strokeWidth=".3"/></g></svg>;
  if(type==="erhu")return <svg viewBox="0 0 32 32" width={s} height={s}><g opacity={o}><rect x="15" y="4" width="2" height="22" rx="1" fill="#8a6a40"/><circle cx="16" cy="24" r="4.5" fill="none" stroke="#a08050" strokeWidth="1.5"/><rect x="13" y="22" width="6" height="5" rx="1" fill="#d8c8a0" opacity=".5"/><line x1="15.5" y1="6" x2="15.5" y2="22" stroke="#d0b880" strokeWidth=".4"/><line x1="16.5" y1="6" x2="16.5" y2="22" stroke="#d0b880" strokeWidth=".4"/><rect x="12" y="6" width="8" height="1.5" rx=".5" fill="#a08050"/></g></svg>;
  if(type==="xiao")return <svg viewBox="0 0 32 32" width={s} height={s}><g opacity={o}><rect x="14.5" y="3" width="3" height="26" rx="1.5" fill="#c8a860"/>{[10,13,16,19,22].map(y=><circle key={y} cx="16" cy={y} r=".8" fill="#8a6a40"/>)}<circle cx="16" cy="5" r="1" fill="#a08050"/></g></svg>;
  if(type==="dizi")return <svg viewBox="0 0 32 32" width={s} height={s}><g opacity={o}><rect x="3" y="14.5" width="26" height="3" rx="1.5" fill="#c8b060"/>{[8,12,16,20,24].map(x=><circle key={x} cx={x} cy="16" r=".7" fill="#8a6a40"/>)}</g></svg>;
  return <svg viewBox="0 0 32 32" width={s} height={s}><g opacity={o}><circle cx="16" cy="16" r="6" fill="none" stroke="#a08050" strokeWidth="1.5"/><circle cx="16" cy="16" r="2" fill="#c8a060"/></g></svg>;
}

// ═══ Music: Web Audio API (always works, no external deps) ═══
const MELODIES=[
  {name:"高山流水",inst:"guzheng",bpm:72,scale:[261.6,293.7,329.6,392,440],melody:[4,3,2,0,-1,0,1,2,3,4,-1,3,2,1,0,-1,2,3,4,3,-1,-1,1,0]},
  {name:"春江花月夜",inst:"pipa",bpm:80,scale:[392,440,523.3,587.3,659.3],melody:[3,2,1,0,-1,1,2,3,4,3,2,1,-1,-1,0,1,2,3,-1,2,1,0]},
  {name:"梅花三弄",inst:"guqin",bpm:56,scale:[220,261.6,329.6,392,440],melody:[0,1,2,4,-1,-1,2,1,0,-1,0,1,-1,-1,2,3,2,1,0,-1,1,-1,2]},
  {name:"二泉映月",inst:"erhu",bpm:66,scale:[196,220,261.6,293.7,329.6],melody:[1,0,2,3,-1,-1,4,3,2,0,-1,1,-1,0,2,0,1,-1,0,1,2,-1,-1,3]},
  {name:"渔舟唱晚",inst:"guzheng",bpm:76,scale:[293.7,329.6,392,440,523.3],melody:[2,3,4,3,-1,2,1,0,-1,1,2,3,-1,4,3,2,-1,1,0,1,-1,-1,2,3]},
  {name:"平湖秋月",inst:"guzheng",bpm:60,scale:[261.6,329.6,392,440,523.3],melody:[0,2,3,-1,4,3,2,0,-1,1,2,3,-1,-1,4,3,2,1,0,-1,1,2]},
  {name:"阳关三叠",inst:"guqin",bpm:50,scale:[293.7,329.6,392,440,523.3],melody:[1,-1,2,3,-1,-1,4,3,-1,2,1,-1,0,1,2,-1,-1,3,2,1,-1,-1,0]},
  {name:"彩云追月",inst:"pipa",bpm:88,scale:[392,440,523.3,587.3,659.3],melody:[4,3,2,1,2,3,-1,4,3,2,1,-1,0,1,2,3,-1,-1,4,3,2,1,0]},
  {name:"广陵散",inst:"guqin",bpm:52,scale:[130.8,164.8,196,220,261.6],melody:[0,2,3,-1,-1,4,3,2,-1,0,-1,1,2,3,-1,-1,4,2,1,0,-1,-1,1]},
  {name:"姑苏行",inst:"dizi",bpm:84,scale:[523.3,587.3,659.3,784,880],melody:[2,1,0,2,3,-1,4,3,2,1,-1,0,1,2,-1,3,4,3,2,-1,1,0,1,2]},
];
const INST_WAVE={"guzheng":"triangle","pipa":"sawtooth","guqin":"sine","erhu":"triangle","dizi":"square","xiao":"sine"};
const INST_LABEL={"guqin":"古琴","guzheng":"古筝","pipa":"琵琶","erhu":"二胡","xiao":"箫","dizi":"竹笛"};

let audioCtx=null;
function playNote(freq,dur,wave,vol=0.08){
  if(!audioCtx)audioCtx=new(window.AudioContext||window.webkitAudioContext)();
  const osc=audioCtx.createOscillator();const gain=audioCtx.createGain();
  const now=audioCtx.currentTime;
  osc.type=wave;osc.frequency.setValueAtTime(freq,now);
  // Add slight vibrato for erhu
  if(wave==="triangle"){const lfo=audioCtx.createOscillator();const lfoGain=audioCtx.createGain();
    lfo.frequency.value=5;lfoGain.gain.value=2;lfo.connect(lfoGain);lfoGain.connect(osc.frequency);lfo.start(now);lfo.stop(now+dur);}
  gain.gain.setValueAtTime(vol,now);
  gain.gain.exponentialRampToValueAtTime(vol*0.8,now+0.05);
  gain.gain.exponentialRampToValueAtTime(0.001,now+dur);
  osc.connect(gain);gain.connect(audioCtx.destination);
  osc.start(now);osc.stop(now+dur);
}

function MusicPlayer(){
  const [collapsed,setCollapsed]=useState(true);
  const [ti,setTi]=useState(0);
  const [playing,setPlaying]=useState(false);
  const timerRef=useRef(null);const niRef=useRef(0);const playRef=useRef(false);

  const t=MELODIES[ti%MELODIES.length];

  const stop=useCallback(()=>{playRef.current=false;if(timerRef.current)clearTimeout(timerRef.current);setPlaying(false);},[]);

  const playTrack=useCallback((idx)=>{
    stop();const tr=MELODIES[idx%MELODIES.length];
    niRef.current=0;playRef.current=true;setPlaying(true);
    const wave=INST_WAVE[tr.inst]||"sine";
    const beatMs=60000/tr.bpm;
    const tick=()=>{
      if(!playRef.current)return;
      const noteIdx=tr.melody[niRef.current%tr.melody.length];
      if(noteIdx>=0){
        const freq=tr.scale[noteIdx%tr.scale.length];
        const dur=beatMs/1000*(0.8+Math.random()*0.3);
        playNote(freq,dur,wave,0.06+Math.random()*0.04);
        // Occasional octave lower harmony
        if(Math.random()>0.8)playNote(freq/2,dur*1.2,wave,0.02);
      }
      niRef.current++;
      if(niRef.current>=tr.melody.length*3){
        // Auto-advance
        const next=(idx+1)%MELODIES.length;
        setTi(next);playTrack(next);return;
      }
      const dt=noteIdx<0?beatMs*1.5+Math.random()*200:beatMs+Math.random()*beatMs*0.3;
      timerRef.current=setTimeout(tick,dt);
    };
    // Start with low drone
    if(tr.scale[0])playNote(tr.scale[0]/2,4,"sine",0.015);
    tick();
  },[stop]);

  const toggle=()=>{if(playing)stop();else playTrack(ti);};
  const next=()=>{const n=(ti+1)%MELODIES.length;setTi(n);if(playing)playTrack(n);};
  const prev=()=>{const n=(ti-1+MELODIES.length)%MELODIES.length;setTi(n);if(playing)playTrack(n);};

  // Collapsed: show instrument icon
  if(collapsed)return(
    <button onClick={()=>setCollapsed(false)} style={{position:"absolute",bottom:6,right:6,zIndex:36,
      border:"none",borderRadius:"50%",width:44,height:44,cursor:"pointer",
      background:"rgba(250,245,237,.95)",boxShadow:"0 2px 10px rgba(0,0,0,.08)",
      display:"flex",alignItems:"center",justifyContent:"center",padding:0}}>
      <InstrIcon type={playing?t.inst:"guqin"} sz={playing?30:26}/>
      {playing&&<div style={{position:"absolute",top:0,right:0,width:10,height:10,borderRadius:"50%",
        background:C.accent,border:"2px solid #faf5ed",animation:"pulse 1.5s ease-in-out infinite"}}/>}
    </button>);

  return(<div style={{position:"absolute",bottom:4,right:3,zIndex:36,
    background:"rgba(250,245,237,.95)",backdropFilter:"blur(8px)",
    borderRadius:10,padding:"5px 6px",boxShadow:"0 1px 8px rgba(0,0,0,.06)",width:200}}>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:3}}>
      <div style={{display:"flex",alignItems:"center",gap:3}}>
        <InstrIcon type={t.inst} sz={18}/>
        <span style={{fontSize:7.5,color:C.tl,letterSpacing:1}}>{INST_LABEL[t.inst]||"器乐"}</span>
      </div>
      <button onClick={()=>setCollapsed(true)} style={{border:"none",background:"none",cursor:"pointer",fontSize:8,color:C.tl,padding:0}}>▾</button>
    </div>
    <div style={{display:"flex",alignItems:"center",gap:4}}>
      <button onClick={prev} style={{border:"none",background:"none",cursor:"pointer",fontSize:9,color:C.tl,padding:1}}>⏮</button>
      <button onClick={toggle} style={{border:"none",background:"none",cursor:"pointer",fontSize:14,color:C.accent,padding:1}}>{playing?"⏸":"▶"}</button>
      <button onClick={next} style={{border:"none",background:"none",cursor:"pointer",fontSize:9,color:C.tl,padding:1}}>⏭</button>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:12,fontWeight:700,color:C.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{t.name}</div>
        <div style={{fontSize:6.5,color:C.tl}}>{ti+1}/{MELODIES.length}首</div>
      </div>
    </div>
  </div>);
}

// ═══ Zoom Controls (for touchpad users) ═══
function ZoomControls({wz,setWz}){
  return(<div style={{position:"absolute",right:3,top:"50%",transform:"translateY(-50%)",zIndex:30,
    display:"flex",flexDirection:"column",gap:1,background:"rgba(250,245,237,.85)",
    borderRadius:6,padding:"2px",boxShadow:"0 1px 4px rgba(0,0,0,.03)"}}>
    <button onClick={()=>setWz(z=>Math.min(8,z*1.4))} style={{border:"none",borderRadius:4,width:32,height:32,
      cursor:"pointer",background:"transparent",color:C.tl,fontSize:14,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
    <div style={{width:24,textAlign:"center",fontSize:7,color:C.tl}}>{Math.round(wz*100)}%</div>
    <button onClick={()=>setWz(z=>Math.max(1,z*.7))} style={{border:"none",borderRadius:4,width:32,height:32,
      cursor:"pointer",background:"transparent",color:C.tl,fontSize:14,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>−</button>
  </div>);
}

// ═══ Alert Banner: 15s, clickable, DATE-AWARE + seasonal wisdom ═══
function AlertBanner({onGo,flora}){
  const [sh,setSh]=useState(false);const [i,setI]=useState(0);
  const alerts=useMemo(()=>{
    const now=new Date();const cm=now.getMonth()+1;const cs=getSeason();
    const result=[];
    flora.forEach(f=>{
      const pred=f._pred;if(!pred)return;
      const du=pred.daysUntil;
      if(du>=3&&du<=7) result.push({m:`【花信风】${f.n}${f.sp}将于${du}日后进入盛花期`,id:f.id,pri:3});
      if(du<=0&&du>=-10&&(f._st?.l||0)>=3) result.push({m:`【花信风】${f.n}${f.sp}正值盛花期 · ${f.po}`,id:f.id,pri:4});
      if(du<-8&&du>=-14&&(f._st?.l||0)>=3) result.push({m:`【急报】${f.n}${f.sp}花期渐近尾声，欲赏请趁本周`,id:f.id,pri:5});
      if(du<-14&&(f._st?.l||0)<=1){
        const next=flora.find(x=>x.sp===f.sp&&x.id!==f.id&&x._pred&&x._pred.daysUntil>0&&x._pred.daysUntil<30);
        if(next) result.push({m:`【接力】${f.n.split("·")[1]||f.n}${f.sp}已谢，${next.n}正在接力绽放`,id:next.id,pri:2});
      }
    });
    // Add seasonal wisdom alerts
    const seasonalTips={
      spring:[{m:"【花信】春风二十四番，应候而至，踏青赏花正当时",pri:1},{m:"【雅事】古人云：三月桃花雨，四月梨花雪，五月牡丹开",pri:1},{m:"【花信】谷雨前后，种瓜点豆，亦是牡丹盛时",pri:1}],
      summer:[{m:"【雅事】荷香清露，最宜月下小酌",pri:1},{m:"【花信】接天莲叶无穷碧，七月最是赏荷时",pri:1},{m:"【提醒】暑气蒸腾，薰衣草花海宜清晨前往",pri:1}],
      autumn:[{m:"【雅事】霜降后红叶最艳，西风不胜银杏金",pri:1},{m:"【花信】九月桂花十月菊，十一月红枫正当时",pri:1},{m:"【提醒】赏红叶需观气温骤降，色差越大越艳",pri:1}],
      winter:[{m:"【雅事】暗香浮动月黄昏，寻梅需踏雪而行",pri:1},{m:"【花信】冬至前后雾凇最盛，吉林可期",pri:1},{m:"【提醒】南方冬樱十二月盛开，无量山茶山一绝",pri:1}],
    };
    (seasonalTips[cs]||[]).forEach(t=>result.push({...t,id:1}));
    result.sort((a,b)=>b.pri-a.pri);
    if(result.length===0){
      result.push({m:"【花信风】点击花卉图标查看盛花期预测，基于3年历史数据推算",id:1,pri:0});
      result.push({m:"【花信风】滚轮缩放、方向键漫游，发现中国每一处花事",id:1,pri:0});
    }
    return result.slice(0,15);
  },[flora]);

  useEffect(()=>{const t=setTimeout(()=>setSh(true),1200);
    const iv=setInterval(()=>{setSh(false);setTimeout(()=>{setI(j=>(j+1)%alerts.length);setSh(true);},400);},15000);
    return()=>{clearTimeout(t);clearInterval(iv);};},[alerts.length]);
  return(<div onClick={()=>onGo(alerts[i%alerts.length].id)} style={{position:"absolute",top:8,left:"50%",transform:`translateX(-50%) translateY(${sh?0:-8}px)`,
    opacity:sh?1:0,transition:"all .4s",zIndex:32,background:"rgba(250,245,237,.95)",backdropFilter:"blur(8px)",
    padding:"7px 18px",borderRadius:18,boxShadow:"0 2px 10px rgba(0,0,0,.05)",cursor:"pointer",
    fontSize:13,color:C.text,maxWidth:"min(680px,88vw)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",letterSpacing:1.5}}>
    {alerts[i%alerts.length].m}<span style={{fontSize:10,color:C.accent,marginLeft:6}}>查看 →</span></div>);
}

// ═══ Daily Mood Card (心情签) — random fortune/mood drawing ═══
const MOOD_CARDS=[
  {name:"桃花签",emoji:"🌸",color:"#f8a0b0",mood:"柔情似水",poem:"桃之夭夭，灼灼其华",meaning:"今日宜遇良人，温柔以待万物。不争不抢，花开自有时。"},
  {name:"梅花签",emoji:"❄",color:"#f0d0d8",mood:"孤傲清高",poem:"零落成泥碾作尘，只有香如故",meaning:"今日宜独处，凌寒而立。不随波逐流，坚守心中本色。"},
  {name:"牡丹签",emoji:"🌺",color:"#e868a0",mood:"富贵雍容",poem:"唯有牡丹真国色，花开时节动京城",meaning:"今日宜展露锋芒，自信从容。花王加冕，万众瞩目。"},
  {name:"兰花签",emoji:"🌿",color:"#a8c890",mood:"幽谷独芳",poem:"芝兰生于深林，不以无人而不芳",meaning:"今日宜静心修身，不慕外物。香在暗处，自有知音。"},
  {name:"莲花签",emoji:"🪷",color:"#f080a0",mood:"出淤泥而不染",poem:"濯清涟而不妖，中通外直",meaning:"今日宜心怀澄澈，不随俗流。出于尘世，归于本真。"},
  {name:"菊花签",emoji:"🌼",color:"#e8c840",mood:"淡泊归隐",poem:"采菊东篱下，悠然见南山",meaning:"今日宜隐退休憩，与自然同行。功名利禄，皆可暂放。"},
  {name:"杜鹃签",emoji:"🌹",color:"#e04070",mood:"思念如火",poem:"子规夜半犹啼血，不信东风唤不回",meaning:"今日宜表达心意，情真意切。有思念便化作行动。"},
  {name:"樱花签",emoji:"🌸",color:"#ffb7c5",mood:"转瞬即逝",poem:"花开堪折直须折，莫待无花空折枝",meaning:"今日宜把握当下，莫待春归。短暂但灿烂，方是真意。"},
  {name:"桂花签",emoji:"🌼",color:"#f0c848",mood:"暗香盈袖",poem:"暗淡轻黄体性柔，情疏迹远只香留",meaning:"今日宜低调内敛，以德服人。不显山不露水，自有芬芳。"},
  {name:"茉莉签",emoji:"🤍",color:"#f0f0e8",mood:"纯洁无瑕",poem:"一卉能熏一室香，炎天犹觉玉肌凉",meaning:"今日宜保持初心，简单纯粹。身处纷扰，心自清凉。"},
  {name:"银杏签",emoji:"🍂",color:"#e8c840",mood:"岁月静好",poem:"满城尽带黄金甲",meaning:"今日宜缓步慢行，珍惜当下光阴。金色洒落，皆为馈赠。"},
  {name:"枫叶签",emoji:"🍁",color:"#d04030",mood:"热烈深情",poem:"霜叶红于二月花",meaning:"今日宜燃烧自己，照亮他人。历经风霜，方显本色。"},
  {name:"薰衣草签",emoji:"💜",color:"#9070b0",mood:"浪漫温柔",poem:"紫色花海接天涯",meaning:"今日宜追寻浪漫，相信美好。远方有风，亦有花。"},
  {name:"向日葵签",emoji:"🌻",color:"#f0a020",mood:"阳光积极",poem:"朝朝向日，不惧风雨",meaning:"今日宜心向光明，积极向上。有太阳处，便是归处。"},
  {name:"丁香签",emoji:"💟",color:"#c090d0",mood:"愁思绵长",poem:"芭蕉不展丁香结，同向春风各自愁",meaning:"今日宜理清心绪，放下执念。心结自解，春风自来。"},
];

function MoodCard({onClose}){
  const [card,setCard]=useState(null);
  const [revealed,setRevealed]=useState(false);
  const [shaking,setShaking]=useState(false);
  
  const dailySeed=useMemo(()=>{const d=new Date();return d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate();},[]);
  
  useEffect(()=>{(async()=>{
    try{const r=await window.storage?.get("mood_"+dailySeed);
      if(r?.value){const c=JSON.parse(r.value);setCard(MOOD_CARDS.find(x=>x.name===c));setRevealed(true);return;}}catch{}
  })();},[dailySeed]);

  const draw=async()=>{
    setShaking(true);
    setTimeout(async()=>{
      const picked=MOOD_CARDS[Math.floor(Math.abs(Math.sin(dailySeed*0.618))*MOOD_CARDS.length)%MOOD_CARDS.length];
      setCard(picked);setShaking(false);
      setTimeout(()=>setRevealed(true),400);
      try{await window.storage?.set("mood_"+dailySeed,JSON.stringify(picked.name));}catch{}
    },1200);
  };

  return(<div style={{position:"fixed",inset:0,zIndex:150,display:"flex",alignItems:"center",justifyContent:"center",
    background:"rgba(30,20,15,.5)",backdropFilter:"blur(6px)"}} onClick={onClose}>
    <div onClick={e=>e.stopPropagation()} style={{width:"min(380px,88vw)",padding:"24px 28px",
      background:"linear-gradient(180deg,#faf5ed,#f5ece0,#faf5ed)",
      borderRadius:14,boxShadow:"0 8px 32px rgba(0,0,0,.2)",position:"relative",
      border:"2px solid rgba(180,150,100,.2)"}}>
      <button onClick={onClose} style={{position:"absolute",top:10,right:12,border:"none",background:"none",
        cursor:"pointer",fontSize:18,color:C.tl,padding:0}}>×</button>
      {!card&&<div style={{textAlign:"center",padding:"20px 0"}}>
        <div style={{fontSize:56,marginBottom:16,animation:shaking?"shake .15s infinite":"none"}}>🪷</div>
        <h2 style={{fontSize:22,fontWeight:900,color:C.text,letterSpacing:6,marginBottom:6}}>每日花签</h2>
        <div style={{fontSize:12,color:C.tl,letterSpacing:2,marginBottom:24,lineHeight:1.6}}>
          一花一世界 · 一签一解语<br/>抽一支今日花签，得一段今日心语</div>
        <button onClick={draw} disabled={shaking} style={{border:"none",background:`linear-gradient(135deg,${C.accent},${C.accent2})`,
          color:"#fff",borderRadius:20,padding:"10px 28px",cursor:shaking?"default":"pointer",
          fontSize:14,fontWeight:700,letterSpacing:3,
          boxShadow:`0 4px 14px ${C.accent}44`}}>
          {shaking?"摇动中...":"🎐 摇签"}</button>
      </div>}
      {card&&<div style={{textAlign:"center",padding:"12px 0",opacity:revealed?1:0,transform:revealed?"translateY(0)":"translateY(10px)",transition:"all .5s"}}>
        <div style={{fontSize:62,marginBottom:8}}>{card.emoji}</div>
        <div style={{fontSize:14,color:card.color,letterSpacing:4,marginBottom:3,fontWeight:600}}>今日得签</div>
        <h2 style={{fontSize:28,fontWeight:900,color:C.text,letterSpacing:8,marginBottom:4}}>{card.name}</h2>
        <div style={{fontSize:14,color:card.color,letterSpacing:3,marginBottom:16,fontWeight:600}}>·{card.mood}·</div>
        <div style={{padding:"12px 16px",background:`${card.color}12`,borderLeft:`3px solid ${card.color}`,
          borderRadius:"0 6px 6px 0",marginBottom:12,fontSize:14,color:C.text,letterSpacing:2.5,
          lineHeight:1.7,fontStyle:"italic",textAlign:"left"}}>「{card.poem}」</div>
        <div style={{fontSize:13,color:C.text,letterSpacing:1.5,lineHeight:1.8,padding:"4px 8px"}}>{card.meaning}</div>
        <div style={{marginTop:16,fontSize:10,color:C.tl,opacity:.55,letterSpacing:2}}>
          · 每日一签 · 明日再会 ·</div>
      </div>}
    </div></div>);
}

// ═══ Scroll Landing ═══
function ScrollLanding({onEnter}){
  const cs=getSeason();const sm=SM[cs];
  const poems={spring:"桃花一簇开无主\n可爱深红爱浅红",summer:"小荷才露尖尖角\n早有蜻蜓立上头",autumn:"停车坐爱枫林晚\n霜叶红于二月花",winter:"忽如一夜春风来\n千树万树梨花开"};
  const [dx,setDx]=useState(0);const [dg,setDg]=useState(false);const [en,setEn]=useState(false);const sr=useRef(null);const cr=useRef(null);
  const hs=e=>{e.preventDefault();sr.current={x:e.touches?e.touches[0].clientX:e.clientX,d:dx};setDg(true);};
  const hm=e=>{if(!dg||!sr.current)return;const x=e.touches?e.touches[0].clientX:e.clientX;
    setDx(Math.max(0,Math.min(1,sr.current.d+(x-sr.current.x)/((cr.current?.offsetWidth||600)*.4))));};
  const he=()=>{setDg(false);if(dx>.5){setDx(1);setTimeout(()=>{setEn(true);setTimeout(onEnter,300);},150);}else setDx(0);};
  return(<div ref={cr} style={{position:"fixed",inset:0,zIndex:200,background:sm.c+"10",
    display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
    opacity:en?0:1,transition:"opacity .3s",userSelect:"none",touchAction:"none"
  }} onPointerMove={hm} onPointerUp={he} onPointerLeave={he} onTouchMove={hm} onTouchEnd={he}>
    <div style={{position:"absolute",inset:0,overflow:"hidden",opacity:.08}}>
      {Array.from({length:12}).map((_,i)=>(<div key={i} style={{position:"absolute",left:`${Math.random()*100}%`,top:`${Math.random()*100}%`,fontSize:10+Math.random()*12,color:sm.c}}>{sm.i}</div>))}</div>
    <div style={{marginBottom:18,textAlign:"center",opacity:1-dx*1.5,transition:dg?"none":"all .3s"}}>
      <div style={{fontSize:38,fontWeight:900,color:C.text,letterSpacing:10}}>花信风</div>
      <div style={{fontSize:10,color:C.tl,letterSpacing:3,marginTop:4}}>跟着天地节律 · 追一场中国色</div></div>
    <div style={{position:"relative",width:"min(420px,74vw)",height:130}}>
      <div style={{position:"absolute",left:0,top:0,bottom:0,width:14,borderRadius:7,background:"linear-gradient(90deg,#a07848,#c8a070,#b89060,#a07848)",boxShadow:"2px 0 5px rgba(0,0,0,.12)",zIndex:5}}/>
      <div style={{position:"absolute",left:14,right:14,top:0,bottom:0,overflow:"hidden"}}>
        <div style={{position:"absolute",left:0,top:0,bottom:0,width:`${dx*100}%`,background:"linear-gradient(180deg,#f8f2e8,#f0e8dc,#f8f2e8)",
          transition:dg?"none":"width .3s",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden"}}>
          {dx>.2&&<div style={{textAlign:"center",padding:8,opacity:Math.min(1,(dx-.2)*3),whiteSpace:"pre-line",minWidth:150}}>
            <div style={{fontSize:11,color:sm.c,letterSpacing:3,lineHeight:2}}>{poems[cs]}</div></div>}</div></div>
      <div onPointerDown={hs} onTouchStart={hs}
        style={{position:"absolute",left:`${12+dx*66}%`,top:0,bottom:0,width:14,borderRadius:7,
          background:"linear-gradient(90deg,#a07848,#c8a070,#b89060,#a07848)",boxShadow:"-2px 0 5px rgba(0,0,0,.12)",
          cursor:"grab",transition:dg?"none":"all .3s",zIndex:5}}/></div>
    <div style={{marginTop:12,fontSize:8.5,color:C.tl,letterSpacing:3,opacity:.35}}>← 拖动卷轴 →</div>
    <button onClick={()=>{setDx(1);setTimeout(()=>{setEn(true);setTimeout(onEnter,200);},100);}}
      style={{position:"absolute",bottom:14,border:"none",background:"transparent",
        cursor:"pointer",fontSize:8,color:C.tl,opacity:.25}}>
      {"直接进入"}</button>
  </div>);
}

// ═══ Marker / Card / Wheel / Rank ═══
function Mk({s,px,py,zoom,onClick,hl}){
  const [hov,setHov]=useState(false);const [sh,setSh]=useState(false);
  const st=s._st||{st:"...",l:1};const hot=st.l>=3,dead=st.l===0;const pred=s._pred;
  useEffect(()=>{const t=setTimeout(()=>setSh(true),25+s.id*10);return()=>clearTimeout(t);},[s.id]);
  const base=hl?26:(hot?16:10);const sz=Math.max(base,base*Math.sqrt(zoom)/(hl?1.5:1.1));
  // In species mode (hl), always show even if faded - just dimmer
  if(dead&&zoom<2.5&&!hl)return null;
  return(<div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} onClick={onClick}
    style={{position:"absolute",left:px,top:py,transform:`translate(-50%,-50%) scale(${sh?(hov?1.15:1):0})`,
      opacity:sh?(dead?(hl?.35:.1):1):0,transition:"all .2s cubic-bezier(.34,1.56,.64,1)",
      cursor:"pointer",zIndex:hov?20:10,textAlign:"center",filter:hl?`drop-shadow(0 0 6px ${s.c})`:"none"}}>
    {hot&&<div style={{position:"absolute",left:"50%",top:"50%",transform:"translate(-50%,-50%)",
      width:sz*2.4,height:sz*2.4,borderRadius:"50%",background:`radial-gradient(circle,${s.c}20,transparent 70%)`,animation:"pulse 2.5s ease-in-out infinite"}}/>}
    <div style={{width:sz,height:sz,borderRadius:"50%",margin:"0 auto",background:dead?"#e0d8d0":"rgba(255,255,255,.85)",
      border:`${Math.max(1.5,zoom*.4)}px solid ${dead?"#c0b8b0":s.c}55`,
      boxShadow:dead?"none":`0 2px ${Math.max(3,zoom*2)}px ${s.c}33`,
      display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden"}}>
      {dead?<span style={{fontSize:sz*.4,opacity:.3}}>·</span>:<FI sp={s.sp} sz={sz*(hl?.8:.65)} co={s.c}/>}</div>
    {(zoom>=1.8||hl)&&!dead&&<div style={{marginTop:2,fontSize:hl?11:Math.min(13,10+zoom*.5),color:C.text,whiteSpace:"nowrap",
      textShadow:`0 1px 3px ${C.bg}`,fontWeight:600,letterSpacing:.5,opacity:hov?1:.65}}>{s.n.split("·")[1]||s.n}</div>}
    {hl&&!dead&&<div style={{fontSize:10,color:s.c,opacity:.7}}>{s._pred?s._pred.dateStr:s.pk[0]+"月"}</div>}
    {hov&&<div style={{position:"absolute",bottom:"calc(100% + 6px)",left:"50%",transform:"translateX(-50%)",
      background:"rgba(250,245,237,.96)",backdropFilter:"blur(8px)",padding:"8px 12px",borderRadius:8,
      boxShadow:"0 3px 14px rgba(0,0,0,.08)",whiteSpace:"nowrap",zIndex:50}}>
      <div style={{fontSize:14,fontWeight:700,color:C.text,letterSpacing:2}}>{s.n}</div>
      <div style={{fontSize:12,color:dead?"#aaa":s.c,marginTop:2}}>{s.sp}·{st.st}</div>
      {pred&&<div style={{fontSize:11,color:C.accent,marginTop:2,fontWeight:600}}>
        🌡 预测盛期：{pred.dateStr} {pred.daysUntil>0?`(${pred.daysUntil}天后)`:"(已到)"} · 置信度{pred.confidence}%</div>}
      {s._dist!=null&&<div style={{fontSize:11,color:C.accent,marginTop:2}}>距你{Math.round(s._dist)}km</div>}
    </div>}</div>);
}

function Card({s,onClose}){const [v,setV]=useState(false);useEffect(()=>{setTimeout(()=>setV(true),10);},[]);
  const cl=()=>{setV(false);setTimeout(onClose,120);};const st=s._st||{st:"...",l:1};const sm=SM[s.s];const pred=s._pred;
  const pct=s.th>0&&s._at!=null?Math.min(120,(s._at/s.th)*100):0;
  return(<div style={{position:"fixed",inset:0,zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",
    background:v?"rgba(40,30,20,.25)":"transparent",transition:"background .1s",backdropFilter:v?"blur(3px)":"none"}} onClick={cl}>
    <div onClick={e=>e.stopPropagation()} style={{width:"min(460px,90vw)",transform:v?"none":"translateY(8px)",
      opacity:v?1:0,transition:"all .15s"}}>
      <div style={{height:10,background:"linear-gradient(90deg,#b08858,#d4b088,#c8a070,#b08858)",borderRadius:"6px 6px 0 0"}}/>
      <div style={{background:"linear-gradient(180deg,#faf5ed,#f5ece0,#faf5ed)",padding:"18px 20px 14px",position:"relative"}}>
        <div style={{position:"absolute",top:10,right:14,opacity:.8,transform:"rotate(-8deg)"}}><FI sp={s.sp} sz={36} co={s.c}/></div>
        <div style={{display:"flex",alignItems:"center",gap:4,marginBottom:2}}><span style={{fontSize:12,color:sm.c}}>{sm.i}</span>
          <span style={{fontSize:11,color:sm.c,letterSpacing:3}}>{sm.l}季</span></div>
        <h2 style={{fontSize:20,fontWeight:700,color:C.text,margin:0,letterSpacing:3}}>{s.n}</h2>
        <div style={{fontSize:13,color:C.tl,marginTop:3}}>{s.sp}·{st.st}·{s.rg}</div>
        <div style={{margin:"8px 0",padding:"6px 10px",background:`${s.c}0c`,borderLeft:`3px solid ${s.c}44`,
          borderRadius:"0 5px 5px 0",fontSize:15,fontStyle:"italic",color:C.text,letterSpacing:3,lineHeight:1.5}}>「{s.po}」</div>
        <div style={{fontSize:13,margin:"4px 0"}}><span style={{opacity:.35}}>建议：</span>{s.tp}</div>
        {pred&&<div style={{margin:"8px 0",padding:"10px 12px",background:"rgba(192,96,64,.06)",borderRadius:6,
          border:"1px solid rgba(192,96,64,.1)"}}>
          <div style={{fontSize:13,fontWeight:700,color:C.accent,marginBottom:4}}>🔮 基于3年数据预测</div>
          <div style={{fontSize:14,color:C.text}}>预测盛花期：<strong>{pred.dateStr}</strong>
            {pred.daysUntil>0?<span style={{color:C.accent}}> ({pred.daysUntil}天后)</span>
              :<span style={{color:"#5a8a50"}}> (已到/已过)</span>}</div>
          <div style={{fontSize:11,color:C.tl,marginTop:4}}>
            历史数据：{s.hist?.join(" / ")} · 置信度 <strong>{pred.confidence}%</strong>
            {pred.daysUntil<15&&pred.daysUntil>0?<span style={{color:C.accent,fontWeight:700}}> ← 临近！精度高</span>:""}
          </div>
        </div>}
        <div style={{margin:"6px 0",padding:"6px 8px",background:"rgba(0,0,0,.01)",borderRadius:4}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:11,opacity:.5,marginBottom:2}}>
            <span>{s._at||0}°C·d</span><span>阈值{s.th}</span></div>
          <div style={{height:6,borderRadius:3,background:"rgba(0,0,0,.03)",overflow:"hidden"}}>
            <div style={{height:"100%",borderRadius:3,width:`${Math.min(100,pct)}%`,
              background:pct>=100?`linear-gradient(90deg,${s.c},#e8a040)`:`linear-gradient(90deg,${s.c}88,${s.c})`,transition:"width .4s"}}/></div>
        </div>
        {/* Mafengwo link */}
        {s.mfw&&<a href={`https://www.mafengwo.cn/search/q.php?q=${encodeURIComponent(s.mfw)}`}
          target="_blank" rel="noopener noreferrer"
          style={{display:"flex",alignItems:"center",justifyContent:"center",gap:3,
            margin:"4px 0 0",padding:"5px 8px",background:"rgba(192,96,64,.08)",borderRadius:4,
            color:C.accent,fontSize:13,fontWeight:600,textDecoration:"none",letterSpacing:1,
            border:"1px solid rgba(192,96,64,.12)"}}>
          🐝 查看马蜂窝景点详情 →</a>}
      </div>
      <div style={{height:8,background:"linear-gradient(90deg,#b08858,#d4b088,#c8a070,#b08858)",borderRadius:"0 0 4px 4px"}}/></div></div>);
}

function SpeciesWheel({onSelect,selected,spots}){
  const species=[...new Set(FLORA.map(f=>f.sp))];
  const [si,setSi]=useState(Math.max(0,species.indexOf(selected)));
  const sel=i=>{setSi(i);onSelect(species[i]);};
  useEffect(()=>{const h=e=>{if(e.key==="ArrowLeft"){setSi(i=>{const n=(i-1+species.length)%species.length;onSelect(species[n]);return n;});e.preventDefault();}
    else if(e.key==="ArrowRight"){setSi(i=>{const n=(i+1)%species.length;onSelect(species[n]);return n;});e.preventDefault();}};
    window.addEventListener("keydown",h);return()=>window.removeEventListener("keydown",h);},[species]);
  const count=spots.filter(s=>s.sp===selected&&(s._st?.l||0)>0).length;
  return(<div style={{position:"absolute",bottom:0,right:0,zIndex:28,width:210,height:120}}>
    <svg viewBox="0 0 210 120" style={{width:"100%",height:"100%"}}>
      <path d={`M${105-95},110 A95,95 0 0,1 ${105+95},110`} fill="rgba(250,245,237,.9)" stroke="rgba(180,150,100,.1)" strokeWidth=".5"/>
      {species.map((sp,i)=>{const a=((i-si+species.length)%species.length);const half=Math.floor(species.length/2);
        if(a>half&&a<species.length-half+1)return null;const mapped=a<=half?a:a-species.length;
        const rad=(90-mapped*(140/species.length))*Math.PI/180;
        const x=105+82*Math.cos(rad),y=110-82*Math.sin(rad);const isSel=sp===selected;const fl=FLORA.find(f=>f.sp===sp);
        return <g key={sp} onClick={()=>sel(i)} style={{cursor:"pointer"}}>
          <circle cx={x} cy={y} r={isSel?13:8} fill={isSel?"rgba(250,245,237,.95)":"rgba(250,245,237,.5)"}
            stroke={fl?.c||C.accent} strokeWidth={isSel?1.2:.3}/>
          <foreignObject x={x-(isSel?10:5)} y={y-(isSel?10:5)} width={isSel?20:10} height={isSel?20:10}>
            <FI sp={sp} sz={isSel?20:10} co={fl?.c}/></foreignObject></g>;})}
      <text x="105" y="98" textAnchor="middle" fontSize="9.5" fill={C.text} fontWeight="700">{selected}</text>
      <text x="105" y="108" textAnchor="middle" fontSize="6.5" fill={C.tl}>{count}个观赏地 · ← →</text>
    </svg></div>);
}

// ═══ MAIN ═══
export default function App(){
  const [entered,setEntered]=useState(false);const [geo,setGeo]=useState(null);
  // Auto-show mood card once per day on entry
  const [flora]=useState(()=>FLORA.map(f=>{const pred=predictBloom(f);return{...f,_at:FAT[f.id]||200,_st:calcSt(FAT[f.id]||200,f.th,pred),_pred:pred};}));
  const [page,setPage]=useState("map");const [filter,setFilter]=useState("current");
  const [region,setRegion]=useState("all");const [sel,setSel]=useState(null);
  const [drag,setDrag]=useState(null);const [pan,setPan]=useState({x:0,y:0});
  const [wz,setWz]=useState(1);const [wc,setWc]=useState([104.5,35]);
  const [selSp,setSelSp]=useState("牡丹");const [userLoc,setUserLoc]=useState(null);const [locAsked,setLocAsked]=useState(false);
  const [showMood,setShowMood]=useState(false);
  const [nearbyMonth,setNearbyMonth]=useState(0);
  const mapRef=useRef(null);const touchD=useRef(null);
  const W=1000,H=850;const cs=getSeason();const cr=REGIONS.find(r=>r.id===region)||REGIONS[0];

  const proj=useMemo(()=>d3.geoMercator().center([104.5,35.5]).scale(580).translate([W/2,H/2]),[]);
  const pathGen=useMemo(()=>d3.geoPath().projection(proj),[proj]);

  useEffect(()=>{fetch("https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json")
    .then(r=>r.json()).then(setGeo).catch(()=>{
      fetch("https://geo.datav.aliyun.com/areas_v3/bound/100000.json").then(r=>r.json()).then(setGeo).catch(()=>{});});},[]);

  // Auto-show mood card once per day
  useEffect(()=>{if(!entered)return;(async()=>{
    const d=new Date();const seed=d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate();
    try{const r=await window.storage?.get("moodShown_"+seed);
      if(!r?.value){setTimeout(()=>{setShowMood(true);
        window.storage?.set("moodShown_"+seed,"1");},1200);}}catch{}
  })();},[entered]);

  const requestLoc=()=>{if(locAsked)return;setLocAsked(true);
    navigator.geolocation?.getCurrentPosition(p=>{
      const loc={lat:p.coords.latitude,lon:p.coords.longitude};
      setUserLoc(loc);
      setWz(2.5);setWc([loc.lon,loc.lat]);setRegion("all");
    },()=>{const loc={lat:39.9,lon:116.4};setUserLoc(loc);setWz(2.5);setWc([loc.lon,loc.lat]);setRegion("all");});};

  // Navigate to a spot by id (for alert banner clicks)
  const goToSpot=useCallback((id)=>{
    const f=flora.find(x=>x.id===id);if(!f)return;
    setWz(5);setWc([f.lon,f.lat]);setRegion("all");setPan({x:0,y:0});
    setSel(f);
  },[flora]);

  const displayFlora=useMemo(()=>{const cm=new Date().getMonth()+1;
    return flora.map(f=>{let at=f._at,st=f._st;
      if(filter.startsWith("future")){
        const months=filter==="future1"?1:filter==="future3"?3:6;
        // future1: 0-30 days, future3: 30-90 days, future6: 90-180 days (non-overlapping)
        const minDays=filter==="future1"?0:filter==="future3"?30:90;
        const maxDays=filter==="future1"?30:filter==="future3"?90:180;
        const pred=f._pred;
        const bloomInFuture=pred&&pred.daysUntil>=minDays&&pred.daysUntil<=maxDays;
        if(bloomInFuture){at=FAT[f.id]||f.th;st={st:`预计${pred.dateStr}`,l:3};}
        else st={st:"不在窗口",l:0};
      }else if(filter==="current"&&f.s!==cs)st={st:"非当季",l:0};
      else if(filter!=="current"&&filter!=="all"&&f.s!==filter)st={st:"非本季",l:0};
      return{...f,_at:at,_st:st,_dist:userLoc?distKm(userLoc.lat,userLoc.lon,f.lat,f.lon):null};
    });},[flora,filter,cs,userLoc]);

  const spots=useMemo(()=>{let list=displayFlora;
    if(page==="species"){
      // Show ALL spots of this species, including faded ones (with current year prediction)
      list=flora.filter(f=>f.sp===selSp).map(f=>({...f,_at:FAT[f.id]||200,_st:calcSt(FAT[f.id]||200,f.th,f._pred),_pred:f._pred}));
    }
    if(page==="nearby"&&userLoc){
      list=flora.map(f=>({...f,_at:FAT[f.id]||200,_st:calcSt(FAT[f.id]||200,f.th,f._pred),
        _dist:distKm(userLoc.lat,userLoc.lon,f.lat,f.lon),_pred:f._pred}))
        .filter(f=>(f._dist||9999)<500);
      if(nearbyMonth>0)list=list.filter(f=>f.pk[0]<=nearbyMonth&&f.pk[1]>=nearbyMonth);
      list=[...list].sort((a,b)=>(a._dist||9999)-(b._dist||9999));}
    return list;},[displayFlora,page,selSp,userLoc,nearbyMonth,flora]);

  const ez=region==="all"?wz:cr.z;const ecx=region==="all"?wc:[cr.cx,cr.cy];const pc=proj(ecx);
  useEffect(()=>{setPan({x:0,y:0});},[region]);
  useEffect(()=>{if(region!=="all"){setWz(1);setWc([104.5,35]);}},[region]);
  useEffect(()=>{const el=mapRef.current;if(!el)return;
    const h=e=>{e.preventDefault();const isPinch=e.ctrlKey||Math.abs(e.deltaY)<50;
      const f=isPinch?e.deltaY*-.015:e.deltaY<0?.17:-.15;
      const rect=el.getBoundingClientRect();const gx=proj.invert?.([(e.clientX-rect.left)/rect.width*W,(e.clientY-rect.top)/rect.height*H]);
      setWz(p=>{const n=Math.max(1,Math.min(8,p*(1+f)));
        if(n>1.05&&gx){const t=Math.min(.15,.05*(n-1));setWc(c=>[c[0]+(gx[0]-c[0])*t,c[1]+(gx[1]-c[1])*t]);}
        else setWc([104.5,35]);return n;});};
    el.addEventListener("wheel",h,{passive:false});
    // Safari gesture events for trackpad pinch
    const gs=e=>{e.preventDefault();};
    const gc=e=>{e.preventDefault();setWz(p=>Math.max(1,Math.min(8,p*e.scale)));};
    el.addEventListener("gesturestart",gs,{passive:false});
    el.addEventListener("gesturechange",gc,{passive:false});
    return()=>{el.removeEventListener("wheel",h);el.removeEventListener("gesturestart",gs);el.removeEventListener("gesturechange",gc);};},[proj]);
  useEffect(()=>{const el=mapRef.current;if(!el)return;
    const ts=e=>{if(e.touches.length===2){e.preventDefault();const dx=e.touches[0].clientX-e.touches[1].clientX;const dy=e.touches[0].clientY-e.touches[1].clientY;touchD.current=Math.sqrt(dx*dx+dy*dy);}};
    const tm=e=>{if(e.touches.length===2&&touchD.current){e.preventDefault();const dx=e.touches[0].clientX-e.touches[1].clientX;const dy=e.touches[0].clientY-e.touches[1].clientY;
      const d=Math.sqrt(dx*dx+dy*dy);setWz(p=>Math.max(1,Math.min(8,p*(d/touchD.current))));touchD.current=d;}};
    el.addEventListener("touchstart",ts,{passive:false});el.addEventListener("touchmove",tm,{passive:false});
    const te=()=>{touchD.current=null;};el.addEventListener("touchend",te);
    return()=>{el.removeEventListener("touchstart",ts);el.removeEventListener("touchmove",tm);el.removeEventListener("touchend",te);};},[]);
  useEffect(()=>{if(page==="species")return;const h=e=>{const s=30;
    if(e.key==="ArrowLeft")setPan(p=>({...p,x:p.x+s}));else if(e.key==="ArrowRight")setPan(p=>({...p,x:p.x-s}));
    else if(e.key==="ArrowUp")setPan(p=>({...p,y:p.y+s}));else if(e.key==="ArrowDown")setPan(p=>({...p,y:p.y-s}));
    else if(e.key==="+"||e.key==="=")setWz(z=>Math.min(8,z*1.2));else if(e.key==="-")setWz(z=>Math.max(1,z*.83));else return;e.preventDefault();};
    window.addEventListener("keydown",h);return()=>window.removeEventListener("keydown",h);},[page]);

  const onPD=useCallback(e=>{if(ez<=1.05&&region==="all")return;setDrag({x:e.clientX-pan.x,y:e.clientY-pan.y});},[ez,pan,region]);
  const onPM=useCallback(e=>{if(!drag)return;setPan({x:e.clientX-drag.x,y:e.clientY-drag.y});},[drag]);
  const onPU=useCallback(()=>setDrag(null),[]);
  const tx=(W/2-pc[0])*ez+pan.x;const ty=(H/2-pc[1])*ez+pan.y;
  const rP=useMemo(()=>RIVERS.map(r=>({...r,d:d3.line().x(d=>proj(d)?.[0]).y(d=>proj(d)?.[1]).curve(d3.curveBasis)(r.co.map(c=>[c[0],c[1]]))})),[proj]);
  const mP=useMemo(()=>MTNS.map(m=>({...m,dd:d3.line().x(d=>proj(d)?.[0]).y(d=>proj(d)?.[1]).curve(d3.curveBasis)(m.co.map(c=>[c[0],c[1]]))})),[proj]);
  const sP=useMemo(()=>{const m=new Map();FLORA.forEach(f=>{const p=proj([f.lon,f.lat]);if(p)m.set(f.id,{x:(p[0]/W*100)+"%",y:(p[1]/H*100)+"%"});});return m;},[proj]);

  if(!entered)return <ScrollLanding onEnter={()=>setEntered(true)}/>;

  return(<div style={{width:"100%",height:"100vh",minHeight:600,position:"relative",overflow:"hidden",background:`linear-gradient(155deg,${C.bg},${C.bg2})`}} tabIndex={0}>
    <style>{`@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700;900&display=swap');
      @keyframes pulse{0%,100%{transform:translate(-50%,-50%) scale(1);opacity:.35}50%{transform:translate(-50%,-50%) scale(1.5);opacity:0}}
      @keyframes shake{0%,100%{transform:translateX(0) rotate(0)}25%{transform:translateX(-4px) rotate(-4deg)}75%{transform:translateX(4px) rotate(4deg)}}
      *{box-sizing:border-box;margin:0;padding:0;font-family:'Noto Serif SC',serif}::-webkit-scrollbar{width:2px}::-webkit-scrollbar-thumb{background:rgba(0,0,0,.04)}`}</style>

    {ez>1.5&&<><div style={{position:"absolute",left:0,top:0,bottom:0,width:8,zIndex:15,background:"linear-gradient(90deg,#b08858,#d4b088,#c8a070)"}}/>
      <div style={{position:"absolute",right:0,top:0,bottom:0,width:8,zIndex:15,background:"linear-gradient(90deg,#c8a070,#d4b088,#b08858)"}}/></>}

    <div ref={mapRef} onPointerDown={onPD} onPointerMove={onPM} onPointerUp={onPU} onPointerLeave={onPU}
      style={{position:"absolute",inset:0,cursor:ez>1.05||region!=="all"?(drag?"grabbing":"grab"):"default",touchAction:"none"}}>
      <div style={{position:"absolute",left:"50%",top:"50%",width:W,height:H,marginLeft:-W/2,marginTop:-H/2,
        transform:`scale(${ez}) translate(${tx/ez}px,${ty/ez}px)`,
        transition:drag?"none":"transform .4s cubic-bezier(.22,1,.36,1)",transformOrigin:"center center"}}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:"100%",position:"absolute"}}>
          {geo&&(geo.features||[geo]).map((f,i)=><path key={i} d={pathGen(f)||""} fill="#eee8dc" fillOpacity=".14"
            stroke={C.border} strokeWidth={f.properties?.name?.length>0?.2:.4} strokeLinejoin="round"
            opacity={f.properties?.name?.length>0?.18:.36}/>)}
          {rP.map((r,i)=>r.d&&<g key={`r${i}`}><path d={r.d} fill="none" stroke={C.river} strokeWidth={r.w*1.2} strokeLinecap="round" opacity=".2"/>
            <path id={`rv${i}`} d={r.d} fill="none"/><text fontSize="8" fill={C.river} opacity=".25" fontWeight="600">
              <textPath href={`#rv${i}`} startOffset="35%">{r.n}</textPath></text></g>)}
          {mP.map((m,i)=>m.dd&&<g key={`m${i}`}><path d={m.dd} fill="none" stroke={C.mtn} strokeWidth=".7" opacity=".1"
            strokeDasharray={m.d} strokeLinecap="round"/><path id={`mt${i}`} d={m.dd} fill="none"/>
            <text fontSize="7" fill={C.mtn} opacity=".16" fontWeight="600"><textPath href={`#mt${i}`} startOffset="25%">{m.n}</textPath></text></g>)}
          {page==="nearby"&&userLoc&&(()=>{const p=proj([userLoc.lon,userLoc.lat]);
            return p?<g><circle cx={p[0]} cy={p[1]} r="8" fill="#4a90d9" opacity=".2"/>
              <circle cx={p[0]} cy={p[1]} r="4" fill="#4a90d9" stroke="#fff" strokeWidth="1.5"/>
              <text x={p[0]+8} y={p[1]+3} fontSize="7" fill="#4a90d9" fontWeight="600">你的位置</text></g>:null;})()}
        </svg>
        {spots.map(s=>{const pos=sP.get(s.id);if(!pos)return null;
          return <Mk key={s.id} s={s} px={pos.x} py={pos.y} zoom={ez} onClick={()=>setSel(s)} hl={page==="species"}/>;
        })}
      </div>
    </div>

    <AlertBanner onGo={goToSpot} flora={flora}/>
    <MusicPlayer/>
    <ZoomControls wz={wz} setWz={setWz}/>

    {/* Title */}
    <div style={{position:"absolute",top:22,left:ez>1.5?12:3,zIndex:30}}>
      <div style={{display:"flex",alignItems:"center",gap:3}}>
        <div style={{width:32,height:32,borderRadius:"50%",background:`linear-gradient(135deg,${C.accent},${C.accent2})`,
          display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:7}}>風</div>
        <h1 style={{fontSize:16,fontWeight:900,color:C.text,letterSpacing:4}}>花信风</h1></div></div>

    {/* Page tabs */}
    <div style={{position:"absolute",top:22,right:3,zIndex:30,display:"flex",gap:1,background:"rgba(250,245,237,.85)",borderRadius:7,padding:"1.5px"}}>
      {[{k:"map",l:"时令",ic:"🗺"},{k:"species",l:"花谱",ic:"🌺"},{k:"nearby",l:"附近",ic:"📍"}].map(p=>(
        <button key={p.k} onClick={()=>{setPage(p.k);if(p.k==="nearby")requestLoc();}}
          style={{border:"none",borderRadius:5,padding:"4px 10px",cursor:"pointer",fontSize:12,display:"flex",alignItems:"center",gap:1,
            background:page===p.k?`${C.accent}18`:"transparent",color:page===p.k?C.accent:C.tl,fontWeight:page===p.k?700:400}}>
          <span style={{fontSize:12}}>{p.ic}</span>{p.l}</button>))}
    </div>

    {/* Filter (map page) */}
    {page==="map"&&<div style={{position:"absolute",bottom:5,left:"50%",transform:"translateX(-50%)",zIndex:30,
      display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
      {(filter!=="current"&&!filter.startsWith("future"))&&<div style={{display:"flex",background:"rgba(250,245,237,.82)",borderRadius:7,padding:"1px",gap:1}}>
        {[{k:"all",l:"全部"},{k:"spring",l:"春"},{k:"summer",l:"夏"},{k:"autumn",l:"秋"},{k:"winter",l:"冬"}].map(m=>(
          <button key={m.k} onClick={()=>setFilter(m.k)} style={{border:"none",borderRadius:7,padding:"3px 8px",cursor:"pointer",fontSize:11,
            background:filter===m.k?`${(SM[m.k]||{c:C.accent}).c}18`:"transparent",
            color:filter===m.k?(SM[m.k]||{c:C.accent}).c:"#aaa",fontWeight:filter===m.k?700:400}}>
            {(SM[m.k]||{i:"🌺"}).i}{m.l}</button>))}</div>}
      {filter.startsWith("future")&&<div style={{display:"flex",background:"rgba(250,245,237,.82)",borderRadius:7,padding:"1px",gap:1}}>
        {[{k:"future1",l:"1个月"},{k:"future3",l:"3个月"},{k:"future6",l:"半年"}].map(m=>(
          <button key={m.k} onClick={()=>setFilter(m.k)} style={{border:"none",borderRadius:7,padding:"3px 10px",cursor:"pointer",fontSize:11,
            background:filter===m.k?`${C.accent}18`:"transparent",color:filter===m.k?C.accent:"#aaa",fontWeight:filter===m.k?700:400}}>{m.l}</button>))}</div>}
      <div style={{display:"flex",background:"rgba(250,245,237,.88)",backdropFilter:"blur(6px)",borderRadius:10,padding:"1px",gap:1}}>
        <button onClick={()=>setFilter("current")} style={{border:"none",borderRadius:10,padding:"5px 14px",cursor:"pointer",fontSize:13,
          background:filter==="current"?`${SM[cs].c}18`:"transparent",color:filter==="current"?SM[cs].c:"#999",fontWeight:filter==="current"?700:400}}>
          {SM[cs].i}当季</button>
        <button onClick={()=>setFilter(filter==="current"||filter.startsWith("future")?"all":filter)} style={{border:"none",borderRadius:10,padding:"5px 14px",cursor:"pointer",fontSize:13,
          background:!filter.startsWith("future")&&filter!=="current"?`${C.accent}18`:"transparent",
          color:!filter.startsWith("future")&&filter!=="current"?C.accent:"#999"}}>🗺全年</button>
        <button onClick={()=>setFilter(filter.startsWith("future")?filter:"future1")} style={{border:"none",borderRadius:10,padding:"5px 14px",cursor:"pointer",fontSize:13,
          background:filter.startsWith("future")?"#5a8a5022":"transparent",color:filter.startsWith("future")?"#3a6a30":"#999"}}>🔮未来</button>
      </div></div>}

    {page==="species"&&<div style={{position:"absolute",bottom:5,left:"50%",transform:"translateX(-50%)",zIndex:30,
      display:"flex",background:"rgba(250,245,237,.85)",borderRadius:8,padding:"1px",gap:1}}>
      {[1,2,3,4,5,6,7,8,9,10,11,12].map(m=>{const has=FLORA.filter(f=>f.sp===selSp&&f.pk[0]<=m&&f.pk[1]>=m).length>0;
        return <button key={m} style={{border:"none",borderRadius:7,padding:"3px 7px",fontSize:11,cursor:has?"pointer":"default",
          background:has?`${C.accent}18`:"transparent",color:has?C.accent:"#ddd",fontWeight:has?700:400}}>{m}月</button>;})}</div>}

    {page==="nearby"&&<div style={{position:"absolute",bottom:5,left:"50%",transform:"translateX(-50%)",zIndex:30,
      display:"flex",background:"rgba(250,245,237,.85)",borderRadius:8,padding:"1px",gap:1,flexWrap:"wrap",justifyContent:"center",maxWidth:"min(340px,78vw)"}}>
      <button onClick={()=>setNearbyMonth(0)} style={{border:"none",borderRadius:7,padding:"3px 8px",cursor:"pointer",fontSize:11,
        background:nearbyMonth===0?`${C.accent}18`:"transparent",color:nearbyMonth===0?C.accent:"#999"}}>全年</button>
      {[1,2,3,4,5,6,7,8,9,10,11,12].map(m=>(
        <button key={m} onClick={()=>setNearbyMonth(m)} style={{border:"none",borderRadius:6,padding:"2px 4px",cursor:"pointer",fontSize:7.5,
          background:nearbyMonth===m?`${C.accent}18`:"transparent",color:nearbyMonth===m?C.accent:"#999"}}>{m}月</button>))}</div>}

    {/* Region nav - hidden in nearby mode */}
    {page==="map"&&<div style={{position:"absolute",left:ez>1.5?10:2,bottom:5,zIndex:30,display:"flex",flexDirection:"column",gap:1,
      background:"rgba(250,245,237,.82)",borderRadius:4,padding:"3px 2px"}}>
      {REGIONS.map(r=>(
        <button key={r.id} onClick={()=>{setRegion(r.id);if(r.id==="all"){setWz(1);setWc([104.5,35]);}}}
          style={{border:"none",borderRadius:3,padding:"4px 8px",cursor:"pointer",fontSize:13,fontWeight:region===r.id?800:500,
            background:region===r.id?`${C.accent}18`:"transparent",color:region===r.id?C.accent:C.tl,letterSpacing:2}}>{r.n}</button>))}
    </div>}

    {page==="species"&&<SpeciesWheel selected={selSp} onSelect={setSelSp} spots={displayFlora}/>}

    {page==="nearby"&&!userLoc&&<div style={{position:"absolute",inset:0,zIndex:40,display:"flex",alignItems:"center",justifyContent:"center",
      background:"rgba(0,0,0,.12)",backdropFilter:"blur(3px)"}}>
      <div style={{background:"#faf5ed",borderRadius:10,padding:"18px 22px",textAlign:"center",boxShadow:"0 4px 16px rgba(0,0,0,.08)",maxWidth:260}}>
        <div style={{fontSize:24,marginBottom:6}}>📍</div>
        <div style={{fontSize:12,fontWeight:700,color:C.text,marginBottom:3}}>获取你的位置</div>
        <div style={{fontSize:9,color:C.tl,marginBottom:10,lineHeight:1.4}}>推荐附近花事需要你的位置信息<br/>数据仅在本地使用</div>
        <button onClick={requestLoc} style={{border:"none",background:C.accent,color:"#fff",borderRadius:7,padding:"7px 18px",cursor:"pointer",fontSize:10,fontWeight:700}}>允许获取</button>
      </div></div>}

    {/* Nearby: scrollable list panel on left */}
    {page==="nearby"&&userLoc&&<div style={{position:"absolute",left:3,top:42,bottom:40,zIndex:25,
      background:"rgba(250,245,237,.9)",backdropFilter:"blur(8px)",borderRadius:6,
      padding:"6px",boxShadow:"0 1px 6px rgba(0,0,0,.04)",width:200,overflowY:"auto"}}>
      <div style={{fontSize:12,color:C.tl,marginBottom:5,letterSpacing:2,fontWeight:700}}>📍 附近花事</div>
      <div style={{fontSize:7,color:C.tl,marginBottom:4}}>共{spots.length}个 · 500km内</div>
      {spots.filter(s=>(s._st?.l||0)>=1).slice(0,20).map((s,i)=>{
        const sm=SM[s.s];
        return(<div key={s.id} onClick={()=>{setSel(s);setWz(5);setWc([s.lon,s.lat]);}}
          style={{display:"flex",alignItems:"center",gap:3,padding:"4px 3px",cursor:"pointer",
            borderBottom:"1px solid rgba(0,0,0,.03)",borderRadius:3,
            background:sel?.id===s.id?`${s.c}15`:"transparent"}}>
          <div style={{width:18,height:18,flexShrink:0,borderRadius:"50%",
            background:"rgba(255,255,255,.8)",border:`1px solid ${s.c}44`,
            display:"flex",alignItems:"center",justifyContent:"center"}}>
            <FI sp={s.sp} sz={13} co={s.c}/></div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:12,color:C.text,fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
              {s.n.split("·")[1]||s.n}</div>
            <div style={{fontSize:6.5,color:C.tl,display:"flex",gap:3}}>
              <span>{Math.round(s._dist||0)}km</span>
              <span style={{color:sm.c}}>{sm.i}{s.pk[0]}月</span>
              <span style={{color:s.c}}>{s._st?.st}</span>
            </div>
          </div>
        </div>);
      })}
    </div>}

    {page==="map"&&(()=>{const li=spots.filter(s=>(s._st?.l||0)>=2).sort((a,b)=>(b._st?.l||0)-(a._st?.l||0)).slice(0,8);
      if(!li.length)return null;
      return(<div style={{position:"absolute",right:3,top:44,zIndex:25,background:"rgba(250,245,237,.82)",
        borderRadius:4,padding:"4px 5px",maxHeight:"min(230px,36vh)",overflowY:"auto",width:180}}>
        <div style={{fontSize:10,color:C.tl,marginBottom:4,letterSpacing:2}}>花事排行</div>
        {li.map((s,i)=>(
          <div key={s.id} onClick={()=>setSel(s)} style={{display:"flex",alignItems:"center",gap:2,padding:"1.5px 0",cursor:"pointer"}}>
            <span style={{fontSize:6,fontWeight:700,color:i<3?C.accent:C.tl,width:8}}>{i+1}</span>
            <div style={{width:10,height:10,flexShrink:0}}><FI sp={s.sp} sz={10} co={s.c}/></div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:11,color:C.text,fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{s.n.split("·")[1]||s.n}</div>
              <div style={{fontSize:5,color:s.c}}>{s._st?.st}{s._pred?` · 预测${s._pred.dateStr}`:""}</div></div>
          </div>))}
      </div>);})()}

    {sel&&<Card s={sel} onClose={()=>setSel(null)}/>}
    {showMood&&<MoodCard onClose={()=>setShowMood(false)}/>}
    {/* Mood card trigger button (always visible top right area) */}
    <button onClick={()=>setShowMood(true)} style={{position:"absolute",top:12,right:180,zIndex:31,
      border:"none",borderRadius:16,padding:"5px 12px",cursor:"pointer",
      background:"rgba(250,245,237,.9)",boxShadow:"0 1px 6px rgba(0,0,0,.05)",
      fontSize:11,color:C.accent,display:"flex",alignItems:"center",gap:3,fontWeight:600,letterSpacing:1}}>
      🪷 <span>花签</span></button>
  </div>);
}
