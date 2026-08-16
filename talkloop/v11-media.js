/* TalkLoop v12.1 stable, language-separated and scene-matched media orchestration */
(function(){
'use strict';
const VERSION='12.1.0';
const px={
  social:'https://videos.pexels.com/video-files/8522987/8522987-hd_1080_1920_30fps.mp4',
  hotel:'https://videos.pexels.com/video-files/7820465/7820465-hd_1920_1080_25fps.mp4',
  jpOfficeA:'https://videos.pexels.com/video-files/7953565/7953565-hd_1920_1080_30fps.mp4',
  jpOfficeB:'https://videos.pexels.com/video-files/7643339/7643339-hd_1080_2048_25fps.mp4',
  jpOfficeC:'https://videos.pexels.com/video-files/7643438/7643438-hd_2048_1080_25fps.mp4',
  jpOfficeD:'https://videos.pexels.com/video-files/7643454/7643454-hd_2048_1080_25fps.mp4',
  jpOfficeE:'https://videos.pexels.com/video-files/7643614/7643614-hd_1080_2048_25fps.mp4',
  jpOfficeF:'https://videos.pexels.com/video-files/7844857/7844857-hd_1920_1080_30fps.mp4',
  jpHealthA:'https://videos.pexels.com/video-files/30141942/12925612_1920_1080_24fps.mp4',
  jpHealthB:'https://videos.pexels.com/video-files/8375762/8375762-hd_1080_2048_25fps.mp4',
  jpHotel:'https://videos.pexels.com/video-files/7820478/7820478-hd_1920_1080_25fps.mp4',
  jpTransit:'https://videos.pexels.com/video-files/17371342/17371342-hd_1920_1080_30fps.mp4',
  jpShopA:'https://videos.pexels.com/video-files/9015744/9015744-hd_1080_1920_24fps.mp4',
  jpShopB:'https://videos.pexels.com/video-files/9015583/9015583-hd_1080_1920_24fps.mp4',
  jpShopC:'https://videos.pexels.com/video-files/10901926/10901926-hd_1920_1080_30fps.mp4'
};
const mx=id=>`https://assets.mixkit.co/videos/${id}/${id}-720.mp4`;
const MX={
  jpTogether:mx(48085),
  jpRestaurantA:mx(51238),jpRestaurantB:mx(51239),jpRestaurantC:mx(51240),
  cafeA:mx(43247),cafeB:mx(43248),cafeC:mx(43249),cafeD:mx(43266),
  coworkers:mx(4872),meeting:mx(4547),meetingEnd:mx(4802),officeWalk:mx(315),
  callCenter:mx(4603),partners:mx(4813),walkTalk:mx(32744),podcast:mx(2948),
  broadcasters:mx(2952),phoneDiscuss:mx(319),teacherTalk:mx(50117),callMan:mx(28286),
  handshake:mx(30012),argue:mx(4504),groupTalk:mx(4788),coupleChat:mx(44540),
  gym:mx(4506),classTalk:mx(50129)
};

// 日语与英语候选完全分开。日语池按行为场景再分组，避免酒店、支付、
// 工作等表达仍重复播放同一组咖啡馆画面。标签描述训练语境，不根据外貌推断国籍。
const JP_SOCIAL=[
  MX.jpRestaurantA,MX.jpRestaurantB,MX.jpRestaurantC,
  MX.cafeA,MX.cafeB,MX.cafeC,MX.cafeD,px.jpOfficeA,px.jpOfficeB
];
const JP_DINING=[
  MX.jpRestaurantA,MX.jpRestaurantB,MX.jpRestaurantC,
  MX.cafeA,MX.cafeB,MX.cafeC,MX.cafeD
];
const JP_RETAIL=[px.jpShopA,px.jpShopB,px.jpShopC,MX.cafeA,MX.cafeB,MX.cafeC,MX.cafeD];
const JP_TRAVEL=[px.jpHotel,px.jpTransit,px.jpOfficeB];
const JP_WORK=[px.jpOfficeA,px.jpOfficeB,px.jpOfficeC,px.jpOfficeD,px.jpOfficeE,px.jpOfficeF];
const JP_HEALTH=[px.jpHealthA,px.jpHealthB];
const JP_BY_FAMILY={
  greeting:JP_SOCIAL,
  conversation:JP_SOCIAL,
  payment:JP_RETAIL,
  order:JP_DINING,
  shopping:JP_RETAIL,
  travel:JP_TRAVEL,
  phone:[px.jpOfficeA,px.jpOfficeB,px.jpHealthB],
  work:JP_WORK,
  health:JP_HEALTH,
  gym:[px.jpHealthA,px.jpHealthB,px.jpOfficeF],
  home:JP_SOCIAL,
  conflict:JP_WORK,
  social:JP_SOCIAL
};
const EN_SOCIAL=[
  MX.coworkers,MX.meeting,MX.partners,MX.walkTalk,MX.podcast,
  MX.groupTalk,MX.coupleChat,MX.handshake,px.social
];
const ACTION=[
  {k:'greeting',re:/wave|smile|greet|handshake|eye-contact|meet|laugh|listen|nod/i,en:[MX.handshake,MX.walkTalk,MX.coworkers,px.social]},
  {k:'conversation',re:/opinion|agree|disagree|evidence|example|explain|listen|talk|conversation|question|follow|network/i,en:[MX.coworkers,MX.podcast,MX.partners,MX.broadcasters,MX.walkTalk]},
  {k:'payment',re:/card|cash|visa|terminal|receipt|refund|fee|charge|pay|checkout|bank|transfer|withdraw|deposit/i,en:[MX.phoneDiscuss,MX.coworkers,MX.partners]},
  {k:'order',re:/coffee|cup|menu|food|drink|milk|water|bag|restaurant|cafe|order|dish|pizza/i,en:[MX.coupleChat,MX.groupTalk,MX.partners]},
  {k:'shopping',re:/size|color|try|shirt|item|shop|return|exchange|price|gift|package/i,en:[MX.phoneDiscuss,MX.partners,MX.coworkers]},
  {k:'travel',re:/train|station|platform|flight|airport|gate|boarding|luggage|passport|map|direction|hotel|taxi|bus/i,en:[MX.walkTalk,MX.phoneDiscuss,MX.partners,px.hotel]},
  {k:'phone',re:/phone|call|text|message|signal|battery|email|contact|linkedin/i,en:[MX.callMan,MX.phoneDiscuss,MX.callCenter]},
  {k:'work',re:/work|office|priority|deadline|project|meeting|supervisor|manager|task|team|laptop|assignment|class|teacher/i,en:[MX.meeting,MX.coworkers,MX.meetingEnd,MX.partners,MX.officeWalk,MX.classTalk]},
  {k:'health',re:/doctor|health|pain|sick|medicine|pharmacy|ambulance|headache|fever/i,en:[MX.callMan,MX.coworkers,MX.partners]},
  {k:'gym',re:/gym|workout|machine|weight|class|exercise|locker|shower|towel|training/i,en:[MX.gym,MX.coworkers,MX.classTalk]},
  {k:'home',re:/home|roommate|trash|dishes|router|cook|bed|neighbor|noise|building/i,en:[MX.coupleChat,MX.walkTalk,MX.phoneDiscuss]},
  {k:'conflict',re:/complaint|problem|wrong|damaged|blocked|stolen|lost|argue|mistake|sorry/i,en:[MX.argue,MX.callMan,MX.coworkers]},
  {k:'social',re:/.*/,en:EN_SOCIAL}
];

const SCENE_FAMILY={
  "greeting":"greeting",
  "intro":"greeting",
  "smalltalk":"social",
  "convenience":"payment",
  "cafe":"order",
  "restaurant":"order",
  "shopping":"shopping",
  "transport":"travel",
  "directions":"travel",
  "hotel":"travel",
  "health":"health",
  "work":"work",
  "message":"phone",
  "appointment":"work",
  "friends":"social",
  "invite":"social",
  "thanks":"greeting",
  "repair":"conflict",
  "service":"conflict",
  "help":"conflict",
  "emergency":"health",
  "airport":"travel",
  "neighbor":"home",
  "networking":"work",
  "gym":"gym",
  "roommate":"home",
  "date":"social",
  "class":"work",
  "deeper":"conversation",
  "bank":"payment"
};

function textOf(item){return [item.action,item.func,item.scene&&item.scene.id,item.scene&&item.scene.zh,item.en,item.jp].filter(Boolean).join(' ')}
function family(item){
  const sceneFamily=SCENE_FAMILY[item.scene&&item.scene.id];
  if(sceneFamily)return ACTION.find(a=>a.k===sceneFamily)||ACTION[ACTION.length-1];
  const t=textOf(item);
  for(const a of ACTION){if(a.k!=='social'&&a.re.test(t))return a}
  return ACTION[ACTION.length-1];
}
function unique(a){return [...new Set(a.filter(Boolean))]}
function pool(item,l){const f=family(item);return l==='jp'?unique(JP_BY_FAMILY[f.k]||JP_SOCIAL):unique(f.en)}

let dead=new Set();
try{dead=new Set(JSON.parse(sessionStorage.getItem('talkloop12-dead-media')||'[]'))}catch(_){dead=new Set()}
function markDead(src){dead.add(src);try{sessionStorage.setItem('talkloop12-dead-media',JSON.stringify([...dead]))}catch(_){}}
function livePool(item,l){const all=pool(item,l),live=all.filter(src=>!dead.has(src));return live.length?live:all}

window.TALKLOOP_MEDIA_SOURCES={
  version:VERSION,
  providers:['Mixkit','Pexels'],
  actionFamilies:ACTION.map(x=>x.k),
  mappedScenes:Object.keys(SCENE_FAMILY).length,
  japaneseSceneFamilies:Object.keys(JP_BY_FAMILY).length,
  japaneseInteractionVideos:unique(Object.values(JP_BY_FAMILY).flat()).length,
  englishVideos:unique(ACTION.flatMap(x=>x.en)).length
};
window.pools=pool;

const recentByLanguage={en:[],jp:[]};
function rotate(values,seed){
  if(values.length<2)return values;
  const n=seed%values.length;
  return [...values.slice(n),...values.slice(0,n)];
}
function orderedCandidates(item,l,previousSrc,seed){
  const all=livePool(item,l),avoid=new Set([previousSrc,...recentByLanguage[l]].filter(Boolean));
  return [...rotate(all.filter(src=>!avoid.has(src)),seed),...rotate(all.filter(src=>avoid.has(src)),seed)];
}
function rememberSource(l,src){
  recentByLanguage[l]=[src,...recentByLanguage[l].filter(value=>value!==src)].slice(0,3);
}

window.prepareNext=function(item,l){
  const p=livePool(item,l);if(p.length<2)return;
  st.vis=st.vis||{};
  const key=item.id+'|'+l,visit=(st.vis[key]||0)+1,seed=hash(key+'|'+visit+'|render|v12');
  warm(p[seed%p.length]);
};

function clearVideo(v){
  if(v._tlTimer)clearTimeout(v._tlTimer);
  if(v._tlRevealTimer)clearTimeout(v._tlRevealTimer);
  v._tlToken=(v._tlToken||0)+1;
  v._tlJumping=false;
  v.onloadedmetadata=v.onloadeddata=v.oncanplay=v.onseeked=v.onerror=v.ontimeupdate=v.onended=null;
  try{v.pause()}catch(_){}
}
window.stopMedia=clearVideo;

window.remix=function(item,v,ph,l=lang,reason='auto',shadeId){
  const previousSrc=v.currentSrc||v.src||'';
  clearVideo(v);
  const token=v._tlToken,p=livePool(item,l),scene=v.closest('.scene');
  const shade=shadeId?$(shadeId):scene.querySelector('.mediaShade');
  const key=item.id+'|'+l;
  st.vis=st.vis||{};st.vis[key]=(st.vis[key]||0)+1;save();
  const visit=st.vis[key],seed=hash(key+'|'+visit+'|'+reason+'|v12');
  let attempt=0;

  ph.style.backgroundImage=`url('${item.scene.img}')`;
  ph.style.display='block';ph.style.opacity='1';v.style.opacity='0';
  scene.classList.remove('video-ready');scene.classList.add('loading');scene.setAttribute('aria-busy','true');
  if(shade){shade.style.display='grid';const label=shade.querySelector('span');if(label)label.textContent=''}

  const detach=()=>{
    if(v._tlTimer)clearTimeout(v._tlTimer);
    if(v._tlRevealTimer)clearTimeout(v._tlRevealTimer);
    v.onloadedmetadata=v.onloadeddata=v.oncanplay=v.onseeked=v.onerror=v.ontimeupdate=v.onended=null;
  };
  const fallback=()=>{
    if(v._tlToken!==token)return;detach();
    scene.classList.remove('loading','video-ready');scene.setAttribute('aria-busy','false');
    v.style.opacity='0';ph.style.opacity='1';if(shade)shade.style.display='none';
  };
  const advance=()=>{
    if(v._tlToken!==token||v._tlJumping)return;
    const dur=Number.isFinite(v.duration)?v.duration:0,len=v._len||4;
    if(!dur)return;
    v._tlJumping=true;
    const room=Math.max(0,dur-len-.2);
    const next=room>1?((v._s||0)+len+1)%room:0;
    v._s=next;
    try{v.currentTime=next;v.play().catch(()=>{})}catch(_){}
    setTimeout(()=>{v._tlJumping=false},260);
  };
  const trySource=()=>{
    if(v._tlToken!==token)return;detach();
    const candidates=orderedCandidates(item,l,previousSrc,seed);
    if(!candidates.length||attempt>=Math.min(5,candidates.length))return fallback();
    const src=candidates[attempt%candidates.length];attempt++;
    let revealed=false;
    const fail=()=>{
      if(v._tlToken!==token||revealed)return;
      markDead(src);trySource();
    };
    const reveal=()=>{
      if(v._tlToken!==token||revealed)return;
      revealed=true;if(v._tlTimer)clearTimeout(v._tlTimer);
      scene.classList.remove('loading');scene.classList.add('video-ready');scene.setAttribute('aria-busy','false');
      scene.dataset.mediaProvider=src.includes('pexels.com')?'pexels':'mixkit';
      scene.dataset.mediaFamily=family(item).k;
      scene.dataset.mediaLanguage=l;
      v.style.opacity='1';ph.style.opacity='0';if(shade)shade.style.display='none';
      v.ontimeupdate=()=>{if(v.currentTime>=(v._s||0)+(v._len||4)-.08)advance()};
      v.onended=advance;
      rememberSource(l,src);v.play().catch(()=>{});window.prepareNext(item,l);window.prepareNext(item,l==='en'?'jp':'en');
    };
    const frameReady=()=>{
      if(v._tlToken!==token||revealed)return;
      const dur=Number.isFinite(v.duration)?v.duration:0;
      const len=Math.max(3,Math.min(7,3+(seed%5),dur||7));
      v._s=0;v._len=len;reveal();
    };
    v.src=src;v.preload='auto';v.muted=true;v.playsInline=true;v.poster='';
    v.onloadeddata=frameReady;v.oncanplay=frameReady;v.onerror=fail;
    v._tlTimer=setTimeout(fail,4200);
    try{v.load()}catch(_){fail()}
  };
  trySource();
  mediaState.set(v,{pool:p,family:family(item).k,language:l,token});
};

const oldAudit=window.renderAudit;
window.renderAudit=function(){
  oldAudit&&oldAudit();const n=$('audit'),m=window.TALKLOOP_MEDIA_SOURCES;
  if(n)n.insertAdjacentHTML('beforeend',`<div class="tip mediaAudit" style="margin-top:10px"><b>视频链路</b><br>${m.providers.length} 个公共素材站 · 英语 ${m.englishVideos} 条候选 · 日语 ${m.japaneseInteractionVideos} 条候选 / ${m.japaneseSceneFamilies} 类场景映射。英日物理分池并连续去重；失效地址会在本次会话中隔离，首帧就绪前保留封面，不显示黑屏。</div>`);
};
})();
