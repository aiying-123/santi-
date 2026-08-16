(function(){
  const oldClip = typeof clip==='function'?clip:null;
  const oldLangSet = typeof langSet==='function'?langSet:null;
  const oldRenderD = typeof renderD==='function'?renderD:null;
  const rot={};
  const JP72=[
    'https://videos.pexels.com/video-files/12893501/12893501-hd_1080_1920_25fps.mp4',
    'https://videos.pexels.com/video-files/6602066/6602066-hd_1080_1920_25fps.mp4',
    'https://videos.pexels.com/video-files/9046233/9046233-hd_1080_1920_25fps.mp4',
    'https://videos.pexels.com/video-files/8554081/8554081-hd_1080_1920_25fps.mp4',
    'https://videos.pexels.com/video-files/6540258/6540258-hd_1080_1920_25fps.mp4',
    'https://videos.pexels.com/video-files/10373944/10373944-hd_1080_1920_25fps.mp4',
    'https://videos.pexels.com/video-files/9047396/9047396-hd_1080_1920_25fps.mp4',
    'https://videos.pexels.com/video-files/13929624/13929624-hd_1080_1920_30fps.mp4',
    'https://videos.pexels.com/video-files/6381006/6381006-hd_1080_1920_25fps.mp4',
    'https://videos.pexels.com/video-files/7681394/7681394-hd_1080_1920_25fps.mp4'
  ];
  const unique=a=>Array.from(new Set(a.filter(Boolean)));
  function rotate(a,k){if(!a.length)return a;let n=rot[k]||0;rot[k]=n+1;let q=n%a.length;return a.slice(q).concat(a.slice(0,q))}
  function englishPool(item,turn){let base=oldClip?oldClip(item,'en',turn):{srcs:[]};let p=[...(base.srcs||[])];let id=item.s[0];if(['greeting','intro','smalltalk','appointment','friends','invite','thanks'].includes(id))p.push(EN[0],EN[4]);else if(['convenience','cafe','restaurant','shopping'].includes(id))p.push(EN[1],EN[3]);else if(['transport','directions'].includes(id))p.push(EN[2],EN[0]);else if(id==='hotel')p.push(EN[3],EN[1]);else if(id==='health')p.push(typeof HEALTH_VIDEO!=='undefined'?HEALTH_VIDEO:null,EN[4]);else p.push(EN[4],EN[0]);return unique(p)}
  function clip72(item,l,turn){l=l||lang;turn=turn||0;let n=item.si*7+item.pi*3+turn;if(l==='jp'){let srcs=rotate(JP72,'jp-'+item.s[0]+'-'+turn);return{srcs,start:(item.pi*1.7+turn*1.15+n*.17)%7.5,len:4+((item.pi+turn)%4)}}let srcs=rotate(englishPool(item,turn),'en-'+item.s[0]+'-'+turn);return{srcs,start:(item.pi*1.9+turn*1.3+n*.13)%7.5,len:4+((item.pi+turn)%4)}}
  try{clip=clip72}catch(e){} window.clip=clip72;

  function clearGate(v){let p=v.parentElement;if(!p)return;let g=p.querySelector('.videoGate');if(g)g.remove()}
  function gate(v,label){let p=v.parentElement;if(!p)return;let g=p.querySelector('.videoGate');if(!g){g=document.createElement('button');g.className='videoGate';p.appendChild(g)}g.textContent=label||'▶ 播放短视频';g.onclick=function(ev){ev.preventDefault();ev.stopPropagation();v.muted=true;v.setAttribute('muted','');v.setAttribute('playsinline','');v.setAttribute('webkit-playsinline','');let pr=v.play();if(pr&&pr.then)pr.then(()=>g.remove()).catch(()=>{});};}
  function tryPlay(v){if(!v||!v.src)return;v.muted=true;v.autoplay=true;v.playsInline=true;v.setAttribute('muted','');v.setAttribute('autoplay','');v.setAttribute('playsinline','');v.setAttribute('webkit-playsinline','');let p;try{p=v.play()}catch(e){gate(v)}if(p&&p.catch)p.catch(()=>gate(v,'▶ 点击播放场景视频'));}
  function play72(item,v,ph,l,turn){l=l||lang;turn=turn||0;let c=clip72(item,l,turn),j=0,len=Math.min(8,Math.max(3,c.len||5)),parent=v.parentElement;clearGate(v);if(parent)parent.classList.remove('video-live');ph.style.display='block';ph.style.backgroundImage=`url('${IM[item.si%IM.length]}')`;v.style.display='none';v.onerror=null;v.onloadedmetadata=null;v.oncanplay=null;v.onplaying=null;if(v._tm)v.removeEventListener('timeupdate',v._tm);if(v._stall)clearTimeout(v._stall);
    function next(){if(j>=c.srcs.length){v.style.display='none';ph.style.display='block';gate(v,l==='jp'?'▶ 播放女性交流视频':'▶ 播放场景视频');return}let src=c.srcs[j++];v.pause();v.removeAttribute('src');v.load();v.src=src;v.muted=true;v.autoplay=true;v.playsInline=true;v.preload='auto';v.setAttribute('muted','');v.setAttribute('autoplay','');v.setAttribute('playsinline','');v.setAttribute('webkit-playsinline','');v.onerror=()=>next();v.onloadedmetadata=()=>{let stt=Math.min(c.start,Math.max(0,(v.duration||len)-len-.1));v._s=stt;v._l=len;try{v.currentTime=stt}catch(e){}tryPlay(v)};v.oncanplay=()=>{v.style.display='block';ph.style.display='none';tryPlay(v)};v.onplaying=()=>{clearGate(v);v.style.display='block';ph.style.display='none';if(parent)parent.classList.add('video-live')};v.load();tryPlay(v);v._stall=setTimeout(()=>{if(v.readyState<2){next()}else tryPlay(v)},4200)}
    v._tm=()=>{if(v.currentTime>=(v._s||0)+(v._l||len)){try{v.currentTime=v._s||0}catch(e){}tryPlay(v)}};v.addEventListener('timeupdate',v._tm);next();
  }
  try{playClip=play72}catch(e){} window.playClip=play72;

  if(oldLangSet){window.langSet=function(l){oldLangSet(l);requestAnimationFrame(()=>{let v=document.getElementById('vid');tryPlay(v)});};try{langSet=window.langSet}catch(e){}}
  if(oldRenderD){window.renderD=function(){oldRenderD();requestAnimationFrame(()=>tryPlay(document.getElementById('dvid')));};try{renderD=window.renderD}catch(e){}}

  // Optional secure backend hook for truly generated video. Static GitHub Pages keeps this off by default.
  window.TalkLoopVideo={
    endpoint:'',
    setEndpoint:function(url){this.endpoint=url||''},
    async generate(item,language,turn){if(!this.endpoint)return null;let r=await fetch(this.endpoint,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({scene:item.s[0],intent:item.s[1],text:language==='jp'?item.jp:item.en,language:language,turn:turn||0,seconds:4})});if(!r.ok)throw new Error('video generation failed');return r.json()}
  };

  document.querySelectorAll('video').forEach(v=>{v.autoplay=true;v.muted=true;v.playsInline=true;v.setAttribute('muted','');v.setAttribute('autoplay','');v.setAttribute('playsinline','');v.setAttribute('webkit-playsinline','');v.addEventListener('click',()=>tryPlay(v));});
})();