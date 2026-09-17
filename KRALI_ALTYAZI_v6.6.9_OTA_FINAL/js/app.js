
function k54RoundRect(ctx,x,y,w,h,r){
 r=Math.max(0,Math.min(Number(r)||0,Math.min(w,h)/2));
 ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);ctx.closePath();ctx.fill();
}


function kInstallCueDeleteButtons(){
 try{
  $$('.cue').forEach((row,i)=>{
   if(row.querySelector('.cueDelete'))return;
   const b=document.createElement('button');b.className='cueDelete';b.type='button';b.title='Bu altyazıyı sil';b.textContent='×';
   b.onclick=e=>{e.preventDefault();e.stopPropagation();kDeleteCue(i)};
   row.appendChild(b);
  })
 }catch(_){}
}


function kRefreshCaptionOverlays(){
 try{
  const t=Number(KRALI_SYNC.timeline||state.position||0);
  kFixedShowCaption(t);
  const c=kFixedCaption();
  if(c && (!c.textContent || !c.textContent.trim()) && cues&&cues.length){
    const q=cues[selected>=0?selected:0]; if(q)c.textContent=q.text||'';
  }
  kApplyFixedStyle();kMirrorTimelineToStyle();
 }catch(_){}
}
function kDeleteCue(i){
 if(!Array.isArray(cues)||i<0||i>=cues.length)return;
 const next=Math.min(i,cues.length-2);
 cues.splice(i,1);
 selected=cues.length?Math.max(0,next):-1;
 renderCues();
 kRefreshCaptionOverlays();
 try{kRenderZonesV183()}catch(_){};
}


/* v1.5 style studio */
function kStyleMonitorGeometry(){
 try{
  const w=Math.max(1,Number(state.width)||1080),h=Math.max(1,Number(state.height)||1920),r=w/h;
  const m=document.getElementById('kraliStyleMonitor');
  if(m){m.style.setProperty('--krali-seq-ratio',w+' / '+h);m.style.setProperty('--krali-seq-ratio-num',String(r))}
 }catch(_){}
}
function kMirrorTimelineToStyle(){
 try{
  const src=kHybridImg(),dst=document.getElementById('kraliStyleFrame');
  if(src&&dst&&src.src&&dst.src!==src.src)dst.src=src.src;
  const c=document.getElementById('kraliStyleCaption'),active=kFixedCaption();
  if(c&&active){
   c.textContent=active.textContent||((cues&&cues[selected])?cues[selected].text:'Altyazı önizleme');
   const props=['fontFamily','fontSize','color','background','borderRadius','padding','top','fontWeight','fontStyle','textTransform','lineHeight','letterSpacing','maxWidth','textAlign','webkitTextStroke','textShadow'];
   props.forEach(p=>c.style[p]=active.style[p]||'');
   const mh=document.getElementById('kraliFixedPreviewWrap')?.clientHeight||1,sh=document.getElementById('kraliStyleMonitor')?.clientHeight||mh;
   const fs=parseFloat(active.style.fontSize||'0');if(fs)c.style.fontSize=(fs*sh/mh)+'px';
  }
 }catch(_){}
}
function kApplyStylePreset(name){
 const set=(id,v)=>{const e=document.getElementById(id);if(e){e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}))}};
 if(name==='clean'){set('size',58);set('color','#ffffff');set('bg','#000000');set('opacity',45);set('strokeWidth',0);set('shadow',35);set('padX',12);set('padY',6);set('radius',5);set('pos',72)}
 if(name==='reels'){set('size',68);set('color','#ffffff');set('bg','#000000');set('opacity',0);set('strokeWidth',3);set('stroke','#000000');set('shadow',70);set('padX',5);set('padY',3);set('radius',0);set('pos',68)}
 if(name==='boxed'){set('size',60);set('color','#ffffff');set('bg','#000000');set('opacity',82);set('strokeWidth',0);set('shadow',20);set('padX',18);set('padY',10);set('radius',10);set('pos',72)}
 if(name==='minimal'){set('size',52);set('color','#ffffff');set('bg','#000000');set('opacity',0);set('strokeWidth',0);set('shadow',55);set('padX',0);set('padY',0);set('radius',0);set('pos',76)}
 stylePreview();kMirrorTimelineToStyle();
}
setTimeout(()=>{
 document.querySelectorAll('[data-style-preset]').forEach(b=>b.onclick=()=>kApplyStylePreset(b.dataset.stylePreset));
 const st=document.getElementById('styleTab');
 if(st)st.addEventListener('click',()=>{kStyleMonitorGeometry();kRefreshCaptionOverlays();
   const f=document.getElementById('kraliStyleFrame');if(!f||!f.src)kHybridTimelineFrame(Number(KRALI_SYNC.timeline||state.position)||0,0);
 });
},500);


function kSetPlayButton(on){
 const b=document.getElementById('play');if(!b)return;
 b.textContent=on?'❚❚ Duraklat':'▶ Oynat';
}
async function kTogglePreviewPlayback(){
 if(KRALI_SYNC.playing){
   const v=kFixedVideo(),t=(v&&v.dataset.seqPreview&&!v.paused)?Number(v.currentTime):Number(KRALI_SYNC.timeline||state.position||0);
   kSyncStop();kFramePlayStop();KRALI_SYNC.timeline=t;state.position=t;kSetPlayButton(false);
   await kHybridTimelineFrame(t,0);return;
 }
 const t=Number(KRALI_SYNC.timeline||state.position||0);
 kSetPlayButton(true);await kSeqPlayFrom(t);
 if(!KRALI_SYNC.playing)kSetPlayButton(false);
}


function kApplySequenceGeometry(){
 try{
  const w=Math.max(1,Number(state.width)||1080),h=Math.max(1,Number(state.height)||1920),r=w/h;
  const p=document.querySelector('#textTab .preview');
  if(p){
   p.style.setProperty('--krali-seq-ratio',w+' / '+h);
   p.style.setProperty('--krali-seq-ratio-num',String(r));
  }
 }catch(_){}
}


const KRALI_FRAMEPLAY={timer:null,t:0,last:0,busy:false};
function kFramePlayStop(){
 if(KRALI_FRAMEPLAY.timer){clearInterval(KRALI_FRAMEPLAY.timer);KRALI_FRAMEPLAY.timer=null}
 KRALI_FRAMEPLAY.busy=false;
}
async function kFramePlayFrom(t){
 kSyncStop();kFramePlayStop();KRALI_SYNC.playing=true;KRALI_FRAMEPLAY.t=Math.max(0,Number(t)||0);KRALI_FRAMEPLAY.last=Date.now();
 await kHybridTimelineFrame(KRALI_FRAMEPLAY.t,0);
 KRALI_FRAMEPLAY.timer=setInterval(async()=>{
   if(!KRALI_SYNC.playing||KRALI_FRAMEPLAY.busy)return;
   const now=Date.now(),dt=(now-KRALI_FRAMEPLAY.last)/1000;KRALI_FRAMEPLAY.last=now;
   KRALI_FRAMEPLAY.t+=dt;
   if(state.duration&&KRALI_FRAMEPLAY.t>=state.duration){KRALI_SYNC.playing=false;kFramePlayStop();kSetPlayButton(false);return}
   KRALI_FRAMEPLAY.busy=true;
   try{await kHybridTimelineFrame(KRALI_FRAMEPLAY.t,0)}finally{KRALI_FRAMEPLAY.busy=false}
 },140);
}


/* v1.4 sequence composite preview cache */
const KRALI_SEQ={path:'',ready:false,busy:false,ctiTimer:null,lastCTI:0};

function kSeqCacheDir(){
 const os=require('os'),path=require('path'),fs=require('fs');
 const d=path.join(os.homedir(),'Library','Application Support','KRALI','Altyazi','sequence-preview');
 fs.mkdirSync(d,{recursive:true});return d;
}
function kSeqBase(){
 const path=require('path');
 const key=kHash(String(state.name||'sequence')+'|'+String(state.duration||0)+'|'+String(state.width||0)+'x'+String(state.height||0));
 return path.join(kSeqCacheDir(),'seq_'+key);
}
async function kSeqEnsure(force){
 if(KRALI_SEQ.busy)return false;
 KRALI_SEQ.busy=true;
 try{
  const fs=require('fs'),path=require('path'),dir=kSeqCacheDir(),base=kSeqBase();
  if(!force){
   const hit=fs.readdirSync(dir).filter(x=>x.indexOf(path.basename(base)+'.')===0).map(x=>path.join(dir,x)).find(p=>{try{return fs.statSync(p).size>100000}catch(_){return false}});
   if(hit){KRALI_SEQ.path=hit;KRALI_SEQ.ready=true;return true}
  }
  $('#status').textContent='Sequence preview hazırlanıyor… Premiere kısa süre meşgul olabilir.';
  const raw=await kFixedEval('$._KRALI_SUB.renderSequencePreview('+JSON.stringify(base)+')');
  let r={};try{r=JSON.parse(raw||'{}')}catch(_){}
  if(!r.ok||!r.path)throw Error(r.message||'Sequence preview oluşturulamadı');
  if(!fs.existsSync(r.path)||fs.statSync(r.path).size<100000)throw Error('Sequence preview dosyası doğrulanamadı');
  KRALI_SEQ.path=r.path;KRALI_SEQ.ready=true;
  $('#status').textContent='Sequence preview hazır';
  return true;
 }catch(e){
  KRALI_SEQ.ready=false;$('#status').textContent='Preview: '+(e.message||e);
  return false;
 }finally{KRALI_SEQ.busy=false}
}
async function kSeqLoadAt(t,play){
 const ok=await kSeqEnsure(false); if(!ok)return false; // timeline-only: never show source media
 const v=kFixedVideo(),img=kHybridImg(); if(!v)return false;
 if(img)img.style.display='none';v.style.display='block';
 const wanted=kHybridFileURL(KRALI_SEQ.path).split('?')[0];
 if(!v.dataset.seqPreview || decodeURI((v.src||'').split('?')[0])!==decodeURI(wanted)){
   v.dataset.seqPreview='1';v.dataset.proxyReady='';KRALI_FIXED.active=-1;
   v.src=kHybridFileURL(KRALI_SEQ.path);
   await new Promise((res,rej)=>{const a=()=>{cl();res()},b=()=>{cl();rej(Error('Sequence preview açılamadı'))},cl=()=>{v.removeEventListener('loadedmetadata',a);v.removeEventListener('error',b)};v.addEventListener('loadedmetadata',a);v.addEventListener('error',b);v.load()});
 }
 v.currentTime=Math.max(0,Math.min(Number(t)||0,isFinite(v.duration)?Math.max(0,v.duration-.02):Number(t)||0));
 KRALI_SYNC.timeline=Number(t)||0;kFixedShowCaption(KRALI_SYNC.timeline);kSyncUI(KRALI_SYNC.timeline);
 if(play){const p=v.play();if(p&&p.catch)await p.catch(()=>{})}
 return true;
}
function kSeqStopCTI(){if(KRALI_SEQ.ctiTimer){clearInterval(KRALI_SEQ.ctiTimer);KRALI_SEQ.ctiTimer=null}}
function kSeqStartCTI(){
 kSeqStopCTI();
 KRALI_SEQ.ctiTimer=setInterval(async()=>{
  if(!KRALI_SYNC.playing)return;
  const v=kFixedVideo();if(!v||v.paused)return;
  const t=Number(v.currentTime)||0;KRALI_SYNC.timeline=t;kFixedShowCaption(t);kSyncUI(t);
  const now=Date.now();
  if(now-KRALI_SEQ.lastCTI>90){KRALI_SEQ.lastCTI=now;try{await kFixedEval('$._KRALI_SUB.setPlayhead('+t+')')}catch(_){}}
 },50);
}
async function kSeqPlayFrom(t){
 kSyncStop();KRALI_SYNC.playing=true;
 const ok=await kSeqLoadAt(t,true);
 if(!ok){KRALI_SYNC.playing=false;return kFramePlayFrom(t)}
 kSeqStartCTI();
}


function kHybridFmt(sec){
 sec=Math.max(0,Number(sec)||0);
 const m=Math.floor(sec/60),s=Math.floor(sec%60),ms=Math.floor((sec-Math.floor(sec))*1000);
 return String(m).padStart(2,'0')+':'+String(s).padStart(2,'0')+'.'+String(ms).padStart(3,'0');
}
function kHybridWait(ms){return new Promise(r=>setTimeout(r,ms))}


/* v1.3 hybrid timeline preview: exact Premiere composite on pause/scrub/click,
   source proxy while playing. */
const KRALI_HYBRID={seq:0,timer:null,lastURL:'',busy:false};

function kHybridImg(){return document.getElementById('kraliTimelineFrame')}
function kHybridBadge(){return document.getElementById('kraliHybridBadge')}
function kHybridFileURL(p){
 try{return require('url').pathToFileURL(String(p)).href+'?v='+Date.now()}
 catch(_){return 'file://'+String(p).replace(/ /g,'%20')+'?v='+Date.now()}
}
function kHybridSourceMode(){
 const img=kHybridImg(),v=kFixedVideo(),b=kHybridBadge();
 if(v)v.style.display='none';
 if(img)img.style.display='block';
 if(b)b.style.display='none';
}
async function kHybridTimelineFrame(sec,delay){
 clearTimeout(KRALI_HYBRID.timer);
 KRALI_HYBRID.seq++;
 const mine=KRALI_HYBRID.seq;
 return new Promise(resolve=>{
  KRALI_HYBRID.timer=setTimeout(async()=>{
   if(mine!==KRALI_HYBRID.seq){resolve(false);return}
   try{
    KRALI_HYBRID.busy=true;
    kSyncStop();
    await kFixedEval('$._KRALI_SUB.setPlayhead('+Number(sec||0)+')');
    await kHybridWait(140);
    const os=require('os'),path=require('path'),fs=require('fs');
    const dir=path.join(os.homedir(),'Library','Application Support','KRALI','Altyazi','timeline-frames');
    try{fs.mkdirSync(dir,{recursive:true})}catch(_){}
    const raw=await kFixedEval('$._KRALI_SUB.exportHybridFrame('+JSON.stringify(dir)+','+JSON.stringify(String(Date.now()))+')');
    let r={};try{r=JSON.parse(raw||'{}')}catch(_){}
    if(mine!==KRALI_HYBRID.seq){resolve(false);return}
    if(!r.ok||!r.path)throw Error(r.message||'Timeline frame alınamadı');
    const img=kHybridImg(),v=kFixedVideo(),b=kHybridBadge();
    await new Promise((ok,bad)=>{img.onload=()=>ok();img.onerror=()=>bad(Error('PNG açılamadı'));img.src=kHybridFileURL(r.path)});
    if(v){try{v.pause()}catch(_){};v.style.display='none'}
    img.style.display='block';
    if(b)b.textContent='TIMELINE · '+kHybridFmt(sec);
    kFixedShowCaption(Number(sec||0)); kSyncUI(Number(sec||0));
    kFixedStatus('TIMELINE FRAME · '+kHybridFmt(sec)+' · Premiere composite'); kRefreshCaptionOverlays(); try{kStyleFrameSync()}catch(_){};
    // keep only a few recent stills
    try{
      const files=fs.readdirSync(dir).filter(x=>/^timeline_.*\.png/i.test(x)).map(x=>({p:path.join(dir,x),t:fs.statSync(path.join(dir,x)).mtimeMs})).sort((a,b)=>b.t-a.t);
      files.slice(8).forEach(x=>{try{fs.unlinkSync(x.p)}catch(_){}});
    }catch(_){}
    resolve(true);
   }catch(e){kFixedStatus('TIMELINE FRAME HATA: '+(e.message||e)); kHybridSourceMode(); resolve(false)}
   finally{KRALI_HYBRID.busy=false}
  },Math.max(0,Number(delay)||0));
 })
}


function kFollowCue(i,force){
 try{
  const rows=$$('.cue'); if(i<0||!rows[i])return;
  const ta=document.activeElement;
  if(!force && ta && ta.tagName==='TEXTAREA' && ta.closest('#captions'))return;
  rows[i].scrollIntoView({block:'center',behavior:'smooth'});
 }catch(_){}
}


/* v1.1.0 timeline-synced fixed preview */
const KRALI_SYNC={timeline:0,loading:false,playing:false,timer:null,lastTick:0};

function kSyncClipAt(t){
  const a=KRALI_FIXED.clips||[];
  for(let i=0;i<a.length;i++) if(t>=a[i].start && t<a[i].end) return {clip:a[i],index:i};
  return null;
}
function kSyncMediaTime(cl,t){
  return Math.max(0,Number(cl.sourceIn||0)+(Number(t)-Number(cl.start||0))*Number(cl.speed||1));
}
async function kSyncLoadAt(t,autoplay){
  const hit=kSyncClipAt(t),v=kFixedVideo();
  KRALI_SYNC.timeline=Math.max(0,Number(t)||0);
  if(!hit||!v){ if(v)try{v.pause()}catch(_){}; kFixedShowCaption(KRALI_SYNC.timeline); return false; }
  const cl=hit.clip,mt=kSyncMediaTime(cl,KRALI_SYNC.timeline);
  try{
    KRALI_SYNC.loading=true;
    if(KRALI_FIXED.active!==hit.index || !v.dataset.proxyReady){
      kFixedStatus('PREVIEW · klip '+(hit.index+1)+'/'+KRALI_FIXED.clips.length+' hazırlanıyor…');
      const pr=await kProxyFor(cl.path);
      KRALI_FIXED.active=hit.index;
      v.dataset.proxyReady='1';
      v.src=kFixedFileURL(pr.path);
      await new Promise((resolve,reject)=>{
        const ok=()=>{cleanup();resolve()}, bad=()=>{cleanup();reject(Error('Preview video açılamadı'))};
        const cleanup=()=>{v.removeEventListener('loadedmetadata',ok);v.removeEventListener('error',bad)};
        v.addEventListener('loadedmetadata',ok);v.addEventListener('error',bad);v.load();
      });
    }
    if(Math.abs((v.currentTime||0)-mt)>.08) v.currentTime=Math.min(Math.max(0,mt),isFinite(v.duration)?Math.max(0,v.duration-.02):mt);
    kFixedShowCaption(KRALI_SYNC.timeline);
    kSyncUI(KRALI_SYNC.timeline);
    if(autoplay){const p=v.play();if(p&&p.catch)await p.catch(()=>{});}
    kFixedStatus('LIVE · '+fmtMs(KRALI_SYNC.timeline)+' · klip '+(hit.index+1)+'/'+KRALI_FIXED.clips.length);
    return true;
  } finally {KRALI_SYNC.loading=false}
}
function kSyncUI(t){
  try{
    state.position=t;
    const s=$('#scrub'); if(s&&state.duration)s.value=Math.max(0,Math.min(1000,Math.round(t/state.duration*1000)));
    const c=$('#clock'); if(c)c.textContent=fmtMs(t);
    const idx=cues.findIndex(x=>t>=Number(x.start)&&t<Number(x.end));
    if(idx>=0&&idx!==selected){
      selected=idx; $$('.cue').forEach((x,n)=>x.classList.toggle('active',n===idx)); kFollowCue(idx,false);
    }
  }catch(_){}
}
function kSyncStop(){
  KRALI_SYNC.playing=false; try{kSeqStopCTI()}catch(_){}; try{kFramePlayStop()}catch(_){};
  if(KRALI_SYNC.timer){clearInterval(KRALI_SYNC.timer);KRALI_SYNC.timer=null}
  const v=kFixedVideo();if(v)try{v.pause()}catch(_){}
}
async function kSyncPlayFrom(t){
  kHybridSourceMode(); kSyncStop(); KRALI_SYNC.playing=true; KRALI_SYNC.lastTick=Date.now();
  await kSyncLoadAt(t,true);
  KRALI_SYNC.timer=setInterval(async()=>{
    if(!KRALI_SYNC.playing||KRALI_SYNC.loading)return;
    const now=Date.now(),dt=(now-KRALI_SYNC.lastTick)/1000;KRALI_SYNC.lastTick=now;
    const hit=kSyncClipAt(KRALI_SYNC.timeline),v=kFixedVideo();
    if(hit&&KRALI_FIXED.active===hit.index&&v&&!v.paused){
      KRALI_SYNC.timeline=hit.clip.start+((v.currentTime-hit.clip.sourceIn)/Math.max(.0001,hit.clip.speed));
    }else KRALI_SYNC.timeline+=dt;
    if(state.duration&&KRALI_SYNC.timeline>=state.duration){kSyncStop();return}
    const next=kSyncClipAt(KRALI_SYNC.timeline);
    if(next&&next.index!==KRALI_FIXED.active) await kSyncLoadAt(KRALI_SYNC.timeline,true);
    else {kFixedShowCaption(KRALI_SYNC.timeline);kSyncUI(KRALI_SYNC.timeline)}
  },80);
}
function kApplyFixedStyle(){
 try{
  const el=kFixedCaption(); if(!el)return;
  const rgb=hexRgb($('#bg').value),op=$('#opacity').value/100;
  const h=(document.getElementById('kraliFixedPreviewWrap')?.clientHeight||540),scale=h/Math.max(1,state.height);
  el.style.fontFamily='"'+($('#font').value||'Arial')+'"';
  el.style.fontSize=Math.max(7,Number($('#size').value)*scale)+'px';
  el.style.color=$('#color').value; el.style.background=($('#enableBg')&&!$('#enableBg').checked)?'transparent':`rgba(${rgb.join(',')},${op})`;
  el.style.borderRadius=(Number($('#radius').value)*scale)+'px';
  el.style.padding=(Number($('#padY').value)*scale)+'px '+(Number($('#padX').value)*scale)+'px';
  el.style.top=$('#pos').value+'%';el.style.left=(($('#posX')&&$('#posX').value)||50)+'%';el.style.bottom='auto';
  el.style.fontWeight=$('#bold').classList.contains('on')?'700':'400';
  el.style.fontStyle=$('#italic').classList.contains('on')?'italic':'normal';
  el.style.textTransform=$('#upper').classList.contains('on')?'uppercase':'none';
  el.style.lineHeight=($('#lineHeight').value/100);el.style.letterSpacing=(Number($('#tracking').value)*scale)+'px';
  el.style.maxWidth=$('#maxWidth').value+'%';el.style.textAlign=textAlign;
  el.style.webkitTextStroke=(($('#enableStroke')&&!$('#enableStroke').checked)?0:(Number($('#strokeWidth').value)*scale))+'px '+$('#stroke').value;
  el.style.textShadow=($('#enableShadow')&&!$('#enableShadow').checked)?'none':`0 ${Math.max(1,2*scale)}px ${Number($('#shadowBlur').value)*scale}px rgba(0,0,0,${Number($('#shadow').value)/100})`;
 }catch(_){}
}


function kNativeMediaPath(p){
 let s=String(p||'').trim();
 // Decode once/twice because CEP/ExtendScript may return an encoded URL string.
 for(let i=0;i<2;i++){try{const d=decodeURIComponent(s);if(d===s)break;s=d}catch(_){break}}
 s=s.replace(/^["']|["']$/g,'');
 s=s.replace(/^file:\/\/localhost\//i,'/');
 // Accept file:/, file://, file:///, file:////...
 s=s.replace(/^file:\/*/i,'/');
 // A malformed conversion can leave //Users; POSIX path should be /Users.
 if(/^\/\/+Users\//.test(s))s=s.replace(/^\/+/,'/');
 return s
}


function kFixedNormClip(x){
 const n=v=>{v=Number(v);return isFinite(v)?v:0};
 const path=kNativeMediaPath(x.path||x.mediaPath||x.filePath||'');
 const start=n(x.timelineStart!=null?x.timelineStart:x.start);
 const end=n(x.timelineEnd!=null?x.timelineEnd:x.end);
 const sourceIn=n(x.sourceIn!=null?x.sourceIn:x.inPoint);
 let speed=n(x.speed); if(!speed)speed=1; if(Math.abs(speed)>10)speed/=100;
 return {path:path,start:start,end:end,sourceIn:sourceIn,speed:speed,track:n(x.track)}
}


function kFixedEval(script){
 return new Promise((resolve,reject)=>{
  try{
   if(typeof CSInterface==='undefined')return reject(Error('CSInterface bulunamadı'));
   const cs=new CSInterface();
   cs.evalScript(script,r=>resolve(r));
  }catch(e){reject(e)}
 })
}


/* v1.0.2 deterministic preview stage: no text-search / parent guessing */
function kFixedStatus(s){
 const e=document.getElementById('kraliStatus'); if(e)e.textContent=String(s||'');
}
function kFixedVideo(){return document.getElementById('kraliVideoFixed')}
function kFixedCaption(){return document.getElementById('kraliCaptionFixed')}
function kFixedFileURL(p){return 'file://'+encodeURI(String(p).replace(/\\/g,'/'))}

const KRALI_FIXED={clips:[],active:-1};

async function kFixedLoad(){
 try{
  kFixedStatus('1/6 JS başladı · doğrudan CEP köprüsü açılıyor…');
  kFixedStatus('2/6 CSInterface hazır · V1 okunuyor…');
  let raw=await kFixedEval('$._KRALI_SUB.getVideoTrackClips()');
  if(!raw || raw==='EvalScript error.' || raw.indexOf('undefined')>=0){
    kFixedStatus('2/6 host.jsx yeniden yükleniyor…');
    const ext=new CSInterface().getSystemPath(SystemPath.EXTENSION).replace(/\\/g,'/');
    await kFixedEval('$.evalFile("'+ext+'/jsx/host.jsx")');
    raw=await kFixedEval('$._KRALI_SUB.getVideoTrackClips()');
  }
  let r=JSON.parse(raw||'{}'), arr=r.clips||[];
  kFixedStatus('3/6 V1 video klibi: '+arr.length);
  KRALI_FIXED.clips=arr.map(kFixedNormClip).filter(x=>{
    if(!x.path||x.end<=x.start)return false;
    if(/\.(png|jpg|jpeg|gif|bmp|tif|tiff|psd|ai|svg|webp)$/i.test(x.path))return false;
    return true;
  }).sort((a,b)=>a.start-b.start);
  if(!KRALI_FIXED.clips.length){kFixedStatus('DURDU: V1 üzerinde kullanılabilir video klibi yok.');return}
  const fs=require('fs'),cl=KRALI_FIXED.clips[0],ok=fs.existsSync(cl.path);
  kFixedStatus('4/6 Kaynak dosya '+(ok?'VAR':'YOK')+'\n'+cl.path);
  if(!ok)return;
  kFixedStatus('5/6 Proxy hazırlanıyor…\nNATIVE PATH:\n'+kNativeMediaPath(cl.path));
  const pr=await kProxyFor(cl.path);
  kFixedStatus('5/6 '+(pr.cached?'CACHE HAZIR':'PROXY HAZIR')+'\n'+pr.path);
  const v=kFixedVideo(); if(!v){kFixedStatus('DURDU: #kraliVideoFixed bulunamadı');return}
  v.src=kFixedFileURL(pr.path);
  v.onloadedmetadata=()=>{
    kFixedStatus('6/6 METADATA · VIDEO '+v.videoWidth+'×'+v.videoHeight+(v.videoWidth?' · GÖRÜNTÜ OK':' · GÖRÜNTÜ YOK'));
    try{setTimeout(()=>{const t=(state&&Number(state.position))||0;kHybridTimelineFrame(t,120)},50)}catch(_){}
  };
  v.oncanplay=()=>kFixedStatus('6/6 CANPLAY · VIDEO '+v.videoWidth+'×'+v.videoHeight+(v.videoWidth?' · GÖRÜNTÜ OK':' · GÖRÜNTÜ YOK'));
  v.onerror=()=>kFixedStatus('6/6 VIDEO HATA · mediaError='+(v.error?v.error.code:'?')+'\n'+pr.path);
  v.load();
 }catch(e){kFixedStatus('HATA:\n'+(e&&e.message?e.message:String(e)))}
}
function kFixedCue(t){
 try{
  const a=(typeof cues!=='undefined'&&Array.isArray(cues))?cues:[];
  for(let i=0;i<a.length;i++){
   const c=a[i],s=Number(c.start||0),e=Number(c.end||0);
   if(t>=s&&t<e)return c;
  }
 }catch(_){}
 return null
}
function kFixedShowCaption(t){
 const e=kFixedCaption(),c=kFixedCue(t); if(e)e.textContent=c?String(c.text||''):'';
}
window.addEventListener('load',()=>{
 // Hide the old heuristic video element/diagnostic if they exist; keep the rest of editor intact.
 setTimeout(()=>{
   const ov=document.getElementById('kraliVideo'); if(ov)ov.style.display='none';
   const od=document.getElementById('kraliDiag'); if(od)od.style.display='none';
   const ot=document.getElementById('kraliTrace'); if(ot)ot.style.display='none';
   const v=kFixedVideo(); if(v){try{v.pause()}catch(_){};v.removeAttribute('src');v.style.display='none'}
   const img=kHybridImg(); if(img)img.style.display='block';
   // boot() reads Premiere's current CTI. Give it a short moment, then request that exact composite frame.
   setTimeout(async()=>{try{
     await kHybridTimelineFrame(Number(state.position)||0,0);
     kRefreshCaptionOverlays();
   }catch(e){kFixedStatus('İLK TIMELINE KARESİ HATA: '+(e.message||e))}
   },450);
 },100);
});


function kTrace(msg){
 let e=document.getElementById('kraliTrace');
 if(!e){
   const badge=[...document.querySelectorAll('*')].find(x=>x.childElementCount===0&&x.textContent.trim().indexOf('KRALİ LIVE PREVIEW')===0);
   const box=badge&&badge.parentElement;
   if(box){e=document.createElement('div');e.id='kraliTrace';box.appendChild(e)}
 }
 if(e){e.style.cssText='position:absolute;left:10px;right:10px;top:48px;z-index:50;background:rgba(0,0,0,.88);border:1px solid #555;border-radius:7px;padding:8px 10px;color:#9fe3a8;font:12px/1.35 monospace;white-space:pre-wrap;pointer-events:none';e.textContent=msg}
}


const KRALI_PROXY={
 root:require('path').join(require('os').homedir(),'Library','Application Support','KRALI','Altyazi','preview-cache')
};
function kHash(s){
 const crypto=require('crypto');return crypto.createHash('sha1').update(String(s)).digest('hex').slice(0,20)
}
function kExec(file,args,opt){
 return new Promise((resolve,reject)=>{
  require('child_process').execFile(file,args,opt||{},(err,stdout,stderr)=>{
   if(err){err.stderr=stderr;reject(err)}else resolve({stdout,stderr})
  })
 })
}
async function kProxyFor(source){
 source=kNativeMediaPath(source);
 if(/^file:/i.test(source))throw Error('PATH NORMALIZE BAŞARISIZ: '+source);
 const fs=require('fs'),path=require('path');fs.mkdirSync(KRALI_PROXY.root,{recursive:true});
 const st=fs.statSync(source),key=kHash(source+'|'+st.size+'|'+st.mtimeMs+'|proxy-v107');
 const out=path.join(KRALI_PROXY.root,key+'.mp4');
 if(fs.existsSync(out)&&fs.statSync(out).size>100000)return {path:out,cached:true};
 const ext=path.extname(source)||'.mov';
 const staged=path.join(KRALI_PROXY.root,key+'-source'+ext);
 if(!fs.existsSync(staged)||fs.statSync(staged).size!==st.size){
   kFixedStatus('5/6 Kaynak KRALİ cache içine alınıyor…\n'+source);
   fs.copyFileSync(source,staged);
 }
 if(!fs.existsSync(staged)||fs.statSync(staged).size!==st.size)throw Error('LOCAL STAGE kopyası doğrulanamadı');
 source=staged;
 kFixedStatus('5/6 LOCAL STAGE HAZIR · avconvert başlıyor…\n'+source);
 const av='/usr/bin/avconvert';
 if(!fs.existsSync(av))throw Error('macOS avconvert bulunamadı');
 const tmp=out+'.part.mp4';try{if(fs.existsSync(tmp))fs.unlinkSync(tmp)}catch(_){}
 // Apple avconvert preset is intentionally selected from the tool itself rather than
 // depending on AME/ffmpeg. 960x540 is a lightweight, broadly decodable preview target.
 let args=['--source',source,'--output',tmp,'--preset','Preset960x540'];
 try{
   await kExec(av,args,{timeout:10*60*1000,maxBuffer:4*1024*1024});
 }catch(e){
   // Some macOS versions expose PresetMediumQuality instead of the dimension preset.
   try{await kExec(av,['--source',source,'--output',tmp,'--preset','PresetMediumQuality'],
     {timeout:10*60*1000,maxBuffer:4*1024*1024})}
   catch(e2){throw Error('Preview proxy oluşturulamadı: '+String(e2.stderr||e2.message||e2).slice(0,700))}
 }
 if(!fs.existsSync(tmp)||fs.statSync(tmp).size<10000)throw Error('Preview proxy boş oluştu');
 fs.renameSync(tmp,out);return {path:out,cached:false}
}
async function kEnsureProxy(cl){
 const fs=require('fs');if(cl&&cl.path)cl.path=kNativeMediaPath(cl.path);if(!cl||!cl.path||!fs.existsSync(cl.path))throw Error('Kaynak video bulunamadı');
 kTrace('5/6 Proxy oluşturuluyor…\n'+cl.path.split('/').pop());kDiag('LIVE: Preview hazırlanıyor…\n'+cl.path.split('/').pop());
 const p=await kProxyFor(cl.path);
 kTrace('5/6 '+(p.cached?'Proxy cache hazır.':'Proxy oluşturuldu.')+'\n'+p.path);kDiag('LIVE: '+(p.cached?'CACHE HAZIR':'PREVIEW HAZIR')+'\n'+cl.path.split('/').pop());
 return p.path
}


const KRALI_PREVIEW={clips:[],active:-1,stage:null};
function kDiag(s){const e=document.getElementById('kraliDiag');if(e)e.textContent=s}
function kStage(){
 // Locate only the existing preview box by its badge text; never use body/outer panel.
 const labels=Array.from(document.querySelectorAll('*'));
 const badge=labels.find(e=>e.children.length===0 && (e.textContent||'').trim()==='KRALİ LIVE PREVIEW');
 if(!badge)return null;
 let p=badge.parentElement;
 // Existing stage is the nearest reasonably large ancestor, capped before body.
 while(p&&p!==document.body){
   const r=p.getBoundingClientRect();
   if(r.width>180&&r.height>140)return p;
   p=p.parentElement
 }
 return null
}
function kMount(){
 const st=kStage(); if(!st){console.error('KRALI preview stage not found');return false}
 KRALI_PREVIEW.stage=st;st.classList.add('krali-live-host');
 const v=document.createElement('video');v.id='kraliVideo';v.preload='metadata';v.playsInline=true;v.controls=true;v.muted=false;
 const c=document.createElement('div');c.id='kraliCaption';
 const d=document.createElement('div');d.id='kraliDiag';d.textContent='LIVE: kaynak aranıyor…';
 st.appendChild(v);st.appendChild(c);st.appendChild(d);
 ['loadedmetadata','canplay','playing','pause','ended','stalled','waiting','error'].forEach(ev=>v.addEventListener(ev,()=>{
   const er=v.error?(' · mediaError='+v.error.code):'';
   const dims=(v.videoWidth||0)+'×'+(v.videoHeight||0);
   const cl=KRALI_PREVIEW.clips[KRALI_PREVIEW.active];
   const nm=cl&&cl.path?cl.path.split('/').pop():'?';
   kDiag('LIVE: '+ev+' · VIDEO '+dims+er+(v.videoWidth?' · GÖRÜNTÜ OK':' · GÖRÜNTÜ AKIŞI YOK')+'\n'+nm);
   if(ev==='loadedmetadata'||ev==='canplay'||ev==='error')kTrace('6/6 '+ev+' · VIDEO '+dims+er+(v.videoWidth?' · GÖRÜNTÜ OK':' · GÖRÜNTÜ YOK')+'\n'+nm);
 }));
 v.addEventListener('timeupdate',kTick);
 return true
}
function kFileURL(p){
 let s=String(p||'').replace(/\\/g,'/');
 if(!s.startsWith('/'))s='/'+s;
 // CEP Chromium handles file URLs better with encodeURI while retaining slashes.
 return 'file://'+encodeURI(s)
}
async function kLoadMap(){
 try{
  kTrace('1/6 Premiere köprüsü kontrol ediliyor…');
  if(typeof evalHost!=='function'){kTrace('1/6 evalHost bekleniyor…');kDiag('LIVE: Premiere köprüsü hazırlanıyor…');setTimeout(kLoadMap,150);return}
  kTrace('2/6 Premiere köprüsü hazır · V1 klipleri okunuyor…');
  const ti=Number((document.getElementById('track')||{}).value||0);
  let raw=await evalHost('$._KRALI_SUB.getVideoTrackClips()');
  let r=JSON.parse(raw||'{}');
  let arr=r.clips||[];
  kTrace('3/6 V1 video klibi: '+arr.length);
  let sourceLabel='VIDEO TRACK';
  if(!arr.length){
    raw=await evalHost('$._KRALI_SUB.previewMediaMap('+ti+')');r=JSON.parse(raw||'{}');
    arr=r.clips||r.items||r.audioClips||[];sourceLabel='AUDIO TRACK FALLBACK';
  }
  KRALI_PREVIEW.clips=arr.map(x=>({
    path:x.path||x.mediaPath||x.file||'',
    start:Number(x.timelineStart??x.start??0),
    end:Number(x.timelineEnd??x.end??0),
    pin:Number(x.sourceIn??x.inPoint??x.sourceStart??0),
    speed:Number(x.speed||1)
  })).filter(x=>x.path&&isFinite(x.start)&&isFinite(x.end)).sort((a,b)=>a.start-b.start);
  if(!KRALI_PREVIEW.clips.length){kDiag('LIVE: A'+(ti+1)+' üzerinde kaynak medya yolu bulunamadı');return}
  const fs=require('fs'),p=KRALI_PREVIEW.clips[0].path,exists=fs.existsSync(p);
  kDiag('LIVE: '+sourceLabel+' · '+KRALI_PREVIEW.clips.length+' klip · '+(exists?'DOSYA VAR':'DOSYA YOK')+'\n'+p.split('/').pop());
  if(exists){kTrace('5/6 Proxy motoru başlatılıyor…');kSeek(KRALI_PREVIEW.clips[0].start,false)}
  else kTrace('DURDU: Kaynak video dosyası bulunamadı.')
 }catch(e){kDiag('LIVE MAP HATA: '+e.message)}
}
function kClip(t){return KRALI_PREVIEW.clips.find(x=>t>=x.start&&t<x.end)}
function kCue(t){return cues.find(c=>t>=Number(c.start)&&t<Number(c.end))}
function kCaption(t){
 const e=document.getElementById('kraliCaption'),v=document.getElementById('kraliVideo'),c=kCue(t);
 if(e)e.textContent=(v&&v.readyState>=1&&v.videoWidth===0)?'':(c?String(c.text||''):''); try{kFixedShowCaption(t)}catch(_){}
}
function kSeek(t,play){
 const v=document.getElementById('kraliVideo');if(!v)return;
 t=Math.max(0,Number(t)||0);kCaption(t);
 const cl=kClip(t);if(!cl){kDiag('LIVE: '+t.toFixed(2)+' sn için kaynak klip yok');return}
 const idx=KRALI_PREVIEW.clips.indexOf(cl),mt=Math.max(0,cl.pin+(t-cl.start)*cl.speed);
 const go=()=>{try{v.currentTime=mt;if(play){const q=v.play();if(q&&q.catch)q.catch(e=>kDiag('PLAY HATA: '+e.message))}}catch(e){kDiag('SEEK HATA: '+e.message)}};
 if(KRALI_PREVIEW.active!==idx){
   KRALI_PREVIEW.active=idx;
   kEnsureProxy(cl).then(pp=>{
     // selection may have changed while proxy was being generated
     if(KRALI_PREVIEW.active!==idx)return;
     v.src=kFileURL(pp);v.load();
     if(v.readyState>=1)go();else v.addEventListener('loadedmetadata',go,{once:true})
   }).catch(e=>{kTrace('PROXY HATA:\n'+e.message);kDiag('PROXY HATA: '+e.message)})
 }else go()
}
function kTick(){
 const v=document.getElementById('kraliVideo'),cl=KRALI_PREVIEW.clips[KRALI_PREVIEW.active];if(!v||!cl)return;
 const t=cl.start+(v.currentTime-cl.pin)/Math.max(.001,cl.speed);kCaption(t)
}
function kBootWhenReady(){
 let tries=0;
 const go=()=>{
   tries++;
   if(typeof evalHost==='function'){
     if(kMount())setTimeout(kLoadMap,250);
     return;
   }
   if(tries<50)setTimeout(go,100);
   else console.error('KRALI: evalHost initialization timeout');
 };
 go();
}
window.addEventListener('load',()=>setTimeout(kBootWhenReady,0));
document.addEventListener('focusin',e=>{
 const ta=e.target;if(!ta||ta.tagName!=='TEXTAREA'||!ta.closest('#captions'))return;
 const i=Array.from($$('#captions textarea')).indexOf(ta);if(i>=0&&cues[i])kSeek(cues[i].start,false)
});
document.addEventListener('input',e=>{
 const ta=e.target;if(!ta||ta.tagName!=='TEXTAREA'||!ta.closest('#captions'))return;
 const i=Array.from($$('#captions textarea')).indexOf(ta);
 if(i>=0&&cues[i]){const ce=document.getElementById('kraliCaption');if(ce)ce.textContent=ta.value}
});


function cueWordBoundary(cue,caret){
 const text=String(cue.text||''),left=text.slice(0,caret).trim(),right=text.slice(caret).trim();
 if(!left||!right)return null;
 const leftCount=(left.match(/\S+/g)||[]).length, ws=Array.isArray(cue.words)?cue.words:[];
 if(ws.length>=2 && leftCount>0 && leftCount<ws.length){
   const split=Number(ws[leftCount].start);
   if(isFinite(split))return {time:split,leftWords:ws.slice(0,leftCount),rightWords:ws.slice(leftCount)}
 }
 // fallback only when word timestamps are unavailable
 const ratio=Math.max(.08,Math.min(.92,caret/Math.max(1,text.length)));
 return {time:cue.start+(cue.end-cue.start)*ratio,leftWords:[],rightWords:[]}
}
async function monitorGoto(sec){kSyncStop();await kHybridTimelineFrame(Number(sec||0),0);}
async function monitorPlay(sec){const s=Math.max(0,Number(sec||0)-.20);await kSeqPlayFrom(s);try{await kFixedEval('$._KRALI_SUB.gotoSeconds('+s+')')}catch(_){}}
function splitCueAtCaret(i,ta){
 const c=cues[i],caret=ta.selectionStart,b=cueWordBoundary(c,caret);if(!b)return false;
 const left=ta.value.slice(0,caret).trim(),right=ta.value.slice(caret).trim();
 const oldEnd=c.end;
 c.text=left;c.end=b.time;if(b.leftWords.length)c.words=b.leftWords;
 const nc={start:b.time,end:oldEnd,text:right,words:b.rightWords};
 cues.splice(i+1,0,nc);renderCues();monitorGoto(b.time);
 setTimeout(()=>{let xs=$$('#captions textarea');if(xs[i+1]){xs[i+1].focus();xs[i+1].setSelectionRange(0,0)}},0);
 return true
}
function mergeCueWithPrevious(i){
 if(i<=0)return false;let a=cues[i-1],b=cues[i];
 a.text=(String(a.text||'').trim()+' '+String(b.text||'').trim()).trim();
 a.end=b.end;a.words=[...(a.words||[]),...(b.words||[])];
 cues.splice(i,1);renderCues();monitorGoto(a.start);
 setTimeout(()=>{let xs=$$('#captions textarea');if(xs[i-1]){xs[i-1].focus();xs[i-1].setSelectionRange(String(a.text).length,String(a.text).length)}},0);
 return true
}


function wav48To16Mono(src,dst){
 const fs=require('fs'),fd=fs.openSync(src,'r'),head=Buffer.alloc(44);fs.readSync(fd,head,0,44,0);
 if(head.toString('ascii',0,4)!=='RIFF'||head.toString('ascii',8,12)!=='WAVE'){fs.closeSync(fd);throw Error('Premiere WAV biçimi okunamadı.')}
 let pos=12,fmt=null,dataPos=0,dataLen=0,st=fs.fstatSync(fd);
 while(pos+8<=st.size){
  let ch=Buffer.alloc(8);fs.readSync(fd,ch,0,8,pos);let id=ch.toString('ascii',0,4),len=ch.readUInt32LE(4),p=pos+8;
  if(id==='fmt '){let b=Buffer.alloc(Math.min(len,40));fs.readSync(fd,b,0,b.length,p);fmt={format:b.readUInt16LE(0),channels:b.readUInt16LE(2),rate:b.readUInt32LE(4),bits:b.readUInt16LE(14)}}
  if(id==='data'){dataPos=p;dataLen=len;break}
  pos=p+len+(len%2)
 }
 if(!fmt||!dataPos||fmt.format!==1||fmt.bits!==16){fs.closeSync(fd);throw Error('WAV PCM16 değil.')}
 const outRate=16000,ratio=fmt.rate/outRate,frames=Math.floor((dataLen/(2*fmt.channels))/ratio),out=Buffer.alloc(44+frames*2);
 out.write('RIFF',0);out.writeUInt32LE(36+frames*2,4);out.write('WAVEfmt ',8);out.writeUInt32LE(16,16);out.writeUInt16LE(1,20);out.writeUInt16LE(1,22);out.writeUInt32LE(outRate,24);out.writeUInt32LE(outRate*2,28);out.writeUInt16LE(2,32);out.writeUInt16LE(16,34);out.write('data',36);out.writeUInt32LE(frames*2,40);
 const blockFrames=262144,buf=Buffer.alloc(blockFrames*fmt.channels*2);let outI=0,srcFrame=0,next=0,readPos=dataPos,remaining=dataLen;
 while(remaining>0&&outI<frames){
  let n=Math.min(buf.length,remaining);n-=n%(fmt.channels*2);fs.readSync(fd,buf,0,n,readPos);let got=n/(fmt.channels*2);
  while(next<srcFrame+got&&outI<frames){
   let rel=Math.max(0,Math.min(got-1,Math.round(next-srcFrame))),sum=0;
   for(let c=0;c<fmt.channels;c++)sum+=buf.readInt16LE((rel*fmt.channels+c)*2);
   out.writeInt16LE(Math.max(-32768,Math.min(32767,Math.round(sum/fmt.channels))),44+outI*2);outI++;next=outI*ratio;
  }
  srcFrame+=got;readPos+=n;remaining-=n
 }
 fs.closeSync(fd);fs.writeFileSync(dst,out.subarray(0,44+outI*2));
}


window.addEventListener('error',function(ev){bootError(ev.error||ev.message)});
document.addEventListener('DOMContentLoaded',function(){
 try{
  ['#track','#lang','#quality','#generate','#captions','#status'].forEach(must);
  if($('#captionPreview'))$('#captionPreview').textContent='';
  if($('#captionPreview2'))$('#captionPreview2').textContent='';
 }catch(e){bootError(e)}
});

const cs=new CSInterface(), $=s=>document.querySelector(s), $$=s=>Array.from(document.querySelectorAll(s));
let state={width:1920,height:1080,duration:0,position:0}, selected=0, textAlign='center', audioMap=null;
let cues=[];
function evalHost(code){return new Promise(r=>cs.evalScript(code,r))}
function esc(s){return String(s).replace(/\\/g,'\\\\').replace(/"/g,'\\"')}
function fmt(sec){sec=Math.max(0,Number(sec)||0);let m=Math.floor(sec/60),s=Math.floor(sec%60);return String(m).padStart(2,'0')+':'+String(s).padStart(2,'0')}
function fmtMs(sec){sec=Math.max(0,Number(sec)||0);let m=Math.floor(sec/60),s=Math.floor(sec%60),ms=Math.floor((sec-Math.floor(sec))*1000);return String(m).padStart(2,'0')+':'+String(s).padStart(2,'0')+'.'+String(ms).padStart(3,'0')}
async function boot(){
 const root=cs.getSystemPath(SystemPath.EXTENSION).replace(/\\/g,'/'); await evalHost('$.evalFile("'+esc(root)+'/jsx/host.jsx")');
 await readState(); await readAudioMap(); checkEngine(); renderCues(); fonts(); stylePreview();
 try{
   const vv=kFixedVideo();if(vv){try{vv.pause()}catch(_){};vv.removeAttribute('src');vv.style.display='none'}
   const im=kHybridImg();if(im)im.style.display='block';
   await kHybridTimelineFrame(Number(state.position)||0,0);
 }catch(e){$('#status').textContent='İlk sequence karesi alınamadı: '+(e.message||e)}
 try{
   const v=kFixedVideo();if(v){try{v.pause()}catch(_){};v.style.display='none'}
   await kHybridTimelineFrame(Number(state.position)||0,0);
 }catch(_){}
}


function execFileP(file,args,opts){return new Promise((resolve,reject)=>{try{const cp=require('child_process');cp.execFile(file,args,opts||{},(err,stdout,stderr)=>err?reject(Object.assign(err,{stdout,stderr})):resolve({stdout,stderr}))}catch(e){reject(e)}})}
function q(s){return String(s||'')}
function engineHome(){
 const path=require('path'),os=require('os');
 return path.join(os.homedir(),'Library','Application Support','KRALI','Altyazi');
}
function findWhisperAssets(){
 try{
  const fs=require('fs'),path=require('path'),root=cs.getSystemPath(SystemPath.EXTENSION),home=engineHome();
  const bins=[path.join(home,'bin','whisper-cli'),path.join(root,'bin','whisper-cli'),path.join(root,'bin','main')];
  const binary=bins.find(p=>fs.existsSync(p));
  let model=null;
  for(const md of [path.join(home,'models'),path.join(root,'models')]){
   try{let files=fs.readdirSync(md),want=(($('#quality')?$('#quality').value:'fast')==='quality');
let f=want ? (files.find(x=>/^ggml-large-v3-turbo-q5_0\.bin$/i.test(x)) || files.find(x=>/^ggml-small\.bin$/i.test(x))) : (files.find(x=>/^ggml-small-q5_1\.bin$/i.test(x)) || files.find(x=>/^ggml-small\.bin$/i.test(x)));
if(!f)f=files.find(x=>/^ggml-.*\.bin$/i.test(x));if(f){model=path.join(md,f);break}}catch(_){}
  }
  let vad=null;for(const vd of [path.join(home,'models'),path.join(root,'models')]){try{let vf=fs.readdirSync(vd).find(x=>/silero.*\.bin$/i.test(x));if(vf){vad=path.join(vd,vf);break}}catch(_){}}
  return {root,home,binary,model,vad}
 }catch(_){return {}}
}
async function downloadTo(url,out,onProgress){
 const fs=require('fs'),https=require('https'),path=require('path');fs.mkdirSync(path.dirname(out),{recursive:true});
 return new Promise((resolve,reject)=>{
  const get=(u,redirects)=>{
   if(redirects>8)return reject(Error('Çok fazla yönlendirme.'));
   const mod=u.startsWith('https:')?require('https'):require('http');
   mod.get(u,{headers:{'User-Agent':'KRALI-ALTYAZI/0.6'}},res=>{
    if(res.statusCode>=300&&res.statusCode<400&&res.headers.location){let nu=new URL(res.headers.location,u).toString();res.resume();return get(nu,redirects+1)}
    if(res.statusCode!==200){res.resume();return reject(Error('İndirme HTTP '+res.statusCode))}
    const total=Number(res.headers['content-length']||0);let got=0,tmp=out+'.part',w=fs.createWriteStream(tmp);
    res.on('data',d=>{got+=d.length;if(onProgress&&total)onProgress(got,total)});res.pipe(w);
    w.on('finish',()=>w.close(()=>{try{fs.renameSync(tmp,out);resolve(out)}catch(e){reject(e)}}));w.on('error',reject)
   }).on('error',reject)
  };get(url,0)
 })
}
async function verifyWhisperBinary(bin){
 const fs=require('fs'),path=require('path');
 if(!bin||!fs.existsSync(bin))throw Error('whisper-cli bulunamadı.');
 try{fs.chmodSync(bin,0o755)}catch(_){}
 try{await execFileP('/usr/bin/xattr',['-d','com.apple.quarantine',bin],{timeout:10000})}catch(_){}
 try{
  let r=await execFileP(bin,['--help'],{timeout:20000,maxBuffer:4*1024*1024});
  let text=(r.stdout||'')+(r.stderr||'');
  if(!/whisper|usage|model/i.test(text))throw Error('Beklenmeyen binary çıktısı.');
  return true;
 }catch(e){throw Error('whisper-cli çalıştırma testi başarısız: '+((e.stderr||e.message||'').slice(0,180)))}
}
async function installEngine(){
 const fs=require('fs'),path=require('path'),home=engineHome(),binDir=path.join(home,'bin'),modelDir=path.join(home,'models');
 fs.mkdirSync(binDir,{recursive:true});fs.mkdirSync(modelDir,{recursive:true});
 $('#installEngine').disabled=true;$('#progress').classList.remove('hidden');$('#status').classList.remove('statusError');
 try{
  const zip=path.join(home,'whisper-cpp-darwin-arm64.zip'),unpack=path.join(home,'unpack');
  $('#status').textContent='1/4 · Apple Silicon Whisper motoru indiriliyor…';$('#progress').value=3;
  await downloadTo('https://github.com/sjoerdteunisse/whisper.cpp/releases/download/v1.0.0/whisper-cpp-darwin-arm64.zip',zip,(a,b)=>$('#progress').value=3+Math.round(a/b*17));
  try{fs.rmSync(unpack,{recursive:true,force:true})}catch(_){}fs.mkdirSync(unpack,{recursive:true});
  $('#status').textContent='2/4 · Motor paketi açılıyor…';
  await execFileP('/usr/bin/ditto',['-x','-k',zip,unpack],{timeout:120000});
  function walk(d){let out=[];for(const e of fs.readdirSync(d,{withFileTypes:true})){let q=path.join(d,e.name);if(e.isDirectory())out=out.concat(walk(q));else out.push(q)}return out}
  const files=walk(unpack);
  // Do not assume one filename. Prefer the actual CLI, then "main"; reject server/libs.
  let candidates=files.filter(f=>{let n=path.basename(f).toLowerCase();return !/\.(dylib|so|a|h|hpp|txt|md|json)$/.test(n)&&!/(server|bench|quantize|stream)/.test(n)&&(n==='whisper-cli'||n==='main'||n.includes('whisper'))});
  let wb=null,errors=[];
  for(const c of candidates){
    try{await verifyWhisperBinary(c);wb=c;break}catch(e){errors.push(path.basename(c)+': '+e.message)}
  }
  if(!wb)throw Error('Pakette çalışan Whisper CLI bulunamadı. Dosyalar: '+files.map(x=>path.basename(x)).slice(0,12).join(', ')+(errors.length?' · Test: '+errors[0]:''));
  const target=path.join(binDir,'whisper-cli');fs.copyFileSync(wb,target);await verifyWhisperBinary(target);
  $('#status').textContent='3/4 · Motor doğrulandı. Türkçe model indiriliyor…';$('#progress').value=25;
  const quality=(($('#quality')?$('#quality').value:'fast')==='quality'),modelName=quality?'ggml-large-v3-turbo-q5_0.bin':'ggml-small-q5_1.bin';
  const model=path.join(modelDir,modelName),minSize=quality?500*1024*1024:100*1024*1024;
  if(!fs.existsSync(model)||fs.statSync(model).size<minSize){
    $('#status').textContent='3/4 · '+(quality?'Kaliteli':'Hızlı')+' Türkçe model indiriliyor…';
    await downloadTo('https://huggingface.co/ggerganov/whisper.cpp/resolve/main/'+modelName+'?download=true',model,(a,b)=>$('#progress').value=25+Math.round(a/b*70));
  }
  if(!fs.existsSync(model)||fs.statSync(model).size<minSize)throw Error('Model dosyası eksik/bozuk.');
  const vad=path.join(modelDir,'ggml-silero-v6.2.0.bin');
  if(!fs.existsSync(vad)||fs.statSync(vad).size<500000){
    $('#status').textContent='3/4 · Silero VAD indiriliyor…';
    await downloadTo('https://huggingface.co/ggml-org/whisper-vad/resolve/main/ggml-silero-v6.2.0.bin?download=true',vad,(a,b)=>$('#progress').value=90+Math.round(a/b*8));
  }
  $('#status').textContent='4/4 · Motor ve model hazır ✓';$('#progress').value=100;checkEngine();
 }catch(e){
  $('#status').textContent='Kurulum hatası: '+e.message;$('#status').classList.add('statusError');
 }finally{$('#installEngine').disabled=false;setTimeout(()=>$('#progress').classList.add('hidden'),1600)}
}
async function prepareClipWav(clip,index,tmp){
 const path=require('path'),fs=require('fs'),src=q(clip.path);if(!src||!fs.existsSync(src))throw Error('Kaynak medya bulunamadı: '+q(clip.name));
 const raw=path.join(tmp,'clip_'+index+'_raw.wav'),out=path.join(tmp,'clip_'+index+'.wav');
 // afconvert gives whisper-compatible mono 16 kHz PCM without AME/FFmpeg.
 await execFileP('/usr/bin/afconvert',[src,raw,'-f','WAVE','-d','LEI16@16000','-c','1'],{timeout:180000});
 // Source in/out is applied later by whisper offset/duration so no external cutter is required.
 return raw
}
function parseWhisperJson(obj,clip){
 let words=[],trans=obj&&obj.transcription||[];
 trans.forEach(seg=>{
  (seg.tokens||[]).forEach(t=>{
   let txt=q(t.text||t.token||'').trim();if(!txt||/^(\[.*\]|<\|.*\|>)$/.test(txt))return;
   let off=t.offsets||{},a=Number(off.from),b=Number(off.to);
   if(!isFinite(a)||!isFinite(b))return;
   let sourceSec=a/1000,sourceEnd=b/1000,inP=Number(clip.inPoint||0),outP=Number(clip.outPoint||1e12);
   if(sourceEnd<inP||sourceSec>outP)return;
   let speed=Number(clip.speed||100)/100;if(!speed||speed<0)speed=1;
   let start=Number(clip.start)+(Math.max(sourceSec,inP)-inP)/speed;
   let end=Number(clip.start)+(Math.min(sourceEnd,outP)-inP)/speed;
   if(end>=start)words.push({word:txt,start,end});
  })
 });
 // Some whisper JSON builds expose only segment-level tokens. Fallback to segment text/time.
 if(!words.length)trans.forEach(seg=>{let o=seg.offsets||{},a=Number(o.from)/1000,b=Number(o.to)/1000,txt=q(seg.text).trim();if(!txt||!isFinite(a)||!isFinite(b))return;let inP=Number(clip.inPoint||0),outP=Number(clip.outPoint||1e12);if(b<inP||a>outP)return;let speed=Number(clip.speed||100)/100;if(!speed||speed<0)speed=1;let parts=txt.split(/\s+/),dur=Math.max(.05,(Math.min(b,outP)-Math.max(a,inP))/Math.max(1,parts.length));parts.forEach((w,j)=>{let ss=Number(clip.start)+(Math.max(a,inP)-inP+j*dur)/speed;words.push({word:w,start:ss,end:ss+dur/speed})})});
 return words
}
function cacheDir(){
 const path=require('path'),fs=require('fs'),d=path.join(engineHome(),'cache');fs.mkdirSync(d,{recursive:true});return d
}
function hashKey(s){
 const crypto=require('crypto');return crypto.createHash('sha1').update(String(s)).digest('hex')
}
function mediaCacheKey(path,model,lang){
 const fs=require('fs');let stat='';try{let x=fs.statSync(path);stat=x.size+':'+x.mtimeMs}catch(_){}
 return hashKey(path+'|'+stat+'|'+model+'|'+lang)
}
function normalizeWhisperWords(obj){
 // whisper.cpp -ml 1 can expose tokenizer pieces. Reconstruct display words
 // while preserving first/last source timestamp for future word highlighting.
 let pieces=[],trans=obj&&obj.transcription||[];
 trans.forEach(seg=>(seg.tokens||[]).forEach(t=>{
   let raw=q(t.text||t.token||'');if(!raw||/^(\[.*\]|<\|.*\|>)$/.test(raw.trim()))return;
   let o=t.offsets||{},a=Number(o.from)/1000,b=Number(o.to)/1000;
   if(isFinite(a)&&isFinite(b))pieces.push({raw,sourceStart:a,sourceEnd:b})
 }));
 let words=[],cur=null;
 const flush=()=>{if(cur&&cur.word&&cur.word!=='...'){cur.word=cur.word.replace(/\s+/g,' ').trim();if(cur.word)words.push(cur)}cur=null};
 for(const x of pieces){
   let r=x.raw,lead=/^\s/.test(r),txt=r.trim();
   if(!txt)continue;
   // punctuation attaches to the previous lexical word
   if(/^[,.;:!?…]+$/.test(txt)){if(cur){cur.word+=txt;cur.sourceEnd=x.sourceEnd}else if(words.length){words[words.length-1].word+=txt;words[words.length-1].sourceEnd=x.sourceEnd}continue}
   // A leading whitespace is whisper's reliable word boundary. No leading
   // whitespace => tokenizer continuation, common with Turkish suffixes.
   if(lead||!cur){flush();cur={word:txt,sourceStart:x.sourceStart,sourceEnd:x.sourceEnd}}
   else{cur.word+=txt;cur.sourceEnd=x.sourceEnd}
 }
 flush();
 if(!words.length)trans.forEach(seg=>{
   let o=seg.offsets||{},a=Number(o.from)/1000,b=Number(o.to)/1000,txt=q(seg.text).trim();
   if(!txt||txt==='...'||!isFinite(a)||!isFinite(b))return;
   let parts=txt.split(/\s+/),dur=Math.max(.04,(b-a)/Math.max(1,parts.length));
   parts.forEach((w,j)=>words.push({word:w,sourceStart:a+j*dur,sourceEnd:a+(j+1)*dur}))
 });
 return words
}
function mapSourceWordsToClip(srcWords,clip){
 let out=[],inP=Number(clip.inPoint||0),outP=Number(clip.outPoint||1e12),speed=Number(clip.speed||100)/100;
 if(!speed||speed<=0)speed=1;
 for(const w of srcWords){
  if(w.sourceEnd<inP||w.sourceStart>outP)continue;
  let a=Math.max(w.sourceStart,inP),b=Math.min(w.sourceEnd,outP);
  out.push({word:w.word,start:Number(clip.start)+(a-inP)/speed,end:Number(clip.start)+(b-inP)/speed})
 }
 return out
}
function buildTimelineJobs(clips){
 // Each job is anchored to a Premiere timeline clip. Adjacent pieces from the
 // same source are merged only if source AND timeline continuity agree.
 let xs=clips.filter(c=>c.path&&Number(c.end)>Number(c.start)).slice().sort((a,b)=>a.start-b.start),jobs=[];
 for(const c of xs){
  let speed=Number(c.speed||100)/100;if(!speed||speed<=0)speed=1;
  let cur={path:c.path,timelineStart:Number(c.start),timelineEnd:Number(c.end),sourceStart:Number(c.inPoint),sourceEnd:Number(c.outPoint),speed,clips:[c]};
  let last=jobs[jobs.length-1];
  if(last&&last.path===cur.path&&Math.abs(cur.timelineStart-last.timelineEnd)<.18&&Math.abs(cur.sourceStart-last.sourceEnd)<.25&&Math.abs(cur.speed-last.speed)<.01){
    last.timelineEnd=cur.timelineEnd;last.sourceEnd=cur.sourceEnd;last.clips.push(c)
  }else jobs.push(cur)
 }
 return jobs
}
async function transcribeTimelineJob(job,assets,lang,index,total){
 const fs=require('fs'),path=require('path'),os=require('os');
 let stat='';try{let x=fs.statSync(job.path);stat=x.size+':'+x.mtimeMs}catch(_){}
 let key=hashKey(job.path+'|'+stat+'|'+assets.model+'|'+lang+'|'+job.sourceStart.toFixed(3)+'-'+job.sourceEnd.toFixed(3)+'|sync064'),cache=path.join(cacheDir(),key+'.json');
 if(fs.existsSync(cache)){try{let x=JSON.parse(fs.readFileSync(cache,'utf8'));if(Array.isArray(x))return x}catch(_){}}
 let tmp=path.join(os.tmpdir(),'KRALI_ALTYAZI','sync_'+key);fs.mkdirSync(tmp,{recursive:true});
 let wav=path.join(tmp,'source.wav'),base=path.join(tmp,'result');
 if(!fs.existsSync(wav)){
   $('#status').textContent='Ses hazırlanıyor '+index+'/'+total;
   await execFileP('/usr/bin/afconvert',[job.path,wav,'-f','WAVE','-d','LEI16@16000','-c','1'],{timeout:300000});
 }
 let srcA=Math.max(0,job.sourceStart),srcB=Math.max(srcA+.05,job.sourceEnd),off=Math.floor(srcA*1000),dur=Math.ceil((srcB-srcA)*1000);
 $('#status').textContent='Transkripsiyon '+index+'/'+total+' · timeline '+fmt(job.timelineStart);
 let args=['-m',assets.model,'-f',wav,'-l',lang,'-ojf','-of',base,'-ot',String(off),'-d',String(dur)];
 await execFileP(assets.binary,args,{timeout:1800000,maxBuffer:80*1024*1024});
 let jp=base+'.json';if(!fs.existsSync(jp))throw Error('Whisper JSON çıktısı oluşmadı.');
 let src=normalizeWhisperWords(JSON.parse(fs.readFileSync(jp,'utf8'))),out=[];
 // Crucial v0.6.4 rule: returned times are converted to REGION-LOCAL time,
 // then anchored to Premiere's absolute clip timeline start.
 for(const w of src){
   let a=w.sourceStart,b=w.sourceEnd;
   // whisper builds may return absolute source time or offset-local time.
   let localA=(a>=srcA-.5)?a-srcA:a,localB=(b>=srcA-.5)?b-srcA:b;
   if(localB<-.15||localA>(srcB-srcA)+.5)continue;
   localA=Math.max(0,localA);localB=Math.max(localA,localB);
   let ts=job.timelineStart+localA/job.speed,te=job.timelineStart+localB/job.speed;
   if(ts<=job.timelineEnd+.35)out.push({word:w.word,start:ts,end:Math.min(te,job.timelineEnd+.35)})
 }
 fs.writeFileSync(cache,JSON.stringify(out));return out
}
async function transcribeTimeline(){
 const assets=findWhisperAssets();if(!assets.binary||!assets.model)throw Error('Whisper motor/model bulunamadı.');
 const fs=require('fs'),path=require('path'),os=require('os'),lang=$('#lang').value==='auto'?'auto':$('#lang').value;
 const seqKey=hashKey((state.name||'sequence')+'|'+state.duration+'|'+($('#track').value||0)+'|'+JSON.stringify((audioMap&&audioMap.clips||[]).map(c=>[c.path,c.start,c.end,c.inPoint,c.outPoint,c.speed]))+'|'+assets.model+'|mix0721-stable');
 const tmp=path.join(os.tmpdir(),'KRALI_ALTYAZI','mix_'+seqKey);fs.mkdirSync(tmp,{recursive:true});
 const mix48=path.join(tmp,'sequence_mix.wav'),mix16=path.join(tmp,'sequence_16k.wav'),base=path.join(tmp,'result');
 $('#progress').classList.remove('hidden');$('#progress').value=5;
 $('#status').textContent='1/3 · Premiere sequence sesi hazırlanıyor…';
 if(!fs.existsSync(mix48)){
   const raw=await evalHost('$._KRALI_SUB.exportSequenceAudio('+Number($('#track').value||0)+','+JSON.stringify(mix48)+')');
   const r=JSON.parse(raw);if(!r.ok)throw Error(r.message||'Sequence audio export başarısız.');
 }
 $('#progress').value=25;$('#status').textContent='2/3 · Ses hızlıca 16 kHz hazırlanıyor…';
 if(!fs.existsSync(mix16))wav48To16Mono(mix48,mix16);
 $('#progress').value=35;$('#status').textContent='3/3 · Whisper transkripsiyonu…';
 let args=['-m',assets.model,'-f',mix16,'-l',lang,'-ojf','-of',base,'-bs','5','-bo','5','-tp','0','-sow','-sns'];
 if(assets.vad)args.push('--vad','-vm',assets.vad,'-vt','0.50','-vspd','180','-vsd','320','-vp','80');
 await execFileP(assets.binary,args,{timeout:3600000,maxBuffer:100*1024*1024});
 const jsonPath=base+'.json';if(!fs.existsSync(jsonPath))throw Error('Whisper JSON çıktısı oluşmadı.');
 const src=normalizeWhisperWords(JSON.parse(fs.readFileSync(jsonPath,'utf8')));
 // No source→timeline conversion: exported WAV starts at sequence 00:00.
 const words=src.map(w=>({word:w.word,start:w.sourceStart,end:w.sourceEnd})).filter(w=>isFinite(w.start)&&isFinite(w.end)&&w.end>=w.start);
 $('#progress').value=100;return words
}
async function readAudioMap(){
 try{
  const raw=await evalHost('$._KRALI_SUB.getAudioTrackClips('+Number($('#track').value||0)+')');
  const r=JSON.parse(raw);if(r.ok){audioMap=r;const n=r.clips.length,u=new Set(r.clips.map(x=>x.path).filter(Boolean)).size;$('#engineDetail').textContent=n+' timeline klibi · '+u+' benzersiz kaynak';}
 }catch(_){}
}
function checkEngine(){
 const card=$('.engineCard'),title=$('#engineTitle'),detail=$('#engineDetail'),a=findWhisperAssets(),btn=$('#installEngine');
 card.classList.remove('ready','missing');
 if(a.binary&&a.model){card.classList.add('ready');title.textContent='Sequence Mix transkripsiyon motoru hazır';detail.textContent=require('path').basename(a.model)+' · '+(audioMap?audioMap.clips.length:0)+' klip / '+(audioMap?new Set(audioMap.clips.map(x=>x.path).filter(Boolean)).size:0)+' kaynak';btn.classList.add('hidden');return true}
 card.classList.add('missing');title.textContent='Yerel motor kurulmalı';detail.textContent='Seçilen kalite için yerel model gerekli';btn.classList.remove('hidden');return false
}
function regroupWords(words,mode,limit){
 if(!words||!words.length)return [];
 if(mode==='words'){
  limit=Math.max(1,Number(limit)||4);let out=[];
  for(let i=0;i<words.length;i+=limit){let g=words.slice(i,i+limit);out.push({start:g[0].start,end:g[g.length-1].end,text:g.map(x=>x.word).join(' ').replace(/\s+([,.!?;:])/g,'$1'),words:g})}
  return out
 }
 const maxWords=mode==='short'?5:11,maxDur=mode==='short'?2.4:5.2,pause=mode==='short'?.42:.72;
 let out=[],g=[];
 const push=()=>{if(!g.length)return;let text=g.map(x=>x.word).join(' ').replace(/\s+([,.!?;:])/g,'$1').replace(/\.{3,}/g,'…').trim();if(text&&text!=='…')out.push({start:g[0].start,end:g[g.length-1].end,text,words:g.slice()});g=[]};
 words.forEach((w,i)=>{
   if(!w.word||w.word==='...'||w.word==='…')return;
   if(g.length){
     let prev=g[g.length-1],gap=w.start-prev.end;
     if(gap>pause||w.start-g[0].start>maxDur||g.length>=maxWords)push();
   }
   g.push(w);
   if(/[.!?…]$/.test(w.word))push();
 });
 push();return out
}
async function readState(){
 const raw=await evalHost('$._KRALI_SUB.getState()');
 try{const st=JSON.parse(raw);if(!st.ok)throw Error(st.message);state=st;$('#seq').textContent=`${st.name} · ${st.width}×${st.height}`;$('#track').innerHTML=st.tracks.map(x=>`<option value="${x.index}">${x.label} · ${x.clips} klip</option>`).join('');$('#scrub').value=st.duration?Math.round(st.position/st.duration*1000):0;$('#clock').textContent=fmtMs(st.position);setAspect()}catch(e){$('#seq').textContent=e.message||'Premiere bağlantısı bekleniyor…'}
}
function setAspect(){
 [$('#preview'),$('#preview2')].forEach(p=>{p.classList.remove('portrait','square');p.style.aspectRatio=state.width+'/'+state.height;if(state.height>state.width*1.18)p.classList.add('portrait');else if(Math.abs(state.width-state.height)/Math.max(state.width,state.height)<.12)p.classList.add('square')})
}
async function refreshFrame(){
 $('#status').textContent='Sequence karesi alınıyor…';
 try{
  const os=require('os'),path=require('path'),fs=require('fs');const dir=path.join(os.tmpdir(),'KRALI_ALTYAZI');
  try{fs.mkdirSync(dir,{recursive:true})}catch(_){}
  const raw=await evalHost('$._KRALI_SUB.exportPreviewFrame("'+esc(dir.replace(/\\/g,'/'))+'")');const r=JSON.parse(raw);
  if(!r.ok)throw Error(r.message);$('#status').textContent='Kare fallback hazır · '+r.timecode;
 }catch(e){$('#status').textContent='Kare önizleme alınamadı: '+e.message}
}
function renderCues(){
 const box=$('#captions');box.innerHTML='';
 if(!cues.length){if($('#add'))$('#add').disabled=true;if($('#addStyled'))$('#addStyled').disabled=true;box.innerHTML='<div class="emptyCues">Henüz altyazı yok.<br><small>ALTYAZI OLUŞTUR ile transkripsiyonu başlat.</small></div>';if($('#count'))$('#count').textContent='0 altyazı';if($('#captionPreview'))$('#captionPreview').textContent='';if($('#captionPreview2'))$('#captionPreview2').textContent='';return}
 cues.forEach((c,i)=>{
  const d=document.createElement('div');d.className='cue'+(i===selected?' active':'');
  d.innerHTML=`<time>${fmtMs(c.start)}</time><textarea spellcheck="true" aria-label="Altyazı ${i+1}"></textarea>`;
  const ta=d.querySelector('textarea');ta.value=c.text;
  ta.onfocus=()=>selectCue(i);
  ta.oninput=()=>{c.text=ta.value;selectCue(i,false)};
  ta.onkeydown=(e)=>{
   if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(e.key))return;
   if(e.key==='Enter'&&!e.shiftKey){
    e.preventDefault();splitCue(i,ta.selectionStart);return;
   }
   if((e.key==='Backspace'||e.key==='Delete')&&ta.selectionStart===0&&ta.selectionEnd===0&&i>0){
    e.preventDefault();mergeWithPrevious(i);return;
   }
  };
  ta.onclick=async()=>{selectCue(i,false);await goToCue(i)};
  box.appendChild(d)
 });
 selected=Math.max(0,Math.min(selected,cues.length-1));$('#count').textContent=cues.length+' altyazı';if($('#add'))$('#add').disabled=false;if($('#addStyled'))$('#addStyled').disabled=false;selectCue(Math.min(selected,cues.length-1),false);setTimeout(kInstallCueDeleteButtons,0);try{kRenderZonesV183()}catch(_){}
}
async function goToCue(i){
 const c=cues[i];if(!c)return;
 await kHybridTimelineFrame(Number(c.start),0);
 state.position=c.start;$('#scrub').value=state.duration?Math.round(c.start/state.duration*1000):0;$('#clock').textContent=fmtMs(c.start);
 $('#status').textContent='Preview + Premiere · '+fmtMs(c.start);
}
function splitCue(i,pos){
 const c=cues[i],p=Number(pos);
 if(p<=0||p>=c.text.length){$('#status').textContent='Enter için imleci metnin içinde konumlandır.';return}
 const left=c.text.slice(0,p).trim(),right=c.text.slice(p).trim();if(!left||!right)return;
 const oldEnd=c.end,ratio=Math.max(.12,Math.min(.88,p/Math.max(1,c.text.length))),mid=c.start+(oldEnd-c.start)*ratio;
 c.text=left;c.end=mid;cues.splice(i+1,0,{start:mid,end:oldEnd,text:right});selected=i+1;renderCues();
 requestAnimationFrame(()=>{const ta=$$('.cue textarea')[selected];if(ta){ta.focus();ta.setSelectionRange(0,0)}});
 $('#status').textContent='Enter · altyazı bölündü.'
}
function mergeWithPrevious(i){
 if(i<=0)return;const prev=cues[i-1],cur=cues[i];
 const joinAt=prev.text.length+(prev.text?' ':0);prev.text=(prev.text+' '+cur.text).replace(/\s+/g,' ').trim();prev.end=cur.end;
 cues.splice(i,1);selected=i-1;renderCues();
 requestAnimationFrame(()=>{const ta=$$('.cue textarea')[selected];if(ta){ta.focus();ta.setSelectionRange(Math.min(joinAt,ta.value.length),Math.min(joinAt,ta.value.length))}});
 $('#status').textContent='Backspace · üst altyazıyla birleştirildi.'
}
function selectCue(i,rerender=true){if(!cues.length){$('#captionPreview').textContent='';$('#captionPreview2').textContent='';kRefreshCaptionOverlays();return}selected=Math.max(0,Math.min(i,cues.length-1));$$('.cue').forEach((x,n)=>x.classList.toggle('active',n===selected));const txt=cues[selected]?.text||'';$('#captionPreview').textContent=txt;$('#captionPreview2').textContent=txt;stylePreview();kRefreshCaptionOverlays();kApplyFixedStyle();try{kRenderZonesV183()}catch(_){} }
function fonts(){let list=['Arial','Helvetica Neue','Avenir Next','Montserrat','Poppins','Inter','Bebas Neue'];try{const fs=require('fs'),dirs=['/System/Library/Fonts','/Library/Fonts',(process.env.HOME||'')+'/Library/Fonts'];let names=[];dirs.forEach(d=>{try{fs.readdirSync(d).forEach(f=>{if(/\.(ttf|otf|ttc)$/i.test(f))names.push(f.replace(/\.(ttf|otf|ttc)$/i,''))})}catch(_){}});if(names.length)list=[...new Set(list.concat(names))]}catch(_){}$('#font').innerHTML=list.map(f=>`<option>${f}</option>`).join('')}
function hexRgb(h){return [parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)]}
function stylePreview(){
 const rgb=hexRgb($('#bg').value),op=$('#opacity').value/100,font=$('#font').value||'Arial';
 [$('#captionPreview'),$('#captionPreview2')].forEach(el=>{const host=el.closest('.preview')||$('#preview');const previewH=(host&&host.clientHeight)||200,scale=(previewH/Math.max(1,state.height))*(Number($('#previewScale')?.value||100)/100),cssSize=Math.max(6,Number($('#size').value)*scale);el.style.fontFamily='"'+font+'"';el.style.fontSize=cssSize+'px';el.style.color=$('#color').value;el.style.background=($('#enableBg')&& !$('#enableBg').checked)?'transparent':`rgba(${rgb.join(',')},${op})`;el.style.borderRadius=(Number($('#radius').value)*scale)+'px';el.style.padding=(Number($('#padY').value)*scale)+'px '+(Number($('#padX').value)*scale)+'px';el.style.top=$('#pos').value+'%';el.style.left=(($('#posX')&&$('#posX').value)||50)+'%';el.style.fontWeight=$('#bold').classList.contains('on')?'700':'400';el.style.fontStyle=$('#italic').classList.contains('on')?'italic':'normal';el.style.textTransform=$('#upper').classList.contains('on')?'uppercase':'none';el.style.lineHeight=($('#lineHeight').value/100);el.style.letterSpacing=(Number($('#tracking').value)*scale)+'px';el.style.maxWidth=$('#maxWidth').value+'%';el.style.textAlign=textAlign;const sw=Number($('#strokeWidth').value)*scale;el.style.webkitTextStroke=(($('#enableStroke')&& !$('#enableStroke').checked)?0:sw)+'px '+$('#stroke').value;const sh=$('#shadow').value/100,blur=Number($('#shadowBlur').value)*scale;el.style.textShadow=($('#enableShadow')&& !$('#enableShadow').checked)?'none':`0 ${Math.max(1,2*scale)}px ${blur}px rgba(0,0,0,${sh})`});
 kApplyFixedStyle();
 setTimeout(kMirrorTimelineToStyle,0);
 const outs={size:'',lineHeight:'%',tracking:'',maxWidth:'%',strokeWidth:'',opacity:'%',padX:'',padY:'',radius:'',shadow:'%',shadowBlur:'',pos:'%',posX:'%',previewScale:'%'};Object.keys(outs).forEach(id=>{$('#'+id+'Out').textContent=$('#'+id).value+outs[id]})
}
$$('.tab').forEach(b=>b.onclick=()=>{$$('.tab').forEach(x=>x.classList.remove('on'));b.classList.add('on');$('#textTab').classList.toggle('hidden',b.dataset.tab!=='text');$('#styleTab').classList.toggle('hidden',b.dataset.tab!=='style');setTimeout(stylePreview,20)});
['font','size','lineHeight','tracking','maxWidth','color','stroke','strokeWidth','bg','opacity','padX','padY','radius','shadow','shadowBlur','pos','posX','previewScale'].forEach(id=>{
 const e=$('#'+id);if(e){e.addEventListener('input',()=>{stylePreview();kApplyFixedStyle();kRenderZonesV183()});e.addEventListener('change',()=>{stylePreview();kApplyFixedStyle();kRenderZonesV183()})}
});
['enableBg','enableShadow','enableStroke'].forEach(id=>{
 const e=$('#'+id);if(e)e.addEventListener('change',()=>{stylePreview();kApplyFixedStyle();kRenderZonesV183()})
});
['bold','italic','upper'].forEach(id=>$('#'+id).onclick=()=>{$('#'+id).classList.toggle('on');stylePreview()});
$$('.align').forEach(b=>b.onclick=()=>{$$('.align').forEach(x=>x.classList.remove('on'));b.classList.add('on');textAlign=b.dataset.align;stylePreview()});
if($('#installEngine'))$('#installEngine').onclick=installEngine;
if($('#quality'))$('#quality').onchange=()=>checkEngine();
if($('#track'))$('#track').onchange=async()=>{try{await readAudioMap();checkEngine()}catch(e){bootError(e)}};
$('#groupMode').onchange=()=>{$('#wordLimitLabel').classList.toggle('hidden',$('#groupMode').value!=='words');$('#status').textContent='Gruplama modu: '+$('#groupMode').selectedOptions[0].textContent};
$('#scrub').oninput=()=>{const sec=state.duration*Number($('#scrub').value)/1000;$('#clock').textContent=fmtMs(sec);kSyncStop();kHybridTimelineFrame(sec,180)};
$('#scrub').onchange=async()=>{const sec=state.duration*Number($('#scrub').value)/1000;state.position=sec;await kHybridTimelineFrame(sec,0);$('#status').textContent='Timeline Preview · '+fmtMs(sec)};
$('#generate').onclick=async()=>{
 $('#generate').disabled=true;
 try{
  await readAudioMap();if(!audioMap||!audioMap.clips.length)throw Error('Seçilen audio track üzerinde klip bulunamadı.');
  if(!checkEngine()){await installEngine();if(!checkEngine())throw Error('Yerel motor kurulamadı.');}
  const uniqueCount=new Set(audioMap.clips.map(x=>x.path).filter(Boolean)).size;$('#status').textContent=audioMap.clips.length+' klip → '+uniqueCount+' kaynak analiz edilecek';const words=await transcribeTimeline();if(!words.length)throw Error('Konuşma/kelime bulunamadı.');
  cues=regroupWords(words,$('#groupMode').value,$('#wordLimit').value);selected=0;renderCues();
  $('#status').textContent='✓ '+words.length+' kelime · '+cues.length+' altyazı oluşturuldu';
 }catch(e){$('#status').textContent='Hata: '+e.message}
 finally{$('#generate').disabled=false;setTimeout(()=>$('#progress').classList.add('hidden'),900)}
};
$('#applyAll').onclick=()=>$('#status').textContent='Bu stil tüm altyazılar için kaydedildi (önizleme).';
$('#reload').onclick=()=>location.reload();if($('#play'))$('#play').onclick=()=>goToCue(selected);
window.addEventListener('resize',()=>setTimeout(stylePreview,20));boot();

document.addEventListener('keydown',function(e){
 const ta=e.target;if(!ta||ta.tagName!=='TEXTAREA'||!ta.closest('#captions'))return;
 const arr=Array.from($$('#captions textarea')),i=arr.indexOf(ta);if(i<0)return;
 if(e.key==='Enter'){e.preventDefault();e.stopImmediatePropagation();splitCueAtCaret(i,ta);return}
 if((e.key==='Backspace'||e.key==='Delete')&&ta.selectionStart===0&&ta.selectionEnd===0){
   e.preventDefault();e.stopImmediatePropagation();mergeCueWithPrevious(i);return
 }
},true);
document.addEventListener('focusin',function(e){
 const ta=e.target;if(!ta||ta.tagName!=='TEXTAREA'||!ta.closest('#captions'))return;
 const i=Array.from($$('#captions textarea')).indexOf(ta);if(i>=0&&cues[i])monitorGoto(cues[i].start)
});
document.addEventListener('click',function(e){
 const ta=e.target;if(ta&&ta.tagName==='TEXTAREA'&&ta.closest('#captions')){
  const i=Array.from($$('#captions textarea')).indexOf(ta);if(i>=0&&cues[i])monitorGoto(cues[i].start)
 }
});

(function(){
 const b=$('#playBtn')||Array.from(document.querySelectorAll('button')).find(x=>/Git/.test(x.textContent||''));
 if(b)b.addEventListener('click',function(e){
   const ta=document.activeElement&&document.activeElement.tagName==='TEXTAREA'?document.activeElement:null;
   if(ta&&ta.closest('#captions')){
     const i=Array.from($$('#captions textarea')).indexOf(ta);
     if(i>=0&&cues[i]){e.preventDefault();e.stopImmediatePropagation();monitorPlay(cues[i].start)}
   }
 },true)
})();

setTimeout(()=>{
 const b=document.getElementById('kraliRefreshPreview');
 if(b)b.onclick=async()=>{
  kSyncStop();KRALI_SEQ.ready=false;KRALI_SEQ.path='';
  b.disabled=true;b.textContent='Hazırlanıyor…';
  const ok=await kSeqEnsure(true);
  b.disabled=false;b.textContent='↻ Preview';
  if(ok)$('#status').textContent='Sequence preview hazır'; else $('#status').textContent='Timeline görüntüsü yenilendi';
  await kHybridTimelineFrame(Number(KRALI_SYNC.timeline||state.position)||0,80);
 };
},700);

setTimeout(()=>{kStyleMonitorGeometry();kMirrorTimelineToStyle()},900);

setTimeout(()=>{kInstallCueDeleteButtons();kRefreshCaptionOverlays()},1000);


/* v1.7.1 stable Properties enhancement - does not remove legacy DOM dependencies */
function kStyleFrameSync(){
 try{
  const src=document.getElementById('kraliTimelineFrame'),dst=document.getElementById('kraliStyleFrame');
  if(src&&dst&&src.src&&dst.src!==src.src)dst.src=src.src;
  const p=document.getElementById('preview2');
  if(p){
   const w=Math.max(1,Number(state.width)||1080),h=Math.max(1,Number(state.height)||1920);
   p.style.setProperty('--krali-seq-ratio',w+' / '+h);
  }
 }catch(_){}
}
function kBuildPropertyGroups(){
 const tab=document.getElementById('styleTab');if(!tab||tab.dataset.propsBuilt)return;
 tab.dataset.propsBuilt='1';
 const titles=Array.from(tab.querySelectorAll(':scope > .sectionTitle'));
 titles.forEach((title,idx)=>{
   const body=document.createElement('div');body.className='kraliPropertyBody';
   let n=title.nextSibling;
   while(n && !(n.nodeType===1 && n.classList.contains('sectionTitle')) && !(n.nodeType===1 && n.id==='applyAll')){
     const next=n.nextSibling;body.appendChild(n);n=next;
   }
   title.parentNode.insertBefore(body,n);
   title.onclick=()=>{title.classList.toggle('kraliClosed');body.classList.toggle('kraliClosed')};
   body.querySelectorAll('input[type="range"]').forEach(r=>{
     if(r.dataset.num)return;r.dataset.num='1';
     const out=body.querySelector('#'+r.id+'Out');
     const num=document.createElement('input');num.type='number';num.className='kraliNum';
     num.min=r.min||'';num.max=r.max||'';num.step=r.step||'1';num.value=r.value;
     const holder=r.parentElement;holder.classList.add('kraliRangeLine');holder.appendChild(num);
     r.addEventListener('input',()=>{num.value=r.value;kStyleFrameSync()});
     num.addEventListener('input',()=>{let v=Number(num.value);if(r.min!=='')v=Math.max(Number(r.min),v);if(r.max!=='')v=Math.min(Number(r.max),v);r.value=String(v);r.dispatchEvent(new Event('input',{bubbles:true}))});
     if(out)out.style.display='none';
   });
 });
}
function kPreset(name){
 const set=(id,v)=>{const e=document.getElementById(id);if(!e)return;e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}))};
 if(name==='clean'){set('size',92);set('opacity',55);set('strokeWidth',0);set('shadow',35);set('pos',76)}
 if(name==='reels'){set('size',112);set('opacity',0);set('strokeWidth',4);set('shadow',70);set('pos',70)}
 if(name==='boxed'){set('size',96);set('opacity',82);set('strokeWidth',0);set('radius',18);set('padX',26);set('padY',14);set('pos',76)}
 if(name==='minimal'){set('size',82);set('opacity',0);set('strokeWidth',0);set('shadow',50);set('pos',80)}
 stylePreview();kStyleFrameSync();
}
setTimeout(()=>{
 kBuildPropertyGroups();kStyleFrameSync();
 document.querySelectorAll('[data-style-preset]').forEach(b=>b.onclick=()=>kPreset(b.dataset.stylePreset));
 const styleButton=document.querySelector('.tab[data-tab="style"]');
 if(styleButton)styleButton.addEventListener('click',()=>setTimeout(()=>{kStyleFrameSync();stylePreview()},30));
},700);





/* v1.8.3 verified controller */
let KRALI_ZONES_183=false;

function kRenderZonesV183(){
 const targets=[$('#kraliCaptionFixed'),$('#captionPreview2')].filter(Boolean);
 targets.forEach(el=>el.classList.toggle('kraliZoneVisible',KRALI_ZONES_183));
 // Keep old overlay roots empty: the green line now surrounds the REAL rendered caption box.
 [$('#kraliTextZones'),$('#kraliStyleZones')].filter(Boolean).forEach(root=>{root.innerHTML='';root.classList.remove('on')});
}

function kBindV183(){
 const z=$('#toggleZones');
 if(z){
   z.onclick=function(){
     KRALI_ZONES_183=!KRALI_ZONES_183;
     z.classList.toggle('on',KRALI_ZONES_183);
     z.textContent=KRALI_ZONES_183?'▣ Yeşil Metin Alanını Gizle':'▦ Yeşil Metin Alanını Göster';
     kRenderZonesV183();
   };
 }
 ['enableBg','enableShadow','enableStroke'].forEach(id=>{
   const e=$('#'+id);if(e)e.onchange=function(){stylePreview();kApplyFixedStyle();kRenderZonesV183()};
 });
 if($('#posX'))$('#posX').oninput=function(){if($('#posXOut'))$('#posXOut').textContent=this.value+'%';stylePreview();kApplyFixedStyle();kRenderZonesV183()};
 if($('#pos'))$('#pos').addEventListener('input',kRenderZonesV183);
 if($('#maxWidth'))$('#maxWidth').addEventListener('input',kRenderZonesV183);
}

function kSrtTime(sec){
 let ms=Math.max(0,Math.round(Number(sec||0)*1000)),h=Math.floor(ms/3600000);ms%=3600000;
 let m=Math.floor(ms/60000);ms%=60000;let s=Math.floor(ms/1000),x=ms%1000;
 return String(h).padStart(2,'0')+':'+String(m).padStart(2,'0')+':'+String(s).padStart(2,'0')+','+String(x).padStart(3,'0');
}
function kBuildSRT(){
 return (cues||[]).map((c,i)=>(i+1)+'\n'+kSrtTime(c.start)+' --> '+kSrtTime(Math.max(Number(c.start)+.05,Number(c.end)))+'\n'+String(c.text||'').trim()+'\n').join('\n');
}
async function kAddToPremiere(){
 if(!cues||!cues.length){$('#status').textContent='Premiere’e eklenecek altyazı yok.';return}
 const btn=$('#add');btn.disabled=true;const old=btn.textContent;btn.textContent='NATIVE ALTYAZI EKLENİYOR…';$('#status').textContent='SRT hazırlanıyor ve aktif sequence’e Caption Track olarak ekleniyor…';
 try{
   const fs=require('fs'),path=require('path'),os=require('os');
   const dir=path.join(os.tmpdir(),'KRALI_ALTYAZI');fs.mkdirSync(dir,{recursive:true});
   const file=path.join(dir,'KRALI_'+Date.now()+'.srt');
   fs.writeFileSync(file,'\uFEFF'+kBuildSRT(),'utf8');
   const raw=await evalHost('$._KRALI_SUB.replaceC1CaptionSRT('+JSON.stringify(file.replace(/\\/g,'/'))+')');
   const r=JSON.parse(raw);
   if(!r.ok)throw Error(r.message||'Caption track oluşturulamadı');
   $('#status').textContent='✓ Premiere Caption Track eklendi · '+cues.length+' altyazı · '+(r.method||'')+
   ((r.captionTracksBefore>=0&&r.captionTracksAfter>=0)?(' · Track '+r.captionTracksBefore+'→'+r.captionTracksAfter):'');
 k22LastExportKey=k22CueKey();
   btn.textContent='✓ NATIVE ALTYAZI EKLENDİ';
   try{await kHybridTimelineFrame(Number(state.position)||0,0)}catch(_){}
   setTimeout(()=>btn.textContent=old,1800);
 }catch(e){
   $('#status').textContent='Premiere’e ekleme hatası: '+(e.message||e);
   btn.textContent='TEKRAR DENE';
 }finally{btn.disabled=false}
}
// v3.0: native CaptionTrack export disabled; bound below to KRALI Text Track.
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',kBindV183);else kBindV183();
setInterval(()=>{try{kInstallCueDeleteButtons()}catch(_){}},800);


async function kRuntimeSelfTest183(){
 const problems=[];
 const z=$('#toggleZones'),a=$('#add');
 if(!z||typeof z.onclick!=='function')problems.push('Zone handler');
 if(!a||typeof a.onclick!=='function')problems.push('Premiere handler');
 ['enableBg','enableShadow','enableStroke'].forEach(id=>{const e=$('#'+id);if(!e)problems.push(id)});
 try{
   const raw=await evalHost('(function(){try{return String(!!($._KRALI_SUB && $._KRALI_SUB.importCaptionSRT))}catch(e){return "false"}})()');
   if(String(raw)!=='true')problems.push('Premiere host bridge');
 }catch(_){problems.push('Host bridge')}
 if(problems.length){
   $('#status').textContent='SELF TEST HATA: '+problems.join(', ');
   return false;
 }
 return true;
}
setTimeout(kRuntimeSelfTest183,1400);






// v2.2 productive caption layout controller
function k22Set(id,v){
 var e=$(id); if(!e)return;
 if(e.type==="checkbox")e.checked=!!v; else e.value=v;
 try{e.dispatchEvent(new Event("input",{bubbles:true}));e.dispatchEvent(new Event("change",{bubbles:true}))}catch(_){}
}
function k22Refresh(){try{stylePreview()}catch(_){}try{kApplyFixedStyle()}catch(_){}}
function k22Apply(p){
 k22Set("#fontSize",p.size);k22Set("#maxWidth",p.width);k22Set("#posX",p.x);k22Set("#posY",p.y);
 k22Set("#enableStroke",p.stroke);k22Set("#enableBackground",p.bg);k22Set("#enableShadow",p.shadow);
 var m={"#quickSize":p.size,"#quickWidth":p.width,"#quickX":p.x,"#quickY":p.y};
 for(var k in m){var e=$(k);if(e)e.value=m[k]}
 if($("#quickStroke"))$("#quickStroke").checked=p.stroke;if($("#quickBg"))$("#quickBg").checked=p.bg;if($("#quickShadow"))$("#quickShadow").checked=p.shadow;
 k22Refresh();
}
document.addEventListener("DOMContentLoaded",function(){
 var presets={
  social:{size:72,width:52,x:50,y:78,stroke:true,bg:false,shadow:true},
  clean:{size:58,width:68,x:50,y:82,stroke:true,bg:false,shadow:false},
  wide:{size:52,width:82,x:50,y:84,stroke:true,bg:false,shadow:true}
 };
 if($("#presetSocial"))$("#presetSocial").onclick=function(){k22Apply(presets.social)};
 if($("#presetClean"))$("#presetClean").onclick=function(){k22Apply(presets.clean)};
 if($("#presetWide"))$("#presetWide").onclick=function(){k22Apply(presets.wide)};
 [["#quickSize","#fontSize"],["#quickWidth","#maxWidth"],["#quickX","#posX"],["#quickY","#posY"]].forEach(function(a){
  var e=$(a[0]);if(e)e.oninput=function(){k22Set(a[1],this.value);k22Refresh()}
 });
 [["#quickStroke","#enableStroke"],["#quickBg","#enableBackground"],["#quickShadow","#enableShadow"]].forEach(function(a){
  var e=$(a[0]);if(e)e.onchange=function(){k22Set(a[1],this.checked);k22Refresh()}
 });
});


var k22LastExportKey="";
function k22CueKey(){
 try{return cues.map(function(c){return [Number(c.start).toFixed(3),Number(c.end).toFixed(3),String(c.text||"")].join("|")}).join("¶")}catch(_){return ""}
}


// v2.2 export duplicate guard — prevents repeated identical export clicks in this panel session.
var k22LastExportKey="", k22ExportBusy=false;
function k22CueKey(){try{return cues.map(function(c){return [Number(c.start).toFixed(3),Number(c.end).toFixed(3),String(c.text||"")].join("|")}).join("¶")}catch(_){return ""}}
document.addEventListener("DOMContentLoaded",function(){
 var b=$("#add"); if(!b)return;
 b.addEventListener("click",function(ev){
   var key=k22CueKey();
   if(k22ExportBusy || (key && key===k22LastExportKey)){
     ev.preventDefault();ev.stopImmediatePropagation();
     var s=$("#status");if(s)s.textContent="Aynı altyazılar zaten Premiere'e yazıldı · yeni Subtitle katmanı oluşturulmadı.";
     return false;
   }
   k22ExportBusy=true;
   // Proven host export is synchronous behind evalScript callback; lock is released after a conservative window.
   setTimeout(function(){k22LastExportKey=key;k22ExportBusy=false},1800);
 },true);
});


// v2.6 — one visible caption state and renderer.
var K26={font:"Helvetica Neue",size:48,lead:100,track:0,align:"center",bold:true,italic:false,fillOn:true,fill:"#ffffff",strokeOn:true,stroke:"#000000",strokeW:3,bgOn:false,bg:"#000000",bgOp:75,shadowOn:false,shadow:"#000000",shadowBlur:8,zone:"bc",x:0,y:0,width:70};
function k26rgba(h,o){h=String(h||"#000").replace("#","");if(h.length===3)h=h.replace(/(.)/g,"$1$1");return"rgba("+(parseInt(h.slice(0,2),16)||0)+","+(parseInt(h.slice(2,4),16)||0)+","+(parseInt(h.slice(4,6),16)||0)+","+(Math.max(0,Math.min(100,Number(o)))/100)+")"}
function k26base(z){return{x:z[1]==="l"?12:z[1]==="r"?88:50,y:z[0]==="t"?12:z[0]==="b"?88:50}}
function k26render(){
 var e=$("#kraliCaptionFixed");if(!e)return;var b=k26base(K26.zone),x=Math.max(0,Math.min(100,b.x+K26.x)),y=Math.max(0,Math.min(100,b.y+K26.y));
 e.classList.add("k26-caption");e.style.left=x+"%";e.style.right="auto";e.style.top=y+"%";e.style.bottom="auto";e.style.transform="translate(-50%,-50%)";
 e.style.width="max-content";e.style.maxWidth=K26.width+"%";e.style.fontFamily=K26.font;e.style.fontSize=K26.size+"px";e.style.lineHeight=String(K26.lead/100);e.style.letterSpacing=K26.track+"px";e.style.textAlign=K26.align;e.style.fontWeight=K26.bold?"700":"400";e.style.fontStyle=K26.italic?"italic":"normal";
 e.style.color=K26.fillOn?K26.fill:"transparent";e.style.webkitTextStroke=K26.strokeOn?(K26.strokeW+"px "+K26.stroke):"0 transparent";e.style.backgroundColor=K26.bgOn?k26rgba(K26.bg,K26.bgOp):"transparent";e.style.padding=K26.bgOn?".08em .16em":"0";e.style.boxShadow=K26.shadowOn?("0 2px "+K26.shadowBlur+"px "+k26rgba(K26.shadow,65)):"none";
}
function k26bind(id,key,t){var e=$("#"+id);if(!e)return;function f(){K26[key]=t==="c"?e.checked:t==="n"?Number(e.value):e.value;k26render()}e.addEventListener("input",f);e.addEventListener("change",f)}
document.addEventListener("DOMContentLoaded",function(){
 [["k26Font","font","v"],["k26Size","size","n"],["k26Lead","lead","n"],["k26Track","track","n"],["k26Bold","bold","c"],["k26Italic","italic","c"],["k26FillOn","fillOn","c"],["k26Fill","fill","v"],["k26StrokeOn","strokeOn","c"],["k26Stroke","stroke","v"],["k26StrokeW","strokeW","n"],["k26BgOn","bgOn","c"],["k26Bg","bg","v"],["k26BgOp","bgOp","n"],["k26ShadowOn","shadowOn","c"],["k26Shadow","shadow","v"],["k26ShadowBlur","shadowBlur","n"],["k26X","x","n"],["k26Y","y","n"],["k26Width","width","n"]].forEach(function(a){k26bind(a[0],a[1],a[2])});
 document.querySelectorAll("#k26Align button").forEach(function(b){b.onclick=function(){K26.align=this.dataset.v;document.querySelectorAll("#k26Align button").forEach(function(q){q.classList.remove("on")});this.classList.add("on");k26render()}});
 document.querySelectorAll("#k26Zone button").forEach(function(b){b.onclick=function(){K26.zone=this.dataset.z;document.querySelectorAll("#k26Zone button").forEach(function(q){q.classList.remove("on")});this.classList.add("on");k26render()}});
 var r=$("#k26Reset");if(r)r.onclick=function(){location.reload()};
 try{stylePreview=k26render}catch(_){}
 try{kApplyFixedStyle=k26render}catch(_){}
 var e=$("#kraliCaptionFixed");if(e&&window.MutationObserver)new MutationObserver(function(){requestAnimationFrame(k26render)}).observe(e,{subtree:true,childList:true,characterData:true});
 k26render();
});


// v2.7 presets + canonical export payload
function k27StylePayload(){return JSON.stringify(K26)}
function k27Preset(p){
 if(p==="subtitle"){Object.assign(K26,{font:"Helvetica Neue",size:48,lead:100,track:0,align:"center",bold:true,italic:false,fillOn:true,fill:"#ffffff",strokeOn:true,stroke:"#000000",strokeW:3,bgOn:false,shadowOn:false,zone:"bc",x:0,y:0,width:70})}
 if(p==="social"){Object.assign(K26,{font:"Helvetica Neue",size:64,lead:95,track:0,align:"center",bold:true,italic:false,fillOn:true,fill:"#ffffff",strokeOn:true,stroke:"#000000",strokeW:5,bgOn:false,shadowOn:true,shadow:"#000000",shadowBlur:8,zone:"mc",x:0,y:18,width:58})}
 if(p==="clean"){Object.assign(K26,{font:"Helvetica Neue",size:44,lead:105,track:0,align:"center",bold:true,italic:false,fillOn:true,fill:"#ffffff",strokeOn:false,strokeW:0,bgOn:true,bg:"#000000",bgOp:72,shadowOn:false,zone:"bc",x:0,y:-5,width:74})}
 k26render();
}
document.addEventListener("DOMContentLoaded",function(){
 document.querySelectorAll(".k27-presets button").forEach(function(b){b.onclick=function(){document.querySelectorAll(".k27-presets button").forEach(function(q){q.classList.remove("on")});this.classList.add("on");k27Preset(this.dataset.p)}});
});

// v2.8 canonical visual payload
function k28PremierePayload(){return JSON.stringify(K26)}

// v2.9 Native caption text styling hints.
// SRT cannot carry Premiere Track Style. These inline tags are imported only where Premiere accepts them.
function k29SrtStyledText(text){
 var t=String(text||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
 try{
  if(K26.bold)t="<b>"+t+"</b>";
  if(K26.italic)t="<i>"+t+"</i>";
  if(K26.fillOn && K26.fill)t='<font color="'+K26.fill+'">'+t+"</font>";
 }catch(_){}
 return t;
}


// ============================================================================
// KRALI v3.0 — preview -> transparent PNG -> ONE Premiere video track
// ============================================================================
function k30hex(h){h=String(h||"#ffffff").replace("#","");if(h.length===3)h=h.replace(/(.)/g,"$1$1");return "#"+h}
function k30wrap(ctx,text,maxW){
 var words=String(text||"").trim().split(/\s+/),lines=[],line="";
 for(var i=0;i<words.length;i++){
  var test=line?line+" "+words[i]:words[i];
  if(line && ctx.measureText(test).width>maxW){lines.push(line);line=words[i]}else line=test;
 }
 if(line)lines.push(line); return lines.length?lines:[""];
}
function k30zone(){
 var z=K26.zone||"bc";
 return {x:z[1]==="l"?.12:z[1]==="r"?.88:.5,y:z[0]==="t"?.12:z[0]==="b"?.88:.5};
}
function k30renderCuePNG(cue,index,dir){
 var fs=require("fs"),path=require("path");
 var W=Math.max(320,Number(state.width)||1920),H=Math.max(320,Number(state.height)||1080);
 var c=document.createElement("canvas");c.width=W;c.height=H;var x=c.getContext("2d");
 x.clearRect(0,0,W,H);
 // K26 preview uses CSS px in the panel; scale typography by sequence height against 1080 reference.
 var scale=H/1080, size=Math.max(8,Number(K26.size)||48)*scale;
 var weight=K26.bold?"700":"400",ital=K26.italic?"italic ":"";
 x.font=ital+weight+" "+size+"px "+JSON.stringify(K26.font||"Helvetica Neue");
 x.textAlign=K26.align||"center";x.textBaseline="middle";x.lineJoin="round";
 var maxW=W*Math.max(.15,Math.min(.95,(Number(K26.width)||70)/100));
 var lines=k30wrap(x,cue.text,maxW), lh=size*Math.max(.7,(Number(K26.lead)||100)/100);
 var z=k30zone(),cx=W*Math.max(0,Math.min(1,z.x+(Number(K26.x)||0)/100)),cy=H*Math.max(0,Math.min(1,z.y+(Number(K26.y)||0)/100));
 var total=lines.length*lh, top=cy-total/2+lh/2;
 var align=K26.align||"center",tx=align==="left"?cx-maxW/2:align==="right"?cx+maxW/2:cx;
 // Background block. It is intentionally generated into the PNG, so Premiere sees exactly this raster.
 if(K26.bgOn){
  x.font=ital+weight+" "+size+"px "+JSON.stringify(K26.font||"Helvetica Neue");
  var widest=0;lines.forEach(function(L){widest=Math.max(widest,x.measureText(L).width)});
  var padX=size*.22,padY=size*.12;
  x.fillStyle=k26rgba(K26.bg,K26.bgOp);
  x.fillRect(cx-widest/2-padX,cy-total/2-padY,widest+padX*2,total+padY*2);
 }
 for(var i=0;i<lines.length;i++){
  var yy=top+i*lh;
  if(K26.shadowOn){x.shadowColor=k26rgba(K26.shadow,65);x.shadowBlur=(Number(K26.shadowBlur)||8)*scale;x.shadowOffsetY=2*scale}
  if(K26.strokeOn){x.lineWidth=Math.max(1,(Number(K26.strokeW)||3)*scale*2);x.strokeStyle=k30hex(K26.stroke);x.strokeText(lines[i],tx,yy,maxW)}
  if(K26.fillOn){x.fillStyle=k30hex(K26.fill);x.fillText(lines[i],tx,yy,maxW)}
  x.shadowColor="transparent";x.shadowBlur=0;x.shadowOffsetY=0;
 }
 var b64=c.toDataURL("image/png").split(",")[1];
 var name="KRALI_CAP_"+String(index).padStart(4,"0")+".png",file=path.join(dir,name);
 fs.writeFileSync(file,Buffer.from(b64,"base64"));
 return {path:file.replace(/\\/g,"/"),start:Number(cue.start)||0,end:Math.max(Number(cue.start)+.05,Number(cue.end)||0),text:String(cue.text||"")};
}
async function k30Apply(){
 if(!cues||!cues.length){$("#status").textContent="Yazılacak altyazı yok.";return}
 var btn=$("#add"),old=btn.textContent;btn.disabled=true;btn.textContent="KRALİ TRACK YAZILIYOR…";
 try{
  var fs=require("fs"),path=require("path"),os=require("os");
  var dir=path.join(os.tmpdir(),"KRALI_ALTYAZI","graphics_"+String(Date.now()));fs.mkdirSync(dir,{recursive:true});
  $("#status").textContent="Önizleme stili PNG altyazılara dönüştürülüyor…";
  var items=[];for(var i=0;i<cues.length;i++)items.push(k30renderCuePNG(cues[i],i,dir));
  $("#status").textContent="Tek KRALİ ALTYAZI video track güncelleniyor…";
  var payload=JSON.stringify({items:items,style:K26,sequence:{width:state.width,height:state.height}});
  var raw=await evalHost("$._KRALI_SUB.writeKraliTextTrackFinal("+JSON.stringify(payload)+")"),r=JSON.parse(raw);
  if(!r.ok)throw Error(r.message||((r.errors||[]).join(" | "))||"Text Track oluşturulamadı");
  $("#status").textContent="✓ KRALİ ALTYAZI · tek video track · "+r.inserted+" altyazı · eski "+r.removed+" eski öğe temizlendi";
  btn.textContent="✓ KRALİ TRACK GÜNCELLENDİ";
  setTimeout(function(){btn.textContent=old},1800);
 }catch(e){$("#status").textContent="KRALİ Text Track hatası: "+(e.message||e);btn.textContent="TEKRAR DENE"}
 finally{btn.disabled=false}
}
document.addEventListener("DOMContentLoaded",function(){
 var b=$("#add");if(b){b.onclick=k30Apply;b.textContent="KRALİ TRACK'E UYGULA"}
});


// ============================================================================
// v3.1 ONE RENDERER: panel preview and exported PNG use the same Canvas2D code.
// ============================================================================
function k31draw(ctx,W,H,text){
  ctx.shadowOffsetX=(Number(K26.shadowX)||0)*(H/1080);ctx.shadowOffsetY=(Number(K26.shadowY)||0)*(H/1080);
 ctx.clearRect(0,0,W,H);
 var scale=H/1080,size=Math.max(8,Number(K26.size)||48)*scale;
 var weight=K26.bold?"700":"400",ital=K26.italic?"italic ":"";
 ctx.font=ital+weight+" "+size+"px "+JSON.stringify(K26.font||"Helvetica Neue");
 ctx.textAlign=K26.align||"center";ctx.textBaseline="middle";ctx.lineJoin="round";
 var maxW=W*Math.max(.15,Math.min(.95,(Number(K26.width)||70)/100));
 var lines=k30wrap(ctx,text,maxW),lh=size*Math.max(.7,(Number(K26.lead)||100)/100);
 var z=k30zone(),cx=W*Math.max(0,Math.min(1,z.x+(Number(K26.x)||0)/100)),cy=H*Math.max(0,Math.min(1,z.y+(Number(K26.y)||0)/100));
 var total=lines.length*lh,top=cy-total/2+lh/2;
 var align=K26.align||"center",tx=align==="left"?cx-maxW/2:align==="right"?cx+maxW/2:cx;
 if(K26.bgOn && (K26.bgMode||"block")==="block"){
  var widest=0;lines.forEach(function(L){widest=Math.max(widest,ctx.measureText(L).width)});
  var px=(Number(K26.bgPadX)||14)*scale,py=(Number(K26.bgPadY)||8)*scale;ctx.fillStyle=k26rgba(K26.bg,K26.bgOp);
  k54RoundRect(ctx,cx-widest/2-px,cy-total/2-py,widest+px*2,total+py*2,(Number(K26.bgRadius)||0)*scale);
 }
 for(var i=0;i<lines.length;i++){
  var yy=top+i*lh;
  if(K26.bgOn && K26.bgMode==="line"){var lw=ctx.measureText(lines[i]).width,lpx=(Number(K26.bgPadX)||14)*scale,lpy=(Number(K26.bgPadY)||8)*scale;ctx.fillStyle=k26rgba(K26.bg,K26.bgOp);k54RoundRect(ctx,cx-lw/2-lpx,yy-lh/2-lpy/2,lw+lpx*2,lh+lpy,(Number(K26.bgRadius)||0)*scale)}
  if(K26.shadowOn){ctx.shadowColor=k26rgba(K26.shadow,Number(K26.shadowOp)==K26.shadowOp?Number(K26.shadowOp):65);ctx.shadowBlur=(Number(K26.shadowBlur)||8)*scale;ctx.shadowOffsetX=(Number(K26.shadowX)||0)*scale;ctx.shadowOffsetY=(Number(K26.shadowY)||2)*scale}
  if(K26.strokeOn){ctx.lineWidth=Math.max(1,(Number(K26.strokeW)||3)*scale*2);ctx.strokeStyle=k26rgba(K26.stroke,Number(K26.strokeOp)==K26.strokeOp?Number(K26.strokeOp):100);ctx.strokeText(lines[i],tx,yy,maxW)}
  if(K26.fillOn){ctx.fillStyle=k26rgba(K26.fill,Number(K26.fillOp)==K26.fillOp?Number(K26.fillOp):100);ctx.fillText(lines[i],tx,yy,maxW)}
  ctx.shadowColor="transparent";ctx.shadowBlur=0;ctx.shadowOffsetX=0;ctx.shadowOffsetY=0;
 }
}
function k31activeText(){
 try{return cues&&cues.length?String(cues[Math.max(0,Math.min(cues.length-1,selected||0))].text||""):""}catch(_){return""}
}
function k31preview(){
 var c=$("#k31CaptionCanvas");if(!c)return;
 var W=Math.max(320,Number(state.width)||1080),H=Math.max(320,Number(state.height)||1920);
 if(c.width!==W)c.width=W;if(c.height!==H)c.height=H;
 k31draw(c.getContext("2d"),W,H,k31activeText());
}
var k31OldRender=k26render;
k26render=function(){try{k31OldRender()}catch(_){};k31preview()};
k30renderCuePNG=function(cue,index,dir){
 var fs=require("fs"),path=require("path"),W=Math.max(320,Number(state.width)||1080),H=Math.max(320,Number(state.height)||1920);
 var c=document.createElement("canvas");c.width=W;c.height=H;k31draw(c.getContext("2d"),W,H,String(cue.text||""));
 var file=path.join(dir,"KRALI_CAP_"+String(index).padStart(4,"0")+".png");
 fs.writeFileSync(file,Buffer.from(c.toDataURL("image/png").split(",")[1],"base64"));
 return {path:file.replace(/\\/g,"/"),start:Number(cue.start)||0,end:Math.max(Number(cue.start)+.05,Number(cue.end)||0),text:String(cue.text||"")};
};
document.addEventListener("DOMContentLoaded",function(){
 setTimeout(k31preview,400);
 document.addEventListener("input",function(e){if(e.target&&e.target.closest&&e.target.closest(".cue"))requestAnimationFrame(k31preview)},true);
 document.addEventListener("click",function(){requestAnimationFrame(k31preview)},true);
});


// ============================================================================
// KRALI v3.2 FINAL CLEAN CONTROLLER
// One active cue preview + one authoritative Apply handler.
// ============================================================================
(function(){
  var K32={active:0,bound:false};

  function q(sel){return document.querySelector(sel)}
  function activeIndex(){
    try{
      if(typeof selected==="number" && isFinite(selected)) return Math.max(0,Math.min(cues.length-1,selected));
    }catch(_){}
    return Math.max(0,K32.active||0);
  }
  function setActive(i){
    try{
      if(!cues||!cues.length)return;
      K32.active=Math.max(0,Math.min(cues.length-1,Number(i)||0));
      try{selected=K32.active}catch(_){}
      k32Preview();
    }catch(_){}
  }
  function k32Preview(){
    try{
      var c=q("#k31CaptionCanvas"); if(!c)return;
      var W=Math.max(320,Number(state.width)||1080),H=Math.max(320,Number(state.height)||1920);
      if(c.width!==W)c.width=W;if(c.height!==H)c.height=H;
      var i=activeIndex(),txt=(cues&&cues[i])?String(cues[i].text||""):"";
      k31draw(c.getContext("2d"),W,H,txt);
    }catch(_){}
  }

  // Override all preview entry points with the single-cue renderer.
  k31activeText=function(){
    try{var i=activeIndex();return cues&&cues[i]?String(cues[i].text||""):""}catch(_){return""}
  };
  k31preview=k32Preview;

  async function applyFinal(){
    var btn=q("#add"),status=q("#status");
    if(!cues||!cues.length){if(status)status.textContent="Yazılacak altyazı yok.";return}
    if(btn){btn.disabled=true;btn.textContent="KRALİ TRACK GÜNCELLENİYOR…"}
    try{
      var fs=require("fs"),path=require("path"),os=require("os");
      var dir=path.join(os.tmpdir(),"KRALI_ALTYAZI","graphics_final_"+Date.now());
      fs.mkdirSync(dir,{recursive:true});
      var items=[];
      for(var i=0;i<cues.length;i++)items.push(k30renderCuePNG(cues[i],i,dir));
      if(status)status.textContent="Eski KRALİ altyazıları temizleniyor…";
      var payload=JSON.stringify({items:items,style:K26,sequence:{width:state.width,height:state.height}});
      var raw=await evalHost("$._KRALI_SUB.writeKraliTextTrackFinal("+JSON.stringify(payload)+")");
      var r=JSON.parse(raw);
      if(!r.ok)throw Error(r.message||((r.errors||[]).join(" | "))||"Timeline güncellenemedi.");
      if(status)status.textContent="✓ KRALİ ALTYAZI güncellendi · "+r.removed+" eski öğe silindi · "+r.inserted+" yeni altyazı yazıldı";
      if(btn){btn.textContent="✓ GÜNCELLENDİ";setTimeout(function(){btn.textContent="KRALİ TRACK'İ GÜNCELLE"},1400)}
    }catch(e){
      if(status)status.textContent="KRALİ Track hatası: "+(e.message||e);
      if(btn)btn.textContent="TEKRAR DENE";
    }finally{if(btn)btn.disabled=false}
  }

  function bindFinal(){
    var old=q("#add");if(!old)return;
    // Clone strips every onclick/addEventListener registered by legacy builds.
    var b=old.cloneNode(true);
    old.parentNode.replaceChild(b,old);
    b.removeAttribute("onclick");
    b.textContent="KRALİ TRACK'İ GÜNCELLE";
    b.addEventListener("click",function(ev){
      ev.preventDefault();ev.stopImmediatePropagation();applyFinal();
    },true);

    // Cue interaction: resolve the clicked textarea to its cue index.
    document.addEventListener("focusin",function(ev){
      var t=ev.target;
      if(!t || t.tagName!=="TEXTAREA")return;
      var all=[].slice.call(document.querySelectorAll(".cue textarea, textarea.cue, #transcript textarea"));
      var i=all.indexOf(t); if(i>=0)setActive(i);
    },true);
    document.addEventListener("input",function(ev){
      var t=ev.target;if(t&&t.tagName==="TEXTAREA")requestAnimationFrame(k32Preview);
    },true);

    // Kill obsolete native-caption wording that survived in status from old callbacks.
    var st=q("#status");
    if(st && /Subtitle|Caption Track|zaten Premiere/i.test(st.textContent||""))
      st.textContent="Hazır · KRALİ ALTYAZI tek video track olarak güncellenecek.";
    setTimeout(k32Preview,150);
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",bindFinal,{once:true});
  else bindFinal();
})();


// ============================================================================
// KRALI v3.3 FRESH RENDER
// Premiere caches imported still ProjectItems. Reusing KRALI_CAP_0000.png made
// refreshed timelines point at OLD pixels/text/style. Every Apply now gets a
// unique generation id in both folder AND filename.
// ============================================================================
var K33_GENERATION="";
var K33_LAST_EXPORTED=[];

k30renderCuePNG=function(cue,index,dir){
 var fs=require("fs"),path=require("path");
 var W=Math.max(320,Number(state.width)||1080),H=Math.max(320,Number(state.height)||1920);
 var c=document.createElement("canvas");c.width=W;c.height=H;
 // Exact same renderer as panel preview.
 k31draw(c.getContext("2d"),W,H,String(cue.text||""));
 var token=K33_GENERATION||String(Date.now());
 var name="KRALI_"+token+"_CAP_"+String(index).padStart(4,"0")+".png";
 var file=path.join(dir,name);
 fs.writeFileSync(file,Buffer.from(c.toDataURL("image/png").split(",")[1],"base64"));
 var item={
   path:file.replace(/\\/g,"/"),
   name:name,
   start:Number(cue.start)||0,
   end:Math.max(Number(cue.start)+0.05,Number(cue.end)||0),
   text:String(cue.text||""),
   cueIndex:index,
   generation:token
 };
 K33_LAST_EXPORTED.push(item);
 return item;
};

// Replace the final controller with a generation-aware final apply.
async function k33ApplyFresh(){
 var btn=document.querySelector("#add"),status=document.querySelector("#status");
 if(!cues||!cues.length){if(status)status.textContent="Yazılacak altyazı yok.";return}
 if(btn){btn.disabled=true;btn.textContent="KRALİ OLUŞTURULUYOR…"}
 try{
  var fs=require("fs"),path=require("path"),os=require("os"),crypto=require("crypto");
  K33_GENERATION=Date.now().toString(36)+"_"+Math.random().toString(36).slice(2,7);K33_LAST_EXPORTED=[];
  var dir=path.join(os.tmpdir(),"KRALI_ALTYAZI","gen_"+K33_GENERATION),cache=path.join(os.homedir(),"Library","Application Support","KRALI","Altyazi","render_cache");
  fs.mkdirSync(dir,{recursive:true});fs.mkdirSync(cache,{recursive:true});
  var items=[],rendered=0,reused=0,W=Math.max(320,Number(state.width)||1080),H=Math.max(320,Number(state.height)||1920);
  for(var i=0;i<cues.length;i++){
    var cue={text:String(cues[i].text||""),start:Number(cues[i].start)||0,end:Number(cues[i].end)||0};
    var raw=[cue.text,JSON.stringify(K26),W,H].join("|"),hash=crypto.createHash("sha1").update(raw).digest("hex"),cached=path.join(cache,hash+".png");
    var name="KRALI_"+K33_GENERATION+"_CAP_"+String(i).padStart(4,"0")+".png",file=path.join(dir,name);
    if(fs.existsSync(cached)){fs.copyFileSync(cached,file);reused++}
    else{var c=document.createElement("canvas");c.width=W;c.height=H;k31draw(c.getContext("2d"),W,H,cue.text);fs.writeFileSync(file,Buffer.from(c.toDataURL("image/png").split(",")[1],"base64"));try{fs.copyFileSync(file,cached)}catch(_){}rendered++}
    items.push({path:file.replace(/\\/g,"/"),name:name,start:cue.start,end:Math.max(cue.start+.05,cue.end),text:cue.text,cueIndex:i,generation:K33_GENERATION});
    try{if(window.KRALI_V60_PROGRESS)window.KRALI_V60_PROGRESS(i+1,cues.length,reused?"Önbellek + render":"Render")}catch(_){}
  }
  if(status)status.textContent="Timeline güncelleniyor…";
  var payload=JSON.stringify({generation:K33_GENERATION,items:items,style:K26,sequence:{width:state.width,height:state.height}});
  var rawResult=await evalHost("$._KRALI_SUB.writeKraliTextTrackV50("+JSON.stringify(payload)+")"),r=JSON.parse(rawResult);
  if(!r.ok)throw Error(r.message||((r.errors||[]).join(" | "))||"Timeline güncellenemedi.");
  if(status)status.textContent="✓ "+r.inserted+" altyazı · "+rendered+" yeniden render · "+reused+" önbellekten";
  try{evalHost("$._KRALI_SUB.v41CleanupOldProjectItems("+JSON.stringify(K33_GENERATION)+")",function(){})}catch(_){}
  try{localStorage.removeItem("KRALI_V60_DRAFT_"+(window.V60&&V60.project||"PROJECT"))}catch(_){}
  if(btn){btn.textContent="✓ GÜNCEL";setTimeout(function(){btn.textContent="KRALİ TRACK'İ GÜNCELLE"},1400)}
 }catch(e){if(status)status.textContent="KRALİ v6.0: "+(e.message||e);if(btn)btn.textContent="TEKRAR DENE"}
 finally{if(btn)btn.disabled=false}
}
function k33Bind(){
 var old=document.querySelector("#add");if(!old)return;
 var b=old.cloneNode(true);old.parentNode.replaceChild(b,old);
 b.removeAttribute("onclick");b.textContent="KRALİ TRACK'İ GÜNCELLE";
 b.addEventListener("click",function(e){e.preventDefault();e.stopImmediatePropagation();k33ApplyFresh()},true);
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){setTimeout(k33Bind,50)},{once:true});
else setTimeout(k33Bind,50);

/* KRALI v4.0 WORKFLOW STUDIO (disabled by v5) */
if(false)(function(){
var KEY="KRALI_V4_PRESETS";
function q(s){return document.querySelector(s)} function qa(s){return [].slice.call(document.querySelectorAll(s))}
function live(){try{k31preview()}catch(e){}try{k26render()}catch(e){}}
function st(s){var x=q("#status");if(x)x.textContent=s}
function sync(){qa(".cue textarea,textarea.cue,#transcript textarea").forEach(function(t,i){if(cues&&cues[i])cues[i].text=t.value})}
function words(c){if(c.words&&c.words.length)return c.words.map(function(w){return{text:String(w.text||w.word||"").trim(),start:+w.start,end:+w.end}}).filter(function(w){return w.text});var a=String(c.text||"").trim().split(/\s+/),d=Math.max(.1,c.end-c.start);return a.map(function(w,i){return{text:w,start:c.start+d*i/a.length,end:c.start+d*(i+1)/a.length}})}
function redraw(){for(var n of ["renderCues","renderTranscript","kRenderCues","drawCues"]){try{if(typeof window[n]==="function"){window[n]();live();return}}catch(e){}}location.reload()}
function group(smart,n){sync();var o=[];cues.forEach(function(c){var w=words(c),g=[],ch=0;w.forEach(function(x,i){g.push(x);ch+=x.text.length+1;var gap=i<w.length-1?w[i+1].start-x.end:0,cut=smart?(g.length>=4||ch>=30||/[.!?…,:;]$/.test(x.text)||gap>.32):g.length>=n;if(cut||i===w.length-1){o.push({text:g.map(function(y){return y.text}).join(" "),start:g[0].start,end:g[g.length-1].end,words:g.slice()});g=[];ch=0}})});cues.splice(0,cues.length);o.forEach(function(x){cues.push(x)});try{selected=0}catch(e){};redraw();st("✓ "+o.length+" altyazı yeniden gruplandı")}
function presets(){var b=q("#v4plist"),a=[];try{a=JSON.parse(localStorage.getItem(KEY)||"[]")}catch(e){};if(!b)return;b.innerHTML=a.map(function(x,i){return'<button data-i="'+i+'">'+x.name+"</button>"}).join("");qa("#v4plist button").forEach(function(x){x.onclick=function(){var p=a[+x.dataset.i];Object.assign(K26,p.style);try{k26syncUI()}catch(e){}live();st("✓ "+p.name)}})}
function save(){var n=prompt("Preset adı:","Yeni Stil");if(!n)return;var a=[];try{a=JSON.parse(localStorage.getItem(KEY)||"[]")}catch(e){};a=a.filter(function(x){return x.name!==n});a.push({name:n,style:JSON.parse(JSON.stringify(K26))});localStorage.setItem(KEY,JSON.stringify(a));presets()}
function tm(s){var h=Math.floor(s/3600),m=Math.floor(s%3600/60),x=s%60,z=Math.floor(x),ms=Math.round((x-z)*1000);return[h,m,z].map(function(v){return String(v).padStart(2,"0")}).join(":")+","+String(ms).padStart(3,"0")}
function exp(){sync();var fs=require("fs"),os=require("os"),path=require("path"),t=cues.map(function(c,i){return(i+1)+"\n"+tm(c.start)+" --> "+tm(c.end)+"\n"+c.text+"\n"}).join("\n"),f=path.join(os.homedir(),"Desktop","KRALI_"+Date.now()+".srt");fs.writeFileSync(f,"\ufeff"+t);st("✓ SRT Masaüstüne kaydedildi")}
function imp(f){var fs=require("fs"),t=fs.readFileSync(f,"utf8").replace(/^\uFEFF/,""),o=[];function T(x){var p=x.replace(",",".").split(":");return+p[0]*3600 + +p[1]*60 + +p[2]}t.trim().split(/\r?\n\r?\n/).forEach(function(b){var l=b.split(/\r?\n/),i=l.findIndex(function(x){return x.includes("-->")});if(i<0)return;var a=l[i].split("-->");o.push({start:T(a[0]),end:T(a[1]),text:l.slice(i+1).join(" "),words:[]})});cues.splice(0,cues.length);o.forEach(function(x){cues.push(x)});redraw();st("✓ "+o.length+" SRT içe aktarıldı")}
function clean(){try{var fs=require("fs"),os=require("os"),path=require("path"),d=path.join(os.tmpdir(),"KRALI_ALTYAZI");if(fs.existsSync(d))fs.rmSync(d,{recursive:true,force:true});st("✓ Render cache temizlendi")}catch(e){st(e.message)}}
function boot(){
 if(q("#v4Studio"))return;var a=q(".k26-inspector"),b=document.createElement("section");b.id="v4Studio";b.innerHTML='<b>WORKFLOW</b><div><button id="v4smart">Akıllı Böl</button><select id="v4n"><option>2</option><option selected>3</option><option>4</option><option>5</option></select><button id="v4group">Kelime Grupla</button></div><b>PRESETLER</b><div><button id="v4save">+ Stil Kaydet</button><span id="v4plist"></span></div><b>DOSYA & CACHE</b><div><button id="v4imp">SRT İçe Al</button><button id="v4exp">SRT Dışa Ver</button><button id="v4clean">Cache Temizle</button><input hidden type="file" accept=".srt" id="v4file"></div>';
 if(a)a.parentNode.insertBefore(b,a.nextSibling);else document.body.appendChild(b);
 q("#v4smart").onclick=function(){group(true,0)};q("#v4group").onclick=function(){group(false,+q("#v4n").value)};q("#v4save").onclick=save;q("#v4exp").onclick=exp;q("#v4imp").onclick=function(){q("#v4file").click()};q("#v4file").onchange=function(){if(this.files[0])imp(this.files[0].path)};q("#v4clean").onclick=clean;presets();
 document.addEventListener("input",function(e){if(e.target.closest&&e.target.closest(".k26-inspector"))requestAnimationFrame(live)},true);document.addEventListener("change",function(e){if(e.target.closest&&e.target.closest(".k26-inspector"))requestAnimationFrame(live)},true);document.addEventListener("click",function(e){if(e.target.closest&&e.target.closest(".k26-inspector"))setTimeout(live,0)},true);
 var z=qa("button").find(function(x){return/Metin Zonlarını Göster/i.test(x.textContent)});if(z)z.onclick=function(){document.body.classList.toggle("v4zones");z.classList.toggle("on");live()};
 st("v4.0 hazır · stil kontrolleri canlı önizleme");live()
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){setTimeout(boot,250)});else setTimeout(boot,250)
})();/* KRALI v4.1 UX PRO (disabled by v5) */
if(false)(function(){
var H=[],R=[],last="",fps=25;
function q(s){return document.querySelector(s)} function qa(s){return [].slice.call(document.querySelectorAll(s))} function msg(s){var x=q('#status');if(x)x.textContent=s}
function snap(){return JSON.stringify((cues||[]).map(c=>({text:c.text,start:c.start,end:c.end,words:c.words||[]})))}
function draw(){try{if(typeof renderCues==='function')renderCues();else if(typeof renderTranscript==='function')renderTranscript()}catch(e){}try{k31preview()}catch(e){}timing()}
function save(){var s=snap();if(s!==last){H.push(s);if(H.length>50)H.shift();R=[];last=s}}
function restore(s){var a=JSON.parse(s);cues.splice(0,cues.length,...a);last=s;draw()}
function undo(){if(H.length){R.push(snap());restore(H.pop());msg('↶ Geri alındı')}} function redo(){if(R.length){H.push(snap());restore(R.pop());msg('↷ Yinelendi')}}
function ix(){return Math.max(0,Math.min((cues||[]).length-1,typeof selected==='number'?selected:0))}
function nudge(k,d){if(!cues.length)return;save();var c=cues[ix()],f=d/fps;k==='s'?c.start=Math.max(0,Math.min(c.end-.02,c.start+f)):c.end=Math.max(c.start+.02,c.end+f);draw()}
function quality(c){var d=Math.max(.05,c.end-c.start),n=String(c.text||'').length,r=[];if(n>64)r.push('uzun');if(Math.ceil(n/32)>2)r.push('3+ satır');if(d<.65)r.push('çok kısa');if(n/d>22)r.push('hızlı');return r}
function timing(){var c=cues&&cues[ix()];if(!c)return;var s=q('#u41s'),e=q('#u41e'),d=q('#u41d'),z=q('#u41q');if(s)s.textContent=(+c.start).toFixed(3);if(e)e.textContent=(+c.end).toFixed(3);if(d)d.textContent=(c.end-c.start).toFixed(3)+'s';if(z){var a=quality(c);z.textContent=a.length?'⚠ '+a.join(' · '):'✓ Okunabilir';z.className=a.length?'warn':'ok'}}
function profile(p){save();var mw=p==='short'?3:p==='long'?6:4,mc=p==='short'?22:p==='long'?42:30,o=[];(cues||[]).forEach(function(c){var tx=String(c.text||'').split(/\s+/),a=c.words&&c.words.length?c.words:tx.map(function(t,i){var d=(c.end-c.start)/tx.length;return{text:t,start:c.start+d*i,end:c.start+d*(i+1)}}),g=[],ch=0;a.forEach(function(w,i){var t=String(w.text||w.word||'').trim();if(!t)return;g.push({text:t,start:+w.start,end:+w.end});ch+=t.length+1;var gap=a[i+1]?(+a[i+1].start-(+w.end)):0;if(g.length>=mw||ch>=mc||/[.!?…,:;]$/.test(t)||gap>.32||i===a.length-1){o.push({text:g.map(x=>x.text).join(' '),start:g[0].start,end:g[g.length-1].end,words:g.slice()});g=[];ch=0}})});cues.splice(0,cues.length,...o);try{selected=0}catch(e){}draw();msg('✓ '+p+' bölme · '+o.length+' altyazı')}
function presets(){var s=q('#u41preset'),a=[];try{a=JSON.parse(localStorage.getItem('KRALI_V4_PRESETS')||'[]')}catch(e){};if(!s)return;s.innerHTML='<option value="">Stil Preseti ▾</option>'+a.map((x,i)=>'<option value="'+i+'">'+x.name+'</option>').join('');s.onchange=function(){if(s.value==='')return;Object.assign(K26,a[+s.value].style);try{k26syncUI()}catch(e){}try{k26render();k31preview()}catch(e){}}}
function follow(){if(!cues||!cues.length)return;evalHost('$._KRALI_SUB.v41PlayheadSeconds()',function(r){var t=parseFloat(r);if(!isFinite(t))return;for(var i=0;i<cues.length;i++)if(t>=cues[i].start&&t<cues[i].end){if(i!==ix()){try{selected=i}catch(e){};var ta=qa('.cue textarea,textarea.cue,#transcript textarea')[i];if(ta)ta.scrollIntoView({block:'center'});try{k31preview()}catch(e){}timing()}break}})}
function boot(){if(q('#u41'))return;var old=q('#v4Studio'),b=document.createElement('section');b.id='u41';b.innerHTML='<div class="uTop"><select id="u41preset"></select><button id="uUndo">↶</button><button id="uRedo">↷</button><button id="uMore">•••</button></div><div class="uSmart"><b>AKILLI BÖL</b><button data-p="short">Kısa</button><button data-p="balanced">Dengeli</button><button data-p="long">Uzun</button></div><div class="uTime">IN <span id="u41s"></span><button id="uSm">−1f</button><button id="uSp">+1f</button> OUT <span id="u41e"></span><button id="uEm">−1f</button><button id="uEp">+1f</button><span id="u41d"></span><span id="u41q"></span></div><div id="uMenu"><button id="uIn">SRT İçe Al</button><button id="uOut">SRT Dışa Ver</button><button id="uCache">Cache Temizle</button></div>';if(old){old.parentNode.insertBefore(b,old);old.style.display='none'}else document.body.appendChild(b);q('#uUndo').onclick=undo;q('#uRedo').onclick=redo;q('#uSm').onclick=()=>nudge('s',-1);q('#uSp').onclick=()=>nudge('s',1);q('#uEm').onclick=()=>nudge('e',-1);q('#uEp').onclick=()=>nudge('e',1);qa('#u41 [data-p]').forEach(x=>x.onclick=()=>profile(x.dataset.p));q('#uMore').onclick=()=>q('#uMenu').classList.toggle('show');q('#uIn').onclick=()=>{var x=q('#v4imp');if(x)x.click()};q('#uOut').onclick=()=>{var x=q('#v4exp');if(x)x.click()};q('#uCache').onclick=()=>{var x=q('#v4clean');if(x)x.click()};presets();last=snap();timing();document.addEventListener('focusin',e=>{if(e.target&&e.target.tagName==='TEXTAREA'){save();setTimeout(timing,0)}},true);document.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='z'){e.preventDefault();e.shiftKey?redo():undo()}},true);setInterval(follow,350);msg('v4.1 UX PRO hazır')}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,500));else setTimeout(boot,500)
})();


/* =========================================================================
   KRALI v5.2 TRANSCRIPT PRO — authoritative UX controller
   One preview scheduler, one follow timer, real sequence FPS, transaction undo,
   measured QC, compact tools. Stable ASR + k31draw + fresh generation retained.
   ========================================================================= */
(function(){
var V5={undo:[],redo:[],last:"",fps:25,follow:true,editing:false,followTimer:null,previewRAF:0};
function q(s){return document.querySelector(s)}
function qa(s){return [].slice.call(document.querySelectorAll(s))}
function msg(s){var x=q("#status");if(x)x.textContent=s}
function renderPreview(){if(V5.previewRAF)cancelAnimationFrame(V5.previewRAF);V5.previewRAF=requestAnimationFrame(function(){V5.previewRAF=0;try{k31preview()}catch(e){try{k26render()}catch(_){}}})}
function snapshot(){try{return JSON.stringify(cues.map(function(c){return{text:c.text,start:+c.start,end:+c.end,words:c.words||[]}}))}catch(e){return"[]"}}
function commit(){var s=snapshot();if(s!==V5.last){V5.undo.push(V5.last||s);if(V5.undo.length>60)V5.undo.shift();V5.redo=[];V5.last=s}}
function restore(s){var a=JSON.parse(s);cues.splice(0,cues.length);a.forEach(function(x){cues.push(x)});V5.last=s;try{selected=Math.min(selected||0,cues.length-1)}catch(e){};redraw()}
function undo(){if(!V5.undo.length)return;V5.redo.push(snapshot());restore(V5.undo.pop());msg("↶ Geri alındı")}
function redo(){if(!V5.redo.length)return;V5.undo.push(snapshot());restore(V5.redo.pop());msg("↷ Yinelendi")}
function redraw(){for(var n of ["renderCues","renderTranscript","kRenderCues","drawCues"]){try{if(typeof window[n]==="function"){window[n]();break}}catch(e){}}renderPreview();timing()}
function ix(){try{return Math.max(0,Math.min(cues.length-1,selected||0))}catch(e){return 0}}
function getFPS(){evalHost("$._KRALI_SUB.v50SequenceInfo()",function(r){try{var x=JSON.parse(r);if(x.ok&&x.fps>0){V5.fps=x.fps;var f=q("#v5fps");if(f)f.textContent=x.fps.toFixed(x.fps%1?3:0)+" fps"}}catch(e){}})}
function nudge(k,d){if(!cues.length)return;commit();var c=cues[ix()],f=d/V5.fps;if(k==="s")c.start=Math.max(0,Math.min(c.end-.02,c.start+f));else c.end=Math.max(c.start+.02,c.end+f);V5.last=snapshot();redraw()}
function measureLines(text){
 try{
  var c=document.createElement("canvas"),ctx=c.getContext("2d"),H=(state&&state.height)||1080,W=(state&&state.width)||1920,sc=H/1080,size=K26.size*sc,max=W*(Math.max(15,Math.min(95,K26.width))/100);
  ctx.font=(K26.italic?"italic ":"")+(K26.bold?"700 ":"400 ")+size+"px "+JSON.stringify(K26.font||"Helvetica Neue");
  var words=String(text||"").split(/\s+/),line="",lines=1;
  words.forEach(function(w){var t=line?line+" "+w:w;if(ctx.measureText(t).width>max&&line){lines++;line=w}else line=t});return lines
 }catch(e){return 1}
}
function issues(c){var d=Math.max(.05,c.end-c.start),n=String(c.text||"").length,r=[],lines=measureLines(c.text);if(lines>2)r.push(lines+" satır");if(d<.65)r.push("çok kısa");if(n/d>22)r.push("hızlı");if(c.start<0||c.end<=c.start)r.push("zaman");return r}
function timing(){var c=cues&&cues[ix()];if(!c)return;var a=q("#v5in"),b=q("#v5out"),d=q("#v5dur"),z=q("#v5qc");if(a)a.textContent=c.start.toFixed(3);if(b)b.textContent=c.end.toFixed(3);if(d)d.textContent=(c.end-c.start).toFixed(3)+"s";if(z){var r=issues(c);z.textContent=r.length?"⚠ "+r.join(" · "):"✓";z.className=r.length?"warn":"ok"}}
function wordList(c){if(c.words&&c.words.length)return c.words.map(function(w){return{text:String(w.text||w.word||"").trim(),start:+w.start,end:+w.end}}).filter(function(w){return w.text});var a=String(c.text||"").trim().split(/\s+/),d=(c.end-c.start)/Math.max(1,a.length);return a.map(function(t,i){return{text:t,start:c.start+d*i,end:c.start+d*(i+1)}})}
function smart(profile){
 commit();var mw=profile==="short"?3:profile==="long"?6:4,out=[];
 cues.forEach(function(c){var ws=wordList(c),g=[];ws.forEach(function(w,i){g.push(w);var text=g.map(function(x){return x.text}).join(" "),gap=ws[i+1]?ws[i+1].start-w.end:0,cut=g.length>=mw||measureLines(text)>2||/[.!?…,:;]$/.test(w.text)||gap>.32;if(cut||i===ws.length-1){if(measureLines(text)>2&&g.length>1){var last=g.pop();out.push({text:g.map(function(x){return x.text}).join(" "),start:g[0].start,end:g[g.length-1].end,words:g.slice()});g=[last]}if(g.length&&(i===ws.length-1||cut)){out.push({text:g.map(function(x){return x.text}).join(" "),start:g[0].start,end:g[g.length-1].end,words:g.slice()});g=[]}}})});
 cues.splice(0,cues.length);out.forEach(function(x){cues.push(x)});try{selected=0}catch(e){};V5.last=snapshot();redraw();msg("✓ "+profile+" · "+out.length+" altyazı")
}
function findProblems(){var bad=[];cues.forEach(function(c,i){if(issues(c).length)bad.push(i)});if(!bad.length){msg("✓ Kalite sorunu bulunmadı");return}var cur=ix(),next=bad.find(function(i){return i>cur});if(next==null)next=bad[0];try{selected=next}catch(e){};var ta=qa(".cue textarea,textarea.cue,#transcript textarea")[next];if(ta)ta.scrollIntoView({block:"center"});renderPreview();timing();msg("⚠ "+bad.length+" sorunlu altyazı · "+(next+1)+". seçildi")}
function follow(){
 if(!V5.follow||V5.editing||!cues.length)return;
 evalHost("$._KRALI_SUB.v41PlayheadSeconds()",function(r){var t=parseFloat(r);if(!isFinite(t))return;var lo=0,hi=cues.length-1,found=-1;while(lo<=hi){var m=(lo+hi)>>1,c=cues[m];if(t<c.start)hi=m-1;else if(t>=c.end)lo=m+1;else{found=m;break}}if(found>=0&&found!==ix()){try{selected=found}catch(e){};var ta=qa(".cue textarea,textarea.cue,#transcript textarea")[found];if(ta)ta.scrollIntoView({block:"center"});renderPreview();timing()}})
}
function presetMenu(){var s=q("#v5preset"),a=[];try{a=JSON.parse(localStorage.getItem("KRALI_V4_PRESETS")||"[]")}catch(e){};if(!s)return;s.innerHTML='<option value="">Stil Preseti ▾</option>'+a.map(function(x,i){return'<option value="'+i+'">'+x.name+"</option>"}).join("");s.onchange=function(){if(s.value==="")return;Object.assign(K26,a[+s.value].style);try{k26syncUI()}catch(e){};renderPreview()}}
function boot(){
 if(q("#v5bar"))return;
 // Hide obsolete duplicate controls, not the stable engine.
 ["#styleTab","#groupMode",".playline"].forEach(function(s){var x=q(s);if(x)x.style.display="none"});
 var inspector=q(".k26-inspector"),bar=document.createElement("section");bar.id="v5bar";bar.innerHTML=
 '<div class="v5top"><select id="v5preset"></select><button id="v5follow" class="on">● Takip</button><button id="v5undo">↶</button><button id="v5redo">↷</button><button id="v5more">•••</button></div>'+
 '<div class="v5smart"><b>AKILLI BÖL</b><button data-p="short">Kısa</button><button data-p="balanced">Dengeli</button><button data-p="long">Uzun</button><button id="v5problems">⚠ Sorunlar</button></div>'+
 '<div class="v5time"><span>IN <b id="v5in"></b></span><button id="v5sm">−1f</button><button id="v5sp">+1f</button><span>OUT <b id="v5out"></b></span><button id="v5em">−1f</button><button id="v5ep">+1f</button><span id="v5dur"></span><span id="v5fps"></span><span id="v5qc"></span></div>'+
 '<div id="v5menu"><button id="v5srtin">SRT İçe Al</button><button id="v5srtout">SRT Dışa Ver</button><button id="v5cache">Cache Temizle</button></div>';
 if(inspector)inspector.parentNode.insertBefore(bar,inspector.nextSibling);else document.body.appendChild(bar);
 q("#v5undo").onclick=undo;q("#v5redo").onclick=redo;q("#v5sm").onclick=function(){nudge("s",-1)};q("#v5sp").onclick=function(){nudge("s",1)};q("#v5em").onclick=function(){nudge("e",-1)};q("#v5ep").onclick=function(){nudge("e",1)};
 qa("#v5bar [data-p]").forEach(function(b){b.onclick=function(){smart(b.dataset.p)}});q("#v5problems").onclick=findProblems;
 q("#v5follow").onclick=function(){V5.follow=!V5.follow;this.classList.toggle("on",V5.follow);this.textContent=(V5.follow?"●":"○")+" Takip"};
 q("#v5more").onclick=function(){q("#v5menu").classList.toggle("show")};
 // Directly use the proven v4 SRT/cache functions through their hidden controls if present.
 q("#v5srtin").onclick=function(){var x=q("#v4imp");if(x)x.click()};q("#v5srtout").onclick=function(){var x=q("#v4exp");if(x)x.click()};q("#v5cache").onclick=function(){var x=q("#v4clean");if(x)x.click()};
 presetMenu();V5.last=snapshot();getFPS();timing();
 document.addEventListener("focusin",function(e){if(e.target&&e.target.tagName==="TEXTAREA"){V5.editing=true;commit();setTimeout(timing,0)}},true);
 document.addEventListener("focusout",function(e){if(e.target&&e.target.tagName==="TEXTAREA"){V5.editing=false;V5.last=snapshot();renderPreview()}},true);
 document.addEventListener("input",function(e){if(e.target&&e.target.closest&&e.target.closest(".k26-inspector"))renderPreview()},true);
 document.addEventListener("change",function(e){if(e.target&&e.target.closest&&e.target.closest(".k26-inspector"))renderPreview()},true);
 document.addEventListener("keydown",function(e){if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==="z"){e.preventDefault();e.shiftKey?redo():undo()}},true);
 // Reset style without reloading the entire CEP panel.
 var reset=q("#k26Reset");if(reset)reset.onclick=function(){Object.assign(K26,{font:"Helvetica Neue",size:48,lead:100,track:0,align:"center",bold:true,italic:false,fillOn:true,fill:"#ffffff",strokeOn:true,stroke:"#000000",strokeW:3,bgOn:false,bg:"#000000",bgOp:75,shadowOn:false,shadow:"#000000",shadowBlur:8,zone:"bc",x:0,y:0,width:70});try{k26syncUI()}catch(e){};renderPreview();msg("✓ Stil sıfırlandı")};
 V5.followTimer=setInterval(follow,500);msg("v5.0 CORE CLEAN hazır")
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){setTimeout(boot,500)});else setTimeout(boot,500)
})();

/* =========================================================================
 KRALI v5.2 TRANSCRIPT PRO
 Transcript UX, multi-select, speech snap, search/replace, dictionary,
 cleanup preview, bulk timing. v5.0 ASR/render/export remains authoritative.
 ========================================================================= */
(function(){
var P={sel:new Set(),anchor:-1,globalKey:"KRALI_V52_DICT_GLOBAL",projectKey:"KRALI_V52_DICT_PROJECT",originalRender:null};
function q(s){return document.querySelector(s)} function qa(s){return [].slice.call(document.querySelectorAll(s))}
function st(s){var x=q("#status");if(x)x.textContent=s}
function fmt(s){s=Math.max(0,+s||0);var m=Math.floor(s/60),x=s-m*60;return String(m).padStart(2,"0")+":"+x.toFixed(3).padStart(6,"0")}
function active(){try{return Math.max(0,Math.min(cues.length-1,selected||0))}catch(e){return 0}}
function chosen(){return P.sel.size?[...P.sel].sort(function(a,b){return a-b}):[active()]}
function syncText(){qa("#captions .cue textarea").forEach(function(t,i){if(cues[i])cues[i].text=t.value})}
function words(c){return (c.words||[]).map(function(w){return{text:String(w.text||w.word||"").trim(),start:+w.start,end:+w.end}}).filter(function(w){return w.text&&isFinite(w.start)&&isFinite(w.end)})}
function refresh(){try{renderCues()}catch(e){};try{k31preview()}catch(e){}}
function selectMany(i,e){
 if(e&&(e.metaKey||e.ctrlKey)){P.sel.has(i)?P.sel.delete(i):P.sel.add(i);P.anchor=i}
 else if(e&&e.shiftKey&&P.anchor>=0){P.sel.clear();for(var n=Math.min(P.anchor,i);n<=Math.max(P.anchor,i);n++)P.sel.add(n)}
 else{P.sel.clear();P.sel.add(i);P.anchor=i}
 try{selected=i}catch(_){}
 qa("#captions .cue").forEach(function(x,n){x.classList.toggle("multi",P.sel.has(n));x.classList.toggle("active",n===i)});
 updateCount();try{k31preview()}catch(_){}
}
function updateCount(){var x=q("#v52sel");if(x)x.textContent=P.sel.size>1?P.sel.size+" seçili":""}
function installCards(){
 var box=q("#captions");if(!box)return;
 qa("#captions .cue").forEach(function(d,i){
  if(d.dataset.v52)return;d.dataset.v52="1";
  var c=cues[i],head=document.createElement("div");head.className="v52cueHead";
  var iss=[];try{if(typeof issues==="function")iss=issues(c)}catch(_){}
  head.innerHTML='<span class="v52num">#'+(i+1)+'</span><span>'+fmt(c.start)+' → '+fmt(c.end)+'</span><span>'+(c.end-c.start).toFixed(2)+'s</span><span class="'+(iss.length?"warn":"ok")+'">'+(iss.length?"⚠":"✓")+'</span>';
  d.insertBefore(head,d.firstChild);
  d.onclick=function(e){if(e.target.tagName!=="TEXTAREA")selectMany(i,e)};
  var ta=d.querySelector("textarea");if(ta){
   ta.onfocus=function(e){selectMany(i,e)};
   ta.onclick=function(e){selectMany(i,e);try{goToCue(i)}catch(_){}};
  }
  if(P.sel.has(i))d.classList.add("multi")
 });
 updateCount()
}
function snapSpeech(){
 syncText();var ids=chosen(),done=0;ids.forEach(function(i){var c=cues[i],w=words(c);if(w.length){c.start=w[0].start;c.end=w[w.length-1].end;done++}});
 refresh();st("🎯 "+done+" altyazı konuşmaya yapıştırıldı")
}
function shiftFrames(fr){
 var fps=25;try{var t=q("#v5fps").textContent.match(/[\d.]+/);if(t)fps=+t[0]}catch(_){}
 var d=fr/fps;chosen().forEach(function(i){var c=cues[i];c.start=Math.max(0,c.start+d);c.end=Math.max(c.start+.02,c.end+d)});refresh();st("✓ "+chosen().length+" altyazı "+(fr>0?"+":"")+fr+"f")
}
function doSearch(nextOnly){
 var term=q("#v52find").value;if(!term)return;var start=active()+1,found=-1;
 for(var pass=0;pass<2&&found<0;pass++)for(var i=pass?0:start;i<(pass?start:cues.length);i++)if(String(cues[i].text).toLocaleLowerCase("tr-TR").includes(term.toLocaleLowerCase("tr-TR"))){found=i;break}
 if(found>=0){P.sel.clear();P.sel.add(found);try{selected=found}catch(_){};refresh();setTimeout(function(){var x=qa("#captions .cue")[found];if(x)x.scrollIntoView({block:"center"})},20);st("🔎 "+(found+1)+". altyazı")}
}
function replace(all){
 var a=q("#v52find").value,b=q("#v52replace").value;if(!a)return;var ids=all?cues.map(function(_,i){return i}):chosen(),n=0;
 ids.forEach(function(i){var old=cues[i].text,re=new RegExp(a.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),"gi");cues[i].text=old.replace(re,function(){n++;return b})});
 refresh();st("✓ "+n+" değiştirme")
}
function loadDict(key){try{return JSON.parse(localStorage.getItem(key)||"[]")}catch(e){return[]}}
function saveDict(key,a){localStorage.setItem(key,JSON.stringify(a))}
function dictRows(){
 var box=q("#v52dictRows");if(!box)return;var a=loadDict(P.globalKey),b=loadDict(P.projectKey),rows=a.map(function(x,i){return'<div><span>G</span><b>'+x.from+'</b> → '+x.to+' <button data-k="g" data-i="'+i+'">×</button></div>'}).concat(b.map(function(x,i){return'<div><span>P</span><b>'+x.from+'</b> → '+x.to+' <button data-k="p" data-i="'+i+'">×</button></div>'}));
 box.innerHTML=rows.join("")||"<small>Henüz sözlük girdisi yok.</small>";
 qa("#v52dictRows button").forEach(function(x){x.onclick=function(){var key=x.dataset.k==="g"?P.globalKey:P.projectKey,a=loadDict(key);a.splice(+x.dataset.i,1);saveDict(key,a);dictRows()}})
}
function addDict(){
 var f=q("#v52df").value.trim(),t=q("#v52dt").value.trim();if(!f||!t)return;var key=q("#v52scope").value==="global"?P.globalKey:P.projectKey,a=loadDict(key);a.push({from:f,to:t});saveDict(key,a);q("#v52df").value=q("#v52dt").value="";dictRows()
}
function normalizeText(text,opts){
 var s=String(text||""),changes=0,before=s;
 if(opts.spaces){s=s.replace(/[ \t]+/g," ").replace(/\s+([,.!?;:])/g,"$1").trim()}
 if(opts.percent){s=s.replace(/%\s+(\d)/g,"%$1").replace(/(\d)\s+%/g,"%$1")}
 if(opts.case&&s){s=s.charAt(0).toLocaleUpperCase("tr-TR")+s.slice(1)}
 if(opts.dict){loadDict(P.globalKey).concat(loadDict(P.projectKey)).forEach(function(x){var r=new RegExp(x.from.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),"gi");s=s.replace(r,x.to)})}
 if(opts.fillers){s=s.replace(/\b(ı+|ıı+|eee+|eee|ııı)\b[,.]?\s*/gi,"").replace(/\s{2,}/g," ").trim()}
 if(opts.repeat){s=s.replace(/\b([\p{L}\p{N}]+)(\s+\1\b)+/giu,"$1")}
 return {text:s,changed:s!==before}
}
function cleanupPreview(){
 syncText();var opt={spaces:q("#v52spaces").checked,percent:q("#v52percent").checked,case:q("#v52case").checked,dict:q("#v52dict").checked,fillers:q("#v52fillers").checked,repeat:q("#v52repeat").checked},ids=chosen(),out=[],n=0;
 ids.forEach(function(i){var r=normalizeText(cues[i].text,opt);if(r.changed){n++;out.push({i:i,before:cues[i].text,after:r.text})}});
 var modal=q("#v52modal"),body=q("#v52diff");body.innerHTML=out.slice(0,30).map(function(x){return'<div><small>#'+(x.i+1)+'</small><del>'+x.before+'</del><ins>'+x.after+'</ins></div>'}).join("")||"<p>Değişiklik yok.</p>";modal.classList.add("show");
 q("#v52applyClean").onclick=function(){out.forEach(function(x){cues[x.i].text=x.after});modal.classList.remove("show");refresh();st("✓ "+n+" altyazı temizlendi")};
 q("#v52cancelClean").onclick=function(){modal.classList.remove("show")}
}
function tools(){
 if(q("#v52tools"))return;var captions=q("#captions"),p=document.createElement("section");p.id="v52tools";p.innerHTML=
 '<div class="v52search"><input id="v52find" placeholder="Ara…"><input id="v52replace" placeholder="Değiştir…"><button id="v52next">⌕</button><button id="v52one">Değiştir</button><button id="v52all">Tümü</button><span id="v52sel"></span></div>'+
 '<div class="v52actions"><button id="v52snap">🎯 Konuşmaya Yapıştır</button><button data-fr="-2">−2f</button><button data-fr="-1">−1f</button><button data-fr="1">+1f</button><button data-fr="2">+2f</button><button id="v52clean">Metni Temizle</button><button id="v52dictOpen">Sözlük</button></div>';
 if(captions)captions.parentNode.insertBefore(p,captions);else document.body.appendChild(p);
 q("#v52next").onclick=function(){doSearch(true)};q("#v52one").onclick=function(){replace(false)};q("#v52all").onclick=function(){replace(true)};q("#v52snap").onclick=snapSpeech;qa("#v52tools [data-fr]").forEach(function(x){x.onclick=function(){shiftFrames(+x.dataset.fr)}});q("#v52clean").onclick=function(){q("#v52cleanPop").classList.toggle("show")};q("#v52dictOpen").onclick=function(){q("#v52dictPop").classList.toggle("show")};
 q("#v52find").onkeydown=function(e){if(e.key==="Enter")doSearch(true)}
}
function popovers(){
 if(q("#v52cleanPop"))return;var d=document.createElement("div");d.innerHTML=
 '<section id="v52cleanPop" class="v52pop"><b>METİN TEMİZLEME</b><label><input id="v52spaces" type="checkbox" checked> Boşluk / noktalama</label><label><input id="v52percent" type="checkbox" checked> Yüzde biçimi</label><label><input id="v52case" type="checkbox" checked> Cümle başlangıcı</label><label><input id="v52dict" type="checkbox" checked> KRALİ Sözlük</label><label><input id="v52fillers" type="checkbox"> Dolgu sesleri (ııı / eee)</label><label><input id="v52repeat" type="checkbox"> Kelime tekrarları</label><button id="v52previewClean">Önizle</button></section>'+
 '<section id="v52dictPop" class="v52pop"><b>KRALİ SÖZLÜK</b><div><input id="v52df" placeholder="whisper yazımı"><span>→</span><input id="v52dt" placeholder="doğru yazım"></div><div><select id="v52scope"><option value="project">Proje</option><option value="global">Global</option></select><button id="v52dictAdd">+ Ekle</button></div><div id="v52dictRows"></div></section>'+
 '<section id="v52modal"><div><h3>Temizleme Önizlemesi</h3><div id="v52diff"></div><footer><button id="v52cancelClean">İptal</button><button id="v52applyClean">Uygula</button></footer></div></section>';
 document.body.appendChild(d);q("#v52previewClean").onclick=cleanupPreview;q("#v52dictAdd").onclick=addDict;dictRows()
}
function patchRender(){
 if(P.originalRender)return;try{P.originalRender=renderCues;renderCues=function(){P.originalRender();setTimeout(installCards,0)}}catch(e){}
}
function boot(){patchRender();tools();popovers();installCards();st("v5.2 TRANSCRIPT PRO hazır")}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){setTimeout(boot,700)});else setTimeout(boot,700)
})();

/* KRALI v5.3 COMPACT INSPECTOR — UI-only layer; stable engine retained */
(function(){
function q(s){return document.querySelector(s)} function qa(s){return [].slice.call(document.querySelectorAll(s))}
function live(){try{k31preview()}catch(e){try{k26render()}catch(_){}}}
function section(title,cls,open){
 var d=document.createElement("details");d.className="v53details "+cls;if(open)d.open=true;
 d.innerHTML='<summary><span>'+title+'</span><span class="v53chev">›</span></summary><div class="v53body"></div>';return d
}
function move(sel,to){var x=q(sel);if(x)to.appendChild(x)}
function enhanceRange(id,min,max,step,key){
 var old=q(id);if(!old)return;
 var wrap=document.createElement("div");wrap.className="v53range";
 var r=document.createElement("input");r.type="range";r.min=min;r.max=max;r.step=step;r.value=K26[key];
 old.parentNode.insertBefore(wrap,old);wrap.appendChild(old);wrap.appendChild(r);
 r.oninput=function(){K26[key]=+r.value;old.value=r.value;old.dispatchEvent(new Event("input",{bubbles:true}));live()};
 old.addEventListener("input",function(){r.value=old.value});
}
function boot(){
 if(q("#v53Inspector"))return;
 var old=q(".k26-inspector");if(!old)return;
 var host=document.createElement("aside");host.id="v53Inspector";
 var text=section("TEXT","v53text",true),appearance=section("APPEARANCE","v53appearance",false),transform=section("POSITION & TRANSFORM","v53transform",false);
 host.appendChild(text);host.appendChild(appearance);host.appendChild(transform);
 old.parentNode.insertBefore(host,old);host.appendChild(old);

 // Existing proven controls stay wired; CSS visually groups them into collapsible sections.
 // We tag blocks by their labels/contents rather than cloning controls, so no handler is lost.
 var kids=qa(".k26-inspector > *"),mode="text";
 kids.forEach(function(x){
   var t=(x.textContent||"").trim().toUpperCase();
   if(t.indexOf("APPEARANCE")>=0)mode="appearance";
   if(t.indexOf("ALIGN & TRANSFORM")>=0)mode="transform";
   (mode==="text"?text.querySelector(".v53body"):mode==="appearance"?appearance.querySelector(".v53body"):transform.querySelector(".v53body")).appendChild(x);
 });
 // unwrap old inspector shell after moving controls
 old.style.display="contents";

 // Make numeric visual controls richer while keeping original inputs authoritative.
 enhanceRange("#k26Size",12,160,1,"size");
 enhanceRange("#k26Leading",60,180,1,"lead");
 enhanceRange("#k26Tracking",-100,300,1,"track");
 /* v6.6 final: main Kontur value stays numeric; advanced sliders only */
 /* v6.6 final: main Arka Plan value stays numeric; advanced sliders only */
 /* v6.6 final: main Gölge value stays numeric; advanced sliders only */
 enhanceRange("#k26X",-50,50,1,"x");
 enhanceRange("#k26Y",-50,50,1,"y");
 enhanceRange("#k26Width",15,100,1,"width");

 // Compact v5 timing/QC bar into one disclosure.
 var v5=q("#v5bar");if(v5){
   var timing=v5.querySelector(".v5time"),smart=v5.querySelector(".v5smart");
   if(timing){var det=section("TIMING","v53timing",false);timing.parentNode.insertBefore(det,timing);det.querySelector(".v53body").appendChild(timing)}
   if(smart){var det2=section("AKILLI BÖL & KONTROL","v53smart",false);smart.parentNode.insertBefore(det2,smart);det2.querySelector(".v53body").appendChild(smart)}
 }

 // Search/replace becomes a compact disclosure; daily actions stay visible.
 var tools=q("#v52tools");if(tools){
   var search=tools.querySelector(".v52search");if(search){var sd=section("ARA / DEĞİŞTİR","v53search",false);tools.insertBefore(sd,tools.firstChild);sd.querySelector(".v53body").appendChild(search)}
 }

 // Detail controls for appearance, added without replacing current state.
 var ap=appearance.querySelector(".v53body"),extra=document.createElement("div");extra.className="v53advanced";
 extra.innerHTML='<div class="v53sub">DETAYLI GÖRÜNÜM</div>'+
 '<label>Stroke <input id="v53sw" type="range" min="0" max="20" step=".5"><output id="v53swo"></output></label>'+
 '<label>Background Opacity <input id="v53bo" type="range" min="0" max="100"><output id="v53boo"></output></label>'+
 '<label>Shadow Blur <input id="v53sb" type="range" min="0" max="40"><output id="v53sbo"></output></label>'+
 '<label>Shadow X <input id="v53sx" type="range" min="-30" max="30"><output id="v53sxo"></output></label>'+
 '<label>Shadow Y <input id="v53sy" type="range" min="-30" max="30"><output id="v53syo"></output></label>';
 ap.appendChild(extra);
 function bind(id,out,key,def){var x=q(id),o=q(out);if(K26[key]==null)K26[key]=def;x.value=K26[key];o.textContent=x.value;x.oninput=function(){K26[key]=+x.value;o.textContent=x.value;var map={strokeW:"#k26StrokeW",bgOp:"#k26BgOp",shadowBlur:"#k26ShadowBlur"},old=map[key]&&q(map[key]);if(old){old.value=x.value;old.dispatchEvent(new Event("input",{bubbles:true}))}live()}}
 bind("#v53sw","#v53swo","strokeW",3);bind("#v53bo","#v53boo","bgOp",75);bind("#v53sb","#v53sbo","shadowBlur",8);bind("#v53sx","#v53sxo","shadowX",0);bind("#v53sy","#v53syo","shadowY",0);

 // Reduce empty vertical gaps dynamically.
 document.body.classList.add("v53compact");live()
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){setTimeout(boot,850)});else setTimeout(boot,850)
})();

/* KRALI v5.4 TÜRKÇE PRO INSPECTOR — layout/localization layer */
(function(){
function q(s){return document.querySelector(s)} function qa(s){return [].slice.call(document.querySelectorAll(s))}
function live(){try{k31preview()}catch(e){try{k26render()}catch(_){}}}
function details(title,cls,open){var d=document.createElement("details");d.className="v54details "+cls;if(open)d.open=true;d.innerHTML='<summary><span>'+title+'</span><span>›</span></summary><div class="v54body"></div>';return d}
function tr(){
 var map={"Caption Style":"Altyazı Stili","Premiere uyumlu canlı önizleme":"Premiere ile uyumlu canlı önizleme","Subtitle":"Altyazı","Social":"Sosyal","Clean":"Sade","Font":"Yazı Tipi","Size":"Boyut","Leading":"Satır Aralığı","Tracking":"Harf Aralığı","Bold":"Kalın","Italic":"İtalik","APPEARANCE":"GÖRÜNÜM","POSITION & TRANSFORM":"KONUM & DÖNÜŞÜM","Fill":"Dolgu","Stroke":"Kontur","Background":"Arka Plan","Shadow":"Gölge","Width":"Genişlik","Stil Preseti ▾":"Stil Preseti ▾","TIMING":"ZAMANLAMA","TEXT":"METİN"};
 qa("body *").forEach(function(el){if(el.children.length===0){var t=(el.textContent||"").trim();if(map[t])el.textContent=map[t]}});
 qa("input").forEach(function(x){if(x.placeholder==="Ara…")x.placeholder="Metin ara…";if(x.placeholder==="Değiştir…")x.placeholder="Yeni metin…"})
}
function moveWorkflow(){
 var inspector=q("#v53Inspector");if(!inspector)return;
 var transform=inspector.querySelector(".v53transform");if(!transform)return;
 var body=transform.querySelector(".v53body");
 var v5=q("#v5bar");if(v5){
   var preset=v5.querySelector(".v5top"),smart=v5.querySelector(".v53smart")||v5.querySelector(".v5smart"),timing=v5.querySelector(".v53timing")||v5.querySelector(".v5time");
   if(preset){var d=details("STİL PRESETİ & TAKİP","v54workflow",false);body.appendChild(d);d.querySelector(".v54body").appendChild(preset)}
   if(smart){var d2=details("AKILLI BÖLME & KONTROL","v54workflow",false);body.appendChild(d2);d2.querySelector(".v54body").appendChild(smart)}
   if(timing){var d3=details("ZAMANLAMA","v54workflow",false);body.appendChild(d3);d3.querySelector(".v54body").appendChild(timing)}
   var menu=v5.querySelector("#v5menu");if(menu){var d4=details("DOSYA & ÖNBELLEK","v54workflow",false);body.appendChild(d4);d4.querySelector(".v54body").appendChild(menu);menu.classList.add("show")}
   v5.style.display="none";
 }
}
function improveText(){
 var t=q("#v53Inspector .v53text .v53body");if(!t)return;t.classList.add("v54textgrid");
 // Labels above controls are kept, but numeric groups become cleaner cards through CSS.
}
function backgroundAdvanced(){
 var ap=q("#v53Inspector .v53appearance .v53body");if(!ap||q("#v54bg"))return;
 var d=details("GELİŞMİŞ ARKA PLAN","v54bg",false);d.id="v54bg";ap.appendChild(d);
 d.querySelector(".v54body").innerHTML=
 '<label class="v54slider"><span>Köşe Yuvarlama</span><input id="v54radius" type="range" min="0" max="80" step="1"><output id="v54radiusO"></output></label>'+
 '<label class="v54slider"><span>Yatay Boşluk</span><input id="v54padX" type="range" min="0" max="80" step="1"><output id="v54padXO"></output></label>'+
 '<label class="v54slider"><span>Dikey Boşluk</span><input id="v54padY" type="range" min="0" max="60" step="1"><output id="v54padYO"></output></label>'+
 '<label class="v54slider"><span>Arka Plan Opaklığı</span><input id="v54bgOpacity" type="range" min="0" max="100" step="1"><output id="v54bgOpacityO"></output></label>';
 function bind(id,out,key,def){if(K26[key]==null)K26[key]=def;var x=q(id),o=q(out);x.value=K26[key];o.textContent=x.value;x.oninput=function(){K26[key]=+x.value;o.textContent=x.value;if(key==="bgOp"){var old=q("#k26BgOp");if(old){old.value=x.value;old.dispatchEvent(new Event("input",{bubbles:true}))}}live()}}
 bind("#v54radius","#v54radiusO","bgRadius",10);bind("#v54padX","#v54padXO","bgPadX",14);bind("#v54padY","#v54padYO","bgPadY",8);bind("#v54bgOpacity","#v54bgOpacityO","bgOp",75);
}
function boot(){if(q("#v54done"))return;var x=document.createElement("i");x.id="v54done";x.hidden=true;document.body.appendChild(x);tr();moveWorkflow();improveText();backgroundAdvanced();document.body.classList.add("v54turkce");live()}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){setTimeout(boot,1000)});else setTimeout(boot,1000)
})();

/* KRALI v5.4.1 — inspector sibling order correction */
(function(){
function q(s){return document.querySelector(s)}
function boot(){
 var inspector=q("#v53Inspector"); if(!inspector)return;
 var transform=inspector.querySelector(".v53transform"); if(!transform)return;
 // v5.4 placed workflow disclosures inside Konum & Dönüşüm body.
 // Move them out as sibling sections immediately AFTER Konum & Dönüşüm.
 var nested=[].slice.call(transform.querySelectorAll(":scope > .v53body > .v54workflow"));
 if(!nested.length)return;
 var ref=transform;
 nested.forEach(function(d){
   inspector.insertBefore(d,ref.nextSibling);
   ref=d;
 });
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){setTimeout(boot,1150)});else setTimeout(boot,1150)
})();

/* KRALI v5.5 CAPTION EDITOR PRO */
(function(){
function q(s){return document.querySelector(s)} function qa(s){return [].slice.call(document.querySelectorAll(s))}
function live(){try{k31preview()}catch(e){}}
function idx(){try{return Math.max(0,Math.min(cues.length-1,selected||0))}catch(e){return 0}}
function fps(){var x=q("#v5fps"),m=x&&x.textContent.match(/[\d.]+/);return m?+m[0]:25}
function setStyle(k,v){K26[k]=v;live()}
function row(name,id,min,max,step,key,def){if(K26[key]==null)K26[key]=def;return '<label class="v55row"><span>'+name+'</span><input id="'+id+'" type="range" min="'+min+'" max="'+max+'" step="'+step+'" value="'+K26[key]+'"><output>'+K26[key]+'</output></label>'}
function bindRange(id,key){var x=q("#"+id);if(!x)return;x.oninput=function(){setStyle(key,+x.value);x.nextElementSibling.textContent=x.value}}
function removeFrameButtons(){
 ["#v5sm","#v5sp","#v5em","#v5ep"].forEach(function(s){var x=q(s);if(x)x.remove()});
 qa("#v52tools [data-fr]").forEach(function(x){x.remove()});
}
function advancedAppearance(){
 var ap=q("#v53Inspector .v53appearance .v53body");if(!ap||q("#v55appearance"))return;
 var d=document.createElement("details");d.id="v55appearance";d.className="v54details";d.innerHTML='<summary><span>GELİŞMİŞ GÖRÜNÜM</span><span>›</span></summary><div class="v54body">'+
 row("Dolgu Opaklığı","v55fillop",0,100,1,"fillOp",100)+row("Kontur Opaklığı","v55strokeop",0,100,1,"strokeOp",100)+
 row("Gölge Opaklığı","v55shadowop",0,100,1,"shadowOp",65)+row("Gölge X","v55shadowx",-40,40,1,"shadowX",0)+row("Gölge Y","v55shadowy",-40,40,1,"shadowY",2)+
 row("Köşe Yuvarlama","v55radius",0,80,1,"bgRadius",10)+row("Yatay İç Boşluk","v55padx",0,80,1,"bgPadX",14)+row("Dikey İç Boşluk","v55pady",0,60,1,"bgPadY",8)+
 '<label class="v55select"><span>Arka Plan Biçimi</span><select id="v55bgmode"><option value="block">Tek Blok</option><option value="line">Her Satırı Sar</option></select></label></div>';
 ap.appendChild(d);
 [["v55fillop","fillOp"],["v55strokeop","strokeOp"],["v55shadowop","shadowOp"],["v55shadowx","shadowX"],["v55shadowy","shadowY"],["v55radius","bgRadius"],["v55padx","bgPadX"],["v55pady","bgPadY"]].forEach(function(a){bindRange(a[0],a[1])});
 q("#v55bgmode").value=K26.bgMode||"block";q("#v55bgmode").onchange=function(){setStyle("bgMode",this.value)}
}
function wordEditor(){
 if(q("#v55wordbox"))return;var captions=q("#captions");if(!captions)return;
 var b=document.createElement("section");b.id="v55wordbox";b.innerHTML='<div class="v55head"><b>KELİME ZAMANLARI</b><span>Kelimeye tıkla → Premiere o ana gider</span></div><div id="v55words"></div><div class="v55drag"><span>Başlangıç</span><input id="v55start" type="range" step=".001"><span>Bitiş</span><input id="v55end" type="range" step=".001"></div>';
 captions.parentNode.insertBefore(b,captions);
 function draw(){
  var c=cues&&cues[idx()];if(!c)return;var ws=c.words||[],box=q("#v55words");box.innerHTML=ws.map(function(w,i){return'<button data-i="'+i+'">'+String(w.text||w.word||"")+'</button>'}).join("")||'<small>Bu altyazıda kelime timestamp verisi yok.</small>';
  qa("#v55words button").forEach(function(x){x.onclick=function(){var w=ws[+x.dataset.i];try{evalHost("$._KRALI_SUB.v55SetPlayhead("+Number(w.start)+")",function(){})}catch(e){}}});
  var s=q("#v55start"),e=q("#v55end"),span=Math.max(.5,c.end-c.start),mn=Math.max(0,c.start-span),mx=c.end+span;s.min=e.min=mn;s.max=e.max=mx;s.value=c.start;e.value=c.end;
  s.oninput=function(){c.start=Math.min(+s.value,c.end-.02);live()};e.oninput=function(){c.end=Math.max(+e.value,c.start+.02);live()}
 }
 document.addEventListener("click",function(e){if(e.target&&e.target.closest&&e.target.closest("#captions .cue"))setTimeout(draw,20)},true);draw()
}
function qc2(){
 var old=q("#v5problems");if(!old)return;old.textContent="⚠ Kalite Kontrolü";
 old.onclick=function(){
  var bad=[];for(var i=0;i<cues.length;i++){var c=cues[i],r=[],d=c.end-c.start,n=String(c.text||"").length;if(d<.65)r.push("çok kısa");if(n/Math.max(.05,d)>22)r.push("hızlı");if(i<cues.length-1&&c.end>cues[i+1].start)r.push("çakışma");if(i<cues.length-1&&cues[i+1].start-c.end>2.5)r.push("uzun boşluk");if(n<3)r.push("çok kısa metin");try{if(typeof measureLines==="function"&&measureLines(c.text)>2)r.push("3+ satır")}catch(_){}if(r.length)bad.push({i:i,r:r})}
  if(!bad.length){var s=q("#status");if(s)s.textContent="✓ "+cues.length+" altyazının tamamı temiz";return}
  var cur=idx(),x=bad.find(function(z){return z.i>cur})||bad[0];try{selected=x.i}catch(_){}
  var el=qa("#captions .cue")[x.i];if(el)el.scrollIntoView({block:"center"});live();var s=q("#status");if(s)s.textContent="⚠ "+bad.length+" kontrol gerekli · #"+(x.i+1)+" · "+x.r.join(" · ")
 }
}
function safeArea(){
 var tr=q("#v53Inspector .v53transform .v53body");if(!tr||q("#v55safe"))return;
 var d=document.createElement("div");d.id="v55safe";d.className="v55safe";d.innerHTML='<span>Güvenli Konum</span><button data-z="tc">Üst</button><button data-z="cc">Orta</button><button data-z="bc">Alt</button>';
 tr.appendChild(d);qa("#v55safe button").forEach(function(x){x.onclick=function(){K26.zone=x.dataset.z;try{k26syncUI()}catch(_){};live()}})
}
function boot(){removeFrameButtons();advancedAppearance();wordEditor();qc2();safeArea();document.body.classList.add("v55pro");var s=q("#status");if(s)s.textContent="v5.5 CAPTION EDITOR PRO hazır"}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){setTimeout(boot,1300)});else setTimeout(boot,1300)
})();

/* =========================================================================
 KRALI v5.6 COMPLETE PRO
 Preset 2.0 + Responsive Safe Area + Caption Timeline + ASR Context +
 render fingerprinting foundation. Stable v5.5 engine remains intact.
 ========================================================================= */
(function(){
function q(s){return document.querySelector(s)} function qa(s){return [].slice.call(document.querySelectorAll(s))}
function live(){try{k31preview()}catch(e){}}
function idx(){try{return Math.max(0,Math.min(cues.length-1,selected||0))}catch(e){return 0}}
function msg(s){var x=q("#status");if(x)x.textContent=s}
function projectKey(){try{return "KRALI_V56_"+(app&&app.project?app.project.name:"PROJECT")}catch(e){return "KRALI_V56_PROJECT"}}
function dictPrompt(){
 var arr=[];try{arr=JSON.parse(localStorage.getItem("KRALI_V52_DICT_GLOBAL")||"[]").concat(JSON.parse(localStorage.getItem("KRALI_V52_DICT_PROJECT")||"[]"))}catch(e){}
 return arr.map(function(x){return x.to}).filter(Boolean).slice(0,80).join(", ")
}
function asrContext(){
 var p=dictPrompt();if(!p)return;
 try{
  // whisper.cpp prompt flag is appended only when the existing command builder exposes args.
  var old=window.kBuildWhisperArgs;if(typeof old==="function"&&!old._v56){
   var f=function(){var a=old.apply(this,arguments),p=dictPrompt();if(p&&Array.isArray(a)){a.push("--prompt",p)}return a};f._v56=1;window.kBuildWhisperArgs=f
  }
 }catch(e){}
}
function preset2(){
 var root=q("#v53Inspector");if(!root||q("#v56presets"))return;
 var anchor=qa("#v53Inspector>.v54workflow")[0]||root.lastElementChild,d=document.createElement("details");d.id="v56presets";d.className="v54details v56preset";d.innerHTML='<summary><span>PRESET KÜTÜPHANESİ</span><span>›</span></summary><div class="v54body"><div id="v56presetGrid"></div><div class="v56presetActions"><input id="v56presetName" placeholder="Preset adı"><button id="v56savePreset">Kaydet</button><button id="v56exportPreset">Dışa Aktar</button><label class="v56file">İçe Aktar<input id="v56importPreset" type="file" accept=".json"></label></div></div>';
 anchor.parentNode.insertBefore(d,anchor.nextSibling);
 function load(){try{return JSON.parse(localStorage.getItem("KRALI_V56_PRESETS")||"[]")}catch(e){return[]}}
 function save(a){localStorage.setItem("KRALI_V56_PRESETS",JSON.stringify(a))}
 function draw(){var a=load(),g=q("#v56presetGrid");g.innerHTML=a.map(function(p,i){return '<button data-i="'+i+'" class="v56presetCard"><span style="font-family:'+JSON.stringify(p.style.font||"Arial")+';font-size:'+(Math.min(18,p.style.size||48)/2+8)+'px;font-weight:'+(p.style.bold?700:400)+'">Aa</span><b>'+p.name+'</b></button>'}).join("")||'<small>Kaydedilmiş preset yok.</small>';qa("#v56presetGrid button").forEach(function(b){b.onclick=function(){Object.assign(K26,a[+b.dataset.i].style);try{k26syncUI()}catch(_){};live();msg("✓ Preset uygulandı")}})}
 q("#v56savePreset").onclick=function(){var n=q("#v56presetName").value.trim();if(!n)return;var a=load();a.push({name:n,style:JSON.parse(JSON.stringify(K26))});save(a);draw();q("#v56presetName").value=""};
 q("#v56exportPreset").onclick=function(){var blob=new Blob([JSON.stringify(load(),null,2)],{type:"application/json"}),u=URL.createObjectURL(blob),a=document.createElement("a");a.href=u;a.download="KRALI_Presetleri.json";a.click();setTimeout(function(){URL.revokeObjectURL(u)},500)};
 q("#v56importPreset").onchange=function(){var f=this.files&&this.files[0];if(!f)return;var r=new FileReader();r.onload=function(){try{var a=JSON.parse(r.result);if(Array.isArray(a)){save(a);draw();msg("✓ Presetler içe aktarıldı")}}catch(e){msg("Preset dosyası okunamadı")}};r.readAsText(f)};draw()
}
function safeResponsive(){
 var tr=q("#v53Inspector .v53transform .v53body");if(!tr||q("#v56safe"))return;var d=document.createElement("details");d.id="v56safe";d.className="v54details";d.innerHTML='<summary><span>RESPONSIVE GÜVENLİ ALAN</span><span>›</span></summary><div class="v54body"><label class="v55select"><span>Profil</span><select id="v56safeProfile"><option value="auto">Otomatik</option><option value="reels">Reels / Shorts</option><option value="landscape">16:9 Yatay</option><option value="square">1:1 / 4:5</option></select></label><div class="v56safeBtns"><button data-p="top">Üst Güvenli</button><button data-p="center">Orta</button><button data-p="bottom">Alt Güvenli</button></div><small id="v56safeInfo"></small></div>';tr.appendChild(d);
 function apply(p){var prof=q("#v56safeProfile").value,y=0;if(p==="top"){K26.zone="tc";y=prof==="reels"?8:4}else if(p==="center"){K26.zone="cc";y=0}else{K26.zone="bc";y=prof==="reels"?-8:-3}K26.y=y;try{k26syncUI()}catch(_){};live();q("#v56safeInfo").textContent="Konum: "+p+" · Y "+y+"%"}
 qa("#v56safe button").forEach(function(b){b.onclick=function(){apply(b.dataset.p)}})
}
function timeline(){
 var cap=q("#captions");if(!cap||q("#v56timeline"))return;var s=document.createElement("section");s.id="v56timeline";s.innerHTML='<div class="v56tlHead"><b>ALTYAZI ZAMAN ÇİZGİSİ</b><span>Sürükle: zamanlamayı değiştir</span></div><div id="v56rail"></div>';cap.parentNode.insertBefore(s,cap);
 var drag=null;
 function draw(){if(!cues||!cues.length)return;var min=cues[0].start,max=cues[cues.length-1].end,span=Math.max(.1,max-min),rail=q("#v56rail");rail.innerHTML=cues.map(function(c,i){var l=(c.start-min)/span*100,w=Math.max(.5,(c.end-c.start)/span*100);return '<div class="v56clip '+(i===idx()?"active":"")+'" data-i="'+i+'" style="left:'+l+'%;width:'+w+'%"><i class="l"></i><span>'+(i+1)+'</span><i class="r"></i></div>'}).join("");
 qa("#v56rail .v56clip").forEach(function(x){x.onmousedown=function(e){var i=+x.dataset.i;try{selected=i}catch(_){};var c=cues[i],rect=rail.getBoundingClientRect(),mode=e.target.classList.contains("l")?"l":e.target.classList.contains("r")?"r":"move";drag={i:i,mode:mode,x:e.clientX,start:c.start,end:c.end,secPerPx:span/rect.width};e.preventDefault();live()}})
 }
 document.addEventListener("mousemove",function(e){if(!drag)return;var c=cues[drag.i],d=(e.clientX-drag.x)*drag.secPerPx;if(drag.mode==="l")c.start=Math.max(0,Math.min(drag.end-.02,drag.start+d));else if(drag.mode==="r")c.end=Math.max(drag.start+.02,drag.end+d);else{var len=drag.end-drag.start;c.start=Math.max(0,drag.start+d);c.end=c.start+len}draw();live()});
 document.addEventListener("mouseup",function(){if(drag){drag=null;draw()}});
 document.addEventListener("click",function(e){if(e.target&&e.target.closest&&e.target.closest("#captions .cue"))setTimeout(draw,30)},true);draw()
}
function renderFingerprint(){
 // Records the last successfully requested visual/text fingerprint.
 // This lets the next writer safely identify unchanged cues without changing the proven writer today.
 window.KRALI_V56_FINGERPRINT=function(c){var s=[c.text,+c.start.toFixed(3),+c.end.toFixed(3),JSON.stringify(K26)].join("|"),h=2166136261;for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h+=(h<<1)+(h<<4)+(h<<7)+(h<<8)+(h<<24)}return (h>>>0).toString(36)}
}
function boot(){asrContext();preset2();safeResponsive();timeline();renderFingerprint();document.body.classList.add("v56complete");msg("v5.6 COMPLETE PRO hazır")}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){setTimeout(boot,1500)});else setTimeout(boot,1500)
})();

/* =========================================================================
 KRALI v5.7 CLEAN WORKFLOW
 UX cleanup layer: removes duplicate panel timeline/timing UI, restores the
 efficient word-jump workflow as the primary timing interaction, compacts
 inspector, improves word split, QC summary and safe-area placement.
 ========================================================================= */
(function(){
function q(s){return document.querySelector(s)} function qa(s){return [].slice.call(document.querySelectorAll(s))}
function status(s){var x=q("#status");if(x)x.textContent=s}
function activeIndex(){try{return Math.max(0,Math.min(cues.length-1,Number(selected)||0))}catch(e){return 0}}
function refreshAll(){try{renderCaptions()}catch(e){} try{k31preview()}catch(e){} try{if(window.v52refresh)window.v52refresh()}catch(e){}}
function jump(sec){
 try{evalHost("$._KRALI_SUB.v55SetPlayhead("+Number(sec||0)+")",function(){})}catch(e){}
}
function cleanupOldUX(){
 var tl=q("#v56timeline"); if(tl)tl.remove();
 var drag=q("#v55wordbox .v55drag"); if(drag)drag.remove();
 // Remove old frame/timing controls and the dedicated timing accordion.
 ["#v5sm","#v5sp","#v5em","#v5ep"].forEach(function(s){var x=q(s);if(x)x.remove()});
 qa("[data-fr]").forEach(function(x){x.remove()});
 qa("#v53Inspector>.v54workflow").forEach(function(d){
   var t=(d.querySelector("summary")||{}).textContent||"";
   if(/ZAMANLAMA|TIMING/i.test(t))d.remove();
 });
 // v5.6 safe-area is useful, but move its controls into transform body.
 var safe=q("#v56safe"),body=q("#v53Inspector .v53transform .v53body");
 if(safe&&body){safe.open=true;var sb=safe.querySelector(".v54body");if(sb){var wrap=document.createElement("div");wrap.id="v57safeInline";wrap.innerHTML='<div class="v57miniTitle">GÜVENLİ ALAN</div>';while(sb.firstChild)wrap.appendChild(sb.firstChild);body.appendChild(wrap)}safe.remove()}
 // Keep presets but make it a compact inspector accordion.
 var pr=q("#v56presets");if(pr){var sm=pr.querySelector("summary span");if(sm)sm.textContent="STİL PRESETLERİ"}
}
function wordJumpPro(){
 var box=q("#v55wordbox");if(!box)return;
 var head=box.querySelector(".v55head");if(head)head.innerHTML='<b>KELİMEYE GİT</b><span>Tıkla: kelimeye git · Çift tıkla: buradan böl</span>';
 function draw(){
  var i=activeIndex(),c=cues&&cues[i],out=q("#v55words");if(!c||!out)return;
  var ws=c.words||[];
  out.innerHTML=ws.length?ws.map(function(w,k){var tx=String(w.text||w.word||"").trim();return '<button data-k="'+k+'" title="'+Number(w.start||0).toFixed(2)+' sn">'+tx+'</button>'}).join(""):'<small>Bu altyazıda kelime zaman bilgisi yok.</small>';
  qa("#v55words button").forEach(function(b){
    b.onclick=function(){var w=ws[+b.dataset.k];jump(w.start);qa("#v55words button").forEach(function(x){x.classList.remove("active")});b.classList.add("active")};
    b.ondblclick=function(e){e.preventDefault();var k=+b.dataset.k;if(k<=0||k>=ws.length)return;var cut=Number(ws[k].start);if(!(cut>c.start&&cut<c.end))return;
      var left=ws.slice(0,k),right=ws.slice(k),lt=left.map(function(w){return String(w.text||w.word||"").trim()}).join(" ").replace(/\s+([,.!?;:])/g,"$1"),rt=right.map(function(w){return String(w.text||w.word||"").trim()}).join(" ").replace(/\s+([,.!?;:])/g,"$1");
      var oldEnd=c.end;c.text=lt;c.end=cut;c.words=left;
      cues.splice(i+1,0,{text:rt,start:cut,end:oldEnd,words:right});
      try{selected=i+1}catch(_){}
      refreshAll();setTimeout(draw,20);jump(cut);status("✓ Altyazı kelime zamanından bölündü");
    };
  });
 }
 document.addEventListener("click",function(e){if(e.target&&e.target.closest&&e.target.closest("#captions .cue"))setTimeout(draw,20)},true);
 draw();
}
function qc3(){
 var old=q("#v5problems");if(!old)return;
 var wrap=old.parentNode,summary=q("#v57qcSummary");if(!summary){summary=document.createElement("span");summary.id="v57qcSummary";wrap&&wrap.appendChild(summary)}
 function scan(){
  var bad=[];for(var i=0;i<(cues||[]).length;i++){var c=cues[i],r=[],txt=String(c.text||"").trim(),dur=Math.max(.01,c.end-c.start);
   if(dur<.65)r.push("çok kısa");if(txt.length/dur>22)r.push("hızlı");if(i<cues.length-1&&c.end>cues[i+1].start)r.push("çakışma");if(txt.split(/\s+/).length===1&&dur>1.2)r.push("tek kelime");if(txt&&/^[a-zçğıöşü]/.test(txt))r.push("küçük harf");if(/\s+[,.!?;:]/.test(txt))r.push("noktalama");try{if(typeof measureLines==="function"&&measureLines(txt)>2)r.push("3+ satır")}catch(_){}
   if(r.length)bad.push({i:i,r:r})
  } summary.textContent=(cues.length-bad.length)+" temiz · "+bad.length+" kontrol";return bad
 }
 old.textContent="⚠ Kalite Kontrol";old.onclick=function(){var bad=scan();if(!bad.length){status("✓ Tüm altyazılar temiz");return}var cur=activeIndex(),x=bad.find(function(z){return z.i>cur})||bad[0];try{selected=x.i}catch(_){};var el=qa("#captions .cue")[x.i];if(el)el.scrollIntoView({block:"center"});refreshAll();status("⚠ #"+(x.i+1)+" · "+x.r.join(" · "))};scan()
 document.addEventListener("input",function(e){if(e.target&&e.target.closest&&e.target.closest("#captions"))setTimeout(scan,100)},true)
}
function inspectorOrder(){
 var ins=q("#v53Inspector");if(!ins)return;
 // Rename/compact visible workflow labels. Existing functionality stays.
 qa("#v53Inspector summary").forEach(function(s){var t=s.textContent.trim();if(/AKILLI BÖLME/i.test(t)){var x=s.querySelector("span");if(x)x.textContent="AKILLI BÖLME"}if(/DOSYA/i.test(t)){var y=s.querySelector("span");if(y)y.textContent="DOSYA"}});
}
function presetCompact(){
 var g=q("#v56presetGrid");if(!g)return;g.classList.add("v57compactPresets")
}
function boot(){cleanupOldUX();wordJumpPro();qc3();inspectorOrder();presetCompact();document.body.classList.add("v57clean");status("v5.7 CLEAN WORKFLOW hazır")}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){setTimeout(boot,1750)});else setTimeout(boot,1750)
})();

/* =========================================================================
 KRALI v6.0 PRO — workflow intelligence + recovery + incremental PNG render
 ========================================================================= */
(function(){
function q(s){return document.querySelector(s)} function qa(s){return [].slice.call(document.querySelectorAll(s))}
function st(s){var x=q("#status");if(x)x.textContent=s}
function ix(){try{return Math.max(0,Math.min(cues.length-1,Number(selected)||0))}catch(e){return 0}}
function refresh(){try{renderCues()}catch(_){}try{renderTranscript()}catch(_){}try{k31preview()}catch(_){}}
var V60={project:"PROJECT",activeWord:-1,autosaveTimer:null};

function projectInit(){
 evalHost("$._KRALI_SUB.v60ProjectKey()",function(r){try{var x=JSON.parse(r);if(x.ok)V60.project=x.key||"PROJECT"}catch(_){}
   restoreDraft();specialNamesUI();projectPresetKey();
 });
}
function draftKey(){return "KRALI_V60_DRAFT_"+V60.project}
function saveDraft(){
 try{if(!cues||!cues.length)return;localStorage.setItem(draftKey(),JSON.stringify({at:Date.now(),cues:cues.map(function(c){return{text:c.text,start:c.start,end:c.end,words:c.words||[],manualLock:!!c.manualLock,styleOverride:c.styleOverride||null}})}))}catch(_){}
}
function restoreDraft(){
 try{var raw=localStorage.getItem(draftKey());if(!raw)return;var d=JSON.parse(raw);if(!d.cues||!d.cues.length)return;
   var bar=document.createElement("div");bar.id="v60recover";bar.innerHTML='<span>Kaydedilmiş KRALİ taslağı bulundu.</span><button id="v60resume">Devam Et</button><button id="v60discard">Sil</button>';
   (q("#status")||document.body.firstChild).parentNode.insertBefore(bar,q("#status")||document.body.firstChild);
   q("#v60resume").onclick=function(){cues.splice(0,cues.length);d.cues.forEach(function(c){cues.push(c)});try{selected=0}catch(_){};bar.remove();refresh();st("✓ Taslak geri yüklendi")};
   q("#v60discard").onclick=function(){localStorage.removeItem(draftKey());bar.remove()}
 }catch(_){}
}
function autosave(){clearInterval(V60.autosaveTimer);V60.autosaveTimer=setInterval(saveDraft,2500);window.addEventListener("beforeunload",saveDraft)}

function specialKey(){return "KRALI_V60_NAMES_"+V60.project}
function names(){try{return JSON.parse(localStorage.getItem(specialKey())||"[]")}catch(_){return[]}}
function specialNamesUI(){
 var host=q("#v53Inspector");if(!host||q("#v60names"))return;var d=document.createElement("details");d.id="v60names";d.className="v54details";d.innerHTML='<summary><span>ÖZEL İSİMLER</span><span>›</span></summary><div class="v54body"><div class="v60inline"><input id="v60name" placeholder="HABAŞ, ComfortCity, X-T5…"><button id="v60nameAdd">Ekle</button></div><div id="v60nameList"></div><small>Bu liste yalnızca bu Premiere projesi için saklanır ve transkripsiyon bağlamında kullanılır.</small></div>';host.appendChild(d);
 function draw(){q("#v60nameList").innerHTML=names().map(function(n,i){return'<button data-i="'+i+'">'+n+' ×</button>'}).join("");qa("#v60nameList button").forEach(function(b){b.onclick=function(){var a=names();a.splice(+b.dataset.i,1);localStorage.setItem(specialKey(),JSON.stringify(a));draw()}})}
 q("#v60nameAdd").onclick=function(){var x=q("#v60name"),v=x.value.trim();if(!v)return;var a=names();if(a.indexOf(v)<0)a.push(v);localStorage.setItem(specialKey(),JSON.stringify(a));x.value="";draw()};draw()
}
window.KRALI_V60_ASR_CONTEXT=function(){var a=names();try{var g=JSON.parse(localStorage.getItem("KRALI_V52_DICT_GLOBAL")||"[]");a=a.concat(g.map(function(x){return x.to||x.from||""}))}catch(_){}return a.filter(Boolean).slice(0,100).join(", ")};

function projectPresetKey(){
 // Migrate v5.6 generic presets once into project-scoped storage.
 var pk="KRALI_V60_PRESETS_"+V60.project;if(!localStorage.getItem(pk)){var old=localStorage.getItem("KRALI_V56_PRESETS");if(old)localStorage.setItem(pk,old)}
 var save=q("#v56savePreset"),grid=q("#v56presetGrid");if(!save||!grid)return;
 function load(){try{return JSON.parse(localStorage.getItem(pk)||"[]")}catch(_){return[]}}
 function draw(){var a=load();grid.innerHTML=a.map(function(p,i){return'<button data-i="'+i+'" class="v56presetCard"><span>Aa</span><b>'+p.name+'</b></button>'}).join("")||'<small>Bu projede preset yok.</small>';qa("#v56presetGrid button").forEach(function(b){b.onclick=function(){Object.assign(K26,a[+b.dataset.i].style);try{k26syncUI()}catch(_){};k31preview()}})}
 save.onclick=function(){var n=q("#v56presetName").value.trim();if(!n)return;var a=load();a.push({name:n,style:JSON.parse(JSON.stringify(K26))});localStorage.setItem(pk,JSON.stringify(a));q("#v56presetName").value="";draw()};draw()
}

function liveWordFollow(){
 setInterval(function(){
  if(!cues||!cues.length||document.activeElement&&document.activeElement.tagName==="TEXTAREA")return;
  evalHost("$._KRALI_SUB.v41PlayheadSeconds()",function(r){var t=parseFloat(r),ci=-1;if(!isFinite(t))return;
   for(var i=0;i<cues.length;i++){if(t>=cues[i].start&&t<cues[i].end){ci=i;break}}
   if(ci<0)return;if(ci!==ix()){try{selected=ci}catch(_){};var ta=qa(".cue textarea,textarea.cue,#transcript textarea")[ci];if(ta)ta.scrollIntoView({block:"nearest"});refresh()}
   var ws=cues[ci].words||[],wi=-1;for(var j=0;j<ws.length;j++){if(t>=+ws[j].start&&t<+(ws[j].end||ws[j].start+.3)){wi=j;break}}
   if(wi!==V60.activeWord){V60.activeWord=wi;qa("#v55words button").forEach(function(b,k){b.classList.toggle("playing",k===wi)})}
  })
 },350)
}

function wordActions(){
 var box=q("#v55wordbox");if(!box||q("#v60wordActions"))return;var a=document.createElement("div");a.id="v60wordActions";a.innerHTML='<button data-a="mergeNext">Sonrakiyle Birleştir</button>';box.appendChild(a);
 var chosen=-1;
 document.addEventListener("click",function(e){var b=e.target.closest&&e.target.closest("#v55words button");if(b){chosen=+b.dataset.k;qa("#v55words button").forEach(function(x){x.classList.remove("chosen")});b.classList.add("chosen")}},true);
 function merge(dir){var i=ix(),j=i+dir;if(j<0||j>=cues.length)return;var a=cues[Math.min(i,j)],b=cues[Math.max(i,j)];a.text=(String(a.text).trim()+" "+String(b.text).trim()).trim();a.start=Math.min(a.start,b.start);a.end=Math.max(a.end,b.end);a.words=(a.words||[]).concat(b.words||[]).sort(function(x,y){return x.start-y.start});a.manualLock=true;cues.splice(Math.max(i,j),1);try{selected=Math.min(i,j)}catch(_){};refresh();saveDraft()}
 qa("#v60wordActions button").forEach(function(b){b.onclick=function(){var c=cues[ix()],ws=c.words||[],act=b.dataset.a;if(act==="mergePrev")return merge(-1);if(act==="mergeNext")return merge(1);if(chosen<0||chosen>=ws.length)return;
  if(act==="delete"){var w=ws.splice(chosen,1)[0],needle=String(w.text||w.word||"").trim(),parts=String(c.text||"").split(/\s+/);var p=parts.indexOf(needle);if(p>=0)parts.splice(p,1);c.text=parts.join(" ");chosen=-1;c.manualLock=true;refresh();saveDraft();return}
  if(act==="split"&&chosen>0){var cut=+ws[chosen].start,left=ws.slice(0,chosen),right=ws.slice(chosen),oldEnd=c.end;c.text=left.map(function(w){return w.text||w.word}).join(" ");c.end=cut;c.words=left;c.manualLock=true;cues.splice(ix()+1,0,{text:right.map(function(w){return w.text||w.word}).join(" "),start:cut,end:oldEnd,words:right,manualLock:true});refresh();saveDraft()}
 }});
 var lock=q("#v60lock");if(lock)lock.onchange=function(){var c=cues[ix()];if(c)c.manualLock=this.checked}
}

function smartSplit3(profile){
 var max=profile==="short"?3:profile==="long"?7:5,out=[];
 (cues||[]).forEach(function(c){if(c.manualLock){out.push(c);return}var ws=(c.words||[]).slice();if(!ws.length){out.push(c);return}var g=[];
  function flush(){if(!g.length)return;out.push({text:g.map(function(w){return String(w.text||w.word||"").trim()}).join(" ").replace(/\s+([,.!?;:])/g,"$1"),start:+g[0].start,end:+(g[g.length-1].end||g[g.length-1].start+.25),words:g.slice()});g=[]}
  ws.forEach(function(w,i){g.push(w);var next=ws[i+1],gap=next?+next.start-+(w.end||w.start):0,text=g.map(function(x){return x.text||x.word}).join(" "),punct=/[.!?…,:;]$/.test(String(w.text||w.word||"")),speed=text.length/Math.max(.15,(+(w.end||w.start+.25)-+g[0].start)),cut=(gap>.34)||(punct&&g.length>=2)||g.length>=max||speed>22;try{if(typeof measureLines==="function"&&measureLines(text)>2)cut=true}catch(_){}if(cut)flush()});flush()
 });
 cues.splice(0,cues.length);out.forEach(function(c){cues.push(c)});try{selected=0}catch(_){};refresh();saveDraft();st("✓ Akıllı Bölme 3.0 · "+out.length+" altyazı")
}
function bindSmart3(){
 qa("[data-p]").forEach(function(b){b.addEventListener("click",function(e){e.preventDefault();e.stopImmediatePropagation();smartSplit3(b.dataset.p)},true)})
}

function badges(){
 function scan(){var cards=qa("#captions .cue,.cue");cards.forEach(function(card,i){if(!cues[i])return;var old=card.querySelector(".v60badges");if(old)old.remove();var c=cues[i],r=[],txt=String(c.text||"").trim(),d=Math.max(.05,c.end-c.start);if(txt.length/d>22)r.push("HIZLI");try{if(typeof measureLines==="function"&&measureLines(txt)>2)r.push("3 SATIR")}catch(_){}if(i<cues.length-1&&c.end>cues[i+1].start)r.push("ÇAKIŞMA");if(txt.split(/\s+/).length===1&&d>1.2)r.push("TEK KELİME");if(r.length){var x=document.createElement("div");x.className="v60badges";x.innerHTML=r.map(function(z){return"<span>"+z+"</span>"}).join("");card.appendChild(x)}})}
 setInterval(scan,1800);scan()
}

function preflight(){
 var add=q("#add");if(!add)return;add.addEventListener("click",function(e){
  if(add.dataset.v60pass==="1"){add.dataset.v60pass="0";return}
  var bad=0;(cues||[]).forEach(function(c,i){var d=Math.max(.05,c.end-c.start),t=String(c.text||"");if(t.length/d>24||i<cues.length-1&&c.end>cues[i+1].start)bad++});
  if(!bad)return;
  e.preventDefault();e.stopImmediatePropagation();var m=q("#v60preflight");if(m)m.remove();m=document.createElement("div");m.id="v60preflight";m.innerHTML='<b>'+cues.length+' altyazı hazır · '+bad+' kontrol gerekli</b><button id="v60issues">Sorunlara Git</button><button id="v60anyway">Yine de Oluştur</button>';document.body.appendChild(m);
  q("#v60issues").onclick=function(){m.remove();var x=q("#v5problems");if(x)x.click()};q("#v60anyway").onclick=function(){m.remove();add.dataset.v60pass="1";add.click()}
 },true)
}

function renderProgress(){var add=q("#add");if(!add)return;var p=document.createElement("div");p.id="v60progress";p.innerHTML='<i></i><span></span>';add.parentNode.insertBefore(p,add.nextSibling);window.KRALI_V60_PROGRESS=function(n,total,label){p.style.display="flex";p.querySelector("i").style.width=(total?Math.round(n/total*100):0)+"%";p.querySelector("span").textContent=(label||"Oluşturuluyor")+" · "+n+" / "+total;if(n>=total)setTimeout(function(){p.style.display="none"},1200)}}

function boot(){projectInit();autosave();liveWordFollow();wordActions();bindSmart3();badges();preflight();renderProgress();document.body.classList.add("v60pro");st("v6.0 KRALİ PRO hazır")}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){setTimeout(boot,2100)});else setTimeout(boot,2100)
})();

/* =========================================================================
 KRALI v6.1 CLEAN PRO — focused production UI
 ========================================================================= */
(function(){
function q(s){return document.querySelector(s)} function qa(s){return [].slice.call(document.querySelectorAll(s))}
function st(s){var x=q("#status");if(x)x.textContent=s}
function cleanWordTools(){
 var a=q("#v60wordActions");if(a){
  qa("#v60wordActions button").forEach(function(b){if(b.dataset.a!=="mergeNext")b.remove()});
  var l=a.querySelector("label");if(l)l.remove();
  var keep=a.querySelector('[data-a="mergeNext"]');if(keep)keep.textContent="Sonrakiyle Birleştir";
 }
 // Remove "Metin sonlarını göster" controls wherever older layers created them.
 qa("button,label").forEach(function(x){if(/metin sonlarını göster/i.test(x.textContent||""))x.remove()});
}
function cleanTextInspector(){
 var text=q("#v53Inspector .v53text .v53body");if(!text)return;
 // remove Leading/Tracking rows by label text
 qa("#v53Inspector .v53text label,#v53Inspector .v53text .v53row").forEach(function(x){if(/Leading|Tracking|Satır Aralığı|Harf Aralığı/i.test(x.textContent||""))x.remove()});
 // remove old style profile buttons: Subtitle/Social/Clean and Turkish equivalents
 qa("#v53Inspector button").forEach(function(x){if(/^(Subtitle|Social|Clean|Altyazı|Sosyal|Sade)$/i.test((x.textContent||"").trim()))x.remove()});
}
function fonts(){
 var sel=q("#v53Inspector .v53text select");if(!sel)return;
 try{
  var cp=require("child_process");
  cp.execFile("/usr/bin/osascript",["-e",'tell application "System Events" to get name of every font'],{timeout:8000},function(err,stdout){
   if(err||!stdout)return;var names=stdout.split(",").map(function(x){return x.trim()}).filter(Boolean),seen={},cur=K26.font||sel.value||"Helvetica Neue",html="";
   names.sort(function(a,b){return a.localeCompare(b)}).forEach(function(n){if(seen[n])return;seen[n]=1;html+='<option value="'+n.replace(/"/g,"&quot;")+'">'+n+"</option>"});
   if(!seen[cur])html='<option value="'+cur.replace(/"/g,"&quot;")+'">'+cur+"</option>"+html;
   sel.innerHTML=html;sel.value=cur;sel.onchange=function(){K26.font=this.value;try{k31preview()}catch(_){};st("Yazı tipi: "+this.value)};
  })
 }catch(e){}
}
function smartAlwaysVisible(){
 var ins=q("#v53Inspector"),smart=null;
 qa("#v53Inspector>.v54workflow,#v53Inspector details").forEach(function(d){var s=d.querySelector("summary"),t=s?s.textContent:"";if(/AKILLI BÖLME/i.test(t))smart=d});
 if(!smart||q("#v61smart"))return;
 var box=document.createElement("section");box.id="v61smart";box.innerHTML='<div class="v61smartTitle"><b>AKILLI BÖLME</b><span>Konuşmayı doğal altyazı gruplarına ayır</span></div><div id="v61smartBody"></div>';
 var body=smart.querySelector(".v54body")||smart,target=box.querySelector("#v61smartBody");while(body.firstChild)target.appendChild(body.firstChild);
 var left=q("#captions")||q("#v55wordbox");if(left&&left.parentNode)left.parentNode.insertBefore(box,left);
 smart.remove()
}
function collapseSearch(){
 var search=null;qa("section,div").forEach(function(x){if(x.id&&/v52search|searchreplace/i.test(x.id))search=x});
 if(!search){qa("section").some(function(x){if(/ARA.*DEĞİŞTİR|Search.*Replace/i.test(x.textContent||"")){search=x;return true}return false})}
 if(!search||search.closest("#v61textTools"))return;
 var d=document.createElement("details");d.id="v61textTools";d.className="v54details";d.innerHTML='<summary><span>METİN ARAÇLARI</span><span>›</span></summary><div class="v54body"></div>';
 search.parentNode.insertBefore(d,search);d.querySelector(".v54body").appendChild(search)
}
function presetRepair(){
 var pr=q("#v56presets");if(!pr)return;
 var s=pr.querySelector("summary span");if(s)s.textContent="STİL PRESETLERİ";
 var exp=q("#v56exportPreset"),imp=q(".v56file");if(exp)exp.remove();if(imp)imp.remove();
 // Project-scoped v6 preset system is authoritative; add delete on alt-click/right-click.
 var grid=q("#v56presetGrid");if(grid)grid.title="Tıkla: uygula · Sağ tık: sil";
}
function renderState(){
 var add=q("#add");if(!add||q("#v61state"))return;var x=document.createElement("span");x.id="v61state";x.textContent="Hazır";add.parentNode.insertBefore(x,add);
 setInterval(function(){if(!cues)return;var changed=0;try{for(var i=0;i<cues.length;i++){var h=window.KRALI_V56_FINGERPRINT?KRALI_V56_FINGERPRINT(cues[i]):"";if(cues[i]._v61h!==h)changed++}}catch(_){}x.textContent=cues.length+" altyazı · "+changed+" değişiklik · Hazır"},1500)
}
function previewParity(){
 // Keep one authoritative canvas renderer; hide legacy CSS/text preview overlays if present.
 qa(".captionPreviewText,.k26cssPreview,#captionOverlay:not(#k31CaptionCanvas)").forEach(function(x){x.style.display="none"})
}
function boot(){cleanWordTools();cleanTextInspector();fonts();smartAlwaysVisible();collapseSearch();presetRepair();renderState();previewParity();document.body.classList.add("v61clean");st("v6.1 CLEAN PRO hazır")}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){setTimeout(boot,2500)});else setTimeout(boot,2500)
})();

/* =========================================================================
 KRALI v6.2 UI CONSOLIDATION — screenshot-driven cleanup
 ========================================================================= */
(function(){
function q(s){return document.querySelector(s)} function qa(s){return [].slice.call(document.querySelectorAll(s))}
function rm(x){if(x&&x.parentNode)x.parentNode.removeChild(x)}
function txt(x){return ((x&&x.textContent)||"").replace(/\s+/g," ").trim()}
function removeTextZones(){
 qa("button,label,div").forEach(function(x){if(/^Metin (Zonlarını|Alanlarını) Göster$/i.test(txt(x)))rm(x)});
}
function cleanInspector(){
 var ins=q("#v53Inspector");if(!ins)return;
 // Remove redundant headings/intro copy inside TEXT.
 qa("#v53Inspector .v53text .v53body h1,#v53Inspector .v53text .v53body h2,#v53Inspector .v53text .v53body h3,#v53Inspector .v53text .v53body .subtitle").forEach(function(x){
   if(/Altyazı Stili|Premiere ile uyumlu canlı önizleme/i.test(txt(x)))rm(x)
 });
 // Remove duplicate preset/follow legacy accordion, keep v6 project preset library.
 qa("#v53Inspector > details,#v53Inspector > .v54workflow").forEach(function(d){
   var t=txt(d.querySelector("summary"));
   if(/STİL PRESETİ\s*&\s*TAKİP/i.test(t))rm(d)
 });
 // Rename the remaining project preset section.
 var preset=q("#v56presets");if(preset){var s=preset.querySelector("summary span");if(s)s.textContent="PRESET & DOSYA"}
 // Move file/cache body into preset section and remove separate DOSYA accordion.
 var file=null;qa("#v53Inspector > details,#v53Inspector > .v54workflow").forEach(function(d){if(/^DOSYA/i.test(txt(d.querySelector("summary"))))file=d});
 if(preset&&file&&file!==preset){
   var pb=preset.querySelector(".v54body")||preset,fb=file.querySelector(".v54body");
   if(fb){var sep=document.createElement("div");sep.className="v62sep";pb.appendChild(sep);while(fb.firstChild)pb.appendChild(fb.firstChild)}
   rm(file)
 }
 // Make text controls compact and convert Bold/Italic labels to toggle-like visuals.
 qa("#v53Inspector .v53text label").forEach(function(l){var t=txt(l);if(/^Bold$/i.test(t)){l.classList.add("v62toggle");l.setAttribute("data-short","B")}if(/^Italic$/i.test(t)){l.classList.add("v62toggle");l.setAttribute("data-short","I")}})
}
function rebuildSmart(){
 var old=q("#v61smart");if(!old)return;
 // Pull profile buttons from nested legacy smart block, but do not keep its accordion button.
 var candidates=qa("#v61smart button"),prof=[];
 candidates.forEach(function(b){var t=txt(b);if(/Kısa|Dengeli|Uzun/i.test(t)||b.dataset.p)prof.push(b)});
 old.innerHTML='<div class="v61smartTitle"><b>AKILLI BÖLME</b><span>Konuşmayı doğal gruplara ayır</span></div><div class="v62smartBtns"></div>';
 var row=old.querySelector(".v62smartBtns");
 if(!prof.length){
   [["short","Kısa"],["balanced","Dengeli"],["long","Uzun"]].forEach(function(a){var b=document.createElement("button");b.dataset.p=a[0];b.textContent=a[1];row.appendChild(b)})
 } else prof.forEach(function(b){row.appendChild(b)});
 var go=document.createElement("button");go.id="v62smartGo";go.textContent="AKILLI BÖL";row.appendChild(go);
 var chosen="balanced";qa("#v61smart [data-p]").forEach(function(b){b.onclick=function(){chosen=b.dataset.p||(/kısa/i.test(txt(b))?"short":/uzun/i.test(txt(b))?"long":"balanced");qa("#v61smart [data-p]").forEach(function(x){x.classList.toggle("active",x===b)})}});
 go.onclick=function(){try{smartSplit3(chosen)}catch(e){var p=q('#v61smart [data-p="'+chosen+'"]');if(p)p.click()}}
}
function compactWordJump(){
 var box=q("#v55wordbox");if(!box)return;
 var h=box.querySelector(".v55head");if(h)h.innerHTML='<b>KELİMEYE GİT</b><span>Kelimeye tıkla → videoda o ana git</span>';
 var actions=q("#v60wordActions"),merge=actions&&actions.querySelector('[data-a="mergeNext"]');
 if(merge){
   // place as a small action at the selected-caption toolbar edge rather than a full-width word tool.
   merge.classList.add("v62merge");
   var capHead=q("#captionsHeader")||q("#captions")&&q("#captions").previousElementSibling;
   if(capHead&&capHead.appendChild)capHead.appendChild(merge);else box.appendChild(merge)
 }
 if(actions)rm(actions)
}
function compactText(){
 var text=q("#v53Inspector .v53text .v53body");if(!text)return;
 // Keep numeric size input; hide duplicate range slider for a tighter Premiere-like row.
 var ranges=qa("#v53Inspector .v53text input[type=range]");ranges.forEach(function(r){r.classList.add("v62hiddenRange")});
 // Font selector gets full-width, smaller height, tooltip with selected font.
 var sel=q("#v53Inspector .v53text select");if(sel){sel.classList.add("v62font");function tip(){sel.title=sel.value}sel.addEventListener("change",tip);tip()}
}
function unifyFooter(){
 var add=q("#add");if(!add)return;
 var foot=add.parentNode,state=q("#v61state");
 if(state)state.id="v62state";
 // Hide old competing generated summary/status counters in the footer, except our unified state.
 qa("body *").forEach(function(x){
   if(x===state||x===add||x.contains(add))return;
   var t=txt(x);if(/^\d+\s+kelime\s*·\s*\d+\s+altyazı oluşturuldu$/i.test(t))x.classList.add("v62oldSummary")
 });
 function upd(){try{var words=0;(cues||[]).forEach(function(c){words+=(String(c.text||"").trim().match(/\S+/g)||[]).length});var changed=0;(cues||[]).forEach(function(c){var h=window.KRALI_V56_FINGERPRINT?KRALI_V56_FINGERPRINT(c):String(c.text);if(c._v62base!==h)changed++});if(state)state.textContent=words+" kelime · "+cues.length+" altyazı · "+changed+" değişiklik"}catch(_){}}
 setInterval(upd,1200);upd()
}
function searchPlacement(){
 var tools=q("#v61textTools");if(!tools)return;
 var s=tools.querySelector("summary span");if(s)s.textContent="METİN ARAÇLARI";
 tools.open=false
}
function boot(){removeTextZones();cleanInspector();rebuildSmart();compactWordJump();compactText();unifyFooter();searchPlacement();document.body.classList.add("v62ui")}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){setTimeout(boot,2800)});else setTimeout(boot,2800)
})();

/* KRALI v6.3.1 STABLE RESPONSIVE
   Non-destructive UI finalizer. No MutationObserver and no live removal of
   inspector containers: older controllers may finish first, then we normalize once.
*/
(function(){
function q(s){return document.querySelector(s)}
function qa(s){return [].slice.call(document.querySelectorAll(s))}
function text(x){return ((x&&x.textContent)||"").replace(/\s+/g," ").trim()}
function rm(x){if(x&&x.parentNode)x.parentNode.removeChild(x)}
function finalise(){
 try{
  // Static + late legacy leftovers.
  qa("button").forEach(function(x){if(/Metin (Zonlarını|Alanlarını) Göster/i.test(text(x)))rm(x)});
  var ins=q("#v53Inspector");
  if(ins){
    // Only remove the known duplicate preset accordion; never remove inspector/group containers.
    qa("#v53Inspector > details,#v53Inspector > .v54workflow").forEach(function(d){
      var s=text(d.querySelector("summary"));
      if(/STİL PRESETİ\s*&\s*TAKİP/i.test(s))rm(d)
    });
    // Remove duplicated inner labels, not their parents.
    qa("#v53Inspector .v53text .k26-gtitle").forEach(function(x){if(/^METİN$|^TEXT$/i.test(text(x)))rm(x)});
    qa("#v53Inspector .v53appearance .k26-gtitle").forEach(function(x){if(/^GÖRÜNÜM$|^APPEARANCE$/i.test(text(x)))rm(x)});
    qa("#v53Inspector .v53transform .k26-gtitle").forEach(function(x){if(/ALIGN|TRANSFORM/i.test(text(x)))rm(x)});
    // Hide duplicate advanced slider bank only; preserve actual Fill/Stroke/BG/Shadow controls.
    qa("#v53Inspector .v53appearance .v53advanced").forEach(function(x){x.style.display="none"});
    // Remove only old "Güvenli Konum" button group; keep 3x3, X/Y/Width and profile.
    var safe=q("#v55safe");if(safe)safe.style.display="none";
  }
  // Correct status/version if an older controller overwrote it.
  var s=q("#status");if(s&&/v6\.1 CLEAN PRO hazır|v6\.2/i.test(text(s)))s.textContent="Hazır.";
 }catch(e){}
 document.body.classList.remove("kraliBooting");
 document.body.classList.add("v631ready");
}
function responsive(){
 function r(){var w=document.documentElement.clientWidth;document.body.classList.toggle("v631narrow",w<760);document.body.classList.toggle("v631tiny",w<540)}
 window.addEventListener("resize",r);r()
}
function boot(){
 responsive();
 // Wait for the additive legacy controllers to finish once. During this period
 // workspace is hidden, so the user never sees each intermediate design.
 setTimeout(finalise,3300);
 // A single late safety pass, not a continuous observer.
 setTimeout(finalise,5200);
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot()
})();

/* KRALI v6.3.2 UI POLISH — visual cleanup on stable responsive base */
(function(){
function q(s){return document.querySelector(s)}
function qa(s,r){return [].slice.call((r||document).querySelectorAll(s))}
function txt(x){return ((x&&x.textContent)||"").replace(/\s+/g," ").trim()}
function polish(){
 try{
  document.body.classList.add("v632polish");

  // TEXT: move reset into section summary and eliminate empty legacy header space.
  var ts=q("#v53Inspector .v53text"), reset=q("#k26Reset");
  if(ts&&reset){
    var sum=ts.querySelector("summary");
    if(sum&&!sum.contains(reset)){reset.classList.add("v632reset");sum.appendChild(reset)}
  }
  qa("#v53Inspector .v53text header").forEach(function(h){h.style.display="none"});
  qa("#v53Inspector .v53text .k26-gtitle").forEach(function(x){if(/^METİN$|^TEXT$/i.test(txt(x)))x.style.display="none"});

  // APPEARANCE: tag the four authoritative property rows and merge advanced disclosures.
  var ap=q("#v53Inspector .v53appearance .v53body");
  if(ap){
    qa(".k26-prop",ap).forEach(function(row){
      var s=txt(row);
      if(/Fill|Stroke|Background|Shadow/i.test(s))row.classList.add("v632prop");
    });
    var advanced=[];
    qa("details",ap).forEach(function(d){
      var s=txt(d.querySelector("summary"));
      if(/GELİŞMİŞ ARKA PLAN|GELİŞMİŞ GÖRÜNÜM|ADVANCED/i.test(s))advanced.push(d);
    });
    if(advanced.length){
      var master=q("#v632advanced");
      if(!master){
        master=document.createElement("details");master.id="v632advanced";master.className="v632advanced";
        master.innerHTML='<summary>GELİŞMİŞ <span>›</span></summary><div class="v632advancedBody"></div>';
        ap.appendChild(master);
      }
      var body=master.querySelector(".v632advancedBody");
      advanced.forEach(function(d){
        var inner=d.querySelector(".v54body,.v53body")||d;
        while(inner.firstChild)body.appendChild(inner.firstChild);
        if(d.parentNode)d.parentNode.removeChild(d);
      });
    }
  }

  // Footer: ensure one stable action row and reserve scroll space.
  var add=q("#add"),state=q("#v62state")||q("#v61state");
  if(add){
    var p=add.parentNode;p.classList.add("v632footerActions");
    if(state&&state.parentNode!==p)p.insertBefore(state,add);
  }
  var transcript=q("#captions")||q("#transcript");if(transcript)transcript.classList.add("v632transcript");
 }catch(e){}
}
function resize(){
 var w=document.documentElement.clientWidth,h=document.documentElement.clientHeight;
 document.body.classList.toggle("v632wide",w>=900);
 document.body.classList.toggle("v632short",h<760);
}
function boot(){polish();resize();window.addEventListener("resize",resize);setTimeout(polish,1200);setTimeout(polish,3500)}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){setTimeout(boot,5400)});else setTimeout(boot,5400)
})();

/* KRALI v6.3.3 COMPACT SPLIT — keep Preview + Inspector side-by-side much earlier */
(function(){
function sizeMode(){
 var w=document.documentElement.clientWidth;
 document.body.classList.toggle("v633compact",w>=620&&w<900);
 document.body.classList.toggle("v633stack",w<620);
 document.body.classList.toggle("v633wide",w>=900);
}
function boot(){document.body.classList.add("v633");sizeMode();window.addEventListener("resize",sizeMode)}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot()
})();

/* KRALI v6.4 FOCUS INSPECTOR */
(function(){
function q(s){return document.querySelector(s)}
function qa(s,r){return [].slice.call((r||document).querySelectorAll(s))}
function inspectorAccordions(){
 var ins=q("#v53Inspector")||q("#k26Inspector");if(!ins)return;
 var groups=qa(":scope > details",ins).filter(function(d){
   var s=d.querySelector("summary");return !!s;
 });
 groups.forEach(function(d){
   d.addEventListener("toggle",function(){
     if(!d.open)return;
     groups.forEach(function(other){if(other!==d&&other.open)other.open=false});
   });
 });
}
function appearanceRows(){
 var ap=q("#v53Inspector .v53appearance .v53body");if(!ap)return;
 qa(".v632prop",ap).forEach(function(row){row.classList.add("v64prop")});
}
function previewToggle(){
 var title=q(".v63editorTitle")||q(".k26-sectionTitle");if(!title||q("#v64previewToggle"))return;
 var b=document.createElement("button");b.id="v64previewToggle";b.type="button";b.textContent="Önizlemeyi Gizle";
 b.onclick=function(){
   var body=document.body,hidden=!body.classList.contains("v64previewHidden");
   body.classList.toggle("v64previewHidden",hidden);
   b.textContent=hidden?"Önizlemeyi Göster":"Önizlemeyi Gizle";
 };
 title.appendChild(b)
}
function mode(){
 var w=document.documentElement.clientWidth;
 document.body.classList.toggle("v64compact",w>=620&&w<900);
 document.body.classList.toggle("v64stack",w<620);
}
function boot(){
 document.body.classList.add("v64focus");
 inspectorAccordions();appearanceRows();previewToggle();mode();
 window.addEventListener("resize",mode);
 setTimeout(function(){inspectorAccordions();appearanceRows();previewToggle()},1800)
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){setTimeout(boot,5600)});else setTimeout(boot,5600)
})();
/* KRALI v6.4.1 APPEARANCE CLEAN */
(function(){
function q(s,r){return (r||document).querySelector(s)}
function qa(s,r){return [].slice.call((r||document).querySelectorAll(s))}
function t(x){return ((x&&x.textContent)||"").replace(/\s+/g," ").trim()}
function clean(){
 var ap=q("#v53Inspector .v53appearance .v53body");if(!ap)return;document.body.classList.add("v641");
 qa(".v632prop,.v64prop",ap).forEach(function(r){r.classList.add("v641prop")});
 var adv=q("#v632advanced .v632advancedBody")||q("#v632advanced",ap);
 if(adv){
  var seen={};
  qa("label,.k26-prop,.v53row,.v54row,div",adv).forEach(function(el){
   var s=t(el),k=null;
   if(/Arka Plan Opaklığı|Background Opacity/i.test(s))k="bgop";
   else if(/Köşe Yuvarlama|Corner Radius/i.test(s))k="radius";
   else if(/Yatay (İç )?Boşluk|Horizontal Padding/i.test(s))k="padx";
   else if(/Dikey (İç )?Boşluk|Vertical Padding/i.test(s))k="pady";
   if(!k)return;if(k==="bgop"){el.classList.add("v641dup");return}
   if(seen[k])seen[k].classList.add("v641dup");seen[k]=el;
  });
 }
 var b=q("#v64previewToggle");if(b)b.classList.add("v641previewToggle");
}
function exclusive(){
 var ins=q("#v53Inspector")||q("#k26Inspector");if(!ins)return;
 var gs=qa(":scope > details",ins);
 gs.forEach(function(d){if(d.dataset.v641exclusive)return;d.dataset.v641exclusive="1";
  d.addEventListener("toggle",function(){if(!d.open)return;gs.forEach(function(o){if(o!==d)o.open=false})});
 });
}
function boot(){clean();exclusive();setTimeout(function(){clean();exclusive()},1400)}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){setTimeout(boot,5700)});else setTimeout(boot,5700)
})();

/* KRALI v6.6 AUTO UPDATE */
(function(){
var KU={version:"6.6.9",manifest:"https://raw.githubusercontent.com/izmirli-ali/krali-altyazi/main/update/latest.json"};
function nodeRequire(){try{return window.require||require}catch(e){return null}}
function semver(v){return String(v||"0").replace(/^v/,"").split(".").map(function(x){return parseInt(x,10)||0})}
function newer(a,b){var A=semver(a),B=semver(b);for(var i=0;i<3;i++){if((A[i]||0)>(B[i]||0))return true;if((A[i]||0)<(B[i]||0))return false}return false}
function status(s){try{var x=document.getElementById("kraliUpdateStatus");if(x)x.textContent=s}catch(e){}}
function getJSON(url,cb){
 var https=nodeRequire()("https");https.get(url,{headers:{"User-Agent":"KRALI-Altyazi-Updater","Cache-Control":"no-cache"}},function(r){
  var d="";r.on("data",function(c){d+=c});r.on("end",function(){try{cb(null,JSON.parse(d))}catch(e){cb(e)}})
 }).on("error",cb)
}
function download(url,out,cb,depth){
 depth=depth||0;if(depth>5)return cb(new Error("Çok fazla yönlendirme"));
 var req=nodeRequire(),https=req("https"),fs=req("fs"),u=req("url").parse(url);
 https.get(url,{headers:{"User-Agent":"KRALI-Altyazi-Updater"}},function(r){
  if(r.statusCode>=300&&r.statusCode<400&&r.headers.location)return download(new req("url").URL(r.headers.location,url).toString(),out,cb,depth+1);
  if(r.statusCode!==200)return cb(new Error("HTTP "+r.statusCode));
  var f=fs.createWriteStream(out);r.pipe(f);f.on("finish",function(){f.close(function(){cb(null)})});f.on("error",cb)
 }).on("error",cb)
}
function sha256(path){
 var req=nodeRequire(),fs=req("fs"),crypto=req("crypto"),h=crypto.createHash("sha256");
 h.update(fs.readFileSync(path));return h.digest("hex")
}
function copyDir(src,dst,cb){
 var cp=nodeRequire()("child_process");
 cp.execFile("/usr/bin/ditto",[src,dst],{timeout:120000},cb)
}
function apply(m){
 var req=nodeRequire(),fs=req("fs"),os=req("os"),path=req("path"),cp=req("child_process");
 var ext=decodeURI(window.__adobe_cep__.getSystemPath("extension")).replace(/^file:\/\//,"");
 try{ext=fs.realpathSync(ext)}catch(e){}
 var root=path.join(os.homedir(),"Library","Application Support","KRALI","Altyazi","updater");
 var tmp=path.join(root,"tmp-"+Date.now()),zip=path.join(tmp,"update.zip"),unpack=path.join(tmp,"unpack");
 var backups=path.join(root,"backups"),backup=path.join(backups,"v"+KU.version+"-"+Date.now());
 fs.mkdirSync(tmp,{recursive:true});fs.mkdirSync(unpack,{recursive:true});fs.mkdirSync(backups,{recursive:true});
 status("v"+m.version+" indiriliyor…");
 download(m.url+(m.url.indexOf("?")>=0?"&":"?")+"krali_cache="+Date.now(),zip,function(err){
  if(err)return status("Güncelleme indirilemedi");
  try{if(String(sha256(zip)).toLowerCase()!==String(m.sha256).toLowerCase())return status("SHA-256 doğrulaması başarısız")}catch(e){return status("Doğrulama hatası")}
  status("Yedek alınıyor…");
  copyDir(ext,backup,function(e1){
   if(e1)return status("Yedekleme başarısız");
   cp.execFile("/usr/bin/ditto",["-x","-k",zip,unpack],{timeout:120000},function(e2){
    if(e2)return status("Paket açılamadı");
    var entries=fs.readdirSync(unpack).filter(function(n){return n!==".DS_Store"}),payload=unpack;
    if(entries.length===1&&fs.statSync(path.join(unpack,entries[0])).isDirectory())payload=path.join(unpack,entries[0]);
    status("Güncelleniyor…");
    copyDir(payload,ext,function(e3){
     if(e3)return status("Güncelleme uygulanamadı — yedek korundu");
     try{fs.writeFileSync(path.join(root,"last-backup.txt"),backup,"utf8")}catch(_){}
     status("v"+m.version+" kuruldu. Yenileniyor…");
     setTimeout(function(){location.reload()},900)
    })
   })
  })
 })
}
function check(){
 if(!nodeRequire())return;
 getJSON(KU.manifest+"?krali_cache="+Date.now(),function(err,m){
  if(err||!m){status("Güncelleme kontrol edilemedi");return;}
  if(m.enabled===false){status("Güncel · v"+KU.version);return;}
  if(newer(m.version,KU.version)&&m.url&&m.sha256)apply(m);
  else status("Güncel · v"+KU.version)
 })
}
function ui(){
 if(document.getElementById("kraliUpdateStatus"))return;
 var el=document.createElement("div");el.id="kraliUpdateStatus";el.textContent="Güncelleme kontrol ediliyor…";
 el.style.cssText="position:fixed;right:12px;top:8px;z-index:99999;font-size:9px;color:#8d8d8d;pointer-events:none";
 document.body.appendChild(el)
}
function boot(){ui();setTimeout(check,1800)}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot()
})();

/* KRALI v6.6.3 — IDEMPOTENT AUTHORITATIVE APPEARANCE ROWS */
(function(){
function q(s,r){return (r||document).querySelector(s)}
function makeRow(name,checkId,colorId,valueId){
 var row=document.createElement("div");row.className="krali661row";
 var lab=document.createElement("label");lab.className="krali661label";
 var c=q("#"+checkId),col=q("#"+colorId),val=valueId?q("#"+valueId):null;
 if(!c||!col)return null;
 lab.appendChild(c);
 var txt=document.createElement("span");txt.textContent=name;lab.appendChild(txt);
 row.appendChild(lab);row.appendChild(col);
 if(val)row.appendChild(val);else{var sp=document.createElement("span");sp.className="krali661empty";row.appendChild(sp)}
 return row
}
function rebuild(){
 var body=q("#v53Inspector .v53appearance .v53body");if(!body)return;
 var ids=["k26FillOn","k26StrokeOn","k26BgOn","k26ShadowOn"];
 if(!ids.every(function(id){return !!q("#"+id)}))return;
 var anchor=q("#v632advanced",body);
 var box=q("#krali661main");
 if(!box){box=document.createElement("div");box.id="krali661main";box.setAttribute("data-krali-authoritative","1");body.insertBefore(box,anchor||body.firstChild)}
 var rows=document.createDocumentFragment();
 [["Dolgu","k26FillOn","k26Fill",null],
  ["Kontur","k26StrokeOn","k26Stroke","k26StrokeW"],
  ["Arka Plan","k26BgOn","k26Bg","k26BgOp"],
  ["Gölge","k26ShadowOn","k26Shadow","k26ShadowBlur"]].forEach(function(a){
   var r=makeRow.apply(null,a);if(r)rows.appendChild(r)
 });
 /* Controls are now detached from any previous rows and safe from cleanup. */
 box.innerHTML="";box.appendChild(rows);
   /* Hide only the obsolete appearance group left by the legacy controller. */
 [].slice.call(body.children).forEach(function(el){
   if(el===box||el===anchor)return;
   if(el.matches&&el.matches(".v632advanced,details"))return;
   if(el.matches&&el.matches(".k26-group,.v632prop,.v641prop,.v64prop,.k26-prop"))el.style.display="none";
 });
 /* Legacy rows may remain nested in the old appearance group. */
 qa(".k26-prop",body).forEach(function(row){
   if(!box.contains(row)&&!row.querySelector("input,select,textarea"))row.style.display="none";
 });
 box.style.display="flex";box.style.visibility="visible";box.style.opacity="1";
 document.body.classList.add("krali661ready")
}
function boot(){rebuild();setTimeout(rebuild,800)}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",function(){setTimeout(boot,6000)});else setTimeout(boot,6000)
})();
