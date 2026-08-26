"use client";

import { useState } from "react";

export default function ShareButton({
  title,
  url,
}: {
  title: string;
  url: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: open in new tab
      window.open(url, "_blank");
    }
  }

  return (
    <div className="flex gap-2">
      <a
        href={`https://wa.me/?text=${encodeURIComponent(`${title}\n${url}`)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="glass rounded-full px-4 py-2 text-xs font-semibold transition-colors hover:bg-white/20"
      >
        WhatsApp
      </a>
      <button
        onClick={copyLink}
        className="glass rounded-full px-4 py-2 text-xs font-semibold transition-colors hover:bg-white/20"
      >
        {copied ? "Copied!" : "Copy link"}
      </button>
    </div>
  );
}
