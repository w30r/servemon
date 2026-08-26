import https from "https";
import http from "http";

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36";

function rawRequest(
  url: string,
  redirects = 0
): Promise<{ status: number; body: Buffer }> {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const mod = u.protocol === "http:" ? http : https;
    const req = mod.get(
      u,
      {
        headers: { "user-agent": UA, accept: "*/*" },
        rejectUnauthorized: false, // gov sites often have incomplete CA chains; public content only
      },
      (res) => {
        const { statusCode = 0, headers } = res;
        if (statusCode >= 300 && statusCode < 400 && headers.location) {
          res.resume();
          if (redirects > 5) {
            reject(new Error(`Too many redirects: ${url}`));
            return;
          }
          const next = new URL(headers.location, url).href;
          rawRequest(next, redirects + 1).then(resolve, reject);
          return;
        }
        if (statusCode >= 400) {
          res.resume();
          reject(new Error(`HTTP ${statusCode}: ${url}`));
          return;
        }
        const chunks: Buffer[] = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => resolve({ status: statusCode, body: Buffer.concat(chunks) }));
      }
    );
    req.on("error", reject);
    req.setTimeout(30000, () => {
      req.destroy(new Error(`Timeout: ${url}`));
    });
  });
}

export async function fetchText(url: string): Promise<string> {
  const { body } = await rawRequest(url);
  return body.toString("utf8");
}

export async function fetchBuffer(url: string): Promise<Buffer | null> {
  try {
    const { body } = await rawRequest(url);
    return body;
  } catch {
    return null;
  }
}
