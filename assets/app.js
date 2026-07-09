/* ===========================================================================
   Bravo Korea — Community  ·  Responsive website (PC web + mobile web)
   Vanilla JS · hash router · localStorage · deep-link share + attribution
   =========================================================================== */

const LINK_BASE = "https://go.bravokorea.app/p";  // trackable universal link
const APP_SCHEME = "bravokorea://post";           // native deep link
const APP_DEEPLINK = "https://abr.ge/27gghb";     // Bravo Korea app download deep link (Airbridge)

/* App-download deep link. Inside a post, the post id rides along as a param
   so installs attribute back to the exact post. */
function appDownloadLink(postId) {
  return postId ? `${APP_DEEPLINK}?post_id=${encodeURIComponent(postId)}` : APP_DEEPLINK;
}

/* ------------------------------------------------------------ persistence */
const DB = {
  load(k, f) { try { const v = localStorage.getItem("bk_" + k); return v ? JSON.parse(v) : f; } catch { return f; } },
  save(k, v) { localStorage.setItem("bk_" + k, JSON.stringify(v)); },
};

const SCHEMA = 4; // bump to reseed when data model changes
if (DB.load("schema", 0) !== SCHEMA) {
  localStorage.removeItem("bk_posts"); localStorage.removeItem("bk_track");
  DB.save("schema", SCHEMA);
}

let POSTS = DB.load("posts", null);
if (!POSTS) { POSTS = SEED_POSTS.map((p) => ({ ...p })); DB.save("posts", POSTS); }

let TRACK = DB.load("track", null);
if (!TRACK) {
  TRACK = {};
  const seedFunnel = { p_free11:[88,540,71], p_food08:[71,430,58], p_pre04:[97,610,74],
    p_job03:[63,380,44], p_ktr01:[41,250,29], p_meet10:[45,300,38], p_hou07:[58,360,41],
    p_vsa02:[28,190,22], p_stu05:[34,210,25], p_mny06:[22,140,15], p_mkt09:[6,40,4] };
  for (const [id, [s, c, g]] of Object.entries(seedFunnel)) TRACK[id] = { shares: s, clicks: c, signups: g };
  DB.save("track", TRACK);
}
function funnel(id) { return TRACK[id] || (TRACK[id] = { shares: 0, clicks: 0, signups: 0 }); }

let LIKED = DB.load("liked", {});
let sortMode = "hot";

/* --------------------------------------------------------------- helpers */
const $ = (s, r = document) => r.querySelector(s);
const el = (t, c, h) => { const n = document.createElement(t); if (c) n.className = c; if (h != null) n.innerHTML = h; return n; };
const esc = (s) => String(s).replace(/[&<>"]/g, (m) => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;" }[m]));
function hashStr(s){ let h=0; for(let i=0;i<s.length;i++){ h=(h*31+s.charCodeAt(i))|0; } return h; }
const rndId = () => "p_" + Math.abs(hashStr(Date.now() + "" + POSTS.length)).toString(36).slice(0, 6);

function ago(min) {
  if (min < 1) return "just now";
  if (min < 60) return `${Math.round(min)}m ago`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return d < 7 ? `${d}d ago` : `${Math.floor(d/7)}w ago`;
}
function nowMinFor(p){ return p.createdAt ? (Date.now() - p.createdAt) / 60000 : p.agoMin; }
function avatarColor(name){ const c=["#2E6BF6","#FF7A00","#0FB5A6","#7A5CFF","#FF4D8D","#00A676","#E0A500"]; return c[Math.abs(hashStr(name))%c.length]; }
function initials(n){ return n.split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase(); }
function ytId(url){ if(!url) return null; const m = String(url).match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/); return m ? m[1] : null; }
function nfmt(n){ return n >= 1000 ? (n/1000).toFixed(n<10000?1:0).replace(/\.0$/,"") + "k" : String(n); }
function views(p){ return 200 + Math.abs(hashStr(p.id)) % 1400 + p.likes * 3; }
function excerptOf(p){ return p.body.replace(/\n+/g," ").trim(); }

/* ------------------------------------------------------------------ icons */
const IC = {
  eye:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="2.6"/></svg>',
  like: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M7 22V11l4.5-8c1.3 0 2.3 1.1 2.1 2.4L13 9h5.3c1.3 0 2.3 1.2 2 2.5l-1.6 7c-.2 1-1.1 1.7-2.1 1.7H7z"/><path d="M7 11H4v11h3"/></svg>',
  chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 12a8 8 0 0 1-11.6 7.1L3 21l1.9-6.4A8 8 0 1 1 21 12z"/></svg>',
  share:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7"/><path d="M16 6l-4-4-4 4"/><path d="M12 2v13"/></svg>',
  back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1"><path d="M15 5l-7 7 7 7"/></svg>',
  chevR:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6l6 6-6 6"/></svg>',
  sort: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4v16M4 17l3 3 3-3M17 20V4M14 7l3-3 3 3"/></svg>',
  pencil:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>',
};

const app = $("#app");

/* Bravo Korea official logo (white variant) — for dark brand surfaces */
const BRAND_LOGO = `<img class="brand-svg" src="assets/bk-logo-white.svg?v=11" alt="Bravo Korea" width="150" height="22">`;

/* =============================================================== ROUTER */
function render() {
  const [, route, arg] = (location.hash || "#/").split("/");
  window.scrollTo(0, 0);
  closeSearch();
  closeDrawer();
  updateActiveNav(route, arg);
  if (route !== "visa" && typeof removeScoreBar === "function") removeScoreBar();
  if (route === "p" && arg)  return renderDetail(arg);
  if (route === "new")       return renderCompose();
  if (route === "track")     return renderDashboard();
  if (route === "event" && arg) return renderEventDetail(arg);
  if (route === "events")    return renderEvents(arg);
  if (route === "visa")      return renderVisa(arg);
  return renderFeed(route === "c" ? arg : null);
}

/* ------------------------------------------------------------- sort/list */
function sortPosts(list) {
  const arr = [...list];
  if (sortMode === "new") arr.sort((a, b) => nowMinFor(a) - nowMinFor(b));
  else arr.sort((a, b) => score(b) - score(a));
  return arr.sort((a, b) => (b.notice?1:0) - (a.notice?1:0));
}
function score(p) {
  const f = funnel(p.id);
  return (p.likes + p.comments * 2 + f.shares * 3) / Math.pow(nowMinFor(p) / 60 + 2, 0.6);
}

function postItem(p, showCat) {
  const c = CAT_MAP[p.cat];
  const f = funnel(p.id);
  const liked = LIKED[p.id];
  const yid = ytId(p.youtube);
  const item = el("article", "pi");

  let thumb = "";
  if (p.image) thumb = `<div class="pi__thumb"><img src="${p.image}" alt=""></div>`;
  else if (yid) thumb = `<div class="pi__thumb yt"><img src="https://i.ytimg.com/vi/${yid}/mqdefault.jpg" alt=""></div>`;

  const meta = p.notice ? "" : `
    <div class="pi__meta">
      <span class="who">${esc(p.author)}</span><span class="dot"></span>${ago(nowMinFor(p))}
      ${showCat ? `<span class="dot"></span><span class="cpill" style="color:${c.color}">${esc(c.label)}</span>` : ""}
    </div>`;
  const stats = p.notice ? "" : `
    <div class="pi__stats">
      <span class="stat-i">${IC.eye}${nfmt(views(p))}</span>
      <span class="stat-i ${liked?"liked":""}">${IC.like}${nfmt(p.likes + (liked?1:0))}</span>
      <span class="stat-i">${IC.chat}${nfmt(p.comments)}</span>
    </div>`;

  item.innerHTML = `
    <div class="pi__main">
      ${meta}
      <h3 class="pi__title">${p.notice?'<span class="notice">공지</span>':""}${esc(p.title)}</h3>
      <p class="pi__sub">${esc(excerptOf(p))}</p>
      ${stats}
    </div>
    ${thumb}`;
  item.onclick = () => location.hash = `#/p/${p.id}`;
  return item;
}

/* --------------------------------------------------------------- FEED */
function renderFeed(catId) {
  const cat = catId ? CAT_MAP[catId] : null;
  const list = sortPosts(POSTS.filter((p) => cat ? (p.cat === catId || p.notice) : true));

  app.innerHTML = "";
  const wrap = el("div", "wrap");
  const layout = el("div", "layout");
  layout.appendChild(sidebarEl(catId));

  const feed = el("section", "feed");

  // mobile hero banner (og image) — only on 전체 (no category); mobile only; taps through to the app
  if (!cat) {
    const hero = el("a", "mhero");
    hero.href = APP_DEEPLINK; hero.target = "_blank"; hero.rel = "noopener";
    hero.setAttribute("aria-label", "Bravo Korea — get the app");
    hero.innerHTML = `<img src="assets/og.png?v=19" alt="Bravo Korea — community for foreigners living in Korea" width="1200" height="630" loading="eager">`;
    feed.appendChild(hero);
  }

  // mobile category tiles
  const mcats = el("div", "mcats");
  const allTile = el("a", "mtile", `<div class="mtile__ico" style="background:${cat?'':'var(--blue-tint)'};${cat?'':'color:var(--blue)'}">🏠</div><div class="mtile__lab">전체</div>`);
  allTile.href = "#/"; if (!cat) { allTile.querySelector('.mtile__ico').style.background = 'var(--blue-tint)'; allTile.querySelector('.mtile__ico').style.color='var(--blue)'; }
  mcats.appendChild(allTile);
  CATEGORIES.forEach((c) => {
    const a = el("a", "mtile", `<div class="mtile__ico" style="background:${c.color}18;color:${c.color}">${c.icon}</div><div class="mtile__lab">${esc(c.label)}</div>`);
    a.href = `#/c/${c.id}`; mcats.appendChild(a);
  });
  feed.appendChild(mcats);

  // mobile-only visa calculator banner — same spot on every community view
  // (all categories + home): right after the tiles divider, before the header.
  {
    const vb = el("a", "visa-banner");
    vb.href = "#/visa";
    vb.innerHTML = `<span class="visa-banner__ico">🛂</span>
      <span class="visa-banner__tx"><span class="visa-banner__t">내 비자 점수 3분 만에 알아보기</span>
      <span class="visa-banner__s">D-10 · E-7-4 · F-2-7 실시간 계산</span></span>
      <span class="visa-banner__go">${IC.chevR}</span>`;
    feed.appendChild(vb);
  }

  // header
  if (cat) {
    const ch = el("div", "cathead");
    ch.innerHTML = `<div class="cathead__ico" style="background:${cat.color}18;color:${cat.color}">${cat.icon}</div>
      <div><div class="cathead__t">${esc(cat.label)}</div><div class="cathead__s">${cat.en} community · ${list.filter(p=>!p.notice).length} posts</div></div>`;
    feed.appendChild(ch);
    const tabs = SUBTABS[catId] || ["All"];
    const fbar = el("div", "filters");
    tabs.forEach((t, i) => fbar.appendChild(el("button", "fchip" + (i===0?" on":""), esc(t))));
    fbar.querySelectorAll(".fchip").forEach((b) => b.onclick = () => { fbar.querySelectorAll(".fchip").forEach(x=>x.classList.remove("on")); b.classList.add("on"); });
    feed.appendChild(fbar);
  } else {
    const head = el("div", "feed__head");
    head.innerHTML = `<div><h1 class="feed__ttl">커뮤니티 추천글</h1>
      <div class="feed__meta">${list.length} posts from foreigners living in Korea</div></div>`;
    head.appendChild(sortBtn());
    feed.appendChild(head);
  }
  if (cat) { const sr = el("div","feed__head"); sr.style.marginTop="-2px"; sr.innerHTML='<span></span>'; sr.appendChild(sortBtn()); feed.appendChild(sr); }

  const plist = el("div", "plist");
  if (!list.length) plist.appendChild(el("div", "empty", `<div class="empty__em">🫧</div>아직 글이 없어요 — 앱에서 대화를 시작해 보세요.`));
  else list.forEach((p) => plist.appendChild(postItem(p, !cat)));
  feed.appendChild(plist);

  layout.appendChild(feed);
  layout.appendChild(railEl());
  wrap.appendChild(layout);
  app.appendChild(wrap);
  app.appendChild(footEl());
}

function sortBtn() {
  const b = el("button", "sort", `${sortMode==="new"?"최신글":"인기글"} ${IC.sort}`);
  b.onclick = () => { sortMode = sortMode==="new"?"hot":"new"; render(); };
  return b;
}

function sidebarEl(activeId, activeEvents) {
  const side = el("aside", "side");

  // --- 커뮤니티 section
  const nav = el("nav", "snav");
  const allLink = el("a", (!activeId && !activeEvents) ? "on" : "", `<span class="snav__ico" style="background:var(--blue-tint);color:var(--blue)">🏠</span>전체 커뮤니티`);
  allLink.href = "#/"; nav.appendChild(allLink);
  CATEGORIES.forEach((c) => {
    const a = el("a", activeId === c.id ? "on" : "", `<span class="snav__ico" style="background:${c.color}18;color:${c.color}">${c.icon}</span>${esc(c.label)}`);
    a.href = `#/c/${c.id}`; nav.appendChild(a);
  });
  side.innerHTML = `<div class="side__h">커뮤니티</div>`;
  side.appendChild(nav);

  // --- 이벤트 section (same gray heading as 커뮤니티)
  side.appendChild(el("div", "side__h side__h--gap", "이벤트"));
  const evNav = el("nav", "snav");
  const ong = el("a", activeEvents === "ongoing" ? "on" : "", `<span class="snav__ico" style="background:#FFEEDF;color:var(--brand-orange)">🎟️</span>진행 중 이벤트`);
  ong.href = "#/events/ongoing";
  evNav.append(ong);
  side.appendChild(evNav);

  const app = el("div", "panel panel--app side__app");
  app.innerHTML = `<div class="app-logo">${BRAND_LOGO}</div>
    <a class="btn btn--white btn--full" href="${APP_DEEPLINK}" target="_blank" rel="noopener">Get the app ${IC.chevR}</a>`;
  side.appendChild(app);
  return side;
}

function railEl() {
  const rail = el("aside", "rail");
  const trend = el("div", "panel");
  trend.innerHTML = `<div class="panel__k">🔥 지금 뜨는 글</div>`;
  sortPosts(POSTS.filter(p=>!p.notice)).slice(0, 5).forEach((p, i) => {
    const f = funnel(p.id);
    const t = el("div", "trend", `<div class="trend__n">${i+1}</div><div><div class="trend__t">${esc(p.title)}</div><div class="trend__m">${nfmt(p.likes)} likes · ${nfmt(f.shares)} shares</div></div>`);
    t.onclick = () => location.hash = `#/p/${p.id}`;
    trend.appendChild(t);
  });
  rail.appendChild(trend);
  return rail;
}

/* --------------------------------------------------------------- DETAIL */
function renderDetail(id) {
  const p = POSTS.find((x) => x.id === id);
  if (!p) { location.hash = "#/"; return; }
  const c = CAT_MAP[p.cat];
  const f = funnel(p.id);
  const liked = LIKED[p.id];
  const yid = ytId(p.youtube);

  let media = "";
  if (p.image) media = `<div class="detail__media"><img src="${p.image}" alt=""></div>`;
  else if (yid) media = `<div class="detail__media"><div class="yt-embed"><div class="cover" data-yt="${yid}"><img src="https://i.ytimg.com/vi/${yid}/hqdefault.jpg" alt=""></div></div></div>`;

  app.innerHTML = "";
  const d = el("article", "center");
  d.innerHTML = `
    <a class="detail__cat" href="#/c/${c.id}" style="background:${c.color}14;color:${c.color}"><span class="dot" style="background:${c.color}"></span>${esc(c.label)} · ${c.en}</a>
    <h1 class="detail__title">${p.notice?'<span style="color:var(--blue)">공지 </span>':""}${esc(p.title)}</h1>
    <div class="detail__author">
      <div class="avatar" style="background:${avatarColor(p.author)}">${initials(p.author)}<span class="flag">${p.flag}</span></div>
      <div><div class="who__name">${esc(p.author)}</div><div class="who__meta">${ago(nowMinFor(p))} · ${nfmt(views(p))} views</div></div>
    </div>
    <div class="detail__body">${p.body.split("\n\n").map(par=>`<p>${esc(par)}</p>`).join("")}</div>
    ${media}
    <div class="cta-band">
      <div class="app-logo">${BRAND_LOGO}</div>
      <div class="cta-band__h">Everyone here is in Bravo Korea App.</div>
      <div class="cta-band__p">Get More Info and Benefits</div>
      <a class="btn btn--white" href="${appDownloadLink(p.id)}" target="_blank" rel="noopener">Join Now ${IC.chevR}</a>
    </div>
    <div class="sharebar sharebar--sm">
      <div class="sharebar__h">이 글 공유하기 <span>Share</span></div>
      ${shareRowHTML()}
    </div>
    <div class="actionbar">
      <button class="act ${liked?"liked":""}" data-like>${IC.like}<span>${nfmt(p.likes+(liked?1:0))}</span></button>
      <button class="act">${IC.chat}<span>${nfmt(p.comments)}</span></button>
      <button class="act act--share" data-share>${IC.share}<span>Share · ${nfmt(f.shares)}</span></button>
    </div>`;
  d.querySelector("[data-like]").onclick = () => { toggleLike(p.id); renderDetail(id); };
  d.querySelector("[data-share]").onclick = () => openShare(p);
  d.querySelectorAll(".shbtn").forEach(b => b.onclick = () => shareTo(b.dataset.ch, p));
  const cover = d.querySelector(".cover");
  if (cover) cover.onclick = () => { cover.parentElement.innerHTML = `<iframe src="https://www.youtube.com/embed/${cover.dataset.yt}?autoplay=1" allow="autoplay; encrypted-media" allowfullscreen></iframe>`; };
  app.appendChild(d);
  app.appendChild(footEl(true));
}

/* --------------------------------------------------------------- COMPOSE */
let draft = { cat: null, image: null };
function renderCompose() {
  draft = { cat: null, image: null };
  app.innerHTML = "";
  const wrap = el("div", "center");
  wrap.innerHTML = `
    <a class="back-link" href="#/">${IC.back} 취소</a>
    <div class="compose__card">
      <input class="compose__title-in" id="c-title" placeholder="사람들이 클릭할 제목을 써보세요…" maxlength="120">
      <div class="hint">구체적이고 진짜인 제목이 가장 많은 반응을 얻습니다.</div>
      <div class="field"><span class="field__l">카테고리</span><div class="catpick" id="c-cats"></div></div>
      <div class="field"><span class="field__l">내용</span>
        <textarea class="textarea" id="c-body" placeholder="배운 것, 실패한 것, 과거의 나에게 해주고 싶은 말을 나눠보세요…"></textarea></div>
      <div class="field"><span class="field__l">미디어 추가</span>
        <div class="upload">
          <label class="upl-btn">🖼️ 이미지 업로드<input type="file" id="c-img" accept="image/*" hidden></label>
          <input class="yt-in" id="c-yt" placeholder="📺 YouTube 링크 붙여넣기">
        </div>
        <div id="c-preview"></div>
      </div>
      <button class="btn btn--blue btn--full" id="c-submit" style="margin-top:26px;padding:15px">커뮤니티에 게시하기</button>
    </div>`;

  const catsBox = wrap.querySelector("#c-cats");
  CATEGORIES.forEach((c) => {
    const chip = el("button", "fchip", `${c.icon} ${esc(c.label)}`);
    chip.type = "button";
    chip.onclick = () => { draft.cat = c.id; catsBox.querySelectorAll(".fchip").forEach(x=>x.classList.remove("on")); chip.classList.add("on"); };
    catsBox.appendChild(chip);
  });
  wrap.querySelector("#c-img").onchange = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const r = new FileReader();
    r.onload = () => {
      draft.image = r.result;
      wrap.querySelector("#c-preview").innerHTML = `<div class="preview"><img src="${draft.image}"><button class="preview__x" id="c-rmimg">×</button></div>`;
      wrap.querySelector("#c-rmimg").onclick = () => { draft.image = null; wrap.querySelector("#c-preview").innerHTML=""; wrap.querySelector("#c-img").value=""; };
    };
    r.readAsDataURL(file);
  };
  wrap.querySelector("#c-submit").onclick = () => submitPost(wrap);
  app.appendChild(wrap);
  setTimeout(() => wrap.querySelector("#c-title").focus(), 60);
}

function submitPost(wrap) {
  const title = wrap.querySelector("#c-title").value.trim();
  const body  = wrap.querySelector("#c-body").value.trim();
  const yt    = wrap.querySelector("#c-yt").value.trim();
  if (!title)     return toast("제목을 먼저 입력하세요 ✍️");
  if (!draft.cat) return toast("카테고리를 선택하세요 🏷️");
  if (!body)      return toast("내용을 입력하세요 📝");
  const post = { id: rndId(), cat: draft.cat, title, body, author: "You", flag: "🌏", createdAt: Date.now(), agoMin: 0,
    image: draft.image, youtube: ytId(yt) ? yt : null, likes: 0, comments: 0, shares: 0 };
  POSTS.unshift(post); DB.save("posts", POSTS);
  funnel(post.id); DB.save("track", TRACK);
  toast("게시 완료! 🎉 공유해서 사람들을 데려오세요.");
  location.hash = `#/p/${post.id}`;
}

/* --------------------------------------------------------------- SHARE */
function openShare(p) {
  const back = $("#sheet");
  const web = appDownloadLink(p.id);   // Airbridge app deeplink with post id
  const f = funnel(p.id);
  back.innerHTML = `
    <div class="sheet">
      <div class="sheet__grip"></div>
      <div class="sheet__ey">Share · drives app signups</div>
      <h3 class="sheet__h">이 글을 밖으로 내보내기 🌍</h3>
      <p class="sheet__p">공유 링크는 <b>Bravo Korea 앱 딥링크</b>이며, 이 글의 <b>post_id</b>가 파라미터로 실립니다. 링크로 들어온 설치·가입이 어떤 글에서 왔는지 추적됩니다.</p>
      <div class="deeplink"><code title="${web}">${esc(web)}</code><button class="btn btn--dark copy" data-copy="${esc(web)}">복사</button></div>
      <div class="applink-line">post_id: <span>${esc(p.id)}</span> · 딥링크에 자동 첨부됨</div>
      ${shareRowHTML()}
      <div class="track-note">📊&nbsp;<div><b>성과 미리보기:</b> 이 글은 <b>${f.shares}회 공유</b>로 <b>${f.signups}명 가입</b>을 만들었습니다. 새 공유는 <a href="#/track">추적 대시보드</a>에 실시간 반영됩니다.</div></div>
      <button class="btn btn--soft btn--full" id="sheet-close" style="margin-top:16px">닫기</button>
    </div>`;
  back.classList.add("open");
  const close = () => back.classList.remove("open");
  back.onclick = (e) => { if (e.target === back) close(); };
  $("#sheet-close", back).onclick = close;
  back.querySelector(".copy").onclick = (e) => {
    copy(e.currentTarget.dataset.copy);
    e.currentTarget.textContent = "복사됨 ✓"; e.currentTarget.classList.add("ok");
    countShare(p);
  };
  back.querySelectorAll(".shbtn").forEach((b) => b.onclick = () => { shareTo(b.dataset.ch, p); });
}

/* --------------------------------------------------- social share (real) */
const KAKAO_JS_KEY = ""; // ← paste your Kakao JavaScript key to enable KakaoTalk sharing
const SHARE_CH = [
  { id: "kakao",    l: "Kakao",    cls: "kakao" },
  { id: "facebook", l: "Facebook", cls: "fb" },
  { id: "x",        l: "X",        cls: "x" },
  { id: "line",     l: "LINE",     cls: "line" },
  { id: "sms",      l: "SMS",      cls: "sms" },
];
function shIcon(id) {
  return id==="kakao" ? "💬" : id==="facebook" ? "f" : id==="x" ? "𝕏" : id==="line" ? "LINE" : "✉";
}
function shareRowHTML() {
  return `<div class="share-row2">` + SHARE_CH.map(c =>
    `<button class="shbtn" data-ch="${c.id}" aria-label="${c.l}">
       <span class="shbtn__i shbtn__i--${c.cls}">${shIcon(c.id)}</span>
       <span class="shbtn__l">${c.l}</span>
     </button>`).join("") + `</div>`;
}
function shareTo(channel, p) {
  const url = appDownloadLink(p.id);                     // Airbridge deeplink + post_id
  const text = `"${p.title}" — Bravo Korea`;
  countShare(p);                                          // attribution
  const u = encodeURIComponent(url), t = encodeURIComponent(text);
  if (channel === "kakao") return shareKakao(p, url, text);
  if (channel === "facebook") return void window.open(`https://www.facebook.com/sharer/sharer.php?u=${u}`, "_blank", "noopener,width=600,height=640");
  if (channel === "x")        return void window.open(`https://twitter.com/intent/tweet?text=${t}&url=${u}`, "_blank", "noopener,width=600,height=640");
  if (channel === "line")     return void window.open(`https://social-plugins.line.me/lineit/share?url=${u}`, "_blank", "noopener,width=600,height=640");
  if (channel === "sms")      { location.href = `sms:?&body=${encodeURIComponent(text + " " + url)}`; return; }
}
function shareKakao(p, url, text) {
  if (window.Kakao && Kakao.isInitialized && Kakao.isInitialized() && Kakao.Share) {
    Kakao.Share.sendDefault({
      objectType: "feed",
      content: { title: p.title, description: excerptOf(p).slice(0, 80),
        imageUrl: "https://www.bravokorea.app/og.png",
        link: { mobileWebUrl: url, webUrl: url } },
      buttons: [{ title: "앱에서 열기", link: { mobileWebUrl: url, webUrl: url } }],
    });
  } else {
    copy(url);
    toast("카카오 공유는 JS 키 설정 후 활성화돼요 — 링크를 복사했어요 🔗");
  }
}

function countShare(p) {
  const f = funnel(p.id);
  f.shares += 1;
  const newClicks = 4 + Math.round(6 * fract(p.id + "" + f.shares));
  f.clicks += newClicks;
  f.signups += Math.round(newClicks * (0.12 + 0.06 * fract(p.id)));
  p.shares = f.shares;
  DB.save("track", TRACK); DB.save("posts", POSTS);
}
function fract(seed){ const x = Math.sin(hashStr(String(seed))) * 10000; return x - Math.floor(x); }

/* --------------------------------------------------------------- DASHBOARD */
let dashSort = "signups";
function renderDashboard() {
  const rows = POSTS.map((p) => ({ p, f: funnel(p.id) })).filter((r) => r.f.shares > 0 || r.f.signups > 0);
  const T = rows.reduce((a, r) => ({ shares:a.shares+r.f.shares, clicks:a.clicks+r.f.clicks, signups:a.signups+r.f.signups }), {shares:0,clicks:0,signups:0});
  const cr = T.clicks ? ((T.signups / T.clicks) * 100).toFixed(1) : "0.0";
  rows.sort((a, b) => (dashSort==="shares" ? b.f.shares-a.f.shares : dashSort==="clicks" ? b.f.clicks-a.f.clicks : b.f.signups-a.f.signups));

  app.innerHTML = "";
  const d = el("div", "dash");
  d.innerHTML = `
    <a class="back-link" href="#/">${IC.back} 커뮤니티로</a>
    <div class="dash__title">📊 딥링크 성과 추적 (Attribution)</div>
    <p class="dash__sub">공유된 글은 저마다 <b>POST ID</b>를 딥링크에 담습니다 (<span class="mono">utm_campaign=post-ID</span>). 가입이 정확히 어떤 글에서 왔는지 역추적되므로, 진짜 전환을 만드는 콘텐츠에 집중할 수 있습니다.</p>
    <div class="kpis">
      <div class="kpi"><div class="kpi__l">총 공유수</div><div class="kpi__v">${nfmt(T.shares)}</div><div class="kpi__d">POST ID로 추적</div></div>
      <div class="kpi"><div class="kpi__l">링크 클릭</div><div class="kpi__v">${nfmt(T.clicks)}</div><div class="kpi__d">deep-link opens</div></div>
      <div class="kpi kpi--accent"><div class="kpi__l">앱 가입</div><div class="kpi__v">${nfmt(T.signups)}</div><div class="kpi__d">attributed signups</div></div>
      <div class="kpi"><div class="kpi__l">클릭 → 가입</div><div class="kpi__v">${cr}%</div><div class="kpi__d">conversion rate</div></div>
    </div>
    <div class="table-card">
      <div class="table-card__h">
        <h3>글별 성과</h3>
        <button class="sort" id="d-sort">${dashSort==="signups"?"가입순":dashSort==="clicks"?"클릭순":"공유순"} ${IC.sort}</button>
      </div>
      <div id="d-rows"></div>
    </div>
    <p class="hint" style="text-align:center;margin-top:16px">💡 아무 글이나 열어 <b>Share</b>를 누르면 이 수치가 실시간으로 올라갑니다.</p>`;

  const rowsBox = d.querySelector("#d-rows");
  const maxSign = Math.max(1, ...rows.map((r) => r.f.signups));
  rows.forEach(({ p, f }) => {
    const c = CAT_MAP[p.cat];
    const conv = f.clicks ? ((f.signups/f.clicks)*100).toFixed(1) : "0.0";
    const row = el("div", "prow");
    row.innerHTML = `
      <div class="prow__body">
        <div class="prow__t"><span style="color:${c.color}">${c.icon}</span> ${esc(p.title)}</div>
        <div class="prow__id">${p.id}</div>
        <div class="prow__nums">
          <span class="prow__num">Shares <b>${nfmt(f.shares)}</b></span>
          <span class="prow__num">Clicks <b>${nfmt(f.clicks)}</b></span>
          <span class="prow__num">Conv <b>${conv}%</b></span>
        </div>
      </div>
      <div class="prow__sign"><div class="v">${nfmt(f.signups)}</div><div class="l">signups</div><div class="conv-bar"><i style="width:${Math.max(8,(f.signups/maxSign)*100)}%"></i></div></div>`;
    row.onclick = () => location.hash = `#/p/${p.id}`;
    rowsBox.appendChild(row);
  });
  d.querySelector("#d-sort").onclick = () => { dashSort = dashSort==="signups"?"clicks":dashSort==="clicks"?"shares":"signups"; renderDashboard(); };
  app.appendChild(d);
  app.appendChild(footEl(true));
}

/* --------------------------------------------------------------- EVENTS */
const EV_STATUS = { ongoing: "진행중", upcoming: "예정" };

function eventGradient(e) { return `linear-gradient(135deg, ${e.color}, ${e.accent || e.color})`; }

function renderEvents() {
  const list = EVENTS.filter((e) => e.status !== "ended");

  app.innerHTML = "";
  const wrap = el("div", "wrap");
  const layout = el("div", "layout layout--events");
  layout.appendChild(sidebarEl(null, "ongoing"));

  const page = el("section", "feed events");
  page.innerHTML = `
    <div class="events__hero">
      <h1 class="events__title">진행 중인 이벤트</h1>
      <p class="events__sub">Bravo Korea가 준비한 해외송금 · 금융 혜택과 프로모션. 마음에 드는 혜택을 앱에서 바로 받아보세요.</p>
    </div>
    <div class="evt-grid" id="evt-grid"></div>`;

  const grid = page.querySelector("#evt-grid");
  if (!list.length) grid.appendChild(el("div", "empty", `<div class="empty__em">🗓️</div>진행 중인 이벤트가 없어요.`));
  list.forEach((e) => {
    const card = el("article", "evt-card");
    card.innerHTML = `
      <div class="evt-card__banner" style="background:${eventGradient(e)}">
        <span class="evt-card__type">${esc(e.type)}</span>
        <span class="evt-card__status">${EV_STATUS[e.status] || "진행중"}</span>
        <span class="evt-card__badge">${esc(e.badge)}</span>
      </div>
      <div class="evt-card__body">
        <h3 class="evt-card__title">${esc(e.title)}</h3>
        <p class="evt-card__desc">${esc(e.summary)}</p>
        <div class="evt-card__metaline">📅 ${esc(e.period)}</div>
        <div class="evt-card__foot">
          <span class="evt-card__partner">${esc(e.provider)}</span>
          <span class="btn btn--blue btn--sm">자세히 보기 ${IC.chevR}</span>
        </div>
      </div>`;
    card.onclick = () => location.hash = `#/event/${e.id}`;
    grid.appendChild(card);
  });

  layout.appendChild(page);
  wrap.appendChild(layout);
  app.appendChild(wrap);
  app.appendChild(footEl());
}

/* ----------------------------------------------------- EVENT DETAIL */
function evStepsHtml(steps) {
  return `<ol class="evd__steps">${steps.map((s) =>
    `<li class="evd__step"><div class="evd__step-t">${esc(s.title)}</div>${
      s.desc ? `<div class="evd__step-d">${esc(s.desc)}</div>` : ""}</li>`).join("")}</ol>`;
}

function renderEventDetail(id) {
  const e = EVENTS.find((x) => x.id === id);
  if (!e) { location.hash = "#/events"; return; }

  const stepsHtml = (e.steps && e.steps.length) ? `
    <div class="evd__sec">
      <div class="evd__sec-h">📝 이벤트 참여 방법</div>
      ${evStepsHtml(e.steps)}
    </div>` : "";

  const extraHtml = e.extra ? `
    <div class="evd__extra">
      <div class="evd__extra-h">🎁 ${esc(e.extra.title)}</div>
      ${evStepsHtml(e.extra.steps)}
      ${e.extra.code ? `<div class="evd__code"><span>추천인 코드</span><b>${esc(e.extra.code)}</b></div>` : ""}
    </div>` : "";

  const notesHtml = (e.noteGroups || []).map((g) => `
    <section class="evd__notes">
      <h4>📌 ${esc(g.title)}</h4>
      <ul>${g.items.map((n) => `<li>${esc(n)}</li>`).join("")}</ul>
    </section>`).join("");

  app.innerHTML = "";
  const d = el("article", "center evd");
  d.innerHTML = `
    <a class="back-link" href="#/events">${IC.back} 이벤트 목록</a>
    ${e.image
      ? `<div class="evd__media"><img src="${e.image}" alt="${esc(e.title)}" loading="eager"></div>`
      : `<div class="evd__hero" style="background:${eventGradient(e)}">
      <div class="evd__pills">
        <span class="evd__type">${esc(e.type)}</span>
        <span class="evd__status">${EV_STATUS[e.status] || "진행중"}</span>
      </div>
      <div class="evd__badge">${esc(e.badge)}</div>
      <h1 class="evd__title">${esc(e.title)}</h1>
      <div class="evd__partner">${esc(e.provider)}</div>
    </div>`}

    <dl class="evd__facts">
      <div class="evd__fact"><dt>📅 이벤트 기간</dt><dd>${esc(e.period)}</dd></div>
      <div class="evd__fact"><dt>🎯 이벤트 대상</dt><dd>${esc(e.target)}</dd></div>
      <div class="evd__fact"><dt>💸 이벤트 내용</dt><dd class="evd__hl">${esc(e.highlight)}</dd></div>
    </dl>

    <div class="evd__body">${e.content.map((p) => `<p>${esc(p)}</p>`).join("")}</div>
    ${stepsHtml}
    <a class="btn btn--blue btn--full evd__cta" href="${APP_DEEPLINK}?event_id=${e.id}" target="_blank" rel="noopener">${esc(e.cta)} ${IC.chevR}</a>
    ${extraHtml}
    ${notesHtml}
    <p class="evd__legal">${esc(e.legal || "")}</p>`;

  app.appendChild(d);
  app.appendChild(footEl(true));
}

/* --------------------------------------------------------------- shared */
function footEl(center) {
  const f = el("footer", "foot");
  f.innerHTML = `<div class="wrap" ${center?'style="max-width:920px"':''}><div class="foot__row">
    <div>© 2026 <b>Bravo Korea</b> — community prototype · demo data only</div>
  </div></div>`;
  return f;
}
function toggleLike(id){ LIKED[id] = !LIKED[id]; DB.save("liked", LIKED); }
function copy(text){ if (navigator.clipboard) navigator.clipboard.writeText(text).catch(()=>fbCopy(text)); else fbCopy(text); }
function fbCopy(text){ const t=document.createElement("textarea"); t.value=text; document.body.appendChild(t); t.select(); try{document.execCommand("copy");}catch{} document.body.removeChild(t); }
let toastTimer;
function toast(msg){ const t=$("#toast"); t.textContent=msg; t.classList.add("show"); clearTimeout(toastTimer); toastTimer=setTimeout(()=>t.classList.remove("show"),2600); }

/* search (mobile toggle + live filter) */
function openSearch(){ const s=$("#nav-search"); s.classList.add("open"); setTimeout(()=>$("#search-input").focus(),40); }
function closeSearch(){ const s=$("#nav-search"); if(s) s.classList.remove("open"); }
$("#nav-searchbtn").onclick = () => { const s=$("#nav-search"); s.classList.contains("open")?closeSearch():openSearch(); };
$("#search-input").addEventListener("input", (e) => {
  const q = e.target.value.toLowerCase().trim();
  app.querySelectorAll(".pi").forEach((pi) => { pi.style.display = pi.textContent.toLowerCase().includes(q) ? "" : "none"; });
});

/* ---------------------------------------------- top-nav active state */
function updateActiveNav(route, arg) {
  const isEvents = route === "events";
  const isVisa = route === "visa";
  const isCommunity = !route || route === "c";
  document.querySelectorAll(".nav__link").forEach((a) => {
    const k = a.dataset.nav;
    a.classList.toggle("on", (k === "events" && isEvents) || (k === "visa" && isVisa) || (k === "home" && isCommunity));
  });
  const evStatus = arg === "ended" ? "ended" : "ongoing";
  document.querySelectorAll(".drawer__item").forEach((a) => {
    const k = a.dataset.dnav;
    let on = false;
    if (k === "home") on = !route;                       // 전체 커뮤니티 (no category)
    else if (k && k.startsWith("c:")) on = route === "c" && arg === k.slice(2);
    else if (k && k.startsWith("ev:")) on = isEvents && evStatus === k.slice(3);
    a.classList.toggle("on", on);
  });
}

/* ------------------------------------------------- mobile nav drawer */
function buildDrawer() {
  const nav = $("#drawer-nav");
  if (!nav) return;
  let html = `<div class="drawer__sec">커뮤니티</div>
    <a class="drawer__item" href="#/" data-dnav="home"><span class="drawer__ico" style="background:var(--blue-tint);color:var(--blue)">🏠</span>전체 커뮤니티</a>`;
  CATEGORIES.forEach((c) => {
    html += `<a class="drawer__item" href="#/c/${c.id}" data-dnav="c:${c.id}"><span class="drawer__ico" style="background:${c.color}18;color:${c.color}">${c.icon}</span>${esc(c.label)}</a>`;
  });
  html += `<div class="drawer__sec">이벤트</div>
    <a class="drawer__item" href="#/events/ongoing" data-dnav="ev:ongoing"><span class="drawer__ico" style="background:#FFEEDF;color:var(--brand-orange)">🎟️</span>진행 중 이벤트</a>
    <div class="drawer__sec">도구</div>
    <a class="drawer__item" href="#/visa" data-dnav="visa"><span class="drawer__ico" style="background:#E6F4FF;color:var(--brand-blue)">🛂</span>비자점수계산기</a>
    <a class="btn btn--blue btn--full drawer__app" href="${APP_DEEPLINK}" target="_blank" rel="noopener">Get the app ${IC.chevR}</a>`;
  nav.innerHTML = html;
  nav.querySelectorAll("a[href^='#/']").forEach((a) => a.addEventListener("click", closeDrawer));
}

function openDrawer() {
  const d = $("#drawer"); if (!d) return;
  d.hidden = false;
  requestAnimationFrame(() => d.classList.add("open"));
  $("#nav-burger").setAttribute("aria-expanded", "true");
  document.body.style.overflow = "hidden";
}
function closeDrawer() {
  const d = $("#drawer"); if (!d || !d.classList.contains("open")) return;
  d.classList.remove("open");
  const b = $("#nav-burger"); if (b) b.setAttribute("aria-expanded", "false");
  document.body.style.overflow = "";
  setTimeout(() => { if (!d.classList.contains("open")) d.hidden = true; }, 320);
}

buildDrawer();
$("#nav-burger").onclick = () => { const d=$("#drawer"); d.classList.contains("open") ? closeDrawer() : openDrawer(); };
$("#drawer-close").onclick = closeDrawer;
$("#drawer").addEventListener("click", (e) => { if (e.target.id === "drawer") closeDrawer(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeDrawer(); });

/* ------------------------------------------------------------------ boot */
if (window.Kakao && KAKAO_JS_KEY && !window.Kakao.isInitialized()) {
  try { window.Kakao.init(KAKAO_JS_KEY); } catch (e) {}
}
window.addEventListener("hashchange", render);
render();
