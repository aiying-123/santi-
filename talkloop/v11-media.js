/* TalkLoop v12 stable, language-separated media orchestration */
(function(){
'use strict';
const VERSION='12.0.2';
const px={
  social:'https://videos.pexels.com/video-files/8522987/8522987-hd_1080_1920_30fps.mp4',
  hotel:'https://videos.pexels.com/video-files/7820465/7820465-hd_1920_1080_25fps.mp4'
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

// 日语与英语候选完全分开。标签描述语言/互动语境，不根据外貌推断人物国籍。
const JP_INTERACTION=[
  MX.jpTogether,MX.jpRestaurantA,MX.jpRestaurantB,MX.jpRestaurantC,
  MX.cafeA,MX.cafeB,MX.cafeC,MX.cafeD
];
const EN_SOCIAL=[
  MX.coworkers,MX.meeting,MX.partners,MX.walkTalk,MX.podcast,
  MX.groupTalk,MX.coupleChat,MX.handshake,px.social
];
const ACTION=[
  {k:'greeting',re:/wave|smile|greet|handshake|eye-contact|meet|laugh|listen|nod/i,en:[MX.handshake,MX.walkTalk,MX.coworkers,px.social]},
  {k:'conversation',re:/opinion|agree|disagree|evidence|example|explain|listen|talk|conversation|question|follow|network/i,en:[MX.coworkers,MX.podcast,MX.partners,MX.broadcasters,MX.walkTalk]},
  {k:'payment',re:/card|cash|visa|terminal|receipt|refund|fee|charge|pay|checkout|bank|transfer|withdraw|deposit/i,en:[MX.phoneDiscuss,MX.coworkers,MX.partners]},
  {k:'order',re:/coffee|cup|menu|food|drink|milk|water|bag|restaurant|cafe|order|dish|pizza/i,en:[MX.cafeB,MX.coupleChat,MX.groupTalk]},
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

function textOf(item){return [item.action,item.func,item.scene&&item.scene.id,item.scene&&item.scene.zh,item.en,item.jp].filter(Boolean).join(' ')}
function family(item){const t=textOf(item);for(const a of ACTION){if(a.k!=='social'&&a.re.test(t))return a}return ACTION[ACTION.length-1]}
function unique(a){return [...new Set(a.filter(Boolean))]}
function pool(item,l){return l==='jp'?unique(JP_INTERACTION):unique(family(item).en)}

let dead=new Set();
try{dead=new Set(JSON.parse(sessionStorage.getItem('talkloop12-dead-media')||'[]'))}catch(_){dead=new Set()}
function markDead(src){dead.add(src);try{sessionStorage.setItem('talkloop12-dead-media',JSON.stringify([...dead]))}catch(_){}}
function livePool(item,l){const all=pool(item,l),live=all.filter(src=>!dead.has(src));return live.length?live:all}

window.TALKLOOP_MEDIA_SOURCES={
  version:VERSION,
  providers:['Mixkit','Pexels'],
  actionFamilies:ACTION.map(x=>x.k),
  japaneseInteractionVideos:JP_INTERACTION.length,
  englishVideos:unique(ACTION.flatMap(x=>x.en)).length
};
window.pools=pool;

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
    const candidates=livePool(item,l);
    if(!candidates.length||attempt>=Math.min(5,candidates.length))return fallback();
    const src=candidates[(seed+attempt)%candidates.length];attempt++;
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
      v.style.opacity='1';ph.style.opacity='0';if(shade)shade.style.display='none';
      v.ontimeupdate=()=>{if(v.currentTime>=(v._s||0)+(v._len||4)-.08)advance()};
      v.onended=advance;
      v.play().catch(()=>{});window.prepareNext(item,l);window.prepareNext(item,l==='en'?'jp':'en');
    };
    const frameReady=()=>{
      if(v._tlToken!==token||revealed)return;
      const dur=Number.isFinite(v.duration)?v.duration:0;
      const len=Math.max(3,Math.min(7,3+(seed%5),dur||7));
      const room=Math.max(0,dur-len-.2),start=room?((seed+(item.pi||0)*1.7)%room):0;
      v._s=start;v._len=len;
      if(start>.15&&Math.abs(v.currentTime-start)>.3){
        v.onseeked=reveal;
        try{v.currentTime=start}catch(_){reveal()}
        v._tlRevealTimer=setTimeout(reveal,650);
      }else reveal();
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
  if(n)n.insertAdjacentHTML('beforeend',`<div class="tip mediaAudit" style="margin-top:10px"><b>视频链路</b><br>${m.providers.length} 个公共素材站 · 英语 ${m.englishVideos} 条候选 · 日语互动 ${m.japaneseInteractionVideos} 条候选。英日候选物理分池；失效地址会在本次会话中隔离，首帧就绪前保留封面，不显示黑屏。</div>`);
};
})();
