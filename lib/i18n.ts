export type Lang = "en" | "bm" | "ta" | "zh";

export const LANGS: { code: Lang; label: string; htmlLang: string }[] = [
  { code: "bm", label: "BM", htmlLang: "ms" },
  { code: "en", label: "EN", htmlLang: "en" },
  { code: "zh", label: "中文", htmlLang: "zh" },
  { code: "ta", label: "தமிழ்", htmlLang: "ta" },
];

type Dict = Record<string, string>;

const en: Dict = {
  "nav.browse": "Browse",
  "nav.about": "About",
  "footer.tagline":
    "Servemon — archive of Friday sermon (khutbah) PDFs across Malaysia.",
  "footer.ownership":
    "Sermon texts belong to their respective state religious authorities.",
  "hero.badge": "Khutbah Jumaat Archive · Malaysia",
  "hero.title1": "Friday sermons, all of",
  "hero.titleHighlight": "Malaysia.",
  "hero.subtitle":
    "A growing archive of khutbah PDFs from every state. Find, read and download — past and present.",
  "hero.browse": "Browse sermons",
  "hero.learn": "Learn more",
  "latest.title": "Latest sermons",
  "latest.viewall": "View all →",
  "browse.title": "Browse sermons",
  "search.placeholder": "Search title…",
  "search.button": "Search",
  "filter.all": "All",
  "detail.back": "← Back to browse",
  "detail.downloadJawi": "Download Jawi",
  "detail.downloadRumi": "Download Rumi",
  "detail.downloadEnglish": "Download English",
  "detail.moreFrom": "More from {state}",
  "list.summary": "{n} sermon{s}",
  "list.summaryState": " in {state}",
  "list.summaryQuery": " matching “{query}”",
  "list.cards": "Cards",
  "list.list": "List",
  "list.empty": "No sermons found. Try different filters.",
  "list.upcoming": "Upcoming",
  "list.thisWeek": "This week",
  "viewer.noPdf":
    "No PDF available for preview. Use the download buttons above.",
  "notfound.title": "Not found",
  "notfound.body": "Sermon or page does not exist.",
  "notfound.browse": "Browse sermons",
  "about.title": "About",
  "about.intro1": "Hey! I’m Syamil, the dev behind Servemon.",
  "about.intro2":
    "So here’s the idea — every Friday, Muslims across Malaysia attend khutbah at their local mosques, but once it’s over, it’s gone. You can’t go back and revisit what was said, reflect on it, or share it with someone who missed it.",
  "about.intro3":
    "Servemon fixes that. It’s a searchable archive of Friday sermon (khutbah) PDFs — scraped from official religious authority websites and organised in one place, so you can read, study, and refer back to past sermons anytime.",
  "about.whatTitle": "What’s here",
  "about.whatBody":
    "Every Friday, mosques across Malaysia receive official sermon texts from their state religious authorities. Servemon picks these up and puts them all in one searchable place. No more digging through government websites.",
  "about.coverageTitle": "Current coverage",
  "about.coverageSelangor":
    "Selangor — from JAIS (Jabatan Agama Islam Selangor)",
  "about.coverageFt":
    "Kuala Lumpur, Putrajaya, Labuan — from JAKIM (Jabatan Kemajuan Islam Malaysia)",
  "about.coverageMore":
    "More states coming soon — working on expanding to cover the whole country.",
  "about.sourcesTitle": "Sources",
  "about.sourcesIntro":
    "All sermon PDFs come straight from official government websites:",
  "about.sourcesJais": "e-khutbah.jais.gov.my — Selangor",
  "about.sourcesJakim": "www.jakim.gov.my — KL / Putrajaya / Labuan",
  "about.ownershipTitle": "Ownership",
  "about.ownershipBody":
    "All sermon texts belong to their respective state religious councils and departments. Servemon just makes them easier to find. This archive exists purely for easy reference and study.",
  "meta.desc":
    "Archive of Friday sermon (khutbah) PDFs from across Malaysia. Find, read and download.",
};

const bm: Dict = {
  "nav.browse": "Terokai",
  "nav.about": "Tentang",
  "footer.tagline":
    "Servemon — arkib PDF khutbah Jumaat di seluruh Malaysia.",
  "footer.ownership":
    "Teks khutbah adalah hak milik pihak berkuasa agama negeri masing-masing.",
  "hero.badge": "Arkib Khutbah Jumaat · Malaysia",
  "hero.title1": "Khutbah Jumaat, seluruh",
  "hero.titleHighlight": "Malaysia.",
  "hero.subtitle":
    "Arkib khutbah PDF yang semakin berkembang dari setiap negeri. Cari, baca dan muat turun — yang lalu dan kini.",
  "hero.browse": "Terokai khutbah",
  "hero.learn": "Ketahui lebih lanjut",
  "latest.title": "Khutbah terkini",
  "latest.viewall": "Lihat semua →",
  "browse.title": "Terokai khutbah",
  "search.placeholder": "Cari tajuk…",
  "search.button": "Cari",
  "filter.all": "Semua",
  "detail.back": "← Kembali ke terokai",
  "detail.downloadJawi": "Muat turun Jawi",
  "detail.downloadRumi": "Muat turun Rumi",
  "detail.downloadEnglish": "Muat turun Inggeris",
  "detail.moreFrom": "Lagi dari {state}",
  "list.summary": "{n} khutbah",
  "list.summaryState": " di {state}",
  "list.summaryQuery": " sepadan “{query}”",
  "list.cards": "Kad",
  "list.list": "Senarai",
  "list.empty": "Tiada khutbah ditemui. Cuba tapisan lain.",
  "list.upcoming": "Akan datang",
  "list.thisWeek": "Minggu ini",
  "viewer.noPdf":
    "Tiada PDF untuk pratonton. Guna butang muat turun di atas.",
  "notfound.title": "Tidak ditemui",
  "notfound.body": "Khutbah atau halaman tidak wujud.",
  "notfound.browse": "Terokai khutbah",
  "about.title": "Tentang",
  "about.intro1": "Hey! Aku Syamil, developer di belakang Servemon.",
  "about.intro2":
    "Idea dia macam ni — setiap Jumaat, umat Islam di seluruh Malaysia hadir khutbah di masjid setempat, tapi lepas selesai, ia hilang. Tak boleh balik semula untuk baca apa yang disampaikan, muhasabah, atau kongsikan dengan mereka yang terlepas.",
  "about.intro3":
    "Servemon selesaikan masalah tu. Ia arkib khutbah Jumaat (PDF) yang boleh dicari — diambil dari laman web rasmi pihak berkuasa agama dan disusun dalam satu tempat, supaya korang boleh baca, kaji, dan rujuk khutbah lalu bila-bila masa.",
  "about.whatTitle": "Apa yang ada di sini",
  "about.whatBody":
    "Setiap Jumaat, masjid di seluruh Malaysia menerima teks khutbah rasmi daripada pihak berkuasa agama negeri masing-masing. Servemon kumpul semuanya dan letak dalam satu tempat yang boleh dicari. Tak payah susah-susah cari laman kerajaan lagi.",
  "about.coverageTitle": "Liputan sekarang",
  "about.coverageSelangor":
    "Selangor — daripada JAIS (Jabatan Agama Islam Selangor)",
  "about.coverageFt":
    "Kuala Lumpur, Putrajaya, Labuan — daripada JAKIM (Jabatan Kemajuan Islam Malaysia)",
  "about.coverageMore":
    "Negeri lain akan menyusul — sedang usaha untuk liputan seluruh negara.",
  "about.sourcesTitle": "Sumber",
  "about.sourcesIntro":
    "Semua PDF khutbah diambil terus dari laman web rasmi kerajaan:",
  "about.sourcesJais": "e-khutbah.jais.gov.my — Selangor",
  "about.sourcesJakim": "www.jakim.gov.my — KL / Putrajaya / Labuan",
  "about.ownershipTitle": "Hak milik",
  "about.ownershipBody":
    "Semua teks khutbah adalah hak milik majlis dan jabatan agama negeri masing-masing. Servemon sekadar memudahkan carian. Arkib ini wujud semata-mata untuk rujukan dan pembelajaran.",
  "meta.desc":
    "Arkib PDF khutbah Jumaat dari seluruh Malaysia. Cari, baca dan muat turun.",
};

const ta: Dict = {
  "nav.browse": "உலாவு",
  "nav.about": "பற்றி",
  "footer.tagline":
    "Servemon — மலேசியா முழுவதிலுமிருந்து வெள்ளிக்கிழமை குத்பா PDF காப்பகம்.",
  "footer.ownership":
    "குத்பா உரைகள் சம்பந்தப்பட்ட மாநில மத அதிகாரிகளுக்குச் சொந்தமானவை.",
  "hero.badge": "குத்பா ஜும்ஆ காப்பகம் · மலேசியா",
  "hero.title1": "வெள்ளிக்கிழமை குத்பாக்கள், முழு",
  "hero.titleHighlight": "மலேசியா.",
  "hero.subtitle":
    "ஒவ்வொரு மாநிலத்திலிருந்தும் வளர்ந்து வரும் குத்பா PDF காப்பகம். பழைய மற்றும் தற்போதைய — கண்டறியவும், படிக்கவும், பதிவிறக்கவும்.",
  "hero.browse": "குத்பாக்களை உலாவு",
  "hero.learn": "மேலும் அறிக",
  "latest.title": "சமீபத்திய குத்பாக்கள்",
  "latest.viewall": "அனைத்தையும் காண்க →",
  "browse.title": "குத்பாக்களை உலாவு",
  "search.placeholder": "தலைப்பைத் தேடு…",
  "search.button": "தேடு",
  "filter.all": "அனைத்தும்",
  "detail.back": "← உலாவலுக்குத் திரும்பு",
  "detail.downloadJawi": "ஜாவி பதிவிறக்கம்",
  "detail.downloadRumi": "ருமி பதிவிறக்கம்",
  "detail.downloadEnglish": "ஆங்கிலம் பதிவிறக்கம்",
  "detail.moreFrom": "மேலும் {state} இலிருந்து",
  "list.summary": "{n} குத்பா",
  "list.summaryState": " {state} இல்",
  "list.summaryQuery": " “{query}” உடன் பொருந்தும்",
  "list.cards": "அட்டைகள்",
  "list.list": "பட்டியல்",
  "list.empty": "குத்பா எதுவும் இல்லை. வேறு வடிகட்டிகளை முயற்சிக்கவும்.",
  "list.upcoming": "வரவிருக்கும்",
  "list.thisWeek": "இந்த வாரம்",
  "viewer.noPdf":
    "முன்னோட்டத்திற்கு PDF இல்லை. மேலே உள்ள பதிவிறக்க பொத்தான்களைப் பயன்படுத்தவும்.",
  "notfound.title": "கண்டறியப்படவில்லை",
  "notfound.body": "குத்பா அல்லது பக்கம் இல்லை.",
  "notfound.browse": "குத்பாக்களை உலாவு",
  "about.title": "பற்றி",
  "about.intro1": "வணக்கம்! நான் சியாமில், Servemon-இன் உருவாக்குனர்.",
  "about.intro2":
    "இந்த யோசனை இது — ஒவ்வொரு வெள்ளிக்கிழமையும் மலேசியாவின் முஸ்லிம்கள் தங்கள் உள்ளூர் பள்ளிவாசல்களில் குத்பா கேட்கிறார்கள், ஆனால் அது முடிந்ததும் போய்விடுகிறது. என்ன சொல்லப்பட்டது, அதை மீண்டும் படிக்கவோ, சிந்திக்கவோ, அல்லது தவறவிட்டவர்களுடன் பகிரவோ முடியாது.",
  "about.intro3":
    "Servemon அதைச் சரிசெய்கிறது. இது வெள்ளிக்கிழமை குத்பா PDFகளின் தேடக்கூடிய காப்பகம் — அதிகாரப்பூர்வ மத அதிகாரிகளின் இணையதளங்களிலிருந்து சேகரிக்கப்பட்டு, ஒரே இடத்தில் அமைக்கப்பட்டுள்ளது. பழைய குத்பாக்களை எப்போது வேண்டுமானாலும் படிக்கவும், பயிலவும், திரும்பிப் பார்க்கவும் முடியும்.",
  "about.whatTitle": "இங்கே என்ன இருக்கிறது",
  "about.whatBody":
    "ஒவ்வொரு வெள்ளிக்கிழமையும் மலேசியா முழுவதிலும் உள்ள பள்ளிவாசல்கள் தங்கள் மாநில மத அதிகாரிகளிடமிருந்து அதிகாரப்பூர்வ குத்பா உரைகளைப் பெறுகின்றன. Servemon அவற்றைச் சேகரித்து ஒரே தேடக்கூடிய இடத்தில் வைக்கிறது. அரசாங்க இணையதளங்களில் தேடும் தொல்லை இல்லை.",
  "about.coverageTitle": "தற்போதைய பரப்பளவு",
  "about.coverageSelangor":
    "சிலாங்கூர் — JAIS (ஜாபாத்தான் அகாமா இஸ்லாம் சிலாங்கூர்)",
  "about.coverageFt":
    "கோலாலம்பூர், புத்ராஜெயா, லாபுவான் — JAKIM (ஜாபாத்தான் கெமாஜுவான் இஸ்லாம் மலேசியா)",
  "about.coverageMore":
    "மேலும் மாநிலங்கள் விரைவில் — முழு நாட்டையும் உள்ளடக்க விரிவாக்கம் செய்து வருகிறோம்.",
  "about.sourcesTitle": "ஆதாரங்கள்",
  "about.sourcesIntro":
    "அனைத்து குத்பா PDFகளும் அதிகாரப்பூர்வ அரசு இணையதளங்களிலிருந்து நேரடியாக எடுக்கப்படுகின்றன:",
  "about.sourcesJais": "e-khutbah.jais.gov.my — சிலாங்கூர்",
  "about.sourcesJakim": "www.jakim.gov.my — KL / புத்ராஜெயா / லாபுவான்",
  "about.ownershipTitle": "உரிமை",
  "about.ownershipBody":
    "அனைத்து குத்பா உரைகளும் சம்பந்தப்பட்ட மாநில மத சபைகள் மற்றும் துறைகளுக்குச் சொந்தமானவை. Servemon அவற்றை எளிதாகக் கண்டறிய உதவுகிறது. இந்த காப்பகம் வெறுமனே எளிய குறிப்பு மற்றும் பயிற்சிக்காக உள்ளது.",
  "meta.desc":
    "மலேசியா முழுவதிலுமிருந்து வெள்ளிக்கிழமை குத்பா PDF காப்பகம். கண்டுபிடி, படிக்கவும், பதிவிறக்கவும்.",
};

const zh: Dict = {
  "nav.browse": "浏览",
  "nav.about": "关于",
  "footer.tagline": "Servemon — 马来西亚各地主麻讲道（khutbah）PDF 档案。",
  "footer.ownership": "讲道文本归各州宗教机构所有。",
  "hero.badge": "主麻讲道档案 · 马来西亚",
  "hero.title1": "主麻讲道，覆盖整个",
  "hero.titleHighlight": "马来西亚。",
  "hero.subtitle":
    "不断增长的各州 khutbah PDF 档案。查找、阅读和下载——过去与现在。",
  "hero.browse": "浏览讲道",
  "hero.learn": "了解更多",
  "latest.title": "最新讲道",
  "latest.viewall": "查看全部 →",
  "browse.title": "浏览讲道",
  "search.placeholder": "搜索标题…",
  "search.button": "搜索",
  "filter.all": "全部",
  "detail.back": "← 返回浏览",
  "detail.downloadJawi": "下载爪夷文",
  "detail.downloadRumi": "下载罗马字",
  "detail.downloadEnglish": "下载英文",
  "detail.moreFrom": "更多来自 {state}",
  "list.summary": "{n} 篇讲道",
  "list.summaryState": "，{state}",
  "list.summaryQuery": "，匹配“{query}”",
  "list.cards": "卡片",
  "list.list": "列表",
  "list.empty": "未找到讲道。请尝试其他筛选条件。",
  "list.upcoming": "即将到来",
  "list.thisWeek": "本周",
  "viewer.noPdf": "暂无 PDF 可预览。请使用上方下载按钮。",
  "notfound.title": "未找到",
  "notfound.body": "该讲道或页面不存在。",
  "notfound.browse": "浏览讲道",
  "about.title": "关于",
  "about.intro1": "你好！我是 Syamil，Servemon 的开发者。",
  "about.intro2":
    "这个想法很简单——每个星期五，马来西亚各地的穆斯林都会到当地清真寺听 khutbah（主麻讲道），但讲道一结束就没了。你无法回头重读、反思，或分享给错过的人。",
  "about.intro3":
    "Servemon 解决了这个问题。它是一个可搜索的 khutbah PDF 档案库——从官方宗教机构的网站抓取并集中整理，让你随时随地阅读、研习和回看过去的讲道。",
  "about.whatTitle": "这里有什么",
  "about.whatBody":
    "每个星期五，马来西亚各地的清真寺都会收到州宗教机构发布的正式讲道文本。Servemon 将它们收集到一个可搜索的地方，不必再费劲翻找政府网站。",
  "about.coverageTitle": "目前覆盖范围",
  "about.coverageSelangor": "雪兰莪——来自 JAIS（雪兰莪伊斯兰宗教局）",
  "about.coverageFt":
    "吉隆坡、布城、纳闽——来自 JAKIM（马来西亚伊斯兰发展局）",
  "about.coverageMore": "更多州份即将加入——正在扩展以覆盖全国。",
  "about.sourcesTitle": "资料来源",
  "about.sourcesIntro": "所有讲道 PDF 均直接来自官方政府网站：",
  "about.sourcesJais": "e-khutbah.jais.gov.my——雪兰莪",
  "about.sourcesJakim": "www.jakim.gov.my——吉隆坡 / 布城 / 纳闽",
  "about.ownershipTitle": "所有权",
  "about.ownershipBody":
    "所有讲道文本均归各州宗教理事会和部门所有。Servemon 只是让它们更容易被找到。这个档案库纯粹为了方便参考与学习。",
  "meta.desc": "马来西亚各地主麻讲道（khutbah）PDF 档案。查找、阅读和下载。",
};

export const dicts: Record<Lang, Dict> = { en, bm, ta, zh };

export function t(lang: Lang, key: string, vars?: Record<string, string>): string {
  let s = dicts[lang][key] ?? dicts.en[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      s = s.replaceAll(`{${k}}`, v);
    }
  }
  return s;
}
