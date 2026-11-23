export type VerifiedSkill = { skill: string; score: number; title: string; publicId: string };

export type MatchResult = {
  score: number;
  matched: string[];
  missing: string[];
  reasons: string[];
  band: "strong" | "promising" | "developing";
};

export function matchLearnerToOpportunity(
  skills: VerifiedSkill[],
  required: string[],
  opts: { learnerCity?: string | null; oppCity?: string; remote?: boolean } = {},
): MatchResult {
  const have = new Map(skills.map((s) => [s.skill.toLowerCase(), s]));
  const matched = required.filter((r) => have.has(r.toLowerCase()));
  const missing = required.filter((r) => !have.has(r.toLowerCase()));
  const coverage = required.length ? matched.length / required.length : 0;
  const quality = matched.length
    ? matched.reduce((a, r) => a + (have.get(r.toLowerCase())?.score ?? 0), 0) / matched.length
    : 0;
  const sameCity = !!opts.learnerCity && !!opts.oppCity && opts.learnerCity.toLowerCase() === opts.oppCity.toLowerCase();
  const location = opts.remote ? 10 : sameCity ? 10 : 0;

  const score = Math.max(0, Math.min(100, Math.round(coverage * 60 + (quality / 100) * 30 + location)));
  const reasons: string[] = [];
  if (matched.length) {
    reasons.push(
      `${matched.length}/${required.length} required skills proven with evidence (avg ${Math.round(quality)}/100)`,
    );
  } else {
    reasons.push("No verified proof of the required skills yet");
  }
  if (missing.length) reasons.push(`Gap: ${missing.join(", ")}`);
  if (opts.remote) reasons.push("Role is remote, so location is not a barrier");
  else if (sameCity) reasons.push(`Based in ${opts.oppCity}, same city as the role`);

  return {
    score,
    matched,
    missing,
    reasons,
    band: score >= 70 ? "strong" : score >= 45 ? "promising" : "developing",
  };
}
