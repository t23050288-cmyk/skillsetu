export type Dimension = { key: string; label: string; weight: number; score: number; note: string };

export type Grade = {
  score: number;
  level: string;
  dimensions: Dimension[];
  feedback: string;
  strength: string;
  gap: string;
  grader: string;
};

export type RubricItem = { key: string; label: string; weight: number; hint: string };

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

export function levelFor(score: number) {
  if (score >= 85) return "expert";
  if (score >= 70) return "advanced";
  if (score >= 55) return "intermediate";
  return "foundation";
}

/**
 * Deterministic local grader. Runs with zero API keys so the demo never dies on
 * venue wifi, and gives the same answer twice, which matters when a judge asks
 * "why did this get 72?".
 */
export function heuristicGrade(input: {
  content: string;
  evidenceUrl?: string | null;
  rubric: RubricItem[];
  challengeTitle: string;
}): Grade {
  const text = input.content.trim();
  const words = text.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const sentences = text.split(/[.!?।]+/).filter((s) => s.trim().length > 12);
  const uniqueRatio = wordCount ? new Set(words.map((w) => w.toLowerCase())).size / wordCount : 0;
  const numbers = (text.match(/\d+/g) || []).length;
  const bullets = (text.match(/^\s*(\d+[.)]|[-*•])\s+/gm) || []).length;
  const lower = text.toLowerCase();

  const base: Record<string, { score: number; note: string }> = {
    clarity: {
      score: clamp(wordCount < 25 ? 30 + wordCount : 55 + Math.min(30, sentences.length * 4) + Math.min(15, bullets * 5)),
      note: `${wordCount} words, ${sentences.length} complete sentences${bullets ? `, ${bullets} structured points` : ""}.`,
    },
    depth: {
      score: clamp(35 + Math.min(35, wordCount / 4) + Math.min(20, bullets * 6) + Math.min(10, numbers * 3)),
      note: bullets ? "Breaks the answer into steps rather than one block of text." : "Mostly prose; numbered steps would make the reasoning easier to follow.",
    },
    evidence: {
      score: clamp((input.evidenceUrl ? 45 : 20) + Math.min(35, numbers * 8) + (lower.includes("example") || lower.includes("for instance") ? 15 : 0)),
      note: input.evidenceUrl ? "Attached a working artefact the grader can open." : "No artefact attached, so the claim rests on description alone.",
    },
    originality: {
      score: clamp(40 + Math.min(30, uniqueRatio * 90) + (lower.includes("because") || lower.includes("instead") ? 12 : 0)),
      note: `Vocabulary variety ${(uniqueRatio * 100).toFixed(0)}%, reasoning connectors ${lower.includes("because") ? "present" : "thin"}.`,
    },
  };

  const dimensions: Dimension[] = input.rubric.map((r) => {
    const found = base[r.key] ?? { score: 55, note: "Graded on structure and completeness." };
    return { key: r.key, label: r.label, weight: r.weight, score: found.score, note: found.note };
  });

  const totalWeight = dimensions.reduce((a, d) => a + d.weight, 0) || 1;
  const score = clamp(dimensions.reduce((a, d) => a + d.score * d.weight, 0) / totalWeight);
  const sorted = [...dimensions].sort((a, b) => b.score - a.score);
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];

  return {
    score,
    level: levelFor(score),
    dimensions,
    feedback: `Your ${input.challengeTitle.toLowerCase()} submission scores ${score}/100. Strongest signal is ${best.label.toLowerCase()} (${best.score}). The fastest gain is ${worst.label.toLowerCase()}: ${worst.note} Add one concrete example, one number and one artefact link, and this moves a level.`,
    strength: `${best.label} (${best.score}/100)`,
    gap: `${worst.label} (${worst.score}/100)`,
    grader: "skillsetu-heuristic-v1",
  };
}
