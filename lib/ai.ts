import { heuristicGrade, type Grade, type RubricItem } from "./grade";

type Provider = { name: string; base?: string; key?: string; model?: string };

const providers: Provider[] = [
  { name: "omniroute", base: process.env.AI_BASE_URL, key: process.env.AI_API_KEY || "local", model: process.env.AI_MODEL || "auto" },
  { name: "gemini", base: "https://generativelanguage.googleapis.com/v1beta/openai", key: process.env.GEMINI_API_KEY, model: process.env.GEMINI_MODEL || "gemini-2.5-flash" },
  { name: "groq", base: "https://api.groq.com/openai/v1", key: process.env.GROQ_API_KEY, model: "llama-3.3-70b-versatile" },
  { name: "openrouter", base: "https://openrouter.ai/api/v1", key: process.env.OPENROUTER_API_KEY, model: "meta-llama/llama-3.3-70b-instruct:free" },
];

export function aiStatus() {
  const live = providers.filter((p) => p.base && p.key).map((p) => p.name);
  return { live, fallback: "skillsetu-heuristic-v1" };
}

function extractJson(raw: string): unknown {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  const body = fenced ? fenced[1] : raw;
  const start = body.indexOf("{");
  const end = body.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("no json in model output");
  return JSON.parse(body.slice(start, end + 1));
}

export async function aiJson<T>(system: string, user: string): Promise<{ data: T | null; source: string }> {
  for (const p of providers) {
    if (!p.base || !p.key) continue;
    try {
      const res = await fetch(`${p.base.replace(/\/$/, "")}/chat/completions`, {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${p.key}` },
        body: JSON.stringify({
          model: p.model,
          temperature: 0.2,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
        }),
        signal: AbortSignal.timeout(20000),
      });
      if (!res.ok) continue;
      const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
      const content = json.choices?.[0]?.message?.content;
      if (!content) continue;
      return { data: extractJson(content) as T, source: `${p.name}:${p.model}` };
    } catch {
      continue;
    }
  }
  return { data: null, source: "unavailable" };
}

const GRADER_SYSTEM = `You are an assessor for SkillSetu, a skill-passport platform for learners in underserved Indian communities.
Grade a submitted piece of work against the rubric. Be fair, concrete and never inflate scores.
Reward evidence of real ability over polished language. A learner may write in simple English, Hindi or Hinglish; judge the thinking, not the grammar.
Return ONLY JSON with this exact shape:
{"score":0-100,"dimensions":[{"key":"clarity","score":0-100,"note":"one sentence"}],
 "feedback":"3-4 sentences, second person, specific and actionable",
 "strength":"short phrase","gap":"short phrase"}
Use exactly the rubric keys given, one dimension per key.`;

export async function gradeWithAi(input: {
  content: string;
  evidenceUrl?: string | null;
  rubric: RubricItem[];
  challengeTitle: string;
  challengeBrief: string;
}): Promise<Grade> {
  const fallback = heuristicGrade(input);
  const { data, source } = await aiJson<{
    score: number;
    dimensions: { key: string; score: number; note?: string }[];
    feedback: string;
    strength: string;
    gap: string;
  }>(
    GRADER_SYSTEM,
    JSON.stringify({
      challenge: input.challengeTitle,
      brief: input.challengeBrief,
      rubric: input.rubric.map((r) => ({ key: r.key, label: r.label, weight: r.weight, hint: r.hint })),
      submission: input.content.slice(0, 6000),
      artefactUrl: input.evidenceUrl || null,
    }),
  );

  if (!data || typeof data.score !== "number") return fallback;

  const byKey = new Map(data.dimensions?.map((d) => [d.key, d]) ?? []);
  const dimensions = input.rubric.map((r) => {
    const hit = byKey.get(r.key);
    const local = fallback.dimensions.find((d) => d.key === r.key)!;
    return {
      key: r.key,
      label: r.label,
      weight: r.weight,
      score: typeof hit?.score === "number" ? Math.max(0, Math.min(100, Math.round(hit.score))) : local.score,
      note: hit?.note || local.note,
    };
  });
  const totalWeight = dimensions.reduce((a, d) => a + d.weight, 0) || 1;
  const score = Math.round(dimensions.reduce((a, d) => a + d.score * d.weight, 0) / totalWeight);

  return {
    score,
    level: score >= 85 ? "expert" : score >= 70 ? "advanced" : score >= 55 ? "intermediate" : "foundation",
    dimensions,
    feedback: data.feedback || fallback.feedback,
    strength: data.strength || fallback.strength,
    gap: data.gap || fallback.gap,
    grader: source,
  };
}

export async function nextStepWithAi(input: {
  learner: string;
  verified: { skill: string; score: number }[];
  targetSkills: string[];
  city?: string | null;
}): Promise<{ steps: { skill: string; why: string; challenge: string }[]; source: string }> {
  const missing = input.targetSkills.filter((s) => !input.verified.some((v) => v.skill.toLowerCase() === s.toLowerCase()));
  const fallback = {
    steps: (missing.length ? missing : input.targetSkills).slice(0, 3).map((skill) => ({
      skill,
      why: `Employers near ${input.city || "you"} ask for ${skill} and your passport has no verified proof of it yet.`,
      challenge: `Take the ${skill} challenge, attach one artefact, and let the grader score it.`,
    })),
    source: "skillsetu-heuristic-v1",
  };
  if (!missing.length) return fallback;

  const { data, source } = await aiJson<{ steps: { skill: string; why: string; challenge: string }[] }>(
    `You are a career coach for SkillSetu. Given a learner's verified skills, the skills employers ask for, and their city, return ONLY JSON {"steps":[{"skill":"","why":"","challenge":""}]} with at most 3 steps, ordered by employability gain. Keep each field under 22 words, plain language, no hype.`,
    JSON.stringify(input),
  );
  if (!data?.steps?.length) return fallback;
  return { steps: data.steps.slice(0, 3), source };
}
