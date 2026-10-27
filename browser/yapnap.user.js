// ==UserScript==
// @name         Yapnap (unofficial)
// @namespace    https://yapnap.pages.dev
// @version      1.0.1
// @description  Unofficial Yapnap tools for Yapper: an optional menu toggle to hide the top brand. Off by default.
// @author       Yapnap
// @match        https://www.yapper.website/*
// @match        https://yapper.website/*
// @match        https://rt.yapper.website/*
// @match        https://lk.yapper.website/*
// @run-at       document-idle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addStyle
// @grant        GM_registerMenuCommand
// ==/UserScript==

(function () {
  'use strict';

  const DEFAULTS = { hideBrand: false };
  const get = (key) => GM_getValue(key, DEFAULTS[key]);

  let hideStyle = null;
  function applyHideBrand() {
    if (get('hideBrand')) {
      if (!hideStyle) hideStyle = GM_addStyle('.topbar-brand{display:none!important}');
    } else if (hideStyle) {
      hideStyle.remove();
      hideStyle = null;
    }
  }

  GM_registerMenuCommand(`Hide the top brand: ${get('hideBrand') ? 'on' : 'off'} (click to switch)`, () => {
    GM_setValue('hideBrand', !get('hideBrand'));
    applyHideBrand();
  });

  applyHideBrand();
})();
