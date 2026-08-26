import Link from "next/link";
import { formatDate } from "@/lib/format";

type SermonCardData = {
  id: string;
  title: string;
  state: string;
  date: string;
  language: string | null;
};

export default function SermonCard({ sermon }: { sermon: SermonCardData }) {
  return (
    <Link
      href={`/sermons/${sermon.id}`}
      className="glass group flex flex-col rounded-3xl p-5 transition-all duration-200 hover:bg-white/20 hover:shadow-[0_8px_32px_rgba(0,0,0,0.25)]"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-wide text-mint">
          {sermon.state}
        </span>
        <span className="rounded-full border border-white/25 px-2.5 py-0.5 text-[11px] font-medium text-mint-light">
          {sermon.language}
        </span>
      </div>
      <h3 className="mt-2.5 font-semibold leading-snug text-white group-hover:text-glow">
        {sermon.title}
      </h3>
      <time
        dateTime={sermon.date}
        className="mt-auto pt-4 text-sm text-mint/80"
      >
        {formatDate(sermon.date)}
      </time>
    </Link>
  );
}
