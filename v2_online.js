(function($){const h={room:{maxPlayers:6,allowedPlayerCaps:[2,3,4,5,6],codeLength:6},rateLimits:{createRoomMs:1500,joinRoomMs:1e3,copyRoomCodeMs:400,startRoomMs:1200,inputThrottleMs:50,broadcastThrottleMs:80,submitProgressMs:750,submitProgressStepDelta:5},transport:{apiBasePath:"/api",productionTarget:""},chat:{maxLength:120,clientMaxTokens:3,clientRefillMs:1e3,maxMessages:40}},V="cube-jump-online-chat-style",q=4e3,ee=[/(?:^|\s)(?:dm|dit\s*me|djt\s*me|du\s*ma|duma|dcmm|dcm|cl|vl|vcl|loz|lon|cailon|buoi|cac|cc)(?:\s|$)/,/(?:casino|ca\s*si\s*no|slot|slots|tai\s*xiu|taixiu|xoc\s*dia|xocdia|ca\s*do|cado|keo\s*nha\s*cai|nhacai|ban\s*ca|banca|lo\s*de|lode|so\s*de|sode|poker|blackjack|roulette|jackpot)/,/(?:ma\s*tuy|matuy|heroin|cocaine|cocain|ke\s*da|keda|thuoc\s*lac|thuoclac|mai\s*dam|maidam|khieu\s*dam|khieudam|sex|porn|xxx)/,/(?:tu\s*tu|tutu|chet\s*di|chetme|kill\s*yourself|kys)/];function te(c){return String(c||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/\u0111/g,"d").replace(/[^a-z0-9]+/g," ").replace(/\s+/g," ").trim()}function ae(c){const e=te(c),E=e.replace(/\s+/g,""),b=`${e} ${E}`;return!ee.some(k=>k.test(b))}function ne(){return(navigator.language||"").toLowerCase().startsWith("vi")?"Tin nh\u1EAFn kh\xF4ng ph\xF9 h\u1EE3p":"Message blocked"}function oe(c={}){const e={socket:null,code:"",resolvedApiBase:"",reconnecting:!1,reconnectAttempts:0,reconnectTimer:0,heartbeatTimer:0,lastMessageAt:0,staleSocketAfterMs:c.staleSocketAfterMs||45e3,heartbeatIntervalMs:c.heartbeatIntervalMs||15e3,maxReconnectAttempts:c.maxReconnectAttempts||5,maxReconnectMs:c.maxReconnectMs||3e4,reconnectStartedAt:0,intentionalClose:!1,chat:{root:null,toggleButton:null,badge:null,panel:null,list:null,input:null,sendButton:null,status:null,preview:null,open:!1,visible:!1,previewVisible:!1,previewTimer:0,messages:[],unreadCount:0,tokens:h.chat.clientMaxTokens,lastTokenAt:Date.now(),refillTimer:0,muted:!1,serverCooldownUntil:0}};function E(){if(document.getElementById(V))return;const t=document.createElement("style");t.id=V,t.textContent=`
.cube-chat {
    position: fixed;
    top: auto;
    right: max(16px, calc(env(safe-area-inset-right) + 16px));
    bottom: calc(96px + env(safe-area-inset-bottom));
    z-index: 12;
    font-family: "Margarine", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    color: #f8fbff;
    pointer-events: none;
    --chat-panel-bottom: 56px;
    --chat-keyboard-offset: 0px;
}
.cube-chat.hidden {
    display: none;
}
.cube-chat-toggle {
    position: relative;
    width: 46px;
    height: 46px;
    border: 1px solid rgba(255, 255, 255, 0.24);
    border-radius: 15px;
    background: rgba(14, 22, 34, 0.82);
    color: #ffffff;
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.22);
    display: grid;
    place-items: center;
    pointer-events: auto;
    cursor: pointer;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
}
.cube-chat-toggle svg {
    width: 24px;
    height: 24px;
    fill: currentColor;
}
.cube-chat-badge {
    position: absolute;
    top: -4px;
    right: -4px;
    width: 12px;
    height: 12px;
    border-radius: 999px;
    border: 2px solid rgba(255, 255, 255, 0.95);
    background: #ef4444;
    box-shadow: 0 6px 14px rgba(127, 29, 29, 0.35);
}
.cube-chat-badge.hidden {
    display: none;
}
.cube-chat-panel {
    position: absolute;
    right: 0;
    top: auto;
    bottom: var(--chat-panel-bottom);
    width: min(292px, calc(100vw - 24px));
    max-height: min(390px, calc(100dvh - var(--chat-keyboard-offset) - 116px));
    padding: 10px;
    border: 1px solid rgba(255, 255, 255, 0.18);
    border-radius: 16px;
    background: rgba(12, 18, 29, 0.86);
    box-shadow: 0 18px 44px rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    pointer-events: auto;
    display: flex;
    flex-direction: column;
}
.cube-chat-panel.hidden {
    display: none;
}
.cube-chat-preview {
    position: absolute;
    right: 0;
    bottom: 56px;
    width: min(210px, calc(100vw - 92px));
    padding: 6px 8px;
    border: 1px solid rgba(255, 255, 255, 0.18);
    border-radius: 10px;
    background: rgba(12, 18, 29, 0.88);
    box-shadow: 0 14px 34px rgba(0, 0, 0, 0.28);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    pointer-events: none;
    opacity: 1;
    transform: translateY(0);
    transition: opacity 0.18s ease, transform 0.18s ease;
}
.cube-chat-preview.hidden {
    pointer-events: none;
    opacity: 0;
    transform: translateY(8px);
}
.cube-chat-preview-name {
    display: block;
    color: #a9e7ff;
    font-size: 10px;
    line-height: 1.15;
    margin-bottom: 1px;
}
.cube-chat-preview-text {
    display: block;
    color: rgba(248, 251, 255, 0.94);
    font-size: 11px;
    line-height: 1.2;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.cube-chat-messages {
    max-height: 142px;
    min-height: 0;
    flex: 1 1 auto;
    overflow-y: auto;
    overscroll-behavior: contain;
    padding: 2px 2px 8px;
    display: flex;
    flex-direction: column;
    gap: 5px;
    scrollbar-width: thin;
}
.cube-chat-empty,
.cube-chat-message {
    font-size: 12px;
    line-height: 1.35;
}
.cube-chat-empty {
    color: rgba(248, 251, 255, 0.58);
    text-align: center;
    padding: 18px 4px;
}
.cube-chat-message {
    overflow-wrap: anywhere;
    color: rgba(248, 251, 255, 0.92);
    text-shadow: 0 1px 1px rgba(0, 0, 0, 0.22);
}
.cube-chat-message:nth-last-child(n+7) {
    opacity: 0.45;
}
.cube-chat-name {
    color: #a9e7ff;
}
.cube-chat-compose {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 7px;
    align-items: center;
}
.cube-chat-input {
    min-width: 0;
    height: 34px;
    border: 1px solid rgba(255, 255, 255, 0.18);
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.1);
    color: #ffffff;
    padding: 0 10px;
    font: inherit;
    font-size: 12px;
    outline: none;
}
.cube-chat-input::placeholder {
    color: rgba(248, 251, 255, 0.48);
}
.cube-chat-input:focus {
    border-color: rgba(169, 231, 255, 0.7);
    box-shadow: 0 0 0 2px rgba(97, 204, 255, 0.16);
}
.cube-chat-send {
    min-width: 54px;
    height: 34px;
    border: 0;
    border-radius: 10px;
    background: #ffffff;
    color: #182230;
    font: inherit;
    font-size: 12px;
    cursor: pointer;
}
.cube-chat-send:disabled {
    cursor: default;
    opacity: 0.58;
}
.cube-chat-status {
    min-height: 15px;
    margin-top: 5px;
    color: rgba(248, 251, 255, 0.62);
    font-size: 11px;
    text-align: right;
}
@media (max-width: 720px) {
    .cube-chat {
        top: auto;
        right: max(16px, calc(env(safe-area-inset-right) + 16px));
        bottom: calc(96px + env(safe-area-inset-bottom));
        --chat-panel-bottom: 52px;
    }
    .cube-chat-panel {
        width: min(268px, calc(100vw - 20px));
        max-height: min(380px, calc(100dvh - var(--chat-keyboard-offset) - 96px));
        top: auto;
        bottom: var(--chat-panel-bottom);
    }
    .cube-chat-preview {
        width: min(190px, calc(100vw - 94px));
        bottom: 52px;
    }
    .cube-chat-messages {
        max-height: 116px;
    }
}
`,document.head.append(t)}function b(){if(e.chat.root)return;E();const t=document.createElement("section");t.className="cube-chat hidden",t.setAttribute("aria-label","Online chat");const a=document.createElement("button");a.className="cube-chat-toggle",a.type="button",a.setAttribute("aria-label","Chat"),a.setAttribute("aria-expanded","false"),a.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.8C4 4.25 5.25 3 6.8 3h10.4C18.75 3 20 4.25 20 5.8v6.9c0 1.55-1.25 2.8-2.8 2.8h-5.7l-4.45 4.05A.9.9 0 0 1 5.55 18v-2.6A2.8 2.8 0 0 1 4 12.9Zm3.2.7a1 1 0 1 0 0 2h9.6a1 1 0 1 0 0-2Zm0 4a1 1 0 1 0 0 2h6.4a1 1 0 1 0 0-2Z"></path></svg>';const n=document.createElement("span");n.className="cube-chat-badge hidden",n.setAttribute("aria-hidden","true"),a.append(n);const r=document.createElement("div");r.className="cube-chat-preview hidden",r.setAttribute("aria-live","polite");const o=document.createElement("div");o.className="cube-chat-panel hidden",o.setAttribute("role","dialog"),o.setAttribute("aria-label","Room chat");const d=document.createElement("div");d.className="cube-chat-messages",d.setAttribute("aria-live","polite");const i=document.createElement("div");i.className="cube-chat-compose";const s=document.createElement("input");s.className="cube-chat-input",s.type="text",s.maxLength=h.chat.maxLength,s.placeholder="Chat",s.autocomplete="off",s.spellcheck=!1;const p=document.createElement("button");p.className="cube-chat-send",p.type="button",p.textContent="Send";const l=document.createElement("div");l.className="cube-chat-status",l.setAttribute("aria-live","polite"),i.append(s,p),o.append(d,i,l),t.append(o,r,a),document.body.append(t);const u=m=>{m.stopPropagation()};t.addEventListener("pointerdown",u),t.addEventListener("touchstart",u,{passive:!0}),t.addEventListener("keydown",u),a.addEventListener("click",()=>{k(!e.chat.open)}),document.addEventListener("pointerdown",m=>{if(!e.chat.open)return;const y=m.target;o.contains(y)||a.contains(y)||k(!1)},!0),p.addEventListener("click",J),s.addEventListener("keydown",m=>{m.key==="Enter"&&(m.preventDefault(),J())}),s.addEventListener("input",f),s.addEventListener("focus",()=>{x(),R()}),s.addEventListener("blur",()=>{x()}),window.visualViewport&&(window.visualViewport.addEventListener("resize",x),window.visualViewport.addEventListener("scroll",x)),window.addEventListener("resize",x),e.chat.root=t,e.chat.toggleButton=a,e.chat.badge=n,e.chat.preview=r,e.chat.panel=o,e.chat.list=d,e.chat.input=s,e.chat.sendButton=p,e.chat.status=l,P(),g(),f(),x()}function k(t){b(),e.chat.open=!!t,e.chat.panel.classList.toggle("hidden",!e.chat.open),e.chat.toggleButton.setAttribute("aria-expanded",e.chat.open?"true":"false"),x(),e.chat.open&&(L(),e.chat.unreadCount=0,g(),re())}function re(){if(!e.chat.input)return;const t=()=>{!e.chat.open||!e.chat.input||(e.chat.input.focus({preventScroll:!0}),e.chat.input.scrollIntoView({block:"nearest",inline:"nearest"}),x(),R())};t(),window.requestAnimationFrame(t),window.setTimeout(t,180)}function B(t){if(b(),e.chat.visible=!!t,e.chat.root.classList.toggle("hidden",!e.chat.visible),!e.chat.visible){k(!1),e.chat.unreadCount=0,L(),g(),le();return}se(),f()}function ce(){e.chat.messages=[],e.chat.unreadCount=0,e.chat.tokens=h.chat.clientMaxTokens,e.chat.lastTokenAt=Date.now(),e.chat.muted=!1,e.chat.serverCooldownUntil=0,L(),P(),g(),f()}function g(){if(!e.chat.badge)return;const t=Math.max(0,Number(e.chat.unreadCount)||0);e.chat.badge.classList.toggle("hidden",t<=0||e.chat.previewVisible),e.chat.badge.textContent=""}function R(){e.chat.list&&window.setTimeout(()=>{e.chat.list.scrollTop=e.chat.list.scrollHeight},180)}function x(){if(!e.chat.root)return;const t=window.visualViewport,a=t?Math.max(0,window.innerHeight-t.height-t.offsetTop):0,n=e.chat.toggleButton?.getBoundingClientRect(),r=n?Math.max(0,window.innerHeight-n.bottom):96,o=window.matchMedia?.("(max-width: 720px)")?.matches?52:56,d=a>0?Math.max(o,a-r+22):o;e.chat.root.style.setProperty("--chat-panel-bottom",`${d}px`),e.chat.root.style.setProperty("--chat-keyboard-offset",`${a}px`),e.chat.open&&R()}function L(){e.chat.previewTimer&&(window.clearTimeout(e.chat.previewTimer),e.chat.previewTimer=0),e.chat.previewVisible=!1,e.chat.preview?.classList.add("hidden"),g()}function ie(t){if(!e.chat.preview||e.chat.open||!e.chat.visible)return;const a=String(t.username||"Player").trim().slice(0,24)||"Player",n=String(t.text||"").trim().slice(0,h.chat.maxLength);e.chat.preview.innerHTML="";const r=document.createElement("span");r.className="cube-chat-preview-name",r.textContent=a;const o=document.createElement("span");o.className="cube-chat-preview-text",o.textContent=n,e.chat.preview.append(r,o),e.chat.previewVisible=!0,e.chat.preview.classList.remove("hidden"),g(),e.chat.previewTimer&&window.clearTimeout(e.chat.previewTimer),e.chat.previewTimer=window.setTimeout(()=>{e.chat.previewTimer=0,e.chat.previewVisible=!1,e.chat.preview?.classList.add("hidden"),g()},q)}function se(){e.chat.refillTimer||(e.chat.refillTimer=window.setInterval(f,250))}function le(){e.chat.refillTimer&&(window.clearInterval(e.chat.refillTimer),e.chat.refillTimer=0)}function ue(t=Date.now()){const a=t-e.chat.lastTokenAt;if(a<h.chat.clientRefillMs)return;const n=Math.floor(a/h.chat.clientRefillMs);e.chat.tokens=Math.min(h.chat.clientMaxTokens,e.chat.tokens+n),e.chat.lastTokenAt+=n*h.chat.clientRefillMs}function U(t=Date.now()){if(ue(t),e.chat.muted)return Number.POSITIVE_INFINITY;const a=Math.max(0,e.chat.serverCooldownUntil-t),n=e.chat.tokens>=1?0:Math.max(0,h.chat.clientRefillMs-(t-e.chat.lastTokenAt));return Math.max(a,n)}function f(){if(!e.chat.sendButton)return;const t=Date.now(),a=U(t),n=e.chat.input?.value.trim()||"",r=e.socket?.readyState===WebSocket.OPEN,o=!r||!n||a>0;e.chat.sendButton.disabled=o,e.chat.muted?e.chat.status.textContent="muted":r&&a>0?e.chat.status.textContent=`${Math.max(1,Math.ceil(a/1e3))}s`:e.chat.status.textContent=""}function P(){if(e.chat.list){if(e.chat.list.innerHTML="",!e.chat.messages.length){const t=document.createElement("div");t.className="cube-chat-empty",t.textContent="No messages",e.chat.list.append(t);return}for(const t of e.chat.messages){const a=document.createElement("div");a.className="cube-chat-message";const n=document.createElement("strong");n.className="cube-chat-name",n.textContent=`${t.username||"Player"}: `;const r=document.createElement("span");r.textContent=t.text||"",a.append(n,r),e.chat.list.append(a)}e.chat.list.scrollTop=e.chat.list.scrollHeight}}function de(t={}){b();const a=String(t.text||"").trim();if(!a)return;e.chat.messages.push({playerId:String(t.playerId||""),username:String(t.username||"Player").trim().slice(0,24)||"Player",text:a.slice(0,h.chat.maxLength),at:Number(t.at)||Date.now()}),e.chat.messages=e.chat.messages.slice(-h.chat.maxMessages);const n=!!(t.playerId&&String(t.playerId)===String(K()));!e.chat.open&&!n&&(e.chat.unreadCount=Math.min(99,e.chat.unreadCount+1),ie(e.chat.messages[e.chat.messages.length-1]),g()),P()}function he(t={}){b();const a=Number(t.retryAfter)||0;a===999?e.chat.muted=!0:a>0&&(e.chat.serverCooldownUntil=Math.max(e.chat.serverCooldownUntil,Date.now()+a*1e3)),f()}function H(t={}){b(),e.chat.status.textContent=t.muted?"muted":ne(),t.muted&&(e.chat.muted=!0),window.setTimeout(f,1600)}function J(){b();const t=e.chat.input.value.trim().slice(0,h.chat.maxLength);if(!t||U()>0){f();return}if(!ae(t)){H();return}if(!Q("chat_message",{text:t})){f();return}e.chat.tokens=Math.max(0,e.chat.tokens-1),e.chat.lastTokenAt=Date.now(),e.chat.input.value="",f()}function N(){try{const t=JSON.parse(localStorage.getItem(c.storageKey||"cubeJumpRoomSessions")||"{}");return t&&typeof t=="object"?t:{}}catch{return{}}}function j(t){localStorage.setItem(c.storageKey||"cubeJumpRoomSessions",JSON.stringify(t))}function pe(t){const a=N()[String(t||"").toUpperCase()];return!a||typeof a!="object"?null:a}function me(t,a){const n=String(t||"").toUpperCase();if(!n)return;const r=N();r[n]=a,j(r)}function fe(t){const a=String(t||"").toUpperCase();if(!a)return;const n=N();delete n[a],j(n)}function W(){return typeof c.isEnabled=="function"?c.isEnabled()!==!1:!0}function F(){return typeof c.getApiBasePath=="function"?c.getApiBasePath():c.apiBasePath||h.transport.apiBasePath||"/api"}function O(t){return String(t||"").replace(/\/+$/,"")}function Y(t){const a=O(t);return a?/^https?:\/\//i.test(a)||a.startsWith("/")?a:`/${a}`:""}function be(){return typeof c.getProductionTarget=="function"?c.getProductionTarget():c.productionTarget||h.transport.productionTarget||""}function S(){const t=[],a=new Set,n=d=>{const i=Y(d);!i||a.has(i)||(a.add(i),t.push(i))},r=F();n(r);const o=O(be());return o&&(/^https?:\/\//i.test(o)?n(`${o}${F()}`):n(o)),t.length?t:["/api"]}function K(){return typeof c.getPlayerId=="function"?c.getPlayerId():""}function Z(){return typeof c.getSessionToken=="function"?c.getSessionToken():""}function G(t,a=e.resolvedApiBase||S()[0]){const n=Y(a);return/^https?:\/\//i.test(n)?`${n}${t}`:`${n}${t}`}function ge(t,a=e.resolvedApiBase||S()[0]){const n=K(),r=Z(),o=new URL(G(`/rooms/${encodeURIComponent(t)}/ws`,a),window.location.origin);return o.protocol=o.protocol==="https:"?"wss:":"ws:",o.searchParams.set("playerId",n),r&&o.searchParams.set("sessionToken",r),o.toString()}async function xe(t,a={}){const n=Number(a.timeoutMs||c.requestTimeoutMs||12e3),r=Number(a.maxAttempts||3),o=Number(a.retryDelayMs||1200),d=a.body?{...a.body,...a.auth!==!1||a.sessionToken?{sessionToken:a.sessionToken||Z()||void 0}:{}}:a.body;let i=null;const s=S();for(let p=1;p<=r;p+=1){for(let l=0;l<s.length;l+=1){const u=s[l];let m;const y=n>0&&typeof AbortController<"u"?new AbortController:null,X=y?window.setTimeout(()=>y.abort(),n):0;try{m=await fetch(G(t,u),{method:a.method||"GET",headers:d?{"Content-Type":"application/json"}:void 0,body:d?JSON.stringify(d):void 0,keepalive:!!a.keepalive,signal:y?.signal})}catch(v){const z=v?.name==="AbortError";i=new Error(z?"Cloudflare room service timed out.":"Cloudflare room service is unreachable."),i.code="transport_unavailable";continue}finally{X&&window.clearTimeout(X)}const D=await m.text();let C={};try{C=D?JSON.parse(D):{}}catch{C={}}if(!m.ok){const v=new Error(C.error||`Room service request failed with HTTP ${m.status}.`);v.status=m.status;const z=m.status===404&&!D.trim();if(v.code=z||[405,501,502,503].includes(m.status)?"transport_unavailable":"api_error",v.code==="transport_unavailable"){if(i=v,l<s.length-1)continue;break}throw v}return e.resolvedApiBase=u,C}if(i&&i.code==="transport_unavailable"&&p<r){await new Promise(l=>setTimeout(l,o*p));continue}break}throw i||new Error("Cloudflare room service is unreachable.")}function I(){e.reconnectTimer&&(clearTimeout(e.reconnectTimer),e.reconnectTimer=0)}function T(){e.heartbeatTimer&&(clearInterval(e.heartbeatTimer),e.heartbeatTimer=0)}function we(t){T(),e.lastMessageAt=Date.now(),e.heartbeatTimer=window.setInterval(()=>{const a=e.socket;if(!a||e.code!==t){T();return}if(a.readyState!==WebSocket.OPEN)return;const n=Date.now();if(e.lastMessageAt&&n-e.lastMessageAt>e.staleSocketAfterMs){try{a.close()}catch{}return}try{a.send(JSON.stringify({type:"ping",payload:{at:n}}))}catch{}},e.heartbeatIntervalMs)}function M(t){return typeof c.shouldReconnect=="function"?c.shouldReconnect(t)!==!1:!0}function w(t,a={}){c.onReconnectState?.(t,a)}function ve(){if(I(),T(),e.intentionalClose=!0,e.socket)try{e.socket.close()}catch{}e.socket=null,e.code="",e.reconnecting=!1,e.reconnectAttempts=0,e.reconnectStartedAt=0,e.lastMessageAt=0,B(!1),ce(),w("hidden")}function Q(t,a){const n=e.socket;if(!n||n.readyState!==WebSocket.OPEN)return!1;try{return n.send(JSON.stringify({type:t,payload:a})),!0}catch{return!1}}async function _(t){if(!t||!W())return!1;if(T(),I(),e.intentionalClose=!1,e.socket)try{e.socket.close()}catch{}e.socket=null,e.code="";const a=S();let n=null;for(const r of a)try{return await new Promise((o,d)=>{let i=!1;const s=new WebSocket(ge(t,r)),p=setTimeout(()=>{if(i)return;i=!0;try{s.close()}catch{}const l=new Error("Realtime room connection timed out.");l.code="transport_unavailable",d(l)},c.connectTimeoutMs||5e3);s.addEventListener("open",()=>{e.socket=s,e.code=t,e.lastMessageAt=Date.now(),we(t)}),s.addEventListener("message",l=>{e.lastMessageAt=Date.now();let u;try{u=JSON.parse(l.data)}catch{return}if(u.type!=="pong"){if(u.type==="chat_message"){de(u.payload||{});return}if(u.type==="chat_rate_limited"){he(u.payload||{});return}if(u.type==="chat_blocked"){H(u.payload||{});return}if(u.type==="validation_error"){c.onValidationError?.(u.payload||u);return}c.onMessage?.(u),u.type==="room_snapshot"&&!i&&(i=!0,clearTimeout(p),e.resolvedApiBase=r,e.reconnectAttempts=0,e.reconnectStartedAt=0,B(!0),o(!0))}}),s.addEventListener("error",()=>{if(i)return;i=!0,clearTimeout(p);const l=new Error("Realtime room connection failed.");l.code="transport_unavailable",d(l)}),s.addEventListener("close",()=>{if(clearTimeout(p),T(),e.socket===s&&(e.socket=null,e.code="",B(!1)),!i){i=!0;const l=new Error("Realtime room connection closed.");l.code="transport_unavailable",d(l);return}if(e.intentionalClose){e.intentionalClose=!1;return}c.onConnectionLost?.(t,{reconnectable:M(t)})!==!0&&M(t)&&(document.visibilityState==="visible"?A(t):w("failed",{roomCode:t}))})}),!0}catch(o){if(n=o,o?.code!=="transport_unavailable"||r===a[a.length-1])throw o}throw n||new Error("Realtime room connection failed.")}function A(t,a={}){if(!t||!M(t)||!a.force&&e.reconnectTimer)return;I(),e.reconnecting=!0;const n=Date.now();if((!e.reconnectStartedAt||a.immediate)&&(e.reconnectStartedAt=n),e.reconnectAttempts>=e.maxReconnectAttempts||n-e.reconnectStartedAt>=e.maxReconnectMs){e.reconnecting=!1,w("failed",{roomCode:t});return}const r=a.immediate?0:Math.min(1e3*2**e.reconnectAttempts,1e4);w("reconnecting",{roomCode:t,delay:r,attempt:e.reconnectAttempts,silent:e.reconnectAttempts<2&&r<3e3}),e.reconnectTimer=window.setTimeout(()=>{e.reconnectTimer=0,_(t).then(()=>{e.reconnecting=!1,e.reconnectAttempts=0,e.reconnectStartedAt=0,w("reconnected",{roomCode:t})}).catch(o=>{e.reconnectAttempts+=1,e.reconnecting=!1,document.visibilityState==="visible"?A(t):w("failed",{roomCode:t,error:o})})},r)}function ye(t,a={}){!t||!M(t)||e.reconnecting&&!a.force||(a.immediate&&(e.reconnectAttempts=0),A(t,{immediate:a.immediate===!0,force:a.force===!0}))}function ke(t){!t||!W()||_(t).catch(a=>{c.onBackgroundConnectFailed?.(t,a),document.visibilityState==="visible"?A(t,{immediate:!1,force:!0}):w("failed",{roomCode:t,error:a})})}return{request:xe,connect:_,connectInBackground:ke,close:ve,send:Q,attemptReconnect:ye,getStoredSession:pe,setStoredSession:me,clearStoredSession:fe,getSocket(){return e.socket}}}$.CubeJumpOnlineRuntime={config:h},$.CubeJumpOnlineClient={create:oe}})(window);
