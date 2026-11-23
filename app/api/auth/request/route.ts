import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { makeOtp } from "@/lib/auth";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { email?: string; role?: string; name?: string };
  const email = (body.email || "").trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Enter a valid email" }, { status: 400 });
  }

  const code = makeOtp();
  await prisma.otp.create({
    data: { email, code, expiresAt: new Date(Date.now() + 10 * 60 * 1000) },
  });

  // Demo mode: no SMTP configured, so the code is returned to the client and shown on screen.
  // In production this becomes a Resend/SES call and the code never leaves the server.
  const smtpConfigured = !!process.env.SMTP_URL;
  return NextResponse.json({
    ok: true,
    sentTo: email,
    devCode: smtpConfigured ? undefined : code,
    note: smtpConfigured ? "Check your inbox" : "Demo mode: code shown on screen",
  });
}
