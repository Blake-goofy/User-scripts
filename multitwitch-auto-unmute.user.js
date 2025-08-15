// ==UserScript==
// @name         MultiTwitch Auto-Unmute (once per player)
// @namespace    https://github.com/Blake-goofy/User-scripts
// @version      1.0.0
// @description  Auto-clicks Unmute on Twitch players embedded on multitwitch.tv, once per player/frame
// @match        https://multitwitch.tv/*
// @run-at       document-idle
// @grant        none
// @downloadURL  https://raw.githubusercontent.com/Blake-goofy/User-scripts/main/multitwitch-auto-unmute.user.js
// @updateURL    https://raw.githubusercontent.com/Blake-goofy/User-scripts/main/multitwitch-auto-unmute.user.js
// ==/UserScript==

(function () {
  "use strict";

  // Helper: wait for a selector with a timeout
  function waitForSelector(sel, { interval = 200, timeout = 15000 } = {}) {
    return new Promise((resolve, reject) => {
      const start = Date.now();
      const handle = setInterval(() => {
        const el = document.querySelector(sel);
        if (el) {
          clearInterval(handle);
          resolve(el);
        } else if (Date.now() - start > timeout) {
          clearInterval(handle);
          reject(new Error("Timeout waiting for selector: " + sel));
        }
      }, interval);
    });
  }

  // Only unmute inside Twitch player frames that were embedded by multitwitch.tv
  const isTwitchPlayer = location.hostname === "player.twitch.tv";
  const fromMultiTwitch = document.referrer && /(^|\/\/)multitwitch\.tv/.test(document.referrer);

  if (!isTwitchPlayer) {
    // Nothing to do on multitwitch.tv main page; the real work happens in player iframes.
    return;
  }

  if (!fromMultiTwitch) {
    // Do not affect standalone Twitch players or other sites.
    return;
  }

  // One-time guard per frame/session so we don't re-unmute after the first click
  const key = "mt_unmuted_once:" + location.href;
  if (sessionStorage.getItem(key) === "1") {
    return;
  }

  // Target the Twitch player's mute/unmute button when it shows "Unmute"
  const BUTTON_SEL = '[data-a-target="player-mute-unmute-button"][aria-label^="Unmute"]';

  waitForSelector(BUTTON_SEL)
    .then((btn) => {
      // Click once to unmute
      btn.click();

      // Mark done for this frame
      sessionStorage.setItem(key, "1");
    })
    .catch(() => {
      // Silent fail. Some browsers block autoplay with sound, or UI changed.
    });
})();
