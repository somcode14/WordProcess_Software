(function(){
var $=function(i){return document.getElementById(i)};
var ed=$("ed"),KEY="docsy-doc-v1",TKEY="docsy-title-v1",tt;

function toast(m){var t=$("toast");t.textContent=m;t.classList.add("show");clearTimeout(tt);tt=setTimeout(function(){t.classList.remove("show")},1800)}
function exec(c,v){ed.focus();document.execCommand(c,false,v||null);refresh()}

// formatting buttons
document.querySelectorAll("[data-c]").forEach(function(b){
  b.addEventListener("mousedown",function(e){e.preventDefault()});
  b.addEventListener("click",function(){exec(b.dataset.c)});
});
["up","lo","ti"].forEach(function(i){$(i).addEventListener("mousedown",function(e){e.preventDefault()})});
$("blk").onchange=function(){exec("formatBlock",this.value)};
$("sz").onchange=function(){exec("fontSize",this.value)};
$("ff").onchange=function(){exec("fontName",this.value)};
$("col").oninput=function(){exec("foreColor",this.value)};

// line spacing
$("ls").onchange=function(){
  var s=getSelection(),v=this.value;if(!s.rangeCount||!v)return;
  var r=s.getRangeAt(0),n=0;
  ed.querySelectorAll("p,h1,h2,h3,li,blockquote,div").forEach(function(b){if(r.intersectsNode(b)){b.style.lineHeight=v;n++}});
  this.value="";refresh();toast("Line spacing "+v)
};

// case change
function title(t){return t.toLowerCase().replace(/(^|\s)\S/g,function(m){return m.toUpperCase()})}
function changeCase(fn){
  var s=getSelection();if(!s.rangeCount||s.isCollapsed){toast("Select some text first");return}
  ed.focus();document.execCommand("insertText",false,fn(s.toString()));refresh()
}
$("up").onclick=function(){changeCase(function(t){return t.toUpperCase()})};
$("lo").onclick=function(){changeCase(function(t){return t.toLowerCase()})};
$("ti").onclick=function(){changeCase(title)};

// find & replace
function toggleFind(){var f=$("fr");f.classList.toggle("show");if(f.classList.contains("show"))$("fi").focus()}
$("fb").onclick=toggleFind;
$("fn").onclick=function(){var t=$("fi").value;if(!t)return;var ok=window.find&&window.find(t,false,false,true);$("fm").textContent=ok?"":"Not found"};
$("ra").onclick=function(){
  var f=$("fi").value,r=$("ri").value;if(!f)return;
  var re=new RegExp(f.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),"gi"),n=0,w=document.createTreeWalker(ed,NodeFilter.SHOW_TEXT),a=[];
  while(w.nextNode())a.push(w.currentNode);
  a.forEach(function(x){var m=x.nodeValue.match(re);if(m){n+=m.length;x.nodeValue=x.nodeValue.replace(re,function(){return r})}});
  $("fm").textContent=n+" replaced";refresh()
};

// statistics
function stats(){
  var t=ed.innerText.replace(/\u00a0/g," "),words=t.match(/\S+/g)||[];
  var chars=t.replace(/\n/g,"").length,nos=t.replace(/\s/g,"").length;
  var sent=(t.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g)||[]).filter(function(x){return /\w/.test(x)}).length;
  var paras=t.split(/\n+/).filter(function(x){return x.trim()}).length;
  var lng=words.reduce(function(a,w){w=w.replace(/[^\w'-]/g,"");return w.length>a.length?w:a},"");
  var avg=words.length?(nos/words.length).toFixed(1):"0";
  var sel=getSelection().toString().trim(),selw=sel?sel.split(/\s+/).length:0;
  var m=words.length/200,rt=words.length?(m<1?"<1 min":Math.ceil(m)+" min"):"0";
  var rows=[["Words",words.length,"✎"],["Characters",chars,"#"],["Characters without spaces",nos,"⌗"],["Sentences",sent,"❝"],["Paragraphs",paras,"¶"],["Average word length",avg,"≈"],["Longest word",lng||"-","↔"],["Reading time",rt,"◷"]];
  $("st").innerHTML=rows.map(function(r){return '<div class="card" title="'+r[0]+'"><i>'+r[2]+"</i><b>"+String(r[1]).replace(/</g,"&lt;")+"</b><span>"+r[0]+"</span></div>"}).join("");
  $("s1").textContent=words.length+" words";$("s2").textContent=chars+" characters";$("s3").textContent=selw?selw+" selected":rt+" read";
}
function state(){
  ["bold","italic","underline","strikeThrough","superscript","subscript","justifyLeft","justifyCenter","justifyRight","justifyFull","insertUnorderedList","insertOrderedList"].forEach(function(c){
    try{document.querySelector('[data-c="'+c+'"]').classList.toggle("on",document.queryCommandState(c))}catch(e){}
  });
}
var st;
function save(){
  $("saved").textContent="Saving…";clearTimeout(st);
  st=setTimeout(function(){try{localStorage.setItem(KEY,ed.innerHTML);localStorage.setItem(TKEY,$("title").value)}catch(e){}$("saved").textContent="Saved"},400)
}
function refresh(){stats();state();save()}
ed.addEventListener("input",refresh);
$("title").addEventListener("input",save);
document.addEventListener("selectionchange",function(){stats();state()});

// HTML conversion
function toHTML(){
  var c=ed.cloneNode(true);["id","contenteditable","spellcheck","aria-label"].forEach(function(a){c.removeAttribute(a)});
  var px={1:"10px",2:"13px",3:"16px",4:"18px",5:"24px",6:"32px",7:"48px"};
  var h=c.innerHTML.replace(/<font([^>]*?)size="(\d)"([^>]*)>/g,function(m,a,n,b){return '<span style="font-size:'+px[n]+'"'+a+b+">"}).replace(/<font([^>]*)>/g,"<span$1>").replace(/<\/font>/g,"</span>");
  var t=($("title").value||"Document").replace(/</g,"&lt;");
  return '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<title>'+t+'</title>\n<style>body{max-width:800px;margin:40px auto;padding:0 16px;font:16px/1.7 Georgia,serif}</style>\n</head>\n<body>\n'+h+'\n</body>\n</html>'
}
function tab(code){$("dlg").classList.toggle("code",code);$("tp").classList.toggle("on",!code);$("tc").classList.toggle("on",code)}
$("tp").onclick=function(){tab(false)};$("tc").onclick=function(){tab(true)};
function openExport(){
  var h=toHTML();$("src").value=h;
  $("pv").innerHTML=new DOMParser().parseFromString(h,"text/html").body.innerHTML;
  tab(false);$("dlg").showModal()
}
$("ex").onclick=openExport;
$("cl").onclick=function(){$("dlg").close()};
$("cp").onclick=function(){var s=$("src");s.select();var ok=false;try{ok=document.execCommand("copy")}catch(e){}toast(ok?"HTML copied":"Press Ctrl+C to copy")};
$("dl").onclick=function(){
  try{var a=document.createElement("a");a.href=URL.createObjectURL(new Blob([$("src").value],{type:"text/html"}));a.download=($("title").value||"document")+".html";a.click();toast("Downloading…")}catch(e){toast("Use Copy HTML instead")}
};

// misc
$("sb").onclick=function(){$("side").classList.toggle("hide")};
$("nw").onclick=function(){if(confirm("Start a new document? Current text will be cleared.")){ed.innerHTML="<p><br></p>";$("title").value="Untitled document";refresh();ed.focus()}};
$("theme").onclick=function(){
  var r=document.documentElement,d=r.getAttribute("data-theme"),dark=d?d==="dark":matchMedia("(prefers-color-scheme:dark)").matches;
  r.setAttribute("data-theme",dark?"light":"dark")
};
document.addEventListener("keydown",function(e){
  if(!(e.ctrlKey||e.metaKey))return;var k=e.key.toLowerCase();
  if(k==="f"){e.preventDefault();toggleFind()}else if(k==="s"){e.preventDefault();openExport()}
});
try{var s=localStorage.getItem(KEY),t=localStorage.getItem(TKEY);if(s)ed.innerHTML=s;if(t)$("title").value=t}catch(e){}
refresh();
})();