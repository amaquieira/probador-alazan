/*! Probador Alazán v0.1.1 · Espacio Alazán · módulo independiente para fichas Rancho Grande (Tiendanube, tema Río) */
(function(w,d){"use strict";
if(w.__PA_LOADED)return;w.__PA_LOADED=true;
/* Motor del Probador Alazán · copia textual del prototipo aprobado (ver orig/engine_original.js).
   No editar las reglas acá: cualquier cambio rompe la prueba de equivalencia. */
function crearMotor(DISPONIBILIDAD){
/* @@REGLAS-INICIO */
var FAMILIA={id:"RANCHO_GRANDE",talles:[
  {t:"S",cin:68,cad:[88,94]},{t:"M",cin:74,cad:[94,100]},{t:"L",cin:80,cad:[100,106]},{t:"XL",cin:86,cad:[106,112]}]};
var REGLAS={difMaxParaSugerir:1};
function idxTalle(t){for(var i=0;i<FAMILIA.talles.length;i++)if(FAMILIA.talles[i].t===t)return i;return -1;}
function talleCintura(v){var T=FAMILIA.talles;if(v>T[T.length-1].cin)return {fuera:true};
  if(v<T[0].cin)return {t:T[0].t,menor:true};
  for(var i=0;i<T.length;i++){if(v<=T[i].cin)return {t:T[i].t};}return {fuera:true};}
function talleCadera(v,tCin){var T=FAMILIA.talles,m=[];if(v>T[T.length-1].cad[1])return {fuera:true};
  if(v<T[0].cad[0])return {t:T[0].t,menor:true};
  for(var i=0;i<T.length;i++){if(v>=T[i].cad[0]&&v<=T[i].cad[1])m.push(T[i].t);}
  if(!m.length)return {fuera:true};
  /* En el límite entre dos rangos: si uno coincide con el talle de la cintura, se usa ese; si no, el más grande. */
  return {t:(tCin&&m.indexOf(tCin)>=0)?tCin:m[m.length-1]};}
function evaluar(c,h){var a=talleCintura(c),b=talleCadera(h,a.t);
  if(a.fuera||b.fuera)return {tipo:"B"};
  var ia=idxTalle(a.t),ib=idxTalle(b.t),dif=Math.abs(ia-ib),mayor=FAMILIA.talles[Math.max(ia,ib)].t;
  var avisos=[];if(a.menor)avisos.push("cintura");if(b.menor)avisos.push("cadera");
  if(dif===0)return {tipo:"A",talle:mayor,avisos:avisos,entreDos:false};
  if(dif<=REGLAS.difMaxParaSugerir)return {tipo:"A",talle:mayor,avisos:avisos,entreDos:true,cin:a.t,cad:b.t};
  return {tipo:"C",cin:a.t,cad:b.t,mayor:mayor};}
 function fila(t){for(var i=0;i<FAMILIA.talles.length;i++)if(FAMILIA.talles[i].t===t)return FAMILIA.talles[i];}
 function tallaCompatible(t,c,h){var f=fila(t);return !!f&&f.cin>=c&&f.cad[1]>=h;}
 function siguienteMasHolgado(base,c,h){
   var k=idxTalle(base)+1;
   if(k<0||k>=FAMILIA.talles.length)return null;
   var t=FAMILIA.talles[k].t,d=DISPONIBILIDAD[t];
   return tallaCompatible(t,c,h)&&d&&d.estado!=="agotado"?t:null;
 }
/* @@REGLAS-FIN */
/* @@PARSE-INICIO */
function parse(v){v=String(v).trim().replace(",",".");if(v==="")return {e:"vacio"};var n=Number(v);if(!isFinite(n))return {e:"nan"};
  if(n<40||n>200)return {e:"rango",n:n};return {n:Math.round(n*10)/10};}
/* @@PARSE-FIN */
return {evaluar:evaluar,siguienteMasHolgado:siguienteMasHolgado,parse:parse,fila:fila,idxTalle:idxTalle,FAMILIA:FAMILIA};
}
/* ===== Probador Alazán · interfaz e integración con la ficha de Tiendanube (tema Río) ===== */
var VERSION="0.1.1";
var DEFAULTS={
  enabled:true,
  calculo:true,                 /* false = solo guía (tabla + a medida por WhatsApp), sin cálculo de talle */
  qaOnly:true,                  /* true = el módulo solo arranca si la URL tiene pa_qa=1 (segunda traba, además del cargador) */
  productIds:[211085332,80837439,80837812,365603669,139335789,312759892,316264047,298029696,83514019,206131311,374144052],
  waNumero:"541158571964",
  waVisible:"+54 11 5857-1964",
  plazoMedida:"20 días corridos (puede ser antes)",
  debug:false
};
var CFG={};var k;for(k in DEFAULTS)CFG[k]=DEFAULTS[k];
if(w.PA_CONFIG&&typeof w.PA_CONFIG==="object")for(k in w.PA_CONFIG)CFG[k]=w.PA_CONFIG[k];

function log(){if(CFG.debug&&w.console)try{console.info.apply(console,["[Probador Alazán]"].concat([].slice.call(arguments)));}catch(e){}}
function push(ev,params){try{w.dataLayer=w.dataLayer||[];var o={event:ev,pa_version:VERSION,pa_product_id:P.id};if(params)for(var x in params)o[x]=params[x];w.dataLayer.push(o);}catch(e){}}

/* ===== Interruptores de apagado ===== */
function apagado(){
  if(w.PA_DISABLED===true)return "PA_DISABLED";
  if(CFG.enabled===false)return "config";
  if(/[?&]pa_off=1/.test(location.search))return "pa_off";
  if(CFG.qaOnly!==false&&!/[?&]pa_qa=1/.test(location.search))return "qaOnly_sin_pa_qa";
  return "";
}

/* ===== Lectura de la ficha ===== */
var SZ=/^\s*(PREVENTA\s*-\s*)?(S|M|L|XL)\s*$/i;
var P={id:null,form:null,grupo:null,anchors:{},labels:{},modelo:"Rancho Grande",color:"",variants:[]};
var DISPONIBILIDAD={};
function productId(){
  try{if(w.LS&&w.LS.product&&w.LS.product.id)return Number(w.LS.product.id);}catch(e){}
  var el=d.querySelector('[data-store^="product-description-"]');
  if(el){var n=Number(el.getAttribute("data-store").replace("product-description-",""));if(n)return n;}
  return null;
}
function talleDe(label){var m=SZ.exec(label||"");return m?m[2].toUpperCase():null;}
function leerGrupo(form){
  var gs=form.querySelectorAll(".js-product-variants-group");
  for(var i=0;i<gs.length;i++){
    var as=gs[i].querySelectorAll("a.js-insta-variant");if(!as.length)continue;
    var ok=true,anchors={},labels={};
    for(var j=0;j<as.length;j++){var lb=as[j].getAttribute("data-option"),t=talleDe(lb);if(!t){ok=false;break;}anchors[t]=as[j];labels[t]=lb;}
    if(ok)return {el:gs[i],idx:gs[i].getAttribute("data-variation-id"),anchors:anchors,labels:labels};
  }
  return null;
}
function leerVariantes(form){
  var el=form.closest("[data-variants]")||form.querySelector("[data-variants]")||d.querySelector("[data-variants]");
  if(el){try{var v=JSON.parse(el.getAttribute("data-variants"));if(v&&v.length)return v;}catch(e){}}
  try{if(w.LS&&w.LS.variants&&w.LS.variants.length)return w.LS.variants;}catch(e){}
  return [];
}
function leerNombre(){
  var el=d.querySelector('[data-store="product-name-'+P.id+'"]')||d.querySelector(".js-product-name");
  var t=el?el.textContent:"";
  if(!t){var m=d.querySelector('meta[property="og:title"]');t=m?m.getAttribute("content"):"";}
  t=(t||"").replace(/\s+/g," ").trim();
  var parts=t.split("|");
  var modelo=(parts[0]||"").replace(/^\s*Pantal[oó]n\s+/i,"").trim();
  P.modelo=/rancho grande/i.test(modelo)?modelo:"Rancho Grande";
  P.color=(parts[1]||"").trim();
}
/* Disponibilidad en vivo: por talle, según las variantes de la ficha y los otros atributos elegidos (color). */
function calcularDisponibilidad(){
  var idx=P.grupo.idx,sel={};
  var gs=P.form.querySelectorAll(".js-product-variants-group");
  for(var i=0;i<gs.length;i++){var vid=gs[i].getAttribute("data-variation-id");if(vid===idx)continue;var a=gs[i].querySelector("a.js-insta-variant.selected");if(a)sel[vid]=a.getAttribute("data-option");}
  var T=["S","M","L","XL"];
  for(var t=0;t<T.length;t++){
    var talle=T[t],label=P.grupo.labels[talle];
    if(!label){DISPONIBILIDAD[talle]={estado:"agotado"};continue;}
    var hay=false;
    for(var j=0;j<P.variants.length;j++){var v=P.variants[j];
      if(v["option"+idx]!==label)continue;
      var coincide=true;for(var o in sel){if(v["option"+o]!==undefined&&v["option"+o]!==sel[o])coincide=false;}
      if(!coincide)continue;
      if(v.available!==false&&(v.stock===null||v.stock===undefined||Number(v.stock)>0))hay=true;
    }
    DISPONIBILIDAD[talle]=hay?{estado:/^\s*PREVENTA/i.test(label)?"preventa":"stock"}:{estado:"agotado"};
  }
}

/* ===== Motor (copia textual del prototipo) ===== */
var M=crearMotor(DISPONIBILIDAD);
var evaluar=M.evaluar,siguienteMasHolgado=M.siguienteMasHolgado,parse=M.parse,fila=M.fila,FAMILIA=M.FAMILIA;
function dispLabel(t){var dd=DISPONIBILIDAD[t];return !dd||dd.estado==="agotado"?"Sin stock":dd.estado==="preventa"?"Preventa · 20 días corridos":"En stock";}

/* ===== Utilidades ===== */
var $=function(s,r){return (r||ROOT).querySelector(s);};
var $$=function(s,r){return Array.prototype.slice.call((r||ROOT).querySelectorAll(s));};
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});}
var ICON_RULER='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><rect x="2.5" y="8" width="19" height="8" rx="1.5"/><path d="M6.5 8v3M10 8v4M13.5 8v3M17 8v4"/></svg>';
var ICON_CHEV='<svg class="pa-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>';
var FIG='<svg viewBox="0 0 72 96" aria-hidden="true"><path d="M24 6h24l4 26-6 58H38l-2-40-2 40h-8l-6-58z" fill="#E9DED4" stroke="#553A1D" stroke-width="1.5"/><path d="M18 24h36" stroke="#CC7B3E" stroke-width="2.5" stroke-dasharray="4 3"/><path d="M14 40h44" stroke="#553A1D" stroke-width="2.5" stroke-dasharray="4 3"/></svg>';
var IC_OK='<svg viewBox="0 0 24 24" fill="none" stroke="#2E6B34" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/></svg>';
var IC_CLK='<svg viewBox="0 0 24 24" fill="none" stroke="#8A5A1F" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>';
var IC_Q='<svg viewBox="0 0 24 24" fill="none" stroke="#6B5A48" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.5V14M12 17v.5"/></svg>';
var LBL_FREE='<span class="pa-free-label" aria-label="Confección a medida gratis, sin recargo">A medida GRATIS</span>';

/* ===== Plantilla del probador (textos del prototipo aprobado) ===== */
function plantilla(){
  var prod=esc(P.modelo)+(P.color?" · "+esc(P.color):"");
  var rows=FAMILIA.talles.map(function(f){var lg={S:"108–110",M:"112–114",L:"116–118",XL:"120–122"}[f.t];return '<tr><th scope="row">'+f.t+'</th><td>'+f.cin+'</td><td>'+f.cad[0]+'–'+f.cad[1]+'</td><td>'+lg+'</td></tr>';}).join("");
  var quiero='Quiero mi '+esc(P.modelo)+' a medida '+LBL_FREE;
  return ''+
'<div class="pa-scrim" data-pa-close></div>'+
'<div class="pa-dlg" role="dialog" aria-modal="true" aria-labelledby="pa-title">'+
 '<div class="pa-dlg-h">'+
  '<button type="button" class="pa-ib" id="pa-back" aria-label="Volver al paso anterior" hidden><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg></button>'+
  '<h2 id="pa-title">Probador Alazán</h2>'+
  '<button type="button" class="pa-ib" id="pa-close" aria-label="Cerrar el probador y volver a la ficha"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>'+
 '</div>'+
 '<div class="pa-dlg-b" id="pa-body">'+
  /* Bienvenida */
  '<section data-step="welcome" aria-labelledby="pa-h-w">'+
   '<p class="pa-step-k">'+prod+'</p>'+
   '<span class="pa-tech-tag">Probador Alazán · Asistente interactivo de talles</span><h3 id="pa-h-w">Encontrá tu talle</h3>'+
   (CFG.calculo?
   '<p class="pa-lead">Ingresá las medidas de tu cuerpo. Las comparamos con la tabla de medidas de la prenda '+esc(P.modelo)+' para orientarte.</p>'+
   '<div class="pa-fig">'+FIG+'<p>Solo necesitás un centímetro de costura y dos medidas: <b>cintura</b> y <b>cadera</b>. Lleva menos de un minuto.</p></div>'+
   '<div class="pa-stack"><button type="button" class="pa-btn" data-go="measure">Comenzar</button><div class="pa-links"><button type="button" class="pa-lnk" data-go="table">Ver tabla de talles</button></div></div>'
   :
   '<p class="pa-lead">Revisá la tabla de medidas de la prenda. Si dudás entre dos talles, elegí el más grande.</p>'+
   '<div class="pa-stack"><button type="button" class="pa-btn" data-go="table">Ver tabla de talles</button><button type="button" class="pa-btn2" data-go="wa">'+quiero+'</button></div>')+
  '</section>'+
  /* Tabla */
  '<section data-step="table" aria-labelledby="pa-h-t" hidden>'+
   '<h3 id="pa-h-t">Tabla de talles</h3>'+
   '<table class="pa-tbl"><caption>Medidas de la prenda '+esc(P.modelo)+', en centímetros.</caption><thead><tr><th scope="col">Talle</th><th scope="col">Cintura</th><th scope="col">Cadera</th><th scope="col">Largo total</th></tr></thead><tbody>'+rows+'</tbody></table>'+
   '<p style="font-size:14px">Cómo medirse, según la ficha: cintura en la parte más angosta, justo arriba del ombligo; cadera en la parte más ancha. Si dudás entre dos talles, elegí el más grande.</p>'+
   '<div class="pa-stack">'+(CFG.calculo?'<button type="button" class="pa-btn" data-go="measure">Ingresar mis medidas</button>':'<button type="button" class="pa-btn" data-go="wa">'+quiero+'</button>')+'</div>'+
  '</section>'+
  /* Medidas */
  '<section data-step="measure" aria-labelledby="pa-h-m" hidden>'+
   '<p class="pa-step-k">Paso 1 de 2</p><h3 id="pa-h-m">Tus medidas corporales</h3>'+
   '<p class="pa-ctx">Comparamos tu cintura y tu cadera con las medidas de la prenda '+esc(P.modelo)+'. El resultado es una orientación para elegir: no garantiza el calce.</p>'+
   '<div class="pa-alert" id="pa-errsum" role="alert" tabindex="-1"></div>'+
   '<form id="pa-frm" novalidate>'+
    '<div class="pa-field" id="pa-fcin"><label for="pa-cin">Cintura (cm)</label><span class="pa-help" id="pa-hcin">Medí el contorno de tu cintura en la parte más angosta, cerca del ombligo.</span><div class="pa-inp"><input id="pa-cin" name="pa_cintura" inputmode="decimal" autocomplete="off" aria-describedby="pa-hcin pa-ecin" aria-required="true"><span aria-hidden="true">cm</span></div><span class="pa-emsg" id="pa-ecin"></span></div>'+
    '<div class="pa-field" id="pa-fcad"><label for="pa-cad">Cadera (cm)</label><span class="pa-help" id="pa-hcad">Medí el contorno de tu cadera en la parte más ancha.</span><div class="pa-inp"><input id="pa-cad" name="pa_cadera" inputmode="decimal" autocomplete="off" aria-describedby="pa-hcad pa-ecad" aria-required="true"><span aria-hidden="true">cm</span></div><span class="pa-emsg" id="pa-ecad"></span></div>'+
    '<div class="pa-fig">'+FIG+'<p>Rodeá el cuerpo con el centímetro, sin ajustar ni dejar flojo. La línea naranja es la cintura y la marrón, la cadera.</p></div>'+
    '<button type="submit" class="pa-btn">Ver mi talle</button>'+
    '<p class="pa-priv"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg><span>Tus medidas se usan solo en esta pantalla. No se guardan ni se envían.</span></p>'+
   '</form>'+
  '</section>'+
  /* Resultado A · talle sugerido */
  '<section data-step="resA" aria-labelledby="pa-h-a" hidden>'+
   '<p class="pa-step-k">Paso 2 de 2</p>'+
   '<div id="pa-fit" class="pa-fit" hidden><h4 id="pa-fitq" tabindex="-1">¿Cómo te gusta usar tu pantalón?</h4><p class="pa-fit-intro">Encontramos dos talles posibles según tus medidas. Elegí cómo te gusta que te quede.</p>'+
    '<div class="pa-fit-grid" role="group" aria-label="Preferencia de calce">'+
     '<button type="button" class="pa-fit-choice" data-fit="ajustado" aria-pressed="true"><b>Más ajustado</b><span>Prefiero que quede más al cuerpo.</span><small id="pa-fit-t"></small></button>'+
     '<button type="button" class="pa-fit-choice" data-fit="holgado" aria-pressed="false"><b>Más holgado</b><span>Prefiero que quede más suelto.</span><small id="pa-fit-l"></small></button>'+
    '</div></div>'+
   '<span class="pa-badge">Resultado orientativo</span>'+
   '<h3 id="pa-h-a" class="pa-res-big pa-size-result" aria-live="polite"><span class="pa-result-label">Talle orientativo</span><span class="pa-t" id="pa-at">M</span></h3>'+
   '<p id="pa-amine" class="pa-lead"></p><p>Comparamos tus medidas con las de la prenda. Es una orientación para elegir, no una garantía de calce. El Rancho Grande es ajustado en la cintura y cae suelto desde ahí; si estás entre dos talles, la guía de la ficha recomienda el más grande.</p>'+
   '<p id="pa-anote" class="pa-avail" hidden></p>'+
   '<div class="pa-stack" id="pa-pickwrap"><button type="button" class="pa-btn" id="pa-pick">Elegir talle M y volver a la ficha</button><p class="pa-free-note">Vas a ver el talle marcado en la ficha. Si querés, podés cambiarlo antes de agregar al carrito.</p></div>'+
   '<div class="pa-compare"><h4>Así se compara con la tabla</h4><table class="pa-cmp" aria-label="Tus medidas comparadas con la tabla"><thead><tr><th scope="col">Medida</th><th scope="col">Tuya</th><th scope="col">Talle <span id="pa-at2">M</span></th></tr></thead><tbody><tr><td>Cintura</td><td id="pa-ac1"></td><td id="pa-ac2"></td></tr><tr><td>Cadera</td><td id="pa-ah1"></td><td id="pa-ah2"></td></tr></tbody></table></div>'+
   '<div class="pa-avail" id="pa-aavail"></div>'+
   '<div class="pa-links"><button type="button" class="pa-lnk" data-go="measure">Revisar mis medidas</button><button type="button" class="pa-lnk" data-go="wa" data-wa-mode="consulta">¿Dudas? Consultanos por WhatsApp</button></div>'+
   '<hr class="pa-sep">'+
   '<div class="pa-sec"><h4>¿Preferís que lo hagamos especialmente para vos?</h4><p class="pa-custom-free">Confección a medida SIN COSTO ADICIONAL. Pagás solamente el precio de la prenda.</p><button type="button" class="pa-btn2" data-go="wa">'+quiero+'</button></div>'+
  '</section>'+
  /* Resultado B · a medida */
  '<section data-step="resB" aria-labelledby="pa-h-b" hidden>'+
   '<p class="pa-step-k">Paso 2 de 2</p><h3 id="pa-h-b" class="pa-res-big">¡Lo hacemos a tu medida!</h3>'+
   '<p class="pa-lead">Podemos confeccionar tu '+esc(P.modelo)+' especialmente para vos.</p>'+
   '<p class="pa-custom-free">¡La confección a medida es GRATIS! No tiene recargo: pagás únicamente la prenda. Hacemos cualquier medida y está lista en '+esc(CFG.plazoMedida)+'.</p>'+
   '<div class="pa-fig"><svg viewBox="0 0 72 72" aria-hidden="true"><circle cx="36" cy="36" r="30" fill="#E9DED4"/><path d="M20 48l28-28M44 20l8 8-28 28h-8v-8z" fill="none" stroke="#553A1D" stroke-width="2.5" stroke-linejoin="round"/><path d="M26 30l4 4M32 24l4 4" stroke="#CC7B3E" stroke-width="2.5"/></svg><p>Cada Rancho Grande se confecciona de forma artesanal en Buenos Aires. Te escribimos por WhatsApp para coordinar tus medidas.</p></div>'+
   '<div class="pa-stack"><button type="button" class="pa-btn" data-go="wa">'+quiero+'</button><div class="pa-links"><button type="button" class="pa-lnk" data-go="measure">Revisar mis medidas</button></div></div>'+
  '</section>'+
  /* Resultado C · medidas muy distintas */
  '<section data-step="resC" aria-labelledby="pa-h-c" hidden>'+
   '<p class="pa-step-k">Paso 2 de 2</p><span class="pa-badge">Resultado orientativo</span>'+
   '<h3 id="pa-h-c" class="pa-res-big">¡Lo hacemos especialmente para vos!</h3>'+
   '<p>Tu cintura corresponde al talle <b id="pa-cw">S</b> y tu cadera, al talle <b id="pa-ch">L</b>. Con tanta diferencia entre las dos medidas, un talle estándar no te va a quedar bien en los dos lugares.</p>'+
   '<table class="pa-cmp" aria-label="Tus medidas comparadas con dos talles"><thead><tr><th scope="col">Medida</th><th scope="col">Tuya</th><th scope="col" id="pa-cth1">S</th><th scope="col" id="pa-cth2">M</th></tr></thead><tbody><tr><td>Cintura</td><td id="pa-cc0"></td><td id="pa-cc1"></td><td id="pa-cc2"></td></tr><tr><td>Cadera</td><td id="pa-ch0"></td><td id="pa-ch1"></td><td id="pa-ch2"></td></tr></tbody></table>'+
   '<p class="pa-custom-free">Confección a medida GRATIS, sin costo adicional. Pagás únicamente la prenda.</p>'+
   '<div class="pa-stack"><button type="button" class="pa-btn" data-go="wa">'+quiero+'</button><button type="button" class="pa-btn2" data-go="wa" data-wa-mode="consulta">Consultar por WhatsApp</button></div>'+
   '<div class="pa-links"><button type="button" class="pa-lnk" data-go="measure">Revisar mis medidas</button><button type="button" class="pa-lnk" data-go="table">Ver tabla de talles</button></div>'+
  '</section>'+
  /* WhatsApp */
  '<section data-step="wa" aria-labelledby="pa-h-wa" hidden>'+
   '<h3 id="pa-h-wa">Tu pedido a medida</h3>'+
   '<p>Te preparamos un mensaje para WhatsApp. Revisalo y cambialo si querés antes de enviarlo.</p>'+
   '<p class="pa-custom-free" id="pa-wafree">Confección a medida GRATIS: sin recargo sobre el precio de la prenda. Sin límite de medidas. Plazo: '+esc(CFG.plazoMedida)+'.</p>'+
   '<p class="pa-free-note" id="pa-waneed">Para hacerlo a tu medida necesitamos tu cintura, tu cadera y el largo total.</p>'+
   '<div class="pa-field" id="pa-flar" style="margin-top:16px"><label for="pa-lar">Largo total (cm) <span style="font-weight:400;color:#6B5A48">· opcional</span></label><span class="pa-help" id="pa-hlar">Desde la cintura hasta donde querés que llegue el pantalón.</span><div class="pa-inp"><input id="pa-lar" inputmode="decimal" autocomplete="off" aria-describedby="pa-hlar"><span aria-hidden="true">cm</span></div></div>'+
   '<label for="pa-msg" style="display:block;font-weight:600;margin:0 0 6px;font-size:15px">Mensaje</label>'+
   '<textarea id="pa-msg" class="pa-msg"></textarea>'+
   '<label class="pa-chk" id="pa-chkwrap"><input type="checkbox" id="pa-chk"><span id="pa-chktxt">Sumar mis medidas al mensaje</span></label>'+
   '<p class="pa-free-note" style="margin-top:-8px!important">Tus medidas solo se suman si marcás la casilla. Nada se envía hasta que lo mandes vos desde WhatsApp.</p>'+
   '<div class="pa-stack" style="margin-top:16px"><a class="pa-btn" id="pa-wabtn" href="https://wa.me/'+esc(CFG.waNumero)+'" target="_blank" rel="noopener noreferrer">Abrir chat de WhatsApp</a>'+
    '<p class="pa-wa-contact">O escribinos al <a id="pa-waphone" href="https://wa.me/'+esc(CFG.waNumero)+'" target="_blank" rel="noopener noreferrer">'+esc(CFG.waVisible)+'</a></p>'+
    '<div class="pa-links"><button type="button" class="pa-lnk" data-pa-close>Volver a la ficha</button></div></div>'+
  '</section>'+
 '</div>'+
 '<div class="pa-dlg-f">La tabla tiene medidas de la prenda. El resultado es una orientación, no una garantía de calce.</div>'+
'</div>';
}

/* ===== Estado (se mantiene al cerrar y reabrir) ===== */
var S={step:"welcome",hist:[],cin:"",cad:"",res:null,fit:"ajustado",consent:false,msgEdited:false,picked:null,waMode:"medida",origen:null};
var ROOT=null,TOAST=null,lastTrigger=null,isOpen=false;
var TITLES={welcome:"Probador Alazán",table:"Tabla de talles",measure:"Probador Alazán",resA:"Probador Alazán",resB:"Probador Alazán",resC:"Probador Alazán",wa:"Pedido a medida"};

/* ===== Accesos ===== */
function accSuperior(){
  var div=d.createElement("div");div.className="pa-acc";div.setAttribute("data-pa-acc","superior");
  div.innerHTML='<button type="button" class="pa-acc-a" data-pa-open="superior" aria-haspopup="dialog">'+ICON_RULER+'<span class="pa-u" data-albl>¿Cuál es mi talle?</span><span class="pa-hint" data-ahint>Probador Alazán</span>'+ICON_CHEV+'</button>';
  return div;
}
function accInferior(){
  var div=d.createElement("div");div.className="pa-acc";div.setAttribute("data-pa-acc","inferior");
  div.innerHTML='<button type="button" class="pa-acc-c2" data-pa-open="inferior" aria-haspopup="dialog">¿Dudás con tu talle? <span class="pa-u">Probá el Probador Alazán</span> →</button>';
  return div;
}
function puntoInferior(){
  var desc=d.querySelector('[data-store="product-description-'+P.id+'"] .product-description')||d.querySelector('[data-store^="product-description-"] .product-description');
  if(!desc)return null;
  var tbl=desc.querySelector("table");if(!tbl)return null;
  var ancla=tbl,s=tbl.nextElementSibling,n=0;
  /* Si «Cómo medirse» sigue a la tabla (salteando párrafos vacíos), el acceso va después de esa nota. */
  while(s&&n<3){var tx=(s.textContent||"").trim();
    if(/^c[oó]mo medirse/i.test(tx)){ancla=s;break;}
    if(tx!=="")break;s=s.nextElementSibling;n++;}
  return ancla;
}
function updateAccessLabels(){
  d.querySelectorAll("[data-albl]").forEach(function(el){
    var h=el.parentNode.querySelector("[data-ahint]");
    if(S.res&&S.res.tipo==="A"){el.textContent="Tu talle sugerido: "+S.res.talle;h.textContent="Ver resultado";}
    else if(S.res){el.textContent="Volver al Probador Alazán";h.textContent="";}
    else{el.textContent="¿Cuál es mi talle?";h.textContent="Probador Alazán";}
    h.hidden=!h.textContent;
  });
}

/* ===== Navegación ===== */
function show(step,pushHist){
  if(pushHist!==false&&S.step!==step)S.hist.push(S.step);
  S.step=step;
  $$("[data-step]").forEach(function(s){s.hidden=(s.getAttribute("data-step")!==step);});
  $("#pa-title").textContent=TITLES[step];
  $("#pa-back").hidden=(S.hist.length===0);
  $("#pa-body").scrollTop=0;
  if(step==="wa")prepWA();
  focoPaso();
}
function focoPaso(){if(!isOpen)return;var h=(S.step==="resA"&&!$("#pa-fit").hidden)?$("#pa-fitq"):$('[data-step="'+S.step+'"] h3');if(h){h.setAttribute("tabindex","-1");try{h.focus({preventScroll:true});}catch(e){h.focus();}}}
function back(){if(!S.hist.length)return;show(S.hist.pop(),false);}
function open(trigger,origen){
  calcularDisponibilidad();
  lastTrigger=trigger||null;isOpen=true;S.origen=origen||null;
  if(S.res&&S.step==="wa"&&origen){S.step="res"+S.res.tipo;S.hist=[];}
  ROOT.classList.add("pa-open");d.documentElement.classList.add("pa-lock");
  show(S.step,false);
  try{history.pushState({pa:1},"");}catch(e){}
  setTimeout(focoPaso,30);
  push("probador_open",{pa_ubicacion:origen||"desconocida",pa_paso:S.step});
}
function close(fromPop){
  if(!isOpen)return;isOpen=false;
  ROOT.classList.remove("pa-open");d.documentElement.classList.remove("pa-lock");
  if(!fromPop){try{if(history.state&&history.state.pa)history.back();}catch(e){}}
  updateAccessLabels();
  push("probador_close",{pa_paso:S.step});
  var t=lastTrigger&&d.body.contains(lastTrigger)?lastTrigger:d.querySelector("[data-pa-open]");if(t)try{t.focus({preventScroll:true});}catch(e){}
}

/* ===== Formulario ===== */
function setErr(fid,eid,inp,msg){var f=$(fid);f.classList.toggle("pa-err",!!msg);$(eid).innerHTML=msg?'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v6M12 16.5v.5"/></svg><span>'+msg+'</span>':"";$(inp).setAttribute("aria-invalid",msg?"true":"false");}
function msgFor(r,campo,ej){if(r.e==="vacio")return "Ingresá tu "+campo+" en centímetros, por ejemplo "+ej+".";if(r.e==="nan")return "Escribí solo números, por ejemplo "+ej+".";return "Revisá la medida: "+r.n+" cm parece fuera de lo esperable. Escribila en centímetros.";}
function onSubmit(ev){ev.preventDefault();
  var a=parse($("#pa-cin").value),b=parse($("#pa-cad").value),errs=[];
  setErr("#pa-fcin","#pa-ecin","#pa-cin",a.e?msgFor(a,"cintura","72"):"");if(a.e){errs.push("cintura");push("probador_error",{pa_campo:"cintura",pa_tipo_error:a.e});}
  setErr("#pa-fcad","#pa-ecad","#pa-cad",b.e?msgFor(b,"cadera","96"):"");if(b.e){errs.push("cadera");push("probador_error",{pa_campo:"cadera",pa_tipo_error:b.e});}
  var sum=$("#pa-errsum");
  if(errs.length){sum.textContent="Revisá "+(errs.length===2?"las dos medidas":"la medida de "+errs[0])+" para ver tu resultado.";sum.classList.add("pa-show");(a.e?$("#pa-cin"):$("#pa-cad")).focus();return;}
  sum.classList.remove("pa-show");
  calcularDisponibilidad();
  S.cin=a.n;S.cad=b.n;S.res=evaluar(a.n,b.n);S.fit="ajustado";
  if(S.res.tipo==="A"){S.res.baseTalle=S.res.talle;S.res.altTalle=siguienteMasHolgado(S.res.baseTalle,a.n,b.n);}
  S.consent=false;S.msgEdited=false;
  push("probador_submit");
  push("probador_result",{pa_tipo:S.res.tipo,pa_talle:S.res.tipo==="A"?S.res.talle:"",pa_entre_dos:!!S.res.entreDos,pa_dos_opciones:!!(S.res.altTalle)});
  renderRes();show("res"+S.res.tipo);
}
/* Al corregir un campo, su error desaparece (defecto P1 de la auditoría del 18/11). */
function limpiarAlEscribir(id,fid,eid){var el=$(id);el.addEventListener("input",function(){if($(fid).classList.contains("pa-err")){setErr(fid,eid,id,"");if(!$("#pa-fcin").classList.contains("pa-err")&&!$("#pa-fcad").classList.contains("pa-err"))$("#pa-errsum").classList.remove("pa-show");}});}
function rng(a){return a[0]+"–"+a[1]+" cm";}
function renderRes(){var r=S.res;if(!r)return;
  if(r.tipo==="A"){
    var options=$("#pa-fit");options.hidden=!r.altTalle;
    if(r.altTalle){$("#pa-fit-t").textContent="Talle "+r.baseTalle+" · "+dispLabel(r.baseTalle);$("#pa-fit-l").textContent="Talle "+r.altTalle+" · "+dispLabel(r.altTalle);
      $$("[data-fit]",options).forEach(function(b){b.setAttribute("aria-pressed",String(b.getAttribute("data-fit")===S.fit));});}
    var f=fila(r.talle);
    $("#pa-amine").innerHTML="Ingresaste <b>cintura "+S.cin+" cm</b> y <b>cadera "+S.cad+" cm</b>.";
    $("#pa-at").textContent=r.talle;$("#pa-at2").textContent=r.talle;$("#pa-pick").textContent="Elegir talle "+r.talle+" y volver a la ficha";
    $("#pa-ac1").textContent=S.cin+" cm";$("#pa-ac2").textContent=f.cin+" cm";$("#pa-ah1").textContent=S.cad+" cm";$("#pa-ah2").textContent=rng(f.cad);
    renderAvail(r.talle);
    var n=[];if(r.entreDos)n.push("Tu cintura corresponde al talle "+r.cin+" y tu cadera al "+r.cad+". Te sugerimos el más grande, como indica la guía de la ficha.");
    if(r.avisos&&r.avisos.length)n.push((r.avisos.length>1?"Tu cintura y tu cadera son menores que las del talle S":"Tu "+r.avisos[0]+" es menor que la del talle S")+": puede quedarte un poco más holgado. Si preferís, lo hacemos a tu medida, gratis.");
    if(r.altTalle)n.push(S.fit==="holgado"?"Elegiste la opción más holgada de los dos talles compatibles.":"Elegiste la opción más ajustada de los dos talles compatibles.");
    var an=$("#pa-anote");an.textContent=n.join(" ");an.hidden=!n.length;
    /* En la tienda real no se puede elegir un talle sin stock: se oculta el botón y queda la opción a medida. */
    var dd=DISPONIBILIDAD[r.talle];$("#pa-pickwrap").hidden=(!dd||dd.estado==="agotado"||!P.grupo.anchors[r.talle]);
  }
  if(r.tipo==="C"){var f1=fila(r.cin),f2=fila(r.cad),o=[f1,f2].sort(function(x,y){return x.cin-y.cin;});
    $("#pa-cw").textContent=r.cin;$("#pa-ch").textContent=r.cad;$("#pa-cth1").textContent="Talle "+o[0].t;$("#pa-cth2").textContent="Talle "+o[1].t;
    $("#pa-cc0").textContent=S.cin+" cm";$("#pa-ch0").textContent=S.cad+" cm";$("#pa-cc1").textContent=o[0].cin+" cm";$("#pa-cc2").textContent=o[1].cin+" cm";$("#pa-ch1").textContent=rng(o[0].cad);$("#pa-ch2").textContent=rng(o[1].cad);}
}
function renderAvail(t){var el=$("#pa-aavail"),dd=DISPONIBILIDAD[t],c=P.color?" en este color":"";
  if(!dd||dd.estado==="agotado"){el.innerHTML=IC_Q+'<span><b>Talle '+t+' sin stock'+c+'.</b> Te lo hacemos a medida, gratis, o consultanos por WhatsApp.</span>';return;}
  if(dd.estado==="stock")el.innerHTML=IC_OK+'<span><b>Talle '+t+' en stock'+c+'.</b> La ficha confirma la disponibilidad al agregarlo.</span>';
  else el.innerHTML=IC_CLK+'<span><b>Talle '+t+' en preventa.</b> Tu compra activa la confección: 20 días corridos (puede ser antes).</span>';}

/* ===== Elegir talle en la ficha real ===== */
function elegirTalle(){
  if(!S.res||S.res.tipo!=="A")return;
  calcularDisponibilidad();
  var t=S.res.talle,a=P.grupo.anchors[t],dd=DISPONIBILIDAD[t];
  /* Nunca se marca una variante agotada o no comprable, aunque se fuerce el botón. */
  if(!a||!dd||dd.estado==="agotado"){push("probador_select_size",{pa_talle:t,pa_ok:false,pa_motivo:"no_disponible"});renderRes();return;}
  S.picked=t;close();
  var ok=false;
  if(a){try{a.click();ok=true;}catch(e){}}
  setTimeout(function(){
    var marcado=!!(a&&a.classList.contains("selected"));
    push("probador_select_size",{pa_talle:t,pa_ok:marcado,pa_calce:S.res&&S.res.altTalle?S.fit:""});
    try{P.grupo.el.scrollIntoView({behavior:"smooth",block:"center"});}catch(e){}
    toast(marcado?"Talle "+t+" seleccionado. Podés cambiarlo o agregarlo al carrito.":"Elegí el talle "+t+" en el selector de la ficha.");
  },ok?60:0);
}
function toast(t){TOAST.textContent=t;TOAST.classList.add("pa-show");clearTimeout(toast._t);toast._t=setTimeout(function(){TOAST.classList.remove("pa-show");},5000);}

/* ===== WhatsApp ===== */
function waBase(){var p=P.modelo+(P.color?" "+P.color:"");return {base:"¡Hola! Estoy viendo el "+p+" y me gustaría pedirlo a medida. ¿Me ayudan con los próximos pasos? ¡Gracias!",consulta:"¡Hola! Estoy viendo el "+p+" y tengo una duda con el talle. ¿Me ayudan?"};}
function medidasTxt(){var t="cintura "+S.cin+" cm, cadera "+S.cad+" cm";var l=($("#pa-lar").value||"").trim();if(l)t+=", largo total "+l.replace(",",".")+" cm";return t;}
function buildMsg(){var W=waBase(),m=(S.waMode==="consulta"?W.consulta:W.base);if(S.res&&S.res.tipo==="A"&&S.waMode==="consulta")m+=" El probador me sugirió el talle "+S.res.talle+".";if(S.consent&&S.cin&&S.cad)m+="\n\nMis medidas: "+medidasTxt()+".";return m;}
function whatsappUrl(){var message=$("#pa-msg").value.trim();return "https://wa.me/"+CFG.waNumero+"?text="+encodeURIComponent(message||waBase().base);}
function prepWA(){var has=!!(S.cin&&S.cad&&S.res);$("#pa-chkwrap").style.display=has?"flex":"none";
  var custom=S.waMode!=="consulta";$("#pa-wafree").hidden=!custom;$("#pa-waneed").hidden=!custom;$("#pa-flar").hidden=!custom;
  $("#pa-h-wa").textContent=custom?"Tu pedido a medida":"Consultanos por WhatsApp";$("#pa-title").textContent=custom?"Pedido a medida":"WhatsApp";
  $("#pa-chktxt").textContent=has?("Sumar mis medidas al mensaje ("+medidasTxt()+")"):"";
  $("#pa-chk").checked=S.consent;if(!S.msgEdited)$("#pa-msg").value=buildMsg();$("#pa-wabtn").href=whatsappUrl();$("#pa-waphone").href=whatsappUrl();}
function syncMsg(){if(!S.msgEdited)$("#pa-msg").value=buildMsg();
  else{var base=$("#pa-msg").value.replace(/\n\nMis medidas:.*$/,"");$("#pa-msg").value=base+(S.consent?"\n\nMis medidas: "+medidasTxt()+".":"");}
  if(S.cin&&S.cad)$("#pa-chktxt").textContent="Sumar mis medidas al mensaje ("+medidasTxt()+")";
  $("#pa-wabtn").href=whatsappUrl();$("#pa-waphone").href=whatsappUrl();}
function onWaClick(){this.href=whatsappUrl();push("probador_whatsapp_click",{pa_modo:S.waMode,pa_con_medidas:!!S.consent,pa_largo:!!($("#pa-lar").value||"").trim()});}

/* ===== Eventos ===== */
function enlazar(){
  $("#pa-frm").addEventListener("submit",onSubmit);
  ["#pa-cin","#pa-cad"].forEach(function(id){$(id).addEventListener("input",function(){S[id==="#pa-cin"?"cin":"cad"]=this.value;});});
  limpiarAlEscribir("#pa-cin","#pa-fcin","#pa-ecin");limpiarAlEscribir("#pa-cad","#pa-fcad","#pa-ecad");
  $("#pa-pick").addEventListener("click",elegirTalle);
  $("#pa-chk").addEventListener("change",function(){S.consent=this.checked;syncMsg();});
  $("#pa-lar").addEventListener("input",syncMsg);
  $("#pa-msg").addEventListener("input",function(){S.msgEdited=true;$("#pa-wabtn").href=whatsappUrl();$("#pa-waphone").href=whatsappUrl();});
  $("#pa-wabtn").addEventListener("click",onWaClick);$("#pa-waphone").addEventListener("click",onWaClick);
  $("#pa-close").addEventListener("click",function(){close();});
  $("#pa-back").addEventListener("click",back);
  ROOT.addEventListener("click",function(e){
    if(e.target.closest("[data-pa-close]")){close();return;}
    var b=e.target.closest("[data-fit]");
    if(b&&S.res&&S.res.tipo==="A"&&S.res.altTalle){S.fit=b.getAttribute("data-fit");S.res.talle=S.fit==="holgado"?S.res.altTalle:S.res.baseTalle;renderRes();push("probador_fit",{pa_calce:S.fit,pa_talle:S.res.talle});return;}
    var g=e.target.closest("[data-go]");
    if(g){var go=g.getAttribute("data-go");if(go==="wa"){S.waMode=g.getAttribute("data-wa-mode")||"medida";S.msgEdited=false;}show(go);if(go==="measure"){$("#pa-cin").value=S.cin;$("#pa-cad").value=S.cad;}}
  });
  ROOT.addEventListener("keydown",function(e){
    if(e.key==="Escape"){e.preventDefault();close();return;}
    if(e.key!=="Tab")return;
    var f=$$('button,input,textarea,a[href],[tabindex="-1"]',$(".pa-dlg")).filter(function(el){return el.offsetParent!==null&&!el.closest("[hidden]")&&el.tabIndex>=0;});
    if(!f.length)return;var first=f[0],last=f[f.length-1];
    if(e.shiftKey&&d.activeElement===first){e.preventDefault();last.focus();}
    else if(!e.shiftKey&&d.activeElement===last){e.preventDefault();first.focus();}
  });
  d.addEventListener("click",function(e){var o=e.target.closest&&e.target.closest("[data-pa-open]");if(o){e.preventDefault();open(o,o.getAttribute("data-pa-open"));}});
  w.addEventListener("popstate",function(){if(isOpen)close(true);});
}

/* ===== Arranque ===== */
function iniciar(){
  var off=apagado();if(off){log("apagado:",off);return {ok:false,motivo:"apagado:"+off};}
  P.id=productId();
  if(!P.id||CFG.productIds.map(Number).indexOf(P.id)<0){log("ficha fuera del piloto",P.id);return {ok:false,motivo:"ficha_no_incluida"};}
  P.form=d.getElementById("product_form");
  if(!P.form){log("sin #product_form");return {ok:false,motivo:"sin_formulario"};}
  P.grupo=leerGrupo(P.form);
  if(!P.grupo){log("sin selector de talle S/M/L/XL");return {ok:false,motivo:"sin_selector_talle"};}
  if(d.querySelector("[data-pa-acc]")){return {ok:false,motivo:"ya_insertado"};}
  P.variants=leerVariantes(P.form);leerNombre();calcularDisponibilidad();
  ROOT=d.createElement("div");ROOT.className="pa-root";ROOT.id="pa-root";ROOT.setAttribute("data-pa-version",VERSION);ROOT.innerHTML=plantilla();
  TOAST=d.createElement("div");TOAST.className="pa-toast";TOAST.setAttribute("role","status");TOAST.setAttribute("aria-live","polite");
  d.body.appendChild(ROOT);d.body.appendChild(TOAST);
  enlazar();
  var accesos=[];
  P.grupo.el.insertAdjacentElement("afterend",accSuperior());accesos.push("superior");
  var pi=puntoInferior();if(pi){pi.insertAdjacentElement("afterend",accInferior());accesos.push("inferior");}
  updateAccessLabels();
  push("probador_ready",{pa_accesos:accesos.join(",")});
  log("listo",VERSION,accesos,DISPONIBILIDAD);
  return {ok:true,accesos:accesos};
}
function quitar(){try{d.querySelectorAll("[data-pa-acc]").forEach(function(n){n.remove();});if(ROOT)ROOT.remove();if(TOAST)TOAST.remove();d.documentElement.classList.remove("pa-lock");}catch(e){}}

var resultado={ok:false,motivo:"no_iniciado"};
try{resultado=iniciar();}catch(e){quitar();resultado={ok:false,motivo:"error:"+(e&&e.message)};try{console.warn("[Probador Alazán] desactivado por error:",e);}catch(_){}}
w.ProbadorAlazan={version:VERSION,estado:resultado,disponibilidad:DISPONIBILIDAD,motor:M,quitar:quitar,_S:S};
})(window,document);
