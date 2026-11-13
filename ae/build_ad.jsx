/* ================================================================
   MOTION//MEDIA  —  "VIEWS"  TikTok Ad Spot (Apple-Style)
   1080x1920 / 30fps / ~21s / clean motion graphics, kein 3D-Grid
   Fokus: nur VIEWS + BRAND promoten
   Executive script by OpenCode. Run in AE: File > Scripts > Run Script File...
=============================================================== */

// ---- config ----
var W = 1080, H = 1920, FPS = 30, DUR = 21.0;
var AEP = "C:/Users/gamer/Documents/MotionMedia/MOTIONMEDIA_AD.aep";
var FONT_MAIN = "Segoe UI";   // Apple-artige Gestalt; Fallback unten
var FONT_MONO = "Consolas";   // Ziffern / Ticker
var CYAN = [0.00, 0.899, 1.00];
var WHITE = [1, 1, 1];
var BLACK = [0, 0, 0];

// ---- typografische Szene (jede Szene ~2.55s, 9 Frames Crossfade via BG) ----
// [tStart, tEnd, bg ("w"=weiss / "b"=schwarz), Text, fontSize, Farbe "b"/"w"]
var SHOTS = [
  [3.40, 6.55, "w", "Deine Videos.",   140, "b"],
  [6.55, 9.70, "b", "Unsere Motion.",  140, "w"],
  [9.70,12.85, "w", "Mehr Views.",     150, "b"],
  [12.85,16.20,"b", "Mehr Brand.",     150, "w"]
];
var T_ENDCARD = 16.20;

// ---- log ----
var LOG = new File("C:/Users/gamer/Documents/MotionMedia/ae/build_ad.log");
var logLines = [];
function logit(s){ logLines.push(s); }
try{ var L0 = new File("C:/Users/gamer/Documents/MotionMedia/ae/build_ad.log");
     if(L0.open("w")){ L0.write("SCRIPT START\n"); L0.close(); } }catch(e){}

try{
  app.beginUndoGroup("MOTION//MEDIA AD build");
  try{ app.beginSuppressDialogs(); }catch(e){}

  app.newProject();
  var folder = app.project.items.addFolder("MOTION//MEDIA AD");

  // ---------- comp ----------
  var comp = app.project.items.addComp("MOTIONMEDIA_AD_1080x1920", W, H, 1, DUR, FPS);
  comp.parentFolder = folder;
  comp.bgColor = BLACK;
  comp.motionBlur = true;
  comp.motionBlurSamples = 4;
  try{ comp.openInViewer(); }catch(e){}

  // ---------- BG solid (schwarz, Basis) ----------
  var bgB = comp.layers.addSolid([0.02,0.02,0.03], "BG_BLACK", W, H, 1);
  try{ bgB.moveToBottom(); }catch(e){}

  // ---------- CTRL layer (animierte VIEWS-Zahl) ----------
  var ctrl = comp.layers.addNull(); ctrl.name = "CTRL";
  var TARGET = 1412559; // <- deine Zahl, einfach aendern + neubauen
  var fx = gp(ctrl, ["ADBE Effect Parade","Effects"]);
  var sl = fx.addProperty("ADBE Slider Control");
  sl.name = "VIEWS";
  var slv = gp(sl, ["ADBE Slider Control-0001","Slider"]);
  slv.setValueAtTime(0.45, 0);
  slv.setValueAtTime(2.55, TARGET);
  slv.setValueAtTime(DUR, TARGET);
  easeKey(slv);
  try{ ctrl.shy = true; }catch(e){}
  logit("views target: " + TARGET);

  // ---------- Ticker-Streifen (Hintergrund, Zahlen laufen) ----------
  addTicker("TICKER_TOP", 330,  1, 0.14);
  addTicker("TICKER_BOT", 1450, -1, 0.10);
  logit("tickers ok");

  // ---------- Szene 0: VIEWS-COUNTER (Hook) ----------
  var cntDoc = new TextDocument();
  cntDoc.text = "1.412.559";
  cntDoc.fontSize = 200;
  try{ cntDoc.font = FONT_MAIN; }catch(e){ cntDoc.font = "Arial"; }
  try{ cntDoc.applyFauxBold = true; }catch(e){}
  cntDoc.fillColor = WHITE;
  try{ cntDoc.justification = ParagraphJustification.CENTER_JUSTIFY; }catch(e){}
  try{ cntDoc.tracking = -20; }catch(e){}
  var cnt = comp.layers.addText(cntDoc);
  cnt.name = "VIEWS_COUNTER";
  var cntSt = cnt.property("ADBE Text Properties").property("ADBE Text Document");
  // animierte Zahl, formatiert mit Tausenderpunkten
  cntSt.expression =
    "var p=thisComp.layer('CTRL').effect('VIEWS')('Slider');" +
    "var n=Math.round(p); var s=''+n; var o='';" +
    "while(s.length>3){ o='.'+s.substring(s.length-3)+o; s=s.substring(0,s.length-3); }" +
    "s+o;";
  centerLayer(cnt, W/2, 880);
  gp(cnt, ["ADBE Scale","Scale"]).expression =
    "var t0=0.45; var e=clamp((time-t0)/2.6,0,1); e=1-Math.pow(1-e,4); var s=104-8*e; [s,s];";
  gp(cnt, ["ADBE Opacity","Opacity"]).expression =
    "var i0=clamp((time-0.35)/0.35,0,1); var o1=clamp((3.05-time)/0.35,0,1); 100*Math.min(i0,o1);";
  try{ addGlowTint(cnt, WHITE, 0); }catch(e){}

  var lbDoc = new TextDocument();
  lbDoc.text = "ANSICHTEN. LETZTE 30 TAGE.";
  lbDoc.fontSize = 44;
  try{ lbDoc.font = FONT_MONO; }catch(e){ lbDoc.font = "Courier New"; }
  lbDoc.fillColor = CYAN;
  try{ lbDoc.justification = ParagraphJustification.CENTER_JUSTIFY; }catch(e){}
  try{ lbDoc.tracking = 60; }catch(e){}
  var lb = comp.layers.addText(lbDoc);
  lb.name = "COUNTER_LABEL";
  centerLayer(lb, W/2, 1060);
  gp(lb, ["ADBE Opacity","Opacity"]).expression =
    "var i0=clamp((time-1.0)/0.4,0,1); var o1=clamp((3.05-time)/0.35,0,1); 100*Math.min(i0,o1);";

  // ---------- Statements (Apple-Slideshow) ----------
  for(var i=0; i<SHOTS.length; i++){
    var sh = SHOTS[i];
    var t0 = sh[0], t1 = sh[1];

    // weisser BG pro Shots
    if(sh[2] === "w"){
      var ws = comp.layers.addSolid(WHITE, "BG_WHITE_"+(i+1), W, H, 1);
      gp(ws, ["ADBE Opacity","Opacity"]).expression =
        "var t0=" + ff(t0) + ", t1=" + ff(t1) + ";" +
        "var i0=clamp((time-t0+0.14)/0.28,0,1); var o1=clamp((t1-time+0.14)/0.28,0,1); 100*Math.min(i0,o1);";
      try{ ws.moveToBottom(); }catch(e){}
    }

    // Statement-Text
    var doc = new TextDocument();
    doc.text = sh[3];
    doc.fontSize = sh[4];
    try{ doc.font = FONT_MAIN; }catch(e){ doc.font = "Arial"; }
    try{ doc.applyFauxBold = true; }catch(e){}
    doc.fillColor = (sh[5] === "b") ? BLACK : WHITE;
    try{ doc.justification = ParagraphJustification.CENTER_JUSTIFY; }catch(e){}
    try{ doc.tracking = -30; }catch(e){}
    var t = comp.layers.addText(doc);
    t.name = "S" + (i+1);
    // langsamer Apple-Push: sanfter Dolly in den Text
    var push =
      "var t0=" + ff(t0) + ", t1=" + ff(t1) + ", d=(t1-t0);" +
      "var e=clamp((time-t0)/d,0,1); e=1-Math.pow(1-e,4);" +
      "var s=" + (sh[4]*0.92 + 12) + " - 8*e; [s,s,100];";
    gp(t, ["ADBE Scale","Scale"]).expression = push;
    gp(t, ["ADBE Opacity","Opacity"]).expression =
      "var t0=" + ff(t0) + ", t1=" + ff(t1) + ";" +
      "var i0=clamp((time-t0)/0.30,0,1); var o1=clamp((t1-time)/0.30,0,1); 100*Math.min(i0,o1);";
    gp(t, ["ADBE Position","Position"]).expression =
      "var t0=" + ff(t0) + ", t1=" + ff(t1) + ", d=(t1-t0);" +
      "var e=clamp((time-t0)/d,0,1); e=1-Math.pow(1-e,4);" +
      "[" + (W/2) + ", " + (860 + (i%2)*70) + " + e*22, 0];";
    // minimal Drift? Apple: nein. Nur Push. Done.

    // Cyan-Balken unter "Mehr Views."
    if(sh[3].indexOf("Views") !== -1){
      var bar = comp.layers.addSolid(CYAN, "ACCENT_BAR", 620, 10, 1);
      gp(bar, ["ADBE Position","Position"]).setValue([W/2, 965, 0]);
      gp(bar, ["ADBE Anchor Point","Anchor Point"]).setValue([310, 5, 0]);
      gp(bar, ["ADBE Scale","Scale"]).expression =
        "var t0=" + ff(t0+0.35) + "; var e=clamp((time-t0)/0.45,0,1); e=1-Math.pow(1-e,4); [100*e, 100, 100];";
      gp(bar, ["ADBE Opacity","Opacity"]).expression =
        "var t0=" + ff(t0) + ", t1=" + ff(t1) + ";" +
        "var i0=clamp((time-t0)/0.3,0,1); var o1=clamp((t1-time)/0.3,0,1); 100*Math.min(i0,o1);";
    }
  }

  // ---------- Endcard ----------
  var eDoc = new TextDocument();
  eDoc.text = "MOTION//MEDIA";
  eDoc.fontSize = 110;
  try{ eDoc.font = FONT_MAIN; }catch(e){ eDoc.font = "Arial"; }
  try{ eDoc.applyFauxBold = true; }catch(e){}
  eDoc.fillColor = WHITE;
  try{ eDoc.justification = ParagraphJustification.CENTER_JUSTIFY; }catch(e){}
  try{ eDoc.tracking = 20; }catch(e){}
  var endL = comp.layers.addText(eDoc);
  endL.name = "ENDCARD_LOGO";
  centerLayer(endL, W/2, 900);
  gp(endL, ["ADBE Scale","Scale"]).expression =
    "var t0=" + ff(T_ENDCARD) + "; var e=clamp((time-t0)/0.5,0,1); e=1-Math.pow(1-e,4); var s=110-10*e; [s,s];";
  gp(endL, ["ADBE Opacity","Opacity"]).expression =
    "var t0=" + ff(T_ENDCARD) + "; 100*clamp((time-t0)/0.35,0,1);";
  try{ addGlowTint(endL, WHITE, 0); }catch(e){}

  var s1Doc = new TextDocument();
  s1Doc.text = "VIEWS. BRAND. MOTION.";
  s1Doc.fontSize = 48;
  try{ s1Doc.font = FONT_MONO; }catch(e){ s1Doc.font = "Courier New"; }
  s1Doc.fillColor = CYAN;
  try{ s1Doc.justification = ParagraphJustification.CENTER_JUSTIFY; }catch(e){}
  try{ s1Doc.tracking = 70; }catch(e){}
  var s1 = comp.layers.addText(s1Doc);
  s1.name = "ENDCARD_SUB";
  centerLayer(s1, W/2, 1085);
  gp(s1, ["ADBE Opacity","Opacity"]).expression =
    "var t0=" + ff(T_ENDCARD+0.25) + "; 100*clamp((time-t0)/0.35,0,1);";

  var s2Doc = new TextDocument();
  s2Doc.text = "@motionmedia  ·  mehr views. mehr brand.";
  s2Doc.fontSize = 36;
  try{ s2Doc.font = FONT_MONO; }catch(e){ s2Doc.font = "Courier New"; }
  s2Doc.fillColor = [0.62,0.62,0.68];
  try{ s2Doc.justification = ParagraphJustification.CENTER_JUSTIFY; }catch(e){}
  try{ s2Doc.tracking = 30; }catch(e){}
  var s2 = comp.layers.addText(s2Doc);
  s2.name = "ENDCARD_HANDLE";
  centerLayer(s2, W/2, 1490);
  gp(s2, ["ADBE Opacity","Opacity"]).expression =
    "var t0=" + ff(T_ENDCARD+0.5) + "; 100*clamp((time-t0)/0.35,0,1);";

  // ---------- finalize ----------
  app.project.save(new File(AEP));
  try{ app.endSuppressDialogs(false); }catch(e){}
  app.endUndoGroup();
  logit("PROJECT SAVED");
}catch(outer){
  logit("FATAL: " + outer + " line " + outer.line);
}

LOG.encoding = "UTF-8";
if(LOG.open("w")){
  LOG.write(logLines.join("\n"));
  LOG.close();
}
alert("MOTION//MEDIA AD Spot gebaut!\n\nProjekt: MOTIONMEDIA_AD.aep\nLog: ae/build_ad.log", "MOTION//MEDIA");

/* ================= helpers ================= */

function ff(n){ return n.toFixed(3); }

function gp(obj, names){
  for(var i=0; i<names.length; i++){
    try{ var p = obj.property(names[i]); if(p) return p; }catch(e){}
  }
  return null;
}

function centerLayer(L, x, y){
  try{
    gp(L, ["ADBE Position","Position"]).setValue([x, y, 0]);
    var r = L.sourceRectAtTime(0.2, false);
    gp(L, ["ADBE Anchor Point","Anchor Point"]).setValue([r.left + r.width/2, r.top + r.height/2, 0]);
  }catch(e){ logit("center fail " + L.name + " " + e); }
}

function easeKey(prop){
  try{
    for(var i=1; i<=prop.numKeys; i++){
      var e = [new KeyframeEase(0.0, 80)];
      prop.setTemporalEaseForKey(i, e, e);
    }
  }catch(e){}
}

function addGlowTint(L, col, amt){
  var fx = gp(L, ["ADBE Effect Parade","Effects"]);
  var g = fx.addProperty("ADBE Glow");
  gp(g, ["ADBE Glow-0001","Glow Radius"]).setValue(14);
  gp(g, ["ADBE Glow-0002","Glow Intensity"]).setValue(0.7);
}

function addTicker(name, y, dir, op){
  var doc = new TextDocument();
  doc.text = "1.247.901   88.442   2.401.117   612.880   91.007   3.887.220   154.600   " +
             "1.247.901   88.442   2.401.117   612.880   91.007   3.887.220   154.600";
  doc.fontSize = 52;
  try{ doc.font = FONT_MONO; }catch(e){ doc.font = "Courier New"; }
  doc.fillColor = [0.85,0.85,0.9];
  try{ doc.justification = ParagraphJustification.LEFT_JUSTIFY; }catch(e){}
  try{ doc.tracking = 40; }catch(e){}
  var t = comp.layers.addText(doc);
  t.name = name;
  gp(t, ["ADBE Position","Position"]).expression =
    "var sp=" + dir + "*70; var w=3000; var x=" + (dir>0 ? "(time*sp) % w" : "w - ((time*-sp) % w)") + "; [x-1500, " + y + ", 0];";
  gp(t, ["ADBE Opacity","Opacity"]).expression =
    "var base=" + (op*100) + ";" +
    "var i0=clamp((time-0.3)/0.5,0,1); var o1=clamp((3.05-time)/0.35,0,1);" +
    "base*Math.min(i0,o1);";
  try{ t.shy = false; }catch(e){}
}
