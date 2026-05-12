"use strict";var lr=Object.defineProperty;var Lo=Object.getOwnPropertyDescriptor;var Ro=Object.getOwnPropertyNames;var qo=Object.prototype.hasOwnProperty;var _e=(e,r)=>{for(var t in r)lr(e,t,{get:r[t],enumerable:!0})},zo=(e,r,t,u)=>{if(r&&typeof r=="object"||typeof r=="function")for(let o of Ro(r))!qo.call(e,o)&&o!==t&&lr(e,o,{get:()=>r[o],enumerable:!(u=Lo(r,o))||u.enumerable});return e};var Io=e=>zo(lr({},"__esModule",{value:!0}),e);var S0={};_e(S0,{default:()=>cr});module.exports=Io(S0);var G=require("obsidian");var Bo="0.1.0";function qt({frontmatter:e={},warnings:r=[],children:t=[]}={}){return{type:"root",version:Bo,frontmatter:e,warnings:r,children:t}}function F(e,{lang:r=null,warnings:t=[],raw:u=e}={}){let o={type:"code-block",lang:r,value:e};return t.length>0&&(o.warnings=t),u!==void 0&&(o.raw=u),o}var Po=/^[a-zA-Z_][a-zA-Z0-9_]*$/;function T(e=""){let r=[],t={},u=0;for(;u<e.length;){for(;e[u]===" ";)u+=1;if(u>=e.length)break;let o=u;for(;u<e.length&&e[u]!=="="&&e[u]!==" ";)u+=1;let n=e.slice(o,u);if(e[u]!=="="){r.push(n);continue}u+=1;let a="";if(e[u]==='"'){u+=1;let i=u;for(;u<e.length&&e[u]!=='"';)u+=1;a=e.slice(i,u),e[u]==='"'&&(u+=1)}else{let i=u;for(;u<e.length&&e[u]!==" ";)u+=1;a=e.slice(i,u)}t[n]=a}return{positional:r,attrs:t}}function Bt(e,r){let t;switch(e.name){case"chart":t=Ho(e);break;case"grid":t=Oo(e,r);break;case"card":t=jo(e,r);break;case"callout":t=Vo(e,r);break;case"slider":t=Uo(e);break;case"export":t=Zo(e);break;case"flow":t=Go(e);break;case"diff":t=Wo(e);break;case"tabs":t=Ko(e,r);break;case"timeline":t=Yo(e,r);break;case"kanban":t=Qo(e,r);break;case"details":t=en(e,r);break;case"carousel":t=rn(e,r);break;case"embed":t=tn(e);break;case"math":t=un(e);break;default:t=No(e);break}return e.warnings?.length>0&&(t.warnings=[...t.warnings??[],...e.warnings]),t}function No(e){return F(e.raw,{lang:"rmd",raw:e.raw,warnings:[`unknown-block: ${e.name}`]})}function Ho(e){let{positional:r,attrs:t}=T(e.attrText),u=M(t,["title","x","y","y2","legend","tooltip","emphasis"]),o=r[0];if(!["bar","line","pie","scatter","radar","area","donut","heatmap"].includes(o))return F(e.raw,{lang:"rmd",raw:e.raw,warnings:[`chart-invalid-type: ${o??"missing"}`]});let a=[],i=[];for(let s of Nt(e.content)){let d=s.trim().split(/\s+/),l=[];for(;d.length>1&&an(d[d.length-1]);)l.unshift(Number(d.pop()));if(d.length===0||l.length===0){i.push(`chart-invalid-row: ${s}`);continue}a.push({label:d.join(" "),values:l})}if(a.length===0)return F(e.raw,{lang:"rmd",raw:e.raw,warnings:["chart-empty-data"]});let c=Math.min(...a.map(s=>s.values.length));if(a.some(s=>s.values.length!==c)){i.push("chart-series-mismatch");for(let s of a)s.values=s.values.slice(0,c)}return o==="pie"&&c!==1?F(e.raw,{lang:"rmd",raw:e.raw,warnings:["chart-pie-requires-single-series"]}):$(de({type:"chart",chartType:o,title:t.title??null,x:t.x??null,y:t.y??null,y2:t.y2??null,legend:["top","bottom","left","right","none"].includes(t.legend)?t.legend:"bottom",tooltip:t.tooltip!=="false",emphasis:["primary","secondary","none"].includes(t.emphasis)?t.emphasis:"none",data:a,raw:e.content},i),{unknownAttrs:u})}function Oo(e,r){let{positional:t,attrs:u}=T(e.attrText),o=M(u,["cols","columns","gap","layout"]),a=(u.cols??u.columns??t[0]??"1").split(",").map(Number),i=a.length===1?a[0]:a;if(Array.isArray(i)?i.some(l=>!Number.isInteger(l)||l<1||l>12):!Number.isInteger(i)||i<1||i>12)return F(e.raw,{lang:"rmd",raw:e.raw,warnings:[`grid-invalid-columns: ${t[0]??"missing"}`]});let s=[],d=Pt(e.content);return d.length>12&&(s.push("grid-too-many-cells"),d=d.slice(0,12)),d.some(l=>/^:::grid\b/m.test(l))?F(e.raw,{lang:"rmd",raw:e.raw,warnings:["grid-nesting-not-supported"]}):$(de({type:"grid",columns:i,gap:["sm","md","lg"].includes(u.gap)?u.gap:"md",layout:u.layout==="masonry"?"masonry":"default",cells:d.map(l=>r(l))},s),{unknownAttrs:o})}function jo(e,r){let{attrs:t}=T(e.attrText),u=M(t,["title"]),o=Ht(e.attrText,"title")??t.title??null;return $({type:"card",title:o,children:r(e.content)},{unknownAttrs:u})}function Vo(e,r){let{positional:t,attrs:u}=T(e.attrText),o=M(u,["title"]),n=t[0]??"info";return $({type:"callout",kind:["info","tip","warning","danger","success"].includes(n)?n:"info",title:Ht(e.attrText,"title")??u.title??null,children:r(e.content)},{unknownAttrs:o})}function Uo(e){let{attrs:r}=T(e.attrText),t=M(r,["name","min","max","step","default","unit","label","scale","marks"]),u=r.name,o=Number(r.min),n=Number(r.max),a=r.step===void 0?1:Number(r.step),i=o;if(r.default!==void 0){let l=r.default.split(",").map(Number);i=l.length===1?l[0]:l}let c=[];if(!Po.test(u??""))return F(e.raw,{lang:"rmd",raw:e.raw,warnings:[`slider-invalid-name: ${u??"missing"}`]});if(!Number.isFinite(o)||!Number.isFinite(n)||n<=o)return F(e.raw,{lang:"rmd",raw:e.raw,warnings:["slider-invalid-range"]});if(!Number.isFinite(a)||a<=0)return F(e.raw,{lang:"rmd",raw:e.raw,warnings:["slider-invalid-step"]});let s=i;Array.isArray(i)?i.some(l=>!Number.isFinite(l)||l<o||l>n)&&(c.push("slider-default-out-of-range"),s=o):(!Number.isFinite(i)||i<o||i>n)&&(c.push("slider-default-out-of-range"),s=o);let d=null;return r.marks&&(d=r.marks.split(",").map(Number).filter(Number.isFinite)),$(de({type:"slider",name:u,min:o,max:n,step:a,default:s,unit:r.unit??"",label:r.label??u,scale:["log","pow"].includes(r.scale)?r.scale:"linear",marks:d},c),{unknownAttrs:t})}function Zo(e){let{attrs:r}=T(e.attrText),t=M(r,["label","format"]),u=["text","markdown","json"].includes(r.format)?r.format:"text",o=[...new Set([...e.content.matchAll(/{{\s*([a-zA-Z_][a-zA-Z0-9_]*)(?:\s*\|[^}]*)?}}/g)].map(n=>n[1]))];return $({type:"export",label:r.label??"\u590D\u5236",format:u,template:e.content.replace(/\n$/,""),references:o},{unknownAttrs:t})}function Go(e){let{attrs:r}=T(e.attrText),t=M(r,["direction"]),u=[],o=new Set;for(let n of Nt(e.content)){let a=n.split("->").map(i=>i.trim()).filter(Boolean);for(let i=0;i<a.length-1;i+=1){let c=a[i],s=a[i+1];o.add(c),o.add(s),u.push({from:c,to:s})}}return u.length===0?F(e.raw,{lang:"rmd",raw:e.raw,warnings:["flow-empty-edges"]}):$({type:"flow",direction:r.direction==="tb"?"tb":"lr",nodes:[...o].map(n=>({id:n})),edges:u},{unknownAttrs:t})}function Wo(e){let{attrs:r}=T(e.attrText),t=M(r,["lang","title"]),u=e.content.split(/\r?\n/).filter(o=>o.length>0).map(o=>{let n=o[0],a=n==="+"?"add":n==="-"?"remove":"context",i=a==="context"?o.trimStart():o.slice(1).trimStart(),c=i.match(/\s+@注:\s*(.+)$/);return{kind:a,text:c?i.slice(0,c.index).trimEnd():i,note:c?c[1]:null}});return $({type:"diff",lang:r.lang??null,title:r.title??null,lines:u},{unknownAttrs:t})}function Ko(e,r){let{attrs:t}=T(e.attrText),u=M(t,["default"]),o=[],n=null;for(let s of e.content.split(/\r?\n/)){let d=s.match(/^@(.+?)\s*$/)?.[1]?.trim();if(d){n={label:d,source:""},o.push(n);continue}n&&(n.source+=`${s}
`)}if(o.length===0)return F(e.raw,{lang:"rmd",raw:e.raw,warnings:["tabs-empty-panels"]});let a=new Set(o.map(s=>s.label)),i=a.has(t.default)?t.default:o[0].label,c=t.default&&!a.has(t.default)?["tabs-default-missing"]:[];return $(de({type:"tabs",default:i,panels:o.map(s=>({label:s.label,children:r(s.source.trim())}))},c),{unknownAttrs:u})}function Yo(e,r){let{attrs:t}=T(e.attrText),u=M(t,["direction"]),o=[],n=[],a=null,i=!1;for(let c of e.content.split(/\r?\n/)){let s=c.match(/^\s*@\s+(.+?)\s*$/);if(s){a&&o.push(a);let{time:d,title:l,status:p}=Xo(s[1]);a={time:d,title:l,status:p,source:""};continue}if(!a){let d=Jo(c);if(d){o.push(d);continue}}a?a.source+=`${c}
`:c.trim().length>0&&(i=!0)}return a&&o.push(a),i&&n.push("timeline-content-before-first-item"),o.length===0&&n.push("timeline-empty-items"),$(de({type:"timeline",direction:t.direction==="horizontal"?"horizontal":"vertical",items:o.map(c=>({time:c.time,title:c.title,status:c.status,children:r(c.source.trim())}))},n),{unknownAttrs:u})}function Jo(e){let r=e.match(/^\s*[-*+]\s+(.+?)\s*$/);if(!r)return null;let t=r[1].trim(),u=t.match(/^\*\*([^*]+)\*\*\s*[:：]?\s*(.*)$/);if(u)return{time:u[1].trim(),title:null,status:"default",source:u[2].trim()};let o=t.match(/^([^:：]+)[:：]\s*(.*)$/);return o?{time:zt(o[1].trim()),title:null,status:"default",source:o[2].trim()}:{time:zt(t),title:null,status:"default",source:""}}function zt(e){return e.replace(/\*\*([^*]+)\*\*/g,"$1").replace(/`([^`]+)`/g,"$1").trim()}function Xo(e){let r=/\s*\[([^\]]*)\]\s*$/,t=/([a-zA-Z_][a-zA-Z0-9_-]*)\s*=\s*"([^"]*)"/g,u={},o=e;for(;;){let a=o.match(r);if(!a)break;for(let i of a[1].matchAll(t))u[i[1]]=i[2];o=o.slice(0,a.index)}let n=["success","warning","danger","pending"].includes(u.status)?u.status:"default";return{time:o.trim(),title:typeof u.title=="string"?u.title:null,status:n}}function Qo(e,r){let t=[],u=[],o=null,n=!1;for(let a of e.content.split(/\r?\n/)){let i=a.match(/^\s*@\s+(.+?)\s*$/);if(i){o&&t.push(o),o={title:i[1].trim(),source:""};continue}o?o.source+=`${a}
`:a.trim().length>0&&(n=!0)}return o&&t.push(o),n&&u.push("kanban-content-before-first-column"),t.length===0&&u.push("kanban-empty-columns"),de({type:"kanban",columns:t.map(a=>({title:a.title,children:r(a.source.trim())}))},u)}function en(e,r){let{attrs:t}=T(e.attrText),u=M(t,["title","open"]);return $({type:"details",title:t.title??"",open:t.open==="true",children:r(e.content)},{unknownAttrs:u})}function rn(e,r){let{attrs:t}=T(e.attrText),u=M(t,["autoplay","interval"]),o=Pt(e.content);return $({type:"carousel",autoplay:t.autoplay==="true",interval:t.interval?Number(t.interval):3e3,items:o.map(n=>r(n))},{unknownAttrs:u})}function tn(e){let{attrs:r}=T(e.attrText),t=M(r,["type","id","aspect-ratio"]);return $({type:"embed",embedType:r.type??"unknown",embedId:r.id??"",aspectRatio:r["aspect-ratio"]??null},{unknownAttrs:t})}function un(e){return{type:"math",value:e.content.trim()}}function Pt(e){if(!/^---\s*$/m.test(e)){let u=on(e);if(u)return u}let r=[],t=[];for(let u of e.split(/\r?\n/)){if(/^---\s*$/.test(u)){r.push(t.join(`
`).trim()),t=[];continue}t.push(u)}return r.push(t.join(`
`).trim()),r}function on(e){let r=e.split(/\r?\n/),t=[],u=0;for(;u<r.length;){for(;u<r.length&&r[u].trim()==="";)u+=1;if(u>=r.length)break;if(!It(r[u]))return null;let o=u,n=1,a=null;for(u+=1;u<r.length;u+=1){let i=nn(r[u]);if(a){i&&i.marker===a.marker&&i.length>=a.length&&(a=null);continue}if(i){a=i;continue}if(It(r[u])){n+=1;continue}if(/^:::\s*$/.test(r[u])&&(n-=1,n===0)){u+=1;break}}if(n!==0)return null;t.push(r.slice(o,u).join(`
`).trim())}return t.length>1?t:null}function It(e){return/^:::\s*([a-z][a-z0-9-]*)(?:\s+(.*))?\s*$/i.test(e)}function nn(e){let r=e.match(/^\s*(`{3,}|~{3,})/);return r?{marker:r[1][0],length:r[1].length}:null}function Nt(e){return e.split(/\r?\n/).map(r=>r.trim()).filter(Boolean)}function an(e){return e!==""&&Number.isFinite(Number(e))}function de(e,r){return r.length>0&&(e.warnings=r),e}function M(e,r){let t=new Set(r),u={};for(let[o,n]of Object.entries(e))t.has(o)||(u[o]=n);return u}function Ht(e,r){let t=e.match(new RegExp(`(?:^|\\s)${r}=(?:"([^"]*)"|([^\\n]*?))(?=\\s+[a-zA-Z_][a-zA-Z0-9_-]*=|$)`)),u=t?.[1]??t?.[2];return u===void 0?null:u.trim()}function $(e,r){for(let[t,u]of Object.entries(r))u&&typeof u=="object"&&!Array.isArray(u)&&Object.keys(u).length===0||(e[t]=u);return e}var kr={};_e(kr,{arrayReplaceAt:()=>xr,assign:()=>pe,escapeHtml:()=>j,escapeRE:()=>Vn,fromCodePoint:()=>Ee,has:()=>Ln,isMdAsciiPunct:()=>te,isPunctChar:()=>re,isSpace:()=>A,isString:()=>Ue,isValidEntityCode:()=>Ze,isWhiteSpace:()=>ee,lib:()=>Un,normalizeReference:()=>ue,unescapeAll:()=>O,unescapeMd:()=>Bn});var Be={};_e(Be,{decode:()=>we,encode:()=>ze,format:()=>fe,parse:()=>Ae});var Ot={};function cn(e){let r=Ot[e];if(r)return r;r=Ot[e]=[];for(let t=0;t<128;t++){let u=String.fromCharCode(t);r.push(u)}for(let t=0;t<e.length;t++){let u=e.charCodeAt(t);r[u]="%"+("0"+u.toString(16).toUpperCase()).slice(-2)}return r}function Re(e,r){typeof r!="string"&&(r=Re.defaultChars);let t=cn(r);return e.replace(/(%[a-f0-9]{2})+/gi,function(u){let o="";for(let n=0,a=u.length;n<a;n+=3){let i=parseInt(u.slice(n+1,n+3),16);if(i<128){o+=t[i];continue}if((i&224)===192&&n+3<a){let c=parseInt(u.slice(n+4,n+6),16);if((c&192)===128){let s=i<<6&1984|c&63;s<128?o+="\uFFFD\uFFFD":o+=String.fromCharCode(s),n+=3;continue}}if((i&240)===224&&n+6<a){let c=parseInt(u.slice(n+4,n+6),16),s=parseInt(u.slice(n+7,n+9),16);if((c&192)===128&&(s&192)===128){let d=i<<12&61440|c<<6&4032|s&63;d<2048||d>=55296&&d<=57343?o+="\uFFFD\uFFFD\uFFFD":o+=String.fromCharCode(d),n+=6;continue}}if((i&248)===240&&n+9<a){let c=parseInt(u.slice(n+4,n+6),16),s=parseInt(u.slice(n+7,n+9),16),d=parseInt(u.slice(n+10,n+12),16);if((c&192)===128&&(s&192)===128&&(d&192)===128){let l=i<<18&1835008|c<<12&258048|s<<6&4032|d&63;l<65536||l>1114111?o+="\uFFFD\uFFFD\uFFFD\uFFFD":(l-=65536,o+=String.fromCharCode(55296+(l>>10),56320+(l&1023))),n+=9;continue}}o+="\uFFFD"}return o})}Re.defaultChars=";/?:@&=+$,#";Re.componentChars="";var we=Re;var jt={};function sn(e){let r=jt[e];if(r)return r;r=jt[e]=[];for(let t=0;t<128;t++){let u=String.fromCharCode(t);/^[0-9a-z]$/i.test(u)?r.push(u):r.push("%"+("0"+t.toString(16).toUpperCase()).slice(-2))}for(let t=0;t<e.length;t++)r[e.charCodeAt(t)]=e[t];return r}function qe(e,r,t){typeof r!="string"&&(t=r,r=qe.defaultChars),typeof t>"u"&&(t=!0);let u=sn(r),o="";for(let n=0,a=e.length;n<a;n++){let i=e.charCodeAt(n);if(t&&i===37&&n+2<a&&/^[0-9a-f]{2}$/i.test(e.slice(n+1,n+3))){o+=e.slice(n,n+3),n+=2;continue}if(i<128){o+=u[i];continue}if(i>=55296&&i<=57343){if(i>=55296&&i<=56319&&n+1<a){let c=e.charCodeAt(n+1);if(c>=56320&&c<=57343){o+=encodeURIComponent(e[n]+e[n+1]),n++;continue}}o+="%EF%BF%BD";continue}o+=encodeURIComponent(e[n])}return o}qe.defaultChars=";/?:@&=+$,-_.!~*'()#";qe.componentChars="-_.!~*'()";var ze=qe;function fe(e){let r="";return r+=e.protocol||"",r+=e.slashes?"//":"",r+=e.auth?e.auth+"@":"",e.hostname&&e.hostname.indexOf(":")!==-1?r+="["+e.hostname+"]":r+=e.hostname||"",r+=e.port?":"+e.port:"",r+=e.pathname||"",r+=e.search||"",r+=e.hash||"",r}function Ie(){this.protocol=null,this.slashes=null,this.auth=null,this.port=null,this.hostname=null,this.hash=null,this.search=null,this.pathname=null}var ln=/^([a-z0-9.+-]+:)/i,dn=/:[0-9]*$/,fn=/^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/,mn=["<",">",'"',"`"," ","\r",`
`,"	"],pn=["{","}","|","\\","^","`"].concat(mn),hn=["'"].concat(pn),Vt=["%","/","?",";","#"].concat(hn),Ut=["/","?","#"],bn=255,Zt=/^[+a-z0-9A-Z_-]{0,63}$/,gn=/^([+a-z0-9A-Z_-]{0,63})(.*)$/,Gt={javascript:!0,"javascript:":!0},Wt={http:!0,https:!0,ftp:!0,gopher:!0,file:!0,"http:":!0,"https:":!0,"ftp:":!0,"gopher:":!0,"file:":!0};function xn(e,r){if(e&&e instanceof Ie)return e;let t=new Ie;return t.parse(e,r),t}Ie.prototype.parse=function(e,r){let t,u,o,n=e;if(n=n.trim(),!r&&e.split("#").length===1){let s=fn.exec(n);if(s)return this.pathname=s[1],s[2]&&(this.search=s[2]),this}let a=ln.exec(n);if(a&&(a=a[0],t=a.toLowerCase(),this.protocol=a,n=n.substr(a.length)),(r||a||n.match(/^\/\/[^@\/]+@[^@\/]+/))&&(o=n.substr(0,2)==="//",o&&!(a&&Gt[a])&&(n=n.substr(2),this.slashes=!0)),!Gt[a]&&(o||a&&!Wt[a])){let s=-1;for(let f=0;f<Ut.length;f++)u=n.indexOf(Ut[f]),u!==-1&&(s===-1||u<s)&&(s=u);let d,l;s===-1?l=n.lastIndexOf("@"):l=n.lastIndexOf("@",s),l!==-1&&(d=n.slice(0,l),n=n.slice(l+1),this.auth=d),s=-1;for(let f=0;f<Vt.length;f++)u=n.indexOf(Vt[f]),u!==-1&&(s===-1||u<s)&&(s=u);s===-1&&(s=n.length),n[s-1]===":"&&s--;let p=n.slice(0,s);n=n.slice(s),this.parseHost(p),this.hostname=this.hostname||"";let m=this.hostname[0]==="["&&this.hostname[this.hostname.length-1]==="]";if(!m){let f=this.hostname.split(/\./);for(let h=0,g=f.length;h<g;h++){let w=f[h];if(w&&!w.match(Zt)){let b="";for(let x=0,k=w.length;x<k;x++)w.charCodeAt(x)>127?b+="x":b+=w[x];if(!b.match(Zt)){let x=f.slice(0,h),k=f.slice(h+1),v=w.match(gn);v&&(x.push(v[1]),k.unshift(v[2])),k.length&&(n=k.join(".")+n),this.hostname=x.join(".");break}}}}this.hostname.length>bn&&(this.hostname=""),m&&(this.hostname=this.hostname.substr(1,this.hostname.length-2))}let i=n.indexOf("#");i!==-1&&(this.hash=n.substr(i),n=n.slice(0,i));let c=n.indexOf("?");return c!==-1&&(this.search=n.substr(c),n=n.slice(0,c)),n&&(this.pathname=n),Wt[t]&&this.hostname&&!this.pathname&&(this.pathname=""),this};Ie.prototype.parseHost=function(e){let r=dn.exec(e);r&&(r=r[0],r!==":"&&(this.port=r.substr(1)),e=e.substr(0,e.length-r.length)),e&&(this.hostname=e)};var Ae=xn;var dr={};_e(dr,{Any:()=>Pe,Cc:()=>Ne,Cf:()=>Kt,P:()=>me,S:()=>He,Z:()=>Oe});var Pe=/[\0-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/;var Ne=/[\0-\x1F\x7F-\x9F]/;var Kt=/[\xAD\u0600-\u0605\u061C\u06DD\u070F\u0890\u0891\u08E2\u180E\u200B-\u200F\u202A-\u202E\u2060-\u2064\u2066-\u206F\uFEFF\uFFF9-\uFFFB]|\uD804[\uDCBD\uDCCD]|\uD80D[\uDC30-\uDC3F]|\uD82F[\uDCA0-\uDCA3]|\uD834[\uDD73-\uDD7A]|\uDB40[\uDC01\uDC20-\uDC7F]/;var me=/[!-#%-\*,-\/:;\?@\[-\]_\{\}\xA1\xA7\xAB\xB6\xB7\xBB\xBF\u037E\u0387\u055A-\u055F\u0589\u058A\u05BE\u05C0\u05C3\u05C6\u05F3\u05F4\u0609\u060A\u060C\u060D\u061B\u061D-\u061F\u066A-\u066D\u06D4\u0700-\u070D\u07F7-\u07F9\u0830-\u083E\u085E\u0964\u0965\u0970\u09FD\u0A76\u0AF0\u0C77\u0C84\u0DF4\u0E4F\u0E5A\u0E5B\u0F04-\u0F12\u0F14\u0F3A-\u0F3D\u0F85\u0FD0-\u0FD4\u0FD9\u0FDA\u104A-\u104F\u10FB\u1360-\u1368\u1400\u166E\u169B\u169C\u16EB-\u16ED\u1735\u1736\u17D4-\u17D6\u17D8-\u17DA\u1800-\u180A\u1944\u1945\u1A1E\u1A1F\u1AA0-\u1AA6\u1AA8-\u1AAD\u1B5A-\u1B60\u1B7D\u1B7E\u1BFC-\u1BFF\u1C3B-\u1C3F\u1C7E\u1C7F\u1CC0-\u1CC7\u1CD3\u2010-\u2027\u2030-\u2043\u2045-\u2051\u2053-\u205E\u207D\u207E\u208D\u208E\u2308-\u230B\u2329\u232A\u2768-\u2775\u27C5\u27C6\u27E6-\u27EF\u2983-\u2998\u29D8-\u29DB\u29FC\u29FD\u2CF9-\u2CFC\u2CFE\u2CFF\u2D70\u2E00-\u2E2E\u2E30-\u2E4F\u2E52-\u2E5D\u3001-\u3003\u3008-\u3011\u3014-\u301F\u3030\u303D\u30A0\u30FB\uA4FE\uA4FF\uA60D-\uA60F\uA673\uA67E\uA6F2-\uA6F7\uA874-\uA877\uA8CE\uA8CF\uA8F8-\uA8FA\uA8FC\uA92E\uA92F\uA95F\uA9C1-\uA9CD\uA9DE\uA9DF\uAA5C-\uAA5F\uAADE\uAADF\uAAF0\uAAF1\uABEB\uFD3E\uFD3F\uFE10-\uFE19\uFE30-\uFE52\uFE54-\uFE61\uFE63\uFE68\uFE6A\uFE6B\uFF01-\uFF03\uFF05-\uFF0A\uFF0C-\uFF0F\uFF1A\uFF1B\uFF1F\uFF20\uFF3B-\uFF3D\uFF3F\uFF5B\uFF5D\uFF5F-\uFF65]|\uD800[\uDD00-\uDD02\uDF9F\uDFD0]|\uD801\uDD6F|\uD802[\uDC57\uDD1F\uDD3F\uDE50-\uDE58\uDE7F\uDEF0-\uDEF6\uDF39-\uDF3F\uDF99-\uDF9C]|\uD803[\uDEAD\uDF55-\uDF59\uDF86-\uDF89]|\uD804[\uDC47-\uDC4D\uDCBB\uDCBC\uDCBE-\uDCC1\uDD40-\uDD43\uDD74\uDD75\uDDC5-\uDDC8\uDDCD\uDDDB\uDDDD-\uDDDF\uDE38-\uDE3D\uDEA9]|\uD805[\uDC4B-\uDC4F\uDC5A\uDC5B\uDC5D\uDCC6\uDDC1-\uDDD7\uDE41-\uDE43\uDE60-\uDE6C\uDEB9\uDF3C-\uDF3E]|\uD806[\uDC3B\uDD44-\uDD46\uDDE2\uDE3F-\uDE46\uDE9A-\uDE9C\uDE9E-\uDEA2\uDF00-\uDF09]|\uD807[\uDC41-\uDC45\uDC70\uDC71\uDEF7\uDEF8\uDF43-\uDF4F\uDFFF]|\uD809[\uDC70-\uDC74]|\uD80B[\uDFF1\uDFF2]|\uD81A[\uDE6E\uDE6F\uDEF5\uDF37-\uDF3B\uDF44]|\uD81B[\uDE97-\uDE9A\uDFE2]|\uD82F\uDC9F|\uD836[\uDE87-\uDE8B]|\uD83A[\uDD5E\uDD5F]/;var He=/[\$\+<->\^`\|~\xA2-\xA6\xA8\xA9\xAC\xAE-\xB1\xB4\xB8\xD7\xF7\u02C2-\u02C5\u02D2-\u02DF\u02E5-\u02EB\u02ED\u02EF-\u02FF\u0375\u0384\u0385\u03F6\u0482\u058D-\u058F\u0606-\u0608\u060B\u060E\u060F\u06DE\u06E9\u06FD\u06FE\u07F6\u07FE\u07FF\u0888\u09F2\u09F3\u09FA\u09FB\u0AF1\u0B70\u0BF3-\u0BFA\u0C7F\u0D4F\u0D79\u0E3F\u0F01-\u0F03\u0F13\u0F15-\u0F17\u0F1A-\u0F1F\u0F34\u0F36\u0F38\u0FBE-\u0FC5\u0FC7-\u0FCC\u0FCE\u0FCF\u0FD5-\u0FD8\u109E\u109F\u1390-\u1399\u166D\u17DB\u1940\u19DE-\u19FF\u1B61-\u1B6A\u1B74-\u1B7C\u1FBD\u1FBF-\u1FC1\u1FCD-\u1FCF\u1FDD-\u1FDF\u1FED-\u1FEF\u1FFD\u1FFE\u2044\u2052\u207A-\u207C\u208A-\u208C\u20A0-\u20C0\u2100\u2101\u2103-\u2106\u2108\u2109\u2114\u2116-\u2118\u211E-\u2123\u2125\u2127\u2129\u212E\u213A\u213B\u2140-\u2144\u214A-\u214D\u214F\u218A\u218B\u2190-\u2307\u230C-\u2328\u232B-\u2426\u2440-\u244A\u249C-\u24E9\u2500-\u2767\u2794-\u27C4\u27C7-\u27E5\u27F0-\u2982\u2999-\u29D7\u29DC-\u29FB\u29FE-\u2B73\u2B76-\u2B95\u2B97-\u2BFF\u2CE5-\u2CEA\u2E50\u2E51\u2E80-\u2E99\u2E9B-\u2EF3\u2F00-\u2FD5\u2FF0-\u2FFF\u3004\u3012\u3013\u3020\u3036\u3037\u303E\u303F\u309B\u309C\u3190\u3191\u3196-\u319F\u31C0-\u31E3\u31EF\u3200-\u321E\u322A-\u3247\u3250\u3260-\u327F\u328A-\u32B0\u32C0-\u33FF\u4DC0-\u4DFF\uA490-\uA4C6\uA700-\uA716\uA720\uA721\uA789\uA78A\uA828-\uA82B\uA836-\uA839\uAA77-\uAA79\uAB5B\uAB6A\uAB6B\uFB29\uFBB2-\uFBC2\uFD40-\uFD4F\uFDCF\uFDFC-\uFDFF\uFE62\uFE64-\uFE66\uFE69\uFF04\uFF0B\uFF1C-\uFF1E\uFF3E\uFF40\uFF5C\uFF5E\uFFE0-\uFFE6\uFFE8-\uFFEE\uFFFC\uFFFD]|\uD800[\uDD37-\uDD3F\uDD79-\uDD89\uDD8C-\uDD8E\uDD90-\uDD9C\uDDA0\uDDD0-\uDDFC]|\uD802[\uDC77\uDC78\uDEC8]|\uD805\uDF3F|\uD807[\uDFD5-\uDFF1]|\uD81A[\uDF3C-\uDF3F\uDF45]|\uD82F\uDC9C|\uD833[\uDF50-\uDFC3]|\uD834[\uDC00-\uDCF5\uDD00-\uDD26\uDD29-\uDD64\uDD6A-\uDD6C\uDD83\uDD84\uDD8C-\uDDA9\uDDAE-\uDDEA\uDE00-\uDE41\uDE45\uDF00-\uDF56]|\uD835[\uDEC1\uDEDB\uDEFB\uDF15\uDF35\uDF4F\uDF6F\uDF89\uDFA9\uDFC3]|\uD836[\uDC00-\uDDFF\uDE37-\uDE3A\uDE6D-\uDE74\uDE76-\uDE83\uDE85\uDE86]|\uD838[\uDD4F\uDEFF]|\uD83B[\uDCAC\uDCB0\uDD2E\uDEF0\uDEF1]|\uD83C[\uDC00-\uDC2B\uDC30-\uDC93\uDCA0-\uDCAE\uDCB1-\uDCBF\uDCC1-\uDCCF\uDCD1-\uDCF5\uDD0D-\uDDAD\uDDE6-\uDE02\uDE10-\uDE3B\uDE40-\uDE48\uDE50\uDE51\uDE60-\uDE65\uDF00-\uDFFF]|\uD83D[\uDC00-\uDED7\uDEDC-\uDEEC\uDEF0-\uDEFC\uDF00-\uDF76\uDF7B-\uDFD9\uDFE0-\uDFEB\uDFF0]|\uD83E[\uDC00-\uDC0B\uDC10-\uDC47\uDC50-\uDC59\uDC60-\uDC87\uDC90-\uDCAD\uDCB0\uDCB1\uDD00-\uDE53\uDE60-\uDE6D\uDE70-\uDE7C\uDE80-\uDE88\uDE90-\uDEBD\uDEBF-\uDEC5\uDECE-\uDEDB\uDEE0-\uDEE8\uDEF0-\uDEF8\uDF00-\uDF92\uDF94-\uDFCA]/;var Oe=/[ \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000]/;var Yt=new Uint16Array('\u1D41<\xD5\u0131\u028A\u049D\u057B\u05D0\u0675\u06DE\u07A2\u07D6\u080F\u0A4A\u0A91\u0DA1\u0E6D\u0F09\u0F26\u10CA\u1228\u12E1\u1415\u149D\u14C3\u14DF\u1525\0\0\0\0\0\0\u156B\u16CD\u198D\u1C12\u1DDD\u1F7E\u2060\u21B0\u228D\u23C0\u23FB\u2442\u2824\u2912\u2D08\u2E48\u2FCE\u3016\u32BA\u3639\u37AC\u38FE\u3A28\u3A71\u3AE0\u3B2E\u0800EMabcfglmnoprstu\\bfms\x7F\x84\x8B\x90\x95\x98\xA6\xB3\xB9\xC8\xCFlig\u803B\xC6\u40C6P\u803B&\u4026cute\u803B\xC1\u40C1reve;\u4102\u0100iyx}rc\u803B\xC2\u40C2;\u4410r;\uC000\u{1D504}rave\u803B\xC0\u40C0pha;\u4391acr;\u4100d;\u6A53\u0100gp\x9D\xA1on;\u4104f;\uC000\u{1D538}plyFunction;\u6061ing\u803B\xC5\u40C5\u0100cs\xBE\xC3r;\uC000\u{1D49C}ign;\u6254ilde\u803B\xC3\u40C3ml\u803B\xC4\u40C4\u0400aceforsu\xE5\xFB\xFE\u0117\u011C\u0122\u0127\u012A\u0100cr\xEA\xF2kslash;\u6216\u0176\xF6\xF8;\u6AE7ed;\u6306y;\u4411\u0180crt\u0105\u010B\u0114ause;\u6235noullis;\u612Ca;\u4392r;\uC000\u{1D505}pf;\uC000\u{1D539}eve;\u42D8c\xF2\u0113mpeq;\u624E\u0700HOacdefhilorsu\u014D\u0151\u0156\u0180\u019E\u01A2\u01B5\u01B7\u01BA\u01DC\u0215\u0273\u0278\u027Ecy;\u4427PY\u803B\xA9\u40A9\u0180cpy\u015D\u0162\u017Aute;\u4106\u0100;i\u0167\u0168\u62D2talDifferentialD;\u6145leys;\u612D\u0200aeio\u0189\u018E\u0194\u0198ron;\u410Cdil\u803B\xC7\u40C7rc;\u4108nint;\u6230ot;\u410A\u0100dn\u01A7\u01ADilla;\u40B8terDot;\u40B7\xF2\u017Fi;\u43A7rcle\u0200DMPT\u01C7\u01CB\u01D1\u01D6ot;\u6299inus;\u6296lus;\u6295imes;\u6297o\u0100cs\u01E2\u01F8kwiseContourIntegral;\u6232eCurly\u0100DQ\u0203\u020FoubleQuote;\u601Duote;\u6019\u0200lnpu\u021E\u0228\u0247\u0255on\u0100;e\u0225\u0226\u6237;\u6A74\u0180git\u022F\u0236\u023Aruent;\u6261nt;\u622FourIntegral;\u622E\u0100fr\u024C\u024E;\u6102oduct;\u6210nterClockwiseContourIntegral;\u6233oss;\u6A2Fcr;\uC000\u{1D49E}p\u0100;C\u0284\u0285\u62D3ap;\u624D\u0580DJSZacefios\u02A0\u02AC\u02B0\u02B4\u02B8\u02CB\u02D7\u02E1\u02E6\u0333\u048D\u0100;o\u0179\u02A5trahd;\u6911cy;\u4402cy;\u4405cy;\u440F\u0180grs\u02BF\u02C4\u02C7ger;\u6021r;\u61A1hv;\u6AE4\u0100ay\u02D0\u02D5ron;\u410E;\u4414l\u0100;t\u02DD\u02DE\u6207a;\u4394r;\uC000\u{1D507}\u0100af\u02EB\u0327\u0100cm\u02F0\u0322ritical\u0200ADGT\u0300\u0306\u0316\u031Ccute;\u40B4o\u0174\u030B\u030D;\u42D9bleAcute;\u42DDrave;\u4060ilde;\u42DCond;\u62C4ferentialD;\u6146\u0470\u033D\0\0\0\u0342\u0354\0\u0405f;\uC000\u{1D53B}\u0180;DE\u0348\u0349\u034D\u40A8ot;\u60DCqual;\u6250ble\u0300CDLRUV\u0363\u0372\u0382\u03CF\u03E2\u03F8ontourIntegra\xEC\u0239o\u0274\u0379\0\0\u037B\xBB\u0349nArrow;\u61D3\u0100eo\u0387\u03A4ft\u0180ART\u0390\u0396\u03A1rrow;\u61D0ightArrow;\u61D4e\xE5\u02CAng\u0100LR\u03AB\u03C4eft\u0100AR\u03B3\u03B9rrow;\u67F8ightArrow;\u67FAightArrow;\u67F9ight\u0100AT\u03D8\u03DErrow;\u61D2ee;\u62A8p\u0241\u03E9\0\0\u03EFrrow;\u61D1ownArrow;\u61D5erticalBar;\u6225n\u0300ABLRTa\u0412\u042A\u0430\u045E\u047F\u037Crrow\u0180;BU\u041D\u041E\u0422\u6193ar;\u6913pArrow;\u61F5reve;\u4311eft\u02D2\u043A\0\u0446\0\u0450ightVector;\u6950eeVector;\u695Eector\u0100;B\u0459\u045A\u61BDar;\u6956ight\u01D4\u0467\0\u0471eeVector;\u695Fector\u0100;B\u047A\u047B\u61C1ar;\u6957ee\u0100;A\u0486\u0487\u62A4rrow;\u61A7\u0100ct\u0492\u0497r;\uC000\u{1D49F}rok;\u4110\u0800NTacdfglmopqstux\u04BD\u04C0\u04C4\u04CB\u04DE\u04E2\u04E7\u04EE\u04F5\u0521\u052F\u0536\u0552\u055D\u0560\u0565G;\u414AH\u803B\xD0\u40D0cute\u803B\xC9\u40C9\u0180aiy\u04D2\u04D7\u04DCron;\u411Arc\u803B\xCA\u40CA;\u442Dot;\u4116r;\uC000\u{1D508}rave\u803B\xC8\u40C8ement;\u6208\u0100ap\u04FA\u04FEcr;\u4112ty\u0253\u0506\0\0\u0512mallSquare;\u65FBerySmallSquare;\u65AB\u0100gp\u0526\u052Aon;\u4118f;\uC000\u{1D53C}silon;\u4395u\u0100ai\u053C\u0549l\u0100;T\u0542\u0543\u6A75ilde;\u6242librium;\u61CC\u0100ci\u0557\u055Ar;\u6130m;\u6A73a;\u4397ml\u803B\xCB\u40CB\u0100ip\u056A\u056Fsts;\u6203onentialE;\u6147\u0280cfios\u0585\u0588\u058D\u05B2\u05CCy;\u4424r;\uC000\u{1D509}lled\u0253\u0597\0\0\u05A3mallSquare;\u65FCerySmallSquare;\u65AA\u0370\u05BA\0\u05BF\0\0\u05C4f;\uC000\u{1D53D}All;\u6200riertrf;\u6131c\xF2\u05CB\u0600JTabcdfgorst\u05E8\u05EC\u05EF\u05FA\u0600\u0612\u0616\u061B\u061D\u0623\u066C\u0672cy;\u4403\u803B>\u403Emma\u0100;d\u05F7\u05F8\u4393;\u43DCreve;\u411E\u0180eiy\u0607\u060C\u0610dil;\u4122rc;\u411C;\u4413ot;\u4120r;\uC000\u{1D50A};\u62D9pf;\uC000\u{1D53E}eater\u0300EFGLST\u0635\u0644\u064E\u0656\u065B\u0666qual\u0100;L\u063E\u063F\u6265ess;\u62DBullEqual;\u6267reater;\u6AA2ess;\u6277lantEqual;\u6A7Eilde;\u6273cr;\uC000\u{1D4A2};\u626B\u0400Aacfiosu\u0685\u068B\u0696\u069B\u069E\u06AA\u06BE\u06CARDcy;\u442A\u0100ct\u0690\u0694ek;\u42C7;\u405Eirc;\u4124r;\u610ClbertSpace;\u610B\u01F0\u06AF\0\u06B2f;\u610DizontalLine;\u6500\u0100ct\u06C3\u06C5\xF2\u06A9rok;\u4126mp\u0144\u06D0\u06D8ownHum\xF0\u012Fqual;\u624F\u0700EJOacdfgmnostu\u06FA\u06FE\u0703\u0707\u070E\u071A\u071E\u0721\u0728\u0744\u0778\u078B\u078F\u0795cy;\u4415lig;\u4132cy;\u4401cute\u803B\xCD\u40CD\u0100iy\u0713\u0718rc\u803B\xCE\u40CE;\u4418ot;\u4130r;\u6111rave\u803B\xCC\u40CC\u0180;ap\u0720\u072F\u073F\u0100cg\u0734\u0737r;\u412AinaryI;\u6148lie\xF3\u03DD\u01F4\u0749\0\u0762\u0100;e\u074D\u074E\u622C\u0100gr\u0753\u0758ral;\u622Bsection;\u62C2isible\u0100CT\u076C\u0772omma;\u6063imes;\u6062\u0180gpt\u077F\u0783\u0788on;\u412Ef;\uC000\u{1D540}a;\u4399cr;\u6110ilde;\u4128\u01EB\u079A\0\u079Ecy;\u4406l\u803B\xCF\u40CF\u0280cfosu\u07AC\u07B7\u07BC\u07C2\u07D0\u0100iy\u07B1\u07B5rc;\u4134;\u4419r;\uC000\u{1D50D}pf;\uC000\u{1D541}\u01E3\u07C7\0\u07CCr;\uC000\u{1D4A5}rcy;\u4408kcy;\u4404\u0380HJacfos\u07E4\u07E8\u07EC\u07F1\u07FD\u0802\u0808cy;\u4425cy;\u440Cppa;\u439A\u0100ey\u07F6\u07FBdil;\u4136;\u441Ar;\uC000\u{1D50E}pf;\uC000\u{1D542}cr;\uC000\u{1D4A6}\u0580JTaceflmost\u0825\u0829\u082C\u0850\u0863\u09B3\u09B8\u09C7\u09CD\u0A37\u0A47cy;\u4409\u803B<\u403C\u0280cmnpr\u0837\u083C\u0841\u0844\u084Dute;\u4139bda;\u439Bg;\u67EAlacetrf;\u6112r;\u619E\u0180aey\u0857\u085C\u0861ron;\u413Ddil;\u413B;\u441B\u0100fs\u0868\u0970t\u0500ACDFRTUVar\u087E\u08A9\u08B1\u08E0\u08E6\u08FC\u092F\u095B\u0390\u096A\u0100nr\u0883\u088FgleBracket;\u67E8row\u0180;BR\u0899\u089A\u089E\u6190ar;\u61E4ightArrow;\u61C6eiling;\u6308o\u01F5\u08B7\0\u08C3bleBracket;\u67E6n\u01D4\u08C8\0\u08D2eeVector;\u6961ector\u0100;B\u08DB\u08DC\u61C3ar;\u6959loor;\u630Aight\u0100AV\u08EF\u08F5rrow;\u6194ector;\u694E\u0100er\u0901\u0917e\u0180;AV\u0909\u090A\u0910\u62A3rrow;\u61A4ector;\u695Aiangle\u0180;BE\u0924\u0925\u0929\u62B2ar;\u69CFqual;\u62B4p\u0180DTV\u0937\u0942\u094CownVector;\u6951eeVector;\u6960ector\u0100;B\u0956\u0957\u61BFar;\u6958ector\u0100;B\u0965\u0966\u61BCar;\u6952ight\xE1\u039Cs\u0300EFGLST\u097E\u098B\u0995\u099D\u09A2\u09ADqualGreater;\u62DAullEqual;\u6266reater;\u6276ess;\u6AA1lantEqual;\u6A7Dilde;\u6272r;\uC000\u{1D50F}\u0100;e\u09BD\u09BE\u62D8ftarrow;\u61DAidot;\u413F\u0180npw\u09D4\u0A16\u0A1Bg\u0200LRlr\u09DE\u09F7\u0A02\u0A10eft\u0100AR\u09E6\u09ECrrow;\u67F5ightArrow;\u67F7ightArrow;\u67F6eft\u0100ar\u03B3\u0A0Aight\xE1\u03BFight\xE1\u03CAf;\uC000\u{1D543}er\u0100LR\u0A22\u0A2CeftArrow;\u6199ightArrow;\u6198\u0180cht\u0A3E\u0A40\u0A42\xF2\u084C;\u61B0rok;\u4141;\u626A\u0400acefiosu\u0A5A\u0A5D\u0A60\u0A77\u0A7C\u0A85\u0A8B\u0A8Ep;\u6905y;\u441C\u0100dl\u0A65\u0A6FiumSpace;\u605Flintrf;\u6133r;\uC000\u{1D510}nusPlus;\u6213pf;\uC000\u{1D544}c\xF2\u0A76;\u439C\u0480Jacefostu\u0AA3\u0AA7\u0AAD\u0AC0\u0B14\u0B19\u0D91\u0D97\u0D9Ecy;\u440Acute;\u4143\u0180aey\u0AB4\u0AB9\u0ABEron;\u4147dil;\u4145;\u441D\u0180gsw\u0AC7\u0AF0\u0B0Eative\u0180MTV\u0AD3\u0ADF\u0AE8ediumSpace;\u600Bhi\u0100cn\u0AE6\u0AD8\xEB\u0AD9eryThi\xEE\u0AD9ted\u0100GL\u0AF8\u0B06reaterGreate\xF2\u0673essLes\xF3\u0A48Line;\u400Ar;\uC000\u{1D511}\u0200Bnpt\u0B22\u0B28\u0B37\u0B3Areak;\u6060BreakingSpace;\u40A0f;\u6115\u0680;CDEGHLNPRSTV\u0B55\u0B56\u0B6A\u0B7C\u0BA1\u0BEB\u0C04\u0C5E\u0C84\u0CA6\u0CD8\u0D61\u0D85\u6AEC\u0100ou\u0B5B\u0B64ngruent;\u6262pCap;\u626DoubleVerticalBar;\u6226\u0180lqx\u0B83\u0B8A\u0B9Bement;\u6209ual\u0100;T\u0B92\u0B93\u6260ilde;\uC000\u2242\u0338ists;\u6204reater\u0380;EFGLST\u0BB6\u0BB7\u0BBD\u0BC9\u0BD3\u0BD8\u0BE5\u626Fqual;\u6271ullEqual;\uC000\u2267\u0338reater;\uC000\u226B\u0338ess;\u6279lantEqual;\uC000\u2A7E\u0338ilde;\u6275ump\u0144\u0BF2\u0BFDownHump;\uC000\u224E\u0338qual;\uC000\u224F\u0338e\u0100fs\u0C0A\u0C27tTriangle\u0180;BE\u0C1A\u0C1B\u0C21\u62EAar;\uC000\u29CF\u0338qual;\u62ECs\u0300;EGLST\u0C35\u0C36\u0C3C\u0C44\u0C4B\u0C58\u626Equal;\u6270reater;\u6278ess;\uC000\u226A\u0338lantEqual;\uC000\u2A7D\u0338ilde;\u6274ested\u0100GL\u0C68\u0C79reaterGreater;\uC000\u2AA2\u0338essLess;\uC000\u2AA1\u0338recedes\u0180;ES\u0C92\u0C93\u0C9B\u6280qual;\uC000\u2AAF\u0338lantEqual;\u62E0\u0100ei\u0CAB\u0CB9verseElement;\u620CghtTriangle\u0180;BE\u0CCB\u0CCC\u0CD2\u62EBar;\uC000\u29D0\u0338qual;\u62ED\u0100qu\u0CDD\u0D0CuareSu\u0100bp\u0CE8\u0CF9set\u0100;E\u0CF0\u0CF3\uC000\u228F\u0338qual;\u62E2erset\u0100;E\u0D03\u0D06\uC000\u2290\u0338qual;\u62E3\u0180bcp\u0D13\u0D24\u0D4Eset\u0100;E\u0D1B\u0D1E\uC000\u2282\u20D2qual;\u6288ceeds\u0200;EST\u0D32\u0D33\u0D3B\u0D46\u6281qual;\uC000\u2AB0\u0338lantEqual;\u62E1ilde;\uC000\u227F\u0338erset\u0100;E\u0D58\u0D5B\uC000\u2283\u20D2qual;\u6289ilde\u0200;EFT\u0D6E\u0D6F\u0D75\u0D7F\u6241qual;\u6244ullEqual;\u6247ilde;\u6249erticalBar;\u6224cr;\uC000\u{1D4A9}ilde\u803B\xD1\u40D1;\u439D\u0700Eacdfgmoprstuv\u0DBD\u0DC2\u0DC9\u0DD5\u0DDB\u0DE0\u0DE7\u0DFC\u0E02\u0E20\u0E22\u0E32\u0E3F\u0E44lig;\u4152cute\u803B\xD3\u40D3\u0100iy\u0DCE\u0DD3rc\u803B\xD4\u40D4;\u441Eblac;\u4150r;\uC000\u{1D512}rave\u803B\xD2\u40D2\u0180aei\u0DEE\u0DF2\u0DF6cr;\u414Cga;\u43A9cron;\u439Fpf;\uC000\u{1D546}enCurly\u0100DQ\u0E0E\u0E1AoubleQuote;\u601Cuote;\u6018;\u6A54\u0100cl\u0E27\u0E2Cr;\uC000\u{1D4AA}ash\u803B\xD8\u40D8i\u016C\u0E37\u0E3Cde\u803B\xD5\u40D5es;\u6A37ml\u803B\xD6\u40D6er\u0100BP\u0E4B\u0E60\u0100ar\u0E50\u0E53r;\u603Eac\u0100ek\u0E5A\u0E5C;\u63DEet;\u63B4arenthesis;\u63DC\u0480acfhilors\u0E7F\u0E87\u0E8A\u0E8F\u0E92\u0E94\u0E9D\u0EB0\u0EFCrtialD;\u6202y;\u441Fr;\uC000\u{1D513}i;\u43A6;\u43A0usMinus;\u40B1\u0100ip\u0EA2\u0EADncareplan\xE5\u069Df;\u6119\u0200;eio\u0EB9\u0EBA\u0EE0\u0EE4\u6ABBcedes\u0200;EST\u0EC8\u0EC9\u0ECF\u0EDA\u627Aqual;\u6AAFlantEqual;\u627Cilde;\u627Eme;\u6033\u0100dp\u0EE9\u0EEEuct;\u620Fortion\u0100;a\u0225\u0EF9l;\u621D\u0100ci\u0F01\u0F06r;\uC000\u{1D4AB};\u43A8\u0200Ufos\u0F11\u0F16\u0F1B\u0F1FOT\u803B"\u4022r;\uC000\u{1D514}pf;\u611Acr;\uC000\u{1D4AC}\u0600BEacefhiorsu\u0F3E\u0F43\u0F47\u0F60\u0F73\u0FA7\u0FAA\u0FAD\u1096\u10A9\u10B4\u10BEarr;\u6910G\u803B\xAE\u40AE\u0180cnr\u0F4E\u0F53\u0F56ute;\u4154g;\u67EBr\u0100;t\u0F5C\u0F5D\u61A0l;\u6916\u0180aey\u0F67\u0F6C\u0F71ron;\u4158dil;\u4156;\u4420\u0100;v\u0F78\u0F79\u611Cerse\u0100EU\u0F82\u0F99\u0100lq\u0F87\u0F8Eement;\u620Builibrium;\u61CBpEquilibrium;\u696Fr\xBB\u0F79o;\u43A1ght\u0400ACDFTUVa\u0FC1\u0FEB\u0FF3\u1022\u1028\u105B\u1087\u03D8\u0100nr\u0FC6\u0FD2gleBracket;\u67E9row\u0180;BL\u0FDC\u0FDD\u0FE1\u6192ar;\u61E5eftArrow;\u61C4eiling;\u6309o\u01F5\u0FF9\0\u1005bleBracket;\u67E7n\u01D4\u100A\0\u1014eeVector;\u695Dector\u0100;B\u101D\u101E\u61C2ar;\u6955loor;\u630B\u0100er\u102D\u1043e\u0180;AV\u1035\u1036\u103C\u62A2rrow;\u61A6ector;\u695Biangle\u0180;BE\u1050\u1051\u1055\u62B3ar;\u69D0qual;\u62B5p\u0180DTV\u1063\u106E\u1078ownVector;\u694FeeVector;\u695Cector\u0100;B\u1082\u1083\u61BEar;\u6954ector\u0100;B\u1091\u1092\u61C0ar;\u6953\u0100pu\u109B\u109Ef;\u611DndImplies;\u6970ightarrow;\u61DB\u0100ch\u10B9\u10BCr;\u611B;\u61B1leDelayed;\u69F4\u0680HOacfhimoqstu\u10E4\u10F1\u10F7\u10FD\u1119\u111E\u1151\u1156\u1161\u1167\u11B5\u11BB\u11BF\u0100Cc\u10E9\u10EEHcy;\u4429y;\u4428FTcy;\u442Ccute;\u415A\u0280;aeiy\u1108\u1109\u110E\u1113\u1117\u6ABCron;\u4160dil;\u415Erc;\u415C;\u4421r;\uC000\u{1D516}ort\u0200DLRU\u112A\u1134\u113E\u1149ownArrow\xBB\u041EeftArrow\xBB\u089AightArrow\xBB\u0FDDpArrow;\u6191gma;\u43A3allCircle;\u6218pf;\uC000\u{1D54A}\u0272\u116D\0\0\u1170t;\u621Aare\u0200;ISU\u117B\u117C\u1189\u11AF\u65A1ntersection;\u6293u\u0100bp\u118F\u119Eset\u0100;E\u1197\u1198\u628Fqual;\u6291erset\u0100;E\u11A8\u11A9\u6290qual;\u6292nion;\u6294cr;\uC000\u{1D4AE}ar;\u62C6\u0200bcmp\u11C8\u11DB\u1209\u120B\u0100;s\u11CD\u11CE\u62D0et\u0100;E\u11CD\u11D5qual;\u6286\u0100ch\u11E0\u1205eeds\u0200;EST\u11ED\u11EE\u11F4\u11FF\u627Bqual;\u6AB0lantEqual;\u627Dilde;\u627FTh\xE1\u0F8C;\u6211\u0180;es\u1212\u1213\u1223\u62D1rset\u0100;E\u121C\u121D\u6283qual;\u6287et\xBB\u1213\u0580HRSacfhiors\u123E\u1244\u1249\u1255\u125E\u1271\u1276\u129F\u12C2\u12C8\u12D1ORN\u803B\xDE\u40DEADE;\u6122\u0100Hc\u124E\u1252cy;\u440By;\u4426\u0100bu\u125A\u125C;\u4009;\u43A4\u0180aey\u1265\u126A\u126Fron;\u4164dil;\u4162;\u4422r;\uC000\u{1D517}\u0100ei\u127B\u1289\u01F2\u1280\0\u1287efore;\u6234a;\u4398\u0100cn\u128E\u1298kSpace;\uC000\u205F\u200ASpace;\u6009lde\u0200;EFT\u12AB\u12AC\u12B2\u12BC\u623Cqual;\u6243ullEqual;\u6245ilde;\u6248pf;\uC000\u{1D54B}ipleDot;\u60DB\u0100ct\u12D6\u12DBr;\uC000\u{1D4AF}rok;\u4166\u0AE1\u12F7\u130E\u131A\u1326\0\u132C\u1331\0\0\0\0\0\u1338\u133D\u1377\u1385\0\u13FF\u1404\u140A\u1410\u0100cr\u12FB\u1301ute\u803B\xDA\u40DAr\u0100;o\u1307\u1308\u619Fcir;\u6949r\u01E3\u1313\0\u1316y;\u440Eve;\u416C\u0100iy\u131E\u1323rc\u803B\xDB\u40DB;\u4423blac;\u4170r;\uC000\u{1D518}rave\u803B\xD9\u40D9acr;\u416A\u0100di\u1341\u1369er\u0100BP\u1348\u135D\u0100ar\u134D\u1350r;\u405Fac\u0100ek\u1357\u1359;\u63DFet;\u63B5arenthesis;\u63DDon\u0100;P\u1370\u1371\u62C3lus;\u628E\u0100gp\u137B\u137Fon;\u4172f;\uC000\u{1D54C}\u0400ADETadps\u1395\u13AE\u13B8\u13C4\u03E8\u13D2\u13D7\u13F3rrow\u0180;BD\u1150\u13A0\u13A4ar;\u6912ownArrow;\u61C5ownArrow;\u6195quilibrium;\u696Eee\u0100;A\u13CB\u13CC\u62A5rrow;\u61A5own\xE1\u03F3er\u0100LR\u13DE\u13E8eftArrow;\u6196ightArrow;\u6197i\u0100;l\u13F9\u13FA\u43D2on;\u43A5ing;\u416Ecr;\uC000\u{1D4B0}ilde;\u4168ml\u803B\xDC\u40DC\u0480Dbcdefosv\u1427\u142C\u1430\u1433\u143E\u1485\u148A\u1490\u1496ash;\u62ABar;\u6AEBy;\u4412ash\u0100;l\u143B\u143C\u62A9;\u6AE6\u0100er\u1443\u1445;\u62C1\u0180bty\u144C\u1450\u147Aar;\u6016\u0100;i\u144F\u1455cal\u0200BLST\u1461\u1465\u146A\u1474ar;\u6223ine;\u407Ceparator;\u6758ilde;\u6240ThinSpace;\u600Ar;\uC000\u{1D519}pf;\uC000\u{1D54D}cr;\uC000\u{1D4B1}dash;\u62AA\u0280cefos\u14A7\u14AC\u14B1\u14B6\u14BCirc;\u4174dge;\u62C0r;\uC000\u{1D51A}pf;\uC000\u{1D54E}cr;\uC000\u{1D4B2}\u0200fios\u14CB\u14D0\u14D2\u14D8r;\uC000\u{1D51B};\u439Epf;\uC000\u{1D54F}cr;\uC000\u{1D4B3}\u0480AIUacfosu\u14F1\u14F5\u14F9\u14FD\u1504\u150F\u1514\u151A\u1520cy;\u442Fcy;\u4407cy;\u442Ecute\u803B\xDD\u40DD\u0100iy\u1509\u150Drc;\u4176;\u442Br;\uC000\u{1D51C}pf;\uC000\u{1D550}cr;\uC000\u{1D4B4}ml;\u4178\u0400Hacdefos\u1535\u1539\u153F\u154B\u154F\u155D\u1560\u1564cy;\u4416cute;\u4179\u0100ay\u1544\u1549ron;\u417D;\u4417ot;\u417B\u01F2\u1554\0\u155BoWidt\xE8\u0AD9a;\u4396r;\u6128pf;\u6124cr;\uC000\u{1D4B5}\u0BE1\u1583\u158A\u1590\0\u15B0\u15B6\u15BF\0\0\0\0\u15C6\u15DB\u15EB\u165F\u166D\0\u1695\u169B\u16B2\u16B9\0\u16BEcute\u803B\xE1\u40E1reve;\u4103\u0300;Ediuy\u159C\u159D\u15A1\u15A3\u15A8\u15AD\u623E;\uC000\u223E\u0333;\u623Frc\u803B\xE2\u40E2te\u80BB\xB4\u0306;\u4430lig\u803B\xE6\u40E6\u0100;r\xB2\u15BA;\uC000\u{1D51E}rave\u803B\xE0\u40E0\u0100ep\u15CA\u15D6\u0100fp\u15CF\u15D4sym;\u6135\xE8\u15D3ha;\u43B1\u0100ap\u15DFc\u0100cl\u15E4\u15E7r;\u4101g;\u6A3F\u0264\u15F0\0\0\u160A\u0280;adsv\u15FA\u15FB\u15FF\u1601\u1607\u6227nd;\u6A55;\u6A5Clope;\u6A58;\u6A5A\u0380;elmrsz\u1618\u1619\u161B\u161E\u163F\u164F\u1659\u6220;\u69A4e\xBB\u1619sd\u0100;a\u1625\u1626\u6221\u0461\u1630\u1632\u1634\u1636\u1638\u163A\u163C\u163E;\u69A8;\u69A9;\u69AA;\u69AB;\u69AC;\u69AD;\u69AE;\u69AFt\u0100;v\u1645\u1646\u621Fb\u0100;d\u164C\u164D\u62BE;\u699D\u0100pt\u1654\u1657h;\u6222\xBB\xB9arr;\u637C\u0100gp\u1663\u1667on;\u4105f;\uC000\u{1D552}\u0380;Eaeiop\u12C1\u167B\u167D\u1682\u1684\u1687\u168A;\u6A70cir;\u6A6F;\u624Ad;\u624Bs;\u4027rox\u0100;e\u12C1\u1692\xF1\u1683ing\u803B\xE5\u40E5\u0180cty\u16A1\u16A6\u16A8r;\uC000\u{1D4B6};\u402Amp\u0100;e\u12C1\u16AF\xF1\u0288ilde\u803B\xE3\u40E3ml\u803B\xE4\u40E4\u0100ci\u16C2\u16C8onin\xF4\u0272nt;\u6A11\u0800Nabcdefiklnoprsu\u16ED\u16F1\u1730\u173C\u1743\u1748\u1778\u177D\u17E0\u17E6\u1839\u1850\u170D\u193D\u1948\u1970ot;\u6AED\u0100cr\u16F6\u171Ek\u0200ceps\u1700\u1705\u170D\u1713ong;\u624Cpsilon;\u43F6rime;\u6035im\u0100;e\u171A\u171B\u623Dq;\u62CD\u0176\u1722\u1726ee;\u62BDed\u0100;g\u172C\u172D\u6305e\xBB\u172Drk\u0100;t\u135C\u1737brk;\u63B6\u0100oy\u1701\u1741;\u4431quo;\u601E\u0280cmprt\u1753\u175B\u1761\u1764\u1768aus\u0100;e\u010A\u0109ptyv;\u69B0s\xE9\u170Cno\xF5\u0113\u0180ahw\u176F\u1771\u1773;\u43B2;\u6136een;\u626Cr;\uC000\u{1D51F}g\u0380costuvw\u178D\u179D\u17B3\u17C1\u17D5\u17DB\u17DE\u0180aiu\u1794\u1796\u179A\xF0\u0760rc;\u65EFp\xBB\u1371\u0180dpt\u17A4\u17A8\u17ADot;\u6A00lus;\u6A01imes;\u6A02\u0271\u17B9\0\0\u17BEcup;\u6A06ar;\u6605riangle\u0100du\u17CD\u17D2own;\u65BDp;\u65B3plus;\u6A04e\xE5\u1444\xE5\u14ADarow;\u690D\u0180ako\u17ED\u1826\u1835\u0100cn\u17F2\u1823k\u0180lst\u17FA\u05AB\u1802ozenge;\u69EBriangle\u0200;dlr\u1812\u1813\u1818\u181D\u65B4own;\u65BEeft;\u65C2ight;\u65B8k;\u6423\u01B1\u182B\0\u1833\u01B2\u182F\0\u1831;\u6592;\u65914;\u6593ck;\u6588\u0100eo\u183E\u184D\u0100;q\u1843\u1846\uC000=\u20E5uiv;\uC000\u2261\u20E5t;\u6310\u0200ptwx\u1859\u185E\u1867\u186Cf;\uC000\u{1D553}\u0100;t\u13CB\u1863om\xBB\u13CCtie;\u62C8\u0600DHUVbdhmptuv\u1885\u1896\u18AA\u18BB\u18D7\u18DB\u18EC\u18FF\u1905\u190A\u1910\u1921\u0200LRlr\u188E\u1890\u1892\u1894;\u6557;\u6554;\u6556;\u6553\u0280;DUdu\u18A1\u18A2\u18A4\u18A6\u18A8\u6550;\u6566;\u6569;\u6564;\u6567\u0200LRlr\u18B3\u18B5\u18B7\u18B9;\u655D;\u655A;\u655C;\u6559\u0380;HLRhlr\u18CA\u18CB\u18CD\u18CF\u18D1\u18D3\u18D5\u6551;\u656C;\u6563;\u6560;\u656B;\u6562;\u655Fox;\u69C9\u0200LRlr\u18E4\u18E6\u18E8\u18EA;\u6555;\u6552;\u6510;\u650C\u0280;DUdu\u06BD\u18F7\u18F9\u18FB\u18FD;\u6565;\u6568;\u652C;\u6534inus;\u629Flus;\u629Eimes;\u62A0\u0200LRlr\u1919\u191B\u191D\u191F;\u655B;\u6558;\u6518;\u6514\u0380;HLRhlr\u1930\u1931\u1933\u1935\u1937\u1939\u193B\u6502;\u656A;\u6561;\u655E;\u653C;\u6524;\u651C\u0100ev\u0123\u1942bar\u803B\xA6\u40A6\u0200ceio\u1951\u1956\u195A\u1960r;\uC000\u{1D4B7}mi;\u604Fm\u0100;e\u171A\u171Cl\u0180;bh\u1968\u1969\u196B\u405C;\u69C5sub;\u67C8\u016C\u1974\u197El\u0100;e\u1979\u197A\u6022t\xBB\u197Ap\u0180;Ee\u012F\u1985\u1987;\u6AAE\u0100;q\u06DC\u06DB\u0CE1\u19A7\0\u19E8\u1A11\u1A15\u1A32\0\u1A37\u1A50\0\0\u1AB4\0\0\u1AC1\0\0\u1B21\u1B2E\u1B4D\u1B52\0\u1BFD\0\u1C0C\u0180cpr\u19AD\u19B2\u19DDute;\u4107\u0300;abcds\u19BF\u19C0\u19C4\u19CA\u19D5\u19D9\u6229nd;\u6A44rcup;\u6A49\u0100au\u19CF\u19D2p;\u6A4Bp;\u6A47ot;\u6A40;\uC000\u2229\uFE00\u0100eo\u19E2\u19E5t;\u6041\xEE\u0693\u0200aeiu\u19F0\u19FB\u1A01\u1A05\u01F0\u19F5\0\u19F8s;\u6A4Don;\u410Ddil\u803B\xE7\u40E7rc;\u4109ps\u0100;s\u1A0C\u1A0D\u6A4Cm;\u6A50ot;\u410B\u0180dmn\u1A1B\u1A20\u1A26il\u80BB\xB8\u01ADptyv;\u69B2t\u8100\xA2;e\u1A2D\u1A2E\u40A2r\xE4\u01B2r;\uC000\u{1D520}\u0180cei\u1A3D\u1A40\u1A4Dy;\u4447ck\u0100;m\u1A47\u1A48\u6713ark\xBB\u1A48;\u43C7r\u0380;Ecefms\u1A5F\u1A60\u1A62\u1A6B\u1AA4\u1AAA\u1AAE\u65CB;\u69C3\u0180;el\u1A69\u1A6A\u1A6D\u42C6q;\u6257e\u0261\u1A74\0\0\u1A88rrow\u0100lr\u1A7C\u1A81eft;\u61BAight;\u61BB\u0280RSacd\u1A92\u1A94\u1A96\u1A9A\u1A9F\xBB\u0F47;\u64C8st;\u629Birc;\u629Aash;\u629Dnint;\u6A10id;\u6AEFcir;\u69C2ubs\u0100;u\u1ABB\u1ABC\u6663it\xBB\u1ABC\u02EC\u1AC7\u1AD4\u1AFA\0\u1B0Aon\u0100;e\u1ACD\u1ACE\u403A\u0100;q\xC7\xC6\u026D\u1AD9\0\0\u1AE2a\u0100;t\u1ADE\u1ADF\u402C;\u4040\u0180;fl\u1AE8\u1AE9\u1AEB\u6201\xEE\u1160e\u0100mx\u1AF1\u1AF6ent\xBB\u1AE9e\xF3\u024D\u01E7\u1AFE\0\u1B07\u0100;d\u12BB\u1B02ot;\u6A6Dn\xF4\u0246\u0180fry\u1B10\u1B14\u1B17;\uC000\u{1D554}o\xE4\u0254\u8100\xA9;s\u0155\u1B1Dr;\u6117\u0100ao\u1B25\u1B29rr;\u61B5ss;\u6717\u0100cu\u1B32\u1B37r;\uC000\u{1D4B8}\u0100bp\u1B3C\u1B44\u0100;e\u1B41\u1B42\u6ACF;\u6AD1\u0100;e\u1B49\u1B4A\u6AD0;\u6AD2dot;\u62EF\u0380delprvw\u1B60\u1B6C\u1B77\u1B82\u1BAC\u1BD4\u1BF9arr\u0100lr\u1B68\u1B6A;\u6938;\u6935\u0270\u1B72\0\0\u1B75r;\u62DEc;\u62DFarr\u0100;p\u1B7F\u1B80\u61B6;\u693D\u0300;bcdos\u1B8F\u1B90\u1B96\u1BA1\u1BA5\u1BA8\u622Arcap;\u6A48\u0100au\u1B9B\u1B9Ep;\u6A46p;\u6A4Aot;\u628Dr;\u6A45;\uC000\u222A\uFE00\u0200alrv\u1BB5\u1BBF\u1BDE\u1BE3rr\u0100;m\u1BBC\u1BBD\u61B7;\u693Cy\u0180evw\u1BC7\u1BD4\u1BD8q\u0270\u1BCE\0\0\u1BD2re\xE3\u1B73u\xE3\u1B75ee;\u62CEedge;\u62CFen\u803B\xA4\u40A4earrow\u0100lr\u1BEE\u1BF3eft\xBB\u1B80ight\xBB\u1BBDe\xE4\u1BDD\u0100ci\u1C01\u1C07onin\xF4\u01F7nt;\u6231lcty;\u632D\u0980AHabcdefhijlorstuwz\u1C38\u1C3B\u1C3F\u1C5D\u1C69\u1C75\u1C8A\u1C9E\u1CAC\u1CB7\u1CFB\u1CFF\u1D0D\u1D7B\u1D91\u1DAB\u1DBB\u1DC6\u1DCDr\xF2\u0381ar;\u6965\u0200glrs\u1C48\u1C4D\u1C52\u1C54ger;\u6020eth;\u6138\xF2\u1133h\u0100;v\u1C5A\u1C5B\u6010\xBB\u090A\u016B\u1C61\u1C67arow;\u690Fa\xE3\u0315\u0100ay\u1C6E\u1C73ron;\u410F;\u4434\u0180;ao\u0332\u1C7C\u1C84\u0100gr\u02BF\u1C81r;\u61CAtseq;\u6A77\u0180glm\u1C91\u1C94\u1C98\u803B\xB0\u40B0ta;\u43B4ptyv;\u69B1\u0100ir\u1CA3\u1CA8sht;\u697F;\uC000\u{1D521}ar\u0100lr\u1CB3\u1CB5\xBB\u08DC\xBB\u101E\u0280aegsv\u1CC2\u0378\u1CD6\u1CDC\u1CE0m\u0180;os\u0326\u1CCA\u1CD4nd\u0100;s\u0326\u1CD1uit;\u6666amma;\u43DDin;\u62F2\u0180;io\u1CE7\u1CE8\u1CF8\u40F7de\u8100\xF7;o\u1CE7\u1CF0ntimes;\u62C7n\xF8\u1CF7cy;\u4452c\u026F\u1D06\0\0\u1D0Arn;\u631Eop;\u630D\u0280lptuw\u1D18\u1D1D\u1D22\u1D49\u1D55lar;\u4024f;\uC000\u{1D555}\u0280;emps\u030B\u1D2D\u1D37\u1D3D\u1D42q\u0100;d\u0352\u1D33ot;\u6251inus;\u6238lus;\u6214quare;\u62A1blebarwedg\xE5\xFAn\u0180adh\u112E\u1D5D\u1D67ownarrow\xF3\u1C83arpoon\u0100lr\u1D72\u1D76ef\xF4\u1CB4igh\xF4\u1CB6\u0162\u1D7F\u1D85karo\xF7\u0F42\u026F\u1D8A\0\0\u1D8Ern;\u631Fop;\u630C\u0180cot\u1D98\u1DA3\u1DA6\u0100ry\u1D9D\u1DA1;\uC000\u{1D4B9};\u4455l;\u69F6rok;\u4111\u0100dr\u1DB0\u1DB4ot;\u62F1i\u0100;f\u1DBA\u1816\u65BF\u0100ah\u1DC0\u1DC3r\xF2\u0429a\xF2\u0FA6angle;\u69A6\u0100ci\u1DD2\u1DD5y;\u445Fgrarr;\u67FF\u0900Dacdefglmnopqrstux\u1E01\u1E09\u1E19\u1E38\u0578\u1E3C\u1E49\u1E61\u1E7E\u1EA5\u1EAF\u1EBD\u1EE1\u1F2A\u1F37\u1F44\u1F4E\u1F5A\u0100Do\u1E06\u1D34o\xF4\u1C89\u0100cs\u1E0E\u1E14ute\u803B\xE9\u40E9ter;\u6A6E\u0200aioy\u1E22\u1E27\u1E31\u1E36ron;\u411Br\u0100;c\u1E2D\u1E2E\u6256\u803B\xEA\u40EAlon;\u6255;\u444Dot;\u4117\u0100Dr\u1E41\u1E45ot;\u6252;\uC000\u{1D522}\u0180;rs\u1E50\u1E51\u1E57\u6A9Aave\u803B\xE8\u40E8\u0100;d\u1E5C\u1E5D\u6A96ot;\u6A98\u0200;ils\u1E6A\u1E6B\u1E72\u1E74\u6A99nters;\u63E7;\u6113\u0100;d\u1E79\u1E7A\u6A95ot;\u6A97\u0180aps\u1E85\u1E89\u1E97cr;\u4113ty\u0180;sv\u1E92\u1E93\u1E95\u6205et\xBB\u1E93p\u01001;\u1E9D\u1EA4\u0133\u1EA1\u1EA3;\u6004;\u6005\u6003\u0100gs\u1EAA\u1EAC;\u414Bp;\u6002\u0100gp\u1EB4\u1EB8on;\u4119f;\uC000\u{1D556}\u0180als\u1EC4\u1ECE\u1ED2r\u0100;s\u1ECA\u1ECB\u62D5l;\u69E3us;\u6A71i\u0180;lv\u1EDA\u1EDB\u1EDF\u43B5on\xBB\u1EDB;\u43F5\u0200csuv\u1EEA\u1EF3\u1F0B\u1F23\u0100io\u1EEF\u1E31rc\xBB\u1E2E\u0269\u1EF9\0\0\u1EFB\xED\u0548ant\u0100gl\u1F02\u1F06tr\xBB\u1E5Dess\xBB\u1E7A\u0180aei\u1F12\u1F16\u1F1Als;\u403Dst;\u625Fv\u0100;D\u0235\u1F20D;\u6A78parsl;\u69E5\u0100Da\u1F2F\u1F33ot;\u6253rr;\u6971\u0180cdi\u1F3E\u1F41\u1EF8r;\u612Fo\xF4\u0352\u0100ah\u1F49\u1F4B;\u43B7\u803B\xF0\u40F0\u0100mr\u1F53\u1F57l\u803B\xEB\u40EBo;\u60AC\u0180cip\u1F61\u1F64\u1F67l;\u4021s\xF4\u056E\u0100eo\u1F6C\u1F74ctatio\xEE\u0559nential\xE5\u0579\u09E1\u1F92\0\u1F9E\0\u1FA1\u1FA7\0\0\u1FC6\u1FCC\0\u1FD3\0\u1FE6\u1FEA\u2000\0\u2008\u205Allingdotse\xF1\u1E44y;\u4444male;\u6640\u0180ilr\u1FAD\u1FB3\u1FC1lig;\u8000\uFB03\u0269\u1FB9\0\0\u1FBDg;\u8000\uFB00ig;\u8000\uFB04;\uC000\u{1D523}lig;\u8000\uFB01lig;\uC000fj\u0180alt\u1FD9\u1FDC\u1FE1t;\u666Dig;\u8000\uFB02ns;\u65B1of;\u4192\u01F0\u1FEE\0\u1FF3f;\uC000\u{1D557}\u0100ak\u05BF\u1FF7\u0100;v\u1FFC\u1FFD\u62D4;\u6AD9artint;\u6A0D\u0100ao\u200C\u2055\u0100cs\u2011\u2052\u03B1\u201A\u2030\u2038\u2045\u2048\0\u2050\u03B2\u2022\u2025\u2027\u202A\u202C\0\u202E\u803B\xBD\u40BD;\u6153\u803B\xBC\u40BC;\u6155;\u6159;\u615B\u01B3\u2034\0\u2036;\u6154;\u6156\u02B4\u203E\u2041\0\0\u2043\u803B\xBE\u40BE;\u6157;\u615C5;\u6158\u01B6\u204C\0\u204E;\u615A;\u615D8;\u615El;\u6044wn;\u6322cr;\uC000\u{1D4BB}\u0880Eabcdefgijlnorstv\u2082\u2089\u209F\u20A5\u20B0\u20B4\u20F0\u20F5\u20FA\u20FF\u2103\u2112\u2138\u0317\u213E\u2152\u219E\u0100;l\u064D\u2087;\u6A8C\u0180cmp\u2090\u2095\u209Dute;\u41F5ma\u0100;d\u209C\u1CDA\u43B3;\u6A86reve;\u411F\u0100iy\u20AA\u20AErc;\u411D;\u4433ot;\u4121\u0200;lqs\u063E\u0642\u20BD\u20C9\u0180;qs\u063E\u064C\u20C4lan\xF4\u0665\u0200;cdl\u0665\u20D2\u20D5\u20E5c;\u6AA9ot\u0100;o\u20DC\u20DD\u6A80\u0100;l\u20E2\u20E3\u6A82;\u6A84\u0100;e\u20EA\u20ED\uC000\u22DB\uFE00s;\u6A94r;\uC000\u{1D524}\u0100;g\u0673\u061Bmel;\u6137cy;\u4453\u0200;Eaj\u065A\u210C\u210E\u2110;\u6A92;\u6AA5;\u6AA4\u0200Eaes\u211B\u211D\u2129\u2134;\u6269p\u0100;p\u2123\u2124\u6A8Arox\xBB\u2124\u0100;q\u212E\u212F\u6A88\u0100;q\u212E\u211Bim;\u62E7pf;\uC000\u{1D558}\u0100ci\u2143\u2146r;\u610Am\u0180;el\u066B\u214E\u2150;\u6A8E;\u6A90\u8300>;cdlqr\u05EE\u2160\u216A\u216E\u2173\u2179\u0100ci\u2165\u2167;\u6AA7r;\u6A7Aot;\u62D7Par;\u6995uest;\u6A7C\u0280adels\u2184\u216A\u2190\u0656\u219B\u01F0\u2189\0\u218Epro\xF8\u209Er;\u6978q\u0100lq\u063F\u2196les\xF3\u2088i\xED\u066B\u0100en\u21A3\u21ADrtneqq;\uC000\u2269\uFE00\xC5\u21AA\u0500Aabcefkosy\u21C4\u21C7\u21F1\u21F5\u21FA\u2218\u221D\u222F\u2268\u227Dr\xF2\u03A0\u0200ilmr\u21D0\u21D4\u21D7\u21DBrs\xF0\u1484f\xBB\u2024il\xF4\u06A9\u0100dr\u21E0\u21E4cy;\u444A\u0180;cw\u08F4\u21EB\u21EFir;\u6948;\u61ADar;\u610Firc;\u4125\u0180alr\u2201\u220E\u2213rts\u0100;u\u2209\u220A\u6665it\xBB\u220Alip;\u6026con;\u62B9r;\uC000\u{1D525}s\u0100ew\u2223\u2229arow;\u6925arow;\u6926\u0280amopr\u223A\u223E\u2243\u225E\u2263rr;\u61FFtht;\u623Bk\u0100lr\u2249\u2253eftarrow;\u61A9ightarrow;\u61AAf;\uC000\u{1D559}bar;\u6015\u0180clt\u226F\u2274\u2278r;\uC000\u{1D4BD}as\xE8\u21F4rok;\u4127\u0100bp\u2282\u2287ull;\u6043hen\xBB\u1C5B\u0AE1\u22A3\0\u22AA\0\u22B8\u22C5\u22CE\0\u22D5\u22F3\0\0\u22F8\u2322\u2367\u2362\u237F\0\u2386\u23AA\u23B4cute\u803B\xED\u40ED\u0180;iy\u0771\u22B0\u22B5rc\u803B\xEE\u40EE;\u4438\u0100cx\u22BC\u22BFy;\u4435cl\u803B\xA1\u40A1\u0100fr\u039F\u22C9;\uC000\u{1D526}rave\u803B\xEC\u40EC\u0200;ino\u073E\u22DD\u22E9\u22EE\u0100in\u22E2\u22E6nt;\u6A0Ct;\u622Dfin;\u69DCta;\u6129lig;\u4133\u0180aop\u22FE\u231A\u231D\u0180cgt\u2305\u2308\u2317r;\u412B\u0180elp\u071F\u230F\u2313in\xE5\u078Ear\xF4\u0720h;\u4131f;\u62B7ed;\u41B5\u0280;cfot\u04F4\u232C\u2331\u233D\u2341are;\u6105in\u0100;t\u2338\u2339\u621Eie;\u69DDdo\xF4\u2319\u0280;celp\u0757\u234C\u2350\u235B\u2361al;\u62BA\u0100gr\u2355\u2359er\xF3\u1563\xE3\u234Darhk;\u6A17rod;\u6A3C\u0200cgpt\u236F\u2372\u2376\u237By;\u4451on;\u412Ff;\uC000\u{1D55A}a;\u43B9uest\u803B\xBF\u40BF\u0100ci\u238A\u238Fr;\uC000\u{1D4BE}n\u0280;Edsv\u04F4\u239B\u239D\u23A1\u04F3;\u62F9ot;\u62F5\u0100;v\u23A6\u23A7\u62F4;\u62F3\u0100;i\u0777\u23AElde;\u4129\u01EB\u23B8\0\u23BCcy;\u4456l\u803B\xEF\u40EF\u0300cfmosu\u23CC\u23D7\u23DC\u23E1\u23E7\u23F5\u0100iy\u23D1\u23D5rc;\u4135;\u4439r;\uC000\u{1D527}ath;\u4237pf;\uC000\u{1D55B}\u01E3\u23EC\0\u23F1r;\uC000\u{1D4BF}rcy;\u4458kcy;\u4454\u0400acfghjos\u240B\u2416\u2422\u2427\u242D\u2431\u2435\u243Bppa\u0100;v\u2413\u2414\u43BA;\u43F0\u0100ey\u241B\u2420dil;\u4137;\u443Ar;\uC000\u{1D528}reen;\u4138cy;\u4445cy;\u445Cpf;\uC000\u{1D55C}cr;\uC000\u{1D4C0}\u0B80ABEHabcdefghjlmnoprstuv\u2470\u2481\u2486\u248D\u2491\u250E\u253D\u255A\u2580\u264E\u265E\u2665\u2679\u267D\u269A\u26B2\u26D8\u275D\u2768\u278B\u27C0\u2801\u2812\u0180art\u2477\u247A\u247Cr\xF2\u09C6\xF2\u0395ail;\u691Barr;\u690E\u0100;g\u0994\u248B;\u6A8Bar;\u6962\u0963\u24A5\0\u24AA\0\u24B1\0\0\0\0\0\u24B5\u24BA\0\u24C6\u24C8\u24CD\0\u24F9ute;\u413Amptyv;\u69B4ra\xEE\u084Cbda;\u43BBg\u0180;dl\u088E\u24C1\u24C3;\u6991\xE5\u088E;\u6A85uo\u803B\xAB\u40ABr\u0400;bfhlpst\u0899\u24DE\u24E6\u24E9\u24EB\u24EE\u24F1\u24F5\u0100;f\u089D\u24E3s;\u691Fs;\u691D\xEB\u2252p;\u61ABl;\u6939im;\u6973l;\u61A2\u0180;ae\u24FF\u2500\u2504\u6AABil;\u6919\u0100;s\u2509\u250A\u6AAD;\uC000\u2AAD\uFE00\u0180abr\u2515\u2519\u251Drr;\u690Crk;\u6772\u0100ak\u2522\u252Cc\u0100ek\u2528\u252A;\u407B;\u405B\u0100es\u2531\u2533;\u698Bl\u0100du\u2539\u253B;\u698F;\u698D\u0200aeuy\u2546\u254B\u2556\u2558ron;\u413E\u0100di\u2550\u2554il;\u413C\xEC\u08B0\xE2\u2529;\u443B\u0200cqrs\u2563\u2566\u256D\u257Da;\u6936uo\u0100;r\u0E19\u1746\u0100du\u2572\u2577har;\u6967shar;\u694Bh;\u61B2\u0280;fgqs\u258B\u258C\u0989\u25F3\u25FF\u6264t\u0280ahlrt\u2598\u25A4\u25B7\u25C2\u25E8rrow\u0100;t\u0899\u25A1a\xE9\u24F6arpoon\u0100du\u25AF\u25B4own\xBB\u045Ap\xBB\u0966eftarrows;\u61C7ight\u0180ahs\u25CD\u25D6\u25DErrow\u0100;s\u08F4\u08A7arpoon\xF3\u0F98quigarro\xF7\u21F0hreetimes;\u62CB\u0180;qs\u258B\u0993\u25FAlan\xF4\u09AC\u0280;cdgs\u09AC\u260A\u260D\u261D\u2628c;\u6AA8ot\u0100;o\u2614\u2615\u6A7F\u0100;r\u261A\u261B\u6A81;\u6A83\u0100;e\u2622\u2625\uC000\u22DA\uFE00s;\u6A93\u0280adegs\u2633\u2639\u263D\u2649\u264Bppro\xF8\u24C6ot;\u62D6q\u0100gq\u2643\u2645\xF4\u0989gt\xF2\u248C\xF4\u099Bi\xED\u09B2\u0180ilr\u2655\u08E1\u265Asht;\u697C;\uC000\u{1D529}\u0100;E\u099C\u2663;\u6A91\u0161\u2669\u2676r\u0100du\u25B2\u266E\u0100;l\u0965\u2673;\u696Alk;\u6584cy;\u4459\u0280;acht\u0A48\u2688\u268B\u2691\u2696r\xF2\u25C1orne\xF2\u1D08ard;\u696Bri;\u65FA\u0100io\u269F\u26A4dot;\u4140ust\u0100;a\u26AC\u26AD\u63B0che\xBB\u26AD\u0200Eaes\u26BB\u26BD\u26C9\u26D4;\u6268p\u0100;p\u26C3\u26C4\u6A89rox\xBB\u26C4\u0100;q\u26CE\u26CF\u6A87\u0100;q\u26CE\u26BBim;\u62E6\u0400abnoptwz\u26E9\u26F4\u26F7\u271A\u272F\u2741\u2747\u2750\u0100nr\u26EE\u26F1g;\u67ECr;\u61FDr\xEB\u08C1g\u0180lmr\u26FF\u270D\u2714eft\u0100ar\u09E6\u2707ight\xE1\u09F2apsto;\u67FCight\xE1\u09FDparrow\u0100lr\u2725\u2729ef\xF4\u24EDight;\u61AC\u0180afl\u2736\u2739\u273Dr;\u6985;\uC000\u{1D55D}us;\u6A2Dimes;\u6A34\u0161\u274B\u274Fst;\u6217\xE1\u134E\u0180;ef\u2757\u2758\u1800\u65CAnge\xBB\u2758ar\u0100;l\u2764\u2765\u4028t;\u6993\u0280achmt\u2773\u2776\u277C\u2785\u2787r\xF2\u08A8orne\xF2\u1D8Car\u0100;d\u0F98\u2783;\u696D;\u600Eri;\u62BF\u0300achiqt\u2798\u279D\u0A40\u27A2\u27AE\u27BBquo;\u6039r;\uC000\u{1D4C1}m\u0180;eg\u09B2\u27AA\u27AC;\u6A8D;\u6A8F\u0100bu\u252A\u27B3o\u0100;r\u0E1F\u27B9;\u601Arok;\u4142\u8400<;cdhilqr\u082B\u27D2\u2639\u27DC\u27E0\u27E5\u27EA\u27F0\u0100ci\u27D7\u27D9;\u6AA6r;\u6A79re\xE5\u25F2mes;\u62C9arr;\u6976uest;\u6A7B\u0100Pi\u27F5\u27F9ar;\u6996\u0180;ef\u2800\u092D\u181B\u65C3r\u0100du\u2807\u280Dshar;\u694Ahar;\u6966\u0100en\u2817\u2821rtneqq;\uC000\u2268\uFE00\xC5\u281E\u0700Dacdefhilnopsu\u2840\u2845\u2882\u288E\u2893\u28A0\u28A5\u28A8\u28DA\u28E2\u28E4\u0A83\u28F3\u2902Dot;\u623A\u0200clpr\u284E\u2852\u2863\u287Dr\u803B\xAF\u40AF\u0100et\u2857\u2859;\u6642\u0100;e\u285E\u285F\u6720se\xBB\u285F\u0100;s\u103B\u2868to\u0200;dlu\u103B\u2873\u2877\u287Bow\xEE\u048Cef\xF4\u090F\xF0\u13D1ker;\u65AE\u0100oy\u2887\u288Cmma;\u6A29;\u443Cash;\u6014asuredangle\xBB\u1626r;\uC000\u{1D52A}o;\u6127\u0180cdn\u28AF\u28B4\u28C9ro\u803B\xB5\u40B5\u0200;acd\u1464\u28BD\u28C0\u28C4s\xF4\u16A7ir;\u6AF0ot\u80BB\xB7\u01B5us\u0180;bd\u28D2\u1903\u28D3\u6212\u0100;u\u1D3C\u28D8;\u6A2A\u0163\u28DE\u28E1p;\u6ADB\xF2\u2212\xF0\u0A81\u0100dp\u28E9\u28EEels;\u62A7f;\uC000\u{1D55E}\u0100ct\u28F8\u28FDr;\uC000\u{1D4C2}pos\xBB\u159D\u0180;lm\u2909\u290A\u290D\u43BCtimap;\u62B8\u0C00GLRVabcdefghijlmoprstuvw\u2942\u2953\u297E\u2989\u2998\u29DA\u29E9\u2A15\u2A1A\u2A58\u2A5D\u2A83\u2A95\u2AA4\u2AA8\u2B04\u2B07\u2B44\u2B7F\u2BAE\u2C34\u2C67\u2C7C\u2CE9\u0100gt\u2947\u294B;\uC000\u22D9\u0338\u0100;v\u2950\u0BCF\uC000\u226B\u20D2\u0180elt\u295A\u2972\u2976ft\u0100ar\u2961\u2967rrow;\u61CDightarrow;\u61CE;\uC000\u22D8\u0338\u0100;v\u297B\u0C47\uC000\u226A\u20D2ightarrow;\u61CF\u0100Dd\u298E\u2993ash;\u62AFash;\u62AE\u0280bcnpt\u29A3\u29A7\u29AC\u29B1\u29CCla\xBB\u02DEute;\u4144g;\uC000\u2220\u20D2\u0280;Eiop\u0D84\u29BC\u29C0\u29C5\u29C8;\uC000\u2A70\u0338d;\uC000\u224B\u0338s;\u4149ro\xF8\u0D84ur\u0100;a\u29D3\u29D4\u666El\u0100;s\u29D3\u0B38\u01F3\u29DF\0\u29E3p\u80BB\xA0\u0B37mp\u0100;e\u0BF9\u0C00\u0280aeouy\u29F4\u29FE\u2A03\u2A10\u2A13\u01F0\u29F9\0\u29FB;\u6A43on;\u4148dil;\u4146ng\u0100;d\u0D7E\u2A0Aot;\uC000\u2A6D\u0338p;\u6A42;\u443Dash;\u6013\u0380;Aadqsx\u0B92\u2A29\u2A2D\u2A3B\u2A41\u2A45\u2A50rr;\u61D7r\u0100hr\u2A33\u2A36k;\u6924\u0100;o\u13F2\u13F0ot;\uC000\u2250\u0338ui\xF6\u0B63\u0100ei\u2A4A\u2A4Ear;\u6928\xED\u0B98ist\u0100;s\u0BA0\u0B9Fr;\uC000\u{1D52B}\u0200Eest\u0BC5\u2A66\u2A79\u2A7C\u0180;qs\u0BBC\u2A6D\u0BE1\u0180;qs\u0BBC\u0BC5\u2A74lan\xF4\u0BE2i\xED\u0BEA\u0100;r\u0BB6\u2A81\xBB\u0BB7\u0180Aap\u2A8A\u2A8D\u2A91r\xF2\u2971rr;\u61AEar;\u6AF2\u0180;sv\u0F8D\u2A9C\u0F8C\u0100;d\u2AA1\u2AA2\u62FC;\u62FAcy;\u445A\u0380AEadest\u2AB7\u2ABA\u2ABE\u2AC2\u2AC5\u2AF6\u2AF9r\xF2\u2966;\uC000\u2266\u0338rr;\u619Ar;\u6025\u0200;fqs\u0C3B\u2ACE\u2AE3\u2AEFt\u0100ar\u2AD4\u2AD9rro\xF7\u2AC1ightarro\xF7\u2A90\u0180;qs\u0C3B\u2ABA\u2AEAlan\xF4\u0C55\u0100;s\u0C55\u2AF4\xBB\u0C36i\xED\u0C5D\u0100;r\u0C35\u2AFEi\u0100;e\u0C1A\u0C25i\xE4\u0D90\u0100pt\u2B0C\u2B11f;\uC000\u{1D55F}\u8180\xAC;in\u2B19\u2B1A\u2B36\u40ACn\u0200;Edv\u0B89\u2B24\u2B28\u2B2E;\uC000\u22F9\u0338ot;\uC000\u22F5\u0338\u01E1\u0B89\u2B33\u2B35;\u62F7;\u62F6i\u0100;v\u0CB8\u2B3C\u01E1\u0CB8\u2B41\u2B43;\u62FE;\u62FD\u0180aor\u2B4B\u2B63\u2B69r\u0200;ast\u0B7B\u2B55\u2B5A\u2B5Flle\xEC\u0B7Bl;\uC000\u2AFD\u20E5;\uC000\u2202\u0338lint;\u6A14\u0180;ce\u0C92\u2B70\u2B73u\xE5\u0CA5\u0100;c\u0C98\u2B78\u0100;e\u0C92\u2B7D\xF1\u0C98\u0200Aait\u2B88\u2B8B\u2B9D\u2BA7r\xF2\u2988rr\u0180;cw\u2B94\u2B95\u2B99\u619B;\uC000\u2933\u0338;\uC000\u219D\u0338ghtarrow\xBB\u2B95ri\u0100;e\u0CCB\u0CD6\u0380chimpqu\u2BBD\u2BCD\u2BD9\u2B04\u0B78\u2BE4\u2BEF\u0200;cer\u0D32\u2BC6\u0D37\u2BC9u\xE5\u0D45;\uC000\u{1D4C3}ort\u026D\u2B05\0\0\u2BD6ar\xE1\u2B56m\u0100;e\u0D6E\u2BDF\u0100;q\u0D74\u0D73su\u0100bp\u2BEB\u2BED\xE5\u0CF8\xE5\u0D0B\u0180bcp\u2BF6\u2C11\u2C19\u0200;Ees\u2BFF\u2C00\u0D22\u2C04\u6284;\uC000\u2AC5\u0338et\u0100;e\u0D1B\u2C0Bq\u0100;q\u0D23\u2C00c\u0100;e\u0D32\u2C17\xF1\u0D38\u0200;Ees\u2C22\u2C23\u0D5F\u2C27\u6285;\uC000\u2AC6\u0338et\u0100;e\u0D58\u2C2Eq\u0100;q\u0D60\u2C23\u0200gilr\u2C3D\u2C3F\u2C45\u2C47\xEC\u0BD7lde\u803B\xF1\u40F1\xE7\u0C43iangle\u0100lr\u2C52\u2C5Ceft\u0100;e\u0C1A\u2C5A\xF1\u0C26ight\u0100;e\u0CCB\u2C65\xF1\u0CD7\u0100;m\u2C6C\u2C6D\u43BD\u0180;es\u2C74\u2C75\u2C79\u4023ro;\u6116p;\u6007\u0480DHadgilrs\u2C8F\u2C94\u2C99\u2C9E\u2CA3\u2CB0\u2CB6\u2CD3\u2CE3ash;\u62ADarr;\u6904p;\uC000\u224D\u20D2ash;\u62AC\u0100et\u2CA8\u2CAC;\uC000\u2265\u20D2;\uC000>\u20D2nfin;\u69DE\u0180Aet\u2CBD\u2CC1\u2CC5rr;\u6902;\uC000\u2264\u20D2\u0100;r\u2CCA\u2CCD\uC000<\u20D2ie;\uC000\u22B4\u20D2\u0100At\u2CD8\u2CDCrr;\u6903rie;\uC000\u22B5\u20D2im;\uC000\u223C\u20D2\u0180Aan\u2CF0\u2CF4\u2D02rr;\u61D6r\u0100hr\u2CFA\u2CFDk;\u6923\u0100;o\u13E7\u13E5ear;\u6927\u1253\u1A95\0\0\0\0\0\0\0\0\0\0\0\0\0\u2D2D\0\u2D38\u2D48\u2D60\u2D65\u2D72\u2D84\u1B07\0\0\u2D8D\u2DAB\0\u2DC8\u2DCE\0\u2DDC\u2E19\u2E2B\u2E3E\u2E43\u0100cs\u2D31\u1A97ute\u803B\xF3\u40F3\u0100iy\u2D3C\u2D45r\u0100;c\u1A9E\u2D42\u803B\xF4\u40F4;\u443E\u0280abios\u1AA0\u2D52\u2D57\u01C8\u2D5Alac;\u4151v;\u6A38old;\u69BClig;\u4153\u0100cr\u2D69\u2D6Dir;\u69BF;\uC000\u{1D52C}\u036F\u2D79\0\0\u2D7C\0\u2D82n;\u42DBave\u803B\xF2\u40F2;\u69C1\u0100bm\u2D88\u0DF4ar;\u69B5\u0200acit\u2D95\u2D98\u2DA5\u2DA8r\xF2\u1A80\u0100ir\u2D9D\u2DA0r;\u69BEoss;\u69BBn\xE5\u0E52;\u69C0\u0180aei\u2DB1\u2DB5\u2DB9cr;\u414Dga;\u43C9\u0180cdn\u2DC0\u2DC5\u01CDron;\u43BF;\u69B6pf;\uC000\u{1D560}\u0180ael\u2DD4\u2DD7\u01D2r;\u69B7rp;\u69B9\u0380;adiosv\u2DEA\u2DEB\u2DEE\u2E08\u2E0D\u2E10\u2E16\u6228r\xF2\u1A86\u0200;efm\u2DF7\u2DF8\u2E02\u2E05\u6A5Dr\u0100;o\u2DFE\u2DFF\u6134f\xBB\u2DFF\u803B\xAA\u40AA\u803B\xBA\u40BAgof;\u62B6r;\u6A56lope;\u6A57;\u6A5B\u0180clo\u2E1F\u2E21\u2E27\xF2\u2E01ash\u803B\xF8\u40F8l;\u6298i\u016C\u2E2F\u2E34de\u803B\xF5\u40F5es\u0100;a\u01DB\u2E3As;\u6A36ml\u803B\xF6\u40F6bar;\u633D\u0AE1\u2E5E\0\u2E7D\0\u2E80\u2E9D\0\u2EA2\u2EB9\0\0\u2ECB\u0E9C\0\u2F13\0\0\u2F2B\u2FBC\0\u2FC8r\u0200;ast\u0403\u2E67\u2E72\u0E85\u8100\xB6;l\u2E6D\u2E6E\u40B6le\xEC\u0403\u0269\u2E78\0\0\u2E7Bm;\u6AF3;\u6AFDy;\u443Fr\u0280cimpt\u2E8B\u2E8F\u2E93\u1865\u2E97nt;\u4025od;\u402Eil;\u6030enk;\u6031r;\uC000\u{1D52D}\u0180imo\u2EA8\u2EB0\u2EB4\u0100;v\u2EAD\u2EAE\u43C6;\u43D5ma\xF4\u0A76ne;\u660E\u0180;tv\u2EBF\u2EC0\u2EC8\u43C0chfork\xBB\u1FFD;\u43D6\u0100au\u2ECF\u2EDFn\u0100ck\u2ED5\u2EDDk\u0100;h\u21F4\u2EDB;\u610E\xF6\u21F4s\u0480;abcdemst\u2EF3\u2EF4\u1908\u2EF9\u2EFD\u2F04\u2F06\u2F0A\u2F0E\u402Bcir;\u6A23ir;\u6A22\u0100ou\u1D40\u2F02;\u6A25;\u6A72n\u80BB\xB1\u0E9Dim;\u6A26wo;\u6A27\u0180ipu\u2F19\u2F20\u2F25ntint;\u6A15f;\uC000\u{1D561}nd\u803B\xA3\u40A3\u0500;Eaceinosu\u0EC8\u2F3F\u2F41\u2F44\u2F47\u2F81\u2F89\u2F92\u2F7E\u2FB6;\u6AB3p;\u6AB7u\xE5\u0ED9\u0100;c\u0ECE\u2F4C\u0300;acens\u0EC8\u2F59\u2F5F\u2F66\u2F68\u2F7Eppro\xF8\u2F43urlye\xF1\u0ED9\xF1\u0ECE\u0180aes\u2F6F\u2F76\u2F7Approx;\u6AB9qq;\u6AB5im;\u62E8i\xED\u0EDFme\u0100;s\u2F88\u0EAE\u6032\u0180Eas\u2F78\u2F90\u2F7A\xF0\u2F75\u0180dfp\u0EEC\u2F99\u2FAF\u0180als\u2FA0\u2FA5\u2FAAlar;\u632Eine;\u6312urf;\u6313\u0100;t\u0EFB\u2FB4\xEF\u0EFBrel;\u62B0\u0100ci\u2FC0\u2FC5r;\uC000\u{1D4C5};\u43C8ncsp;\u6008\u0300fiopsu\u2FDA\u22E2\u2FDF\u2FE5\u2FEB\u2FF1r;\uC000\u{1D52E}pf;\uC000\u{1D562}rime;\u6057cr;\uC000\u{1D4C6}\u0180aeo\u2FF8\u3009\u3013t\u0100ei\u2FFE\u3005rnion\xF3\u06B0nt;\u6A16st\u0100;e\u3010\u3011\u403F\xF1\u1F19\xF4\u0F14\u0A80ABHabcdefhilmnoprstux\u3040\u3051\u3055\u3059\u30E0\u310E\u312B\u3147\u3162\u3172\u318E\u3206\u3215\u3224\u3229\u3258\u326E\u3272\u3290\u32B0\u32B7\u0180art\u3047\u304A\u304Cr\xF2\u10B3\xF2\u03DDail;\u691Car\xF2\u1C65ar;\u6964\u0380cdenqrt\u3068\u3075\u3078\u307F\u308F\u3094\u30CC\u0100eu\u306D\u3071;\uC000\u223D\u0331te;\u4155i\xE3\u116Emptyv;\u69B3g\u0200;del\u0FD1\u3089\u308B\u308D;\u6992;\u69A5\xE5\u0FD1uo\u803B\xBB\u40BBr\u0580;abcfhlpstw\u0FDC\u30AC\u30AF\u30B7\u30B9\u30BC\u30BE\u30C0\u30C3\u30C7\u30CAp;\u6975\u0100;f\u0FE0\u30B4s;\u6920;\u6933s;\u691E\xEB\u225D\xF0\u272El;\u6945im;\u6974l;\u61A3;\u619D\u0100ai\u30D1\u30D5il;\u691Ao\u0100;n\u30DB\u30DC\u6236al\xF3\u0F1E\u0180abr\u30E7\u30EA\u30EEr\xF2\u17E5rk;\u6773\u0100ak\u30F3\u30FDc\u0100ek\u30F9\u30FB;\u407D;\u405D\u0100es\u3102\u3104;\u698Cl\u0100du\u310A\u310C;\u698E;\u6990\u0200aeuy\u3117\u311C\u3127\u3129ron;\u4159\u0100di\u3121\u3125il;\u4157\xEC\u0FF2\xE2\u30FA;\u4440\u0200clqs\u3134\u3137\u313D\u3144a;\u6937dhar;\u6969uo\u0100;r\u020E\u020Dh;\u61B3\u0180acg\u314E\u315F\u0F44l\u0200;ips\u0F78\u3158\u315B\u109Cn\xE5\u10BBar\xF4\u0FA9t;\u65AD\u0180ilr\u3169\u1023\u316Esht;\u697D;\uC000\u{1D52F}\u0100ao\u3177\u3186r\u0100du\u317D\u317F\xBB\u047B\u0100;l\u1091\u3184;\u696C\u0100;v\u318B\u318C\u43C1;\u43F1\u0180gns\u3195\u31F9\u31FCht\u0300ahlrst\u31A4\u31B0\u31C2\u31D8\u31E4\u31EErrow\u0100;t\u0FDC\u31ADa\xE9\u30C8arpoon\u0100du\u31BB\u31BFow\xEE\u317Ep\xBB\u1092eft\u0100ah\u31CA\u31D0rrow\xF3\u0FEAarpoon\xF3\u0551ightarrows;\u61C9quigarro\xF7\u30CBhreetimes;\u62CCg;\u42DAingdotse\xF1\u1F32\u0180ahm\u320D\u3210\u3213r\xF2\u0FEAa\xF2\u0551;\u600Foust\u0100;a\u321E\u321F\u63B1che\xBB\u321Fmid;\u6AEE\u0200abpt\u3232\u323D\u3240\u3252\u0100nr\u3237\u323Ag;\u67EDr;\u61FEr\xEB\u1003\u0180afl\u3247\u324A\u324Er;\u6986;\uC000\u{1D563}us;\u6A2Eimes;\u6A35\u0100ap\u325D\u3267r\u0100;g\u3263\u3264\u4029t;\u6994olint;\u6A12ar\xF2\u31E3\u0200achq\u327B\u3280\u10BC\u3285quo;\u603Ar;\uC000\u{1D4C7}\u0100bu\u30FB\u328Ao\u0100;r\u0214\u0213\u0180hir\u3297\u329B\u32A0re\xE5\u31F8mes;\u62CAi\u0200;efl\u32AA\u1059\u1821\u32AB\u65B9tri;\u69CEluhar;\u6968;\u611E\u0D61\u32D5\u32DB\u32DF\u332C\u3338\u3371\0\u337A\u33A4\0\0\u33EC\u33F0\0\u3428\u3448\u345A\u34AD\u34B1\u34CA\u34F1\0\u3616\0\0\u3633cute;\u415Bqu\xEF\u27BA\u0500;Eaceinpsy\u11ED\u32F3\u32F5\u32FF\u3302\u330B\u330F\u331F\u3326\u3329;\u6AB4\u01F0\u32FA\0\u32FC;\u6AB8on;\u4161u\xE5\u11FE\u0100;d\u11F3\u3307il;\u415Frc;\u415D\u0180Eas\u3316\u3318\u331B;\u6AB6p;\u6ABAim;\u62E9olint;\u6A13i\xED\u1204;\u4441ot\u0180;be\u3334\u1D47\u3335\u62C5;\u6A66\u0380Aacmstx\u3346\u334A\u3357\u335B\u335E\u3363\u336Drr;\u61D8r\u0100hr\u3350\u3352\xEB\u2228\u0100;o\u0A36\u0A34t\u803B\xA7\u40A7i;\u403Bwar;\u6929m\u0100in\u3369\xF0nu\xF3\xF1t;\u6736r\u0100;o\u3376\u2055\uC000\u{1D530}\u0200acoy\u3382\u3386\u3391\u33A0rp;\u666F\u0100hy\u338B\u338Fcy;\u4449;\u4448rt\u026D\u3399\0\0\u339Ci\xE4\u1464ara\xEC\u2E6F\u803B\xAD\u40AD\u0100gm\u33A8\u33B4ma\u0180;fv\u33B1\u33B2\u33B2\u43C3;\u43C2\u0400;deglnpr\u12AB\u33C5\u33C9\u33CE\u33D6\u33DE\u33E1\u33E6ot;\u6A6A\u0100;q\u12B1\u12B0\u0100;E\u33D3\u33D4\u6A9E;\u6AA0\u0100;E\u33DB\u33DC\u6A9D;\u6A9Fe;\u6246lus;\u6A24arr;\u6972ar\xF2\u113D\u0200aeit\u33F8\u3408\u340F\u3417\u0100ls\u33FD\u3404lsetm\xE9\u336Ahp;\u6A33parsl;\u69E4\u0100dl\u1463\u3414e;\u6323\u0100;e\u341C\u341D\u6AAA\u0100;s\u3422\u3423\u6AAC;\uC000\u2AAC\uFE00\u0180flp\u342E\u3433\u3442tcy;\u444C\u0100;b\u3438\u3439\u402F\u0100;a\u343E\u343F\u69C4r;\u633Ff;\uC000\u{1D564}a\u0100dr\u344D\u0402es\u0100;u\u3454\u3455\u6660it\xBB\u3455\u0180csu\u3460\u3479\u349F\u0100au\u3465\u346Fp\u0100;s\u1188\u346B;\uC000\u2293\uFE00p\u0100;s\u11B4\u3475;\uC000\u2294\uFE00u\u0100bp\u347F\u348F\u0180;es\u1197\u119C\u3486et\u0100;e\u1197\u348D\xF1\u119D\u0180;es\u11A8\u11AD\u3496et\u0100;e\u11A8\u349D\xF1\u11AE\u0180;af\u117B\u34A6\u05B0r\u0165\u34AB\u05B1\xBB\u117Car\xF2\u1148\u0200cemt\u34B9\u34BE\u34C2\u34C5r;\uC000\u{1D4C8}tm\xEE\xF1i\xEC\u3415ar\xE6\u11BE\u0100ar\u34CE\u34D5r\u0100;f\u34D4\u17BF\u6606\u0100an\u34DA\u34EDight\u0100ep\u34E3\u34EApsilo\xEE\u1EE0h\xE9\u2EAFs\xBB\u2852\u0280bcmnp\u34FB\u355E\u1209\u358B\u358E\u0480;Edemnprs\u350E\u350F\u3511\u3515\u351E\u3523\u352C\u3531\u3536\u6282;\u6AC5ot;\u6ABD\u0100;d\u11DA\u351Aot;\u6AC3ult;\u6AC1\u0100Ee\u3528\u352A;\u6ACB;\u628Alus;\u6ABFarr;\u6979\u0180eiu\u353D\u3552\u3555t\u0180;en\u350E\u3545\u354Bq\u0100;q\u11DA\u350Feq\u0100;q\u352B\u3528m;\u6AC7\u0100bp\u355A\u355C;\u6AD5;\u6AD3c\u0300;acens\u11ED\u356C\u3572\u3579\u357B\u3326ppro\xF8\u32FAurlye\xF1\u11FE\xF1\u11F3\u0180aes\u3582\u3588\u331Bppro\xF8\u331Aq\xF1\u3317g;\u666A\u0680123;Edehlmnps\u35A9\u35AC\u35AF\u121C\u35B2\u35B4\u35C0\u35C9\u35D5\u35DA\u35DF\u35E8\u35ED\u803B\xB9\u40B9\u803B\xB2\u40B2\u803B\xB3\u40B3;\u6AC6\u0100os\u35B9\u35BCt;\u6ABEub;\u6AD8\u0100;d\u1222\u35C5ot;\u6AC4s\u0100ou\u35CF\u35D2l;\u67C9b;\u6AD7arr;\u697Bult;\u6AC2\u0100Ee\u35E4\u35E6;\u6ACC;\u628Blus;\u6AC0\u0180eiu\u35F4\u3609\u360Ct\u0180;en\u121C\u35FC\u3602q\u0100;q\u1222\u35B2eq\u0100;q\u35E7\u35E4m;\u6AC8\u0100bp\u3611\u3613;\u6AD4;\u6AD6\u0180Aan\u361C\u3620\u362Drr;\u61D9r\u0100hr\u3626\u3628\xEB\u222E\u0100;o\u0A2B\u0A29war;\u692Alig\u803B\xDF\u40DF\u0BE1\u3651\u365D\u3660\u12CE\u3673\u3679\0\u367E\u36C2\0\0\0\0\0\u36DB\u3703\0\u3709\u376C\0\0\0\u3787\u0272\u3656\0\0\u365Bget;\u6316;\u43C4r\xEB\u0E5F\u0180aey\u3666\u366B\u3670ron;\u4165dil;\u4163;\u4442lrec;\u6315r;\uC000\u{1D531}\u0200eiko\u3686\u369D\u36B5\u36BC\u01F2\u368B\0\u3691e\u01004f\u1284\u1281a\u0180;sv\u3698\u3699\u369B\u43B8ym;\u43D1\u0100cn\u36A2\u36B2k\u0100as\u36A8\u36AEppro\xF8\u12C1im\xBB\u12ACs\xF0\u129E\u0100as\u36BA\u36AE\xF0\u12C1rn\u803B\xFE\u40FE\u01EC\u031F\u36C6\u22E7es\u8180\xD7;bd\u36CF\u36D0\u36D8\u40D7\u0100;a\u190F\u36D5r;\u6A31;\u6A30\u0180eps\u36E1\u36E3\u3700\xE1\u2A4D\u0200;bcf\u0486\u36EC\u36F0\u36F4ot;\u6336ir;\u6AF1\u0100;o\u36F9\u36FC\uC000\u{1D565}rk;\u6ADA\xE1\u3362rime;\u6034\u0180aip\u370F\u3712\u3764d\xE5\u1248\u0380adempst\u3721\u374D\u3740\u3751\u3757\u375C\u375Fngle\u0280;dlqr\u3730\u3731\u3736\u3740\u3742\u65B5own\xBB\u1DBBeft\u0100;e\u2800\u373E\xF1\u092E;\u625Cight\u0100;e\u32AA\u374B\xF1\u105Aot;\u65ECinus;\u6A3Alus;\u6A39b;\u69CDime;\u6A3Bezium;\u63E2\u0180cht\u3772\u377D\u3781\u0100ry\u3777\u377B;\uC000\u{1D4C9};\u4446cy;\u445Brok;\u4167\u0100io\u378B\u378Ex\xF4\u1777head\u0100lr\u3797\u37A0eftarro\xF7\u084Fightarrow\xBB\u0F5D\u0900AHabcdfghlmoprstuw\u37D0\u37D3\u37D7\u37E4\u37F0\u37FC\u380E\u381C\u3823\u3834\u3851\u385D\u386B\u38A9\u38CC\u38D2\u38EA\u38F6r\xF2\u03EDar;\u6963\u0100cr\u37DC\u37E2ute\u803B\xFA\u40FA\xF2\u1150r\u01E3\u37EA\0\u37EDy;\u445Eve;\u416D\u0100iy\u37F5\u37FArc\u803B\xFB\u40FB;\u4443\u0180abh\u3803\u3806\u380Br\xF2\u13ADlac;\u4171a\xF2\u13C3\u0100ir\u3813\u3818sht;\u697E;\uC000\u{1D532}rave\u803B\xF9\u40F9\u0161\u3827\u3831r\u0100lr\u382C\u382E\xBB\u0957\xBB\u1083lk;\u6580\u0100ct\u3839\u384D\u026F\u383F\0\0\u384Arn\u0100;e\u3845\u3846\u631Cr\xBB\u3846op;\u630Fri;\u65F8\u0100al\u3856\u385Acr;\u416B\u80BB\xA8\u0349\u0100gp\u3862\u3866on;\u4173f;\uC000\u{1D566}\u0300adhlsu\u114B\u3878\u387D\u1372\u3891\u38A0own\xE1\u13B3arpoon\u0100lr\u3888\u388Cef\xF4\u382Digh\xF4\u382Fi\u0180;hl\u3899\u389A\u389C\u43C5\xBB\u13FAon\xBB\u389Aparrows;\u61C8\u0180cit\u38B0\u38C4\u38C8\u026F\u38B6\0\0\u38C1rn\u0100;e\u38BC\u38BD\u631Dr\xBB\u38BDop;\u630Eng;\u416Fri;\u65F9cr;\uC000\u{1D4CA}\u0180dir\u38D9\u38DD\u38E2ot;\u62F0lde;\u4169i\u0100;f\u3730\u38E8\xBB\u1813\u0100am\u38EF\u38F2r\xF2\u38A8l\u803B\xFC\u40FCangle;\u69A7\u0780ABDacdeflnoprsz\u391C\u391F\u3929\u392D\u39B5\u39B8\u39BD\u39DF\u39E4\u39E8\u39F3\u39F9\u39FD\u3A01\u3A20r\xF2\u03F7ar\u0100;v\u3926\u3927\u6AE8;\u6AE9as\xE8\u03E1\u0100nr\u3932\u3937grt;\u699C\u0380eknprst\u34E3\u3946\u394B\u3952\u395D\u3964\u3996app\xE1\u2415othin\xE7\u1E96\u0180hir\u34EB\u2EC8\u3959op\xF4\u2FB5\u0100;h\u13B7\u3962\xEF\u318D\u0100iu\u3969\u396Dgm\xE1\u33B3\u0100bp\u3972\u3984setneq\u0100;q\u397D\u3980\uC000\u228A\uFE00;\uC000\u2ACB\uFE00setneq\u0100;q\u398F\u3992\uC000\u228B\uFE00;\uC000\u2ACC\uFE00\u0100hr\u399B\u399Fet\xE1\u369Ciangle\u0100lr\u39AA\u39AFeft\xBB\u0925ight\xBB\u1051y;\u4432ash\xBB\u1036\u0180elr\u39C4\u39D2\u39D7\u0180;be\u2DEA\u39CB\u39CFar;\u62BBq;\u625Alip;\u62EE\u0100bt\u39DC\u1468a\xF2\u1469r;\uC000\u{1D533}tr\xE9\u39AEsu\u0100bp\u39EF\u39F1\xBB\u0D1C\xBB\u0D59pf;\uC000\u{1D567}ro\xF0\u0EFBtr\xE9\u39B4\u0100cu\u3A06\u3A0Br;\uC000\u{1D4CB}\u0100bp\u3A10\u3A18n\u0100Ee\u3980\u3A16\xBB\u397En\u0100Ee\u3992\u3A1E\xBB\u3990igzag;\u699A\u0380cefoprs\u3A36\u3A3B\u3A56\u3A5B\u3A54\u3A61\u3A6Airc;\u4175\u0100di\u3A40\u3A51\u0100bg\u3A45\u3A49ar;\u6A5Fe\u0100;q\u15FA\u3A4F;\u6259erp;\u6118r;\uC000\u{1D534}pf;\uC000\u{1D568}\u0100;e\u1479\u3A66at\xE8\u1479cr;\uC000\u{1D4CC}\u0AE3\u178E\u3A87\0\u3A8B\0\u3A90\u3A9B\0\0\u3A9D\u3AA8\u3AAB\u3AAF\0\0\u3AC3\u3ACE\0\u3AD8\u17DC\u17DFtr\xE9\u17D1r;\uC000\u{1D535}\u0100Aa\u3A94\u3A97r\xF2\u03C3r\xF2\u09F6;\u43BE\u0100Aa\u3AA1\u3AA4r\xF2\u03B8r\xF2\u09EBa\xF0\u2713is;\u62FB\u0180dpt\u17A4\u3AB5\u3ABE\u0100fl\u3ABA\u17A9;\uC000\u{1D569}im\xE5\u17B2\u0100Aa\u3AC7\u3ACAr\xF2\u03CEr\xF2\u0A01\u0100cq\u3AD2\u17B8r;\uC000\u{1D4CD}\u0100pt\u17D6\u3ADCr\xE9\u17D4\u0400acefiosu\u3AF0\u3AFD\u3B08\u3B0C\u3B11\u3B15\u3B1B\u3B21c\u0100uy\u3AF6\u3AFBte\u803B\xFD\u40FD;\u444F\u0100iy\u3B02\u3B06rc;\u4177;\u444Bn\u803B\xA5\u40A5r;\uC000\u{1D536}cy;\u4457pf;\uC000\u{1D56A}cr;\uC000\u{1D4CE}\u0100cm\u3B26\u3B29y;\u444El\u803B\xFF\u40FF\u0500acdefhiosw\u3B42\u3B48\u3B54\u3B58\u3B64\u3B69\u3B6D\u3B74\u3B7A\u3B80cute;\u417A\u0100ay\u3B4D\u3B52ron;\u417E;\u4437ot;\u417C\u0100et\u3B5D\u3B61tr\xE6\u155Fa;\u43B6r;\uC000\u{1D537}cy;\u4436grarr;\u61DDpf;\uC000\u{1D56B}cr;\uC000\u{1D4CF}\u0100jn\u3B85\u3B87;\u600Dj;\u600C'.split("").map(e=>e.charCodeAt(0)));var Jt=new Uint16Array("\u0200aglq	\x1B\u026D\0\0p;\u4026os;\u4027t;\u403Et;\u403Cuot;\u4022".split("").map(e=>e.charCodeAt(0)));var fr,kn=new Map([[0,65533],[128,8364],[130,8218],[131,402],[132,8222],[133,8230],[134,8224],[135,8225],[136,710],[137,8240],[138,352],[139,8249],[140,338],[142,381],[145,8216],[146,8217],[147,8220],[148,8221],[149,8226],[150,8211],[151,8212],[152,732],[153,8482],[154,353],[155,8250],[156,339],[158,382],[159,376]]),mr=(fr=String.fromCodePoint)!==null&&fr!==void 0?fr:function(e){let r="";return e>65535&&(e-=65536,r+=String.fromCharCode(e>>>10&1023|55296),e=56320|e&1023),r+=String.fromCharCode(e),r};function pr(e){var r;return e>=55296&&e<=57343||e>1114111?65533:(r=kn.get(e))!==null&&r!==void 0?r:e}var D;(function(e){e[e.NUM=35]="NUM",e[e.SEMI=59]="SEMI",e[e.EQUALS=61]="EQUALS",e[e.ZERO=48]="ZERO",e[e.NINE=57]="NINE",e[e.LOWER_A=97]="LOWER_A",e[e.LOWER_F=102]="LOWER_F",e[e.LOWER_X=120]="LOWER_X",e[e.LOWER_Z=122]="LOWER_Z",e[e.UPPER_A=65]="UPPER_A",e[e.UPPER_F=70]="UPPER_F",e[e.UPPER_Z=90]="UPPER_Z"})(D||(D={}));var yn=32,K;(function(e){e[e.VALUE_LENGTH=49152]="VALUE_LENGTH",e[e.BRANCH_LENGTH=16256]="BRANCH_LENGTH",e[e.JUMP_TABLE=127]="JUMP_TABLE"})(K||(K={}));function hr(e){return e>=D.ZERO&&e<=D.NINE}function vn(e){return e>=D.UPPER_A&&e<=D.UPPER_F||e>=D.LOWER_A&&e<=D.LOWER_F}function _n(e){return e>=D.UPPER_A&&e<=D.UPPER_Z||e>=D.LOWER_A&&e<=D.LOWER_Z||hr(e)}function wn(e){return e===D.EQUALS||_n(e)}var C;(function(e){e[e.EntityStart=0]="EntityStart",e[e.NumericStart=1]="NumericStart",e[e.NumericDecimal=2]="NumericDecimal",e[e.NumericHex=3]="NumericHex",e[e.NamedEntity=4]="NamedEntity"})(C||(C={}));var B;(function(e){e[e.Legacy=0]="Legacy",e[e.Strict=1]="Strict",e[e.Attribute=2]="Attribute"})(B||(B={}));var je=class{constructor(r,t,u){this.decodeTree=r,this.emitCodePoint=t,this.errors=u,this.state=C.EntityStart,this.consumed=1,this.result=0,this.treeIndex=0,this.excess=1,this.decodeMode=B.Strict}startEntity(r){this.decodeMode=r,this.state=C.EntityStart,this.result=0,this.treeIndex=0,this.excess=1,this.consumed=1}write(r,t){switch(this.state){case C.EntityStart:return r.charCodeAt(t)===D.NUM?(this.state=C.NumericStart,this.consumed+=1,this.stateNumericStart(r,t+1)):(this.state=C.NamedEntity,this.stateNamedEntity(r,t));case C.NumericStart:return this.stateNumericStart(r,t);case C.NumericDecimal:return this.stateNumericDecimal(r,t);case C.NumericHex:return this.stateNumericHex(r,t);case C.NamedEntity:return this.stateNamedEntity(r,t)}}stateNumericStart(r,t){return t>=r.length?-1:(r.charCodeAt(t)|yn)===D.LOWER_X?(this.state=C.NumericHex,this.consumed+=1,this.stateNumericHex(r,t+1)):(this.state=C.NumericDecimal,this.stateNumericDecimal(r,t))}addToNumericResult(r,t,u,o){if(t!==u){let n=u-t;this.result=this.result*Math.pow(o,n)+parseInt(r.substr(t,n),o),this.consumed+=n}}stateNumericHex(r,t){let u=t;for(;t<r.length;){let o=r.charCodeAt(t);if(hr(o)||vn(o))t+=1;else return this.addToNumericResult(r,u,t,16),this.emitNumericEntity(o,3)}return this.addToNumericResult(r,u,t,16),-1}stateNumericDecimal(r,t){let u=t;for(;t<r.length;){let o=r.charCodeAt(t);if(hr(o))t+=1;else return this.addToNumericResult(r,u,t,10),this.emitNumericEntity(o,2)}return this.addToNumericResult(r,u,t,10),-1}emitNumericEntity(r,t){var u;if(this.consumed<=t)return(u=this.errors)===null||u===void 0||u.absenceOfDigitsInNumericCharacterReference(this.consumed),0;if(r===D.SEMI)this.consumed+=1;else if(this.decodeMode===B.Strict)return 0;return this.emitCodePoint(pr(this.result),this.consumed),this.errors&&(r!==D.SEMI&&this.errors.missingSemicolonAfterCharacterReference(),this.errors.validateNumericCharacterReference(this.result)),this.consumed}stateNamedEntity(r,t){let{decodeTree:u}=this,o=u[this.treeIndex],n=(o&K.VALUE_LENGTH)>>14;for(;t<r.length;t++,this.excess++){let a=r.charCodeAt(t);if(this.treeIndex=An(u,o,this.treeIndex+Math.max(1,n),a),this.treeIndex<0)return this.result===0||this.decodeMode===B.Attribute&&(n===0||wn(a))?0:this.emitNotTerminatedNamedEntity();if(o=u[this.treeIndex],n=(o&K.VALUE_LENGTH)>>14,n!==0){if(a===D.SEMI)return this.emitNamedEntityData(this.treeIndex,n,this.consumed+this.excess);this.decodeMode!==B.Strict&&(this.result=this.treeIndex,this.consumed+=this.excess,this.excess=0)}}return-1}emitNotTerminatedNamedEntity(){var r;let{result:t,decodeTree:u}=this,o=(u[t]&K.VALUE_LENGTH)>>14;return this.emitNamedEntityData(t,o,this.consumed),(r=this.errors)===null||r===void 0||r.missingSemicolonAfterCharacterReference(),this.consumed}emitNamedEntityData(r,t,u){let{decodeTree:o}=this;return this.emitCodePoint(t===1?o[r]&~K.VALUE_LENGTH:o[r+1],u),t===3&&this.emitCodePoint(o[r+2],u),u}end(){var r;switch(this.state){case C.NamedEntity:return this.result!==0&&(this.decodeMode!==B.Attribute||this.result===this.treeIndex)?this.emitNotTerminatedNamedEntity():0;case C.NumericDecimal:return this.emitNumericEntity(0,2);case C.NumericHex:return this.emitNumericEntity(0,3);case C.NumericStart:return(r=this.errors)===null||r===void 0||r.absenceOfDigitsInNumericCharacterReference(this.consumed),0;case C.EntityStart:return 0}}};function Xt(e){let r="",t=new je(e,u=>r+=mr(u));return function(o,n){let a=0,i=0;for(;(i=o.indexOf("&",i))>=0;){r+=o.slice(a,i),t.startEntity(n);let s=t.write(o,i+1);if(s<0){a=i+t.end();break}a=i+s,i=s===0?a+1:a}let c=r+o.slice(a);return r="",c}}function An(e,r,t,u){let o=(r&K.BRANCH_LENGTH)>>7,n=r&K.JUMP_TABLE;if(o===0)return n!==0&&u===n?t:-1;if(n){let c=u-n;return c<0||c>=o?-1:e[t+c]-1}let a=t,i=a+o-1;for(;a<=i;){let c=a+i>>>1,s=e[c];if(s<u)a=c+1;else if(s>u)i=c-1;else return e[c+o]}return-1}var En=Xt(Yt),ac=Xt(Jt);function Y(e,r=B.Legacy){return En(e,r)}function Ve(e){for(let r=1;r<e.length;r++)e[r][0]+=e[r-1][0]+1;return e}var Cn=new Map(Ve([[9,"&Tab;"],[0,"&NewLine;"],[22,"&excl;"],[0,"&quot;"],[0,"&num;"],[0,"&dollar;"],[0,"&percnt;"],[0,"&amp;"],[0,"&apos;"],[0,"&lpar;"],[0,"&rpar;"],[0,"&ast;"],[0,"&plus;"],[0,"&comma;"],[1,"&period;"],[0,"&sol;"],[10,"&colon;"],[0,"&semi;"],[0,{v:"&lt;",n:8402,o:"&nvlt;"}],[0,{v:"&equals;",n:8421,o:"&bne;"}],[0,{v:"&gt;",n:8402,o:"&nvgt;"}],[0,"&quest;"],[0,"&commat;"],[26,"&lbrack;"],[0,"&bsol;"],[0,"&rbrack;"],[0,"&Hat;"],[0,"&lowbar;"],[0,"&DiacriticalGrave;"],[5,{n:106,o:"&fjlig;"}],[20,"&lbrace;"],[0,"&verbar;"],[0,"&rbrace;"],[34,"&nbsp;"],[0,"&iexcl;"],[0,"&cent;"],[0,"&pound;"],[0,"&curren;"],[0,"&yen;"],[0,"&brvbar;"],[0,"&sect;"],[0,"&die;"],[0,"&copy;"],[0,"&ordf;"],[0,"&laquo;"],[0,"&not;"],[0,"&shy;"],[0,"&circledR;"],[0,"&macr;"],[0,"&deg;"],[0,"&PlusMinus;"],[0,"&sup2;"],[0,"&sup3;"],[0,"&acute;"],[0,"&micro;"],[0,"&para;"],[0,"&centerdot;"],[0,"&cedil;"],[0,"&sup1;"],[0,"&ordm;"],[0,"&raquo;"],[0,"&frac14;"],[0,"&frac12;"],[0,"&frac34;"],[0,"&iquest;"],[0,"&Agrave;"],[0,"&Aacute;"],[0,"&Acirc;"],[0,"&Atilde;"],[0,"&Auml;"],[0,"&angst;"],[0,"&AElig;"],[0,"&Ccedil;"],[0,"&Egrave;"],[0,"&Eacute;"],[0,"&Ecirc;"],[0,"&Euml;"],[0,"&Igrave;"],[0,"&Iacute;"],[0,"&Icirc;"],[0,"&Iuml;"],[0,"&ETH;"],[0,"&Ntilde;"],[0,"&Ograve;"],[0,"&Oacute;"],[0,"&Ocirc;"],[0,"&Otilde;"],[0,"&Ouml;"],[0,"&times;"],[0,"&Oslash;"],[0,"&Ugrave;"],[0,"&Uacute;"],[0,"&Ucirc;"],[0,"&Uuml;"],[0,"&Yacute;"],[0,"&THORN;"],[0,"&szlig;"],[0,"&agrave;"],[0,"&aacute;"],[0,"&acirc;"],[0,"&atilde;"],[0,"&auml;"],[0,"&aring;"],[0,"&aelig;"],[0,"&ccedil;"],[0,"&egrave;"],[0,"&eacute;"],[0,"&ecirc;"],[0,"&euml;"],[0,"&igrave;"],[0,"&iacute;"],[0,"&icirc;"],[0,"&iuml;"],[0,"&eth;"],[0,"&ntilde;"],[0,"&ograve;"],[0,"&oacute;"],[0,"&ocirc;"],[0,"&otilde;"],[0,"&ouml;"],[0,"&div;"],[0,"&oslash;"],[0,"&ugrave;"],[0,"&uacute;"],[0,"&ucirc;"],[0,"&uuml;"],[0,"&yacute;"],[0,"&thorn;"],[0,"&yuml;"],[0,"&Amacr;"],[0,"&amacr;"],[0,"&Abreve;"],[0,"&abreve;"],[0,"&Aogon;"],[0,"&aogon;"],[0,"&Cacute;"],[0,"&cacute;"],[0,"&Ccirc;"],[0,"&ccirc;"],[0,"&Cdot;"],[0,"&cdot;"],[0,"&Ccaron;"],[0,"&ccaron;"],[0,"&Dcaron;"],[0,"&dcaron;"],[0,"&Dstrok;"],[0,"&dstrok;"],[0,"&Emacr;"],[0,"&emacr;"],[2,"&Edot;"],[0,"&edot;"],[0,"&Eogon;"],[0,"&eogon;"],[0,"&Ecaron;"],[0,"&ecaron;"],[0,"&Gcirc;"],[0,"&gcirc;"],[0,"&Gbreve;"],[0,"&gbreve;"],[0,"&Gdot;"],[0,"&gdot;"],[0,"&Gcedil;"],[1,"&Hcirc;"],[0,"&hcirc;"],[0,"&Hstrok;"],[0,"&hstrok;"],[0,"&Itilde;"],[0,"&itilde;"],[0,"&Imacr;"],[0,"&imacr;"],[2,"&Iogon;"],[0,"&iogon;"],[0,"&Idot;"],[0,"&imath;"],[0,"&IJlig;"],[0,"&ijlig;"],[0,"&Jcirc;"],[0,"&jcirc;"],[0,"&Kcedil;"],[0,"&kcedil;"],[0,"&kgreen;"],[0,"&Lacute;"],[0,"&lacute;"],[0,"&Lcedil;"],[0,"&lcedil;"],[0,"&Lcaron;"],[0,"&lcaron;"],[0,"&Lmidot;"],[0,"&lmidot;"],[0,"&Lstrok;"],[0,"&lstrok;"],[0,"&Nacute;"],[0,"&nacute;"],[0,"&Ncedil;"],[0,"&ncedil;"],[0,"&Ncaron;"],[0,"&ncaron;"],[0,"&napos;"],[0,"&ENG;"],[0,"&eng;"],[0,"&Omacr;"],[0,"&omacr;"],[2,"&Odblac;"],[0,"&odblac;"],[0,"&OElig;"],[0,"&oelig;"],[0,"&Racute;"],[0,"&racute;"],[0,"&Rcedil;"],[0,"&rcedil;"],[0,"&Rcaron;"],[0,"&rcaron;"],[0,"&Sacute;"],[0,"&sacute;"],[0,"&Scirc;"],[0,"&scirc;"],[0,"&Scedil;"],[0,"&scedil;"],[0,"&Scaron;"],[0,"&scaron;"],[0,"&Tcedil;"],[0,"&tcedil;"],[0,"&Tcaron;"],[0,"&tcaron;"],[0,"&Tstrok;"],[0,"&tstrok;"],[0,"&Utilde;"],[0,"&utilde;"],[0,"&Umacr;"],[0,"&umacr;"],[0,"&Ubreve;"],[0,"&ubreve;"],[0,"&Uring;"],[0,"&uring;"],[0,"&Udblac;"],[0,"&udblac;"],[0,"&Uogon;"],[0,"&uogon;"],[0,"&Wcirc;"],[0,"&wcirc;"],[0,"&Ycirc;"],[0,"&ycirc;"],[0,"&Yuml;"],[0,"&Zacute;"],[0,"&zacute;"],[0,"&Zdot;"],[0,"&zdot;"],[0,"&Zcaron;"],[0,"&zcaron;"],[19,"&fnof;"],[34,"&imped;"],[63,"&gacute;"],[65,"&jmath;"],[142,"&circ;"],[0,"&caron;"],[16,"&breve;"],[0,"&DiacriticalDot;"],[0,"&ring;"],[0,"&ogon;"],[0,"&DiacriticalTilde;"],[0,"&dblac;"],[51,"&DownBreve;"],[127,"&Alpha;"],[0,"&Beta;"],[0,"&Gamma;"],[0,"&Delta;"],[0,"&Epsilon;"],[0,"&Zeta;"],[0,"&Eta;"],[0,"&Theta;"],[0,"&Iota;"],[0,"&Kappa;"],[0,"&Lambda;"],[0,"&Mu;"],[0,"&Nu;"],[0,"&Xi;"],[0,"&Omicron;"],[0,"&Pi;"],[0,"&Rho;"],[1,"&Sigma;"],[0,"&Tau;"],[0,"&Upsilon;"],[0,"&Phi;"],[0,"&Chi;"],[0,"&Psi;"],[0,"&ohm;"],[7,"&alpha;"],[0,"&beta;"],[0,"&gamma;"],[0,"&delta;"],[0,"&epsi;"],[0,"&zeta;"],[0,"&eta;"],[0,"&theta;"],[0,"&iota;"],[0,"&kappa;"],[0,"&lambda;"],[0,"&mu;"],[0,"&nu;"],[0,"&xi;"],[0,"&omicron;"],[0,"&pi;"],[0,"&rho;"],[0,"&sigmaf;"],[0,"&sigma;"],[0,"&tau;"],[0,"&upsi;"],[0,"&phi;"],[0,"&chi;"],[0,"&psi;"],[0,"&omega;"],[7,"&thetasym;"],[0,"&Upsi;"],[2,"&phiv;"],[0,"&piv;"],[5,"&Gammad;"],[0,"&digamma;"],[18,"&kappav;"],[0,"&rhov;"],[3,"&epsiv;"],[0,"&backepsilon;"],[10,"&IOcy;"],[0,"&DJcy;"],[0,"&GJcy;"],[0,"&Jukcy;"],[0,"&DScy;"],[0,"&Iukcy;"],[0,"&YIcy;"],[0,"&Jsercy;"],[0,"&LJcy;"],[0,"&NJcy;"],[0,"&TSHcy;"],[0,"&KJcy;"],[1,"&Ubrcy;"],[0,"&DZcy;"],[0,"&Acy;"],[0,"&Bcy;"],[0,"&Vcy;"],[0,"&Gcy;"],[0,"&Dcy;"],[0,"&IEcy;"],[0,"&ZHcy;"],[0,"&Zcy;"],[0,"&Icy;"],[0,"&Jcy;"],[0,"&Kcy;"],[0,"&Lcy;"],[0,"&Mcy;"],[0,"&Ncy;"],[0,"&Ocy;"],[0,"&Pcy;"],[0,"&Rcy;"],[0,"&Scy;"],[0,"&Tcy;"],[0,"&Ucy;"],[0,"&Fcy;"],[0,"&KHcy;"],[0,"&TScy;"],[0,"&CHcy;"],[0,"&SHcy;"],[0,"&SHCHcy;"],[0,"&HARDcy;"],[0,"&Ycy;"],[0,"&SOFTcy;"],[0,"&Ecy;"],[0,"&YUcy;"],[0,"&YAcy;"],[0,"&acy;"],[0,"&bcy;"],[0,"&vcy;"],[0,"&gcy;"],[0,"&dcy;"],[0,"&iecy;"],[0,"&zhcy;"],[0,"&zcy;"],[0,"&icy;"],[0,"&jcy;"],[0,"&kcy;"],[0,"&lcy;"],[0,"&mcy;"],[0,"&ncy;"],[0,"&ocy;"],[0,"&pcy;"],[0,"&rcy;"],[0,"&scy;"],[0,"&tcy;"],[0,"&ucy;"],[0,"&fcy;"],[0,"&khcy;"],[0,"&tscy;"],[0,"&chcy;"],[0,"&shcy;"],[0,"&shchcy;"],[0,"&hardcy;"],[0,"&ycy;"],[0,"&softcy;"],[0,"&ecy;"],[0,"&yucy;"],[0,"&yacy;"],[1,"&iocy;"],[0,"&djcy;"],[0,"&gjcy;"],[0,"&jukcy;"],[0,"&dscy;"],[0,"&iukcy;"],[0,"&yicy;"],[0,"&jsercy;"],[0,"&ljcy;"],[0,"&njcy;"],[0,"&tshcy;"],[0,"&kjcy;"],[1,"&ubrcy;"],[0,"&dzcy;"],[7074,"&ensp;"],[0,"&emsp;"],[0,"&emsp13;"],[0,"&emsp14;"],[1,"&numsp;"],[0,"&puncsp;"],[0,"&ThinSpace;"],[0,"&hairsp;"],[0,"&NegativeMediumSpace;"],[0,"&zwnj;"],[0,"&zwj;"],[0,"&lrm;"],[0,"&rlm;"],[0,"&dash;"],[2,"&ndash;"],[0,"&mdash;"],[0,"&horbar;"],[0,"&Verbar;"],[1,"&lsquo;"],[0,"&CloseCurlyQuote;"],[0,"&lsquor;"],[1,"&ldquo;"],[0,"&CloseCurlyDoubleQuote;"],[0,"&bdquo;"],[1,"&dagger;"],[0,"&Dagger;"],[0,"&bull;"],[2,"&nldr;"],[0,"&hellip;"],[9,"&permil;"],[0,"&pertenk;"],[0,"&prime;"],[0,"&Prime;"],[0,"&tprime;"],[0,"&backprime;"],[3,"&lsaquo;"],[0,"&rsaquo;"],[3,"&oline;"],[2,"&caret;"],[1,"&hybull;"],[0,"&frasl;"],[10,"&bsemi;"],[7,"&qprime;"],[7,{v:"&MediumSpace;",n:8202,o:"&ThickSpace;"}],[0,"&NoBreak;"],[0,"&af;"],[0,"&InvisibleTimes;"],[0,"&ic;"],[72,"&euro;"],[46,"&tdot;"],[0,"&DotDot;"],[37,"&complexes;"],[2,"&incare;"],[4,"&gscr;"],[0,"&hamilt;"],[0,"&Hfr;"],[0,"&Hopf;"],[0,"&planckh;"],[0,"&hbar;"],[0,"&imagline;"],[0,"&Ifr;"],[0,"&lagran;"],[0,"&ell;"],[1,"&naturals;"],[0,"&numero;"],[0,"&copysr;"],[0,"&weierp;"],[0,"&Popf;"],[0,"&Qopf;"],[0,"&realine;"],[0,"&real;"],[0,"&reals;"],[0,"&rx;"],[3,"&trade;"],[1,"&integers;"],[2,"&mho;"],[0,"&zeetrf;"],[0,"&iiota;"],[2,"&bernou;"],[0,"&Cayleys;"],[1,"&escr;"],[0,"&Escr;"],[0,"&Fouriertrf;"],[1,"&Mellintrf;"],[0,"&order;"],[0,"&alefsym;"],[0,"&beth;"],[0,"&gimel;"],[0,"&daleth;"],[12,"&CapitalDifferentialD;"],[0,"&dd;"],[0,"&ee;"],[0,"&ii;"],[10,"&frac13;"],[0,"&frac23;"],[0,"&frac15;"],[0,"&frac25;"],[0,"&frac35;"],[0,"&frac45;"],[0,"&frac16;"],[0,"&frac56;"],[0,"&frac18;"],[0,"&frac38;"],[0,"&frac58;"],[0,"&frac78;"],[49,"&larr;"],[0,"&ShortUpArrow;"],[0,"&rarr;"],[0,"&darr;"],[0,"&harr;"],[0,"&updownarrow;"],[0,"&nwarr;"],[0,"&nearr;"],[0,"&LowerRightArrow;"],[0,"&LowerLeftArrow;"],[0,"&nlarr;"],[0,"&nrarr;"],[1,{v:"&rarrw;",n:824,o:"&nrarrw;"}],[0,"&Larr;"],[0,"&Uarr;"],[0,"&Rarr;"],[0,"&Darr;"],[0,"&larrtl;"],[0,"&rarrtl;"],[0,"&LeftTeeArrow;"],[0,"&mapstoup;"],[0,"&map;"],[0,"&DownTeeArrow;"],[1,"&hookleftarrow;"],[0,"&hookrightarrow;"],[0,"&larrlp;"],[0,"&looparrowright;"],[0,"&harrw;"],[0,"&nharr;"],[1,"&lsh;"],[0,"&rsh;"],[0,"&ldsh;"],[0,"&rdsh;"],[1,"&crarr;"],[0,"&cularr;"],[0,"&curarr;"],[2,"&circlearrowleft;"],[0,"&circlearrowright;"],[0,"&leftharpoonup;"],[0,"&DownLeftVector;"],[0,"&RightUpVector;"],[0,"&LeftUpVector;"],[0,"&rharu;"],[0,"&DownRightVector;"],[0,"&dharr;"],[0,"&dharl;"],[0,"&RightArrowLeftArrow;"],[0,"&udarr;"],[0,"&LeftArrowRightArrow;"],[0,"&leftleftarrows;"],[0,"&upuparrows;"],[0,"&rightrightarrows;"],[0,"&ddarr;"],[0,"&leftrightharpoons;"],[0,"&Equilibrium;"],[0,"&nlArr;"],[0,"&nhArr;"],[0,"&nrArr;"],[0,"&DoubleLeftArrow;"],[0,"&DoubleUpArrow;"],[0,"&DoubleRightArrow;"],[0,"&dArr;"],[0,"&DoubleLeftRightArrow;"],[0,"&DoubleUpDownArrow;"],[0,"&nwArr;"],[0,"&neArr;"],[0,"&seArr;"],[0,"&swArr;"],[0,"&lAarr;"],[0,"&rAarr;"],[1,"&zigrarr;"],[6,"&larrb;"],[0,"&rarrb;"],[15,"&DownArrowUpArrow;"],[7,"&loarr;"],[0,"&roarr;"],[0,"&hoarr;"],[0,"&forall;"],[0,"&comp;"],[0,{v:"&part;",n:824,o:"&npart;"}],[0,"&exist;"],[0,"&nexist;"],[0,"&empty;"],[1,"&Del;"],[0,"&Element;"],[0,"&NotElement;"],[1,"&ni;"],[0,"&notni;"],[2,"&prod;"],[0,"&coprod;"],[0,"&sum;"],[0,"&minus;"],[0,"&MinusPlus;"],[0,"&dotplus;"],[1,"&Backslash;"],[0,"&lowast;"],[0,"&compfn;"],[1,"&radic;"],[2,"&prop;"],[0,"&infin;"],[0,"&angrt;"],[0,{v:"&ang;",n:8402,o:"&nang;"}],[0,"&angmsd;"],[0,"&angsph;"],[0,"&mid;"],[0,"&nmid;"],[0,"&DoubleVerticalBar;"],[0,"&NotDoubleVerticalBar;"],[0,"&and;"],[0,"&or;"],[0,{v:"&cap;",n:65024,o:"&caps;"}],[0,{v:"&cup;",n:65024,o:"&cups;"}],[0,"&int;"],[0,"&Int;"],[0,"&iiint;"],[0,"&conint;"],[0,"&Conint;"],[0,"&Cconint;"],[0,"&cwint;"],[0,"&ClockwiseContourIntegral;"],[0,"&awconint;"],[0,"&there4;"],[0,"&becaus;"],[0,"&ratio;"],[0,"&Colon;"],[0,"&dotminus;"],[1,"&mDDot;"],[0,"&homtht;"],[0,{v:"&sim;",n:8402,o:"&nvsim;"}],[0,{v:"&backsim;",n:817,o:"&race;"}],[0,{v:"&ac;",n:819,o:"&acE;"}],[0,"&acd;"],[0,"&VerticalTilde;"],[0,"&NotTilde;"],[0,{v:"&eqsim;",n:824,o:"&nesim;"}],[0,"&sime;"],[0,"&NotTildeEqual;"],[0,"&cong;"],[0,"&simne;"],[0,"&ncong;"],[0,"&ap;"],[0,"&nap;"],[0,"&ape;"],[0,{v:"&apid;",n:824,o:"&napid;"}],[0,"&backcong;"],[0,{v:"&asympeq;",n:8402,o:"&nvap;"}],[0,{v:"&bump;",n:824,o:"&nbump;"}],[0,{v:"&bumpe;",n:824,o:"&nbumpe;"}],[0,{v:"&doteq;",n:824,o:"&nedot;"}],[0,"&doteqdot;"],[0,"&efDot;"],[0,"&erDot;"],[0,"&Assign;"],[0,"&ecolon;"],[0,"&ecir;"],[0,"&circeq;"],[1,"&wedgeq;"],[0,"&veeeq;"],[1,"&triangleq;"],[2,"&equest;"],[0,"&ne;"],[0,{v:"&Congruent;",n:8421,o:"&bnequiv;"}],[0,"&nequiv;"],[1,{v:"&le;",n:8402,o:"&nvle;"}],[0,{v:"&ge;",n:8402,o:"&nvge;"}],[0,{v:"&lE;",n:824,o:"&nlE;"}],[0,{v:"&gE;",n:824,o:"&ngE;"}],[0,{v:"&lnE;",n:65024,o:"&lvertneqq;"}],[0,{v:"&gnE;",n:65024,o:"&gvertneqq;"}],[0,{v:"&ll;",n:new Map(Ve([[824,"&nLtv;"],[7577,"&nLt;"]]))}],[0,{v:"&gg;",n:new Map(Ve([[824,"&nGtv;"],[7577,"&nGt;"]]))}],[0,"&between;"],[0,"&NotCupCap;"],[0,"&nless;"],[0,"&ngt;"],[0,"&nle;"],[0,"&nge;"],[0,"&lesssim;"],[0,"&GreaterTilde;"],[0,"&nlsim;"],[0,"&ngsim;"],[0,"&LessGreater;"],[0,"&gl;"],[0,"&NotLessGreater;"],[0,"&NotGreaterLess;"],[0,"&pr;"],[0,"&sc;"],[0,"&prcue;"],[0,"&sccue;"],[0,"&PrecedesTilde;"],[0,{v:"&scsim;",n:824,o:"&NotSucceedsTilde;"}],[0,"&NotPrecedes;"],[0,"&NotSucceeds;"],[0,{v:"&sub;",n:8402,o:"&NotSubset;"}],[0,{v:"&sup;",n:8402,o:"&NotSuperset;"}],[0,"&nsub;"],[0,"&nsup;"],[0,"&sube;"],[0,"&supe;"],[0,"&NotSubsetEqual;"],[0,"&NotSupersetEqual;"],[0,{v:"&subne;",n:65024,o:"&varsubsetneq;"}],[0,{v:"&supne;",n:65024,o:"&varsupsetneq;"}],[1,"&cupdot;"],[0,"&UnionPlus;"],[0,{v:"&sqsub;",n:824,o:"&NotSquareSubset;"}],[0,{v:"&sqsup;",n:824,o:"&NotSquareSuperset;"}],[0,"&sqsube;"],[0,"&sqsupe;"],[0,{v:"&sqcap;",n:65024,o:"&sqcaps;"}],[0,{v:"&sqcup;",n:65024,o:"&sqcups;"}],[0,"&CirclePlus;"],[0,"&CircleMinus;"],[0,"&CircleTimes;"],[0,"&osol;"],[0,"&CircleDot;"],[0,"&circledcirc;"],[0,"&circledast;"],[1,"&circleddash;"],[0,"&boxplus;"],[0,"&boxminus;"],[0,"&boxtimes;"],[0,"&dotsquare;"],[0,"&RightTee;"],[0,"&dashv;"],[0,"&DownTee;"],[0,"&bot;"],[1,"&models;"],[0,"&DoubleRightTee;"],[0,"&Vdash;"],[0,"&Vvdash;"],[0,"&VDash;"],[0,"&nvdash;"],[0,"&nvDash;"],[0,"&nVdash;"],[0,"&nVDash;"],[0,"&prurel;"],[1,"&LeftTriangle;"],[0,"&RightTriangle;"],[0,{v:"&LeftTriangleEqual;",n:8402,o:"&nvltrie;"}],[0,{v:"&RightTriangleEqual;",n:8402,o:"&nvrtrie;"}],[0,"&origof;"],[0,"&imof;"],[0,"&multimap;"],[0,"&hercon;"],[0,"&intcal;"],[0,"&veebar;"],[1,"&barvee;"],[0,"&angrtvb;"],[0,"&lrtri;"],[0,"&bigwedge;"],[0,"&bigvee;"],[0,"&bigcap;"],[0,"&bigcup;"],[0,"&diam;"],[0,"&sdot;"],[0,"&sstarf;"],[0,"&divideontimes;"],[0,"&bowtie;"],[0,"&ltimes;"],[0,"&rtimes;"],[0,"&leftthreetimes;"],[0,"&rightthreetimes;"],[0,"&backsimeq;"],[0,"&curlyvee;"],[0,"&curlywedge;"],[0,"&Sub;"],[0,"&Sup;"],[0,"&Cap;"],[0,"&Cup;"],[0,"&fork;"],[0,"&epar;"],[0,"&lessdot;"],[0,"&gtdot;"],[0,{v:"&Ll;",n:824,o:"&nLl;"}],[0,{v:"&Gg;",n:824,o:"&nGg;"}],[0,{v:"&leg;",n:65024,o:"&lesg;"}],[0,{v:"&gel;",n:65024,o:"&gesl;"}],[2,"&cuepr;"],[0,"&cuesc;"],[0,"&NotPrecedesSlantEqual;"],[0,"&NotSucceedsSlantEqual;"],[0,"&NotSquareSubsetEqual;"],[0,"&NotSquareSupersetEqual;"],[2,"&lnsim;"],[0,"&gnsim;"],[0,"&precnsim;"],[0,"&scnsim;"],[0,"&nltri;"],[0,"&NotRightTriangle;"],[0,"&nltrie;"],[0,"&NotRightTriangleEqual;"],[0,"&vellip;"],[0,"&ctdot;"],[0,"&utdot;"],[0,"&dtdot;"],[0,"&disin;"],[0,"&isinsv;"],[0,"&isins;"],[0,{v:"&isindot;",n:824,o:"&notindot;"}],[0,"&notinvc;"],[0,"&notinvb;"],[1,{v:"&isinE;",n:824,o:"&notinE;"}],[0,"&nisd;"],[0,"&xnis;"],[0,"&nis;"],[0,"&notnivc;"],[0,"&notnivb;"],[6,"&barwed;"],[0,"&Barwed;"],[1,"&lceil;"],[0,"&rceil;"],[0,"&LeftFloor;"],[0,"&rfloor;"],[0,"&drcrop;"],[0,"&dlcrop;"],[0,"&urcrop;"],[0,"&ulcrop;"],[0,"&bnot;"],[1,"&profline;"],[0,"&profsurf;"],[1,"&telrec;"],[0,"&target;"],[5,"&ulcorn;"],[0,"&urcorn;"],[0,"&dlcorn;"],[0,"&drcorn;"],[2,"&frown;"],[0,"&smile;"],[9,"&cylcty;"],[0,"&profalar;"],[7,"&topbot;"],[6,"&ovbar;"],[1,"&solbar;"],[60,"&angzarr;"],[51,"&lmoustache;"],[0,"&rmoustache;"],[2,"&OverBracket;"],[0,"&bbrk;"],[0,"&bbrktbrk;"],[37,"&OverParenthesis;"],[0,"&UnderParenthesis;"],[0,"&OverBrace;"],[0,"&UnderBrace;"],[2,"&trpezium;"],[4,"&elinters;"],[59,"&blank;"],[164,"&circledS;"],[55,"&boxh;"],[1,"&boxv;"],[9,"&boxdr;"],[3,"&boxdl;"],[3,"&boxur;"],[3,"&boxul;"],[3,"&boxvr;"],[7,"&boxvl;"],[7,"&boxhd;"],[7,"&boxhu;"],[7,"&boxvh;"],[19,"&boxH;"],[0,"&boxV;"],[0,"&boxdR;"],[0,"&boxDr;"],[0,"&boxDR;"],[0,"&boxdL;"],[0,"&boxDl;"],[0,"&boxDL;"],[0,"&boxuR;"],[0,"&boxUr;"],[0,"&boxUR;"],[0,"&boxuL;"],[0,"&boxUl;"],[0,"&boxUL;"],[0,"&boxvR;"],[0,"&boxVr;"],[0,"&boxVR;"],[0,"&boxvL;"],[0,"&boxVl;"],[0,"&boxVL;"],[0,"&boxHd;"],[0,"&boxhD;"],[0,"&boxHD;"],[0,"&boxHu;"],[0,"&boxhU;"],[0,"&boxHU;"],[0,"&boxvH;"],[0,"&boxVh;"],[0,"&boxVH;"],[19,"&uhblk;"],[3,"&lhblk;"],[3,"&block;"],[8,"&blk14;"],[0,"&blk12;"],[0,"&blk34;"],[13,"&square;"],[8,"&blacksquare;"],[0,"&EmptyVerySmallSquare;"],[1,"&rect;"],[0,"&marker;"],[2,"&fltns;"],[1,"&bigtriangleup;"],[0,"&blacktriangle;"],[0,"&triangle;"],[2,"&blacktriangleright;"],[0,"&rtri;"],[3,"&bigtriangledown;"],[0,"&blacktriangledown;"],[0,"&dtri;"],[2,"&blacktriangleleft;"],[0,"&ltri;"],[6,"&loz;"],[0,"&cir;"],[32,"&tridot;"],[2,"&bigcirc;"],[8,"&ultri;"],[0,"&urtri;"],[0,"&lltri;"],[0,"&EmptySmallSquare;"],[0,"&FilledSmallSquare;"],[8,"&bigstar;"],[0,"&star;"],[7,"&phone;"],[49,"&female;"],[1,"&male;"],[29,"&spades;"],[2,"&clubs;"],[1,"&hearts;"],[0,"&diamondsuit;"],[3,"&sung;"],[2,"&flat;"],[0,"&natural;"],[0,"&sharp;"],[163,"&check;"],[3,"&cross;"],[8,"&malt;"],[21,"&sext;"],[33,"&VerticalSeparator;"],[25,"&lbbrk;"],[0,"&rbbrk;"],[84,"&bsolhsub;"],[0,"&suphsol;"],[28,"&LeftDoubleBracket;"],[0,"&RightDoubleBracket;"],[0,"&lang;"],[0,"&rang;"],[0,"&Lang;"],[0,"&Rang;"],[0,"&loang;"],[0,"&roang;"],[7,"&longleftarrow;"],[0,"&longrightarrow;"],[0,"&longleftrightarrow;"],[0,"&DoubleLongLeftArrow;"],[0,"&DoubleLongRightArrow;"],[0,"&DoubleLongLeftRightArrow;"],[1,"&longmapsto;"],[2,"&dzigrarr;"],[258,"&nvlArr;"],[0,"&nvrArr;"],[0,"&nvHarr;"],[0,"&Map;"],[6,"&lbarr;"],[0,"&bkarow;"],[0,"&lBarr;"],[0,"&dbkarow;"],[0,"&drbkarow;"],[0,"&DDotrahd;"],[0,"&UpArrowBar;"],[0,"&DownArrowBar;"],[2,"&Rarrtl;"],[2,"&latail;"],[0,"&ratail;"],[0,"&lAtail;"],[0,"&rAtail;"],[0,"&larrfs;"],[0,"&rarrfs;"],[0,"&larrbfs;"],[0,"&rarrbfs;"],[2,"&nwarhk;"],[0,"&nearhk;"],[0,"&hksearow;"],[0,"&hkswarow;"],[0,"&nwnear;"],[0,"&nesear;"],[0,"&seswar;"],[0,"&swnwar;"],[8,{v:"&rarrc;",n:824,o:"&nrarrc;"}],[1,"&cudarrr;"],[0,"&ldca;"],[0,"&rdca;"],[0,"&cudarrl;"],[0,"&larrpl;"],[2,"&curarrm;"],[0,"&cularrp;"],[7,"&rarrpl;"],[2,"&harrcir;"],[0,"&Uarrocir;"],[0,"&lurdshar;"],[0,"&ldrushar;"],[2,"&LeftRightVector;"],[0,"&RightUpDownVector;"],[0,"&DownLeftRightVector;"],[0,"&LeftUpDownVector;"],[0,"&LeftVectorBar;"],[0,"&RightVectorBar;"],[0,"&RightUpVectorBar;"],[0,"&RightDownVectorBar;"],[0,"&DownLeftVectorBar;"],[0,"&DownRightVectorBar;"],[0,"&LeftUpVectorBar;"],[0,"&LeftDownVectorBar;"],[0,"&LeftTeeVector;"],[0,"&RightTeeVector;"],[0,"&RightUpTeeVector;"],[0,"&RightDownTeeVector;"],[0,"&DownLeftTeeVector;"],[0,"&DownRightTeeVector;"],[0,"&LeftUpTeeVector;"],[0,"&LeftDownTeeVector;"],[0,"&lHar;"],[0,"&uHar;"],[0,"&rHar;"],[0,"&dHar;"],[0,"&luruhar;"],[0,"&ldrdhar;"],[0,"&ruluhar;"],[0,"&rdldhar;"],[0,"&lharul;"],[0,"&llhard;"],[0,"&rharul;"],[0,"&lrhard;"],[0,"&udhar;"],[0,"&duhar;"],[0,"&RoundImplies;"],[0,"&erarr;"],[0,"&simrarr;"],[0,"&larrsim;"],[0,"&rarrsim;"],[0,"&rarrap;"],[0,"&ltlarr;"],[1,"&gtrarr;"],[0,"&subrarr;"],[1,"&suplarr;"],[0,"&lfisht;"],[0,"&rfisht;"],[0,"&ufisht;"],[0,"&dfisht;"],[5,"&lopar;"],[0,"&ropar;"],[4,"&lbrke;"],[0,"&rbrke;"],[0,"&lbrkslu;"],[0,"&rbrksld;"],[0,"&lbrksld;"],[0,"&rbrkslu;"],[0,"&langd;"],[0,"&rangd;"],[0,"&lparlt;"],[0,"&rpargt;"],[0,"&gtlPar;"],[0,"&ltrPar;"],[3,"&vzigzag;"],[1,"&vangrt;"],[0,"&angrtvbd;"],[6,"&ange;"],[0,"&range;"],[0,"&dwangle;"],[0,"&uwangle;"],[0,"&angmsdaa;"],[0,"&angmsdab;"],[0,"&angmsdac;"],[0,"&angmsdad;"],[0,"&angmsdae;"],[0,"&angmsdaf;"],[0,"&angmsdag;"],[0,"&angmsdah;"],[0,"&bemptyv;"],[0,"&demptyv;"],[0,"&cemptyv;"],[0,"&raemptyv;"],[0,"&laemptyv;"],[0,"&ohbar;"],[0,"&omid;"],[0,"&opar;"],[1,"&operp;"],[1,"&olcross;"],[0,"&odsold;"],[1,"&olcir;"],[0,"&ofcir;"],[0,"&olt;"],[0,"&ogt;"],[0,"&cirscir;"],[0,"&cirE;"],[0,"&solb;"],[0,"&bsolb;"],[3,"&boxbox;"],[3,"&trisb;"],[0,"&rtriltri;"],[0,{v:"&LeftTriangleBar;",n:824,o:"&NotLeftTriangleBar;"}],[0,{v:"&RightTriangleBar;",n:824,o:"&NotRightTriangleBar;"}],[11,"&iinfin;"],[0,"&infintie;"],[0,"&nvinfin;"],[4,"&eparsl;"],[0,"&smeparsl;"],[0,"&eqvparsl;"],[5,"&blacklozenge;"],[8,"&RuleDelayed;"],[1,"&dsol;"],[9,"&bigodot;"],[0,"&bigoplus;"],[0,"&bigotimes;"],[1,"&biguplus;"],[1,"&bigsqcup;"],[5,"&iiiint;"],[0,"&fpartint;"],[2,"&cirfnint;"],[0,"&awint;"],[0,"&rppolint;"],[0,"&scpolint;"],[0,"&npolint;"],[0,"&pointint;"],[0,"&quatint;"],[0,"&intlarhk;"],[10,"&pluscir;"],[0,"&plusacir;"],[0,"&simplus;"],[0,"&plusdu;"],[0,"&plussim;"],[0,"&plustwo;"],[1,"&mcomma;"],[0,"&minusdu;"],[2,"&loplus;"],[0,"&roplus;"],[0,"&Cross;"],[0,"&timesd;"],[0,"&timesbar;"],[1,"&smashp;"],[0,"&lotimes;"],[0,"&rotimes;"],[0,"&otimesas;"],[0,"&Otimes;"],[0,"&odiv;"],[0,"&triplus;"],[0,"&triminus;"],[0,"&tritime;"],[0,"&intprod;"],[2,"&amalg;"],[0,"&capdot;"],[1,"&ncup;"],[0,"&ncap;"],[0,"&capand;"],[0,"&cupor;"],[0,"&cupcap;"],[0,"&capcup;"],[0,"&cupbrcap;"],[0,"&capbrcup;"],[0,"&cupcup;"],[0,"&capcap;"],[0,"&ccups;"],[0,"&ccaps;"],[2,"&ccupssm;"],[2,"&And;"],[0,"&Or;"],[0,"&andand;"],[0,"&oror;"],[0,"&orslope;"],[0,"&andslope;"],[1,"&andv;"],[0,"&orv;"],[0,"&andd;"],[0,"&ord;"],[1,"&wedbar;"],[6,"&sdote;"],[3,"&simdot;"],[2,{v:"&congdot;",n:824,o:"&ncongdot;"}],[0,"&easter;"],[0,"&apacir;"],[0,{v:"&apE;",n:824,o:"&napE;"}],[0,"&eplus;"],[0,"&pluse;"],[0,"&Esim;"],[0,"&Colone;"],[0,"&Equal;"],[1,"&ddotseq;"],[0,"&equivDD;"],[0,"&ltcir;"],[0,"&gtcir;"],[0,"&ltquest;"],[0,"&gtquest;"],[0,{v:"&leqslant;",n:824,o:"&nleqslant;"}],[0,{v:"&geqslant;",n:824,o:"&ngeqslant;"}],[0,"&lesdot;"],[0,"&gesdot;"],[0,"&lesdoto;"],[0,"&gesdoto;"],[0,"&lesdotor;"],[0,"&gesdotol;"],[0,"&lap;"],[0,"&gap;"],[0,"&lne;"],[0,"&gne;"],[0,"&lnap;"],[0,"&gnap;"],[0,"&lEg;"],[0,"&gEl;"],[0,"&lsime;"],[0,"&gsime;"],[0,"&lsimg;"],[0,"&gsiml;"],[0,"&lgE;"],[0,"&glE;"],[0,"&lesges;"],[0,"&gesles;"],[0,"&els;"],[0,"&egs;"],[0,"&elsdot;"],[0,"&egsdot;"],[0,"&el;"],[0,"&eg;"],[2,"&siml;"],[0,"&simg;"],[0,"&simlE;"],[0,"&simgE;"],[0,{v:"&LessLess;",n:824,o:"&NotNestedLessLess;"}],[0,{v:"&GreaterGreater;",n:824,o:"&NotNestedGreaterGreater;"}],[1,"&glj;"],[0,"&gla;"],[0,"&ltcc;"],[0,"&gtcc;"],[0,"&lescc;"],[0,"&gescc;"],[0,"&smt;"],[0,"&lat;"],[0,{v:"&smte;",n:65024,o:"&smtes;"}],[0,{v:"&late;",n:65024,o:"&lates;"}],[0,"&bumpE;"],[0,{v:"&PrecedesEqual;",n:824,o:"&NotPrecedesEqual;"}],[0,{v:"&sce;",n:824,o:"&NotSucceedsEqual;"}],[2,"&prE;"],[0,"&scE;"],[0,"&precneqq;"],[0,"&scnE;"],[0,"&prap;"],[0,"&scap;"],[0,"&precnapprox;"],[0,"&scnap;"],[0,"&Pr;"],[0,"&Sc;"],[0,"&subdot;"],[0,"&supdot;"],[0,"&subplus;"],[0,"&supplus;"],[0,"&submult;"],[0,"&supmult;"],[0,"&subedot;"],[0,"&supedot;"],[0,{v:"&subE;",n:824,o:"&nsubE;"}],[0,{v:"&supE;",n:824,o:"&nsupE;"}],[0,"&subsim;"],[0,"&supsim;"],[2,{v:"&subnE;",n:65024,o:"&varsubsetneqq;"}],[0,{v:"&supnE;",n:65024,o:"&varsupsetneqq;"}],[2,"&csub;"],[0,"&csup;"],[0,"&csube;"],[0,"&csupe;"],[0,"&subsup;"],[0,"&supsub;"],[0,"&subsub;"],[0,"&supsup;"],[0,"&suphsub;"],[0,"&supdsub;"],[0,"&forkv;"],[0,"&topfork;"],[0,"&mlcp;"],[8,"&Dashv;"],[1,"&Vdashl;"],[0,"&Barv;"],[0,"&vBar;"],[0,"&vBarv;"],[1,"&Vbar;"],[0,"&Not;"],[0,"&bNot;"],[0,"&rnmid;"],[0,"&cirmid;"],[0,"&midcir;"],[0,"&topcir;"],[0,"&nhpar;"],[0,"&parsim;"],[9,{v:"&parsl;",n:8421,o:"&nparsl;"}],[44343,{n:new Map(Ve([[56476,"&Ascr;"],[1,"&Cscr;"],[0,"&Dscr;"],[2,"&Gscr;"],[2,"&Jscr;"],[0,"&Kscr;"],[2,"&Nscr;"],[0,"&Oscr;"],[0,"&Pscr;"],[0,"&Qscr;"],[1,"&Sscr;"],[0,"&Tscr;"],[0,"&Uscr;"],[0,"&Vscr;"],[0,"&Wscr;"],[0,"&Xscr;"],[0,"&Yscr;"],[0,"&Zscr;"],[0,"&ascr;"],[0,"&bscr;"],[0,"&cscr;"],[0,"&dscr;"],[1,"&fscr;"],[1,"&hscr;"],[0,"&iscr;"],[0,"&jscr;"],[0,"&kscr;"],[0,"&lscr;"],[0,"&mscr;"],[0,"&nscr;"],[1,"&pscr;"],[0,"&qscr;"],[0,"&rscr;"],[0,"&sscr;"],[0,"&tscr;"],[0,"&uscr;"],[0,"&vscr;"],[0,"&wscr;"],[0,"&xscr;"],[0,"&yscr;"],[0,"&zscr;"],[52,"&Afr;"],[0,"&Bfr;"],[1,"&Dfr;"],[0,"&Efr;"],[0,"&Ffr;"],[0,"&Gfr;"],[2,"&Jfr;"],[0,"&Kfr;"],[0,"&Lfr;"],[0,"&Mfr;"],[0,"&Nfr;"],[0,"&Ofr;"],[0,"&Pfr;"],[0,"&Qfr;"],[1,"&Sfr;"],[0,"&Tfr;"],[0,"&Ufr;"],[0,"&Vfr;"],[0,"&Wfr;"],[0,"&Xfr;"],[0,"&Yfr;"],[1,"&afr;"],[0,"&bfr;"],[0,"&cfr;"],[0,"&dfr;"],[0,"&efr;"],[0,"&ffr;"],[0,"&gfr;"],[0,"&hfr;"],[0,"&ifr;"],[0,"&jfr;"],[0,"&kfr;"],[0,"&lfr;"],[0,"&mfr;"],[0,"&nfr;"],[0,"&ofr;"],[0,"&pfr;"],[0,"&qfr;"],[0,"&rfr;"],[0,"&sfr;"],[0,"&tfr;"],[0,"&ufr;"],[0,"&vfr;"],[0,"&wfr;"],[0,"&xfr;"],[0,"&yfr;"],[0,"&zfr;"],[0,"&Aopf;"],[0,"&Bopf;"],[1,"&Dopf;"],[0,"&Eopf;"],[0,"&Fopf;"],[0,"&Gopf;"],[1,"&Iopf;"],[0,"&Jopf;"],[0,"&Kopf;"],[0,"&Lopf;"],[0,"&Mopf;"],[1,"&Oopf;"],[3,"&Sopf;"],[0,"&Topf;"],[0,"&Uopf;"],[0,"&Vopf;"],[0,"&Wopf;"],[0,"&Xopf;"],[0,"&Yopf;"],[1,"&aopf;"],[0,"&bopf;"],[0,"&copf;"],[0,"&dopf;"],[0,"&eopf;"],[0,"&fopf;"],[0,"&gopf;"],[0,"&hopf;"],[0,"&iopf;"],[0,"&jopf;"],[0,"&kopf;"],[0,"&lopf;"],[0,"&mopf;"],[0,"&nopf;"],[0,"&oopf;"],[0,"&popf;"],[0,"&qopf;"],[0,"&ropf;"],[0,"&sopf;"],[0,"&topf;"],[0,"&uopf;"],[0,"&vopf;"],[0,"&wopf;"],[0,"&xopf;"],[0,"&yopf;"],[0,"&zopf;"]]))}],[8906,"&fflig;"],[0,"&filig;"],[0,"&fllig;"],[0,"&ffilig;"],[0,"&ffllig;"]]));var Dn=new Map([[34,"&quot;"],[38,"&amp;"],[39,"&apos;"],[60,"&lt;"],[62,"&gt;"]]),Sn=String.prototype.codePointAt!=null?(e,r)=>e.codePointAt(r):(e,r)=>(e.charCodeAt(r)&64512)===55296?(e.charCodeAt(r)-55296)*1024+e.charCodeAt(r+1)-56320+65536:e.charCodeAt(r);function br(e,r){return function(u){let o,n=0,a="";for(;o=e.exec(u);)n!==o.index&&(a+=u.substring(n,o.index)),a+=r.get(o[0].charCodeAt(0)),n=o.index+1;return a+u.substring(n)}}var Qt=br(/[&<>'"]/g,Dn),eu=br(/["&\u00A0]/g,new Map([[34,"&quot;"],[38,"&amp;"],[160,"&nbsp;"]])),ru=br(/[&<>\u00A0]/g,new Map([[38,"&amp;"],[60,"&lt;"],[62,"&gt;"],[160,"&nbsp;"]]));var tu;(function(e){e[e.XML=0]="XML",e[e.HTML=1]="HTML"})(tu||(tu={}));var uu;(function(e){e[e.UTF8=0]="UTF8",e[e.ASCII=1]="ASCII",e[e.Extensive=2]="Extensive",e[e.Attribute=3]="Attribute",e[e.Text=4]="Text"})(uu||(uu={}));function Mn(e){return Object.prototype.toString.call(e)}function Ue(e){return Mn(e)==="[object String]"}var $n=Object.prototype.hasOwnProperty;function Ln(e,r){return $n.call(e,r)}function pe(e){return Array.prototype.slice.call(arguments,1).forEach(function(t){if(t){if(typeof t!="object")throw new TypeError(t+"must be object");Object.keys(t).forEach(function(u){e[u]=t[u]})}}),e}function xr(e,r,t){return[].concat(e.slice(0,r),t,e.slice(r+1))}function Ze(e){return!(e>=55296&&e<=57343||e>=64976&&e<=65007||(e&65535)===65535||(e&65535)===65534||e>=0&&e<=8||e===11||e>=14&&e<=31||e>=127&&e<=159||e>1114111)}function Ee(e){if(e>65535){e-=65536;let r=55296+(e>>10),t=56320+(e&1023);return String.fromCharCode(r,t)}return String.fromCharCode(e)}var au=/\\([!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~])/g,Rn=/&([a-z#][a-z0-9]{1,31});/gi,qn=new RegExp(au.source+"|"+Rn.source,"gi"),zn=/^#((?:x[a-f0-9]{1,8}|[0-9]{1,8}))$/i;function In(e,r){if(r.charCodeAt(0)===35&&zn.test(r)){let u=r[1].toLowerCase()==="x"?parseInt(r.slice(2),16):parseInt(r.slice(1),10);return Ze(u)?Ee(u):e}let t=Y(e);return t!==e?t:e}function Bn(e){return e.indexOf("\\")<0?e:e.replace(au,"$1")}function O(e){return e.indexOf("\\")<0&&e.indexOf("&")<0?e:e.replace(qn,function(r,t,u){return t||In(r,u)})}var Pn=/[&<>"]/,Nn=/[&<>"]/g,Hn={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"};function On(e){return Hn[e]}function j(e){return Pn.test(e)?e.replace(Nn,On):e}var jn=/[.?*+^$[\]\\(){}|-]/g;function Vn(e){return e.replace(jn,"\\$&")}function A(e){switch(e){case 9:case 32:return!0}return!1}function ee(e){if(e>=8192&&e<=8202)return!0;switch(e){case 9:case 10:case 11:case 12:case 13:case 32:case 160:case 5760:case 8239:case 8287:case 12288:return!0}return!1}function re(e){return me.test(e)||He.test(e)}function te(e){switch(e){case 33:case 34:case 35:case 36:case 37:case 38:case 39:case 40:case 41:case 42:case 43:case 44:case 45:case 46:case 47:case 58:case 59:case 60:case 61:case 62:case 63:case 64:case 91:case 92:case 93:case 94:case 95:case 96:case 123:case 124:case 125:case 126:return!0;default:return!1}}function ue(e){return e=e.trim().replace(/\s+/g," "),"\u1E9E".toLowerCase()==="\u1E7E"&&(e=e.replace(/ẞ/g,"\xDF")),e.toLowerCase().toUpperCase()}var Un={mdurl:Be,ucmicro:dr};var wr={};_e(wr,{parseLinkDestination:()=>vr,parseLinkLabel:()=>yr,parseLinkTitle:()=>_r});function yr(e,r,t){let u,o,n,a,i=e.posMax,c=e.pos;for(e.pos=r+1,u=1;e.pos<i;){if(n=e.src.charCodeAt(e.pos),n===93&&(u--,u===0)){o=!0;break}if(a=e.pos,e.md.inline.skipToken(e),n===91){if(a===e.pos-1)u++;else if(t)return e.pos=c,-1}}let s=-1;return o&&(s=e.pos),e.pos=c,s}function vr(e,r,t){let u,o=r,n={ok:!1,pos:0,str:""};if(e.charCodeAt(o)===60){for(o++;o<t;){if(u=e.charCodeAt(o),u===10||u===60)return n;if(u===62)return n.pos=o+1,n.str=O(e.slice(r+1,o)),n.ok=!0,n;if(u===92&&o+1<t){o+=2;continue}o++}return n}let a=0;for(;o<t&&(u=e.charCodeAt(o),!(u===32||u<32||u===127));){if(u===92&&o+1<t){if(e.charCodeAt(o+1)===32)break;o+=2;continue}if(u===40&&(a++,a>32))return n;if(u===41){if(a===0)break;a--}o++}return r===o||a!==0||(n.str=O(e.slice(r,o)),n.pos=o,n.ok=!0),n}function _r(e,r,t,u){let o,n=r,a={ok:!1,can_continue:!1,pos:0,str:"",marker:0};if(u)a.str=u.str,a.marker=u.marker;else{if(n>=t)return a;let i=e.charCodeAt(n);if(i!==34&&i!==39&&i!==40)return a;r++,n++,i===40&&(i=41),a.marker=i}for(;n<t;){if(o=e.charCodeAt(n),o===a.marker)return a.pos=n+1,a.str+=O(e.slice(r,n)),a.ok=!0,a;if(o===40&&a.marker===41)return a;o===92&&n+1<t&&n++,n++}return a.can_continue=!0,a.str+=O(e.slice(r,n)),a}var P={};P.code_inline=function(e,r,t,u,o){let n=e[r];return"<code"+o.renderAttrs(n)+">"+j(n.content)+"</code>"};P.code_block=function(e,r,t,u,o){let n=e[r];return"<pre"+o.renderAttrs(n)+"><code>"+j(e[r].content)+`</code></pre>
`};P.fence=function(e,r,t,u,o){let n=e[r],a=n.info?O(n.info).trim():"",i="",c="";if(a){let d=a.split(/(\s+)/g);i=d[0],c=d.slice(2).join("")}let s;if(t.highlight?s=t.highlight(n.content,i,c)||j(n.content):s=j(n.content),s.indexOf("<pre")===0)return s+`
`;if(a){let d=n.attrIndex("class"),l=n.attrs?n.attrs.slice():[];d<0?l.push(["class",t.langPrefix+i]):(l[d]=l[d].slice(),l[d][1]+=" "+t.langPrefix+i);let p={attrs:l};return`<pre><code${o.renderAttrs(p)}>${s}</code></pre>
`}return`<pre><code${o.renderAttrs(n)}>${s}</code></pre>
`};P.image=function(e,r,t,u,o){let n=e[r];return n.attrs[n.attrIndex("alt")][1]=o.renderInlineAsText(n.children,t,u),o.renderToken(e,r,t)};P.hardbreak=function(e,r,t){return t.xhtmlOut?`<br />
`:`<br>
`};P.softbreak=function(e,r,t){return t.breaks?t.xhtmlOut?`<br />
`:`<br>
`:`
`};P.text=function(e,r){return j(e[r].content)};P.html_block=function(e,r){return e[r].content};P.html_inline=function(e,r){return e[r].content};function he(){this.rules=pe({},P)}he.prototype.renderAttrs=function(r){let t,u,o;if(!r.attrs)return"";for(o="",t=0,u=r.attrs.length;t<u;t++)o+=" "+j(r.attrs[t][0])+'="'+j(r.attrs[t][1])+'"';return o};he.prototype.renderToken=function(r,t,u){let o=r[t],n="";if(o.hidden)return"";o.block&&o.nesting!==-1&&t&&r[t-1].hidden&&(n+=`
`),n+=(o.nesting===-1?"</":"<")+o.tag,n+=this.renderAttrs(o),o.nesting===0&&u.xhtmlOut&&(n+=" /");let a=!1;if(o.block&&(a=!0,o.nesting===1&&t+1<r.length)){let i=r[t+1];(i.type==="inline"||i.hidden||i.nesting===-1&&i.tag===o.tag)&&(a=!1)}return n+=a?`>
`:">",n};he.prototype.renderInline=function(e,r,t){let u="",o=this.rules;for(let n=0,a=e.length;n<a;n++){let i=e[n].type;typeof o[i]<"u"?u+=o[i](e,n,r,t,this):u+=this.renderToken(e,n,r)}return u};he.prototype.renderInlineAsText=function(e,r,t){let u="";for(let o=0,n=e.length;o<n;o++)switch(e[o].type){case"text":u+=e[o].content;break;case"image":u+=this.renderInlineAsText(e[o].children,r,t);break;case"html_inline":case"html_block":u+=e[o].content;break;case"softbreak":case"hardbreak":u+=`
`;break;default:}return u};he.prototype.render=function(e,r,t){let u="",o=this.rules;for(let n=0,a=e.length;n<a;n++){let i=e[n].type;i==="inline"?u+=this.renderInline(e[n].children,r,t):typeof o[i]<"u"?u+=o[i](e,n,r,t,this):u+=this.renderToken(e,n,r,t)}return u};var iu=he;function z(){this.__rules__=[],this.__cache__=null}z.prototype.__find__=function(e){for(let r=0;r<this.__rules__.length;r++)if(this.__rules__[r].name===e)return r;return-1};z.prototype.__compile__=function(){let e=this,r=[""];e.__rules__.forEach(function(t){t.enabled&&t.alt.forEach(function(u){r.indexOf(u)<0&&r.push(u)})}),e.__cache__={},r.forEach(function(t){e.__cache__[t]=[],e.__rules__.forEach(function(u){u.enabled&&(t&&u.alt.indexOf(t)<0||e.__cache__[t].push(u.fn))})})};z.prototype.at=function(e,r,t){let u=this.__find__(e),o=t||{};if(u===-1)throw new Error("Parser rule not found: "+e);this.__rules__[u].fn=r,this.__rules__[u].alt=o.alt||[],this.__cache__=null};z.prototype.before=function(e,r,t,u){let o=this.__find__(e),n=u||{};if(o===-1)throw new Error("Parser rule not found: "+e);this.__rules__.splice(o,0,{name:r,enabled:!0,fn:t,alt:n.alt||[]}),this.__cache__=null};z.prototype.after=function(e,r,t,u){let o=this.__find__(e),n=u||{};if(o===-1)throw new Error("Parser rule not found: "+e);this.__rules__.splice(o+1,0,{name:r,enabled:!0,fn:t,alt:n.alt||[]}),this.__cache__=null};z.prototype.push=function(e,r,t){let u=t||{};this.__rules__.push({name:e,enabled:!0,fn:r,alt:u.alt||[]}),this.__cache__=null};z.prototype.enable=function(e,r){Array.isArray(e)||(e=[e]);let t=[];return e.forEach(function(u){let o=this.__find__(u);if(o<0){if(r)return;throw new Error("Rules manager: invalid rule name "+u)}this.__rules__[o].enabled=!0,t.push(u)},this),this.__cache__=null,t};z.prototype.enableOnly=function(e,r){Array.isArray(e)||(e=[e]),this.__rules__.forEach(function(t){t.enabled=!1}),this.enable(e,r)};z.prototype.disable=function(e,r){Array.isArray(e)||(e=[e]);let t=[];return e.forEach(function(u){let o=this.__find__(u);if(o<0){if(r)return;throw new Error("Rules manager: invalid rule name "+u)}this.__rules__[o].enabled=!1,t.push(u)},this),this.__cache__=null,t};z.prototype.getRules=function(e){return this.__cache__===null&&this.__compile__(),this.__cache__[e]||[]};var oe=z;function be(e,r,t){this.type=e,this.tag=r,this.attrs=null,this.map=null,this.nesting=t,this.level=0,this.children=null,this.content="",this.markup="",this.info="",this.meta=null,this.block=!1,this.hidden=!1}be.prototype.attrIndex=function(r){if(!this.attrs)return-1;let t=this.attrs;for(let u=0,o=t.length;u<o;u++)if(t[u][0]===r)return u;return-1};be.prototype.attrPush=function(r){this.attrs?this.attrs.push(r):this.attrs=[r]};be.prototype.attrSet=function(r,t){let u=this.attrIndex(r),o=[r,t];u<0?this.attrPush(o):this.attrs[u]=o};be.prototype.attrGet=function(r){let t=this.attrIndex(r),u=null;return t>=0&&(u=this.attrs[t][1]),u};be.prototype.attrJoin=function(r,t){let u=this.attrIndex(r);u<0?this.attrPush([r,t]):this.attrs[u][1]=this.attrs[u][1]+" "+t};var V=be;function cu(e,r,t){this.src=e,this.env=t,this.tokens=[],this.inlineMode=!1,this.md=r}cu.prototype.Token=V;var su=cu;var Zn=/\r\n?|\n/g,Gn=/\0/g;function Ar(e){let r;r=e.src.replace(Zn,`
`),r=r.replace(Gn,"\uFFFD"),e.src=r}function Er(e){let r;e.inlineMode?(r=new e.Token("inline","",0),r.content=e.src,r.map=[0,1],r.children=[],e.tokens.push(r)):e.md.block.parse(e.src,e.md,e.env,e.tokens)}function Cr(e){let r=e.tokens;for(let t=0,u=r.length;t<u;t++){let o=r[t];o.type==="inline"&&e.md.inline.parse(o.content,e.md,e.env,o.children)}}function Wn(e){return/^<a[>\s]/i.test(e)}function Kn(e){return/^<\/a\s*>/i.test(e)}function Dr(e){let r=e.tokens;if(e.md.options.linkify)for(let t=0,u=r.length;t<u;t++){if(r[t].type!=="inline"||!e.md.linkify.pretest(r[t].content))continue;let o=r[t].children,n=0;for(let a=o.length-1;a>=0;a--){let i=o[a];if(i.type==="link_close"){for(a--;o[a].level!==i.level&&o[a].type!=="link_open";)a--;continue}if(i.type==="html_inline"&&(Wn(i.content)&&n>0&&n--,Kn(i.content)&&n++),!(n>0)&&i.type==="text"&&e.md.linkify.test(i.content)){let c=i.content,s=e.md.linkify.match(c),d=[],l=i.level,p=0;s.length>0&&s[0].index===0&&a>0&&o[a-1].type==="text_special"&&(s=s.slice(1));for(let m=0;m<s.length;m++){let f=s[m].url,h=e.md.normalizeLink(f);if(!e.md.validateLink(h))continue;let g=s[m].text;s[m].schema?s[m].schema==="mailto:"&&!/^mailto:/i.test(g)?g=e.md.normalizeLinkText("mailto:"+g).replace(/^mailto:/,""):g=e.md.normalizeLinkText(g):g=e.md.normalizeLinkText("http://"+g).replace(/^http:\/\//,"");let w=s[m].index;if(w>p){let v=new e.Token("text","",0);v.content=c.slice(p,w),v.level=l,d.push(v)}let b=new e.Token("link_open","a",1);b.attrs=[["href",h]],b.level=l++,b.markup="linkify",b.info="auto",d.push(b);let x=new e.Token("text","",0);x.content=g,x.level=l,d.push(x);let k=new e.Token("link_close","a",-1);k.level=--l,k.markup="linkify",k.info="auto",d.push(k),p=s[m].lastIndex}if(p<c.length){let m=new e.Token("text","",0);m.content=c.slice(p),m.level=l,d.push(m)}r[t].children=o=xr(o,a,d)}}}}var lu=/\+-|\.\.|\?\?\?\?|!!!!|,,|--/,Yn=/\((c|tm|r)\)/i,Jn=/\((c|tm|r)\)/ig,Xn={c:"\xA9",r:"\xAE",tm:"\u2122"};function Qn(e,r){return Xn[r.toLowerCase()]}function ea(e){let r=0;for(let t=e.length-1;t>=0;t--){let u=e[t];u.type==="text"&&!r&&(u.content=u.content.replace(Jn,Qn)),u.type==="link_open"&&u.info==="auto"&&r--,u.type==="link_close"&&u.info==="auto"&&r++}}function ra(e){let r=0;for(let t=e.length-1;t>=0;t--){let u=e[t];u.type==="text"&&!r&&lu.test(u.content)&&(u.content=u.content.replace(/\+-/g,"\xB1").replace(/\.{2,}/g,"\u2026").replace(/([?!])…/g,"$1..").replace(/([?!]){4,}/g,"$1$1$1").replace(/,{2,}/g,",").replace(/(^|[^-])---(?=[^-]|$)/mg,"$1\u2014").replace(/(^|\s)--(?=\s|$)/mg,"$1\u2013").replace(/(^|[^-\s])--(?=[^-\s]|$)/mg,"$1\u2013")),u.type==="link_open"&&u.info==="auto"&&r--,u.type==="link_close"&&u.info==="auto"&&r++}}function Sr(e){let r;if(e.md.options.typographer)for(r=e.tokens.length-1;r>=0;r--)e.tokens[r].type==="inline"&&(Yn.test(e.tokens[r].content)&&ea(e.tokens[r].children),lu.test(e.tokens[r].content)&&ra(e.tokens[r].children))}var ta=/['"]/,du=/['"]/g,fu="\u2019";function Ge(e,r,t){return e.slice(0,r)+t+e.slice(r+1)}function ua(e,r){let t,u=[];for(let o=0;o<e.length;o++){let n=e[o],a=e[o].level;for(t=u.length-1;t>=0&&!(u[t].level<=a);t--);if(u.length=t+1,n.type!=="text")continue;let i=n.content,c=0,s=i.length;e:for(;c<s;){du.lastIndex=c;let d=du.exec(i);if(!d)break;let l=!0,p=!0;c=d.index+1;let m=d[0]==="'",f=32;if(d.index-1>=0)f=i.charCodeAt(d.index-1);else for(t=o-1;t>=0&&!(e[t].type==="softbreak"||e[t].type==="hardbreak");t--)if(e[t].content){f=e[t].content.charCodeAt(e[t].content.length-1);break}let h=32;if(c<s)h=i.charCodeAt(c);else for(t=o+1;t<e.length&&!(e[t].type==="softbreak"||e[t].type==="hardbreak");t++)if(e[t].content){h=e[t].content.charCodeAt(0);break}let g=te(f)||re(String.fromCharCode(f)),w=te(h)||re(String.fromCharCode(h)),b=ee(f),x=ee(h);if(x?l=!1:w&&(b||g||(l=!1)),b?p=!1:g&&(x||w||(p=!1)),h===34&&d[0]==='"'&&f>=48&&f<=57&&(p=l=!1),l&&p&&(l=g,p=w),!l&&!p){m&&(n.content=Ge(n.content,d.index,fu));continue}if(p)for(t=u.length-1;t>=0;t--){let k=u[t];if(u[t].level<a)break;if(k.single===m&&u[t].level===a){k=u[t];let v,E;m?(v=r.md.options.quotes[2],E=r.md.options.quotes[3]):(v=r.md.options.quotes[0],E=r.md.options.quotes[1]),n.content=Ge(n.content,d.index,E),e[k.token].content=Ge(e[k.token].content,k.pos,v),c+=E.length-1,k.token===o&&(c+=v.length-1),i=n.content,s=i.length,u.length=t;continue e}}l?u.push({token:o,pos:d.index,single:m,level:a}):p&&m&&(n.content=Ge(n.content,d.index,fu))}}}function Fr(e){if(e.md.options.typographer)for(let r=e.tokens.length-1;r>=0;r--)e.tokens[r].type!=="inline"||!ta.test(e.tokens[r].content)||ua(e.tokens[r].children,e)}function Tr(e){let r,t,u=e.tokens,o=u.length;for(let n=0;n<o;n++){if(u[n].type!=="inline")continue;let a=u[n].children,i=a.length;for(r=0;r<i;r++)a[r].type==="text_special"&&(a[r].type="text");for(r=t=0;r<i;r++)a[r].type==="text"&&r+1<i&&a[r+1].type==="text"?a[r+1].content=a[r].content+a[r+1].content:(r!==t&&(a[t]=a[r]),t++);r!==t&&(a.length=t)}}var Mr=[["normalize",Ar],["block",Er],["inline",Cr],["linkify",Dr],["replacements",Sr],["smartquotes",Fr],["text_join",Tr]];function $r(){this.ruler=new oe;for(let e=0;e<Mr.length;e++)this.ruler.push(Mr[e][0],Mr[e][1])}$r.prototype.process=function(e){let r=this.ruler.getRules("");for(let t=0,u=r.length;t<u;t++)r[t](e)};$r.prototype.State=su;var mu=$r;function N(e,r,t,u){this.src=e,this.md=r,this.env=t,this.tokens=u,this.bMarks=[],this.eMarks=[],this.tShift=[],this.sCount=[],this.bsCount=[],this.blkIndent=0,this.line=0,this.lineMax=0,this.tight=!1,this.ddIndent=-1,this.listIndent=-1,this.parentType="root",this.level=0;let o=this.src;for(let n=0,a=0,i=0,c=0,s=o.length,d=!1;a<s;a++){let l=o.charCodeAt(a);if(!d)if(A(l)){i++,l===9?c+=4-c%4:c++;continue}else d=!0;(l===10||a===s-1)&&(l!==10&&a++,this.bMarks.push(n),this.eMarks.push(a),this.tShift.push(i),this.sCount.push(c),this.bsCount.push(0),d=!1,i=0,c=0,n=a+1)}this.bMarks.push(o.length),this.eMarks.push(o.length),this.tShift.push(0),this.sCount.push(0),this.bsCount.push(0),this.lineMax=this.bMarks.length-1}N.prototype.push=function(e,r,t){let u=new V(e,r,t);return u.block=!0,t<0&&this.level--,u.level=this.level,t>0&&this.level++,this.tokens.push(u),u};N.prototype.isEmpty=function(r){return this.bMarks[r]+this.tShift[r]>=this.eMarks[r]};N.prototype.skipEmptyLines=function(r){for(let t=this.lineMax;r<t&&!(this.bMarks[r]+this.tShift[r]<this.eMarks[r]);r++);return r};N.prototype.skipSpaces=function(r){for(let t=this.src.length;r<t;r++){let u=this.src.charCodeAt(r);if(!A(u))break}return r};N.prototype.skipSpacesBack=function(r,t){if(r<=t)return r;for(;r>t;)if(!A(this.src.charCodeAt(--r)))return r+1;return r};N.prototype.skipChars=function(r,t){for(let u=this.src.length;r<u&&this.src.charCodeAt(r)===t;r++);return r};N.prototype.skipCharsBack=function(r,t,u){if(r<=u)return r;for(;r>u;)if(t!==this.src.charCodeAt(--r))return r+1;return r};N.prototype.getLines=function(r,t,u,o){if(r>=t)return"";let n=new Array(t-r);for(let a=0,i=r;i<t;i++,a++){let c=0,s=this.bMarks[i],d=s,l;for(i+1<t||o?l=this.eMarks[i]+1:l=this.eMarks[i];d<l&&c<u;){let p=this.src.charCodeAt(d);if(A(p))p===9?c+=4-(c+this.bsCount[i])%4:c++;else if(d-s<this.tShift[i])c++;else break;d++}c>u?n[a]=new Array(c-u+1).join(" ")+this.src.slice(d,l):n[a]=this.src.slice(d,l)}return n.join("")};N.prototype.Token=V;var pu=N;var oa=65536;function Lr(e,r){let t=e.bMarks[r]+e.tShift[r],u=e.eMarks[r];return e.src.slice(t,u)}function hu(e){let r=[],t=e.length,u=0,o=e.charCodeAt(u),n=!1,a=0,i="";for(;u<t;)o===124&&(n?(i+=e.substring(a,u-1),a=u):(r.push(i+e.substring(a,u)),i="",a=u+1)),n=o===92,u++,o=e.charCodeAt(u);return r.push(i+e.substring(a)),r}function Rr(e,r,t,u){if(r+2>t)return!1;let o=r+1;if(e.sCount[o]<e.blkIndent||e.sCount[o]-e.blkIndent>=4)return!1;let n=e.bMarks[o]+e.tShift[o];if(n>=e.eMarks[o])return!1;let a=e.src.charCodeAt(n++);if(a!==124&&a!==45&&a!==58||n>=e.eMarks[o])return!1;let i=e.src.charCodeAt(n++);if(i!==124&&i!==45&&i!==58&&!A(i)||a===45&&A(i))return!1;for(;n<e.eMarks[o];){let k=e.src.charCodeAt(n);if(k!==124&&k!==45&&k!==58&&!A(k))return!1;n++}let c=Lr(e,r+1),s=c.split("|"),d=[];for(let k=0;k<s.length;k++){let v=s[k].trim();if(!v){if(k===0||k===s.length-1)continue;return!1}if(!/^:?-+:?$/.test(v))return!1;v.charCodeAt(v.length-1)===58?d.push(v.charCodeAt(0)===58?"center":"right"):v.charCodeAt(0)===58?d.push("left"):d.push("")}if(c=Lr(e,r).trim(),c.indexOf("|")===-1||e.sCount[r]-e.blkIndent>=4)return!1;s=hu(c),s.length&&s[0]===""&&s.shift(),s.length&&s[s.length-1]===""&&s.pop();let l=s.length;if(l===0||l!==d.length)return!1;if(u)return!0;let p=e.parentType;e.parentType="table";let m=e.md.block.ruler.getRules("blockquote"),f=e.push("table_open","table",1),h=[r,0];f.map=h;let g=e.push("thead_open","thead",1);g.map=[r,r+1];let w=e.push("tr_open","tr",1);w.map=[r,r+1];for(let k=0;k<s.length;k++){let v=e.push("th_open","th",1);d[k]&&(v.attrs=[["style","text-align:"+d[k]]]);let E=e.push("inline","",0);E.content=s[k].trim(),E.children=[],e.push("th_close","th",-1)}e.push("tr_close","tr",-1),e.push("thead_close","thead",-1);let b,x=0;for(o=r+2;o<t&&!(e.sCount[o]<e.blkIndent);o++){let k=!1;for(let E=0,S=m.length;E<S;E++)if(m[E](e,o,t,!0)){k=!0;break}if(k||(c=Lr(e,o).trim(),!c)||e.sCount[o]-e.blkIndent>=4||(s=hu(c),s.length&&s[0]===""&&s.shift(),s.length&&s[s.length-1]===""&&s.pop(),x+=l-s.length,x>oa))break;if(o===r+2){let E=e.push("tbody_open","tbody",1);E.map=b=[r+2,0]}let v=e.push("tr_open","tr",1);v.map=[o,o+1];for(let E=0;E<l;E++){let S=e.push("td_open","td",1);d[E]&&(S.attrs=[["style","text-align:"+d[E]]]);let q=e.push("inline","",0);q.content=s[E]?s[E].trim():"",q.children=[],e.push("td_close","td",-1)}e.push("tr_close","tr",-1)}return b&&(e.push("tbody_close","tbody",-1),b[1]=o),e.push("table_close","table",-1),h[1]=o,e.parentType=p,e.line=o,!0}function qr(e,r,t){if(e.sCount[r]-e.blkIndent<4)return!1;let u=r+1,o=u;for(;u<t;){if(e.isEmpty(u)){u++;continue}if(e.sCount[u]-e.blkIndent>=4){u++,o=u;continue}break}e.line=o;let n=e.push("code_block","code",0);return n.content=e.getLines(r,o,4+e.blkIndent,!1)+`
`,n.map=[r,e.line],!0}function zr(e,r,t,u){let o=e.bMarks[r]+e.tShift[r],n=e.eMarks[r];if(e.sCount[r]-e.blkIndent>=4||o+3>n)return!1;let a=e.src.charCodeAt(o);if(a!==126&&a!==96)return!1;let i=o;o=e.skipChars(o,a);let c=o-i;if(c<3)return!1;let s=e.src.slice(i,o),d=e.src.slice(o,n);if(a===96&&d.indexOf(String.fromCharCode(a))>=0)return!1;if(u)return!0;let l=r,p=!1;for(;l++,!(l>=t||(o=i=e.bMarks[l]+e.tShift[l],n=e.eMarks[l],o<n&&e.sCount[l]<e.blkIndent));)if(e.src.charCodeAt(o)===a&&!(e.sCount[l]-e.blkIndent>=4)&&(o=e.skipChars(o,a),!(o-i<c)&&(o=e.skipSpaces(o),!(o<n)))){p=!0;break}c=e.sCount[r],e.line=l+(p?1:0);let m=e.push("fence","code",0);return m.info=d,m.content=e.getLines(r+1,l,c,!0),m.markup=s,m.map=[r,e.line],!0}function Ir(e,r,t,u){let o=e.bMarks[r]+e.tShift[r],n=e.eMarks[r],a=e.lineMax;if(e.sCount[r]-e.blkIndent>=4||e.src.charCodeAt(o)!==62)return!1;if(u)return!0;let i=[],c=[],s=[],d=[],l=e.md.block.ruler.getRules("blockquote"),p=e.parentType;e.parentType="blockquote";let m=!1,f;for(f=r;f<t;f++){let x=e.sCount[f]<e.blkIndent;if(o=e.bMarks[f]+e.tShift[f],n=e.eMarks[f],o>=n)break;if(e.src.charCodeAt(o++)===62&&!x){let v=e.sCount[f]+1,E,S;e.src.charCodeAt(o)===32?(o++,v++,S=!1,E=!0):e.src.charCodeAt(o)===9?(E=!0,(e.bsCount[f]+v)%4===3?(o++,v++,S=!1):S=!0):E=!1;let q=v;for(i.push(e.bMarks[f]),e.bMarks[f]=o;o<n;){let W=e.src.charCodeAt(o);if(A(W))W===9?q+=4-(q+e.bsCount[f]+(S?1:0))%4:q++;else break;o++}m=o>=n,c.push(e.bsCount[f]),e.bsCount[f]=e.sCount[f]+1+(E?1:0),s.push(e.sCount[f]),e.sCount[f]=q-v,d.push(e.tShift[f]),e.tShift[f]=o-e.bMarks[f];continue}if(m)break;let k=!1;for(let v=0,E=l.length;v<E;v++)if(l[v](e,f,t,!0)){k=!0;break}if(k){e.lineMax=f,e.blkIndent!==0&&(i.push(e.bMarks[f]),c.push(e.bsCount[f]),d.push(e.tShift[f]),s.push(e.sCount[f]),e.sCount[f]-=e.blkIndent);break}i.push(e.bMarks[f]),c.push(e.bsCount[f]),d.push(e.tShift[f]),s.push(e.sCount[f]),e.sCount[f]=-1}let h=e.blkIndent;e.blkIndent=0;let g=e.push("blockquote_open","blockquote",1);g.markup=">";let w=[r,0];g.map=w,e.md.block.tokenize(e,r,f);let b=e.push("blockquote_close","blockquote",-1);b.markup=">",e.lineMax=a,e.parentType=p,w[1]=e.line;for(let x=0;x<d.length;x++)e.bMarks[x+r]=i[x],e.tShift[x+r]=d[x],e.sCount[x+r]=s[x],e.bsCount[x+r]=c[x];return e.blkIndent=h,!0}function Br(e,r,t,u){let o=e.eMarks[r];if(e.sCount[r]-e.blkIndent>=4)return!1;let n=e.bMarks[r]+e.tShift[r],a=e.src.charCodeAt(n++);if(a!==42&&a!==45&&a!==95)return!1;let i=1;for(;n<o;){let s=e.src.charCodeAt(n++);if(s!==a&&!A(s))return!1;s===a&&i++}if(i<3)return!1;if(u)return!0;e.line=r+1;let c=e.push("hr","hr",0);return c.map=[r,e.line],c.markup=Array(i+1).join(String.fromCharCode(a)),!0}function bu(e,r){let t=e.eMarks[r],u=e.bMarks[r]+e.tShift[r],o=e.src.charCodeAt(u++);if(o!==42&&o!==45&&o!==43)return-1;if(u<t){let n=e.src.charCodeAt(u);if(!A(n))return-1}return u}function gu(e,r){let t=e.bMarks[r]+e.tShift[r],u=e.eMarks[r],o=t;if(o+1>=u)return-1;let n=e.src.charCodeAt(o++);if(n<48||n>57)return-1;for(;;){if(o>=u)return-1;if(n=e.src.charCodeAt(o++),n>=48&&n<=57){if(o-t>=10)return-1;continue}if(n===41||n===46)break;return-1}return o<u&&(n=e.src.charCodeAt(o),!A(n))?-1:o}function na(e,r){let t=e.level+2;for(let u=r+2,o=e.tokens.length-2;u<o;u++)e.tokens[u].level===t&&e.tokens[u].type==="paragraph_open"&&(e.tokens[u+2].hidden=!0,e.tokens[u].hidden=!0,u+=2)}function Pr(e,r,t,u){let o,n,a,i,c=r,s=!0;if(e.sCount[c]-e.blkIndent>=4||e.listIndent>=0&&e.sCount[c]-e.listIndent>=4&&e.sCount[c]<e.blkIndent)return!1;let d=!1;u&&e.parentType==="paragraph"&&e.sCount[c]>=e.blkIndent&&(d=!0);let l,p,m;if((m=gu(e,c))>=0){if(l=!0,a=e.bMarks[c]+e.tShift[c],p=Number(e.src.slice(a,m-1)),d&&p!==1)return!1}else if((m=bu(e,c))>=0)l=!1;else return!1;if(d&&e.skipSpaces(m)>=e.eMarks[c])return!1;if(u)return!0;let f=e.src.charCodeAt(m-1),h=e.tokens.length;l?(i=e.push("ordered_list_open","ol",1),p!==1&&(i.attrs=[["start",p]])):i=e.push("bullet_list_open","ul",1);let g=[c,0];i.map=g,i.markup=String.fromCharCode(f);let w=!1,b=e.md.block.ruler.getRules("list"),x=e.parentType;for(e.parentType="list";c<t;){n=m,o=e.eMarks[c];let k=e.sCount[c]+m-(e.bMarks[c]+e.tShift[c]),v=k;for(;n<o;){let le=e.src.charCodeAt(n);if(le===9)v+=4-(v+e.bsCount[c])%4;else if(le===32)v++;else break;n++}let E=n,S;E>=o?S=1:S=v-k,S>4&&(S=1);let q=k+S;i=e.push("list_item_open","li",1),i.markup=String.fromCharCode(f);let W=[c,0];i.map=W,l&&(i.info=e.src.slice(a,m-1));let ve=e.tight,sr=e.tShift[c],To=e.sCount[c],Mo=e.listIndent;if(e.listIndent=e.blkIndent,e.blkIndent=q,e.tight=!0,e.tShift[c]=E-e.bMarks[c],e.sCount[c]=v,E>=o&&e.isEmpty(c+1)?e.line=Math.min(e.line+2,t):e.md.block.tokenize(e,c,t,!0),(!e.tight||w)&&(s=!1),w=e.line-c>1&&e.isEmpty(e.line-1),e.blkIndent=e.listIndent,e.listIndent=Mo,e.tShift[c]=sr,e.sCount[c]=To,e.tight=ve,i=e.push("list_item_close","li",-1),i.markup=String.fromCharCode(f),c=e.line,W[1]=c,c>=t||e.sCount[c]<e.blkIndent||e.sCount[c]-e.blkIndent>=4)break;let Rt=!1;for(let le=0,$o=b.length;le<$o;le++)if(b[le](e,c,t,!0)){Rt=!0;break}if(Rt)break;if(l){if(m=gu(e,c),m<0)break;a=e.bMarks[c]+e.tShift[c]}else if(m=bu(e,c),m<0)break;if(f!==e.src.charCodeAt(m-1))break}return l?i=e.push("ordered_list_close","ol",-1):i=e.push("bullet_list_close","ul",-1),i.markup=String.fromCharCode(f),g[1]=c,e.line=c,e.parentType=x,s&&na(e,h),!0}function Nr(e,r,t,u){let o=e.bMarks[r]+e.tShift[r],n=e.eMarks[r],a=r+1;if(e.sCount[r]-e.blkIndent>=4||e.src.charCodeAt(o)!==91)return!1;function i(b){let x=e.lineMax;if(b>=x||e.isEmpty(b))return null;let k=!1;if(e.sCount[b]-e.blkIndent>3&&(k=!0),e.sCount[b]<0&&(k=!0),!k){let S=e.md.block.ruler.getRules("reference"),q=e.parentType;e.parentType="reference";let W=!1;for(let ve=0,sr=S.length;ve<sr;ve++)if(S[ve](e,b,x,!0)){W=!0;break}if(e.parentType=q,W)return null}let v=e.bMarks[b]+e.tShift[b],E=e.eMarks[b];return e.src.slice(v,E+1)}let c=e.src.slice(o,n+1);n=c.length;let s=-1;for(o=1;o<n;o++){let b=c.charCodeAt(o);if(b===91)return!1;if(b===93){s=o;break}else if(b===10){let x=i(a);x!==null&&(c+=x,n=c.length,a++)}else if(b===92&&(o++,o<n&&c.charCodeAt(o)===10)){let x=i(a);x!==null&&(c+=x,n=c.length,a++)}}if(s<0||c.charCodeAt(s+1)!==58)return!1;for(o=s+2;o<n;o++){let b=c.charCodeAt(o);if(b===10){let x=i(a);x!==null&&(c+=x,n=c.length,a++)}else if(!A(b))break}let d=e.md.helpers.parseLinkDestination(c,o,n);if(!d.ok)return!1;let l=e.md.normalizeLink(d.str);if(!e.md.validateLink(l))return!1;o=d.pos;let p=o,m=a,f=o;for(;o<n;o++){let b=c.charCodeAt(o);if(b===10){let x=i(a);x!==null&&(c+=x,n=c.length,a++)}else if(!A(b))break}let h=e.md.helpers.parseLinkTitle(c,o,n);for(;h.can_continue;){let b=i(a);if(b===null)break;c+=b,o=n,n=c.length,a++,h=e.md.helpers.parseLinkTitle(c,o,n,h)}let g;for(o<n&&f!==o&&h.ok?(g=h.str,o=h.pos):(g="",o=p,a=m);o<n;){let b=c.charCodeAt(o);if(!A(b))break;o++}if(o<n&&c.charCodeAt(o)!==10&&g)for(g="",o=p,a=m;o<n;){let b=c.charCodeAt(o);if(!A(b))break;o++}if(o<n&&c.charCodeAt(o)!==10)return!1;let w=ue(c.slice(1,s));return w?(u||(typeof e.env.references>"u"&&(e.env.references={}),typeof e.env.references[w]>"u"&&(e.env.references[w]={title:g,href:l}),e.line=a),!0):!1}var xu=["address","article","aside","base","basefont","blockquote","body","caption","center","col","colgroup","dd","details","dialog","dir","div","dl","dt","fieldset","figcaption","figure","footer","form","frame","frameset","h1","h2","h3","h4","h5","h6","head","header","hr","html","iframe","legend","li","link","main","menu","menuitem","nav","noframes","ol","optgroup","option","p","param","search","section","summary","table","tbody","td","tfoot","th","thead","title","tr","track","ul"];var aa="[a-zA-Z_:][a-zA-Z0-9:._-]*",ia="[^\"'=<>`\\x00-\\x20]+",ca="'[^']*'",sa='"[^"]*"',la="(?:"+ia+"|"+ca+"|"+sa+")",da="(?:\\s+"+aa+"(?:\\s*=\\s*"+la+")?)",ku="<[A-Za-z][A-Za-z0-9\\-]*"+da+"*\\s*\\/?>",yu="<\\/[A-Za-z][A-Za-z0-9\\-]*\\s*>",fa="<!---?>|<!--(?:[^-]|-[^-]|--[^>])*-->",ma="<[?][\\s\\S]*?[?]>",pa="<![A-Za-z][^>]*>",ha="<!\\[CDATA\\[[\\s\\S]*?\\]\\]>",vu=new RegExp("^(?:"+ku+"|"+yu+"|"+fa+"|"+ma+"|"+pa+"|"+ha+")"),_u=new RegExp("^(?:"+ku+"|"+yu+")");var ge=[[/^<(script|pre|style|textarea)(?=(\s|>|$))/i,/<\/(script|pre|style|textarea)>/i,!0],[/^<!--/,/-->/,!0],[/^<\?/,/\?>/,!0],[/^<![A-Z]/,/>/,!0],[/^<!\[CDATA\[/,/\]\]>/,!0],[new RegExp("^</?("+xu.join("|")+")(?=(\\s|/?>|$))","i"),/^$/,!0],[new RegExp(_u.source+"\\s*$"),/^$/,!1]];function Hr(e,r,t,u){let o=e.bMarks[r]+e.tShift[r],n=e.eMarks[r];if(e.sCount[r]-e.blkIndent>=4||!e.md.options.html||e.src.charCodeAt(o)!==60)return!1;let a=e.src.slice(o,n),i=0;for(;i<ge.length&&!ge[i][0].test(a);i++);if(i===ge.length)return!1;if(u)return ge[i][2];let c=r+1;if(!ge[i][1].test(a)){for(;c<t&&!(e.sCount[c]<e.blkIndent);c++)if(o=e.bMarks[c]+e.tShift[c],n=e.eMarks[c],a=e.src.slice(o,n),ge[i][1].test(a)){a.length!==0&&c++;break}}e.line=c;let s=e.push("html_block","",0);return s.map=[r,c],s.content=e.getLines(r,c,e.blkIndent,!0),!0}function Or(e,r,t,u){let o=e.bMarks[r]+e.tShift[r],n=e.eMarks[r];if(e.sCount[r]-e.blkIndent>=4)return!1;let a=e.src.charCodeAt(o);if(a!==35||o>=n)return!1;let i=1;for(a=e.src.charCodeAt(++o);a===35&&o<n&&i<=6;)i++,a=e.src.charCodeAt(++o);if(i>6||o<n&&!A(a))return!1;if(u)return!0;n=e.skipSpacesBack(n,o);let c=e.skipCharsBack(n,35,o);c>o&&A(e.src.charCodeAt(c-1))&&(n=c),e.line=r+1;let s=e.push("heading_open","h"+String(i),1);s.markup="########".slice(0,i),s.map=[r,e.line];let d=e.push("inline","",0);d.content=e.src.slice(o,n).trim(),d.map=[r,e.line],d.children=[];let l=e.push("heading_close","h"+String(i),-1);return l.markup="########".slice(0,i),!0}function jr(e,r,t){let u=e.md.block.ruler.getRules("paragraph");if(e.sCount[r]-e.blkIndent>=4)return!1;let o=e.parentType;e.parentType="paragraph";let n=0,a,i=r+1;for(;i<t&&!e.isEmpty(i);i++){if(e.sCount[i]-e.blkIndent>3)continue;if(e.sCount[i]>=e.blkIndent){let m=e.bMarks[i]+e.tShift[i],f=e.eMarks[i];if(m<f&&(a=e.src.charCodeAt(m),(a===45||a===61)&&(m=e.skipChars(m,a),m=e.skipSpaces(m),m>=f))){n=a===61?1:2;break}}if(e.sCount[i]<0)continue;let p=!1;for(let m=0,f=u.length;m<f;m++)if(u[m](e,i,t,!0)){p=!0;break}if(p)break}if(!n)return!1;let c=e.getLines(r,i,e.blkIndent,!1).trim();e.line=i+1;let s=e.push("heading_open","h"+String(n),1);s.markup=String.fromCharCode(a),s.map=[r,e.line];let d=e.push("inline","",0);d.content=c,d.map=[r,e.line-1],d.children=[];let l=e.push("heading_close","h"+String(n),-1);return l.markup=String.fromCharCode(a),e.parentType=o,!0}function Vr(e,r,t){let u=e.md.block.ruler.getRules("paragraph"),o=e.parentType,n=r+1;for(e.parentType="paragraph";n<t&&!e.isEmpty(n);n++){if(e.sCount[n]-e.blkIndent>3||e.sCount[n]<0)continue;let s=!1;for(let d=0,l=u.length;d<l;d++)if(u[d](e,n,t,!0)){s=!0;break}if(s)break}let a=e.getLines(r,n,e.blkIndent,!1).trim();e.line=n;let i=e.push("paragraph_open","p",1);i.map=[r,e.line];let c=e.push("inline","",0);return c.content=a,c.map=[r,e.line],c.children=[],e.push("paragraph_close","p",-1),e.parentType=o,!0}var We=[["table",Rr,["paragraph","reference"]],["code",qr],["fence",zr,["paragraph","reference","blockquote","list"]],["blockquote",Ir,["paragraph","reference","blockquote","list"]],["hr",Br,["paragraph","reference","blockquote","list"]],["list",Pr,["paragraph","reference","blockquote"]],["reference",Nr],["html_block",Hr,["paragraph","reference","blockquote"]],["heading",Or,["paragraph","reference","blockquote"]],["lheading",jr],["paragraph",Vr]];function Ke(){this.ruler=new oe;for(let e=0;e<We.length;e++)this.ruler.push(We[e][0],We[e][1],{alt:(We[e][2]||[]).slice()})}Ke.prototype.tokenize=function(e,r,t){let u=this.ruler.getRules(""),o=u.length,n=e.md.options.maxNesting,a=r,i=!1;for(;a<t&&(e.line=a=e.skipEmptyLines(a),!(a>=t||e.sCount[a]<e.blkIndent));){if(e.level>=n){e.line=t;break}let c=e.line,s=!1;for(let d=0;d<o;d++)if(s=u[d](e,a,t,!1),s){if(c>=e.line)throw new Error("block rule didn't increment state.line");break}if(!s)throw new Error("none of the block rules matched");e.tight=!i,e.isEmpty(e.line-1)&&(i=!0),a=e.line,a<t&&e.isEmpty(a)&&(i=!0,a++,e.line=a)}};Ke.prototype.parse=function(e,r,t,u){if(!e)return;let o=new this.State(e,r,t,u);this.tokenize(o,o.line,o.lineMax)};Ke.prototype.State=pu;var wu=Ke;function Ce(e,r,t,u){this.src=e,this.env=t,this.md=r,this.tokens=u,this.tokens_meta=Array(u.length),this.pos=0,this.posMax=this.src.length,this.level=0,this.pending="",this.pendingLevel=0,this.cache={},this.delimiters=[],this._prev_delimiters=[],this.backticks={},this.backticksScanned=!1,this.linkLevel=0}Ce.prototype.pushPending=function(){let e=new V("text","",0);return e.content=this.pending,e.level=this.pendingLevel,this.tokens.push(e),this.pending="",e};Ce.prototype.push=function(e,r,t){this.pending&&this.pushPending();let u=new V(e,r,t),o=null;return t<0&&(this.level--,this.delimiters=this._prev_delimiters.pop()),u.level=this.level,t>0&&(this.level++,this._prev_delimiters.push(this.delimiters),this.delimiters=[],o={delimiters:this.delimiters}),this.pendingLevel=this.level,this.tokens.push(u),this.tokens_meta.push(o),u};Ce.prototype.scanDelims=function(e,r){let t=this.posMax,u=this.src.charCodeAt(e),o=e>0?this.src.charCodeAt(e-1):32,n=e;for(;n<t&&this.src.charCodeAt(n)===u;)n++;let a=n-e,i=n<t?this.src.charCodeAt(n):32,c=te(o)||re(String.fromCharCode(o)),s=te(i)||re(String.fromCharCode(i)),d=ee(o),l=ee(i),p=!l&&(!s||d||c),m=!d&&(!c||l||s);return{can_open:p&&(r||!m||c),can_close:m&&(r||!p||s),length:a}};Ce.prototype.Token=V;var Au=Ce;function ba(e){switch(e){case 10:case 33:case 35:case 36:case 37:case 38:case 42:case 43:case 45:case 58:case 60:case 61:case 62:case 64:case 91:case 92:case 93:case 94:case 95:case 96:case 123:case 125:case 126:return!0;default:return!1}}function Ur(e,r){let t=e.pos;for(;t<e.posMax&&!ba(e.src.charCodeAt(t));)t++;return t===e.pos?!1:(r||(e.pending+=e.src.slice(e.pos,t)),e.pos=t,!0)}var ga=/(?:^|[^a-z0-9.+-])([a-z][a-z0-9.+-]*)$/i;function Zr(e,r){if(!e.md.options.linkify||e.linkLevel>0)return!1;let t=e.pos,u=e.posMax;if(t+3>u||e.src.charCodeAt(t)!==58||e.src.charCodeAt(t+1)!==47||e.src.charCodeAt(t+2)!==47)return!1;let o=e.pending.match(ga);if(!o)return!1;let n=o[1],a=e.md.linkify.matchAtStart(e.src.slice(t-n.length));if(!a)return!1;let i=a.url;if(i.length<=n.length)return!1;let c=i.length;for(;c>0&&i.charCodeAt(c-1)===42;)c--;c!==i.length&&(i=i.slice(0,c));let s=e.md.normalizeLink(i);if(!e.md.validateLink(s))return!1;if(!r){e.pending=e.pending.slice(0,-n.length);let d=e.push("link_open","a",1);d.attrs=[["href",s]],d.markup="linkify",d.info="auto";let l=e.push("text","",0);l.content=e.md.normalizeLinkText(i);let p=e.push("link_close","a",-1);p.markup="linkify",p.info="auto"}return e.pos+=i.length-n.length,!0}function Gr(e,r){let t=e.pos;if(e.src.charCodeAt(t)!==10)return!1;let u=e.pending.length-1,o=e.posMax;if(!r)if(u>=0&&e.pending.charCodeAt(u)===32)if(u>=1&&e.pending.charCodeAt(u-1)===32){let n=u-1;for(;n>=1&&e.pending.charCodeAt(n-1)===32;)n--;e.pending=e.pending.slice(0,n),e.push("hardbreak","br",0)}else e.pending=e.pending.slice(0,-1),e.push("softbreak","br",0);else e.push("softbreak","br",0);for(t++;t<o&&A(e.src.charCodeAt(t));)t++;return e.pos=t,!0}var Wr=[];for(let e=0;e<256;e++)Wr.push(0);"\\!\"#$%&'()*+,./:;<=>?@[]^_`{|}~-".split("").forEach(function(e){Wr[e.charCodeAt(0)]=1});function Kr(e,r){let t=e.pos,u=e.posMax;if(e.src.charCodeAt(t)!==92||(t++,t>=u))return!1;let o=e.src.charCodeAt(t);if(o===10){for(r||e.push("hardbreak","br",0),t++;t<u&&(o=e.src.charCodeAt(t),!!A(o));)t++;return e.pos=t,!0}let n=e.src[t];if(o>=55296&&o<=56319&&t+1<u){let i=e.src.charCodeAt(t+1);i>=56320&&i<=57343&&(n+=e.src[t+1],t++)}let a="\\"+n;if(!r){let i=e.push("text_special","",0);o<256&&Wr[o]!==0?i.content=n:i.content=a,i.markup=a,i.info="escape"}return e.pos=t+1,!0}function Yr(e,r){let t=e.pos;if(e.src.charCodeAt(t)!==96)return!1;let o=t;t++;let n=e.posMax;for(;t<n&&e.src.charCodeAt(t)===96;)t++;let a=e.src.slice(o,t),i=a.length;if(e.backticksScanned&&(e.backticks[i]||0)<=o)return r||(e.pending+=a),e.pos+=i,!0;let c=t,s;for(;(s=e.src.indexOf("`",c))!==-1;){for(c=s+1;c<n&&e.src.charCodeAt(c)===96;)c++;let d=c-s;if(d===i){if(!r){let l=e.push("code_inline","code",0);l.markup=a,l.content=e.src.slice(t,s).replace(/\n/g," ").replace(/^ (.+) $/,"$1")}return e.pos=c,!0}e.backticks[d]=s}return e.backticksScanned=!0,r||(e.pending+=a),e.pos+=i,!0}function xa(e,r){let t=e.pos,u=e.src.charCodeAt(t);if(r||u!==126)return!1;let o=e.scanDelims(e.pos,!0),n=o.length,a=String.fromCharCode(u);if(n<2)return!1;let i;n%2&&(i=e.push("text","",0),i.content=a,n--);for(let c=0;c<n;c+=2)i=e.push("text","",0),i.content=a+a,e.delimiters.push({marker:u,length:0,token:e.tokens.length-1,end:-1,open:o.can_open,close:o.can_close});return e.pos+=o.length,!0}function Eu(e,r){let t,u=[],o=r.length;for(let n=0;n<o;n++){let a=r[n];if(a.marker!==126||a.end===-1)continue;let i=r[a.end];t=e.tokens[a.token],t.type="s_open",t.tag="s",t.nesting=1,t.markup="~~",t.content="",t=e.tokens[i.token],t.type="s_close",t.tag="s",t.nesting=-1,t.markup="~~",t.content="",e.tokens[i.token-1].type==="text"&&e.tokens[i.token-1].content==="~"&&u.push(i.token-1)}for(;u.length;){let n=u.pop(),a=n+1;for(;a<e.tokens.length&&e.tokens[a].type==="s_close";)a++;a--,n!==a&&(t=e.tokens[a],e.tokens[a]=e.tokens[n],e.tokens[n]=t)}}function ka(e){let r=e.tokens_meta,t=e.tokens_meta.length;Eu(e,e.delimiters);for(let u=0;u<t;u++)r[u]&&r[u].delimiters&&Eu(e,r[u].delimiters)}var Jr={tokenize:xa,postProcess:ka};function ya(e,r){let t=e.pos,u=e.src.charCodeAt(t);if(r||u!==95&&u!==42)return!1;let o=e.scanDelims(e.pos,u===42);for(let n=0;n<o.length;n++){let a=e.push("text","",0);a.content=String.fromCharCode(u),e.delimiters.push({marker:u,length:o.length,token:e.tokens.length-1,end:-1,open:o.can_open,close:o.can_close})}return e.pos+=o.length,!0}function Cu(e,r){let t=r.length;for(let u=t-1;u>=0;u--){let o=r[u];if(o.marker!==95&&o.marker!==42||o.end===-1)continue;let n=r[o.end],a=u>0&&r[u-1].end===o.end+1&&r[u-1].marker===o.marker&&r[u-1].token===o.token-1&&r[o.end+1].token===n.token+1,i=String.fromCharCode(o.marker),c=e.tokens[o.token];c.type=a?"strong_open":"em_open",c.tag=a?"strong":"em",c.nesting=1,c.markup=a?i+i:i,c.content="";let s=e.tokens[n.token];s.type=a?"strong_close":"em_close",s.tag=a?"strong":"em",s.nesting=-1,s.markup=a?i+i:i,s.content="",a&&(e.tokens[r[u-1].token].content="",e.tokens[r[o.end+1].token].content="",u--)}}function va(e){let r=e.tokens_meta,t=e.tokens_meta.length;Cu(e,e.delimiters);for(let u=0;u<t;u++)r[u]&&r[u].delimiters&&Cu(e,r[u].delimiters)}var Xr={tokenize:ya,postProcess:va};function Qr(e,r){let t,u,o,n,a="",i="",c=e.pos,s=!0;if(e.src.charCodeAt(e.pos)!==91)return!1;let d=e.pos,l=e.posMax,p=e.pos+1,m=e.md.helpers.parseLinkLabel(e,e.pos,!0);if(m<0)return!1;let f=m+1;if(f<l&&e.src.charCodeAt(f)===40){for(s=!1,f++;f<l&&(t=e.src.charCodeAt(f),!(!A(t)&&t!==10));f++);if(f>=l)return!1;if(c=f,o=e.md.helpers.parseLinkDestination(e.src,f,e.posMax),o.ok){for(a=e.md.normalizeLink(o.str),e.md.validateLink(a)?f=o.pos:a="",c=f;f<l&&(t=e.src.charCodeAt(f),!(!A(t)&&t!==10));f++);if(o=e.md.helpers.parseLinkTitle(e.src,f,e.posMax),f<l&&c!==f&&o.ok)for(i=o.str,f=o.pos;f<l&&(t=e.src.charCodeAt(f),!(!A(t)&&t!==10));f++);}(f>=l||e.src.charCodeAt(f)!==41)&&(s=!0),f++}if(s){if(typeof e.env.references>"u")return!1;if(f<l&&e.src.charCodeAt(f)===91?(c=f+1,f=e.md.helpers.parseLinkLabel(e,f),f>=0?u=e.src.slice(c,f++):f=m+1):f=m+1,u||(u=e.src.slice(p,m)),n=e.env.references[ue(u)],!n)return e.pos=d,!1;a=n.href,i=n.title}if(!r){e.pos=p,e.posMax=m;let h=e.push("link_open","a",1),g=[["href",a]];h.attrs=g,i&&g.push(["title",i]),e.linkLevel++,e.md.inline.tokenize(e),e.linkLevel--,e.push("link_close","a",-1)}return e.pos=f,e.posMax=l,!0}function et(e,r){let t,u,o,n,a,i,c,s,d="",l=e.pos,p=e.posMax;if(e.src.charCodeAt(e.pos)!==33||e.src.charCodeAt(e.pos+1)!==91)return!1;let m=e.pos+2,f=e.md.helpers.parseLinkLabel(e,e.pos+1,!1);if(f<0)return!1;if(n=f+1,n<p&&e.src.charCodeAt(n)===40){for(n++;n<p&&(t=e.src.charCodeAt(n),!(!A(t)&&t!==10));n++);if(n>=p)return!1;for(s=n,i=e.md.helpers.parseLinkDestination(e.src,n,e.posMax),i.ok&&(d=e.md.normalizeLink(i.str),e.md.validateLink(d)?n=i.pos:d=""),s=n;n<p&&(t=e.src.charCodeAt(n),!(!A(t)&&t!==10));n++);if(i=e.md.helpers.parseLinkTitle(e.src,n,e.posMax),n<p&&s!==n&&i.ok)for(c=i.str,n=i.pos;n<p&&(t=e.src.charCodeAt(n),!(!A(t)&&t!==10));n++);else c="";if(n>=p||e.src.charCodeAt(n)!==41)return e.pos=l,!1;n++}else{if(typeof e.env.references>"u")return!1;if(n<p&&e.src.charCodeAt(n)===91?(s=n+1,n=e.md.helpers.parseLinkLabel(e,n),n>=0?o=e.src.slice(s,n++):n=f+1):n=f+1,o||(o=e.src.slice(m,f)),a=e.env.references[ue(o)],!a)return e.pos=l,!1;d=a.href,c=a.title}if(!r){u=e.src.slice(m,f);let h=[];e.md.inline.parse(u,e.md,e.env,h);let g=e.push("image","img",0),w=[["src",d],["alt",""]];g.attrs=w,g.children=h,g.content=u,c&&w.push(["title",c])}return e.pos=n,e.posMax=p,!0}var _a=/^([a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*)$/,wa=/^([a-zA-Z][a-zA-Z0-9+.-]{1,31}):([^<>\x00-\x20]*)$/;function rt(e,r){let t=e.pos;if(e.src.charCodeAt(t)!==60)return!1;let u=e.pos,o=e.posMax;for(;;){if(++t>=o)return!1;let a=e.src.charCodeAt(t);if(a===60)return!1;if(a===62)break}let n=e.src.slice(u+1,t);if(wa.test(n)){let a=e.md.normalizeLink(n);if(!e.md.validateLink(a))return!1;if(!r){let i=e.push("link_open","a",1);i.attrs=[["href",a]],i.markup="autolink",i.info="auto";let c=e.push("text","",0);c.content=e.md.normalizeLinkText(n);let s=e.push("link_close","a",-1);s.markup="autolink",s.info="auto"}return e.pos+=n.length+2,!0}if(_a.test(n)){let a=e.md.normalizeLink("mailto:"+n);if(!e.md.validateLink(a))return!1;if(!r){let i=e.push("link_open","a",1);i.attrs=[["href",a]],i.markup="autolink",i.info="auto";let c=e.push("text","",0);c.content=e.md.normalizeLinkText(n);let s=e.push("link_close","a",-1);s.markup="autolink",s.info="auto"}return e.pos+=n.length+2,!0}return!1}function Aa(e){return/^<a[>\s]/i.test(e)}function Ea(e){return/^<\/a\s*>/i.test(e)}function Ca(e){let r=e|32;return r>=97&&r<=122}function tt(e,r){if(!e.md.options.html)return!1;let t=e.posMax,u=e.pos;if(e.src.charCodeAt(u)!==60||u+2>=t)return!1;let o=e.src.charCodeAt(u+1);if(o!==33&&o!==63&&o!==47&&!Ca(o))return!1;let n=e.src.slice(u).match(vu);if(!n)return!1;if(!r){let a=e.push("html_inline","",0);a.content=n[0],Aa(a.content)&&e.linkLevel++,Ea(a.content)&&e.linkLevel--}return e.pos+=n[0].length,!0}var Da=/^&#((?:x[a-f0-9]{1,6}|[0-9]{1,7}));/i,Sa=/^&([a-z][a-z0-9]{1,31});/i;function ut(e,r){let t=e.pos,u=e.posMax;if(e.src.charCodeAt(t)!==38||t+1>=u)return!1;if(e.src.charCodeAt(t+1)===35){let n=e.src.slice(t).match(Da);if(n){if(!r){let a=n[1][0].toLowerCase()==="x"?parseInt(n[1].slice(1),16):parseInt(n[1],10),i=e.push("text_special","",0);i.content=Ze(a)?Ee(a):Ee(65533),i.markup=n[0],i.info="entity"}return e.pos+=n[0].length,!0}}else{let n=e.src.slice(t).match(Sa);if(n){let a=Y(n[0]);if(a!==n[0]){if(!r){let i=e.push("text_special","",0);i.content=a,i.markup=n[0],i.info="entity"}return e.pos+=n[0].length,!0}}}return!1}function Du(e){let r={},t=e.length;if(!t)return;let u=0,o=-2,n=[];for(let a=0;a<t;a++){let i=e[a];if(n.push(0),(e[u].marker!==i.marker||o!==i.token-1)&&(u=a),o=i.token,i.length=i.length||0,!i.close)continue;r.hasOwnProperty(i.marker)||(r[i.marker]=[-1,-1,-1,-1,-1,-1]);let c=r[i.marker][(i.open?3:0)+i.length%3],s=u-n[u]-1,d=s;for(;s>c;s-=n[s]+1){let l=e[s];if(l.marker===i.marker&&l.open&&l.end<0){let p=!1;if((l.close||i.open)&&(l.length+i.length)%3===0&&(l.length%3!==0||i.length%3!==0)&&(p=!0),!p){let m=s>0&&!e[s-1].open?n[s-1]+1:0;n[a]=a-s+m,n[s]=m,i.open=!1,l.end=a,l.close=!1,d=-1,o=-2;break}}}d!==-1&&(r[i.marker][(i.open?3:0)+(i.length||0)%3]=d)}}function ot(e){let r=e.tokens_meta,t=e.tokens_meta.length;Du(e.delimiters);for(let u=0;u<t;u++)r[u]&&r[u].delimiters&&Du(r[u].delimiters)}function nt(e){let r,t,u=0,o=e.tokens,n=e.tokens.length;for(r=t=0;r<n;r++)o[r].nesting<0&&u--,o[r].level=u,o[r].nesting>0&&u++,o[r].type==="text"&&r+1<n&&o[r+1].type==="text"?o[r+1].content=o[r].content+o[r+1].content:(r!==t&&(o[t]=o[r]),t++);r!==t&&(o.length=t)}var at=[["text",Ur],["linkify",Zr],["newline",Gr],["escape",Kr],["backticks",Yr],["strikethrough",Jr.tokenize],["emphasis",Xr.tokenize],["link",Qr],["image",et],["autolink",rt],["html_inline",tt],["entity",ut]],it=[["balance_pairs",ot],["strikethrough",Jr.postProcess],["emphasis",Xr.postProcess],["fragments_join",nt]];function De(){this.ruler=new oe;for(let e=0;e<at.length;e++)this.ruler.push(at[e][0],at[e][1]);this.ruler2=new oe;for(let e=0;e<it.length;e++)this.ruler2.push(it[e][0],it[e][1])}De.prototype.skipToken=function(e){let r=e.pos,t=this.ruler.getRules(""),u=t.length,o=e.md.options.maxNesting,n=e.cache;if(typeof n[r]<"u"){e.pos=n[r];return}let a=!1;if(e.level<o){for(let i=0;i<u;i++)if(e.level++,a=t[i](e,!0),e.level--,a){if(r>=e.pos)throw new Error("inline rule didn't increment state.pos");break}}else e.pos=e.posMax;a||e.pos++,n[r]=e.pos};De.prototype.tokenize=function(e){let r=this.ruler.getRules(""),t=r.length,u=e.posMax,o=e.md.options.maxNesting;for(;e.pos<u;){let n=e.pos,a=!1;if(e.level<o){for(let i=0;i<t;i++)if(a=r[i](e,!1),a){if(n>=e.pos)throw new Error("inline rule didn't increment state.pos");break}}if(a){if(e.pos>=u)break;continue}e.pending+=e.src[e.pos++]}e.pending&&e.pushPending()};De.prototype.parse=function(e,r,t,u){let o=new this.State(e,r,t,u);this.tokenize(o);let n=this.ruler2.getRules(""),a=n.length;for(let i=0;i<a;i++)n[i](o)};De.prototype.State=Au;var Su=De;function Fu(e){let r={};e=e||{},r.src_Any=Pe.source,r.src_Cc=Ne.source,r.src_Z=Oe.source,r.src_P=me.source,r.src_ZPCc=[r.src_Z,r.src_P,r.src_Cc].join("|"),r.src_ZCc=[r.src_Z,r.src_Cc].join("|");let t="[><\uFF5C]";return r.src_pseudo_letter="(?:(?!"+t+"|"+r.src_ZPCc+")"+r.src_Any+")",r.src_ip4="(?:(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)",r.src_auth="(?:(?:(?!"+r.src_ZCc+"|[@/\\[\\]()]).)+@)?",r.src_port="(?::(?:6(?:[0-4]\\d{3}|5(?:[0-4]\\d{2}|5(?:[0-2]\\d|3[0-5])))|[1-5]?\\d{1,4}))?",r.src_host_terminator="(?=$|"+t+"|"+r.src_ZPCc+")(?!"+(e["---"]?"-(?!--)|":"-|")+"_|:\\d|\\.-|\\.(?!$|"+r.src_ZPCc+"))",r.src_path="(?:[/?#](?:(?!"+r.src_ZCc+"|"+t+`|[()[\\]{}.,"'?!\\-;]).|\\[(?:(?!`+r.src_ZCc+"|\\]).)*\\]|\\((?:(?!"+r.src_ZCc+"|[)]).)*\\)|\\{(?:(?!"+r.src_ZCc+'|[}]).)*\\}|\\"(?:(?!'+r.src_ZCc+`|["]).)+\\"|\\'(?:(?!`+r.src_ZCc+"|[']).)+\\'|\\'(?="+r.src_pseudo_letter+"|[-])|\\.{2,}[a-zA-Z0-9%/&]|\\.(?!"+r.src_ZCc+"|[.]|$)|"+(e["---"]?"\\-(?!--(?:[^-]|$))(?:-*)|":"\\-+|")+",(?!"+r.src_ZCc+"|$)|;(?!"+r.src_ZCc+"|$)|\\!+(?!"+r.src_ZCc+"|[!]|$)|\\?(?!"+r.src_ZCc+"|[?]|$))+|\\/)?",r.src_email_name='[\\-;:&=\\+\\$,\\.a-zA-Z0-9_][\\-;:&=\\+\\$,\\"\\.a-zA-Z0-9_]*',r.src_xn="xn--[a-z0-9\\-]{1,59}",r.src_domain_root="(?:"+r.src_xn+"|"+r.src_pseudo_letter+"{1,63})",r.src_domain="(?:"+r.src_xn+"|(?:"+r.src_pseudo_letter+")|(?:"+r.src_pseudo_letter+"(?:-|"+r.src_pseudo_letter+"){0,61}"+r.src_pseudo_letter+"))",r.src_host="(?:(?:(?:(?:"+r.src_domain+")\\.)*"+r.src_domain+"))",r.tpl_host_fuzzy="(?:"+r.src_ip4+"|(?:(?:(?:"+r.src_domain+")\\.)+(?:%TLDS%)))",r.tpl_host_no_ip_fuzzy="(?:(?:(?:"+r.src_domain+")\\.)+(?:%TLDS%))",r.src_host_strict=r.src_host+r.src_host_terminator,r.tpl_host_fuzzy_strict=r.tpl_host_fuzzy+r.src_host_terminator,r.src_host_port_strict=r.src_host+r.src_port+r.src_host_terminator,r.tpl_host_port_fuzzy_strict=r.tpl_host_fuzzy+r.src_port+r.src_host_terminator,r.tpl_host_port_no_ip_fuzzy_strict=r.tpl_host_no_ip_fuzzy+r.src_port+r.src_host_terminator,r.tpl_host_fuzzy_test="localhost|www\\.|\\.\\d{1,3}\\.|(?:\\.(?:%TLDS%)(?:"+r.src_ZPCc+"|>|$))",r.tpl_email_fuzzy="(^|"+t+'|"|\\(|'+r.src_ZCc+")("+r.src_email_name+"@"+r.tpl_host_fuzzy_strict+")",r.tpl_link_fuzzy="(^|(?![.:/\\-_@])(?:[$+<=>^`|\uFF5C]|"+r.src_ZPCc+"))((?![$+<=>^`|\uFF5C])"+r.tpl_host_port_fuzzy_strict+r.src_path+")",r.tpl_link_no_ip_fuzzy="(^|(?![.:/\\-_@])(?:[$+<=>^`|\uFF5C]|"+r.src_ZPCc+"))((?![$+<=>^`|\uFF5C])"+r.tpl_host_port_no_ip_fuzzy_strict+r.src_path+")",r}function ct(e){return Array.prototype.slice.call(arguments,1).forEach(function(t){t&&Object.keys(t).forEach(function(u){e[u]=t[u]})}),e}function Je(e){return Object.prototype.toString.call(e)}function Fa(e){return Je(e)==="[object String]"}function Ta(e){return Je(e)==="[object Object]"}function Ma(e){return Je(e)==="[object RegExp]"}function Tu(e){return Je(e)==="[object Function]"}function $a(e){return e.replace(/[.?*+^$[\]\\(){}|-]/g,"\\$&")}var $u={fuzzyLink:!0,fuzzyEmail:!0,fuzzyIP:!1};function La(e){return Object.keys(e||{}).reduce(function(r,t){return r||$u.hasOwnProperty(t)},!1)}var Ra={"http:":{validate:function(e,r,t){let u=e.slice(r);return t.re.http||(t.re.http=new RegExp("^\\/\\/"+t.re.src_auth+t.re.src_host_port_strict+t.re.src_path,"i")),t.re.http.test(u)?u.match(t.re.http)[0].length:0}},"https:":"http:","ftp:":"http:","//":{validate:function(e,r,t){let u=e.slice(r);return t.re.no_http||(t.re.no_http=new RegExp("^"+t.re.src_auth+"(?:localhost|(?:(?:"+t.re.src_domain+")\\.)+"+t.re.src_domain_root+")"+t.re.src_port+t.re.src_host_terminator+t.re.src_path,"i")),t.re.no_http.test(u)?r>=3&&e[r-3]===":"||r>=3&&e[r-3]==="/"?0:u.match(t.re.no_http)[0].length:0}},"mailto:":{validate:function(e,r,t){let u=e.slice(r);return t.re.mailto||(t.re.mailto=new RegExp("^"+t.re.src_email_name+"@"+t.re.src_host_strict,"i")),t.re.mailto.test(u)?u.match(t.re.mailto)[0].length:0}}},qa="a[cdefgilmnoqrstuwxz]|b[abdefghijmnorstvwyz]|c[acdfghiklmnoruvwxyz]|d[ejkmoz]|e[cegrstu]|f[ijkmor]|g[abdefghilmnpqrstuwy]|h[kmnrtu]|i[delmnoqrst]|j[emop]|k[eghimnprwyz]|l[abcikrstuvy]|m[acdeghklmnopqrstuvwxyz]|n[acefgilopruz]|om|p[aefghklmnrstwy]|qa|r[eosuw]|s[abcdeghijklmnortuvxyz]|t[cdfghjklmnortvwz]|u[agksyz]|v[aceginu]|w[fs]|y[et]|z[amw]",za="biz|com|edu|gov|net|org|pro|web|xxx|aero|asia|coop|info|museum|name|shop|\u0440\u0444".split("|");function Ia(e){e.__index__=-1,e.__text_cache__=""}function Ba(e){return function(r,t){let u=r.slice(t);return e.test(u)?u.match(e)[0].length:0}}function Mu(){return function(e,r){r.normalize(e)}}function Ye(e){let r=e.re=Fu(e.__opts__),t=e.__tlds__.slice();e.onCompile(),e.__tlds_replaced__||t.push(qa),t.push(r.src_xn),r.src_tlds=t.join("|");function u(i){return i.replace("%TLDS%",r.src_tlds)}r.email_fuzzy=RegExp(u(r.tpl_email_fuzzy),"i"),r.link_fuzzy=RegExp(u(r.tpl_link_fuzzy),"i"),r.link_no_ip_fuzzy=RegExp(u(r.tpl_link_no_ip_fuzzy),"i"),r.host_fuzzy_test=RegExp(u(r.tpl_host_fuzzy_test),"i");let o=[];e.__compiled__={};function n(i,c){throw new Error('(LinkifyIt) Invalid schema "'+i+'": '+c)}Object.keys(e.__schemas__).forEach(function(i){let c=e.__schemas__[i];if(c===null)return;let s={validate:null,link:null};if(e.__compiled__[i]=s,Ta(c)){Ma(c.validate)?s.validate=Ba(c.validate):Tu(c.validate)?s.validate=c.validate:n(i,c),Tu(c.normalize)?s.normalize=c.normalize:c.normalize?n(i,c):s.normalize=Mu();return}if(Fa(c)){o.push(i);return}n(i,c)}),o.forEach(function(i){e.__compiled__[e.__schemas__[i]]&&(e.__compiled__[i].validate=e.__compiled__[e.__schemas__[i]].validate,e.__compiled__[i].normalize=e.__compiled__[e.__schemas__[i]].normalize)}),e.__compiled__[""]={validate:null,normalize:Mu()};let a=Object.keys(e.__compiled__).filter(function(i){return i.length>0&&e.__compiled__[i]}).map($a).join("|");e.re.schema_test=RegExp("(^|(?!_)(?:[><\uFF5C]|"+r.src_ZPCc+"))("+a+")","i"),e.re.schema_search=RegExp("(^|(?!_)(?:[><\uFF5C]|"+r.src_ZPCc+"))("+a+")","ig"),e.re.schema_at_start=RegExp("^"+e.re.schema_search.source,"i"),e.re.pretest=RegExp("("+e.re.schema_test.source+")|("+e.re.host_fuzzy_test.source+")|@","i"),Ia(e)}function Pa(e,r){let t=e.__index__,u=e.__last_index__,o=e.__text_cache__.slice(t,u);this.schema=e.__schema__.toLowerCase(),this.index=t+r,this.lastIndex=u+r,this.raw=o,this.text=o,this.url=o}function st(e,r){let t=new Pa(e,r);return e.__compiled__[t.schema].normalize(t,e),t}function L(e,r){if(!(this instanceof L))return new L(e,r);r||La(e)&&(r=e,e={}),this.__opts__=ct({},$u,r),this.__index__=-1,this.__last_index__=-1,this.__schema__="",this.__text_cache__="",this.__schemas__=ct({},Ra,e),this.__compiled__={},this.__tlds__=za,this.__tlds_replaced__=!1,this.re={},Ye(this)}L.prototype.add=function(r,t){return this.__schemas__[r]=t,Ye(this),this};L.prototype.set=function(r){return this.__opts__=ct(this.__opts__,r),this};L.prototype.test=function(r){if(this.__text_cache__=r,this.__index__=-1,!r.length)return!1;let t,u,o,n,a,i,c,s,d;if(this.re.schema_test.test(r)){for(c=this.re.schema_search,c.lastIndex=0;(t=c.exec(r))!==null;)if(n=this.testSchemaAt(r,t[2],c.lastIndex),n){this.__schema__=t[2],this.__index__=t.index+t[1].length,this.__last_index__=t.index+t[0].length+n;break}}return this.__opts__.fuzzyLink&&this.__compiled__["http:"]&&(s=r.search(this.re.host_fuzzy_test),s>=0&&(this.__index__<0||s<this.__index__)&&(u=r.match(this.__opts__.fuzzyIP?this.re.link_fuzzy:this.re.link_no_ip_fuzzy))!==null&&(a=u.index+u[1].length,(this.__index__<0||a<this.__index__)&&(this.__schema__="",this.__index__=a,this.__last_index__=u.index+u[0].length))),this.__opts__.fuzzyEmail&&this.__compiled__["mailto:"]&&(d=r.indexOf("@"),d>=0&&(o=r.match(this.re.email_fuzzy))!==null&&(a=o.index+o[1].length,i=o.index+o[0].length,(this.__index__<0||a<this.__index__||a===this.__index__&&i>this.__last_index__)&&(this.__schema__="mailto:",this.__index__=a,this.__last_index__=i))),this.__index__>=0};L.prototype.pretest=function(r){return this.re.pretest.test(r)};L.prototype.testSchemaAt=function(r,t,u){return this.__compiled__[t.toLowerCase()]?this.__compiled__[t.toLowerCase()].validate(r,u,this):0};L.prototype.match=function(r){let t=[],u=0;this.__index__>=0&&this.__text_cache__===r&&(t.push(st(this,u)),u=this.__last_index__);let o=u?r.slice(u):r;for(;this.test(o);)t.push(st(this,u)),o=o.slice(this.__last_index__),u+=this.__last_index__;return t.length?t:null};L.prototype.matchAtStart=function(r){if(this.__text_cache__=r,this.__index__=-1,!r.length)return null;let t=this.re.schema_at_start.exec(r);if(!t)return null;let u=this.testSchemaAt(r,t[2],t[0].length);return u?(this.__schema__=t[2],this.__index__=t.index+t[1].length,this.__last_index__=t.index+t[0].length+u,st(this,0)):null};L.prototype.tlds=function(r,t){return r=Array.isArray(r)?r:[r],t?(this.__tlds__=this.__tlds__.concat(r).sort().filter(function(u,o,n){return u!==n[o-1]}).reverse(),Ye(this),this):(this.__tlds__=r.slice(),this.__tlds_replaced__=!0,Ye(this),this)};L.prototype.normalize=function(r){r.schema||(r.url="http://"+r.url),r.schema==="mailto:"&&!/^mailto:/i.test(r.url)&&(r.url="mailto:"+r.url)};L.prototype.onCompile=function(){};var Lu=L;var Na=/^xn--/,Ha=/[^\0-\x7F]/,Oa=/[\x2E\u3002\uFF0E\uFF61]/g,ja={overflow:"Overflow: input needs wider integers to process","not-basic":"Illegal input >= 0x80 (not a basic code point)","invalid-input":"Invalid input"},lt=35,H=Math.floor,dt=String.fromCharCode;function J(e){throw new RangeError(ja[e])}function Va(e,r){let t=[],u=e.length;for(;u--;)t[u]=r(e[u]);return t}function qu(e,r){let t=e.split("@"),u="";t.length>1&&(u=t[0]+"@",e=t[1]),e=e.replace(Oa,".");let o=e.split("."),n=Va(o,r).join(".");return u+n}function zu(e){let r=[],t=0,u=e.length;for(;t<u;){let o=e.charCodeAt(t++);if(o>=55296&&o<=56319&&t<u){let n=e.charCodeAt(t++);(n&64512)==56320?r.push(((o&1023)<<10)+(n&1023)+65536):(r.push(o),t--)}else r.push(o)}return r}var Ua=e=>String.fromCodePoint(...e),Za=function(e){return e>=48&&e<58?26+(e-48):e>=65&&e<91?e-65:e>=97&&e<123?e-97:36},Ru=function(e,r){return e+22+75*(e<26)-((r!=0)<<5)},Iu=function(e,r,t){let u=0;for(e=t?H(e/700):e>>1,e+=H(e/r);e>lt*26>>1;u+=36)e=H(e/lt);return H(u+(lt+1)*e/(e+38))},Bu=function(e){let r=[],t=e.length,u=0,o=128,n=72,a=e.lastIndexOf("-");a<0&&(a=0);for(let i=0;i<a;++i)e.charCodeAt(i)>=128&&J("not-basic"),r.push(e.charCodeAt(i));for(let i=a>0?a+1:0;i<t;){let c=u;for(let d=1,l=36;;l+=36){i>=t&&J("invalid-input");let p=Za(e.charCodeAt(i++));p>=36&&J("invalid-input"),p>H((2147483647-u)/d)&&J("overflow"),u+=p*d;let m=l<=n?1:l>=n+26?26:l-n;if(p<m)break;let f=36-m;d>H(2147483647/f)&&J("overflow"),d*=f}let s=r.length+1;n=Iu(u-c,s,c==0),H(u/s)>2147483647-o&&J("overflow"),o+=H(u/s),u%=s,r.splice(u++,0,o)}return String.fromCodePoint(...r)},Pu=function(e){let r=[];e=zu(e);let t=e.length,u=128,o=0,n=72;for(let c of e)c<128&&r.push(dt(c));let a=r.length,i=a;for(a&&r.push("-");i<t;){let c=2147483647;for(let d of e)d>=u&&d<c&&(c=d);let s=i+1;c-u>H((2147483647-o)/s)&&J("overflow"),o+=(c-u)*s,u=c;for(let d of e)if(d<u&&++o>2147483647&&J("overflow"),d===u){let l=o;for(let p=36;;p+=36){let m=p<=n?1:p>=n+26?26:p-n;if(l<m)break;let f=l-m,h=36-m;r.push(dt(Ru(m+f%h,0))),l=H(f/h)}r.push(dt(Ru(l,0))),n=Iu(o,s,i===a),o=0,++i}++o,++u}return r.join("")},Ga=function(e){return qu(e,function(r){return Na.test(r)?Bu(r.slice(4).toLowerCase()):r})},Wa=function(e){return qu(e,function(r){return Ha.test(r)?"xn--"+Pu(r):r})},Ka={version:"2.3.1",ucs2:{decode:zu,encode:Ua},decode:Bu,encode:Pu,toASCII:Wa,toUnicode:Ga};var ft=Ka;var Nu={options:{html:!1,xhtmlOut:!1,breaks:!1,langPrefix:"language-",linkify:!1,typographer:!1,quotes:"\u201C\u201D\u2018\u2019",highlight:null,maxNesting:100},components:{core:{},block:{},inline:{}}};var Hu={options:{html:!1,xhtmlOut:!1,breaks:!1,langPrefix:"language-",linkify:!1,typographer:!1,quotes:"\u201C\u201D\u2018\u2019",highlight:null,maxNesting:20},components:{core:{rules:["normalize","block","inline","text_join"]},block:{rules:["paragraph"]},inline:{rules:["text"],rules2:["balance_pairs","fragments_join"]}}};var Ou={options:{html:!0,xhtmlOut:!0,breaks:!1,langPrefix:"language-",linkify:!1,typographer:!1,quotes:"\u201C\u201D\u2018\u2019",highlight:null,maxNesting:20},components:{core:{rules:["normalize","block","inline","text_join"]},block:{rules:["blockquote","code","fence","heading","hr","html_block","lheading","list","reference","paragraph"]},inline:{rules:["autolink","backticks","emphasis","entity","escape","html_inline","image","link","newline","text"],rules2:["balance_pairs","emphasis","fragments_join"]}}};var Ya={default:Nu,zero:Hu,commonmark:Ou},Ja=/^(vbscript|javascript|file|data):/,Xa=/^data:image\/(gif|png|jpeg|webp);/;function Qa(e){let r=e.trim().toLowerCase();return Ja.test(r)?Xa.test(r):!0}var ju=["http:","https:","mailto:"];function ei(e){let r=Ae(e,!0);if(r.hostname&&(!r.protocol||ju.indexOf(r.protocol)>=0))try{r.hostname=ft.toASCII(r.hostname)}catch{}return ze(fe(r))}function ri(e){let r=Ae(e,!0);if(r.hostname&&(!r.protocol||ju.indexOf(r.protocol)>=0))try{r.hostname=ft.toUnicode(r.hostname)}catch{}return we(fe(r),we.defaultChars+"%")}function R(e,r){if(!(this instanceof R))return new R(e,r);r||Ue(e)||(r=e||{},e="default"),this.inline=new Su,this.block=new wu,this.core=new mu,this.renderer=new iu,this.linkify=new Lu,this.validateLink=Qa,this.normalizeLink=ei,this.normalizeLinkText=ri,this.utils=kr,this.helpers=pe({},wr),this.options={},this.configure(e),r&&this.set(r)}R.prototype.set=function(e){return pe(this.options,e),this};R.prototype.configure=function(e){let r=this;if(Ue(e)){let t=e;if(e=Ya[t],!e)throw new Error('Wrong `markdown-it` preset "'+t+'", check name')}if(!e)throw new Error("Wrong `markdown-it` preset, can't be empty");return e.options&&r.set(e.options),e.components&&Object.keys(e.components).forEach(function(t){e.components[t].rules&&r[t].ruler.enableOnly(e.components[t].rules),e.components[t].rules2&&r[t].ruler2.enableOnly(e.components[t].rules2)}),this};R.prototype.enable=function(e,r){let t=[];Array.isArray(e)||(e=[e]),["core","block","inline"].forEach(function(o){t=t.concat(this[o].ruler.enable(e,!0))},this),t=t.concat(this.inline.ruler2.enable(e,!0));let u=e.filter(function(o){return t.indexOf(o)<0});if(u.length&&!r)throw new Error("MarkdownIt. Failed to enable unknown rule(s): "+u);return this};R.prototype.disable=function(e,r){let t=[];Array.isArray(e)||(e=[e]),["core","block","inline"].forEach(function(o){t=t.concat(this[o].ruler.disable(e,!0))},this),t=t.concat(this.inline.ruler2.disable(e,!0));let u=e.filter(function(o){return t.indexOf(o)<0});if(u.length&&!r)throw new Error("MarkdownIt. Failed to disable unknown rule(s): "+u);return this};R.prototype.use=function(e){let r=[this].concat(Array.prototype.slice.call(arguments,1));return e.apply(e,r),this};R.prototype.parse=function(e,r){if(typeof e!="string")throw new Error("Input data should be a String");let t=new this.core.State(e,this,r);return this.core.process(t),t.tokens};R.prototype.render=function(e,r){return r=r||{},this.renderer.render(this.parse(e,r),this.options,r)};R.prototype.parseInline=function(e,r){let t=new this.core.State(e,this,r);return t.inlineMode=!0,this.core.process(t),t.tokens};R.prototype.renderInline=function(e,r){return r=r||{},this.renderer.render(this.parseInline(e,r),this.options,r)};var mt=R;var ti=new mt("commonmark",{html:!0,linkify:!1,typographer:!1});function X(e){let r=Uu(e),{frontmatter:t,body:u,warnings:o}=ii(r);return qt({frontmatter:t,warnings:o,children:Vu(u,{sliderNames:new Set})})}function Vu(e,r){let t=Uu(e).split(`
`),u=[],o=[],n=null,a=()=>{o.length!==0&&(u.push(...ui(o.join(`
`))),o=[])};for(let i=0;i<t.length;i+=1){let c=t[i],s=pt(c);if(n){o.push(c),s&&s.marker===n.marker&&s.length>=n.length&&(n=null);continue}if(s){n=s,o.push(c);continue}let d=c.match(/^:::\s*([a-z][a-z0-9-]*)(?:\s+(.*))?\s*$/i);if(d){a();let l=ni(t,i,d);i=l.endIndex;let p=Bt(l,m=>Vu(m,r));ai(p,r),u.push(p);continue}o.push(c)}return a(),u}function ui(e){let r=ti.parse(e,{});return ht(r).nodes}function ht(e,r=0,t=null){let u=[],o=r;for(;o<e.length;){let n=e[o];if(t&&n.type===t)return{nodes:u,index:o+1};switch(n.type){case"heading_open":{let a=e[o+1];u.push({type:"heading",level:Number(n.tag.slice(1)),children:a?.type==="inline"?xe(a.children??[]):[]}),o+=3;break}case"paragraph_open":{let a=e[o+1];u.push({type:"paragraph",children:a?.type==="inline"?xe(a.children??[]):[]}),o+=3;break}case"fence":u.push(F(n.content.replace(/\n$/,""),{lang:n.info?n.info.trim().split(/\s+/)[0]:null,raw:`${n.markup}${n.info?n.info:""}
${n.content}${n.markup}`})),o+=1;break;case"code_block":u.push(F(n.content.replace(/\n$/,""),{lang:null,raw:n.content})),o+=1;break;case"blockquote_open":{let a=ht(e,o+1,"blockquote_close");u.push({type:"blockquote",children:a.nodes}),o=a.index;break}case"bullet_list_open":case"ordered_list_open":{let a=n.type==="ordered_list_open",i=oi(e,o+1,a?"ordered_list_close":"bullet_list_close");u.push({type:"list",ordered:a,start:a?Number(n.attrGet("start")??1):null,tight:!1,children:i.items}),o=i.index;break}case"hr":u.push({type:"thematic-break"}),o+=1;break;case"html_block":u.push({type:"html-block",value:n.content}),o+=1;break;case"inline":u.push({type:"paragraph",children:xe(n.children??[])}),o+=1;break;default:o+=1;break}}return{nodes:u,index:o}}function oi(e,r,t){let u=[],o=r;for(;o<e.length;){let n=e[o];if(n.type===t)return{items:u,index:o+1};if(n.type==="list_item_open"){let a=ht(e,o+1,"list_item_close");u.push({type:"list-item",checked:null,children:a.nodes}),o=a.index;continue}o+=1}return{items:u,index:o}}function xe(e,r=0,t=null){let u=[],o=r;for(;o<e.length;){let n=e[o];if(t&&n.type===t)return{nodes:u,index:o+1};switch(n.type){case"text":u.push({type:"text",value:n.content}),o+=1;break;case"code_inline":u.push({type:"inline-code",value:n.content}),o+=1;break;case"strong_open":{let a=xe(e,o+1,"strong_close");u.push({type:"strong",children:a.nodes}),o=a.index;break}case"em_open":{let a=xe(e,o+1,"em_close");u.push({type:"emph",children:a.nodes}),o=a.index;break}case"link_open":{let a=xe(e,o+1,"link_close");u.push({type:"link",url:n.attrGet("href")??"",title:n.attrGet("title")??null,children:a.nodes}),o=a.index;break}case"image":u.push({type:"image",url:n.attrGet("src")??"",title:n.attrGet("title")??null,alt:n.content??""}),o+=1;break;case"softbreak":u.push({type:"soft-break"}),o+=1;break;case"hardbreak":u.push({type:"hard-break"}),o+=1;break;case"html_inline":u.push({type:"inline-html",value:n.content}),o+=1;break;default:o+=1;break}}return t?{nodes:u,index:o}:u}function ni(e,r,t){let u=t[1],o=t[2]??"",n=[],a=e.length-1,i=!1,c=null;for(let l=r+1;l<e.length;l+=1){let p=pt(e[l]);if(c){n.push(e[l]),p&&p.marker===c.marker&&p.length>=c.length&&(c=null);continue}if(p){c=p,n.push(e[l]);continue}if(e[l].match(/^:::\s*([a-z][a-z0-9-]*)(?:\s+(.*))?\s*$/i)){n.push(e[l]);let f=1,h=null;for(l+=1;l<e.length;l+=1){let g=pt(e[l]);if(n.push(e[l]),h){g&&g.marker===h.marker&&g.length>=h.length&&(h=null);continue}if(g){h=g;continue}if(e[l].match(/^:::\s*([a-z][a-z0-9-]*)(?:\s+(.*))?\s*$/i)){f+=1;continue}if(/^:::\s*$/.test(e[l])&&(f-=1,f===0))break}continue}if(/^:::\s*$/.test(e[l])){a=l,i=!0;break}n.push(e[l])}let s=e.slice(r,a+1),d={name:u,attrText:o,content:n.join(`
`),raw:s.join(`
`),warnings:i?[]:["unclosed"],startIndex:r,endIndex:a};return i||(d.raw=e.slice(r).join(`
`)),d}function pt(e){let r=e.match(/^\s*(`{3,}|~{3,})/);return r?{marker:r[1][0],length:r[1].length}:null}function ai(e,r){if(e.type==="slider"){if(r.sliderNames.has(e.name)){e.warnings=[...e.warnings??[],"slider-duplicate-name"],e.duplicate=!0;return}r.sliderNames.add(e.name)}}function ii(e){if(!e.startsWith(`---
`))return{frontmatter:{},body:e,warnings:[]};let r=e.indexOf(`
---
`,4);if(r===-1)return{frontmatter:{},body:e,warnings:["frontmatter-unclosed"]};let t=e.slice(4,r),u=e.slice(r+5);try{return{frontmatter:ci(t),body:u,warnings:[]}}catch(o){return{frontmatter:{},body:u,warnings:[`frontmatter-parse-failed: ${o.message}`]}}}function ci(e){let r={};for(let t of e.split(`
`)){if(t.trim()===""||t.trimStart().startsWith("#"))continue;let u=t.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);if(!u)throw new Error(`invalid line: ${t}`);let o=u[1],n=si(u[2].trim());r[o]=n}return r}function si(e){return e.startsWith('"')&&e.endsWith('"')||e.startsWith("'")&&e.endsWith("'")?e.slice(1,-1):e}function Uu(e){return String(e).replace(/\r\n?/g,`
`)}function gt(e,r={}){let t=typeof e=="string"?X(e):e,u=r.theme??t.frontmatter?.theme??"default",o=Me(t),n=t.frontmatter?.title?_(t.frontmatter.title):"";return["<!doctype html>",`<html lang="${y(t.frontmatter?.lang??"zh-CN")}">`,"<head>",'<meta charset="utf-8">','<meta name="viewport" content="width=device-width, initial-scale=1">',n?`<title>${n}</title>`:"","</head>",`<body data-rmd-theme="${y(u)}">`,`<main class="rmd-document" data-rmd-version="${y(t.version)}">`,o,"</main>","</body>","</html>"].filter(Boolean).join(`
`)}function Me(e){let r=typeof e=="string"?X(e):e;return I(r.children??[])}function xt(e){switch(e.type){case"heading":return li(e);case"paragraph":return`<p>${Se(e.children)}</p>`;case"code-block":return di(e);case"blockquote":return`<blockquote>${I(e.children)}</blockquote>`;case"list":return fi(e);case"list-item":return`<li>${I(e.children)}</li>`;case"thematic-break":return"<hr>";case"html-block":return _(e.value);case"chart":return mi(e);case"grid":return vi(e);case"card":return _i(e);case"callout":return wi(e);case"slider":return Ai(e);case"export":return Ei(e);case"flow":return Ci(e);case"diff":return Di(e);case"tabs":return Si(e);case"timeline":return Fi(e);case"kanban":return Ti(e);case"details":return Mi(e);case"carousel":return $i(e);case"embed":return Li(e);case"math":return Ri(e);default:return qi(e)}}function I(e){return e.map(r=>xt(r)).join(`
`)}function li(e){let r=Math.min(Math.max(e.level,1),6);return`<h${r}>${Se(e.children)}</h${r}>`}function Se(e=[]){return e.map(r=>{switch(r.type){case"text":return _(r.value);case"strong":return`<strong>${Se(r.children)}</strong>`;case"emph":return`<em>${Se(r.children)}</em>`;case"inline-code":return`<code>${_(r.value)}</code>`;case"link":return`<a href="${y(r.url)}">${Se(r.children)}</a>`;case"image":return`<img src="${y(r.url)}" alt="${y(r.alt??"")}">`;case"soft-break":return`
`;case"hard-break":return"<br>";case"inline-html":return _(r.value);default:return _(r.value??"")}}).join("")}function di(e){let r=e.lang?` class="language-${y(e.lang)}"`:"";return`<pre class="rmd-code"${kt(e)}><code${r}>${_(e.value)}</code></pre>`}function fi(e){let r=e.ordered?"ol":"ul",t=e.ordered&&e.start&&e.start!==1?` start="${y(String(e.start))}"`:"";return`<${r}${t}>${e.children.map(u=>xt(u)).join("")}</${r}>`}function mi(e){let r=pi(e),t=e.y2?` data-y2="${y(e.y2)}"`:"",u=` data-legend="${y(e.legend||"bottom")}"`,o=e.tooltip===!1?' data-tooltip="false"':"";return[`<section class="rmd-block rmd-chart rmd-chart-${y(e.chartType)}" data-rmd-block="chart"${t}${u}${o}>`,e.title?`<h3 class="rmd-block-title">${_(e.title)}</h3>`:"",`<svg role="img" viewBox="0 0 ${r.width} ${r.height}" class="rmd-chart-svg">`,e.title?`<title>${_(e.title)}</title>`:"<title>Chart</title>",`<desc>${_(zi(e))}</desc>`,r.body,"</svg>","</section>"].filter(Boolean).join("")}function pi(e){switch(e.chartType){case"line":return bi(e);case"pie":return Zu(e,!1);case"scatter":return xi(e);case"radar":return ki(e);case"area":return gi(e);case"donut":return Zu(e,!0);case"heatmap":return yi(e);default:return hi(e)}}function hi(e){let r=er(e),t=r.plotWidth/Math.max(e.data.length,1),u=Math.max(18,Math.min(42,t*.56)),o=e.data.map((n,a)=>{let i=n.values[0]??0,c=Math.round(r.left+a*t+(t-u)/2),s=Math.round(Fe(i,r)),d=Math.max(4,Math.round(r.bottom-s));return[$e(n,i),`<rect x="${c}" y="${r.bottom-d}" width="${Math.round(u)}" height="${d}" rx="4"></rect>`,`<text x="${c+u/2}" y="${r.labelY}" text-anchor="middle">${_(n.label)}</text>`,`<text x="${c+u/2}" y="${r.bottom-d-8}" text-anchor="middle">${_(Te(i))}</text>`,"</g>"].join("")}).join("");return{width:r.width,height:r.height,body:o}}function bi(e){let r=er(e,{useAllValues:!0}),t=yt(e),u=[vt(e,r),...t.map((o,n)=>{let a=o.map((c,s)=>`${ne(s,e.data.length,r)},${Fe(c,r)}`).join(" "),i=o.map((c,s)=>{let d=e.data[s];return[$e(d,c,n),`<circle cx="${ne(s,e.data.length,r)}" cy="${Fe(c,r)}" r="4" style="fill: ${U(n)}"></circle>`,"</g>"].join("")}).join("");return`<polyline class="rmd-chart-line-path" points="${a}" fill="none" stroke="${U(n)}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></polyline>${i}`}),Ku(e,r)].join("");return{width:r.width,height:r.height,body:u}}function gi(e){let r=er(e,{useAllValues:!0}),t=yt(e),u=[vt(e,r),...t.map((o,n)=>{let a=o.map((l,p)=>`${ne(p,e.data.length,r)},${Fe(l,r)}`).join(" L "),i=ne(o.length-1,e.data.length,r),c=ne(0,e.data.length,r),s=`M ${a} L ${i},${r.bottom} L ${c},${r.bottom} Z`,d=o.map((l,p)=>`${ne(p,e.data.length,r)},${Fe(l,r)}`).join(" ");return[`<path class="rmd-chart-area-fill" d="${s}" style="fill: ${U(n)}; opacity: ${n===0?"0.22":"0.14"}"></path>`,`<polyline class="rmd-chart-line-path" points="${d}" fill="none" stroke="${U(n)}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></polyline>`].join("")}),Ku(e,r)].join("");return{width:r.width,height:r.height,body:u}}function xi(e){let r=er(e),t=e.data.map((s,d)=>s.values[0]??d),u=e.data.map(s=>s.values[1]??s.values[0]??0),o=Math.min(...t),n=Math.max(...t),a=Math.min(...u),i=Math.max(...u),c=[vt(e,r),...e.data.map((s,d)=>{let l=t[d],p=u[d],m=bt(l,o,n,r.left,r.right),f=bt(p,a,i,r.bottom,r.top);return[$e(s,`${Te(l)},${Te(p)}`),`<circle cx="${m}" cy="${f}" r="6" style="fill: ${U(d)}; opacity: 0.86"></circle>`,`<text x="${m}" y="${Math.max(r.top+10,f-10)}" text-anchor="middle">${_(s.label)}</text>`,"</g>"].join("")})].join("");return{width:r.width,height:r.height,body:c}}function Zu(e,r){let i=e.data.map(f=>Math.max(f.values[0]??0,0)),c=i.reduce((f,h)=>f+h,0)||1,s=-90,d=e.data.map((f,h)=>{let g=i[h],w=g/c*360,b=s+w,x=Bi(132,104,72,s,b),k=s+w/2,v=Qe(132,104,96,k);return s=b,[$e(f,g),`<path d="${x}" style="fill: ${U(h)}; opacity: 0.88"></path>`,`<text x="${v.x}" y="${v.y}" text-anchor="middle">${_(f.label)}</text>`,"</g>"].join("")}).join(""),l=r?'<circle class="rmd-chart-donut-hole" cx="132" cy="104" r="34" style="fill: var(--rmd-color-surface, #fff)"></circle>':"",p=r?`<text x="132" y="108" text-anchor="middle">${_(Te(c))}</text>`:"",m=Ii(e,240,50);return{width:360,height:220,body:`${d}${l}${p}${m}`}}function ki(e){let a=yt(e),i=Math.max(...e.data.flatMap(p=>p.values),1),c=e.data.length,s=e.data.map((p,m)=>{let f=Xe(180,120,72,m,c),h=Xe(180,120,96,m,c);return`<line x1="180" y1="120" x2="${f.x}" y2="${f.y}" stroke="var(--rmd-color-line-strong, #b7c1b0)" stroke-width="1"></line><text x="${h.x}" y="${h.y}" text-anchor="middle">${_(p.label)}</text>`}).join(""),d=[.33,.66,1].map(p=>`<polygon points="${e.data.map((f,h)=>{let g=Xe(180,120,72*p,h,c);return`${g.x},${g.y}`}).join(" ")}" fill="none" stroke="var(--rmd-color-line, #d7ddd2)" stroke-width="1"></polygon>`).join(""),l=a.map((p,m)=>`<polygon class="rmd-chart-radar-shape" points="${p.map((h,g)=>{let w=Xe(180,120,72*(h/i),g,c);return`${w.x},${w.y}`}).join(" ")}" style="fill: ${U(m)}; opacity: ${m===0?"0.24":"0.15"}; stroke: ${U(m)}; stroke-width: 2"></polygon>`).join("");return{width:360,height:260,body:`${d}${s}${l}`}}function yi(e){let n=Math.max(...e.data.map(m=>m.values.length),1),a=72+n*40+40,i=28+e.data.length*40+40,c=e.data.flatMap(m=>m.values),s=Math.min(...c,0),d=Math.max(...c,1),l=Array.from({length:n},(m,f)=>`<text x="${72+f*40+17}" y="20" text-anchor="middle">S${f+1}</text>`).join(""),p=e.data.map((m,f)=>{let h=28+f*40,g=`<text x="62" y="${h+34/2+4}" text-anchor="end">${_(m.label)}</text>`,w=m.values.map((b,x)=>{let k=72+x*40,v=.18+Wu(b,s,d)*.72;return[$e(m,b,x),`<rect x="${k}" y="${h}" width="34" height="34" rx="5" data-series-index="${x}" style="fill: var(--rmd-color-primary, #176b72); opacity: ${v.toFixed(2)}"></rect>`,`<text x="${k+34/2}" y="${h+34/2+4}" text-anchor="middle" style="fill: var(--rmd-color-fg, #20251f)">${_(Te(b))}</text>`,"</g>"].join("")}).join("");return`${g}${w}`}).join("");return{width:a,height:i,body:`${l}${p}`}}function vi(e){let r=e.cells.map(o=>`<div class="rmd-grid-cell">${I(o)}</div>`).join(""),t=e.layout==="masonry"?' data-layout="masonry"':"",u=Array.isArray(e.columns)?e.columns.join(","):String(e.columns);return[`<section class="rmd-block rmd-grid" data-rmd-block="grid" data-columns="${y(u)}" data-gap="${y(e.gap)}"${t}>`,r,"</section>"].join("")}function _i(e){return[`<section class="rmd-block rmd-card" data-rmd-block="card"${kt(e)}>`,e.title?`<h3 class="rmd-card-title">${_(e.title)}</h3>`:"",`<div class="rmd-card-body">${I(e.children)}</div>`,"</section>"].filter(Boolean).join("")}function wi(e){return[`<aside class="rmd-block rmd-callout rmd-callout-${y(e.kind)}" data-rmd-block="callout" data-kind="${y(e.kind)}">`,e.title?`<h3 class="rmd-callout-title">${_(e.title)}</h3>`:"",`<div class="rmd-callout-body">${I(e.children)}</div>`,"</aside>"].filter(Boolean).join("")}function Ai(e){let r=kt(e),t=e.scale!=="linear"?` data-scale="${y(e.scale)}"`:"",u=e.marks?` data-marks="${y(e.marks.join(","))}"`:"",o=Array.isArray(e.default),n=o?e.default:[e.default],a=Pi(n,e.unit),i=o?' data-range="true"':"",c=`type="range" min="${y(String(e.min))}" max="${y(String(e.max))}" step="${y(String(e.step))}" aria-label="${y(e.label)}"`,s=o?[`<div class="rmd-slider-range-control" style="--rmd-range-start: ${y(Gu(n[0],e))}%; --rmd-range-end: ${y(Gu(n[1],e))}%">`,'<span class="rmd-slider-range-track" aria-hidden="true"></span>',`<input id="rmd-slider-${y(e.name)}-min" ${c} value="${y(String(n[0]))}" data-bound="min">`,`<input id="rmd-slider-${y(e.name)}-max" ${c} value="${y(String(n[1]))}" data-bound="max">`,"</div>"].join(""):`<input id="rmd-slider-${y(e.name)}" ${c} value="${y(String(n[0]))}">`;return[`<div class="rmd-block rmd-slider" data-rmd-block="slider" data-name="${y(e.name)}" data-unit="${y(e.unit)}"${i}${t}${u}${r}>`,`<label for="rmd-slider-${y(e.name)}${o?"-min":""}">${_(e.label)}</label>`,s,`<output>${_(a)}</output>`,"</div>"].join("")}function Ei(e){return[`<section class="rmd-block rmd-export" data-rmd-block="export" data-format="${y(e.format)}" data-references="${y(e.references.join(","))}">`,`<button type="button">${_(e.label)}</button>`,`<pre><code>${_(e.template)}</code></pre>`,"</section>"].join("")}function Ci(e){let r=e.edges.map(t=>`<li><span>${_(t.from)}</span> <span aria-hidden="true">\u2192</span> <span>${_(t.to)}</span></li>`).join("");return[`<section class="rmd-block rmd-flow" data-rmd-block="flow" data-direction="${y(e.direction)}">`,"<ol>",r,"</ol>","</section>"].join("")}function Di(e){let r=e.title?`<h3 class="rmd-block-title">${_(e.title)}</h3>`:"",t=e.lines.map(u=>{let o=u.kind==="add"?"+":u.kind==="remove"?"-":" ",n=u.note?` <mark>${_(u.note)}</mark>`:"";return`<div class="rmd-diff-line rmd-diff-${u.kind}"><code>${_(`${o} ${u.text}`)}</code>${n}</div>`}).join("");return[`<section class="rmd-block rmd-diff" data-rmd-block="diff"${e.lang?` data-lang="${y(e.lang)}"`:""}>`,r,`<pre>${t}</pre>`,"</section>"].join("")}function Si(e){let r=e.panels.map(u=>`<button type="button" role="tab" aria-selected="${u.label===e.default}" data-label="${y(u.label)}">${_(u.label)}</button>`).join(""),t=e.panels.map(u=>`<section role="tabpanel"${u.label===e.default?"":" hidden"} data-label="${y(u.label)}">${I(u.children)}</section>`).join("");return[`<section class="rmd-block rmd-tabs" data-rmd-block="tabs" data-default="${y(e.default)}">`,`<div role="tablist">${r}</div>`,t,"</section>"].join("")}function Fi(e){let r=e.items.map(t=>{let u=t.status!=="default"?` rmd-timeline-status-${y(t.status)}`:"",o=t.title?`<h4>${_(t.title)}</h4>`:"";return[`<li class="rmd-timeline-item${u}">`,`<div class="rmd-timeline-time">${_(t.time)}</div>`,'<div class="rmd-timeline-content">',o,I(t.children),"</div>","</li>"].join("")}).join("");return[`<section class="rmd-block rmd-timeline rmd-timeline-${y(e.direction)}" data-rmd-block="timeline" data-direction="${y(e.direction)}">`,"<ol>",r,"</ol>","</section>"].join("")}function Ti(e){return['<section class="rmd-block rmd-kanban" data-rmd-block="kanban">',e.columns.map(t=>['<div class="rmd-kanban-column">',`<h3>${_(t.title)}</h3>`,'<div class="rmd-kanban-cards">',I(t.children),"</div>","</div>"].join("")).join(""),"</section>"].join("")}function Mi(e){return[`<details class="rmd-block rmd-details" data-rmd-block="details"${e.open?" open":""}>`,`<summary>${_(e.title)}</summary>`,'<div class="rmd-details-body">',I(e.children),"</div>","</details>"].join("")}function $i(e){let r=e.items.map((n,a)=>`<div class="rmd-carousel-item" role="group" aria-roledescription="slide" aria-label="${a+1} of ${e.items.length}">${I(n)}</div>`).join(""),t=e.items.length>1?['<button type="button" class="rmd-carousel-control rmd-carousel-prev" data-rmd-carousel="prev" aria-label="Previous slide"><span aria-hidden="true">&lsaquo;</span></button>','<button type="button" class="rmd-carousel-control rmd-carousel-next" data-rmd-carousel="next" aria-label="Next slide"><span aria-hidden="true">&rsaquo;</span></button>'].join(""):"",u=e.items.length>1?`<div class="rmd-carousel-dots" aria-label="Carousel slides">${e.items.map((n,a)=>`<button type="button" class="rmd-carousel-dot" data-rmd-carousel-index="${a}" aria-label="Go to slide ${a+1}"${a===0?' aria-current="true"':""}></button>`).join("")}</div>`:"";return[`<section class="rmd-block rmd-carousel" data-rmd-block="carousel" data-active-index="0"${e.autoplay?` data-autoplay="true" data-interval="${y(String(e.interval))}"`:""}>`,'<div class="rmd-carousel-track">',r,"</div>",t,u,"</section>"].join("")}function Li(e){let r=e.aspectRatio?` style="--rmd-aspect-ratio: ${y(e.aspectRatio)}"`:"";return[`<section class="rmd-block rmd-embed rmd-embed-${y(e.embedType)}" data-rmd-block="embed"${r}>`,`<iframe title="Embed" src="about:blank" data-src="${y(e.embedId)}" allowfullscreen loading="lazy"></iframe>`,"</section>"].join("")}function Ri(e){let r=String(e.value??"").trim();return['<section class="rmd-block rmd-math" data-rmd-block="math">',`<div class="rmd-math-display" role="math" aria-label="${y(r)}" data-latex="${y(r)}">${_(r)}</div>`,"</section>"].join("")}function qi(e){return`<pre class="rmd-unknown-node" data-rmd-node="${y(e.type)}"><code>${_(JSON.stringify(e,null,2))}</code></pre>`}function kt(e){return e.warnings?.length?` data-rmd-warning="${y(e.warnings.join(";"))}"`:""}function zi(e){return e.data.map(r=>`${r.label}: ${r.values.join(", ")}`).join("; ")}function er(e,r={}){let t=Math.max(280,e.data.length*58+92),u=220,o=36,n=t-28,a=26,i=158,c=r.useAllValues?e.data.flatMap(m=>m.values):e.data.map(m=>m.values[0]??0),s=Math.min(...c,0),d=Math.max(...c,1),l=s===d?0:s,p=s===d?d||1:d;return{width:t,height:u,left:o,right:n,top:a,bottom:i,labelY:190,plotWidth:n-o,plotHeight:i-a,min:l,max:p}}function ne(e,r,t){return r<=1?Math.round((t.left+t.right)/2):Math.round(t.left+e/(r-1)*t.plotWidth)}function Fe(e,r){return Math.round(bt(e,r.min,r.max,r.bottom,r.top))}function bt(e,r,t,u,o){return Math.round(u+Wu(e,r,t)*(o-u))}function Wu(e,r,t){return t===r?0:Math.min(1,Math.max(0,(e-r)/(t-r)))}function yt(e){let r=Math.max(...e.data.map(t=>t.values.length),1);return Array.from({length:r},(t,u)=>e.data.map(o=>o.values[u]??0))}function vt(e,r){let t=e.x?`<text x="${(r.left+r.right)/2}" y="${r.height-8}" text-anchor="middle">${_(e.x)}</text>`:"",u=e.y?`<text x="12" y="${r.top+8}" text-anchor="start">${_(e.y)}</text>`:"",o=e.y2?`<text x="${r.right}" y="${r.top+8}" text-anchor="end">${_(e.y2)}</text>`:"";return`${[`<line x1="${r.left}" y1="${r.bottom}" x2="${r.right}" y2="${r.bottom}" stroke="var(--rmd-color-line-strong, #b7c1b0)" stroke-width="1"></line>`,`<line x1="${r.left}" y1="${r.top}" x2="${r.left}" y2="${r.bottom}" stroke="var(--rmd-color-line-strong, #b7c1b0)" stroke-width="1"></line>`].join("")}${t}${u}${o}`}function Ku(e,r){return e.data.map((t,u)=>`<text x="${ne(u,e.data.length,r)}" y="${r.labelY}" text-anchor="middle">${_(t.label)}</text>`).join("")}function Ii(e,r,t){return e.legend==="none"?"":e.data.map((u,o)=>{let n=t+o*20;return`<g class="rmd-chart-legend-item"><rect x="${r}" y="${n-10}" width="10" height="10" rx="2" style="fill: ${U(o)}"></rect><text x="${r+16}" y="${n}" text-anchor="start">${_(u.label)}</text></g>`}).join("")}function $e(e,r,t=null){let u=t===null?"":` data-series-index="${y(String(t))}"`;return`<g class="rmd-chart-point" data-label="${y(e.label)}" data-value="${y(String(r))}"${u}>`}function U(e){return["var(--rmd-color-primary, #176b72)","var(--rmd-color-accent, #c8523e)","var(--rmd-color-info, #3867a8)","var(--rmd-color-success, #2f7d4f)","var(--rmd-color-warning, #a36a1c)","var(--rmd-color-danger, #b63f35)"][e%6]}function Bi(e,r,t,u,o){let n=Qe(e,r,t,o),a=Qe(e,r,t,u),i=o-u<=180?0:1;return`M ${e},${r} L ${n.x},${n.y} A ${t},${t} 0 ${i} 0 ${a.x},${a.y} Z`}function Qe(e,r,t,u){let o=(u-90)*Math.PI/180;return{x:Math.round((e+t*Math.cos(o))*100)/100,y:Math.round((r+t*Math.sin(o))*100)/100}}function Xe(e,r,t,u,o){let n=-90+360/o*u;return Qe(e,r,t,n+90)}function Te(e){return Number.isInteger(e)?String(e):String(Math.round(e*100)/100)}function Pi(e,r=""){let t=e.map(u=>String(u)).join(" - ");return r?`${t} ${r}`:t}function Gu(e,r){if(r.max===r.min)return"0";let t=(e-r.min)/(r.max-r.min)*100;return(Math.round(t*100)/100).toFixed(2)}function _(e){return String(e).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;")}function y(e){return _(e).replaceAll("'","&#39;")}function Ni(e,r,t,u,o=null){if(!u)return e.sliders[r]=Number(t),e.sliders[r];let n=Number(t),a=Math.min(Math.max(n,u.min),u.max),i=r0(a,u.min,u.step),c=Number(i.toFixed(12));if(u.range){let s=Array.isArray(e.sliders[r])?e.sliders[r]:[u.min,u.max],d=o==="max"?[s[0],c]:[c,s[1]];return d[0]>d[1]&&(d=o==="max"?[c,c]:[d[1],d[1]]),e.sliders[r]=d,e.sliders[r]}return e.sliders[r]=c,e.sliders[r]}function Hi(e,r){return String(e).replace(/{{\s*([a-zA-Z_][a-zA-Z0-9_]*)(?:\s*\|\s*([a-zA-Z_][a-zA-Z0-9_]*))?\s*}}/g,(t,u,o)=>r.sliders[u]===void 0?`[\u672A\u5B9A\u4E49:${u}]`:eo(r.sliders[u],o))}function rr(e,r={}){let t=e?.ownerDocument??globalThis.document;if(!e||!t)throw new TypeError("hydrate requires a DOM root");let u=r.state??Oi(e),o=[];return ji(e,u),Zi(e,u),Gi(e,u),Wi(e,t,o),Ki(e,t),{state:u,destroy(){for(let n of o)n();e.replaceWith(e.cloneNode(!0))}}}function Oi(e){let r={sliders:{},activeTabs:{}};for(let t of e.querySelectorAll('[data-rmd-block="slider"]')){let u=t.getAttribute("data-name"),o=Array.from(t.querySelectorAll('input[type="range"]'));u&&o.length>0&&r.sliders[u]===void 0&&(r.sliders[u]=t.getAttribute("data-range")==="true"?o.map(n=>Number(n.value)):Number(o[0].value))}for(let t of e.querySelectorAll('[data-rmd-block="tabs"]')){let u=t.getAttribute("data-rmd-id")??t.getAttribute("data-default")??"tabs";r.activeTabs[u]=t.getAttribute("data-default")??""}return r}function ji(e,r){for(let t of e.querySelectorAll('[data-rmd-block="slider"]')){let u=t.getAttribute("data-name"),o=Array.from(t.querySelectorAll('input[type="range"]')),n=t.querySelector("output");if(!u||o.length===0)continue;let a=t.getAttribute("data-range")==="true",i=o[0],c={min:Number(i.min),max:Number(i.max),step:Number(i.step||1),range:a};for(let s of o)s.addEventListener("input",()=>{let d=Ni(r,u,s.value,c,s.getAttribute("data-bound"));a&&(o[0].value=String(d[0]),o[1].value=String(d[1]),Ui(t,d,c)),n&&(n.textContent=Vi(d,t.getAttribute("data-unit")||"")),Qu(e,r)})}}function Vi(e,r){let t=Array.isArray(e)?e.join(" - "):String(e);return r?`${t} ${r}`:t}function Ui(e,r,t){let u=e.querySelector(".rmd-slider-range-control");!u||!Array.isArray(r)||t.max===t.min||(u.style.setProperty("--rmd-range-start",`${Yu(r[0],t)}%`),u.style.setProperty("--rmd-range-end",`${Yu(r[1],t)}%`))}function Yu(e,r){return String(Math.round((e-r.min)/(r.max-r.min)*1e4)/100)}function Zi(e,r){for(let t of e.querySelectorAll('[data-rmd-block="export"]')){let u=t.querySelector("button"),o=t.querySelector("pre code")?.textContent??"";u&&u.addEventListener("click",async()=>{let n=Hi(o,r),a=await Qi(n);t.setAttribute("data-rmd-copied",a?"true":"false"),a||e0(t,n)})}}function Gi(e,r){for(let t of e.querySelectorAll('[data-rmd-block="tabs"]')){let u=t.getAttribute("data-rmd-id")??t.getAttribute("data-default")??"tabs";for(let o of t.querySelectorAll('[role="tab"]'))o.addEventListener("click",()=>{let n=o.getAttribute("data-label");if(n){r.activeTabs[u]=n;for(let a of t.querySelectorAll('[role="tab"]'))a.setAttribute("aria-selected",String(a.getAttribute("data-label")===n));for(let a of t.querySelectorAll('[role="tabpanel"]'))a.hidden=a.getAttribute("data-label")!==n;Qu(e,r)}})}}function Wi(e,r,t){let u=r.defaultView??globalThis;for(let o of e.querySelectorAll('[data-rmd-block="carousel"]')){let n=o.querySelector(".rmd-carousel-track");if(!n)continue;let a=Array.from(n.children??[]);if(a.length<=1)continue;let i=o.querySelector('[data-rmd-carousel="prev"]'),c=o.querySelector('[data-rmd-carousel="next"]'),s=Array.from(o.querySelectorAll(".rmd-carousel-dot")),d=Number(o.getAttribute("data-interval")||3e3),l=0,p=!1,m=null,f=b=>(b+a.length)%a.length,h=()=>{o.setAttribute("data-active-index",String(l)),s.forEach((b,x)=>{x===l?b.setAttribute("aria-current","true"):b.removeAttribute("aria-current")})},g=(b,x="smooth")=>{l=f(b);let k=l*(n.clientWidth||0);typeof n.scrollTo=="function"?n.scrollTo({left:k,behavior:x}):n.scrollLeft=k,h()},w=()=>{n.clientWidth&&(l=f(Math.round(n.scrollLeft/n.clientWidth)),h())};i?.addEventListener("click",()=>g(l-1)),c?.addEventListener("click",()=>g(l+1)),s.forEach((b,x)=>b.addEventListener("click",()=>g(x))),n.addEventListener("scroll",w),o.addEventListener("pointerenter",()=>{p=!0}),o.addEventListener("pointerleave",()=>{p=!1}),o.addEventListener("focusin",()=>{p=!0}),o.addEventListener("focusout",()=>{p=!1}),h(),o.getAttribute("data-autoplay")==="true"&&Number.isFinite(d)&&d>0&&(m=u.setInterval(()=>{p||g(l+1)},d),t.push(()=>u.clearInterval?.(m)))}}function Ki(e,r){let t=Array.from(e.querySelectorAll(".rmd-math-display[data-latex]")).filter(c=>c.getAttribute("data-rendered")!=="katex");if(t.length===0)return;let u=r.defaultView??globalThis,o=Xu(e);Yi(e,r);let n=()=>{if(u.katex)for(let c of t){let s=c.getAttribute("data-latex")||c.textContent||"";try{u.katex.render(s,c,{displayMode:!0,throwOnError:!1,...o?{output:"mathml"}:{}}),c.setAttribute("data-rendered","katex")}catch{}}};if(u.katex){n();return}let a=r.querySelector("script[data-rmd-katex-script]");if(a){a.addEventListener("load",n,{once:!0});return}let i=r.createElement("script");i.src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js",i.async=!0,i.setAttribute("data-rmd-katex-script","true"),i.addEventListener("load",n,{once:!0}),r.head?.append(i)}function Yi(e,r){Ji(r.head,r),Ju(r.head,r),Xu(e)&&Ju(e,r)}function Ji(e,r){if(!e||e.querySelector?.("style[data-rmd-katex-guard]"))return;let t=r.createElement("style");t.textContent=Xi,t.setAttribute("data-rmd-katex-guard","true"),e.append?.(t)}function Ju(e,r){if(!e||e.querySelector?.("link[data-rmd-katex-style]"))return;let t=r.createElement("link");t.rel="stylesheet",t.href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css",t.setAttribute("data-rmd-katex-style","true"),e.append?.(t)}function Xu(e){return e?.nodeType===11&&"host"in e}var Xi=`
.katex .katex-mathml {
  position: absolute;
  overflow: hidden;
  clip: rect(1px, 1px, 1px, 1px);
  clip-path: inset(50%);
  width: 1px;
  height: 1px;
  white-space: nowrap;
}
`.trim();async function Qi(e){try{return globalThis.navigator?.clipboard?.writeText?(await globalThis.navigator.clipboard.writeText(e),!0):!1}catch{return!1}}function e0(e,r){let t=e.querySelector("textarea[data-rmd-manual-copy]");t||(t=e.ownerDocument.createElement("textarea"),t.setAttribute("data-rmd-manual-copy","true"),e.append(t)),t.value=r}function Qu(e,r){let t=new CustomEvent("rmd:statechange",{bubbles:!0,detail:{state:r}});e.dispatchEvent(t)}function r0(e,r,t){return!Number.isFinite(t)||t<=0?e:r+Math.round((e-r)/t)*t}function eo(e,r){if(Array.isArray(e))return e.map(t=>eo(t,r)).join(" - ");switch(r){case"int":return String(Math.round(Number(e)));case"float":case void 0:return String(e);default:return String(e)}}var ro=`
(() => {
  const state = { sliders: {}, activeTabs: {} };

  function snapToStep(value, min, step) {
    if (!Number.isFinite(step) || step <= 0) return value;
    return min + Math.round((value - min) / step) * step;
  }

	  function setSliderValue(name, value, spec, bound) {
	    const numeric = Number(value);
	    const clamped = Math.min(Math.max(numeric, spec.min), spec.max);
	    const stepped = Number(snapToStep(clamped, spec.min, spec.step).toFixed(12));
	    if (spec.range) {
	      const previous = Array.isArray(state.sliders[name]) ? state.sliders[name] : [spec.min, spec.max];
	      let next = bound === "max" ? [previous[0], stepped] : [stepped, previous[1]];
	      if (next[0] > next[1]) {
	        next = bound === "max" ? [stepped, stepped] : [next[1], next[1]];
	      }
	      state.sliders[name] = next;
	      return next;
	    }
	    state.sliders[name] = stepped;
	    return stepped;
	  }

	  function formatValue(value, formatter) {
	    if (Array.isArray(value)) return value.map((item) => formatValue(item, formatter)).join(" - ");
	    if (formatter === "int") return String(Math.round(Number(value)));
	    return String(value);
	  }

	  function formatSliderOutput(value, unit) {
	    const text = Array.isArray(value) ? value.join(" - ") : String(value);
	    return unit ? text + " " + unit : text;
	  }

  function renderTemplate(template) {
    return String(template).replace(/{{\\s*([a-zA-Z_][a-zA-Z0-9_]*)(?:\\s*\\|\\s*([a-zA-Z_][a-zA-Z0-9_]*))?\\s*}}/g, (_match, name, formatter) => {
      if (state.sliders[name] === undefined) return "[\u672A\u5B9A\u4E49:" + name + "]";
      return formatValue(state.sliders[name], formatter);
    });
  }

  function dispatchStateChange(root) {
    root.dispatchEvent(new CustomEvent("rmd:statechange", {
      bubbles: true,
      detail: { state }
    }));
  }

  async function writeClipboard(content) {
    try {
      if (!navigator.clipboard || !navigator.clipboard.writeText) return false;
      await navigator.clipboard.writeText(content);
      return true;
    } catch {
      return false;
    }
  }

  function showManualCopy(block, content) {
    let textarea = block.querySelector("textarea[data-rmd-manual-copy]");
    if (!textarea) {
      textarea = document.createElement("textarea");
      textarea.setAttribute("data-rmd-manual-copy", "true");
      textarea.setAttribute("aria-label", "Manual copy fallback");
      block.append(textarea);
    }
    textarea.value = content;
    textarea.focus();
    textarea.select();
  }

  function bindSliders(root) {
    root.querySelectorAll('[data-rmd-block="slider"]').forEach((slider) => {
      const name = slider.getAttribute("data-name");
	      const inputs = Array.from(slider.querySelectorAll('input[type="range"]'));
	      const output = slider.querySelector("output");
	      if (!name || inputs.length === 0 || state.sliders[name] !== undefined) return;

	      const unit = slider.getAttribute("data-unit") || "";
	      const isRange = slider.getAttribute("data-range") === "true";
	      const firstInput = inputs[0];
	      const spec = {
	        min: Number(firstInput.min),
	        max: Number(firstInput.max),
	        step: Number(firstInput.step || 1),
	        range: isRange
	      };
	      state.sliders[name] = isRange ? inputs.map((input) => Number(input.value)) : Number(firstInput.value);

	      inputs.forEach((input) => {
	        input.addEventListener("input", () => {
	          const value = setSliderValue(name, input.value, spec, input.getAttribute("data-bound"));
	          if (isRange) {
	            inputs[0].value = String(value[0]);
	            inputs[1].value = String(value[1]);
	            updateRangeTrack(slider, value, spec);
	          }
	          if (output) output.textContent = formatSliderOutput(value, unit);
	          dispatchStateChange(root);
	        });
	      });
	    });
	  }

	  function updateRangeTrack(slider, value, spec) {
	    const control = slider.querySelector(".rmd-slider-range-control");
	    if (!control || !Array.isArray(value) || spec.max === spec.min) return;
	    control.style.setProperty("--rmd-range-start", String(Math.round(((value[0] - spec.min) / (spec.max - spec.min)) * 10000) / 100) + "%");
	    control.style.setProperty("--rmd-range-end", String(Math.round(((value[1] - spec.min) / (spec.max - spec.min)) * 10000) / 100) + "%");
	  }

	  function bindExports(root) {
    root.querySelectorAll('[data-rmd-block="export"]').forEach((block) => {
      const button = block.querySelector("button");
      const code = block.querySelector("pre code");
      if (!button || !code) return;

      button.addEventListener("click", async () => {
        const content = renderTemplate(code.textContent || "");
        const ok = await writeClipboard(content);
        block.setAttribute("data-rmd-copied", ok ? "true" : "false");
        if (!ok) showManualCopy(block, content);
      });
    });
  }

  function bindTabs(root) {
    root.querySelectorAll('[data-rmd-block="tabs"]').forEach((tabs) => {
      const key = tabs.getAttribute("data-rmd-id") || tabs.getAttribute("data-default") || "tabs";
      state.activeTabs[key] = tabs.getAttribute("data-default") || "";

      tabs.querySelectorAll('[role="tab"]').forEach((button) => {
        button.addEventListener("click", () => {
          const label = button.getAttribute("data-label");
          if (!label) return;
          state.activeTabs[key] = label;

          tabs.querySelectorAll('[role="tab"]').forEach((candidate) => {
            candidate.setAttribute("aria-selected", String(candidate.getAttribute("data-label") === label));
          });
          tabs.querySelectorAll('[role="tabpanel"]').forEach((panel) => {
            panel.hidden = panel.getAttribute("data-label") !== label;
          });
          dispatchStateChange(root);
        });
      });
    });
  }

  function bindCarousels(root) {
    root.querySelectorAll('[data-rmd-block="carousel"]').forEach((carousel) => {
      const track = carousel.querySelector(".rmd-carousel-track");
      if (!track) return;

      const items = Array.from(track.children || []);
      if (items.length <= 1) return;

      const prev = carousel.querySelector('[data-rmd-carousel="prev"]');
      const next = carousel.querySelector('[data-rmd-carousel="next"]');
      const dots = Array.from(carousel.querySelectorAll(".rmd-carousel-dot"));
      const interval = Number(carousel.getAttribute("data-interval") || 3000);
      let activeIndex = 0;
      let paused = false;

      const normalizeIndex = (index) => (index + items.length) % items.length;
      const updateDots = () => {
        carousel.setAttribute("data-active-index", String(activeIndex));
        dots.forEach((dot, index) => {
          if (index === activeIndex) {
            dot.setAttribute("aria-current", "true");
          } else {
            dot.removeAttribute("aria-current");
          }
        });
      };
      const goTo = (index, behavior = "smooth") => {
        activeIndex = normalizeIndex(index);
        const left = activeIndex * (track.clientWidth || 0);
        if (typeof track.scrollTo === "function") {
          track.scrollTo({ left, behavior });
        } else {
          track.scrollLeft = left;
        }
        updateDots();
      };
      const syncFromScroll = () => {
        if (!track.clientWidth) return;
        activeIndex = normalizeIndex(Math.round(track.scrollLeft / track.clientWidth));
        updateDots();
      };

      if (prev) prev.addEventListener("click", () => goTo(activeIndex - 1));
      if (next) next.addEventListener("click", () => goTo(activeIndex + 1));
      dots.forEach((dot, index) => dot.addEventListener("click", () => goTo(index)));
      track.addEventListener("scroll", syncFromScroll);
      carousel.addEventListener("pointerenter", () => { paused = true; });
      carousel.addEventListener("pointerleave", () => { paused = false; });
      carousel.addEventListener("focusin", () => { paused = true; });
      carousel.addEventListener("focusout", () => { paused = false; });

      updateDots();

      if (carousel.getAttribute("data-autoplay") === "true" && Number.isFinite(interval) && interval > 0) {
        window.setInterval(() => {
          if (!paused) goTo(activeIndex + 1);
        }, interval);
      }
    });
  }

  function enhanceMath(root) {
    const blocks = Array.from(root.querySelectorAll(".rmd-math-display[data-latex]"))
      .filter((block) => block.getAttribute("data-rendered") !== "katex");
    if (blocks.length === 0) return;

    const render = () => {
      if (!window.katex) return;
      blocks.forEach((block) => {
        const latex = block.getAttribute("data-latex") || block.textContent || "";
        try {
          window.katex.render(latex, block, { displayMode: true, throwOnError: false });
          block.setAttribute("data-rendered", "katex");
        } catch {
          // Keep the static formula-style fallback visible when KaTeX rejects input.
        }
      });
    };

    if (window.katex) {
      render();
      return;
    }

    if (!document.querySelector('link[data-rmd-katex-style]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css";
      link.setAttribute("data-rmd-katex-style", "true");
      document.head.append(link);
    }

    const existingScript = document.querySelector('script[data-rmd-katex-script]');
    if (existingScript) {
      existingScript.addEventListener("load", render, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js";
    script.async = true;
    script.setAttribute("data-rmd-katex-script", "true");
    script.addEventListener("load", render, { once: true });
    document.head.append(script);
  }

  function init() {
    const root = document.querySelector(".rmd-document") || document.body;
    bindSliders(root);
    bindExports(root);
    bindTabs(root);
    bindCarousels(root);
    enhanceMath(root);
    window.RMD_STATE = state;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
`.trim();var ke=`
:root {
  --rmd-color-page: #f5f7f4;
  --rmd-color-bg: #fbfcf8;
  --rmd-color-surface: #ffffff;
  --rmd-color-surface-strong: #f0f4ef;
  --rmd-color-fg: #20251f;
  --rmd-color-muted: #687064;
  --rmd-color-subtle: #8b9387;
  --rmd-color-line: #d7ddd2;
  --rmd-color-line-strong: #b7c1b0;
  --rmd-color-primary: #176b72;
  --rmd-color-primary-strong: #0e4d55;
  --rmd-color-accent: #c8523e;
  --rmd-color-success: #2f7d4f;
  --rmd-color-warning: #a36a1c;
  --rmd-color-danger: #b63f35;
  --rmd-color-info: #3867a8;
  --rmd-font-body: Charter, "Iowan Old Style", "Palatino Linotype", Palatino, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", serif;
  --rmd-font-ui: "Avenir Next", Avenir, "Gill Sans", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
  --rmd-font-mono: "SF Mono", "Cascadia Code", "Liberation Mono", Menlo, Consolas, monospace;
  --rmd-radius-sm: 4px;
  --rmd-radius-md: 8px;
  --rmd-radius-lg: 8px;
  --rmd-spacing-sm: 8px;
  --rmd-spacing-md: 16px;
  --rmd-spacing-lg: 28px;
  --rmd-shadow-sm: 0 1px 2px rgb(23 36 29 / 0.05), 0 8px 22px rgb(23 36 29 / 0.05);
  --rmd-shadow-md: 0 16px 38px rgb(23 36 29 / 0.09);
  --rmd-focus-ring: 0 0 0 3px rgb(23 107 114 / 0.2);
}

body[data-rmd-theme] {
  margin: 0;
  background:
    linear-gradient(180deg, rgb(245 247 244 / 0.92), rgb(238 243 241 / 0.92)),
    radial-gradient(circle at 18% 12%, rgb(200 82 62 / 0.12), transparent 28rem),
    radial-gradient(circle at 82% 4%, rgb(23 107 114 / 0.14), transparent 34rem);
  color: var(--rmd-color-fg);
}

.rmd-document {
  box-sizing: border-box;
  max-width: 1040px;
  margin: 0 auto;
  padding: clamp(32px, 6vw, 72px) clamp(18px, 5vw, 56px);
  color: var(--rmd-color-fg);
  font-family: var(--rmd-font-body);
  font-size: 17px;
  line-height: 1.72;
  letter-spacing: 0;
}

.rmd-document *,
.rmd-document *::before,
.rmd-document *::after {
  box-sizing: border-box;
}

.rmd-document > :first-child {
  margin-top: 0;
}

.rmd-document > :last-child {
  margin-bottom: 0;
}

.rmd-document h1,
.rmd-document h2,
.rmd-document h3,
.rmd-document h4,
.rmd-document h5,
.rmd-document h6 {
  margin: 2.2em 0 0.65em;
  color: #18201a;
  font-family: var(--rmd-font-ui);
  font-weight: 720;
  letter-spacing: 0;
  line-height: 1.12;
}

.rmd-document h1 {
  max-width: 840px;
  margin-bottom: 0.85em;
  padding-bottom: 22px;
  border-bottom: 1px solid var(--rmd-color-line);
  font-size: 42px;
}

.rmd-document h2 {
  font-size: 28px;
}

.rmd-document h3 {
  font-size: 20px;
}

.rmd-document p,
.rmd-document ul,
.rmd-document ol,
.rmd-document blockquote {
  margin: 0 0 1.05em;
}

.rmd-document a {
  color: var(--rmd-color-primary-strong);
  text-decoration-color: rgb(23 107 114 / 0.28);
  text-decoration-thickness: 2px;
  text-underline-offset: 3px;
}

.rmd-document a:hover {
  color: var(--rmd-color-accent);
  text-decoration-color: rgb(200 82 62 / 0.42);
}

.rmd-document strong {
  color: #111a14;
  font-weight: 720;
}

.rmd-document code {
  border: 1px solid rgb(23 107 114 / 0.14);
  border-radius: var(--rmd-radius-sm);
  padding: 0.08em 0.32em;
  background: rgb(23 107 114 / 0.07);
  color: #0f4f57;
  font-family: var(--rmd-font-mono);
  font-size: 0.88em;
}

.rmd-document img {
  max-width: 100%;
  border-radius: var(--rmd-radius-md);
}

.rmd-document blockquote {
  margin: 1.45em 0;
  border-left: 4px solid var(--rmd-color-primary);
  padding: 4px 0 4px 18px;
  color: #3f493d;
  font-size: 18px;
}

.rmd-document blockquote > :last-child {
  margin-bottom: 0;
}

.rmd-document hr {
  margin: 38px 0;
  border: 0;
  border-top: 1px solid var(--rmd-color-line);
}

.rmd-block {
  margin: 32px 0;
}

.rmd-grid {
  display: grid;
  grid-template-columns: repeat(var(--rmd-grid-columns, 1), minmax(0, 1fr));
  gap: 14px;
}

.rmd-grid[data-columns="2"] { --rmd-grid-columns: 2; }
.rmd-grid[data-columns="3"] { --rmd-grid-columns: 3; }
.rmd-grid[data-columns="4"] { --rmd-grid-columns: 4; }
.rmd-grid[data-columns="5"] { --rmd-grid-columns: 5; }
.rmd-grid[data-columns="6"] { --rmd-grid-columns: 6; }

.rmd-grid-cell,
.rmd-card,
.rmd-callout,
.rmd-export,
.rmd-slider,
.rmd-diff,
.rmd-flow,
.rmd-tabs {
  border: 1px solid var(--rmd-color-line);
  border-radius: var(--rmd-radius-md);
  background: rgb(255 255 255 / 0.86);
  box-shadow: var(--rmd-shadow-sm);
}

.rmd-grid-cell {
  min-width: 0;
  padding: 18px;
  border-top: 3px solid rgb(23 107 114 / 0.46);
}

.rmd-grid-cell > :first-child {
  margin-top: 0;
}

.rmd-grid-cell > :last-child {
  margin-bottom: 0;
}

.rmd-callout,
.rmd-card,
.rmd-export,
.rmd-diff,
.rmd-flow,
.rmd-tabs {
  padding: 20px;
}

.rmd-card {
  position: relative;
  overflow: hidden;
  border-color: rgb(23 107 114 / 0.18);
  background:
    linear-gradient(180deg, rgb(255 255 255 / 0.94), rgb(246 249 244 / 0.9));
}

.rmd-card::before {
  position: absolute;
  inset: 0 0 auto;
  height: 3px;
  background: linear-gradient(90deg, var(--rmd-color-primary), var(--rmd-color-accent));
  content: "";
}

.rmd-callout {
  position: relative;
  overflow: hidden;
  border-left-width: 5px;
}

.rmd-callout::before {
  position: absolute;
  inset: 0 auto 0 0;
  width: 5px;
  background: currentColor;
  content: "";
}

.rmd-callout-tip,
.rmd-callout-success {
  border-color: rgb(47 125 79 / 0.28);
  color: var(--rmd-color-success);
}

.rmd-callout-warning {
  border-color: rgb(163 106 28 / 0.3);
  color: var(--rmd-color-warning);
}

.rmd-callout-danger {
  border-color: rgb(182 63 53 / 0.3);
  color: var(--rmd-color-danger);
}

.rmd-callout-info {
  border-color: rgb(56 103 168 / 0.28);
  color: var(--rmd-color-info);
}

.rmd-callout-title,
.rmd-card-title,
.rmd-block-title {
  margin: 0 0 12px;
  color: var(--rmd-color-fg);
  font-family: var(--rmd-font-ui);
  font-size: 15px;
  font-weight: 720;
}

.rmd-card-body,
.rmd-callout-body {
  color: var(--rmd-color-fg);
}

.rmd-card-body > :first-child,
.rmd-callout-body > :first-child {
  margin-top: 0;
}

.rmd-card-body > :last-child,
.rmd-callout-body > :last-child {
  margin-bottom: 0;
}

.rmd-chart {
  padding: 20px;
  border: 1px solid var(--rmd-color-line);
  border-radius: var(--rmd-radius-md);
  background:
    linear-gradient(180deg, rgb(255 255 255 / 0.94), rgb(246 249 244 / 0.92));
  box-shadow: var(--rmd-shadow-md);
}

.rmd-chart-svg {
  display: block;
  width: 100%;
  max-width: 100%;
  min-height: 220px;
  padding-top: 6px;
}

.rmd-chart rect {
  fill: var(--rmd-color-primary);
  filter: drop-shadow(0 8px 8px rgb(23 107 114 / 0.16));
  transition: fill 160ms ease, transform 160ms ease;
  transform-origin: bottom;
}

.rmd-chart-point:nth-of-type(2n) rect {
  fill: var(--rmd-color-accent);
}

.rmd-chart-point:hover rect {
  fill: var(--rmd-color-primary-strong);
  transform: scaleY(1.03);
}

.rmd-chart text {
  fill: var(--rmd-color-muted);
  font-family: var(--rmd-font-ui);
  font-size: 12px;
}

.rmd-slider {
  display: grid;
  grid-template-columns: minmax(150px, 1.1fr) minmax(180px, 3fr) minmax(58px, auto);
  gap: 14px;
  align-items: center;
  padding: 14px 16px;
}

.rmd-slider label,
.rmd-slider output {
  font-family: var(--rmd-font-ui);
  font-size: 14px;
  font-weight: 680;
}

.rmd-slider label {
  color: #293128;
}

.rmd-slider output {
  justify-self: end;
  min-width: 54px;
  border: 1px solid rgb(23 107 114 / 0.18);
  border-radius: 999px;
  padding: 4px 9px;
  background: rgb(23 107 114 / 0.08);
  color: var(--rmd-color-primary-strong);
  text-align: center;
}

.rmd-slider input[type="range"] {
  width: 100%;
  accent-color: var(--rmd-color-primary);
  cursor: pointer;
}

.rmd-slider[data-range="true"] {
  grid-template-columns: minmax(150px, 1.1fr) minmax(220px, 3fr) minmax(112px, auto);
}

.rmd-slider-range-control {
  position: relative;
  min-height: 32px;
  display: grid;
  align-items: center;
  isolation: isolate;
}

.rmd-slider-range-track {
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  height: 8px;
  border: 1px solid rgb(23 107 114 / 0.16);
  border-radius: 999px;
  background:
    linear-gradient(
      90deg,
      rgb(23 107 114 / 0.12) 0%,
      rgb(23 107 114 / 0.12) var(--rmd-range-start, 0%),
      var(--rmd-color-primary) var(--rmd-range-start, 0%),
      var(--rmd-color-primary) var(--rmd-range-end, 100%),
      rgb(23 107 114 / 0.12) var(--rmd-range-end, 100%),
      rgb(23 107 114 / 0.12) 100%
    );
  transform: translateY(-50%);
  pointer-events: none;
  z-index: 0;
}

.rmd-slider-range-control input[type="range"] {
  grid-area: 1 / 1;
  position: relative;
  margin: 0;
  background: transparent;
  z-index: 1;
}

.rmd-slider-range-control input[type="range"][data-bound="max"] {
  z-index: 2;
}

.rmd-slider input[type="range"]:focus-visible,
.rmd-export button:focus-visible,
.rmd-tabs [role="tab"]:focus-visible {
  outline: 0;
  box-shadow: var(--rmd-focus-ring);
}

.rmd-export button,
.rmd-tabs [role="tab"] {
  border: 1px solid var(--rmd-color-line-strong);
  border-radius: var(--rmd-radius-sm);
  padding: 8px 12px;
  background: var(--rmd-color-surface);
  color: #243026;
  font-family: var(--rmd-font-ui);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: background 160ms ease, border-color 160ms ease, color 160ms ease, transform 160ms ease;
}

.rmd-export button:hover,
.rmd-tabs [role="tab"]:hover {
  border-color: var(--rmd-color-primary);
  color: var(--rmd-color-primary-strong);
  transform: translateY(-1px);
}

.rmd-export button {
  background: var(--rmd-color-primary);
  border-color: var(--rmd-color-primary);
  color: #fff;
}

.rmd-export button:hover {
  background: var(--rmd-color-primary-strong);
  color: #fff;
}

.rmd-tabs [role="tablist"] {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 18px;
}

.rmd-tabs [role="tab"][aria-selected="true"] {
  border-color: var(--rmd-color-primary);
  background: rgb(23 107 114 / 0.1);
  color: var(--rmd-color-primary-strong);
}

.rmd-tabs [role="tabpanel"] > :last-child {
  margin-bottom: 0;
}

.rmd-code,
.rmd-export pre,
.rmd-diff pre {
  overflow: auto;
  border: 1px solid rgb(32 37 31 / 0.1);
  border-radius: var(--rmd-radius-md);
  background: #15201b;
  color: #e8eee7;
  font-family: var(--rmd-font-mono);
  font-size: 13px;
  line-height: 1.62;
}

.rmd-code {
  padding: 16px;
}

.rmd-code code,
.rmd-export pre code,
.rmd-diff code {
  border: 0;
  padding: 0;
  background: transparent;
  color: inherit;
  font-size: inherit;
}

.rmd-export pre,
.rmd-diff pre {
  margin: 14px 0 0;
  padding: 14px;
}

.rmd-flow ol {
  display: grid;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.rmd-flow li {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  border: 1px solid rgb(23 107 114 / 0.14);
  border-radius: var(--rmd-radius-md);
  padding: 10px 12px;
  background: rgb(23 107 114 / 0.055);
  color: #263229;
  font-family: var(--rmd-font-ui);
  font-size: 14px;
}

.rmd-flow li span:nth-child(2) {
  color: var(--rmd-color-accent);
  font-weight: 800;
}

.rmd-diff-line {
  display: block;
  padding: 2px 0;
}

.rmd-diff-line mark {
  border-radius: 999px;
  padding: 2px 7px;
  background: rgb(200 82 62 / 0.18);
  color: #f0c2b9;
  font-family: var(--rmd-font-ui);
  font-size: 12px;
}

.rmd-diff-add code {
  color: #9fe0b5;
}

.rmd-diff-remove code {
  color: #f1a29a;
}

@media (max-width: 720px) {
  .rmd-grid {
    grid-template-columns: 1fr;
  }

  .rmd-slider {
    grid-template-columns: 1fr;
  }

  .rmd-slider output {
    justify-self: start;
  }

  .rmd-slider[data-range="true"] {
    grid-template-columns: 1fr;
  }

  .rmd-document h1 {
    font-size: 32px;
  }

  .rmd-document h2 {
    font-size: 24px;
  }
}

/* ========================================================================= */
/* EXTENSION BLOCKS v0.2                                                     */
/* ========================================================================= */

/* Grid Masonry Layout */
.rmd-grid[data-layout="masonry"] {
  display: block;
  column-gap: 14px;
  column-count: var(--rmd-grid-columns, 1);
}

.rmd-grid[data-layout="masonry"] > .rmd-grid-cell {
  break-inside: avoid;
  margin-bottom: 14px;
}

/* Timeline */
.rmd-timeline {
  margin: 32px 0;
}

.rmd-timeline ol {
  position: relative;
  margin: 0;
  padding: 0;
  list-style: none;
}

.rmd-timeline-vertical ol::before {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 5px;
  width: 2px;
  background: var(--rmd-color-line);
  content: "";
}

.rmd-timeline-vertical .rmd-timeline-item {
  position: relative;
  padding-left: 28px;
  margin-bottom: 24px;
}

.rmd-timeline-vertical .rmd-timeline-item::before {
  position: absolute;
  top: 6px;
  left: 0;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--rmd-color-surface);
  border: 2px solid var(--rmd-color-line-strong);
  content: "";
  z-index: 1;
}

.rmd-timeline-horizontal ol {
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
  overflow-y: hidden;
  gap: 24px;
  padding-bottom: 12px;
  /* Treat the ol as a horizontal scroll viewport with explicit snap so
     each @item lines up nicely when the user scrolls. */
  scroll-snap-type: x proximity;
  scrollbar-width: thin;
}

.rmd-timeline-horizontal .rmd-timeline-item {
  /* Cap each item to a predictable width so a single overflowing item
     can't squeeze siblings out of the visible viewport. Long prose
     wraps inside the box; the user scrolls horizontally to see the
     next item. */
  flex: 0 0 240px;
  width: 240px;
  max-width: 240px;
  position: relative;
  padding-top: 28px;
  scroll-snap-align: start;
  /* Prevent runaway content (long URLs, code, CJK without spaces) from
     widening the flex item beyond its declared basis. */
  min-width: 0;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.rmd-timeline-horizontal .rmd-timeline-content {
  /* Belt-and-suspenders: cap inner content too, in case authors nest
     wide blocks (chart, table) inside a timeline item. */
  max-width: 100%;
  overflow-wrap: anywhere;
}

.rmd-timeline-horizontal .rmd-timeline-content pre,
.rmd-timeline-horizontal .rmd-timeline-content img,
.rmd-timeline-horizontal .rmd-timeline-content table {
  max-width: 100%;
}

/* The connector line is drawn per-item (::after) so that it scrolls with
   the items inside the overflow:auto container. The previous ol::before
   approach anchored the line to the visible viewport, which made the
   line stay put while items scrolled past \u2014 broken for any timeline
   wider than the viewport. */
.rmd-timeline-horizontal .rmd-timeline-item::after {
  position: absolute;
  top: 5px;
  left: 6px;
  /* Extend across the 24px gap to meet the next item's dot. */
  right: calc(-24px + 6px);
  height: 2px;
  background: var(--rmd-color-line);
  content: "";
}

.rmd-timeline-horizontal .rmd-timeline-item:last-child::after {
  display: none;
}

.rmd-timeline-horizontal .rmd-timeline-item::before {
  position: absolute;
  top: 0;
  left: 0;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--rmd-color-surface);
  border: 2px solid var(--rmd-color-line-strong);
  content: "";
  z-index: 1;
}

.rmd-timeline-time {
  font-family: var(--rmd-font-mono);
  font-size: 13px;
  color: var(--rmd-color-subtle);
  margin-bottom: 4px;
}

.rmd-timeline-content h4 {
  margin: 0 0 8px;
  font-size: 16px;
  color: var(--rmd-color-fg);
}

.rmd-timeline-status-success::before { border-color: var(--rmd-color-success) !important; background: var(--rmd-color-success) !important; }
.rmd-timeline-status-warning::before { border-color: var(--rmd-color-warning) !important; background: var(--rmd-color-warning) !important; }
.rmd-timeline-status-danger::before { border-color: var(--rmd-color-danger) !important; background: var(--rmd-color-danger) !important; }
.rmd-timeline-status-pending::before { border-color: var(--rmd-color-primary) !important; }

/* Kanban */
.rmd-kanban {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding-bottom: 16px;
  align-items: flex-start;
  scroll-snap-type: x mandatory;
}

.rmd-kanban-column {
  flex: 0 0 300px;
  scroll-snap-align: start;
  background: rgb(243 246 242 / 0.85);
  border-radius: var(--rmd-radius-md);
  padding: 16px;
  border: 1px solid var(--rmd-color-line);
}

.rmd-kanban-column h3 {
  margin: 0 0 16px;
  font-size: 15px;
  font-weight: 720;
  color: var(--rmd-color-fg);
  display: flex;
  align-items: center;
  gap: 8px;
}

.rmd-kanban-column h3::before {
  content: "";
  display: block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--rmd-color-primary);
  box-shadow: 0 0 0 3px rgb(23 107 114 / 0.15);
}

.rmd-kanban-column:nth-child(2n) h3::before { background: var(--rmd-color-warning); box-shadow: 0 0 0 3px rgb(163 106 28 / 0.15); }
.rmd-kanban-column:nth-child(3n) h3::before { background: var(--rmd-color-success); box-shadow: 0 0 0 3px rgb(47 125 79 / 0.15); }
.rmd-kanban-column:nth-child(4n) h3::before { background: var(--rmd-color-accent); box-shadow: 0 0 0 3px rgb(200 82 62 / 0.15); }

.rmd-kanban-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rmd-kanban-cards ul,
.rmd-kanban-cards ol {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rmd-kanban-cards > :not(ul):not(ol),
.rmd-kanban-cards li {
  background: var(--rmd-color-surface);
  border-radius: var(--rmd-radius-sm);
  padding: 14px;
  margin: 0;
  box-shadow: 0 2px 5px rgb(23 36 29 / 0.04);
  border: 1px solid var(--rmd-color-line);
  font-size: 15px;
  line-height: 1.5;
  color: #384236;
  transition: transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease;
  cursor: default;
}

.rmd-kanban-cards > :not(ul):not(ol):hover,
.rmd-kanban-cards li:hover {
  transform: translateY(-2px);
  box-shadow: var(--rmd-shadow-sm);
  border-color: var(--rmd-color-line-strong);
}

.rmd-kanban-cards li input[type="checkbox"] {
  margin-right: 8px;
  accent-color: var(--rmd-color-primary);
}

/* Details */
.rmd-details {
  border: 1px solid var(--rmd-color-line);
  border-radius: var(--rmd-radius-md);
  background: rgb(255 255 255 / 0.6);
  overflow: hidden;
  transition: background 200ms ease;
}

.rmd-details[open] {
  background: var(--rmd-color-surface);
  box-shadow: var(--rmd-shadow-sm);
}

.rmd-details summary {
  padding: 16px 20px;
  font-family: var(--rmd-font-ui);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  user-select: none;
  list-style: none;
  display: flex;
  align-items: center;
  gap: 10px;
}

.rmd-details summary::-webkit-details-marker {
  display: none;
}

.rmd-details summary::before {
  content: "";
  display: block;
  width: 0;
  height: 0;
  border-top: 5px solid transparent;
  border-bottom: 5px solid transparent;
  border-left: 6px solid var(--rmd-color-muted);
  transition: transform 200ms ease;
}

.rmd-details[open] summary::before {
  transform: rotate(90deg);
}

.rmd-details-body {
  padding: 0 20px 20px;
  border-top: 1px solid transparent;
}

.rmd-details[open] .rmd-details-body {
  border-top-color: rgb(23 107 114 / 0.08);
  padding-top: 16px;
}

/* Carousel */
.rmd-carousel {
  position: relative;
  border: 1px solid var(--rmd-color-line);
  border-radius: var(--rmd-radius-md);
  overflow: hidden;
  box-shadow: var(--rmd-shadow-sm);
  background: var(--rmd-color-surface);
}

.rmd-carousel-track {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.rmd-carousel-track::-webkit-scrollbar {
  display: none;
}

.rmd-carousel-item {
  scroll-snap-align: center;
  flex: 0 0 100%;
  width: 100%;
  padding: 24px;
}

.rmd-carousel-control {
  position: absolute;
  top: 50%;
  z-index: 2;
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  border: 1px solid rgb(23 107 114 / 0.18);
  border-radius: 999px;
  background: rgb(255 255 255 / 0.88);
  color: var(--rmd-color-fg);
  box-shadow: var(--rmd-shadow-sm);
  cursor: pointer;
  transform: translateY(-50%);
}

.rmd-carousel-control:hover {
  border-color: var(--rmd-color-primary);
  color: var(--rmd-color-primary);
}

.rmd-carousel-prev {
  left: 12px;
}

.rmd-carousel-next {
  right: 12px;
}

.rmd-carousel-control span {
  font-size: 26px;
  line-height: 1;
}

.rmd-carousel-dots {
  position: absolute;
  left: 50%;
  bottom: 12px;
  z-index: 2;
  display: flex;
  gap: 8px;
  transform: translateX(-50%);
}

.rmd-carousel-dot {
  width: 9px;
  height: 9px;
  padding: 0;
  border: 0;
  border-radius: 999px;
  background: rgb(32 37 31 / 0.28);
  cursor: pointer;
}

.rmd-carousel-dot[aria-current="true"] {
  width: 22px;
  background: var(--rmd-color-primary);
}

/* Embed */
.rmd-embed {
  position: relative;
  width: 100%;
  border-radius: var(--rmd-radius-md);
  overflow: hidden;
  background: #000;
  box-shadow: var(--rmd-shadow-md);
}

.rmd-embed iframe {
  width: 100%;
  height: 100%;
  border: 0;
  aspect-ratio: var(--rmd-aspect-ratio, 16 / 9);
}

/* Math */
.rmd-math {
  display: block;
  overflow-x: auto;
  padding: 22px 24px;
  background: rgb(23 107 114 / 0.04);
  border-radius: var(--rmd-radius-md);
  border: 1px solid rgb(23 107 114 / 0.12);
  color: var(--rmd-color-fg);
  text-align: center;
}

.rmd-math-display {
  min-width: max-content;
  font-family: "STIX Two Math", "Cambria Math", "Times New Roman", serif;
  font-size: clamp(20px, 2.2vw, 30px);
  font-style: italic;
  line-height: 1.6;
  letter-spacing: 0;
  white-space: pre-wrap;
}

.rmd-math-display[data-rendered="katex"] {
  font-style: normal;
  min-width: 0;
}
`.trim();var to=`
/* ========================================================================= */
/* THEME: tech-dark \u2014 overrides applied on top of the default layout         */
/* ========================================================================= */

:root {
  --rmd-color-page: #07090e;
  --rmd-color-bg: #0c1018;
  --rmd-color-surface: #131826;
  --rmd-color-surface-strong: #1c2336;
  --rmd-color-fg: #d8e3f0;
  --rmd-color-muted: #8c98ad;
  --rmd-color-subtle: #5e6878;
  --rmd-color-line: #1e2738;
  --rmd-color-line-strong: #2e394f;
  --rmd-color-primary: #5cf2d6;
  --rmd-color-primary-strong: #2dd6b9;
  --rmd-color-accent: #c084fc;
  --rmd-color-success: #6ee7b7;
  --rmd-color-warning: #fcd34d;
  --rmd-color-danger: #f87171;
  --rmd-color-info: #60a5fa;
  --rmd-font-body: Inter, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", system-ui, sans-serif;
  --rmd-font-ui: Inter, ui-sans-serif, system-ui, sans-serif;
  --rmd-font-mono: "JetBrains Mono", "SF Mono", "Cascadia Code", Menlo, Consolas, monospace;
  --rmd-shadow-sm: 0 1px 2px rgb(0 0 0 / 0.4);
  --rmd-shadow-md: 0 12px 36px rgb(0 0 0 / 0.5);
  --rmd-focus-ring: 0 0 0 3px rgb(92 242 214 / 0.35);
}

body[data-rmd-theme] {
  background:
    linear-gradient(180deg, #07090e 0%, #0a0d15 60%, #07090e 100%),
    radial-gradient(circle at 18% 12%, rgb(92 242 214 / 0.08), transparent 30rem),
    radial-gradient(circle at 82% 6%, rgb(192 132 252 / 0.10), transparent 32rem);
  color: var(--rmd-color-fg);
}

/* Subtle scanline grid for the page background */
body[data-rmd-theme]::before {
  content: "";
  position: fixed;
  inset: 0;
  pointer-events: none;
  background-image:
    linear-gradient(rgb(92 242 214 / 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgb(92 242 214 / 0.03) 1px, transparent 1px);
  background-size: 32px 32px;
  z-index: 0;
}

.rmd-document {
  position: relative;
  z-index: 1;
  color: var(--rmd-color-fg);
}

/* Headings \u2014 luminous, mono-flavored */
.rmd-document h1,
.rmd-document h2,
.rmd-document h3,
.rmd-document h4,
.rmd-document h5,
.rmd-document h6 {
  color: #f0f6ff;
  font-weight: 700;
}

.rmd-document h1 {
  border-bottom-color: var(--rmd-color-line-strong);
  background: linear-gradient(90deg, #f0f6ff 0%, #5cf2d6 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
}

.rmd-document a {
  color: var(--rmd-color-primary);
  text-decoration-color: rgb(92 242 214 / 0.35);
}

.rmd-document a:hover {
  color: var(--rmd-color-primary-strong);
}

.rmd-document strong {
  color: #ffffff;
}

.rmd-document code {
  background: rgb(92 242 214 / 0.1);
  border: 1px solid rgb(92 242 214 / 0.2);
  color: var(--rmd-color-primary);
}

.rmd-document blockquote {
  border-left-color: var(--rmd-color-primary);
  background: rgb(92 242 214 / 0.04);
  color: var(--rmd-color-muted);
}

.rmd-document hr {
  background: linear-gradient(90deg, transparent, var(--rmd-color-line-strong), transparent);
}

/* Card-like blocks: replace the cream surfaces with dark surfaces */
.rmd-grid-cell,
.rmd-card,
.rmd-callout,
.rmd-export,
.rmd-slider,
.rmd-diff,
.rmd-flow,
.rmd-tabs {
  background: var(--rmd-color-surface);
  border-color: var(--rmd-color-line);
  box-shadow: var(--rmd-shadow-sm);
}

.rmd-card {
  border-color: rgb(92 242 214 / 0.22);
  background:
    linear-gradient(180deg, rgb(28 35 54 / 0.92), rgb(19 24 38 / 0.96));
  box-shadow:
    0 0 0 1px rgb(92 242 214 / 0.04) inset,
    var(--rmd-shadow-sm);
}

.rmd-card::before {
  background: linear-gradient(90deg, var(--rmd-color-primary), var(--rmd-color-accent));
  box-shadow: 0 0 16px rgb(92 242 214 / 0.35);
}

.rmd-callout {
  border-left-width: 3px;
}

.rmd-callout-title,
.rmd-card-title,
.rmd-block-title {
  color: #f0f6ff;
}

.rmd-callout-tip,
.rmd-callout-success { color: var(--rmd-color-success); border-color: rgb(110 231 183 / 0.35); }
.rmd-callout-warning { color: var(--rmd-color-warning); border-color: rgb(252 211 77 / 0.35); }
.rmd-callout-danger  { color: var(--rmd-color-danger);  border-color: rgb(248 113 113 / 0.35); }
.rmd-callout-info    { color: var(--rmd-color-info);    border-color: rgb(96 165 250 / 0.35); }

.rmd-card-body,
.rmd-callout-body { color: var(--rmd-color-fg); }

/* Chart \u2014 flat fills, neon outlines, dark surface */
.rmd-chart {
  background: linear-gradient(180deg, var(--rmd-color-surface) 0%, var(--rmd-color-surface-strong) 100%);
  border: 1px solid var(--rmd-color-line);
  box-shadow: 0 0 0 1px rgb(92 242 214 / 0.05) inset;
}

.rmd-chart rect {
  fill: var(--rmd-color-primary);
  filter: drop-shadow(0 0 12px rgb(92 242 214 / 0.4));
}

.rmd-chart-point:nth-of-type(2n) rect {
  fill: var(--rmd-color-accent);
  filter: drop-shadow(0 0 12px rgb(192 132 252 / 0.4));
}

.rmd-chart-point:hover rect {
  fill: var(--rmd-color-primary-strong);
}

.rmd-chart text {
  fill: var(--rmd-color-muted);
}

/* Slider \u2014 neon track */
.rmd-slider label { color: var(--rmd-color-fg); }

.rmd-slider output {
  background: rgb(92 242 214 / 0.12);
  border: 1px solid rgb(92 242 214 / 0.35);
  color: var(--rmd-color-primary);
}

.rmd-slider input[type="range"] {
  accent-color: var(--rmd-color-primary);
}

/* Buttons \u2014 glowing primary, ghost secondary */
.rmd-export button,
.rmd-tabs [role="tab"] {
  background: var(--rmd-color-surface-strong);
  border-color: var(--rmd-color-line-strong);
  color: var(--rmd-color-fg);
}

.rmd-export button:hover,
.rmd-tabs [role="tab"]:hover {
  border-color: var(--rmd-color-primary);
  color: var(--rmd-color-primary);
}

.rmd-export button {
  background: linear-gradient(135deg, var(--rmd-color-primary) 0%, var(--rmd-color-primary-strong) 100%);
  border-color: transparent;
  color: #07090e;
  box-shadow: 0 0 24px rgb(92 242 214 / 0.4);
}

.rmd-export button:hover {
  background: linear-gradient(135deg, #7df5e0 0%, #45e3c8 100%);
  color: #07090e;
}

.rmd-tabs [role="tab"][aria-selected="true"] {
  background: rgb(92 242 214 / 0.12);
  border-color: var(--rmd-color-primary);
  color: var(--rmd-color-primary);
}

/* Code & pre \u2014 slightly lighter surface than the default's near-black */
.rmd-code,
.rmd-export pre,
.rmd-diff pre {
  background: #060810;
  border-color: var(--rmd-color-line-strong);
  color: #d8e3f0;
}

/* Flow \u2014 nodes glow */
.rmd-flow li {
  background: rgb(92 242 214 / 0.05);
  border-color: rgb(92 242 214 / 0.25);
  color: var(--rmd-color-fg);
}

.rmd-flow li span:nth-child(2) {
  color: var(--rmd-color-accent);
}

/* Diff \u2014 terminal-style */
.rmd-diff-add code    { color: var(--rmd-color-success); }
.rmd-diff-remove code { color: var(--rmd-color-danger); }

.rmd-diff-line mark {
  background: rgb(192 132 252 / 0.2);
  color: var(--rmd-color-accent);
}

/* Timeline \u2014 cyan rail, glowing dots */
.rmd-timeline-vertical ol::before,
.rmd-timeline-horizontal ol::before {
  background: linear-gradient(var(--rmd-color-line) 0%, var(--rmd-color-primary) 50%, var(--rmd-color-line) 100%);
}

.rmd-timeline-vertical .rmd-timeline-item::before,
.rmd-timeline-horizontal .rmd-timeline-item::before {
  background: var(--rmd-color-bg);
  border-color: var(--rmd-color-primary);
  box-shadow: 0 0 8px rgb(92 242 214 / 0.6);
}

.rmd-timeline-time {
  color: var(--rmd-color-primary);
}

.rmd-timeline-content h4 {
  color: #f0f6ff;
}

/* Kanban \u2014 dark columns, neon column dots */
.rmd-kanban-column {
  background: var(--rmd-color-surface-strong);
  border-color: var(--rmd-color-line-strong);
}

.rmd-kanban-column h3 {
  color: var(--rmd-color-fg);
}

.rmd-kanban-cards > :not(ul):not(ol),
.rmd-kanban-cards li {
  background: var(--rmd-color-surface);
  border-color: var(--rmd-color-line);
  color: var(--rmd-color-fg);
  box-shadow: none;
}

.rmd-kanban-cards > :not(ul):not(ol):hover,
.rmd-kanban-cards li:hover {
  border-color: var(--rmd-color-primary);
  box-shadow: 0 0 12px rgb(92 242 214 / 0.2);
}

/* Details \u2014 collapsed dark card */
.rmd-details {
  background: rgb(255 255 255 / 0.02);
  border-color: var(--rmd-color-line);
}

.rmd-details[open] {
  background: var(--rmd-color-surface);
}

.rmd-details summary::before {
  border-left-color: var(--rmd-color-primary);
}

.rmd-details[open] .rmd-details-body {
  border-top-color: var(--rmd-color-line-strong);
}

/* Carousel & embed */
.rmd-carousel {
  background: var(--rmd-color-surface);
  border-color: var(--rmd-color-line);
}

.rmd-carousel-control {
  background: rgb(11 18 25 / 0.9);
  border-color: rgb(92 242 214 / 0.24);
  color: var(--rmd-color-fg);
}

.rmd-carousel-dot {
  background: rgb(223 245 239 / 0.32);
}

.rmd-embed {
  background: #000;
  box-shadow: 0 0 30px rgb(0 0 0 / 0.6);
}

/* Math \u2014 terminal-style equations */
.rmd-math {
  background: rgb(92 242 214 / 0.05);
  border-color: rgb(92 242 214 / 0.2);
  color: var(--rmd-color-fg);
}
`.trim();var uo=`
/* ========================================================================= */
/* THEME: paper \u2014 overrides applied on top of the default layout             */
/* ========================================================================= */

:root {
  --rmd-color-page: #f5f0e3;
  --rmd-color-bg: #fbf6e8;
  --rmd-color-surface: #fefaee;
  --rmd-color-surface-strong: #f1ebda;
  --rmd-color-fg: #1d1a14;
  --rmd-color-muted: #6e6555;
  --rmd-color-subtle: #998d77;
  --rmd-color-line: #d8d0bd;
  --rmd-color-line-strong: #b3a98f;
  --rmd-color-primary: #2c3e50;
  --rmd-color-primary-strong: #1a2530;
  --rmd-color-accent: #8b3a2f;
  --rmd-color-success: #4a6b3a;
  --rmd-color-warning: #8b6914;
  --rmd-color-danger: #8b3a2f;
  --rmd-color-info: #2c3e50;
  --rmd-font-body: "Source Serif Pro", "Iowan Old Style", "Palatino Linotype", Palatino, Charter, "STSong", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", serif;
  --rmd-font-ui: "Source Serif Pro", "Iowan Old Style", Georgia, "STSong", "Songti SC", "PingFang SC", serif;
  --rmd-font-mono: "Source Code Pro", "Courier Prime", "Liberation Mono", Menlo, Consolas, monospace;
  --rmd-radius-sm: 2px;
  --rmd-radius-md: 3px;
  --rmd-radius-lg: 3px;
  --rmd-spacing-sm: 8px;
  --rmd-spacing-md: 16px;
  --rmd-spacing-lg: 28px;
  --rmd-shadow-sm: none;
  --rmd-shadow-md: none;
  --rmd-focus-ring: 0 0 0 2px rgb(44 62 80 / 0.4);
}

/* Flat, paper-textured background \u2014 no gradients, no glow */
body[data-rmd-theme] {
  background:
    linear-gradient(180deg, #f5f0e3 0%, #f5f0e3 100%);
  color: var(--rmd-color-fg);
}

.rmd-document {
  max-width: 760px;
  padding: clamp(40px, 6vw, 80px) clamp(24px, 5vw, 64px);
  font-size: 18px;
  line-height: 1.85;
  letter-spacing: 0.005em;
  color: var(--rmd-color-fg);
}

/* Headings \u2014 restrained, all serif, no bold gradient tricks */
.rmd-document h1,
.rmd-document h2,
.rmd-document h3,
.rmd-document h4,
.rmd-document h5,
.rmd-document h6 {
  color: var(--rmd-color-fg);
  font-family: var(--rmd-font-ui);
  font-weight: 700;
  font-style: normal;
  letter-spacing: -0.005em;
  line-height: 1.25;
}

.rmd-document h1 {
  margin-top: 0;
  margin-bottom: 1.2em;
  padding-bottom: 18px;
  border-bottom: 2px solid var(--rmd-color-fg);
  font-size: 38px;
  font-weight: 800;
  text-align: left;
}

.rmd-document h2 {
  margin-top: 2.6em;
  font-size: 26px;
  font-weight: 700;
}

.rmd-document h3 {
  margin-top: 2em;
  font-size: 21px;
  font-weight: 600;
  font-style: italic;
}

/* Body paragraphs \u2014 first-line indent, justified */
.rmd-document p {
  text-align: justify;
  hyphens: auto;
}

.rmd-document p + p {
  margin-top: 0;
  text-indent: 1.6em;
}

.rmd-document a {
  color: var(--rmd-color-primary);
  text-decoration-color: var(--rmd-color-line-strong);
  text-decoration-thickness: 1px;
  text-underline-offset: 3px;
}

.rmd-document a:hover {
  color: var(--rmd-color-accent);
}

.rmd-document strong {
  color: var(--rmd-color-fg);
  font-weight: 700;
}

.rmd-document code {
  background: var(--rmd-color-surface-strong);
  border: 1px solid var(--rmd-color-line);
  color: var(--rmd-color-accent);
  font-size: 0.92em;
  padding: 1px 5px;
}

.rmd-document blockquote {
  margin-left: 1.5em;
  margin-right: 1.5em;
  padding: 0 1em;
  border-left: 3px solid var(--rmd-color-line-strong);
  background: transparent;
  color: var(--rmd-color-muted);
  font-style: italic;
  font-size: 17px;
}

.rmd-document hr {
  height: 1px;
  background: var(--rmd-color-line-strong);
  margin: 2.4em auto;
  width: 60%;
}

/* Card-like blocks \u2014 flat, single thin border, no shadow */
.rmd-grid-cell,
.rmd-card,
.rmd-callout,
.rmd-export,
.rmd-slider,
.rmd-diff,
.rmd-flow,
.rmd-tabs {
  background: var(--rmd-color-surface);
  border: 1px solid var(--rmd-color-line);
  box-shadow: none;
}

.rmd-card {
  border-color: var(--rmd-color-line-strong);
  background:
    linear-gradient(180deg, rgb(254 250 238 / 0.98), rgb(247 240 222 / 0.92));
  border-radius: var(--rmd-radius-md);
}

.rmd-card::before {
  display: none;
}

.rmd-callout {
  border-left-width: 3px;
  background: var(--rmd-color-surface-strong);
}

.rmd-callout::before {
  width: 3px;
}

.rmd-callout-tip,
.rmd-callout-success { color: var(--rmd-color-success); border-color: var(--rmd-color-success); }
.rmd-callout-warning { color: var(--rmd-color-warning); border-color: var(--rmd-color-warning); }
.rmd-callout-danger  { color: var(--rmd-color-danger);  border-color: var(--rmd-color-danger); }
.rmd-callout-info    { color: var(--rmd-color-info);    border-color: var(--rmd-color-info); }

.rmd-callout-title,
.rmd-card-title,
.rmd-block-title {
  color: var(--rmd-color-fg);
  font-family: var(--rmd-font-ui);
  font-weight: 700;
  font-size: 16px;
  letter-spacing: 0;
}

.rmd-card-body,
.rmd-callout-body { color: var(--rmd-color-fg); }

/* Chart \u2014 flat, scholarly, no shadow drop */
.rmd-chart {
  background: var(--rmd-color-surface);
  border: 1px solid var(--rmd-color-line-strong);
  box-shadow: none;
}

.rmd-chart rect {
  fill: var(--rmd-color-primary);
  filter: none;
}

.rmd-chart-point:nth-of-type(2n) rect {
  fill: var(--rmd-color-accent);
}

.rmd-chart-point:hover rect {
  fill: var(--rmd-color-primary-strong);
  transform: none;
}

.rmd-chart text {
  fill: var(--rmd-color-muted);
  font-family: var(--rmd-font-ui);
}

/* Slider \u2014 restrained */
.rmd-slider label { color: var(--rmd-color-fg); font-family: var(--rmd-font-ui); }

.rmd-slider output {
  background: var(--rmd-color-surface-strong);
  border: 1px solid var(--rmd-color-line-strong);
  border-radius: 2px;
  color: var(--rmd-color-fg);
  font-family: var(--rmd-font-mono);
}

.rmd-slider input[type="range"] {
  accent-color: var(--rmd-color-primary);
}

/* Buttons \u2014 book-cover style */
.rmd-export button,
.rmd-tabs [role="tab"] {
  background: var(--rmd-color-surface);
  border: 1px solid var(--rmd-color-line-strong);
  color: var(--rmd-color-primary);
  font-family: var(--rmd-font-ui);
  font-weight: 600;
  border-radius: 2px;
  letter-spacing: 0.02em;
}

.rmd-export button:hover,
.rmd-tabs [role="tab"]:hover {
  background: var(--rmd-color-surface-strong);
  border-color: var(--rmd-color-primary);
  color: var(--rmd-color-primary-strong);
  transform: none;
}

.rmd-export button {
  background: var(--rmd-color-primary);
  border-color: var(--rmd-color-primary);
  color: var(--rmd-color-page);
}

.rmd-export button:hover {
  background: var(--rmd-color-primary-strong);
  color: var(--rmd-color-page);
}

.rmd-tabs [role="tab"][aria-selected="true"] {
  background: var(--rmd-color-fg);
  border-color: var(--rmd-color-fg);
  color: var(--rmd-color-page);
}

/* Code & pre */
.rmd-code,
.rmd-export pre,
.rmd-diff pre {
  background: #2a2620;
  border-color: #2a2620;
  color: #f0e8d8;
  border-radius: 2px;
}

/* Flow \u2014 structured, no glow */
.rmd-flow li {
  background: var(--rmd-color-surface-strong);
  border: 1px solid var(--rmd-color-line);
  color: var(--rmd-color-fg);
  border-radius: 2px;
}

.rmd-flow li span:nth-child(2) {
  color: var(--rmd-color-accent);
}

/* Diff */
.rmd-diff-add code    { color: #6ee7b7; }
.rmd-diff-remove code { color: #fca5a5; }

.rmd-diff-line mark {
  background: var(--rmd-color-warning);
  color: #fff;
  border-radius: 2px;
}

/* Timeline \u2014 paper-style ticks */
.rmd-timeline-vertical ol::before,
.rmd-timeline-horizontal ol::before {
  background: var(--rmd-color-line-strong);
}

.rmd-timeline-vertical .rmd-timeline-item::before,
.rmd-timeline-horizontal .rmd-timeline-item::before {
  background: var(--rmd-color-bg);
  border-color: var(--rmd-color-fg);
  box-shadow: none;
}

.rmd-timeline-time {
  color: var(--rmd-color-muted);
  font-family: var(--rmd-font-ui);
  font-style: italic;
}

.rmd-timeline-content h4 {
  color: var(--rmd-color-fg);
}

/* Kanban \u2014 index card columns */
.rmd-kanban-column {
  background: var(--rmd-color-surface-strong);
  border: 1px solid var(--rmd-color-line);
  border-radius: 2px;
}

.rmd-kanban-column h3 {
  color: var(--rmd-color-fg);
  font-family: var(--rmd-font-ui);
}

.rmd-kanban-cards > :not(ul):not(ol),
.rmd-kanban-cards li {
  background: var(--rmd-color-surface);
  border: 1px solid var(--rmd-color-line);
  color: var(--rmd-color-fg);
  box-shadow: none;
  border-radius: 2px;
}

.rmd-kanban-cards > :not(ul):not(ol):hover,
.rmd-kanban-cards li:hover {
  background: var(--rmd-color-surface-strong);
  border-color: var(--rmd-color-line-strong);
  transform: none;
  box-shadow: none;
}

/* Details \u2014 typeset accordion */
.rmd-details {
  background: var(--rmd-color-surface);
  border-color: var(--rmd-color-line);
  border-radius: 2px;
}

.rmd-details[open] {
  background: var(--rmd-color-surface);
  box-shadow: none;
}

.rmd-details summary {
  font-family: var(--rmd-font-ui);
  font-weight: 600;
}

.rmd-details summary::before {
  border-left-color: var(--rmd-color-fg);
}

/* Carousel & embed \u2014 flat */
.rmd-carousel {
  background: var(--rmd-color-surface);
  border-color: var(--rmd-color-line);
  box-shadow: none;
  border-radius: 2px;
}

.rmd-embed {
  background: var(--rmd-color-surface-strong);
  box-shadow: none;
  border-radius: 2px;
}

/* Math \u2014 display equation */
.rmd-math {
  background: var(--rmd-color-surface);
  border: 1px solid var(--rmd-color-line);
  color: var(--rmd-color-fg);
  border-radius: 2px;
}
`.trim();var oo=`
/* ========================================================================= */
/* THEME: notion-like \u2014 overrides applied on top of the default layout       */
/* ========================================================================= */

:root {
  --rmd-color-page: #ffffff;
  --rmd-color-bg: #ffffff;
  --rmd-color-surface: #ffffff;
  --rmd-color-surface-strong: #f7f6f3;
  --rmd-color-fg: #37352f;
  --rmd-color-muted: #787774;
  --rmd-color-subtle: #9b9a97;
  --rmd-color-line: #ecebe9;
  --rmd-color-line-strong: #d3d1cb;
  --rmd-color-primary: #2383e2;
  --rmd-color-primary-strong: #1a6dc0;
  --rmd-color-accent: #eb5757;
  --rmd-color-success: #0f7b6c;
  --rmd-color-warning: #cb912f;
  --rmd-color-danger: #e03e3e;
  --rmd-color-info: #2383e2;
  --rmd-font-body: -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Apple Color Emoji", "Segoe UI Emoji", sans-serif;
  --rmd-font-ui: -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", "PingFang SC", sans-serif;
  --rmd-font-mono: "SFMono-Regular", "Menlo", "Consolas", "PT Mono", "Liberation Mono", monospace;
  --rmd-radius-sm: 4px;
  --rmd-radius-md: 6px;
  --rmd-radius-lg: 10px;
  --rmd-spacing-sm: 8px;
  --rmd-spacing-md: 14px;
  --rmd-spacing-lg: 24px;
  --rmd-shadow-sm: 0 1px 2px rgb(15 15 15 / 0.04);
  --rmd-shadow-md: 0 4px 12px rgb(15 15 15 / 0.06);
  --rmd-focus-ring: 0 0 0 2px rgb(35 131 226 / 0.45);
}

/* Pure white, no gradient, no decorative tint */
body[data-rmd-theme] {
  background: #ffffff;
  color: var(--rmd-color-fg);
}

.rmd-document {
  max-width: 720px;
  padding: clamp(40px, 8vw, 96px) clamp(20px, 5vw, 48px) clamp(40px, 6vw, 64px);
  font-size: 16px;
  line-height: 1.6;
  letter-spacing: -0.003em;
  color: var(--rmd-color-fg);
}

/* Headings \u2014 system font, tighter, no underline on H1 */
.rmd-document h1,
.rmd-document h2,
.rmd-document h3,
.rmd-document h4,
.rmd-document h5,
.rmd-document h6 {
  color: var(--rmd-color-fg);
  font-family: var(--rmd-font-ui);
  font-weight: 700;
  letter-spacing: -0.012em;
  line-height: 1.2;
}

.rmd-document h1 {
  margin-top: 0;
  margin-bottom: 0.6em;
  padding-bottom: 0;
  border-bottom: 0;
  font-size: 40px;
  font-weight: 800;
}

.rmd-document h2 {
  margin-top: 1.8em;
  font-size: 24px;
  font-weight: 700;
}

.rmd-document h3 {
  margin-top: 1.4em;
  font-size: 18px;
  font-weight: 600;
}

.rmd-document a {
  color: var(--rmd-color-fg);
  text-decoration: underline;
  text-decoration-color: var(--rmd-color-line-strong);
  text-decoration-thickness: 1px;
  text-underline-offset: 2px;
}

.rmd-document a:hover {
  color: var(--rmd-color-fg);
  text-decoration-color: var(--rmd-color-fg);
}

.rmd-document strong {
  color: var(--rmd-color-fg);
  font-weight: 700;
}

/* Notion-style inline code \u2014 pink-tinged on neutral pill */
.rmd-document code {
  background: #f1f1ef;
  border: 0;
  color: #eb5757;
  font-size: 0.86em;
  padding: 2px 6px;
  border-radius: 4px;
}

/* Notion-style block quote \u2014 accent left border, neutral text */
.rmd-document blockquote {
  margin-left: 0;
  margin-right: 0;
  padding: 4px 0 4px 18px;
  border-left: 3px solid var(--rmd-color-fg);
  background: transparent;
  color: var(--rmd-color-fg);
  font-style: normal;
  font-size: 16px;
}

.rmd-document hr {
  height: 1px;
  background: var(--rmd-color-line);
  margin: 2em 0;
}

/* Card-like blocks \u2014 flat, soft border, very subtle shadow on hover */
.rmd-grid-cell,
.rmd-card,
.rmd-callout,
.rmd-export,
.rmd-slider,
.rmd-diff,
.rmd-flow,
.rmd-tabs {
  background: var(--rmd-color-surface);
  border: 1px solid var(--rmd-color-line);
  border-radius: var(--rmd-radius-md);
  box-shadow: none;
}

.rmd-grid-cell {
  background: var(--rmd-color-surface-strong);
}

.rmd-card {
  background: var(--rmd-color-surface);
  border-color: var(--rmd-color-line);
  border-radius: var(--rmd-radius-md);
  box-shadow: none;
}

.rmd-card::before {
  display: none;
}

/* Notion-style callout: gray bg, color icon stripe via left border */
.rmd-callout {
  background: var(--rmd-color-surface-strong);
  border: 1px solid var(--rmd-color-line);
  border-left-width: 3px;
  border-radius: var(--rmd-radius-md);
}

.rmd-callout::before {
  width: 3px;
}

.rmd-callout-tip,
.rmd-callout-success { color: var(--rmd-color-success); border-left-color: var(--rmd-color-success); }
.rmd-callout-warning { color: var(--rmd-color-warning); border-left-color: var(--rmd-color-warning); }
.rmd-callout-danger  { color: var(--rmd-color-danger);  border-left-color: var(--rmd-color-danger); }
.rmd-callout-info    { color: var(--rmd-color-info);    border-left-color: var(--rmd-color-info); }

.rmd-callout-title,
.rmd-card-title,
.rmd-block-title {
  color: var(--rmd-color-fg);
  font-family: var(--rmd-font-ui);
  font-weight: 600;
  font-size: 15px;
  letter-spacing: -0.005em;
}

.rmd-card-body,
.rmd-callout-body { color: var(--rmd-color-fg); }

/* Chart \u2014 flat fills, soft rounded bars feeling */
.rmd-chart {
  background: var(--rmd-color-surface);
  border: 1px solid var(--rmd-color-line);
  border-radius: var(--rmd-radius-md);
  box-shadow: none;
}

.rmd-chart rect {
  fill: var(--rmd-color-primary);
  filter: none;
  rx: 3;
  ry: 3;
}

.rmd-chart-point:nth-of-type(2n) rect {
  fill: var(--rmd-color-accent);
}

.rmd-chart-point:hover rect {
  fill: var(--rmd-color-primary-strong);
  transform: none;
}

.rmd-chart text {
  fill: var(--rmd-color-muted);
  font-family: var(--rmd-font-ui);
  font-size: 12px;
}

/* Slider \u2014 minimal */
.rmd-slider label { color: var(--rmd-color-fg); font-family: var(--rmd-font-ui); }

.rmd-slider output {
  background: var(--rmd-color-surface-strong);
  border: 1px solid var(--rmd-color-line);
  color: var(--rmd-color-fg);
  font-family: var(--rmd-font-mono);
  border-radius: 4px;
}

.rmd-slider input[type="range"] {
  accent-color: var(--rmd-color-primary);
}

/* Buttons \u2014 pill style for tabs, blue primary for export */
.rmd-export button,
.rmd-tabs [role="tab"] {
  background: var(--rmd-color-surface);
  border: 1px solid var(--rmd-color-line);
  border-radius: 999px;
  padding: 6px 14px;
  color: var(--rmd-color-fg);
  font-family: var(--rmd-font-ui);
  font-weight: 500;
  font-size: 13px;
}

.rmd-export button:hover,
.rmd-tabs [role="tab"]:hover {
  background: var(--rmd-color-surface-strong);
  border-color: var(--rmd-color-line-strong);
  color: var(--rmd-color-fg);
  transform: none;
}

.rmd-export button {
  background: var(--rmd-color-primary);
  border-color: var(--rmd-color-primary);
  color: #ffffff;
  border-radius: 6px;
}

.rmd-export button:hover {
  background: var(--rmd-color-primary-strong);
  border-color: var(--rmd-color-primary-strong);
  color: #ffffff;
}

.rmd-tabs [role="tab"][aria-selected="true"] {
  background: var(--rmd-color-fg);
  border-color: var(--rmd-color-fg);
  color: var(--rmd-color-page);
}

/* Code & pre \u2014 Notion uses monochrome dark on near-white */
.rmd-code,
.rmd-export pre,
.rmd-diff pre {
  background: #f7f6f3;
  border: 1px solid var(--rmd-color-line);
  color: #37352f;
  border-radius: var(--rmd-radius-sm);
}

.rmd-export pre,
.rmd-diff pre {
  background: #2f2f2f;
  color: #e8e8e8;
  border-color: #2f2f2f;
}

.rmd-code code,
.rmd-export pre code,
.rmd-diff code {
  color: inherit;
}

/* Flow \u2014 soft chips */
.rmd-flow li {
  background: var(--rmd-color-surface-strong);
  border: 1px solid var(--rmd-color-line);
  color: var(--rmd-color-fg);
  border-radius: var(--rmd-radius-md);
}

.rmd-flow li span:nth-child(2) {
  color: var(--rmd-color-primary);
  font-weight: 700;
}

/* Diff */
.rmd-diff-add code    { color: #6dd9ad; }
.rmd-diff-remove code { color: #ff8b80; }

.rmd-diff-line mark {
  background: var(--rmd-color-warning);
  color: #fff;
  border-radius: 999px;
}

/* Timeline \u2014 Notion style: small dot, neutral rail */
.rmd-timeline-vertical ol::before,
.rmd-timeline-horizontal ol::before {
  background: var(--rmd-color-line);
}

.rmd-timeline-vertical .rmd-timeline-item::before,
.rmd-timeline-horizontal .rmd-timeline-item::before {
  background: var(--rmd-color-page);
  border-color: var(--rmd-color-line-strong);
  box-shadow: none;
}

.rmd-timeline-time {
  color: var(--rmd-color-muted);
  font-family: var(--rmd-font-ui);
}

.rmd-timeline-content h4 {
  color: var(--rmd-color-fg);
  font-family: var(--rmd-font-ui);
}

/* Kanban \u2014 soft column tint, card with hover lift */
.rmd-kanban-column {
  background: var(--rmd-color-surface-strong);
  border: 1px solid var(--rmd-color-line);
  border-radius: var(--rmd-radius-md);
}

.rmd-kanban-column h3 {
  color: var(--rmd-color-fg);
  font-family: var(--rmd-font-ui);
  font-weight: 600;
}

.rmd-kanban-cards > :not(ul):not(ol),
.rmd-kanban-cards li {
  background: var(--rmd-color-surface);
  border: 1px solid var(--rmd-color-line);
  color: var(--rmd-color-fg);
  border-radius: var(--rmd-radius-sm);
  box-shadow: none;
}

.rmd-kanban-cards > :not(ul):not(ol):hover,
.rmd-kanban-cards li:hover {
  border-color: var(--rmd-color-line-strong);
  box-shadow: var(--rmd-shadow-sm);
  transform: none;
}

/* Details \u2014 Notion toggle */
.rmd-details {
  background: var(--rmd-color-surface);
  border: 1px solid var(--rmd-color-line);
  border-radius: var(--rmd-radius-md);
}

.rmd-details[open] {
  background: var(--rmd-color-surface);
  box-shadow: none;
}

.rmd-details summary {
  font-family: var(--rmd-font-ui);
  font-weight: 600;
}

.rmd-details summary::before {
  border-left-color: var(--rmd-color-muted);
}

.rmd-details[open] .rmd-details-body {
  border-top-color: var(--rmd-color-line);
}

/* Carousel & embed \u2014 soft cards */
.rmd-carousel {
  background: var(--rmd-color-surface);
  border: 1px solid var(--rmd-color-line);
  border-radius: var(--rmd-radius-md);
  box-shadow: none;
}

.rmd-embed {
  background: var(--rmd-color-surface-strong);
  border-radius: var(--rmd-radius-md);
  box-shadow: none;
}

/* Math \u2014 soft display */
.rmd-math {
  background: var(--rmd-color-surface-strong);
  border: 1px solid var(--rmd-color-line);
  color: var(--rmd-color-fg);
  border-radius: var(--rmd-radius-md);
}
`.trim();var ye={default:ke,"tech-dark":`${ke}

${to}`,paper:`${ke}

${uo}`,"notion-like":`${ke}

${oo}`};function no(e,r={}){let t=r.mode??"self-contained",u=X(e),o=r.theme??u.frontmatter.theme??"default",n=r.version??"0.1.0";if(t==="self-contained"||t==="inline")return t0(e,u,{theme:o});if(t==="cdn")return u0(e,{theme:o,version:n,cdnBase:r.cdnBase});if(t==="split")return o0(e,{theme:o,scriptPath:r.scriptPath,themePath:r.themePath});throw new TypeError(`Unknown build mode: ${t}`)}function t0(e,r,{theme:t}){let u=gt(r,{theme:t}),o=ye[t]??ye.default,n=`<script type="application/rmd">${_t(e)}<\/script>`,a=`<script data-rmd-runtime-inline>
${ro}
<\/script>`;return u.replace("</head>",`<style data-rmd-theme-inline="${Le(t)}">
${o}
</style>
</head>`).replace("</body>",`${n}
${a}
</body>`)}function u0(e,{theme:r,version:t,cdnBase:u}){n0(t);let n=`${u??"https://cdnjs.cloudflare.com/ajax/libs/rmd-renderer"}/${t}`;return["<!doctype html>","<html>","<head>",'<meta charset="utf-8">','<meta name="viewport" content="width=device-width, initial-scale=1">',`<script src="${Le(`${n}/rmd.min.js`)}"><\/script>`,`<link rel="stylesheet" href="${Le(`${n}/themes/${r}.css`)}">`,"</head>","<body>",'<div id="rmd-root"></div>',`<script type="application/rmd">${_t(e)}<\/script>`,`<script>RMD.render({source:document.querySelector('script[type="application/rmd"]').textContent,target:document.getElementById('rmd-root'),theme:${JSON.stringify(r)}});<\/script>`,"</body>","</html>"].join(`
`)}function o0(e,{theme:r,scriptPath:t="./rmd.min.js",themePath:u}){let o=u??`./themes/${r}.css`;return["<!doctype html>","<html>","<head>",'<meta charset="utf-8">','<meta name="viewport" content="width=device-width, initial-scale=1">',`<script src="${Le(t)}"><\/script>`,`<link rel="stylesheet" href="${Le(o)}">`,"</head>","<body>",'<div id="rmd-root"></div>',`<script type="application/rmd">${_t(e)}<\/script>`,`<script>RMD.render({source:document.querySelector('script[type="application/rmd"]').textContent,target:document.getElementById('rmd-root'),theme:${JSON.stringify(r)}});<\/script>`,"</body>","</html>"].join(`
`)}function n0(e){if(!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(e))throw new TypeError("CDN build requires a pinned semver version")}function _t(e){return String(e).replaceAll("<\/script","<\\/script")}function Le(e){return String(e).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;")}var tr=require("@codemirror/state"),Z=require("@codemirror/view");function ao(e){return String(e).replaceAll(":root",":host").replaceAll("body[data-rmd-theme]::before",":host::before").replaceAll("body[data-rmd-theme]",":host")}var At="rmd-render",wt=!1;function a0(){if(wt||typeof customElements>"u"||customElements.get(At)){wt=!0;return}customElements.define(At,class extends HTMLElement{}),wt=!0}function ae(e,r){a0();let t=document.createElement(At);return t.classList.add("rmd-render-host"),t.attachShadow({mode:"open"}),Et(t,e,r),t}function Et(e,r,t){let u=e.shadowRoot??e.attachShadow({mode:"open"});try{let o=X(r),n=Me(o),a=o.frontmatter,i=a.theme&&a.theme!=="auto"?String(a.theme):t.themeId;u.innerHTML=[`<style>${ao(t.themeCss)}</style>`,`<main class="rmd-document" data-rmd-theme="${io(i)}" data-rmd-version="${io(o.version)}">`,n,"</main>"].join(`
`),i0(u,t.resolveResourceUrl),rr(u),e.removeAttribute("data-rmd-error")}catch(o){e.setAttribute("data-rmd-error","true"),u.innerHTML=[`<style>${c0}</style>`,`<pre class="rmd-preview-error">${co(o instanceof Error?o.message:String(o))}</pre>`].join(`
`)}}function i0(e,r){if(r)for(let t of Array.from(e.querySelectorAll("img[src]"))){let u=t.getAttribute("src");if(!u)continue;let o=r(u);o&&t.setAttribute("src",o)}}var c0=`
.rmd-preview-error {
  margin: 0;
  border: 1px solid #b63f35;
  border-radius: 8px;
  padding: 12px;
  color: #b63f35;
  background: #fff5f3;
  white-space: pre-wrap;
}
`.trim();function co(e){return String(e).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;")}function io(e){return co(e).replaceAll("'","&#39;")}function so(e,r=-1){let t=String(e).split(`
`),u=[],o=0;for(let a of t)u.push(o),o+=a.length+1;let n=[];for(let a=0;a<t.length;a+=1){let i=t[a];if(/^```\s*(?:rmd|rich-markdown)\s*$/i.test(i)){let l=-1;for(let g=a+1;g<t.length;g+=1)if(/^```\s*$/.test(t[g])){l=g;break}if(l===-1)continue;let p=u[a],m=u[l]+t[l].length,f=u[a+1],h=u[l]-1;n.push({from:p,to:m,source:e.slice(f,h),cursorInside:r>=p&&r<=m}),a=l;continue}if(!/^:::\s*[a-z][a-z0-9-]*(?:\s+.*)?$/i.test(i))continue;let c=-1;for(let l=a+1;l<t.length;l+=1)if(/^:::\s*$/.test(t[l])){c=l;break}if(c===-1)continue;let s=u[a],d=u[c]+t[c].length;n.push({from:s,to:d,source:e.slice(s,d),cursorInside:r>=s&&r<=d}),a=c}return n}function Ft(e){let r=String(e),t=r.split(`
`),u=s0(t),o=[];for(let n=0;n<t.length;n+=1){let a=t[n],i=a.trim();if(n===0&&i==="---"){let l=Ct(t,1,/^---\s*$/);if(l!==-1){n=l;continue}}if(!i)continue;let c=a.match(/^:::\s*([a-z][a-z0-9-]*)(?:\s+(.*))?\s*$/i);if(c){let l=Ct(t,n+1,/^:::\s*$/);if(l!==-1){o.push({kind:"block",blockType:c[1].toLowerCase(),from:u[n],to:u[l]+t[l].length,source:r.slice(u[n],u[l]+t[l].length)}),n=l;continue}}if(/^```/.test(a)){let l=Ct(t,n+1,/^```\s*$/);if(l!==-1){o.push({kind:"code",from:u[n],to:u[l]+t[l].length,source:r.slice(u[n],u[l]+t[l].length)}),n=l;continue}}let s=a.match(/^(#{1,6})\s+(.+)$/);if(s){o.push({kind:"heading",level:s[1].length,from:u[n],to:u[n]+a.length,source:a,text:lo(s[2])});continue}if(/^(?:---|\*\*\*|___)\s*$/.test(i)){o.push({kind:"thematic-break",from:u[n],to:u[n]+a.length,source:a});continue}if(/^(?:[-*+]\s+|\d+[.)]\s+)/.test(a)){let l=Dt(t,n,p=>!p.trim()||St(p));o.push({kind:"list",from:u[n],to:u[l]+t[l].length,source:r.slice(u[n],u[l]+t[l].length)}),n=l;continue}if(/^>\s?/.test(a)){let l=Dt(t,n,p=>!p.trim()||St(p));o.push({kind:"blockquote",from:u[n],to:u[l]+t[l].length,source:r.slice(u[n],u[l]+t[l].length)}),n=l;continue}let d=Dt(t,n,l=>!l.trim()||St(l));o.push({kind:"paragraph",from:u[n],to:u[d]+t[d].length,source:r.slice(u[n],u[d]+t[d].length),text:lo(t.slice(n,d+1).join(" "))}),n=d}return o}function fo(e,r=-1){let t=String(e),u=Ft(t);if(u.length===0)return[];let o=[];for(let n of u){if(r>=n.from&&r<=n.to)continue;let i=t.slice(n.from,n.to);i.trim()&&o.push({kind:"live-range",blockKind:n.kind,from:n.from,to:n.to,source:i})}return o}function mo(e,r){ie(e,"[data-rmd-block]",r.filter(t=>t.kind==="block")),ie(e,"h1,h2,h3,h4,h5,h6",r.filter(t=>t.kind==="heading")),ie(e,"p",r.filter(t=>t.kind==="paragraph")),ie(e,"pre.rmd-code",r.filter(t=>t.kind==="code")),ie(e,"blockquote",r.filter(t=>t.kind==="blockquote")),ie(e,"ul,ol",r.filter(t=>t.kind==="list")),ie(e,"hr",r.filter(t=>t.kind==="thematic-break"))}function ie(e,r,t){Array.from(e.querySelectorAll(r)).forEach((o,n)=>{let a=t[n];a&&(o.setAttribute("data-rmd-source-from",String(a.from)),o.setAttribute("data-rmd-source-to",String(a.to)))})}function s0(e){let r=[],t=0;for(let u of e)r.push(t),t+=u.length+1;return r}function Ct(e,r,t){for(let u=r;u<e.length;u+=1)if(t.test(e[u]))return u;return-1}function Dt(e,r,t){let u=r;for(let o=r+1;o<e.length;o+=1){if(t(e[o]))return u;u=o}return u}function St(e){return/^:::\s*[a-z]/i.test(e)||/^```/.test(e)||/^(#{1,6})\s+/.test(e)||/^(?:---|\*\*\*|___)\s*$/.test(e.trim())}function lo(e){return String(e).replace(/[*_`[\]()#>!-]/g,"").replace(/\s+/g," ").trim()}var Tt=class extends Z.WidgetType{constructor(t,u){super();this.range=t;this.options=u}toDOM(){let t=ae(this.range.source,this.options),u=this.range.blockKind??"block";t.classList.add("rmd-live-render-host",`rmd-live-kind-${u}`),t.setAttribute("data-rmd-live-from",String(this.range.from)),t.setAttribute("data-rmd-live-to",String(this.range.to)),t.setAttribute("data-rmd-live-kind",u);let o=document.createElement("style");return o.textContent=f0(u)?l0:d0,t.shadowRoot?.appendChild(o),t}eq(t){return t.range.from===this.range.from&&t.range.to===this.range.to&&t.range.source===this.range.source&&t.range.blockKind===this.range.blockKind&&t.options.themeCss===this.options.themeCss&&t.options.themeId===this.options.themeId&&t.options.resourceSourcePath===this.options.resourceSourcePath}ignoreEvent(){return!1}get estimatedHeight(){let t=Math.max(1,this.range.source.split(`
`).length);return Math.min(420,28+t*24)}},l0=`
:host { display: block; background: transparent !important; margin: 6px 0; }
.rmd-document {
  max-width: none;
  margin: 0;
  padding: 0;
  font-size: inherit;
  line-height: inherit;
  background: transparent !important;
}
.rmd-document > :first-child { margin-top: 0; }
.rmd-document > :last-child { margin-bottom: 0; }
.rmd-block { margin: 0; }
`.trim(),d0=`
:host { display: block; background: transparent !important; margin: 0; }
.rmd-document {
  max-width: none;
  margin: 0;
  padding: 0;
  background: transparent !important;
  font-family: inherit;
  font-size: inherit;
  line-height: 1.6;
  color: var(--text-normal, inherit);
}
.rmd-document > :first-child { margin-top: 0; }
.rmd-document > :last-child { margin-bottom: 0; }
.rmd-document h1 { font-size: 1.9em; margin: 0.35em 0 0.45em; padding-bottom: 0.4em; }
.rmd-document h2 { font-size: 1.45em; margin: 1em 0 0.4em; }
.rmd-document h3 { font-size: 1.2em; margin: 0.85em 0 0.35em; }
.rmd-document h4,
.rmd-document h5,
.rmd-document h6 { margin: 0.7em 0 0.3em; }
.rmd-document p,
.rmd-document ul,
.rmd-document ol,
.rmd-document blockquote { margin: 0 0 0.6em; }
.rmd-document blockquote {
  border-left: 3px solid var(--background-modifier-border, #d0d0d0);
  padding: 0.1em 0 0.1em 0.9em;
  color: var(--text-muted, inherit);
}
.rmd-document hr {
  border: 0;
  border-top: 1px solid var(--background-modifier-border, #d0d0d0);
  margin: 1.2em 0;
}
.rmd-document pre,
.rmd-document code {
  font-family: var(--font-monospace, ui-monospace, monospace);
}
`.trim();function f0(e){return e==="block"}function ur(e,r=()=>!0,t="fenced"){return[tr.StateField.define({create(o){return po(o,e(),r(),t)},update(o,n){return!n.docChanged&&!n.selection?o:po(n.state,e(),r(),t)},provide:o=>Z.EditorView.decorations.from(o)}),Z.EditorView.domEventHandlers({mousedown(o,n){if(!r())return!1;let i=(o.target instanceof Element?o.target:null)?.closest(".rmd-live-render-host");if(!i)return!1;let c=Number(i.getAttribute("data-rmd-live-from"));if(!Number.isFinite(c))return!1;let s=Math.min(Math.max(c,0),n.state.doc.length);return o.preventDefault(),n.dispatch({selection:{anchor:s},effects:Z.EditorView.scrollIntoView(s,{y:"center"})}),n.focus(),!0}})]}function po(e,r,t,u){if(!t)return Z.Decoration.none;let o=new tr.RangeSetBuilder,n=e.doc.toString(),a=e.selection.main.head,i=m0(n,a,u);for(let c of i)c.source.trim()&&o.add(c.from,c.to,Z.Decoration.replace({widget:new Tt(c,r),block:!0}));return o.finish()}function m0(e,r,t){if(t==="document"){let u=[];for(let o of fo(e,r))o&&u.push({from:Number(o.from),to:Number(o.to),source:String(o.source),blockKind:o.blockKind?String(o.blockKind):"block"});return u}return so(e,r).filter(u=>!u.cursorInside).map(u=>({from:u.from,to:u.to,source:u.source,blockKind:"block"}))}function ho(e,r){return(t,u)=>{if(r())for(let o of p0(t)){let n=o.textContent??"",a=ae(n,e(u.sourcePath));a.classList.add("rmd-post-processor-host"),o.parentElement?.replaceWith(a)}}}function p0(e){return Array.from(e.querySelectorAll("pre > code")).filter(r=>r instanceof HTMLElement&&h0(r))}function h0(e){let r=Array.from(e.classList).find(t=>t.startsWith("language-"));return r==="language-rmd"||r==="language-rich-markdown"?!0:(e.textContent??"").trimStart().startsWith(":::")}var ce=require("obsidian"),Mt={theme:"auto",defaultMode:"split",debounceMs:150,enableInMarkdown:!0},or=class extends ce.PluginSettingTab{constructor(t,u){super(t,u);this.plugin=u}display(){let{containerEl:t}=this;t.empty(),t.createEl("h2",{text:"Rich Markdown"}),new ce.Setting(t).setName("Theme").setDesc("Visual theme for rendered Rich Markdown content.").addDropdown(u=>u.addOption("auto","Auto (follow Obsidian)").addOption("default","Default").addOption("tech-dark","Tech Dark").addOption("paper","Paper").addOption("notion-like","Notion-like").setValue(this.plugin.settings.theme).onChange(async o=>{this.plugin.settings.theme=o,await this.plugin.saveSettings()})),new ce.Setting(t).setName("Default view mode").setDesc("How .rmd files open by default.").addDropdown(u=>u.addOption("live","Live").addOption("split","Split").addOption("preview","Preview").setValue(this.plugin.settings.defaultMode).onChange(async o=>{this.plugin.settings.defaultMode=o,await this.plugin.saveSettings()})),new ce.Setting(t).setName("Re-render debounce").setDesc("Wait this long after editing before refreshing the preview.").addSlider(u=>u.setLimits(50,500,50).setValue(this.plugin.settings.debounceMs).setDynamicTooltip().onChange(async o=>{this.plugin.settings.debounceMs=o,await this.plugin.saveSettings()})),new ce.Setting(t).setName("Enable in regular Markdown files").setDesc("Render fenced rmd code blocks in normal .md Reading mode.").addToggle(u=>u.setValue(this.plugin.settings.enableInMarkdown).onChange(async o=>{this.plugin.settings.enableInMarkdown=o,await this.plugin.saveSettings()}))}};var nr=["default","tech-dark","paper","notion-like"];function $t(e){return nr.includes(e)}function bo(e,r=!1){return e==="auto"?r?"tech-dark":"default":$t(e)?e:"default"}function go(e){let r=e==="auto"?"default":e,t=Math.max(0,nr.indexOf(r));return nr[(t+1)%nr.length]}function b0(e){return bo(e,document.body.classList.contains("theme-dark"))}function xo(e){let r=b0(e);return{themeId:r,themeCss:ye[r]??ye.default}}var g0=/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i;function ko(e,r,t){let u=x0(r,t);if(!u||typeof e?.getAbstractFileByPath!="function"||typeof e?.getResourcePath!="function")return null;let o=e.getAbstractFileByPath(u);return o?`${e.getResourcePath(o)}${yo(t).suffix}`:null}function x0(e,r){let{path:t}=yo(r),u=t.trim();if(!e||!k0(u))return null;let o=y0(u),n=o.startsWith("/")?o.slice(1):`${v0(e)}/${o}`;return _0(n)}function k0(e){let r=String(e??"").trim();return r!==""&&!r.startsWith("#")&&!g0.test(r)}function yo(e){let r=String(e??""),t=r.indexOf("?"),u=r.indexOf("#"),o=[t,u].filter(a=>a>=0),n=o.length?Math.min(...o):-1;return n===-1?{path:r,suffix:""}:{path:r.slice(0,n),suffix:r.slice(n)}}function y0(e){try{return decodeURI(e)}catch{return e}}function v0(e){let r=String(e).replaceAll("\\","/"),t=r.lastIndexOf("/");return t===-1?"":r.slice(0,t)}function _0(e){let r=[];for(let t of String(e).replaceAll("\\","/").split("/"))if(!(!t||t===".")){if(t===".."){r.pop();continue}r.push(t)}return r.join("/")}var ar=require("obsidian"),So=require("@codemirror/state"),Q=require("@codemirror/view");var vo=["auto","default","tech-dark","paper","notion-like"];function _o(e){return e==="auto"||$t(e)}function wo(e){let r=Eo(String(e??""));if(!r)return null;let t=r.raw.match(/^theme:\s*["']?([^"'\n#]+)["']?\s*(?:#.*)?$/m);if(!t)return null;let u=t[1].trim();return _o(u)?u:null}function Ao(e,r){let t=_o(r)?r:"default",u=String(e??""),o=Eo(u);if(!o)return`---
theme: ${t}
---

${u}`;let n=/^theme:\s*.*$/m,a=n.test(o.raw)?o.raw.replace(n,`theme: ${t}`):w0(o.raw,t);return`${u.slice(0,o.start)}---
${a}
---${u.slice(o.end)}`}function Eo(e){let r=e.replaceAll(`\r
`,`
`);if(!r.startsWith(`---
`))return null;let t=r.indexOf(`
---`,4);return t===-1?null:{start:0,end:t+4,raw:r.slice(4,t)}}function w0(e,r){return e.endsWith(`
`)?`${e}theme: ${r}`:`${e}
theme: ${r}`}var ir="rich-markdown-view",se=class extends ar.TextFileView{constructor(t,u){super(t);this.plugin=u;this.editor=null;this.renderHost=null;this.previewPane=null;this.renderTimer=null;this.sourceData="";this.syncingScroll=!1;this.modeToggleEl=null;this.themeSelectEl=null;this.displayMode=u.settings.defaultMode,this.addModeToggleAction(),this.addThemeSelectAction()}getViewType(){return ir}getDisplayText(){return this.file?.basename??"Rich Markdown"}getIcon(){return"file-text"}getViewData(){return this.editor?.state.doc.toString()??this.sourceData}setViewData(t,u){this.sourceData=t,u&&this.clear(),this.mountUi(),this.editor&&(this.replaceEditorDocument(t),this.focusEditorSoon()),this.requestRender(),this.updateModeToggle(),this.updateThemeSelect()}clear(){this.renderTimer!==null&&(window.clearTimeout(this.renderTimer),this.renderTimer=null),this.contentEl.empty(),this.editor?.destroy(),this.editor=null,this.renderHost=null,this.previewPane=null}setDisplayMode(t){if(this.displayMode===t)return;let u=this.getViewData();this.displayMode=t,this.clear(),this.sourceData=u,this.mountUi(),this.editor&&(this.replaceEditorDocument(u),this.focusEditorSoon()),this.requestRender()}refreshFromSettings(t){if(this.displayMode==="live"){let u=this.getViewData();this.clear(),this.sourceData=u,this.mountUi()}this.updateThemeSelect(),this.requestRender()}mountUi(){if(this.renderHost||this.editor)return;let t=this.contentEl;if(t.empty(),t.className="",t.addClass("rmd-view",`rmd-mode-${this.displayMode}`),this.updateModeToggle(),this.displayMode==="preview"){let o=t.createDiv({cls:"rmd-pane rmd-pane-preview"});this.previewPane=o,this.renderHost=ae(this.sourceData,this.getRenderOptions()),o.appendChild(this.renderHost);return}if(this.displayMode==="split"){let o=t.createDiv({cls:"rmd-pane rmd-pane-source"}),n=t.createDiv({cls:"rmd-pane rmd-pane-preview"});this.previewPane=n,this.editor=this.createSourceEditor(o),this.renderHost=ae(this.sourceData,this.getRenderOptions()),n.appendChild(this.renderHost),this.annotatePreview(),this.bindPreviewClick(),this.bindSplitScrollSync();return}let u=t.createDiv({cls:"rmd-pane rmd-pane-source rmd-live-editor"});this.editor=this.createSourceEditor(u,[ur(()=>this.getRenderOptions(),()=>!0,"document")])}createSourceEditor(t,u=[]){let o=So.EditorState.create({doc:this.sourceData,extensions:[Q.EditorView.lineWrapping,E0,(0,Q.drawSelection)(),Q.EditorView.updateListener.of(a=>{a.docChanged&&(this.sourceData=a.state.doc.toString(),this.updateThemeSelect(),this.requestRender(),this.requestSave())}),...u]}),n=new Q.EditorView({state:o,parent:t});return n.dom.classList.add("rmd-source-editor"),n}addModeToggleAction(){this.modeToggleEl=this.addAction(Co(this.displayMode),Do(this.displayMode),()=>this.cycleDisplayMode()),this.modeToggleEl.addClass("rmd-view-action","rmd-view-mode-toggle"),this.updateModeToggle()}updateModeToggle(){this.modeToggleEl&&(D0(this.modeToggleEl,Co(this.displayMode)),this.modeToggleEl.setAttribute("aria-label",Do(this.displayMode)),this.modeToggleEl.setAttribute("data-rmd-current-mode",this.displayMode))}cycleDisplayMode(){this.setDisplayMode(Lt[this.displayMode])}addThemeSelectAction(){let t=document.createElement("select");t.className="rmd-view-theme-select",t.setAttribute("aria-label","Rich Markdown theme"),t.title="Rich Markdown theme";for(let u of vo){let o=document.createElement("option");o.value=u,o.textContent=A0(u),t.append(o)}t.addEventListener("change",()=>{this.setDocumentTheme(t.value)}),this.themeSelectEl=t,this.modeToggleEl?.parentElement?.insertBefore(t,this.modeToggleEl),this.updateThemeSelect()}updateThemeSelect(){this.themeSelectEl&&(this.themeSelectEl.value=this.currentThemeChoice())}currentThemeChoice(){return wo(this.getViewData())??this.plugin.settings.theme}async setDocumentTheme(t){let u=this.getViewData(),o=Ao(u,t);if(o===u){this.updateThemeSelect(),this.requestRender();return}this.sourceData=o,this.editor?this.replaceEditorDocument(o):(this.requestSave(),this.requestRender()),this.updateThemeSelect()}replaceEditorDocument(t){if(!this.editor)return;let u=this.editor.state.doc.length;this.editor.dispatch({changes:{from:0,to:u,insert:t}})}focusEditorSoon(){window.requestAnimationFrame(()=>{this.editor?.focus()})}requestRender(){this.renderTimer!==null&&window.clearTimeout(this.renderTimer),this.renderTimer=window.setTimeout(()=>{this.renderTimer=null,this.doRender()},this.plugin.settings.debounceMs)}doRender(){this.sourceData=this.getViewData(),!(!this.renderHost||this.displayMode==="live")&&(Et(this.renderHost,this.sourceData,this.getRenderOptions()),this.annotatePreview())}getRenderOptions(){return this.plugin.getRenderOptions(this.file?.path,this.currentThemeChoice())}annotatePreview(){this.renderHost?.shadowRoot&&mo(this.renderHost.shadowRoot,Ft(this.sourceData))}bindPreviewClick(){!this.renderHost||!this.editor||this.renderHost.addEventListener("click",t=>{let u=C0(t);if(!u)return;let o=Number(u.getAttribute("data-rmd-source-from"));Number.isFinite(o)&&this.focusSourceAt(o)})}focusSourceAt(t){if(!this.editor)return;let u=Math.min(Math.max(t,0),this.editor.state.doc.length);this.editor.dispatch({selection:{anchor:u},effects:Q.EditorView.scrollIntoView(u,{y:"center"})}),this.editor.focus()}bindSplitScrollSync(){if(!this.editor||!this.previewPane)return;let t=this.editor.scrollDOM,u=this.previewPane;t.addEventListener("scroll",()=>this.syncScroll(t,u)),u.addEventListener("scroll",()=>this.syncScroll(u,t))}syncScroll(t,u){if(this.syncingScroll)return;let o=t.scrollHeight-t.clientHeight,n=u.scrollHeight-u.clientHeight;o<=0||n<=0||(this.syncingScroll=!0,u.scrollTop=t.scrollTop/o*n,window.requestAnimationFrame(()=>{this.syncingScroll=!1}))}};function A0(e){switch(e){case"auto":return"Auto";case"default":return"Default";case"tech-dark":return"Tech Dark";case"paper":return"Paper";case"notion-like":return"Notion-like";default:return e}}var E0=Q.EditorView.theme({"&":{height:"100%",minHeight:"100%",backgroundColor:"var(--background-primary)",color:"var(--text-normal)"},".cm-scroller":{fontFamily:"var(--font-monospace)",lineHeight:"1.6"},".cm-content":{caretColor:"var(--interactive-accent)",minHeight:"100%"},".cm-cursor, .cm-dropCursor":{borderLeftColor:"var(--interactive-accent)",borderLeftWidth:"2px"}});function C0(e){let r=e.composedPath();for(let t of r)if(t instanceof HTMLElement&&t.hasAttribute("data-rmd-source-from"))return t;return null}var Lt={live:"split",split:"preview",preview:"live"};function Co(e){switch(Lt[e]){case"live":return"pencil-line";case"split":return"panel-left-close";case"preview":return"book-open";default:return"eye"}}function Do(e){let r=Lt[e],t=u=>u==="live"?"Live":u==="split"?"Split":"Preview";return`Switch to ${t(r)} view (currently ${t(e)})`}function D0(e,r){e.empty(),e.setAttribute("data-icon",r),(0,ar.setIcon)(e,r)}var Fo={chart:'```rmd\n:::chart bar title="Metric"\nA 1\nB 2\n:::\n```\n',callout:'```rmd\n:::callout tip title="Note"\nWrite the callout body here.\n:::\n```\n'},cr=class extends G.Plugin{constructor(){super(...arguments);this.settings=Mt}async onload(){await this.loadSettings(),this.registerView(ir,t=>new se(t,this)),this.registerExtensions(["rmd"],ir),this.registerMarkdownPostProcessor(ho(t=>this.getRenderOptions(t),()=>this.settings.enableInMarkdown)),this.registerEditorExtension(ur(()=>this.getRenderOptions(this.app.workspace.getActiveFile()?.path),()=>this.settings.enableInMarkdown)),this.addSettingTab(new or(this.app,this)),this.addRibbonIcon("file-text","Rich Markdown",()=>{new G.Notice("Rich Markdown plugin is loaded.")}),this.registerCommands()}async loadSettings(){this.settings=Object.assign({},Mt,await this.loadData())}async saveSettings(){await this.saveData(this.settings),this.app.workspace.iterateAllLeaves(t=>{t.view instanceof se&&t.view.refreshFromSettings(this.settings)})}getRenderOptions(t,u=this.settings.theme){return{...xo(u),resourceSourcePath:t,resolveResourceUrl:o=>ko(this.app.vault,t,o)}}registerCommands(){this.addCommand({id:"rmd-switch-mode-live",name:"Switch to Live mode",checkCallback:t=>this.switchActiveMode("live",t)}),this.addCommand({id:"rmd-switch-mode-split",name:"Switch to Split mode",checkCallback:t=>this.switchActiveMode("split",t)}),this.addCommand({id:"rmd-switch-mode-preview",name:"Switch to Preview mode",checkCallback:t=>this.switchActiveMode("preview",t)}),this.addCommand({id:"rmd-export-html",name:"Export current .rmd as self-contained HTML",checkCallback:t=>this.exportActiveRmd(t)}),this.addCommand({id:"rmd-toggle-theme",name:"Toggle Rich Markdown theme",callback:async()=>{let t=go(this.settings.theme);this.settings.theme=t,await this.saveSettings(),new G.Notice(`Rich Markdown theme: ${t}`)}}),this.addCommand({id:"rmd-insert-block-chart",name:"Insert Rich Markdown chart block",editorCallback:t=>t.replaceSelection(Fo.chart)}),this.addCommand({id:"rmd-insert-block-callout",name:"Insert Rich Markdown callout block",editorCallback:t=>t.replaceSelection(Fo.callout)})}switchActiveMode(t,u){let o=this.app.workspace.getActiveViewOfType(se);return o?(u||o.setDisplayMode(t),!0):!1}exportActiveRmd(t){let u=this.app.workspace.getActiveViewOfType(se),o=this.app.workspace.getActiveFile(),n=u?.file??o;return!(n instanceof G.TFile)||n.extension!=="rmd"?!1:(t||this.exportFile(n,u?.getViewData()),!0)}async exportFile(t,u){let o=u??await this.app.vault.read(t),n=no(o,{mode:"self-contained",theme:this.getRenderOptions().themeId}),a=t.path.replace(/\.rmd$/i,".html"),i=this.app.vault.getAbstractFileByPath(a);i instanceof G.TFile?await this.app.vault.modify(i,n):await this.app.vault.create(a,n),new G.Notice(`Exported Rich Markdown HTML: ${a}`)}};
