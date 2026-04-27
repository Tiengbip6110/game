(function(P){const h={room:{maxPlayers:6,allowedPlayerCaps:[2,3,4,5,6],codeLength:6},rateLimits:{createRoomMs:1500,joinRoomMs:1e3,copyRoomCodeMs:400,startRoomMs:1200,inputThrottleMs:50,broadcastThrottleMs:80,submitProgressMs:750,submitProgressStepDelta:5},transport:{apiBasePath:"/api",productionTarget:""},chat:{maxLength:120,clientMaxTokens:3,clientRefillMs:1e3,maxMessages:40}},N="cube-jump-online-chat-style",Y=4e3;function F(c={}){const e={socket:null,code:"",resolvedApiBase:"",reconnecting:!1,reconnectAttempts:0,reconnectTimer:0,heartbeatTimer:0,lastMessageAt:0,staleSocketAfterMs:c.staleSocketAfterMs||45e3,heartbeatIntervalMs:c.heartbeatIntervalMs||15e3,maxReconnectAttempts:c.maxReconnectAttempts||5,maxReconnectMs:c.maxReconnectMs||3e4,reconnectStartedAt:0,intentionalClose:!1,chat:{root:null,toggleButton:null,badge:null,panel:null,list:null,input:null,sendButton:null,status:null,preview:null,open:!1,visible:!1,previewVisible:!1,previewTimer:0,messages:[],unreadCount:0,tokens:h.chat.clientMaxTokens,lastTokenAt:Date.now(),refillTimer:0,muted:!1,serverCooldownUntil:0}};function Z(){if(document.getElementById(N))return;const t=document.createElement("style");t.id=N,t.textContent=`
.cube-chat {
    position: fixed;
    top: auto;
    right: max(16px, calc(env(safe-area-inset-right) + 16px));
    bottom: calc(96px + env(safe-area-inset-bottom));
    z-index: 8;
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
    width: min(300px, calc(100vw - 24px));
    max-height: min(420px, calc(100dvh - var(--chat-keyboard-offset) - 140px));
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
    width: min(260px, calc(100vw - 24px));
    padding: 9px 11px;
    border: 1px solid rgba(255, 255, 255, 0.18);
    border-radius: 13px;
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
    font-size: 11px;
    line-height: 1.25;
    margin-bottom: 2px;
}
.cube-chat-preview-text {
    display: block;
    color: rgba(248, 251, 255, 0.94);
    font-size: 12px;
    line-height: 1.3;
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
        width: min(280px, calc(100vw - 20px));
        max-height: min(420px, calc(100dvh - var(--chat-keyboard-offset) - 120px));
        top: auto;
        bottom: var(--chat-panel-bottom);
    }
    .cube-chat-preview {
        width: min(244px, calc(100vw - 20px));
        bottom: 52px;
    }
    .cube-chat-messages {
        max-height: 116px;
    }
}
`,document.head.append(t)}function v(){if(e.chat.root)return;Z();const t=document.createElement("section");t.className="cube-chat hidden",t.setAttribute("aria-label","Online chat");const n=document.createElement("button");n.className="cube-chat-toggle",n.type="button",n.setAttribute("aria-label","Chat"),n.setAttribute("aria-expanded","false"),n.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.8C4 4.25 5.25 3 6.8 3h10.4C18.75 3 20 4.25 20 5.8v6.9c0 1.55-1.25 2.8-2.8 2.8h-5.7l-4.45 4.05A.9.9 0 0 1 5.55 18v-2.6A2.8 2.8 0 0 1 4 12.9Zm3.2.7a1 1 0 1 0 0 2h9.6a1 1 0 1 0 0-2Zm0 4a1 1 0 1 0 0 2h6.4a1 1 0 1 0 0-2Z"></path></svg>';const a=document.createElement("span");a.className="cube-chat-badge hidden",a.setAttribute("aria-hidden","true"),n.append(a);const r=document.createElement("div");r.className="cube-chat-preview hidden",r.setAttribute("aria-live","polite");const o=document.createElement("div");o.className="cube-chat-panel hidden",o.setAttribute("role","dialog"),o.setAttribute("aria-label","Room chat");const d=document.createElement("div");d.className="cube-chat-messages",d.setAttribute("aria-live","polite");const s=document.createElement("div");s.className="cube-chat-compose";const i=document.createElement("input");i.className="cube-chat-input",i.type="text",i.maxLength=h.chat.maxLength,i.placeholder="Chat",i.autocomplete="off",i.spellcheck=!1;const p=document.createElement("button");p.className="cube-chat-send",p.type="button",p.textContent="Send";const l=document.createElement("div");l.className="cube-chat-status",l.setAttribute("aria-live","polite"),s.append(i,p),o.append(d,s,l),t.append(o,r,n),document.body.append(t);const u=f=>{f.stopPropagation()};t.addEventListener("pointerdown",u),t.addEventListener("touchstart",u,{passive:!0}),t.addEventListener("keydown",u),n.addEventListener("click",()=>{I(!e.chat.open)}),p.addEventListener("click",D),i.addEventListener("keydown",f=>{f.key==="Enter"&&(f.preventDefault(),D())}),i.addEventListener("input",m),i.addEventListener("focus",()=>{g(),A()}),i.addEventListener("blur",()=>{g()}),window.visualViewport&&(window.visualViewport.addEventListener("resize",g),window.visualViewport.addEventListener("scroll",g)),window.addEventListener("resize",g),e.chat.root=t,e.chat.toggleButton=n,e.chat.badge=a,e.chat.preview=r,e.chat.panel=o,e.chat.list=d,e.chat.input=i,e.chat.sendButton=p,e.chat.status=l,E(),b(),m(),g()}function I(t){v(),e.chat.open=!!t,e.chat.panel.classList.toggle("hidden",!e.chat.open),e.chat.toggleButton.setAttribute("aria-expanded",e.chat.open?"true":"false"),g(),e.chat.open&&(C(),e.chat.unreadCount=0,b(),e.chat.input.focus({preventScroll:!0}),A())}function M(t){if(v(),e.chat.visible=!!t,e.chat.root.classList.toggle("hidden",!e.chat.visible),!e.chat.visible){I(!1),e.chat.unreadCount=0,C(),b(),X();return}Q(),m()}function G(){e.chat.messages=[],e.chat.unreadCount=0,e.chat.tokens=h.chat.clientMaxTokens,e.chat.lastTokenAt=Date.now(),e.chat.muted=!1,e.chat.serverCooldownUntil=0,C(),E(),b(),m()}function b(){if(!e.chat.badge)return;const t=Math.max(0,Number(e.chat.unreadCount)||0);e.chat.badge.classList.toggle("hidden",t<=0||e.chat.previewVisible),e.chat.badge.textContent=""}function A(){e.chat.list&&window.setTimeout(()=>{e.chat.list.scrollTop=e.chat.list.scrollHeight},180)}function g(){if(!e.chat.root)return;const t=window.visualViewport,n=t?Math.max(0,window.innerHeight-t.height-t.offsetTop):0,a=e.chat.toggleButton?.getBoundingClientRect(),r=a?Math.max(0,window.innerHeight-a.bottom):96,o=window.matchMedia?.("(max-width: 720px)")?.matches?52:56,d=n>0?Math.max(o,n-r+16):o;e.chat.root.style.setProperty("--chat-panel-bottom",`${d}px`),e.chat.root.style.setProperty("--chat-keyboard-offset",`${n}px`),e.chat.open&&A()}function C(){e.chat.previewTimer&&(window.clearTimeout(e.chat.previewTimer),e.chat.previewTimer=0),e.chat.previewVisible=!1,e.chat.preview?.classList.add("hidden"),b()}function K(t){if(!e.chat.preview||e.chat.open||!e.chat.visible)return;const n=String(t.username||"Player").trim().slice(0,24)||"Player",a=String(t.text||"").trim().slice(0,h.chat.maxLength);e.chat.preview.innerHTML="";const r=document.createElement("span");r.className="cube-chat-preview-name",r.textContent=n;const o=document.createElement("span");o.className="cube-chat-preview-text",o.textContent=a,e.chat.preview.append(r,o),e.chat.previewVisible=!0,e.chat.preview.classList.remove("hidden"),b(),e.chat.previewTimer&&window.clearTimeout(e.chat.previewTimer),e.chat.previewTimer=window.setTimeout(()=>{e.chat.previewTimer=0,e.chat.previewVisible=!1,e.chat.preview?.classList.add("hidden"),b()},Y)}function Q(){e.chat.refillTimer||(e.chat.refillTimer=window.setInterval(m,250))}function X(){e.chat.refillTimer&&(window.clearInterval(e.chat.refillTimer),e.chat.refillTimer=0)}function q(t=Date.now()){const n=t-e.chat.lastTokenAt;if(n<h.chat.clientRefillMs)return;const a=Math.floor(n/h.chat.clientRefillMs);e.chat.tokens=Math.min(h.chat.clientMaxTokens,e.chat.tokens+a),e.chat.lastTokenAt+=a*h.chat.clientRefillMs}function _(t=Date.now()){if(q(t),e.chat.muted)return Number.POSITIVE_INFINITY;const n=Math.max(0,e.chat.serverCooldownUntil-t),a=e.chat.tokens>=1?0:Math.max(0,h.chat.clientRefillMs-(t-e.chat.lastTokenAt));return Math.max(n,a)}function m(){if(!e.chat.sendButton)return;const t=Date.now(),n=_(t),a=e.chat.input?.value.trim()||"",r=e.socket?.readyState===WebSocket.OPEN,o=!r||!a||n>0;e.chat.sendButton.disabled=o,e.chat.muted?e.chat.status.textContent="muted":r&&n>0?e.chat.status.textContent=`${Math.max(1,Math.ceil(n/1e3))}s`:e.chat.status.textContent=""}function E(){if(e.chat.list){if(e.chat.list.innerHTML="",!e.chat.messages.length){const t=document.createElement("div");t.className="cube-chat-empty",t.textContent="No messages",e.chat.list.append(t);return}for(const t of e.chat.messages){const n=document.createElement("div");n.className="cube-chat-message";const a=document.createElement("strong");a.className="cube-chat-name",a.textContent=`${t.username||"Player"}: `;const r=document.createElement("span");r.textContent=t.text||"",n.append(a,r),e.chat.list.append(n)}e.chat.list.scrollTop=e.chat.list.scrollHeight}}function ee(t={}){v();const n=String(t.text||"").trim();if(!n)return;e.chat.messages.push({playerId:String(t.playerId||""),username:String(t.username||"Player").trim().slice(0,24)||"Player",text:n.slice(0,h.chat.maxLength),at:Number(t.at)||Date.now()}),e.chat.messages=e.chat.messages.slice(-h.chat.maxMessages);const a=!!(t.playerId&&String(t.playerId)===String(J()));!e.chat.open&&!a&&(e.chat.unreadCount=Math.min(99,e.chat.unreadCount+1),K(e.chat.messages[e.chat.messages.length-1]),b()),E()}function te(t={}){v();const n=Number(t.retryAfter)||0;n===999?e.chat.muted=!0:n>0&&(e.chat.serverCooldownUntil=Math.max(e.chat.serverCooldownUntil,Date.now()+n*1e3)),m()}function D(){v();const t=e.chat.input.value.trim().slice(0,h.chat.maxLength);if(!t||_()>0){m();return}if(!j("chat_message",{text:t})){m();return}e.chat.tokens=Math.max(0,e.chat.tokens-1),e.chat.lastTokenAt=Date.now(),e.chat.input.value="",m()}function B(){try{const t=JSON.parse(localStorage.getItem(c.storageKey||"cubeJumpRoomSessions")||"{}");return t&&typeof t=="object"?t:{}}catch{return{}}}function U(t){localStorage.setItem(c.storageKey||"cubeJumpRoomSessions",JSON.stringify(t))}function ne(t){const n=B()[String(t||"").toUpperCase()];return!n||typeof n!="object"?null:n}function ae(t,n){const a=String(t||"").toUpperCase();if(!a)return;const r=B();r[a]=n,U(r)}function oe(t){const n=String(t||"").toUpperCase();if(!n)return;const a=B();delete a[n],U(a)}function V(){return typeof c.isEnabled=="function"?c.isEnabled()!==!1:!0}function z(){return typeof c.getApiBasePath=="function"?c.getApiBasePath():c.apiBasePath||h.transport.apiBasePath||"/api"}function $(t){return String(t||"").replace(/\/+$/,"")}function H(t){const n=$(t);return n?/^https?:\/\//i.test(n)||n.startsWith("/")?n:`/${n}`:""}function re(){return typeof c.getProductionTarget=="function"?c.getProductionTarget():c.productionTarget||h.transport.productionTarget||""}function k(){const t=[],n=new Set,a=d=>{const s=H(d);!s||n.has(s)||(n.add(s),t.push(s))},r=z();a(r);const o=$(re());return o&&(/^https?:\/\//i.test(o)?a(`${o}${z()}`):a(o)),t.length?t:["/api"]}function J(){return typeof c.getPlayerId=="function"?c.getPlayerId():""}function O(){return typeof c.getSessionToken=="function"?c.getSessionToken():""}function W(t,n=e.resolvedApiBase||k()[0]){const a=H(n);return/^https?:\/\//i.test(a)?`${a}${t}`:`${a}${t}`}function ce(t,n=e.resolvedApiBase||k()[0]){const a=J(),r=O(),o=new URL(W(`/rooms/${encodeURIComponent(t)}/ws`,n),window.location.origin);return o.protocol=o.protocol==="https:"?"wss:":"ws:",o.searchParams.set("playerId",a),r&&o.searchParams.set("sessionToken",r),o.toString()}async function ie(t,n={}){const a=Number(n.timeoutMs||c.requestTimeoutMs||12e3),r=n.body?{...n.body,...n.auth!==!1||n.sessionToken?{sessionToken:n.sessionToken||O()||void 0}:{}}:n.body;let o=null;const d=k();for(const s of d){let i;const p=a>0&&typeof AbortController<"u"?new AbortController:null,l=p?window.setTimeout(()=>p.abort(),a):0;try{i=await fetch(W(t,s),{method:n.method||"GET",headers:r?{"Content-Type":"application/json"}:void 0,body:r?JSON.stringify(r):void 0,keepalive:!!n.keepalive,signal:p?.signal})}catch(w){const he=w?.name==="AbortError";o=new Error(he?"Cloudflare room service timed out.":"Cloudflare room service is unreachable."),o.code="transport_unavailable";continue}finally{l&&window.clearTimeout(l)}const u=await i.text();let f={};try{f=u?JSON.parse(u):{}}catch{f={}}if(!i.ok){const w=new Error(f.error||`Room service request failed with HTTP ${i.status}.`);if(w.status=i.status,w.code=[404,405,501,502,503].includes(i.status)?"transport_unavailable":"api_error",w.code==="transport_unavailable"&&s!==d[d.length-1]){o=w;continue}throw w}return e.resolvedApiBase=s,f}throw o||new Error("Cloudflare room service is unreachable.")}function R(){e.reconnectTimer&&(clearTimeout(e.reconnectTimer),e.reconnectTimer=0)}function y(){e.heartbeatTimer&&(clearInterval(e.heartbeatTimer),e.heartbeatTimer=0)}function se(t){y(),e.lastMessageAt=Date.now(),e.heartbeatTimer=window.setInterval(()=>{const n=e.socket;if(!n||e.code!==t){y();return}if(n.readyState!==WebSocket.OPEN)return;const a=Date.now();if(e.lastMessageAt&&a-e.lastMessageAt>e.staleSocketAfterMs){try{n.close()}catch{}return}try{n.send(JSON.stringify({type:"ping",payload:{at:a}}))}catch{}},e.heartbeatIntervalMs)}function T(t){return typeof c.shouldReconnect=="function"?c.shouldReconnect(t)!==!1:!0}function x(t,n={}){c.onReconnectState?.(t,n)}function le(){if(R(),y(),e.intentionalClose=!0,e.socket)try{e.socket.close()}catch{}e.socket=null,e.code="",e.reconnecting=!1,e.reconnectAttempts=0,e.reconnectStartedAt=0,e.lastMessageAt=0,M(!1),G(),x("hidden")}function j(t,n){const a=e.socket;if(!a||a.readyState!==WebSocket.OPEN)return!1;try{return a.send(JSON.stringify({type:t,payload:n})),!0}catch{return!1}}async function L(t){if(!t||!V())return!1;if(y(),R(),e.intentionalClose=!1,e.socket)try{e.socket.close()}catch{}e.socket=null,e.code="";const n=k();let a=null;for(const r of n)try{return await new Promise((o,d)=>{let s=!1;const i=new WebSocket(ce(t,r)),p=setTimeout(()=>{if(s)return;s=!0;try{i.close()}catch{}const l=new Error("Realtime room connection timed out.");l.code="transport_unavailable",d(l)},c.connectTimeoutMs||5e3);i.addEventListener("open",()=>{e.socket=i,e.code=t,e.lastMessageAt=Date.now(),se(t)}),i.addEventListener("message",l=>{e.lastMessageAt=Date.now();let u;try{u=JSON.parse(l.data)}catch{return}if(u.type!=="pong"){if(u.type==="chat_message"){ee(u.payload||{});return}if(u.type==="chat_rate_limited"){te(u.payload||{});return}if(u.type==="validation_error"){c.onValidationError?.(u.payload||u);return}c.onMessage?.(u),u.type==="room_snapshot"&&!s&&(s=!0,clearTimeout(p),e.resolvedApiBase=r,e.reconnectAttempts=0,e.reconnectStartedAt=0,M(!0),o(!0))}}),i.addEventListener("error",()=>{if(s)return;s=!0,clearTimeout(p);const l=new Error("Realtime room connection failed.");l.code="transport_unavailable",d(l)}),i.addEventListener("close",()=>{if(clearTimeout(p),y(),e.socket===i&&(e.socket=null,e.code="",M(!1)),!s){s=!0;const l=new Error("Realtime room connection closed.");l.code="transport_unavailable",d(l);return}if(e.intentionalClose){e.intentionalClose=!1;return}c.onConnectionLost?.(t,{reconnectable:T(t)})!==!0&&T(t)&&(document.visibilityState==="visible"?S(t):x("failed",{roomCode:t}))})}),!0}catch(o){if(a=o,o?.code!=="transport_unavailable"||r===n[n.length-1])throw o}throw a||new Error("Realtime room connection failed.")}function S(t,n={}){if(!t||!T(t)||!n.force&&e.reconnectTimer)return;R(),e.reconnecting=!0;const a=Date.now();if((!e.reconnectStartedAt||n.immediate)&&(e.reconnectStartedAt=a),e.reconnectAttempts>=e.maxReconnectAttempts||a-e.reconnectStartedAt>=e.maxReconnectMs){e.reconnecting=!1,x("failed",{roomCode:t});return}const r=n.immediate?0:Math.min(1e3*2**e.reconnectAttempts,1e4);x("reconnecting",{roomCode:t,delay:r,attempt:e.reconnectAttempts,silent:e.reconnectAttempts<2&&r<3e3}),e.reconnectTimer=window.setTimeout(()=>{e.reconnectTimer=0,L(t).then(()=>{e.reconnecting=!1,e.reconnectAttempts=0,e.reconnectStartedAt=0,x("reconnected",{roomCode:t})}).catch(o=>{e.reconnectAttempts+=1,e.reconnecting=!1,document.visibilityState==="visible"?S(t):x("failed",{roomCode:t,error:o})})},r)}function ue(t,n={}){!t||!T(t)||e.reconnecting&&!n.force||(n.immediate&&(e.reconnectAttempts=0),S(t,{immediate:n.immediate===!0,force:n.force===!0}))}function de(t){!t||!V()||L(t).catch(n=>{c.onBackgroundConnectFailed?.(t,n),document.visibilityState==="visible"?S(t,{immediate:!1,force:!0}):x("failed",{roomCode:t,error:n})})}return{request:ie,connect:L,connectInBackground:de,close:le,send:j,attemptReconnect:ue,getStoredSession:ne,setStoredSession:ae,clearStoredSession:oe,getSocket(){return e.socket}}}P.CubeJumpOnlineRuntime={config:h},P.CubeJumpOnlineClient={create:F}})(window);
