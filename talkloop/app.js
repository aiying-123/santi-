(async()=>{try{
  const names=['q00','q01','p1','p2','p3','p4','p5','p6'];
  if(!('DecompressionStream' in window))throw new Error('browser decompression unavailable');
  const parts=await Promise.all(names.map(n=>fetch('./payload/'+n+'.txt?v=5.2.0',{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error(n+' '+r.status);return r.text()})));
  const b64=parts.join('').trim();
  const bytes=Uint8Array.from(atob(b64),c=>c.charCodeAt(0));
  const ds=new DecompressionStream('gzip');
  let html=await new Response(new Blob([bytes]).stream().pipeThrough(ds)).text();
  if(!html.includes('TalkLoop v5')||!html.includes('const TL_SCENES'))throw new Error('bundle integrity check failed');

  const css=`
/* TalkLoop v5.2 patch: short video + full-height learning page */
#learn.active{min-height:calc(100dvh - 68px - 94px - env(safe-area-inset-top) - env(safe-area-inset-bottom));display:flex;flex-direction:column}
#learn .learn-head,#learn .mode-toggle{flex:0 0 auto}
#learn .lesson{flex:1;min-height:0;display:flex;flex-direction:column;margin-bottom:0}
#learn .scene{flex:0 0 clamp(330px,46dvh,520px);height:auto;min-height:330px}
#learn .tabs{flex:0 0 auto}
#learn .lesson-body{flex:1;min-height:0;display:flex;flex-direction:column;padding-bottom:18px}
#learn #phraseMode .audio-row{margin-top:auto;padding-top:14px}
#learn #dialogueMode .grades{margin-top:auto;padding-top:14px}
.scene-video{inset:0!important;width:100%!important;height:100%!important;object-fit:cover!important;transform:none!important;background:#0b0e13}
.scene-bg{inset:0!important;width:100%!important;height:100%!important}
.person,.person .head,.person .body{display:none!important}
.scene-fx .bubble{right:14px!important;top:auto!important;bottom:58px!important;max-width:74%!important;background:rgba(7,10,15,.76)!important;color:#fff!important;border:1px solid rgba(255,255,255,.15);backdrop-filter:blur(12px);font-size:11px!important}
.video-chip{font-weight:750;background:rgba(7,10,15,.62)!important}
@media(max-height:780px){#learn .scene{flex-basis:300px;min-height:290px}.phrase{font-size:29px}.jp{font-size:23px}.lesson-body{padding-top:11px}}
@media(min-height:1050px){#learn .scene{flex-basis:min(50dvh,620px)}#learn .lesson-body{padding-top:18px}.phrase{font-size:36px}.jp{font-size:28px}}
`;
  html=html.replace('</style>',css+'</style>');

  const mediaMap=`
const TL_VIDEO_LIBRARY={
 social:{url:'https://videos.pexels.com/video-files/8522987/8522987-hd_1080_1920_30fps.mp4',start:1,len:6},
 counter:{url:'https://videos.pexels.com/video-files/9046237/9046237-uhd_2160_3840_24fps.mp4',start:1,len:6},
 restaurant:{url:'https://videos.pexels.com/video-files/3970140/3970140-uhd_3840_2160_30fps.mp4',start:1.5,len:6},
 shopping:{url:'https://videos.pexels.com/video-files/5708451/5708451-hd_1080_1920_25fps.mp4',start:1,len:6},
 transit:{url:'https://videos.pexels.com/video-files/8553596/8553596-uhd_2160_3840_24fps.mp4',start:1,len:6},
 hotel:{url:'https://videos.pexels.com/video-files/7820465/7820465-hd_1920_1080_25fps.mp4',start:1,len:6},
 office:{url:'https://videos.pexels.com/video-files/5971791/5971791-uhd_2160_4096_25fps.mp4',start:1,len:6},
 phone:{url:'https://videos.pexels.com/video-files/7279035/7279035-uhd_2160_3840_25fps.mp4',start:1,len:5},
 health:{url:'https://videos.pexels.com/video-files/30141938/12925561_1920_1080_24fps.mp4',start:1,len:6}
};
const TL_SCENE_VIDEO_KEY={greet:'social',intro:'social',smalltalk:'social',appointment:'social',friends:'social',invite:'social',convenience:'counter',coffee:'counter',restaurant:'restaurant',shopping:'shopping',station:'transit',taxi:'transit',directions:'transit',hotel:'hotel',help:'office',repair:'office',work:'office',phone:'phone',health:'health',emergency:'health'};
function videoSpec(scene){return TL_VIDEO_LIBRARY[TL_SCENE_VIDEO_KEY[scene.id]||'social']||TL_VIDEO_LIBRARY.social}
`;
  html=html.replace('const ALL=',mediaMap+'\nconst ALL=');

  const funcs=`function applyMedia(scene,video,bg){
 const spec=videoSpec(scene),src=scene.video||spec.url,start=Number.isFinite(scene.clipStart)?scene.clipStart:spec.start,len=Math.max(3,Math.min(8,Number.isFinite(scene.clipLen)?scene.clipLen:spec.len));
 if(video._tlTimeHandler)video.removeEventListener('timeupdate',video._tlTimeHandler);
 if(video._tlLoadedHandler)video.removeEventListener('loadedmetadata',video._tlLoadedHandler);
 video.classList.remove('on');video.pause();video.removeAttribute('src');video.load();bg.style.display='block';bg.style.backgroundImage=\`url('\${scene.img}')\`;
 video.poster=scene.img;video.src=src;video.muted=true;video.playsInline=true;video.loop=false;video.preload='metadata';
 const reset=()=>{const maxStart=Math.max(0,(Number.isFinite(video.duration)?video.duration:999)-len-.15),s=Math.min(Math.max(0,start),maxStart);video._tlStart=s;video._tlLen=len;try{video.currentTime=s}catch(e){}video.classList.add('on');bg.style.display='none';const p=video.play();if(p&&p.catch)p.catch(()=>{video.classList.remove('on');bg.style.display='block'})};
 video._tlLoadedHandler=reset;video._tlTimeHandler=()=>{const s=video._tlStart||0,l=video._tlLen||len;if(video.currentTime>=s+l||video.ended){try{video.currentTime=s}catch(e){}video.play().catch(()=>{})}};
 video.addEventListener('loadedmetadata',video._tlLoadedHandler,{once:true});video.addEventListener('timeupdate',video._tlTimeHandler);video.onerror=()=>{video.classList.remove('on');bg.style.display='block'}
}
function fxHTML(scene,item){const text=lang==='en'?item.en:item.jp;return \`<div class="bubble">\${text}</div>\`}
function renderLesson()`;
  html=html.replace(/function applyMedia\(scene,video,bg\)\{[\s\S]*?\}\nfunction fxHTML\(scene,item\)\{[\s\S]*?\}\nfunction renderLesson\(\)/,funcs);
  html=html.replace("$('videoChip').textContent=s.video?'REAL VIDEO':'DYNAMIC SCENE';","$('videoChip').textContent='SHORT VIDEO · 3–8s';");
  html=html.replace(/function videoCount\(\)\{[\s\S]*?\}\nfunction renderVideoStatus\(\)\{[\s\S]*?\}\n/,"function videoCount(){return TL_SCENES.filter(s=>videoSpec(s)?.url).length}\\nfunction renderVideoStatus(){$('videoStatus').innerHTML=`当前 <b>${videoCount()}</b> / ${TL_SCENES.length} 个核心场景均配置 3–8 秒短视频媒体层。若外部视频暂时加载失败，会回退到真人实景封面，不再叠加蓝绿卡通人物。`}\\n");
  html=html.replace("if(videoCount()<3)issues.push('真实视频场景少于3')","if(videoCount()!==TL_SCENES.length)issues.push(`短视频映射=${videoCount()}/${TL_SCENES.length}`)");
  html=html.replace('TalkLoop v5 ·','TalkLoop v5.2 ·');

  document.open();document.write(html);document.close();
}catch(e){
  console.error('TalkLoop v5.2 bootstrap failed',e);
  const box=document.createElement('div');box.style.cssText='position:fixed;left:16px;right:16px;bottom:92px;z-index:999;padding:12px 14px;border-radius:16px;background:#181016;border:1px solid #55263a;color:#ffd3de;font:12px/1.5 -apple-system,BlinkMacSystemFont,sans-serif';box.textContent='新版训练模块加载失败，请刷新 Safari：'+e.message;document.body.appendChild(box)
}})();