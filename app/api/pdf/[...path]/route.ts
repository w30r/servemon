import { readPdf } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const isDownload = new URL(_req.url).searchParams.has("download");

  const data = readPdf(path);
  if (!data) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(new Uint8Array(data), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Length": String(data.length),
      "Content-Disposition": isDownload
        ? `attachment; filename="${encodeURIComponent(path[path.length - 1])}"`
        : "inline",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
