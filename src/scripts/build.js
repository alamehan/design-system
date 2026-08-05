/**
 * E-Systems Design System — single build step.
 * Run from anywhere:  node src/scripts/build.js   (via src/scripts/release.js)
 *
 * SOURCES OF TRUTH (edit these):
 *   - src/foundations.json          (tokens)
 *   - src/components/<code>-*.json    (component & page specs)
 * GENERATED (never edit — produced here):
 *   - dist/tailwind.preset.js
 *   - dist/variables.css
 *   - catalog/catalog.md
 *   - catalog/index.json (items + counts)
 * Then validates that every component token reference resolves in foundations.
 */
const fs=require('fs'),path=require('path');
const SCRIPTS=__dirname;                     // design-system/src/scripts
const SRC=path.resolve(SCRIPTS,'..');        // design-system/src   (edit here)
const DS=path.resolve(SCRIPTS,'..','..');    // design-system/       (root)
const COMP=path.join(SRC,'components');
const DIST=path.join(DS,'dist');
const CAT=path.join(DS,'catalog');
fs.mkdirSync(DIST,{recursive:true});fs.mkdirSync(CAT,{recursive:true});
const f=JSON.parse(fs.readFileSync(path.join(SRC,'foundations.json'),'utf8'));
const V='$value';
function getPath(root,p){let c=root;for(const s of p.split('.')){if(c&&typeof c==='object'&&s in c)c=c[s];else return undefined;}return c;}
function resolveVal(val,depth){depth=depth||0;if(depth>12)return val;if(typeof val==='string'){const m=val.match(/^\{(.+)\}$/);if(m){const node=getPath(f,m[1]);if(node&&typeof node==='object'&&V in node)return resolveVal(node[V],depth+1);return val;}return val;}return val;}
function dim(v){if(v&&typeof v==='object'&&'value'in v)return v.value+(v.unit||'px');return String(v);}
const colorVars={},colorClasses={};
function walkColors(theme,store){(function rec(node,p){if(node&&typeof node==='object'){if(node['$type']==='color'&&V in node){store(p,resolveVal(node[V]));return;}for(const k in node){if(k==='$description')continue;rec(node[k],p.concat(k));}}})(theme,[]);}
const light=f.semantic&&f.semantic.light,dark=f.semantic&&f.semantic.dark;
if(light)walkColors(light,(p,val)=>{const key=p.join('-'),vn='--color-'+key;colorVars[vn]=colorVars[vn]||{};colorVars[vn].light=val;colorClasses[key]='var('+vn+')';});
if(dark)walkColors(dark,(p,val)=>{const key=p.join('-'),vn='--color-'+key;colorVars[vn]=colorVars[vn]||{};colorVars[vn].dark=val;colorClasses[key]=colorClasses[key]||('var('+vn+')');});
['color-original','color-extend','color-others'].forEach(grp=>{const g=f[grp];if(!g)return;(function rec(node,p){if(node&&typeof node==='object'){if(node['$type']==='color'&&V in node){const key=p.join('-');if(!(key in colorClasses))colorClasses[key]=resolveVal(node[V]);return;}for(const k in node){if(k==='$description')continue;rec(node[k],p.concat(k));}}})(g,[]);});
const badNames=Object.keys(colorVars).filter(v=>!/^--[A-Za-z0-9_-]+$/.test(v)).concat(Object.keys(colorClasses).filter(k=>!/^[A-Za-z0-9_-]+$/.test(k)));
if(badNames.length){console.error('INVALID TOKEN NAMES (letters, digits, hyphen, underscore only; fix in foundations.json): '+badNames.join(', '));process.exit(1);}
const spacing={};const sp=f.spacing||{};for(const variant in sp){if(variant==='$description')continue;const grp=sp[variant];for(const name in grp){if(name==='$description')continue;const n=grp[name];if(n&&V in n)spacing[variant==='standard'?name:variant+'-'+name]=dim(n[V]);}}
function dmap(grpName,skip){const out={};const g=f[grpName]||{};for(const k in g){if(k==='$description')continue;if(skip&&skip(k))continue;const n=g[k];if(n&&V in n)out[k]=dim(n[V]);}return out;}
const borderRadius=dmap('corner-radius',k=>k.startsWith('figma'));
const fontSize=dmap('font-size');const lineHeight=dmap('line-height');const letterSpacing=dmap('letter-spacing');const borderWidth=dmap('stroke');const blur=dmap('blur');
const ff=f['font-family']||{};const fam=x=>{const n=ff[x];if(!n)return [];const v=n[V];return Array.isArray(v)?v:[v];};
const fallback=fam('fallback').length?fam('fallback'):['ui-sans-serif','system-ui','sans-serif'];
const fontFamily={sans:fam('primary').concat(fallback),mono:fam('mono').concat(['ui-monospace','monospace'])};
function shadowStr(node){let v=node[V];const layers=Array.isArray(v)?v:[v];return layers.map(l=>{const ins=l.inset?'inset ':'';return ins+dim(l.offsetX)+' '+dim(l.offsetY)+' '+dim(l.blur)+' '+dim(l.spread)+' '+l.color;}).join(', ');}
const boxShadow={};const sh=f.shadow||{};for(const k in sh){if(k==='$description')continue;const n=sh[k];if(n&&V in n){let s=shadowStr(n);if(k==='Inner'&&!/inset/.test(s))s='inset '+s;boxShadow[k]=s;}}
const theme={colors:colorClasses,spacing,borderRadius,fontSize,lineHeight,letterSpacing,fontFamily,boxShadow,borderWidth,blur};
fs.writeFileSync(path.join(DIST,'tailwind.preset.js'),'/** GENERATED from src/foundations.json by src/scripts/build.js \u2014 do not edit. Run `node src/scripts/build.js`. */\nmodule.exports = {\n  darkMode: "class",\n  theme: { extend: '+JSON.stringify(theme,null,2).replace(/\n/g,'\n  ')+' }\n};\n');
let lrows=[],drows=[];for(const vn in colorVars){const o=colorVars[vn];lrows.push('  '+vn+': '+(o.light!=null?o.light:o.dark)+';');if(o.dark!=null&&o.dark!==o.light)drows.push('  '+vn+': '+o.dark+';');}
// non-color token scales as CSS vars (so framework-agnostic components \u2014 e.g. adapters/vue \u2014 need no Tailwind)
const scaleRows=[];
for(const k in spacing)scaleRows.push('  --space-'+k+': '+spacing[k]+';');
for(const k in borderRadius)scaleRows.push('  --radius-'+k+': '+borderRadius[k]+';');
for(const k in boxShadow)scaleRows.push('  --shadow-'+k+': '+boxShadow[k]+';');
for(const k in borderWidth)scaleRows.push('  --stroke-'+k+': '+borderWidth[k]+';');
let css='/* GENERATED from src/foundations.json by src/scripts/build.js \u2014 do not edit. */\n:root {\n'+lrows.concat(scaleRows).join('\n')+'\n}\n\n.dark {\n'+drows.join('\n')+'\n}\n';
const qf=n=>/[^A-Za-z0-9-]/.test(n)?'"'+n+'"':n;const fontStack=n=>[n].concat(fallback).map(qf).join(', ');
let tss='';const txt=f['text-styles']||{};for(const w in txt){if(w==='$description')continue;for(const s in txt[w]){const n=txt[w][s];if(n&&V in n){const t=n[V];tss+='.ts-'+w+'-'+s+' {\n  font-family: '+fontStack(t.fontFamily)+';\n  font-weight: '+t.fontWeight+';\n  font-size: '+dim(t.fontSize)+';\n  line-height: '+dim(t.lineHeight)+';\n  letter-spacing: '+dim(t.letterSpacing)+';\n}\n';}}}
css+='\n/* Text styles (composite) */\n'+tss;
fs.writeFileSync(path.join(DIST,'variables.css'),css);
const specFiles=fs.readdirSync(COMP).filter(x=>/^(atom|layout|composite|panel|asset|page)-.*\.json$/.test(x)).sort();
const refRe=/^[a-z][a-z0-9-]*(?:\.[a-z0-9-]+)+$/i;
function tokenRefs(t){const set=new Set();(function w(o){if(o&&typeof o==='object'){for(const k in o){const v=o[k];if(typeof v==='string'){if(refRe.test(v)&&v.includes('.')&&!/\s/.test(v))set.add(v);}else w(v);}}})(t);return [...set];}
const toClass=r=>r.replace(/\./g,'-');
let out='# E-Systems Design System \u2014 Catalog (AI grounding digest)\n\n';
out+='> GENERATED by src/scripts/build.js from src/components/*.json \u2014 do not edit. Run `node src/scripts/build.js` to regenerate.\n\n';
out+='Read this ONE file fully before building UI. It lists every component (props, states, tokens) and the tokens you may use. Use the EXACT class shown for each token in the vocabulary below (format: token \u2192 class) \u2014 do NOT derive class names mechanically; spacing and text styles do not follow a simple a-b-c rule. Color tokens take a role prefix (bg-/text-/border-). For exact code or deep detail of a component, open its full spec at `src/components/<code>-*.json`.\n\n';
const allRefs=new Set();
const specs=specFiles.map(fn=>{const d=JSON.parse(fs.readFileSync(path.join(COMP,fn),'utf8'));d.__file=fn;if(d.tokens)tokenRefs(d.tokens).forEach(r=>allRefs.add(r));return d;});
out+='## Token vocabulary (the ONLY tokens in use \u2014 do not invent others)\n';
const grouped={};[...allRefs].sort().forEach(r=>{const g=r.split('.')[0];(grouped[g]=grouped[g]||[]).push(r);});
function classesFor(r){const p=r.split('.');const g=p[0];if(g==='spacing')return 'p-'+p[2]+' / m-'+p[2]+' / gap-'+p[2];if(g==='corner-radius')return 'rounded-'+p[1];if(g==='shadow')return 'shadow-'+p[1];if(g==='stroke')return 'border-'+p[1]+' (border-width)';if(g==='blur')return 'blur-'+p[1];if(g==='text-styles')return '.ts-'+p.slice(1).join('-');if(g==='font-size')return 'text-'+p[1];if(g==='line-height')return 'leading-'+p[1];if(g==='letter-spacing')return 'tracking-'+p[1];return '{bg|text|border}-'+r.replace(/\./g,'-');}
for(const g of Object.keys(grouped).sort()){out+='- **'+g+'**: '+grouped[g].map(r=>'`'+r+'` \u2192 `'+classesFor(r)+'`').join(' \u00b7 ')+'\n';}
out+='\n---\n\n';
const CATASSET={'asset-01-avatar.json':['avatars','variant'],'asset-02-option-menu.json':['option-menus','type'],'asset-03-character-expression.json':['characters','type'],'asset-04-animated-illustration.json':['illustrations','type'],'asset-05-complex-illustration.json':['illustrations','type'],'asset-08-icon-custom.json':['icons-custom','name'],'asset-09-logo.json':['logos','type']};
function fileLine(fn,d){if(fn==='asset-06-icon-tabler.json'||fn==='asset-07-icon-tabler-extended.json')return '**Files:** none needed \u2014 icons render from `@iconify-json/tabler` as `i-tabler-<name>` classes (prepend your repo\'s Tailwind prefix if it has one, e.g. `tw-i-tabler-<name>`).';const m=CATASSET[fn];if(!m)return null;const variants=(((d.props||{})[m[1]]||{}).values)||[];if(!variants.length)return null;const dir=path.join(SRC,'assets',m[0]);const files=fs.existsSync(dir)?fs.readdirSync(dir).filter(x=>/\.(svg|png|gif)$/i.test(x)).map(x=>x.replace(/\.[^.]+$/,'')):[];const shipped=variants.filter(v=>files.includes(v));const missing=variants.filter(v=>!files.includes(v));if(!missing.length)return '**Files:** '+shipped.length+'/'+variants.length+' shipped \u2014 every variant has a real file.';if(!shipped.length)return '**Files:** 0/'+variants.length+' shipped \u2014 catalog names only (no asset files exist for this set); NEVER reference files for it.';return '**Files:** '+shipped.length+'/'+variants.length+' shipped \u2014 '+(shipped.length<=missing.length?('ONLY these variants have files: '+shipped.join(', ')+'. NEVER reference files for the others.'):('all EXCEPT: '+missing.join(', ')+' (no files \u2014 never reference these).'));}
/* refLine — point every catalog entry at its rendered visual truth.
 * Until v3.4.4 a catalog spec listed its tokens and its JSON path and stopped there, so an AI
 * agent grounding on catalog/components/<code>.md was never told that a pixel-accurate HTML+CSS
 * implementation of that exact component exists. The gallery calls itself "the visual truth for
 * all components"; that claim is only actionable if the catalog links to it. */
const GALLERY_DERIVED = (() => {
  const g = path.join(DS, 'reference', 'gallery.html');
  if (!fs.existsSync(g)) return new Set();
  return new Set([...fs.readFileSync(g, 'utf8').matchAll(/id="([^"]+)"[^>]*data-derived="true"/g)].map(m => m[1]));
})();
const GALLERY_IDS = (() => {
  const g = path.join(DS, 'reference', 'gallery.html');
  if (!fs.existsSync(g)) return new Set();
  return new Set([...fs.readFileSync(g, 'utf8').matchAll(/<(?:section|div) class="ref-section" id="([^"]+)"/g)].map(m => m[1]));
})();
/* Umbrella specs: their renderings ship under the names of their concrete variants, so an
   id-for-filename lookup reports "none yet" while three complete renderings sit in the folder.
   An agent asking for FormControl was being told nothing existed when checkbox, radio and
   switch were all there — a grounding gap created by a naming convention, not by missing work. */
const REF_ALIASES = {
  "form-control": ["checkbox", "radio", "switch"],
  "form-input-field": ["input", "textarea"],
};
/* Asset specs are inventories of shipped files, not components. Telling an agent to "compose
   from atoms" when it asked about the Logo is worse than saying nothing. */
const ASSET_DIRS = {
  "option-menu": "src/assets/option-menus/",
  "character-expression": "src/assets/character-expressions/",
  "animated-illustration": "src/assets/animated-illustrations/",
  "complex-illustration": "src/assets/complex-illustrations/",
  "icon-tabler": "src/assets/icons-tabler/",
  "icon-tabler-extended": "src/assets/icons-tabler-extended/",
  "icon-custom": "src/assets/icons-custom/",
  "logo": "src/assets/logos/",
};
function refLine(d) {
  const id = d.id;
  if (!id) return null;
  if (ASSET_DIRS[id]) {
    const dir = ASSET_DIRS[id];
    const real = fs.existsSync(path.join(DS, dir));
    return "**Reference:** this spec is an ASSET INVENTORY, not a component \u2014 the truth is the files in `" +
      dir + "`" + (real ? "" : " (not exported yet)") +
      ". See the **Files:** coverage line above and reference an asset by path; never invent a filename.";
  }
  const out = [];
  for (const alias of REF_ALIASES[id] || []) {
    if (fs.existsSync(path.join(DS, "reference", "components", alias + ".html")))
      out.push("`reference/components/" + alias + ".html`");
    if (GALLERY_IDS.has(alias)) out.push("`reference/gallery.html#" + alias + "`");
  }
  if (fs.existsSync(path.join(DS, 'reference', 'components', id + '.html'))) out.push('`reference/components/' + id + '.html`');
  if (GALLERY_IDS.has(id)) out.push('`reference/gallery.html#' + id + '`');
  if (fs.existsSync(path.join(DS, 'reference', 'pages', id + '.html'))) out.push('`reference/pages/' + id + '.html`');
  /* A rendering built from spec JSON is real, usable and NOT the same thing as a design the
     author has approved. Say which it is, every time, so an agent copying it knows what it has. */
  if (out.length && GALLERY_DERIVED.has(id))
    return '**Reference (DERIVED \u2014 pending design review):** ' + out.join(' \u00b7 ') +
      '  \u2014 built from this spec\u2019s own tokens and anatomy, token-pure and gate-clean, but NOT yet checked against Figma. ' +
      'Safe to build on; expect the designer to adjust layout details.';
  if (!out.length) return '**Reference:** none yet \u2014 no rendered implementation exists for this spec. Compose from atoms (CLAUDE.md \u00a72) and do NOT invent one.';
  return '**Reference:** ' + out.join(' \u00b7 ') + '  \u2014 copy the structure and class names from here; it is token-pure and spec-true.';
}
for(const d of specs){out+='## '+(d.code||'')+' \u2014 '+(d.name||d.__file)+'  _('+(d.category||'')+')_\n';if(d.description)out+=d.description+'\n';if(d.props&&Object.keys(d.props).length){out+='**Props:** ';const ps=[];for(const pk in d.props){const p=d.props[pk];let s=pk;if(p&&p.type==='enum'&&Array.isArray(p.values))s+='='+p.values.join('|');else if(p&&p.type)s+=':'+p.type;if(p&&p.default!==undefined)s+=' (def '+p.default+')';ps.push(s);}out+=ps.join('; ')+'\n';}if(d.tokens){const tr=tokenRefs(d.tokens);if(tr.length)out+='**Tokens:** '+tr.join(', ')+'  \u2014 class per token: see Token vocabulary\n';}const fl=fileLine(d.__file,d);if(fl)out+=fl+'\n';const rl=refLine(d);if(rl&&!d.__file.startsWith('page-'))out+=rl+'\n';out+='**Spec:** `src/components/'+d.__file+'`\n\n';}
fs.writeFileSync(path.join(CAT,'catalog.md'),out);
const idxPath=path.join(CAT,'index.json');
const idx=JSON.parse(fs.readFileSync(idxPath,'utf8'));
idx.items=specs.map(d=>({code:d.code,name:d.name,type:(d.__file.startsWith('page-')?'page':'component'),category:d.category,figmaNodeId:d.figmaNodeId,description:d.description,file:'src/components/'+d.__file}));
idx.totalComponents=idx.items.filter(i=>i.type==='component').length;idx.totalPages=idx.items.filter(i=>i.type==='page').length;
const VER=JSON.parse(fs.readFileSync(path.join(DS,'version.json'),'utf8')).version;idx.version=VER;const prevItems=JSON.stringify(JSON.parse(fs.existsSync(idxPath)?fs.readFileSync(idxPath,'utf8'):'{}').items||null);if(prevItems!==JSON.stringify(idx.items)||!idx.generatedAt)idx.generatedAt=new Date().toISOString().slice(0,10);idx.designSystem='E-Systems Design System (Elabram)';
fs.writeFileSync(idxPath,JSON.stringify(idx,null,2)+'\n');
const roots=[f,f.semantic&&f.semantic.light,f.semantic&&f.semantic.dark].filter(Boolean);
function exists(ref){for(const r of roots){let c=r,ok=true;for(const s of ref.split('.')){if(c&&typeof c==='object'&&s in c)c=c[s];else{ok=false;break;}}if(ok)return true;}return false;}
let total=0,bad={};for(const d of specs){if(!d.tokens)continue;tokenRefs(d.tokens).forEach(v=>{total++;if(!exists(v))bad[v]=(bad[v]||0)+1;});}
const badList=Object.keys(bad);
console.log('preset: '+Object.keys(colorClasses).length+' colors ('+drows.length+' dark overrides)');
console.log('catalog: '+specs.length+' components, '+allRefs.size+' distinct tokens');
console.log('index: '+idx.totalComponents+' components + '+idx.totalPages+' pages');
console.log('validation: '+total+' token refs, '+badList.length+' unresolved');
if(badList.length){console.error('BROKEN REFS: '+badList.join(', '));process.exit(1);}
// --- asset audit: every file under src/assets/<cat> must be named after a catalog variant ---
const ASSETS=path.join(SRC,'assets');
const assetMap=[['avatars','asset-01-avatar.json','variant'],['option-menus','asset-02-option-menu.json','type'],['characters','asset-03-character-expression.json','type'],['illustrations','asset-04-animated-illustration.json','type'],['logos','asset-09-logo.json','type'],['icons-custom','asset-08-icon-custom.json','name']];
let assetBad=[];
if(fs.existsSync(ASSETS)){for(const [folder,specFile,prop] of assetMap){const dir=path.join(ASSETS,folder);if(!fs.existsSync(dir))continue;const sp=path.join(COMP,specFile);const variants=fs.existsSync(sp)?((((JSON.parse(fs.readFileSync(sp,'utf8')).props)||{})[prop]||{}).values||[]):[];const files=fs.readdirSync(dir).filter(x=>/\.(svg|png|gif)$/i.test(x)).map(x=>x.replace(/\.[^.]+$/,''));const unknown=files.filter(f=>!variants.includes(f));const have=files.filter(f=>variants.includes(f)).length;console.log('assets/'+folder+': '+have+'/'+variants.length+' catalog files'+(unknown.length?(' — '+unknown.length+' UNKNOWN: '+unknown.join(', ')):''));unknown.forEach(u=>assetBad.push(folder+'/'+u));}}
if(assetBad.length){console.error('BAD ASSET NAMES (rename to a catalog variant or remove): '+assetBad.join(', '));process.exit(1);}
console.log('BUILD OK');
