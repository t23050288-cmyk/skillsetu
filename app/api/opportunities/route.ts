import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/auth";

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Sign in first" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const title = String(body.title || "").trim();
  const org = String(body.org || "").trim();
  const city = String(body.city || "").trim();
  const description = String(body.description || "").trim();
  const skillsRaw = String(body.skills || "");
  const skills = skillsRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (!title || !org || !city || !description || skills.length === 0) {
    return NextResponse.json({ error: "Fill the title, org, city, skills and description" }, { status: 400 });
  }

  const opportunity = await prisma.opportunity.create({
    data: {
      employerId: user.id,
      title,
      org,
      city,
      description,
      skills: JSON.stringify(skills),
      type: ["JOB", "INTERNSHIP", "GIG", "SCHOLARSHIP"].includes(String(body.type)) ? String(body.type) : "JOB",
      remote: Boolean(body.remote),
      payText: String(body.payText || "").trim() || "Not disclosed",
    },
  });

  return NextResponse.json({ ok: true, opportunity });
}
