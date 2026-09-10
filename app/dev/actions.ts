"use server";

import { redirect } from "next/navigation";
import { isAuthed, issueSession, runAllScrapers, verifyPassword, type AllScrapersResult } from "@/lib/admin";

export type SyncState =
  | { status: "idle" }
  | { status: "running" }
  | { status: "done"; result: AllScrapersResult }
  | { status: "error"; message: string }
  | { status: "unauthorized" };

export async function login(_prev: unknown, formData: FormData) {
  const pw = String(formData.get("password") || "");
  if (verifyPassword(pw)) {
    await issueSession();
    redirect("/dev");
  }
  return { error: "bad_password" };
}

export async function syncScrapers(): Promise<SyncState> {
  if (!(await isAuthed())) return { status: "unauthorized" };
  try {
    const result = await runAllScrapers();
    return { status: "done", result };
  } catch (e) {
    return { status: "error", message: (e as Error).message };
  }
}
