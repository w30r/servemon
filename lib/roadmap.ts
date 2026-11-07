import type { Lang } from "./i18n";

/**
 * Roadmap content is long-form and per-language, so it lives here instead of
 * the UI dictionaries in `i18n.ts`. Keys stay in sync across all four
 * languages; `pick` falls back to English if one is ever missed.
 */
export type Localized = Record<Lang, string>;

export function pick(lang: Lang, text: Localized): string {
  return text[lang] ?? text.en;
}

export const ROADMAP_LOCALES: Record<Lang, string> = {
  en: "en-MY",
  bm: "ms-MY",
  zh: "zh-MY",
  ta: "ta-MY",
};

export const SHIPPED_STATES = [
  "Johor",
  "Kedah",
  "Kelantan",
  "Negeri Sembilan",
  "Perak",
  "Perlis",
  "Pulau Pinang",
  "Sabah",
  "Sarawak",
  "Selangor",
  "Terengganu",
] as const;

export const FEDERAL_TERRITORIES = [
  "Kuala Lumpur",
  "Putrajaya",
  "Labuan",
] as const;

export type BlockedState = {
  name: string;
  reason: Localized;
};

export const BLOCKED_STATES: BlockedState[] = [
  {
    name: "Melaka",
    reason: {
      en: "The official channel is a Facebook page that loads posts through JavaScript and GraphQL. Without an authenticated session there is no reliable list of posts to scrape.",
      bm: "Saluran rasminya ialah halaman Facebook yang memuatkan pos melalui JavaScript dan GraphQL. Tanpa sesi yang disahkan, tiada senarai pos yang boleh diambil secara automatik.",
      zh: "官方渠道是一个通过 JavaScript 和 GraphQL 加载帖子的 Facebook 页面。没有已验证的会话，就无法可靠地获取帖子列表。",
      ta: "அதிகாரப்பூர்வ சேனல் JavaScript மற்றும் GraphQL மூலம் பதிவுகளை ஏற்றும் Facebook பக்கம். அங்கீகரிக்கப்பட்ட அமர்வு இல்லாமல் பதிவுகளின் பட்டியலை நம்பகமாகச் சேகரிக்க முடியாது.",
    },
  },
  {
    name: "Pahang",
    reason: {
      en: "The state portal is under maintenance and its bot fingerprinting blocks automated requests. We will retry once it is stable.",
      bm: "Portal negeri sedang dalam penyelenggaraan dan pengesanan bot menyekat permintaan automatik. Kami akan cuba lagi apabila ia stabil.",
      zh: "州门户正在维护，其机器人指纹识别会拦截自动请求。等它稳定后我们会再试。",
      ta: "மாநில இணையதளம் பராமரிப்பில் உள்ளது, மேலும் அதன் bot கைரேகை அடையாளம் தானியங்கி கோரிக்கைகளைத் தடுக்கிறது. நிலைத்தன்மை அடைந்ததும் மீண்டும் முயற்சிப்போம்.",
    },
  },
];

export type RoadmapArea = "archive" | "infra" | "browse" | "ai";

export type TimelineEntry = {
  date: string;
  area: RoadmapArea;
  title: Localized;
  body: Localized;
};

export const TIMELINE: TimelineEntry[] = [
  {
    date: "2026-08-26",
    area: "infra",
    title: {
      en: "First commit",
      bm: "Komit pertama",
      zh: "第一次提交",
      ta: "முதல் commit",
    },
    body: {
      en: "Next.js scaffold with SQLite and a place to keep the PDFs. No data yet.",
      bm: "Rangka Next.js dengan SQLite dan tempat menyimpan PDF. Belum ada data.",
      zh: "Next.js 项目骨架、SQLite，以及存放 PDF 的位置。此时还没有数据。",
      ta: "SQLite மற்றும் PDF சேமிப்பகத்துடன் Next.js அடித்தளம். இன்னும் தரவு இல்லை.",
    },
  },
  {
    date: "2026-08-27",
    area: "archive",
    title: {
      en: "Selangor and JAKIM go live",
      bm: "Selangor dan JAKIM mula berjalan",
      zh: "雪兰莪与 JAKIM 上线",
      ta: "சிலாங்கூர் மற்றும் JAKIM செயல்படத் தொடங்கின",
    },
    body: {
      en: "Scrapers for JAIS (Selangor) and JAKIM (Kuala Lumpur, Putrajaya, Labuan) start filling the archive with locally stored PDFs.",
      bm: "Pengikis untuk JAIS (Selangor) dan JAKIM (Kuala Lumpur, Putrajaya, Labuan) mula mengisi arkib dengan PDF yang disimpan secara tempatan.",
      zh: "JAIS（雪兰莪）和 JAKIM（吉隆坡、布城、纳闽）的采集器开始用本地保存的 PDF 填充档案库。",
      ta: "JAIS (சிலாங்கூர்) மற்றும் JAKIM (கோலாலம்பூர், புத்ராஜெயா, லாபுவான்) சேகரிப்பான்கள் உள்ளூரில் சேமிக்கப்பட்ட PDF-களால் காப்பகத்தை நிரப்பத் தொடங்கின.",
    },
  },
  {
    date: "2026-08-28",
    area: "infra",
    title: {
      en: "Ships in a container",
      bm: "Dihantar dalam kontena",
      zh: "以容器形式交付",
      ta: "கண்டெய்னரில் விநியோகம்",
    },
    body: {
      en: "Docker image built and pushed to GHCR with GitHub Actions, ready for a persistent volume.",
      bm: "Imej Docker dibina dan dihantar ke GHCR melalui GitHub Actions, sedia untuk volum berterusan.",
      zh: "通过 GitHub Actions 构建 Docker 镜像并推送到 GHCR，可直接挂载持久化卷。",
      ta: "GitHub Actions மூலம் Docker image கட்டப்பட்டு GHCR-க்கு அனுப்பப்பட்டது, நிரந்தர volume-க்குத் தயார்.",
    },
  },
  {
    date: "2026-09-10",
    area: "archive",
    title: {
      en: "Scraper hardening",
      bm: "Pengukuhan pengikis",
      zh: "采集器加固",
      ta: "சேகரிப்பான் வலுப்படுத்தல்",
    },
    body: {
      en: "JAIS PDF links are built directly instead of scraping detail pages, and a password-gated /dev panel shows sync status.",
      bm: "Pautan PDF JAIS dibina terus tanpa mengikis halaman butiran, dan panel /dev berkata laluan memaparkan status penyegerakan.",
      zh: "JAIS 的 PDF 链接改为直接构造，不再抓取详情页；受密码保护的 /dev 面板可查看同步状态。",
      ta: "JAIS PDF இணைப்புகள் விவரப் பக்கங்களைச் சேகரிக்காமல் நேரடியாக உருவாக்கப்படுகின்றன; கடவுச்சொல் பாதுகாக்கப்பட்ட /dev பேனல் ஒத்திசைவு நிலையைக் காட்டுகிறது.",
    },
  },
  {
    date: "2026-11-06",
    area: "browse",
    title: {
      en: "This week at a glance",
      bm: "Minggu ini sekilas pandang",
      zh: "本周一览",
      ta: "இந்த வாரம் ஒரு பார்வையில்",
    },
    body: {
      en: "The home page highlights the current Friday's khutbah and hides future-dated ones, so the archive does not look stale.",
      bm: "Halaman utama menyerlahkan khutbah Jumaat semasa dan menyembunyikan yang bertarikh masa hadapan, jadi arkib tidak kelihatan lapuk.",
      zh: "首页突出显示本周五的讲道，并隐藏未来日期的内容，让档案库不会显得过时。",
      ta: "முகப்புப் பக்கம் இந்த வெள்ளிக்கிழமை உரையை முன்னிலைப்படுத்தி, எதிர்கால தேதிகளை மறைக்கிறது, எனவே காப்பகம் பழையதாகத் தெரியாது.",
    },
  },
  {
    date: "2026-11-07",
    area: "archive",
    title: {
      en: "Eight more states",
      bm: "Lapan negeri lagi",
      zh: "新增八个州",
      ta: "மேலும் எட்டு மாநிலங்கள்",
    },
    body: {
      en: "Negeri Sembilan, Perak, Pulau Pinang, Sabah, Sarawak, Terengganu, Kelantan and Perlis join the archive. PDFs are validated before saving, so dead links are never stored.",
      bm: "Negeri Sembilan, Perak, Pulau Pinang, Sabah, Sarawak, Terengganu, Kelantan dan Perlis menyertai arkib. PDF disahkan sebelum disimpan, jadi pautan mati tidak pernah disimpan.",
      zh: "森美兰、霹雳、槟城、沙巴、砂拉越、登嘉楼、吉兰丹和玻璃市加入档案库。PDF 在保存前会先验证，绝不存储失效链接。",
      ta: "நெகிரி செம்பிலான், பேராக், பினாங்கு, சபா, சரவாக், திரங்கானு, கிளந்தான் மற்றும் பெர்லிஸ் காப்பகத்தில் இணைகின்றன. PDF சேமிப்பதற்கு முன் சரிபார்க்கப்படுவதால், செயலிழந்த இணைப்புகள் சேமிக்கப்படுவதில்லை.",
    },
  },
  {
    date: "2026-11-07",
    area: "browse",
    title: {
      en: "Finding things",
      bm: "Mencari dengan mudah",
      zh: "更容易找到",
      ta: "எளிதாகத் தேடுதல்",
    },
    body: {
      en: "Multi-state filters, date ranges, language and sort, state flags on every card, one download button with a language picker, and WhatsApp/copy-link sharing.",
      bm: "Penapis berbilang negeri, julat tarikh, bahasa dan susunan, bendera negeri pada setiap kad, satu butang muat turun dengan pemilih bahasa, serta perkongsian WhatsApp/salin pautan.",
      zh: "多州筛选、日期范围、语言与排序，每张卡片显示州旗，一个带语言选择的下载按钮，以及 WhatsApp/复制链接分享。",
      ta: "பல மாநில வடிகட்டிகள், தேதி வரம்புகள், மொழி மற்றும் வரிசை, ஒவ்வொரு அட்டையிலும் மாநிலக் கொடி, மொழித் தேர்வுடன் ஒரு பதிவிறக்க பொத்தான், மற்றும் WhatsApp/இணைப்பு நகல் பகிர்வு.",
    },
  },
  {
    date: "2026-11-07",
    area: "ai",
    title: {
      en: "AI summaries",
      bm: "Ringkasan AI",
      zh: "AI 摘要",
      ta: "AI சுருக்கங்கள்",
    },
    body: {
      en: "On-demand summaries from the Rumi PDF, written in Malay and translated to English, Chinese and Tamil. Cached per PDF, with every dalil checked against the source before it is shown.",
      bm: "Ringkasan atas permintaan daripada PDF Rumi, ditulis dalam Bahasa Melayu dan diterjemah ke Bahasa Inggeris, Cina dan Tamil. Disimpan dalam cache mengikut PDF, dan setiap dalil disemak dengan sumber sebelum dipaparkan.",
      zh: "按需从罗马化 PDF 生成摘要，先写马来文，再翻译成英文、中文和泰米尔文。按 PDF 缓存，每个 dalil 在显示前都会与原文核对。",
      ta: "Rumi PDF-இலிருந்து தேவைக்கேற்ப சுருக்கங்கள், மலாயில் எழுதப்பட்டு ஆங்கிலம், சீனம், தமிழில் மொழிபெயர்க்கப்படுகின்றன. PDF வாரியாக cache செய்யப்பட்டு, ஒவ்வொரு தலீலும் காட்டப்படுவதற்கு முன் மூலத்துடன் சரிபார்க்கப்படுகிறது.",
    },
  },
];

export type TodoStatus = "next" | "exploring" | "blocked";

export type RoadmapTodo = {
  title: Localized;
  body: Localized;
  status: TodoStatus;
};

export const TODOS: RoadmapTodo[] = [
  {
    status: "blocked",
    title: {
      en: "Melaka scraper",
      bm: "Pengikis Melaka",
      zh: "马六甲采集器",
      ta: "மலாக்கா சேகரிப்பான்",
    },
    body: {
      en: "The Facebook-only source needs a different discovery route before it can be automated.",
      bm: "Sumber Facebook sahaja memerlukan laluan penemuan lain sebelum ia boleh diautomasikan.",
      zh: "仅有的 Facebook 来源需要另一条发现路径才能自动化。",
      ta: "Facebook-ஐ மட்டுமே சார்ந்த மூலத்தை தானியக்கமாக்க மற்றொரு கண்டுபிடிப்பு வழி தேவை.",
    },
  },
  {
    status: "blocked",
    title: {
      en: "Pahang scraper",
      bm: "Pengikis Pahang",
      zh: "彭亨采集器",
      ta: "பகாங் சேகரிப்பான்",
    },
    body: {
      en: "Revisit once the portal leaves maintenance and bot fingerprinting eases.",
      bm: "Tinjau semula apabila portal keluar dari penyelenggaraan dan pengesanan bot berkurangan.",
      zh: "等门户结束维护、机器人指纹识别放松后再重新评估。",
      ta: "இணையதளம் பராமரிப்பிலிருந்து வெளியேறி bot கைரேகை குறைந்ததும் மீண்டும் பார்க்கவும்.",
    },
  },
  {
    status: "next",
    title: {
      en: "Jawi-only papers",
      bm: "Kertas Jawi sahaja",
      zh: "仅爪夷文的讲稿",
      ta: "ஜாவி மட்டும் ஆவணங்கள்",
    },
    body: {
      en: "Most Johor papers are Jawi-only and currently skipped by the summary pipeline. Arabic OCR would open them up.",
      bm: "Kebanyakan kertas Johor hanya dalam Jawi dan kini dilangkau oleh saluran ringkasan. OCR Arab akan membukanya.",
      zh: "柔佛大多数讲稿只有爪夷文，目前被摘要流程跳过。阿拉伯文 OCR 可以解决这个问题。",
      ta: "ஜொகூரின் பெரும்பாலான ஆவணங்கள் ஜாவியில் மட்டுமே உள்ளன, தற்போது சுருக்க செயல்முறையால் தவிர்க்கப்படுகின்றன. அரபு OCR அவற்றைத் திறக்கும்.",
    },
  },
  {
    status: "next",
    title: {
      en: "Pre-generate this week's summary",
      bm: "Jana awal ringkasan minggu ini",
      zh: "预生成本周摘要",
      ta: "இந்த வார சுருக்கத்தை முன்கூட்டியே உருவாக்கு",
    },
    body: {
      en: "Generation is on demand. Pre-warming the current Friday makes the first visit instant without a large bill.",
      bm: "Penjanaan adalah atas permintaan. Memanaskan lebih awal khutbah Jumaat semasa menjadikan lawatan pertama segera tanpa bil besar.",
      zh: "目前是按需生成。提前生成本周五的摘要能让首次访问瞬间完成，而成本不高。",
      ta: "உருவாக்கம் தேவைக்கேற்ப மட்டுமே. இந்த வெள்ளிக்கிழமையை முன்கூட்டியே உருவாக்கினால் முதல் வருகை உடனடியாக இருக்கும், அதிக செலவும் இல்லை.",
    },
  },
  {
    status: "exploring",
    title: {
      en: "Scraper health monitor",
      bm: "Pemantau kesihatan pengikis",
      zh: "采集器健康监控",
      ta: "சேகரிப்பான் நலக் கண்காணிப்பு",
    },
    body: {
      en: "Alert when a state stops returning new sermons for several weeks, instead of hearing it from a user.",
      bm: "Beritahu lebih awal apabila sesuatu negeri berhenti mengembalikan khutbah baharu selama beberapa minggu.",
      zh: "当某个州连续几周没有新讲道时主动提醒，而不是等用户来告知。",
      ta: "ஒரு மாநிலம் பல வாரங்களாக புதிய உரைகளைத் தரவில்லை என்றால், பயனரிடமிருந்து அறிவதற்குப் பதிலாக முன்கூட்டியே எச்சரிக்கை.",
    },
  },
  {
    status: "exploring",
    title: {
      en: "Search inside summaries",
      bm: "Cari dalam ringkasan",
      zh: "在摘要中搜索",
      ta: "சுருக்கங்களுக்குள் தேடல்",
    },
    body: {
      en: "Search currently matches titles only. Full text over summaries would let people find a topic, not just a title.",
      bm: "Carian kini hanya memadankan tajuk. Teks penuh dalam ringkasan membolehkan orang mencari topik, bukan sekadar tajuk.",
      zh: "目前搜索只匹配标题。对摘要做全文搜索，能让人按主题查找，而不只是标题。",
      ta: "தேடல் தற்போது தலைப்புகளை மட்டுமே பொருத்துகிறது. சுருக்கங்களில் முழு உரைத் தேடல் இருந்தால் தலைப்பு மட்டுமல்ல, ஒரு தலைப்பைக் கண்டறியலாம்.",
    },
  },
  {
    status: "exploring",
    title: {
      en: "Public JSON feed",
      bm: "Suapan JSON awam",
      zh: "公开 JSON 数据源",
      ta: "பொது JSON ஊட்டம்",
    },
    body: {
      en: "Let other apps and researchers reuse the archive without scraping HTML.",
      bm: "Membolehkan aplikasi dan penyelidik lain menggunakan semula arkib tanpa mengikis HTML.",
      zh: "让其他应用和研究者在无需抓取 HTML 的情况下复用这个档案库。",
      ta: "மற்ற செயலிகள் மற்றும் ஆய்வாளர்கள் HTML சேகரிக்காமல் காப்பகத்தை மீண்டும் பயன்படுத்த அனுமதிக்கும்.",
    },
  },
];

export const ROADMAP_COPY = {
  badge: {
    en: "Roadmap",
    bm: "Peta Jalan",
    zh: "路线图",
    ta: "செயல்திட்டம்",
  },
  title: {
    en: "Where Servemon is going",
    bm: "Ke mana Servemon menuju",
    zh: "Servemon 的方向",
    ta: "Servemon எங்கு செல்கிறது",
  },
  subtitle: {
    en: "What has shipped, what is next, and the states we cannot reach yet.",
    bm: "Apa yang sudah siap, apa yang menyusul, dan negeri yang belum dapat dicapai.",
    zh: "已经完成什么、接下来做什么，以及哪些州目前还拿不到。",
    ta: "என்ன முடிந்தது, அடுத்து என்ன, இன்னும் எட்ட முடியாத மாநிலங்கள் யாவை.",
  },
  coverageTitle: {
    en: "Coverage",
    bm: "Liputan",
    zh: "覆盖范围",
    ta: "கவரேஜ்",
  },
  coverageBody: {
    en: "11 of 13 states plus all three federal territories. Every PDF is downloaded and stored locally, so the archive keeps working even when government sites go down.",
    bm: "11 daripada 13 negeri serta ketiga-tiga wilayah persekutuan. Setiap PDF dimuat turun dan disimpan secara tempatan, jadi arkib terus berfungsi walaupun laman kerajaan tergendala.",
    zh: "13 个州中的 11 个，以及全部三个联邦直辖区。每个 PDF 都会下载并保存在本地，因此即使政府网站宕机，档案库依然可用。",
    ta: "13 மாநிலங்களில் 11, மற்றும் மூன்று கூட்டாட்சி பிரதேசங்கள் அனைத்தும். ஒவ்வொரு PDF-உம் பதிவிறக்கி உள்ளூரில் சேமிக்கப்படுவதால், அரசு தளங்கள் செயலிழந்தாலும் காப்பகம் தொடர்ந்து வேலை செய்யும்.",
  },
  liveLabel: {
    en: "Live",
    bm: "Aktif",
    zh: "已上线",
    ta: "இயங்குகிறது",
  },
  unavailableLabel: {
    en: "Not available yet",
    bm: "Belum tersedia",
    zh: "暂未提供",
    ta: "இன்னும் கிடைக்கவில்லை",
  },
  unavailableBody: {
    en: "Two states are missing because their official sources do not publish scrapeable Friday sermons.",
    bm: "Dua negeri belum tersedia kerana sumber rasminya tidak menerbitkan khutbah Jumaat dalam bentuk yang boleh diambil secara automatik.",
    zh: "还有两个州未能提供，因为其官方来源没有以可自动采集的形式发布主麻讲道。",
    ta: "இரண்டு மாநிலங்கள் இன்னும் இல்லை, ஏனெனில் அவற்றின் அதிகாரப்பூர்வ ஆதாரங்கள் தானியங்கி சேகரிப்புக்கு ஏற்ற வடிவத்தில் வெள்ளிக்கிழமை உரைகளை வெளியிடவில்லை.",
  },
  shippedTitle: {
    en: "What's shipped",
    bm: "Yang sudah siap",
    zh: "已完成",
    ta: "முடிந்தவை",
  },
  nextTitle: {
    en: "Up next",
    bm: "Seterusnya",
    zh: "接下来",
    ta: "அடுத்து",
  },
  areas: {
    archive: {
      en: "Archive",
      bm: "Arkib",
      zh: "档案",
      ta: "காப்பகம்",
    },
    infra: {
      en: "Infra",
      bm: "Infra",
      zh: "基础设施",
      ta: "அடித்தளம்",
    },
    browse: {
      en: "Browsing",
      bm: "Pelayaran",
      zh: "浏览",
      ta: "உலாவல்",
    },
    ai: {
      en: "AI",
      bm: "AI",
      zh: "AI",
      ta: "AI",
    },
  },
  statuses: {
    next: {
      en: "Next up",
      bm: "Seterusnya",
      zh: "接下来",
      ta: "அடுத்து",
    },
    exploring: {
      en: "Exploring",
      bm: "Menjajaki",
      zh: "探索中",
      ta: "ஆராய்கிறது",
    },
    blocked: {
      en: "Blocked",
      bm: "Tersekat",
      zh: "受阻",
      ta: "தடைப்பட்டது",
    },
  },
} satisfies Record<string, Localized | Record<string, Localized>>;
