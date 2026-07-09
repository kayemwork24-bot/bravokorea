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

/* ---------------------------------------------------------------- events */
const EVENTS = [
  { id: "ev1", emoji: "🗣️", type: "언어교환", color: "#FF7A00",
    title: "Seoul Language Exchange Night", date: "7월 12일 (토)", time: "저녁 7:00",
    place: "홍대 · Hongdae Cafe Lounge", price: "무료",
    desc: "한국어 반, 영어 반. 초보 대환영이에요. 편하게 와서 새로운 친구를 만들어 보세요.",
    going: 128, cap: 150 },
  { id: "ev2", emoji: "💃", type: "클래스", color: "#FF4D8D",
    title: "K-Pop Dance Class — Beginner", date: "7월 13일 (일)", time: "오후 2:00",
    place: "강남 · Def Dance Studio", price: "₩20,000",
    desc: "이번 달 곡은 NewJeans. 안무 경험 전혀 없어도 한 시간이면 한 소절은 춥니다.",
    going: 42, cap: 45 },
  { id: "ev3", emoji: "📋", type: "세미나", color: "#1B4DFF",
    title: "Visa & Immigration Q&A Seminar", date: "7월 16일 (수)", time: "저녁 7:30",
    place: "온라인 + 이태원 라운지", price: "무료",
    desc: "D-2 → D-10 전환, F-비자, 세금까지. 행정사와 함께하는 실전 Q&A 세션.",
    going: 87, cap: 200 },
  { id: "ev4", emoji: "🧺", type: "모임", color: "#0FB5A6",
    title: "Han River Picnic & Chimaek", date: "7월 19일 (토)", time: "오후 4:00",
    place: "여의도 한강공원 3번 출구", price: "무료",
    desc: "돗자리, 나눠 먹을 간식만 챙겨오세요. 노란 풍선을 찾으면 됩니다. 치맥은 자유!",
    going: 213, cap: 250 },
  { id: "ev5", emoji: "💼", type: "커리어", color: "#00A676",
    title: "Foreigner Job Fair 2026", date: "7월 22일 (화)", time: "오전 10:00",
    place: "삼성 · COEX Hall C", price: "무료",
    desc: "IT·스타트업·교육 40개 기업 부스. 영문 이력서 20부는 챙겨오는 걸 추천해요.",
    going: 356, cap: 500 },
  { id: "ev6", emoji: "🏔️", type: "아웃도어", color: "#8AB800",
    title: "Bukhansan Sunrise Hike", date: "7월 27일 (일)", time: "새벽 5:00",
    place: "북한산 우이역 집결", price: "무료",
    desc: "정상에서 보는 서울 일출. 중급 난이도, 물과 등산화 필수. 하산 후 해장국 있어요.",
    going: 64, cap: 80 },

  /* ---- 종료된 이벤트 (ended) ---- */
  { id: "ev7", emoji: "🌮", type: "페스티벌", color: "#FF6400", ended: true,
    title: "Itaewon Global Food Festival", date: "6월 14일 (토)", time: "오후 12:00",
    place: "이태원 · Itaewon-ro", price: "무료",
    desc: "30개국 길거리 음식 부스. 올여름 최대 규모로 성황리에 마감했습니다. 후기 감사해요!",
    going: 480, cap: 480 },
  { id: "ev8", emoji: "🤝", type: "네트워킹", color: "#008CFF", ended: true,
    title: "Seoul Startup Networking Night", date: "6월 20일 (금)", time: "저녁 7:00",
    place: "강남 · Maru180", price: "무료",
    desc: "외국인 창업자·개발자 210명이 모였습니다. 다음 시즌 라운드는 앱에서 먼저 공지돼요.",
    going: 210, cap: 210 },
  { id: "ev9", emoji: "📚", type: "클래스", color: "#7A5CFF", ended: true,
    title: "4-Week Korean Bootcamp (Spring)", date: "6월 7일 (토)", time: "오전 10:00",
    place: "온라인 · Zoom", price: "₩120,000",
    desc: "왕초보 대상 4주 집중 과정. 수료율 92%로 종료. 가을 기수는 대기 신청을 받고 있어요.",
    going: 96, cap: 100 },
  { id: "ev10", emoji: "🚡", type: "데이트립", color: "#0FB5A6", ended: true,
    title: "Nami Island Day Trip", date: "6월 28일 (토)", time: "오전 8:00",
    place: "남이섬 · 가평 집결", price: "₩45,000",
    desc: "당일 왕복 버스 + 입장권 포함으로 진행했던 봄 나들이. 45석 조기 마감되었습니다.",
    going: 45, cap: 45 },
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
