/* TalkLoop v11 UI / interaction patch */
(function(){
'use strict';
function addMascot(){
  const brand=document.querySelector('.brand'); if(brand){brand.innerHTML='<span class="brandGlyph">◌</span>';brand.classList.add('brandMinimal')}
  const hero=document.querySelector('.homeHero'); if(!hero)return;
  hero.innerHTML=`<button class="mascotStage" aria-label="互动角色" onclick="mascotReact(this)">
    <span class="mascotGlow"></span><span class="mascotBody"><i class="ear l"></i><i class="ear r"></i><i class="face"><b class="eye l"></b><b class="eye r"></b><b class="mouth"></b></i><i class="arm l"></i><i class="arm r"></i><i class="foot l"></i><i class="foot r"></i></span>
    <span class="mascotBits"><i>✦</i><i>·</i><i>✧</i></span>
  </button><button class="heroStart compactStart" onclick="startAdaptive()">开始</button>`;
}
window.mascotReact=function(el){el.classList.remove('react');void el.offsetWidth;el.classList.add('react');setTimeout(()=>el.classList.remove('react'),850)};
function injectModal(){if(document.getElementById('coverageModal'))return;document.body.insertAdjacentHTML('beforeend',`<div class="coverageModal" id="coverageModal" role="dialog" aria-modal="true" aria-labelledby="coverageTitle" onclick="if(event.target===this)closeCoverage()"><div class="coverageSheet"><div class="sheetHandle"></div><div class="sheetHead"><div><b id="coverageTitle">训练覆盖</b><span id="coverageSummary"></span></div><button aria-label="关闭场景列表" onclick="closeCoverage()">×</button></div><div class="sceneTagGrid" id="sceneTagGrid"></div><div class="systemPrinciple"><b>训练调度原则</b><span>6个月做十年的训练密度：高频价值 → 到期遗忘 → 不熟/模糊 → 新场景；小步快跑、快速迭代、反馈后立即更新。</span></div></div></div>`)}
window.closeCoverage=()=>{document.getElementById('coverageModal')?.classList.remove('open');document.body.classList.remove('modalOpen')};
window.openCoverage=function(){injectModal();const modal=$('coverageModal'),grid=$('sceneTagGrid');const markedIds=new Set(marked().map(x=>x.id));grid.innerHTML=SCENES.map(s=>{const arr=ITEMS.filter(x=>x.scene.id===s.id),done=arr.filter(x=>markedIds.has(x.id)).length,p=Math.round(done/arr.length*100);return `<button onclick="jumpScene('${s.id}')"><b>${s.zh}</b><span>${s.tag}</span><em>${done}/${arr.length} · ${p}%</em><i><u style="width:${p}%"></u></i></button>`}).join('');$('coverageSummary').textContent=`${SCENES.length} 个场景 · ${ITEMS.length} 条表达`;modal.classList.add('open');document.body.classList.add('modalOpen');setTimeout(()=>grid.querySelector('button')?.focus(),220)};
window.jumpScene=function(id){const i=ITEMS.findIndex(x=>x.scene.id===id);if(i>=0){ix=i;render();closeCoverage();go('learn')}};
function tuneCoverage(){const cov=$('coverage');if(!cov)return;const a=marked().length,sc=new Set(marked().map(x=>x.scene.id)).size,repair=marked().filter(x=>x.scene.id==='repair').length;cov.innerHTML=row('核心场景',sc,SCENES.length)+row('高频表达',a,ITEMS.length)+row('对话修复',repair,ITEMS.filter(x=>x.scene.id==='repair').length);cov.classList.add('coverageClickable');cov.setAttribute('role','button');cov.setAttribute('tabindex','0');cov.onclick=openCoverage;cov.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openCoverage()}};cov.title='点击查看全部场景标签';const head=[...document.querySelectorAll('.head')].find(h=>h.nextElementSibling===cov);if(head){head.classList.add('clickableHead');head.onclick=openCoverage;head.querySelector('span').textContent='点击展开场景标签'}}
function timeCompression(){const line=document.querySelector('.statusLine');if(!line)return;const due=ITEMS.filter(x=>st.m[x.id]&&st.m[x.id].next<=Date.now()).length,weak=marked('bad').length+marked('mid').length,fresh=ITEMS.length-marked().length;const done=marked('good').length,ratio=done/Math.max(1,marked().length),level=ratio>.68?'L4 · 无提示能说':ratio>.32?'L3 · 提示后能说':'L2 · 听得懂';line.classList.add('compressionLine');line.onclick=startAdaptive;line.setAttribute('role','button');line.setAttribute('tabindex','0');line.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();startAdaptive()}};line.innerHTML=`<span class="compressionMark">L2</span><div><b id="level">${level}</b><small>12分钟冲刺 · 到期 ${due} · 薄弱 ${weak} · 新内容 ${Math.min(6,fresh)}</small></div><em id="homeFocus">${due?due+' 条先处理':weak?weak+' 条先强化':'听意图 → 接一句'} →</em>`}
function systemPrinciple(){const check=$('check');if(!check||check.querySelector('.systemCard'))return;const desc=check.querySelector('.desc');desc?.insertAdjacentHTML('afterend',`<div class="systemCard"><b>系统原则</b><span>产品内部把马斯克式时间压缩/第一性约束、奥特曼式高不确定快速试验，与你的“状态 → 目标 → 约束 → 场景 → 行动 → 反馈 → 更新”主链组合为训练调度原则。目标是6个月做十年的训练密度，小步快跑、快速迭代。</span></div>`)}
function dynamicCounts(){
  const total=ITEMS.length; const c=$('counter');if(c)c.textContent=(ix+1)+'/'+total;const p=$('prog');if(p)p.style.width=(ix+1)/total*100+'%';
  const d=document.querySelector('#dialog .desc');if(d)d.textContent=`${SCENES.length} 个现实场景 · 连续接力。每轮关联交际功能、动作标签和独立语言视频池。`;
}
function enrichHomeFeed(){const tl=$('homeTimeline');if(!tl||tl.dataset.v11)return;tl.dataset.v11='1';tl.insertAdjacentHTML('beforeend',`<button onclick="openCoverage()"><span class="tlIcon">◎</span><div><b>场景地图</b><small>${SCENES.length} 个现实场景 · 点击查看覆盖标签</small></div><em>展开</em></button>`)}

function dialogUI(){
  const n=$('dlang');if(n)n.textContent=dLang==='en'?'切换日本語':'Switch to English';
  const actions=document.querySelector('.dialogActions');if(actions){const bs=actions.querySelectorAll('button');if(bs[0])bs[0].textContent='🔊 播放';if(bs[1])bs[1].textContent='↻ 换画面';if(bs[3])bs[3].textContent='下一轮 →';}
}
const originalRenderD=window.renderD;window.renderD=function(){originalRenderD&&originalRenderD();const turns=DIALOGUES[dScene]||[];if($('dcount'))$('dcount').textContent=(dTurn+1)+'/'+turns.length;dialogUI()};
window.nextD=function(){const turns=DIALOGUES[dScene]||[];dTurn=(dTurn+1)%Math.max(1,turns.length);renderD()};

const originalRefresh=window.refresh;window.refresh=function(){originalRefresh&&originalRefresh();timeCompression();tuneCoverage();dynamicCounts();enrichHomeFeed()};
const originalRender=window.render;window.render=function(){originalRender&&originalRender();dynamicCounts();const x=ITEMS[ix];const tip=$('tip');if(tip)tip.textContent=lang==='jp'?'日语模式使用独立的女性主导互动素材池；失效地址自动隔离，首帧未就绪时保留封面。':`当前：${x.scene.zh} / ${x.func} / ${x.action}。先听懂意图，立即接一句，再逐步去掉提示。`;};
const originalAudit=window.renderAudit;window.renderAudit=function(){originalAudit&&originalAudit();systemPrinciple()};
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeCoverage()});
app.addEventListener('scroll',()=>{if(app.scrollTop)app.scrollTop=0},{passive:true});
window.TALKLOOP_DEFER_MEDIA=false;
ix=pickNextIndex();addMascot();injectModal();systemPrinciple();refresh();render();
})();
