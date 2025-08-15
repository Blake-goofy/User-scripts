// ==UserScript==
// @name         MultiTwitch Auto-Unmute (once per player)
// @namespace    https://github.com/Blake-goofy/User-scripts
// @version      1.0.0
// @description  Auto-clicks Unmute on Twitch players embedded on multitwitch.tv, once per player/frame
// @match        https://www.multitwitch.tv/*
// @run-at       document-idle
// @grant        none
// @author       Blake Becker
// @downloadURL  https://raw.githubusercontent.com/Blake-goofy/User-scripts/main/multitwitch-auto-unmute.user.js
// @updateURL    https://raw.githubusercontent.com/Blake-goofy/User-scripts/main/multitwitch-auto-unmute.user.js
// ==/UserScript==

(function () {
  "use strict";

  // Show as "running" on the multitwitch page, but do nothing there.
  if (location.hostname === "multitwitch.tv" || location.hostname === "www.multitwitch.tv") {
    return;
  }

  // Only act inside Twitch player iframes that came from multitwitch
  const isTwitchPlayer = location.hostname === "player.twitch.tv";
  const fromMultiTwitch = document.referrer && /(^|\/\/)www?\.multitwitch\.tv/.test(document.referrer);
  if (!isTwitchPlayer || !fromMultiTwitch) return;

  // One-time guard per frame/tab URL
  const key = "mt_unmuted_once:" + location.href;
  if (sessionStorage.getItem(key) === "1") return;

  const BUTTON_SEL = '[data-a-target="player-mute-unmute-button"][aria-label^="Unmute"]';

  const tryClick = () => {
    const btn = document.querySelector(BUTTON_SEL);
    if (btn) {
      btn.click();
      sessionStorage.setItem(key, "1");
      return true;
    }
    return false;
  };

  // Try immediately, then poll briefly for late UI mounts
  if (tryClick()) return;
  const start = Date.now();
  const poll = setInterval(() => {
    if (tryClick() || Date.now() - start > 15000) clearInterval(poll);
  }, 250);
})();
