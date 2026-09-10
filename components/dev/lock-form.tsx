"use client";

import { useActionState } from "react";
import { login } from "@/app/dev/actions";

export function LockForm() {
  const [state, formAction, pending] = useActionState(login, null);

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <p className="text-sm text-mint">Enter the admin password to unlock sync tools.</p>
      <input
        type="password"
        name="password"
        required
        autoFocus
        placeholder="Password"
        className="w-full rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-white placeholder:text-white/40 focus:border-glow focus:outline-none"
      />
      {state && "error" in state && state.error === "bad_password" && (
        <p className="text-sm text-red-400">Wrong password.</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="btn-gold rounded-full px-7 py-3 font-semibold disabled:opacity-60"
      >
        {pending ? "Unlocking…" : "Unlock"}
      </button>
    </form>
  );
}
