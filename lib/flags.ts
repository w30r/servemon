/**
 * Flag assets live in `public/states`. Names follow the source filenames, which
 * are not consistent (some use the old "Malacca"/"Penang" spellings), so keep
 * the mapping explicit instead of generating paths.
 */
export const STATE_FLAGS: Record<string, string> = {
  Johor: "/states/Johor.png",
  Kedah: "/states/Flag_of_Kedah.svg.png",
  Kelantan: "/states/Flag_of_Kelantan.svg.png",
  Melaka: "/states/Flag_of_Malacca.svg.png",
  "Negeri Sembilan": "/states/Flag_of_Negeri_Sembilan.svg.png",
  Pahang: "/states/Flag_of_Pahang.svg.png",
  Perak: "/states/Flag_of_Perak.svg.png",
  Perlis: "/states/Flag_of_Perlis.svg.png",
  "Pulau Pinang": "/states/Flag_of_Penang_(Malaysia).svg.png",
  Sabah: "/states/Flag_of_Sabah.svg.png",
  Sarawak: "/states/Flag_of_Sarawak.svg.png",
  Selangor: "/states/Flag_of_Selangor.svg.png",
  Terengganu: "/states/Flag_of_Terengganu.svg.png",
  "Kuala Lumpur": "/states/Flag_of_Kuala_Lumpur,_Malaysia.svg.png",
  Labuan: "/states/Flag_of_Labuan.svg.png",
  Putrajaya: "/states/Flag_of_Putrajaya.svg.png",
};

export function stateFlag(state: string): string | null {
  return STATE_FLAGS[state] ?? null;
}
