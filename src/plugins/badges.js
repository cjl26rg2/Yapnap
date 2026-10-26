// Contributor badges. Yapnap shows a small badge beside the name of every listed account, for everyone who runs it.
// It is part of Yapnap itself: there is no setting for it. Each account is found from its avatar address, and no
// account ID is ever shown on screen. Yapnap also finds your own account from the user bar, so roles follow it.
(function (Y) {
  'use strict';

  var AVATAR_ID = /\/avatars\/([0-9a-fA-F-]{36})\//;
  var root = window;
  if (!root.__yapnapSeen) root.__yapnapSeen = {};
  if (root.__yapnapMe === undefined) root.__yapnapMe = '';

  // The account behind a name: its avatar address. A reply preview has its own avatar, so those are skipped.
  function userIdFor(author) {
    var msg = author.closest('.msg') || author;
    var pictures = Array.prototype.slice.call(msg.querySelectorAll('img[src*="/avatars/"]'));
    for (var p = 0; p < pictures.length; p++) {
      if (pictures[p].closest('[class*="reply"]')) continue;
      var found = AVATAR_ID.exec(pictures[p].getAttribute('src') || '');
      if (found) return found[1].toLowerCase();
    }
    return null;
  }

  // Your own account: the avatar in the user bar. Remembered in the settings, so roles follow it.
  function detectSelf() {
    var bar = document.querySelector('.user-bar');
    if (!bar) return;
    var img = bar.querySelector('img[src*="/avatars/"]');
    var found = img ? AVATAR_ID.exec(img.getAttribute('src') || '') : null;
    if (!found) return;
    var id = found[1].toLowerCase();
    if (id === root.__yapnapMe) return;
    root.__yapnapMe = id;
    if (root.yapnap && root.yapnap.setApp) root.yapnap.setApp('myId', id).catch(function () { /* settings unavailable */ });
  }

  Y.add({
    id: 'contributor-badges',
    name: 'Contributor badges',
    desc: 'Shows Yapnap badges beside names. Part of Yapnap itself.',
    category: 'Core',
    core: true,
    css: '.ym-badge{display:inline-flex;align-items:center;gap:5px;margin-left:6px;padding:1px 8px 1px 3px;border-radius:999px;' +
      'background:color-mix(in srgb,var(--ym-tier,#888) 16%,transparent);color:var(--ym-tier,#888);font-size:11px;font-weight:750;' +
      'letter-spacing:.01em;line-height:17px;vertical-align:middle;white-space:nowrap;user-select:none}' +
      '.ym-badge img{width:14px;height:14px;display:block}' +
      '.ym-avatar-badge{position:absolute;right:-4px;bottom:-4px;display:flex;pointer-events:none;z-index:2}' +
      '.ym-avatar-badge img{width:16px;height:16px;display:block}',
    start: function (ctx) {
      var tiers = ctx.badges.tiers || {};
      var users = ctx.badges.users || {};

      function chip(tierId, entry, tier) {
        var badge = document.createElement('span');
        badge.className = 'ym-badge';
        badge.style.setProperty('--ym-tier', tier.color);
        var src = root.YAPNAP_ART ? root.YAPNAP_ART.src('badge-' + tierId) : '';
        if (src) {
          var img = document.createElement('img');
          img.alt = '';
          img.src = src;
          badge.appendChild(img);
        }
        badge.appendChild(document.createTextNode(tier.label));
        badge.title = 'Yapnap ' + tier.label.toLowerCase();
        return badge;
      }

      // Avatars outside chat messages: the member list, profile cards and popups, and your own user bar.
      function avatarId(img) {
        var m = AVATAR_ID.exec(img.getAttribute('src') || '');
        return m ? m[1].toLowerCase() : null;
      }

      function decorateAvatars(node) {
        if (!node.querySelectorAll) return;
        var imgs = node.matches && node.matches('img[src*="/avatars/"]') ? [node] : Array.prototype.slice.call(node.querySelectorAll('img[src*="/avatars/"]'));
        imgs.forEach(function (img) {
          if (img.closest('.msg') || img.dataset.ymAvatar) return;
          img.dataset.ymAvatar = '1';
          var id = avatarId(img);
          var entry = id && Object.prototype.hasOwnProperty.call(users, id) ? users[id] : null;
          var tier = entry && Object.prototype.hasOwnProperty.call(tiers, entry.tier) ? tiers[entry.tier] : null;
          if (!tier || !img.parentElement) return;

          var holder = img.parentElement;
          if (window.getComputedStyle(holder).position === 'static') holder.style.position = 'relative';
          var mark = document.createElement('span');
          mark.className = 'ym-avatar-badge';
          mark.title = 'Yapnap ' + tier.label.toLowerCase();
          var src = window.YAPNAP_ART ? window.YAPNAP_ART.src('badge-' + entry.tier) : '';
          if (src) {
            var picture = document.createElement('img');
            picture.alt = '';
            picture.src = src;
            mark.appendChild(picture);
          }
          holder.appendChild(mark);

          // A profile card also gets the text badge in its row of badges.
          var card = img.closest('.profile-card');
          if (card && !card.dataset.ymProfile) {
            var row = card.querySelector('.badge-row');
            if (row) {
              card.dataset.ymProfile = '1';
              row.appendChild(chip(entry.tier, entry, tier));
            }
          }
        });
      }

      function decorate(node) {
        if (!node.querySelectorAll) return;
        var authors = node.matches && node.matches('.msg-author') ? [node] : Array.prototype.slice.call(node.querySelectorAll('.msg-author'));
        authors.forEach(function (author) {
          if (author.dataset.ymBadged) return;
          author.dataset.ymBadged = '1';
          var id = userIdFor(author);
          if (!id) return;
          var name = (author.textContent || '').trim().slice(0, 40);
          if (name && !root.__yapnapSeen[id]) root.__yapnapSeen[id] = name;
          var entry = Object.prototype.hasOwnProperty.call(users, id) ? users[id] : null;
          var tier = entry && Object.prototype.hasOwnProperty.call(tiers, entry.tier) ? tiers[entry.tier] : null;
          if (!tier) return;
          author.insertAdjacentElement('afterend', chip(entry.tier, entry, tier));
        });
      }

      decorate(document.body);
      decorateAvatars(document.body);
      var observer = new MutationObserver(function (records) {
        records.forEach(function (r) {
          r.addedNodes.forEach(function (n) {
            if (n.nodeType === 1) { decorate(n); decorateAvatars(n); }
          });
        });
      });
      observer.observe(document.body, { childList: true, subtree: true });
      detectSelf();
      var timer = setInterval(detectSelf, 5000);

      return function stop() {
        clearInterval(timer);
        observer.disconnect();
        document.querySelectorAll('.ym-badge').forEach(function (b) { b.remove(); });
        document.querySelectorAll('[data-ym-badged]').forEach(function (a) { delete a.dataset.ymBadged; });
        document.querySelectorAll('.ym-avatar-badge').forEach(function (b) { b.remove(); });
        document.querySelectorAll('[data-ym-avatar]').forEach(function (a) { delete a.dataset.ymAvatar; });
        document.querySelectorAll('[data-ym-profile]').forEach(function (c) { delete c.dataset.ymProfile; });
      };
    }
  });
})(window.YAPNAP);
