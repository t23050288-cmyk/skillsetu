import crypto from "crypto";
import { cookies } from "next/headers";
import { prisma } from "./db";

const SECRET = process.env.SESSION_SECRET || "skillsetu-dev-secret";
const COOKIE = "setu_session";
const MAX_AGE = 60 * 60 * 24 * 30;

function sign(value: string) {
  return crypto.createHmac("sha256", SECRET).update(value).digest("base64url");
}

export function makeSession(userId: string) {
  return `${userId}.${sign(userId)}`;
}

export function parseSession(token?: string | null): string | null {
  if (!token) return null;
  const cut = token.lastIndexOf(".");
  if (cut < 1) return null;
  const id = token.slice(0, cut);
  const sig = token.slice(cut + 1);
  const expected = sign(id);
  if (sig.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  return id;
}

export async function currentUser() {
  const store = await cookies();
  const id = parseSession(store.get(COOKIE)?.value);
  if (!id) return null;
  return prisma.user.findUnique({ where: { id } });
}

export async function setSessionCookie(userId: string) {
  const store = await cookies();
  store.set(COOKIE, makeSession(userId), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
    secure: process.env.NODE_ENV === "production",
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.set(COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
}

export function makeOtp() {
  return String(crypto.randomInt(100000, 999999));
}

export function makePublicId() {
  return crypto.randomBytes(9).toString("base64url").replace(/[^a-zA-Z0-9]/g, "").slice(0, 10);
}

export function hashEvidence(payload: string) {
  return crypto.createHash("sha256").update(payload).digest("hex").slice(0, 24);
}
