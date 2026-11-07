import Image from "next/image";
import { stateFlag } from "@/lib/flags";

export default function StateFlag({
  state,
  className = "",
}: {
  state: string;
  className?: string;
}) {
  const src = stateFlag(state);
  if (!src) return null;

  return (
    <Image
      src={src}
      alt=""
      width={24}
      height={16}
      aria-hidden="true"
      className={`h-4 w-6 shrink-0 rounded-[2px] object-cover ring-1 ring-white/20 ${className}`}
    />
  );
}
