import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { nextStepWithAi } from "@/lib/ai";

export async function POST() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Sign in first" }, { status: 401 });

  const [credentials, opportunities] = await Promise.all([
    prisma.credential.findMany({ where: { userId: user.id } }),
    prisma.opportunity.findMany({ where: { active: true }, select: { skills: true } }),
  ]);

  const target = Array.from(
    new Set(opportunities.flatMap((o) => JSON.parse(o.skills) as string[])),
  ).slice(0, 8);

  const result = await nextStepWithAi({
    learner: user.name,
    verified: credentials.map((c) => ({ skill: c.skill, score: c.score })),
    targetSkills: target,
    city: user.city,
  });

  return NextResponse.json(result);
}
