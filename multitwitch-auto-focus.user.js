// ==UserScript==
// @name         MultiTwitch Auto-Focus
// @namespace    https://github.com/Blake-goofy/User-scripts
// @version      2.3.0
// @description  When the Twitch iframe shows focus player
// @match        https://www.multitwitch.tv/*
// @match        https://multitwitch.tv/*
// @match        https://player.twitch.tv/*
// @match        https://player.twitch.tv/?*
// @run-at       document-idle
// @grant        none
// @downloadURL  https://raw.githubusercontent.com/Blake-goofy/User-scripts/main/multitwitch-auto-focus.user.js
// @updateURL    https://raw.githubusercontent.com/Blake-goofy/User-scripts/main/multitwitch-auto-focus.user.js
// ==/UserScript==

(function () {
  "use strict";
  if (location.hostname !== "player.twitch.tv") return;
  if (!/(^|\/\/)www?\.multitwitch\.tv/.test(document.referrer || "")) return;

  const BTN_SEL = '[data-a-target="player-mute-unmute-button"]';
  let done = false, obs;

  const isMuted = (btn) => ((btn.getAttribute("aria-label") || "").startsWith("Unmute"));

  const waitFor = (sel, t=15000, i=150) => new Promise(r=>{
    const s=Date.now(), h=setInterval(()=>{
      const el=document.querySelector(sel);
      if(el||Date.now()-s>t){clearInterval(h);r(el||null);}
    },i);
  });

  function focusElem(el){
    if(!el) return;
    if(!el.hasAttribute("tabindex")) el.setAttribute("tabindex","-1");
    try{ el.focus({preventScroll:true}); }catch{}
  }

  function actOnce(btn){
    if (done) return;
    done = true;
    if (obs) obs.disconnect();
    const video = document.querySelector("video");
    const controls = document.querySelector('[data-a-target="player-controls-container"]');
    const tgt = video || controls || document.body;
    focusElem(tgt);
  }

  (async () => {
    const btn = await waitFor(BTN_SEL);
    if (!btn) return;

    if (isMuted(btn)) { actOnce(btn); return; }

    obs = new MutationObserver(() => {
      if (isMuted(btn)) actOnce(btn);
    });
    obs.observe(btn, { attributes:true, attributeFilter:["aria-label","class"] });

    setTimeout(()=>{ if (obs) obs.disconnect(); }, 20000);
  })();
})();
