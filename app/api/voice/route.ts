export async function POST(req: Request) {
  const { text } = (await req.json().catch(() => ({}))) as { text?: string };
  if (!text) return new Response("text required", { status: 400 });

  const key = process.env.ELEVENLABS_API_KEY;
  const voice = process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM";

  if (!key) {
    // Client falls back to the browser's speech synthesis, so the feature never breaks.
    return new Response("elevenlabs not configured", { status: 501 });
  }

  const upstream = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}`, {
    method: "POST",
    headers: { "xi-api-key": key, "content-type": "application/json", accept: "audio/mpeg" },
    body: JSON.stringify({
      text: text.slice(0, 2500),
      model_id: "eleven_multilingual_v2",
      voice_settings: { stability: 0.5, similarity_boost: 0.75 },
    }),
  });

  if (!upstream.ok) return new Response("tts failed", { status: 502 });
  return new Response(await upstream.arrayBuffer(), {
    headers: { "content-type": "audio/mpeg", "cache-control": "public, max-age=3600" },
  });
}
