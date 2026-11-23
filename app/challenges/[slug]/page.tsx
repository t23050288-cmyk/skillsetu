import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import SubmitForm from "@/components/SubmitForm";
import type { RubricItem } from "@/lib/grade";

export default async function ChallengePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const challenge = await prisma.challenge.findUnique({ where: { slug } });
  if (!challenge) notFound();

  const user = await currentUser();
  const existing = user
    ? await prisma.credential.findFirst({
        where: { userId: user.id, skill: challenge.skill },
        orderBy: { score: "desc" },
      })
    : null;

  const rubric = JSON.parse(challenge.rubric) as RubricItem[];

  return (
    <main className="wrap" style={{ padding: "40px 22px 70px" }}>
      <Link href="/challenges" className="small no-print" style={{ color: "var(--green)", fontWeight: 600 }}>
        ← All challenges
      </Link>

      <div className="split mt-m">
        <div>
          <div className="row">
            <span className="tag">{challenge.skill}</span>
            <span className="tag">{challenge.level}</span>
            <span className="tag mono">{challenge.minutes} min</span>
            {existing && <span className="tag tag-green">your best: {existing.score}/100</span>}
          </div>
          <h1 style={{ fontSize: 38 }} className="mt-s">
            {challenge.title}
          </h1>
          {challenge.titleHi && <p className="small mt-s">{challenge.titleHi}</p>}
          <div className="card card-tint mt-m">
            <div className="kicker">The brief</div>
            <p style={{ whiteSpace: "pre-wrap", marginBottom: 0 }}>{challenge.brief}</p>
            {challenge.briefHi && (
              <>
                <hr className="hr" />
                <div className="kicker">हिंदी में</div>
                <p style={{ marginBottom: 0 }}>{challenge.briefHi}</p>
              </>
            )}
          </div>

          <div className="card mt-m">
            <div className="kicker">Published rubric</div>
            <ul className="list-clean mt-s">
              {rubric.map((r) => (
                <li key={r.key}>
                  <span className="mono small" style={{ minWidth: 44 }}>
                    {Math.round(r.weight * 100)}%
                  </span>
                  <div>
                    <strong style={{ fontSize: 14 }}>{r.label}</strong>
                    <div className="small">{r.hint}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div>
          {user ? (
            <SubmitForm slug={challenge.slug} />
          ) : (
            <div className="card">
              <h3>Sign in to submit</h3>
              <p className="small">
                You need an account so the credential can be issued to your passport. It takes one email and a code.
              </p>
              <Link href="/login" className="btn btn-primary mt-s">
                Sign in
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
