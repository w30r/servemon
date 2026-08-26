export type Sermon = {
  id: string;
  title: string;
  state: string;
  date: string; // ISO date, always a Friday
  language: "BM" | "EN" | "AR" | "BM/EN";
  pdfUrl: string;
};

export const MALAYSIAN_STATES = [
  "Johor",
  "Kedah",
  "Kelantan",
  "Melaka",
  "Negeri Sembilan",
  "Pahang",
  "Perak",
  "Perlis",
  "Pulau Pinang",
  "Sabah",
  "Sarawak",
  "Selangor",
  "Terengganu",
  "Kuala Lumpur",
  "Labuan",
  "Putrajaya",
] as const;
