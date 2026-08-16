/* TalkLoop v11 resilient multi-source media orchestration */
(function(){
'use strict';
const PX={
 social1:'https://videos.pexels.com/video-files/8522987/8522987-hd_1080_1920_30fps.mp4',
 social2:'https://videos.pexels.com/video-files/6602066/6602066-hd_1080_1920_25fps.mp4',
 social3:'https://videos.pexels.com/video-files/5971791/5971791-uhd_2160_4096_25fps.mp4',
 retail1:'https://videos.pexels.com/video-files/9046237/9046237-uhd_2160_3840_24fps.mp4',
 retail2:'https://videos.pexels.com/video-files/9046233/9046233-hd_1080_1920_25fps.mp4',
 retail3:'https://videos.pexels.com/video-files/8554081/8554081-hd_1080_1920_25fps.mp4',
 travel1:'https://videos.pexels.com/video-files/8553596/8553596-uhd_2160_3840_24fps.mp4',
 hotel1:'https://videos.pexels.com/video-files/7820465/7820465-hd_1920_1080_25fps.mp4',
 work1:'https://videos.pexels.com/video-files/10373944/10373944-hd_1080_1920_25fps.mp4',
 health1:'https://videos.pexels.com/video-files/30141938/12927309_1080_1920_30fps.mp4',
 jpCafe:'https://videos.pexels.com/video-files/12893501/12893501-hd_1080_1920_25fps.mp4'
};
const MX={
 cafeWomen1:'https://assets.mixkit.co/videos/43247/43247-720.mp4',
 cafeWomen2:'https://assets.mixkit.co/videos/43248/43248-720.mp4',
 cafeWomen3:'https://assets.mixkit.co/videos/43249/43249-720.mp4',
 cafeWomen4:'https://assets.mixkit.co/videos/43266/43266-720.mp4',
 womanOfficeCall:'https://assets.mixkit.co/videos/44785/44785-720.mp4',
 womanOffice:'https://assets.mixkit.co/videos/1803/1803-720.mp4',
 womanPhone:'https://assets.mixkit.co/videos/4909/4909-720.mp4',
 coworkers:'https://assets.mixkit.co/videos/4872/4872-720.mp4',
 meeting:'https://assets.mixkit.co/videos/4547/4547-720.mp4',
 meetingEnd:'https://assets.mixkit.co/videos/4802/4802-720.mp4',
 officeWalk:'https://assets.mixkit.co/videos/315/315-720.mp4',
 callCenter:'https://assets.mixkit.co/videos/4603/4603-720.mp4',
 partners:'https://assets.mixkit.co/videos/4813/4813-720.mp4',
 walkTalk:'https://assets.mixkit.co/videos/32744/32744-720.mp4',
 podcast:'https://assets.mixkit.co/videos/2948/2948-720.mp4',
 broadcasters:'https://assets.mixkit.co/videos/2952/2952-720.mp4',
 phoneDiscuss:'https://assets.mixkit.co/videos/319/319-720.mp4',
 teacherTalk:'https://assets.mixkit.co/videos/50117/50117-720.mp4',
 phoneConcern:'https://assets.mixkit.co/active_storage/video_items/100325/1722991266/100325-video-720.mp4',
 callMan:'https://assets.mixkit.co/videos/28286/28286-720.mp4',
 handshake:'https://assets.mixkit.co/videos/30012/30012-720.mp4',
 argue:'https://assets.mixkit.co/videos/4504/4504-720.mp4',
 groupTalk:'https://assets.mixkit.co/videos/4788/4788-720.mp4',
 coupleChat:'https://assets.mixkit.co/videos/44540/44540-720.mp4',
 gym:'https://assets.mixkit.co/videos/4506/4506-720.mp4',
 classTalk:'https://assets.mixkit.co/videos/50129/50129-720.mp4'
};
const JP_WOMEN=[MX.cafeWomen1,MX.cafeWomen2,MX.cafeWomen3,MX.cafeWomen4,PX.jpCafe,MX.womanOfficeCall,MX.womanOffice,MX.womanPhone];
const EN_SOCIAL=[MX.coworkers,MX.meeting,MX.partners,MX.walkTalk,MX.podcast,MX.groupTalk,MX.coupleChat,PX.social1,PX.social2];
const ACTION=[
 {k:'greeting',re:/wave|smile|greet|handshake|eye-contact|meet|laugh|listen|nod/i,en:[MX.handshake,MX.walkTalk,MX.coworkers,PX.social1],jp:JP_WOMEN},
 {k:'conversation',re:/opinion|agree|disagree|evidence|example|explain|listen|talk|conversation|question|follow|network/i,en:[MX.coworkers,MX.podcast,MX.partners,MX.broadcasters,MX.walkTalk],jp:JP_WOMEN},
 {k:'payment',re:/card|cash|visa|terminal|receipt|refund|fee|charge|pay|checkout|bank|transfer|withdraw|deposit/i,en:[PX.retail1,PX.retail2,MX.phoneDiscuss],jp:[PX.retail2,MX.cafeWomen4,MX.womanOffice,...JP_WOMEN]},
 {k:'order',re:/coffee|cup|menu|food|drink|milk|water|bag|restaurant|cafe|order|dish|pizza/i,en:[PX.retail2,PX.retail3,MX.cafeWomen2,MX.coupleChat],jp:[MX.cafeWomen1,MX.cafeWomen2,MX.cafeWomen3,PX.jpCafe]},
 {k:'shopping',re:/size|color|try|shirt|item|shop|return|exchange|price|gift|package/i,en:[PX.retail3,PX.retail1,MX.phoneDiscuss],jp:[MX.cafeWomen4,MX.womanPhone,PX.retail3,...JP_WOMEN]},
 {k:'travel',re:/train|station|platform|flight|airport|gate|boarding|luggage|passport|map|direction|hotel|taxi|bus/i,en:[PX.travel1,PX.hotel1,MX.walkTalk,MX.phoneDiscuss],jp:[MX.cafeWomen4,MX.womanPhone,PX.travel1,...JP_WOMEN]},
 {k:'phone',re:/phone|call|text|message|signal|battery|email|contact|linkedin/i,en:[MX.phoneConcern,MX.callMan,MX.phoneDiscuss,PX.work1],jp:[MX.womanPhone,MX.womanOfficeCall,MX.cafeWomen4,PX.jpCafe]},
 {k:'work',re:/work|office|priority|deadline|project|meeting|supervisor|manager|task|team|laptop|assignment|class|teacher/i,en:[MX.meeting,MX.coworkers,MX.meetingEnd,MX.partners,MX.officeWalk,MX.classTalk,PX.work1],jp:[MX.womanOffice,MX.womanOfficeCall,MX.cafeWomen4,MX.coworkers,...JP_WOMEN]},
 {k:'health',re:/doctor|health|pain|sick|medicine|pharmacy|ambulance|headache|fever/i,en:[PX.health1,MX.phoneConcern,MX.coworkers],jp:[MX.womanOfficeCall,MX.cafeWomen4,PX.health1,...JP_WOMEN]},
 {k:'gym',re:/gym|workout|machine|weight|class|exercise|locker|shower|towel|training/i,en:[MX.gym,MX.coworkers],jp:[MX.cafeWomen4,MX.womanOffice,MX.gym,...JP_WOMEN]},
 {k:'home',re:/home|roommate|trash|dishes|router|cook|bed|neighbor|noise|building/i,en:[MX.coupleChat,MX.walkTalk,MX.phoneDiscuss],jp:[MX.cafeWomen1,MX.cafeWomen4,MX.womanPhone,...JP_WOMEN]},
 {k:'conflict',re:/complaint|problem|wrong|damaged|blocked|stolen|lost|argue|mistake|sorry/i,en:[MX.argue,MX.phoneConcern,MX.coworkers],jp:[MX.womanOfficeCall,MX.cafeWomen4,MX.womanPhone,...JP_WOMEN]},
 {k:'social',re:/.*/,en:EN_SOCIAL,jp:JP_WOMEN}
];
function txt(item){return [item.action,item.func,item.scene&&item.scene.id,item.scene&&item.scene.zh,item.en,item.jp].filter(Boolean).join(' ')}
function family(item){const t=txt(item);for(const a of ACTION){if(a.k==='social')continue;if(a.re.test(t))return a}return ACTION[ACTION.length-1]}
function pool(item,l){const a=family(item);return [...new Set((l==='jp'?a.jp:a.en).filter(Boolean))]}
window.TALKLOOP_MEDIA_SOURCES={version:'11.0.0',providers:['Pexels','Mixkit'],actionFamilies:ACTION.map(x=>x.k),jpWomenPool:JP_WOMEN.length};
window.pools=pool;
window.prepareNext=function(item,l){const p=pool(item,l);const visit=st.vis[item.id+'|'+l]||0,seed=hash(item.id+'|'+l+'|v11warm|'+visit);for(let i=0;i<Math.min(4,p.length);i++)warm(p[(seed+i)%p.length])};
window.remix=function(item,v,ph,l=lang,reason='auto',shadeId){
  stopMedia(v);const p=pool(item,l),scene=v.closest('.scene'),shade=shadeId?$(shadeId):scene.querySelector('.mediaShade'),k=item.id+'|'+l;st.vis[k]=(st.vis[k]||0)+1;save();const seed=hash(k+'|'+st.vis[k]+'|'+reason+'|v11');let attempt=0;ph.style.backgroundImage=`url('${item.scene.img}')`;ph.style.display='block';ph.style.opacity='1';v.style.opacity='0';scene.classList.remove('video-ready');scene.classList.add('loading');if(shade){shade.style.display='grid';shade.querySelector('span')&&(shade.querySelector('span').textContent='')}
  const cleanup=()=>{if(v._tlTimer)clearTimeout(v._tlTimer);v.onloadeddata=v.oncanplay=v.onerror=v.ontimeupdate=null};
  const fallback=()=>{cleanup();scene.classList.remove('loading');scene.classList.remove('video-ready');v.style.opacity='0';ph.style.opacity='1';if(shade)shade.style.display='none'};
  const trySource=()=>{
    cleanup();if(attempt>=Math.min(p.length,5))return fallback();const src=p[(seed+attempt)%p.length];attempt++;warm(src);v.src=src;v.preload='auto';v.muted=true;v.playsInline=true;v.poster=item.scene.img;
    let ready=false;const onReady=()=>{if(ready)return;ready=true;if(v._tlTimer)clearTimeout(v._tlTimer);const dur=isFinite(v.duration)?v.duration:0,clip=4+(seed%4),base=(seed%12)+((item.pi||0)%5)*1.1,maxStart=Math.max(0,dur-clip-.15),start=Math.min(base,maxStart);v._s=start;v._len=Math.min(7,Math.max(4,Math.min(clip,dur||clip)));try{v.currentTime=start}catch(e){}scene.classList.remove('loading');scene.classList.add('video-ready');v.style.opacity='1';ph.style.opacity='0';if(shade)shade.style.display='none';v.play().catch(()=>{});window.prepareNext(item,l)};
    v.onloadeddata=onReady;v.oncanplay=onReady;v.onerror=trySource;v._tlTimer=setTimeout(()=>{if(!ready)trySource()},1350);v.ontimeupdate=()=>{if(ready&&v.currentTime>=(v._s||0)+(v._len||5)-.08){window.remix(item,v,ph,l,'segment',shadeId)}};try{v.load()}catch(e){trySource()}
  };trySource();mediaState.set(v,{pool:p,family:family(item).k});
};
const oldAudit=window.renderAudit;window.renderAudit=function(){oldAudit&&oldAudit();const n=$('audit');if(n)n.insertAdjacentHTML('beforeend',`<div class="tip" style="margin-top:10px"><b>素材层</b><br>当前使用 Pexels + Mixkit 两个可直接播放的公共素材源；日语模式独立使用女性互动池。素材发现同时扩展到 Pixabay，但网页端只接入可稳定直连的视频源，避免下载页重定向造成黑屏。</div>`)};
try{render();refresh();}catch(e){console.warn('TalkLoop v11 media bootstrap',e)}
})();
