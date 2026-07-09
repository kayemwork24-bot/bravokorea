/* ===========================================================================
   Bravo Korea — Visa Score Calculator · RULESET (config-driven, per PRD §5.2)
   Scoring tables are transcribed from the PRD.
   ⚠️ passLine / experience / penalty / high-income bonus values marked
      "PLACEHOLDER" are NOT official — confirm against MOJ · HiKorea before launch.
   Swappable to a server JSON artifact without touching UI code.
   =========================================================================== */

const VISA_RULES = {
  meta: {
    usdRate: 1380,                 // ₩ per $ — replace with live FX API
    disclaimer: "Estimate only, not legal advice. Verify at HiKorea (hikorea.go.kr).",
  },

  /* pass thresholds — PLACEHOLDER (confirm with MOJ) */
  passLine: { d10: 60, e74: 200, f27: 80 },

  /* age bands: [minAge, maxAge, points] */
  age: {
    d10: [[20,24,10],[25,29,15],[30,34,20],[35,39,15],[40,49,5]],
    e74: [[19,26,40],[27,33,60],[34,40,30],[41,150,10]],
    f27: [[18,24,23],[25,29,25],[30,34,23],[35,39,20],[40,44,12]],
  },

  /* education by degree level */
  edu: {
    d10: { assoc:15, bachelor:15, master:20, phd:30 },
    e74: { assoc:10, bachelor:20, master:20, phd:20 },   // 석·박사는 국내학위 가점으로 우회 → 학사와 동일 처리
    f27: {                                                // STEM(이공계)/non-STEM(인문계) 분기
      stem:    { assoc:0, bachelor:17, master:20, phd:25 },
      nonstem: { assoc:0, bachelor:15, master:17, phd:20 },
    },
  },

  /* Korean ability — level 1..5 (TOPIK 급 or KIIP 단계) */
  lang: {
    d10: { 5:20, 4:15, 3:10, 2:5, 1:0 },
    e74: { 5:120, 4:120, 3:80, 2:50, 1:0 },   // 4급 이상 120
    e74Min: 50,                               // < 50 → 필수요건 미달(blocked)
    f27: { 5:20, 4:15, 3:10, 2:5, 1:3 },
    kiip5BonusF27: 10,                         // KIIP 5단계 이수 → F-2-7 +10
  },

  /* annual income (KRW) */
  income: {
    e74Min: 25000000, e74MinFarm: 24000000,                  // 최소 연봉 미만 → 미달
    e74: [[25000000,50],[35000000,80],[50000000,120]],       // ≥ threshold → take highest met
    f27: [[0,10],[30000000,30],[40000000,40],[50000000,45],
          [60000000,50],[70000000,55],[85000000,58],[100000000,60]], // 30/40/50는 PRD, 그 위는 PLACEHOLDER 세분화
    d10HighIncomeUSD: 50000,                                  // 고소득 전문직($50k) 판정
    d10HighIncomeBonus: 5,                                    // PLACEHOLDER
  },

  /* domestic+overseas experience → months bands [minMo, maxMo, pts] — PLACEHOLDER (D-10 표 미제공) */
  experience: {
    d10: [[12,35,5],[36,59,10],[60,9999,15]],
  },

  /* bonuses */
  bonus: {
    d10DomesticGrad3yrs: 5,   // 국내 졸업 3년 이내 → D-10 유학 가점 (PLACEHOLDER)
  },

  /* penalties — chip count → deduction per visa (PLACEHOLDER; E-7-4 벌금 100만원 임계 등 별도) */
  penalty: { perViolation: 5 },

  /* dropdown option labels (English-first, Korean in parens) */
  options: {
    visaType: [
      { v:"D-2",  label:"D-2 · Student" },
      { v:"D-4",  label:"D-4 · Trainee" },
      { v:"D-10", label:"D-10 · Job Seeker" },
      { v:"E-7",  label:"E-7 · Special Occupation" },
      { v:"E-9",  label:"E-9 · Non-professional" },
      { v:"E-10", label:"E-10 · Vessel Crew" },
      { v:"H-2",  label:"H-2 · Working Visit" },
      { v:"F-2",  label:"F-2 · Resident" },
      { v:"other",label:"Other" },
    ],
    e74Track: ["E-9","E-10","H-2"],   // 선택 시 E-7-4 심화 트랙 활성화
    degree: [
      { v:"assoc",    label:"Associate (전문학사)" },
      { v:"bachelor", label:"Bachelor's (학사)" },
      { v:"master",   label:"Master's (석사)" },
      { v:"phd",      label:"Doctorate (박사)" },
    ],
  },
};

/* 3 target visas — brand-aligned colours (orange · blue · green) */
const VISA_DEFS = [
  { id:"d10", code:"D-10-1", name:"Job Seeker",  ko:"구직",      color:"#FF6400" },
  { id:"e74", code:"E-7-4",  name:"Skilled Work", ko:"숙련기능",  color:"#008CFF" },
  { id:"f27", code:"F-2-7",  name:"Residence",    ko:"우수인재 거주", color:"#00A676" },
];
