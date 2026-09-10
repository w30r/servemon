import { LockForm } from "@/components/dev/lock-form";
import { SyncPanel } from "@/components/dev/sync-panel";
import { isAuthed } from "@/lib/admin";

export default async function DevPage() {
  const authed = await isAuthed();

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 pb-24">
      <div className="glass rounded-3xl p-8 sm:p-10">
        <h1 className="text-2xl font-bold tracking-tight">Dev Tool</h1>
        {authed ? <SyncPanel /> : <LockForm />}
      </div>
    </div>
  );
}
