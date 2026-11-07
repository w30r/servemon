import type { Lang } from "./i18n";

/**
 * Long-form About copy lives here, like `roadmap.ts`, so the UI dictionaries
 * in `i18n.ts` stay short. Every string exists in all four languages.
 */
export type Localized = Record<Lang, string>;

function pick(lang: Lang, text: Localized): string {
  return text[lang] ?? text.en;
}

export const aboutPick = pick;

export const ABOUT_COPY = {
  badge: {
    en: "About",
    bm: "Tentang",
    zh: "关于",
    ta: "பற்றி",
  },
  title: {
    en: "About Servemon",
    bm: "Tentang Servemon",
    zh: "关于 Servemon",
    ta: "Servemon பற்றி",
  },
  subtitle: {
    en: "A small archive with one job: make Malaysia's Friday khutbah easy to find, read and keep.",
    bm: "Sebuah arkib kecil dengan satu tugas: memudahkan khutbah Jumaat Malaysia dicari, dibaca dan disimpan.",
    zh: "一个小档案库，只做一件事：让马来西亚的主麻讲道更容易被找到、阅读和保存。",
    ta: "ஒரே வேலை கொண்ட சிறிய காப்பகம்: மலேசியாவின் வெள்ளிக்கிழமை குத்பாக்களைக் கண்டறிய, படிக்க மற்றும் சேமிக்க எளிதாக்குவது.",
  },
  story: {
    en: [
      "I'm Syamil. Servemon started because khutbah PDFs are scattered across eleven state portals, each with its own layout, naming and download flow. Finding last week's sermon usually means knowing which site to visit first.",
      "So this site does the boring part: it checks the official portals on a schedule, downloads each PDF, and stores it locally. If a portal goes down, the archive keeps working. Dead links are never saved.",
      "No accounts, no tracking, no ads. Just the khutbah, the download, and an optional summary.",
    ],
    bm: [
      "Aku Syamil. Servemon bermula kerana PDF khutbah bertaburan di portal sebelas negeri, masing-masing dengan susun atur, penamaan dan cara muat turun tersendiri. Mencari khutbah minggu lalu selalunya bermakna kita kena tahu portal mana yang perlu dibuka dahulu.",
      "Jadi laman ini buat bahagian yang membosankan: ia menyemak portal rasmi mengikut jadual, memuat turun setiap PDF, dan menyimpannya secara tempatan. Kalau portal tergendala, arkib tetap berfungsi. Pautan mati tidak sekali-kali disimpan.",
      "Tiada akaun, tiada penjejakan, tiada iklan. Hanya khutbah, muat turun, dan ringkasan jika anda mahu.",
    ],
    zh: [
      "我是 Syamil。Servemon 的起点很简单：khutbah PDF 分散在十一个州的门户上，每个门户的排版、命名和下载方式都不一样。要找上周的讲道，通常得先知道该去哪个网站。",
      "所以这个网站负责无聊的部分：按计划检查官方门户、下载每一份 PDF，并保存在本地。即使门户宕机，档案库依然可用。失效链接绝不会被保存。",
      "没有账号、没有跟踪、没有广告。只有讲道、下载，以及可选的摘要。",
    ],
    ta: [
      "நான் Syamil. பதினொரு மாநில இணையதளங்களில் குத்பா PDF-கள் சிதறிக் கிடப்பதால் Servemon தொடங்கியது. ஒவ்வொரு தளத்திற்கும் வெவ்வேறு அமைப்பு, பெயரிடல் மற்றும் பதிவிறக்க முறை. கடந்த வார உரையைத் தேட, எந்தத் தளத்திற்குச் செல்ல வேண்டும் என்று முதலில் தெரிந்திருக்க வேண்டும்.",
      "எனவே சலிப்பான பகுதியை இந்தத் தளம் செய்கிறது: அதிகாரப்பூர்வ தளங்களை திட்டமிட்டபடி சரிபார்த்து, ஒவ்வொரு PDF-ஐயும் பதிவிறக்கி உள்ளூரில் சேமிக்கிறது. தளம் செயலிழந்தாலும் காப்பகம் தொடர்ந்து வேலை செய்யும். செயலிழந்த இணைப்புகள் ஒருபோதும் சேமிக்கப்படுவதில்லை.",
      "கணக்குகள் இல்லை, கண்காணிப்பு இல்லை, விளம்பரங்கள் இல்லை. குத்பா, பதிவிறக்கம், மற்றும் விருப்பமான சுருக்கம் மட்டுமே.",
    ],
  },
  insideTitle: {
    en: "What's inside",
    bm: "Apa yang ada di sini",
    zh: "这里有什么",
    ta: "இங்கு என்ன இருக்கிறது",
  },
  inside: [
    {
      title: {
        en: "The archive",
        bm: "Arkib",
        zh: "档案库",
        ta: "காப்பகம்",
      },
      body: {
        en: "Every Friday khutbah from 11 states and all three federal territories, with state flags, multi-state filters, date ranges, language and title search.",
        bm: "Setiap khutbah Jumaat daripada 11 negeri dan ketiga-tiga wilayah persekutuan, dengan bendera negeri, penapis berbilang negeri, julat tarikh, bahasa dan carian tajuk.",
        zh: "来自 11 个州和全部三个联邦直辖区的主麻讲道，带有州旗、多州筛选、日期范围、语言和标题搜索。",
        ta: "11 மாநிலங்கள் மற்றும் மூன்று கூட்டாட்சி பிரதேசங்களின் வெள்ளிக்கிழமை குத்பாக்கள் — மாநிலக் கொடிகள், பல மாநில வடிகட்டிகள், தேதி வரம்புகள், மொழி மற்றும் தலைப்புத் தேடலுடன்.",
      },
    },
    {
      title: {
        en: "Read and take it with you",
        bm: "Baca dan bawa bersama",
        zh: "阅读并带走",
        ta: "படித்து உங்களுடன் எடுத்துச் செல்லுங்கள்",
      },
      body: {
        en: "Jawi, Rumi and English tabs in the viewer, one download button with a language picker, and share links for WhatsApp.",
        bm: "Tab Jawi, Rumi dan Inggeris dalam pemapar, satu butang muat turun dengan pemilih bahasa, serta pautan kongsi WhatsApp.",
        zh: "阅读器支持爪夷文、罗马化和英文标签页；一个带语言选择的下载按钮；以及 WhatsApp 分享链接。",
        ta: "பார்வையில் ஜாவி, ரூமி மற்றும் ஆங்கிலத் தாவல்கள்; மொழித் தேர்வுடன் ஒரு பதிவிறக்க பொத்தான்; WhatsApp பகிர்வு இணைப்புகள்.",
      },
    },
    {
      title: {
        en: "AI summaries",
        bm: "Ringkasan AI",
        zh: "AI 摘要",
        ta: "AI சுருக்கங்கள்",
      },
      body: {
        en: "An optional TL;DR, key points and verified dalils. Generated from the Rumi PDF only when you ask for it, then cached.",
        bm: "TL;DR, poin utama dan dalil yang disahkan — pilihan sahaja. Dijana daripada PDF Rumi hanya apabila anda memintanya, kemudian disimpan cache.",
        zh: "可选的 TL;DR、要点和已核对的 dalil。只在你需要时从罗马化 PDF 生成，然后缓存。",
        ta: "விருப்பமான TL;DR, முக்கியக் கருத்துகள் மற்றும் சரிபார்க்கப்பட்ட தலீல்கள். நீங்கள் கேட்கும்போது மட்டுமே ரூமி PDF-இலிருந்து உருவாக்கப்பட்டு cache செய்யப்படும்.",
      },
    },
    {
      title: {
        en: "Four languages",
        bm: "Empat bahasa",
        zh: "四种语言",
        ta: "நான்கு மொழிகள்",
      },
      body: {
        en: "English, Bahasa Melayu, 中文 and தமிழ் across the whole interface.",
        bm: "Bahasa Inggeris, Bahasa Melayu, 中文 dan தமிழ் di seluruh antara muka.",
        zh: "整个界面支持英文、马来文、中文和泰米尔文。",
        ta: "முழு இடைமுகமும் ஆங்கிலம், மலாய், சீனம் மற்றும் தமிழில்.",
      },
    },
  ],
  aiTitle: {
    en: "How the AI summaries work",
    bm: "Cara ringkasan AI berfungsi",
    zh: "AI 摘要如何运作",
    ta: "AI சுருக்கங்கள் எப்படி வேலை செய்கின்றன",
  },
  aiBody: {
    en: "A summary is generated only from the Rumi PDF. The file is read on the server, the text is extracted, and that text is sent to DeepSeek to write a Malay summary. English, Chinese and Tamil are translated from the Malay version.",
    bm: "Ringkasan hanya dijana daripada PDF Rumi. Fail dibaca di pelayan, teks diekstrak, dan teks itu dihantar ke DeepSeek untuk menulis ringkasan Bahasa Melayu. Bahasa Inggeris, Cina dan Tamil diterjemah daripada versi Melayu.",
    zh: "摘要只从罗马化（Rumi）PDF 生成。服务器读取文件、提取文本，再把文本发送给 DeepSeek 撰写马来文摘要。英文、中文和泰米尔文由马来文版本翻译而来。",
    ta: "சுருக்கம் ரூமி PDF-இலிருந்து மட்டுமே உருவாக்கப்படுகிறது. கோப்பு சர்வரில் படிக்கப்பட்டு, உரை பிரித்தெடுக்கப்பட்டு, மலாய் சுருக்கம் எழுத DeepSeek-க்கு அனுப்பப்படுகிறது. ஆங்கிலம், சீனம் மற்றும் தமிழ் மலாய் பதிப்பிலிருந்து மொழிபெயர்க்கப்படுகின்றன.",
  },
  aiPoints: {
    en: [
      "The PDF is never uploaded. Only extracted text leaves the server.",
      "Every dalil is checked against the source PDF before it is shown.",
      "Summaries are cached per PDF, so each one is written once.",
      "Summaries can be wrong. The original PDF is always the authority.",
    ],
    bm: [
      "PDF tidak pernah dimuat naik. Hanya teks yang diekstrak meninggalkan pelayan.",
      "Setiap dalil disemak dengan PDF sumber sebelum dipaparkan.",
      "Ringkasan disimpan cache mengikut PDF, jadi setiap satu ditulis sekali sahaja.",
      "Ringkasan boleh tersilap. PDF asal sentiasa menjadi rujukan utama.",
    ],
    zh: [
      "PDF 从不上传。只有提取出的文本会离开服务器。",
      "每个 dalil 在显示前都会与源 PDF 核对。",
      "摘要按 PDF 缓存，每份只生成一次。",
      "摘要可能有误。原始 PDF 始终是最终依据。",
    ],
    ta: [
      "PDF ஒருபோதும் பதிவேற்றப்படுவதில்லை. பிரித்தெடுக்கப்பட்ட உரை மட்டுமே சர்வரை விட்டு வெளியேறுகிறது.",
      "ஒவ்வொரு தலீலும் காட்டப்படுவதற்கு முன் மூல PDF-உடன் சரிபார்க்கப்படுகிறது.",
      "சுருக்கங்கள் PDF வாரியாக cache செய்யப்படுவதால் ஒவ்வொன்றும் ஒருமுறை மட்டுமே எழுதப்படுகிறது.",
      "சுருக்கங்களில் தவறு இருக்கலாம். மூல PDF எப்போதும் இறுதி மூலம்.",
    ],
  },
  coverageTitle: {
    en: "Coverage",
    bm: "Liputan",
    zh: "覆盖范围",
    ta: "கவரேஜ்",
  },
  coverageBody: {
    en: "11 of 13 states and all three federal territories. Every PDF is stored locally, so the archive outlives the portals it came from.",
    bm: "11 daripada 13 negeri dan ketiga-tiga wilayah persekutuan. Setiap PDF disimpan secara tempatan, jadi arkib kekal walaupun portal asalnya hilang.",
    zh: "13 个州中的 11 个，以及全部三个联邦直辖区。每个 PDF 都保存在本地，因此档案库比来源门户更长久。",
    ta: "13 மாநிலங்களில் 11, மற்றும் மூன்று கூட்டாட்சி பிரதேசங்கள் அனைத்தும். ஒவ்வொரு PDF-உம் உள்ளூரில் சேமிக்கப்படுவதால், மூல தளங்கள் மறைந்தாலும் காப்பகம் நிலைத்திருக்கும்.",
  },
  coverageLink: {
    en: "See what's live, what's blocked and what's next on the roadmap.",
    bm: "Lihat apa yang aktif, apa yang tersekat dan apa yang seterusnya di peta jalan.",
    zh: "在路线图中查看已上线、受阻以及下一步的内容。",
    ta: "எது இயங்குகிறது, எது தடைப்பட்டுள்ளது, அடுத்து என்ன என்பதை செயல்திட்டத்தில் பார்க்கவும்.",
  },
  coverageCta: {
    en: "Open the roadmap",
    bm: "Buka peta jalan",
    zh: "打开路线图",
    ta: "செயல்திட்டத்தைத் திற",
  },
  sourcesTitle: {
    en: "Sources",
    bm: "Sumber",
    zh: "来源",
    ta: "மூலங்கள்",
  },
  sourcesBody: {
    en: "Every PDF comes from an official state or federal portal. These are the sites the scrapers read.",
    bm: "Setiap PDF datang daripada portal rasmi negeri atau persekutuan. Inilah laman yang dibaca oleh pengikis.",
    zh: "每份 PDF 都来自官方州或联邦门户。以下是采集器读取的网站。",
    ta: "ஒவ்வொரு PDF-உம் அதிகாரப்பூர்வ மாநில அல்லது கூட்டாட்சி தளத்திலிருந்து வருகிறது. சேகரிப்பான்கள் படிக்கும் தளங்கள் இவை.",
  },
  ownershipTitle: {
    en: "Ownership & disclaimer",
    bm: "Hak milik & penafian",
    zh: "所有权与免责声明",
    ta: "உரிமை & பொறுப்புத் துறப்பு",
  },
  ownershipBody: {
    en: "All khutbah texts belong to their respective state religious authorities. Servemon only indexes and preserves them for easier reference and study. AI summaries are an aid, not a replacement for the original text — always verify against the PDF.",
    bm: "Semua teks khutbah adalah hak milik pihak berkuasa agama negeri masing-masing. Servemon hanya mengindeks dan memeliharanya untuk rujukan dan pembelajaran. Ringkasan AI ialah bantuan, bukan pengganti teks asal — sentiasa semak dengan PDF.",
    zh: "所有讲道文本归各州宗教机构所有。Servemon 只是建立索引并保存，以便参考与学习。AI 摘要仅为辅助，不能取代原文——请始终对照 PDF 核实。",
    ta: "அனைத்து குத்பா உரைகளும் சம்பந்தப்பட்ட மாநில மத அதிகாரிகளுக்குச் சொந்தமானவை. Servemon அவற்றை அட்டவணைப்படுத்தி, எளிதான குறிப்பு மற்றும் கற்றலுக்காகப் பாதுகாக்கிறது. AI சுருக்கங்கள் ஒரு உதவி மட்டுமே, மூல உரைக்கு மாற்றல்ல — எப்போதும் PDF-உடன் சரிபார்க்கவும்.",
  },
} satisfies Record<
  string,
  | Localized
  | Record<Lang, string[]>
  | { title: Localized; body: Localized }[]
>;

export type AboutSource = {
  name: string;
  url: string;
};

export const ABOUT_SOURCES: AboutSource[] = [
  { name: "JAIS — Selangor", url: "https://e-khutbah.jais.gov.my" },
  {
    name: "JAKIM — Kuala Lumpur, Putrajaya, Labuan",
    url: "https://www.islam.gov.my/ms/e-khutbah",
  },
  { name: "JAINJ — Johor", url: "https://jainj.johor.gov.my/khutbah/" },
  {
    name: "JHEAIK — Kedah",
    url: "https://dakwahjheaik.wixsite.com/home/copy-of-ebook",
  },
  { name: "e-MAIK — Kelantan", url: "https://masjid.e-maik.my" },
  { name: "e-Khutbah NS — Negeri Sembilan", url: "https://ekhutbah.ns.gov.my" },
  { name: "JAIPk — Perak", url: "https://jaipk.perak.gov.my" },
  { name: "Mufti Perlis — Perlis", url: "https://muftiperlis.gov.my" },
  { name: "JAIPP — Pulau Pinang", url: "https://jaipp.penang.gov.my" },
  { name: "JHEAINS — Sabah", url: "https://jheains.sabah.gov.my" },
  { name: "MIS Sarawak — Sarawak", url: "https://mis.sarawak.gov.my" },
  {
    name: "e-Khutbah Terengganu — Terengganu",
    url: "https://ekhutbah.terengganu.gov.my",
  },
];
