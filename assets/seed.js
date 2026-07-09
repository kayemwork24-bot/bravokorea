/* ===========================================================================
   Bravo Korea — Community Prototype
   Seed data: categories + starter posts
   =========================================================================== */

const CATEGORIES = [
  { id: "korean",    label: "한국어",        en: "Korean",       color: "#3B6FE6", icon: "가" },
  { id: "visa",      label: "비자",          en: "Visa",         color: "#1B4DFF", icon: "🛂" },
  { id: "jobs",      label: "일자리",        en: "Jobs",         color: "#00A676", icon: "💼" },
  { id: "prearrival",label: "Pre-Arrival",  en: "Pre-Arrival",  color: "#7A5CFF", icon: "🛫" },
  { id: "students",  label: "유학생",        en: "Students",     color: "#FF4D8D", icon: "🎓" },
  { id: "money",     label: "재테크",        en: "Finance",      color: "#0FB5A6", icon: "📈" },
  { id: "housing",   label: "주거·부동산",   en: "Housing",      color: "#E0A500", icon: "🏠" },
  { id: "food",      label: "식당",          en: "Food",         color: "#FF4D2E", icon: "🍜" },
  { id: "market",    label: "중고거래",      en: "Market",       color: "#2BB0ED", icon: "🏷️" },
  { id: "meetups",   label: "지역모임",      en: "Meetups",      color: "#8AB800", icon: "📍" },
  { id: "free",      label: "자유게시판",    en: "Free Talk",    color: "#6B655A", icon: "💬" },
];

const CAT_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));

/* per-category sub-boards (filter chips). First chip is the default board. */
const SUBTABS = {
  korean:     ["📹 생활한국어", "TOPIK", "Slang"],
  visa:       ["All", "D-2 / D-10", "E-7", "F-visa"],
  jobs:       ["All", "Tech", "Teaching", "Part-time"],
  prearrival: ["All", "Packing", "First week"],
  students:   ["All", "Housing", "Scholarships"],
  money:      ["All", "Remittance", "Investing", "Tax"],
  housing:    ["All", "월세", "전세", "Goshiwon"],
  food:       ["All", "Cheap eats", "Halal", "Veg"],
  market:     ["All", "Selling", "Buying", "Free"],
  meetups:    ["All", "Seoul", "Busan", "Language"],
  free:       ["All", "Vent", "Wins"],
};

/* Minutes-ago helper so seed timestamps feel alive without Date.now in module scope */
const MIN = 60 * 1000;

/* ----------------------------------------------------------------- events
   Bravo Korea 이벤트 = 앱 핵심 서비스(해외송금·금융) 혜택/프로모션 모델.
   ⚠️ 이미지 1장 = 이벤트 1개. 절대 분리하지 않는다.
   card + detail 공용 스키마:
     type/status/color/accent/badge/title/summary
     period/target/highlight/provider/cta
     content[]      상세 도입 문단
     steps[]        (선택) 이벤트 참여 방법 {title, desc}
     extra          (선택) 추가 혜택 {title, steps[], code}
     noteGroups[]   유의사항 그룹 {title, items[]}
     legal          하단 법적 고지 문구                                       */
const EVENTS = [
  {
    id: "remit-fee-zero",
    image: "assets/event-remit.png",
    type: "송금 혜택", status: "ongoing",
    color: "#2E6BF6", accent: "#1E56DC",
    badge: "송금 수수료 0원",
    promo: "100만원 이상 보내면 수수료 0원",
    title: "100만원 이상 보내면, 해외송금 수수료 0원!",
    summary: "기간 내 100만원 이상 한 번만 보내면, 이후 송금은 몇 번을 보내도 수수료가 100% 무료.",
    period: "2026.07.01 ~ 2026.08.31",
    target: "Bravo Korea 앱으로 해외송금하는 외국인 고객",
    provider: "Jeonbuk Bank 제휴",
    highlight: "송금 수수료 100% 무료",
    cta: "무료로 송금하기",
    content: [
      "이벤트 기간 중 100만원 이상을 한 번 송금하시면, 이후에는 보내는 횟수와 금액에 관계없이 Bravo Korea 송금 수수료가 전액 무료입니다.",
      "별도 신청 절차 없이 조건을 충족하면 자동으로 수수료가 면제됩니다. 첫 송금부터 바로 혜택을 받아보세요.",
    ],
    noteGroups: [
      { title: "이벤트 유의사항", items: [
        "본 이벤트는 Bravo Korea와 제휴사(Jeonbuk Bank)의 사정에 따라 사전 고지 없이 변경되거나 조기 종료될 수 있습니다.",
        "수수료 무료는 Bravo Korea 송금 수수료에 한하며, 중계·수취 은행 수수료 및 환율 스프레드는 포함되지 않을 수 있습니다.",
        "100만원 기준은 이벤트 기간 내 1회 이상 송금액을 의미합니다.",
        "1인 1계정 기준이며, 부정 이용이 확인될 경우 혜택 제공이 제한될 수 있습니다.",
        "자세한 조건은 앱 내 이벤트 상세 페이지에서 확인해 주세요.",
      ]},
    ],
    legal: "본 이벤트는 Bravo Korea가 제공하며, 제휴사 Jeonbuk Bank와 함께 진행됩니다. 혜택 내용과 조건은 사정에 따라 변경될 수 있으며, 최신 정보는 앱 내 이벤트 페이지를 기준으로 합니다.",
  },
  {
    id: "loan-consult-point",
    image: "assets/event-loan.png",
    type: "대출 혜택", status: "ongoing",
    color: "#2E6BF6", accent: "#1E56DC",
    badge: "포인트 10,000원",
    promo: "대출 상담하고 포인트 받기",
    title: "대출 상담하면 포인트 10,000원 받을 기회!",
    summary: "외국인을 위한 대출 상담 — 모국어로 원하는 시간에 상담하고, 대출 실행까지 완료하면 포인트 10,000원.",
    period: "2026.06.16 ~ 2026.12.15",
    target: "이벤트 기간 내 '참여하기'를 통해 대출 상담 후 대출을 신청한 고객",
    provider: "Bravo Korea 금융센터",
    highlight: "포인트 10,000원 (기간 내 최초 1회 대출 실행 완료 시 지급)",
    cta: "참여하기",
    content: [
      "외국인을 위한 대출 상담 서비스입니다. 모국어로, 원하는 시간에 전문 상담원과 대출 한도를 상담할 수 있어요.",
      "이벤트 기간 내 최초 1회 대출 실행이 완료되면 포인트 10,000원을 지급합니다.",
    ],
    steps: [
      { title: "대출 상담 신청하기", desc: "휴대폰번호 입력 및 상담 희망 시간 선택" },
      { title: "전문 상담직원의 전화 받기", desc: "모국어로 희망 시간에 상담 가능" },
      { title: "상담 후 대출 신청하기", desc: "대출 신청 후 대출 실행이 완료되면 포인트 지급" },
    ],
    extra: {
      title: "친구에게 추천하고 매달 최대 포인트 5만원 더 받기",
      steps: [
        { title: "친구에게 대출 상담 신청 링크 공유", desc: "" },
        { title: "친구가 대출 상담 신청하기", desc: "추천인 코드는 자동 입력돼요" },
        { title: "친구의 대출 최종 심사가 완료되면 추천인이 포인트 10,000원 받기", desc: "매달 최대 5회" },
      ],
      code: "BK001004",
    },
    noteGroups: [
      { title: "이벤트 유의사항", items: [
        "안내된 '참여하기' 버튼을 통해 '대출 간편신청 서비스' 페이지에서 상담을 신청한 후, 대출 실행이 완료된 경우에만 포인트가 지급됩니다.",
        "이벤트 시작일부터 최초 1회 대출 신청에 한해 지급됩니다.",
        "상담 신청 시 '추천인 코드'를 입력하고 대출 실행이 완료되면, 추천인과 피추천인 모두에게 '대출간편신청 친구추천 이벤트' 포인트 10,000원이 지급됩니다.",
        "친구추천 리워드는 추천인 기준 매달 최대 5회까지 지급됩니다.",
        "본 이벤트는 Bravo Korea의 사정에 따라 사전 고지 없이 변경 또는 종료될 수 있습니다.",
      ]},
      { title: "대출 유의사항", items: [
        "이자 및 원리금 납입 지연 시 지연배상금율(약정이자율 +3%, 최고 15%)이 발생하여 채무자의 재산 및 신용상의 불이익(기한이익상실 등)이 발생할 수 있으니 주의하시기 바랍니다.",
        "상환능력에 비해 대출금이 과도할 경우 개인신용평점이 하락할 수 있습니다.",
        "개인신용평점 하락으로 금융거래와 관련된 불이익이 발생할 수 있습니다.",
        "일정 기간 납부해야 할 원리금이 연체될 경우, 계약만료 전이라도 모든 원리금을 변제해야 할 의무가 발생할 수 있습니다.",
        "금융기관은 신용관리대상 고객 등 당사에서 정한 대출 부적격자에 대하여 대출이 제한될 수 있습니다.",
        "금융소비자보호법 제19조 1항에 따라 상품에 대하여 설명 받으실 권리가 있습니다.",
        "본 자료는 법령 및 내부통제 기준에 따라 작성되었습니다.",
        "기타 자세한 사항 및 대출 심사 관련 문의는 Bravo Korea 금융센터(1588-2266)를 통해 문의하시기 바랍니다.",
        "계약을 체결하기 전에 상품설명서 및 약관을 반드시 읽어보시기 바랍니다.",
      ]},
    ],
    legal: "본 이벤트 및 대출 상품은 Bravo Korea 금융센터를 통해 제공됩니다. 대출 심사 결과에 따라 대출 실행 및 혜택 지급이 제한될 수 있으며, 최신 정보는 앱 내 이벤트 페이지를 기준으로 합니다. 문의: Bravo Korea 금융센터 1588-2266.",
  },
];

const SEED_POSTS = [
  {
    id: "p_notice1",
    cat: "free", notice: true,
    title: "Community guidelines — please read before your first post",
    author: "Bravo Team", flag: "🇰🇷", agoMin: 4320,
    body:
      "Welcome to the Bravo Korea community 👋\n\nA few house rules to keep this place useful for everyone:\n\n1. Be kind. We're all figuring Korea out together.\n2. No spam, no scalping, no MLM recruiting.\n3. Housing & market posts: include your area (구/동) and price.\n4. English is the shared language, but Korean phrases are always welcome.\n\nBreaking a rule? Report the post and a mod will look within 24h. Thanks for making this a good place. 🙏",
    image: null, youtube: null, likes: 0, comments: 0, shares: 0,
  },
  {
    id: "p_notice2",
    cat: "free", notice: true,
    title: "Bravo Korea app 2.0 is live — DMs, verified housing & local events",
    author: "Bravo Team", flag: "🇰🇷", agoMin: 2880,
    body:
      "The app you've been asking for just landed. What's new in 2.0:\n\n• Direct messages — take any community thread private.\n• Verified housing listings with deposit-insurance flags.\n• Local events map — meetups near you, tonight.\n• One-tap TOPIK study rooms.\n\nEverything you love about this board, plus the people. Tap any post's share button to invite a friend — we're growing fast. 🚀",
    image: null, youtube: null, likes: 0, comments: 0, shares: 0,
  },
  {
    id: "p_ktr01",
    cat: "korean",
    title: "The 3 Korean phrases that instantly make ajummas like you",
    author: "Maya R.", flag: "🇵🇭", agoMin: 22,
    body:
      "I've lived in Seoul for two years and nothing — I mean nothing — changed my daily life like these three phrases at the market in Mangwon.\n\n1. \"이모, 이거 얼마예요?\" (Auntie, how much is this?) — calling her 이모 instead of 아줌마 is the whole game.\n2. \"많이 파세요!\" (Sell a lot today!) — say it on the way out. Watch her face.\n3. \"덤 좀 주세요~\" said with a smile gets you an extra handful of strawberries. Every time.\n\nKoreans warm up FAST when you show you know the social codes. This isn't textbook Korean — it's street Korean.",
    image: null,
    youtube: "https://www.youtube.com/watch?v=8pTEmbeENF4",
    likes: 214, comments: 37, shares: 41,
  },
  {
    id: "p_vsa02",
    cat: "visa",
    title: "D-2 → D-10 job-seeker visa: the mistake that cost me 3 weeks",
    author: "Daniel K.", flag: "🇨🇦", agoMin: 74,
    body:
      "If you're graduating and switching to the D-10 job-seeker visa, read this before you go to immigration.\n\nI booked my HiKorea appointment, showed up with my diploma... and got sent home because I didn't have the 'point system' evaluation sheet filled out. The D-10 uses a points table (age, degree, Korean level, etc.) and you need enough points to qualify.\n\nBring: diploma + transcript, points self-assessment, bank balance proof (~₩20M), and a job-search plan. Do the points math FIRST at hikorea.go.kr.\n\nHappy to answer questions in the comments — I just went through the whole thing.",
    image: null,
    youtube: null,
    likes: 156, comments: 52, shares: 28,
  },
  {
    id: "p_job03",
    cat: "jobs",
    title: "Got a dev job in Korea without speaking Korean — here's the honest version",
    author: "Priya S.", flag: "🇮🇳", agoMin: 130,
    body:
      "Everyone says you need TOPIK 4 to work here. For English-teaching, sure. For tech? Not always.\n\nI landed a backend role at a Seoul startup with basically survival Korean. What actually mattered:\n- A GitHub that actually shows work\n- Being on the RIGHT platforms (not just LinkedIn — check wanted.co.kr and the startup Slack communities)\n- Being upfront that I'd study Korean, and then actually doing it\n\nSalary was lower than back home but cost of living + experience made it worth it. AMA.",
    image: null,
    youtube: null,
    likes: 342, comments: 88, shares: 63,
  },
  {
    id: "p_pre04",
    cat: "prearrival",
    title: "Landing at Incheon at 11pm? Do NOT skip this checklist",
    author: "Tom H.", flag: "🇬🇧", agoMin: 200,
    body:
      "Arriving late at night your first time is stressful. Save this.\n\n✅ Get a T-money card at the convenience store INSIDE the terminal (buses/subway won't take foreign cards).\n✅ AREX last train leaves ~11:50pm — after that it's the 6001/6015 limousine bus or a taxi (₩60–90k to central Seoul).\n✅ Download KakaoT for taxis and Naver Map before you land — Google Maps walking directions are broken here.\n✅ Screenshot your accommodation address in Korean.\n\nThe airport has free wifi and 24h convenience stores, so breathe. You've got this.",
    image: null,
    youtube: null,
    likes: 421, comments: 44, shares: 97,
  },
  {
    id: "p_stu05",
    cat: "students",
    title: "How I cut my Seoul student budget to ₩900k/month (real breakdown)",
    author: "Lena M.", flag: "🇩🇪", agoMin: 260,
    body:
      "Exchange student in Sinchon. Everyone told me Seoul is expensive. It can be — or not.\n\nMy monthly numbers:\n- Goshiwon room: ₩380,000 (tiny but includes rice + kimchi + wifi)\n- Food: ₩300,000 (student cafeterias are ₩4–5k a meal!)\n- Transport: ₩70,000\n- Phone (알뜰폰): ₩22,000\n- Fun money: ₩130,000\n\nBiggest hacks: eat at 학식 cafeterias, get a 알뜰폰 SIM, and use the ₩0 university gym. Ask me anything.",
    image: null,
    youtube: null,
    likes: 289, comments: 61, shares: 34,
  },
  {
    id: "p_mny06",
    cat: "money",
    title: "Sending money home without losing 5% to your bank — what I actually use",
    author: "Carlos V.", flag: "🇧🇷", agoMin: 330,
    body:
      "Traditional bank remittance from Korea was quietly eating my money. Here's what changed things.\n\nCompare the real rate (mid-market) vs what your bank gives you — the gap IS the fee, even when they say 'no fee.' I moved to specialist remittance apps and the difference on a ₩2,000,000 transfer was around ₩70,000. That's a nice dinner every month.\n\nNot financial advice, just a foreigner who got tired of the spread. What are you all using?",
    image: null,
    youtube: null,
    likes: 178, comments: 40, shares: 22,
  },
  {
    id: "p_hou07",
    cat: "housing",
    title: "전세 vs 월세 explained like you're not a finance major",
    author: "Aisha B.", flag: "🇳🇬", agoMin: 410,
    body:
      "The Korean rent system confused me for MONTHS so here it is, plain:\n\n📦 월세 (monthly rent): deposit (보증금) + monthly rent. Deposit is usually ₩5–20M. You get it back when you leave.\n\n🏦 전세 (jeonse): you hand over a HUGE lump sum (can be 50–70% of the home's value), pay ₩0 monthly, and get it ALL back at the end. The landlord invests your money instead of charging rent.\n\nFor most foreigners on a 1–2 year stay, 월세 is realistic. Jeonse needs serious capital + a trustworthy landlord + 전세보증보험 (deposit insurance). Please get the insurance.",
    image: null,
    youtube: null,
    likes: 312, comments: 73, shares: 58,
  },
  {
    id: "p_food08",
    cat: "food",
    title: "The ₩6,000 gukbap spot near Seoul Station that ruined all other soup for me",
    author: "Sofia L.", flag: "🇪🇸", agoMin: 480,
    body:
      "No English menu. No Instagram wall. Just a grandma, a giant pot, and a line of taxi drivers — which is how you KNOW.\n\nOrder 돼지국밥 (pork gukbap), add the 다대기 (spicy paste) little by little, dump in the rice, and wreck it with the kkakdugi radish kimchi. ₩6,000. It's the best cold-morning food in the city.\n\nDropping the map pin in the comments. Go before it gets discovered.",
    image: null,
    youtube: null,
    likes: 508, comments: 92, shares: 71,
  },
  {
    id: "p_mkt09",
    cat: "market",
    title: "[Selling] Moving out — IKEA desk, monitor, rice cooker (Mapo, pickup)",
    author: "Jae O.", flag: "🇺🇸", agoMin: 55,
    body:
      "Leaving Korea end of month 😢 Everything must go. Pickup in Mapo-gu, near Hapjeong station.\n\n• IKEA BEKANT desk (white) — ₩30,000\n• 27\" LG monitor, 1440p — ₩90,000\n• Cuckoo 6-cup rice cooker — ₩25,000\n• Miscellaneous kitchen stuff — free with any purchase\n\nDM me or comment. Cash or transfer. First come first served, no holds sorry!",
    image: null,
    youtube: null,
    likes: 44, comments: 19, shares: 6,
  },
  {
    id: "p_meet10",
    cat: "meetups",
    title: "Sunday Han River picnic + language exchange — all levels, come hang",
    author: "Nadia F.", flag: "🇪🇬", agoMin: 90,
    body:
      "We do this every Sunday at Yeouido Hangang Park (weather permitting) and it's become the highlight of my week.\n\n🧺 Bring: a mat, a snack to share, and zero pressure.\n🗣️ Half Korean / half English, all levels welcome — beginners especially.\n🕒 2pm, near exit 3 of Yeouinaru station, look for the yellow balloon.\n\nLast week we were 30+ people from 12 countries. Chimaek after for anyone who wants. Comment if you're coming so I know roughly how many!",
    image: null,
    youtube: null,
    likes: 267, comments: 84, shares: 45,
  },
  {
    id: "p_free11",
    cat: "free",
    title: "Two years in Korea today. Some things nobody warned me about.",
    author: "Marco P.", flag: "🇮🇹", agoMin: 15,
    body:
      "Two years ago today I landed with two suitcases and a language app I never opened. A few honest reflections:\n\n• The loneliness is real for the first 6 months. Then you find your people and it flips completely.\n• 빨리빨리 culture stressed me out, then became the thing I'll miss most.\n• You will ugly-cry in a 편의점 at least once. It's fine.\n• Nobody warned me I'd stop being able to eat non-spicy food.\n\nTo everyone who just arrived: it gets so much better. Ask me anything, I've probably made the mistake already.",
    image: null,
    youtube: null,
    likes: 613, comments: 128, shares: 88,
  },
];
