import Link from "next/link";
import StateFlag from "./state-flag";
import { formatDate, isCurrentWeek, isUpcoming } from "@/lib/format";

type SermonCardData = {
  id: string;
  title: string;
  state: string;
  date: string;
  language: string | null;
};

export default function SermonCard({
  sermon,
  upcomingLabel = "Upcoming",
  weekLabel = "This week",
}: {
  sermon: SermonCardData;
  upcomingLabel?: string;
  weekLabel?: string;
}) {
  const upcoming = isUpcoming(sermon.date);
  const current = isCurrentWeek(sermon.date);

  return (
    <Link
      href={`/sermons/${sermon.id}`}
      className={`glass group flex flex-col rounded-3xl p-5 transition-all duration-200 hover:bg-white/20 hover:shadow-[0_8px_32px_rgba(0,0,0,0.25)] ${
        current ? "card-current" : ""
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="flex items-center gap-2 text-xs font-semibold tracking-wide text-mint">
          <StateFlag state={sermon.state} />
          {sermon.state}
        </span>
        <span className="flex flex-wrap items-center gap-1.5">
          {current && (
            <span className="badge-current rounded-full px-2.5 py-0.5 text-[11px] font-semibold">
              {weekLabel}
            </span>
          )}
          {upcoming && (
            <span className="badge-accent rounded-full px-2.5 py-0.5 text-[11px] font-semibold">
              {upcomingLabel}
            </span>
          )}
        </span>
      </div>
      <h3 className="mt-2.5 font-semibold leading-snug text-white group-hover:text-glow">
        {sermon.title}
      </h3>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-1 pt-4">
        <time dateTime={sermon.date} className="text-sm text-mint/80">
          {formatDate(sermon.date)}
        </time>
        <span className="rounded-full border border-white/20 px-2 py-0.5 text-[10px] font-medium text-mint-light">
          {sermon.language}
        </span>
      </div>
    </Link>
  );
}
