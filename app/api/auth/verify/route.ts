import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { setSessionCookie } from "@/lib/auth";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { email?: string; code?: string; role?: string; name?: string };
  const email = (body.email || "").trim().toLowerCase();
  const code = (body.code || "").trim();

  const otp = await prisma.otp.findFirst({
    where: { email, code, consumed: false, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });
  if (!otp) return NextResponse.json({ error: "Wrong or expired code" }, { status: 401 });

  await prisma.otp.update({ where: { id: otp.id }, data: { consumed: true } });

  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const role = body.role === "EMPLOYER" ? "EMPLOYER" : "LEARNER";
    const fallbackName = email.split("@")[0].replace(/[._-]+/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
    user = await prisma.user.create({
      data: {
        email,
        name: body.name?.trim() || fallbackName,
        role,
        city: "Bengaluru",
        language: "en",
      },
    });
  }

  await setSessionCookie(user.id);
  return NextResponse.json({ ok: true, role: user.role, name: user.name });
}
