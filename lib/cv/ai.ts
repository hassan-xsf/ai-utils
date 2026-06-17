type AiResponse = {
  success?: boolean;
  response?: string;
  result?: string;
  error?: string;
  provider?: string;
  model?: string;
};

export async function askAi(query: string): Promise<string> {
  const secret = process.env.AI_SECRET_TOKEN;
  if (!secret) throw new Error("AI_SECRET_TOKEN not configured");

  const res = await fetch("https://ai.ihassn.com/ai", {
    method: "POST",
    headers: {
      "x-secret-token": secret,
      "content-type": "application/json",
    },
    body: JSON.stringify({ query }),
  });

  const bodyText = await res.text();

  if (!res.ok) {
    throw new Error(`AI request failed ${res.status}: ${bodyText.slice(0, 300)}`);
  }

  let data: AiResponse;
  try {
    data = JSON.parse(bodyText);
  } catch {
    throw new Error(`AI returned non-JSON response: ${bodyText.slice(0, 300)}`);
  }

  if (data.error) {
    throw new Error(`AI error: ${data.error}`);
  }

  const result = data.response ?? data.result;
  if (!result || !result.trim()) {
    throw new Error(
      `AI returned empty result. Query length: ${query.length} chars. Response keys: ${Object.keys(data).join(", ") || "(empty)"}`,
    );
  }

  return result;
}
