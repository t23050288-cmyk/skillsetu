import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { matchLearnerToOpportunity, type VerifiedSkill } from "@/lib/match";

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Sign in first" }, { status: 401 });

  const { opportunityId } = (await req.json().catch(() => ({}))) as { opportunityId?: string };
  if (!opportunityId) return NextResponse.json({ error: "Missing opportunity" }, { status: 400 });

  const opportunity = await prisma.opportunity.findUnique({ where: { id: opportunityId } });
  if (!opportunity) return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });

  const credentials = await prisma.credential.findMany({ where: { userId: user.id } });
  if (credentials.length === 0) {
    return NextResponse.json({ error: "Verify at least one skill before applying" }, { status: 400 });
  }

  const skills: VerifiedSkill[] = credentials.map((c) => ({
    skill: c.skill,
    score: c.score,
    title: c.title,
    publicId: c.publicId,
  }));
  const required = JSON.parse(opportunity.skills) as string[];
  const match = matchLearnerToOpportunity(skills, required, {
    learnerCity: user.city,
    oppCity: opportunity.city,
    remote: opportunity.remote,
  });

  const application = await prisma.application.upsert({
    where: { opportunityId_userId: { opportunityId, userId: user.id } },
    update: { matchScore: match.score, matchNote: match.reasons.join(" · ") },
    create: {
      opportunityId,
      userId: user.id,
      matchScore: match.score,
      matchNote: match.reasons.join(" · "),
    },
  });

  return NextResponse.json({ ok: true, application, match });
}

export async function PATCH(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Sign in first" }, { status: 401 });

  const { id, status } = (await req.json().catch(() => ({}))) as { id?: string; status?: string };
  if (!id || !["APPLIED", "SHORTLISTED", "REJECTED"].includes(status || "")) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const application = await prisma.application.findUnique({
    where: { id },
    include: { opportunity: true },
  });
  if (!application) return NextResponse.json({ error: "Application not found" }, { status: 404 });
  if (application.opportunity.employerId !== user.id) {
    return NextResponse.json({ error: "This role belongs to another employer" }, { status: 403 });
  }

  const updated = await prisma.application.update({ where: { id }, data: { status } });
  return NextResponse.json({ ok: true, application: updated });
}
