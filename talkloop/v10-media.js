/* TalkLoop v10 media orchestration: expression -> intent -> action -> video pool */
(function(){
  'use strict';
  const URL={
    socialA:'https://videos.pexels.com/video-files/8522987/8522987-hd_1080_1920_30fps.mp4',
    socialB:'https://videos.pexels.com/video-files/6602066/6602066-hd_1080_1920_25fps.mp4',
    socialC:'https://videos.pexels.com/video-files/5971791/5971791-uhd_2160_4096_25fps.mp4',
    retailA:'https://videos.pexels.com/video-files/9046237/9046237-uhd_2160_3840_24fps.mp4',
    retailB:'https://videos.pexels.com/video-files/9046233/9046233-hd_1080_1920_25fps.mp4',
    retailC:'https://videos.pexels.com/video-files/8554081/8554081-hd_1080_1920_25fps.mp4',
    travelA:'https://videos.pexels.com/video-files/8553596/8553596-uhd_2160_3840_24fps.mp4',
    hotelA:'https://videos.pexels.com/video-files/7820465/7820465-hd_1920_1080_25fps.mp4',
    workA:'https://videos.pexels.com/video-files/10373944/10373944-hd_1080_1920_25fps.mp4',
    healthA:'https://videos.pexels.com/video-files/30141938/12927309_1080_1920_30fps.mp4',
    jpA:'https://videos.pexels.com/video-files/12893501/12893501-hd_1080_1920_25fps.mp4',
    jpB:'https://videos.pexels.com/video-files/9046233/9046233-hd_1080_1920_25fps.mp4',
    jpC:'https://videos.pexels.com/video-files/6540258/6540258-hd_1080_1920_25fps.mp4',
    jpD:'https://videos.pexels.com/video-files/10373944/10373944-hd_1080_1920_25fps.mp4'
  };
  const FAMILIES=[
    {key:'greet', re:/wave|smile|eye-contact|handshake|nod|laugh|listen|greet|hello|meet/i, scenes:['greeting','intro','friends','smalltalk','thanks'], en:[URL.socialA,URL.socialB,URL.socialC], jp:[URL.jpA,URL.jpC,URL.jpD], window:[0,18]},
    {key:'payment', re:/card|pay|terminal|receipt|cash|visa|tap|bill|change|checkout|counter/i, scenes:['convenience','restaurant'], en:[URL.retailA,URL.retailB,URL.retailC], jp:[URL.jpB,URL.retailA,URL.jpA], window:[2,22]},
    {key:'order', re:/coffee|cup|menu|order|food|drink|recommend|takeaway|bag/i, scenes:['cafe','restaurant','convenience'], en:[URL.retailB,URL.retailC,URL.socialC], jp:[URL.jpA,URL.jpB,URL.retailC], window:[0,20]},
    {key:'shopping', re:/try|size|color|wear|price|shop|clothes|item|show/i, scenes:['shopping'], en:[URL.retailC,URL.retailA,URL.socialB], jp:[URL.jpB,URL.retailC,URL.jpA], window:[1,24]},
    {key:'travel', re:/train|station|transfer|map|turn|direction|line|ticket|platform|luggage|check-in|reservation/i, scenes:['transport','directions','hotel'], en:[URL.travelA,URL.hotelA,URL.socialB], jp:[URL.jpC,URL.hotelA,URL.jpA], window:[0,28]},
    {key:'phone', re:/phone|text|message|call|battery|screen/i, scenes:['message'], en:[URL.workA,URL.socialB], jp:[URL.jpD,URL.jpC], window:[0,18]},
    {key:'health', re:/doctor|head|pain|pharmacy|medicine|feel|sick|ambulance/i, scenes:['health','emergency'], en:[URL.healthA,URL.workA], jp:[URL.jpD,URL.healthA], window:[0,20]},
    {key:'work', re:/work|priority|step|laptop|meeting|talk|confirm|help|repeat|mean|slow/i, scenes:['work','repair','help'], en:[URL.workA,URL.socialC,URL.socialB], jp:[URL.jpD,URL.jpC,URL.jpA], window:[0,24]},
    {key:'plan', re:/time|clock|calendar|tomorrow|tonight|free|plan|invite|dinner/i, scenes:['appointment','invite'], en:[URL.socialA,URL.socialB,URL.workA], jp:[URL.jpA,URL.jpC,URL.jpD], window:[0,22]},
    {key:'social', re:/.*/, scenes:[], en:[URL.socialA,URL.socialB,URL.socialC], jp:[URL.jpA,URL.jpC,URL.jpD], window:[0,20]}
  ];
  function compactText(item){return [item.action,item.func,item.scene&&item.scene.id,item.scene&&item.scene.zh,item.en,item.jp].filter(Boolean).join(' ')}
  function familyFor(item){const text=compactText(item);for(const f of FAMILIES){if(f.key==='social')continue;if(f.re.test(text)||f.scenes.includes(item.scene&&item.scene.id))return f}return FAMILIES[FAMILIES.length-1]}
  function poolFor(item,l){const f=familyFor(item),primary=l==='jp'?f.jp:f.en,fallback=l==='jp'?[URL.jpA,URL.jpB,URL.jpC,URL.jpD]:[URL.socialA,URL.retailA,URL.travelA,URL.workA];return [...new Set([...primary,...fallback].filter(Boolean))]}
  function mappingFor(item,l){const f=familyFor(item),pool=poolFor(item,l);return {expression:item.id,scene:item.scene.id,intent:item.func||'',action:item.action||'',family:f.key,video_pool:pool,window:f.window,language:l}}
  const MEDIA_INDEX={};ITEMS.forEach(item=>{MEDIA_INDEX[item.id]={en:mappingFor(item,'en'),jp:mappingFor(item,'jp')}});
  window.TALKLOOP_MEDIA_INDEX=MEDIA_INDEX;window.TALKLOOP_MEDIA_SCHEMA={version:'10.0.0',mapped:Object.keys(MEDIA_INDEX).length,families:FAMILIES.map(x=>x.key)};
  window.pools=function(item,l){return poolFor(item,l)};
  window.prepareNext=function(item,l){const p=poolFor(item,l);if(!p.length)return;const visit=(st.vis[item.id+'|'+l]||0),seed=hash(item.id+'|'+l+'|warm|'+visit);for(let i=0;i<Math.min(3,p.length);i++)warm(p[(seed+i)%p.length])};
  window.remix=function(item,v,ph,l=lang,reason='auto',shadeId){
    stopMedia(v);const map=mappingFor(item,l),pool=map.video_pool,scene=v.closest('.scene'),shade=shadeId?$(shadeId):scene.querySelector('.mediaShade');const k=item.id+'|'+l;st.vis[k]=(st.vis[k]||0)+1;save();const visit=st.vis[k],seed=hash(k+'|'+visit+'|'+reason+'|v10'),src=pool.length?pool[seed%pool.length]:'',minT=map.window[0],maxT=map.window[1],clipLen=4+(seed%4),desired=minT+(seed%Math.max(1,Math.floor(maxT-minT+1)));ph.style.backgroundImage=`url('${item.scene.img}')`;ph.style.display='block';ph.style.opacity='1';scene.classList.remove('video-ready');scene.classList.add('loading');if(shade)shade.style.display='grid';if(!src){scene.classList.remove('loading');return}warm(src);const fallback=()=>{scene.classList.remove('loading');scene.classList.remove('video-ready');v.style.opacity='0';ph.style.opacity='1';if(shade)shade.style.display='none'};v.src=src;v.preload='auto';v.muted=true;v.playsInline=true;v.onerror=fallback;v.oncanplay=()=>{const dur=isFinite(v.duration)?v.duration:0,maxStart=Math.max(0,dur-clipLen-.2),start=Math.max(0,Math.min(desired,maxStart));v._s=start;v._len=Math.min(7,Math.max(4,Math.min(clipLen,dur||clipLen)));try{v.currentTime=start}catch(e){}scene.classList.remove('loading');scene.classList.add('video-ready');if(shade)shade.style.display='none';v.style.opacity='1';ph.style.opacity='0';v.play().catch(()=>{});window.prepareNext(item,l)};v.ontimeupdate=()=>{if(v.currentTime>=(v._s||0)+(v._len||clipLen)-.08)window.remix(item,v,ph,l,'segment',shadeId)};v.load();mediaState.set(v,{src,map})};
  const oldAudit=window.renderAudit;window.renderAudit=function(){if(oldAudit)oldAudit();const node=$('audit');if(!node)return;const mapped=Object.keys(MEDIA_INDEX).length,actionCount=new Set(ITEMS.map(x=>x.action).filter(Boolean)).size,familyCount=new Set(ITEMS.map(x=>familyFor(x).key)).size;node.insertAdjacentHTML('beforeend',`<div class="tip" style="margin-top:10px"><b>视频映射层 v10</b><br>表达 → 意图 → 动作 → 视频池 已映射 ${mapped}/${ITEMS.length} 条；动作标签 ${actionCount} 类；视觉动作族 ${familyCount} 类。高频不熟/模糊表达会在复训时增加素材与时间片变化。</div>`)};
  try{render();refresh();if(document.getElementById('audit'))renderAudit();console.log('TalkLoop v10 media mapping ready',window.TALKLOOP_MEDIA_SCHEMA)}catch(e){console.warn('TalkLoop v10 bootstrap',e)}
})();