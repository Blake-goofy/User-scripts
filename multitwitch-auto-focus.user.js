// ==UserScript==
// @name         MultiTwitch Auto-Focus (wait for muted)
// @namespace    https://github.com/Blake-goofy/User-scripts
// @version      2.3.1
// @description  When the Twitch iframe shows Unmute, focus the player so you can press m yourself
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
  let done = false;

  const waitFor = (sel, t=15000, i=150) => new Promise(r=>{
    const s=Date.now(), h=setInterval(()=>{
      const el=document.querySelector(sel);
      if(el||Date.now()-s>t){clearInterval(h);r(el||null);}
    },i);
  });

  const isMuted = (btn) => ((btn.getAttribute("aria-label") || "").startsWith("Unmute"));

  function focusTarget() {
    if (done) return;
    done = true;
    const video = document.querySelector("video");
    const ctrls = document.querySelector('[data-a-target="player-controls-container"]');
    const tgt = video || ctrls || document.body;
    if (tgt && !tgt.hasAttribute("tabindex")) tgt.setAttribute("tabindex","-1");
    try { tgt.focus({ preventScroll: true }); } catch {}
  }

  (async () => {
    const btn = await waitFor(BTN_SEL);
    if (!btn) return;

    if (isMuted(btn)) { focusTarget(); return; }

    const obs = new MutationObserver(() => {
      if (isMuted(btn)) { focusTarget(); obs.disconnect(); }
    });
    obs.observe(btn, { attributes:true, attributeFilter:["aria-label"] });

    setTimeout(() => { try { obs.disconnect(); } catch {} }, 20000);
  })();
})();
