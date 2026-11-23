import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import PathButton from "@/components/PathButton";

export default async function Dashboard() {
  const user = await currentUser();
  if (!user) redirect("/login");
  if (user.role === "EMPLOYER") redirect("/employer");

  const [credentials, challenges, applications] = await Promise.all([
    prisma.credential.findMany({ where: { userId: user.id }, orderBy: { issuedAt: "desc" } }),
    prisma.challenge.findMany({ where: { active: true }, orderBy: { minutes: "asc" } }),
    prisma.application.findMany({
      where: { userId: user.id },
      include: { opportunity: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const verifiedSkills = new Set(credentials.map((c) => c.skill.toLowerCase()));
  const nextChallenges = challenges.filter((c) => !verifiedSkills.has(c.skill.toLowerCase())).slice(0, 3);
  const avg = credentials.length
    ? Math.round(credentials.reduce((a, c) => a + c.score, 0) / credentials.length)
    : 0;
  const firstName = user.name.split(" ")[0];

  return (
    <main className="wrap" style={{ padding: "40px 22px 70px" }}>
      <div className="between">
        <div>
          <div className="kicker">Learner dashboard</div>
          <h1 style={{ fontSize: 40 }} className="mt-s">
            Namaste, {firstName}.
          </h1>
          <p className="lede mt-s">
            {credentials.length
              ? `${credentials.length} verified skills, average ${avg}/100. Every one is backed by graded work.`
              : "Nothing verified yet. One challenge is all it takes to start the passport."}
          </p>
        </div>
        <div className="row">
          <Link href="/passport" className="btn btn-primary">
            My passport
          </Link>
          <Link href="/opportunities" className="btn">
            Opportunities
          </Link>
        </div>
      </div>

      <div className="grid g3 mt-l">
        <div className="card">
          <div className="kicker">Verified skills</div>
          <div className="score mt-s">{credentials.length}</div>
          <div className="small">across {new Set(credentials.map((c) => c.skill)).size} skill areas</div>
        </div>
        <div className="card">
          <div className="kicker">Average score</div>
          <div className="score mt-s">
            {avg}
            <small>/100</small>
          </div>
          <div className="small">weighted across rubric dimensions</div>
        </div>
        <div className="card">
          <div className="kicker">Applications</div>
          <div className="score mt-s">{applications.length}</div>
          <div className="small">
            {applications.filter((a) => a.status === "SHORTLISTED").length} shortlisted
          </div>
        </div>
      </div>

      <div className="split mt-l">
        <div className="stack">
          <div className="card">
            <div className="between">
              <h3>Your next best step</h3>
              <PathButton />
            </div>
            <p className="small mt-s" style={{ marginBottom: 0 }}>
              Based on the skills employers are asking for right now, minus what your passport already proves.
            </p>
          </div>

          <div>
            <div className="between">
              <h3>Close your gaps</h3>
              <Link href="/challenges" className="small" style={{ color: "var(--green)", fontWeight: 600 }}>
                All challenges ↗
              </Link>
            </div>
            <div className="grid mt-s" style={{ gap: 12 }}>
              {nextChallenges.map((c) => (
                <Link key={c.id} href={`/challenges/${c.slug}`} className="card card-link">
                  <div className="between">
                    <div>
                      <strong>{c.title}</strong>
                      <div className="small">
                        {c.skill} · {c.minutes} min · {c.level}
                      </div>
                    </div>
                    <span className="tag">start</span>
                  </div>
                </Link>
              ))}
              {nextChallenges.length === 0 && (
                <div className="card card-tint">
                  <p className="small" style={{ margin: 0 }}>
                    Every live challenge skill is already verified. Post a new challenge or raise your score on an
                    existing one.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="stack">
          <div className="card">
            <h3>Verified so far</h3>
            <ul className="list-clean mt-s">
              {credentials.map((c) => (
                <li key={c.id}>
                  <span className="check">✓</span>
                  <div style={{ flex: 1 }}>
                    <div className="between">
                      <strong style={{ fontSize: 14 }}>{c.skill}</strong>
                      <span className="mono small">{c.score}/100</span>
                    </div>
                    <div className="meter" style={{ marginTop: 6 }}>
                      <span style={{ width: `${c.score}%` }} />
                    </div>
                  </div>
                </li>
              ))}
              {credentials.length === 0 && <li className="small">No credentials yet.</li>}
            </ul>
          </div>

          <div className="card">
            <h3>Applications</h3>
            <ul className="list-clean mt-s">
              {applications.map((a) => (
                <li key={a.id}>
                  <div style={{ flex: 1 }}>
                    <div className="between">
                      <Link href={`/opportunities/${a.opportunityId}`} style={{ fontWeight: 600, fontSize: 14 }}>
                        {a.opportunity.title}
                      </Link>
                      <span
                        className={`tag ${
                          a.status === "SHORTLISTED" ? "tag-green" : a.status === "REJECTED" ? "tag-red" : ""
                        }`}
                      >
                        {a.status.toLowerCase()}
                      </span>
                    </div>
                    <div className="small">
                      {a.opportunity.org} · match {a.matchScore}%
                    </div>
                  </div>
                </li>
              ))}
              {applications.length === 0 && (
                <li className="small">
                  No applications yet. <Link href="/opportunities" style={{ color: "var(--green)" }}>Browse roles ↗</Link>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
