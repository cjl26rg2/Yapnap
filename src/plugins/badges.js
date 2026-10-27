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

  // Every rank icon looks the same size. The artwork does not fill its frame the same way (the developer icon fills all
  // of it, the owner icon only about four fifths), so each icon's frame is sized from its own artwork: the visible part
  // is 16 px in the member list, 20 px on a profile card and 13 px in the small pill beside a name. The numbers are the
  // largest visible side of each 128 px artwork, measured from the art.
  var RANK_CONTENT = {
    owner: 101, 'co-owner': 101, manager: 101, admin: 102, mod: 102, contributor: 102,
    supporter: 124, advertiser: 124, sponsor: 124, partner: 124,
    designer: 123, developer: 123, friend: 123, translator: 123, helper: 123, veteran: 123, artist: 123, tester: 123
  };
  var RANK_CSS = Object.keys(RANK_CONTENT).map(function (tier) {
    var scale = 128 / RANK_CONTENT[tier];
    var icon = (16 * scale).toFixed(1);
    var row = (20 * scale).toFixed(1);
    var pill = (13 * scale).toFixed(1);
    return '.ym-badge-icon.ym-tier-' + tier + ' img{width:' + icon + 'px!important;height:' + icon + 'px!important}' +
      '.badge-row .ym-badge-icon.ym-tier-' + tier + ' img{width:' + row + 'px!important;height:' + row + 'px!important}' +
      '.ym-badge.ym-pill-' + tier + ' img{width:' + pill + 'px;height:' + pill + 'px}';
  }).join('');

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
      '.ym-badge-icon{display:inline-flex;vertical-align:middle;margin-left:4px}' +
      '.ym-badge-icon{background:none!important;border:0!important;padding:0!important;box-shadow:none!important}' +
      '.ym-badge-icon{position:relative}' +
      '.ym-badge-icon img{width:16px!important;height:16px!important}' +
      '.badge-row .ym-badge-icon img{width:20px!important;height:20px!important}' +
      RANK_CSS +
      '.badge-row:has(> .ym-badge-icon:only-child){justify-content:center!important;align-items:center!important}' +
      '#ym-rank-tip{display:none;position:fixed;z-index:2147483000;width:240px;max-width:260px;padding:11px 14px 12px;border-radius:10px;border:1px solid var(--border,#ffffff12);background:var(--bg-float,#1e1f22);box-shadow:0 10px 24px rgba(0,0,0,0.32);text-align:left;white-space:normal;pointer-events:none;font-weight:400;font-style:normal;letter-spacing:normal;text-transform:none}' +
      '#ym-rank-tip strong{display:block;font-size:13.5px;font-weight:650;letter-spacing:-0.01em;margin-bottom:3px;color:var(--text,#f2f3f5)}' +
      '#ym-rank-tip span{display:block;font-size:12.5px;font-weight:400;line-height:1.5;color:var(--text-muted,#9c9daa)}' +
      '.ym-avatar-badge{position:absolute;right:-4px;bottom:-4px;display:flex;pointer-events:none;z-index:2}' +
      '.ym-avatar-badge img{width:18px;height:18px;display:block}',
    start: function (ctx) {
      var tiers = ctx.badges.tiers || {};
      var users = ctx.badges.users || {};

      function chip(tierId, entry, tier) {
        var badge = document.createElement('span');
        badge.className = 'ym-badge ym-pill-' + tierId;
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
      // The account ID is in the picture's address. Some places use another path than /avatars/, so any ID-shaped
      // part of the address counts.
      var ANY_ID = /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/;
      function avatarId(img) {
        var src = img.getAttribute('src') || '';
        var m = AVATAR_ID.exec(src) || ANY_ID.exec(src);
        return m ? m[m.length - 1].toLowerCase() : null;
      }

      // Rank icons sit where the other badges are: in the member list next to the name, and on a profile card in its
      // badge row. The avatar corner is not used, because the do-not-disturb dot covers it.
      // What each rank says when you hover over it, the same way the Artist badge does.
      var RANK_NOTES = {
        owner: 'Runs Yapnap, an unofficial app for Yapin\u2019.',
        'co-owner': 'Helps run Yapnap, an unofficial app for Yapin\u2019.',
        admin: 'Looks after Yapnap, an unofficial app for Yapin\u2019.',
        manager: 'Manages the Yapnap community and the people in it.',
        mod: 'Keeps the Yapnap community in order.',
        contributor: 'Helps build Yapnap.',
        advertiser: 'Helps spread the word about Yapnap.',
        partner: 'Works with Yapnap on shared projects.',
        sponsor: 'Supports Yapnap.',
        supporter: 'Supports Yapnap.',
        translator: 'Translates Yapnap into other languages.',
        artist: 'Makes art for Yapnap.',
        designer: 'Designs parts of Yapnap.',
        developer: 'Writes code for Yapnap.',
        tester: 'Tests Yapnap and reports bugs.',
        helper: 'Helps people use Yapnap.',
        veteran: 'Has been around since the early days of Yapnap.',
        friend: 'A friend of Yapnap.'
      };


      // One tooltip for every rank icon. It sits on the page itself, not inside the badge, so a card or list that hides
      // overflow cannot cut it off.
      var tipEl = null;
      function showRankTip(icon) {
        if (!tipEl) {
          tipEl = document.createElement('div');
          tipEl.id = 'ym-rank-tip';
          document.body.appendChild(tipEl);
        }
        tipEl.textContent = '';
        var title = document.createElement('strong');
        title.textContent = icon.ymTitle;
        var note = document.createElement('span');
        note.textContent = icon.ymNote;
        tipEl.appendChild(title);
        tipEl.appendChild(note);
        tipEl.style.display = 'block';
        var r = icon.getBoundingClientRect();
        var w = tipEl.offsetWidth;
        var h = tipEl.offsetHeight;
        var left = Math.max(8, Math.min(window.innerWidth - w - 8, r.left + r.width / 2 - w / 2));
        var top = r.top - h - 10;
        if (top < 8) top = r.bottom + 10;
        tipEl.style.left = left + 'px';
        tipEl.style.top = top + 'px';
      }

      function hideRankTip() {
        if (tipEl) tipEl.style.display = 'none';
      }

      function iconChip(tierName, tier) {
        var icon = document.createElement('span');
        icon.className = 'ym-badge ym-badge-icon ym-tier-' + tierName;
        icon.ymTitle = 'Yapnap ' + tier.label;
        icon.ymNote = RANK_NOTES[tierName] || 'A Yapnap role, given out by the owner and admins.';
        var src = window.YAPNAP_ART ? window.YAPNAP_ART.src('badge-' + tierName) : '';
        if (src) {
          var picture = document.createElement('img');
          picture.alt = '';
          picture.src = src;
          icon.appendChild(picture);
        } else {
          icon.textContent = tier.label;
        }
        icon.addEventListener('mouseenter', function () { showRankTip(icon); });
        icon.addEventListener('mouseleave', hideRankTip);
        return icon;
      }

      // Who a row or card belongs to right now: the first picture of a person in a member row, or the large profile picture
      // beside a badge row. The page reuses rows and cards for other people as you scroll, so this is checked each pass.
      function currentOwnerOf(icon) {
        // A badge row belongs to the profile beside it, even when the row sits inside a button.
        var badgeRow = icon.closest('.badge-row');
        var row = badgeRow ? null : icon.closest('button, li');
        if (row) {
          var pics = Array.prototype.slice.call(row.querySelectorAll('img'));
          for (var i = 0; i < pics.length; i++) {
            if (pics[i].closest('.ym-badge')) continue;
            var found = avatarId(pics[i]);
            if (found) return found;
          }
          return null;
        }
        var badgeRow = icon.closest('.badge-row');
        for (var up = badgeRow && badgeRow.parentElement, step = 0; up && step < 7; up = up.parentElement, step++) {
          var big = Array.prototype.slice.call(up.querySelectorAll('img')).filter(function (p) {
            return p.getBoundingClientRect().width >= 64 && avatarId(p);
          })[0];
          if (big) return avatarId(big);
        }
        return null;
      }

      // Removes a rank icon that no longer belongs to the person beside it, so it never stays on a stranger.
      function cleanStaleIcons() {
        document.querySelectorAll('.ym-badge-icon').forEach(function (icon) {
          if (currentOwnerOf(icon) !== icon.dataset.ymId) icon.remove();
        });
      }

      function decorateAvatars(node) {
        if (!node || !node.querySelectorAll) return;
        var imgs = node.tagName === 'IMG' ? [node] : Array.prototype.slice.call(node.querySelectorAll('img'));
        imgs.forEach(function (img) {
          if (img.closest('.msg') || img.closest('.ym-badge') || img.closest('[class*="rail"]')) return;
          // Your own name bar is not a member row, so it never gets a rank.
          if (img.closest('.user-bar')) return;
          var src = img.getAttribute('src') || '';
          if (/\/icons\//.test(src)) return;
          // Only small, square pictures are people's pictures. Banners and wide logos are left alone, and a picture
          // that has not loaded yet has no size, so it is checked again on the next pass.
          var box = img.getBoundingClientRect();
          if (!box.width || !box.height || box.width > 240 || box.width < 16 || Math.max(box.width, box.height) / Math.min(box.width, box.height) > 1.1) return;
          var id = avatarId(img);
          var entry = id && Object.prototype.hasOwnProperty.call(users, id) ? users[id] : null;
          var tier = entry && Object.prototype.hasOwnProperty.call(tiers, entry.tier) ? tiers[entry.tier] : null;
          if (!tier) return;

          // Member list: the name gets the icon, after the other badges.
          // Member-list pictures are small. A large picture (a profile) has its own badge row, so it never reaches this.
          var row = box.width < 64 ? img.closest('button, li') : null;
          if (row && !row.querySelector('.ym-badge-icon[data-ym-id="' + id + '"]')) {
            var icon = iconChip(entry.tier, tier);
            icon.dataset.ymId = id;
            // Right after the last badge in the name line, so it sits on the same line as the others.
            var others = Array.prototype.slice.call(row.querySelectorAll('img, svg')).filter(function (b) {
              return b !== img && !b.closest('.avatar') && !b.closest('.ym-badge-icon');
            });
            if (others.length) {
              others[others.length - 1].insertAdjacentElement('afterend', icon);
            } else {
              var name = row.querySelector('.pick-row-text') || row.lastElementChild;
              if (name) name.appendChild(icon);
            }
          }

          // Profile card: the icon goes in the badge row, with the other badges. The card has no fixed class, so the
          // badge row is looked for by walking up a few steps from the picture.
          // Only a large picture (a profile picture) gets the icon there, and only from nearby, so small list pictures
          // never reach a badge row that belongs to someone else.
          var badgeRow = null;
          if (box.width >= 64) {
            for (var up = img.parentElement, step = 0; up && step < 7 && !badgeRow; up = up.parentElement, step++) {
              badgeRow = up.querySelector('.badge-row');
            }
          }
          if (badgeRow && !badgeRow.querySelector('.ym-badge-icon')) { var card = iconChip(entry.tier, tier); card.dataset.ymId = id; badgeRow.appendChild(card); }
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
      // Pictures can be swapped or redrawn without new elements, so look over the page again every 2 seconds.
      var rescan = setInterval(function () { decorateAvatars(document.body); cleanStaleIcons(); }, 2000);

      return function stop() {
        clearInterval(timer);
        clearInterval(rescan);
        hideRankTip();
        if (tipEl) tipEl.remove();
        tipEl = null;
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
