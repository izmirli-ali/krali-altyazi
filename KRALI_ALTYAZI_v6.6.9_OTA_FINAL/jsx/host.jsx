$._KRALI_SUB = $._KRALI_SUB || {};
$._KRALI_SUB.esc=function(s){return String(s===undefined?"":s).replace(/\\/g,"\\\\").replace(/"/g,'\\"').replace(/\r/g,"\\r").replace(/\n/g,"\\n")};
$._KRALI_SUB.getState=function(){
 try{
  var s=app.project&&app.project.activeSequence;
  if(!s)return '{"ok":false,"message":"Aktif sequence yok."}';
  var a=[];
  for(var i=0;i<s.audioTracks.numTracks;i++){
   var n=0;try{n=s.audioTracks[i].clips.numItems}catch(_){}
   a.push('{"index":'+i+',"label":"A'+(i+1)+'","clips":'+n+'}')
  }
  var pos=0,dur=0;
  try{pos=s.getPlayerPosition().seconds}catch(_){}
  try{dur=s.end/254016000000}catch(_){}
  return '{"ok":true,"name":"'+$._KRALI_SUB.esc(s.name)+'","width":'+Number(s.frameSizeHorizontal||1920)+',"height":'+Number(s.frameSizeVertical||1080)+',"position":'+Number(pos||0)+',"duration":'+Number(dur||0)+',"tracks":['+a.join(',')+']}';
 }catch(e){return '{"ok":false,"message":"'+$._KRALI_SUB.esc(e.toString())+'"}'}
};
$._KRALI_SUB.setPlayhead=function(seconds){
 try{var s=app.project.activeSequence;if(!s)return "0";var t=new Time();t.seconds=Number(seconds)||0;s.setPlayerPosition(t.ticks);return "1"}catch(e){return "0"}
};
$._KRALI_SUB.exportPreviewFrame=function(folderPath){
 try{
  app.enableQE();
  var qs=qe.project.getActiveSequence(),s=app.project.activeSequence;
  if(!qs||!s)return '{"ok":false,"message":"Aktif sequence yok."}';
  var folder=new Folder(folderPath);if(!folder.exists)folder.create();
  var tc=qs.CTI.timecode;
  var out=folder.fsName+"/krali_sequence_preview";
  var ok=qs.exportFramePNG(tc,out);
  var f1=new File(out+".png"),f2=new File(out);
  var p=f1.exists?f1.fsName:(f2.exists?f2.fsName:out+".png");
  return '{"ok":true,"path":"'+$._KRALI_SUB.esc(p)+'","timecode":"'+$._KRALI_SUB.esc(tc)+'"}';
 }catch(e){return '{"ok":false,"message":"'+$._KRALI_SUB.esc(e.toString())+'"}'}
};



$._KRALI_SUB._findVideoPreviewPreset=function(){
 try{
  var roots=[
   new Folder("/Applications/Adobe Premiere Pro 2026/Adobe Premiere Pro 2026.app/Contents/MediaIO/systempresets"),
   new Folder("/Applications/Adobe Premiere Pro 2025/Adobe Premiere Pro 2025.app/Contents/MediaIO/systempresets"),
   new Folder("/Applications/Adobe Premiere Pro 2024/Adobe Premiere Pro 2024.app/Contents/MediaIO/systempresets")
  ];
  var best=null,bestScore=-9999;
  function walk(f,depth){
   if(!f||!f.exists||depth>5)return;
   var a=f.getFiles();
   for(var i=0;i<a.length;i++){
    var x=a[i];
    if(x instanceof Folder){walk(x,depth+1);continue}
    if(!/\.epr$/i.test(x.name))continue;
    var n=x.name.toLowerCase(),score=0;
    if(/h\.?264|avc/.test(n))score+=100;
    if(/480|540|720|mobile|low|medium|youtube|vimeo/.test(n))score+=40;
    if(/4k|2160|hevc|prores|dnx|wave|audio|wav/.test(n))score-=120;
    try{
     x.open("r");var txt=x.read(12000);x.close();var t=txt.toLowerCase();
     if(t.indexOf("<dovideo>true")>=0)score+=60;
     if(/h\.?264|avc/.test(t))score+=80;
     if(t.indexOf("<doaudio>true")>=0)score+=5;
     if(/hevc|prores|dnx/.test(t))score-=80;
    }catch(_){}
    if(score>bestScore){bestScore=score;best=x}
   }
  }
  for(var r=0;r<roots.length;r++)walk(roots[r],0);
  return best&&bestScore>40?best.fsName:"";
 }catch(e){return ""}
};
$._KRALI_SUB.renderSequencePreview=function(outBase){
 try{
  var s=app.project.activeSequence;if(!s)return '{"ok":false,"message":"Aktif sequence yok."}';
  var preset=$._KRALI_SUB._findVideoPreviewPreset();
  if(!preset)return '{"ok":false,"message":"Uygun Premiere video export preset bulunamadı."}';
  var ext=s.getExportFileExtension(preset);if(!ext)ext="mp4";
  var out=outBase+"."+ext;
  var f=new File(out);if(f.exists)try{f.remove()}catch(_){}
  var ok=s.exportAsMediaDirect(out,preset,app.encoder.ENCODE_ENTIRE);
  return '{"ok":'+(ok?'true':'false')+',"path":"'+$._KRALI_SUB.esc(out)+'","preset":"'+$._KRALI_SUB.esc(preset)+'"}';
 }catch(e){return '{"ok":false,"message":"'+$._KRALI_SUB.esc(e.toString())+'"}'}
};

$._KRALI_SUB.exportHybridFrame=function(folderPath,nonce){
 try{
  app.enableQE();
  var qs=qe.project.getActiveSequence(),s=app.project.activeSequence;
  if(!qs||!s)return '{"ok":false,"message":"Aktif sequence yok."}';
  var folder=new Folder(folderPath);if(!folder.exists)folder.create();
  var tc=qs.CTI.timecode;
  var safe=String(nonce||new Date().getTime()).replace(/[^0-9A-Za-z_-]/g,"_");
  var base=folder.fsName+"/timeline_"+safe;
  var ok=qs.exportFramePNG(tc,base);
  var candidates=[new File(base+".png"),new File(base+".png.png"),new File(base)];
  var p="";
  for(var i=0;i<candidates.length;i++){if(candidates[i].exists){p=candidates[i].fsName;break}}
  return '{"ok":'+(p?'true':'false')+',"path":"'+$._KRALI_SUB.esc(p)+'","timecode":"'+$._KRALI_SUB.esc(tc)+'","exportReturn":"'+$._KRALI_SUB.esc(String(ok))+'"}';
 }catch(e){return '{"ok":false,"message":"'+$._KRALI_SUB.esc(e.toString())+'"}'}
};

$._KRALI_SUB.getAudioTrackClips=function(trackIndex){
 try{
  var s=app.project.activeSequence;if(!s)return '{"ok":false,"message":"Aktif sequence yok."}';
  var ti=Number(trackIndex)||0;if(ti<0||ti>=s.audioTracks.numTracks)return '{"ok":false,"message":"Audio track yok."}';
  var tr=s.audioTracks[ti],arr=[];
  for(var i=0;i<tr.clips.numItems;i++){
   var c=tr.clips[i],path="";
   try{path=c.projectItem.getMediaPath()}catch(_){}
   var speed=100;try{speed=c.getSpeed()}catch(_){}
   arr.push('{"name":"'+$._KRALI_SUB.esc(c.name)+'","path":"'+$._KRALI_SUB.esc(path)+'","start":'+Number(c.start.seconds)+',"end":'+Number(c.end.seconds)+',"inPoint":'+Number(c.inPoint.seconds)+',"outPoint":'+Number(c.outPoint.seconds)+',"speed":'+Number(speed)+'}');
  }
  return '{"ok":true,"track":'+ti+',"clips":['+arr.join(",")+']}';
 }catch(e){return '{"ok":false,"message":"'+$._KRALI_SUB.esc(e.toString())+'"}'}
};


$._KRALI_SUB._findWavePreset=function(){
 function scan(folder,depth){
  if(!folder||!folder.exists||depth>8)return "";
  var items;try{items=folder.getFiles()}catch(e){return ""}
  for(var i=0;i<items.length;i++){
   var x=items[i];
   if(x instanceof File && /\.epr$/i.test(x.name) && /wave|wav|audio/i.test(x.name))return x.fsName;
  }
  for(var j=0;j<items.length;j++){
   var y=items[j];if(y instanceof Folder){var r=scan(y,depth+1);if(r)return r}
  }
  return "";
 }
 var roots=[
  new Folder("/Applications/Adobe Premiere Pro 2026/Adobe Premiere Pro 2026.app/Contents/MediaIO/systempresets/3F3F3F3F_57415645"),
  new Folder("/Applications/Adobe Premiere Pro 2025/Adobe Premiere Pro 2025.app/Contents/MediaIO/systempresets/3F3F3F3F_57415645"),
  new Folder("/Applications/Adobe Premiere Pro 2026/Adobe Premiere Pro 2026.app/Contents/MediaIO/systempresets"),
  new Folder("/Applications/Adobe Premiere Pro 2025/Adobe Premiere Pro 2025.app/Contents/MediaIO/systempresets")
 ];
 for(var i=0;i<roots.length;i++){var p=scan(roots[i],0);if(p)return p}
 return "";
};
$._KRALI_SUB.exportSequenceAudio=function(trackIndex,outPath){
 var s=app.project.activeSequence;if(!s)return '{"ok":false,"message":"Aktif sequence yok."}';
 var extRoot=File($.fileName).parent.parent.fsName;
 var bundled=new File(extRoot+"/presets/KRALI_WAV_48K.epr");
 var preset=bundled.exists?bundled.fsName:$._KRALI_SUB._findWavePreset();
 if(!preset)return '{"ok":false,"message":"Waveform Audio preset bulunamadı."}';
 var ti=Number(trackIndex)||0,states=[],changed=false;
 try{
  // Export exactly the selected speech track when Premiere exposes track mute control.
  for(var i=0;i<s.audioTracks.numTracks;i++){
   var tr=s.audioTracks[i],m=0;try{m=tr.isMuted()?1:0}catch(_){}
   states.push(m);
   try{tr.setMute(i===ti?0:1);changed=true}catch(_){}
  }
  var range=0;
 try{if(app.encoder&&app.encoder.ENCODE_ENTIRE!==undefined)range=app.encoder.ENCODE_ENTIRE}catch(_){}
 var ok=s.exportAsMediaDirect(outPath,preset,range);
  return '{"ok":'+(ok?'true':'false')+',"path":"'+$._KRALI_SUB.esc(outPath)+'","preset":"'+$._KRALI_SUB.esc(preset)+'"}';
 }catch(e){return '{"ok":false,"message":"'+$._KRALI_SUB.esc(e.toString())+'"}'}
 finally{
  if(changed)for(var j=0;j<s.audioTracks.numTracks;j++){try{s.audioTracks[j].setMute(states[j])}catch(_){}}
 }
};


$._KRALI_SUB.gotoSeconds=function(sec){
 var s=app.project.activeSequence;if(!s)return '{"ok":false}';
 try{var t=new Time();t.seconds=Math.max(0,Number(sec)||0);s.setPlayerPosition(t.ticks);return '{"ok":true}'}catch(e){
  try{s.setPlayerPosition(String(Math.round((Number(sec)||0)*254016000000)));return '{"ok":true}'}catch(_){return '{"ok":false}'}
 }
};
$._KRALI_SUB.playFromSeconds=function(sec){
 var s=app.project.activeSequence;if(!s)return '{"ok":false}';
 try{
  var t=new Time();t.seconds=Math.max(0,Number(sec)||0);s.setPlayerPosition(t.ticks);
  app.enableQE();var q=qe.project.getActiveSequence();
  try{q.player.play(1)}catch(_){try{q.play()}catch(__){}}
  return '{"ok":true}'
 }catch(e){return '{"ok":false,"message":"'+$._KRALI_SUB.esc(e.toString())+'"}'}
};


$._KRALI_SUB.previewMediaMap=function(trackIndex){
 try{return $._KRALI_SUB.getAudioTrackClips(Number(trackIndex)||0)}
 catch(e){return '{"ok":false,"message":"'+$._KRALI_SUB.esc(e.toString())+'"}'}
};


$._KRALI_SUB.getVideoTrackClips=function(){
 var s=app.project.activeSequence;if(!s)return '{"ok":false,"message":"Aktif sequence yok."}';
 try{
  var out=[];
  for(var ti=0;ti<s.videoTracks.numTracks;ti++){
   var tr=s.videoTracks[ti];
   for(var i=0;i<tr.clips.numItems;i++){
    var c=tr.clips[i],p="";
    try{p=c.projectItem.getMediaPath()}catch(_){}
    if(!p)continue;
    var lp=p.toLowerCase();
    if(/\.(png|jpg|jpeg|gif|bmp|tif|tiff|psd|ai|svg|webp)$/i.test(lp))continue;
    var speed=1;try{speed=Number(c.getSpeed())/100}catch(_){try{speed=Number(c.getSpeed())}catch(__){}}
    if(!speed||!isFinite(speed))speed=1;
    out.push({path:p,timelineStart:c.start.seconds,timelineEnd:c.end.seconds,
      sourceIn:c.inPoint.seconds,sourceOut:c.outPoint.seconds,speed:speed,track:ti});
   }
  }
  return JSON.stringify({ok:true,clips:out})
 }catch(e){return '{"ok":false,"message":"'+$._KRALI_SUB.esc(e.toString())+'"}'}
};

$._KRALI_SUB.hostVersion=function(){return "3.4.0"};

$._KRALI_SUB._findItemByPathOrName=function(folder,path,name){
 try{
  var kids=folder.children;
  for(var i=0;i<kids.numItems;i++){
   var it=kids[i],p="";
   try{p=it.getMediaPath()}catch(_){}
   if(p&&String(p)===String(path))return it;
   if(it.name===name)return it;
   try{if(it.type===ProjectItemType.BIN){var r=$._KRALI_SUB._findItemByPathOrName(it,path,name);if(r)return r}}catch(_){}
  }
 }catch(e){}
 return null;
};
$._KRALI_SUB.importCaptionSRT=function(srtPath){
 try{
  var seq=app.project&&app.project.activeSequence;
  if(!seq)return '{"ok":false,"message":"Aktif sequence yok."}';
  var f=new File(srtPath);if(!f.exists)return '{"ok":false,"message":"SRT dosyası bulunamadı: '+$._KRALI_SUB.esc(srtPath)+'"}';
  var root=app.project.rootItem,before=root.children.numItems;
  var capBefore=-1;try{capBefore=seq.captionTracks.numTracks}catch(_){}
  var imp=app.project.importFiles([f.fsName],1,root,0);
  if(!imp)return '{"ok":false,"message":"SRT Premiere projesine import edilemedi."}';
  var item=$._KRALI_SUB._findItemByPathOrName(root,f.fsName,f.name);
  if(!item&&root.children.numItems>before)item=root.children[root.children.numItems-1];
  if(!item)return '{"ok":false,"message":"Import edilen SRT ProjectItem bulunamadı."}';
  var logs=[],ok=false,method="";
  try{
   var fmt=(typeof Sequence!=="undefined"&&Sequence.CAPTION_FORMAT_SUBTITLE!==undefined)?Sequence.CAPTION_FORMAT_SUBTITLE:undefined;
   if(fmt!==undefined){var r1=seq.createCaptionTrack(item,0,fmt);logs.push("3-param:"+String(r1));if(r1){ok=true;method="createCaptionTrack(item,0,SUBTITLE)"}}
  }catch(e1){logs.push("3-param ERR:"+e1.toString())}
  if(!ok)try{var r2=seq.createCaptionTrack(item,0);logs.push("2-param:"+String(r2));if(r2){ok=true;method="createCaptionTrack(item,0)"}}catch(e2){logs.push("2-param ERR:"+e2.toString())}
  if(!ok)try{var r3=seq.createCaptionTrack(item);logs.push("1-param:"+String(r3));if(r3){ok=true;method="createCaptionTrack(item)"}}catch(e3){logs.push("1-param ERR:"+e3.toString())}
  var capAfter=-1;try{capAfter=seq.captionTracks.numTracks}catch(_){}
  return '{"ok":'+(ok?'true':'false')+',"method":"'+$._KRALI_SUB.esc(method)+'","captionTracksBefore":'+capBefore+',"captionTracksAfter":'+capAfter+',"srt":"'+$._KRALI_SUB.esc(f.fsName)+'","message":"'+$._KRALI_SUB.esc(ok?"":logs.join(" | "))+'"}';
 }catch(e){return '{"ok":false,"message":"'+$._KRALI_SUB.esc(e.toString())+'"}'}
};

$._KRALI_SUB.runtimePing=function(){
 try{
  var seq=app.project&&app.project.activeSequence;
  return '{"ok":true,"sequence":'+(seq?'true':'false')+',"name":"'+$._KRALI_SUB.esc(seq?seq.name:"")+'"}';
 }catch(e){return '{"ok":false,"message":"'+$._KRALI_SUB.esc(e.toString())+'"}'}
};



// v2.7 Premiere caption parity probe / safe single-track gate.
$._KRALI_SUB.captionParityProbe=function(){
 try{
  var s=app.project&&app.project.activeSequence;if(!s)return '{"ok":false,"message":"Aktif sequence yok"}';
  var out={ok:true,numTracks:-1,sequenceMethods:[],trackMethods:[],trackProps:[],itemMethods:[],itemProps:[]};
  try{out.numTracks=s.captionTracks?s.captionTracks.numTracks:-1}catch(_){}
  function scan(o,props,methods){
   if(!o)return;var k;
   try{for(k in o){try{if(typeof o[k]==="function")methods.push(k);else props.push(k)}catch(_){}}}catch(_){}
   try{
    if(o.reflect){
     var mm=o.reflect.methods||[],pp=o.reflect.properties||[],i;
     for(i=0;i<mm.length;i++)methods.push(String(mm[i].name||mm[i]));
     for(i=0;i<pp.length;i++)props.push(String(pp[i].name||pp[i]));
    }
   }catch(_){}
  }
  scan(s,[],out.sequenceMethods);
  if(out.numTracks>0){
   var t=null;try{t=s.captionTracks[0]}catch(_){}
   scan(t,out.trackProps,out.trackMethods);
   try{
    var its=t.trackItems||t.clips||t.items;
    var it=(its&&its.numItems>0)?its[0]:(its&&its.length?its[0]:null);
    scan(it,out.itemProps,out.itemMethods);
   }catch(_){}
  }
  return JSON.stringify(out);
 }catch(e){return '{"ok":false,"message":"probe failed"}'}
};
$._KRALI_SUB.safeReplaceCaptionSRT=function(srtPath,styleJSON){
 try{
  var s=app.project&&app.project.activeSequence;if(!s)return '{"ok":false,"message":"Aktif sequence yok"}';
  var n=0;try{n=s.captionTracks?s.captionTracks.numTracks:0}catch(_){}
  // Critical rule: never stack another caption track silently.
  if(n>0){
   return '{"ok":false,"existingCaptionTrack":true,"message":"C1 zaten mevcut. Premiere CEP/UXP public API caption track silme/temizleme işlemini güvenli biçimde expose etmiyor; C2 oluşturulmadı. Mevcut C1’i bir kez manuel silip tekrar uygula."}';
  }
  var r=$._KRALI_SUB.importCaptionSRT(srtPath);
  // styleJSON intentionally accepted for parity bridge, but not falsely applied through SRT.
  return r;
 }catch(e){return '{"ok":false,"message":"safe replace failed"}'}
};


// v2.8 HARD C1 LOCK: createCaptionTrack is never called if a caption track already exists.
$._KRALI_SUB.strictC1CaptionSRT=function(srtPath,styleJSON){
 try{
  var seq=app.project&&app.project.activeSequence;if(!seq)return '{"ok":false,"message":"Aktif sequence yok."}';
  var count=0;try{count=seq.captionTracks?seq.captionTracks.numTracks:0}catch(_){count=0}
  if(count>0)return '{"ok":false,"c1Locked":true,"captionTrackCount":'+count+',"message":"C1 KİLİTLİ: Mevcut Subtitle track bulundu. Yeni C katmanı OLUŞTURULMADI. Mevcut Subtitle tracklerini bir kez manuel silip tekrar C1 E YAZ deyin."}';
  return $._KRALI_SUB.importCaptionSRT(srtPath);
 }catch(e){return '{"ok":false,"message":"C1 export hatası"}'}
};


// ============================================================================
// KRALI v2.9 — runtime C1 replacement bridge
// Tries only runtime methods that actually exist, verifies track count after each.
// Never calls createCaptionTrack until old caption tracks are confirmed removed.
// ============================================================================
$._KRALI_SUB._v29Call=function(obj,name,args){
 try{
  if(obj && typeof obj[name]==="function"){
   obj[name].apply(obj,args||[]);
   return true;
  }
 }catch(e){}
 return false;
};
$._KRALI_SUB._v29CaptionCount=function(seq){
 try{return seq&&seq.captionTracks?Number(seq.captionTracks.numTracks)||0:0}catch(e){return 0}
};
$._KRALI_SUB._v29RemoveCaptionTrack=function(seq,index){
 var before=$._KRALI_SUB._v29CaptionCount(seq), tr=null, i;
 try{tr=seq.captionTracks[index]}catch(e){}
 var trackMethods=["remove","deleteTrack","removeTrack","delete","clear"];
 for(i=0;i<trackMethods.length;i++){
  $._KRALI_SUB._v29Call(tr,trackMethods[i],[]);
  if($._KRALI_SUB._v29CaptionCount(seq)<before)return true;
 }
 var seqMethods=["removeCaptionTrack","deleteCaptionTrack"];
 for(i=0;i<seqMethods.length;i++){
  $._KRALI_SUB._v29Call(seq,seqMethods[i],[index]);
  if($._KRALI_SUB._v29CaptionCount(seq)<before)return true;
 }
 // QE runtime probe. No guessed call is trusted: count must decrease afterwards.
 try{
  app.enableQE();
  var qs=qe.project.getActiveSequence();
  if(qs){
   var qMethods=["removeCaptionTrack","deleteCaptionTrack"];
   for(i=0;i<qMethods.length;i++){
    $._KRALI_SUB._v29Call(qs,qMethods[i],[index]);
    if($._KRALI_SUB._v29CaptionCount(seq)<before)return true;
   }
  }
 }catch(e){}
 return false;
};
$._KRALI_SUB.replaceC1CaptionSRT=function(srtPath,styleJSON){
 try{
  var seq=app.project&&app.project.activeSequence;
  if(!seq)return '{"ok":false,"message":"Aktif sequence yok."}';
  var n=$._KRALI_SUB._v29CaptionCount(seq), removed=0, guard=0;
  // Remove from highest index down. Re-read count every pass.
  while(n>0 && guard<32){
   if(!$._KRALI_SUB._v29RemoveCaptionTrack(seq,n-1)){
    return '{"ok":false,"replaceUnsupported":true,"captionTrackCount":'+n+',"message":"Premiere 26.5 runtime bu sistemde Caption Track silme metodunu expose etmedi. Yeni C katmanı oluşturulmadı."}';
   }
   removed++; n=$._KRALI_SUB._v29CaptionCount(seq); guard++;
  }
  if(n!==0)return '{"ok":false,"message":"Caption Track temizliği doğrulanamadı. Yeni katman oluşturulmadı."}';
  var r=$._KRALI_SUB.importCaptionSRT(srtPath);
  return r;
 }catch(e){return '{"ok":false,"message":"C1 replace hatası: '+String(e).replace(/"/g,"'")+'"}'}
};

$._KRALI_SUB.nativeCaptionInfo=function(){
 try{
  var s=app.project&&app.project.activeSequence;if(!s)return '{"ok":false,"message":"Aktif sequence yok."}';
  var n=-1;try{n=s.captionTracks?s.captionTracks.numTracks:-1}catch(_){}
  return '{"ok":true,"legacyCaptionTrackCount":'+n+',"mode":"Premiere Native Caption"}';
 }catch(e){return '{"ok":false,"message":"'+$._KRALI_SUB.esc(e.toString())+'"}'}
};

$._KRALI_SUB.captionStyleCapability=function(){
 try{
  var s=app.project&&app.project.activeSequence;
  if(!s)return '{"ok":false,"message":"Aktif sequence yok."}';
  return '{"ok":true,"captionTrack":true,"createCaptionTrack":'+(typeof s.createCaptionTrack==="function"?'true':'false')+',"publicRichStyleSetter":false}';
 }catch(e){return '{"ok":false,"message":"'+$._KRALI_SUB.esc(e.toString())+'"}'}
};


// ============================================================================
// KRALI v3.0 TEXT TRACK ENGINE
// Transparent PNG captions on ONE reusable video track.
// No Subtitle/Caption Track creation.
// ============================================================================
$._KRALI_SUB._v30FindGraphicsTrack=function(seq){
 try{
  for(var i=0;i<seq.videoTracks.numTracks;i++){
   var tr=seq.videoTracks[i];
   if(String(tr.name)==="KRALI ALTYAZI")return {track:tr,index:i};
  }
 }catch(e){}
 return null;
};
$._KRALI_SUB._v30EnsureGraphicsTrack=function(seq){
 var found=$._KRALI_SUB._v30FindGraphicsTrack(seq);
 if(found)return found;
 try{
  app.enableQE();
  var q=qe.project.getActiveSequence();
  var before=seq.videoTracks.numTracks;
  // One video track after the current top track, no audio track.
  try{q.addTracks(1,Math.max(-1,before-1),0)}catch(e1){
   try{q.addTracks(1)}catch(e2){}
  }
  var after=seq.videoTracks.numTracks;
  if(after>before){
   var tr=seq.videoTracks[after-1];
   try{tr.name="KRALI ALTYAZI"}catch(_){}
   return {track:tr,index:after-1};
  }
 }catch(e){}
 // Safety: NEVER overwrite a user's existing video track.
 return null;
};
$._KRALI_SUB._v30ClearGraphicsTrack=function(tr){
 var removed=0,failed=0;
 try{
  // KRALI ALTYAZI is a dedicated track. Clear EVERY clip on it.
  for(var i=tr.clips.numItems-1;i>=0;i--){
   try{tr.clips[i].remove(false,false);removed++}catch(e){failed++}
  }
 }catch(e){failed++}
 return {removed:removed,failed:failed,remaining:(function(){try{return tr.clips.numItems}catch(_){return -1}})()};
};
$._KRALI_SUB._v30FindImported=function(path,name){
 return $._KRALI_SUB._findItemByPathOrName(app.project.rootItem,path,name);
};
$._KRALI_SUB.writeKraliTextTrack=function(payloadJSON){
 try{
  var seq=app.project&&app.project.activeSequence;
  if(!seq)return '{"ok":false,"message":"Aktif sequence yok."}';
  var data=JSON.parse(payloadJSON), items=data.items||[];
  if(!items.length)return '{"ok":false,"message":"Yazılacak KRALİ altyazısı yok."}';

  var slot=$._KRALI_SUB._v30EnsureGraphicsTrack(seq);
  if(!slot)return '{"ok":false,"message":"KRALİ için güvenli yeni video track oluşturulamadı; mevcut video katmanlarına dokunulmadı."}';

  var clearResult=$._KRALI_SUB._v30ClearGraphicsTrack(slot.track); if(clearResult.remaining!==0)return JSON.stringify({ok:false,message:'KRALI track temizlenemedi; yeni altyazılar yazılmadı.',clear:clearResult});
  var root=app.project.rootItem, imported=0, inserted=0, errors=[];

  for(var i=0;i<items.length;i++){
   var x=items[i],f=new File(x.path);
   if(!f.exists){errors.push("PNG yok:"+x.path);continue}
   var pi=$._KRALI_SUB._v30FindImported(f.fsName,f.name);
   if(!pi){
    var ok=app.project.importFiles([f.fsName],1,root,0);
    if(ok){imported++;pi=$._KRALI_SUB._v30FindImported(f.fsName,f.name)}
   }
   if(!pi){errors.push("Import:"+f.name);continue}
   try{
    slot.track.overwriteClip(pi,Number(x.start)||0);
    // Find the newly inserted KRALI still near the requested start and trim to cue end.
    var best=null;
    for(var k=slot.track.clips.numItems-1;k>=0;k--){
     var c=slot.track.clips[k],nm="";
     try{nm=String(c.projectItem.name||"")}catch(_){}
     if(nm===f.name && Math.abs(Number(c.start.seconds)-Number(x.start))<0.15){best=c;break}
    }
    if(best){
     try{var et=new Time();et.seconds=Math.max(Number(x.start)+0.05,Number(x.end));best.end=et}catch(_){}
     try{best.name="KRALI · "+String(x.text||"").substr(0,40)}catch(_){}
    }
    inserted++;
   }catch(e){errors.push("Timeline:"+f.name+":"+e.toString())}
  }
  return JSON.stringify({ok:inserted>0,track:"KRALI ALTYAZI",trackIndex:slot.index,removed:clearResult.removed,imported:imported,inserted:inserted,errors:errors});
 }catch(e){return '{"ok":false,"message":"KRALI Text Track: '+$._KRALI_SUB.esc(e.toString())+'"}'}
};

$._KRALI_SUB.writeKraliTextTrackFinal=function(payloadJSON){
 try{
  var seq=app.project&&app.project.activeSequence;
  if(!seq)return '{"ok":false,"message":"Aktif sequence yok."}';
  var data=JSON.parse(payloadJSON),items=data.items||[];
  if(!items.length)return '{"ok":false,"message":"Yazılacak altyazı yok."}';
  var slot=$._KRALI_SUB._v30EnsureGraphicsTrack(seq);
  if(!slot)return '{"ok":false,"message":"KRALI ALTYAZI video track oluşturulamadı."}';

  var before=0;try{before=slot.track.clips.numItems}catch(_){}
  for(var i=slot.track.clips.numItems-1;i>=0;i--){
    try{slot.track.clips[i].remove(false,false)}catch(e){
      return '{"ok":false,"message":"Eski KRALİ öğesi silinemedi; yeniler eklenmedi."}';
    }
  }
  var remain=0;try{remain=slot.track.clips.numItems}catch(_){}
  if(remain!==0)return '{"ok":false,"message":"KRALİ track boşaltılamadı; yeniler eklenmedi."}';

  var inserted=0,root=app.project.rootItem,errors=[];
  for(var j=0;j<items.length;j++){
    var x=items[j],f=new File(x.path);
    if(!f.exists){errors.push("PNG yok: "+f.fsName);continue}
    var pi=$._KRALI_SUB._v30FindImported(f.fsName,f.name);
    if(!pi){
      try{app.project.importFiles([f.fsName],1,root,0)}catch(_){}
      pi=$._KRALI_SUB._v30FindImported(f.fsName,f.name);
    }
    if(!pi){errors.push("Import: "+f.name);continue}
    try{
      slot.track.overwriteClip(pi,Number(x.start)||0);
      var best=null;
      for(var k=slot.track.clips.numItems-1;k>=0;k--){
        var c=slot.track.clips[k],nm="";
        try{nm=String(c.projectItem.name||"")}catch(_){}
        if(nm===f.name && Math.abs(Number(c.start.seconds)-Number(x.start))<0.2){best=c;break}
      }
      if(best){
        try{var et=new Time();et.seconds=Math.max(Number(x.start)+0.05,Number(x.end));best.end=et}catch(_){}
        try{best.name="KRALI · "+String(x.text||"").substr(0,48)}catch(_){}
      }
      inserted++;
    }catch(e){errors.push("Timeline: "+f.name)}
  }
  return JSON.stringify({ok:inserted===items.length,track:"KRALI ALTYAZI",removed:before,inserted:inserted,errors:errors});
 }catch(e){return '{"ok":false,"message":"KRALI Final Writer: '+$._KRALI_SUB.esc(e.toString())+'"}'}
};

// v3.4: exact-path import only. Never resolve an old KRALI still by filename.
$._KRALI_SUB._v33FindByExactMediaPath=function(root,path){
 function walk(bin){
  try{
   for(var i=0;i<bin.children.numItems;i++){
    var it=bin.children[i];
    try{
     if(it.type===2){var p=it.getMediaPath();if(p && String(p)===String(path))return it}
    }catch(_){}
    try{if(it.type===1){var f=walk(it);if(f)return f}}catch(_){}
   }
  }catch(_){}
  return null;
 }
 return walk(root);
};
$._KRALI_SUB.writeKraliTextTrackV33=function(payloadJSON){
 try{
  var seq=app.project&&app.project.activeSequence;
  if(!seq)return '{"ok":false,"message":"Aktif sequence yok."}';
  var data=JSON.parse(payloadJSON),items=data.items||[],gen=String(data.generation||"");
  if(!items.length)return '{"ok":false,"message":"Yazılacak altyazı yok."}';

  var slot=$._KRALI_SUB._v30EnsureGraphicsTrack(seq);
  if(!slot)return '{"ok":false,"message":"KRALI ALTYAZI track oluşturulamadı."}';

  var before=slot.track.clips.numItems;
  for(var i=slot.track.clips.numItems-1;i>=0;i--){
    try{slot.track.clips[i].remove(false,false)}catch(e){
      return '{"ok":false,"message":"Eski KRALİ item silinemedi. Yeni render yazılmadı."}';
    }
  }
  if(slot.track.clips.numItems!==0)return '{"ok":false,"message":"KRALİ track boş değil. İşlem durduruldu."}';

  var inserted=0,errors=[],root=app.project.rootItem;
  for(var j=0;j<items.length;j++){
    var x=items[j],f=new File(x.path);
    if(!f.exists){errors.push("PNG yok:"+x.path);continue}
    // Unique generation path means this should be a new ProjectItem every Apply.
    var pi=$._KRALI_SUB._v33FindByExactMediaPath(root,f.fsName);
    if(!pi){
      try{app.project.importFiles([f.fsName],1,root,0)}catch(e){}
      pi=$._KRALI_SUB._v33FindByExactMediaPath(root,f.fsName);
    }
    if(!pi){errors.push("Import:"+f.name);continue}
    try{
      slot.track.overwriteClip(pi,Number(x.start)||0);
      var best=null;
      for(var k=slot.track.clips.numItems-1;k>=0;k--){
        var c=slot.track.clips[k];
        try{
          if(c.projectItem===pi || String(c.projectItem.getMediaPath())===String(f.fsName)){best=c;break}
        }catch(_){}
      }
      if(best){
        try{var et=new Time();et.seconds=Math.max(Number(x.start)+0.05,Number(x.end));best.end=et}catch(_){}
        try{best.name="KRALI "+gen+" · "+(j+1)+" · "+String(x.text||"").substr(0,36)}catch(_){}
      }
      inserted++;
    }catch(e){errors.push("Timeline:"+f.name)}
  }
  return JSON.stringify({ok:inserted===items.length,removed:before,inserted:inserted,generation:gen,errors:errors});
 }catch(e){return '{"ok":false,"message":"v3.4 writer: '+$._KRALI_SUB.esc(e.toString())+'"}'}
};

// ============================================================================
// KRALI v3.4 IMPORT FIX
// v3.3 successfully imported unique PNGs, but exact getMediaPath comparison
// could fail on Premiere/macOS path normalization. Because filenames are now
// generation-unique, finding the freshly imported ProjectItem by exact UNIQUE
// filename is safe and avoids stale-cache collisions.
// ============================================================================
$._KRALI_SUB._v34FindUniqueName=function(bin,name){
 try{
  for(var i=0;i<bin.children.numItems;i++){
   var it=bin.children[i];
   try{if(String(it.name)===String(name))return it}catch(_){}
   try{if(it.type===1){var f=$._KRALI_SUB._v34FindUniqueName(it,name);if(f)return f}}catch(_){}
  }
 }catch(_){}
 return null;
};
$._KRALI_SUB.writeKraliTextTrackV34=function(payloadJSON){
 try{
  var seq=app.project&&app.project.activeSequence;
  if(!seq)return '{"ok":false,"message":"Aktif sequence yok."}';
  var data=JSON.parse(payloadJSON),items=data.items||[],gen=String(data.generation||"");
  if(!items.length)return '{"ok":false,"message":"Yazılacak altyazı yok."}';

  var slot=$._KRALI_SUB._v30EnsureGraphicsTrack(seq);
  if(!slot)return '{"ok":false,"message":"KRALI ALTYAZI video track oluşturulamadı."}';

  var before=slot.track.clips.numItems;
  for(var i=slot.track.clips.numItems-1;i>=0;i--){
    try{slot.track.clips[i].remove(false,false)}
    catch(e){return '{"ok":false,"message":"Eski KRALİ item silinemedi; işlem durdu."}'}
  }
  if(slot.track.clips.numItems!==0)return '{"ok":false,"message":"KRALİ track boşaltılamadı."}';

  var inserted=0,errors=[],root=app.project.rootItem;
  for(var j=0;j<items.length;j++){
    var x=items[j],f=new File(x.path);
    if(!f.exists){errors.push("Dosya yok:"+f.name);continue}

    // Every v3.4 filename contains a random generation id, therefore this
    // exact-name lookup cannot resolve a previous generation.
    var pi=$._KRALI_SUB._v34FindUniqueName(root,f.name);
    if(!pi){
      var imp=false;
      try{imp=app.project.importFiles([f.fsName],1,root,0)}catch(e){}
      pi=$._KRALI_SUB._v34FindUniqueName(root,f.name);
      if(!pi){
        // Premiere can report a slightly normalized display name; fall back
        // to the already-proven path/name helper only AFTER import.
        try{pi=$._KRALI_SUB._findItemByPathOrName(root,f.fsName,f.name)}catch(_){}
      }
    }
    if(!pi){errors.push("Import:"+f.name);continue}

    try{
      slot.track.overwriteClip(pi,Number(x.start)||0);
      var best=null;
      for(var k=slot.track.clips.numItems-1;k>=0;k--){
        var c=slot.track.clips[k],nm="";
        try{nm=String(c.projectItem.name||"")}catch(_){}
        if(nm===String(pi.name)){best=c;break}
      }
      if(best){
        try{var et=new Time();et.seconds=Math.max(Number(x.start)+0.05,Number(x.end));best.end=et}catch(_){}
        try{best.name="KRALI "+(j+1)+" · "+String(x.text||"").substr(0,42)}catch(_){}
      }
      inserted++;
    }catch(e){errors.push("Timeline:"+f.name+":"+e.toString())}
  }
  return JSON.stringify({ok:inserted===items.length,removed:before,inserted:inserted,generation:gen,errors:errors});
 }catch(e){return '{"ok":false,"message":"v3.4 writer: '+$._KRALI_SUB.esc(e.toString())+'"}'}
};
$._KRALI_SUB.v41PlayheadSeconds=function(){try{return String(app.project.activeSequence.getPlayerPosition().seconds)}catch(e){return '-1'}};
$._KRALI_SUB.v41CleanupOldProjectItems=function(keep){try{var removed=0,failed=0;function walk(bin){for(var i=bin.children.numItems-1;i>=0;i--){var it=bin.children[i],n='';try{n=String(it.name||'')}catch(_){}try{if(it.type===1){walk(it);continue}}catch(_){}if(n.indexOf('KRALI_')===0&&n.indexOf('_CAP_')>0&&n.indexOf(String(keep))<0){try{it.deleteBin();removed++}catch(e){failed++}}}}walk(app.project.rootItem);return JSON.stringify({ok:true,removed:removed,failed:failed})}catch(e){return '{"ok":false}'}};

// ==========================================================================
// KRALI v5.0 host bridge
// ==========================================================================
$._KRALI_SUB.v50SequenceInfo=function(){
 try{
  var s=app.project.activeSequence;if(!s)return '{"ok":false}';
  var fps=25;
  try{
   var tb=Number(s.timebase);
   if(tb>0)fps=254016000000/tb;
  }catch(_){}
  return JSON.stringify({ok:true,fps:fps,width:Number(s.frameSizeHorizontal||1920),height:Number(s.frameSizeVertical||1080)});
 }catch(e){return '{"ok":false}'}
};
$._KRALI_SUB._v50Bin=function(){
 try{
  var root=app.project.rootItem;
  for(var i=0;i<root.children.numItems;i++){var x=root.children[i];try{if(x.type===1&&String(x.name)==="KRALI_RENDER_CACHE")return x}catch(_){}}
  return root.createBin("KRALI_RENDER_CACHE");
 }catch(e){return app.project.rootItem}
};
$._KRALI_SUB._v50FindName=function(bin,name){
 try{for(var i=0;i<bin.children.numItems;i++){var x=bin.children[i];try{if(String(x.name)===String(name))return x}catch(_){};try{if(x.type===1){var y=$._KRALI_SUB._v50FindName(x,name);if(y)return y}}catch(_){}}}catch(_){}
 return null;
};
$._KRALI_SUB._v50CleanBin=function(bin,keep){
 var removed=0,failed=0;
 try{for(var i=bin.children.numItems-1;i>=0;i--){var x=bin.children[i],n="";try{n=String(x.name||"")}catch(_){};try{if(x.type===1)continue}catch(_){};if(n.indexOf("KRALI_")===0&&n.indexOf("_CAP_")>0&&n.indexOf(String(keep))<0){try{x.deleteBin();removed++}catch(e){failed++}}}}catch(e){}
 return {removed:removed,failed:failed};
};
$._KRALI_SUB.writeKraliTextTrackV50=function(payloadJSON){
 try{
  var seq=app.project&&app.project.activeSequence;if(!seq)return '{"ok":false,"message":"Aktif sequence yok."}';
  var data=JSON.parse(payloadJSON),items=data.items||[],gen=String(data.generation||"");if(!items.length)return '{"ok":false,"message":"Yazılacak altyazı yok."}';
  var slot=$._KRALI_SUB._v30EnsureGraphicsTrack(seq);if(!slot)return '{"ok":false,"message":"KRALI ALTYAZI track oluşturulamadı."}';
  var before=slot.track.clips.numItems;
  for(var i=slot.track.clips.numItems-1;i>=0;i--){try{slot.track.clips[i].remove(false,false)}catch(e){return '{"ok":false,"message":"Eski KRALİ item silinemedi."}'}}
  if(slot.track.clips.numItems!==0)return '{"ok":false,"message":"KRALİ track boşaltılamadı."}';
  var bin=$._KRALI_SUB._v50Bin(),inserted=0,errors=[];
  for(var j=0;j<items.length;j++){
   var x=items[j],f=new File(x.path);if(!f.exists){errors.push("Dosya yok:"+f.name);continue}
   var pi=$._KRALI_SUB._v50FindName(bin,f.name);
   if(!pi){try{app.project.importFiles([f.fsName],1,bin,0)}catch(e){};pi=$._KRALI_SUB._v50FindName(bin,f.name)}
   if(!pi){errors.push("Import:"+f.name);continue}
   try{
    slot.track.overwriteClip(pi,Number(x.start)||0);
    var best=null;for(var k=slot.track.clips.numItems-1;k>=0;k--){var c=slot.track.clips[k];try{if(String(c.projectItem.name)===String(pi.name)){best=c;break}}catch(_){}}
    if(best){try{var et=new Time();et.seconds=Math.max(Number(x.start)+.05,Number(x.end));best.end=et}catch(_){};try{best.name="KRALI "+(j+1)+" · "+String(x.text||"").substr(0,42)}catch(_){}}
    inserted++;
   }catch(e){errors.push("Timeline:"+f.name)}
  }
  var cl=$._KRALI_SUB._v50CleanBin(bin,gen);
  return JSON.stringify({ok:inserted===items.length,removed:before,inserted:inserted,generation:gen,projectRemoved:cl.removed,cleanupFailed:cl.failed,errors:errors});
 }catch(e){return '{"ok":false,"message":"v5 writer: '+$._KRALI_SUB.esc(e.toString())+'"}'}
};

$._KRALI_SUB.v55SetPlayhead=function(sec){
 try{var s=app.project.activeSequence;if(!s)return "0";var t=new Time();t.seconds=Math.max(0,Number(sec)||0);s.setPlayerPosition(t.ticks);return "1"}catch(e){return "0"}
};

$._KRALI_SUB.v60ProjectKey=function(){
 try{
  var p=app.project, name=(p&&p.name)?p.name:"PROJECT", path="";
  try{path=p.path||""}catch(_){}
  var raw=String(path||name),h=0;for(var i=0;i<raw.length;i++)h=((h<<5)-h)+raw.charCodeAt(i),h|=0;
  return JSON.stringify({ok:true,key:String(name).replace(/[^A-Za-z0-9_\-]/g,"_")+"_"+Math.abs(h)});
 }catch(e){return JSON.stringify({ok:false,key:"PROJECT"})}
};
