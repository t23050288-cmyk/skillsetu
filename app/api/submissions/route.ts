import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { currentUser, makePublicId, hashEvidence } from "@/lib/auth";
import { gradeWithAi } from "@/lib/ai";
import type { RubricItem } from "@/lib/grade";

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Sign in first" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as {
    slug?: string;
    content?: string;
    evidenceUrl?: string;
  };
  const content = (body.content || "").trim();
  if (!body.slug || content.length < 20) {
    return NextResponse.json({ error: "Write at least a couple of sentences" }, { status: 400 });
  }

  const challenge = await prisma.challenge.findUnique({ where: { slug: body.slug } });
  if (!challenge) return NextResponse.json({ error: "Challenge not found" }, { status: 404 });

  const rubric = JSON.parse(challenge.rubric) as RubricItem[];
  const grade = await gradeWithAi({
    content,
    evidenceUrl: body.evidenceUrl || null,
    rubric,
    challengeTitle: challenge.title,
    challengeBrief: challenge.brief,
  });

  const submission = await prisma.submission.create({
    data: {
      userId: user.id,
      challengeId: challenge.id,
      content,
      evidenceUrl: body.evidenceUrl || null,
      score: grade.score,
      level: grade.level,
      dimensions: JSON.stringify(grade.dimensions),
      feedback: grade.feedback,
      strength: grade.strength,
      gap: grade.gap,
      grader: grade.grader,
    },
  });

  // One credential per learner per skill: keep the best score, refresh the evidence hash.
  const existing = await prisma.credential.findFirst({
    where: { userId: user.id, skill: challenge.skill },
    orderBy: { score: "desc" },
  });

  let credentialId: string;
  let publicId: string;
  const evidenceHash = hashEvidence(`${submission.id}:${content}:${grade.score}`);

  if (existing && existing.score >= grade.score) {
    credentialId = existing.id;
    publicId = existing.publicId;
  } else if (existing) {
    const updated = await prisma.credential.update({
      where: { id: existing.id },
      data: {
        score: grade.score,
        level: grade.level,
        title: challenge.title,
        evidenceHash,
        issuedAt: new Date(),
        submissionId: submission.id,
        challengeId: challenge.id,
      },
    });
    credentialId = updated.id;
    publicId = updated.publicId;
  } else {
    const created = await prisma.credential.create({
      data: {
        publicId: makePublicId(),
        userId: user.id,
        challengeId: challenge.id,
        submissionId: submission.id,
        title: challenge.title,
        skill: challenge.skill,
        score: grade.score,
        level: grade.level,
        evidenceHash,
      },
    });
    credentialId = created.id;
    publicId = created.publicId;
  }

  return NextResponse.json({ ...grade, publicId, credentialId, submissionId: submission.id });
}
