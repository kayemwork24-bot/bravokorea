/* ===========================================================================
   Bravo Korea — Visa Score Calculator (English-first)
   Decoupled store → pure calc functions (calcD10/E74/F27) → dashboard render.
   PRD §2 wizard · §2.3 real-time (debounced) · §3 logic · §5 architecture.
   =========================================================================== */

/* self-contained helpers (this file loads before app.js) */
const vApp = () => document.getElementById("app");
const vEl = (t, c, h) => { const n = document.createElement(t); if (c) n.className = c; if (h != null) n.innerHTML = h; return n; };
const vEsc = (s) => String(s).replace(/[&<>"]/g, (m) => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;" }[m]));
const VISA_APP_DL = "https://abr.ge/27gghb";

/* --------------------------------------------------------- state store */
const VS = {
  step: 1, maxStep: 4, finished: false,
  profile: {
    dob: "", age: null, visaType: "",
    edu: "", isSTEM: null, degreeCountry: "", gradYear: "",
    expDom: 0, expOvs: 0,
    langType: "topik", langLevel: 0,
    incomeKRW: null,
    penalty: 0, e74Sector: "general", e74Tenure: 0,
  },
};
function e74Track() { return VISA_RULES.options.e74Track.includes(VS.profile.visaType); }

/* ------------------------------------------------------------- utils */
function ageFromDob(dob) {
  if (!dob) return null;
  const b = new Date(dob), t = new Date();
  let a = t.getFullYear() - b.getFullYear();
  const m = t.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && t.getDate() < b.getDate())) a--;
  return (a >= 0 && a < 120) ? a : null;
}
function bandPts(bands, v) { for (const [mn, mx, p] of bands) if (v >= mn && v <= mx) return p; return 0; }
function comma(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ","); }
function won(n) { return "₩" + comma(n); }
function usdOf(krw) { return Math.round(krw / VISA_RULES.meta.usdRate); }

/* ------------------------------------------------- pure calc functions */
function finalize(id, score, blocked, breakdown, reasons) {
  const pass = VISA_RULES.passLine[id];
  score = Math.max(0, Math.round(score));
  let state = blocked ? "blocked" : score >= pass ? "pass" : score >= pass * 0.8 ? "close" : "low";
  return { id, score, pass, state, blocked: !!blocked,
    gauge: blocked ? 100 : Math.min(100, Math.round((score / pass) * 100)),
    gap: Math.max(0, pass - score), breakdown, reasons: reasons || [] };
}
function calcD10(p, R) {
  const br = []; let s = 0;
  if (p.age != null) { const a = bandPts(R.age.d10, p.age); s += a; br.push(["Age", a]); }
  if (p.edu)         { const e = R.edu.d10[p.edu] || 0; s += e; br.push(["Education", e]); }
  if (p.langLevel)   { const l = R.lang.d10[p.langLevel] || 0; s += l; br.push(["Korean", l]); }
  const mo = (+p.expDom || 0) + (+p.expOvs || 0);
  const ex = bandPts(R.experience.d10, mo); if (ex) { s += ex; br.push(["Experience", ex]); }
  if (p.degreeCountry === "kr" && p.gradYear) {
    const yrs = new Date().getFullYear() - Number(p.gradYear);
    if (yrs >= 0 && yrs <= 3) { s += R.bonus.d10DomesticGrad3yrs; br.push(["KR grad ≤3y", R.bonus.d10DomesticGrad3yrs]); }
  }
  if (p.incomeKRW && usdOf(p.incomeKRW) >= R.income.d10HighIncomeUSD) { s += R.income.d10HighIncomeBonus; br.push(["High income", R.income.d10HighIncomeBonus]); }
  const pen = (p.penalty || 0) * R.penalty.perViolation; if (pen) { s -= pen; br.push(["Penalty", -pen]); }
  return finalize("d10", s, false, br);
}
function calcE74(p, R) {
  const br = []; let s = 0, blocked = false; const reasons = [];
  if (p.age != null) { const a = bandPts(R.age.e74, p.age); s += a; br.push(["Age", a]); }
  if (p.edu)         { const e = R.edu.e74[p.edu] || 0; s += e; br.push(["Education", e]); }
  if (p.langLevel)   {
    const l = R.lang.e74[p.langLevel] || 0; s += l; br.push(["Korean", l]);
    if (l < R.lang.e74Min) { blocked = true; reasons.push("Korean below minimum (TOPIK 2 / 50 pts)"); }
  }
  if (p.incomeKRW) {
    const min = p.e74Sector === "farm" ? R.income.e74MinFarm : R.income.e74Min;
    if (p.incomeKRW < min) { blocked = true; reasons.push("Income below minimum (" + won(min) + ")"); }
    let inc = 0; for (const [th, pts] of R.income.e74) if (p.incomeKRW >= th) inc = pts;
    s += inc; br.push(["Income", inc]);
  }
  const pen = (p.penalty || 0) * R.penalty.perViolation; if (pen) { s -= pen; br.push(["Penalty", -pen]); }
  return finalize("e74", s, blocked, br, reasons);
}
function calcF27(p, R) {
  const br = []; let s = 0;
  if (p.age != null) { const a = bandPts(R.age.f27, p.age); s += a; br.push(["Age", a]); }
  if (p.edu) { const track = p.isSTEM ? "stem" : "nonstem"; const e = R.edu.f27[track][p.edu] || 0; s += e; br.push(["Education", e]); }
  if (p.langLevel) { const l = R.lang.f27[p.langLevel] || 0; s += l; br.push(["Korean", l]); }
  if (p.langType === "kiip" && p.langLevel >= 5) { s += R.lang.kiip5BonusF27; br.push(["KIIP 5", R.lang.kiip5BonusF27]); }
  if (p.incomeKRW) { let inc = 0; for (const [th, pts] of R.income.f27) if (p.incomeKRW >= th) inc = pts; s += inc; br.push(["Income", inc]); }
  const pen = (p.penalty || 0) * R.penalty.perViolation; if (pen) { s -= pen; br.push(["Penalty", -pen]); }
  return finalize("f27", s, false, br);
}
function computeAll() { const p = VS.profile, R = VISA_RULES; return { d10: calcD10(p, R), e74: calcE74(p, R), f27: calcF27(p, R) }; }

/* =============================================================== RENDER */
function renderVisa(arg) {
  if (VS.profile.age == null) VS.profile.age = ageFromDob(VS.profile.dob);
  if (arg === "result" || VS.finished) return renderVisaResult();

  const app = vApp(); app.innerHTML = "";
  const wrap = vEl("div", "wrap");
  const layout = vEl("div", "viz");
  layout.appendChild(vizForm());
  layout.appendChild(vEl("div", "viz-scores-wrap", `<div id="viz-scores"></div>`));
  wrap.appendChild(layout);
  app.appendChild(wrap);
  bindStep();
  updateScores();
}

const STEP_META = [
  { t: "Basic profile",        s: "Tell us who you are." },
  { t: "Education & career",   s: "Your degree and work history." },
  { t: "Language & finance",   s: "Korean ability and income." },
  { t: "Additions & penalties",s: "A few final checks." },
];

function vizForm() {
  const col = vEl("section", "viz-form");
  const m = STEP_META[VS.step - 1];
  let dots = "";
  for (let i = 1; i <= VS.maxStep; i++) dots += `<span class="viz-dot ${i===VS.step?"on":""} ${i<VS.step?"done":""}"></span>`;
  col.innerHTML = `
    <div class="viz-head">
      <a class="back-link" href="#/">‹ Home</a>
      <div class="viz-dots">${dots}<span class="viz-stepno">Step ${VS.step} / ${VS.maxStep}</span></div>
      <h1 class="viz-title">${vEsc(m.t)}</h1>
      <p class="viz-sub">${vEsc(m.s)}</p>
    </div>
    <div class="viz-fields">${stepFields()}</div>
    <div class="viz-nav">
      ${VS.step > 1 ? `<button class="btn btn--soft" id="viz-back">← Back</button>` : `<span></span>`}
      ${VS.step < VS.maxStep
        ? `<button class="btn btn--blue" id="viz-next">Next →</button>`
        : `<button class="btn btn--blue" id="viz-submit">See my results →</button>`}
    </div>
    <p class="viz-disc">${vEsc(VISA_RULES.meta.disclaimer)}</p>`;
  return col;
}

/* ---- per-step field markup ---- */
function seg(id, opts, cur) {
  return `<div class="vz-seg" data-seg="${id}">` +
    opts.map(o => `<button type="button" class="vz-seg__b ${cur===o.v?"on":""}" data-v="${o.v}">${vEsc(o.label)}</button>`).join("") + `</div>`;
}
function chips(id, opts, cur) {
  return `<div class="vz-chips" data-chips="${id}">` +
    opts.map(o => `<button type="button" class="fchip ${String(cur)===String(o.v)?"on":""}" data-v="${o.v}">${vEsc(o.label)}</button>`).join("") + `</div>`;
}
function stepFields() {
  const p = VS.profile, O = VISA_RULES.options;
  if (VS.step === 1) return `
    <label class="vz-field"><span class="vz-l">Date of birth</span>
      <input type="date" id="vz-dob" class="vz-input" value="${p.dob}">
      <span class="vz-hint" id="vz-age">${p.age!=null?`Age ${p.age}`:"We convert this to your Korean age automatically."}</span>
    </label>
    <label class="vz-field"><span class="vz-l">Current visa status</span>
      <select id="vz-visa" class="vz-input vz-select">
        <option value="">Select…</option>
        ${O.visaType.map(o=>`<option value="${o.v}" ${p.visaType===o.v?"selected":""}>${vEsc(o.label)}</option>`).join("")}
      </select>
    </label>
    <div class="vz-note ${e74Track()?"":"is-hidden"}" id="vz-e74note">✓ E-7-4 skilled-work track enabled — we'll ask 2 extra questions at the end.</div>`;

  if (VS.step === 2) return `
    <label class="vz-field"><span class="vz-l">Highest degree</span>
      <select id="vz-edu" class="vz-input vz-select">
        <option value="">Select…</option>
        ${O.degree.map(o=>`<option value="${o.v}" ${p.edu===o.v?"selected":""}>${vEsc(o.label)}</option>`).join("")}
      </select>
    </label>
    <div class="vz-field ${p.edu?"":"is-hidden"}" id="vz-stemwrap"><span class="vz-l">Field of study</span>
      ${chips("stem", [{v:"1",label:"STEM (이공계)"},{v:"0",label:"Non-STEM (인문·상경)"}], p.isSTEM==null?"":(p.isSTEM?"1":"0"))}
    </div>
    <div class="vz-field"><span class="vz-l">Where did you graduate?</span>
      ${seg("country", [{v:"kr",label:"In Korea"},{v:"ov",label:"Overseas"}], p.degreeCountry)}
    </div>
    <label class="vz-field ${p.degreeCountry==="kr"?"":"is-hidden"}" id="vz-gradwrap"><span class="vz-l">Graduation year</span>
      <input type="number" id="vz-gradyear" class="vz-input" placeholder="e.g. 2024" min="1980" max="2030" value="${p.gradYear}">
      <span class="vz-hint">Within 3 years adds a D-10 study bonus.</span>
    </label>
    <div class="vz-grid2">
      <label class="vz-field"><span class="vz-l">Work exp. in Korea (months)</span>
        <input type="number" id="vz-expdom" class="vz-input" min="0" placeholder="0" value="${p.expDom||""}"></label>
      <label class="vz-field"><span class="vz-l">Work exp. overseas (months)</span>
        <input type="number" id="vz-expovs" class="vz-input" min="0" placeholder="0" value="${p.expOvs||""}"></label>
    </div>`;

  if (VS.step === 3) return `
    <div class="vz-field"><span class="vz-l">Korean proficiency test</span>
      ${seg("langtype", [{v:"topik",label:"TOPIK"},{v:"kiip",label:"KIIP (사회통합)"}], p.langType)}
    </div>
    <div class="vz-field"><span class="vz-l">${p.langType==="kiip"?"KIIP stage":"TOPIK level"}</span>
      ${chips("langlevel", [1,2,3,4,5].map(n=>({v:n,label:(p.langType==="kiip"?("Stage "+n):("Level "+n))})), p.langLevel||"")}
      <span class="vz-hint">Not sure? Pick your most recent result.</span>
    </div>
    <label class="vz-field"><span class="vz-l">Annual income</span>
      <div class="vz-money"><span class="vz-won">₩</span><input type="text" id="vz-income" class="vz-input vz-input--money" inputmode="numeric" placeholder="0" value="${p.incomeKRW?comma(p.incomeKRW):""}"></div>
      <span class="vz-hint" id="vz-usd">${p.incomeKRW?("≈ $"+comma(usdOf(p.incomeKRW))+" (rate ₩"+comma(VISA_RULES.meta.usdRate)+"/$)"):"Before tax, in Korean won."}</span>
    </label>`;

  // step 4
  return `
    <div class="vz-field"><span class="vz-l">Immigration violations or fines</span>
      ${chips("penalty", [{v:0,label:"0"},{v:1,label:"1"},{v:2,label:"2"},{v:3,label:"3+"}], p.penalty)}
      <span class="vz-hint">Count of recorded overstays/fines — we map to policy thresholds.</span>
    </div>
    <div class="${e74Track()?"":"is-hidden"}" id="vz-e74extra">
      <div class="vz-e74tag">E-7-4 track</div>
      <div class="vz-field"><span class="vz-l">Sector</span>
        ${seg("sector", [{v:"general",label:"General"},{v:"farm",label:"Agri · fishery"}], p.e74Sector)}
      </div>
      <label class="vz-field"><span class="vz-l">Tenure at current job (months)</span>
        <input type="number" id="vz-tenure" class="vz-input" min="0" placeholder="0" value="${p.e74Tenure||""}"></label>
    </div>`;
}

/* ---- bind current step ---- */
let vzDeb;
function scheduleScore() { clearTimeout(vzDeb); vzDeb = setTimeout(updateScores, 120); }
function setP(k, v) { VS.profile[k] = v; scheduleScore(); }

function bindStep() {
  const root = vApp();
  const on = (id, ev, fn) => { const n = root.querySelector("#" + id); if (n) n.addEventListener(ev, fn); };

  // segmented + chip groups
  root.querySelectorAll("[data-seg]").forEach(g => g.querySelectorAll(".vz-seg__b").forEach(b =>
    b.onclick = () => { g.querySelectorAll(".vz-seg__b").forEach(x=>x.classList.remove("on")); b.classList.add("on"); handlePick(g.dataset.seg, b.dataset.v); }));
  root.querySelectorAll("[data-chips]").forEach(g => g.querySelectorAll(".fchip").forEach(b =>
    b.onclick = () => { g.querySelectorAll(".fchip").forEach(x=>x.classList.remove("on")); b.classList.add("on"); handlePick(g.dataset.chips, b.dataset.v); }));

  on("vz-dob","change",e=>{ VS.profile.dob=e.target.value; VS.profile.age=ageFromDob(e.target.value); const a=root.querySelector("#vz-age"); if(a)a.textContent=VS.profile.age!=null?`Age ${VS.profile.age}`:"Enter a valid date."; scheduleScore(); });
  on("vz-visa","change",e=>{ setP("visaType",e.target.value); const n=root.querySelector("#vz-e74note"); if(n)n.classList.toggle("is-hidden",!e74Track()); });
  on("vz-edu","change",e=>{ setP("edu",e.target.value); const w=root.querySelector("#vz-stemwrap"); if(w)w.classList.toggle("is-hidden",!e.target.value); });
  on("vz-gradyear","input",e=>setP("gradYear",e.target.value));
  on("vz-expdom","input",e=>setP("expDom",+e.target.value||0));
  on("vz-expovs","input",e=>setP("expOvs",+e.target.value||0));
  on("vz-tenure","input",e=>setP("e74Tenure",+e.target.value||0));
  on("vz-income","input",e=>{
    const digits=e.target.value.replace(/[^\d]/g,"").slice(0,12);
    VS.profile.incomeKRW = digits? Number(digits): null;
    e.target.value = digits? comma(digits): "";
    const u=root.querySelector("#vz-usd");
    if(u) u.textContent = VS.profile.incomeKRW? ("≈ $"+comma(usdOf(VS.profile.incomeKRW))+" (rate ₩"+comma(VISA_RULES.meta.usdRate)+"/$)"):"Before tax, in Korean won.";
    scheduleScore();
  });

  on("viz-back","click",()=>{ VS.step=Math.max(1,VS.step-1); renderVisa(); });
  on("viz-next","click",()=>{ VS.step=Math.min(VS.maxStep,VS.step+1); renderVisa(); });
  on("viz-submit","click",()=>{ VS.finished=true; renderVisaResult(); });
}
function handlePick(key, v) {
  const p = VS.profile;
  if (key === "stem") p.isSTEM = v === "1";
  else if (key === "country") { p.degreeCountry = v; const w=vApp().querySelector("#vz-gradwrap"); if(w) w.classList.toggle("is-hidden", v!=="kr"); }
  else if (key === "langtype") { p.langType = v; renderVisa(); return; }  // re-render to relabel levels
  else if (key === "langlevel") p.langLevel = +v;
  else if (key === "penalty") p.penalty = +v;
  else if (key === "sector") p.e74Sector = v;
  scheduleScore();
}

/* ---- real-time score dashboard ---- */
function stateLabel(r) {
  if (r.blocked) return "Minimum not met";
  if (r.state === "pass") return "Qualified";
  return `${r.gap} pts to go`;
}
function scoreCard(res, def, big) {
  return `
    <div class="score-card is-${res.state}" style="--vc:${def.color}">
      <div class="score-card__top">
        <span class="score-card__dot"></span>
        <div><div class="score-card__code">${def.code}</div><div class="score-card__name">${def.name} · ${def.ko}</div></div>
        <div class="score-card__num">${res.score}<small>/${res.pass}</small></div>
      </div>
      <div class="score-gauge"><i style="width:${res.gauge}%"></i></div>
      <div class="score-card__foot"><span class="score-pill">${stateLabel(res)}</span></div>
      ${big && res.reasons.length ? `<ul class="score-reasons">${res.reasons.map(x=>`<li>⚠ ${vEsc(x)}</li>`).join("")}</ul>` : ""}
    </div>`;
}
function updateScores() {
  const box = document.getElementById("viz-scores"); if (!box) return;
  const R = computeAll();
  box.innerHTML = `
    <div class="viz-scores__h">Your visa scores <span>live</span></div>
    ${VISA_DEFS.map(d => scoreCard(R[d.id], d)).join("")}`;
  // mobile sticky bar
  let bar = document.getElementById("viz-scorebar");
  if (!bar) { bar = vEl("div", "viz-scorebar"); bar.id = "viz-scorebar"; document.body.appendChild(bar); }
  bar.innerHTML = VISA_DEFS.map(d => {
    const r = R[d.id];
    return `<div class="vsb" style="--vc:${d.color}"><span class="vsb__c">${d.code}</span><span class="vsb__g"><i style="width:${r.gauge}%"></i></span><b class="vsb__n is-${r.state}">${r.blocked?"—":r.score}</b></div>`;
  }).join("");
}
function removeScoreBar() { const b = document.getElementById("viz-scorebar"); if (b) b.remove(); }

/* ------------------------------------------------------------- RESULT */
function renderVisaResult() {
  const R = computeAll();
  const ranked = VISA_DEFS.map(d => ({ d, r: R[d.id] }))
    .sort((a, b) => (b.r.state==="pass") - (a.r.state==="pass") || (b.r.score/b.r.pass) - (a.r.score/a.r.pass));
  const best = ranked[0];
  removeScoreBar();

  const app = vApp(); app.innerHTML = "";
  const wrap = vEl("div", "wrap");
  const page = vEl("div", "viz-result");
  page.innerHTML = `
    <a class="back-link" href="#/visa" id="viz-edit">‹ Edit answers</a>
    <div class="cta-band viz-hero">
      <div class="viz-hero__k">Your best-fit path</div>
      <div class="viz-hero__code" style="color:#fff">${best.d.code} · ${best.d.name}</div>
      <div class="viz-hero__msg">${best.r.state==="pass"
        ? `You appear to <b>qualify</b> — estimated ${best.r.score} pts (pass line ${best.r.pass}).`
        : best.r.blocked
          ? `Closest match, but a minimum requirement isn't met yet.`
          : `Closest match — <b>${best.r.gap} points</b> from the pass line.`}</div>
      <a class="btn btn--white" href="${VISA_APP_DL}?src=visacalc&best=${best.d.id}" target="_blank" rel="noopener">Track this in the Bravo Korea app →</a>
    </div>

    <div class="viz-result__grid">
      ${ranked.map(({d,r}) => `
        <div class="score-card score-card--lg is-${r.state}" style="--vc:${d.color}">
          <div class="score-card__top">
            <span class="score-card__dot"></span>
            <div><div class="score-card__code">${d.code}</div><div class="score-card__name">${d.name} · ${d.ko}</div></div>
            <div class="score-card__num">${r.score}<small>/${r.pass}</small></div>
          </div>
          <div class="score-gauge"><i style="width:${r.gauge}%"></i></div>
          <div class="score-card__foot"><span class="score-pill">${stateLabel(r)}</span></div>
          ${r.reasons.length?`<ul class="score-reasons">${r.reasons.map(x=>`<li>⚠ ${vEsc(x)}</li>`).join("")}</ul>`:""}
          <div class="score-break">${r.breakdown.map(([k,v])=>`<span class="score-break__row"><span>${vEsc(k)}</span><b class="${v<0?"neg":""}">${v>0?"+":""}${v}</b></span>`).join("")}</div>
          ${tipsFor(d,r)}
        </div>`).join("")}
    </div>

    <div class="viz-lead">
      <div class="viz-lead__h">📩 Get your full report by email</div>
      <p class="viz-lead__p">Item-by-item breakdown + a personalized action plan to close the gap. We can also match you with a licensed visa consultant.</p>
      <form class="viz-lead__form" id="viz-lead-form">
        <input type="email" required class="vz-input" id="viz-email" placeholder="you@email.com">
        <button class="btn btn--blue" type="submit">Send report</button>
      </form>
      <p class="viz-disc">${vEsc(VISA_RULES.meta.disclaimer)}</p>
    </div>`;
  wrap.appendChild(page);
  app.appendChild(wrap);

  page.querySelector("#viz-edit").onclick = (e) => { e.preventDefault(); VS.finished = false; renderVisa(); };
  page.querySelector("#viz-lead-form").onsubmit = (e) => {
    e.preventDefault();
    const email = page.querySelector("#viz-email").value.trim();
    // PRD §5.3 — webhook to n8n/Make with {profile, scores, email}. Prototype: log + toast.
    const payload = { email, profile: VS.profile, scores: R, best: best.d.id };
    console.log("[visa-lead] webhook payload →", payload);
    if (typeof toast === "function") toast("Report on its way to " + email + " 📩");
    e.target.innerHTML = `<div class="viz-lead__done">✓ Sent to <b>${vEsc(email)}</b>. Check your inbox.</div>`;
  };
}
function tipsFor(d, r) {
  if (r.state === "pass") return `<div class="score-tip is-good">✓ You meet the estimated pass line.</div>`;
  const t = [];
  const p = VS.profile;
  if (p.langLevel && p.langLevel < 5) {
    const nl = p.langLevel + 1;
    const cur = (VISA_RULES.lang[d.id][p.langLevel] || 0), nxt = (VISA_RULES.lang[d.id][nl] || 0);
    if (nxt > cur) t.push(`Raise Korean to level ${nl}: <b>+${nxt - cur}</b> on ${d.code}.`);
  }
  if (d.id !== "d10" && p.incomeKRW) {
    const table = VISA_RULES.income[d.id === "e74" ? "e74" : "f27"];
    const next = table.find(([th]) => p.incomeKRW < th);
    if (next) t.push(`Reach ${won(next[0])} income to unlock the next income tier.`);
  }
  if (r.blocked && r.reasons[0]) t.push(`Resolve: ${vEsc(r.reasons[0])}.`);
  if (!t.length) t.push(`You're ${r.gap} pts away — small gains across items add up.`);
  return `<div class="score-tip">💡 ${t.slice(0,2).join(" ")}</div>`;
}
