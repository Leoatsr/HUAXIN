import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import * as d3 from "d3";

// ═══ Error Boundary - prevents white screen on component crashes ═══
class ErrorBoundary extends React.Component {
  constructor(props){super(props);this.state={hasError:false,error:null};}
  static getDerivedStateFromError(error){return{hasError:true,error:error};}
  componentDidCatch(error,info){
    console.error("[花信风] ErrorBoundary caught:",error,info);
  }
  reset=()=>{this.setState({hasError:false,error:null});};
  render(){
    if(this.state.hasError){
      var fallback=this.props.fallback;
      if(fallback)return fallback(this.state.error,this.reset);
      return(<div style={{position:"fixed",inset:0,zIndex:9999,background:"#faf6ef",
        display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
        <div style={{maxWidth:400,textAlign:"center",padding:"32px 24px",
          background:"#fff",borderRadius:14,boxShadow:"0 8px 32px rgba(0,0,0,.1)",
          border:"1px solid #ece6dc"}}>
          <div style={{fontSize:48,marginBottom:16}}>🌸</div>
          <h2 style={{fontSize:20,fontWeight:900,color:"#2a2018",letterSpacing:4,marginBottom:12}}>
            花事暂时遇到了问题</h2>
          <div style={{fontSize:13,color:"#8a7a60",lineHeight:1.7,marginBottom:20,
            padding:"10px 14px",background:"#faf6ef",borderRadius:6,wordBreak:"break-word"}}>
            {this.state.error&&this.state.error.message?this.state.error.message:"未知错误"}</div>
          <div style={{display:"flex",gap:10,justifyContent:"center"}}>
            <button onClick={this.reset} style={{padding:"10px 24px",
              background:"#c06040",color:"#fff",border:"none",borderRadius:8,
              cursor:"pointer",fontSize:13,fontWeight:700,letterSpacing:2}}>重试</button>
            <button onClick={function(){window.location.reload();}} style={{padding:"10px 24px",
              background:"transparent",color:"#8a7a68",border:"1px solid #e0dcd4",
              borderRadius:8,cursor:"pointer",fontSize:13,fontWeight:600}}>刷新页面</button>
          </div>
        </div>
      </div>);
    }
    return this.props.children;
  }
}

var HAS_WIKI={"梅花":1,"桃花":1,"樱花":1,"牡丹":1,"荷花":1,"菊花":1,"杜鹃花":1,"油菜花":1,"梨花":1,"兰花":1,"桂花":1,"薰衣草":1,"向日葵":1,"郁金香":1,"红枫":1,"银杏":1,"三角梅":1,"荼蘼":1,"迎春花":1,
"格桑花":1,"野花草甸":1,"杏花":1,"丁香花":1,"彩林":1,"紫荆花":1,"紫薇花":1,"月季":1,"高山杜鹃":1,"芦花":1,"胡杨":1,"椰树":1,"芍药":1,"木棉花":1,"蓝花楹":1,"白桦林":1,"紫藤":1,"玫瑰":1,"竹林":1,"茉莉花":1,"海棠花":1,"蔷薇":1,"绣球花":1,"黄栌":1,"芙蓉花":1,"山茶花":1,"玉兰花":1,"鸡蛋花":1,"牵牛花":1,"水仙花":1,"木兰":1,
"云锦杜鹃":1,"冬樱花":1,"凌霄花":1,"凤凰花":1,"合欢花":1,"木槿花":1,"朱槿":1,"栀子花":1,"沙漠花":1,"波斯菊":1,"百合":1,"睡莲":1,"石榴花":1,"紫云英":1,"紫菜花":1,"苹果梨花":1,"茶花":1,"虞美人":1,"蜡梅":1,"蝴蝶兰":1,"辛夷花":1,"野杏花":1,"金针花":1,"雾凇":1};
const C={bg:"#f4ece0",bg2:"#ebe0d0",accent:"#c06040",accent2:"#a87050",text:"#3a2818",tl:"#8a7a68",border:"#4a8a98",river:"#4a88a0",mtn:"#8a7a5a"};

// ═══ i18n 多语言 ═══
const I18N={
zh:{
  title:"花信风",subtitle:"跟着天地节律 · 追一场中国色",
  tab_map:"时令",tab_species:"花谱",tab_nearby:"附近",
  current:"当季",yearly:"全年",future:"未来",month1:"1个月",month3:"3个月",halfyr:"半年",
  blooming:"盛花期",early:"初花期",budding:"含苞待放",faded:"已谢",ending:"末花期",growing:"积温中",
  pred_title:"基于3年数据预测",pred_bloom:"预测盛花期",pred_hist:"历史数据",pred_conf:"置信度",
  near_high:"临近！精度高",arrived:"已到/已过",days_later:"天后",
  fav:"收藏",faved:"已收藏",checkin:"打卡",checked:"已打卡",trip_add:"加入行程",trip_added:"已加入行程",
  share:"分享",mfw:"查看马蜂窝景点详情",notes:"花友笔记",notes_empty:"还没有笔记",note_ph:"写一条笔记...",send:"发送",
  trip:"行程规划",trip_stops:"站",trip_total:"全程约",trip_share:"分享行程",trip_clear:"清空",trip_empty:"还没有添加景点",
  mood:"花签",mood_title:"每日花签",mood_draw:"求签",mood_drawing:"签筒摇动中...",mood_got:"今日得签",mood_share:"分享花签",
  search_ph:"搜索景点或花种...",scroll_hint:"拖动卷轴，展开花事",enter:"直接进入",
  rank:"花事排行",nearby_title:"附近花事",
  guide:"入境指南",guide_title:"China Flower Travel Guide",
  at:"积温",threshold:"阈值",real:"实时",sim:"模拟",suggest:"建议",
  overview:"全览",region_ne:"东北",region_n:"华北",region_nw:"西北",region_e:"华东",region_c:"华中",region_sw:"西南",region_s:"华南",region_t:"青藏",
},
en:{
  title:"Flower Wind",subtitle:"Follow nature's rhythm · Chase China's colors",
  tab_map:"Seasonal",tab_species:"Species",tab_nearby:"Nearby",
  current:"Now",yearly:"All Year",future:"Upcoming",month1:"1 Month",month3:"3 Months",halfyr:"6 Months",
  blooming:"In Bloom",early:"Early Bloom",budding:"Budding",faded:"Faded",ending:"Late Bloom",growing:"Growing",
  pred_title:"3-Year Data Prediction",pred_bloom:"Predicted Peak",pred_hist:"Historical",pred_conf:"Confidence",
  near_high:"Imminent!",arrived:"Arrived",days_later:"days",
  fav:"Save",faved:"Saved",checkin:"Check in",checked:"Checked",trip_add:"Add to Trip",trip_added:"In Trip",
  share:"Share",mfw:"View on Mafengwo",notes:"Notes",notes_empty:"No notes yet",note_ph:"Write a note...",send:"Send",
  trip:"Trip Plan",trip_stops:"stops",trip_total:"Total ~",trip_share:"Share Trip",trip_clear:"Clear",trip_empty:"No stops added",
  mood:"Fortune",mood_title:"Daily Flower Fortune",mood_draw:"Draw",mood_drawing:"Drawing...",mood_got:"Today's Fortune",mood_share:"Share",
  search_ph:"Search spots or flowers...",scroll_hint:"Drag scroll to explore",enter:"Enter directly",
  rank:"Top Flowers",nearby_title:"Nearby Flowers",
  guide:"Travel Guide",guide_title:"China Flower Travel Guide",
  at:"Accum.Temp",threshold:"Threshold",real:"Live",sim:"Est.",suggest:"Tip",
  overview:"All",region_ne:"NE",region_n:"N",region_nw:"NW",region_e:"E",region_c:"Central",region_sw:"SW",region_s:"S",region_t:"Tibet",
},
ja:{
  title:"花信風",subtitle:"天地のリズムに従い · 中国の色を追う",
  tab_map:"時令",tab_species:"花譜",tab_nearby:"付近",
  current:"今季",yearly:"年間",future:"今後",month1:"1ヶ月",month3:"3ヶ月",halfyr:"半年",
  blooming:"見頃",early:"咲き始め",budding:"蕾",faded:"散り",ending:"終わり頃",growing:"成長中",
  pred_title:"3年データ予測",pred_bloom:"開花予測",pred_hist:"過去データ",pred_conf:"信頼度",
  near_high:"間近！",arrived:"到来",days_later:"日後",
  fav:"保存",faved:"保存済",checkin:"訪問記録",checked:"記録済",trip_add:"旅程に追加",trip_added:"追加済",
  share:"共有",mfw:"馬蜂窩で見る",notes:"ノート",notes_empty:"ノートなし",note_ph:"ノートを書く...",send:"送信",
  trip:"旅程計画",trip_stops:"箇所",trip_total:"総距離",trip_share:"旅程共有",trip_clear:"クリア",trip_empty:"スポット未追加",
  mood:"花みくじ",mood_title:"毎日の花みくじ",mood_draw:"引く",mood_drawing:"準備中...",mood_got:"本日の運勢",mood_share:"共有",
  search_ph:"スポットや花を検索...",scroll_hint:"巻物をドラッグして開く",enter:"直接入る",
  rank:"花ランキング",nearby_title:"付近の花",
  guide:"旅行ガイド",guide_title:"中国花旅ガイド",
  at:"積算温度",threshold:"閾値",real:"実測",sim:"推定",suggest:"おすすめ",
  overview:"全体",region_ne:"東北",region_n:"華北",region_nw:"西北",region_e:"華東",region_c:"華中",region_sw:"西南",region_s:"華南",region_t:"チベット",
},
ko:{
  title:"화신풍",subtitle:"자연의 리듬을 따라 · 중국의 색을 찾다",
  tab_map:"시령",tab_species:"화보",tab_nearby:"주변",
  current:"이번 시즌",yearly:"연간",future:"앞으로",month1:"1개월",month3:"3개월",halfyr:"6개월",
  blooming:"만개",early:"개화 초기",budding:"봉오리",faded:"낙화",ending:"말기",growing:"성장 중",
  pred_title:"3년 데이터 예측",pred_bloom:"만개 예측일",pred_hist:"과거 데이터",pred_conf:"신뢰도",
  near_high:"임박!",arrived:"도래",days_later:"일 후",
  fav:"저장",faved:"저장됨",checkin:"체크인",checked:"완료",trip_add:"여행에 추가",trip_added:"추가됨",
  share:"공유",mfw:"마펑워에서 보기",notes:"노트",notes_empty:"노트 없음",note_ph:"노트 작성...",send:"보내기",
  trip:"여행 계획",trip_stops:"곳",trip_total:"총 거리",trip_share:"여행 공유",trip_clear:"초기화",trip_empty:"스팟 미추가",
  mood:"꽃점",mood_title:"오늘의 꽃점",mood_draw:"뽑기",mood_drawing:"준비 중...",mood_got:"오늘의 운세",mood_share:"공유",
  search_ph:"스팟이나 꽃 검색...",scroll_hint:"스크롤을 드래그하세요",enter:"바로 입장",
  rank:"꽃 랭킹",nearby_title:"주변 꽃",
  guide:"여행 가이드",guide_title:"중국 꽃 여행 가이드",
  at:"적산온도",threshold:"임계값",real:"실시간",sim:"추정",suggest:"팁",
  overview:"전체",region_ne:"동북",region_n:"화북",region_nw:"서북",region_e:"화동",region_c:"화중",region_sw:"서남",region_s:"화남",region_t:"티벳",
},
};

// ═══ Inbound Travel Guide ═══
function TravelGuide({onClose,lang}){
  const t=I18N[lang]||I18N.zh;const isZh=lang==="zh";
  return(<div style={{position:"fixed",inset:0,zIndex:120,display:"flex",justifyContent:"center",alignItems:"center",
    background:"rgba(0,0,0,.3)",backdropFilter:"blur(4px)"}} onClick={onClose}>
    <div onClick={e=>e.stopPropagation()} style={{width:"min(520px,92vw)",maxHeight:"85vh",overflowY:"auto",
      background:"#faf6ef",borderRadius:12,padding:"24px 28px",boxShadow:"0 8px 32px rgba(0,0,0,.15)",position:"relative"}}>
      <button onClick={onClose} style={{position:"absolute",top:12,right:14,border:"none",background:"none",
        cursor:"pointer",fontSize:18,color:"#8a7a68"}}>{"×"}</button>
      <h2 style={{fontSize:22,fontWeight:800,letterSpacing:3,margin:"0 0 16px",color:"#3a2818"}}>
        🌏 {isZh?"入境赏花指南":"China Flower Travel Guide"}</h2>
      
      {[
        {icon:"✈️",title:isZh?"签证与入境":"Visa & Entry",
          body:isZh?"中国对多国实施144小时/72小时过境免签。2024年起，法国、德国、意大利、荷兰、西班牙、马来西亚、泰国等国免签入境。请查阅最新政策。"
          :"China offers 144h/72h visa-free transit for many countries. Since 2024, citizens of France, Germany, Italy, Netherlands, Spain, Malaysia, Thailand and more can enter visa-free. Check latest policies."},
        {icon:"💳",title:isZh?"支付方式":"Payment",
          body:isZh?"景区门票可用支付宝/微信支付（绑定境外Visa/Mastercard即可）。也可用现金人民币。部分景区支持信用卡。建议提前下载支付宝App。"
          :"Use Alipay/WeChat Pay (link your Visa/Mastercard). Cash RMB also accepted. Some spots take credit cards. Download Alipay app beforehand."},
        {icon:"🚄",title:isZh?"交通指南":"Transportation",
          body:isZh?"高铁覆盖全国主要城市（12306.cn购票，支持外国护照）。花季热门线路：上海→杭州(45min)→婺源(2h)→黄山(1h)。建议使用高德地图导航。"
          :"High-speed rail connects major cities (book on 12306.cn with passport). Popular flower routes: Shanghai→Hangzhou(45min)→Wuyuan(2h)→Huangshan(1h). Use Amap/Gaode for navigation."},
        {icon:"📱",title:isZh?"必备APP":"Essential Apps",
          body:isZh?"支付宝（支付+翻译）、高德地图（导航）、12306（火车票）、携程（酒店+门票）、翻译官（离线翻译）。中国可正常使用这些APP。"
          :"Alipay (payment+translate), Amap (navigation), 12306 (train tickets), Trip.com (hotels), Google Translate (offline pack). These apps work normally in China."},
        {icon:"🌸",title:isZh?"最佳赏花路线":"Best Flower Routes",
          body:isZh?"春：洛阳牡丹→西安樱花→林芝桃花(3-4月)\n夏：伊犁薰衣草→青海湖油菜花(6-7月)\n秋：北京香山红叶→九寨沟彩林(10月)\n冬：南京梅花→昆明冬樱花(12-2月)"
          :"Spring: Luoyang Peony→Xi'an Cherry Blossom→Linzhi Peach(Mar-Apr)\nSummer: Yili Lavender→Qinghai Lake Rapeseed(Jun-Jul)\nAutumn: Beijing Red Leaves→Jiuzhaigou(Oct)\nWinter: Nanjing Plum→Kunming Winter Cherry(Dec-Feb)"},
        {icon:"🆘",title:isZh?"紧急联系":"Emergency",
          body:isZh?"报警：110 · 急救：120 · 火警：119\n旅游投诉：12345\n外交部全球领保：+86-10-12308"
          :"Police: 110 · Ambulance: 120 · Fire: 119\nTourism hotline: 12345\nConsular protection: +86-10-12308"},
        {icon:"🗣",title:isZh?"实用花卉中文":"Useful Chinese",
          body:"Cherry Blossom = 樱花 (yīng huā)\nPeach = 桃花 (táo huā)\nPeony = 牡丹 (mǔ dān)\nPlum = 梅花 (méi huā)\nLotus = 荷花 (hé huā)\nMaple = 红枫 (hóng fēng)\nGinkgo = 银杏 (yín xìng)\nLavender = 薰衣草 (xūn yī cǎo)\nRapeseed = 油菜花 (yóu cài huā)\nWhere is...? = ...在哪里？(zài nǎ lǐ?)"},
      ].map((s,i)=>(
        <div key={i} style={{marginBottom:14,padding:"12px 14px",background:"#f5f0e8",borderRadius:8}}>
          <div style={{fontSize:15,fontWeight:700,color:"#3a2818",marginBottom:6}}>{s.icon} {s.title}</div>
          <div style={{fontSize:13,color:"#5a4a38",lineHeight:1.7,whiteSpace:"pre-line"}}>{s.body}</div>
        </div>))}
    </div></div>);
}
const SM={spring:{l:"春",i:"🌸",c:"#d4756b"},summer:{l:"夏",i:"🌿",c:"#5a8a50"},autumn:{l:"秋",i:"🍁",c:"#c8703a"},winter:{l:"冬",i:"❄",c:"#6a8aaa"}};
function getSeason(){const m=new Date().getMonth();if(m>=2&&m<=4)return"spring";if(m>=5&&m<=7)return"summer";if(m>=8&&m<=10)return"autumn";return"winter";}
function distKm(a,b,c,d){const R=6371,dL=(c-a)*Math.PI/180,dO=(d-b)*Math.PI/180;const x=Math.sin(dL/2)**2+Math.cos(a*Math.PI/180)*Math.cos(c*Math.PI/180)*Math.sin(dO/2)**2;return R*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x));}

// ── Flora Icons ──
function FI({sp,sz,co}){const s=sz||14,cl=co||"#e080a0";
const P5=r=>[0,72,144,216,288].map(a=><ellipse key={a} cx="12" cy={12-r} rx="3" ry={r} transform={"rotate("+a+",12,12)"} fill={cl}/>);
const ic={"樱花":()=><svg viewBox="0 0 24 24" width={s} height={s}><g opacity=".9">{P5(4.5)}<circle cx="12" cy="12" r="2.5" fill="#f8e0a0"/></g></svg>,
"桃花":()=><svg viewBox="0 0 24 24" width={s} height={s}><g opacity=".9">{P5(5)}<circle cx="12" cy="12" r="2" fill="#ffe0e8"/></g></svg>,
"梅花":()=><svg viewBox="0 0 24 24" width={s} height={s}><g opacity=".9">{[0,72,144,216,288].map(a=><circle key={a} cx="12" cy="6.5" r="3.2" transform={"rotate("+a+",12,12)"} fill={cl}/>)}<circle cx="12" cy="12" r="2.5" fill="#ffe088"/></g></svg>,
"牡丹":()=><svg viewBox="0 0 24 24" width={s} height={s}><g opacity=".85">{[0,45,90,135,180,225,270,315].map(a=><ellipse key={a} cx="12" cy="6" rx="3.5" ry="4.5" transform={"rotate("+a+",12,12)"} fill={cl}/>)}<circle cx="12" cy="12" r="2" fill="#f8d870"/></g></svg>,
"杜鹃花":()=><svg viewBox="0 0 24 24" width={s} height={s}><g opacity=".9">{[0,72,144,216,288].map(a=><path key={a} d="M12,3Q15,7 14,12Q12,10 10,12Q9,7 12,3" transform={"rotate("+a+",12,12)"} fill={cl}/>)}<circle cx="12" cy="12" r="2" fill="#f8e0a0"/></g></svg>,
"郁金香":()=><svg viewBox="0 0 24 24" width={s} height={s}><g opacity=".9"><path d="M12,2Q16,6 15,12Q12,14 12,14Q12,14 9,12Q8,6 12,2" fill={cl}/><path d="M12,14L12,22" stroke="#6a9a50" strokeWidth="1.5" fill="none"/></g></svg>,
"油菜花":()=><svg viewBox="0 0 24 24" width={s} height={s}><g opacity=".9">{[0,90,180,270].map(a=><ellipse key={a} cx="12" cy="8" rx="2.5" ry="3.5" transform={"rotate("+a+",12,12)"} fill={cl}/>)}<circle cx="12" cy="12" r="2" fill="#e8c020"/></g></svg>,
"蓝花楹":()=><svg viewBox="0 0 24 24" width={s} height={s}><g opacity=".85">{[0,51,103,154,206,257,309].map(a=><ellipse key={a} cx="12" cy="7" rx="2" ry="3.5" transform={"rotate("+a+",12,12)"} fill={cl}/>)}</g></svg>,
"梨花":()=><svg viewBox="0 0 24 24" width={s} height={s}><g opacity=".9" fill="#f0ece4" stroke={cl} strokeWidth=".3">{P5(4)}<circle cx="12" cy="12" r="2" fill="#d0e8a0"/></g></svg>,
"荷花":()=><svg viewBox="0 0 24 24" width={s} height={s}><g fill={cl} opacity=".85"><ellipse cx="12" cy="8" rx="3" ry="6"/><ellipse cx="8" cy="10" rx="2.5" ry="5" transform="rotate(-20,8,10)"/><ellipse cx="16" cy="10" rx="2.5" ry="5" transform="rotate(20,16,10)"/><circle cx="12" cy="14" r="2" fill="#f0d858"/></g></svg>,
"薰衣草":()=><svg viewBox="0 0 24 24" width={s} height={s}><g opacity=".85"><path d="M12,22L12,8" stroke="#7a9a50" strokeWidth="1.2" fill="none"/>{[3,5,7,9,11].map(y=><g key={y}><ellipse cx="10" cy={y} rx="2" ry="1.2" fill={cl}/><ellipse cx="14" cy={y} rx="2" ry="1.2" fill={cl}/></g>)}</g></svg>,
"格桑花":()=><svg viewBox="0 0 24 24" width={s} height={s}><g opacity=".9">{[0,45,90,135,180,225,270,315].map(a=><ellipse key={a} cx="12" cy="7" rx="2" ry="4" transform={"rotate("+a+",12,12)"} fill={cl}/>)}<circle cx="12" cy="12" r="2.5" fill="#f0d060"/></g></svg>,
"银杏":()=><svg viewBox="0 0 24 24" width={s} height={s}><g fill={cl} opacity=".9"><path d="M12,20L12,12Q6,8 4,4Q8,2 12,6Q16,2 20,4Q18,8 12,12"/></g></svg>,
"胡杨":()=><svg viewBox="0 0 24 24" width={s} height={s}><g opacity=".9"><path d="M12,22L12,10" stroke="#8a6a30" strokeWidth="2" fill="none"/><circle cx="8" cy="8" r="3.5" fill={cl}/><circle cx="16" cy="7" r="3" fill={cl}/><circle cx="12" cy="5" r="3.5" fill={cl} opacity=".8"/></g></svg>,
"彩林":()=><svg viewBox="0 0 24 24" width={s} height={s}><g opacity=".85"><circle cx="7" cy="9" r="4" fill="#d86830"/><circle cx="17" cy="8" r="3.5" fill="#e8a030"/><circle cx="12" cy="6" r="4" fill="#c84020"/><path d="M12,22L12,12" stroke="#6a5030" strokeWidth="1.5" fill="none"/></g></svg>,
"白桦林":()=><svg viewBox="0 0 24 24" width={s} height={s}><g opacity=".85"><rect x="11" y="8" width="2" height="14" rx="1" fill="#e8e0d0"/><circle cx="12" cy="6" r="5" fill={cl}/></g></svg>,
"红枫":()=><svg viewBox="0 0 24 24" width={s} height={s}><g fill={cl} opacity=".9"><path d="M12,2L14,8L20,8L15,12L17,19L12,15L7,19L9,12L4,8L10,8Z"/></g></svg>,
"雾凇":()=><svg viewBox="0 0 24 24" width={s} height={s}><g stroke={cl} strokeWidth="1.5" fill="none" opacity=".8"><path d="M12,2L12,22M5,7L19,17M19,7L5,17"/><circle cx="12" cy="12" r="2" fill={cl}/></g></svg>,
"黄栌":()=>ic["彩林"](),
"桂花":()=><svg viewBox="0 0 24 24" width={s} height={s}><g opacity=".9">{[0,60,120,180,240,300].map(a=><circle key={a} cx="12" cy="9" r="1.8" transform={"rotate("+a+",12,12)"} fill={cl}/>)}<circle cx="12" cy="12" r="1.5" fill="#f0d060"/></g></svg>,
"三角梅":()=><svg viewBox="0 0 24 24" width={s} height={s}><g opacity=".9"><path d="M12,3L6,14L18,14Z" fill={cl}/><path d="M12,4L8,13L16,13Z" fill={cl} opacity=".6"/><circle cx="12" cy="11" r="1.5" fill="#f0e8d0"/></g></svg>,
"丁香花":()=><svg viewBox="0 0 24 24" width={s} height={s}><g opacity=".85">{[0,90,180,270].map(a=><ellipse key={a} cx="12" cy="8" rx="1.8" ry="3.5" transform={"rotate("+a+",12,12)"} fill={cl}/>)}<circle cx="12" cy="12" r="1.2" fill="#e8d8f0"/>{[-3,3].map(x=><g key={x}>{[0,90,180,270].map(a=><ellipse key={a} cx={12+x} cy={8+Math.abs(x)} rx="1.2" ry="2.5" transform={"rotate("+a+","+(12+x)+","+(8+Math.abs(x))+")"} fill={cl} opacity=".6"/>)}</g>)}</g></svg>,
"野花草甸":()=><svg viewBox="0 0 24 24" width={s} height={s}><g opacity=".85"><circle cx="8" cy="9" r="2.5" fill={cl}/><circle cx="12" cy="7" r="2.5" fill="#e8a040"/><circle cx="16" cy="9" r="2.5" fill="#d070a0"/></g></svg>};

const alt={"高山杜鹃":"杜鹃花","云锦杜鹃":"杜鹃花","野杏花":"桃花","芍药":"牡丹","冬樱花":"樱花","苹果梨花":"梨花","凤凰花":"杜鹃花","紫荆花":"杜鹃花","朱槿":"杜鹃花","紫菜花":"薰衣草","杏花":"桃花","竹林":"白桦林","兰花":"薰衣草","菊花":"格桑花","山茶花":"牡丹","蜡梅":"梅花","辛夷花":"梅花","沙漠花":"油菜花","茶花":"牡丹",
  "向日葵":"油菜花","紫藤":"薰衣草","木棉花":"杜鹃花","玉兰花":"梅花","月季":"牡丹","海棠花":"桃花","水仙花":"郁金香","芦花":"格桑花","紫云英":"薰衣草","绣球花":"杜鹃花","睡莲":"荷花","紫薇花":"杜鹃花","合欢花":"桃花","栀子花":"梅花","茉莉花":"梅花","玫瑰":"牡丹","芙蓉花":"牡丹","虞美人":"杜鹃花","波斯菊":"格桑花","鸡蛋花":"郁金香","凌霄花":"杜鹃花","木槿花":"杜鹃花","石榴花":"杜鹃花","蔷薇":"桃花","百合":"郁金香","迎春花":"油菜花",
  "牵牛花":"杜鹃花","金针花":"油菜花","蝴蝶兰":"杜鹃花","椰树":"白桦林",
  "瑞香":"梅花","山矾":"梅花","望春":"梅花","李花":"梨花","棠棣":"桃花",
  "木兰":"梅花","桐花":"梅花","麦花":"油菜花","柳花":"白桦林","荼蘼":"桃花","楝花":"薰衣草",
  "水仙花":"郁金香","山茶花":"牡丹","海棠花":"桃花","蔷薇":"桃花"};
const r=ic[sp]||ic[alt[sp]];return r?r():<svg viewBox="0 0 24 24" width={s} height={s}><g opacity=".8">{P5(4)}<circle cx="12" cy="12" r="2" fill="#f0d870"/></g></svg>;}
const FIMemo=React.memo(FI);

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
  // ── 继续扩充 ──
  {id:220,n:"乌鲁木齐·红山",sp:"丁香花",lat:43.82,lon:87.62,th:360,s:"spring",c:"#c090d0",rg:"西北",po:"红山丁香紫满城",tp:"宜：西域花事",pk:[5,6],hist:["05-12","05-10","05-15"],mfw:"红山公园"},
  {id:221,n:"银川·览山",sp:"牡丹",lat:38.47,lon:106.28,th:335,s:"spring",c:"#e868a0",rg:"西北",po:"塞上江南牡丹红",tp:"宜：贺兰赏花",pk:[5,5],hist:["05-05","05-02","05-08"],mfw:"览山公园"},
  {id:222,n:"西宁·北山",sp:"丁香花",lat:36.62,lon:101.78,th:365,s:"spring",c:"#c090d0",rg:"西北",po:"高原丁香满北山",tp:"宜：登山赏花",pk:[5,6],hist:["05-18","05-15","05-22"],mfw:"北山美丽园"},
  {id:223,n:"呼和浩特·公主府",sp:"丁香花",lat:40.84,lon:111.75,th:355,s:"spring",c:"#c090d0",rg:"华北",po:"青城丁香香满城",tp:"宜：古城漫步",pk:[5,6],hist:["05-15","05-12","05-18"],mfw:"公主府公园"},
  {id:224,n:"昆明·滇池",sp:"冬樱花",lat:24.95,lon:102.65,th:125,s:"winter",c:"#f090a8",rg:"西南",po:"滇池冬樱映晨曦",tp:"十二月赏樱",pk:[12,1],hist:["12-08","12-05","12-12"],mfw:"滇池"},
  {id:225,n:"海口·万绿园",sp:"三角梅",lat:20.03,lon:110.35,th:240,s:"spring",c:"#e040a0",rg:"华南",po:"椰城三角梅如瀑",tp:"全年可赏",pk:[1,4],hist:["02-01","01-28","02-05"],mfw:"万绿园"},
  {id:226,n:"三亚·亚龙湾",sp:"凤凰花",lat:18.19,lon:109.64,th:550,s:"summer",c:"#e84030",rg:"华南",po:"凤凰花开火焰红",tp:"六月盛放",pk:[6,7],hist:["06-10","06-08","06-15"],mfw:"亚龙湾"},
  {id:227,n:"珠海·情侣路",sp:"紫荆花",lat:22.27,lon:113.58,th:280,s:"spring",c:"#d070b0",rg:"华南",po:"情侣路上紫荆开",tp:"三月赏花",pk:[3,4],hist:["03-15","03-12","03-18"],mfw:"情侣路"},
  {id:228,n:"漳州·南靖",sp:"三角梅",lat:24.52,lon:117.37,th:260,s:"spring",c:"#e040a0",rg:"华东",po:"土楼三角梅如锦",tp:"宜：古楼赏花",pk:[2,5],hist:["03-05","03-02","03-08"],mfw:"南靖土楼"},
  {id:229,n:"大连·劳动公园",sp:"樱花",lat:38.92,lon:121.63,th:305,s:"spring",c:"#ffb7c5",rg:"东北",po:"滨城樱花满园春",tp:"宜：海风赏樱",pk:[4,5],hist:["04-18","04-15","04-22"],mfw:"劳动公园"},
  {id:230,n:"烟台·蓬莱",sp:"桃花",lat:37.81,lon:120.76,th:285,s:"spring",c:"#f8a0b0",rg:"华东",po:"蓬莱桃花仙境中",tp:"宜：仙岛探春",pk:[4,4],hist:["04-08","04-05","04-12"],mfw:"蓬莱阁"},
  {id:231,n:"济南·趵突泉",sp:"梅花",lat:36.66,lon:117.00,th:210,s:"spring",c:"#f0d0d8",rg:"华东",po:"泉城探梅趵突边",tp:"宜：泉畔寻梅",pk:[2,3],hist:["02-22","02-18","02-25"],mfw:"趵突泉"},
  {id:232,n:"洛阳·王城公园",sp:"牡丹",lat:34.66,lon:112.44,th:322,s:"spring",c:"#e868a0",rg:"华中",po:"王城牡丹倾城色",tp:"宜：花会期间",pk:[4,4],hist:["04-14","04-10","04-18"],mfw:"王城公园"},
  {id:233,n:"开封·龙亭",sp:"菊花",lat:34.80,lon:114.35,th:520,s:"autumn",c:"#f0c040",rg:"华中",po:"开封菊花甲天下",tp:"十月菊展",pk:[10,11],hist:["10-20","10-18","10-25"],mfw:"龙亭公园"},
  {id:234,n:"武汉·江夏",sp:"油菜花",lat:30.35,lon:114.32,th:255,s:"spring",c:"#e8c840",rg:"华中",po:"江夏花海金满地",tp:"宜：田园踏青",pk:[3,3],hist:["03-12","03-10","03-15"],mfw:"江夏油菜花"},
  {id:235,n:"南宁·药用植物园",sp:"朱槿",lat:22.84,lon:108.32,th:290,s:"spring",c:"#e06040",rg:"华南",po:"南国朱槿四季红",tp:"全年可赏",pk:[3,6],hist:["03-10","03-08","03-15"],mfw:"药用植物园"},
  {id:236,n:"吐鲁番·火焰山",sp:"杏花",lat:42.95,lon:89.18,th:240,s:"spring",c:"#f0b8c0",rg:"西北",po:"火焰山下杏花白",tp:"宜：丝路探花",pk:[3,4],hist:["03-28","03-25","04-02"],mfw:"火焰山"},
  {id:237,n:"平坝·樱花园",sp:"樱花",lat:26.40,lon:106.26,th:265,s:"spring",c:"#ffb7c5",rg:"西南",po:"贵州最大樱花海",tp:"宜：航拍花海",pk:[3,3],hist:["03-12","03-10","03-15"],mfw:"平坝樱花"},
  {id:238,n:"洛阳·中国薰衣草庄园",sp:"薰衣草",lat:34.55,lon:112.38,th:480,s:"summer",c:"#9070b0",rg:"华中",po:"中原紫色花海梦",tp:"六月盛放",pk:[6,7],hist:["06-12","06-10","06-18"],mfw:"薰衣草庄园"},
  {id:239,n:"南京·玄武湖",sp:"荷花",lat:32.07,lon:118.80,th:635,s:"summer",c:"#f080a0",rg:"华东",po:"玄武湖畔荷花开",tp:"七月赏荷",pk:[7,8],hist:["07-05","07-02","07-08"],mfw:"玄武湖"},
  {id:240,n:"承德·避暑山庄",sp:"荷花",lat:40.98,lon:117.93,th:650,s:"summer",c:"#f080a0",rg:"华北",po:"皇家荷池碧波间",tp:"七月避暑赏荷",pk:[7,8],hist:["07-10","07-08","07-15"],mfw:"避暑山庄"},
  {id:241,n:"稻城·亚丁",sp:"格桑花",lat:28.75,lon:100.30,th:340,s:"summer",c:"#e060a0",rg:"西南",po:"最后的香格里拉",tp:"七月花海",pk:[7,8],hist:["07-15","07-12","07-18"],mfw:"稻城亚丁"},
  {id:242,n:"哈尔滨·群力",sp:"银杏",lat:45.72,lon:126.58,th:370,s:"autumn",c:"#e8c840",rg:"东北",po:"冰城金叶满群力",tp:"十月赏秋",pk:[10,10],hist:["10-08","10-05","10-12"],mfw:"群力外滩"},
  {id:243,n:"丹东·鸭绿江",sp:"银杏",lat:40.12,lon:124.39,th:375,s:"autumn",c:"#e8c840",rg:"东北",po:"鸭绿江畔秋色浓",tp:"十月边城",pk:[10,10],hist:["10-12","10-10","10-15"],mfw:"鸭绿江断桥"},
  {id:244,n:"云南·罗平",sp:"油菜花",lat:24.88,lon:104.31,th:230,s:"spring",c:"#e8c840",rg:"西南",po:"金鸡峰丛花如海",tp:"宜：二月最早",pk:[2,3],hist:["02-15","02-12","02-18"],mfw:"罗平油菜花"},
  {id:245,n:"福建·霞浦",sp:"紫菜花",lat:26.88,lon:120.00,th:400,s:"autumn",c:"#b070d0",rg:"华东",po:"霞浦滩涂紫如幻",tp:"九月光影",pk:[9,10],hist:["09-20","09-18","09-25"],mfw:"霞浦滩涂"},
  {id:246,n:"甘南·扎尕那",sp:"格桑花",lat:34.25,lon:103.20,th:350,s:"summer",c:"#e060a0",rg:"西北",po:"扎尕那草甸花海",tp:"七月秘境",pk:[7,8],hist:["07-10","07-08","07-15"],mfw:"扎尕那"},
  {id:247,n:"张掖·丹霞",sp:"油菜花",lat:38.93,lon:100.45,th:430,s:"summer",c:"#f0d040",rg:"西北",po:"七彩丹霞映花海",tp:"七月最美",pk:[7,7],hist:["07-08","07-05","07-12"],mfw:"张掖丹霞"},
  {id:248,n:"内蒙·阿尔山",sp:"杜鹃花",lat:47.17,lon:119.94,th:320,s:"spring",c:"#e04070",rg:"东北",po:"兴安杜鹃映残雪",tp:"宜：五月花海",pk:[5,6],hist:["05-15","05-12","05-20"],mfw:"阿尔山"},
  {id:249,n:"宜兴·竹海",sp:"竹林",lat:31.36,lon:119.82,th:300,s:"spring",c:"#5a9a50",rg:"华东",po:"竹海幽幽翠满山",tp:"四季可赏",pk:[4,10],hist:["04-01","03-28","04-05"],mfw:"宜兴竹海"},
  {id:250,n:"安吉·大竹海",sp:"竹林",lat:30.63,lon:119.68,th:295,s:"spring",c:"#5a9a50",rg:"华东",po:"大竹海里卧虎藏龙",tp:"四季可赏",pk:[4,10],hist:["04-05","04-02","04-08"],mfw:"中国大竹海"},
  {id:251,n:"常德·桃花源",sp:"桃花",lat:28.88,lon:111.48,th:265,s:"spring",c:"#f8a0b0",rg:"华中",po:"武陵渔人寻桃源",tp:"宜：世外桃源",pk:[3,4],hist:["03-15","03-12","03-18"],mfw:"桃花源"},
  {id:252,n:"绍兴·兰亭",sp:"兰花",lat:30.00,lon:120.52,th:310,s:"spring",c:"#a8c890",rg:"华东",po:"兰亭序里兰草香",tp:"宜：书圣故里",pk:[3,5],hist:["03-20","03-18","03-25"],mfw:"兰亭"},
  {id:253,n:"哈密·巴里坤",sp:"油菜花",lat:43.60,lon:93.01,th:440,s:"summer",c:"#f0d040",rg:"西北",po:"天山脚下金花海",tp:"七月盛放",pk:[7,7],hist:["07-10","07-08","07-15"],mfw:"巴里坤"},
  {id:254,n:"雅安·牛背山",sp:"杜鹃花",lat:29.87,lon:102.37,th:310,s:"spring",c:"#e04070",rg:"西南",po:"云海之上杜鹃红",tp:"宜：云端赏花",pk:[5,6],hist:["05-10","05-08","05-15"],mfw:"牛背山"},
  {id:255,n:"无锡·蠡园",sp:"荷花",lat:31.51,lon:120.25,th:640,s:"summer",c:"#f080a0",rg:"华东",po:"蠡园荷香满太湖",tp:"七月赏荷",pk:[7,8],hist:["07-05","07-02","07-08"],mfw:"蠡园"},
  // ── 第四批扩充：覆盖所有省会+重点地级市 ──
  // 华北补全
  {id:260,n:"石家庄·赵州桥",sp:"梨花",lat:37.77,lon:114.78,th:270,s:"spring",c:"#d8ccc0",rg:"华北",po:"赵州梨花白如雪",tp:"宜：古桥探春",pk:[4,4],hist:["04-08","04-05","04-12"],mfw:"赵州桥"},
  {id:261,n:"保定·狼牙山",sp:"红枫",lat:39.03,lon:115.30,th:370,s:"autumn",c:"#d04030",rg:"华北",po:"狼牙秋色映残阳",tp:"十月登山",pk:[10,11],hist:["10-22","10-18","10-25"],mfw:"狼牙山"},
  {id:262,n:"秦皇岛·祖山",sp:"杜鹃花",lat:40.08,lon:119.50,th:310,s:"spring",c:"#e04070",rg:"华北",po:"祖山杜鹃漫山红",tp:"宜：五月花海",pk:[5,5],hist:["05-08","05-05","05-12"],mfw:"祖山"},
  {id:263,n:"大同·云冈",sp:"银杏",lat:40.12,lon:113.13,th:380,s:"autumn",c:"#e8c840",rg:"华北",po:"云冈佛前银杏黄",tp:"十月古佛",pk:[10,10],hist:["10-10","10-08","10-15"],mfw:"云冈石窟"},
  // 东北补全
  {id:264,n:"吉林市·北山",sp:"杜鹃花",lat:43.85,lon:126.56,th:315,s:"spring",c:"#e04070",rg:"东北",po:"北山杜鹃映松花",tp:"宜：五月赏花",pk:[5,5],hist:["05-10","05-08","05-15"],mfw:"吉林北山"},
  {id:265,n:"牡丹江·镜泊湖",sp:"红枫",lat:43.85,lon:128.75,th:345,s:"autumn",c:"#d04030",rg:"东北",po:"镜泊秋色满湖红",tp:"九月赏枫",pk:[9,10],hist:["09-25","09-22","09-28"],mfw:"镜泊湖"},
  {id:266,n:"大庆·龙凤湿地",sp:"荷花",lat:46.58,lon:125.10,th:660,s:"summer",c:"#f080a0",rg:"东北",po:"龙凤湿地荷花艳",tp:"七月赏荷",pk:[7,8],hist:["07-15","07-12","07-18"],mfw:"龙凤湿地"},
  // 华东补全
  {id:267,n:"宁波·月湖",sp:"梅花",lat:29.87,lon:121.55,th:200,s:"spring",c:"#f0d0d8",rg:"华东",po:"月湖梅花暗香浮",tp:"宜：冬末寻梅",pk:[2,3],hist:["02-15","02-12","02-18"],mfw:"月湖公园"},
  {id:268,n:"温州·雁荡山",sp:"杜鹃花",lat:28.38,lon:121.07,th:300,s:"spring",c:"#e04070",rg:"华东",po:"雁荡杜鹃映奇峰",tp:"宜：登山赏花",pk:[4,5],hist:["04-22","04-18","04-25"],mfw:"雁荡山"},
  {id:269,n:"徐州·云龙湖",sp:"樱花",lat:34.23,lon:117.20,th:285,s:"spring",c:"#ffb7c5",rg:"华东",po:"云龙湖畔樱如雪",tp:"宜：环湖赏樱",pk:[3,4],hist:["03-25","03-22","03-28"],mfw:"云龙湖"},
  {id:270,n:"连云港·花果山",sp:"桃花",lat:34.65,lon:119.17,th:275,s:"spring",c:"#f8a0b0",rg:"华东",po:"花果山中桃花开",tp:"宜：寻齐天大圣",pk:[3,4],hist:["03-28","03-25","04-02"],mfw:"花果山"},
  {id:271,n:"南通·濠河",sp:"桂花",lat:32.00,lon:120.87,th:355,s:"autumn",c:"#f0c848",rg:"华东",po:"濠河桂香满城飘",tp:"九月品香",pk:[9,10],hist:["09-22","09-18","09-25"],mfw:"濠河"},
  {id:272,n:"常州·红梅公园",sp:"梅花",lat:31.78,lon:119.97,th:198,s:"spring",c:"#f0d0d8",rg:"华东",po:"红梅公园暗香来",tp:"宜：踏雪寻梅",pk:[2,3],hist:["02-12","02-10","02-15"],mfw:"红梅公园"},
  {id:273,n:"镇江·金山",sp:"桂花",lat:32.22,lon:119.44,th:360,s:"autumn",c:"#f0c848",rg:"华东",po:"金山桂花香满寺",tp:"九月古寺",pk:[9,10],hist:["09-25","09-22","09-28"],mfw:"金山寺"},
  {id:274,n:"嘉兴·南湖",sp:"荷花",lat:30.75,lon:120.77,th:635,s:"summer",c:"#f080a0",rg:"华东",po:"南湖荷花映红船",tp:"七月赏荷",pk:[7,8],hist:["07-05","07-02","07-08"],mfw:"南湖"},
  {id:275,n:"金华·双龙洞",sp:"杜鹃花",lat:29.13,lon:119.67,th:305,s:"spring",c:"#e04070",rg:"华东",po:"双龙洞外杜鹃红",tp:"宜：登山赏花",pk:[4,5],hist:["04-20","04-18","04-25"],mfw:"双龙洞"},
  // 华中补全
  {id:276,n:"宜昌·三峡",sp:"桃花",lat:30.69,lon:111.28,th:260,s:"spring",c:"#f8a0b0",rg:"华中",po:"三峡桃花映碧波",tp:"宜：峡江探春",pk:[3,3],hist:["03-12","03-10","03-15"],mfw:"三峡人家"},
  {id:277,n:"襄阳·古隆中",sp:"桃花",lat:32.01,lon:112.08,th:268,s:"spring",c:"#f8a0b0",rg:"华中",po:"隆中桃花映卧龙",tp:"宜：三国探春",pk:[3,4],hist:["03-18","03-15","03-22"],mfw:"古隆中"},
  {id:278,n:"岳阳·洞庭湖",sp:"荷花",lat:29.38,lon:113.10,th:630,s:"summer",c:"#f080a0",rg:"华中",po:"洞庭荷花接天碧",tp:"七月赏荷",pk:[7,8],hist:["07-08","07-05","07-12"],mfw:"洞庭湖"},
  {id:279,n:"三门峡·天鹅湖",sp:"荷花",lat:34.77,lon:111.20,th:640,s:"summer",c:"#f080a0",rg:"华中",po:"天鹅湖畔荷花香",tp:"七月赏荷",pk:[7,8],hist:["07-10","07-08","07-15"],mfw:"天鹅湖"},
  {id:280,n:"十堰·武当山",sp:"杜鹃花",lat:32.40,lon:111.00,th:310,s:"spring",c:"#e04070",rg:"华中",po:"武当杜鹃映仙山",tp:"宜：道山赏花",pk:[4,5],hist:["04-22","04-20","04-28"],mfw:"武当山"},
  // 华南补全
  {id:281,n:"佛山·南海",sp:"桃花",lat:23.03,lon:113.15,th:235,s:"spring",c:"#f8a0b0",rg:"华南",po:"南海桃花朵朵红",tp:"宜：岭南年花",pk:[2,3],hist:["02-10","02-08","02-15"],mfw:"南海桃花"},
  {id:282,n:"东莞·松山湖",sp:"樱花",lat:22.92,lon:113.88,th:245,s:"spring",c:"#ffb7c5",rg:"华南",po:"松山湖畔樱花雨",tp:"宜：科技城赏樱",pk:[2,3],hist:["02-18","02-15","02-22"],mfw:"松山湖"},
  {id:283,n:"惠州·西湖",sp:"桃花",lat:23.10,lon:114.40,th:240,s:"spring",c:"#f8a0b0",rg:"华南",po:"惠州西湖桃花笑",tp:"宜：苏东坡故地",pk:[2,3],hist:["02-15","02-12","02-18"],mfw:"惠州西湖"},
  {id:284,n:"柳州·紫荆花",sp:"紫荆花",lat:24.33,lon:109.42,th:270,s:"spring",c:"#d070b0",rg:"华南",po:"龙城紫荆二十里",tp:"宜：紫荆花城",pk:[3,4],hist:["03-18","03-15","03-22"],mfw:"柳州紫荆花"},
  {id:285,n:"北海·银滩",sp:"三角梅",lat:21.43,lon:109.13,th:250,s:"spring",c:"#e040a0",rg:"华南",po:"银滩三角梅如火",tp:"全年可赏",pk:[2,5],hist:["02-20","02-18","02-25"],mfw:"银滩"},
  {id:286,n:"韶关·丹霞山",sp:"红枫",lat:25.00,lon:113.72,th:390,s:"autumn",c:"#d04030",rg:"华南",po:"丹霞红叶映丹崖",tp:"十一月赏秋",pk:[11,12],hist:["11-18","11-15","11-22"],mfw:"丹霞山"},
  {id:287,n:"湛江·湖光岩",sp:"三角梅",lat:21.27,lon:110.35,th:240,s:"spring",c:"#e040a0",rg:"华南",po:"湖光岩畔花满墙",tp:"全年可赏",pk:[1,5],hist:["02-01","01-28","02-05"],mfw:"湖光岩"},
  // 西南补全
  {id:288,n:"遵义·海龙屯",sp:"杜鹃花",lat:27.72,lon:106.93,th:290,s:"spring",c:"#e04070",rg:"西南",po:"海龙屯上杜鹃红",tp:"宜：古堡赏花",pk:[4,4],hist:["04-10","04-08","04-15"],mfw:"海龙屯"},
  {id:289,n:"泸州·古蔺",sp:"桃花",lat:28.00,lon:105.83,th:258,s:"spring",c:"#f8a0b0",rg:"西南",po:"古蔺桃花满山谷",tp:"宜：酒乡探春",pk:[3,3],hist:["03-10","03-08","03-15"],mfw:"古蔺桃花"},
  {id:290,n:"攀枝花·米易",sp:"樱花",lat:26.89,lon:102.11,th:250,s:"spring",c:"#ffb7c5",rg:"西南",po:"攀西阳光冬樱花",tp:"宜：冬日暖阳",pk:[1,2],hist:["01-20","01-18","01-25"],mfw:"米易樱花"},
  {id:291,n:"玉溪·抚仙湖",sp:"樱花",lat:24.52,lon:102.89,th:255,s:"spring",c:"#ffb7c5",rg:"西南",po:"抚仙湖畔樱似霞",tp:"宜：湖畔赏樱",pk:[2,3],hist:["02-20","02-18","02-25"],mfw:"抚仙湖"},
  {id:292,n:"大理·洱海",sp:"油菜花",lat:25.67,lon:100.17,th:245,s:"spring",c:"#e8c840",rg:"西南",po:"洱海金花映苍山",tp:"宜：环湖骑行",pk:[2,3],hist:["02-18","02-15","02-22"],mfw:"洱海"},
  {id:293,n:"香格里拉·普达措",sp:"杜鹃花",lat:27.90,lon:99.96,th:330,s:"spring",c:"#d84070",rg:"西南",po:"香格里拉杜鹃海",tp:"宜：高原花海",pk:[5,6],hist:["05-20","05-18","05-25"],mfw:"普达措"},
  {id:294,n:"兴义·马岭河",sp:"三角梅",lat:25.09,lon:104.90,th:260,s:"spring",c:"#e040a0",rg:"西南",po:"马岭河畔花满崖",tp:"宜：峡谷花海",pk:[3,5],hist:["03-15","03-12","03-18"],mfw:"马岭河"},
  // 西北补全
  {id:295,n:"敦煌·鸣沙山",sp:"杏花",lat:40.08,lon:94.67,th:250,s:"spring",c:"#f0b8c0",rg:"西北",po:"大漠杏花一枝春",tp:"宜：丝路探花",pk:[4,4],hist:["04-05","04-02","04-08"],mfw:"鸣沙山"},
  {id:296,n:"天水·麦积山",sp:"梅花",lat:34.37,lon:105.90,th:215,s:"spring",c:"#f0d0d8",rg:"西北",po:"麦积烟雨梅花香",tp:"宜：石窟探梅",pk:[3,3],hist:["03-05","03-02","03-08"],mfw:"麦积山"},
  {id:297,n:"中卫·沙坡头",sp:"油菜花",lat:37.45,lon:104.95,th:410,s:"summer",c:"#f0d040",rg:"西北",po:"大漠边缘金花海",tp:"七月花海",pk:[7,7],hist:["07-08","07-05","07-12"],mfw:"沙坡头"},
  {id:298,n:"延安·万花山",sp:"牡丹",lat:36.65,lon:109.50,th:335,s:"spring",c:"#e868a0",rg:"西北",po:"延安牡丹别样红",tp:"宜：革命圣地",pk:[5,5],hist:["05-05","05-02","05-08"],mfw:"万花山"},
  // 青藏补全
  {id:299,n:"日喀则·珠峰大本营",sp:"格桑花",lat:28.65,lon:87.00,th:350,s:"summer",c:"#e060a0",rg:"西藏",po:"珠峰脚下格桑开",tp:"七月花海",pk:[7,8],hist:["07-20","07-15","07-25"],mfw:"珠峰大本营"},
  {id:300,n:"那曲·当惹雍错",sp:"野花草甸",lat:31.80,lon:87.10,th:330,s:"summer",c:"#80c868",rg:"西藏",po:"藏北草甸繁花似锦",tp:"七月花海",pk:[7,8],hist:["07-18","07-15","07-22"],mfw:"当惹雍错"},
  // 更多补充
  {id:301,n:"西安·兴庆宫",sp:"郁金香",lat:34.25,lon:108.98,th:295,s:"spring",c:"#e84060",rg:"西北",po:"兴庆宫里郁金香",tp:"宜：古都赏花",pk:[4,4],hist:["04-05","04-02","04-08"],mfw:"兴庆宫公园"},
  {id:302,n:"成都·人民公园",sp:"菊花",lat:30.66,lon:104.06,th:510,s:"autumn",c:"#f0c040",rg:"西南",po:"人民公园菊展艳",tp:"十月菊展",pk:[10,11],hist:["10-18","10-15","10-22"],mfw:"人民公园"},
  {id:303,n:"昆明·西山",sp:"山茶花",lat:25.02,lon:102.62,th:200,s:"winter",c:"#e06060",rg:"西南",po:"西山山茶万朵红",tp:"一月赏茶花",pk:[1,3],hist:["01-15","01-12","01-18"],mfw:"西山"},
  {id:304,n:"重庆·北碚",sp:"蜡梅",lat:29.83,lon:106.44,th:180,s:"winter",c:"#f0d060",rg:"西南",po:"北碚蜡梅暗香来",tp:"十二月寻梅",pk:[12,1],hist:["12-15","12-12","12-18"],mfw:"北碚蜡梅"},
  {id:305,n:"武汉·植物园",sp:"郁金香",lat:30.55,lon:114.42,th:290,s:"spring",c:"#e84060",rg:"华中",po:"江城郁金香花展",tp:"宜：花展季",pk:[3,4],hist:["03-20","03-18","03-25"],mfw:"武汉植物园"},
  {id:306,n:"上海·崇明",sp:"油菜花",lat:31.62,lon:121.40,th:260,s:"spring",c:"#e8c840",rg:"华东",po:"崇明花海金满岛",tp:"宜：岛上踏青",pk:[3,4],hist:["03-18","03-15","03-22"],mfw:"崇明花海"},
  {id:307,n:"杭州·植物园",sp:"桂花",lat:30.26,lon:120.12,th:358,s:"autumn",c:"#f0c848",rg:"华东",po:"满陇桂雨香满城",tp:"九月品桂",pk:[9,10],hist:["09-25","09-22","09-28"],mfw:"杭州植物园"},
  {id:308,n:"苏州·沧浪亭",sp:"银杏",lat:31.30,lon:120.63,th:392,s:"autumn",c:"#e8c840",rg:"华东",po:"沧浪银杏千年黄",tp:"十一月古园",pk:[11,12],hist:["11-12","11-10","11-18"],mfw:"沧浪亭"},
  {id:309,n:"黄山·西递",sp:"油菜花",lat:30.00,lon:117.98,th:255,s:"spring",c:"#e8c840",rg:"华东",po:"徽州古村油菜金",tp:"宜：写生摄影",pk:[3,4],hist:["03-15","03-12","03-18"],mfw:"西递"},
  {id:310,n:"北京·陶然亭",sp:"荷花",lat:39.87,lon:116.38,th:650,s:"summer",c:"#f080a0",rg:"华北",po:"陶然亭畔赏荷花",tp:"七月赏荷",pk:[7,8],hist:["07-08","07-05","07-12"],mfw:"陶然亭"},
  {id:311,n:"南京·牛首山",sp:"樱花",lat:31.93,lon:118.80,th:280,s:"spring",c:"#ffb7c5",rg:"华东",po:"牛首春晴赏樱好",tp:"宜：佛寺赏樱",pk:[3,4],hist:["03-22","03-20","03-25"],mfw:"牛首山"},
  {id:312,n:"无锡·惠山",sp:"杜鹃花",lat:31.57,lon:120.28,th:300,s:"spring",c:"#e04070",rg:"华东",po:"惠山杜鹃满古镇",tp:"宜：古镇赏花",pk:[4,4],hist:["04-08","04-05","04-12"],mfw:"惠山古镇"},
  {id:313,n:"苏州·穹窿山",sp:"梅花",lat:31.20,lon:120.50,th:195,s:"spring",c:"#f0d0d8",rg:"华东",po:"穹窿探梅暗香浮",tp:"宜：登山寻梅",pk:[2,3],hist:["02-15","02-12","02-18"],mfw:"穹窿山"},
  {id:314,n:"广州·从化",sp:"梅花",lat:23.55,lon:113.60,th:170,s:"winter",c:"#f0d0d8",rg:"华南",po:"从化冬梅岭南香",tp:"一月赏梅",pk:[1,2],hist:["01-10","01-08","01-15"],mfw:"流溪河梅花"},
  {id:315,n:"南京·灵谷寺",sp:"桂花",lat:32.05,lon:118.87,th:360,s:"autumn",c:"#f0c848",rg:"华东",po:"灵谷桂花香满林",tp:"九月古寺",pk:[9,10],hist:["09-28","09-25","10-02"],mfw:"灵谷寺"},
  // ── 第五批：覆盖所有重要城市 ──
  // 山东
  {id:320,n:"泰安·泰山",sp:"桃花",lat:36.25,lon:117.10,th:285,s:"spring",c:"#f8a0b0",rg:"华东",po:"岱岳桃花映天门",tp:"宜：登山赏桃",pk:[4,4],hist:["04-08","04-05","04-12"],mfw:"泰山"},
  {id:321,n:"济宁·微山湖",sp:"荷花",lat:34.80,lon:116.75,th:640,s:"summer",c:"#f080a0",rg:"华东",po:"微山湖上荷花多",tp:"七月泛舟",pk:[7,8],hist:["07-08","07-05","07-12"],mfw:"微山湖"},
  {id:322,n:"潍坊·青州",sp:"银杏",lat:36.70,lon:118.48,th:385,s:"autumn",c:"#e8c840",rg:"华东",po:"青州古城银杏黄",tp:"十月古城",pk:[10,11],hist:["10-20","10-18","10-25"],mfw:"青州古城"},
  {id:323,n:"临沂·蒙山",sp:"杜鹃花",lat:35.55,lon:117.95,th:305,s:"spring",c:"#e04070",rg:"华东",po:"蒙山杜鹃映云海",tp:"宜：四月花海",pk:[4,5],hist:["04-15","04-12","04-18"],mfw:"蒙山"},
  // 河南
  {id:324,n:"南阳·宝天曼",sp:"杜鹃花",lat:33.50,lon:111.93,th:310,s:"spring",c:"#e04070",rg:"华中",po:"宝天曼杜鹃漫山",tp:"宜：原始森林",pk:[4,5],hist:["04-20","04-18","04-25"],mfw:"宝天曼"},
  {id:325,n:"许昌·鄢陵",sp:"梅花",lat:34.10,lon:114.18,th:205,s:"spring",c:"#f0d0d8",rg:"华中",po:"鄢陵腊梅甲天下",tp:"一月赏梅",pk:[1,2],hist:["01-15","01-12","01-18"],mfw:"鄢陵花博园"},
  {id:326,n:"信阳·鸡公山",sp:"杜鹃花",lat:31.80,lon:114.05,th:300,s:"spring",c:"#e04070",rg:"华中",po:"鸡公山上杜鹃红",tp:"宜：避暑赏花",pk:[4,5],hist:["04-18","04-15","04-22"],mfw:"鸡公山"},
  // 湖南
  {id:327,n:"湘潭·盘龙大观园",sp:"樱花",lat:27.85,lon:112.95,th:270,s:"spring",c:"#ffb7c5",rg:"华中",po:"盘龙樱花万株开",tp:"宜：花海拍照",pk:[3,3],hist:["03-12","03-10","03-15"],mfw:"盘龙大观园"},
  {id:328,n:"衡阳·南岳",sp:"杜鹃花",lat:27.25,lon:112.70,th:310,s:"spring",c:"#e04070",rg:"华中",po:"南岳杜鹃云中开",tp:"宜：祝融赏花",pk:[4,5],hist:["04-20","04-18","04-25"],mfw:"南岳衡山"},
  {id:329,n:"怀化·雪峰山",sp:"樱花",lat:27.55,lon:110.00,th:265,s:"spring",c:"#ffb7c5",rg:"华中",po:"雪峰山中樱花雨",tp:"宜：野樱遍山",pk:[3,3],hist:["03-08","03-05","03-12"],mfw:"雪峰山"},
  // 江苏
  {id:330,n:"盐城·大丰",sp:"郁金香",lat:33.20,lon:120.47,th:285,s:"spring",c:"#e84060",rg:"华东",po:"荷兰花海中国版",tp:"宜：花海骑行",pk:[4,4],hist:["04-05","04-02","04-08"],mfw:"荷兰花海"},
  {id:331,n:"泰州·兴化",sp:"油菜花",lat:32.93,lon:119.85,th:258,s:"spring",c:"#e8c840",rg:"华东",po:"千垛花海水上金",tp:"宜：水上花田",pk:[3,4],hist:["03-25","03-22","03-28"],mfw:"兴化千垛"},
  {id:332,n:"淮安·清晏园",sp:"荷花",lat:33.60,lon:119.03,th:640,s:"summer",c:"#f080a0",rg:"华东",po:"清晏荷花映运河",tp:"七月赏荷",pk:[7,8],hist:["07-05","07-02","07-08"],mfw:"清晏园"},
  // 安徽
  {id:333,n:"芜湖·响水涧",sp:"油菜花",lat:31.30,lon:118.38,th:255,s:"spring",c:"#e8c840",rg:"华东",po:"响水涧万亩花田",tp:"宜：航拍花海",pk:[3,3],hist:["03-12","03-10","03-15"],mfw:"响水涧"},
  {id:334,n:"六安·天堂寨",sp:"杜鹃花",lat:31.15,lon:115.77,th:305,s:"spring",c:"#e04070",rg:"华东",po:"天堂寨杜鹃花海",tp:"宜：瀑布赏花",pk:[4,5],hist:["04-18","04-15","04-22"],mfw:"天堂寨"},
  {id:335,n:"池州·九华山",sp:"杜鹃花",lat:30.48,lon:117.80,th:310,s:"spring",c:"#e04070",rg:"华东",po:"九华佛地杜鹃红",tp:"宜：佛山赏花",pk:[5,5],hist:["05-05","05-02","05-08"],mfw:"九华山"},
  // 江西
  {id:336,n:"景德镇·瑶里",sp:"油菜花",lat:29.40,lon:117.25,th:252,s:"spring",c:"#e8c840",rg:"华东",po:"瑶里古镇金花海",tp:"宜：古镇写生",pk:[3,3],hist:["03-10","03-08","03-15"],mfw:"瑶里"},
  {id:337,n:"赣州·通天岩",sp:"桂花",lat:25.85,lon:114.93,th:355,s:"autumn",c:"#f0c848",rg:"华东",po:"通天岩里桂花香",tp:"九月赏桂",pk:[9,10],hist:["09-22","09-18","09-25"],mfw:"通天岩"},
  {id:338,n:"上饶·三清山",sp:"杜鹃花",lat:28.92,lon:118.08,th:305,s:"spring",c:"#e04070",rg:"华东",po:"三清杜鹃云中红",tp:"宜：云海赏花",pk:[4,5],hist:["04-25","04-22","04-28"],mfw:"三清山"},
  {id:339,n:"九江·庐山",sp:"杜鹃花",lat:29.56,lon:115.97,th:315,s:"spring",c:"#e04070",rg:"华东",po:"庐山杜鹃满含鄱",tp:"宜：五月花海",pk:[5,5],hist:["05-08","05-05","05-12"],mfw:"庐山含鄱口"},
  // 福建
  {id:340,n:"泉州·清源山",sp:"三角梅",lat:24.95,lon:118.58,th:260,s:"spring",c:"#e040a0",rg:"华东",po:"清源山上花满墙",tp:"全年可赏",pk:[2,5],hist:["03-10","03-08","03-15"],mfw:"清源山"},
  {id:341,n:"龙岩·梅花山",sp:"杜鹃花",lat:25.38,lon:116.73,th:295,s:"spring",c:"#e04070",rg:"华东",po:"闽西杜鹃映客家",tp:"宜：四月花海",pk:[3,4],hist:["03-25","03-22","03-28"],mfw:"梅花山"},
  {id:342,n:"南平·武夷山",sp:"杜鹃花",lat:27.73,lon:118.00,th:305,s:"spring",c:"#e04070",rg:"华东",po:"武夷杜鹃映九曲",tp:"宜：茶山赏花",pk:[4,5],hist:["04-15","04-12","04-18"],mfw:"武夷山"},
  // 广东
  {id:343,n:"肇庆·鼎湖山",sp:"杜鹃花",lat:23.17,lon:112.55,th:245,s:"spring",c:"#e04070",rg:"华南",po:"鼎湖杜鹃映飞泉",tp:"宜：登山赏花",pk:[3,4],hist:["03-15","03-12","03-18"],mfw:"鼎湖山"},
  {id:344,n:"清远·连州",sp:"桃花",lat:24.78,lon:112.38,th:250,s:"spring",c:"#f8a0b0",rg:"华南",po:"连州桃花满峡谷",tp:"宜：峡谷探春",pk:[3,3],hist:["03-08","03-05","03-12"],mfw:"连州桃花"},
  {id:345,n:"梅州·雁南飞",sp:"茶花",lat:24.33,lon:116.10,th:220,s:"winter",c:"#e06060",rg:"华南",po:"雁南飞茶花满园",tp:"一月赏茶花",pk:[1,3],hist:["01-20","01-18","01-25"],mfw:"雁南飞"},
  {id:346,n:"中山·紫马岭",sp:"紫荆花",lat:22.52,lon:113.37,th:272,s:"spring",c:"#d070b0",rg:"华南",po:"中山紫荆花满城",tp:"三月花开",pk:[3,4],hist:["03-12","03-10","03-15"],mfw:"紫马岭公园"},
  // 广西
  {id:347,n:"百色·乐业",sp:"杜鹃花",lat:24.78,lon:106.57,th:288,s:"spring",c:"#e04070",rg:"华南",po:"天坑之上杜鹃红",tp:"宜：天坑花海",pk:[3,4],hist:["03-20","03-18","03-25"],mfw:"乐业天坑"},
  // 云南
  {id:348,n:"曲靖·罗平",sp:"油菜花",lat:24.88,lon:104.31,th:230,s:"spring",c:"#e8c840",rg:"西南",po:"金鸡峰丛花如海",tp:"宜：二月最早",pk:[2,3],hist:["02-15","02-12","02-18"],mfw:"罗平油菜花"},
  {id:349,n:"楚雄·紫溪山",sp:"山茶花",lat:25.03,lon:101.55,th:195,s:"winter",c:"#e06060",rg:"西南",po:"紫溪茶花冠天下",tp:"一月赏茶花",pk:[12,2],hist:["01-05","01-02","01-08"],mfw:"紫溪山"},
  {id:350,n:"普洱·思茅",sp:"樱花",lat:22.80,lon:101.05,th:245,s:"spring",c:"#ffb7c5",rg:"西南",po:"普洱冬樱花满城",tp:"十二月赏樱",pk:[12,1],hist:["12-10","12-08","12-15"],mfw:"普洱冬樱花"},
  // 四川
  {id:351,n:"绵阳·药王谷",sp:"辛夷花",lat:31.55,lon:104.72,th:280,s:"spring",c:"#f0a8c0",rg:"西南",po:"药王谷辛夷花海",tp:"宜：三月花海",pk:[3,4],hist:["03-18","03-15","03-22"],mfw:"药王谷"},
  {id:352,n:"乐山·大佛",sp:"桂花",lat:29.55,lon:103.77,th:358,s:"autumn",c:"#f0c848",rg:"西南",po:"大佛前桂花飘香",tp:"九月拜佛",pk:[9,10],hist:["09-25","09-22","09-28"],mfw:"乐山大佛"},
  {id:353,n:"宜宾·蜀南竹海",sp:"竹林",lat:28.65,lon:104.90,th:290,s:"spring",c:"#5a9a50",rg:"西南",po:"竹海万顷翠如玉",tp:"四季可赏",pk:[4,10],hist:["04-05","04-02","04-08"],mfw:"蜀南竹海"},
  {id:354,n:"阿坝·四姑娘山",sp:"格桑花",lat:31.08,lon:102.90,th:345,s:"summer",c:"#e060a0",rg:"西南",po:"四姑娘山花如海",tp:"七月花甸",pk:[7,8],hist:["07-12","07-10","07-18"],mfw:"四姑娘山"},
  // 贵州
  {id:355,n:"安顺·黄果树",sp:"三角梅",lat:25.99,lon:105.67,th:265,s:"spring",c:"#e040a0",rg:"西南",po:"黄果树瀑布旁花开",tp:"宜：瀑布花海",pk:[3,5],hist:["03-15","03-12","03-18"],mfw:"黄果树"},
  {id:356,n:"铜仁·梵净山",sp:"杜鹃花",lat:27.90,lon:108.68,th:320,s:"spring",c:"#e04070",rg:"西南",po:"梵净山上杜鹃红",tp:"宜：佛光赏花",pk:[4,5],hist:["04-22","04-20","04-28"],mfw:"梵净山"},
  // 陕西
  {id:357,n:"宝鸡·太白山",sp:"杜鹃花",lat:33.97,lon:107.77,th:320,s:"spring",c:"#e04070",rg:"西北",po:"太白杜鹃映皑雪",tp:"宜：雪山赏花",pk:[5,6],hist:["05-15","05-12","05-18"],mfw:"太白山"},
  {id:358,n:"咸阳·乾陵",sp:"银杏",lat:34.55,lon:108.22,th:388,s:"autumn",c:"#e8c840",rg:"西北",po:"乾陵银杏满皇道",tp:"十月古陵",pk:[10,11],hist:["10-22","10-18","10-25"],mfw:"乾陵"},
  // 甘肃
  {id:359,n:"陇南·官鹅沟",sp:"红枫",lat:33.85,lon:104.55,th:370,s:"autumn",c:"#d04030",rg:"西北",po:"官鹅秋色如画卷",tp:"十月赏秋",pk:[10,10],hist:["10-15","10-12","10-18"],mfw:"官鹅沟"},
  // 内蒙古
  {id:360,n:"赤峰·乌兰布统",sp:"野花草甸",lat:42.63,lon:117.05,th:370,s:"summer",c:"#80c868",rg:"华北",po:"草原花海接天涯",tp:"七月花海",pk:[7,8],hist:["07-10","07-08","07-15"],mfw:"乌兰布统"},
  {id:361,n:"鄂尔多斯·响沙湾",sp:"沙漠花",lat:40.02,lon:110.00,th:400,s:"summer",c:"#f0d040",rg:"华北",po:"大漠孤烟花如金",tp:"七月沙漠花",pk:[7,7],hist:["07-05","07-02","07-08"],mfw:"响沙湾"},
  {id:362,n:"包头·赛汗塔拉",sp:"格桑花",lat:40.65,lon:110.00,th:360,s:"summer",c:"#e060a0",rg:"华北",po:"鹿城草原格桑开",tp:"七月赏花",pk:[7,8],hist:["07-12","07-08","07-15"],mfw:"赛汗塔拉"},
  {id:363,n:"锡林郭勒·草原",sp:"野花草甸",lat:43.95,lon:116.08,th:365,s:"summer",c:"#80c868",rg:"华北",po:"锡林草原百花开",tp:"七月草原",pk:[7,8],hist:["07-08","07-05","07-12"],mfw:"锡林郭勒草原"},
  // 辽宁
  {id:364,n:"锦州·笔架山",sp:"樱花",lat:40.82,lon:121.08,th:300,s:"spring",c:"#ffb7c5",rg:"东北",po:"笔架山畔樱花开",tp:"宜：海滨赏樱",pk:[4,5],hist:["04-18","04-15","04-22"],mfw:"笔架山"},
  {id:365,n:"营口·熊岳",sp:"梨花",lat:40.25,lon:122.23,th:278,s:"spring",c:"#d8ccc0",rg:"东北",po:"熊岳温泉梨花白",tp:"宜：温泉赏花",pk:[4,5],hist:["04-20","04-18","04-25"],mfw:"熊岳"},
  // 吉林
  {id:366,n:"通化·龙湾",sp:"杜鹃花",lat:42.00,lon:126.08,th:315,s:"spring",c:"#e04070",rg:"东北",po:"龙湾杜鹃映火山",tp:"宜：五月花海",pk:[5,5],hist:["05-08","05-05","05-12"],mfw:"龙湾群"},
  // 黑龙江
  {id:367,n:"伊春·小兴安岭",sp:"杜鹃花",lat:47.73,lon:128.90,th:320,s:"spring",c:"#e04070",rg:"东北",po:"兴安杜鹃映林海",tp:"宜：五月花海",pk:[5,6],hist:["05-18","05-15","05-22"],mfw:"伊春杜鹃"},
  {id:368,n:"佳木斯·三江平原",sp:"野花草甸",lat:46.80,lon:130.37,th:380,s:"summer",c:"#80c868",rg:"东北",po:"三江平原花如海",tp:"七月花海",pk:[7,8],hist:["07-10","07-08","07-15"],mfw:"三江平原"},
  // 新疆
  {id:369,n:"喀什·塔什库尔干",sp:"杏花",lat:37.77,lon:75.23,th:240,s:"spring",c:"#f0b8c0",rg:"西北",po:"帕米尔高原杏花村",tp:"宜：最美杏花",pk:[3,4],hist:["03-28","03-25","04-02"],mfw:"塔什库尔干杏花"},
  {id:370,n:"阿勒泰·白哈巴",sp:"白桦林",lat:48.65,lon:86.85,th:348,s:"autumn",c:"#e0a828",rg:"西北",po:"白哈巴白桦金如画",tp:"九月童话",pk:[9,10],hist:["09-15","09-12","09-18"],mfw:"白哈巴村"},
  // 西藏
  {id:371,n:"山南·雅拉香布",sp:"格桑花",lat:29.23,lon:91.77,th:340,s:"summer",c:"#e060a0",rg:"西藏",po:"雅拉草甸格桑遍",tp:"七月花海",pk:[7,8],hist:["07-15","07-12","07-18"],mfw:"山南"},
  {id:372,n:"昌都·然乌湖",sp:"桃花",lat:29.45,lon:96.83,th:310,s:"spring",c:"#f8a0b0",rg:"西藏",po:"然乌湖畔桃花开",tp:"宜：冰湖桃花",pk:[4,4],hist:["04-10","04-08","04-15"],mfw:"然乌湖"},
  // ── 第六批：26种新花种 + 更多城市 ──
  // 向日葵
  {id:380,n:"北京·奥森向日葵",sp:"向日葵",lat:40.02,lon:116.40,th:550,s:"summer",c:"#f0a020",rg:"华北",po:"奥森向日葵金灿灿",tp:"七月花海",pk:[7,8],hist:["07-15","07-12","07-18"],mfw:"奥林匹克森林公园"},
  {id:381,n:"张北·草原天路",sp:"向日葵",lat:41.15,lon:114.70,th:520,s:"summer",c:"#f0a020",rg:"华北",po:"草原天路向日葵海",tp:"八月最美",pk:[7,8],hist:["07-20","07-18","07-25"],mfw:"草原天路"},
  // 紫藤
  {id:382,n:"苏州·留园",sp:"紫藤",lat:31.31,lon:120.60,th:300,s:"spring",c:"#9868c0",rg:"华东",po:"留园紫藤如瀑布",tp:"宜：四月花帘",pk:[4,4],hist:["04-10","04-08","04-15"],mfw:"留园"},
  {id:383,n:"嘉定·紫藤园",sp:"紫藤",lat:31.39,lon:121.27,th:295,s:"spring",c:"#9868c0",rg:"华东",po:"嘉定紫藤花瀑布",tp:"宜：四月如梦",pk:[4,4],hist:["04-08","04-05","04-12"],mfw:"嘉定紫藤园"},
  // 木棉花
  {id:384,n:"广州·陵园西路",sp:"木棉花",lat:23.13,lon:113.28,th:220,s:"spring",c:"#e83020",rg:"华南",po:"英雄花开满珠江",tp:"宜：三月红棉",pk:[3,3],hist:["03-05","03-02","03-08"],mfw:"广州木棉花"},
  {id:385,n:"攀枝花·攀枝花公园",sp:"木棉花",lat:26.58,lon:101.72,th:200,s:"spring",c:"#e83020",rg:"西南",po:"攀枝花市因花得名",tp:"宜：二月红棉",pk:[2,3],hist:["02-15","02-12","02-18"],mfw:"攀枝花公园"},
  // 玉兰花
  {id:386,n:"上海·辰山玉兰",sp:"玉兰花",lat:31.08,lon:121.18,th:250,s:"spring",c:"#f0e8f0",rg:"华东",po:"辰山玉兰白如玉",tp:"宜：三月初春",pk:[3,3],hist:["03-08","03-05","03-12"],mfw:"辰山植物园"},
  {id:387,n:"南京·朝天宫",sp:"玉兰花",lat:32.04,lon:118.77,th:255,s:"spring",c:"#f0e8f0",rg:"华东",po:"朝天宫前玉兰开",tp:"宜：古殿赏花",pk:[3,3],hist:["03-10","03-08","03-15"],mfw:"朝天宫"},
  // 月季
  {id:388,n:"北京·月季园",sp:"月季",lat:39.87,lon:116.42,th:400,s:"spring",c:"#e06080",rg:"华北",po:"天坛月季五月红",tp:"宜：五月花展",pk:[5,6],hist:["05-10","05-08","05-15"],mfw:"天坛月季园"},
  {id:389,n:"南阳·月季博览园",sp:"月季",lat:33.00,lon:112.53,th:380,s:"spring",c:"#e06080",rg:"华中",po:"南阳月季甲天下",tp:"宜：月季花城",pk:[4,5],hist:["04-25","04-22","04-28"],mfw:"月季博览园"},
  // 海棠花
  {id:390,n:"北京·元大都",sp:"海棠花",lat:39.96,lon:116.40,th:290,s:"spring",c:"#f0a0a0",rg:"华北",po:"元大都海棠花溪",tp:"宜：四月花溪",pk:[4,4],hist:["04-05","04-02","04-08"],mfw:"元大都海棠花溪"},
  {id:391,n:"苏州·怡园",sp:"海棠花",lat:31.30,lon:120.62,th:285,s:"spring",c:"#f0a0a0",rg:"华东",po:"怡园海棠春似海",tp:"宜：古园赏花",pk:[3,4],hist:["03-28","03-25","04-02"],mfw:"怡园"},
  // 水仙花
  {id:392,n:"漳州·龙海",sp:"水仙花",lat:24.45,lon:117.82,th:150,s:"winter",c:"#f8f0a0",rg:"华东",po:"凌波仙子水仙花",tp:"一月水仙",pk:[1,2],hist:["01-20","01-18","01-25"],mfw:"漳州水仙花"},
  // 芦花
  {id:393,n:"杭州·西溪湿地",sp:"芦花",lat:30.27,lon:120.05,th:500,s:"autumn",c:"#d8c8a0",rg:"华东",po:"西溪芦花似飞雪",tp:"十一月秋水",pk:[11,11],hist:["11-08","11-05","11-12"],mfw:"西溪湿地"},
  {id:394,n:"崇明·东滩",sp:"芦花",lat:31.52,lon:121.96,th:510,s:"autumn",c:"#d8c8a0",rg:"华东",po:"东滩芦花接天涯",tp:"十一月湿地",pk:[11,12],hist:["11-10","11-08","11-15"],mfw:"东滩湿地"},
  // 紫云英
  {id:395,n:"婺源·江岭",sp:"紫云英",lat:29.36,lon:117.90,th:250,s:"spring",c:"#c080d0",rg:"华东",po:"江岭紫云英如毯",tp:"宜：三月花毯",pk:[3,4],hist:["03-15","03-12","03-18"],mfw:"江岭"},
  // 绣球花
  {id:396,n:"杭州·灵隐",sp:"绣球花",lat:30.24,lon:120.10,th:450,s:"summer",c:"#7090d0",rg:"华东",po:"灵隐寺前绣球蓝",tp:"六月梦幻",pk:[6,7],hist:["06-15","06-12","06-18"],mfw:"灵隐寺绣球花"},
  {id:397,n:"武汉·花博汇",sp:"绣球花",lat:30.40,lon:114.10,th:440,s:"summer",c:"#7090d0",rg:"华中",po:"花博汇绣球花海",tp:"六月花海",pk:[6,7],hist:["06-12","06-10","06-15"],mfw:"花博汇"},
  // 睡莲
  {id:398,n:"西安·曲江池",sp:"睡莲",lat:34.22,lon:108.97,th:600,s:"summer",c:"#f0a0c0",rg:"西北",po:"曲江池中睡莲开",tp:"七月赏莲",pk:[6,8],hist:["06-25","06-22","06-28"],mfw:"曲江池"},
  // 紫薇花
  {id:399,n:"南京·莫愁湖",sp:"紫薇花",lat:32.03,lon:118.76,th:550,s:"summer",c:"#c050a0",rg:"华东",po:"莫愁湖畔紫薇红",tp:"七月盛放",pk:[7,9],hist:["07-15","07-12","07-18"],mfw:"莫愁湖"},
  {id:400,n:"成都·百花潭",sp:"紫薇花",lat:30.65,lon:104.03,th:530,s:"summer",c:"#c050a0",rg:"西南",po:"百花潭中紫薇艳",tp:"七月赏花",pk:[7,9],hist:["07-10","07-08","07-15"],mfw:"百花潭公园"},
  // 合欢花
  {id:401,n:"济南·大明湖合欢",sp:"合欢花",lat:36.68,lon:117.02,th:480,s:"summer",c:"#f0a8c0",rg:"华东",po:"大明湖畔合欢红",tp:"六月合欢",pk:[6,7],hist:["06-20","06-18","06-25"],mfw:"大明湖"},
  // 栀子花
  {id:402,n:"南昌·梅岭",sp:"栀子花",lat:28.75,lon:115.75,th:430,s:"summer",c:"#f8f8e0",rg:"华东",po:"梅岭栀子花满山",tp:"六月清香",pk:[6,6],hist:["06-10","06-08","06-15"],mfw:"梅岭"},
  // 茉莉花
  {id:403,n:"横州·茉莉花都",sp:"茉莉花",lat:22.68,lon:109.27,th:450,s:"summer",c:"#f0f0e0",rg:"华南",po:"茉莉花乡香满城",tp:"六月飘香",pk:[6,8],hist:["06-15","06-12","06-18"],mfw:"横州茉莉花"},
  // 玫瑰
  {id:404,n:"平阴·玫瑰镇",sp:"玫瑰",lat:36.28,lon:116.45,th:380,s:"spring",c:"#e04060",rg:"华东",po:"平阴玫瑰甲天下",tp:"宜：五月花海",pk:[5,6],hist:["05-12","05-10","05-15"],mfw:"平阴玫瑰"},
  {id:405,n:"昆明·安宁",sp:"玫瑰",lat:24.92,lon:102.48,th:350,s:"spring",c:"#e04060",rg:"西南",po:"安宁八街玫瑰谷",tp:"宜：四月花海",pk:[4,5],hist:["04-20","04-18","04-25"],mfw:"安宁玫瑰谷"},
  // 芙蓉花
  {id:406,n:"成都·芙蓉",sp:"芙蓉花",lat:30.57,lon:104.07,th:480,s:"autumn",c:"#f0a0b8",rg:"西南",po:"蓉城芙蓉十月开",tp:"十月市花",pk:[10,10],hist:["10-12","10-10","10-15"],mfw:"成都芙蓉花"},
  // 虞美人
  {id:407,n:"武汉·东湖虞美人",sp:"虞美人",lat:30.55,lon:114.38,th:350,s:"spring",c:"#e06040",rg:"华中",po:"东湖虞美人如锦",tp:"宜：四月花海",pk:[4,5],hist:["04-10","04-08","04-15"],mfw:"东湖磨山"},
  // 波斯菊
  {id:408,n:"昆明·斗南",sp:"波斯菊",lat:24.88,lon:102.75,th:380,s:"autumn",c:"#f080a0",rg:"西南",po:"斗南花田波斯菊",tp:"十月花海",pk:[9,11],hist:["10-05","10-02","10-08"],mfw:"斗南花市"},
  // 鸡蛋花
  {id:409,n:"三亚·天涯",sp:"鸡蛋花",lat:18.25,lon:109.32,th:500,s:"summer",c:"#f8e870",rg:"华南",po:"天涯海角鸡蛋花",tp:"全年可赏",pk:[5,10],hist:["05-15","05-12","05-18"],mfw:"天涯海角"},
  // 凌霄花
  {id:410,n:"苏州·网师园",sp:"凌霄花",lat:31.29,lon:120.63,th:480,s:"summer",c:"#e07030",rg:"华东",po:"网师园中凌霄红",tp:"七月攀缘",pk:[7,8],hist:["07-08","07-05","07-12"],mfw:"网师园"},
  // 木槿花
  {id:411,n:"郑州·碧沙岗木槿",sp:"木槿花",lat:34.76,lon:113.63,th:470,s:"summer",c:"#c070b0",rg:"华中",po:"碧沙岗木槿如云",tp:"七月盛放",pk:[7,8],hist:["07-12","07-10","07-15"],mfw:"碧沙岗公园"},
  // 石榴花
  {id:412,n:"枣庄·冠世榴园",sp:"石榴花",lat:34.82,lon:117.33,th:420,s:"summer",c:"#e83830",rg:"华东",po:"冠世榴园石榴红",tp:"五月花开",pk:[5,6],hist:["05-18","05-15","05-22"],mfw:"冠世榴园"},
  // 蔷薇
  {id:413,n:"无锡·蠡湖",sp:"蔷薇",lat:31.50,lon:120.28,th:380,s:"spring",c:"#f090a0",rg:"华东",po:"蠡湖蔷薇爬满墙",tp:"宜：五月花墙",pk:[5,5],hist:["05-05","05-02","05-08"],mfw:"蠡湖"},
  // 百合
  {id:414,n:"延庆·百里画廊",sp:"百合",lat:40.46,lon:115.97,th:420,s:"summer",c:"#f8f0e0",rg:"华北",po:"百里画廊百合香",tp:"七月花谷",pk:[7,7],hist:["07-08","07-05","07-12"],mfw:"百里画廊"},
  // 迎春花
  {id:415,n:"北京·紫竹院",sp:"迎春花",lat:39.94,lon:116.32,th:160,s:"spring",c:"#f0d040",rg:"华北",po:"紫竹院迎春第一枝",tp:"宜：二月报春",pk:[2,3],hist:["02-25","02-22","02-28"],mfw:"紫竹院"},
  {id:416,n:"济南·百花洲",sp:"迎春花",lat:36.67,lon:117.01,th:165,s:"spring",c:"#f0d040",rg:"华东",po:"百花洲迎春报早",tp:"宜：二月泉城",pk:[2,3],hist:["02-28","02-25","03-03"],mfw:"百花洲"},
  // ── 更多城市补全 ──
  // 河北
  {id:417,n:"唐山·南湖",sp:"荷花",lat:39.60,lon:118.20,th:645,s:"summer",c:"#f080a0",rg:"华北",po:"南湖荷花映工业",tp:"七月赏荷",pk:[7,8],hist:["07-10","07-08","07-15"],mfw:"南湖公园"},
  {id:418,n:"邯郸·丛台",sp:"月季",lat:36.62,lon:114.50,th:385,s:"spring",c:"#e06080",rg:"华北",po:"丛台月季满城开",tp:"五月花展",pk:[5,6],hist:["05-08","05-05","05-12"],mfw:"丛台公园"},
  // 淄博
  {id:419,n:"淄博·聊斋园",sp:"牡丹",lat:36.80,lon:118.05,th:325,s:"spring",c:"#e868a0",rg:"华东",po:"聊斋园中牡丹妖",tp:"宜：四月赏花",pk:[4,5],hist:["04-15","04-12","04-18"],mfw:"聊斋园"},
  // 莆田
  {id:420,n:"莆田·湄洲岛",sp:"三角梅",lat:25.08,lon:119.07,th:258,s:"spring",c:"#e040a0",rg:"华东",po:"湄洲岛上花满崖",tp:"全年可赏",pk:[2,5],hist:["03-08","03-05","03-12"],mfw:"湄洲岛"},
  // 汕头
  {id:421,n:"汕头·礐石",sp:"三角梅",lat:23.35,lon:116.72,th:252,s:"spring",c:"#e040a0",rg:"华南",po:"礐石三角梅如锦",tp:"全年可赏",pk:[2,5],hist:["03-05","03-02","03-08"],mfw:"礐石"},
  // 自贡
  {id:422,n:"自贡·西秦会馆",sp:"蔷薇",lat:29.35,lon:104.78,th:375,s:"spring",c:"#f090a0",rg:"西南",po:"盐都蔷薇满院墙",tp:"宜：五月花墙",pk:[5,5],hist:["05-02","04-28","05-05"],mfw:"西秦会馆"},
  // 南充
  {id:423,n:"南充·阆中",sp:"桃花",lat:31.58,lon:105.97,th:262,s:"spring",c:"#f8a0b0",rg:"西南",po:"阆中古城桃花红",tp:"宜：古城探春",pk:[3,3],hist:["03-12","03-10","03-15"],mfw:"阆中古城"},
  // 眉山
  {id:424,n:"眉山·丹棱",sp:"梅花",lat:30.01,lon:103.52,th:195,s:"spring",c:"#f0d0d8",rg:"西南",po:"丹棱梅花老林深",tp:"宜：探梅访幽",pk:[2,3],hist:["02-08","02-05","02-12"],mfw:"丹棱老峨山"},
  // 黔南
  {id:425,n:"荔波·小七孔",sp:"杜鹃花",lat:25.30,lon:107.78,th:288,s:"spring",c:"#e04070",rg:"西南",po:"小七孔杜鹃映碧水",tp:"宜：瀑布赏花",pk:[3,4],hist:["03-22","03-20","03-28"],mfw:"小七孔"},
  // 黔东南
  {id:426,n:"西江·千户苗寨",sp:"油菜花",lat:26.50,lon:108.32,th:248,s:"spring",c:"#e8c840",rg:"西南",po:"苗寨梯田金花海",tp:"宜：苗乡花事",pk:[3,4],hist:["03-15","03-12","03-18"],mfw:"千户苗寨"},
  // 渭南
  {id:427,n:"渭南·华山",sp:"杜鹃花",lat:34.48,lon:110.08,th:315,s:"spring",c:"#e04070",rg:"西北",po:"华山杜鹃映险峰",tp:"宜：五月花海",pk:[5,5],hist:["05-08","05-05","05-12"],mfw:"华山"},
  // 安康
  {id:428,n:"安康·瀛湖",sp:"紫薇花",lat:32.68,lon:109.03,th:540,s:"summer",c:"#c050a0",rg:"西北",po:"瀛湖紫薇满山坡",tp:"七月盛放",pk:[7,8],hist:["07-15","07-12","07-18"],mfw:"瀛湖"},
  // 通辽
  {id:429,n:"通辽·大青沟",sp:"野花草甸",lat:43.50,lon:122.50,th:370,s:"summer",c:"#80c868",rg:"华北",po:"大青沟花海无边",tp:"七月草原",pk:[7,8],hist:["07-10","07-08","07-15"],mfw:"大青沟"},
  // 和田
  {id:430,n:"和田·玉龙喀什河",sp:"胡杨",lat:37.10,lon:79.92,th:365,s:"autumn",c:"#d8a030",rg:"西北",po:"和田胡杨金如画",tp:"十月秋色",pk:[10,10],hist:["10-10","10-08","10-15"],mfw:"和田胡杨"},
  // 阿克苏
  {id:431,n:"阿克苏·温宿",sp:"杏花",lat:41.27,lon:80.24,th:248,s:"spring",c:"#f0b8c0",rg:"西北",po:"温宿杏花满天山",tp:"宜：三月花海",pk:[3,4],hist:["03-25","03-22","03-28"],mfw:"温宿杏花"},
  // 塔城
  {id:432,n:"塔城·裕民",sp:"芍药",lat:46.20,lon:82.98,th:380,s:"spring",c:"#f080b0",rg:"西北",po:"裕民芍药万亩红",tp:"宜：六月花海",pk:[5,6],hist:["05-25","05-22","05-28"],mfw:"裕民芍药谷"},
  // 玉树
  {id:433,n:"玉树·隆宝",sp:"格桑花",lat:33.00,lon:96.73,th:340,s:"summer",c:"#e060a0",rg:"西藏",po:"隆宝湿地格桑遍",tp:"七月花甸",pk:[7,8],hist:["07-18","07-15","07-22"],mfw:"隆宝湿地"},
  // 葫芦岛
  {id:434,n:"葫芦岛·兴城",sp:"梨花",lat:40.62,lon:120.73,th:275,s:"spring",c:"#d8ccc0",rg:"东北",po:"兴城古城梨花白",tp:"宜：古城探春",pk:[4,5],hist:["04-22","04-20","04-25"],mfw:"兴城古城"},
  // 四平
  {id:435,n:"四平·叶赫",sp:"梨花",lat:42.90,lon:125.30,th:278,s:"spring",c:"#d8ccc0",rg:"东北",po:"叶赫梨花如白雪",tp:"宜：五月梨花",pk:[5,5],hist:["05-05","05-02","05-08"],mfw:"叶赫古城"},
  // ── 第七批：大规模补全 ──
  // 河北
  {id:440,n:"廊坊·固安",sp:"樱花",lat:39.44,lon:116.30,th:288,s:"spring",c:"#ffb7c5",rg:"华北",po:"固安樱花林如画",tp:"宜：京南赏樱",pk:[4,4],hist:["04-05","04-02","04-08"],mfw:"固安"},
  {id:441,n:"沧州·铁狮子",sp:"梨花",lat:38.30,lon:116.84,th:272,s:"spring",c:"#d8ccc0",rg:"华北",po:"沧州梨花满运河",tp:"宜：运河探春",pk:[4,4],hist:["04-05","04-02","04-08"],mfw:"沧州"},
  {id:442,n:"邢台·天河山",sp:"桃花",lat:37.07,lon:114.50,th:278,s:"spring",c:"#f8a0b0",rg:"华北",po:"天河山桃花如霞",tp:"宜：牛郎织女故里",pk:[4,4],hist:["04-08","04-05","04-12"],mfw:"天河山"},
  // 山西
  {id:443,n:"运城·解州",sp:"桃花",lat:35.03,lon:111.00,th:275,s:"spring",c:"#f8a0b0",rg:"华北",po:"关公故里桃花红",tp:"宜：盐湖赏春",pk:[4,4],hist:["04-05","04-02","04-08"],mfw:"解州关帝庙"},
  {id:444,n:"长治·太行",sp:"红枫",lat:36.20,lon:113.10,th:365,s:"autumn",c:"#d04030",rg:"华北",po:"太行红叶满峡谷",tp:"十月秋色",pk:[10,10],hist:["10-12","10-10","10-15"],mfw:"太行山大峡谷"},
  {id:445,n:"晋中·平遥",sp:"银杏",lat:37.19,lon:112.18,th:383,s:"autumn",c:"#e8c840",rg:"华北",po:"平遥古城银杏黄",tp:"十月古城",pk:[10,11],hist:["10-18","10-15","10-22"],mfw:"平遥古城"},
  // 山东
  {id:446,n:"聊城·东昌湖",sp:"荷花",lat:36.45,lon:115.98,th:640,s:"summer",c:"#f080a0",rg:"华东",po:"东昌湖畔荷花香",tp:"七月赏荷",pk:[7,8],hist:["07-08","07-05","07-12"],mfw:"东昌湖"},
  {id:447,n:"德州·减河",sp:"向日葵",lat:37.45,lon:116.30,th:530,s:"summer",c:"#f0a020",rg:"华东",po:"减河向日葵花海",tp:"八月花海",pk:[7,8],hist:["07-18","07-15","07-22"],mfw:"减河湿地"},
  // 河南
  {id:448,n:"焦作·云台山",sp:"红枫",lat:35.40,lon:113.38,th:370,s:"autumn",c:"#d04030",rg:"华中",po:"云台秋色满峡谷",tp:"十月赏秋",pk:[10,11],hist:["10-22","10-18","10-25"],mfw:"云台山"},
  {id:449,n:"新乡·万仙山",sp:"杜鹃花",lat:35.72,lon:113.65,th:310,s:"spring",c:"#e04070",rg:"华中",po:"万仙山杜鹃映绝壁",tp:"宜：绝壁赏花",pk:[4,5],hist:["04-18","04-15","04-22"],mfw:"万仙山"},
  {id:450,n:"安阳·殷墟",sp:"银杏",lat:36.12,lon:114.30,th:385,s:"autumn",c:"#e8c840",rg:"华中",po:"殷墟银杏三千年",tp:"十月古都",pk:[10,11],hist:["10-18","10-15","10-22"],mfw:"殷墟"},
  // 湖北
  {id:451,n:"荆州·荆州古城",sp:"荷花",lat:30.35,lon:112.24,th:635,s:"summer",c:"#f080a0",rg:"华中",po:"荆州护城河荷满",tp:"七月古城",pk:[7,8],hist:["07-05","07-02","07-08"],mfw:"荆州古城"},
  {id:452,n:"黄冈·黄梅",sp:"梅花",lat:30.07,lon:115.94,th:205,s:"spring",c:"#f0d0d8",rg:"华中",po:"黄梅时节梅花开",tp:"宜：禅宗祖地",pk:[2,3],hist:["02-12","02-10","02-15"],mfw:"黄梅"},
  {id:453,n:"咸宁·潜山",sp:"桂花",lat:29.85,lon:114.32,th:358,s:"autumn",c:"#f0c848",rg:"华中",po:"咸宁桂花之乡",tp:"九月飘香",pk:[9,10],hist:["09-22","09-18","09-25"],mfw:"咸宁桂花"},
  // 湖南
  {id:454,n:"郴州·莽山",sp:"杜鹃花",lat:24.98,lon:112.95,th:295,s:"spring",c:"#e04070",rg:"华中",po:"莽山杜鹃映云海",tp:"宜：高山花海",pk:[4,5],hist:["04-15","04-12","04-18"],mfw:"莽山"},
  {id:455,n:"永州·九嶷山",sp:"杜鹃花",lat:25.35,lon:111.95,th:300,s:"spring",c:"#e04070",rg:"华中",po:"九嶷杜鹃舜帝陵",tp:"宜：四月花海",pk:[4,5],hist:["04-12","04-10","04-15"],mfw:"九嶷山"},
  // 安徽
  {id:456,n:"安庆·天柱山",sp:"杜鹃花",lat:30.73,lon:116.57,th:308,s:"spring",c:"#e04070",rg:"华东",po:"天柱杜鹃映奇峰",tp:"宜：登山赏花",pk:[4,5],hist:["04-20","04-18","04-25"],mfw:"天柱山"},
  {id:457,n:"蚌埠·龙子湖",sp:"荷花",lat:32.95,lon:117.38,th:642,s:"summer",c:"#f080a0",rg:"华东",po:"龙子湖畔荷花香",tp:"七月赏荷",pk:[7,8],hist:["07-08","07-05","07-12"],mfw:"龙子湖"},
  {id:458,n:"宣城·敬亭山",sp:"桂花",lat:30.95,lon:118.75,th:358,s:"autumn",c:"#f0c848",rg:"华东",po:"相看两不厌敬亭山",tp:"九月桂香",pk:[9,10],hist:["09-25","09-22","09-28"],mfw:"敬亭山"},
  // 江西
  {id:459,n:"宜春·明月山",sp:"杜鹃花",lat:27.60,lon:114.57,th:305,s:"spring",c:"#e04070",rg:"华东",po:"明月山杜鹃映云",tp:"宜：云中花海",pk:[4,5],hist:["04-18","04-15","04-22"],mfw:"明月山"},
  {id:460,n:"吉安·井冈山",sp:"杜鹃花",lat:26.58,lon:114.17,th:290,s:"spring",c:"#e04070",rg:"华东",po:"井冈杜鹃红似火",tp:"宜：革命圣地",pk:[4,5],hist:["04-15","04-12","04-18"],mfw:"井冈山"},
  // 福建
  {id:461,n:"宁德·太姥山",sp:"杜鹃花",lat:27.18,lon:120.15,th:300,s:"spring",c:"#e04070",rg:"华东",po:"太姥杜鹃映海天",tp:"宜：四月花海",pk:[4,5],hist:["04-12","04-10","04-15"],mfw:"太姥山"},
  // 广东
  {id:462,n:"江门·小鸟天堂",sp:"木棉花",lat:22.60,lon:113.08,th:218,s:"spring",c:"#e83020",rg:"华南",po:"小鸟天堂木棉红",tp:"宜：三月红棉",pk:[3,3],hist:["03-05","03-02","03-08"],mfw:"小鸟天堂"},
  {id:463,n:"潮州·广济桥",sp:"三角梅",lat:23.67,lon:116.63,th:255,s:"spring",c:"#e040a0",rg:"华南",po:"广济桥畔花如锦",tp:"全年可赏",pk:[2,5],hist:["03-05","03-02","03-08"],mfw:"广济桥"},
  {id:464,n:"河源·万绿湖",sp:"杜鹃花",lat:23.73,lon:114.68,th:250,s:"spring",c:"#e04070",rg:"华南",po:"万绿湖畔杜鹃红",tp:"宜：三月花海",pk:[3,4],hist:["03-12","03-10","03-15"],mfw:"万绿湖"},
  // 广西
  {id:465,n:"河池·凤山",sp:"油菜花",lat:24.55,lon:107.05,th:245,s:"spring",c:"#e8c840",rg:"华南",po:"凤山天坑油菜金",tp:"宜：天坑花海",pk:[2,3],hist:["02-25","02-22","03-02"],mfw:"凤山"},
  {id:466,n:"贺州·黄姚",sp:"桃花",lat:24.40,lon:111.25,th:248,s:"spring",c:"#f8a0b0",rg:"华南",po:"黄姚古镇桃花红",tp:"宜：古镇探春",pk:[2,3],hist:["02-18","02-15","02-22"],mfw:"黄姚古镇"},
  {id:467,n:"梧州·骑楼城",sp:"三角梅",lat:23.47,lon:111.28,th:252,s:"spring",c:"#e040a0",rg:"华南",po:"骑楼城下花满墙",tp:"全年可赏",pk:[2,5],hist:["03-05","03-02","03-08"],mfw:"梧州骑楼"},
  // 云南
  {id:468,n:"文山·普者黑",sp:"荷花",lat:24.22,lon:104.15,th:600,s:"summer",c:"#f080a0",rg:"西南",po:"普者黑万亩荷花",tp:"七月花海",pk:[7,8],hist:["07-05","07-02","07-08"],mfw:"普者黑"},
  {id:469,n:"红河·元阳",sp:"油菜花",lat:23.22,lon:102.83,th:235,s:"spring",c:"#e8c840",rg:"西南",po:"哈尼梯田油菜金",tp:"宜：梯田花海",pk:[2,3],hist:["02-20","02-18","02-25"],mfw:"元阳梯田"},
  {id:470,n:"德宏·芒市",sp:"三角梅",lat:24.43,lon:98.57,th:255,s:"spring",c:"#e040a0",rg:"西南",po:"芒市三角梅如海",tp:"全年可赏",pk:[1,5],hist:["02-05","02-02","02-08"],mfw:"芒市"},
  // 四川
  {id:471,n:"广元·曾家山",sp:"杜鹃花",lat:32.43,lon:105.85,th:310,s:"spring",c:"#e04070",rg:"西南",po:"曾家山杜鹃漫山",tp:"宜：四月花海",pk:[4,5],hist:["04-20","04-18","04-25"],mfw:"曾家山"},
  {id:472,n:"达州·大巴山",sp:"杜鹃花",lat:31.72,lon:108.23,th:305,s:"spring",c:"#e04070",rg:"西南",po:"大巴山杜鹃红遍",tp:"宜：四月花海",pk:[4,5],hist:["04-15","04-12","04-18"],mfw:"大巴山"},
  {id:473,n:"内江·隆昌",sp:"荷花",lat:29.35,lon:105.28,th:620,s:"summer",c:"#f080a0",rg:"西南",po:"隆昌荷花满古寨",tp:"七月赏荷",pk:[7,8],hist:["07-05","07-02","07-08"],mfw:"隆昌古牌坊"},
  // 贵州
  {id:474,n:"六盘水·乌蒙",sp:"杜鹃花",lat:26.60,lon:104.83,th:290,s:"spring",c:"#e04070",rg:"西南",po:"乌蒙杜鹃映云海",tp:"宜：三月花海",pk:[3,4],hist:["03-25","03-22","03-28"],mfw:"乌蒙大草原"},
  // 甘肃
  {id:475,n:"武威·雷台",sp:"油菜花",lat:37.93,lon:102.63,th:420,s:"summer",c:"#f0d040",rg:"西北",po:"马踏飞燕花海旁",tp:"七月花海",pk:[7,7],hist:["07-08","07-05","07-12"],mfw:"雷台"},
  {id:476,n:"平凉·崆峒山",sp:"杜鹃花",lat:35.55,lon:106.55,th:315,s:"spring",c:"#e04070",rg:"西北",po:"崆峒山上杜鹃红",tp:"宜：道山赏花",pk:[5,5],hist:["05-05","05-02","05-08"],mfw:"崆峒山"},
  // 宁夏
  {id:477,n:"固原·火石寨",sp:"丁香花",lat:36.00,lon:106.22,th:365,s:"spring",c:"#c090d0",rg:"西北",po:"火石寨丁香满谷",tp:"宜：五月花海",pk:[5,6],hist:["05-15","05-12","05-18"],mfw:"火石寨"},
  // 青海
  {id:478,n:"海东·循化",sp:"杏花",lat:35.85,lon:102.49,th:250,s:"spring",c:"#f0b8c0",rg:"西北",po:"循化杏花满撒拉",tp:"宜：四月花海",pk:[4,4],hist:["04-05","04-02","04-08"],mfw:"循化"},
  // 内蒙古
  {id:479,n:"兴安盟·阿尔山",sp:"杜鹃花",lat:47.17,lon:119.94,th:320,s:"spring",c:"#e04070",rg:"华北",po:"兴安杜鹃映残雪",tp:"宜：五月花海",pk:[5,6],hist:["05-15","05-12","05-20"],mfw:"阿尔山杜鹃"},
  {id:480,n:"阿拉善·额济纳",sp:"胡杨",lat:41.95,lon:101.07,th:370,s:"autumn",c:"#d8a030",rg:"西北",po:"千年胡杨三千年",tp:"十月金林",pk:[10,10],hist:["10-08","10-05","10-12"],mfw:"额济纳胡杨"},
  // 辽宁
  {id:481,n:"朝阳·凤凰山",sp:"杜鹃花",lat:41.58,lon:120.45,th:310,s:"spring",c:"#e04070",rg:"东北",po:"凤凰山杜鹃映古塔",tp:"宜：五月花海",pk:[5,5],hist:["05-05","05-02","05-08"],mfw:"凤凰山"},
  {id:482,n:"盘锦·红海滩",sp:"芦花",lat:41.00,lon:121.93,th:510,s:"autumn",c:"#d8c8a0",rg:"东北",po:"红海滩芦花如雪",tp:"十月秋水",pk:[10,10],hist:["10-08","10-05","10-12"],mfw:"红海滩"},
  {id:483,n:"抚顺·赫图阿拉",sp:"梨花",lat:41.87,lon:124.38,th:280,s:"spring",c:"#d8ccc0",rg:"东北",po:"满清发源地梨花白",tp:"宜：五月梨花",pk:[5,5],hist:["05-08","05-05","05-12"],mfw:"赫图阿拉城"},
  // 吉林
  {id:484,n:"白山·长白山",sp:"高山杜鹃",lat:42.05,lon:128.07,th:330,s:"spring",c:"#d84070",rg:"东北",po:"长白高山杜鹃红",tp:"宜：六月花海",pk:[6,6],hist:["06-10","06-08","06-15"],mfw:"长白山杜鹃"},
  // 黑龙江
  {id:485,n:"绥化·兰西",sp:"向日葵",lat:46.25,lon:126.30,th:525,s:"summer",c:"#f0a020",rg:"东北",po:"兰西向日葵花海",tp:"八月花海",pk:[8,8],hist:["08-05","08-02","08-08"],mfw:"兰西"},
  {id:486,n:"黑河·五大连池",sp:"芍药",lat:48.75,lon:126.15,th:385,s:"spring",c:"#f080b0",rg:"东北",po:"五大连池芍药香",tp:"宜：六月花海",pk:[6,6],hist:["06-15","06-12","06-18"],mfw:"五大连池"},
  // 新疆
  {id:487,n:"巴州·库尔勒",sp:"梨花",lat:41.77,lon:86.15,th:265,s:"spring",c:"#d8ccc0",rg:"西北",po:"库尔勒香梨花白",tp:"宜：四月花海",pk:[4,4],hist:["04-08","04-05","04-12"],mfw:"库尔勒"},
  {id:488,n:"昌吉·天山",sp:"薰衣草",lat:43.80,lon:87.30,th:505,s:"summer",c:"#9070b0",rg:"西北",po:"天山北麓薰衣草",tp:"六月花海",pk:[6,7],hist:["06-15","06-12","06-18"],mfw:"昌吉"},
  // 西藏
  {id:489,n:"阿里·札达",sp:"格桑花",lat:31.47,lon:79.67,th:335,s:"summer",c:"#e060a0",rg:"西藏",po:"札达土林格桑遍",tp:"八月花甸",pk:[7,8],hist:["07-25","07-22","07-28"],mfw:"札达"},
  // ── 第八批：台湾 + 南海 + 新花种 ──
  // 台湾
  {id:500,n:"台北·阳明山",sp:"樱花",lat:25.16,lon:121.54,th:260,s:"spring",c:"#ffb7c5",rg:"台湾",po:"阳明樱花满山开",tp:"宜：二月赏樱",pk:[2,3],hist:["02-20","02-18","02-25"],mfw:"阳明山"},
  {id:501,n:"台北·士林官邸",sp:"玫瑰",lat:25.09,lon:121.53,th:360,s:"spring",c:"#e04060",rg:"台湾",po:"士林玫瑰花展开",tp:"宜：三月花展",pk:[3,4],hist:["03-15","03-12","03-18"],mfw:"士林官邸"},
  {id:502,n:"台中·武陵农场",sp:"樱花",lat:24.38,lon:121.31,th:265,s:"spring",c:"#ffb7c5",rg:"台湾",po:"武陵樱花粉红海",tp:"宜：二月盛放",pk:[2,3],hist:["02-15","02-12","02-20"],mfw:"武陵农场"},
  {id:503,n:"南投·九族文化村",sp:"樱花",lat:23.87,lon:120.94,th:258,s:"spring",c:"#ffb7c5",rg:"台湾",po:"九族樱花夜光华",tp:"宜：夜樱赏花",pk:[2,3],hist:["02-18","02-15","02-22"],mfw:"九族文化村"},
  {id:504,n:"阿里山·神木",sp:"樱花",lat:23.51,lon:120.80,th:250,s:"spring",c:"#ffb7c5",rg:"台湾",po:"阿里山中樱花雨",tp:"宜：三月云雾",pk:[3,4],hist:["03-22","03-20","03-28"],mfw:"阿里山"},
  {id:505,n:"台南·赤崁楼",sp:"凤凰花",lat:22.99,lon:120.20,th:530,s:"summer",c:"#e84030",rg:"台湾",po:"府城凤凰花如火",tp:"宜：六月盛放",pk:[5,7],hist:["05-25","05-22","05-28"],mfw:"赤崁楼"},
  {id:506,n:"高雄·爱河",sp:"紫荆花",lat:22.63,lon:120.30,th:275,s:"spring",c:"#d070b0",rg:"台湾",po:"爱河紫荆映都市",tp:"宜：三月花开",pk:[3,4],hist:["03-15","03-12","03-18"],mfw:"爱河"},
  {id:507,n:"花莲·六十石山",sp:"金针花",lat:23.34,lon:121.40,th:560,s:"summer",c:"#f0a020",rg:"台湾",po:"金针遍野如黄毯",tp:"宜：八月花海",pk:[8,9],hist:["08-15","08-12","08-20"],mfw:"六十石山"},
  {id:508,n:"台东·知本",sp:"蝴蝶兰",lat:22.71,lon:121.06,th:310,s:"spring",c:"#c070c0",rg:"台湾",po:"蝴蝶兰花舞南台",tp:"全年可赏",pk:[2,5],hist:["03-10","03-08","03-15"],mfw:"知本"},
  {id:509,n:"垦丁·鹅銮鼻",sp:"三角梅",lat:21.90,lon:120.85,th:240,s:"spring",c:"#e040a0",rg:"台湾",po:"鹅銮鼻三角梅灿",tp:"全年可赏",pk:[1,5],hist:["02-05","02-02","02-08"],mfw:"鹅銮鼻"},
  {id:510,n:"宜兰·太平山",sp:"樱花",lat:24.51,lon:121.53,th:268,s:"spring",c:"#ffb7c5",rg:"台湾",po:"太平山樱映云霞",tp:"宜：四月晚樱",pk:[3,4],hist:["03-25","03-22","03-28"],mfw:"太平山"},
  // 南海诸岛
  {id:511,n:"三沙·永兴岛",sp:"三角梅",lat:16.83,lon:112.33,th:210,s:"spring",c:"#e040a0",rg:"南海",po:"南海明珠花盛开",tp:"全年可赏",pk:[1,12],hist:["03-01","02-28","03-05"],mfw:"永兴岛"},
  {id:512,n:"西沙·赵述岛",sp:"椰树",lat:16.97,lon:112.28,th:450,s:"summer",c:"#5a8a50",rg:"南海",po:"椰风海韵赵述岛",tp:"全年可赏",pk:[1,12],hist:["03-01","03-01","03-01"],mfw:"赵述岛"},
  {id:513,n:"南沙·永暑礁",sp:"椰树",lat:9.55,lon:112.90,th:480,s:"summer",c:"#5a8a50",rg:"南海",po:"永暑椰林守南疆",tp:"全年可赏",pk:[1,12],hist:["03-01","03-01","03-01"],mfw:"永暑礁"},
  {id:514,n:"中沙·黄岩岛",sp:"椰树",lat:15.13,lon:117.76,th:475,s:"summer",c:"#5a8a50",rg:"南海",po:"黄岩椰影映蓝海",tp:"全年可赏",pk:[1,12],hist:["03-01","03-01","03-01"],mfw:"黄岩岛"},
  // 牵牛花
  {id:515,n:"北京·植物园牵牛",sp:"牵牛花",lat:40.02,lon:116.22,th:520,s:"summer",c:"#8060c0",rg:"华北",po:"牵牛花开满架紫",tp:"宜：夏晨赏花",pk:[6,9],hist:["06-20","06-18","06-25"],mfw:"北京植物园"},
  {id:516,n:"上海·共青森林",sp:"牵牛花",lat:31.32,lon:121.55,th:500,s:"summer",c:"#8060c0",rg:"华东",po:"共青牵牛攀藤架",tp:"宜：夏日清晨",pk:[7,9],hist:["07-10","07-08","07-15"],mfw:"共青森林公园"},
  // 其他新花种
  {id:517,n:"厦门·园博苑",sp:"蓝花楹",lat:24.57,lon:118.03,th:420,s:"spring",c:"#7060c0",rg:"华东",po:"园博蓝花楹似梦",tp:"宜：四月紫云",pk:[4,5],hist:["04-15","04-12","04-18"],mfw:"园博苑"},
  {id:518,n:"昆明·教场中路",sp:"蓝花楹",lat:25.05,lon:102.68,th:395,s:"spring",c:"#7060c0",rg:"西南",po:"教场蓝花楹紫雨",tp:"宜：四月漫步",pk:[3,5],hist:["04-10","04-08","04-15"],mfw:"教场中路"},
  {id:519,n:"福州·金山寺",sp:"茉莉花",lat:26.06,lon:119.30,th:440,s:"summer",c:"#f0f0e0",rg:"华东",po:"金山茉莉满院香",tp:"宜：夏夜品香",pk:[6,8],hist:["06-20","06-18","06-25"],mfw:"金山寺"},
  {id:520,n:"海口·东坡书院",sp:"鸡蛋花",lat:19.95,lon:110.28,th:495,s:"summer",c:"#f8e870",rg:"华南",po:"东坡书院鸡蛋香",tp:"全年可赏",pk:[4,10],hist:["05-10","05-08","05-15"],mfw:"东坡书院"},
  {id:521,n:"西安·大唐芙蓉园",sp:"芙蓉花",lat:34.21,lon:108.97,th:470,s:"autumn",c:"#f0a0b8",rg:"西北",po:"大唐芙蓉映皇城",tp:"十月市花",pk:[9,10],hist:["10-05","10-02","10-08"],mfw:"大唐芙蓉园"},
  {id:522,n:"苏州·狮子林",sp:"紫薇花",lat:31.32,lon:120.62,th:555,s:"summer",c:"#c050a0",rg:"华东",po:"狮子林畔紫薇开",tp:"七月盛放",pk:[7,9],hist:["07-12","07-10","07-18"],mfw:"狮子林"},
  {id:523,n:"北京·植物园月季",sp:"月季",lat:40.00,lon:116.20,th:398,s:"spring",c:"#e06080",rg:"华北",po:"北京月季甲北方",tp:"五月花展",pk:[5,6],hist:["05-15","05-12","05-18"],mfw:"北京植物园月季园"},
  {id:524,n:"杭州·太子湾",sp:"郁金香",lat:30.22,lon:120.13,th:280,s:"spring",c:"#e84060",rg:"华东",po:"太子湾畔郁金香",tp:"宜：三月花海",pk:[3,4],hist:["03-25","03-22","03-28"],mfw:"太子湾公园"},
  {id:525,n:"乌鲁木齐·天山牧场",sp:"紫藤",lat:43.90,lon:87.58,th:320,s:"spring",c:"#9868c0",rg:"西北",po:"天山紫藤映雪峰",tp:"宜：五月花帘",pk:[5,6],hist:["05-18","05-15","05-22"],mfw:"天山牧场"},
];
const FAT={1:325,2:288,3:260,4:295,5:305,6:315,7:340,8:275,9:250,10:305,11:350,12:380,13:310,14:340,15:300,16:295,20:510,21:660,22:430,23:390,24:370,25:640,40:410,41:375,42:375,43:360,44:385,45:395,46:375,60:32,61:125,
  100:285,101:280,102:270,103:300,104:265,105:280,106:200,107:215,108:385,109:395,110:385,111:390,112:405,113:645,114:635,115:275,116:260,117:280,118:295,119:495,120:270,121:200,122:185,
  130:290,131:215,132:400,133:285,134:260,135:210,136:395,137:610,138:245,139:175,140:245,141:585,142:275,143:255,144:205,145:390,146:320,147:295,148:355,149:365,150:390,151:305,152:265,153:280,154:635,155:290,156:335,157:345,158:365,159:235,160:270,161:325,162:320,163:640,164:360,165:200,166:310,167:365,168:270,169:335,170:295,171:255,
  180:385,181:370,182:345,183:375,184:350,185:400,186:380,187:250,188:310,189:283,190:240,191:285,192:415,193:305,194:210,195:330,196:300,197:305,198:280,199:370,200:285,201:290,202:325,203:320,204:290,205:385,206:380,207:345,208:390,209:320,210:335,
  220:365,221:340,222:370,223:360,224:130,225:245,226:555,227:285,228:265,229:310,230:290,231:215,232:325,233:525,234:260,235:295,236:245,237:270,238:485,239:640,240:655,241:345,242:375,243:380,244:235,245:405,246:355,247:435,248:325,249:305,250:300,251:270,252:315,253:445,254:315,255:645,
  260:275,261:375,262:315,263:385,264:320,265:350,266:665,267:205,268:305,269:290,270:280,271:360,272:200,273:365,274:640,275:310,276:265,277:273,278:635,279:645,280:315,281:240,282:250,283:245,284:275,285:255,286:395,287:245,288:295,289:263,290:255,291:260,292:250,293:335,294:265,295:255,296:220,297:415,298:340,299:355,300:335,301:300,302:515,303:205,304:185,305:295,306:265,307:363,308:397,309:260,310:655,311:285,312:305,313:200,314:175,315:365,
  320:290,321:645,322:390,323:310,324:315,325:210,326:305,327:275,328:315,329:270,330:290,331:263,332:645,333:260,334:310,335:315,336:257,337:360,338:310,339:320,340:265,341:300,342:310,343:250,344:255,345:225,346:277,347:293,348:235,349:200,350:250,351:285,352:363,353:295,354:350,355:270,356:325,357:325,358:393,359:375,360:375,361:405,362:365,363:370,364:305,365:283,366:320,367:325,368:385,369:245,370:353,371:345,372:315,
  380:555,381:525,382:305,383:300,384:225,385:205,386:255,387:260,388:405,389:385,390:295,391:290,392:155,393:505,394:515,395:255,396:455,397:445,398:605,399:555,400:535,401:485,402:435,403:455,404:385,405:355,406:485,407:355,408:385,409:505,410:485,411:475,412:425,413:385,414:425,415:165,416:170,417:650,418:390,419:330,420:263,421:257,422:380,423:267,424:200,425:293,426:253,427:320,428:545,429:375,430:370,431:253,432:385,433:345,434:280,435:283,
  440:293,441:277,442:283,443:280,444:370,445:388,446:645,447:535,448:375,449:315,450:390,451:640,452:210,453:363,454:300,455:305,456:313,457:647,458:363,459:310,460:295,461:305,462:223,463:260,464:255,465:250,466:253,467:257,468:605,469:240,470:260,471:315,472:310,473:625,474:295,475:425,476:320,477:370,478:255,479:325,480:375,481:315,482:515,483:285,484:335,485:530,486:390,487:270,488:510,489:340,
  500:265,501:363,502:270,503:263,504:255,505:535,506:280,507:565,508:315,509:245,510:273,511:215,512:455,513:485,514:480,515:525,516:510,517:425,518:400,519:445,520:500,521:475,522:560,523:403,524:285,525:325};

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
    dateStr:predMonth+"月"+predDay+"日"};
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
  if(type==="yangqin")return <svg viewBox="0 0 32 32" width={s} height={s}><g opacity={o}><path d="M5,14 L27,10 L27,22 L5,18 Z" fill="#b08458" stroke="#7a5020" strokeWidth=".5"/>{[0,1,2,3,4,5,6,7].map(i=>(<line key={i} x1={6+i*2.6} y1={14+i*.1} x2={26-i*.1} y2={10+i*.2} stroke="#d0b880" strokeWidth=".3"/>))}<rect x="13" y="22" width="2" height="7" rx="1" fill="#8a6a40"/><rect x="17" y="22" width="2" height="7" rx="1" fill="#8a6a40"/></g></svg>;
  if(type==="ruan")return <svg viewBox="0 0 32 32" width={s} height={s}><g opacity={o}><circle cx="16" cy="20" r="7" fill="#c8a060" stroke="#8a5820" strokeWidth=".6"/><rect x="14.5" y="4" width="3" height="14" rx="1" fill="#a07838"/>{[6,9,12].map(y=>(<line key={y} x1="13" y1={y} x2="19" y2={y} stroke="#8a5820" strokeWidth=".5"/>))}<circle cx="16" cy="20" r="2" fill="#6a3808"/>{[14.5,16,17.5].map(x=>(<line key={x} x1={x} y1="13" x2={x} y2="26" stroke="#d0b880" strokeWidth=".3"/>))}</g></svg>;
  return <svg viewBox="0 0 32 32" width={s} height={s}><g opacity={o}><circle cx="16" cy="16" r="6" fill="none" stroke="#a08050" strokeWidth="1.5"/><circle cx="16" cy="16" r="2" fill="#c8a060"/></g></svg>;
}

// ═══ Music: High-quality Web Audio synthesis ═══
let _ac=null,_rev=null;
function getAC(){if(!_ac)_ac=new(window.AudioContext||window.webkitAudioContext)();return _ac;}
function getRev(){if(!_rev){const ac=getAC();_rev=ac.createConvolver();
  // Generate impulse response for reverb
  const len=ac.sampleRate*2,imp=ac.createBuffer(2,len,ac.sampleRate);
  for(let c=0;c<2;c++){const d=imp.getChannelData(c);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,2.5);}
  _rev.buffer=imp;_rev.connect(ac.destination);}return _rev;}

function playN(freq,dur,type,vol,pan=0){
  const ac=getAC(),now=ac.currentTime;
  // Main oscillator
  const o=ac.createOscillator(),g=ac.createGain(),p=(ac.createStereoPanner?ac.createStereoPanner():null);
  o.type=type;o.frequency.value=freq;
  g.gain.setValueAtTime(0,now);
  g.gain.linearRampToValueAtTime(vol,now+0.02);
  g.gain.setValueAtTime(vol*0.7,now+dur*0.3);
  g.gain.exponentialRampToValueAtTime(0.001,now+dur);
  o.connect(g);
  if(p){p.pan.value=pan;g.connect(p);p.connect(ac.destination);p.connect(getRev());}
  else{g.connect(ac.destination);g.connect(getRev());}
  o.start(now);o.stop(now+dur);
  // Chorus: detuned second oscillator
  if(type!=="square"){
    const o2=ac.createOscillator(),g2=ac.createGain();
    o2.type=type;o2.frequency.value=freq*1.003;// slight detune
    g2.gain.setValueAtTime(0,now);g2.gain.linearRampToValueAtTime(vol*0.3,now+0.03);
    g2.gain.exponentialRampToValueAtTime(0.001,now+dur*0.8);
    o2.connect(g2);g2.connect(p||ac.destination);
    o2.start(now);o2.stop(now+dur);
  }
}

const TRACKS=[
  // 古琴 Guqin - the most ancient
  {name:"梅花三弄",inst:"guqin",bpm:48,era:"晋·桓伊",
   notes:[[0,1.5],[1,1],[2,1.5],[4,2],[-1,1.5],[2,1],[1,1],[0,2],[-1,1],[0,1],[1,1.5],[-1,1.5],[2,1.5],[3,1],[2,1],[1,1],[0,2],[-1,1.5]]},
  {name:"高山流水",inst:"guqin",bpm:52,era:"春秋·伯牙",
   notes:[[4,1],[3,.5],[2,1],[0,1.5],[-1,1],[0,.5],[1,.5],[2,1],[3,1],[4,1.5],[-1,.5],[3,.5],[2,1],[1,.5],[0,1.5],[-1,1]]},
  {name:"广陵散",inst:"guqin",bpm:50,era:"东汉",
   notes:[[0,1],[2,1],[4,1.5],[-1,.5],[3,1],[1,1],[0,1.5],[-1,1],[2,.5],[3,1],[4,1],[-1,.5],[2,1],[1,1],[0,2],[-1,1.5]]},
  {name:"平沙落雁",inst:"guqin",bpm:46,era:"明代",
   notes:[[2,1],[1,1],[0,1.5],[-1,1],[1,.5],[2,1],[3,1.5],[-1,1],[2,1],[1,.5],[0,1.5],[-1,1],[0,1],[1,1],[2,2],[-1,1.5]]},
  // 古筝 Guzheng
  {name:"渔舟唱晚",inst:"guzheng",bpm:72,era:"近代",
   notes:[[2,.5],[3,1],[4,.5],[3,1],[-1,.5],[2,.5],[1,1],[0,1.5],[-1,.5],[1,.5],[2,1],[3,.5],[-1,.5],[4,1],[3,.5],[2,1],[-1,.5],[1,1],[0,.5],[1,1.5],[-1,1]]},
  {name:"汉宫秋月",inst:"guzheng",bpm:62,era:"传统",
   notes:[[3,1],[2,.5],[1,1],[0,1.5],[-1,1],[2,.5],[3,1],[4,.5],[3,1],[-1,.5],[2,.5],[1,1],[0,2],[-1,1]]},
  {name:"战台风",inst:"guzheng",bpm:96,era:"近代",
   notes:[[4,.5],[3,.5],[2,.5],[3,.5],[4,.5],[-1,.25],[4,.5],[3,.5],[2,.5],[1,.5],[0,1],[-1,.5],[2,.5],[3,.5],[4,1],[-1,.5],[3,.5],[2,.5],[1,1],[0,1.5]]},
  // 琵琶 Pipa
  {name:"春江花月夜",inst:"pipa",bpm:76,era:"唐代·张若虚",
   notes:[[3,1],[2,.5],[1,.5],[0,1],[-1,.5],[1,.5],[2,1],[3,.5],[4,1],[3,.5],[2,.5],[1,1],[-1,1],[0,.5],[1,1],[2,.5],[3,1.5],[-1,.5]]},
  {name:"十面埋伏",inst:"pipa",bpm:108,era:"楚汉相争",
   notes:[[4,.25],[3,.25],[2,.25],[1,.25],[0,.5],[-1,.25],[4,.25],[3,.5],[2,.25],[1,.25],[0,.5],[-1,.5],[2,.5],[3,.5],[4,.5],[3,.5],[2,.5],[1,.5],[0,1]]},
  {name:"霸王卸甲",inst:"pipa",bpm:70,era:"楚霸王",
   notes:[[0,1.5],[1,1],[2,1],[3,1.5],[-1,.5],[4,1],[3,.5],[2,1],[1,1.5],[0,2],[-1,1]]},
  {name:"彝族舞曲",inst:"pipa",bpm:92,era:"近代·王惠然",
   notes:[[2,.5],[3,.5],[4,.5],[3,.5],[2,1],[1,.5],[0,1],[-1,.5],[1,.5],[2,1],[3,.5],[4,1],[3,.5],[2,.5],[1,1]]},
  // 二胡 Erhu
  {name:"二泉映月",inst:"erhu",bpm:56,era:"民国·阿炳",
   notes:[[1,1],[0,1.5],[2,1],[3,1.5],[-1,1],[4,1],[3,.5],[2,1],[0,1.5],[-1,.5],[1,1],[0,.5],[2,.5],[0,1],[1,1.5],[-1,1]]},
  {name:"赛马",inst:"erhu",bpm:132,era:"近代·黄海怀",
   notes:[[4,.25],[3,.25],[4,.25],[2,.25],[4,.5],[-1,.25],[3,.25],[2,.25],[1,.5],[0,.5],[-1,.25],[2,.25],[3,.25],[4,.5],[3,.5],[2,.5],[1,1]]},
  {name:"江河水",inst:"erhu",bpm:58,era:"东北民间",
   notes:[[2,1.5],[1,1],[0,1.5],[-1,.5],[2,.5],[1,1],[3,1],[2,.5],[1,1],[0,2],[-1,1.5]]},
  {name:"良宵",inst:"erhu",bpm:78,era:"民国·刘天华",
   notes:[[3,.5],[4,.5],[3,1],[2,.5],[1,.5],[0,1.5],[-1,.5],[2,.5],[3,1],[4,.5],[3,1],[2,1.5],[-1,1]]},
  // 竹笛 Dizi
  {name:"姑苏行",inst:"dizi",bpm:80,era:"近代·江先谓",
   notes:[[2,.5],[1,.5],[0,1],[2,.5],[3,1],[-1,.5],[4,.5],[3,.5],[2,1],[1,.5],[-1,.5],[0,.5],[1,1],[2,.5],[-1,.5],[3,1]]},
  {name:"牧民新歌",inst:"dizi",bpm:88,era:"近代·简广易",
   notes:[[3,.5],[4,.5],[3,.5],[2,.5],[1,1],[-1,.5],[0,.5],[1,.5],[2,1],[3,.5],[4,1],[-1,.5],[2,.5],[1,.5],[0,1.5]]},
  {name:"喜相逢",inst:"dizi",bpm:120,era:"近代·冯子存",
   notes:[[4,.25],[3,.25],[2,.5],[3,.25],[4,.5],[-1,.25],[3,.25],[2,.25],[1,.5],[0,.5],[-1,.25],[2,.5],[3,.5],[4,1]]},
  // 箫 Xiao
  {name:"妆台秋思",inst:"xiao",bpm:52,era:"古曲",
   notes:[[2,1.5],[1,1],[0,2],[-1,1],[2,.5],[3,1],[2,1],[1,1.5],[0,2],[-1,1]]},
  // 扬琴 Yangqin
  {name:"林冲夜奔",inst:"yangqin",bpm:98,era:"现代",
   notes:[[3,.5],[4,.25],[3,.25],[2,.5],[1,.5],[0,1],[-1,.5],[2,.5],[3,.5],[4,.5],[3,.5],[2,1]]},
  // 阮 Ruan
  {name:"花好月圆",inst:"ruan",bpm:82,era:"近代·黄贻钧",
   notes:[[2,.5],[3,.5],[4,1],[3,.5],[2,.5],[1,1],[-1,.5],[0,.5],[1,.5],[2,1],[3,.5],[4,1.5]]},
];
const INST_CONF={
  guqin:{wave:"sine",scale:[196,220,261.6,293.7,329.6],vol:.07},
  guzheng:{wave:"triangle",scale:[293.7,329.6,392,440,523.3],vol:.06},
  pipa:{wave:"sawtooth",scale:[392,440,523.3,587.3,659.3],vol:.04},
  erhu:{wave:"triangle",scale:[220,261.6,293.7,329.6,392],vol:.05},
  dizi:{wave:"square",scale:[523.3,587.3,659.3,784,880],vol:.03},
  xiao:{wave:"sine",scale:[349.2,392,440,523.3,587.3],vol:.04},
  yangqin:{wave:"triangle",scale:[261.6,293.7,329.6,392,440],vol:.05},
  ruan:{wave:"sawtooth",scale:[196,220,246.9,293.7,329.6],vol:.05},
};
const INST_LABEL={"guqin":"古琴","guzheng":"古筝","pipa":"琵琶","erhu":"二胡","dizi":"竹笛","xiao":"洞箫","yangqin":"扬琴","ruan":"中阮"};
const INST_EMOJI={"guqin":"🎋","guzheng":"🎼","pipa":"🪕","erhu":"🎻","dizi":"🎶","xiao":"🎵","yangqin":"🎹","ruan":"🎸"};

function MusicPlayer(){
  const [show,setShow]=useState(false);
  const [ti,setTi]=useState(0);
  const [playing,setPlaying]=useState(false);
  const [selInst,setSelInst]=useState("all"); // "all" or instrument key
  const tmRef=useRef(null);const niRef=useRef(0);const loopRef=useRef(0);const playRef=useRef(false);

  // Filtered track list based on selected instrument
  const filteredTracks=selInst==="all"?TRACKS:TRACKS.filter(tr=>tr.inst===selInst);
  const t=filteredTracks[ti%Math.max(1,filteredTracks.length)]||TRACKS[0];

  const stop=useCallback(()=>{playRef.current=false;if(tmRef.current)clearTimeout(tmRef.current);setPlaying(false);},[]);

  const play=useCallback((idx,trackList)=>{
    stop();const list=trackList||filteredTracks;if(!list.length)return;
    const tr=list[idx%list.length];const ic=INST_CONF[tr.inst]||INST_CONF.guqin;
    niRef.current=0;loopRef.current=0;playRef.current=true;setPlaying(true);
    const beatMs=60000/tr.bpm;
    playN(ic.scale[0]/2,6,"sine",ic.vol*0.2);
    const tick=()=>{
      if(!playRef.current)return;
      const[ni,dur]=tr.notes[niRef.current%tr.notes.length];
      if(ni>=0){
        const freq=ic.scale[ni%ic.scale.length];
        const d=dur*beatMs/1000;
        const pan=(Math.random()-.5)*.4;
        playN(freq,d,ic.wave,ic.vol,pan);
        if(Math.random()>.75)playN(freq*1.5,d*.6,ic.wave,ic.vol*.25,pan);
      }
      niRef.current++;
      if(niRef.current>=tr.notes.length){niRef.current=0;loopRef.current++;
        if(loopRef.current>=2){const next=(idx+1)%list.length;setTi(next);play(next,list);return;}
        playN(ic.scale[0]/2,5,"sine",ic.vol*0.15);
      }
      tmRef.current=setTimeout(tick,dur*beatMs+(ni<0?100:0));
    };tick();
  },[stop,filteredTracks]);

  const toggle=()=>{if(playing)stop();else{getAC();play(ti,filteredTracks);}};
  const next=()=>{const n=(ti+1)%filteredTracks.length;setTi(n);if(playing)play(n,filteredTracks);};
  const prev=()=>{const n=(ti-1+filteredTracks.length)%filteredTracks.length;setTi(n);if(playing)play(n,filteredTracks);};
  const random=()=>{
    const insts=["all",...Object.keys(INST_CONF)];
    const rInst=insts[Math.floor(Math.random()*insts.length)];
    setSelInst(rInst);
    const newList=rInst==="all"?TRACKS:TRACKS.filter(tr=>tr.inst===rInst);
    const rIdx=Math.floor(Math.random()*newList.length);
    setTi(rIdx);getAC();play(rIdx,newList);
  };
  const pickInst=(k)=>{setSelInst(k);setTi(0);
    const newList=k==="all"?TRACKS:TRACKS.filter(tr=>tr.inst===k);
    if(playing)play(0,newList);
  };

  // Keyboard controls: ↑↓ = instrument, ←→ = track, space = play/pause
  useEffect(()=>{if(!show)return;
    const h=(e)=>{
      if(["INPUT","TEXTAREA"].includes(document.activeElement.tagName))return;
      const insts=["all",...Object.keys(INST_CONF)];
      const curIdx=insts.indexOf(selInst);
      if(e.key==="ArrowUp"){e.preventDefault();pickInst(insts[(curIdx-1+insts.length)%insts.length]);}
      else if(e.key==="ArrowDown"){e.preventDefault();pickInst(insts[(curIdx+1)%insts.length]);}
      else if(e.key==="ArrowLeft"){e.preventDefault();prev();}
      else if(e.key==="ArrowRight"){e.preventDefault();next();}
      else if(e.key===" "||e.key==="Enter"){e.preventDefault();toggle();}
    };
    window.addEventListener("keydown",h);
    return()=>window.removeEventListener("keydown",h);
  },[show,selInst,ti,playing,filteredTracks.length]);

  if(!show)return(
    <button onClick={()=>setShow(true)} title={playing?t.name+" · "+INST_LABEL[t.inst]:"国乐"}
      style={{position:"absolute",bottom:80,right:8,zIndex:36,
      border:playing?"2px solid "+C.accent:"1.5px solid #e0dcd4",borderRadius:28,
      padding:playing?"6px 12px 6px 8px":"8px 10px",cursor:"pointer",
      background:"rgba(250,245,237,.98)",boxShadow:"0 3px 12px rgba(0,0,0,.08)",
      display:"flex",alignItems:"center",gap:playing?8:0,minHeight:48}}>
      <div style={{position:"relative"}}>
        <InstrIcon type={playing?t.inst:"guqin"} sz={32}/>
        {playing&&<div style={{position:"absolute",top:-3,right:-3,width:10,height:10,borderRadius:"50%",
          background:C.accent,border:"2px solid #faf5ed"}}></div>}
      </div>
      {playing&&<>
        <div style={{textAlign:"left",minWidth:0,maxWidth:130}}>
          <div style={{fontSize:12,fontWeight:700,color:C.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{t.name}</div>
          <div style={{fontSize:10,color:C.accent,letterSpacing:1}}>{INST_LABEL[t.inst]} · 正在演奏</div>
        </div>
        {/* Audio wave animation */}
        <div style={{display:"flex",alignItems:"flex-end",gap:2,height:16,marginLeft:2}}>
          {[0,1,2].map(i=>(<div key={i} style={{width:2,height:8+i*2,background:C.accent,borderRadius:1,
            animation:"playwave .6s ease-in-out infinite",animationDelay:(i*.15)+"s"}}></div>))}
        </div>
      </>}
    </button>);

  return(<div style={{position:"absolute",bottom:8,right:8,zIndex:36,
    background:"rgba(250,245,237,.97)",backdropFilter:"blur(8px)",
    borderRadius:12,padding:"12px 14px",boxShadow:"0 4px 20px rgba(0,0,0,.1)",width:280}}>
    {/* Header */}
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
      <div style={{fontSize:13,fontWeight:700,color:C.text,letterSpacing:2}}>🎼 国乐</div>
      <button onClick={()=>setShow(false)} style={{border:"none",background:"none",cursor:"pointer",fontSize:16,color:C.tl}}>{"×"}</button>
    </div>
    {/* Instrument selector */}
    <div style={{display:"flex",gap:3,flexWrap:"wrap",marginBottom:10}}>
      <button onClick={()=>pickInst("all")} style={{border:"none",borderRadius:12,padding:"4px 9px",cursor:"pointer",fontSize:11,
        background:selInst==="all"?C.accent+"22":"#f5f0e8",color:selInst==="all"?C.accent:C.tl,fontWeight:selInst==="all"?700:500}}>
        全部</button>
      {Object.keys(INST_LABEL).map(k=>(
        <button key={k} onClick={()=>pickInst(k)} style={{border:"none",borderRadius:12,padding:"4px 9px",cursor:"pointer",fontSize:11,
          background:selInst===k?C.accent+"22":"#f5f0e8",color:selInst===k?C.accent:C.tl,fontWeight:selInst===k?700:500}}>
          {INST_LABEL[k]}</button>))}
      <button onClick={random} style={{border:"none",borderRadius:12,padding:"4px 9px",cursor:"pointer",fontSize:11,
        background:"#fdf0e0",color:"#d06030",fontWeight:700}}>🎲 随机</button>
    </div>
    {/* Now playing */}
    <div style={{background:"#f5f0e8",borderRadius:8,padding:"8px 10px",marginBottom:8}}>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <InstrIcon type={t.inst} sz={26}/>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:13,fontWeight:700,color:C.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{t.name}</div>
          <div style={{fontSize:10,color:C.tl}}>{INST_LABEL[t.inst]} · {t.era||""} · {(ti%filteredTracks.length)+1}/{filteredTracks.length}</div>
        </div>
      </div>
    </div>
    {/* Controls */}
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:14}}>
      <button onClick={prev} style={{border:"none",background:"none",cursor:"pointer",fontSize:18,color:C.tl}}>⏮</button>
      <button onClick={toggle} style={{border:"none",background:C.accent,color:"#fff",borderRadius:"50%",
        width:42,height:42,cursor:"pointer",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center"}}>
        {playing?"⏸":"▶"}</button>
      <button onClick={next} style={{border:"none",background:"none",cursor:"pointer",fontSize:18,color:C.tl}}>⏭</button>
    </div>
    {/* Keyboard hint */}
    <div style={{fontSize:9,color:C.tl,textAlign:"center",marginTop:8,opacity:.6,letterSpacing:1}}>
      ↑↓切换乐器 · ←→切换曲目 · 空格播放
    </div>
    {playing&&<div style={{height:3,borderRadius:2,background:"#ece6dc",overflow:"hidden",marginTop:6}}>
      <div style={{height:"100%",width:"60%",borderRadius:2,background:"linear-gradient(90deg,"+C.accent+","+C.accent2+")",
        animation:"progress 3s linear infinite"}}></div>
    </div>}
  </div>);
}

// ═══ 花鸟虫鸣 (Nature Ambient Sound) ═══
// 程序化生成的自然环境音：鸟鸣、虫鸣、流水、风声
function NatureAmbient(){
  const [playing,setPlaying]=useState(false);
  const [type,setType]=useState("birds"); // birds | crickets | stream | wind | rain
  const intervalRef=useRef(null);

  const playBirdChirp=()=>{const ac=getAC();const now=ac.currentTime;
    // Random bird chirp: quick pitch sweep
    const base=1200+Math.random()*2000;const dur=0.08+Math.random()*0.15;
    const osc=ac.createOscillator();const g=ac.createGain();
    osc.type="sine";osc.frequency.setValueAtTime(base,now);
    osc.frequency.exponentialRampToValueAtTime(base*(0.6+Math.random()*0.8),now+dur);
    g.gain.setValueAtTime(0,now);g.gain.linearRampToValueAtTime(0.08,now+0.01);
    g.gain.exponentialRampToValueAtTime(0.001,now+dur);
    osc.connect(g);g.connect(ac.destination);
    osc.start(now);osc.stop(now+dur);
  };

  const playCricket=()=>{const ac=getAC();const now=ac.currentTime;
    // Cricket: high pulsing tone
    const base=4500+Math.random()*500;
    const osc=ac.createOscillator();const g=ac.createGain();
    osc.type="sine";osc.frequency.value=base;
    // Pulse envelope
    for(var i=0;i<3;i++){
      var t=now+i*0.05;
      g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(0.04,t+0.01);
      g.gain.exponentialRampToValueAtTime(0.001,t+0.04);
    }
    osc.connect(g);g.connect(ac.destination);
    osc.start(now);osc.stop(now+0.15);
  };

  const playStream=()=>{const ac=getAC();const now=ac.currentTime;
    // Stream: filtered noise burst
    const bufSize=ac.sampleRate*0.3;
    const buf=ac.createBuffer(1,bufSize,ac.sampleRate);
    const data=buf.getChannelData(0);
    for(var i=0;i<bufSize;i++)data[i]=(Math.random()*2-1)*0.3;
    const src=ac.createBufferSource();src.buffer=buf;
    const filter=ac.createBiquadFilter();filter.type="bandpass";
    filter.frequency.value=800+Math.random()*600;filter.Q.value=2;
    const g=ac.createGain();g.gain.value=0.04;
    src.connect(filter);filter.connect(g);g.connect(ac.destination);
    src.start(now);
  };

  const playWind=()=>{const ac=getAC();const now=ac.currentTime;
    // Wind: low-pass noise with LFO
    const bufSize=ac.sampleRate*0.8;
    const buf=ac.createBuffer(1,bufSize,ac.sampleRate);
    const data=buf.getChannelData(0);
    for(var i=0;i<bufSize;i++)data[i]=(Math.random()*2-1)*0.5;
    const src=ac.createBufferSource();src.buffer=buf;
    const filter=ac.createBiquadFilter();filter.type="lowpass";
    filter.frequency.value=300+Math.random()*400;filter.Q.value=1;
    const g=ac.createGain();
    g.gain.setValueAtTime(0,now);g.gain.linearRampToValueAtTime(0.06,now+0.3);
    g.gain.linearRampToValueAtTime(0,now+0.8);
    src.connect(filter);filter.connect(g);g.connect(ac.destination);
    src.start(now);
  };

  const playRain=()=>{const ac=getAC();const now=ac.currentTime;
    // Rain: pink noise
    const bufSize=ac.sampleRate*0.5;
    const buf=ac.createBuffer(1,bufSize,ac.sampleRate);
    const data=buf.getChannelData(0);
    var b=[0,0,0,0,0,0,0];
    for(var i=0;i<bufSize;i++){
      var white=Math.random()*2-1;
      b[0]=0.99886*b[0]+white*0.0555179;b[1]=0.99332*b[1]+white*0.0750759;
      b[2]=0.96900*b[2]+white*0.1538520;b[3]=0.86650*b[3]+white*0.3104856;
      data[i]=(b[0]+b[1]+b[2]+b[3])*0.11;
    }
    const src=ac.createBufferSource();src.buffer=buf;
    const g=ac.createGain();g.gain.value=0.06;
    src.connect(g);g.connect(ac.destination);
    src.start(now);
  };

  const soundMap={birds:playBirdChirp,crickets:playCricket,stream:playStream,wind:playWind,rain:playRain};
  const intervalMap={birds:800,crickets:200,stream:250,wind:700,rain:400};

  useEffect(()=>{
    if(!playing){if(intervalRef.current){clearInterval(intervalRef.current);intervalRef.current=null;}return;}
    const play=soundMap[type];const interval=intervalMap[type]+Math.random()*400;
    play(); // First one immediately
    intervalRef.current=setInterval(function(){
      play();
    },interval);
    return()=>{if(intervalRef.current)clearInterval(intervalRef.current);};
  },[playing,type]);

  const presets=[
    {k:"birds",l:"🐦 鸟鸣",desc:"林间鸟啼"},
    {k:"crickets",l:"🦗 虫鸣",desc:"秋夜虫语"},
    {k:"stream",l:"💧 溪流",desc:"山涧流水"},
    {k:"wind",l:"🍃 风声",desc:"清风拂过"},
    {k:"rain",l:"☔ 细雨",desc:"雨打芭蕉"},
  ];

  return(<div style={{position:"absolute",bottom:66,right:12,zIndex:29,
    background:"rgba(250,245,237,.95)",borderRadius:10,border:"1px solid #e0dcd4",
    padding:"6px 8px",boxShadow:"0 2px 8px rgba(0,0,0,.06)",
    display:"flex",alignItems:"center",gap:4}} className="hx-music-mini">
    <button onClick={function(){setPlaying(!playing);}} title={playing?"暂停":"播放自然音"}
      style={{border:"none",background:"transparent",cursor:"pointer",
        fontSize:14,color:playing?"#5a8a50":"#8a7a68",padding:"2px 4px"}}>
      {playing?"⏸":"🌿"}</button>
    {playing&&<>
      <select value={type} onChange={function(e){setType(e.target.value);}}
        style={{border:"none",background:"transparent",fontSize:10,color:"#3a2818",
          cursor:"pointer",outline:"none",padding:"2px"}}>
        {presets.map(function(p){return<option key={p.k} value={p.k}>{p.l}</option>;})}
      </select>
    </>}
  </div>);
}

function ZoomControls({wz,setWz}){
  return(<div style={{position:"absolute",right:3,top:"50%",transform:"translateY(-50%)",zIndex:30,
    display:"flex",flexDirection:"column",gap:1,background:"rgba(250,245,237,.85)",
    borderRadius:6,padding:"2px",boxShadow:"0 1px 4px rgba(0,0,0,.03)"}}>
    <button onClick={()=>setWz(z=>Math.min(8,z*1.4))} style={{border:"none",borderRadius:4,width:32,height:32,
      cursor:"pointer",background:"transparent",color:C.tl,fontSize:14,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
    <div style={{width:24,textAlign:"center",fontSize:10,color:C.tl}}>{Math.round(wz*100)}%</div>
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
      if(du>=3&&du<=7) result.push({m:"【花信风】"+f.n+f.sp+"将于"+du+"日后进入盛花期",id:f.id,pri:3});
      if(du<=0&&du>=-10&&((f._st&&f._st.l)||0)>=3) result.push({m:"【花信风】"+f.n+f.sp+"正值盛花期 · "+f.po,id:f.id,pri:4});
      if(du<-8&&du>=-14&&((f._st&&f._st.l)||0)>=3) result.push({m:"【急报】"+f.n+f.sp+"花期渐近尾声，欲赏请趁本周",id:f.id,pri:5});
      if(du<-14&&((f._st&&f._st.l)||0)<=1){
        const next=flora.find(x=>x.sp===f.sp&&x.id!==f.id&&x._pred&&x._pred.daysUntil>0&&x._pred.daysUntil<30);
        if(next) result.push({m:"【接力】"+(f.n.split("·")[1]||f.n)+f.sp+"已谢，"+next.n+"正在接力绽放",id:next.id,pri:2});
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
  return(<div onClick={()=>onGo(alerts[i%alerts.length].id)} style={{position:"absolute",top:8,left:"50%",transform:"translateX(-50%) translateY("+(sh?0:-8)+"px)",
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
  const [stage,setStage]=useState("idle"); // idle → shaking → extracting → revealed
  const [showShare,setShowShare]=useState(false);
  
  const dailySeed=useMemo(()=>{const d=new Date();return d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate();},[]);
  
  useEffect(()=>{(async()=>{
    try{const r=window.storage?await window.storage.get("mood_"+dailySeed):null;
      if(r&&r.value){const c=JSON.parse(r.value);setCard(MOOD_CARDS.find(x=>x.name===c));setStage("revealed");setRevealed(true);return;}}catch{}
  })();},[dailySeed]);

  const draw=async()=>{
    if(stage!=="idle")return;
    setStage("shaking");
    setTimeout(()=>{
      setStage("extracting");
      setTimeout(()=>{
        const picked=MOOD_CARDS[Math.floor(Math.abs(Math.sin(dailySeed*0.618))*MOOD_CARDS.length)%MOOD_CARDS.length];
        setCard(picked);
        setTimeout(()=>{
          setStage("revealed");
          setRevealed(true);
          try{if(window.storage)window.storage.set("mood_"+dailySeed,JSON.stringify(picked.name));}catch{}
        },800);
      },1200);
    },1500);
  };

  const reset=()=>{setCard(null);setRevealed(false);setStage("idle");};
  
  // Inkwash palette
  const ink="#2a2018",paper="#f5ede0",gold="#b08040",jade="#3a6b5a",vermillion="#a0301c";

  return(<div style={{position:"fixed",inset:0,zIndex:150,display:"flex",alignItems:"center",justifyContent:"center",
    background:"rgba(20,15,10,.75)",backdropFilter:"blur(10px)"}} onClick={onClose}>
    <div onClick={e=>e.stopPropagation()} style={{width:"min(540px,94vw)",maxHeight:"94vh",position:"relative",
      background:paper,borderRadius:8,overflow:"hidden",
      boxShadow:"0 20px 60px rgba(0,0,0,.5),inset 0 0 120px rgba(200,160,80,.08)"}}>
      
      {/* Background: ink-wash bamboo grove */}
      <svg viewBox="0 0 540 700" preserveAspectRatio="xMidYMid slice" 
        style={{position:"absolute",inset:0,width:"100%",height:"100%",opacity:.15}}>
        <defs><linearGradient id="mist" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f5ede0"/><stop offset="50%" stopColor="#d8c8a0"/><stop offset="100%" stopColor="#a89870"/>
        </linearGradient></defs>
        <rect width="540" height="700" fill="url(#mist)"/>
        {/* Distant mountains */}
        <path d="M0,280 Q80,200 160,250 T320,240 T540,220 L540,700 L0,700 Z" fill="#8a7a5a" opacity=".3"/>
        <path d="M0,340 Q120,280 240,320 T480,310 L540,330 L540,700 L0,700 Z" fill="#6a5a40" opacity=".25"/>
        {/* Bamboo */}
        {[60,130,440,500].map(x=>(<g key={x}>
          <line x1={x} y1="180" x2={x+3} y2="600" stroke="#4a5a3a" strokeWidth="4"/>
          {[220,280,340,400,460,520].map(y=>(<ellipse key={y} cx={x+(y%60?0:2)} cy={y} rx="3" ry="2" fill="#2a3a20"/>))}
          {[200,260,320,380,440].map(y=>(<path key={y} d={"M"+x+","+y+" q10,-8 20,-5 q-5,8 -18,6"} fill="#3a5a30" opacity=".6"/>))}
          {[250,310,370,430].map(y=>(<path key={y} d={"M"+x+","+y+" q-10,-8 -20,-5 q5,8 18,6"} fill="#3a5a30" opacity=".6"/>))}
        </g>))}
      </svg>

      {/* Content */}
      <div style={{position:"relative",zIndex:1,padding:"32px 40px 28px"}}>
        
        {/* Title bar with seals */}
        <div style={{textAlign:"center",marginBottom:20,position:"relative"}}>
          <div style={{fontSize:10,color:gold,letterSpacing:6,marginBottom:2,fontWeight:500}}>· 花 · 信 · 雅 · 事 ·</div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10,margin:"6px 0"}}>
            <div style={{width:24,height:1,background:"linear-gradient(90deg,transparent,"+gold+")"}}></div>
            <h2 style={{fontSize:22,fontWeight:900,color:ink,letterSpacing:12,margin:0,
              fontFamily:"'Noto Serif SC',serif",textShadow:"0 1px 0 rgba(255,255,255,.5)"}}>花 信 签</h2>
            <div style={{width:24,height:1,background:"linear-gradient(90deg,"+gold+",transparent)"}}></div>
          </div>
          <div style={{fontSize:11,color:"#8a6a40",letterSpacing:4,fontStyle:"italic"}}>
            {stage==="idle"?"心诚则灵 · 一签一缘":stage==="shaking"?"签 筒 轻 摇 · 天 意 将 显":
             stage==="extracting"?"签 出 · 静 待 天 意":"今 · 日 · 得 · 签"}</div>
          {/* Red seal decoration */}
          <div style={{position:"absolute",right:-2,top:-2,width:28,height:28,borderRadius:3,
            background:vermillion,opacity:.85,display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:9,color:"#fff",letterSpacing:0,fontWeight:700,transform:"rotate(-8deg)",
            boxShadow:"0 1px 3px rgba(0,0,0,.2)"}}>花信</div>
        </div>

        {/* IDLE: Show bamboo fortune tube */}
        {stage==="idle"&&<div style={{textAlign:"center",padding:"8px 0 0"}}>
          <svg viewBox="0 0 200 220" width="180" height="200" style={{display:"block",margin:"0 auto"}}>
            <defs>
              <linearGradient id="tube" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#6a4a20"/><stop offset="30%" stopColor="#a87840"/>
                <stop offset="55%" stopColor="#c89858"/><stop offset="80%" stopColor="#a07838"/>
                <stop offset="100%" stopColor="#5a3a10"/>
              </linearGradient>
              <linearGradient id="slip" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#d0a860"/><stop offset="50%" stopColor="#e8c880"/><stop offset="100%" stopColor="#b08848"/>
              </linearGradient>
            </defs>
            {/* Tube shadow on ground */}
            <ellipse cx="100" cy="205" rx="55" ry="6" fill="rgba(0,0,0,.2)"/>
            {/* Bamboo slips sticking out top */}
            <g style={{transformOrigin:"100px 180px",transform:"translateY(-80px)"}}>
              {[0,1,2,3,4].map(i=>(
                <rect key={i} x={80+i*8} y="0" width="4.5" height="50" rx="1" fill="url(#slip)" stroke="#7a5020" strokeWidth=".3"/>
              ))}
            </g>
            {/* Main tube body */}
            <path d="M60,60 L65,195 Q100,210 135,195 L140,60 Z" fill="url(#tube)" stroke="#5a3a10" strokeWidth="1"/>
            {/* Bamboo joints/rings */}
            {[85,130,170].map(y=>(<path key={y} d={"M62,"+y+" Q100,"+(y+8)+" 138,"+y} stroke="#4a2a10" strokeWidth="1.5" fill="none"/>))}
            {/* Top rim */}
            <ellipse cx="100" cy="62" rx="40" ry="7" fill="#4a2a10"/>
            <ellipse cx="100" cy="61" rx="38" ry="5.5" fill="#8a5820"/>
            {/* Characters on tube */}
            <text x="100" y="115" textAnchor="middle" fontSize="14" fill="#6a3a08" fontWeight="900" letterSpacing="3" opacity=".7">求</text>
            <text x="100" y="142" textAnchor="middle" fontSize="14" fill="#6a3a08" fontWeight="900" letterSpacing="3" opacity=".7">签</text>
          </svg>
          <div style={{fontSize:12,color:"#8a6a40",letterSpacing:4,margin:"8px 0 18px",lineHeight:1.8}}>
            「 净心·默念·摇筒·一签 」</div>
          <button onClick={draw}
            style={{border:"1.5px solid "+gold,background:"linear-gradient(135deg,"+paper+","+paper+"dd)",
              color:ink,borderRadius:40,padding:"12px 42px",cursor:"pointer",fontSize:14,fontWeight:600,
              letterSpacing:8,boxShadow:"0 4px 14px rgba(180,140,70,.2),inset 0 1px 0 rgba(255,255,255,.6)",
              transition:"all .2s",fontFamily:"'Noto Serif SC',serif"}}
            onMouseEnter={e=>e.target.style.transform="translateY(-2px)"}
            onMouseLeave={e=>e.target.style.transform=""}>
            🎐 摇 · 签</button>
        </div>}

        {/* SHAKING animation */}
        {stage==="shaking"&&<div style={{textAlign:"center",padding:"8px 0"}}>
          <style>{"@keyframes shake2{0%,100%{transform:rotate(-6deg) translateX(-3px)}25%{transform:rotate(8deg) translateX(4px)}50%{transform:rotate(-8deg) translateX(-4px)}75%{transform:rotate(6deg) translateX(3px)}}"}</style>
          <svg viewBox="0 0 200 220" width="180" height="200" style={{display:"block",margin:"0 auto",animation:"shake2 .18s infinite"}}>
            <defs>
              <linearGradient id="tube2" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#6a4a20"/><stop offset="30%" stopColor="#a87840"/>
                <stop offset="55%" stopColor="#c89858"/><stop offset="80%" stopColor="#a07838"/>
                <stop offset="100%" stopColor="#5a3a10"/>
              </linearGradient>
              <linearGradient id="slip2" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#d0a860"/><stop offset="50%" stopColor="#e8c880"/><stop offset="100%" stopColor="#b08848"/>
              </linearGradient>
            </defs>
            <ellipse cx="100" cy="205" rx="55" ry="6" fill="rgba(0,0,0,.2)"/>
            {[0,1,2,3,4,5,6].map(i=>(
              <rect key={i} x={78+i*7.5} y={-10+Math.random()*20} width="4" height={48+Math.random()*6} rx="1" 
                fill="url(#slip2)" stroke="#7a5020" strokeWidth=".3" transform={"rotate("+((i-3)*8)+",100,40)"}/>
            ))}
            <path d="M60,60 L65,195 Q100,210 135,195 L140,60 Z" fill="url(#tube2)" stroke="#5a3a10" strokeWidth="1"/>
            {[85,130,170].map(y=>(<path key={y} d={"M62,"+y+" Q100,"+(y+8)+" 138,"+y} stroke="#4a2a10" strokeWidth="1.5" fill="none"/>))}
            <ellipse cx="100" cy="62" rx="40" ry="7" fill="#4a2a10"/>
          </svg>
          <div style={{fontSize:13,color:gold,letterSpacing:6,marginTop:12,animation:"shake2 .18s infinite"}}>
            · 叮 · 当 · 叮 · 当 ·</div>
        </div>}

        {/* EXTRACTING - one slip rising */}
        {stage==="extracting"&&<div style={{textAlign:"center",padding:"8px 0",minHeight:220}}>
          <style>{"@keyframes rise{0%{transform:translateY(30px);opacity:0}60%{transform:translateY(-40px);opacity:1}100%{transform:translateY(-60px);opacity:1}}"}</style>
          <svg viewBox="0 0 200 240" width="180" height="220" style={{display:"block",margin:"0 auto"}}>
            <ellipse cx="100" cy="225" rx="55" ry="6" fill="rgba(0,0,0,.2)"/>
            {/* Rising slip */}
            <g style={{animation:"rise 1.2s ease-out forwards"}}>
              <rect x="96" y="20" width="8" height="90" rx="2" fill="#e8c880" stroke="#a07838" strokeWidth=".8"/>
              <text x="100" y="45" textAnchor="middle" fontSize="8" fill="#6a3a08" fontWeight="700">第</text>
              <text x="100" y="62" textAnchor="middle" fontSize="8" fill="#6a3a08" fontWeight="700">上</text>
              <text x="100" y="79" textAnchor="middle" fontSize="8" fill="#6a3a08" fontWeight="700">上</text>
              <text x="100" y="96" textAnchor="middle" fontSize="8" fill="#a0301c" fontWeight="700">签</text>
            </g>
            <path d="M60,80 L65,215 Q100,230 135,215 L140,80 Z" fill="#a87840" stroke="#5a3a10" strokeWidth="1"/>
            <ellipse cx="100" cy="82" rx="40" ry="7" fill="#4a2a10"/>
            <ellipse cx="100" cy="81" rx="38" ry="5.5" fill="#8a5820"/>
          </svg>
          <div style={{fontSize:12,color:gold,letterSpacing:6,marginTop:6}}>· 签 现 ·</div>
        </div>}

        {/* REVEALED - show the fortune */}
        {stage==="revealed"&&card&&<div style={{padding:"0",animation:"fadeIn .8s"}}>
          <style>{"@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}"}</style>
          {/* Fortune card in scroll style */}
          <div style={{background:"linear-gradient(180deg,#fbf4e4,#f0e6d0)",
            border:"1px solid "+gold+"55",borderRadius:4,padding:"22px 24px 18px",
            boxShadow:"0 2px 12px rgba(180,140,70,.15),inset 0 0 0 3px rgba(245,237,224,.6),inset 0 0 0 4px "+gold+"33",
            position:"relative"}}>
            {/* Corner decorations */}
            {[{t:0,l:0},{t:0,r:0},{b:0,l:0},{b:0,r:0}].map((p,i)=>(
              <div key={i} style={{position:"absolute",width:12,height:12,borderColor:gold,borderStyle:"solid",borderWidth:0,...p,
                borderTopWidth:p.t===0?2:0,borderBottomWidth:p.b===0?2:0,
                borderLeftWidth:p.l===0?2:0,borderRightWidth:p.r===0?2:0,opacity:.6}}></div>
            ))}
            {/* Flower emoji with halo */}
            <div style={{textAlign:"center",marginBottom:10,position:"relative"}}>
              <div style={{display:"inline-block",width:68,height:68,borderRadius:"50%",
                background:"radial-gradient(circle,"+card.color+"44,transparent 70%)",
                display:"flex",alignItems:"center",justifyContent:"center",fontSize:46,
                filter:"drop-shadow(0 2px 6px "+card.color+"66)"}}>{card.emoji}</div>
            </div>
            {/* Sign rank (上上/上吉/中吉/中平) */}
            <div style={{textAlign:"center",marginBottom:4}}>
              <span style={{display:"inline-block",padding:"2px 14px",background:vermillion,color:"#fff8e8",
                fontSize:11,letterSpacing:4,borderRadius:2,fontWeight:700}}>上 上 签</span>
            </div>
            {/* Sign name */}
            <h3 style={{fontSize:26,fontWeight:900,color:ink,letterSpacing:10,textAlign:"center",margin:"10px 0 4px",
              fontFamily:"'Noto Serif SC',serif"}}>{card.name}</h3>
            <div style={{textAlign:"center",fontSize:13,color:card.color,letterSpacing:6,fontWeight:600,marginBottom:12}}>
              · {card.mood} ·</div>
            {/* Decorative divider with seal */}
            <div style={{display:"flex",alignItems:"center",gap:8,margin:"10px auto",width:"80%"}}>
              <div style={{flex:1,height:1,background:"linear-gradient(90deg,transparent,"+gold+"66)"}}></div>
              <div style={{fontSize:11,color:gold,letterSpacing:3}}>◈</div>
              <div style={{flex:1,height:1,background:"linear-gradient(90deg,"+gold+"66,transparent)"}}></div>
            </div>
            {/* Poem - calligraphy style */}
            <div style={{textAlign:"center",padding:"8px 12px",margin:"8px 0"}}>
              <div style={{fontSize:10,color:gold,letterSpacing:4,marginBottom:10,fontWeight:600}}>· 签 诗 ·</div>
              <div style={{fontSize:18,color:ink,letterSpacing:5,lineHeight:2.2,
                fontFamily:"'Noto Serif SC',serif",fontWeight:500,textShadow:"0 1px 0 rgba(255,255,255,.5)"}}>
                {card.poem.split('，').map((line,i)=>(
                  <div key={i} style={{margin:"2px 0"}}>{line}{i<card.poem.split('，').length-1?"，":""}</div>
                ))}
              </div>
            </div>
            {/* Interpretation */}
            <div style={{padding:"12px 10px",margin:"10px 0 0",borderTop:"1px dashed "+gold+"44"}}>
              <div style={{fontSize:10,color:gold,letterSpacing:4,marginBottom:8,textAlign:"center",fontWeight:600}}>· 解 签 ·</div>
              <div style={{fontSize:13,color:ink,letterSpacing:2,lineHeight:2,textAlign:"center",
                fontFamily:"'Noto Serif SC',serif"}}>{card.meaning}</div>
            </div>
          </div>
          
          {/* Actions */}
          <div style={{display:"flex",justifyContent:"center",gap:12,marginTop:16}}>
            <button onClick={()=>setShowShare(true)}
              style={{border:"1px solid "+gold+"66",background:"rgba(255,248,232,.6)",
                borderRadius:20,padding:"8px 22px",cursor:"pointer",fontSize:12,color:ink,
                letterSpacing:3,fontWeight:500}}>
              📤 分享此签</button>
            <div style={{fontSize:11,color:"#a89870",letterSpacing:3,display:"flex",alignItems:"center"}}>
              · 每日一签 · 明日再求 ·</div>
          </div>
        </div>}
      </div>

      {/* Close */}
      <button onClick={onClose} style={{position:"absolute",top:12,right:14,border:"none",
        background:"rgba(0,0,0,.15)",color:"#fff",cursor:"pointer",fontSize:13,width:26,height:26,
        borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",zIndex:3}}>{"×"}</button>

      {/* Share modal */}
      {showShare&&<MoodShareCard card={card} onClose={()=>setShowShare(false)}/>}
    </div></div>);
}

// ═══ Mood Share Card: Generate shareable image with QR ═══
function MoodShareCard({card,onClose}){
  const [copying,setCopying]=useState(false);
  const url=typeof window!=="undefined"?window.location.origin:"https://huaxin.app";
  const qrUrl="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data="+encodeURIComponent(url)+"&bgcolor=f5ede0&color=2a2018&margin=4";
  
  const shareTo=(platform)=>{
    const text="【花信风·"+card.name+"】\n"+card.mood+"\n「"+card.poem+"」\n"+card.meaning;
    if(platform==="wx"||platform==="pyq"){navigator.clipboard.writeText(text+"\n"+url);alert("文案已复制！请打开微信粘贴分享");}
    else if(platform==="xhs"){navigator.clipboard.writeText(text+"\n"+url);alert("文案已复制！请打开小红书APP粘贴发布");}
    else if(platform==="wb"){window.open("https://service.weibo.com/share/share.php?title="+encodeURIComponent(text)+"&url="+encodeURIComponent(url),"_blank");}
    else if(platform==="tw"){window.open("https://twitter.com/intent/tweet?text="+encodeURIComponent(text)+"&url="+encodeURIComponent(url),"_blank");}
    else if(platform==="save"){downloadCard();}
    else{if(navigator.share)navigator.share({title:"花信风·"+card.name,text:text,url:url}).catch(function(){});else{navigator.clipboard.writeText(text+"\n"+url);alert("已复制");}}
  };

  const downloadCard=()=>{
    setCopying(true);
    // Draw canvas
    const canvas=document.createElement("canvas");
    canvas.width=540;canvas.height=720;
    const ctx=canvas.getContext("2d");
    // Background
    const bg=ctx.createLinearGradient(0,0,0,720);
    bg.addColorStop(0,"#f5ede0");bg.addColorStop(1,"#e8d8b8");
    ctx.fillStyle=bg;ctx.fillRect(0,0,540,720);
    // Border
    ctx.strokeStyle="#b08040";ctx.lineWidth=2;ctx.strokeRect(20,20,500,680);
    ctx.lineWidth=1;ctx.strokeRect(28,28,484,664);
    // Title
    ctx.fillStyle="#2a2018";ctx.font="bold 42px 'Noto Serif SC',serif";ctx.textAlign="center";
    ctx.fillText("花 信 签",270,100);
    // Decorative line
    ctx.strokeStyle="#b08040";ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(180,120);ctx.lineTo(360,120);ctx.stroke();
    // Sign rank
    ctx.fillStyle="#a0301c";ctx.fillRect(230,145,80,28);
    ctx.fillStyle="#fff8e8";ctx.font="bold 14px sans-serif";ctx.fillText("上 上 签",270,165);
    // Emoji substitute - flower symbol
    ctx.fillStyle=card.color;ctx.beginPath();ctx.arc(270,230,40,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#fff";ctx.font="40px sans-serif";ctx.fillText(card.emoji,270,245);
    // Sign name
    ctx.fillStyle="#2a2018";ctx.font="bold 32px 'Noto Serif SC',serif";
    ctx.fillText(card.name,270,320);
    // Mood
    ctx.fillStyle=card.color;ctx.font="18px 'Noto Serif SC',serif";
    ctx.fillText("· "+card.mood+" ·",270,355);
    // Poem
    ctx.fillStyle="#2a2018";ctx.font="22px 'Noto Serif SC',serif";
    const poemLines=card.poem.split('，');
    poemLines.forEach((line,i)=>ctx.fillText(line+(i<poemLines.length-1?"，":""),270,420+i*40));
    // Interpretation
    ctx.fillStyle="#4a4030";ctx.font="15px 'Noto Serif SC',serif";
    const meaning=card.meaning;const chars=[];let cur="";
    for(let i=0;i<meaning.length;i++){cur+=meaning[i];if(cur.length>=18||i===meaning.length-1){chars.push(cur);cur="";}}
    chars.forEach((line,i)=>ctx.fillText(line,270,530+i*26));
    // Bottom: website + QR placeholder
    ctx.fillStyle="#8a7a60";ctx.font="11px sans-serif";ctx.textAlign="left";
    ctx.fillText("花信风 · 跟着天地节律追一场中国色",50,670);
    ctx.fillText(url,50,688);
    // QR placeholder
    ctx.fillStyle="#2a2018";ctx.fillRect(440,625,70,70);
    ctx.fillStyle="#f5ede0";ctx.fillRect(448,633,54,54);
    ctx.fillStyle="#2a2018";ctx.font="bold 10px sans-serif";ctx.textAlign="center";
    ctx.fillText("扫码",475,655);ctx.fillText("访问",475,670);
    
    // Try to load QR and draw it
    const qrImg=new Image();qrImg.crossOrigin="anonymous";
    qrImg.onload=()=>{ctx.drawImage(qrImg,440,625,70,70);finalize();};
    qrImg.onerror=finalize;
    qrImg.src=qrUrl;
    
    function finalize(){
      canvas.toBlob(blob=>{
        if(navigator.share&&navigator.canShare&&navigator.canShare({files:[new File([blob],"huaxin.png",{type:"image/png"})]})){
          navigator.share({files:[new File([blob],"花信签-"+card.name+".png",{type:"image/png"})],title:"花信风",text:"我的花签"}).catch(function(){});
        }else{
          const a=document.createElement("a");
          a.download="花信签-"+card.name+".png";
          a.href=URL.createObjectURL(blob);
          a.click();
        }
        setCopying(false);
      },"image/png");
    }
  };

  return(<div style={{position:"fixed",inset:0,zIndex:200,background:"rgba(0,0,0,.6)",
    display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(4px)"}} onClick={onClose}>
    <div onClick={e=>e.stopPropagation()} style={{background:"#faf6ef",borderRadius:14,
      width:"min(360px,90vw)",padding:"22px 24px"}}>
      <div style={{textAlign:"center",marginBottom:16}}>
        <div style={{fontSize:14,fontWeight:700,color:"#2a2018",letterSpacing:3}}>分享花签</div>
        <div style={{fontSize:11,color:"#8a7a60",letterSpacing:2,marginTop:4}}>带二维码图片分享 · 多平台</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
        {[
          {k:"save",l:"保存图片",c:"#b08040",ic:"🖼"},
          {k:"wx",l:"微信",c:"#07c160",ic:"💬"},
          {k:"pyq",l:"朋友圈",c:"#07c160",ic:"👥"},
          {k:"xhs",l:"小红书",c:"#fe2c55",ic:"📕"},
          {k:"wb",l:"微博",c:"#e6162d",ic:"🔴"},
          {k:"tw",l:"X/推特",c:"#000",ic:"𝕏"},
          {k:"sys",l:"更多",c:"#8a7a68",ic:"⋯"},
          {k:"close",l:"取消",c:"#c0c0c0",ic:"×"},
        ].map(m=>(
          <button key={m.k} onClick={()=>{if(m.k==="close")onClose();else shareTo(m.k);}}
            disabled={copying&&m.k==="save"}
            style={{border:"none",background:"transparent",cursor:"pointer",padding:"6px 2px",
              display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
            <div style={{width:40,height:40,borderRadius:"50%",background:m.c,color:"#fff",
              display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:700,
              boxShadow:"0 2px 6px "+m.c+"44"}}>
              {copying&&m.k==="save"?"⏳":m.ic}</div>
            <div style={{fontSize:10,color:"#4a4030"}}>{m.l}</div>
          </button>))}
      </div>
    </div>
  </div>);
}

// ═══ Spot Share Card: Generate shareable image with QR for scenic spot ═══
function SpotShareCard({s,onClose}){
  const [copying,setCopying]=useState(false);
  const url=typeof window!=="undefined"?window.location.origin:"https://huaxin.app";
  const qrUrl="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data="+encodeURIComponent(url)+"&bgcolor=f5ede0&color=2a2018&margin=4";
  
  const shareTo=(platform)=>{
    const text="【花信风】"+s.n+" · "+s.sp+"\n"+s.po+"\n预测盛花期："+(s._pred?s._pred.dateStr:"")+"\n——来自花信风";
    if(platform==="wx"||platform==="pyq"){navigator.clipboard.writeText(text+"\n"+url);alert("文案已复制！请打开微信粘贴分享");}
    else if(platform==="xhs"){navigator.clipboard.writeText(text+"\n"+url);alert("文案已复制！请打开小红书APP粘贴发布");}
    else if(platform==="wb"){window.open("https://service.weibo.com/share/share.php?title="+encodeURIComponent(text)+"&url="+encodeURIComponent(url),"_blank");}
    else if(platform==="tw"){window.open("https://twitter.com/intent/tweet?text="+encodeURIComponent(text)+"&url="+encodeURIComponent(url),"_blank");}
    else if(platform==="fb"){window.open("https://www.facebook.com/sharer/sharer.php?u="+encodeURIComponent(url)+"&quote="+encodeURIComponent(text),"_blank");}
    else if(platform==="save"){downloadCard();return;}
    else if(platform==="lk"){navigator.clipboard.writeText(url);alert("链接已复制");}
    else{if(navigator.share)navigator.share({title:"花信风·"+s.n,text:text,url:url}).catch(function(){});else{navigator.clipboard.writeText(text+"\n"+url);alert("已复制");}}
    onClose();
  };

  const downloadCard=()=>{
    setCopying(true);
    const canvas=document.createElement("canvas");
    canvas.width=540;canvas.height=720;
    const ctx=canvas.getContext("2d");
    // Background gradient
    const bg=ctx.createLinearGradient(0,0,0,720);
    bg.addColorStop(0,"#f5ede0");bg.addColorStop(.5,s.c+"15");bg.addColorStop(1,"#e8d8b8");
    ctx.fillStyle=bg;ctx.fillRect(0,0,540,720);
    // Border
    ctx.strokeStyle=s.c;ctx.lineWidth=2;ctx.strokeRect(20,20,500,680);
    ctx.lineWidth=.5;ctx.strokeStyle="#b08040";ctx.strokeRect(28,28,484,664);
    // Top band with color
    ctx.fillStyle=s.c;ctx.fillRect(28,28,484,8);
    // Season badge
    const seasonMap={spring:"🌸 春",summer:"🪷 夏",autumn:"🍂 秋",winter:"❄ 冬"};
    ctx.fillStyle="#fff";ctx.fillRect(50,60,70,28);ctx.strokeStyle=s.c;ctx.lineWidth=1;ctx.strokeRect(50,60,70,28);
    ctx.fillStyle="#3a2818";ctx.font="bold 14px 'Noto Serif SC',serif";ctx.textAlign="center";
    ctx.fillText(seasonMap[s.s]||"花",85,80);
    // Flower circle
    ctx.fillStyle=s.c+"33";ctx.beginPath();ctx.arc(270,175,55,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=s.c;ctx.beginPath();ctx.arc(270,175,42,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#fff";ctx.font="bold 28px 'Noto Serif SC',serif";ctx.fillText(s.sp,270,188);
    // Spot name
    ctx.fillStyle="#2a2018";ctx.font="bold 34px 'Noto Serif SC',serif";
    ctx.fillText(s.n,270,280);
    // Subtitle  
    ctx.fillStyle=s.c;ctx.font="16px 'Noto Serif SC',serif";
    ctx.fillText("· "+s.sp+" ·",270,310);
    // Status
    const status=s._st?s._st.st:"";
    if(status){
      ctx.fillStyle=s.c;ctx.fillRect(200,330,140,30);
      ctx.fillStyle="#fff";ctx.font="bold 14px 'Noto Serif SC',serif";
      ctx.fillText(status,270,350);
    }
    // Poem
    ctx.fillStyle="#4a4030";ctx.font="italic 22px 'Noto Serif SC',serif";
    const poemLines=s.po.split('，');
    poemLines.forEach((line,i)=>ctx.fillText(line+(i<poemLines.length-1?"，":""),270,410+i*38));
    // Divider
    ctx.strokeStyle=s.c+"55";ctx.lineWidth=1;ctx.beginPath();
    ctx.moveTo(140,490);ctx.lineTo(400,490);ctx.stroke();
    // Prediction
    if(s._pred){
      ctx.fillStyle="#8a6a40";ctx.font="13px 'Noto Serif SC',serif";
      ctx.fillText("🌸 预测盛花期",270,520);
      ctx.fillStyle="#2a2018";ctx.font="bold 20px 'Noto Serif SC',serif";
      ctx.fillText(s._pred.dateStr,270,550);
      ctx.fillStyle="#8a6a40";ctx.font="12px 'Noto Serif SC',serif";
      ctx.fillText("置信度 "+s._pred.confidence+"%",270,570);
    }
    // Tip
    ctx.fillStyle="#5a4a38";ctx.font="14px 'Noto Serif SC',serif";
    ctx.fillText(s.tp,270,605);
    // Bottom
    ctx.fillStyle="#8a7a60";ctx.font="11px sans-serif";ctx.textAlign="left";
    ctx.fillText("花信风 · 跟着天地节律追一场中国色",50,665);
    ctx.fillText(url,50,685);
    // QR placeholder
    ctx.fillStyle="#2a2018";ctx.fillRect(435,620,75,75);
    ctx.fillStyle="#f5ede0";ctx.fillRect(443,628,59,59);
    ctx.fillStyle="#2a2018";ctx.font="bold 10px sans-serif";ctx.textAlign="center";
    ctx.fillText("扫码",473,652);ctx.fillText("访问",473,670);
    
    // Load and draw actual QR
    const qrImg=new Image();qrImg.crossOrigin="anonymous";
    qrImg.onload=()=>{ctx.drawImage(qrImg,438,623,70,70);finalize();};
    qrImg.onerror=finalize;
    qrImg.src=qrUrl;
    
    function finalize(){
      canvas.toBlob(blob=>{
        if(navigator.share&&navigator.canShare&&navigator.canShare({files:[new File([blob],"huaxin.png",{type:"image/png"})]})){
          navigator.share({files:[new File([blob],s.n+".png",{type:"image/png"})],title:"花信风·"+s.n,text:s.po}).catch(function(){});
        }else{
          const a=document.createElement("a");
          a.download="花信风-"+s.n+".png";
          a.href=URL.createObjectURL(blob);
          a.click();
        }
        setCopying(false);onClose();
      },"image/png");
    }
  };

  return(<div style={{position:"fixed",inset:0,zIndex:200,background:"rgba(0,0,0,.6)",
    display:"flex",alignItems:"flex-end",justifyContent:"center",backdropFilter:"blur(4px)"}} onClick={onClose}>
    <div onClick={e=>e.stopPropagation()} style={{background:"#faf6ef",width:"100%",maxWidth:480,
      borderRadius:"14px 14px 0 0",padding:"22px 24px 28px"}}>
      <div style={{textAlign:"center",marginBottom:16}}>
        <div style={{fontSize:14,fontWeight:700,color:"#2a2018",letterSpacing:3}}>分享 · {s.n}</div>
        <div style={{fontSize:11,color:"#8a7a60",letterSpacing:2,marginTop:4}}>带官网二维码的花卉卡片</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
        {[
          {k:"save",l:"保存图片",c:"#c06040",ic:"🖼"},
          {k:"wx",l:"微信",c:"#07c160",ic:"💬"},
          {k:"pyq",l:"朋友圈",c:"#07c160",ic:"👥"},
          {k:"xhs",l:"小红书",c:"#fe2c55",ic:"📕"},
          {k:"wb",l:"微博",c:"#e6162d",ic:"🔴"},
          {k:"tw",l:"X/推特",c:"#000",ic:"𝕏"},
          {k:"fb",l:"Facebook",c:"#4267b2",ic:"f"},
          {k:"sys",l:"更多",c:"#8a7a68",ic:"⋯"},
        ].map(m=>(
          <button key={m.k} onClick={()=>shareTo(m.k)}
            disabled={copying&&m.k==="save"}
            style={{border:"none",background:"transparent",cursor:"pointer",padding:"6px 2px",
              display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
            <div style={{width:44,height:44,borderRadius:"50%",background:m.c,color:"#fff",
              display:"flex",alignItems:"center",justifyContent:"center",fontSize:19,fontWeight:700,
              boxShadow:"0 2px 8px "+m.c+"44"}}>
              {copying&&m.k==="save"?"⏳":m.ic}</div>
            <div style={{fontSize:11,color:"#4a4030"}}>{m.l}</div>
          </button>))}
      </div>
      <button onClick={onClose} style={{display:"block",margin:"18px auto 0",
        border:"none",background:"#f0ece4",borderRadius:20,padding:"8px 28px",
        cursor:"pointer",fontSize:13,color:"#8a7a68"}}>取消</button>
    </div>
  </div>);
}

// ═══ Collapsible Nearby Panel ═══
function NearbyPanel({spots,sel,setSel,setWz,setWc,t}){
  const [collapsed,setCollapsed]=useState(false);
  const list=spots.filter(s=>((s._st&&s._st.l)||0)>=1).slice(0,20);
  
  if(collapsed)return(
    <button onClick={()=>setCollapsed(false)} title="展开附近花事列表"
      style={{position:"absolute",left:8,top:95,zIndex:25,
        border:"1px solid #e0dcd4",background:"rgba(250,245,237,.95)",borderRadius:8,
        padding:"8px 10px",cursor:"pointer",boxShadow:"0 1px 6px rgba(0,0,0,.06)",
        display:"flex",alignItems:"center",gap:6}}>
      <span style={{fontSize:14}}>📍</span>
      <span style={{fontSize:11,color:"#3a2818",fontWeight:700,letterSpacing:1}}>附近·{list.length}</span>
      <span style={{fontSize:10,color:"#8a7a68"}}>▸</span>
    </button>);
  
  return(<div style={{position:"absolute",left:8,top:95,maxHeight:"calc(100vh - 160px)",zIndex:25,
    background:"rgba(250,245,237,.96)",backdropFilter:"blur(8px)",borderRadius:8,
    padding:"8px 8px 6px",boxShadow:"0 1px 8px rgba(0,0,0,.06)",width:200,overflowY:"auto",
    border:"1px solid rgba(0,0,0,.04)"}}>
    {/* Header with collapse */}
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6,
      paddingBottom:5,borderBottom:"1px solid #ece6dc"}}>
      <div>
        <div style={{fontSize:12,color:"#3a2818",letterSpacing:2,fontWeight:700}}>📍 {t.nearby_title}</div>
        <div style={{fontSize:10,color:"#8a7a68"}}>共{spots.length}个 · 500km内</div>
      </div>
      <button onClick={()=>setCollapsed(true)} title="收起"
        style={{border:"none",background:"none",cursor:"pointer",color:"#8a7a68",fontSize:12,padding:2}}>◂</button>
    </div>
    {list.map(s=>{
      const sm=SM[s.s];
      return(<div key={s.id} onClick={()=>{setSel(s);setWz(5);setWc([s.lon,s.lat]);}}
        style={{display:"flex",alignItems:"center",gap:4,padding:"4px 3px",cursor:"pointer",
          borderBottom:"1px solid rgba(0,0,0,.03)",borderRadius:3,
          background:(sel&&sel.id)===s.id?s.c+"15":"transparent"}}>
        <div style={{width:20,height:20,flexShrink:0,borderRadius:"50%",
          background:"rgba(255,255,255,.8)",border:"1px solid "+s.c+"44",
          display:"flex",alignItems:"center",justifyContent:"center"}}>
          <FI sp={s.sp} sz={13} co={s.c}/></div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:12,color:"#3a2818",fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
            {s.n.split("·")[1]||s.n}</div>
          <div style={{fontSize:10,color:"#8a7a68",display:"flex",gap:3}}>
            <span>{Math.round(s._dist||0)}km</span>
            <span style={{color:sm.c}}>{sm.i}{s.pk[0]}月</span>
            <span style={{color:s.c}}>{(s._st?s._st.st:"")}</span>
          </div>
        </div>
      </div>);
    })}
  </div>);
}

// ═══ Scroll Landing ═══
function ScrollLanding({onEnter}){
  const cs=getSeason();const sm=SM[cs];
  const poems={spring:"桃花一簇开无主\n可爱深红爱浅红",summer:"小荷才露尖尖角\n早有蜻蜓立上头",autumn:"停车坐爱枫林晚\n霜叶红于二月花",winter:"忽如一夜春风来\n千树万树梨花开"};
  const [dx,setDx]=useState(0);const [dg,setDg]=useState(false);const [en,setEn]=useState(false);const sr=useRef(null);const cr=useRef(null);
  const [pulse,setPulse]=useState(true);
  useEffect(()=>{const t=setInterval(()=>setPulse(p=>!p),1500);return()=>clearInterval(t);},[]);
  const hs=e=>{e.preventDefault();sr.current={x:e.touches?e.touches[0].clientX:e.clientX,d:dx};setDg(true);};
  const hm=e=>{if(!dg||!sr.current)return;const x=e.touches?e.touches[0].clientX:e.clientX;
    setDx(Math.max(0,Math.min(1,sr.current.d+(x-sr.current.x)/(((cr.current?cr.current.offsetWidth:600))*.4))));};
  const he=()=>{setDg(false);if(dx>.5){setDx(1);setTimeout(()=>{setEn(true);setTimeout(onEnter,300);},150);}else setDx(0);};
  // 千里江山图色调
  const qp={spring:{s:"#e8dcd0",m1:"#3a6b5a",m2:"#4a8a6a",w:"#6aaab0",t:"#d4756b"},
    summer:{s:"#d8d4c0",m1:"#2a5a48",m2:"#3a7858",w:"#5898a0",t:"#5a8a50"},
    autumn:{s:"#e0d0b8",m1:"#8a6a30",m2:"#a08040",w:"#7090a0",t:"#c8703a"},
    winter:{s:"#e0dcd8",m1:"#6a7a80",m2:"#8a9098",w:"#8aa0b0",t:"#6a8aaa"}}[cs];
  return(<div ref={cr} style={{position:"fixed",inset:0,zIndex:200,
    background:"linear-gradient(180deg,"+qp.s+","+qp.s+"dd,"+qp.s+"aa)",
    display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
    opacity:en?0:1,transition:"opacity .3s",userSelect:"none",touchAction:"none"
  }} onPointerMove={hm} onPointerUp={he} onPointerLeave={he} onTouchMove={hm} onTouchEnd={he}>
    {/* 千里江山图风格 SVG 背景 */}
    <svg viewBox="0 0 1200 400" preserveAspectRatio="xMidYMax slice" style={{position:"absolute",bottom:0,left:0,width:"100%",height:"55%",opacity:.25}}>
      <defs><linearGradient id="lmist" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={qp.s} stopOpacity="1"/><stop offset="100%" stopColor={qp.s} stopOpacity="0"/></linearGradient></defs>
      {/* Far mountains - 千里江山图 的层叠远山 */}
      <path d="M0,280 Q100,180 200,220 T400,160 T600,200 T800,150 T1000,190 T1200,170 L1200,400 L0,400Z" fill={qp.m1} opacity=".15"/>
      <path d="M0,300 Q150,200 300,250 T500,190 T700,230 T900,180 T1100,210 L1200,220 L1200,400 L0,400Z" fill={qp.m2} opacity=".2"/>
      {/* Near mountains with peaks */}
      <path d="M0,340 Q80,260 180,290 T350,240 T500,280 T650,230 T800,270 T950,240 T1100,260 L1200,280 L1200,400 L0,400Z" fill={qp.m1} opacity=".25"/>
      {/* Water and mist */}
      <rect x="0" y="350" width="1200" height="50" fill={qp.w} opacity=".12"/>
      <rect x="0" y="250" width="1200" height="60" fill="url(#lmist)" opacity=".3"/>
      {/* Scattered trees */}
      {[100,250,420,580,750,900,1050].map((x,i)=><circle key={i} cx={x} cy={310+Math.sin(i*2.3)*15} r={6+Math.sin(i*1.7)*3} fill={qp.t} opacity=".15"/>)}
      {/* Boats on water (春江) */}
      {cs==="spring"&&<><path d="M300,365 Q310,358 320,365" stroke={qp.m1} strokeWidth="1" fill="none" opacity=".2"/><line x1="310" y1="358" x2="310" y2="348" stroke={qp.m1} strokeWidth=".5" opacity=".15"/></>}
      {/* Flying birds */}
      {[400,450,480].map((x,i)=><path key={"b"+i} d={`M${x},${120+i*8} q5,-4 10,0 q5,4 10,0`} stroke={qp.m1} strokeWidth=".8" fill="none" opacity=".12"/>)}
    </svg>
    {/* Title */}
    <div style={{marginBottom:18,textAlign:"center",opacity:1-dx*1.5,transition:dg?"none":"all .3s",position:"relative",zIndex:2}}>
      <div style={{fontSize:"min(42px,8vw)",fontWeight:900,color:C.text,letterSpacing:12}}>花信风</div>
      <div style={{fontSize:"min(13px,3vw)",color:C.tl,letterSpacing:4,marginTop:6}}>跟着天地节律 · 追一场中国色</div></div>
    {/* Scroll */}
    <div style={{position:"relative",width:"min(460px,80vw)",height:"min(140px,20vh)",zIndex:2}}>
      <div style={{position:"absolute",left:0,top:0,bottom:0,width:16,borderRadius:8,background:"linear-gradient(90deg,#a07848,#c8a070,#b89060,#a07848)",boxShadow:"2px 0 6px rgba(0,0,0,.15)",zIndex:5}}/>
      <div style={{position:"absolute",left:16,right:16,top:0,bottom:0,overflow:"hidden"}}>
        <div style={{position:"absolute",left:0,top:0,bottom:0,width:(dx*100)+"%",
          background:"linear-gradient(180deg,#f8f2e8,#f0e8dc,#f8f2e8)",
          transition:dg?"none":"width .3s",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden"}}>
          {dx>.2&&<div style={{textAlign:"center",padding:10,opacity:Math.min(1,(dx-.2)*3),whiteSpace:"pre-line",minWidth:180}}>
            <div style={{fontSize:"min(14px,3.5vw)",color:sm.c,letterSpacing:4,lineHeight:2.2}}>{poems[cs]}</div></div>}</div></div>
      <div onPointerDown={hs} onTouchStart={hs}
        style={{position:"absolute",left:(12+dx*66)+"%",top:0,bottom:0,width:16,borderRadius:8,
          background:"linear-gradient(90deg,#a07848,#c8a070,#b89060,#a07848)",boxShadow:"-2px 0 6px rgba(0,0,0,.15)",
          cursor:"grab",transition:dg?"none":"all .3s",zIndex:5}}/></div>
    {/* Animated hint */}
    <div style={{marginTop:14,display:"flex",alignItems:"center",gap:8,zIndex:2,
      opacity:dx>0?0.2:0.6,transition:"opacity .3s"}}>
      <span style={{fontSize:16,transform:pulse?"translateX(-4px)":"translateX(0)",transition:"transform .4s",color:C.tl}}>☞</span>
      <span style={{fontSize:13,color:C.tl,letterSpacing:4}}>拖动卷轴，展开花事</span>
      <span style={{fontSize:16,transform:pulse?"translateX(4px)":"translateX(0)",transition:"transform .4s",color:C.tl}}>☜</span>
    </div>
    <button onClick={()=>{setDx(1);setTimeout(()=>{setEn(true);setTimeout(onEnter,200);},100);}}
      style={{position:"absolute",bottom:"min(20px,4vh)",border:"none",background:"transparent",
        cursor:"pointer",fontSize:12,color:C.tl,opacity:0.35,letterSpacing:3,zIndex:2}}>
      {"直接进入"}</button>
  </div>);
}

// ═══ Marker / Card / Wheel / Rank ═══
function Mk({s,px,py,zoom,onClick,hl,fav,checked}){
  const [hov,setHov]=useState(false);const [sh,setSh]=useState(false);
  const st=s._st||{st:"...",l:1};const hot=st.l>=3,dead=st.l===0;const pred=s._pred;
  useEffect(()=>{const t=setTimeout(()=>setSh(true),25+s.id*10);return()=>clearTimeout(t);},[s.id]);
  const base=hl?28:(hot?18:12);const sz=base;
  // Partial counter-scale: markers shrink slower than map grows
  const cs=Math.max(.5,1/Math.sqrt(zoom));
  if(dead&&!hl)return null;
  return(<div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} onClick={onClick}
    style={{position:"absolute",left:px,top:py,
      transform:"translate(-50%,-50%) scale("+(sh?(hov?cs*1.12:cs):0)+")",
      opacity:sh?(dead?(hl?0.35:0.15):1):0,transition:"all .2s cubic-bezier(.34,1.56,.64,1)",
      cursor:"pointer",zIndex:hov?20:10,textAlign:"center",filter:hl?"drop-shadow(0 0 6px "+s.c+")":"none"}}>
    {hot&&<div style={{position:"absolute",left:"50%",top:"50%",transform:"translate(-50%,-50%)",
      width:sz*2.4,height:sz*2.4,borderRadius:"50%",background:"radial-gradient(circle,"+s.c+"20,transparent 70%)",animation:"pulse 2.5s ease-in-out infinite"}}></div>}
    <div style={{width:sz,height:sz,borderRadius:"50%",margin:"0 auto",background:dead?"#e0d8d0":"rgba(255,255,255,.85)",
      border:"1.5px solid "+(dead?"#c0b8b0":s.c)+"55",
      boxShadow:dead?"none":"0 2px 4px "+s.c+"33",
      display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden"}}>
      {dead?<span style={{fontSize:sz*.4,opacity:0.3}}>·</span>:<FI sp={s.sp} sz={sz*(hl?0.8:0.65)} co={s.c}/>}
      {fav&&<div style={{position:"absolute",top:-2,right:-2,fontSize:8,color:"#e06050"}}>♥</div>}
      {checked&&<div style={{position:"absolute",bottom:-2,right:-2,fontSize:7,color:"#c8a050"}}>📍</div>}</div>
    {(zoom>=1.5||hl)&&!dead&&<div style={{marginTop:2,fontSize:hl?11:11,color:C.text,whiteSpace:"nowrap",
      textShadow:"0 1px 3px "+C.bg,fontWeight:600,letterSpacing:.5,opacity:hov?1:.65}}>{s.n.split("·")[1]||s.n}</div>}
    {hl&&!dead&&<div style={{fontSize:10,color:s.c,opacity:.7}}>{s._pred?s._pred.dateStr:s.pk[0]+"月"}</div>}
    {hov&&<div style={{position:"absolute",bottom:"calc(100% + 6px)",left:"50%",transform:"translateX(-50%)",
      background:"rgba(250,245,237,.96)",backdropFilter:"blur(8px)",padding:"8px 12px",borderRadius:8,
      boxShadow:"0 3px 14px rgba(0,0,0,.08)",whiteSpace:"nowrap",zIndex:50}}>
      <div style={{fontSize:14,fontWeight:700,color:C.text,letterSpacing:2}}>{s.n}</div>
      <div style={{fontSize:12,color:dead?"#aaa":s.c,marginTop:2}}>{s.sp}·{st.st}</div>
      {pred&&<div style={{fontSize:11,color:C.accent,marginTop:2,fontWeight:600}}>
        🌡 预测盛期：{pred.dateStr} {pred.daysUntil>0?"("+pred.daysUntil+"天后)":"(已到)"} · 置信度{pred.confidence}%</div>}
      {s._dist!=null&&<div style={{fontSize:11,color:C.accent,marginTop:2}}>距你{Math.round(s._dist)}km</div>}
    </div>}</div>);
}
const MkMemo=React.memo(Mk);

// ═══ Generative SVG landscape per season/flower ═══
function LandscapeSVG({season,color,w,h}){
  const palettes={
    spring:{sky:"#e8dcd0",mtn1:"#c8b8a0",mtn2:"#a8c8a0",water:"#a0c0d0",tree:color||"#f0a0b0"},
    summer:{sky:"#d8d0c0",mtn1:"#8aaa78",mtn2:"#6a9a60",water:"#80b8c8",tree:color||"#60a050"},
    autumn:{sky:"#e0d0b8",mtn1:"#c8a878",mtn2:"#d09848",water:"#90aab8",tree:color||"#d06830"},
    winter:{sky:"#e0dcd8",mtn1:"#c8c0b8",mtn2:"#d8d0c8",water:"#a8b8c8",tree:color||"#b0c8d8"},
  };
  const p=palettes[season]||palettes.spring;
  // Seeded random based on color
  const seed=color?color.charCodeAt(1)*17+color.charCodeAt(3)*31:42;
  const r=(i)=>Math.abs(Math.sin(seed*0.618+i*2.718))*1;
  return(<svg viewBox={"0 0 "+w+" "+h} style={{width:"100%",height:h,display:"block"}}>
    <defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor={p.sky}/><stop offset="100%" stopColor={p.sky+"88"}/></linearGradient></defs>
    <rect width={w} height={h} fill="url(#sky)"/>
    {/* Far mountains */}
    <path d={`M0,${h*.55} Q${w*.15},${h*(.25+r(1)*.15)} ${w*.3},${h*(.4+r(2)*.1)} T${w*.6},${h*(.3+r(3)*.12)} T${w},${h*.45} L${w},${h} L0,${h}Z`} fill={p.mtn1} opacity=".25"/>
    {/* Near mountains */}
    <path d={`M0,${h*.7} Q${w*.2},${h*(.4+r(4)*.15)} ${w*.4},${h*(.55+r(5)*.1)} T${w*.7},${h*(.45+r(6)*.1)} T${w},${h*.6} L${w},${h} L0,${h}Z`} fill={p.mtn2} opacity=".2"/>
    {/* Water */}
    <rect x="0" y={h*.78} width={w} height={h*.22} fill={p.water} opacity=".15"/>
    {/* Trees/flowers scattered */}
    {[.15,.3,.5,.7,.85].map((x,i)=><circle key={i} cx={w*x} cy={h*(.68+r(i+7)*.1)} r={4+r(i+10)*4} fill={p.tree} opacity={.2+r(i+12)*.15}/>)}
    {/* Mist */}
    <rect x="0" y={h*.5} width={w} height={h*.2} fill="white" opacity=".08"/>
  </svg>);
}
const LandscapeSVGMemo=React.memo(LandscapeSVG);

// ═══ 景点详情增强 (Travel Info System) ═══
// 区域级建议 (Region-level tips)
const REGION_INFO={
  "华北":{climate:"春干旱多风，4月沙尘偶现",transport:"高铁网络密集，北京/天津/石家庄为核心枢纽",tip:"早春干冷，赏花建议午后，风沙大时注意口罩"},
  "华东":{climate:"春雨绵绵，气温回升较快",transport:"高铁/地铁便利，上海/杭州/南京为交通枢纽",tip:"江南烟雨是最佳赏花意境，带伞常备"},
  "华南":{climate:"全年温暖，花期较早",transport:"广州/深圳机场直达，地铁覆盖完善",tip:"高温多湿，防晒防蚊，清晨傍晚最宜赏花"},
  "华中":{climate:"四季分明，春秋宜人",transport:"武汉/长沙/郑州高铁枢纽",tip:"春季赏花黄金期，3-5月天气最佳"},
  "西南":{climate:"高原气候，昼夜温差大",transport:"成都/昆明/贵阳机场为主，自驾更便利",tip:"紫外线强带防晒，高原地区注意高反"},
  "西北":{climate:"干旱少雨，日照充足",transport:"西安/兰州/乌鲁木齐机场，景区间距大",tip:"早晚温差大多准备衣物，长途需租车"},
  "东北":{climate:"夏短冬长，春秋花期紧凑",transport:"哈尔滨/长春/沈阳机场，高铁相连",tip:"5-6月是黄金窗口期，花期集中"},
  "西藏":{climate:"高海拔，紫外线极强",transport:"拉萨贡嘎机场，需提前准备进藏",tip:"必备防晒、红景天、保暖衣物，缓慢适应高反"},
  "台湾":{climate:"亚热带海洋气候",transport:"桃园/高雄机场，环岛高铁便利",tip:"花季集中2-3月，需提前预约民宿"},
  "南海":{climate:"热带海洋性，全年温暖",transport:"海口/三亚机场，岛际需船运",tip:"避开台风季（6-10月），防晒为重"},
};
// 花种级游玩建议 (Species-level tips)
const SPECIES_INFO={
  "牡丹":{duration:"最佳花期约10-14天，建议花开3-5天后前往",best:"洛阳、菏泽为两大核心产区，数千品种",etiquette:"名园多需门票，禁止攀折"},
  "樱花":{duration:"花期极短，约7-10天。赏花窗口容易错过",best:"武汉大学、无锡鼋头渚、昆明圆通山",etiquette:"人流拥挤，建议早上7-9点或傍晚"},
  "梅花":{duration:"花期较长，约20-30天",best:"南京梅花山、武汉东湖、苏州邓尉",etiquette:"梅雨天气多，带伞；注意踏雪寻梅的好意境"},
  "桃花":{duration:"花期10-15天",best:"西藏林芝、北京平谷、成都龙泉驿",etiquette:"春风大注意保暖"},
  "荷花":{duration:"7-8月为盛期，花期较长",best:"杭州西湖、济南大明湖、洪泽湖",etiquette:"夏季酷热，清晨荷香最浓；可配合赏日出"},
  "菊花":{duration:"秋菊花期10-11月",best:"开封、北京北海、杭州植物园",etiquette:"重阳节前后最佳，可饮菊花酒"},
  "油菜花":{duration:"3月下旬至4月初约15-20天",best:"婺源、罗平、青海湖",etiquette:"视野开阔，避开周末人流，无人机需注意限飞"},
  "杜鹃花":{duration:"花期约30-40天",best:"贵州百里杜鹃、川西、云南大理",etiquette:"山地景观，注意登山装备"},
  "胡杨":{duration:"10月中旬至11月初，窗口约15天",best:"额济纳、轮台、塔里木",etiquette:"沙漠地区注意饮水防晒，租车必备"},
  "彩林":{duration:"10-11月约3周",best:"米亚罗、九寨沟、毕棚沟、稻城亚丁",etiquette:"高原地区需适应，早晚温差极大"},
  "薰衣草":{duration:"6-7月盛花期约20天",best:"新疆伊犁霍城、北疆",etiquette:"紫外线强需防晒，有蜂注意安全"},
  "格桑花":{duration:"7-9月花期较长",best:"青藏高原各地草甸",etiquette:"尊重藏族文化，切勿采摘"},
  "梨花":{duration:"花期约10-12天",best:"安徽砀山、金川、新疆库尔勒",etiquette:"先花后叶，雨后最美"},
  "杏花":{duration:"花期约7-10天",best:"新疆伊犁吐尔根、陕西关中",etiquette:"与桃花相似但略早，粉白色调更雅"},
  "银杏":{duration:"11月中旬至12月初约15天",best:"腾冲银杏村、邳州、成都",etiquette:"风大时金叶纷飞最美"},
  "玉兰花":{duration:"3月花期约7-10天",best:"上海静安公园、南京莫愁湖、杭州",etiquette:"花期极短且怕大风大雨，需把握时机"},
  "紫藤":{duration:"4-5月花期约15-20天",best:"洛阳中国国花园、苏州拙政园",etiquette:"花架下拍照最佳，光影绝美"},
  "紫荆花":{duration:"3-4月花期约15天",best:"湖南大学、成都望江公园",etiquette:"先花后叶，满树紫红"},
  "丁香花":{duration:"4-5月花期约14天",best:"哈尔滨、大庆、长春",etiquette:"北方春天标志，花香浓郁"},
  "红枫":{duration:"11月中旬至12月初约3-4周",best:"苏州天平山、南京栖霞山、北京香山",etiquette:"经霜后最艳，赏叶也赏诗"},
  "白桦林":{duration:"9月底至10月中旬约3周",best:"新疆喀纳斯、内蒙古阿尔山",etiquette:"秋色最佳，清晨有雾气最美"},
  "兰花":{duration:"多数春兰3-4月开花",best:"浙江兰溪、四川乐山",etiquette:"幽林深处寻访，尊重野生环境"},
  "桂花":{duration:"9-10月花期约15-20天",best:"杭州满陇桂雨、苏州光福、桂林",etiquette:"闻香重于观形，夜晚更浓"},
  "向日葵":{duration:"7-8月花期约20天",best:"新疆阿勒泰、甘肃张掖、内蒙古",etiquette:"正午时分金色最灿烂"},
};
// 重点景点 Top 级特色信息（mfw关键字匹配）
const SPOT_INFO_KEY={
  "洛阳国花园":{addr:"河南省洛阳市西工区王城大道",ticket:"25元(旺季35元)",hours:"8:00-18:00",station:"洛阳站/洛阳龙门站",bus:"9/48/50路"},
  "故宫博物院":{addr:"北京市东城区景山前街4号",ticket:"60元(淡季40元，需预约)",hours:"8:30-17:00(周一闭)",station:"地铁1号线天安门东",bus:"1/2/5路",website:"https://www.dpm.org.cn/"},
  "颐和园":{addr:"北京市海淀区新建宫门路19号",ticket:"30元(淡季20元)",hours:"6:30-18:00",station:"地铁4号线北宫门/西苑",bus:"469/539",website:"https://www.summerpalace-china.com/"},
  "武汉大学":{addr:"湖北省武汉市武昌区八一路299号",ticket:"樱花季预约制",hours:"樱花季7:00-17:00",station:"地铁2号线广埠屯",bus:"543/591",website:"https://www.whu.edu.cn/"},
  "鼋头渚":{addr:"江苏省无锡市滨湖区鼋渚路1号",ticket:"90元",hours:"7:30-17:30",station:"无锡站/地铁1号线",bus:"K1/82",website:"http://www.ytz.com.cn/"},
  "西湖":{addr:"浙江省杭州市西湖区",ticket:"免费(部分景点收费)",hours:"全天开放",station:"杭州东站/地铁1号线龙翔桥",bus:"游1-游9",website:"http://www.hzxh.gov.cn/"},
  "南京梅花山":{addr:"江苏省南京市玄武区石象路7号",ticket:"70元(含中山陵)",hours:"6:30-18:30",station:"地铁2号线下马坊",bus:"20/34"},
  "婺源":{addr:"江西省上饶市婺源县",ticket:"5日通票210元",hours:"各景点7:30-17:30",station:"婺源高铁站",bus:"旅游专线",website:"http://www.chinawuyuan.com/"},
  "罗平油菜花":{addr:"云南省曲靖市罗平县",ticket:"景区分别收费(50-120)",hours:"7:00-19:00",station:"罗平站",bus:"景区接驳"},
  "林芝桃花":{addr:"西藏林芝市巴宜区",ticket:"免费(波密桃花沟60)",hours:"全天",station:"林芝米林机场",bus:"需租车/包车"},
  "香山公园":{addr:"北京市海淀区买卖街40号",ticket:"10元(旺季15元)",hours:"6:00-18:00",station:"地铁西郊线香山站",bus:"331/563"},
  "栖霞山":{addr:"江苏省南京市栖霞区栖霞街88号",ticket:"旺季40元",hours:"7:00-17:30",station:"地铁2号线学则路",bus:"栖霞山游1"},
  "黄山":{addr:"安徽省黄山市黄山区汤口镇",ticket:"旺季190元",hours:"6:30-16:30",station:"黄山北站",bus:"景区直通车",website:"http://www.chinahuangshan.gov.cn/"},
  "苍山洱海":{addr:"云南省大理白族自治州大理市",ticket:"苍山90-182(分段)",hours:"8:00-16:30",station:"大理站",bus:"崇圣寺专线"},
  "额济纳":{addr:"内蒙古阿拉善盟额济纳旗",ticket:"胡杨林240元",hours:"7:30-17:30",station:"额济纳机场(季节性)",bus:"景区观光车"},
  "九寨沟":{addr:"四川省阿坝州九寨沟县",ticket:"旺季169元+观光车90",hours:"7:00-18:00",station:"九寨黄龙机场",bus:"景区直通车",website:"https://www.jiuzhai.com/"},
  "伊犁":{addr:"新疆伊犁哈萨克自治州霍城县",ticket:"薰衣草园70-120",hours:"10:00-20:00",station:"伊宁机场",bus:"景区专线"},
  "武大樱花":{addr:"湖北省武汉市武昌区八一路299号",ticket:"樱花季预约",hours:"樱花季7:00-17:00",station:"地铁2号线广埠屯",bus:"543/591"},
  // ═══ 扩充 27 个 ═══
  "拙政园":{addr:"江苏省苏州市姑苏区东北街178号",ticket:"旺季90元/淡季70元",hours:"7:30-17:30",station:"地铁4号线北寺塔",bus:"游1/游2/游5",website:"http://www.szzzy.cn/"},
  "留园":{addr:"江苏省苏州市姑苏区留园路338号",ticket:"旺季55元",hours:"7:30-17:30",station:"苏州火车站",bus:"游1/游2"},
  "圆明园":{addr:"北京市海淀区清华西路28号",ticket:"10元(淡旺季同价)",hours:"7:00-19:00",station:"地铁4号线圆明园",bus:"319/331"},
  "天坛":{addr:"北京市东城区天坛路甲1号",ticket:"联票34元/门票15元",hours:"6:00-22:00",station:"地铁5号线天坛东门",bus:"6/34"},
  "中山陵":{addr:"江苏省南京市玄武区石象路7号",ticket:"免费(需预约)",hours:"8:30-17:00(周一闭)",station:"地铁2号线下马坊",bus:"20/34"},
  "夫子庙":{addr:"江苏省南京市秦淮区贡院街",ticket:"免费(部分展馆收费)",hours:"全天(夜景最美)",station:"地铁1号线三山街",bus:"Y13/4"},
  "乌镇":{addr:"浙江省嘉兴市桐乡市乌镇",ticket:"东栅110元/西栅150元/联票190元",hours:"7:00-17:30",station:"桐乡站",bus:"K350"},
  "周庄":{addr:"江苏省苏州市昆山市周庄镇",ticket:"100元",hours:"8:00-20:00",station:"昆山南站",bus:"周庄专线"},
  "千岛湖":{addr:"浙江省杭州市淳安县千岛湖镇",ticket:"门票+船票120-150",hours:"8:00-17:00",station:"千岛湖站",bus:"景区码头接驳"},
  "普陀山":{addr:"浙江省舟山市普陀区",ticket:"160元(含进山)",hours:"全天",station:"宁波/朱家尖码头乘船",bus:"环山巴士"},
  "泰山":{addr:"山东省泰安市泰山区红门路",ticket:"旺季115元/淡季100元",hours:"全天",station:"泰安站",bus:"K37/3"},
  "华山":{addr:"陕西省渭南市华阴市玉泉路",ticket:"旺季160元+索道150",hours:"全天",station:"华山北站(高铁)",bus:"1/2路"},
  "峨眉山":{addr:"四川省乐山市峨眉山市",ticket:"旺季160元+观光车90",hours:"全天",station:"峨眉山站",bus:"景区专线"},
  "乐山大佛":{addr:"四川省乐山市市中区凌云路",ticket:"80元",hours:"7:30-18:30",station:"乐山站",bus:"3路"},
  "都江堰":{addr:"四川省成都市都江堰市公园路",ticket:"80元",hours:"8:00-18:00",station:"都江堰站",bus:"4/快铁"},
  "青城山":{addr:"四川省成都市都江堰市青城山镇",ticket:"前山90/后山20",hours:"8:00-17:00",station:"青城山站",bus:"101"},
  "阳朔":{addr:"广西桂林市阳朔县",ticket:"西街免费/漓江景区收费",hours:"全天",station:"桂林/阳朔高铁站",bus:"旅游专线"},
  "丽江古城":{addr:"云南省丽江市古城区",ticket:"古城维护费50",hours:"全天",station:"丽江站",bus:"11/16路"},
  "玉龙雪山":{addr:"云南省丽江市玉龙纳西族自治县",ticket:"进山费100+索道180",hours:"7:30-16:00",station:"丽江古城乘专线",bus:"景区巴士"},
  "稻城亚丁":{addr:"四川省甘孜州稻城县",ticket:"146+观光车120",hours:"7:00-17:00",station:"亚丁机场(季节)",bus:"景区专线"},
  "呼伦贝尔":{addr:"内蒙古呼伦贝尔市",ticket:"各景区单独收费",hours:"全天",station:"海拉尔站",bus:"包车/租车"},
  "喀纳斯":{addr:"新疆阿勒泰地区布尔津县",ticket:"旺季260元+区间车",hours:"8:00-20:00",station:"喀纳斯机场",bus:"景区接驳"},
  "兵马俑":{addr:"陕西省西安市临潼区",ticket:"120元",hours:"8:30-17:30",station:"高铁骊山华清池站",bus:"游5/915",website:"http://www.bmy.com.cn/"},
  "鼓浪屿":{addr:"福建省厦门市思明区",ticket:"轮渡35+景点通票90",hours:"轮渡6:30-21:30",station:"厦门站/高崎",bus:"轮渡码头",website:"http://www.gly.cn/"},
  "武夷山":{addr:"福建省南平市武夷山市",ticket:"旺季140元+观光车70",hours:"7:00-17:00",station:"武夷山东站",bus:"景区观光车"},
  "张家界":{addr:"湖南省张家界市武陵源区",ticket:"旺季228元(4日有效)",hours:"7:00-18:00",station:"张家界西站",bus:"景区环保车",website:"http://www.cnzjj.com/"},
  "凤凰古城":{addr:"湖南省湘西州凤凰县",ticket:"免费(景点联票148)",hours:"全天",station:"凤凰古城站",bus:"1/2路"},
};

function getSpotInfo(s){
  var info={};
  // Match specific spot by mfw keyword
  if(s.mfw){
    var keys=Object.keys(SPOT_INFO_KEY);
    for(var i=0;i<keys.length;i++){
      if(s.mfw.includes(keys[i])||keys[i].includes(s.mfw.slice(0,4))){
        info.specific=SPOT_INFO_KEY[keys[i]];break;
      }
    }
  }
  info.region=REGION_INFO[s.rg]||null;
  info.species=SPECIES_INFO[s.sp]||null;
  return info;
}

function Card({s,onClose,isFav,onFav,inTrip,onAddTrip,isChecked,onCheckin,onShowWiki}){
  const [v,setV]=useState(false);const [realAT,setRealAT]=useState(null);
  const [atLoading,setAtLoading]=useState(true);const [atError,setAtError]=useState(false);
  const [note,setNote]=useState("");const [notes,setNotes]=useState([]);
  const [showShare,setShowShare]=useState(false);
  const [ckMode,setCkMode]=useState(false);const [ckNote,setCkNote]=useState("");
  // Load shared notes for this spot
  useEffect(()=>{(async()=>{try{const r=window.storage?await window.storage.get("notes_"+s.id,true):null;
    if(r&&r.value)setNotes(JSON.parse(r.value));}catch{}})();},[s.id]);
  const addNote=async()=>{if(!note.trim())return;
    const nn=[...notes,{t:note.trim(),d:new Date().toLocaleDateString("zh-CN"),ts:Date.now()}].slice(-20);
    setNotes(nn);setNote("");
    try{if(window.storage)await window.storage.set("notes_"+s.id,JSON.stringify(nn),true);}catch{}};
  useEffect(()=>{setTimeout(()=>setV(true),10);},[]);
  // Fetch real accumulated temperature from Open-Meteo with timeout + retry
  const fetchAT=useCallback(()=>{setAtLoading(true);setAtError(false);
    (async()=>{try{
      var now=new Date();var y=now.getFullYear();
      var start=y+"-01-01";var end=now.toISOString().split("T")[0];
      var url="https://archive-api.open-meteo.com/v1/archive?latitude="+s.lat+"&longitude="+s.lon+"&start_date="+start+"&end_date="+end+"&daily=temperature_2m_mean&timezone=Asia/Shanghai";
      // Add 8-second timeout
      var ctrl=new AbortController();var tid=setTimeout(function(){ctrl.abort();},8000);
      var res=await fetch(url,{signal:ctrl.signal});clearTimeout(tid);
      if(!res.ok)throw new Error("HTTP "+res.status);
      var data=await res.json();
      if(data.daily&&data.daily.temperature_2m_mean){
        var at=data.daily.temperature_2m_mean.reduce(function(sum,t){return sum+(t>5?t-5:0);},0);
        setRealAT(Math.round(at));setAtLoading(false);
      }else{throw new Error("No data");}
    }catch(e){setAtError(true);setAtLoading(false);}
    })();
  },[s.id,s.lat,s.lon]);
  useEffect(function(){fetchAT();},[fetchAT]);
  const cl=()=>{setV(false);setTimeout(onClose,120);};const st=s._st||{st:"...",l:1};const sm=SM[s.s];const pred=s._pred;
  const pct=s.th>0&&s._at!=null?Math.min(120,(s._at/s.th)*100):0;
  return(<div style={{position:"fixed",inset:0,zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",
    background:v?"rgba(40,30,20,.3)":"transparent",transition:"background .15s",backdropFilter:v?"blur(4px)":"none"}} onClick={cl}>
    <div onClick={e=>e.stopPropagation()} style={{width:"min(480px,92vw)",transform:v?"none":"translateY(10px)",
      opacity:v?1:0,transition:"all .2s",borderRadius:12,overflow:"hidden",
      boxShadow:"0 12px 40px rgba(0,0,0,.15)"}}>
      {/* Top accent bar */}
      <div style={{height:6,background:s.c}}></div>
      {/* Photo header with SVG fallback */}
      <div style={{position:"relative",overflow:"hidden",height:120,background:"#f0e8d8"}}>
        {(function(){
          var spEn={"牡丹":"peony","樱花":"cherry-blossom","梅花":"plum-blossom","桃花":"peach-blossom",
            "荷花":"lotus","菊花":"chrysanthemum","杜鹃花":"azalea","油菜花":"rapeseed","梨花":"pear-blossom",
            "兰花":"orchid","桂花":"osmanthus","薰衣草":"lavender","向日葵":"sunflower","郁金香":"tulip",
            "红枫":"maple","银杏":"ginkgo","紫藤":"wisteria","紫薇花":"crape-myrtle","胡杨":"populus-euphratica",
            "白桦林":"birch","竹林":"bamboo","玉兰花":"magnolia","玫瑰":"rose","茉莉花":"jasmine"};
          var query=spEn[s.sp]||"flower";
          var photoUrl="https://source.unsplash.com/480x120/?"+query+",china";
          return(<>
            <img src={photoUrl} alt={s.sp}
              onError={function(e){e.target.style.display="none";}}
              style={{width:"100%",height:"100%",objectFit:"cover",opacity:.92}}/>
            {/* SVG landscape fallback (visible if image fails) */}
            <div style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",zIndex:-1}}>
              <LandscapeSVGMemo season={s.s} color={s.c} w={480} h={120}/>
            </div>
          </>);
        })()}
        <div style={{position:"absolute",bottom:0,left:0,right:0,height:30,
          background:"linear-gradient(transparent,#faf6ef)"}}/>
      </div>
      <div style={{background:"#faf6ef",padding:"12px 28px 20px",position:"relative"}}>
        {/* Flower stamp */}
        <div style={{position:"absolute",top:16,right:20,opacity:.6}}><FI sp={s.sp} sz={40} co={s.c}/></div>
        {/* Season + Region */}
        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
          <span style={{fontSize:16,color:sm.c}}>{sm.i}</span>
          <span style={{fontSize:13,color:sm.c,fontWeight:600,letterSpacing:2}}>{sm.l}季</span>
          <span style={{fontSize:12,color:C.tl,marginLeft:4}}>·</span>
          <span style={{fontSize:12,color:C.tl}}>{s.rg}</span>
        </div>
        {/* Name */}
        <h2 style={{fontSize:26,fontWeight:800,color:"#2a1e10",margin:"0 0 6px",letterSpacing:3}}>{s.n}</h2>
        {/* Species + Status */}
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
          <span style={{fontSize:14,color:s.c,fontWeight:600}}>{s.sp}</span>
          <span style={{fontSize:13,color:st.l>=3?"#2a7a40":st.l>=2?s.c:C.tl,
            background:st.l>=3?"#e8f5e0":st.l>=2?s.c+"15":"#f0ece4",
            padding:"2px 10px",borderRadius:12,fontWeight:600}}>{st.st}</span>
        </div>
        {/* Poem */}
        <div style={{margin:"0 0 16px",padding:"10px 16px",background:s.c+"08",
          borderLeft:"3px solid "+s.c+"55",borderRadius:"0 6px 6px 0"}}>
          <div style={{fontSize:16,color:"#3a2818",letterSpacing:3,lineHeight:1.6,fontStyle:"italic"}}>
            {"「"}{s.po}{"」"}</div>
        </div>
        {/* Tip */}
        <div style={{fontSize:14,color:C.text,marginBottom:14}}>
          <span style={{color:C.tl}}>建议：</span>{s.tp}</div>
        {/* Prediction box */}
        {pred&&<div style={{margin:"0 0 14px",padding:"14px 16px",background:"#fdf8f2",borderRadius:8,
          border:"1px solid #e8ddd0"}}>
          <div style={{fontSize:14,fontWeight:700,color:C.accent,marginBottom:6,display:"flex",alignItems:"center",gap:4}}>
            <span style={{fontSize:16}}>🔮</span> 基于3年数据预测</div>
          <div style={{fontSize:16,color:C.text,lineHeight:1.6}}>预测盛花期：
            <strong style={{fontSize:18,color:"#2a1e10"}}>{pred.dateStr}</strong>
            {pred.daysUntil>0?<span style={{color:C.accent,fontWeight:600}}>{" "}({pred.daysUntil}天后)</span>
              :<span style={{color:"#2a7a40",fontWeight:600}}>{" "}(已到/已过)</span>}</div>
          <div style={{fontSize:12,color:C.tl,marginTop:6,lineHeight:1.5}}>
            历史数据：{(s.hist||[]).join(" / ")} · 置信度 <strong>{pred.confidence}%</strong>
            {pred.daysUntil<15&&pred.daysUntil>0&&<span style={{color:C.accent,fontWeight:700}}>{" "}← 临近！精度高</span>}
          </div>
        </div>}
        {/* Progress bar */}
        <div style={{margin:"0 0 14px",padding:"8px 12px",background:"#f8f4ee",borderRadius:6}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:C.tl,marginBottom:4}}>
            <span>积温 {realAT!==null?realAT:(s._at||0)}°C·d {atLoading?"(加载中...)":atError?"(模拟·气象API暂时不可用)":realAT!==null?"(实时)":"(模拟)"}</span><span>阈值 {s.th}</span></div>
          <div style={{height:8,borderRadius:4,background:"#ece6dc",overflow:"hidden"}}>
            <div style={{height:"100%",borderRadius:4,width:Math.min(100,(realAT!==null?realAT:(s._at||0))/s.th*100)+"%",
              background:pct>=100?"linear-gradient(90deg,"+s.c+",#e8a040)":"linear-gradient(90deg,"+s.c+"88,"+s.c+")",
              transition:"width .5s"}}/></div>
        </div>
        {/* Mafengwo link */}
        {s.mfw&&<a href={"https://www.mafengwo.cn/search/q.php?q="+encodeURIComponent(s.mfw)}
          target="_blank" rel="noopener noreferrer"
          style={{display:"flex",alignItems:"center",justifyContent:"center",gap:4,
            padding:"10px 16px",background:"#f8f4ee",borderRadius:8,
            color:C.accent,fontSize:14,fontWeight:600,textDecoration:"none",letterSpacing:2,
            border:"1px solid #e8ddd0",transition:"background .2s"}}>
          🐝 查看马蜂窝景点详情 →</a>}
        {/* ═══ 实用信息 Practical Info ═══ */}
        {(function(){
          var info=getSpotInfo(s);
          if(!info.specific&&!info.region&&!info.species)return null;
          return(<div style={{margin:"12px 0 0",padding:"12px 14px",
            background:"#f8f4ee",borderRadius:8,border:"1px solid #ece6dc"}}>
            <div style={{fontSize:11,color:s.c,letterSpacing:3,fontWeight:700,marginBottom:8,
              display:"flex",alignItems:"center",gap:4}}>
              <span>🧭</span><span>实用信息</span></div>
            {/* Specific spot details (Top 50 key spots) */}
            {info.specific&&<div style={{marginBottom:10,paddingBottom:10,
              borderBottom:"1px dashed #e0dcd4"}}>
              {info.specific.addr&&<div style={{fontSize:12,color:"#3a2818",lineHeight:1.7,marginBottom:3}}>
                <span style={{color:"#8a7a60",display:"inline-block",width:48}}>📍 地址</span>
                {info.specific.addr}</div>}
              {info.specific.ticket&&<div style={{fontSize:12,color:"#3a2818",lineHeight:1.7,marginBottom:3}}>
                <span style={{color:"#8a7a60",display:"inline-block",width:48}}>🎫 门票</span>
                {info.specific.ticket}</div>}
              {info.specific.hours&&<div style={{fontSize:12,color:"#3a2818",lineHeight:1.7,marginBottom:3}}>
                <span style={{color:"#8a7a60",display:"inline-block",width:48}}>⏰ 时间</span>
                {info.specific.hours}</div>}
              {info.specific.station&&<div style={{fontSize:12,color:"#3a2818",lineHeight:1.7,marginBottom:3}}>
                <span style={{color:"#8a7a60",display:"inline-block",width:48}}>🚄 到达</span>
                {info.specific.station}</div>}
              {info.specific.bus&&<div style={{fontSize:12,color:"#3a2818",lineHeight:1.7,marginBottom:3}}>
                <span style={{color:"#8a7a60",display:"inline-block",width:48}}>🚌 公交</span>
                {info.specific.bus}</div>}
              {info.specific.website&&<div style={{fontSize:12,lineHeight:1.7}}>
                <span style={{color:"#8a7a60",display:"inline-block",width:48}}>🌐 官网</span>
                <a href={info.specific.website} target="_blank" rel="noopener noreferrer"
                  style={{color:s.c,textDecoration:"underline"}}>
                  {info.specific.website.replace(/^https?:\/\//,"").replace(/\/$/,"")}</a></div>}
            </div>}
            {/* Species tips */}
            {info.species&&<div style={{marginBottom:8}}>
              <div style={{fontSize:11,color:"#8a7a60",marginBottom:3}}>🌸 {s.sp}赏花贴士</div>
              {info.species.duration&&<div style={{fontSize:11,color:"#3a2818",lineHeight:1.6}}>
                · 花期：{info.species.duration}</div>}
              {info.species.etiquette&&<div style={{fontSize:11,color:"#3a2818",lineHeight:1.6}}>
                · 提示：{info.species.etiquette}</div>}
            </div>}
            {/* Region tips */}
            {info.region&&<div>
              <div style={{fontSize:11,color:"#8a7a60",marginBottom:3}}>🗺 {s.rg}出行</div>
              {info.region.climate&&<div style={{fontSize:11,color:"#3a2818",lineHeight:1.6}}>
                · 气候：{info.region.climate}</div>}
              {info.region.tip&&<div style={{fontSize:11,color:"#3a2818",lineHeight:1.6}}>
                · 贴士：{info.region.tip}</div>}
            </div>}
            {/* Map link */}
            <div style={{display:"flex",gap:6,marginTop:10}}>
              <a href={"https://uri.amap.com/marker?position="+s.lon+","+s.lat+"&name="+encodeURIComponent(s.n)}
                target="_blank" rel="noopener noreferrer"
                style={{flex:1,textAlign:"center",padding:"6px 10px",background:"#f0ece4",
                  borderRadius:6,fontSize:11,color:"#3a2818",textDecoration:"none",
                  border:"1px solid #e0dcd4",fontWeight:600}}>
                🗺 高德地图</a>
              <a href={"https://map.baidu.com/?latlng="+s.lat+","+s.lon+"&title="+encodeURIComponent(s.n)}
                target="_blank" rel="noopener noreferrer"
                style={{flex:1,textAlign:"center",padding:"6px 10px",background:"#f0ece4",
                  borderRadius:6,fontSize:11,color:"#3a2818",textDecoration:"none",
                  border:"1px solid #e0dcd4",fontWeight:600}}>
                🗺 百度地图</a>
            </div>
          </div>);
        })()}
        {HAS_WIKI[s.sp]&&<button onClick={()=>{if(onShowWiki)onShowWiki(s.sp);}}
          style={{display:"flex",alignItems:"center",justifyContent:"center",gap:4,
            padding:"8px 16px",background:s.c+"12",borderRadius:8,
            color:s.c,fontSize:13,fontWeight:600,letterSpacing:2,cursor:"pointer",
            border:"1px solid "+s.c+"33",marginTop:6}}>
          📖 {s.sp}百科 · 诗词 · 花语</button>}
        {/* Action buttons: Favorite + Share */}
        <div style={{display:"flex",gap:8,marginTop:12}}>
          <button onClick={function(){if(onFav)onFav(s.id);}} style={{flex:1,border:"1.5px solid "+(isFav?"#e06050":"#e0dcd4"),
            background:isFav?"#fef5f4":"#faf6ef",borderRadius:8,padding:"8px 12px",cursor:"pointer",
            fontSize:13,fontWeight:600,color:isFav?"#e06050":C.tl,display:"flex",alignItems:"center",justifyContent:"center",gap:4}}>
            {isFav?"♥ 已收藏":"♡ 收藏"}</button>
          <button onClick={function(){if(onAddTrip)onAddTrip(s.id);}} style={{flex:1,border:"1.5px solid "+(inTrip?"#3a8a60":"#e0dcd4"),
            background:inTrip?"#eef8f0":"#faf6ef",borderRadius:8,padding:"8px 12px",cursor:"pointer",
            fontSize:13,fontWeight:600,color:inTrip?"#3a8a60":C.tl,display:"flex",alignItems:"center",justifyContent:"center",gap:4}}>
            {inTrip?"✓ 已加入行程":"+ 加入行程"}</button>
          <button onClick={function(){if(isChecked)return;setCkMode(true);}} style={{border:"1.5px solid "+(isChecked?"#c8a050":"#e0dcd4"),
            background:isChecked?"#fdf8ee":"#faf6ef",borderRadius:8,padding:"8px 12px",cursor:isChecked?"default":"pointer",
            fontSize:13,fontWeight:600,color:isChecked?"#c8a050":C.tl}}>
            {isChecked?"📍已打卡":"📍打卡"}</button>
          <button onClick={()=>setShowShare(true)}
            style={{border:"1.5px solid #e0dcd4",background:"#faf6ef",borderRadius:8,padding:"8px 12px",
              cursor:"pointer",fontSize:13,fontWeight:600,color:C.tl}}>📤</button>
        </div>
        {/* Checkin note dialog */}
        {ckMode&&<div style={{margin:"8px 0",padding:"12px 14px",background:"#fdf8ee",
          borderRadius:8,border:"1.5px solid #c8a050"}}>
          <div style={{fontSize:12,color:"#c8a050",fontWeight:700,letterSpacing:2,marginBottom:8}}>📍 打卡此地</div>
          <input value={ckNote} onChange={e=>setCkNote(e.target.value)}
            placeholder="记录一句话花事笔记（可选）..."
            style={{width:"100%",border:"1px solid #e8e0d4",borderRadius:6,padding:"8px 10px",
              fontSize:12,background:"#fff",outline:"none",fontFamily:"'Noto Serif SC',serif",
              marginBottom:8}}/>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>{if(onCheckin)onCheckin(s.id,ckNote);setCkMode(false);setCkNote("");}}
              style={{flex:1,border:"none",background:"#c8a050",color:"#fff",borderRadius:6,
                padding:"8px",cursor:"pointer",fontSize:12,fontWeight:700,letterSpacing:2}}>
              确认打卡</button>
            <button onClick={()=>{setCkMode(false);setCkNote("");}}
              style={{border:"1px solid #e0dcd4",background:"transparent",borderRadius:6,
                padding:"8px 12px",cursor:"pointer",fontSize:12,color:"#8a7a68"}}>取消</button>
          </div>
        </div>}
        {/* Social share menu */}
        {showShare&&<SpotShareCard s={s} onClose={()=>setShowShare(false)}/>}
        {isChecked&&<div style={{fontSize:11,color:"#c8a050",textAlign:"center",marginTop:4}}>
          🎉 打卡时间：{isChecked.date}</div>}
        {/* Community notes */}
        <div style={{marginTop:12,borderTop:"1px solid #ece6dc",paddingTop:10}}>
          <div style={{fontSize:12,color:C.tl,marginBottom:6,letterSpacing:2}}>💬 花友笔记</div>
          {notes.length===0&&<div style={{fontSize:12,color:C.tl,opacity:.5,textAlign:"center",padding:"8px 0"}}>还没有笔记，做第一个分享的人吧</div>}
          {notes.slice(-5).map((n,i)=>(
            <div key={i} style={{fontSize:12,color:C.text,padding:"4px 0",borderBottom:"1px solid #f5f0e8"}}>
              <span style={{opacity:.5,fontSize:10}}>{n.d}</span> {n.t}</div>))}
          <div style={{display:"flex",gap:4,marginTop:6}}>
            <input value={note} onChange={e=>setNote(e.target.value)} placeholder="写一条花事笔记..."
              onKeyDown={e=>{if(e.key==="Enter")addNote();}}
              style={{flex:1,border:"1px solid #e8e0d4",borderRadius:6,padding:"6px 8px",fontSize:12,
                background:"#faf6ef",outline:"none"}} />
            <button onClick={addNote} style={{border:"none",background:C.accent,color:"#fff",borderRadius:6,
              padding:"6px 12px",cursor:"pointer",fontSize:12,fontWeight:600}}>发送</button>
          </div>
        </div>
      </div>
      <div style={{height:6,background:s.c}}></div></div></div>);
}

function SpeciesWheel({onSelect,selected,spots}){
  const species=[...new Set(FLORA.map(f=>f.sp))];
  const [si,setSi]=useState(Math.max(0,species.indexOf(selected)));
  const [showGrid,setShowGrid]=useState(false);
  const sel=i=>{setSi(i);onSelect(species[i]);};
  useEffect(()=>{const h=e=>{
    if(showGrid)return;
    if(e.key==="ArrowLeft"){setSi(i=>{const n=(i-1+species.length)%species.length;onSelect(species[n]);return n;});e.preventDefault();}
    else if(e.key==="ArrowRight"){setSi(i=>{const n=(i+1)%species.length;onSelect(species[n]);return n;});e.preventDefault();}};
    window.addEventListener("keydown",h);return()=>window.removeEventListener("keydown",h);},[species,showGrid]);
  const count=spots.filter(s=>s.sp===selected&&((s._st&&s._st.l)||0)>0).length;
  const prevSp=species[(si-1+species.length)%species.length];
  const nextSp=species[(si+1)%species.length];
  const prevFl=FLORA.find(f=>f.sp===prevSp);
  const nextFl=FLORA.find(f=>f.sp===nextSp);
  const curFl=FLORA.find(f=>f.sp===selected);
  
  return(<>
    {/* Grid view - all flowers */}
    {showGrid&&<div style={{position:"fixed",inset:0,zIndex:105,background:"rgba(20,15,10,.6)",
      display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(6px)"}}
      onClick={()=>setShowGrid(false)}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#faf6ef",width:"min(640px,92vw)",
        maxHeight:"82vh",borderRadius:14,overflow:"hidden",display:"flex",flexDirection:"column",
        boxShadow:"0 20px 60px rgba(0,0,0,.3)"}}>
        {/* Header */}
        <div style={{padding:"16px 22px",borderBottom:"1px solid #ece6dc",display:"flex",
          justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontSize:16,fontWeight:900,color:C.text,letterSpacing:4}}>🌺 花 谱</div>
            <div style={{fontSize:11,color:C.tl,marginTop:3}}>共 {species.length} 种 · 点击选择</div>
          </div>
          <button onClick={()=>setShowGrid(false)} style={{border:"none",background:"none",
            cursor:"pointer",fontSize:18,color:C.tl}}>{"×"}</button>
        </div>
        {/* Grid */}
        <div style={{flex:1,overflow:"auto",padding:"14px 18px"}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(88px,1fr))",gap:8}}>
            {species.map((sp,i)=>{const fl=FLORA.find(f=>f.sp===sp);
              const cnt=spots.filter(s=>s.sp===sp&&((s._st&&s._st.l)||0)>0).length;
              const isSel=sp===selected;
              return <button key={sp} onClick={()=>{sel(i);setShowGrid(false);}}
                style={{border:"1.5px solid "+(isSel?((fl&&fl.c)||C.accent):"#ece6dc"),
                  background:isSel?((fl&&fl.c)||C.accent)+"15":"#fff",
                  borderRadius:10,padding:"10px 6px",cursor:"pointer",
                  display:"flex",flexDirection:"column",alignItems:"center",gap:4,
                  transition:"all .15s"}}>
                <FI sp={sp} sz={26} co={(fl&&fl.c)}/>
                <div style={{fontSize:11,fontWeight:isSel?700:500,color:isSel?((fl&&fl.c)||C.accent):C.text,
                  letterSpacing:1,lineHeight:1.2}}>{sp}</div>
                {cnt>0&&<div style={{fontSize:9,color:C.tl}}>{cnt}</div>}
              </button>;})}
          </div>
        </div>
      </div>
    </div>}
    
    {/* Compact wheel - always visible (but hidden when grid shown) */}
    <div style={{position:"absolute",top:120,right:8,zIndex:28,width:260,
      background:"rgba(250,245,237,.96)",borderRadius:12,padding:"8px 12px 10px",
      boxShadow:"0 2px 14px rgba(0,0,0,.08)"}}>
      {/* Top: all-flowers button */}
      <button onClick={()=>setShowGrid(true)} style={{display:"block",width:"100%",
        border:"none",background:C.accent+"14",color:C.accent,borderRadius:6,
        padding:"4px 8px",cursor:"pointer",fontSize:11,fontWeight:700,letterSpacing:2,
        marginBottom:8}}>☰ 查看全部 {species.length} 种</button>
      {/* Navigator row */}
      <div style={{display:"flex",alignItems:"center",gap:4}}>
        <button onClick={()=>sel((si-1+species.length)%species.length)}
          style={{border:"none",background:"rgba(255,255,255,.6)",borderRadius:"50%",width:40,height:40,
            cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
            opacity:.6,padding:0}}>
          <FI sp={prevSp} sz={20} co={(prevFl&&prevFl.c)}/>
          <div style={{fontSize:8,color:C.tl,marginTop:-1,whiteSpace:"nowrap"}}>{prevSp.slice(0,3)}</div>
        </button>
        <div style={{fontSize:14,color:C.tl,opacity:.5}}>‹</div>
        <div style={{flex:1,textAlign:"center"}}>
          <div style={{display:"flex",justifyContent:"center",marginBottom:2}}>
            <div style={{width:48,height:48,borderRadius:"50%",background:"rgba(255,255,255,.95)",
              border:"2.5px solid "+((curFl&&curFl.c)||C.accent),
              boxShadow:"0 2px 8px "+((curFl&&curFl.c)||C.accent)+"33",
              display:"flex",alignItems:"center",justifyContent:"center"}}>
              <FI sp={selected} sz={30} co={(curFl&&curFl.c)}/>
            </div>
          </div>
          <div style={{fontSize:13,color:C.text,fontWeight:800,letterSpacing:2,lineHeight:1.1}}>{selected}</div>
          <div style={{fontSize:10,color:C.accent,marginTop:1}}>{count}个观赏地</div>
        </div>
        <div style={{fontSize:14,color:C.tl,opacity:.5}}>›</div>
        <button onClick={()=>sel((si+1)%species.length)}
          style={{border:"none",background:"rgba(255,255,255,.6)",borderRadius:"50%",width:40,height:40,
            cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
            opacity:.6,padding:0}}>
          <FI sp={nextSp} sz={20} co={(nextFl&&nextFl.c)}/>
          <div style={{fontSize:8,color:C.tl,marginTop:-1,whiteSpace:"nowrap"}}>{nextSp.slice(0,3)}</div>
        </button>
      </div>
      <div style={{fontSize:9,color:C.tl,textAlign:"center",marginTop:4,opacity:.5}}>← → 切换</div>
    </div>
  </>);
}

// ═══ 个人花历 (Personal Flower Diary) ═══
function DiaryPanel({onClose,checkins,flora,favs}){
  const [tab,setTab]=useState("badges");
  const [shareBadge,setShareBadge]=useState(null);
  
  const entries=Object.keys(checkins).map(function(id){
    var ck=checkins[id];var spot=flora.find(function(f){return f.id===Number(id);});
    if(!spot)return null;
    return{id:Number(id),date:ck.date,ts:ck.ts,note:ck.note||"",spot:spot};
  }).filter(Boolean).sort(function(a,b){return(b.ts||0)-(a.ts||0);});

  var totalSpots=entries.length;
  var species=[...new Set(entries.map(function(e){return e.spot.sp;}))];
  var regions=[...new Set(entries.map(function(e){return e.spot.rg;}))];
  var seasons=[...new Set(entries.map(function(e){return e.spot.s;}))];
  var favCount=Object.keys(favs).length;
  var noteCount=entries.filter(function(e){return e.note;}).length;
  var seasonNames={spring:"春",summer:"夏",autumn:"秋",winter:"冬"};
  var months=[...new Set(entries.map(function(e){try{return e.date.split("/")[1]||"";}catch(x){return "";}}))].filter(Boolean);
  var ancientCaps=["西安","洛阳","杭州","南京","北京","开封","苏州"];
  var capVisits=entries.filter(function(e){return ancientCaps.some(function(c){return e.spot.n.includes(c);});});
  var hasNorth=entries.some(function(e){return["华北","东北","西北"].includes(e.spot.rg);});
  var hasSouth=entries.some(function(e){return["华南","西南","华东"].includes(e.spot.rg);});

  var tierColors=["#ccc","#cd7f32","#c0c0c0","#ffd700","#b9f2ff"];
  var tierNames=["未解锁","铜","银","金","钻"];
  var tierBg=["#f0f0f0","#fdf4e8","#f5f5f5","#fffbe8","#f0fbff"];

  var allBadges=[
    {cat:"探花者",icon:"🌱",name:"初识花事",desc:"首次打卡赏花",tier:totalSpots>=1?1:0,cur:totalSpots,max:1},
    {cat:"探花者",icon:"🌸",name:"寻芳踏春",desc:"打卡5处赏花地",tier:totalSpots>=5?2:totalSpots>=1?1:0,cur:totalSpots,max:5},
    {cat:"探花者",icon:"🌺",name:"访花大师",desc:"打卡15处赏花地",tier:totalSpots>=15?3:totalSpots>=5?2:0,cur:totalSpots,max:15},
    {cat:"探花者",icon:"👑",name:"花中帝王",desc:"打卡30处赏花地",tier:totalSpots>=30?4:totalSpots>=15?3:0,cur:totalSpots,max:30},
    {cat:"采花令",icon:"🎨",name:"初窥门径",desc:"采集3种花卉",tier:species.length>=3?1:0,cur:species.length,max:3},
    {cat:"采花令",icon:"💐",name:"百花园主",desc:"采集8种花卉",tier:species.length>=8?2:species.length>=3?1:0,cur:species.length,max:8},
    {cat:"采花令",icon:"🏵",name:"花卉博士",desc:"采集15种花卉",tier:species.length>=15?3:species.length>=8?2:0,cur:species.length,max:15},
    {cat:"采花令",icon:"🎭",name:"花神降世",desc:"采集25种花卉",tier:species.length>=25?4:species.length>=15?3:0,cur:species.length,max:25},
    {cat:"行者",icon:"🚶",name:"踏青一步",desc:"跨越2个区域",tier:regions.length>=2?1:0,cur:regions.length,max:2},
    {cat:"行者",icon:"🗺",name:"万里寻芳",desc:"跨越4个区域",tier:regions.length>=4?2:regions.length>=2?1:0,cur:regions.length,max:4},
    {cat:"行者",icon:"✈",name:"花迹天涯",desc:"跨越6个区域",tier:regions.length>=6?3:regions.length>=4?2:0,cur:regions.length,max:6},
    {cat:"行者",icon:"🌐",name:"九州花事",desc:"跨越8个区域",tier:regions.length>=8?4:regions.length>=6?3:0,cur:regions.length,max:8},
    {cat:"四时",icon:"🌗",name:"双季之约",desc:"在2个季节赏花",tier:seasons.length>=2?1:0,cur:seasons.length,max:2},
    {cat:"四时",icon:"🔄",name:"三季轮回",desc:"在3个季节赏花",tier:seasons.length>=3?2:seasons.length>=2?1:0,cur:seasons.length,max:3},
    {cat:"四时",icon:"🌍",name:"四季花神",desc:"春夏秋冬全收集",tier:seasons.length>=4?4:seasons.length>=3?2:0,cur:seasons.length,max:4},
    {cat:"社交",icon:"❤",name:"花之初恋",desc:"收藏3处赏花地",tier:favCount>=3?1:0,cur:favCount,max:3},
    {cat:"社交",icon:"💕",name:"花痴",desc:"收藏10处赏花地",tier:favCount>=10?2:favCount>=3?1:0,cur:favCount,max:10},
    {cat:"社交",icon:"💝",name:"花之守护者",desc:"收藏20处赏花地",tier:favCount>=20?3:favCount>=10?2:0,cur:favCount,max:20},
    {cat:"社交",icon:"✍",name:"花事记者",desc:"写3条花事笔记",tier:noteCount>=3?2:noteCount>=1?1:0,cur:noteCount,max:3},
    {cat:"社交",icon:"📝",name:"花事作家",desc:"写10条花事笔记",tier:noteCount>=10?3:noteCount>=3?2:0,cur:noteCount,max:10},
    {cat:"风雅",icon:"🏯",name:"古都寻花",desc:"访古都赏花地",tier:capVisits.length>=3?3:capVisits.length>=1?1:0,cur:capVisits.length,max:3},
    {cat:"风雅",icon:"🌊",name:"南北花使",desc:"南北方都赏过花",tier:hasNorth&&hasSouth?3:hasNorth||hasSouth?1:0,cur:(hasNorth?1:0)+(hasSouth?1:0),max:2},
    {cat:"稀有",icon:"📅",name:"月月赏花",desc:"6个不同月份打卡",tier:months.length>=6?4:months.length>=3?2:0,cur:months.length,max:6},
    {cat:"稀有",icon:"🏔",name:"高原花使",desc:"到访西藏赏花",tier:entries.some(function(e){return e.spot.rg==="西藏";})?4:0,cur:entries.some(function(e){return e.spot.rg==="西藏";})?1:0,max:1},
    {cat:"稀有",icon:"🏝",name:"海岛花事",desc:"到访台湾或南海赏花",tier:entries.some(function(e){return["台湾","南海"].includes(e.spot.rg);})?4:0,cur:entries.some(function(e){return["台湾","南海"].includes(e.spot.rg);})?1:0,max:1},
  ];

  var earnedBadges=allBadges.filter(function(b){return b.tier>0;});
  var earnedCount=earnedBadges.length;
  var totalCount=allBadges.length;
  var cats=[...new Set(allBadges.map(function(b){return b.cat;}))];
  var catIcons={"探花者":"🌸","采花令":"💐","行者":"🗺","四时":"🔄","社交":"💬","风雅":"🎋","稀有":"💎"};

  var shareBadgeImg=function(badge){
    var canvas=document.createElement("canvas");canvas.width=540;canvas.height=540;
    var ctx=canvas.getContext("2d");
    var bg=ctx.createRadialGradient(270,270,50,270,270,350);
    bg.addColorStop(0,tierBg[badge.tier]);bg.addColorStop(1,"#f5ede0");
    ctx.fillStyle=bg;ctx.fillRect(0,0,540,540);
    ctx.strokeStyle=tierColors[badge.tier];ctx.lineWidth=4;
    ctx.beginPath();ctx.arc(270,270,240,0,Math.PI*2);ctx.stroke();
    ctx.fillStyle=tierColors[badge.tier];
    ctx.beginPath();ctx.arc(270,140,60,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#fff";ctx.font="48px sans-serif";ctx.textAlign="center";
    ctx.fillText(badge.icon,270,158);
    ctx.fillStyle=tierColors[badge.tier];ctx.fillRect(220,210,100,26);
    ctx.fillStyle="#fff";ctx.font="bold 14px sans-serif";
    ctx.fillText(tierNames[badge.tier]+"级",270,228);
    ctx.fillStyle="#2a2018";ctx.font="bold 36px sans-serif";
    ctx.fillText(badge.name,270,290);
    ctx.fillStyle="#8a7a60";ctx.font="16px sans-serif";
    ctx.fillText(badge.desc,270,325);
    ctx.fillStyle="#b08040";ctx.font="13px sans-serif";
    ctx.fillText("花信风 · 我的花事成就",270,475);
    canvas.toBlob(function(blob){
      if(navigator.share&&navigator.canShare&&navigator.canShare({files:[new File([blob],"b.png",{type:"image/png"})]})){
        navigator.share({files:[new File([blob],"花信风-"+badge.name+".png",{type:"image/png"})],title:"花信风成就",text:"我解锁了「"+badge.name+"」！"}).catch(function(){});
      }else{var a=document.createElement("a");a.download="花信风-"+badge.name+".png";a.href=URL.createObjectURL(blob);a.click();}
    },"image/png");
  };

  return(<div style={{position:"fixed",inset:0,zIndex:130,background:"rgba(20,15,10,.65)",
    display:"flex",justifyContent:"flex-end",backdropFilter:"blur(6px)"}} onClick={onClose}>
    <div onClick={function(e){e.stopPropagation();}} style={{width:"min(440px,92vw)",height:"100vh",
      background:"#faf6ef",overflowY:"auto",boxShadow:"-4px 0 24px rgba(0,0,0,.15)"}}>
      {/* Header */}
      <div style={{padding:"20px 22px 14px",borderBottom:"1px solid #ece6dc",
        background:"linear-gradient(180deg,#faf6ef,#f2ebd8)",position:"sticky",top:0,zIndex:2}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontSize:10,color:"#b08040",letterSpacing:5}}>{"· 我 的 ·"}</div>
            <h2 style={{fontSize:22,fontWeight:900,color:"#2a2018",letterSpacing:8,margin:"4px 0"}}>花 历</h2>
          </div>
          <button onClick={onClose} style={{border:"none",background:"rgba(0,0,0,.08)",
            color:"#3a2818",cursor:"pointer",fontSize:14,width:28,height:28,borderRadius:"50%"}}>{"×"}</button>
        </div>
        <div style={{display:"flex",gap:14,marginTop:12}}>
          {[{v:totalSpots,l:"打卡"},{v:species.length,l:"花种"},{v:regions.length,l:"区域"},
            {v:earnedCount+"/"+totalCount,l:"成就"}].map(function(s,i){return(
            <div key={i} style={{textAlign:"center"}}>
              <div style={{fontSize:18,fontWeight:900,color:"#c06040"}}>{s.v}</div>
              <div style={{fontSize:10,color:"#8a7a60",letterSpacing:1}}>{s.l}</div>
            </div>);})}
        </div>
        <div style={{display:"flex",gap:2,marginTop:12}}>
          {[{k:"badges",l:"🏅 成就"},{k:"timeline",l:"📅 花历"},{k:"share",l:"📤 分享"}].map(function(t2){return(
            <button key={t2.k} onClick={function(){setTab(t2.k);}}
              style={{flex:1,border:"none",borderRadius:6,padding:"6px",cursor:"pointer",fontSize:12,fontWeight:tab===t2.k?700:400,
                background:tab===t2.k?"#c06040"+"22":"transparent",color:tab===t2.k?"#c06040":"#8a7a68"}}>
              {t2.l}</button>);})}
        </div>
      </div>

      {tab==="badges"&&<div style={{padding:"14px 18px"}}>
        {(function(){var next=allBadges.find(function(b){return b.tier===0;});
          if(!next)return null;
          return(<div style={{margin:"0 0 16px",padding:"12px 14px",background:"linear-gradient(135deg,#fdf8f0,#f8f0e0)",
            borderRadius:10,border:"1px dashed #e0dcd4"}}>
            <div style={{fontSize:10,color:"#b08040",letterSpacing:3,marginBottom:6,fontWeight:600}}>🎯 下一个成就</div>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{fontSize:28,opacity:.4}}>{next.icon}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:700,color:"#2a2018"}}>{next.name}</div>
                <div style={{fontSize:11,color:"#8a7a60"}}>{next.desc}</div>
                <div style={{height:4,borderRadius:2,background:"#e8e0d4",marginTop:4,overflow:"hidden"}}>
                  <div style={{height:"100%",borderRadius:2,width:Math.min(100,next.cur/next.max*100)+"%",
                    background:"linear-gradient(90deg,#c06040,#e0a040)"}}></div>
                </div>
                <div style={{fontSize:9,color:"#8a7a68",marginTop:2}}>{next.cur}/{next.max}</div>
              </div>
            </div>
          </div>);
        })()}
        {cats.map(function(cat){
          var catBadges=allBadges.filter(function(b){return b.cat===cat;});
          var catEarned=catBadges.filter(function(b){return b.tier>0;}).length;
          return(<div key={cat} style={{marginBottom:18}}>
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}>
              <span style={{fontSize:14}}>{catIcons[cat]||"🏅"}</span>
              <span style={{fontSize:12,fontWeight:700,color:"#2a2018",letterSpacing:2}}>{cat}</span>
              <span style={{fontSize:10,color:"#8a7a68"}}>{catEarned}/{catBadges.length}</span>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(115px,1fr))",gap:8}}>
              {catBadges.map(function(b,i){
                var earned=b.tier>0;var pct=Math.min(1,b.cur/b.max);
                return(<div key={i} onClick={function(){if(earned)setShareBadge(b);}}
                  style={{padding:"10px 8px",background:earned?tierBg[b.tier]:"#f8f8f6",
                    border:"1.5px solid "+(earned?tierColors[b.tier]:"#e8e4dc"),
                    borderRadius:10,textAlign:"center",cursor:earned?"pointer":"default",
                    opacity:earned?1:.5,position:"relative"}}>
                  {earned&&<div style={{position:"absolute",top:-4,right:-4,
                    width:18,height:18,borderRadius:"50%",background:tierColors[b.tier],
                    display:"flex",alignItems:"center",justifyContent:"center",
                    fontSize:8,color:"#fff",fontWeight:900,border:"2px solid #faf6ef"}}>
                    {tierNames[b.tier]}</div>}
                  <div style={{fontSize:28,marginBottom:4,filter:earned?"none":"grayscale(1)"}}>{b.icon}</div>
                  <div style={{fontSize:11,fontWeight:700,color:earned?"#2a2018":"#bbb",letterSpacing:1,lineHeight:1.2}}>{b.name}</div>
                  <div style={{fontSize:9,color:earned?"#8a7a60":"#ccc",marginTop:2}}>{b.desc}</div>
                  <div style={{height:3,borderRadius:2,background:"#e8e0d4",marginTop:6,overflow:"hidden"}}>
                    <div style={{height:"100%",borderRadius:2,width:(pct*100)+"%",
                      background:earned?tierColors[b.tier]:"#ddd"}}></div>
                  </div>
                  <div style={{fontSize:8,color:"#aaa",marginTop:2}}>{b.cur}/{b.max}</div>
                </div>);
              })}
            </div>
          </div>);
        })}
      </div>}

      {tab==="timeline"&&<div style={{padding:"14px 18px"}}>
        <div style={{fontSize:10,color:"#b08040",letterSpacing:4,marginBottom:12,fontWeight:600}}>{"· 花事时间线 ·"}</div>
        {entries.length===0&&<div style={{textAlign:"center",padding:"40px 0",color:"#8a7a60"}}>
          <div style={{fontSize:40,marginBottom:12}}>🌱</div>
          <div style={{fontSize:14,letterSpacing:2}}>还没有花事记录</div>
          <div style={{fontSize:12,marginTop:6,opacity:.6}}>在地图上点击景点 → 📍打卡</div>
        </div>}
        {entries.slice(0,50).map(function(e,i){
          var sm=SM[e.spot.s];
          return(<div key={e.id} style={{display:"flex",gap:12,position:"relative"}}>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",width:24,flexShrink:0}}>
              <div style={{width:14,height:14,borderRadius:"50%",background:e.spot.c,
                border:"2px solid #faf6ef",boxShadow:"0 0 0 1px "+e.spot.c+"44",zIndex:1}}></div>
              {i<entries.length-1&&<div style={{width:1,flex:1,background:"#e0dcd4"}}></div>}
            </div>
            <div style={{flex:1,paddingBottom:18}}>
              <div style={{fontSize:11,color:"#8a7a60",marginBottom:3}}>{e.date}</div>
              <div style={{padding:"10px 14px",background:"#f8f4ee",borderRadius:8,border:"1px solid #ece6dc"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                  <div style={{width:24,height:24,borderRadius:"50%",background:"#fff",
                    border:"1px solid "+e.spot.c+"55",display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <FI sp={e.spot.sp} sz={16} co={e.spot.c}/></div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:700,color:"#2a2018"}}>{e.spot.n}</div>
                    <div style={{fontSize:11,color:e.spot.c}}>{e.spot.sp} · {sm?(sm.i||""):""}{ seasonNames[e.spot.s]||""}</div>
                  </div>
                </div>
                {e.note&&<div style={{fontSize:12,color:"#5a4a38",lineHeight:1.7,marginTop:6,
                  padding:"6px 10px",background:"#fff",borderRadius:4,
                  borderLeft:"2px solid "+e.spot.c+"55"}}>{e.note}</div>}
              </div>
            </div>
          </div>);
        })}
      </div>}

      {tab==="share"&&<div style={{padding:"14px 18px"}}>
        <div style={{fontSize:10,color:"#b08040",letterSpacing:4,marginBottom:12,fontWeight:600}}>{"· 分享我的花事 ·"}</div>
        <div style={{background:"linear-gradient(135deg,#fdf8f0,#f0e8d0)",borderRadius:10,
          padding:"20px",border:"1.5px solid #e0dcd4",marginBottom:16,textAlign:"center"}}>
          <div style={{fontSize:18,fontWeight:900,color:"#2a2018",letterSpacing:4,marginBottom:8}}>我的花事记</div>
          <div style={{display:"flex",justifyContent:"center",gap:20,marginBottom:12}}>
            <div><div style={{fontSize:24,fontWeight:900,color:"#c06040"}}>{totalSpots}</div><div style={{fontSize:10,color:"#8a7a68"}}>打卡</div></div>
            <div><div style={{fontSize:24,fontWeight:900,color:"#c06040"}}>{species.length}</div><div style={{fontSize:10,color:"#8a7a68"}}>花种</div></div>
            <div><div style={{fontSize:24,fontWeight:900,color:"#c06040"}}>{earnedCount}</div><div style={{fontSize:10,color:"#8a7a68"}}>成就</div></div>
          </div>
          <div style={{display:"flex",justifyContent:"center",gap:8,marginBottom:12,flexWrap:"wrap"}}>
            {earnedBadges.filter(function(b){return b.tier>=2;}).slice(0,6).map(function(b,i){return(
              <div key={i} style={{width:36,height:36,borderRadius:"50%",background:tierColors[b.tier],
                display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,
                boxShadow:"0 2px 6px "+tierColors[b.tier]+"44"}}>{b.icon}</div>);})}
          </div>
          <div style={{fontSize:11,color:"#8a7a60"}}>
            {entries.length>0?"从"+(entries[entries.length-1]||{}).date+"开始的花事之旅":"期待你的花事之旅"}
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10}}>
          {[{l:"💬 微信",c:"#07c160"},{l:"📕 小红书",c:"#fe2c55"},{l:"𝕏 推特",c:"#000"},{l:"🔴 微博",c:"#e6162d"}].map(function(m,i){return(
            <button key={i} onClick={function(){
              if(typeof window!=="undefined"&&window._hxTrack)window._hxTrack("share",{channel:m.l,from:"diary"});
              var txt="🌸 花信风花事记\n打卡"+totalSpots+"处·"+species.length+"种花·"+earnedCount+"个成就\n";
              earnedBadges.filter(function(b){return b.tier>=2;}).slice(0,4).forEach(function(b){txt+=b.icon+b.name+" ";});
              var url=typeof window!=="undefined"?window.location.origin:"";
              if(m.l.includes("推特")){window.open("https://twitter.com/intent/tweet?text="+encodeURIComponent(txt)+"&url="+encodeURIComponent(url),"_blank");}
              else if(m.l.includes("微博")){window.open("https://service.weibo.com/share/share.php?title="+encodeURIComponent(txt)+"&url="+encodeURIComponent(url),"_blank");}
              else{navigator.clipboard.writeText(txt+"\n"+url);alert("已复制！请打开对应APP粘贴");}
            }} style={{padding:"14px",background:m.c,color:"#fff",border:"none",borderRadius:10,
              cursor:"pointer",fontSize:13,fontWeight:700,letterSpacing:1}}>
              {m.l}</button>);})}
        </div>
      </div>}

      {shareBadge&&<div style={{position:"fixed",inset:0,zIndex:200,background:"rgba(0,0,0,.6)",
        display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(4px)"}}
        onClick={function(){setShareBadge(null);}}>
        <div onClick={function(e){e.stopPropagation();}} style={{background:"#faf6ef",borderRadius:14,
          padding:"24px",width:"min(320px,88vw)",textAlign:"center"}}>
          <div style={{width:80,height:80,borderRadius:"50%",background:tierColors[shareBadge.tier],
            display:"flex",alignItems:"center",justifyContent:"center",fontSize:42,
            margin:"0 auto 12px",boxShadow:"0 4px 16px "+tierColors[shareBadge.tier]+"66"}}>{shareBadge.icon}</div>
          <div style={{display:"inline-block",padding:"2px 14px",background:tierColors[shareBadge.tier],
            color:"#fff",borderRadius:10,fontSize:11,fontWeight:700,marginBottom:8}}>{tierNames[shareBadge.tier]}级</div>
          <h3 style={{fontSize:22,fontWeight:900,color:"#2a2018",letterSpacing:4,margin:"8px 0"}}>{shareBadge.name}</h3>
          <div style={{fontSize:12,color:"#8a7a60",marginBottom:16}}>{shareBadge.desc}</div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={function(){shareBadgeImg(shareBadge);setShareBadge(null);}}
              style={{flex:1,padding:"10px",background:"#c06040",color:"#fff",border:"none",
                borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:700}}>📤 分享成就卡</button>
            <button onClick={function(){setShareBadge(null);}}
              style={{padding:"10px 16px",background:"#f0ece4",border:"none",
                borderRadius:8,cursor:"pointer",fontSize:12,color:"#8a7a68"}}>关闭</button>
          </div>
        </div>
      </div>}
    </div>
  </div>);
}

// ═══ 24番花信风面板 (Huaxin24 Panel) ═══
function HuaxinPanel({onClose,onPickSpecies,flora,onShowWiki}){
// ═══ 二十四番花信风 (24 Flower Messages of the Wind) ═══
// 传统花信风：小寒至谷雨，每五日一候，共八气二十四候
const HUAXIN24=[
  {jq:"小寒",jqEn:"Minor Cold",period:"01·05~01·19",ji:1,hou:"一候",sp:"梅花",date:"01·05"},
  {jq:"小寒",jqEn:"Minor Cold",period:"01·05~01·19",ji:2,hou:"二候",sp:"山茶花",date:"01·10"},
  {jq:"小寒",jqEn:"Minor Cold",period:"01·05~01·19",ji:3,hou:"三候",sp:"水仙花",date:"01·15"},
  {jq:"大寒",jqEn:"Major Cold",period:"01·20~02·03",ji:1,hou:"一候",sp:"瑞香",date:"01·20"},
  {jq:"大寒",jqEn:"Major Cold",period:"01·20~02·03",ji:2,hou:"二候",sp:"兰花",date:"01·25"},
  {jq:"大寒",jqEn:"Major Cold",period:"01·20~02·03",ji:3,hou:"三候",sp:"山矾",date:"01·30"},
  {jq:"立春",jqEn:"Spring Begins",period:"02·04~02·18",ji:1,hou:"一候",sp:"迎春花",date:"02·04"},
  {jq:"立春",jqEn:"Spring Begins",period:"02·04~02·18",ji:2,hou:"二候",sp:"樱花",date:"02·09"},
  {jq:"立春",jqEn:"Spring Begins",period:"02·04~02·18",ji:3,hou:"三候",sp:"望春",date:"02·14"},
  {jq:"雨水",jqEn:"Rain Water",period:"02·19~03·04",ji:1,hou:"一候",sp:"油菜花",date:"02·19"},
  {jq:"雨水",jqEn:"Rain Water",period:"02·19~03·04",ji:2,hou:"二候",sp:"杏花",date:"02·24"},
  {jq:"雨水",jqEn:"Rain Water",period:"02·19~03·04",ji:3,hou:"三候",sp:"李花",date:"03·01"},
  {jq:"惊蛰",jqEn:"Awaken of Insects",period:"03·05~03·19",ji:1,hou:"一候",sp:"桃花",date:"03·05"},
  {jq:"惊蛰",jqEn:"Awaken of Insects",period:"03·05~03·19",ji:2,hou:"二候",sp:"棠棣",date:"03·10"},
  {jq:"惊蛰",jqEn:"Awaken of Insects",period:"03·05~03·19",ji:3,hou:"三候",sp:"蔷薇",date:"03·15"},
  {jq:"春分",jqEn:"Spring Equinox",period:"03·20~04·03",ji:1,hou:"一候",sp:"海棠花",date:"03·20"},
  {jq:"春分",jqEn:"Spring Equinox",period:"03·20~04·03",ji:2,hou:"二候",sp:"梨花",date:"03·25"},
  {jq:"春分",jqEn:"Spring Equinox",period:"03·20~04·03",ji:3,hou:"三候",sp:"木兰",date:"03·30"},
  {jq:"清明",jqEn:"Clear & Bright",period:"04·04~04·18",ji:1,hou:"一候",sp:"桐花",date:"04·04"},
  {jq:"清明",jqEn:"Clear & Bright",period:"04·04~04·18",ji:2,hou:"二候",sp:"麦花",date:"04·09"},
  {jq:"清明",jqEn:"Clear & Bright",period:"04·04~04·18",ji:3,hou:"三候",sp:"柳花",date:"04·14"},
  {jq:"谷雨",jqEn:"Grain Rain",period:"04·19~05·04",ji:1,hou:"一候",sp:"牡丹",date:"04·19"},
  {jq:"谷雨",jqEn:"Grain Rain",period:"04·19~05·04",ji:2,hou:"二候",sp:"荼蘼",date:"04·24"},
  {jq:"谷雨",jqEn:"Grain Rain",period:"04·19~05·04",ji:3,hou:"三候",sp:"楝花",date:"04·29"},
];

// ═══ 72候全年物候 (72 Hou - Full Year Phenology) ═══
// 古代根据二十四节气，每节气分三候，全年共七十二候。每候记一物候现象。
const HUAXIN72=[
  // 立春
  {jq:"立春",ji:1,hou:"东风解冻",desc:"春风送暖，大地解冻",date:"02·04"},
  {jq:"立春",ji:2,hou:"蛰虫始振",desc:"冬眠昆虫苏醒",date:"02·09"},
  {jq:"立春",ji:3,hou:"鱼陟负冰",desc:"鱼游近冰面",date:"02·14"},
  // 雨水
  {jq:"雨水",ji:1,hou:"獭祭鱼",desc:"水獭捕鱼陈列",date:"02·19"},
  {jq:"雨水",ji:2,hou:"鸿雁来",desc:"大雁北归",date:"02·24"},
  {jq:"雨水",ji:3,hou:"草木萌动",desc:"草木生新芽",date:"03·01"},
  // 惊蛰
  {jq:"惊蛰",ji:1,hou:"桃始华",desc:"桃花初开",date:"03·05"},
  {jq:"惊蛰",ji:2,hou:"仓庚鸣",desc:"黄鹂啼鸣",date:"03·10"},
  {jq:"惊蛰",ji:3,hou:"鹰化为鸠",desc:"鹰变布谷鸟",date:"03·15"},
  // 春分
  {jq:"春分",ji:1,hou:"玄鸟至",desc:"燕子归来",date:"03·20"},
  {jq:"春分",ji:2,hou:"雷乃发声",desc:"春雷始鸣",date:"03·25"},
  {jq:"春分",ji:3,hou:"始电",desc:"闪电初现",date:"03·30"},
  // 清明
  {jq:"清明",ji:1,hou:"桐始华",desc:"桐花开放",date:"04·04"},
  {jq:"清明",ji:2,hou:"田鼠化为鹌",desc:"田鼠躲藏",date:"04·09"},
  {jq:"清明",ji:3,hou:"虹始见",desc:"彩虹初现",date:"04·14"},
  // 谷雨
  {jq:"谷雨",ji:1,hou:"萍始生",desc:"浮萍生长",date:"04·19"},
  {jq:"谷雨",ji:2,hou:"鸣鸠拂羽",desc:"布谷抖羽",date:"04·24"},
  {jq:"谷雨",ji:3,hou:"戴胜降桑",desc:"戴胜鸟落桑",date:"04·29"},
  // 立夏
  {jq:"立夏",ji:1,hou:"蝼蝈鸣",desc:"蝼蛄鸣叫",date:"05·05"},
  {jq:"立夏",ji:2,hou:"蚯蚓出",desc:"蚯蚓钻出",date:"05·10"},
  {jq:"立夏",ji:3,hou:"王瓜生",desc:"王瓜长成",date:"05·15"},
  // 小满
  {jq:"小满",ji:1,hou:"苦菜秀",desc:"苦菜茂盛",date:"05·21"},
  {jq:"小满",ji:2,hou:"靡草死",desc:"细草枯萎",date:"05·26"},
  {jq:"小满",ji:3,hou:"麦秋至",desc:"麦子成熟",date:"05·31"},
  // 芒种
  {jq:"芒种",ji:1,hou:"螳螂生",desc:"螳螂初生",date:"06·05"},
  {jq:"芒种",ji:2,hou:"鵙始鸣",desc:"伯劳鸟鸣",date:"06·10"},
  {jq:"芒种",ji:3,hou:"反舌无声",desc:"百舌鸟噤",date:"06·15"},
  // 夏至
  {jq:"夏至",ji:1,hou:"鹿角解",desc:"鹿角脱落",date:"06·21"},
  {jq:"夏至",ji:2,hou:"蝉始鸣",desc:"知了初鸣",date:"06·26"},
  {jq:"夏至",ji:3,hou:"半夏生",desc:"半夏生长",date:"07·01"},
  // 小暑
  {jq:"小暑",ji:1,hou:"温风至",desc:"热风升起",date:"07·07"},
  {jq:"小暑",ji:2,hou:"蟋蟀居壁",desc:"蟋蟀在墙",date:"07·12"},
  {jq:"小暑",ji:3,hou:"鹰始鸷",desc:"鹰学搏击",date:"07·17"},
  // 大暑
  {jq:"大暑",ji:1,hou:"腐草为萤",desc:"萤火虫现",date:"07·22"},
  {jq:"大暑",ji:2,hou:"土润溽暑",desc:"湿热蒸腾",date:"07·27"},
  {jq:"大暑",ji:3,hou:"大雨时行",desc:"时有大雨",date:"08·02"},
  // 立秋
  {jq:"立秋",ji:1,hou:"凉风至",desc:"凉风始来",date:"08·07"},
  {jq:"立秋",ji:2,hou:"白露降",desc:"晨雾渐重",date:"08·12"},
  {jq:"立秋",ji:3,hou:"寒蝉鸣",desc:"秋蝉鸣叫",date:"08·17"},
  // 处暑
  {jq:"处暑",ji:1,hou:"鹰乃祭鸟",desc:"鹰捕小鸟",date:"08·23"},
  {jq:"处暑",ji:2,hou:"天地始肃",desc:"天地渐凉",date:"08·28"},
  {jq:"处暑",ji:3,hou:"禾乃登",desc:"稻谷成熟",date:"09·02"},
  // 白露
  {jq:"白露",ji:1,hou:"鸿雁来",desc:"大雁南飞",date:"09·07"},
  {jq:"白露",ji:2,hou:"玄鸟归",desc:"燕子南归",date:"09·12"},
  {jq:"白露",ji:3,hou:"群鸟养羞",desc:"百鸟储食",date:"09·17"},
  // 秋分
  {jq:"秋分",ji:1,hou:"雷始收声",desc:"雷声渐息",date:"09·23"},
  {jq:"秋分",ji:2,hou:"蛰虫坯户",desc:"虫入穴藏",date:"09·28"},
  {jq:"秋分",ji:3,hou:"水始涸",desc:"江河水退",date:"10·03"},
  // 寒露
  {jq:"寒露",ji:1,hou:"鸿雁来宾",desc:"雁归南方",date:"10·08"},
  {jq:"寒露",ji:2,hou:"雀入大水为蛤",desc:"雀少蛤多",date:"10·13"},
  {jq:"寒露",ji:3,hou:"菊有黄华",desc:"菊花金黄",date:"10·18"},
  // 霜降
  {jq:"霜降",ji:1,hou:"豺乃祭兽",desc:"豺捕小兽",date:"10·23"},
  {jq:"霜降",ji:2,hou:"草木黄落",desc:"草木凋零",date:"10·28"},
  {jq:"霜降",ji:3,hou:"蛰虫咸俯",desc:"蛰虫伏藏",date:"11·02"},
  // 立冬
  {jq:"立冬",ji:1,hou:"水始冰",desc:"水面初冰",date:"11·07"},
  {jq:"立冬",ji:2,hou:"地始冻",desc:"土地初冻",date:"11·12"},
  {jq:"立冬",ji:3,hou:"雉入大水为蜃",desc:"野鸡入水",date:"11·17"},
  // 小雪
  {jq:"小雪",ji:1,hou:"虹藏不见",desc:"彩虹不现",date:"11·22"},
  {jq:"小雪",ji:2,hou:"天气上升",desc:"阳气上升",date:"11·27"},
  {jq:"小雪",ji:3,hou:"闭塞成冬",desc:"阴阳不交",date:"12·02"},
  // 大雪
  {jq:"大雪",ji:1,hou:"鹖鴠不鸣",desc:"寒号鸟噤",date:"12·07"},
  {jq:"大雪",ji:2,hou:"虎始交",desc:"虎开始求偶",date:"12·12"},
  {jq:"大雪",ji:3,hou:"荔挺出",desc:"马兰花生",date:"12·17"},
  // 冬至
  {jq:"冬至",ji:1,hou:"蚯蚓结",desc:"蚯蚓蜷缩",date:"12·22"},
  {jq:"冬至",ji:2,hou:"麋角解",desc:"麋鹿脱角",date:"12·27"},
  {jq:"冬至",ji:3,hou:"水泉动",desc:"泉水流动",date:"01·01"},
  // 小寒
  {jq:"小寒",ji:1,hou:"雁北乡",desc:"雁回故乡",date:"01·05"},
  {jq:"小寒",ji:2,hou:"鹊始巢",desc:"喜鹊筑巢",date:"01·10"},
  {jq:"小寒",ji:3,hou:"雉始雊",desc:"野鸡始鸣",date:"01·15"},
  // 大寒
  {jq:"大寒",ji:1,hou:"鸡始乳",desc:"母鸡孵蛋",date:"01·20"},
  {jq:"大寒",ji:2,hou:"征鸟厉疾",desc:"猛禽迅捷",date:"01·25"},
  {jq:"大寒",ji:3,hou:"水泽腹坚",desc:"冰坚至中",date:"01·30"},
];

  if(!HUAXIN24||!HUAXIN24.length)return null;
  var [viewMode,setViewMode]=useState("24"); // "24" or "72"
  var now=new Date();var curMD=(now.getMonth()+1)*100+now.getDate();
  var curHouIdx=-1;
  try{
    for(var i=0;i<HUAXIN24.length;i++){
      var parts=HUAXIN24[i].date.split("·");
      var md=Number(parts[0])*100+Number(parts[1]);
      if(i<HUAXIN24.length-1){
        var nparts=HUAXIN24[i+1].date.split("·");
        var nextMd=Number(nparts[0])*100+Number(nparts[1]);
        if(curMD>=md&&curMD<nextMd){curHouIdx=i;break;}
      }else if(curMD>=md){curHouIdx=i;}
    }
  }catch(e){}
  var jqColors={"小寒":"#8898a8","大寒":"#6878a8","立春":"#b8c860","雨水":"#60a890","惊蛰":"#70b878",
    "春分":"#e8a0b8","清明":"#68b0c8","谷雨":"#c08060"};
  var grouped={};
  try{HUAXIN24.forEach(function(h,i){if(!grouped[h.jq])grouped[h.jq]=[];grouped[h.jq].push({jq:h.jq,hou:h.hou,sp:h.sp,date:h.date,idx:i});});}catch(e){}
  var jqList=Object.keys(grouped);

  return(<div style={{position:"fixed",inset:0,zIndex:130,background:"rgba(20,15,10,.7)",
    display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(8px)"}} onClick={onClose}>
    <div onClick={function(e){e.stopPropagation();}} style={{background:"#faf6ef",width:"min(820px,94vw)",
      maxHeight:"92vh",borderRadius:14,overflow:"hidden",display:"flex",flexDirection:"column",
      boxShadow:"0 20px 60px rgba(0,0,0,.4)"}}>
      <div style={{padding:"20px 28px 14px",borderBottom:"1px solid #ece6dc",
        background:"linear-gradient(180deg,#faf6ef,#f2ebd8)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div>
            <div style={{fontSize:10,color:"#b08040",letterSpacing:6,marginBottom:4}}>
              {viewMode==="24"?"· 廿 四 · 花 · 信 · 风 ·":"· 七 十 二 · 候 ·"}</div>
            <h2 style={{fontSize:24,fontWeight:900,color:"#2a2018",letterSpacing:10,margin:0}}>
              {viewMode==="24"?"二十四番花信风":"全年七十二候"}</h2>
            <div style={{fontSize:11,color:"#8a7a60",letterSpacing:2,marginTop:6,lineHeight:1.6}}>
              {viewMode==="24"?"小寒至谷雨 · 八气二十四候 · 每候一花信":"全年 · 二十四节气 × 三候 · 七十二种物候"}</div>
          </div>
          <button onClick={onClose} style={{border:"none",background:"rgba(0,0,0,.08)",color:"#3a2818",
            cursor:"pointer",fontSize:14,width:28,height:28,borderRadius:"50%"}}>{"×"}</button>
        </div>
        {/* View mode tab switcher */}
        <div style={{display:"flex",gap:4,marginTop:12}}>
          <button onClick={function(){setViewMode("24");}}
            style={{border:"none",borderRadius:6,padding:"5px 14px",cursor:"pointer",fontSize:12,
              background:viewMode==="24"?"#c06040":"transparent",color:viewMode==="24"?"#fff":"#8a7a68",
              fontWeight:viewMode==="24"?700:400,letterSpacing:2}}>
            🌸 花信风 (春 · 24番)</button>
          <button onClick={function(){setViewMode("72");}}
            style={{border:"none",borderRadius:6,padding:"5px 14px",cursor:"pointer",fontSize:12,
              background:viewMode==="72"?"#c06040":"transparent",color:viewMode==="72"?"#fff":"#8a7a68",
              fontWeight:viewMode==="72"?700:400,letterSpacing:2}}>
            🌿 物候 (全年 · 72候)</button>
        </div>
      </div>
      <div style={{flex:1,overflow:"auto",padding:"16px 20px"}}>
        {viewMode==="24"&&jqList.map(function(jq){
          var items=grouped[jq]||[];var color=jqColors[jq]||"#888";
          return(<div key={jq} style={{marginBottom:14,borderLeft:"3px solid "+color,paddingLeft:14}}>
            <div style={{display:"flex",alignItems:"baseline",gap:10,marginBottom:8}}>
              <div style={{fontSize:18,fontWeight:900,color:color,letterSpacing:4}}>{jq}</div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:10}}>
              {items.map(function(it){
                var isCur=it.idx===curHouIdx;
                var flMatch=null;
                try{flMatch=flora&&flora.find(function(f){return f.sp===it.sp;});}catch(e){}
                return(<div key={it.idx}
                  onClick={function(){
                    if(flMatch&&onPickSpecies){onPickSpecies(flMatch.sp);onClose();}
                    else if(onShowWiki){onShowWiki(it.sp);}
                  }}
                  style={{padding:"10px 12px",background:isCur?color+"18":"#fafafa",
                    border:isCur?"2px solid "+color:"1px solid #ece6dc",
                    borderRadius:8,cursor:"pointer"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{width:32,height:32,borderRadius:"50%",background:"rgba(255,255,255,.9)",
                      display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,
                      border:"1.5px solid "+(flMatch?flMatch.c:color)+"66"}}>
                      <FI sp={it.sp} sz={22} co={flMatch?flMatch.c:color}/></div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",alignItems:"baseline",gap:6}}>
                        <span style={{fontSize:10,color:color,fontWeight:600}}>{it.hou}</span>
                        {isCur&&<span style={{fontSize:9,padding:"1px 6px",background:color,color:"#fff",
                          borderRadius:8,fontWeight:700}}>当下</span>}
                      </div>
                      <div style={{fontSize:15,fontWeight:700,color:"#2a2018",letterSpacing:2}}>{it.sp}</div>
                      <div style={{fontSize:10,color:"#8a7a60"}}>{it.date}</div>
                    </div>
                  </div>
                </div>);
              })}
            </div>
          </div>);
        })}
        {/* 72候 view */}
        {viewMode==="72"&&(function(){
          // Group 72候 by season
          var seasonGroups={
            "春":HUAXIN72.slice(0,18),
            "夏":HUAXIN72.slice(18,36),
            "秋":HUAXIN72.slice(36,54),
            "冬":HUAXIN72.slice(54,72),
          };
          var seasonColors={"春":"#e08090","夏":"#5a8a50","秋":"#c87040","冬":"#6a8aaa"};
          var seasonIcons={"春":"🌸","夏":"🌿","秋":"🍁","冬":"❄"};
          // Find current hou
          var nowMD=(new Date().getMonth()+1)*100+new Date().getDate();
          var curHouIdx72=-1;
          for(var i=0;i<HUAXIN72.length;i++){
            try{
              var p=HUAXIN72[i].date.split("·");
              var md=Number(p[0])*100+Number(p[1]);
              var nextMd=i<HUAXIN72.length-1?(function(){var np=HUAXIN72[i+1].date.split("·");return Number(np[0])*100+Number(np[1]);})():12*100+31;
              if(nowMD>=md&&nowMD<nextMd)curHouIdx72=i;
            }catch(e){}
          }
          return(<div>
            {Object.keys(seasonGroups).map(function(sn){
              var items=seasonGroups[sn];var color=seasonColors[sn];
              return(<div key={sn} style={{marginBottom:16}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10,
                  paddingBottom:6,borderBottom:"2px solid "+color+"44"}}>
                  <span style={{fontSize:18}}>{seasonIcons[sn]}</span>
                  <span style={{fontSize:16,fontWeight:900,color:color,letterSpacing:4}}>{sn}季</span>
                  <span style={{fontSize:11,color:"#8a7a60"}}>· 18候</span>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:6}}>
                  {items.map(function(h,idx){
                    var globalIdx=HUAXIN72.indexOf(h);
                    var isCur=globalIdx===curHouIdx72;
                    return(<div key={idx} style={{padding:"8px 10px",
                      background:isCur?color+"18":"#fafafa",
                      border:isCur?"2px solid "+color:"1px solid #ece6dc",
                      borderRadius:6}}>
                      <div style={{display:"flex",alignItems:"baseline",gap:4,marginBottom:2}}>
                        <span style={{fontSize:10,color:color,fontWeight:700}}>{h.jq}</span>
                        <span style={{fontSize:9,color:"#8a7a68"}}>{"·"}{h.ji}候</span>
                        {isCur&&<span style={{fontSize:9,padding:"0 5px",background:color,color:"#fff",borderRadius:6,marginLeft:"auto"}}>当下</span>}
                      </div>
                      <div style={{fontSize:13,color:"#2a2018",fontWeight:600,letterSpacing:1}}>{h.hou}</div>
                      <div style={{fontSize:10,color:"#8a7a60",marginTop:2}}>{h.desc}</div>
                      <div style={{fontSize:9,color:"#b0a890",marginTop:1}}>{h.date}</div>
                    </div>);
                  })}
                </div>
              </div>);
            })}
            <div style={{fontSize:11,color:"#8a7a60",textAlign:"center",marginTop:14,padding:"12px",
              borderTop:"1px dashed #e0dcd4",lineHeight:1.8,letterSpacing:2}}>
              七十二候 · 古人以动植物变化记节候<br/>
              《逸周书·时训解》《月令七十二候集解》</div>
          </div>);
        })()}
        {viewMode==="24"&&<div style={{textAlign:"center",marginTop:18,padding:"16px 0",borderTop:"1px dashed #e0dcd4"}}>
          <div style={{fontSize:11,color:"#8a7a60",letterSpacing:3,lineHeight:1.8}}>
            花信风 · 应花期而来的风也</div>
        </div>}
      </div>
    </div>
  </div>);
}

// ═══ 花卉百科 Wiki Modal ═══
function FlowerWiki({sp,onClose,flora,onPickSpecies}){
// ═══ 花卉百科 (Flower Encyclopedia) ═══
// 别名、学名、科属、花语、典故、关联诗词
const FLORA_WIKI={
  "梅花":{alias:"春梅、干枝梅",sci:"Prunus mume",family:"蔷薇科·李属",flang:"坚强、高洁、谦虚",
    origin:"原产于中国南方，栽培历史逾3000年",
    story:"梅花与兰、竹、菊并称「四君子」，又与松、竹并称「岁寒三友」。古时文人以梅自喻，象征清雅孤傲。",
    care:"喜阳光充足、排水良好的微酸性土壤。耐寒能力强，冬季低温时反而开花更盛。",
    poems:[
      {t:"墙角数枝梅，凌寒独自开。遥知不是雪，为有暗香来。",a:"王安石·《梅花》"},
      {t:"已是悬崖百丈冰，犹有花枝俏。俏也不争春，只把春来报。",a:"毛泽东·《卜算子·咏梅》"},
      {t:"驿外断桥边，寂寞开无主。已是黄昏独自愁，更着风和雨。",a:"陆游·《卜算子·咏梅》"},
    ]},
  "桃花":{alias:"桃、粉桃",sci:"Prunus persica",family:"蔷薇科·李属",flang:"爱情、少女的娇美",
    origin:"原产于中国，栽培历史悠久，是华夏文化中最具代表性的花卉之一",
    story:"「桃之夭夭，灼灼其华」出自《诗经》，是中国最早的花卉诗篇之一。世外桃源源自陶渊明笔下。",
    care:"喜阳光充足，耐寒，忌水涝。每年冬末春初修剪枝条。",
    poems:[
      {t:"桃之夭夭，灼灼其华。之子于归，宜其室家。",a:"《诗经·周南·桃夭》"},
      {t:"去年今日此门中，人面桃花相映红。人面不知何处去，桃花依旧笑春风。",a:"崔护·《题都城南庄》"},
      {t:"桃花尽日随流水，洞在清溪何处边。",a:"张旭·《桃花溪》"},
    ]},
  "樱花":{alias:"山樱、樱桃花",sci:"Prunus serrulata",family:"蔷薇科·李属",flang:"纯洁、热烈、短暂的美",
    origin:"原产于喜马拉雅山地区，唐代传至日本，盛于东瀛",
    story:"中国赏樱之风始于秦汉，盛于唐代。樱花花期极短，象征「转瞬即逝的美」。",
    care:"喜光，喜排水良好的酸性土壤。花后应重剪。",
    poems:[
      {t:"樱花烂漫几多时？柳绿桃红角两枝。",a:"苏曼殊·《本事诗》"},
      {t:"昨日南园新雨后，樱花满地不胜扫。",a:"白居易·《酬刘梦得咏樱花》"},
    ]},
  "牡丹":{alias:"富贵花、洛阳花",sci:"Paeonia × suffruticosa",family:"芍药科·芍药属",flang:"富贵、雍容、幸福",
    origin:"原产于中国西北，唐代盛极一时，被誉为「国花」",
    story:"武则天贬牡丹至洛阳，反而成就洛阳牡丹甲天下。「国色天香」之名始于唐代。",
    care:"喜温凉气候，畏酷热。种植宜深耕，施基肥。每年惊蛰前后发芽。",
    poems:[
      {t:"唯有牡丹真国色，花开时节动京城。",a:"刘禹锡·《赏牡丹》"},
      {t:"庭前芍药妖无格，池上芙蕖净少情。",a:"刘禹锡·《赏牡丹》"},
      {t:"云想衣裳花想容，春风拂槛露华浓。",a:"李白·《清平调》"},
    ]},
  "荷花":{alias:"莲花、芙蓉、水芝",sci:"Nelumbo nucifera",family:"莲科·莲属",flang:"清廉、高洁、圣洁",
    origin:"原产于中国、印度一带，有约1.35亿年进化历史",
    story:"「出淤泥而不染」出自周敦颐《爱莲说》，使莲花成为文人君子的象征。佛教以莲花喻佛。",
    care:"水生植物，需温暖湿润环境。莲池水深30-60cm为宜。",
    poems:[
      {t:"予独爱莲之出淤泥而不染，濯清涟而不妖。",a:"周敦颐·《爱莲说》"},
      {t:"接天莲叶无穷碧，映日荷花别样红。",a:"杨万里·《晓出净慈寺送林子方》"},
      {t:"小荷才露尖尖角，早有蜻蜓立上头。",a:"杨万里·《小池》"},
    ]},
  "菊花":{alias:"秋菊、黄华",sci:"Chrysanthemum morifolium",family:"菊科·菊属",flang:"隐逸、高洁、长寿",
    origin:"原产于中国，栽培历史逾3000年，是中国十大名花之一",
    story:"陶渊明「采菊东篱下，悠然见南山」使菊花成为归隐象征。重阳节赏菊、饮菊花酒为传统习俗。",
    care:"喜阳光，耐寒。短日照植物，秋季开花。",
    poems:[
      {t:"采菊东篱下，悠然见南山。",a:"陶渊明·《饮酒》"},
      {t:"不是花中偏爱菊，此花开尽更无花。",a:"元稹·《菊花》"},
      {t:"待到重阳日，还来就菊花。",a:"孟浩然·《过故人庄》"},
    ]},
  "杜鹃花":{alias:"映山红、山石榴",sci:"Rhododendron simsii",family:"杜鹃花科·杜鹃属",flang:"思乡、热情、爱的喜悦",
    origin:"原产于东亚山区，中国有590种，占全球一半以上",
    story:"传说蜀帝杜宇化为杜鹃鸟，啼血染红漫山花朵，故名「映山红」。三月春末，漫山遍野如火。",
    care:"喜酸性土壤，忌强光暴晒。喜湿润半阴环境。",
    poems:[
      {t:"杜鹃啼血猿哀鸣，春江花朝秋月夜。",a:"白居易·《琵琶行》"},
      {t:"子规夜半犹啼血，不信东风唤不回。",a:"王令·《送春》"},
    ]},
  "油菜花":{alias:"芸薹、油菜",sci:"Brassica napus",family:"十字花科·芸薹属",flang:"祈福、加油",
    origin:"欧亚大陆原产，中国广泛种植，是重要油料作物和观光花卉",
    story:"中国四大油菜花海：婺源、罗平、青海湖、汉中。三四月间，金黄花海绵延数十里。",
    care:"秋播越冬作物，喜温凉气候。盛花期3-4月。",
    poems:[
      {t:"儿童急走追黄蝶，飞入菜花无处寻。",a:"杨万里·《宿新市徐公店》"},
    ]},
  "梨花":{alias:"白梨花",sci:"Pyrus",family:"蔷薇科·梨属",flang:"纯情、纯洁、安慰",
    origin:"原产于中国，栽培历史4000余年",
    story:"「千树万树梨花开」本是咏雪，却反让梨花成为雪一般的意象。白居易以「梨花一枝春带雨」写杨玉环。",
    care:"喜光耐寒，忌水涝。春季开花时节若遇倒春寒，花期将减。",
    poems:[
      {t:"忽如一夜春风来，千树万树梨花开。",a:"岑参·《白雪歌送武判官归京》"},
      {t:"玉容寂寞泪阑干，梨花一枝春带雨。",a:"白居易·《长恨歌》"},
    ]},
  "兰花":{alias:"幽兰、国香",sci:"Cymbidium",family:"兰科·兰属",flang:"高洁、清雅、爱国",
    origin:"原产于中国南部山地，栽培历史2500余年",
    story:"兰花与梅、竹、菊并称「四君子」。孔子爱兰，称「兰当为王者香」。幽谷独芳，是君子之德。",
    care:"喜阴凉通风环境，忌强光。浇水宜干透再浇。",
    poems:[
      {t:"芝兰生于深林，不以无人而不芳。",a:"《孔子家语》"},
      {t:"孤兰生幽园，众草共芜没。",a:"李白·《古风》"},
    ]},
  "桂花":{alias:"木樨、九里香",sci:"Osmanthus fragrans",family:"木樨科·木樨属",flang:"崇高、美好、吉祥",
    origin:"原产于中国西南喜马拉雅山区",
    story:"「蟾宫折桂」比喻科举高中。中秋赏桂是江南传统，桂花酿酒、做糕，是节庆美食。",
    care:"喜光亦耐阴，忌积水。修剪宜于花后。",
    poems:[
      {t:"暗淡轻黄体性柔，情疏迹远只香留。",a:"李清照·《鹧鸪天·桂花》"},
      {t:"人闲桂花落，夜静春山空。",a:"王维·《鸟鸣涧》"},
    ]},
  "薰衣草":{alias:"灵香草",sci:"Lavandula",family:"唇形科·薰衣草属",flang:"等待爱情、清净",
    origin:"原产于地中海地区，中国新疆伊犁是亚洲最大薰衣草基地",
    story:"伊犁被誉为「东方普罗旺斯」。6月盛开，紫色花海绵延数十公里。",
    care:"喜阳光充足、干燥环境，忌湿。贫瘠沙壤土最佳。",
    poems:[{t:"紫色花海接天涯",a:"民谣"}]},
  "向日葵":{alias:"朝阳花、太阳花",sci:"Helianthus annuus",family:"菊科·向日葵属",flang:"忠诚、阳光、积极向上",
    origin:"原产于北美洲，明代传入中国",
    story:"向日葵随太阳转动的特性使其成为「忠诚」的象征。梵高的名作让其世界闻名。",
    care:"喜阳光，耐旱，忌积水。生长期需充足阳光。",
    poems:[{t:"更无柳絮因风起，惟有葵花向日倾。",a:"司马光·《客中初夏》"}]},
  "郁金香":{alias:"洋荷花",sci:"Tulipa gesneriana",family:"百合科·郁金香属",flang:"博爱、体贴、高雅",
    origin:"原产于中亚和土耳其，经荷兰培育扬名全球",
    story:"唐代已有记载，诗仙李白曾写「兰陵美酒郁金香」。现代荷兰是郁金香王国。",
    care:"喜凉爽气候，球根秋植。需冷藏处理。",
    poems:[{t:"兰陵美酒郁金香，玉碗盛来琥珀光。",a:"李白·《客中作》"}]},
  "红枫":{alias:"枫树、红叶",sci:"Acer palmatum",family:"槭树科·槭属",flang:"热情、深情、激情",
    origin:"原产于中国、日本、朝鲜，秋季红叶是东亚秋景代表",
    story:"「霜叶红于二月花」出自杜牧。香山、九寨沟、栖霞山、天平山是中国四大红叶胜地。",
    care:"喜半阴环境，忌强日晒。酸性土壤最佳。",
    poems:[
      {t:"停车坐爱枫林晚，霜叶红于二月花。",a:"杜牧·《山行》"},
      {t:"月落乌啼霜满天，江枫渔火对愁眠。",a:"张继·《枫桥夜泊》"},
    ]},
  "银杏":{alias:"白果树、公孙树",sci:"Ginkgo biloba",family:"银杏科·银杏属",flang:"坚韧、长寿、沉着",
    origin:"中国特产，被称为「活化石」，生长期2亿年以上",
    story:"银杏树寿可千年。「公孙树」因爷爷栽树孙子收果而得名。秋日满树金黄，是古寺庙标志。",
    care:"极耐寒耐旱，忌水涝。雌雄异株，需搭配种植。",
    poems:[{t:"满城尽带黄金甲",a:"黄巢·《不第后赋菊》（意境借用）"}]},
  "三角梅":{alias:"叶子花、宝巾花",sci:"Bougainvillea",family:"紫茉莉科·叶子花属",flang:"热情、坚韧不拔",
    origin:"原产于南美巴西，现广泛栽培于中国南方",
    story:"深圳、厦门市花。四季常开，色彩丰富。实为苞片而非花瓣。",
    care:"喜光喜热，耐旱耐瘠。盆栽需控水促花。",
    poems:[{t:"鹭岛三角梅如火",a:"现代"}]},
  "荼蘼":{alias:"酴醾、佛见笑",sci:"Rubus rosifolius",family:"蔷薇科·悬钩子属",flang:"女子的美好、末世的繁华",
    origin:"原产于中国",
    story:"「开到荼蘼花事了」——春末最后一种花，花谢即意味着春天结束。象征美好终结。",
    care:"喜阳光充足、排水良好环境。",
    poems:[
      {t:"开到荼蘼花事了，丝丝天棘出莓墙。",a:"王淇·《春暮游小园》"},
      {t:"一架荼蘼满院香，羞映沉檀一种妆。",a:"王安石"}
    ]},
  "迎春花":{alias:"黄素馨",sci:"Jasminum nudiflorum",family:"木樨科·素馨属",flang:"相爱到永远、坚韧不拔",
    origin:"原产于中国北部和中部",
    story:"春寒料峭时第一朵开放，故名「迎春」。与梅花、水仙、山茶并称「雪中四友」。",
    care:"耐寒耐旱，适应性强。花后应短截促新枝。",
    poems:[{t:"金英翠萼带春寒，黄花先报春来早。",a:"白居易"}]},
  "格桑花":{alias:"格桑梅朵、波斯菊",sci:"Cosmos bipinnatus",family:"菊科·秋英属",flang:"幸福、吉祥、美好时光",
    origin:"藏语中「格桑」意为美好时光，原指高原上迎风绽放的各种野花",
    story:"在藏族文化中，格桑花是幸福花的象征。每年7-9月，青藏高原上格桑花海与雪山相映，是最美藏地风光。",
    care:"喜阳光充足，耐寒耐旱。对土壤要求不严。",
    poems:[{t:"高原八月绽繁花，格桑摇曳到天涯。",a:"藏族民歌"}]},
  "野花草甸":{alias:"高山草甸、野花海",sci:"Alpine meadow",family:"多种野生花卉混合",flang:"自由、野性、生生不息",
    origin:"高海拔草甸天然花卉群落，含绿绒蒿、龙胆、报春等数十种野花",
    story:"川西、青海、新疆的高山草甸夏季盛放，是摄影师与自然爱好者的天堂。「人间仙境」之誉由此而来。",
    care:"原生态自然环境，禁止践踏采摘。",
    poems:[{t:"天苍苍，野茫茫，风吹草低见牛羊。",a:"《敕勒歌》"}]},
  "杏花":{alias:"甜梅",sci:"Prunus armeniaca",family:"蔷薇科·李属",flang:"少女娇羞、疑惑",
    origin:"原产中国西北，栽培历史超过3000年",
    story:"「小楼一夜听春雨，深巷明朝卖杏花」。杏花春雨是江南春日最经典的意象。",
    care:"喜光耐寒，忌积水。3月花开，先花后叶。",
    poems:[{t:"沾衣欲湿杏花雨，吹面不寒杨柳风。",a:"志南·《绝句》"},
      {t:"借问酒家何处有，牧童遥指杏花村。",a:"杜牧·《清明》"}]},
  "丁香花":{alias:"紫丁香、百结",sci:"Syringa",family:"木樨科·丁香属",flang:"纯洁、初恋、忧愁",
    origin:"原产于中国华北，哈尔滨市花",
    story:"戴望舒《雨巷》中那个「结着丁香一样的愁怨」的姑娘，使丁香成为诗意忧愁的象征。",
    care:"喜阳光耐寒，耐干旱。春末开花，花序锥形。",
    poems:[{t:"青鸟不传云外信，丁香空结雨中愁。",a:"李璟·《摊破浣溪沙》"}]},
  "彩林":{alias:"秋叶彩林",sci:"Mixed autumn forest",family:"多种落叶乔木",flang:"绚烂、成熟、丰收",
    origin:"中国西部高海拔混交林，秋季集中变色",
    story:"川西米亚罗、九寨沟、毕棚沟每年10-11月，万山红遍、层林尽染，是中国秋色三大胜地。",
    care:"原生态森林景观。",
    poems:[{t:"万山红遍，层林尽染。",a:"毛泽东·《沁园春·长沙》"}]},
  "紫荆花":{alias:"满条红",sci:"Cercis chinensis",family:"豆科·紫荆属",flang:"亲情、手足情深",
    origin:"原产中国黄河流域",
    story:"「田氏分家」典故中三兄弟分家，庭院中紫荆树即枯，复合后再荣，遂成兄弟和睦象征。香港市花为洋紫荆（异种）。",
    care:"喜阳光，耐寒。3-4月先花后叶。",
    poems:[{t:"田氏仓卒骨肉分，荆树有花兄弟乐。",a:"许浑"}]},
  "紫薇花":{alias:"百日红、痒痒树",sci:"Lagerstroemia indica",family:"千屈菜科·紫薇属",flang:"沉迷的爱、好运",
    origin:"原产中国南部",
    story:"花期长达百日（六月至九月），故名「百日红」。古时官署多植，唐代中书省称「紫薇省」。",
    care:"喜光喜热，耐旱。夏季盛开。",
    poems:[{t:"紫薇花对紫薇翁，名目虽同貌不同。",a:"白居易·《紫薇花》"}]},
  "月季":{alias:"月月红、长春花",sci:"Rosa chinensis",family:"蔷薇科·蔷薇属",flang:"永恒的爱、幸福",
    origin:"原产中国，是现代月季与欧洲玫瑰的共同祖先",
    story:"中国古人已栽培月季2000多年，后传入欧洲改良成现代玫瑰，故称「中国之花」。北京、天津市花。",
    care:"喜光耐寒，春秋两季开花最盛。",
    poems:[{t:"谁道花无红百日，紫薇长放半年花。",a:"杨万里"}]},
  "高山杜鹃":{alias:"云锦杜鹃",sci:"Rhododendron fortunei",family:"杜鹃花科·杜鹃属",flang:"孤高、壮美、不屈",
    origin:"高海拔山区，中国西南分布最广",
    story:"百花岭、苍山、贡嘎山一线高山杜鹃海是世界级景观。5-7月开放，漫山如云似锦。",
    care:"喜凉爽湿润酸性土壤，忌强光。",
    poems:[{t:"高山杜鹃映雪开。",a:"现代"}]},
  "芦花":{alias:"芦苇、蒹葭",sci:"Phragmites australis",family:"禾本科·芦苇属",flang:"坚韧、自由、思念",
    origin:"全球广泛分布，中国沿海湿地遍布",
    story:"《诗经》「蒹葭苍苍，白露为霜」即咏芦苇。秋日芦花如雪，是江南水乡和湿地最具诗意的景观。",
    care:"湿生植物，需水体环境。",
    poems:[{t:"蒹葭苍苍，白露为霜。所谓伊人，在水一方。",a:"《诗经·秦风·蒹葭》"}]},
  "胡杨":{alias:"英雄树、沙漠守护者",sci:"Populus euphratica",family:"杨柳科·杨属",flang:"坚韧、永恒、不屈",
    origin:"荒漠河岸林，中国新疆、内蒙古最多",
    story:"「生而千年不死，死而千年不倒，倒而千年不朽」的三千年传奇。额济纳胡杨林每年10月金黄，震撼人心。",
    care:"极耐旱耐盐碱，荒漠先锋树种。",
    poems:[{t:"大漠胡杨万古存，风沙砥砺铸英魂。",a:"现代"}]},
  "椰树":{alias:"椰子树",sci:"Cocos nucifera",family:"棕榈科·椰属",flang:"热带风情、故土情怀",
    origin:"热带海岸原生植物，中国海南岛是主要分布区",
    story:"海南岛三亚、文昌的椰林是海岛风情的灵魂。「椰风海韵」是海南最具标志性的景观。",
    care:"喜高温高湿，盐碱耐受性强。",
    poems:[{t:"椰影婆娑风送暖，海涛拍岸月当空。",a:"现代"}]},
  "芍药":{alias:"花相、将离",sci:"Paeonia lactiflora",family:"芍药科·芍药属",flang:"依依惜别、情人花",
    origin:"原产中国北部",
    story:"与牡丹合称「花中二绝」，牡丹为花王，芍药为花相。扬州芍药甲天下。古时送别赠芍药，故名「将离」。",
    care:"喜凉爽气候，耐寒。宿根草本，秋植春花。",
    poems:[{t:"庭前芍药妖无格，池上芙蕖净少情。",a:"刘禹锡"},
      {t:"芍药承春宠，何曾羡牡丹。",a:"王贞白"}]},
  "木棉花":{alias:"英雄花、攀枝花",sci:"Bombax ceiba",family:"锦葵科·木棉属",flang:"英雄、珍贵、热情",
    origin:"华南、西南地区本土树种",
    story:"广州、攀枝花市花。树形高大，先花后叶，红花如火如焰。被誉为「南国英雄树」。",
    care:"喜热耐旱，3-4月盛开。",
    poems:[{t:"十丈珊瑚是木棉，花开红比朝霞鲜。",a:"陈恭尹"}]},
  "蓝花楹":{alias:"蓝雾树",sci:"Jacaranda mimosifolia",family:"紫葳科·蓝花楹属",flang:"梦境、忧郁、绝望的爱",
    origin:"原产南美，昆明、广州广泛栽培",
    story:"昆明蓝花楹节名扬全国。5-6月满树蓝紫色花朵如烟似雾，被称为「蓝色的春天」。",
    care:"喜光耐旱，忌积水。",
    poems:[{t:"一城烟雨半城蓝，正是楹花烂漫时。",a:"现代"}]},
  "白桦林":{alias:"桦树林",sci:"Betula platyphylla",family:"桦木科·桦木属",flang:"纯洁、青春、等待",
    origin:"北方温带森林，新疆、内蒙古、东北最多",
    story:"朴树一曲《白桦林》唱遍全国。秋日金黄的白桦林，是中国北方最美秋景之一。",
    care:"喜冷凉气候，耐寒不耐热。",
    poems:[{t:"静静的村庄飘着白的雪，阴霾的天空下鸽子飞翔。",a:"朴树·《白桦林》"}]},
  "紫藤":{alias:"藤萝、朱藤",sci:"Wisteria sinensis",family:"豆科·紫藤属",flang:"沉迷的爱、为爱而生",
    origin:"原产中国",
    story:"李白「紫藤挂云木，花蔓宜阳春」是最经典的紫藤诗句。4-5月花穗垂挂如瀑布，如梦似幻。",
    care:"喜光耐寒，攀缘植物，需架支撑。",
    poems:[{t:"紫藤挂云木，花蔓宜阳春。密叶隐歌鸟，香风留美人。",a:"李白·《紫藤树》"}]},
  "玫瑰":{alias:"中国玫瑰、刺玫",sci:"Rosa rugosa",family:"蔷薇科·蔷薇属",flang:"爱情、美丽、激情",
    origin:"原产于中国华北、朝鲜、日本",
    story:"中国古玫瑰与月季不同，花瓣多用于制精油、玫瑰露、鲜花饼。平阴、兰州是著名玫瑰产地。",
    care:"喜光耐寒，耐瘠薄。",
    poems:[{t:"浓似猩猩初染素，轻如燕燕欲凌空。",a:"唐彦谦·《玫瑰》"}]},
  "竹林":{alias:"翠竹、君子",sci:"Bambusoideae",family:"禾本科·竹亚科",flang:"气节、谦虚、坚韧",
    origin:"中国原产，南方广布",
    story:"竹位列「四君子」「岁寒三友」。蜀南竹海、莫干山竹海、安吉竹海是国内著名竹景。",
    care:"喜温暖湿润，忌积水。",
    poems:[{t:"独坐幽篁里，弹琴复长啸。深林人不知，明月来相照。",a:"王维·《竹里馆》"},
      {t:"咬定青山不放松，立根原在破岩中。",a:"郑燮·《竹石》"}]},
  "茉莉花":{alias:"末利、抹厉",sci:"Jasminum sambac",family:"木樨科·素馨属",flang:"纯洁、忠贞、亲切",
    origin:"原产印度、阿拉伯，汉代传入中国",
    story:"民歌《茉莉花》传唱世界。花香清远，既可观赏又可制茶、入药。",
    care:"喜温暖湿润，夏季盛开。",
    poems:[{t:"好一朵美丽的茉莉花，芬芳美丽满枝桠。",a:"民歌"}]},
  "海棠花":{alias:"解语花",sci:"Malus halliana",family:"蔷薇科·苹果属",flang:"温和、美丽、游子思乡",
    origin:"原产中国",
    story:"杨贵妃醉后被唐明皇称为「海棠春睡」。苏轼「只恐夜深花睡去，故烧高烛照红妆」咏海棠。",
    care:"喜光耐寒，3-4月开花。",
    poems:[{t:"只恐夜深花睡去，故烧高烛照红妆。",a:"苏轼·《海棠》"},
      {t:"东风袅袅泛崇光，香雾空蒙月转廊。",a:"苏轼"}]},
  "蔷薇":{alias:"野蔷薇、刺花",sci:"Rosa multiflora",family:"蔷薇科·蔷薇属",flang:"爱情、美丽、盛夏",
    origin:"原产中国",
    story:"「蔷薇架下妾千金」。蔷薇是月季、玫瑰的原种，初夏盛开，花枝蔓延成墙成架。",
    care:"喜光，攀援性强，适合做花墙。",
    poems:[{t:"不摇香已乱，无风花自飞。",a:"柳恽·《咏蔷薇》"}]},
  "绣球花":{alias:"八仙花、紫阳花",sci:"Hydrangea macrophylla",family:"绣球花科·绣球属",flang:"希望、团圆、美满",
    origin:"原产东亚",
    story:"花色随土壤酸碱度而变（酸性蓝、碱性粉），浪漫神奇。日本镰仓的「紫阳花寺」享誉东亚。",
    care:"喜半阴，酸性土开蓝花，碱性土开粉花。",
    poems:[{t:"何年仙犬吠踯躅，几度紫阳花满庭。",a:"白居易"}]},
  "黄栌":{alias:"红叶、烟树",sci:"Cotinus coggygria",family:"漆树科·黄栌属",flang:"壮丽、绚烂、成熟",
    origin:"中国北方山地，北京香山最为著名",
    story:"香山红叶秋意浓，主角便是黄栌。每年10月下旬至11月上旬，漫山遍野红如火焰。",
    care:"喜光耐寒，秋季变色强烈。",
    poems:[{t:"停车坐爱枫林晚，霜叶红于二月花。",a:"杜牧"}]},
  "芙蓉花":{alias:"木芙蓉、拒霜花",sci:"Hibiscus mutabilis",family:"锦葵科·木槿属",flang:"纯洁、美丽、贞操",
    origin:"原产中国",
    story:"成都别称「蓉城」即因五代后蜀主孟昶在城墙遍植芙蓉。「芙蓉一日三变色」是其特色。",
    care:"喜温暖湿润，秋季盛开。",
    poems:[{t:"千株扫作一番黄，只有芙蓉独自芳。",a:"吕本中"}]},
  "山茶花":{alias:"茶花、曼陀罗",sci:"Camellia japonica",family:"山茶科·山茶属",flang:"高洁、谦让、可爱",
    origin:"原产中国东部",
    story:"云南山茶与四川山茶齐名，昆明金殿茶花千朵万朵。郭沫若誉为「云南茶花甲天下」。",
    care:"喜酸性土，半阴环境。冬春之交开花。",
    poems:[{t:"谁怜夜雪凋零后，数点殷红照翠苔。",a:"陆游·《山茶花》"}]},
  "玉兰花":{alias:"白玉兰、木兰",sci:"Magnolia denudata",family:"木兰科·木兰属",flang:"高洁、纯洁、忠贞",
    origin:"原产中国",
    story:"上海市花。「玉兰堂前春雪晴」。先花后叶，洁白如玉，是早春最优雅的花之一。",
    care:"喜光耐寒，忌积水。",
    poems:[{t:"霓裳片片晚妆新，束素亭亭玉殿春。",a:"文徵明·《咏玉兰》"}]},
  "鸡蛋花":{alias:"缅栀子、印度素馨",sci:"Plumeria rubra",family:"夹竹桃科·鸡蛋花属",flang:"孕育希望、复活、新生",
    origin:"原产中美洲，中国南方广泛栽培",
    story:"广东、广西、云南、海南常见，老挝国花。白瓣黄心，形如荷包蛋，故名。花香甜美，可制香。",
    care:"喜热耐旱，冬季休眠落叶。",
    poems:[{t:"蛋花满地似残雪，异国风情醉南天。",a:"现代"}]},
  "牵牛花":{alias:"喇叭花、朝颜",sci:"Ipomoea nil",family:"旋花科·牵牛属",flang:"爱情、永恒的羁绊",
    origin:"原产美洲，古时传入中国",
    story:"「朝颜一日花」，清晨开放黄昏凋谢。日本江户时代兴起赏牵牛风气。",
    care:"一年生攀缘草本，易栽培。",
    poems:[{t:"昔人咏牵牛，谓其牛郎织女。",a:"古人"}]},
  "水仙花":{alias:"凌波仙子、雅蒜",sci:"Narcissus tazetta",family:"石蒜科·水仙属",flang:"纯洁、高雅、思念",
    origin:"原产地中海，宋代传入中国",
    story:"漳州水仙甲天下。「凌波仙子生尘袜，水上盈盈步微月」。与梅花、山茶、迎春并称「雪中四友」。",
    care:"球根植物，水培或土培皆可。冬春开花。",
    poems:[{t:"凌波仙子生尘袜，水上盈盈步微月。",a:"黄庭坚·《王充道送水仙花五十枝》"}]},
  "木兰":{alias:"辛夷、紫玉兰",sci:"Magnolia liliiflora",family:"木兰科·木兰属",flang:"灵魂高尚、忠贞不渝",
    origin:"原产中国",
    story:"《离骚》「朝饮木兰之坠露兮，夕餐秋菊之落英」。屈原以木兰自喻，成为高洁品格象征。",
    care:"喜光耐寒，忌积水。早春开花。",
    poems:[{t:"朝饮木兰之坠露兮，夕餐秋菊之落英。",a:"屈原·《离骚》"}]},
  "云锦杜鹃":{alias:"高山云锦",sci:"Rhododendron fortunei",family:"杜鹃花科·杜鹃属",flang:"坚韧、壮美、云间之花",
    origin:"中国特有，分布于华东、华中高山",
    story:"庐山云锦杜鹃最为著名，花大如碗、形似锦缎。5月盛开于海拔1000米以上，云雾缭绕中宛如仙境。",
    care:"喜凉爽酸性土壤，忌强光暴晒。",
    poems:[{t:"云锦绕山腰，花开满翠岭。",a:"现代"}]},
  "冬樱花":{alias:"十月樱、寒樱",sci:"Prunus subhirtella",family:"蔷薇科·李属",flang:"冬日希望、逆时而美",
    origin:"原产中国西南，云南冬樱花尤为出名",
    story:"无量山、南涧冬樱花每年11-12月盛开，是云南冬季最美风景之一。与普通樱花不同，冬樱花在寒冷季节绽放。",
    care:"耐寒耐旱，适合南方冬季栽培。",
    poems:[{t:"冬日樱花暖如春，无量山前云彩新。",a:"现代"}]},
  "凌霄花":{alias:"紫葳、五爪龙",sci:"Campsis grandiflora",family:"紫葳科·凌霄属",flang:"慈母之爱、声誉",
    origin:"原产中国",
    story:"攀援向上开花如喇叭，「藤花朵朵压枝低」。古时文人常以凌霄寄托凌云壮志。",
    care:"喜光耐旱，攀援植物需架支撑。",
    poems:[{t:"披云似有凌霄志，向日宁无捧日心。",a:"舒岳祥·《凌霄花》"}]},
  "凤凰花":{alias:"火树、金凤花",sci:"Delonix regia",family:"豆科·凤凰木属",flang:"离别、思念、青春之火",
    origin:"原产马达加斯加，广泛栽培于华南",
    story:"厦门市树。5-8月花开如火如焰，是毕业季的象征。「凤凰花开的路口，有我最珍重的朋友」。",
    care:"喜高温湿润，不耐寒。",
    poems:[{t:"凤凰花开毕业季，校园少年各天涯。",a:"现代"}]},
  "合欢花":{alias:"夜合、马缨花",sci:"Albizia julibrissin",family:"豆科·合欢属",flang:"夫妻恩爱、合家欢乐",
    origin:"原产中国",
    story:"合欢树叶昼开夜合，花如绒球粉红。传说古时夫妻不和，种合欢后重归于好。",
    care:"喜光耐旱，夏季开花。",
    poems:[{t:"合欢花开粉红云，佳人独倚黄昏门。",a:"现代"}]},
  "木槿花":{alias:"朝开暮落花、舜华",sci:"Hibiscus syriacus",family:"锦葵科·木槿属",flang:"坚韧、生命短暂但美丽",
    origin:"原产中国",
    story:"韩国国花「无穷花」即木槿。花虽一日即凋谢，但新花不断，象征坚韧不屈。",
    care:"喜光耐寒，夏秋开花。",
    poems:[{t:"一朝花开一朝谢，唯有坚韧不灭绝。",a:"现代"}]},
  "朱槿":{alias:"扶桑、大红花",sci:"Hibiscus rosa-sinensis",family:"锦葵科·木槿属",flang:"新鲜的恋情、微妙的美",
    origin:"中国南部原产",
    story:"马来西亚国花。鲜红大朵，是华南最具代表性的观赏花卉。四季开花，终年不断。",
    care:"喜高温，不耐寒。",
    poems:[{t:"朱槿盈阶年复年，热带风情醉南天。",a:"现代"}]},
  "栀子花":{alias:"黄栀、林兰",sci:"Gardenia jasminoides",family:"茜草科·栀子属",flang:"永恒的爱、一生守候",
    origin:"原产中国南部",
    story:"「栀子花开六月里，白白的花儿同心同根」。歌曲让栀子花成为青春回忆的象征。",
    care:"喜酸性土，半阴环境。",
    poems:[{t:"晚庭花落地来香，只为幽人独举觞。",a:"宋庠·《栀子花》"}]},
  "沙漠花":{alias:"荒漠野花",sci:"Desert flora mix",family:"多种耐旱植物",flang:"生命之歌、坚韧",
    origin:"沙漠边缘及绿洲地区",
    story:"敦煌、吐鲁番、阿拉善春季沙漠花开，「大漠之春」是荒漠最动人的短暂瞬间。",
    care:"极耐旱，自然生长为佳。",
    poems:[{t:"瀚海风沙花自开，生命顽强驻黄沙。",a:"现代"}]},
  "波斯菊":{alias:"大波斯菊、秋英",sci:"Cosmos bipinnatus",family:"菊科·秋英属",flang:"少女的纯情、永远快乐",
    origin:"原产墨西哥，广泛栽培",
    story:"与格桑花同属，但为大花园艺品种。8-10月花海绵延，秋日最美野趣之花。",
    care:"喜光耐旱，一年生。",
    poems:[{t:"波斯菊摇秋日光，风吹花动满山香。",a:"现代"}]},
  "百合":{alias:"强瞿、蒜脑薯",sci:"Lilium brownii",family:"百合科·百合属",flang:"百年好合、纯洁",
    origin:"原产中国，兰州为主产区",
    story:"名取「百年好合」，是婚庆吉祥花卉。兰州食用百合、龙牙百合都享盛名。",
    care:"喜冷凉气候，球根植物。",
    poems:[{t:"堂前种山丹，错落玛瑙盘。堂后种百合，萧洒风露香。",a:"陆游·《北窗偶题》"}]},
  "睡莲":{alias:"子午莲、水芹花",sci:"Nymphaea",family:"睡莲科·睡莲属",flang:"洁净、纯真",
    origin:"全球水生植物，中国南北均有",
    story:"莫奈的《睡莲》使其举世闻名。与荷花不同，睡莲叶贴水面，花色更丰富。",
    care:"水生植物，喜阳光充足静水。",
    poems:[{t:"睡莲漾碧池，午梦一帘诗。",a:"现代"}]},
  "石榴花":{alias:"海榴、安石榴",sci:"Punica granatum",family:"千屈菜科·石榴属",flang:"成熟的美丽、子孙满堂",
    origin:"原产伊朗，汉代传入中国",
    story:"「五月榴花照眼明」。石榴多籽，象征多子多福。古时婚礼常用石榴花装饰。",
    care:"喜光耐旱，夏季开花。",
    poems:[{t:"五月榴花照眼明，枝间时见子初成。",a:"韩愈·《题张十一旅舍三咏·榴花》"}]},
  "紫云英":{alias:"红花草、翘摇",sci:"Astragalus sinicus",family:"豆科·黄芪属",flang:"幸福、希望、随遇而安",
    origin:"原产中国，江南常见",
    story:"春日田野紫红花海，既是绿肥作物也是蜜源。「紫云英蜜」闻名全国。",
    care:"冬春生长，常作为稻田绿肥。",
    poems:[{t:"紫云英放田间笑，蝶舞蜂飞春已深。",a:"现代"}]},
  "紫菜花":{alias:"甘蓝花、紫油菜",sci:"Brassica var.",family:"十字花科·芸薹属",flang:"平凡之美",
    origin:"栽培作物",
    story:"与油菜花同属，但花色为紫色。罗平、婺源偶见紫油菜花海，别具风情。",
    care:"同油菜。",
    poems:[{t:"紫菜花开如梦境，田园风光入诗来。",a:"现代"}]},
  "苹果梨花":{alias:"延边苹果梨",sci:"Pyrus sinkiangensis",family:"蔷薇科·梨属",flang:"纯洁、希望",
    origin:"延边特有品种，融合苹果与梨",
    story:"延边龙井苹果梨花节闻名东北，春天万顷花海，是东北最美田园风光。",
    care:"耐寒抗病，果实汁多味甜。",
    poems:[{t:"延边四月梨花白，万顷花田入眼来。",a:"现代"}]},
  "茶花":{alias:"山茶、耐冬",sci:"Camellia",family:"山茶科·山茶属",flang:"可爱、谦让、理想的爱",
    origin:"原产中国",
    story:"与山茶花同类，云南大理茶花闻名。「世界茶花看中国，中国茶花看云南」。",
    care:"喜酸性土，半阴环境。",
    poems:[{t:"东风才有又西风，群木山中叶叶空。惟有山茶偏耐久，绿丛又放数枝红。",a:"陆游"}]},
  "虞美人":{alias:"丽春花、赛牡丹",sci:"Papaver rhoeas",family:"罂粟科·罂粟属",flang:"生离死别、慰藉",
    origin:"原产欧亚大陆",
    story:"相传为虞姬鲜血所化，故名。与鸦片罂粟同科但无药性，是著名观赏花。",
    care:"喜冷凉，一年生。",
    poems:[{t:"看朱成碧思纷纷，憔悴支离为忆君。",a:"相传·虞姬"}]},
  "蜡梅":{alias:"腊梅、黄梅花",sci:"Chimonanthus praecox",family:"蜡梅科·蜡梅属",flang:"慈爱、高尚、不畏严寒",
    origin:"原产中国中部",
    story:"与梅花不同科但同时凌寒开放。「蜡」字因花色如蜡。鄢陵蜡梅甲天下。",
    care:"喜光耐寒，冬末早春开花。",
    poems:[{t:"小寒料峭，一番春意换年芳。蛾儿雪柳风光。",a:"赵长卿·《探春令》"}]},
  "蝴蝶兰":{alias:"蝶兰、台湾火鹤",sci:"Phalaenopsis",family:"兰科·蝴蝶兰属",flang:"我爱你、幸福即将来临",
    origin:"原产东南亚，台湾是重要产地",
    story:"花形如蝴蝶飞舞，是兰花中最受欢迎的品种。台湾蝴蝶兰出口全球。",
    care:"喜高温高湿，附生植物。",
    poems:[{t:"蝴蝶翩翩入兰室，芳香盈袖醉春风。",a:"现代"}]},
  "辛夷花":{alias:"木笔、紫玉兰",sci:"Magnolia liliiflora",family:"木兰科·木兰属",flang:"高尚、敬意",
    origin:"原产中国",
    story:"与木兰同属，花苞形似毛笔故名「木笔」。王维辋川有「辛夷坞」，即种辛夷之地。",
    care:"喜光耐寒。",
    poems:[{t:"木末芙蓉花，山中发红萼。涧户寂无人，纷纷开且落。",a:"王维·《辛夷坞》"}]},
  "野杏花":{alias:"山杏",sci:"Prunus sibirica",family:"蔷薇科·李属",flang:"野趣、自由",
    origin:"中国北方山地",
    story:"新疆伊犁大西沟野杏花春天漫山遍野，是「中国野杏的故乡」。粉白花海与雪山相映。",
    care:"耐寒耐旱，野生为主。",
    poems:[{t:"野杏花开满山春，伊犁四月似仙尘。",a:"现代"}]},
  "金针花":{alias:"黄花菜、忘忧草",sci:"Hemerocallis fulva",family:"阿福花科·萱草属",flang:"母爱、忘却烦恼",
    origin:"原产中国",
    story:"古称「萱草」，代表母亲。「北堂种萱」是母亲居所的别称。既可观赏又可食用。",
    care:"喜光耐旱，宿根植物。",
    poems:[{t:"萱草生北堂，颜色鲜且好。",a:"王冕·《墨萱图》"}]},
  "雾凇":{alias:"树挂、冰花",sci:"Rime (ice crystal)",family:"冰晶景观",flang:"纯洁、晶莹、奇迹",
    origin:"严寒地区自然景观",
    story:"吉林雾凇与桂林山水、云南石林、长江三峡并称「中国四大自然奇观」。冬晨松花江畔，千树万树梨花开。",
    care:"自然景观，需严寒+水汽条件。",
    poems:[{t:"忽如一夜春风来，千树万树梨花开。",a:"岑参·《白雪歌送武判官归京》"}]},
};

  var wiki=FLORA_WIKI?FLORA_WIKI[sp]:null;
  if(!wiki)return(<div style={{position:"fixed",inset:0,zIndex:140,background:"rgba(0,0,0,.5)",
    display:"flex",alignItems:"center",justifyContent:"center"}} onClick={onClose}>
    <div onClick={function(e){e.stopPropagation();}} style={{background:"#faf6ef",padding:"30px 40px",borderRadius:10,textAlign:"center"}}>
      <div style={{fontSize:40,marginBottom:12}}>{"🌸"}</div>
      <div style={{fontSize:14,color:"#3a2818"}}>{sp} 的百科资料整理中</div>
      <button onClick={onClose} style={{marginTop:16,border:"1px solid #e0dcd4",background:"transparent",
        borderRadius:16,padding:"6px 22px",cursor:"pointer",color:"#8a7a68"}}>关闭</button>
    </div></div>);
  var fl=flora?flora.find(function(f){return f.sp===sp;}):null;
  var mainColor=(fl?fl.c:null)||"#c06040";
  var related=flora?flora.filter(function(f){return f.sp===sp;}).slice(0,6):[];
  return(<div style={{position:"fixed",inset:0,zIndex:140,background:"rgba(20,15,10,.65)",
    display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(6px)"}} onClick={onClose}>
    <div onClick={function(e){e.stopPropagation();}} style={{background:"#faf6ef",width:"min(580px,94vw)",
      maxHeight:"90vh",borderRadius:12,overflow:"hidden",display:"flex",flexDirection:"column",
      boxShadow:"0 20px 60px rgba(0,0,0,.4)"}}>
      {/* Header */}
      <div style={{padding:"26px 30px 20px",background:mainColor+"15",
        borderBottom:"1px solid "+mainColor+"33",position:"relative"}}>
        <button onClick={onClose} style={{position:"absolute",top:12,right:14,border:"none",
          background:"rgba(0,0,0,.1)",color:"#3a2818",cursor:"pointer",fontSize:13,
          width:26,height:26,borderRadius:"50%"}}>{"×"}</button>
        <div style={{display:"flex",gap:16,alignItems:"center"}}>
          <div style={{width:72,height:72,borderRadius:"50%",background:"#fff",
            border:"2px solid "+mainColor+"88",display:"flex",alignItems:"center",justifyContent:"center",
            boxShadow:"0 4px 14px "+mainColor+"33"}}>
            <FI sp={sp} sz={52} co={mainColor}/>
          </div>
          <div style={{flex:1}}>
            <h2 style={{fontSize:28,fontWeight:900,color:"#2a2018",letterSpacing:6,margin:0}}>{sp}</h2>
            <div style={{fontSize:11,color:"#8a7a60",marginTop:3}}>{wiki.sci} · {wiki.family}</div>
          </div>
        </div>
        <div style={{marginTop:14,padding:"8px 14px",background:"rgba(255,255,255,.6)",borderRadius:6,
          borderLeft:"3px solid "+mainColor}}>
          <div style={{fontSize:10,color:"#8a7a60",letterSpacing:3,marginBottom:3}}>花语</div>
          <div style={{fontSize:14,color:"#3a2818",fontWeight:600,letterSpacing:3}}>{wiki.flang}</div>
        </div>
      </div>
      {/* Body */}
      <div style={{flex:1,overflow:"auto",padding:"18px 30px"}}>
        <div style={{marginBottom:14}}>
          <div style={{fontSize:10,color:mainColor,letterSpacing:3,fontWeight:600,marginBottom:4}}>别名</div>
          <div style={{fontSize:13,color:"#3a2818"}}>{wiki.alias}</div>
        </div>
        <div style={{marginBottom:14}}>
          <div style={{fontSize:10,color:mainColor,letterSpacing:3,fontWeight:600,marginBottom:4}}>文化典故</div>
          <div style={{fontSize:13,color:"#3a2818",lineHeight:1.8,
            background:"#f5f0e8",padding:"10px 14px",borderRadius:6}}>{wiki.story}</div>
        </div>
        <div style={{marginBottom:14}}>
          <div style={{fontSize:10,color:mainColor,letterSpacing:3,fontWeight:600,marginBottom:4}}>养护</div>
          <div style={{fontSize:13,color:"#3a2818",lineHeight:1.7}}>{wiki.care}</div>
        </div>
        {wiki.poems&&wiki.poems.length>0&&<div style={{marginBottom:14}}>
          <div style={{fontSize:10,color:mainColor,letterSpacing:3,fontWeight:600,marginBottom:8}}>
            古诗词 · {wiki.poems.length}首</div>
          {wiki.poems.map(function(p,i){return(
            <div key={i} style={{marginBottom:10,padding:"12px 16px",
              background:mainColor+"08",borderRadius:6,borderLeft:"2px solid "+mainColor+"55"}}>
              <div style={{fontSize:14,color:"#2a2018",lineHeight:2,letterSpacing:2,fontStyle:"italic"}}>{p.t}</div>
              <div style={{fontSize:11,color:mainColor,marginTop:4,textAlign:"right"}}>{p.a}</div>
            </div>);})}
        </div>}
        {related.length>0&&<div style={{marginBottom:14}}>
          <div style={{fontSize:10,color:mainColor,letterSpacing:3,fontWeight:600,marginBottom:8}}>
            观赏地 · {flora?flora.filter(function(f){return f.sp===sp;}).length:0}处</div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {related.map(function(r){return(<div key={r.id} style={{padding:"6px 10px",background:"#f5f0e8",
              borderRadius:4,fontSize:12,color:"#3a2818"}}>{r.n}</div>);})}
          </div>
          {onPickSpecies&&<button onClick={function(){onPickSpecies(sp);onClose();}}
            style={{marginTop:10,border:"1px solid "+mainColor,background:mainColor+"11",
              color:mainColor,borderRadius:16,padding:"6px 20px",cursor:"pointer",
              fontSize:12,letterSpacing:2,fontWeight:600}}>在地图上查看</button>}
        </div>}
      </div>
    </div>
  </div>);
}

// ═══ P1-1: 节气花事日历 (Seasonal Flower Calendar) ═══
function CalendarPanel({onClose,flora}){
  const [viewMonth,setViewMonth]=useState(new Date().getMonth());
  const months=["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"];
  const jieqiByMonth=[
    [{n:"小寒",d:5},{n:"大寒",d:20}],  // 1月
    [{n:"立春",d:4},{n:"雨水",d:19}],  // 2月
    [{n:"惊蛰",d:5},{n:"春分",d:20}],  // 3月
    [{n:"清明",d:4},{n:"谷雨",d:19}],  // 4月
    [{n:"立夏",d:5},{n:"小满",d:21}],  // 5月
    [{n:"芒种",d:5},{n:"夏至",d:21}],  // 6月
    [{n:"小暑",d:7},{n:"大暑",d:22}],  // 7月
    [{n:"立秋",d:7},{n:"处暑",d:23}],  // 8月
    [{n:"白露",d:7},{n:"秋分",d:23}],  // 9月
    [{n:"寒露",d:8},{n:"霜降",d:23}],  // 10月
    [{n:"立冬",d:7},{n:"小雪",d:22}],  // 11月
    [{n:"大雪",d:7},{n:"冬至",d:22}],  // 12月
  ];
  // Flowers blooming this month
  var monthFlowers=flora?flora.filter(function(f){
    var m=viewMonth+1;
    if(f.pk[0]<=f.pk[1])return m>=f.pk[0]&&m<=f.pk[1];
    return m>=f.pk[0]||m<=f.pk[1];
  }).slice(0,30):[];
  // Group by species
  var bySpecies={};
  monthFlowers.forEach(function(f){if(!bySpecies[f.sp])bySpecies[f.sp]={sp:f.sp,c:f.c,s:f.s,spots:[]};bySpecies[f.sp].spots.push(f);});
  var speciesList=Object.values(bySpecies).sort(function(a,b){return b.spots.length-a.spots.length;});

  // Generate iCal
  var generateICal=function(){
    var cal="BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//HuaXinFeng//CN\nCALSCALE:GREGORIAN\n";
    var year=new Date().getFullYear();
    flora.filter(function(f){return f._pred&&f._pred.dateStr;}).slice(0,50).forEach(function(f){
      var pred=f._pred;
      var month=String(pred.predMonth||1).padStart(2,"0");
      var day=String(pred.predDay||1).padStart(2,"0");
      cal+="BEGIN:VEVENT\n";
      cal+="DTSTART:"+year+month+day+"\n";
      cal+="SUMMARY:"+f.sp+" · "+f.n+" 预测盛花期\n";
      cal+="DESCRIPTION:"+f.po+"\\n建议："+f.tp+"\\n置信度"+pred.confidence+"%\n";
      cal+="LOCATION:"+f.n+"\n";
      cal+="END:VEVENT\n";
    });
    cal+="END:VCALENDAR\n";
    var blob=new Blob([cal],{type:"text/calendar"});
    var a=document.createElement("a");
    a.download="花信风-花事日历.ics";
    a.href=URL.createObjectURL(blob);
    a.click();
  };

  return(<div style={{position:"fixed",inset:0,zIndex:130,background:"rgba(20,15,10,.65)",
    display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(6px)"}} onClick={onClose}>
    <div onClick={function(e){e.stopPropagation();}} style={{background:"#faf6ef",width:"min(680px,94vw)",
      maxHeight:"90vh",borderRadius:14,overflow:"hidden",display:"flex",flexDirection:"column",
      boxShadow:"0 20px 60px rgba(0,0,0,.4)"}}>
      {/* Header */}
      <div style={{padding:"18px 24px 14px",borderBottom:"1px solid #ece6dc",
        background:"linear-gradient(180deg,#faf6ef,#f2ebd8)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <h2 style={{fontSize:20,fontWeight:900,color:"#2a2018",letterSpacing:6,margin:0}}>🗓 花事日历</h2>
            <div style={{fontSize:11,color:"#8a7a60",marginTop:4}}>节气 · 花期 · 订阅</div>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <button onClick={generateICal} style={{border:"1px solid #c06040",background:"#c06040"+"15",
              borderRadius:16,padding:"5px 14px",cursor:"pointer",fontSize:11,color:"#c06040",fontWeight:600}}>
              📅 导出iCal</button>
            <button onClick={onClose} style={{border:"none",background:"rgba(0,0,0,.08)",color:"#3a2818",
              cursor:"pointer",fontSize:14,width:28,height:28,borderRadius:"50%"}}>{"×"}</button>
          </div>
        </div>
        {/* Month nav */}
        <div style={{display:"flex",gap:2,marginTop:12,flexWrap:"wrap"}}>
          {months.map(function(m,i){return(
            <button key={i} onClick={function(){setViewMonth(i);}} className="hx-monthbtn"
              style={{border:"none",borderRadius:6,padding:"4px 8px",cursor:"pointer",fontSize:11,
                background:viewMonth===i?"#c06040"+"22":"transparent",
                color:viewMonth===i?"#c06040":"#8a7a68",fontWeight:viewMonth===i?700:400}}>{m}</button>);})}
        </div>
      </div>
      {/* Body */}
      <div style={{flex:1,overflow:"auto",padding:"16px 24px"}}>
        {/* Jieqi for this month */}
        <div style={{display:"flex",gap:12,marginBottom:16}}>
          {(jieqiByMonth[viewMonth]||[]).map(function(jq,i){return(
            <div key={i} style={{flex:1,padding:"10px 14px",background:"#f5f0e8",borderRadius:8,
              borderLeft:"3px solid #c06040"}}>
              <div style={{fontSize:16,fontWeight:800,color:"#2a2018",letterSpacing:3}}>{jq.n}</div>
              <div style={{fontSize:11,color:"#8a7a60"}}>{viewMonth+1}月{jq.d}日</div>
            </div>);})}
        </div>
        {/* Flowers this month */}
        <div style={{fontSize:11,color:"#b08040",letterSpacing:3,marginBottom:10,fontWeight:600}}>
          · {months[viewMonth]}花事 · 共{speciesList.length}种 ·</div>
        {speciesList.length===0&&<div style={{textAlign:"center",padding:"30px 0",color:"#8a7a60",fontSize:13}}>
          本月暂无花事记录</div>}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:10}}>
          {speciesList.map(function(sp){
            var sm=SM[sp.s];
            return(<div key={sp.sp} style={{padding:"10px 14px",background:"#fff",borderRadius:8,
              border:"1px solid "+sp.c+"33",borderLeft:"3px solid "+sp.c}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                <FI sp={sp.sp} sz={24} co={sp.c}/>
                <div>
                  <div style={{fontSize:14,fontWeight:700,color:"#2a2018"}}>{sp.sp}</div>
                  <div style={{fontSize:10,color:sp.c}}>{sm?sm.i:""} {sp.spots.length}处可赏</div>
                </div>
              </div>
              <div style={{fontSize:11,color:"#8a7a60",lineHeight:1.6}}>
                {sp.spots.slice(0,3).map(function(s){return s.n.split("·")[1]||s.n;}).join(" · ")}
                {sp.spots.length>3?" …":""}
              </div>
            </div>);
          })}
        </div>
      </div>
    </div>
  </div>);
}

// ═══ P2-1: 众包花事播报 (Crowd-Sourced Bloom Reports) ═══
function CrowdPanel({onClose,flora}){
  var [reports,setReports]=useState([]);
  var [selSpot,setSelSpot]=useState(null);
  var [status,setStatus]=useState("");
  var [note,setNote]=useState("");

  // Load shared reports
  useEffect(function(){(async function(){
    try{var r=window.storage?await window.storage.get("crowd_reports",true):null;
      if(r&&r.value)setReports(JSON.parse(r.value));}catch(e){}
  })();},[]);

  var submitReport=async function(){
    if(!selSpot||!status)return;
    var newReport={spotId:selSpot.id,spotName:selSpot.n,sp:selSpot.sp,c:selSpot.c,
      status:status,note:note,date:new Date().toLocaleDateString("zh-CN"),ts:Date.now()};
    var newReports=[newReport].concat(reports).slice(0,100);
    setReports(newReports);setSelSpot(null);setStatus("");setNote("");
    try{if(window.storage)await window.storage.set("crowd_reports",JSON.stringify(newReports),true);}catch(e){}
  };

  var statusOpts=[
    {k:"blooming",l:"🌸 盛花期",c:"#e06050"},
    {k:"budding",l:"🌱 含苞待放",c:"#60a050"},
    {k:"early",l:"🌼 初花期",c:"#e0a040"},
    {k:"fading",l:"🍂 将谢",c:"#a08060"},
    {k:"faded",l:"❄ 已谢",c:"#8a8a8a"},
  ];

  return(<div style={{position:"fixed",inset:0,zIndex:130,background:"rgba(20,15,10,.65)",
    display:"flex",justifyContent:"flex-end",backdropFilter:"blur(6px)"}} onClick={onClose}>
    <div onClick={function(e){e.stopPropagation();}} style={{width:"min(420px,90vw)",height:"100vh",
      background:"#faf6ef",overflowY:"auto",boxShadow:"-4px 0 24px rgba(0,0,0,.15)"}}>
      {/* Header */}
      <div style={{padding:"20px 22px 14px",borderBottom:"1px solid #ece6dc",position:"sticky",top:0,
        zIndex:2,background:"#faf6ef"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <h2 style={{fontSize:20,fontWeight:900,color:"#2a2018",letterSpacing:6,margin:0}}>📡 花讯播报</h2>
            <div style={{fontSize:11,color:"#8a7a60",marginTop:4}}>众包实况 · 让预测更精准</div>
          </div>
          <button onClick={onClose} style={{border:"none",background:"rgba(0,0,0,.08)",color:"#3a2818",
            cursor:"pointer",fontSize:14,width:28,height:28,borderRadius:"50%"}}>{"×"}</button>
        </div>
      </div>
      {/* Submit new report */}
      <div style={{padding:"16px 22px",borderBottom:"1px solid #ece6dc",background:"#f8f4ee"}}>
        <div style={{fontSize:12,color:"#b08040",letterSpacing:3,marginBottom:10,fontWeight:600}}>· 提交花讯 ·</div>
        {/* Spot search */}
        <div style={{marginBottom:10}}>
          <input placeholder="搜索景点名称..." onChange={function(e){
            var q=e.target.value;if(!q){setSelSpot(null);return;}
            var match=flora?flora.find(function(f){return f.n.includes(q)||f.sp.includes(q);}):null;
            if(match)setSelSpot(match);
          }} style={{width:"100%",border:"1px solid #e0dcd4",borderRadius:8,padding:"8px 12px",
            fontSize:12,background:"#fff",outline:"none"}}/>
          {selSpot&&<div style={{marginTop:6,padding:"6px 10px",background:"#fff",borderRadius:6,
            border:"1px solid "+selSpot.c+"44",display:"flex",alignItems:"center",gap:6}}>
            <FI sp={selSpot.sp} sz={18} co={selSpot.c}/>
            <span style={{fontSize:13,fontWeight:600,color:"#2a2018"}}>{selSpot.n}</span>
            <span style={{fontSize:11,color:selSpot.c}}>{selSpot.sp}</span>
          </div>}
        </div>
        {/* Status select */}
        <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:10}}>
          {statusOpts.map(function(s){return(
            <button key={s.k} onClick={function(){setStatus(s.k);}}
              style={{border:"1.5px solid "+(status===s.k?s.c:"#e0dcd4"),
                background:status===s.k?s.c+"18":"#fff",borderRadius:16,padding:"4px 12px",
                cursor:"pointer",fontSize:11,color:status===s.k?s.c:"#8a7a68",fontWeight:status===s.k?700:500}}>
              {s.l}</button>);})}
        </div>
        {/* Note */}
        <input value={note} onChange={function(e){setNote(e.target.value);}}
          placeholder="补充说明（可选）..." style={{width:"100%",border:"1px solid #e0dcd4",
            borderRadius:8,padding:"8px 12px",fontSize:12,background:"#fff",outline:"none",marginBottom:10}}/>
        <button onClick={submitReport} disabled={!selSpot||!status}
          style={{width:"100%",border:"none",background:selSpot&&status?"#c06040":"#ddd",
            color:"#fff",borderRadius:8,padding:"10px",cursor:selSpot&&status?"pointer":"default",
            fontSize:13,fontWeight:700,letterSpacing:2}}>提交花讯</button>
      </div>
      {/* Recent reports */}
      <div style={{padding:"16px 22px"}}>
        <div style={{fontSize:12,color:"#b08040",letterSpacing:3,marginBottom:10,fontWeight:600}}>
          · 最近花讯 · {reports.length}条 ·</div>
        {reports.length===0&&<div style={{textAlign:"center",padding:"30px 0",color:"#8a7a60"}}>
          <div style={{fontSize:32,marginBottom:8}}>📡</div>
          <div style={{fontSize:13}}>还没有花讯播报</div>
          <div style={{fontSize:11,marginTop:4,opacity:.6}}>搜索景点 → 选择状态 → 提交</div>
        </div>}
        {reports.map(function(r,i){
          var stLabel=statusOpts.find(function(s){return s.k===r.status;});
          return(<div key={i} style={{padding:"8px 12px",marginBottom:6,background:"#fff",borderRadius:8,
            border:"1px solid #ece6dc",borderLeft:"3px solid "+(r.c||"#ccc")}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <FI sp={r.sp} sz={16} co={r.c}/>
                <span style={{fontSize:13,fontWeight:600,color:"#2a2018"}}>{r.spotName}</span>
              </div>
              <span style={{fontSize:10,color:"#8a7a68"}}>{r.date}</span>
            </div>
            <div style={{marginTop:4,display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontSize:11,color:stLabel?stLabel.c:"#888",fontWeight:600}}>
                {stLabel?stLabel.l:r.status}</span>
              {r.note&&<span style={{fontSize:11,color:"#5a4a38"}}>{r.note}</span>}
            </div>
          </div>);
        })}
      </div>
    </div>
  </div>);
}

// ═══ P3-1: 诗词地图联动 (Poetry Map) ═══
function PoemPanel({onClose,flora,onGoSpot}){
  var POEMS=[
    {poem:"桃之夭夭，灼灼其华",poet:"《诗经》",sp:"桃花",region:"全国",appreciation:"中国最早的花卉诗篇。「桃之夭夭」状桃树繁茂，「灼灼其华」写花朵鲜艳。这是婚礼祝贺诗，桃花因此成为爱情与新娘的象征。"},
    {poem:"去年今日此门中，人面桃花相映红",poet:"崔护",sp:"桃花",region:"长安",appreciation:"「人面桃花」出自此诗，成为凡形容美人与桃花相映的经典典故。诗人描写的是一段可遇不可求的偶然邂逅，至今读来仍动人心弦。"},
    {poem:"唯有牡丹真国色，花开时节动京城",poet:"刘禹锡",sp:"牡丹",region:"洛阳",appreciation:"唐代赏牡丹已成全民盛事。「国色」一词由此诗流传，成为牡丹的代名词。动京城三字写出牡丹花期万人空巷的壮观。"},
    {poem:"云想衣裳花想容，春风拂槛露华浓",poet:"李白",sp:"牡丹",region:"长安",appreciation:"《清平调》三首之一，为杨贵妃所作。以云喻衣、以花喻容，反复对仗，将美人与牡丹融为一体，是咏物抒情的千古绝唱。"},
    {poem:"墙角数枝梅，凌寒独自开",poet:"王安石",sp:"梅花",region:"江南",appreciation:"王安石晚年罢相后所作。以梅花自喻，表达不畏严寒、独立不改的品格。「凌寒独自开」五字写尽梅花精神。"},
    {poem:"已是悬崖百丈冰，犹有花枝俏",poet:"毛泽东",sp:"梅花",region:"全国",appreciation:"《卜算子·咏梅》。反陆游梅花「寂寞开无主」之意，写梅花在绝境中依然傲然绽放。俏字尽显豪迈乐观的革命精神。"},
    {poem:"接天莲叶无穷碧，映日荷花别样红",poet:"杨万里",sp:"荷花",region:"杭州",appreciation:"《晓出净慈寺送林子方》。接天映日四字，写尽西湖荷花的宏大视野与色彩冲击。无穷与别样，远近虚实相生。"},
    {poem:"小荷才露尖尖角，早有蜻蜓立上头",poet:"杨万里",sp:"荷花",region:"江南",appreciation:"《小池》名句。以极细微的观察捕捉初夏生机。尖尖角与早有二字，充满童趣与生命力。是儿童诗教典范。"},
    {poem:"采菊东篱下，悠然见南山",poet:"陶渊明",sp:"菊花",region:"庐山",appreciation:"《饮酒·其五》。采菊悠然，与自然合一。「见」字不是「望」，是偶然撞见的惊喜。此诗开创了中国山水田园诗的意境。"},
    {poem:"不是花中偏爱菊，此花开尽更无花",poet:"元稹",sp:"菊花",region:"全国",appreciation:"《菊花》点题：爱菊并非因偏好，而是它是百花之后的最后坚守。赋予菊花君子晚节与陪伴精神。"},
    {poem:"停车坐爱枫林晚，霜叶红于二月花",poet:"杜牧",sp:"红枫",region:"长沙",appreciation:"《山行》名句。「坐」意为「因为」。经霜红叶胜过春花，翻转了人们对花的固有认知，给秋色以至高评价。"},
    {poem:"忽如一夜春风来，千树万树梨花开",poet:"岑参",sp:"梨花",region:"西域",appreciation:"《白雪歌送武判官归京》。本咏北地雪景，却以江南梨花喻雪，南北意象的跨越令人叫绝。此后梨花便多与白雪相关联。"},
    {poem:"杜鹃啼血猿哀鸣",poet:"白居易",sp:"杜鹃花",region:"江南",appreciation:"《琵琶行》「其间旦暮闻何物」之句。杜鹃啼叫哀绝，相传望帝化鹃啼血染红满山花朵，此诗加深了杜鹃花与悲怨的情感联系。"},
    {poem:"月落乌啼霜满天，江枫渔火对愁眠",poet:"张继",sp:"红枫",region:"苏州",appreciation:"《枫桥夜泊》开篇。秋夜江枫与孤客共眠，意境悲凉高远。此诗使苏州枫桥成为千年文化地标。"},
    {poem:"芝兰生于深林，不以无人而不芳",poet:"孔子",sp:"兰花",region:"山东",appreciation:"《孔子家语》。兰花生于深林，无人亦自芳。比喻君子修德不为外人所左右。兰花由此成为君子品格的象征。"},
    {poem:"开到荼蘼花事了",poet:"王淇",sp:"荼蘼",region:"全国",appreciation:"《春暮游小园》。荼蘼是春天最晚的花，花谢则春尽。「花事了」三字带来对美好消逝的深切惆怅，成为末世情绪的典故。"},
    {poem:"暗淡轻黄体性柔，情疏迹远只香留",poet:"李清照",sp:"桂花",region:"杭州",appreciation:"《鹧鸪天·桂花》。李清照以桂花不艳而香远自喻，反驳了「以色取花」的俗见，为咏桂词第一流。"},
    {poem:"兰陵美酒郁金香，玉碗盛来琥珀光",poet:"李白",sp:"郁金香",region:"山东",appreciation:"《客中作》。此「郁金香」是古代香料植物（姜黄科），非今天的荷兰郁金香。李白以此写客居兰陵美酒芳醇。"},
    {poem:"玉容寂寞泪阑干，梨花一枝春带雨",poet:"白居易",sp:"梨花",region:"长安",appreciation:"《长恨歌》咏杨贵妃梦中形象。梨花带雨从此成为美人落泪的经典比喻，极富画面感与哀婉感。"},
    {poem:"更无柳絮因风起，惟有葵花向日倾",poet:"司马光",sp:"向日葵",region:"全国",appreciation:"《客中初夏》。不学柳絮随风飘，唯有葵花坚定向日。司马光以葵花喻忠贞不二的政治品格。"},
    // Expansion batch
    {poem:"蒹葭苍苍，白露为霜。所谓伊人，在水一方",poet:"《诗经》",sp:"芦花",region:"水乡"},
    {poem:"独坐幽篁里，弹琴复长啸",poet:"王维",sp:"竹林",region:"辋川"},
    {poem:"咬定青山不放松，立根原在破岩中",poet:"郑燮",sp:"竹林",region:"全国"},
    {poem:"沾衣欲湿杏花雨，吹面不寒杨柳风",poet:"志南",sp:"杏花",region:"江南"},
    {poem:"借问酒家何处有，牧童遥指杏花村",poet:"杜牧",sp:"杏花",region:"山西"},
    {poem:"青鸟不传云外信，丁香空结雨中愁",poet:"李璟",sp:"丁香花",region:"江南"},
    {poem:"万山红遍，层林尽染",poet:"毛泽东",sp:"彩林",region:"湖南"},
    {poem:"只恐夜深花睡去，故烧高烛照红妆",poet:"苏轼",sp:"海棠花",region:"黄州"},
    {poem:"紫藤挂云木，花蔓宜阳春",poet:"李白",sp:"紫藤",region:"长安"},
    {poem:"庭前芍药妖无格，池上芙蕖净少情",poet:"刘禹锡",sp:"芍药",region:"扬州"},
    {poem:"凌波仙子生尘袜，水上盈盈步微月",poet:"黄庭坚",sp:"水仙花",region:"漳州"},
    {poem:"朝饮木兰之坠露兮，夕餐秋菊之落英",poet:"屈原",sp:"木兰",region:"楚地"},
    {poem:"千株扫作一番黄，只有芙蓉独自芳",poet:"吕本中",sp:"芙蓉花",region:"成都"},
    {poem:"十丈珊瑚是木棉，花开红比朝霞鲜",poet:"陈恭尹",sp:"木棉花",region:"广州"},
    {poem:"谁怜夜雪凋零后，数点殷红照翠苔",poet:"陆游",sp:"山茶花",region:"云南"},
    {poem:"不摇香已乱，无风花自飞",poet:"柳恽",sp:"蔷薇",region:"江南"},
    {poem:"紫薇花对紫薇翁，名目虽同貌不同",poet:"白居易",sp:"紫薇花",region:"长安"},
    {poem:"天苍苍，野茫茫，风吹草低见牛羊",poet:"《敕勒歌》",sp:"野花草甸",region:"塞北"},
    {poem:"大漠胡杨万古存，风沙砥砺铸英魂",poet:"现代",sp:"胡杨",region:"额济纳"},
    {poem:"浓似猩猩初染素，轻如燕燕欲凌空",poet:"唐彦谦",sp:"玫瑰",region:"全国"},
    {poem:"霓裳片片晚妆新，束素亭亭玉殿春",poet:"文徵明",sp:"玉兰花",region:"苏州"},
    {poem:"东风袅袅泛崇光，香雾空蒙月转廊",poet:"苏轼",sp:"海棠花",region:"黄州"},
    {poem:"晓看红湿处，花重锦官城",poet:"杜甫",sp:"桃花",region:"成都"},
    {poem:"待到重阳日，还来就菊花",poet:"孟浩然",sp:"菊花",region:"江南"},
    {poem:"驿外断桥边，寂寞开无主",poet:"陆游",sp:"梅花",region:"江南"},
    {poem:"已是悬崖百丈冰，犹有花枝俏",poet:"毛泽东",sp:"梅花",region:"全国"},
    {poem:"人生得意须尽欢，莫使金樽空对月",poet:"李白",sp:"荷花",region:"全国"},
    {poem:"好一朵美丽的茉莉花，芬芳美丽满枝桠",poet:"民歌",sp:"茉莉花",region:"江南"},
    {poem:"田氏仓卒骨肉分，荆树有花兄弟乐",poet:"许浑",sp:"紫荆花",region:"中原"},
    {poem:"高原八月绽繁花，格桑摇曳到天涯",poet:"藏族民歌",sp:"格桑花",region:"青藏"},
  ];

  var [selPoem,setSelPoem]=useState(null);
  var [filterSp,setFilterSp]=useState("all");
  var species=["all"].concat([...new Set(POEMS.map(function(p){return p.sp;}))]);
  var filtered=filterSp==="all"?POEMS:POEMS.filter(function(p){return p.sp===filterSp;});

  return(<div style={{position:"fixed",inset:0,zIndex:130,background:"rgba(20,15,10,.65)",
    display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(6px)"}} onClick={onClose}>
    <div onClick={function(e){e.stopPropagation();}} style={{background:"#faf6ef",width:"min(720px,94vw)",
      maxHeight:"90vh",borderRadius:14,overflow:"hidden",display:"flex",flexDirection:"column",
      boxShadow:"0 20px 60px rgba(0,0,0,.4)"}}>
      {/* Header */}
      <div style={{padding:"20px 28px 14px",borderBottom:"1px solid #ece6dc",
        background:"linear-gradient(180deg,#faf6ef,#f2ebd8)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <h2 style={{fontSize:20,fontWeight:900,color:"#2a2018",letterSpacing:6,margin:0}}>📜 诗词花事</h2>
            <div style={{fontSize:11,color:"#8a7a60",marginTop:4}}>千年诗句 · 遇见花事 · 定位寻芳</div>
          </div>
          <button onClick={onClose} style={{border:"none",background:"rgba(0,0,0,.08)",color:"#3a2818",
            cursor:"pointer",fontSize:14,width:28,height:28,borderRadius:"50%"}}>{"×"}</button>
        </div>
        {/* Filter */}
        <div style={{display:"flex",gap:3,marginTop:10,flexWrap:"wrap"}}>
          {species.map(function(sp){return(
            <button key={sp} onClick={function(){setFilterSp(sp);}} className="hx-monthbtn"
              style={{border:"none",borderRadius:12,padding:"3px 10px",cursor:"pointer",fontSize:11,
                background:filterSp===sp?"#c06040"+"22":"#f5f0e8",
                color:filterSp===sp?"#c06040":"#8a7a68",fontWeight:filterSp===sp?700:400}}>
              {sp==="all"?"全部":sp}</button>);})}
        </div>
      </div>
      {/* Poems grid */}
      <div style={{flex:1,overflow:"auto",padding:"16px 24px"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:12}}>
          {filtered.map(function(p,i){
            var fl=flora?flora.find(function(f){return f.sp===p.sp;}):null;
            var color=fl?fl.c:"#c06040";
            return(<div key={i} onClick={function(){setSelPoem(selPoem===i?null:i);}}
              style={{padding:"14px 16px",background:selPoem===i?"#fff":"#fafafa",
                border:"1px solid "+(selPoem===i?color:"#ece6dc"),borderRadius:8,
                borderLeft:"3px solid "+color,cursor:"pointer",transition:"all .2s"}}>
              {/* Poem */}
              <div style={{fontSize:15,color:"#2a2018",lineHeight:2,letterSpacing:2,
                fontStyle:"italic",marginBottom:8}}>{p.poem}</div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <FI sp={p.sp} sz={16} co={color}/>
                  <span style={{fontSize:11,color:color,fontWeight:600}}>{p.sp}</span>
                </div>
                <span style={{fontSize:11,color:"#8a7a68"}}>—— {p.poet}</span>
              </div>
              {/* Expanded: appreciation + related spots */}
              {selPoem===i&&<div style={{marginTop:10,paddingTop:8,borderTop:"1px dashed "+color+"44"}}>
                {p.appreciation&&<div style={{marginBottom:10,padding:"8px 12px",
                  background:color+"08",borderRadius:6,border:"1px dashed "+color+"33"}}>
                  <div style={{fontSize:10,color:color,letterSpacing:2,fontWeight:700,marginBottom:4}}>✎ 鉴赏</div>
                  <div style={{fontSize:12,color:"#3a2818",lineHeight:1.8,fontStyle:"italic"}}>
                    {p.appreciation}</div>
                </div>}
                <div style={{fontSize:10,color:"#8a7a68",marginBottom:6}}>📍 {p.region} · 相关赏花地：</div>
                <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                  {(flora?flora.filter(function(f){return f.sp===p.sp;}).slice(0,5):[]).map(function(s){return(
                    <button key={s.id} onClick={function(e){e.stopPropagation();if(onGoSpot)onGoSpot(s);onClose();}}
                      style={{border:"1px solid "+color+"44",background:color+"11",borderRadius:12,
                        padding:"3px 10px",cursor:"pointer",fontSize:11,color:"#2a2018"}}>
                      {s.n.split("·")[1]||s.n}</button>);})}
                </div>
              </div>}
            </div>);
          })}
        </div>
      </div>
    </div>
  </div>);
}

// ═══ 加载状态组件 (Loading States) ═══
function SkeletonCard(){
  return(<div style={{padding:"12px",background:"#fff",borderRadius:10,
    border:"1px solid #ece6dc",marginBottom:10}}>
    <style>{`@keyframes sk{0%{background-position:-200px 0}100%{background-position:200px 0}}`}</style>
    <div style={{height:14,width:"60%",background:"linear-gradient(90deg,#f0ece4,#e8e0d4,#f0ece4)",
      backgroundSize:"400px 100%",animation:"sk 1.2s infinite linear",borderRadius:4,marginBottom:8}}></div>
    <div style={{height:10,width:"40%",background:"linear-gradient(90deg,#f0ece4,#e8e0d4,#f0ece4)",
      backgroundSize:"400px 100%",animation:"sk 1.2s infinite linear",borderRadius:4}}></div>
  </div>);
}

function InlineLoader({text}){
  return(<div style={{display:"flex",alignItems:"center",gap:8,padding:"8px 12px",
    color:"#8a7a68",fontSize:12}}>
    <svg width="16" height="16" viewBox="0 0 50 50" style={{animation:"spin 1s linear infinite"}}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <circle cx="25" cy="25" r="20" fill="none" stroke="#c06040" strokeWidth="4"
        strokeDasharray="100" strokeDashoffset="60" strokeLinecap="round"/>
    </svg>
    <span>{text||"加载中..."}</span>
  </div>);
}

function ErrorState({message,onRetry}){
  return(<div style={{textAlign:"center",padding:"30px 20px",color:"#8a7a68"}}>
    <div style={{fontSize:32,marginBottom:10,opacity:.5}}>⚠</div>
    <div style={{fontSize:13,marginBottom:12}}>{message||"加载失败"}</div>
    {onRetry&&<button onClick={onRetry}
      style={{padding:"6px 18px",background:"#c06040",color:"#fff",
        border:"none",borderRadius:16,cursor:"pointer",fontSize:12,fontWeight:600}}>
      重试</button>}
  </div>);
}

// ═══ 每日签到提示 (Daily Streak Toast) ═══
function DailyStreakToast({streak,onClose}){
  const [visible,setVisible]=useState(false);
  useEffect(function(){setTimeout(function(){setVisible(true);},100);},[]);
  
  var milestones={3:"初露",7:"成诵",15:"渐熟",30:"坚持",60:"精进",100:"花痴"};
  var nextMilestone=null;
  [3,7,15,30,60,100].forEach(function(m){if(streak.count<m&&!nextMilestone)nextMilestone=m;});
  var newReward=streak.rewards[streak.rewards.length-1]===streak.count;
  
  return(<div onClick={onClose} style={{position:"fixed",top:20,left:"50%",
    transform:"translateX(-50%) translateY("+(visible?0:"-100px")+")",
    opacity:visible?1:0,zIndex:150,background:"linear-gradient(135deg,#fef5e7,#f8e8c8)",
    border:"1.5px solid #e0c080",borderRadius:12,padding:"10px 20px",
    boxShadow:"0 4px 20px rgba(192,128,64,.25)",cursor:"pointer",
    transition:"all .5s cubic-bezier(.4,0,.2,1)",
    display:"flex",alignItems:"center",gap:12}}>
    <div style={{fontSize:28,lineHeight:1}}>{newReward?"🎉":"🌸"}</div>
    <div>
      <div style={{fontSize:13,fontWeight:900,color:"#8a5020",letterSpacing:2}}>
        连续赏花 {streak.count} 天
        {newReward&&milestones[streak.count]&&<span style={{marginLeft:6,padding:"1px 6px",
          background:"#c8a050",color:"#fff",borderRadius:6,fontSize:10}}>
          达成：{milestones[streak.count]}</span>}
      </div>
      <div style={{fontSize:11,color:"#a07050",marginTop:2}}>
        {nextMilestone?"再"+(nextMilestone-streak.count)+"天达成「"+milestones[nextMilestone]+"」":"已达最高等级"}
      </div>
    </div>
  </div>);
}

// ═══ 拼图式花种收集 (Flower Puzzle Collection) ═══
function FlowerPuzzle({onClose,flora,checkins}){
  // Collected species from checkins
  var collected=new Set();
  Object.keys(checkins).forEach(function(id){
    var s=flora.find(function(f){return f.id===Number(id);});
    if(s)collected.add(s.sp);
  });
  // All species from flora
  var allSp=[...new Set(flora.map(function(f){return f.sp;}))].sort();
  var total=allSp.length;var got=collected.size;
  var pct=Math.round(got/total*100);

  // Group by season
  var bySeason={spring:[],summer:[],autumn:[],winter:[]};
  allSp.forEach(function(sp){
    var sample=flora.find(function(f){return f.sp===sp;});
    if(sample&&bySeason[sample.s])bySeason[sample.s].push(sp);
  });
  var seasonNames={spring:"春",summer:"夏",autumn:"秋",winter:"冬"};
  var seasonIcons={spring:"🌸",summer:"🌿",autumn:"🍁",winter:"❄"};
  var seasonColors={spring:"#e08090",summer:"#5a8a50",autumn:"#c87040",winter:"#6a8aaa"};

  // Special rewards based on completion
  var rewards=[
    {threshold:5,icon:"🎨",name:"初窥门径",unlocked:got>=5},
    {threshold:15,icon:"💐",name:"百花园主",unlocked:got>=15},
    {threshold:30,icon:"🏵",name:"花卉博士",unlocked:got>=30},
    {threshold:50,icon:"🎭",name:"花神降世",unlocked:got>=50},
    {threshold:72,icon:"👑",name:"集齐全部 · 花神之冠",unlocked:got>=72,special:true},
  ];

  return(<div style={{position:"fixed",inset:0,zIndex:140,background:"rgba(20,15,10,.7)",
    display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(8px)"}} onClick={onClose}>
    <div onClick={function(e){e.stopPropagation();}} style={{background:"#faf6ef",
      width:"min(720px,94vw)",maxHeight:"92vh",borderRadius:14,overflow:"hidden",
      display:"flex",flexDirection:"column",boxShadow:"0 20px 60px rgba(0,0,0,.4)"}}>
      {/* Header */}
      <div style={{padding:"20px 28px 14px",borderBottom:"1px solid #ece6dc",
        background:"linear-gradient(180deg,#fdf8f0,#f0e8d4)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div>
            <div style={{fontSize:10,color:"#b08040",letterSpacing:6,marginBottom:4}}>· 百 花 拼 图 ·</div>
            <h2 style={{fontSize:22,fontWeight:900,color:"#2a2018",letterSpacing:8,margin:0}}>花种收集</h2>
            <div style={{fontSize:11,color:"#8a7a60",marginTop:6,letterSpacing:2}}>
              打卡景点解锁花种 · 集齐 72 种绽放「花神之冠」</div>
          </div>
          <button onClick={onClose} style={{border:"none",background:"rgba(0,0,0,.08)",color:"#3a2818",
            cursor:"pointer",fontSize:14,width:28,height:28,borderRadius:"50%"}}>{"×"}</button>
        </div>
        {/* Progress */}
        <div style={{marginTop:14}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:6,fontSize:12}}>
            <span style={{color:"#2a2018",fontWeight:700}}>已收集 {got} / {total}</span>
            <span style={{color:"#c06040",fontWeight:700}}>{pct}%</span>
          </div>
          <div style={{height:8,borderRadius:4,background:"#e8e0d4",overflow:"hidden"}}>
            <div style={{height:"100%",borderRadius:4,width:pct+"%",
              background:"linear-gradient(90deg,#c06040,#e0a040,#c06040)",
              backgroundSize:"200% 100%",animation:"shimmer 2s linear infinite"}}></div>
          </div>
          <style>{`@keyframes shimmer{0%{background-position:0 0}100%{background-position:200% 0}}`}</style>
        </div>
        {/* Rewards display */}
        <div style={{display:"flex",gap:6,marginTop:12,flexWrap:"wrap"}}>
          {rewards.map(function(r,i){return(
            <div key={i} style={{display:"flex",alignItems:"center",gap:4,
              padding:"3px 10px",borderRadius:12,
              background:r.unlocked?(r.special?"linear-gradient(135deg,#ffd700,#ffa500)":"#c06040"):"#e8e0d4",
              color:r.unlocked?"#fff":"#b0a890",
              fontSize:10,fontWeight:700,
              boxShadow:r.unlocked?(r.special?"0 2px 10px rgba(255,180,0,.4)":"0 1px 4px rgba(0,0,0,.1)"):"none"}}>
              <span style={{fontSize:12,filter:r.unlocked?"none":"grayscale(1)"}}>{r.icon}</span>
              <span>{r.name}</span>
              {!r.unlocked&&<span style={{opacity:.6}}>({r.threshold})</span>}
            </div>);})}
        </div>
      </div>
      {/* Puzzle grid */}
      <div style={{flex:1,overflow:"auto",padding:"16px 24px"}}>
        {Object.keys(bySeason).map(function(s){
          var list=bySeason[s];if(list.length===0)return null;
          var c=seasonColors[s];
          return(<div key={s} style={{marginBottom:16}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10,
              paddingBottom:6,borderBottom:"2px solid "+c+"33"}}>
              <span style={{fontSize:20}}>{seasonIcons[s]}</span>
              <span style={{fontSize:14,fontWeight:900,color:c,letterSpacing:4}}>{seasonNames[s]}季</span>
              <span style={{fontSize:11,color:"#8a7a60"}}>
                {list.filter(function(sp){return collected.has(sp);}).length}/{list.length}</span>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(80px,1fr))",gap:8}}>
              {list.map(function(sp){
                var got=collected.has(sp);
                var sample=flora.find(function(f){return f.sp===sp;});
                var col=sample?sample.c:c;
                return(<div key={sp} style={{padding:"10px 6px",textAlign:"center",
                  background:got?col+"10":"#f5f0e8",
                  border:"1.5px solid "+(got?col+"66":"#e8e0d4"),
                  borderRadius:8,
                  opacity:got?1:.5,
                  transition:"all .2s",cursor:"default"}}>
                  <div style={{width:40,height:40,borderRadius:"50%",margin:"0 auto 4px",
                    background:got?"#fff":"#e8e0d4",
                    border:"1.5px solid "+(got?col+"88":"#d0c8b8"),
                    display:"flex",alignItems:"center",justifyContent:"center",
                    filter:got?"none":"grayscale(1)"}}>
                    {got?<FI sp={sp} sz={24} co={col}/>:<span style={{fontSize:18,color:"#b0a890"}}>?</span>}
                  </div>
                  <div style={{fontSize:10,color:got?"#2a2018":"#b0a890",fontWeight:got?600:400,
                    whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
                    {got?sp:"?".repeat(sp.length)}</div>
                </div>);
              })}
            </div>
          </div>);
        })}
        {got===total&&<div style={{marginTop:16,padding:"18px",textAlign:"center",
          background:"linear-gradient(135deg,#ffd700,#ffa500)",borderRadius:12,
          boxShadow:"0 4px 20px rgba(255,180,0,.3)"}}>
          <div style={{fontSize:40,marginBottom:6}}>👑</div>
          <div style={{fontSize:18,color:"#fff",fontWeight:900,letterSpacing:6}}>花神之冠已加冕</div>
          <div style={{fontSize:11,color:"#fff",opacity:.9,marginTop:4}}>
            你已集齐全部 72 种花卉 · 真正的花神</div>
        </div>}
      </div>
    </div>
  </div>);
}

// ═══ 季节活动横幅 (Seasonal Campaign Banner) ═══
function SeasonalCampaign(){
  var now=new Date();var m=now.getMonth()+1;var d=now.getDate();
  // Determine active campaign
  var campaigns=[
    {active:m===3||m===4,id:"spring-cherry",icon:"🌸",title:"春日樱樱盛放",
      desc:"3-4月樱花季限时活动",color:"#e08090",
      hint:"点击赏樱花景点 → 解锁樱花限定徽章"},
    {active:m===6||m===7,id:"summer-lotus",icon:"🪷",title:"夏荷清凉",
      desc:"荷花盛花期限时活动",color:"#60a050",
      hint:"打卡荷花景点 → 领取清凉徽章"},
    {active:m===10||m===11,id:"autumn-maple",icon:"🍁",title:"红叶枫狂",
      desc:"10-11月红叶季节",color:"#c87040",
      hint:"访问红枫/银杏/胡杨 → 解锁秋日限定"},
    {active:m===12||m===1,id:"winter-plum",icon:"❄",title:"寒梅暗香",
      desc:"冬日赏梅活动",color:"#6a8aaa",
      hint:"踏雪寻梅 → 获得梅花君子徽章"},
  ];
  var active=campaigns.find(function(c){return c.active;});
  var [dismissed,setDismissed]=useState(false);
  useEffect(function(){(async function(){
    if(!active)return;
    try{var r=window.storage?await window.storage.get("campaign_"+active.id+"_dismissed"):null;
      if(r&&r.value)setDismissed(true);}catch(e){}
  })();},[active]);

  if(!active||dismissed)return null;
  var dismiss=async function(){
    setDismissed(true);
    try{if(window.storage)await window.storage.set("campaign_"+active.id+"_dismissed","1");}catch(e){}
  };

  return(<div style={{position:"absolute",top:90,left:"50%",transform:"translateX(-50%)",zIndex:28,
    maxWidth:320,width:"90vw",
    background:"linear-gradient(135deg,"+active.color+"ee,"+active.color+"cc)",
    color:"#fff",borderRadius:12,padding:"10px 14px",
    boxShadow:"0 4px 20px "+active.color+"66",
    display:"flex",alignItems:"center",gap:10,
    animation:"fadeIn .4s"}} className="hx-banner">
    <div style={{fontSize:28}}>{active.icon}</div>
    <div style={{flex:1}}>
      <div style={{fontSize:13,fontWeight:700,letterSpacing:2}}>{active.title}</div>
      <div style={{fontSize:10,opacity:.9,marginTop:2}}>{active.hint}</div>
    </div>
    <button onClick={dismiss} style={{border:"none",background:"rgba(255,255,255,.2)",
      color:"#fff",borderRadius:"50%",width:22,height:22,cursor:"pointer",fontSize:12}}>{"×"}</button>
  </div>);
}

// ═══ 订阅花期提醒 (Bloom Subscription Center) ═══
function SubscriptionPanel({onClose,flora,favs}){
  var [subs,setSubs]=useState([]);
  var [notifStatus,setNotifStatus]=useState("default");

  useEffect(function(){(async function(){
    try{var r=window.storage?await window.storage.get("bloom_subs"):null;
      if(r&&r.value)setSubs(JSON.parse(r.value));}catch(e){}
    if("Notification" in window)setNotifStatus(Notification.permission);
  })();},[]);

  var requestPerm=async function(){
    if(!("Notification" in window)){alert("此浏览器不支持通知功能");return;}
    var perm=await Notification.requestPermission();
    setNotifStatus(perm);
    if(perm==="granted"){
      new Notification("🌸 花信风已开启提醒",{body:"花期临近时我会悄悄告诉你"});
    }
  };

  var toggleSub=async function(spotId,species){
    var existing=subs.find(function(x){return x.spotId===spotId;});
    var newSubs;
    if(existing){
      newSubs=subs.filter(function(x){return x.spotId!==spotId;});
    }else{
      newSubs=subs.concat([{spotId:spotId,species:species,addedAt:Date.now()}]);
      if(typeof window!=="undefined"&&window._hxTrack)window._hxTrack("subscription_add",{spotId:spotId});
    }
    setSubs(newSubs);
    try{if(window.storage)await window.storage.set("bloom_subs",JSON.stringify(newSubs));}catch(e){}
  };

  // Favorites that have upcoming bloom predictions
  var favSpots=Object.keys(favs).map(function(id){return flora.find(function(f){return f.id===Number(id);});}).filter(Boolean);
  var subbedIds=new Set(subs.map(function(x){return x.spotId;}));
  var upcomingSubs=subs.map(function(s){
    var spot=flora.find(function(f){return f.id===s.spotId;});
    return spot?{sub:s,spot:spot}:null;
  }).filter(Boolean).sort(function(a,b){
    var ad=a.spot._pred?a.spot._pred.daysUntil:9999;
    var bd=b.spot._pred?b.spot._pred.daysUntil:9999;
    return ad-bd;
  });

  return(<div style={{position:"fixed",inset:0,zIndex:140,background:"rgba(20,15,10,.7)",
    display:"flex",justifyContent:"flex-end",backdropFilter:"blur(6px)"}} onClick={onClose}>
    <div onClick={function(e){e.stopPropagation();}} style={{width:"min(440px,92vw)",height:"100vh",
      background:"#faf6ef",overflowY:"auto",boxShadow:"-4px 0 24px rgba(0,0,0,.15)"}}>
      {/* Header */}
      <div style={{padding:"20px 22px 14px",borderBottom:"1px solid #ece6dc",
        background:"linear-gradient(180deg,#faf6ef,#f2ebd8)",position:"sticky",top:0,zIndex:2}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontSize:10,color:"#b08040",letterSpacing:5}}>{"· 花 期 提 醒 ·"}</div>
            <h2 style={{fontSize:20,fontWeight:900,color:"#2a2018",letterSpacing:6,margin:"4px 0"}}>
              🔔 订阅花讯</h2>
          </div>
          <button onClick={onClose} style={{border:"none",background:"rgba(0,0,0,.08)",
            color:"#3a2818",cursor:"pointer",fontSize:14,width:28,height:28,borderRadius:"50%"}}>{"×"}</button>
        </div>
        {/* Permission banner */}
        {notifStatus!=="granted"&&<div style={{marginTop:12,padding:"10px 14px",
          background:"#fdf8ee",borderRadius:8,border:"1px solid #e8d4a0"}}>
          <div style={{fontSize:11,color:"#a07020",marginBottom:6}}>
            📱 开启通知后，花期临近会自动提醒</div>
          <button onClick={requestPerm} style={{padding:"6px 16px",background:"#c06040",
            color:"#fff",border:"none",borderRadius:16,cursor:"pointer",
            fontSize:11,fontWeight:600}}>
            {notifStatus==="denied"?"通知被禁用 · 请在浏览器设置中开启":"开启通知"}</button>
        </div>}
        {notifStatus==="granted"&&<div style={{marginTop:10,fontSize:11,color:"#5a8a50"}}>
          ✓ 通知已开启 · 共 {subs.length} 个订阅</div>}
      </div>
      {/* Subscribed list */}
      {upcomingSubs.length>0?<div style={{padding:"14px 18px"}}>
        <div style={{fontSize:10,color:"#b08040",letterSpacing:4,marginBottom:10,fontWeight:600}}>
          · 我的订阅 · 按花期临近排序 ·</div>
        {upcomingSubs.map(function(item){
          var s=item.spot;var pred=s._pred;
          var urgent=pred&&pred.daysUntil<=7&&pred.daysUntil>0;
          return(<div key={s.id} style={{padding:"10px 14px",marginBottom:8,
            background:"#fff",borderRadius:8,border:"1px solid "+s.c+"33",
            borderLeft:"3px solid "+s.c}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:36,height:36,borderRadius:"50%",background:s.c+"15",
                border:"1px solid "+s.c+"55",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <FI sp={s.sp} sz={22} co={s.c}/></div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,fontWeight:700,color:"#2a2018",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{s.n}</div>
                <div style={{fontSize:11,color:s.c}}>{s.sp}</div>
                {pred&&<div style={{fontSize:10,color:urgent?"#e06050":"#8a7a68",fontWeight:urgent?700:400,marginTop:2}}>
                  {pred.daysUntil>0?"📅 "+pred.dateStr+" ("+pred.daysUntil+"天后)":
                   pred.daysUntil===0?"🌸 今日盛开":"🌿 已过花期"}</div>}
              </div>
              <button onClick={function(){toggleSub(s.id,s.sp);}}
                style={{border:"none",background:"none",cursor:"pointer",fontSize:16,color:"#c06040"}}
                title="取消订阅">🔕</button>
            </div>
          </div>);
        })}
      </div>:
      <div style={{padding:"30px 20px",textAlign:"center",color:"#8a7a68"}}>
        <div style={{fontSize:36,marginBottom:10}}>🔔</div>
        <div style={{fontSize:13}}>还没有订阅任何花期</div>
        <div style={{fontSize:11,marginTop:6,opacity:.7}}>从下方收藏的景点中选择订阅</div>
      </div>}

      {/* Available to subscribe (favorites) */}
      {favSpots.length>0&&<div style={{padding:"14px 18px",borderTop:"1px solid #ece6dc"}}>
        <div style={{fontSize:10,color:"#b08040",letterSpacing:4,marginBottom:10,fontWeight:600}}>
          · 从收藏中订阅 ·</div>
        {favSpots.filter(function(s){return!subbedIds.has(s.id);}).slice(0,10).map(function(s){
          return(<div key={s.id} style={{display:"flex",alignItems:"center",gap:10,
            padding:"8px 12px",marginBottom:6,background:"#f8f4ee",borderRadius:8}}>
            <FI sp={s.sp} sz={18} co={s.c}/>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:12,fontWeight:600,color:"#2a2018",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{s.n}</div>
              <div style={{fontSize:10,color:s.c}}>{s.sp}</div>
            </div>
            <button onClick={function(){toggleSub(s.id,s.sp);}}
              style={{border:"1px solid #c06040",background:"#c06040"+"15",color:"#c06040",
                borderRadius:14,padding:"3px 12px",cursor:"pointer",fontSize:11,fontWeight:600}}>
              🔔 订阅</button>
          </div>);
        })}
        {favSpots.filter(function(s){return!subbedIds.has(s.id);}).length===0&&
          <div style={{fontSize:11,color:"#8a7a68",textAlign:"center",padding:12}}>
            已全部订阅</div>}
      </div>}

      {favSpots.length===0&&subs.length===0&&<div style={{padding:"30px 20px",textAlign:"center",
        color:"#8a7a68"}}>
        <div style={{fontSize:12,marginTop:12}}>先收藏一些景点吧 ♡</div>
      </div>}

      {/* How it works */}
      <div style={{padding:"14px 18px 22px",borderTop:"1px solid #ece6dc"}}>
        <div style={{fontSize:10,color:"#8a7a68",lineHeight:1.8}}>
          💡 工作原理：<br/>
          · 浏览器在后台检查已订阅景点<br/>
          · 花期前 1-7 天自动弹出提醒<br/>
          · 需保持浏览器标签页在后台运行
        </div>
      </div>
    </div>
  </div>);
}

// ═══ 每日签到 (Daily Check-in) ═══
function DailyCheckin({onClose,user}){
  var [streak,setStreak]=useState(0);
  var [lastDate,setLastDate]=useState("");
  var [claimed,setClaimed]=useState(false);
  var [rewards,setRewards]=useState([]);

  useEffect(function(){(async function(){
    try{
      var r=window.storage?await window.storage.get("daily_streak"):null;
      if(r&&r.value){var d=JSON.parse(r.value);
        setStreak(d.streak||0);setLastDate(d.lastDate||"");
        var today=new Date().toLocaleDateString("zh-CN");
        if(d.lastDate===today)setClaimed(true);
      }
    }catch(e){}
  })();},[]);

  var doCheckin=async function(){
    var today=new Date().toLocaleDateString("zh-CN");
    var yesterday=new Date(Date.now()-86400000).toLocaleDateString("zh-CN");
    var newStreak=(lastDate===yesterday)?streak+1:1;
    setStreak(newStreak);setLastDate(today);setClaimed(true);
    // Determine reward
    var reward=rewardAt(newStreak);
    if(reward)setRewards([reward].concat(rewards));
    try{
      if(window.storage)await window.storage.set("daily_streak",
        JSON.stringify({streak:newStreak,lastDate:today}));
    }catch(e){}
    if(typeof window!=="undefined"&&window._hxTrack)window._hxTrack("daily_checkin",{streak:newStreak});
  };

  var rewardAt=function(d){
    var map={1:{icon:"🌱",name:"初心萌芽",desc:"首次签到"},
      3:{icon:"🌸",name:"三日踏春",desc:"连续3天赏花"},
      7:{icon:"🌺",name:"一周芳华",desc:"连续7天"},
      14:{icon:"💐",name:"花事半月",desc:"连续14天"},
      30:{icon:"🏵",name:"月月赏花",desc:"连续30天"},
      100:{icon:"🎭",name:"花神降世",desc:"连续100天"}};
    return map[d]||null;
  };

  var reward=rewardAt(streak);
  var nextMilestone=[1,3,7,14,30,100].find(function(n){return n>streak;})||100;

  return(<div style={{position:"fixed",inset:0,zIndex:150,background:"rgba(20,15,10,.7)",
    display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(8px)"}} onClick={onClose}>
    <div onClick={function(e){e.stopPropagation();}} style={{background:"#faf6ef",
      width:"min(360px,90vw)",borderRadius:14,overflow:"hidden",
      boxShadow:"0 20px 60px rgba(0,0,0,.4)"}}>
      {/* Header with calendar visualization */}
      <div style={{padding:"24px 24px 16px",textAlign:"center",
        background:"linear-gradient(135deg,#fdf8f0,#f0e8d4)"}}>
        <div style={{fontSize:12,color:"#b08040",letterSpacing:6,marginBottom:4}}>{"· 每 日 签 到 ·"}</div>
        <div style={{fontSize:28,fontWeight:900,color:"#c06040",letterSpacing:2}}>
          {streak>0?streak+" 天":"开启花事之旅"}</div>
        <div style={{fontSize:11,color:"#8a7a60",marginTop:4}}>
          {claimed?"今日已签 · 明天再来":"点击下方按钮签到"}</div>
        {/* Streak visualization */}
        <div style={{display:"flex",justifyContent:"center",gap:4,marginTop:14}}>
          {[1,2,3,4,5,6,7].map(function(d){
            var active=d<=streak||(!claimed&&d===streak+1);
            var isToday=!claimed&&d===(streak+1);
            return(<div key={d} style={{width:28,height:28,borderRadius:"50%",
              background:active?"#c06040":"#e8e0d4",
              color:active?"#fff":"#b0a890",
              display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:11,fontWeight:700,
              border:isToday?"2px solid #c06040":"none",
              boxShadow:isToday?"0 0 0 3px rgba(192,96,64,.2)":"none"}}>
              {d}</div>);})}
        </div>
        <div style={{fontSize:10,color:"#b0a890",marginTop:8,letterSpacing:2}}>
          下一个成就：<span style={{color:"#c06040",fontWeight:700}}>{nextMilestone} 天</span></div>
      </div>
      {/* Reward display */}
      {reward&&<div style={{padding:"14px 24px",background:"#fdf8ee",
        borderBottom:"1px solid #ece6dc"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{fontSize:32}}>{reward.icon}</div>
          <div style={{flex:1}}>
            <div style={{fontSize:12,color:"#c06040",fontWeight:700,letterSpacing:2}}>
              🎁 已解锁成就</div>
            <div style={{fontSize:14,color:"#2a2018",fontWeight:700}}>{reward.name}</div>
            <div style={{fontSize:10,color:"#8a7a60"}}>{reward.desc}</div>
          </div>
        </div>
      </div>}
      {/* Button */}
      <div style={{padding:"18px 24px 22px",display:"flex",gap:10}}>
        {!claimed?<button onClick={doCheckin}
          style={{flex:1,border:"none",background:"linear-gradient(135deg,#c06040,#e0a040)",
            color:"#fff",borderRadius:10,padding:"12px",cursor:"pointer",
            fontSize:14,fontWeight:700,letterSpacing:3,
            boxShadow:"0 4px 14px rgba(192,96,64,.3)"}}>
          🌸 今日签到</button>:
          <button onClick={onClose}
            style={{flex:1,border:"1.5px solid #e0dcd4",background:"transparent",
              color:"#8a7a68",borderRadius:10,padding:"12px",cursor:"pointer",
              fontSize:13,fontWeight:600,letterSpacing:2}}>
            明日再来 👋</button>}
      </div>
    </div>
  </div>);
}

// ═══ 新手引导 (Onboarding Guide) ═══
function OnboardingGuide({onComplete}){
  var [step,setStep]=useState(0);
  var steps=[
    {icon:"🌸",title:"欢迎来到花信风",desc:"这是一款基于中国传统物候学的赏花地图。\n我们用积温模型预测全国408个景点的花期，\n帮你在最美的时刻遇见最美的花。",pos:"center"},
    {icon:"🗺",title:"探索花事地图",desc:"地图上每个标记都是一个赏花景点。\n点击标记查看花期预测、诗句、打卡。\n用底部「当季/全年/未来」筛选不同花期。",pos:"center"},
    {icon:"🌺",title:"花谱与花信",desc:"顶部切换「花谱」查看72种花卉。\n右侧金色书签「花签」求每日花运。\n绿色书签「花信」看二十四番花信风。",pos:"center"},
    {icon:"🤖",title:"智能工具栏",desc:"左下角工具栏集合了6大功能：\nAI助手 · 个性化推荐 · 花事圈\n花事日历 · 花讯播报 · 诗词花事",pos:"center"},
    {icon:"📍",title:"开始你的花事之旅",desc:"打卡赏花地 → 解锁成就徽章 → 分享花事圈\n在「花历」中记录你的赏花足迹。\n\n准备好了吗？",pos:"center"},
  ];
  var s=steps[step];
  var isLast=step===steps.length-1;

  return(<div style={{position:"fixed",inset:0,zIndex:300,background:"rgba(20,15,10,.8)",
    display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(12px)"}}>
    <div style={{width:"min(420px,88vw)",background:"#faf6ef",borderRadius:16,overflow:"hidden",
      boxShadow:"0 20px 60px rgba(0,0,0,.5)"}}>
      {/* Progress dots */}
      <div style={{display:"flex",justifyContent:"center",gap:6,padding:"16px 0 0"}}>
        {steps.map(function(_,i){return(
          <div key={i} style={{width:i===step?20:6,height:6,borderRadius:3,
            background:i===step?"#c06040":i<step?"#c06040":"#e0dcd4",
            transition:"all .3s"}}></div>);})}
      </div>
      {/* Content */}
      <div style={{padding:"24px 32px 20px",textAlign:"center"}}>
        <div style={{fontSize:56,marginBottom:16,
          animation:"pulse 2s ease-in-out infinite"}}>{s.icon}</div>
        <h2 style={{fontSize:20,fontWeight:900,color:"#2a2018",letterSpacing:4,
          margin:"0 0 12px"}}>{s.title}</h2>
        <div style={{fontSize:13,color:"#5a4a38",lineHeight:2,whiteSpace:"pre-line",
          letterSpacing:1}}>{s.desc}</div>
      </div>
      {/* Actions */}
      <div style={{padding:"0 32px 24px",display:"flex",gap:10}}>
        {step>0&&<button onClick={function(){setStep(step-1);}}
          style={{flex:1,padding:"12px",border:"1.5px solid #e0dcd4",background:"transparent",
            borderRadius:10,cursor:"pointer",fontSize:13,color:"#8a7a68",fontWeight:600}}>
          上一步</button>}
        <button onClick={function(){if(isLast)onComplete();else setStep(step+1);}}
          style={{flex:2,padding:"12px",border:"none",
            background:isLast?"linear-gradient(135deg,#c06040,#e0a040)":"#c06040",
            color:"#fff",borderRadius:10,cursor:"pointer",fontSize:14,fontWeight:700,
            letterSpacing:isLast?4:2,boxShadow:"0 2px 10px rgba(192,96,64,.3)"}}>
          {isLast?"🌸 开始探索":"下一步 →"}</button>
      </div>
      {/* Skip */}
      {!isLast&&<div style={{textAlign:"center",paddingBottom:16}}>
        <button onClick={onComplete}
          style={{border:"none",background:"none",cursor:"pointer",
            fontSize:11,color:"#b0a890",letterSpacing:2}}>跳过引导</button>
      </div>}
    </div>
  </div>);
}

// ═══ 用户登录 (Login System) ═══
function LoginPanel({onLogin,onClose}){
  var [mode,setMode]=useState("choice"); // choice | phone | wechat
  var [phone,setPhone]=useState("");
  var [code,setCode]=useState("");
  var [sent,setSent]=useState(false);
  var [countdown,setCountdown]=useState(0);
  var [nick,setNick]=useState("");
  var [step,setStep]=useState(1); // 1=phone input, 2=code verify, 3=set nickname

  // Countdown timer
  useEffect(function(){
    if(countdown<=0)return;
    var t=setTimeout(function(){setCountdown(countdown-1);},1000);
    return function(){clearTimeout(t);};
  },[countdown]);

  var sendCode=function(){
    if(phone.length!==11)return;
    setSent(true);setCountdown(60);setStep(2);
  };

  var verifyCode=function(){
    if(code.length<4)return;
    // In production: verify with backend. Here we simulate success.
    setStep(3);
  };

  var finishLogin=function(){
    var name=nick||("花友"+phone.slice(-4));
    var user={name:name,phone:phone,avatar:null,
      id:"u_"+phone.slice(-6)+"_"+Date.now().toString(36),
      joinDate:new Date().toLocaleDateString("zh-CN"),
      loginType:"phone"};
    onLogin(user);
  };

  var wechatLogin=function(){
    // WeChat OAuth flow - needs WeChat Open Platform AppID
    // In production: redirect to WeChat OAuth URL
    // Here: simulate with a local user
    var user={name:"微信用户",phone:"",avatar:null,
      id:"wx_"+Date.now().toString(36),
      joinDate:new Date().toLocaleDateString("zh-CN"),
      loginType:"wechat"};
    onLogin(user);
  };

  return(<div style={{position:"fixed",inset:0,zIndex:200,background:"rgba(20,15,10,.75)",
    display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(10px)"}}
    onClick={onClose}>
    <div onClick={function(e){e.stopPropagation();}} style={{background:"#faf6ef",
      width:"min(400px,90vw)",borderRadius:16,overflow:"hidden",
      boxShadow:"0 20px 60px rgba(0,0,0,.4)"}}>
      
      {/* Header with logo */}
      <div style={{padding:"28px 30px 20px",textAlign:"center",
        background:"linear-gradient(180deg,#f5ede0,#faf6ef)"}}>
        <div style={{width:56,height:56,borderRadius:"50%",
          background:"linear-gradient(135deg,#c06040,#e0a040)",
          display:"flex",alignItems:"center",justifyContent:"center",
          margin:"0 auto 12px",fontSize:28,boxShadow:"0 4px 14px rgba(192,96,64,.3)"}}>🌸</div>
        <h2 style={{fontSize:22,fontWeight:900,color:"#2a2018",letterSpacing:6,margin:0}}>花信风</h2>
        <div style={{fontSize:11,color:"#8a7a60",letterSpacing:2,marginTop:6}}>
          登录后可同步收藏、打卡、成就数据</div>
      </div>

      <div style={{padding:"20px 30px 28px"}}>
        {/* Choice mode */}
        {mode==="choice"&&<div>
          {/* WeChat login - primary */}
          <button onClick={function(){wechatLogin();}}
            style={{width:"100%",padding:"14px",background:"#07c160",color:"#fff",
              border:"none",borderRadius:10,cursor:"pointer",fontSize:15,fontWeight:700,
              letterSpacing:2,marginBottom:12,display:"flex",alignItems:"center",justifyContent:"center",gap:8,
              boxShadow:"0 2px 10px rgba(7,193,96,.3)"}}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff"><path d="M8.69 11.87c-.4 0-.74-.34-.74-.76s.33-.76.74-.76.74.34.74.76-.34.76-.74.76zm4.62 0c-.41 0-.74-.34-.74-.76s.33-.76.74-.76c.4 0 .73.34.73.76s-.33.76-.73.76zM12 2C6.48 2 2 5.92 2 10.66c0 2.65 1.38 5.03 3.54 6.6l-.88 2.64 3.07-1.53c1.36.38 2.82.58 4.27.58 5.52 0 10-3.92 10-8.75S17.52 2 12 2z"/></svg>
            微信一键登录</button>
          
          {/* Divider */}
          <div style={{display:"flex",alignItems:"center",gap:12,margin:"16px 0"}}>
            <div style={{flex:1,height:1,background:"#e8e0d4"}}></div>
            <span style={{fontSize:11,color:"#b0a890"}}>或</span>
            <div style={{flex:1,height:1,background:"#e8e0d4"}}></div>
          </div>

          {/* Phone login - secondary */}
          <button onClick={function(){setMode("phone");}}
            style={{width:"100%",padding:"13px",background:"transparent",color:"#2a2018",
              border:"1.5px solid #e0dcd4",borderRadius:10,cursor:"pointer",fontSize:14,fontWeight:600,
              letterSpacing:2,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
            📱 手机号登录</button>

          {/* Skip */}
          <button onClick={onClose}
            style={{display:"block",margin:"18px auto 0",border:"none",background:"transparent",
              cursor:"pointer",fontSize:12,color:"#b0a890",letterSpacing:2}}>
            暂不登录，先逛逛</button>
        </div>}

        {/* Phone login flow */}
        {mode==="phone"&&<div>
          <button onClick={function(){setMode("choice");setStep(1);setPhone("");setCode("");}}
            style={{border:"none",background:"none",cursor:"pointer",fontSize:12,color:"#8a7a68",
              marginBottom:12,padding:0}}>← 返回</button>

          {step===1&&<div>
            <div style={{fontSize:13,fontWeight:700,color:"#2a2018",letterSpacing:2,marginBottom:12}}>
              输入手机号</div>
            <div style={{display:"flex",gap:8}}>
              <div style={{padding:"10px 12px",background:"#f5f0e8",borderRadius:8,
                fontSize:13,color:"#2a2018",fontWeight:600}}>+86</div>
              <input value={phone} onChange={function(e){setPhone(e.target.value.replace(/\D/g,"").slice(0,11));}}
                placeholder="请输入手机号" type="tel" maxLength="11"
                style={{flex:1,padding:"10px 14px",border:"1.5px solid #e0dcd4",borderRadius:8,
                  fontSize:14,outline:"none",background:"#fff",letterSpacing:2}}/>
            </div>
            <button onClick={sendCode} disabled={phone.length!==11}
              style={{width:"100%",marginTop:14,padding:"13px",
                background:phone.length===11?"#c06040":"#e0dcd4",
                color:phone.length===11?"#fff":"#aaa",
                border:"none",borderRadius:10,cursor:phone.length===11?"pointer":"default",
                fontSize:14,fontWeight:700,letterSpacing:2}}>
              获取验证码</button>
          </div>}

          {step===2&&<div>
            <div style={{fontSize:13,fontWeight:700,color:"#2a2018",letterSpacing:2,marginBottom:6}}>
              输入验证码</div>
            <div style={{fontSize:11,color:"#8a7a68",marginBottom:12}}>
              验证码已发送至 +86 {phone}</div>
            <input value={code} onChange={function(e){setCode(e.target.value.replace(/\D/g,"").slice(0,6));}}
              placeholder="请输入6位验证码" type="tel" maxLength="6"
              style={{width:"100%",padding:"12px 14px",border:"1.5px solid #e0dcd4",borderRadius:8,
                fontSize:18,outline:"none",background:"#fff",letterSpacing:8,textAlign:"center"}}/>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:10}}>
              <button onClick={function(){if(countdown<=0)sendCode();}}
                disabled={countdown>0}
                style={{border:"none",background:"none",cursor:countdown>0?"default":"pointer",
                  fontSize:12,color:countdown>0?"#ccc":"#c06040"}}>
                {countdown>0?countdown+"秒后重发":"重新发送"}</button>
            </div>
            <button onClick={verifyCode} disabled={code.length<4}
              style={{width:"100%",marginTop:14,padding:"13px",
                background:code.length>=4?"#c06040":"#e0dcd4",
                color:code.length>=4?"#fff":"#aaa",
                border:"none",borderRadius:10,cursor:code.length>=4?"pointer":"default",
                fontSize:14,fontWeight:700,letterSpacing:2}}>
              验证</button>
          </div>}

          {step===3&&<div>
            <div style={{fontSize:13,fontWeight:700,color:"#2a2018",letterSpacing:2,marginBottom:6}}>
              设置昵称</div>
            <div style={{fontSize:11,color:"#8a7a68",marginBottom:12}}>
              给自己取一个花事昵称吧</div>
            <input value={nick} onChange={function(e){setNick(e.target.value.slice(0,12));}}
              placeholder={"花友"+phone.slice(-4)}
              style={{width:"100%",padding:"12px 14px",border:"1.5px solid #e0dcd4",borderRadius:8,
                fontSize:14,outline:"none",background:"#fff",letterSpacing:2}}/>
            <button onClick={finishLogin}
              style={{width:"100%",marginTop:14,padding:"13px",background:"#c06040",color:"#fff",
                border:"none",borderRadius:10,cursor:"pointer",fontSize:14,fontWeight:700,letterSpacing:2}}>
              🌸 开始花事之旅</button>
          </div>}
        </div>}
      </div>

      {/* Footer */}
      <div style={{padding:"0 30px 18px",textAlign:"center"}}>
        <div style={{fontSize:10,color:"#c0b8a8",lineHeight:1.6}}>
          登录即表示同意《花信风用户协议》和《隐私政策》</div>
      </div>
    </div>
  </div>);
}

// ═══ 用户头像菜单 (User Avatar Menu) ═══
function UserMenu({user,onLogout,onShowDiary}){
  var [open,setOpen]=useState(false);
  if(!user)return null;
  var initial=user.name?user.name[0]:"花";
  return(<>
    <button onClick={function(){setOpen(!open);}} title={user.name}
      style={{position:"absolute",top:12,right:50,zIndex:35,border:"none",cursor:"pointer",
        padding:0,background:"transparent"}}>
      <div style={{width:32,height:32,borderRadius:"50%",
        background:"linear-gradient(135deg,#c06040,#e0a040)",color:"#fff",
        display:"flex",alignItems:"center",justifyContent:"center",
        fontSize:14,fontWeight:800,boxShadow:"0 2px 8px rgba(192,96,64,.3)",
        border:"2px solid #faf6ef"}}>{initial}</div>
    </button>
    {open&&<>
      <div onClick={function(){setOpen(false);}} style={{position:"fixed",inset:0,zIndex:34}}></div>
      <div style={{position:"absolute",top:50,right:40,zIndex:36,
        background:"#faf6ef",borderRadius:10,padding:"6px",minWidth:160,
        boxShadow:"0 4px 20px rgba(0,0,0,.15)",border:"1px solid #e0dcd4"}}>
        {/* User info */}
        <div style={{padding:"10px 14px",borderBottom:"1px solid #ece6dc"}}>
          <div style={{fontSize:14,fontWeight:700,color:"#2a2018"}}>{user.name}</div>
          <div style={{fontSize:10,color:"#8a7a68",marginTop:2}}>
            {user.loginType==="wechat"?"微信用户":"📱 "+user.phone.slice(0,3)+"****"+user.phone.slice(-4)}</div>
          <div style={{fontSize:10,color:"#b0a890",marginTop:2}}>加入于 {user.joinDate}</div>
        </div>
        {/* Menu items */}
        {[
          {icon:"📅",label:"我的花历",action:function(){if(onShowDiary)onShowDiary();setOpen(false);}},
          {icon:"⚙",label:"设置",action:function(){setOpen(false);}},
          {icon:"🚪",label:"退出登录",action:function(){if(onLogout)onLogout();setOpen(false);},danger:true},
        ].map(function(item,i){return(
          <button key={i} onClick={item.action}
            style={{display:"flex",alignItems:"center",gap:8,width:"100%",
              border:"none",background:"transparent",borderRadius:6,padding:"9px 14px",
              cursor:"pointer",fontSize:12,color:item.danger?"#d04030":"#2a2018",textAlign:"left"}}>
            <span style={{fontSize:14}}>{item.icon}</span>{item.label}</button>);})}
      </div>
    </>}
  </>);
}

// ═══ 花事概览仪表盘 (Dashboard) ═══
function DashboardPanel({onClose,flora,checkins,favs}){
  var now=new Date();var cm=now.getMonth()+1;var cd=now.getDate();
  var cs=getSeason();var sm=SM[cs];
  var seasonNames={spring:"春",summer:"夏",autumn:"秋",winter:"冬"};
  
  // Current jieqi
  var jieqiList=[
    {n:"小寒",m:1,d:5},{n:"大寒",m:1,d:20},{n:"立春",m:2,d:4},{n:"雨水",m:2,d:19},
    {n:"惊蛰",m:3,d:5},{n:"春分",m:3,d:20},{n:"清明",m:4,d:4},{n:"谷雨",m:4,d:19},
    {n:"立夏",m:5,d:5},{n:"小满",m:5,d:21},{n:"芒种",m:6,d:5},{n:"夏至",m:6,d:21},
    {n:"小暑",m:7,d:7},{n:"大暑",m:7,d:22},{n:"立秋",m:8,d:7},{n:"处暑",m:8,d:23},
    {n:"白露",m:9,d:7},{n:"秋分",m:9,d:23},{n:"寒露",m:10,d:8},{n:"霜降",m:10,d:23},
    {n:"立冬",m:11,d:7},{n:"小雪",m:11,d:22},{n:"大雪",m:12,d:7},{n:"冬至",m:12,d:22},
  ];
  var curJQ="";var nextJQ="";
  for(var i=0;i<jieqiList.length;i++){
    var j=jieqiList[i];var nj=jieqiList[(i+1)%jieqiList.length];
    if(cm>j.m||(cm===j.m&&cd>=j.d)){curJQ=j.n;nextJQ=nj.n;}
  }

  // Stats
  var blooming=flora.filter(function(f){return f._st&&f._st.l>=3;});
  var upcoming=flora.filter(function(f){return f._pred&&f._pred.daysUntil>0&&f._pred.daysUntil<=14;});
  var topSpecies={};
  blooming.forEach(function(f){topSpecies[f.sp]=(topSpecies[f.sp]||0)+1;});
  var topList=Object.keys(topSpecies).sort(function(a,b){return topSpecies[b]-topSpecies[a];}).slice(0,6);

  // Year progress
  var dayOfYear=Math.floor((now-new Date(now.getFullYear(),0,0))/(1000*60*60*24));
  var yearPct=Math.round(dayOfYear/365*100);

  var userSpots=Object.keys(checkins).length;
  var userSpecies=[...new Set(Object.keys(checkins).map(function(id){
    var s=flora.find(function(f){return f.id===Number(id);});return s?s.sp:"";
  }).filter(Boolean))].length;

  return(<div style={{position:"fixed",inset:0,zIndex:130,background:"rgba(20,15,10,.65)",
    display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(6px)"}} onClick={onClose}>
    <div onClick={function(e){e.stopPropagation();}} style={{background:"#faf6ef",width:"min(520px,92vw)",
      maxHeight:"88vh",borderRadius:14,overflow:"hidden",display:"flex",flexDirection:"column",
      boxShadow:"0 20px 60px rgba(0,0,0,.4)"}}>
      {/* Season header */}
      <div style={{padding:"22px 28px 16px",
        background:"linear-gradient(135deg,"+sm.c+"18,"+sm.c+"08)",
        borderBottom:"2px solid "+sm.c+"33"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
              <span style={{fontSize:32}}>{sm.i}</span>
              <div>
                <h2 style={{fontSize:22,fontWeight:900,color:"#2a2018",letterSpacing:4,margin:0}}>
                  花事概览</h2>
                <div style={{fontSize:12,color:sm.c,fontWeight:600,letterSpacing:2}}>
                  {seasonNames[cs]}季 · {curJQ} → {nextJQ}</div>
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{border:"none",background:"rgba(0,0,0,.08)",color:"#3a2818",
            cursor:"pointer",fontSize:14,width:28,height:28,borderRadius:"50%"}}>{"×"}</button>
        </div>
        {/* Year progress */}
        <div style={{marginTop:10}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"#8a7a68",marginBottom:3}}>
            <span>一月</span><span>年度进度 {yearPct}%</span><span>十二月</span>
          </div>
          <div style={{height:6,borderRadius:3,background:"#e8e0d4",overflow:"hidden"}}>
            <div style={{height:"100%",borderRadius:3,width:yearPct+"%",
              background:"linear-gradient(90deg,#c06040,"+sm.c+")"}}></div>
          </div>
        </div>
      </div>
      {/* Stats grid */}
      <div style={{flex:1,overflow:"auto",padding:"18px 24px"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:18}}>
          {[
            {v:blooming.length,l:"正在盛开",c:"#e06050",icon:"🌸"},
            {v:upcoming.length,l:"即将绽放",c:"#60a050",icon:"🌱"},
            {v:flora.length,l:"景点总数",c:"#c06040",icon:"📍"},
          ].map(function(s,i){return(
            <div key={i} style={{textAlign:"center",padding:"14px 10px",background:"#fff",
              borderRadius:10,border:"1px solid #ece6dc"}}>
              <div style={{fontSize:20,marginBottom:4}}>{s.icon}</div>
              <div style={{fontSize:24,fontWeight:900,color:s.c}}>{s.v}</div>
              <div style={{fontSize:10,color:"#8a7a68",letterSpacing:1}}>{s.l}</div>
            </div>);})}
        </div>

        {/* Top blooming species */}
        <div style={{marginBottom:18}}>
          <div style={{fontSize:11,color:"#b08040",letterSpacing:3,marginBottom:10,fontWeight:600}}>
            · 当前热门花卉 ·</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {topList.map(function(sp){
              var fl=flora.find(function(f){return f.sp===sp;});
              var color=fl?fl.c:"#ccc";
              return(<div key={sp} style={{display:"flex",alignItems:"center",gap:6,
                padding:"6px 12px",background:"#fff",borderRadius:20,
                border:"1px solid "+color+"44"}}>
                <FI sp={sp} sz={18} co={color}/>
                <span style={{fontSize:12,fontWeight:600,color:"#2a2018"}}>{sp}</span>
                <span style={{fontSize:10,color:color,fontWeight:700}}>{topSpecies[sp]}</span>
              </div>);})}
          </div>
        </div>

        {/* Your stats */}
        <div style={{marginBottom:18,padding:"14px 16px",background:"linear-gradient(135deg,#fdf8f0,#f0e8d4)",
          borderRadius:10,border:"1px solid #e8e0d4"}}>
          <div style={{fontSize:11,color:"#b08040",letterSpacing:3,marginBottom:8,fontWeight:600}}>
            · 我的花事 ·</div>
          <div style={{display:"flex",gap:20}}>
            {[
              {v:userSpots,l:"打卡",icon:"📍"},
              {v:userSpecies,l:"花种",icon:"🌺"},
              {v:Object.keys(favs).length,l:"收藏",icon:"❤"},
            ].map(function(s,i){return(
              <div key={i} style={{textAlign:"center"}}>
                <div style={{fontSize:16}}>{s.icon}</div>
                <div style={{fontSize:20,fontWeight:900,color:"#c06040"}}>{s.v}</div>
                <div style={{fontSize:10,color:"#8a7a68"}}>{s.l}</div>
              </div>);})}
          </div>
        </div>

        {/* Today's featured flower */}
        {blooming.length>0&&(function(){
          var todayFlower=blooming[cd%blooming.length];
          return(<div style={{padding:"16px",background:"#fff",borderRadius:10,
            border:"1px solid "+todayFlower.c+"33",borderLeft:"4px solid "+todayFlower.c}}>
            <div style={{fontSize:10,color:"#b08040",letterSpacing:3,marginBottom:8,fontWeight:600}}>
              · 今日推荐 ·</div>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:48,height:48,borderRadius:"50%",background:todayFlower.c+"18",
                display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <FI sp={todayFlower.sp} sz={32} co={todayFlower.c}/></div>
              <div style={{flex:1}}>
                <div style={{fontSize:15,fontWeight:700,color:"#2a2018"}}>{todayFlower.n}</div>
                <div style={{fontSize:12,color:todayFlower.c}}>{todayFlower.sp} · {todayFlower._st?todayFlower._st.st:""}</div>
                <div style={{fontSize:11,color:"#5a4a38",marginTop:4,fontStyle:"italic"}}>
                  {"「"}{todayFlower.po}{"」"}</div>
              </div>
            </div>
          </div>);
        })()}
      </div>
    </div>
  </div>);
}

// ═══ AI 赏花助手 (AI Flower Assistant) ═══
function AIAssistant({onClose,flora,user,onGoSpot}){
  var [msgs,setMsgs]=useState([{role:"ai",text:"你好！我是花信风AI助手 🌸\n\n你可以问我：\n· 推荐周末赏花去处\n· 某种花的最佳观赏时间\n· 定制多日赏花路线\n· 带老人/小孩的无障碍赏花\n· 某个城市有什么花可看"}]);
  var [input,setInput]=useState("");
  var [loading,setLoading]=useState(false);

  var sendMsg=async function(){
    if(!input.trim()||loading)return;
    var q=input.trim();setInput("");
    setMsgs(function(prev){return prev.concat([{role:"user",text:q}]);});
    setLoading(true);

    // Build context from flora data
    var now=new Date();var curMonth=now.getMonth()+1;
    var blooming=flora.filter(function(f){return f._st&&f._st.l>=3;}).slice(0,20);
    var upcoming=flora.filter(function(f){return f._pred&&f._pred.daysUntil>0&&f._pred.daysUntil<30;}).slice(0,15);

    var context="你是花信风APP的AI赏花助手，熟悉中国传统物候学和全国赏花景点。当前月份："+curMonth+"月。\n";
    context+="当前盛开："+blooming.map(function(f){return f.n+"("+f.sp+","+f.rg+")";}).join("、")+"\n";
    context+="即将盛开："+upcoming.map(function(f){return f.n+"("+f.sp+","+(f._pred?f._pred.dateStr:"")+")";}).join("、")+"\n";
    // Inject species knowledge if typeof is available
    try{
      if(typeof SPECIES_INFO!=="undefined"){
        var relSp={};
        blooming.concat(upcoming).slice(0,10).forEach(function(f){if(SPECIES_INFO[f.sp])relSp[f.sp]=SPECIES_INFO[f.sp];});
        var spKeys=Object.keys(relSp);
        if(spKeys.length>0){
          context+="相关花种贴士：";
          spKeys.forEach(function(sp){context+=sp+"("+relSp[sp].duration+","+relSp[sp].etiquette+"); ";});
          context+="\n";
        }
      }
    }catch(e){}
    context+="请用中文回答，简洁友好，给出具体景点推荐。涉及路线时标注交通方式、大约时间、门票价格。";

    try{
      var ctrl=new AbortController();var tid=setTimeout(function(){ctrl.abort();},15000);
      var response=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        signal:ctrl.signal,
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:800,
          system:context,
          messages:[{role:"user",content:q}]
        })
      });
      clearTimeout(tid);
      if(!response.ok)throw new Error("HTTP "+response.status);
      var data=await response.json();
      var reply=(data.content||[]).map(function(c){return c.text||"";}).join("");
      if(!reply)throw new Error("空回复");
      setMsgs(function(prev){return prev.concat([{role:"ai",text:reply}]);});
    }catch(e){
      // Fallback: local keyword matching with friendly notice
      var reply=localAnswer(q,flora,curMonth);
      if(e.name==="AbortError")reply="⏱ 思考超时，为你切换到本地模式：\n\n"+reply;
      setMsgs(function(prev){return prev.concat([{role:"ai",text:reply}]);});
    }
    setLoading(false);
  };

  // Local fallback answer engine
  var localAnswer=function(q,flora,month){
    var spots=[];
    // City search
    var cities=["北京","上海","杭州","南京","成都","西安","洛阳","武汉","广州","昆明","苏州","厦门","大理"];
    var matchCity=cities.find(function(c){return q.includes(c);});
    if(matchCity){
      spots=flora.filter(function(f){return f.n.includes(matchCity);}).slice(0,5);
      if(spots.length>0)return "🌸 "+matchCity+"赏花推荐：\n\n"+spots.map(function(s,i){
        return(i+1)+". "+s.n+" · "+s.sp+"\n   📅 花期："+s.pk[0]+"-"+s.pk[1]+"月"+(s._pred?" · 预测："+s._pred.dateStr:"")+"\n   💡 "+s.tp;
      }).join("\n\n");
    }
    // Flower search
    var flowers=["樱花","桃花","梅花","牡丹","荷花","菊花","薰衣草","油菜花","杜鹃"];
    var matchFlower=flowers.find(function(f){return q.includes(f);});
    if(matchFlower){
      spots=flora.filter(function(f){return f.sp===matchFlower;}).slice(0,5);
      if(spots.length>0)return "🌺 "+matchFlower+"最佳赏花地：\n\n"+spots.map(function(s,i){
        return(i+1)+". "+s.n+" · "+s.rg+"\n   📅 "+s.pk[0]+"-"+s.pk[1]+"月"+(s._pred?" · 预测："+s._pred.dateStr:"")+"\n   「"+s.po+"」";
      }).join("\n\n");
    }
    // Current season
    if(q.includes("现在")||q.includes("当季")||q.includes("本月")||q.includes("推荐")){
      spots=flora.filter(function(f){return f._st&&f._st.l>=3;}).slice(0,6);
      return "🌸 当前"+month+"月盛开推荐：\n\n"+spots.map(function(s,i){
        return(i+1)+". "+s.n+" · "+s.sp+" · "+s.rg+"\n   "+s.po;
      }).join("\n\n")+"\n\n💡 点击景点名可在地图上查看";
    }
    return "🌸 感谢提问！我可以帮你：\n\n1. 查某个城市的赏花地\n2. 查某种花的最佳观赏点\n3. 推荐当季盛开的花\n4. 规划赏花路线\n\n试试问：\"杭州有什么花可以看？\"";
  };

  return(<div style={{position:"fixed",inset:0,zIndex:140,background:"rgba(20,15,10,.65)",
    display:"flex",justifyContent:"flex-end",backdropFilter:"blur(6px)"}} onClick={onClose}>
    <div onClick={function(e){e.stopPropagation();}} style={{width:"min(420px,92vw)",height:"100vh",
      background:"#faf6ef",display:"flex",flexDirection:"column",boxShadow:"-4px 0 24px rgba(0,0,0,.15)"}}>
      {/* Header */}
      <div style={{padding:"16px 20px",borderBottom:"1px solid #ece6dc",background:"#f8f4ee",
        display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
        <div>
          <h2 style={{fontSize:18,fontWeight:900,color:"#2a2018",letterSpacing:4,margin:0}}>🤖 赏花助手</h2>
          <div style={{fontSize:10,color:"#8a7a60",marginTop:2}}>AI驱动 · 智能推荐</div>
        </div>
        <button onClick={onClose} style={{border:"none",background:"rgba(0,0,0,.08)",color:"#3a2818",
          cursor:"pointer",fontSize:14,width:28,height:28,borderRadius:"50%"}}>{"×"}</button>
      </div>
      {/* Messages */}
      <div style={{flex:1,overflow:"auto",padding:"14px 18px"}}>
        {msgs.map(function(m,i){return(
          <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start",marginBottom:12}}>
            <div style={{maxWidth:"85%",padding:"10px 14px",borderRadius:m.role==="user"?"12px 12px 2px 12px":"12px 12px 12px 2px",
              background:m.role==="user"?"#c06040":"#fff",color:m.role==="user"?"#fff":"#2a2018",
              fontSize:13,lineHeight:1.7,whiteSpace:"pre-wrap",boxShadow:"0 1px 4px rgba(0,0,0,.06)"}}>
              {m.text}</div>
          </div>);})}
        {loading&&<div style={{display:"flex",justifyContent:"flex-start",marginBottom:12}}>
          <div style={{padding:"10px 14px",borderRadius:"12px 12px 12px 2px",background:"#fff",
            fontSize:13,color:"#8a7a68"}}>思考中...</div>
        </div>}
      </div>
      {/* Input */}
      <div style={{padding:"12px 18px",borderTop:"1px solid #ece6dc",background:"#f8f4ee",flexShrink:0,
        display:"flex",gap:8}}>
        <input value={input} onChange={function(e){setInput(e.target.value);}}
          onKeyDown={function(e){if(e.key==="Enter")sendMsg();}}
          placeholder="问我赏花去哪里..."
          style={{flex:1,padding:"10px 14px",border:"1px solid #e0dcd4",borderRadius:20,
            fontSize:13,outline:"none",background:"#fff"}}/>
        <button onClick={sendMsg} disabled={loading||!input.trim()}
          style={{border:"none",background:input.trim()?"#c06040":"#ddd",color:"#fff",
            borderRadius:"50%",width:40,height:40,cursor:input.trim()?"pointer":"default",
            fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>↑</button>
      </div>
    </div>
  </div>);
}

// ═══ 个性化推荐 (Smart Recommendations) ═══
function RecommendPanel({onClose,flora,checkins,favs,userLoc,onGoSpot}){
  var visited=new Set(Object.keys(checkins).map(Number));
  var favSet=new Set(Object.keys(favs).map(Number));
  var visitedSpecies=new Set(Object.keys(checkins).map(function(id){
    var s=flora.find(function(f){return f.id===Number(id);});return s?s.sp:"";
  }).filter(Boolean));

  // Scoring algorithm
  var scored=flora.map(function(f){
    var score=0;
    // Bloom status bonus
    if(f._st&&f._st.l>=4)score+=40; // blooming now = highest
    if(f._st&&f._st.l===3)score+=30;
    if(f._pred&&f._pred.daysUntil>0&&f._pred.daysUntil<14)score+=25;
    // Not visited bonus
    if(!visited.has(f.id))score+=15;
    // New species bonus  
    if(!visitedSpecies.has(f.sp))score+=20;
    // Distance bonus (closer = better)
    if(userLoc){
      var dist=Math.sqrt(Math.pow(f.lat-userLoc.lat,2)+Math.pow(f.lon-userLoc.lon,2));
      if(dist<2)score+=30;
      else if(dist<5)score+=20;
      else if(dist<10)score+=10;
    }
    // Favorited spots get slight boost
    if(favSet.has(f.id))score+=5;
    return{spot:f,score:score};
  }).sort(function(a,b){return b.score-a.score;}).slice(0,12);

  var categories=[
    {title:"🌸 正在盛开",desc:"此刻最佳赏花时机",items:scored.filter(function(s){return s.spot._st&&s.spot._st.l>=3;}).slice(0,4)},
    {title:"🌱 即将绽放",desc:"提前规划，不错过花期",items:scored.filter(function(s){return s.spot._pred&&s.spot._pred.daysUntil>0&&s.spot._pred.daysUntil<21;}).slice(0,4)},
    {title:"🆕 新花种体验",desc:"你还没赏过的花卉",items:scored.filter(function(s){return!visitedSpecies.has(s.spot.sp);}).slice(0,4)},
  ];

  return(<div style={{position:"fixed",inset:0,zIndex:130,background:"rgba(20,15,10,.65)",
    display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(6px)"}} onClick={onClose}>
    <div onClick={function(e){e.stopPropagation();}} style={{background:"#faf6ef",width:"min(620px,94vw)",
      maxHeight:"90vh",borderRadius:14,overflow:"hidden",display:"flex",flexDirection:"column",
      boxShadow:"0 20px 60px rgba(0,0,0,.4)"}}>
      <div style={{padding:"18px 24px 14px",borderBottom:"1px solid #ece6dc",
        background:"linear-gradient(180deg,#faf6ef,#f2ebd8)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <h2 style={{fontSize:20,fontWeight:900,color:"#2a2018",letterSpacing:6,margin:0}}>✨ 为你推荐</h2>
            <div style={{fontSize:11,color:"#8a7a60",marginTop:4}}>基于你的花历 · 当季花事 · 个性化推荐</div>
          </div>
          <button onClick={onClose} style={{border:"none",background:"rgba(0,0,0,.08)",color:"#3a2818",
            cursor:"pointer",fontSize:14,width:28,height:28,borderRadius:"50%"}}>{"×"}</button>
        </div>
      </div>
      <div style={{flex:1,overflow:"auto",padding:"16px 24px"}}>
        {categories.map(function(cat,ci){
          if(cat.items.length===0)return null;
          return(<div key={ci} style={{marginBottom:20}}>
            <div style={{fontSize:14,fontWeight:700,color:"#2a2018",letterSpacing:2,marginBottom:4}}>{cat.title}</div>
            <div style={{fontSize:11,color:"#8a7a68",marginBottom:10}}>{cat.desc}</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(170px,1fr))",gap:10}}>
              {cat.items.map(function(item){var s=item.spot;
                return(<div key={s.id} onClick={function(){if(onGoSpot)onGoSpot(s);onClose();}}
                  style={{padding:"12px",background:"#fff",borderRadius:10,
                    border:"1px solid "+s.c+"33",cursor:"pointer",transition:"all .15s",
                    borderLeft:"3px solid "+s.c}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                    <div style={{width:28,height:28,borderRadius:"50%",background:"#f8f4ee",
                      border:"1px solid "+s.c+"55",display:"flex",alignItems:"center",justifyContent:"center"}}>
                      <FI sp={s.sp} sz={18} co={s.c}/></div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:12,fontWeight:700,color:"#2a2018",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
                        {s.n.split("·")[1]||s.n}</div>
                      <div style={{fontSize:10,color:s.c}}>{s.sp}</div>
                    </div>
                  </div>
                  <div style={{fontSize:10,color:"#8a7a68",lineHeight:1.5}}>
                    {s._st?s._st.st:""}{s._pred&&s._pred.daysUntil>0?" · "+s._pred.daysUntil+"天后":""}</div>
                  {!visited.has(s.id)&&<span style={{fontSize:9,padding:"1px 6px",background:"#e0f0e0",
                    color:"#3a8a50",borderRadius:8,fontWeight:600}}>未到访</span>}
                </div>);
              })}
            </div>
          </div>);
        })}
      </div>
    </div>
  </div>);
}

// ═══ 花事圈 (Social Feed) ═══
function SocialFeed({onClose,flora,user}){
  var [posts,setPosts]=useState([]);
  var [newPost,setNewPost]=useState("");
  var [displayCount,setDisplayCount]=useState(20);
  var [postSpot,setPostSpot]=useState(null);
  var [searchQ,setSearchQ]=useState("");

  useEffect(function(){(async function(){
    try{var r=window.storage?await window.storage.get("social_feed",true):null;
      if(r&&r.value)setPosts(JSON.parse(r.value));}catch(e){}
  })();},[]);

  var submitPost=async function(){
    if(!newPost.trim())return;
    var post={
      id:Date.now().toString(36),
      author:user?user.name:"匿名花友",
      authorId:user?user.id:"anon",
      text:newPost.trim(),
      spot:postSpot?{id:postSpot.id,n:postSpot.n,sp:postSpot.sp,c:postSpot.c}:null,
      date:new Date().toLocaleDateString("zh-CN"),
      ts:Date.now(),
      likes:0,likedBy:[]
    };
    var newPosts=[post].concat(posts).slice(0,200);
    setPosts(newPosts);setNewPost("");setPostSpot(null);
    try{if(window.storage)await window.storage.set("social_feed",JSON.stringify(newPosts),true);}catch(e){}
  };

  var likePost=async function(postId){
    var uid=user?user.id:"anon";
    var newPosts=posts.map(function(p){
      if(p.id!==postId)return p;
      var liked=(p.likedBy||[]).includes(uid);
      return{...p,likes:liked?p.likes-1:p.likes+1,
        likedBy:liked?(p.likedBy||[]).filter(function(x){return x!==uid;}):
          (p.likedBy||[]).concat([uid])};
    });
    setPosts(newPosts);
    try{if(window.storage)await window.storage.set("social_feed",JSON.stringify(newPosts),true);}catch(e){}
  };

  return(<div style={{position:"fixed",inset:0,zIndex:130,background:"rgba(20,15,10,.65)",
    display:"flex",justifyContent:"flex-end",backdropFilter:"blur(6px)"}} onClick={onClose}>
    <div onClick={function(e){e.stopPropagation();}} style={{width:"min(440px,92vw)",height:"100vh",
      background:"#faf6ef",display:"flex",flexDirection:"column",boxShadow:"-4px 0 24px rgba(0,0,0,.15)"}}>
      {/* Header */}
      <div style={{padding:"16px 20px",borderBottom:"1px solid #ece6dc",background:"#f8f4ee",flexShrink:0}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <h2 style={{fontSize:18,fontWeight:900,color:"#2a2018",letterSpacing:4,margin:0}}>🌺 花事圈</h2>
            <div style={{fontSize:10,color:"#8a7a60",marginTop:2}}>分享你的花事 · 发现同好</div>
          </div>
          <button onClick={onClose} style={{border:"none",background:"rgba(0,0,0,.08)",color:"#3a2818",
            cursor:"pointer",fontSize:14,width:28,height:28,borderRadius:"50%"}}>{"×"}</button>
        </div>
      </div>
      {/* Compose */}
      <div style={{padding:"14px 18px",borderBottom:"1px solid #ece6dc",background:"#fff",flexShrink:0}}>
        <div style={{display:"flex",gap:10}}>
          <div style={{width:32,height:32,borderRadius:"50%",background:"linear-gradient(135deg,#c06040,#e0a040)",
            color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:800,flexShrink:0}}>
            {user?user.name[0]:"花"}</div>
          <div style={{flex:1}}>
            <textarea value={newPost} onChange={function(e){setNewPost(e.target.value.slice(0,200));}}
              placeholder="分享你的花事..."
              rows="2" style={{width:"100%",border:"none",outline:"none",resize:"none",
                fontSize:13,lineHeight:1.6,background:"transparent"}}/>
            {/* Spot tag */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:4}}>
              <div style={{display:"flex",gap:6,alignItems:"center"}}>
                {postSpot?<div style={{display:"flex",alignItems:"center",gap:4,padding:"2px 8px",
                  background:postSpot.c+"18",borderRadius:12,fontSize:11,color:postSpot.c}}>
                  <FI sp={postSpot.sp} sz={12} co={postSpot.c}/>{postSpot.n.split("·")[1]||postSpot.n}
                  <span onClick={function(){setPostSpot(null);}} style={{cursor:"pointer",marginLeft:4}}>{"×"}</span>
                </div>:
                <div style={{position:"relative"}}>
                  <input value={searchQ} onChange={function(e){setSearchQ(e.target.value);
                    if(e.target.value.length>=2){
                      var match=flora.find(function(f){return f.n.includes(e.target.value);});
                      if(match){setPostSpot(match);setSearchQ("");}
                    }}}
                    placeholder="📍 标记景点" style={{border:"1px solid #e8e0d4",borderRadius:12,
                      padding:"3px 10px",fontSize:11,width:100,outline:"none"}}/>
                </div>}
              </div>
              <button onClick={submitPost} disabled={!newPost.trim()}
                style={{border:"none",background:newPost.trim()?"#c06040":"#ddd",color:"#fff",
                  borderRadius:14,padding:"5px 16px",cursor:newPost.trim()?"pointer":"default",
                  fontSize:12,fontWeight:700}}>发布</button>
            </div>
          </div>
        </div>
      </div>
      {/* Feed */}
      <div style={{flex:1,overflow:"auto"}}>
        {posts.length===0&&<div style={{textAlign:"center",padding:"50px 0",color:"#8a7a60"}}>
          <div style={{fontSize:40,marginBottom:12}}>🌺</div>
          <div style={{fontSize:14,letterSpacing:2}}>花事圈还没有动态</div>
          <div style={{fontSize:12,marginTop:6,opacity:.6}}>做第一个分享花事的人吧</div>
        </div>}
        {posts.slice(0,displayCount).map(function(p){
          var isLiked=user&&(p.likedBy||[]).includes(user.id);
          return(<div key={p.id} style={{padding:"14px 18px",borderBottom:"1px solid #f0ece4"}}>
            {/* Author */}
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
              <div style={{width:28,height:28,borderRadius:"50%",background:"linear-gradient(135deg,#c06040,#e0a040)",
                color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800}}>
                {p.author?p.author[0]:"花"}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:12,fontWeight:700,color:"#2a2018"}}>{p.author}</div>
                <div style={{fontSize:10,color:"#b0a890"}}>{p.date}</div>
              </div>
            </div>
            {/* Content */}
            <div style={{fontSize:13,color:"#2a2018",lineHeight:1.8,marginBottom:8,whiteSpace:"pre-wrap"}}>{p.text}</div>
            {/* Spot tag */}
            {p.spot&&<div style={{display:"inline-flex",alignItems:"center",gap:4,padding:"3px 10px",
              background:(p.spot.c||"#ccc")+"15",borderRadius:12,fontSize:11,color:p.spot.c||"#888",marginBottom:8}}>
              <FI sp={p.spot.sp} sz={12} co={p.spot.c}/>{p.spot.n}</div>}
            {/* Actions */}
            <div style={{display:"flex",gap:16}}>
              <button onClick={function(){likePost(p.id);}}
                style={{border:"none",background:"none",cursor:"pointer",fontSize:12,
                  color:isLiked?"#e06050":"#b0a890",display:"flex",alignItems:"center",gap:4}}>
                {isLiked?"❤":"♡"} {p.likes||0}</button>
              <button onClick={function(){
                var text=p.author+"："+p.text+(p.spot?" 📍"+p.spot.n:"");
                navigator.clipboard.writeText(text);alert("已复制");
              }} style={{border:"none",background:"none",cursor:"pointer",fontSize:12,color:"#b0a890"}}>
                📤 转发</button>
            </div>
          </div>);
        })}
        {posts.length>displayCount&&<div style={{padding:"16px",textAlign:"center"}}>
          <button onClick={function(){setDisplayCount(displayCount+20);}}
            style={{padding:"8px 24px",background:"transparent",border:"1px solid #e0dcd4",
              borderRadius:18,cursor:"pointer",fontSize:12,color:"#c06040",fontWeight:600}}>
            加载更多（还有 {posts.length-displayCount} 条）</button>
        </div>}
      </div>
    </div>
  </div>);
}

// ═══ MAIN ═══
export default function App(){
  return(<ErrorBoundary>
    <AppCore/>
  </ErrorBoundary>);
}

function AppCore(){
  const [entered,setEntered]=useState(false);const [geo,setGeo]=useState(null);
  // ─── Analytics tracker (no-op if not configured) ───
  const track=useCallback(function(event,data){
    if(typeof window!=="undefined"&&window._hxTrack)window._hxTrack(event,data);
  },[]);
  const [user,setUser]=useState(null);const [showLogin,setShowLogin]=useState(false);
  // Load user from storage
  useEffect(function(){(async function(){
    try{var r=window.storage?await window.storage.get("user_profile"):null;
      if(r&&r.value)setUser(JSON.parse(r.value));}catch(e){}
  })();},[]);
  const doLogin=async function(u){
    setUser(u);setShowLogin(false);
    try{if(window.storage)await window.storage.set("user_profile",JSON.stringify(u));}catch(e){}
  };
  const doLogout=async function(){
    setUser(null);
    try{if(window.storage)await window.storage.delete("user_profile");}catch(e){}
  };
  // Auto-show mood card once per day on entry
  const [flora]=useState(()=>FLORA.map(f=>{const pred=predictBloom(f);return{...f,_at:FAT[f.id]||200,_st:calcSt(FAT[f.id]||200,f.th,pred),_pred:pred};}));
  const [page,setPage]=useState("map");const [filter,setFilter]=useState("current");
  const [region,setRegion]=useState("all");const [sel,setSel]=useState(null);
  const [drag,setDrag]=useState(null);const [pan,setPan]=useState({x:0,y:0});
  const [wz,setWz]=useState(1);const [wc,setWc]=useState([104.5,35]);
  const [selSp,setSelSp]=useState("牡丹");const [userLoc,setUserLoc]=useState(null);const [locAsked,setLocAsked]=useState(false);
  const [showMood,setShowMood]=useState(false);
  const [trip,setTrip]=useState([]);const [showTrip,setShowTrip]=useState(false);
  const [checkins,setCheckins]=useState({});

  // Load checkins from storage
  useEffect(()=>{(async()=>{try{const r=window.storage?await window.storage.get("checkins"):null;
    if(r&&r.value)setCheckins(JSON.parse(r.value));}catch{}})();},[]);
  const doCheckin=async(id,note)=>{const nc={...checkins,[id]:{date:new Date().toLocaleDateString("zh-CN"),ts:Date.now(),note:note||""}};
    track("checkin",{spotId:id,hasNote:!!note});
    setCheckins(nc);try{if(window.storage)await window.storage.set("checkins",JSON.stringify(nc));}catch{}};

  // ═══ Hash-based URL routing (no router lib needed) ═══
  // Sync URL hash with selected spot: #/spot/123
  useEffect(()=>{
    if(typeof window==="undefined")return;
    // Parse initial hash on load
    const parseHash=()=>{
      var hash=window.location.hash;
      var match=hash.match(/^#\/spot\/(\d+)/);
      if(match){
        var id=Number(match[1]);
        var spot=flora.find(function(f){return f.id===id;});
        if(spot&&(!sel||sel.id!==id))setSel(spot);
      }else if(!hash||hash==="#"||hash==="#/"){
        if(sel)setSel(null);
      }
    };
    parseHash();
    window.addEventListener("hashchange",parseHash);
    return()=>window.removeEventListener("hashchange",parseHash);
  },[flora]);
  // Update hash when sel changes
  useEffect(()=>{
    if(typeof window==="undefined")return;
    if(sel&&sel.id){
      var target="#/spot/"+sel.id;
      if(window.location.hash!==target){
        // Push state for back button support
        window.history.pushState(null,"",target);
        // Update document title & meta for SEO
        try{
          document.title=sel.n+" · "+sel.sp+" · 花信风";
          var metaDesc=document.querySelector('meta[name="description"]');
          if(metaDesc)metaDesc.setAttribute("content",sel.n+" - "+sel.sp+"预测盛花期。"+sel.po);
        }catch(e){}
      }
    }else{
      if(window.location.hash&&window.location.hash!=="#/"){
        window.history.pushState(null,"","#/");
        try{document.title="花信风 · 跟着天地节律追一场中国色";}catch(e){}
      }
    }
  },[sel]);

  // P2-9: Request notification permission + smart subscription-aware alerts
  useEffect(()=>{if(!entered)return;
    if("Notification" in window&&Notification.permission==="default"){
      setTimeout(()=>Notification.requestPermission(),5000);}
    // Check subscribed spots and notify if bloom is 1-3 days away
    var checkSubs=async()=>{
      if(!("Notification" in window)||Notification.permission!=="granted")return;
      try{
        var r=window.storage?await window.storage.get("bloom_subs"):null;
        if(!r||!r.value)return;
        var subs=JSON.parse(r.value);
        var notifiedKey="subs_notified_"+new Date().toLocaleDateString("zh-CN");
        var notifiedR=window.storage?await window.storage.get(notifiedKey):null;
        var notifiedIds=notifiedR&&notifiedR.value?JSON.parse(notifiedR.value):[];
        for(var i=0;i<subs.length;i++){
          var sub=subs[i];
          if(notifiedIds.includes(sub.spotId))continue;
          var spot=flora.find(function(f){return f.id===sub.spotId;});
          if(!spot||!spot._pred)continue;
          var days=spot._pred.daysUntil;
          if(days>=1&&days<=3){
            new Notification("🌸 花讯到！",{
              body:spot.n+" · "+spot.sp+" 将于 "+days+" 天后盛开（"+spot._pred.dateStr+"）",
              tag:"hx-sub-"+spot.id,
              icon:"data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><text y='24' font-size='24'>🌸</text></svg>"
            });
            notifiedIds.push(sub.spotId);
          }
        }
        if(window.storage)await window.storage.set(notifiedKey,JSON.stringify(notifiedIds));
      }catch(e){}
    };
    // Check once on load + every 6 hours
    setTimeout(checkSubs,8000);
    var intv=setInterval(checkSubs,6*60*60*1000);
    return()=>clearInterval(intv);
  },[entered,flora]);
  const [nearbyMonth,setNearbyMonth]=useState(0);
  const [searchQ,setSearchQ]=useState("");const [showSearch,setShowSearch]=useState(false);
  const [favs,setFavs]=useState({});
  const mapRef=useRef(null);const touchD=useRef(null);

  // Load favorites from storage
  useEffect(()=>{(async()=>{try{const r=window.storage?await window.storage.get("favs"):null;
    if(r&&r.value)setFavs(JSON.parse(r.value));}catch{}})();},[]);
  const toggleFav=async(id)=>{const nf={...favs};if(nf[id])delete nf[id];else nf[id]=Date.now();
    track(nf[id]?"favorite_add":"favorite_remove",{spotId:id});
    setFavs(nf);try{if(window.storage)await window.storage.set("favs",JSON.stringify(nf));}catch{}};
  const addToTrip=(id)=>{if(!trip.includes(id)){setTrip([...trip,id]);track("trip_add",{spotId:id});}};
  const removeFromTrip=(id)=>setTrip(trip.filter(x=>x!==id));
  const moveInTrip=(id,dir)=>{const i=trip.indexOf(id);if(i<0)return;const n=[...trip];
    const j=i+dir;if(j<0||j>=n.length)return;[n[i],n[j]]=[n[j],n[i]];setTrip(n);};
  const tripSpots=useMemo(()=>trip.map(id=>flora.find(f=>f.id===id)).filter(Boolean),[trip,flora]);
  const tripDist=useMemo(()=>{let d=0;for(let i=1;i<tripSpots.length;i++)
    d+=distKm(tripSpots[i-1].lat,tripSpots[i-1].lon,tripSpots[i].lat,tripSpots[i].lon);return Math.round(d);},[tripSpots]);
  const W=1000,H=850;const cs=getSeason();const cr=REGIONS.find(r=>r.id===region)||REGIONS[0];

  const proj=useMemo(()=>d3.geoMercator().center([104.5,35.5]).scale(580).translate([W/2,H/2]),[]);
  const pathGen=useMemo(()=>d3.geoPath().projection(proj),[proj]);

  useEffect(()=>{fetch("https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json")
    .then(r=>r.json()).then(setGeo).catch(()=>{
      fetch("https://geo.datav.aliyun.com/areas_v3/bound/100000.json").then(r=>r.json()).then(setGeo).catch(()=>{});});},[]);

  // Auto-show mood card once per day
  useEffect(()=>{if(!entered)return;(async()=>{
    const d=new Date();const seed=d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate();
    try{const r=window.storage?await window.storage.get("moodShown_"+seed):null;
      if(!r&&r.value){setTimeout(()=>{setShowMood(true);
        window.storage&&window.storage.set("moodShown_"+seed,"1");},1200);}}catch{}
  })();},[entered]);

  // ═══ Daily streak system ═══
  const [streak,setStreak]=useState({count:0,lastDate:"",rewards:[]});
  const [showStreak,setShowStreak]=useState(false);
  useEffect(function(){if(!entered)return;(async function(){
    try{
      var today=new Date().toLocaleDateString("zh-CN");
      var r=window.storage?await window.storage.get("daily_streak"):null;
      var data=(r&&r.value)?JSON.parse(r.value):{count:0,lastDate:"",rewards:[]};
      if(data.lastDate!==today){
        var yesterday=new Date();yesterday.setDate(yesterday.getDate()-1);
        var yDate=yesterday.toLocaleDateString("zh-CN");
        if(data.lastDate===yDate)data.count+=1;
        else if(data.lastDate!==today)data.count=1;
        data.lastDate=today;
        // Check milestone rewards
        var milestones=[3,7,15,30,60,100];
        milestones.forEach(function(m){if(data.count===m&&!data.rewards.includes(m))data.rewards.push(m);});
        if(window.storage)await window.storage.set("daily_streak",JSON.stringify(data));
        setStreak(data);
        if(data.count>=2)setTimeout(function(){setShowStreak(true);},2000);
        track("daily_streak",{count:data.count});
      }else setStreak(data);
    }catch(e){}
  })();},[entered,track]);

  // ═══ Bloom subscription system ═══
  const [subs,setSubs]=useState([]);
  useEffect(function(){if(!entered)return;(async function(){
    try{var r=window.storage?await window.storage.get("bloom_subs"):null;
      if(r&&r.value)setSubs(JSON.parse(r.value));}catch(e){}
  })();},[entered]);
  const toggleSub=async function(id){
    var ns=subs.includes(id)?subs.filter(function(x){return x!==id;}):subs.concat([id]);
    setSubs(ns);track(subs.includes(id)?"sub_remove":"sub_add",{spotId:id});
    try{if(window.storage)await window.storage.set("bloom_subs",JSON.stringify(ns));}catch(e){}
    // Check for flowering within 7 days & trigger notification
    if(!subs.includes(id)&&"Notification" in window&&Notification.permission==="default"){
      Notification.requestPermission();
    }
  };

  // Check subscribed spots daily for near-bloom (notify if daysUntil<=3)
  useEffect(function(){if(!entered||subs.length===0)return;
    if(!("Notification" in window)||Notification.permission!=="granted")return;
    (async function(){
      try{
        var today=new Date().toLocaleDateString("zh-CN");
        var notifyKey="notify_check_"+today;
        var r=window.storage?await window.storage.get(notifyKey):null;
        if(r&&r.value)return; // Already checked today
        flora.forEach(function(f){
          if(subs.includes(f.id)&&f._pred&&f._pred.daysUntil>0&&f._pred.daysUntil<=3){
            new Notification("🌸 花信风",{body:f.n+" 预计 "+f._pred.daysUntil+" 天后盛开！",icon:"/favicon.svg"});
          }
        });
        if(window.storage)await window.storage.set(notifyKey,"1");
      }catch(e){}
    })();
  },[entered,subs,flora]);

  // Auto-prompt login after 45s if not logged in
  useEffect(()=>{if(!entered||user)return;
    const t=setTimeout(()=>{if(!user)setShowLogin(true);},45000);
    return()=>clearTimeout(t);
  },[entered,user]);

  // Auto-show daily check-in on entry (once per day)
  useEffect(()=>{if(!entered)return;(async()=>{
    try{
      const today=new Date().toLocaleDateString("zh-CN");
      const r=window.storage?await window.storage.get("daily_streak"):null;
      if(!r||!r.value){setTimeout(()=>setShowDaily(true),3000);return;}
      const d=JSON.parse(r.value);
      if(d.lastDate!==today)setTimeout(()=>setShowDaily(true),3000);
    }catch(e){}
  })();},[entered]);

  const requestLoc=()=>{if(locAsked)return;setLocAsked(true);
    navigator.geolocation&&navigator.geolocation.getCurrentPosition(p=>{
      const loc={lat:p.coords.latitude,lon:p.coords.longitude};
      setUserLoc(loc);
      setWz(2.5);setWc([loc.lon,loc.lat]);setRegion("all");
    },()=>{const loc={lat:39.9,lon:116.4};setUserLoc(loc);setWz(2.5);setWc([loc.lon,loc.lat]);setRegion("all");});};

  // Navigate to a spot by id (for alert banner clicks)
  const goToSpot=useCallback((id)=>{
    const f=flora.find(x=>x.id===id);if(!f)return;
    setWz(5);setWc([f.lon,f.lat]);setRegion("all");setPan({x:0,y:0});
    setSel(f);track("spot_view",{spotId:id,species:f.sp,region:f.rg});
    // Update URL hash for shareable deep links
    try{window.history.replaceState(null,"","#/spot/"+id);}catch(e){}
  },[flora,track]);

  // Deep link: read URL hash on mount, open corresponding spot
  useEffect(function(){if(!entered)return;
    try{
      var hash=window.location.hash;
      var m=hash.match(/^#\/spot\/(\d+)/);
      if(m){var id=Number(m[1]);var f=flora.find(function(x){return x.id===id;});
        if(f){setTimeout(function(){goToSpot(id);},800);}
      }
    }catch(e){}
  },[entered,flora,goToSpot]);

  // Update page title based on selected spot (for SEO sharing)
  useEffect(function(){
    try{
      if(sel)document.title=sel.n+" · "+sel.sp+" · 花信风";
      else document.title="花信风 · 跟着天地节律追一场中国色";
    }catch(e){}
  },[sel]);

  const displayFlora=useMemo(()=>{const cm=new Date().getMonth()+1;
    return flora.map(f=>{let at=f._at,st=f._st;
      if(filter.startsWith("future")){
        const months=filter==="future1"?1:filter==="future3"?3:6;
        // future1: 0-30 days, future3: 30-90 days, future6: 90-180 days (non-overlapping)
        const minDays=filter==="future1"?0:filter==="future3"?30:90;
        const maxDays=filter==="future1"?30:filter==="future3"?90:180;
        const pred=f._pred;
        const bloomInFuture=pred&&pred.daysUntil>=minDays&&pred.daysUntil<=maxDays;
        if(bloomInFuture){at=FAT[f.id]||f.th;st={st:"预计"+pred.dateStr,l:3};}
        else st={st:"不在窗口",l:0};
      }else if(filter==="current"){
        // 当季：不仅季节匹配，花期月份也要包含当前月(±1)
        const curM=new Date().getMonth()+1;
        const inPkMonth=f.pk[0]<=f.pk[1]?(curM>=f.pk[0]-1&&curM<=f.pk[1]+1):(curM>=f.pk[0]||curM<=f.pk[1]);
        if(f.s!==cs||!inPkMonth)st={st:"非当季",l:0};
      }
      else if(filter==="favs"&&!favs[f.id])st={st:"未收藏",l:0};
      else if(filter!=="current"&&filter!=="all"&&filter!=="favs"&&f.s!==filter)st={st:"非本季",l:0};
      return{...f,_at:at,_st:st,_dist:userLoc?distKm(userLoc.lat,userLoc.lon,f.lat,f.lon):null};
    });},[flora,filter,cs,userLoc,favs]);

  const spots=useMemo(()=>{let list=displayFlora;
    // Search filter
    if(searchQ.trim()){const q=searchQ.trim().toLowerCase();
      list=flora.map(f=>({...f,_at:FAT[f.id]||200,_st:calcSt(FAT[f.id]||200,f.th,f._pred),_pred:f._pred,
        _dist:userLoc?distKm(userLoc.lat,userLoc.lon,f.lat,f.lon):null}))
        .filter(f=>f.n.toLowerCase().includes(q)||f.sp.toLowerCase().includes(q)||f.rg.includes(q));
    } else if(page==="species"){
      // Show ALL spots of this species, including faded ones (with current year prediction)
      list=flora.filter(f=>f.sp===selSp).map(f=>({...f,_at:FAT[f.id]||200,_st:calcSt(FAT[f.id]||200,f.th,f._pred),_pred:f._pred}));
    }
    if(page==="nearby"&&userLoc){
      list=flora.map(f=>({...f,_at:FAT[f.id]||200,_st:calcSt(FAT[f.id]||200,f.th,f._pred),
        _dist:distKm(userLoc.lat,userLoc.lon,f.lat,f.lon),_pred:f._pred}))
        .filter(f=>(f._dist||9999)<500);
      if(nearbyMonth>0)list=list.filter(f=>f.pk[0]<=nearbyMonth&&f.pk[1]>=nearbyMonth);
      list=[...list].sort((a,b)=>(a._dist||9999)-(b._dist||9999));}
    return list;},[displayFlora,page,selSp,userLoc,nearbyMonth,flora,searchQ]);

  const ez=region==="all"?wz:cr.z;const ecx=region==="all"?wc:[cr.cx,cr.cy];const pc=proj(ecx);
  useEffect(()=>{setPan({x:0,y:0});},[region]);
  useEffect(()=>{if(region!=="all"){setWz(1);setWc([104.5,35]);}},[region]);
  useEffect(()=>{const el=mapRef.current;if(!el)return;
    const h=e=>{e.preventDefault();
      // Chrome/Edge: trackpad pinch sends ctrlKey+wheel with small deltaY
      // Firefox: trackpad pinch sends small deltaY without ctrlKey
      // All: mouse wheel sends larger deltaY without ctrlKey
      const isPinch=e.ctrlKey||e.metaKey;
      const isTrackpad=!isPinch&&Math.abs(e.deltaY)<=40&&!e.deltaMode;
      let f;
      if(isPinch){f=e.deltaY*-.02;}// pinch gesture
      else if(isTrackpad){f=e.deltaY<0?0.08:-0.08;}// trackpad scroll zoom
      else{f=e.deltaY<0?0.2:-0.18;}// mouse wheel
      const rect=el.getBoundingClientRect();const gx=proj.invert&&proj.invert([(e.clientX-rect.left)/rect.width*W,(e.clientY-rect.top)/rect.height*H]);
      setWz(p=>{const n=Math.max(1,Math.min(8,p*(1+f)));
        if(n>1.05&&gx){const t=Math.min(.15,.05*(n-1));setWc(c=>[c[0]+(gx[0]-c[0])*t,c[1]+(gx[1]-c[1])*t]);}
        else setWc([104.5,35]);return n;});};
    el.addEventListener("wheel",h,{passive:false});
    // Safari gesture events for trackpad pinch
    let lastScale=1;
    const gs=e=>{e.preventDefault();lastScale=1;};
    const gc=e=>{e.preventDefault();
      const delta=e.scale/lastScale;lastScale=e.scale;
      setWz(p=>Math.max(1,Math.min(8,p*delta)));};
    const ge=e=>{e.preventDefault();lastScale=1;};
    el.addEventListener("gesturestart",gs,{passive:false});
    el.addEventListener("gesturechange",gc,{passive:false});
    el.addEventListener("gestureend",ge,{passive:false});
    return()=>{el.removeEventListener("wheel",h);el.removeEventListener("gesturestart",gs);
      el.removeEventListener("gesturechange",gc);el.removeEventListener("gestureend",ge);};},[proj]);
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
  const rP=useMemo(()=>RIVERS.map(r=>({...r,d:d3.line().x(d=>(proj(d)||[])[0]).y(d=>(proj(d)||[])[1]).curve(d3.curveBasis)(r.co.map(c=>[c[0],c[1]]))})),[proj]);
  const mP=useMemo(()=>MTNS.map(m=>({...m,dd:d3.line().x(d=>(proj(d)||[])[0]).y(d=>(proj(d)||[])[1]).curve(d3.curveBasis)(m.co.map(c=>[c[0],c[1]]))})),[proj]);
  const sP=useMemo(()=>{const m=new Map();FLORA.forEach(f=>{const p=proj([f.lon,f.lat]);if(p)m.set(f.id,{x:(p[0]/W*100)+"%",y:(p[1]/H*100)+"%"});});return m;},[proj]);

  const [dark,setDark]=useState(false);
  const [lang,setLang]=useState("zh");const [showGuide,setShowGuide]=useState(false);
  const [showHuaxin,setShowHuaxin]=useState(false);const [wikiSp,setWikiSp]=useState(null);
  const [showDiary,setShowDiary]=useState(false);
  const [showCalendar,setShowCalendar]=useState(false);
  const [showCrowd,setShowCrowd]=useState(false);
  const [showPoem,setShowPoem]=useState(false);
  const [showAI,setShowAI]=useState(false);
  const [showRec,setShowRec]=useState(false);
  const [showFeed,setShowFeed]=useState(false);
  const [showDash,setShowDash]=useState(false);
  const [showDaily,setShowDaily]=useState(false);
  const [showPuzzle,setShowPuzzle]=useState(false);
  const [showSub,setShowSub]=useState(false);
  const [showOnboarding,setShowOnboarding]=useState(false);
  const [toolsOpen,setToolsOpen]=useState(false);

  // Check if first visit → show onboarding
  useEffect(function(){if(!entered)return;(async function(){
    try{var r=window.storage?await window.storage.get("onboarding_done"):null;
      if(!r||!r.value)setShowOnboarding(true);}catch(e){setShowOnboarding(true);}
  })();},[entered]);
  const completeOnboarding=async function(){
    setShowOnboarding(false);
    try{if(window.storage)await window.storage.set("onboarding_done","1");}catch(e){}
  };
  const t=I18N[lang]||I18N.zh;

  if(!entered)return <ScrollLanding onEnter={()=>{setEntered(true);track("app_entered");}}/>;

  const dc=(function(){
    var seasonTint={spring:{bg:"#f8ece4",bg2:"#f0e0d4",accent:"#d07068"},
      summer:{bg:"#f0ece0",bg2:"#e8e4d4",accent:"#5a8a50"},
      autumn:{bg:"#f4ece0",bg2:"#ebe0d0",accent:"#c87040"},
      winter:{bg:"#eff0ee",bg2:"#e4e6e2",accent:"#6a8aaa"}};
    var st=seasonTint[cs]||seasonTint.spring;
    if(dark)return{bg:"#1a1612",bg2:"#221e18",text:"#e0d8c8",tl:"#8a7a68",accent:"#d07050",border:"#3a4a50"};
    return{bg:st.bg,bg2:st.bg2,text:C.text,tl:C.tl,accent:st.accent,border:C.border};
  })();

  return(<div style={{width:"100%",height:"100vh",minHeight:600,position:"relative",overflow:"hidden",
    background:"linear-gradient(155deg,"+dc.bg+","+dc.bg2+")"}} tabIndex={0}>
    <style>{`@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700;900&display=swap');
      @keyframes pulse{0%,100%{transform:translate(-50%,-50%) scale(1);opacity:0.35}50%{transform:translate(-50%,-50%) scale(1.5);opacity:0}}
      @keyframes shake{0%,100%{transform:translateX(0) rotate(0)}25%{transform:translateX(-4px) rotate(-4deg)}75%{transform:translateX(4px) rotate(4deg)}}
      @keyframes progress{0%{width:0;opacity:.5}50%{width:100%;opacity:1}100%{width:0;opacity:.5}}
      @keyframes playwave{0%,100%{transform:scaleY(1)}50%{transform:scaleY(1.6)}}
      @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
      *{box-sizing:border-box;margin:0;padding:0;font-family:'Noto Serif SC',serif}
      ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:rgba(128,128,128,.15);border-radius:2px}
      button{transition:all .15s ease}
      @media(hover:hover){button:hover:not(:disabled){transform:translateY(-1px);filter:brightness(1.08)}
        .hx-monthbtn:hover{background:rgba(192,96,64,.14)!important;color:#c06040!important;transform:scale(1.08)}}
      .hx-monthbtn:active{transform:scale(.95)}
      /* TABLET */
      @media(max-width:768px){
        .hx-title{font-size:13px!important}
        .hx-tabs button{font-size:11px!important;padding:3px 8px!important}
        .hx-filter button{font-size:11px!important;padding:4px 10px!important}
        .hx-region button{font-size:11px!important;padding:3px 6px!important}
        .hx-rank{width:140px!important}
        .hx-nearby{width:160px!important}
        .hx-banner{font-size:11px!important;max-width:92vw!important}
      }
      /* MOBILE */
      @media(max-width:480px){
        .hx-title{font-size:12px!important}
        .hx-tabs button{font-size:10px!important;padding:2px 6px!important}
        .hx-rank{display:none!important}
        .hx-wheel{width:160px!important}
        .hx-bookmark{transform:scale(.8)!important;transform-origin:right center!important}
        .hx-music-mini{bottom:65px!important;right:4px!important}
      }`}</style>

    {ez>1.5&&<><div style={{position:"absolute",left:0,top:0,bottom:0,width:8,zIndex:15,background:"linear-gradient(90deg,#b08858,#d4b088,#c8a070)"}}/>
      <div style={{position:"absolute",right:0,top:0,bottom:0,width:8,zIndex:15,background:"linear-gradient(90deg,#c8a070,#d4b088,#b08858)"}}/></>}

    <div ref={mapRef} onPointerDown={onPD} onPointerMove={onPM} onPointerUp={onPU} onPointerLeave={onPU}
      style={{position:"absolute",inset:0,cursor:ez>1.05||region!=="all"?(drag?"grabbing":"grab"):"default",touchAction:"none"}}>
      <div style={{position:"absolute",left:"50%",top:"50%",width:W,height:H,marginLeft:-W/2,marginTop:-H/2,
        transform:"scale("+ez+") translate("+tx/ez+"px,"+ty/ez+"px)",
        transition:drag?"none":"transform .4s cubic-bezier(.22,1,.36,1)",transformOrigin:"center center"}}>
        <svg viewBox={"0 0 "+W+" "+H} style={{width:"100%",height:"100%",position:"absolute"}}>
          {geo&&(geo.features||[geo]).map((f,i)=><path key={i} d={pathGen(f)||""} fill="#eee8dc" fillOpacity=".14"
            stroke={C.border} strokeWidth={((f.properties&&f.properties.name)?0.2:0.4)} strokeLinejoin="round"
            opacity={((f.properties&&f.properties.name)?0.18:0.36)}/>)}
          {rP.map((r,i)=>r.d&&<g key={"r"+i}><path d={r.d} fill="none" stroke={C.river} strokeWidth={r.w*1.2} strokeLinecap="round" opacity=".2"/>
            <path id={"rv"+i} d={r.d} fill="none"/><text fontSize="8" fill={C.river} opacity=".25" fontWeight="600">
              <textPath href={"#rv"+i} startOffset="35%">{r.n}</textPath></text></g>)}
          {mP.map((m,i)=>m.dd&&<g key={"m"+i}><path d={m.dd} fill="none" stroke={C.mtn} strokeWidth=".7" opacity=".1"
            strokeDasharray={m.d} strokeLinecap="round"/><path id={"mt"+i} d={m.dd} fill="none"/>
            <text fontSize="7" fill={C.mtn} opacity=".16" fontWeight="600"><textPath href={"#mt"+i} startOffset="25%">{m.n}</textPath></text></g>)}
          {page==="nearby"&&userLoc&&(()=>{const p=proj([userLoc.lon,userLoc.lat]);
            return p?<g><circle cx={p[0]} cy={p[1]} r="8" fill="#4a90d9" opacity=".2"/>
              <circle cx={p[0]} cy={p[1]} r="4" fill="#4a90d9" stroke="#fff" strokeWidth="1.5"/>
              <text x={p[0]+8} y={p[1]+3} fontSize="7" fill="#4a90d9" fontWeight="600">你的位置</text></g>:null;})()}
        </svg>
        {spots.map(s=>{const pos=sP.get(s.id);if(!pos)return null;
          return <MkMemo key={s.id} s={s} px={pos.x} py={pos.y} zoom={ez} onClick={()=>{setSel(s);track("spot_view",{spotId:s.id,species:s.sp});}} hl={page==="species"} fav={!!favs[s.id]} checked={!!checkins[s.id]}/>;
        })}
      </div>
    </div>

    <AlertBanner onGo={goToSpot} flora={flora}/>
    <MusicPlayer/>
    <NatureAmbient/>
    <ZoomControls wz={wz} setWz={setWz}/>

    {/* Title */}
    <div style={{position:"absolute",top:22,left:ez>1.5?12:3,zIndex:30}}>
      <div style={{display:"flex",alignItems:"center",gap:3}}>
        <div style={{width:32,height:32,borderRadius:"50%",background:"linear-gradient(135deg,"+C.accent+","+C.accent2+")",
          display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:10}}>風</div>
        <h1 style={{fontSize:16,fontWeight:900,color:C.text,letterSpacing:4}} className="hx-title">{t.title}</h1></div>
      {/* Search */}
      <div style={{display:"flex",alignItems:"center",gap:4,marginTop:4}}>
        <button onClick={()=>{setShowSearch(!showSearch);if(showSearch)setSearchQ("");}}
          style={{border:"none",background:"none",cursor:"pointer",fontSize:14,color:C.tl,padding:0}}>🔍</button>
        {showSearch&&<input value={searchQ} onChange={e=>{setSearchQ(e.target.value);if(e.target.value.length>=2)track("search",{q:e.target.value});}}
          placeholder="搜索景点或花种..."
          style={{border:"1px solid "+C.border+"33",background:"rgba(250,245,237,.95)",borderRadius:8,
            padding:"4px 10px",fontSize:13,color:C.text,width:160,outline:"none",
            fontFamily:"'Noto Serif SC',serif",letterSpacing:1}}/>}
        {searchQ&&<button onClick={()=>setSearchQ("")}
          style={{border:"none",background:"none",cursor:"pointer",fontSize:12,color:C.tl}}>{"×"}</button>}
      </div></div>

    {/* Page tabs */}
    <div style={{position:"absolute",top:50,right:8,zIndex:30,display:"flex",gap:1,background:"rgba(250,245,237,.92)",borderRadius:8,padding:"2px",boxShadow:"0 1px 4px rgba(0,0,0,.06)"}}>
      {[{k:"map",l:t.tab_map,ic:"🗺"},{k:"species",l:t.tab_species,ic:"🌺"},{k:"nearby",l:t.tab_nearby,ic:"📍"}].map(p=>(
        <button key={p.k} onClick={()=>{setPage(p.k);if(p.k==="nearby")requestLoc();}}
          style={{border:"none",borderRadius:6,padding:"5px 12px",cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",gap:3,
            background:page===p.k?C.accent+"22":"transparent",color:page===p.k?C.accent:C.tl,fontWeight:page===p.k?700:500}}>
          <span style={{fontSize:13}}>{p.ic}</span>{p.l}</button>))}
    </div>

    {/* Filter (map page) */}
    {page==="map"&&<div style={{position:"absolute",bottom:5,left:"50%",transform:"translateX(-50%)",zIndex:30,
      display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
      {(filter!=="current"&&!filter.startsWith("future"))&&<div style={{display:"flex",background:"rgba(250,245,237,.82)",borderRadius:7,padding:"1px",gap:1}}>
        {[{k:"all",l:"全部"},{k:"spring",l:"春"},{k:"summer",l:"夏"},{k:"autumn",l:"秋"},{k:"winter",l:"冬"}].map(m=>(
          <button key={m.k} onClick={()=>setFilter(m.k)} style={{border:"none",borderRadius:7,padding:"3px 8px",cursor:"pointer",fontSize:11,
            background:filter===m.k?((SM[m.k]||{c:C.accent}).c)+"18":"transparent",
            color:filter===m.k?(SM[m.k]||{c:C.accent}).c:"#aaa",fontWeight:filter===m.k?700:400}}>
            {(SM[m.k]||{i:"🌺"}).i}{m.l}</button>))}</div>}
      {filter.startsWith("future")&&<div style={{display:"flex",background:"rgba(250,245,237,.82)",borderRadius:7,padding:"1px",gap:1}}>
        {[{k:"future1",l:"1个月"},{k:"future3",l:"3个月"},{k:"future6",l:"半年"}].map(m=>(
          <button key={m.k} onClick={()=>setFilter(m.k)} style={{border:"none",borderRadius:7,padding:"3px 10px",cursor:"pointer",fontSize:11,
            background:filter===m.k?C.accent+"18":"transparent",color:filter===m.k?C.accent:"#aaa",fontWeight:filter===m.k?700:400}}>{m.l}</button>))}</div>}
      <div style={{display:"flex",background:"rgba(250,245,237,.88)",backdropFilter:"blur(6px)",borderRadius:10,padding:"1px",gap:1}}>
        <button onClick={()=>setFilter("current")} style={{border:"none",borderRadius:10,padding:"5px 14px",cursor:"pointer",fontSize:13,
          background:filter==="current"?SM[cs].c+"18":"transparent",color:filter==="current"?SM[cs].c:"#999",fontWeight:filter==="current"?700:400}}>
          {SM[cs].i}{t.current}</button>
        <button onClick={()=>setFilter(filter==="current"||filter.startsWith("future")?"all":filter)} style={{border:"none",borderRadius:10,padding:"5px 14px",cursor:"pointer",fontSize:13,
          background:!filter.startsWith("future")&&filter!=="current"?C.accent+"18":"transparent",
          color:!filter.startsWith("future")&&filter!=="current"?C.accent:"#999"}}>🗺{t.yearly}</button>
        <button onClick={()=>setFilter(filter.startsWith("future")?filter:"future1")} style={{border:"none",borderRadius:10,padding:"5px 14px",cursor:"pointer",fontSize:13,
          background:filter.startsWith("future")?"#5a8a5022":"transparent",color:filter.startsWith("future")?"#3a6a30":"#999"}}>🔮{t.future}</button>
        {Object.keys(favs).length>0&&<button onClick={()=>setFilter(filter==="favs"?"current":"favs")} style={{border:"none",borderRadius:10,padding:"5px 14px",cursor:"pointer",fontSize:13,
          background:filter==="favs"?"#e0605022":"transparent",color:filter==="favs"?"#e06050":"#999"}}>
          ♥{Object.keys(favs).length}</button>}
      </div></div>}

    {page==="species"&&<div style={{position:"absolute",bottom:5,left:"50%",transform:"translateX(-50%)",zIndex:30,
      display:"flex",background:"rgba(250,245,237,.85)",borderRadius:8,padding:"1px",gap:1}}>
      {[1,2,3,4,5,6,7,8,9,10,11,12].map(m=>{const has=FLORA.filter(f=>f.sp===selSp&&f.pk[0]<=m&&f.pk[1]>=m).length>0;
        return <button key={m} className={has?"hx-monthbtn":""} title={has?`${m}月盛开`:"此月无花"}
          style={{border:"none",borderRadius:7,padding:"3px 7px",fontSize:11,cursor:has?"pointer":"default",
          background:has?C.accent+"18":"transparent",color:has?C.accent:"#ddd",fontWeight:has?700:400}}>{m}月</button>;})}</div>}

    {page==="nearby"&&<div style={{position:"absolute",bottom:5,left:"50%",transform:"translateX(-50%)",zIndex:30,
      display:"flex",background:"rgba(250,245,237,.9)",borderRadius:8,padding:"2px",gap:2,flexWrap:"wrap",justifyContent:"center",maxWidth:"min(420px,88vw)"}}>
      {(()=>{const cm=new Date().getMonth()+1;const nm=cm===12?1:cm+1;const shortcuts=[
        {l:"本月",v:cm,t:`${cm}月当季`},{l:"下月",v:nm,t:`${nm}月即将盛开`},{l:"全年",v:0,t:"全部花期"}];
        return shortcuts.map(s=>(
          <button key={s.l} className="hx-monthbtn" title={s.t} onClick={()=>setNearbyMonth(s.v)}
            style={{border:"none",borderRadius:8,padding:"4px 10px",cursor:"pointer",fontSize:12,fontWeight:700,
            background:nearbyMonth===s.v?C.accent+"22":"transparent",color:nearbyMonth===s.v?C.accent:C.text,letterSpacing:2}}>
            {s.l}</button>));})()}
      <div style={{width:1,background:"#e0dcd4",margin:"2px 4px"}}></div>
      {[1,2,3,4,5,6,7,8,9,10,11,12].map(m=>(
        <button key={m} className="hx-monthbtn" title={m+"月花事"} onClick={()=>setNearbyMonth(m)}
          style={{border:"none",borderRadius:6,padding:"4px 7px",cursor:"pointer",fontSize:11,
          background:nearbyMonth===m?C.accent+"18":"transparent",color:nearbyMonth===m?C.accent:"#aaa"}}>{m}月</button>))}</div>}

    {/* Region nav - hidden in nearby mode */}
    {page==="map"&&<div style={{position:"absolute",left:ez>1.5?10:2,bottom:5,zIndex:30,display:"flex",flexDirection:"column",gap:1,
      background:"rgba(250,245,237,.82)",borderRadius:4,padding:"3px 2px"}}>
      {REGIONS.map(r=>(
        <button key={r.id} onClick={()=>{setRegion(r.id);if(r.id==="all"){setWz(1);setWc([104.5,35]);}}}
          style={{border:"none",borderRadius:3,padding:"4px 8px",cursor:"pointer",fontSize:13,fontWeight:region===r.id?800:500,
            background:region===r.id?C.accent+"18":"transparent",color:region===r.id?C.accent:C.tl,letterSpacing:2}}>{r.n}</button>))}
    </div>}

    {page==="species"&&<SpeciesWheel selected={selSp} onSelect={setSelSp} spots={displayFlora}/>}

    {page==="nearby"&&!userLoc&&<div style={{position:"absolute",inset:0,zIndex:40,display:"flex",alignItems:"center",justifyContent:"center",
      background:"rgba(0,0,0,.12)",backdropFilter:"blur(3px)"}}>
      <div style={{background:"#faf5ed",borderRadius:10,padding:"18px 22px",textAlign:"center",boxShadow:"0 4px 16px rgba(0,0,0,.08)",maxWidth:260}}>
        <div style={{fontSize:24,marginBottom:6}}>📍</div>
        <div style={{fontSize:12,fontWeight:700,color:C.text,marginBottom:3}}>获取你的位置</div>
        <div style={{fontSize:13,color:C.tl,marginBottom:12,lineHeight:1.4}}>推荐附近花事需要你的位置信息<br/>数据仅在本地使用</div>
        <button onClick={requestLoc} style={{border:"none",background:C.accent,color:"#fff",borderRadius:7,padding:"7px 18px",cursor:"pointer",fontSize:10,fontWeight:700}}>允许获取</button>
      </div></div>}

    {/* Nearby: scrollable list panel on left */}
    {page==="nearby"&&userLoc&&<NearbyPanel spots={spots} sel={sel} setSel={setSel} setWz={setWz} setWc={setWc} t={t}/>}

    {page==="map"&&(()=>{const li=spots.filter(s=>((s._st&&s._st.l)||0)>=2).sort((a,b)=>((b._st&&b._st.l)||0)-((a._st&&a._st.l)||0)).slice(0,8);
      if(!li.length)return null;
      return(<div style={{position:"absolute",right:3,top:44,zIndex:25,background:"rgba(250,245,237,.82)",
        borderRadius:4,padding:"4px 5px",maxHeight:"min(230px,36vh)",overflowY:"auto",width:180}}>
        <div style={{fontSize:10,color:C.tl,marginBottom:4,letterSpacing:2}}>{t.rank}</div>
        {li.map((s,i)=>(
          <div key={s.id} onClick={()=>setSel(s)} style={{display:"flex",alignItems:"center",gap:2,padding:"1.5px 0",cursor:"pointer"}}>
            <span style={{fontSize:11,fontWeight:700,color:i<3?C.accent:C.tl,width:8}}>{i+1}</span>
            <div style={{width:10,height:10,flexShrink:0}}><FI sp={s.sp} sz={10} co={s.c}/></div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:11,color:C.text,fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{s.n.split("·")[1]||s.n}</div>
              <div style={{fontSize:11,color:s.c}}>{(s._st?s._st.st:"")}{s._pred?" · 预测"+s._pred.dateStr:""}</div></div>
          </div>))}
      </div>);})()}

    {sel&&<Card s={sel} onClose={()=>{setSel(null);try{window.history.replaceState(null,"","#/");}catch(e){}}} isFav={!!favs[sel.id]} onFav={toggleFav}
      inTrip={trip.includes(sel.id)} onAddTrip={addToTrip}
      isChecked={checkins[sel.id]||false} onCheckin={doCheckin}
      isSubscribed={subs.includes(sel.id)} onToggleSub={toggleSub}
      onShowWiki={(sp)=>{setSel(null);setWikiSp(sp);}}/>}
    {showMood&&<MoodCard onClose={()=>setShowMood(false)}/>}

    {/* Trip planning floating button */}
    {trip.length>0&&!showTrip&&<button onClick={()=>setShowTrip(true)} style={{position:"absolute",bottom:60,right:8,zIndex:35,
      border:"none",borderRadius:20,padding:"6px 14px",cursor:"pointer",
      background:"rgba(58,138,96,.9)",color:"#fff",boxShadow:"0 2px 10px rgba(58,138,96,.3)",
      fontSize:12,fontWeight:600,display:"flex",alignItems:"center",gap:4,letterSpacing:1}}>
      🗺 行程({trip.length})</button>}

    {/* Trip planning panel */}
    {showTrip&&<div style={{position:"fixed",inset:0,zIndex:110,display:"flex",justifyContent:"flex-end",
      background:"rgba(0,0,0,.2)",backdropFilter:"blur(3px)"}} onClick={()=>setShowTrip(false)}>
      <div onClick={e=>e.stopPropagation()} style={{width:"min(380px,88vw)",height:"100vh",
        background:dark?"#221e18":"#faf6ef",overflowY:"auto",boxShadow:"-4px 0 20px rgba(0,0,0,.1)",
        padding:"20px 18px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <h2 style={{fontSize:20,fontWeight:800,color:dark?"#e0d8c8":C.text,letterSpacing:3,margin:0}}>🗺 行程规划</h2>
          <button onClick={()=>setShowTrip(false)} style={{border:"none",background:"none",cursor:"pointer",fontSize:18,color:C.tl}}>{"×"}</button>
        </div>

        {tripSpots.length===0&&<div style={{textAlign:"center",padding:"40px 0",color:C.tl}}>
          <div style={{fontSize:40,marginBottom:12}}>🌸</div>
          <div style={{fontSize:14,letterSpacing:2}}>还没有添加景点</div>
          <div style={{fontSize:12,marginTop:6,opacity:.6}}>在地图上点击景点 → "加入行程"</div>
        </div>}

        {tripSpots.map((s,i)=>{
          const nextS=tripSpots[i+1];
          const segDist=nextS?Math.round(distKm(s.lat,s.lon,nextS.lat,nextS.lon)):0;
          return(<div key={s.id}>
            <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 8px",
              background:dark?"rgba(255,255,255,.03)":"rgba(0,0,0,.02)",borderRadius:8,marginBottom:2}}>
              {/* Drag handle + number */}
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2,minWidth:24}}>
                <button onClick={()=>moveInTrip(s.id,-1)} disabled={i===0}
                  style={{border:"none",background:"none",cursor:i===0?"default":"pointer",fontSize:10,color:i===0?"#ddd":C.tl}}>▲</button>
                <span style={{fontSize:14,fontWeight:800,color:C.accent}}>{i+1}</span>
                <button onClick={()=>moveInTrip(s.id,1)} disabled={i===tripSpots.length-1}
                  style={{border:"none",background:"none",cursor:i===tripSpots.length-1?"default":"pointer",fontSize:10,
                    color:i===tripSpots.length-1?"#ddd":C.tl}}>▼</button>
              </div>
              {/* Flower icon */}
              <div style={{width:28,height:28,borderRadius:"50%",background:"rgba(255,255,255,.8)",
                border:"1.5px solid "+s.c+"55",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <FI sp={s.sp} sz={18} co={s.c}/></div>
              {/* Info */}
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:14,fontWeight:700,color:dark?"#e0d8c8":C.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{s.n}</div>
                <div style={{fontSize:11,color:s.c,display:"flex",gap:6}}>
                  <span>{s.sp}</span>
                  <span>{(s._pred?s._pred.dateStr:s.pk[0]+"月")}</span>
                  <span style={{color:C.tl}}>{s.rg}</span>
                </div>
              </div>
              {/* Remove */}
              <button onClick={()=>removeFromTrip(s.id)} style={{border:"none",background:"none",cursor:"pointer",
                fontSize:14,color:"#d04030",padding:4}}>×</button>
            </div>
            {/* Distance to next stop */}
            {nextS&&<div style={{display:"flex",alignItems:"center",gap:4,padding:"4px 0 4px 32px",color:C.tl,fontSize:11}}>
              <div style={{width:1,height:16,background:C.tl+"33"}}></div>
              <span>↓ {segDist}km · 约{segDist<100?"1小时":segDist<300?"2-3小时":segDist<600?"高铁3-4小时":"飞机"}</span>
            </div>}
          </div>);
        })}

        {tripSpots.length>0&&<>
          {/* Trip summary */}
          <div style={{margin:"14px 0",padding:"12px 14px",background:dark?"rgba(255,255,255,.04)":"#f5f0e8",borderRadius:8}}>
            <div style={{fontSize:13,color:dark?"#e0d8c8":C.text,display:"flex",justifyContent:"space-between"}}>
              <span>共 <strong>{tripSpots.length}</strong> 站</span>
              <span>全程约 <strong>{tripDist}</strong> km</span>
            </div>
            <div style={{fontSize:11,color:C.tl,marginTop:4}}>
              花种：{[...new Set(tripSpots.map(s=>s.sp))].join("、")}
            </div>
          </div>
          {/* Actions */}
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>{var text="花信风·行程规划\n"+tripSpots.map(function(s,i){return (i+1)+". "+s.n+" · "+s.sp+" · "+(s._pred?s._pred.dateStr:"");}).join("\n")+"\n全程约"+tripDist+"km";
              if(navigator.share)navigator.share({title:"花信风行程",text:text}).catch(function(){});
              else{navigator.clipboard.writeText(text);alert("已复制");}}}
              style={{flex:1,border:"1.5px solid #e0dcd4",background:dark?"#2a2620":"#faf6ef",borderRadius:8,
                padding:"10px",cursor:"pointer",fontSize:13,fontWeight:600,color:C.accent,letterSpacing:1}}>
              📤 分享行程</button>
            <button onClick={()=>{setTrip([]);setShowTrip(false);}}
              style={{border:"1.5px solid #e0dcd4",background:dark?"#2a2620":"#faf6ef",borderRadius:8,
                padding:"10px 14px",cursor:"pointer",fontSize:13,color:"#d04030"}}>
              清空</button>
          </div>
        </>}
      </div>
    </div>}
    {/* Mood card trigger - Bookmark style on left edge */}
    <button onClick={()=>setShowMood(true)} style={{position:"absolute",top:90,right:0,zIndex:31,
      border:"none",cursor:"pointer",padding:0,background:"transparent",
      filter:"drop-shadow(0 2px 6px rgba(200,160,80,.25))"}} title="每日花签·求一签">
      <svg width="42" height="58" viewBox="0 0 42 58">
        <defs><linearGradient id="bmgrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e8a850"/><stop offset="100%" stopColor="#c88830"/></linearGradient></defs>
        <path d="M2,0 L40,0 L40,56 L21,46 L2,56 Z" fill="url(#bmgrad)" stroke="#a87020" strokeWidth=".8"/>
        <path d="M6,4 L36,4 L36,40" fill="none" stroke="#fff8e8" strokeWidth=".5" opacity=".5"/>
        <text x="21" y="18" textAnchor="middle" fontSize="9" fill="#fff8e8" fontWeight="700" letterSpacing="2">花</text>
        <text x="21" y="32" textAnchor="middle" fontSize="9" fill="#fff8e8" fontWeight="700" letterSpacing="2">签</text>
      </svg>
    </button>
    {/* 24-Huaxin bookmark - second bookmark below */}
    <button onClick={()=>setShowHuaxin(true)} style={{position:"absolute",top:154,right:0,zIndex:31,
      border:"none",cursor:"pointer",padding:0,background:"transparent",
      filter:"drop-shadow(0 2px 6px rgba(80,120,100,.25))"}} title="二十四番花信风">
      <svg width="42" height="58" viewBox="0 0 42 58">
        <defs><linearGradient id="bmgrad2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#5a8a70"/><stop offset="100%" stopColor="#3a6b50"/></linearGradient></defs>
        <path d="M2,0 L40,0 L40,56 L21,46 L2,56 Z" fill="url(#bmgrad2)" stroke="#2a5a40" strokeWidth=".8"/>
        <path d="M6,4 L36,4 L36,40" fill="none" stroke="#e8f0e0" strokeWidth=".5" opacity=".5"/>
        <text x="21" y="18" textAnchor="middle" fontSize="9" fill="#e8f0e0" fontWeight="700" letterSpacing="2">花</text>
        <text x="21" y="32" textAnchor="middle" fontSize="9" fill="#e8f0e0" fontWeight="700" letterSpacing="2">信</text>
      </svg>
    </button>
    {showHuaxin&&<HuaxinPanel onClose={()=>setShowHuaxin(false)}
      onPickSpecies={(sp)=>{setSelSp(sp);setPage("species");}}
      onShowWiki={(sp)=>{setShowHuaxin(false);setWikiSp(sp);}}
      flora={flora}/>}
    {wikiSp&&<FlowerWiki sp={wikiSp} flora={flora} onClose={()=>setWikiSp(null)}
      onPickSpecies={(sp)=>{setSelSp(sp);setPage("species");}}/>}
    {/* Diary bookmark - third bookmark */}
    <button onClick={()=>setShowDiary(true)} style={{position:"absolute",top:218,right:0,zIndex:31,
      border:"none",cursor:"pointer",padding:0,background:"transparent",
      filter:"drop-shadow(0 2px 6px rgba(192,96,64,.25))"}} title="我的花历">
      <svg width="42" height="58" viewBox="0 0 42 58">
        <defs><linearGradient id="bmgrad3" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#c87050"/><stop offset="100%" stopColor="#a05030"/></linearGradient></defs>
        <path d="M2,0 L40,0 L40,56 L21,46 L2,56 Z" fill="url(#bmgrad3)" stroke="#804020" strokeWidth=".8"/>
        <path d="M6,4 L36,4 L36,40" fill="none" stroke="#f8e8d0" strokeWidth=".5" opacity=".5"/>
        <text x="21" y="18" textAnchor="middle" fontSize="9" fill="#f8e8d0" fontWeight="700" letterSpacing="2">花</text>
        <text x="21" y="32" textAnchor="middle" fontSize="9" fill="#f8e8d0" fontWeight="700" letterSpacing="2">历</text>
      </svg>
      {Object.keys(checkins).length>0&&<div style={{position:"absolute",top:-2,left:-4,
        width:18,height:18,borderRadius:"50%",background:"#c06040",color:"#fff",
        fontSize:10,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",
        border:"2px solid #faf6ef"}}>{Object.keys(checkins).length}</div>}
    </button>
    {showDiary&&<DiaryPanel onClose={()=>setShowDiary(false)} checkins={checkins} flora={flora} favs={favs}/>}
    {showCalendar&&<CalendarPanel onClose={()=>setShowCalendar(false)} flora={flora}/>}
    {showCrowd&&<CrowdPanel onClose={()=>setShowCrowd(false)} flora={flora}/>}
    {showPoem&&<PoemPanel onClose={()=>setShowPoem(false)} flora={flora}
      onGoSpot={function(s){setSel(s);setWz(5);setWc([s.lon,s.lat]);}}/>}
    {showAI&&<AIAssistant onClose={()=>setShowAI(false)} flora={flora} user={user}
      onGoSpot={function(s){setSel(s);setWz(5);setWc([s.lon,s.lat]);}}/>}
    {showRec&&<RecommendPanel onClose={()=>setShowRec(false)} flora={flora}
      checkins={checkins} favs={favs} userLoc={userLoc}
      onGoSpot={function(s){setSel(s);setWz(5);setWc([s.lon,s.lat]);}}/>}
    {showFeed&&<SocialFeed onClose={()=>setShowFeed(false)} flora={flora} user={user}/>}
    {showDash&&<DashboardPanel onClose={()=>setShowDash(false)} flora={flora} checkins={checkins} favs={favs}/>}
    {showDaily&&<DailyCheckin onClose={()=>setShowDaily(false)} user={user}/>}
    {showPuzzle&&<FlowerPuzzle onClose={()=>setShowPuzzle(false)} flora={flora} checkins={checkins}/>}
    {showSub&&<SubscriptionPanel onClose={()=>setShowSub(false)} flora={flora} favs={favs}/>}
    {showOnboarding&&<OnboardingGuide onComplete={completeOnboarding}/>}
    <SeasonalCampaign/>
    {showStreak&&<DailyStreakToast streak={streak} onClose={()=>setShowStreak(false)}/>}
    {/* Collapsible FAB menu - bottom left */}
    <div style={{position:"absolute",bottom:12,left:12,zIndex:30}}>
      {/* Expanded menu items */}
      {toolsOpen&&<div style={{marginBottom:8,display:"flex",flexDirection:"column",gap:6,
        animation:"fadeIn .2s"}}>
        {[
          {icon:"📊",label:"花事概览",desc:"全国花事数据",action:function(){setShowDash(true);setToolsOpen(false);}},
          {icon:"🌱",label:"每日签到",desc:"连续打开获奖励",action:function(){setShowDaily(true);setToolsOpen(false);}},
          {icon:"🧩",label:"百花拼图",desc:"收集72种花卉",action:function(){setShowPuzzle(true);setToolsOpen(false);}},
          {icon:"🔔",label:"花期提醒",desc:"订阅开花通知",action:function(){setShowSub(true);setToolsOpen(false);}},
          {icon:"🤖",label:"AI助手",desc:"智能赏花问答",action:function(){setShowAI(true);setToolsOpen(false);}},
          {icon:"✨",label:"为你推荐",desc:"个性化赏花地",action:function(){setShowRec(true);setToolsOpen(false);}},
          {icon:"🌺",label:"花事圈",desc:"分享与发现",action:function(){setShowFeed(true);setToolsOpen(false);}},
          {icon:"🗓",label:"花事日历",desc:"节气·花期·订阅",action:function(){setShowCalendar(true);setToolsOpen(false);}},
          {icon:"📡",label:"花讯播报",desc:"众包实况",action:function(){setShowCrowd(true);setToolsOpen(false);}},
          {icon:"📜",label:"诗词花事",desc:"千年诗句遇花事",action:function(){setShowPoem(true);setToolsOpen(false);}},
        ].map(function(btn,i){return(
          <button key={i} onClick={btn.action}
            style={{display:"flex",alignItems:"center",gap:10,
              border:"1px solid #e0dcd4",background:"rgba(250,245,237,.98)",borderRadius:12,
              padding:"10px 14px",cursor:"pointer",boxShadow:"0 2px 8px rgba(0,0,0,.08)",
              textAlign:"left",width:180}}>
            <span style={{fontSize:20}}>{btn.icon}</span>
            <div>
              <div style={{fontSize:12,fontWeight:700,color:"#2a2018",letterSpacing:1}}>{btn.label}</div>
              <div style={{fontSize:10,color:"#8a7a68"}}>{btn.desc}</div>
            </div>
          </button>);})}
      </div>}
      {/* FAB trigger button */}
      <button onClick={function(){setToolsOpen(!toolsOpen);}}
        style={{width:48,height:48,borderRadius:"50%",border:"none",cursor:"pointer",
          background:toolsOpen?"#2a2018":"linear-gradient(135deg,#c06040,#e0a040)",
          color:"#fff",fontSize:toolsOpen?18:22,fontWeight:700,
          boxShadow:"0 4px 16px rgba(192,96,64,.35)",
          display:"flex",alignItems:"center",justifyContent:"center",
          transition:"all .2s",transform:toolsOpen?"rotate(45deg)":"none"}}>
        {toolsOpen?"＋":"☰"}</button>
    </div>
    {/* Click outside to close tools */}
    {toolsOpen&&<div onClick={function(){setToolsOpen(false);}}
      style={{position:"absolute",inset:0,zIndex:29}}></div>}
    {/* User avatar or login button */}
    {user?<UserMenu user={user} onLogout={doLogout} onShowDiary={()=>setShowDiary(true)}/>:
      <button onClick={()=>setShowLogin(true)} style={{position:"absolute",top:12,right:50,zIndex:35,
        border:"1.5px solid #e0dcd4",background:"rgba(250,245,237,.95)",borderRadius:20,
        padding:"5px 14px",cursor:"pointer",fontSize:11,color:"#c06040",fontWeight:600,
        display:"flex",alignItems:"center",gap:4,boxShadow:"0 1px 4px rgba(0,0,0,.05)"}}>
        👤 登录</button>}
    {showLogin&&<LoginPanel onLogin={doLogin} onClose={()=>setShowLogin(false)}/>}
    {/* Dark mode toggle */}
    <button onClick={()=>setDark(!dark)} style={{position:"absolute",top:12,right:10,zIndex:31,
      border:"none",borderRadius:16,padding:"5px 10px",cursor:"pointer",
      background:dark?"rgba(40,35,28,.85)":"rgba(250,245,237,.92)",boxShadow:"0 1px 6px rgba(0,0,0,.05)",
      fontSize:12,color:dark?"#e0d8c8":C.tl}}>{dark?"☀":"🌙"}</button>
    {/* Language switcher - compact dropdown */}
    <LangSwitcher lang={lang} setLang={setLang} t={t} setShowGuide={setShowGuide}/>
    {showGuide&&<TravelGuide onClose={()=>setShowGuide(false)} lang={lang}/>}
  </div>);
}

// ═══ Language switcher (compact dropdown) ═══
function LangSwitcher({lang,setLang,t,setShowGuide}){
  const [open,setOpen]=useState(false);
  const langs=[{k:"zh",l:"中文",f:"🇨🇳"},{k:"en",l:"English",f:"🇺🇸"},{k:"ja",l:"日本語",f:"🇯🇵"},{k:"ko",l:"한국어",f:"🇰🇷"}];
  const cur=langs.find(x=>x.k===lang)||langs[0];
  return(<>
    <button onClick={()=>setOpen(!open)} style={{position:"absolute",top:55,left:12,zIndex:35,
      border:"1px solid #e0dcd4",background:"rgba(250,245,237,.95)",borderRadius:14,
      padding:"4px 10px",cursor:"pointer",fontSize:11,color:"#3a2818",letterSpacing:1,
      boxShadow:"0 1px 5px rgba(0,0,0,.06)",display:"flex",alignItems:"center",gap:4}}>
      {cur.f} <span style={{fontWeight:600}}>{cur.l}</span> <span style={{fontSize:9,color:"#8a7a68"}}>▾</span>
    </button>
    {open&&<div style={{position:"absolute",top:85,left:12,zIndex:36,
      background:"#faf6ef",borderRadius:10,padding:"4px",minWidth:140,
      boxShadow:"0 4px 20px rgba(0,0,0,.15)",border:"1px solid #e0dcd4"}}>
      {langs.map(x=>(
        <button key={x.k} onClick={()=>{setLang(x.k);setOpen(false);}}
          style={{display:"flex",alignItems:"center",gap:8,width:"100%",
            border:"none",background:lang===x.k?"#c06040"+"18":"transparent",
            borderRadius:6,padding:"8px 12px",cursor:"pointer",fontSize:12,
            color:lang===x.k?"#c06040":"#3a2818",fontWeight:lang===x.k?700:500,textAlign:"left"}}>
          <span style={{fontSize:14}}>{x.f}</span>{x.l}{lang===x.k&&<span style={{marginLeft:"auto",color:"#c06040"}}>✓</span>}
        </button>))}
      {lang!=="zh"&&<button onClick={()=>{setShowGuide(true);setOpen(false);}}
        style={{display:"flex",alignItems:"center",gap:8,width:"100%",
          border:"none",background:"transparent",borderRadius:6,padding:"8px 12px",
          cursor:"pointer",fontSize:12,color:"#c06040",fontWeight:600,textAlign:"left",
          borderTop:"1px solid #ece6dc",marginTop:4}}>
        🌏 {t.guide}</button>}
    </div>}
    {open&&<div onClick={()=>setOpen(false)} style={{position:"fixed",inset:0,zIndex:34}}/>}
  </>);
}
