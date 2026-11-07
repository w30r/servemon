const BASE_URL = (
  process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com"
).replace(/\/+$/, "");

export const SUMMARY_MODEL = process.env.SUMMARY_MODEL ?? "deepseek-flash";

type Message = { role: "system" | "user"; content: string };

export async function deepseekJson(
  messages: Message[],
  { maxTokens = 4000 }: { maxTokens?: number } = {}
): Promise<{ raw: string; tokensIn: number | null; tokensOut: number | null }> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) throw new Error("DEEPSEEK_API_KEY is not set");

  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: SUMMARY_MODEL,
      messages,
      response_format: { type: "json_object" },
      // Summary work does not need chain-of-thought; disabling it cuts output
      // tokens and latency. Dalils are verified separately anyway.
      thinking: { type: "disabled" },
      temperature: 0.2,
      max_tokens: maxTokens,
    }),
    signal: AbortSignal.timeout(90_000),
  });

  if (!res.ok) {
    const detail = (await res.text()).slice(0, 300);
    throw new Error(`DeepSeek HTTP ${res.status}: ${detail}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
    usage?: { prompt_tokens?: number; completion_tokens?: number };
  };

  const content = data.choices?.[0]?.message?.content;
  if (typeof content !== "string" || !content.trim()) {
    throw new Error("DeepSeek returned empty content");
  }

  return {
    raw: content,
    tokensIn: data.usage?.prompt_tokens ?? null,
    tokensOut: data.usage?.completion_tokens ?? null,
  };
}
