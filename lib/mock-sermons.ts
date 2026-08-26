import type { Sermon } from "./types";

// Fridays: 2026-06-05, 12, 19, 26, 07-03, 10, 17, 21? (21 is Fri), 28
export const MOCK_SERMONS: Sermon[] = [
  {
    id: "selangor-2026-08-21",
    title: "Menjaga Amanah dalam Kehidupan",
    state: "Selangor",
    date: "2026-08-21",
    language: "BM",
    pdfUrl: "/mock/sermon.pdf",
  },
  {
    id: "kl-2026-08-21",
    title: "Sabar dan Syukur: Kunci Ketenangan Jiwa",
    state: "Kuala Lumpur",
    date: "2026-08-21",
    language: "BM/EN",
    pdfUrl: "/mock/sermon.pdf",
  },
  {
    id: "johor-2026-08-21",
    title: "Peranan Ibu Bapa dalam Pendidikan Anak",
    state: "Johor",
    date: "2026-08-21",
    language: "BM",
    pdfUrl: "/mock/sermon.pdf",
  },
  {
    id: "pulau-pinang-2026-08-14",
    title: "Cinta Rasulullah SAW melalui Akhlak",
    state: "Pulau Pinang",
    date: "2026-08-14",
    language: "BM",
    pdfUrl: "/mock/sermon.pdf",
  },
  {
    id: "perak-2026-08-14",
    title: "Menghayungi Maqasid Syariah",
    state: "Perak",
    date: "2026-08-14",
    language: "BM",
    pdfUrl: "/mock/sermon.pdf",
  },
  {
    id: "sabah-2026-08-14",
    title: "Kebersihan Sebahagian daripada Iman",
    state: "Sabah",
    date: "2026-08-14",
    language: "BM",
    pdfUrl: "/mock/sermon.pdf",
  },
  {
    id: "sarawak-2026-08-07",
    title: "Muafakat Membawa Berkat",
    state: "Sarawak",
    date: "2026-08-07",
    language: "BM/EN",
    pdfUrl: "/mock/sermon.pdf",
  },
  {
    id: "kelantan-2026-08-07",
    title: "Ilmu Cahaya Kehidupan",
    state: "Kelantan",
    date: "2026-08-07",
    language: "BM",
    pdfUrl: "/mock/sermon.pdf",
  },
  {
    id: "terengganu-2026-08-07",
    title: "Menjaga Lidah daripada Dosa Ghibah",
    state: "Terengganu",
    date: "2026-08-07",
    language: "BM",
    pdfUrl: "/mock/sermon.pdf",
  },
  {
    id: "kedah-2026-07-31",
    title: "Sedekah Jariah: Amalan yang Tidak Terputus",
    state: "Kedah",
    date: "2026-07-31",
    language: "BM",
    pdfUrl: "/mock/sermon.pdf",
  },
  {
    id: "pahang-2026-07-31",
    title: "Kesederhanaan dalam Berbelanja",
    state: "Pahang",
    date: "2026-07-31",
    language: "BM",
    pdfUrl: "/mock/sermon.pdf",
  },
  {
    id: "putrajaya-2026-07-31",
    title: "Integriti: Nilai Utama Umat Islam",
    state: "Putrajaya",
    date: "2026-07-31",
    language: "BM/EN",
    pdfUrl: "/mock/sermon.pdf",
  },
  {
    id: "negeri-sembilan-2026-07-24",
    title: "Adab Menuntut Ilmu",
    state: "Negeri Sembilan",
    date: "2026-07-24",
    language: "BM",
    pdfUrl: "/mock/sermon.pdf",
  },
  {
    id: "melaka-2026-07-24",
    title: "Sejarah Dakwah di Tanah Melayu",
    state: "Melaka",
    date: "2026-07-24",
    language: "BM",
    pdfUrl: "/mock/sermon.pdf",
  },
  {
    id: "perlis-2026-07-17",
    title: "Rahmat kepada Seluruh Alam",
    state: "Perlis",
    date: "2026-07-17",
    language: "BM",
    pdfUrl: "/mock/sermon.pdf",
  },
  {
    id: "labuan-2026-07-17",
    title: "Ukhuwah Islamiyah Antara Sesama Muslim",
    state: "Labuan",
    date: "2026-07-17",
    language: "BM",
    pdfUrl: "/mock/sermon.pdf",
  },
];

export function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-MY", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function getStateSlug(state: string): string {
  return state.toLowerCase().replace(/\s+/g, "-");
}
