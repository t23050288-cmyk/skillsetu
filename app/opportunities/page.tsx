import Link from "next/link";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { matchLearnerToOpportunity, type VerifiedSkill } from "@/lib/match";

export default async function Opportunities() {
  const user = await currentUser();
  const [opportunities, credentials] = await Promise.all([
    prisma.opportunity.findMany({ where: { active: true }, orderBy: { createdAt: "desc" } }),
    user ? prisma.credential.findMany({ where: { userId: user.id } }) : Promise.resolve([]),
  ]);

  const skills: VerifiedSkill[] = credentials.map((c) => ({
    skill: c.skill,
    score: c.score,
    title: c.title,
    publicId: c.publicId,
  }));

  const rows = opportunities
    .map((o) => {
      const required = JSON.parse(o.skills) as string[];
      const match = matchLearnerToOpportunity(skills, required, {
        learnerCity: user?.city,
        oppCity: o.city,
        remote: o.remote,
      });
      return { o, required, match };
    })
    .sort((a, b) => b.match.score - a.match.score);

  return (
    <main className="wrap" style={{ padding: "40px 22px 70px" }}>
      <div className="between">
        <div>
          <div className="kicker">Hire on evidence, apply without a resume</div>
          <h1 style={{ fontSize: 44 }} className="mt-s">
            Opportunities
          </h1>
          <p className="lede mt-s">
            Every role lists the skills it needs. Your match is computed from verified scores, so you know before you
            apply whether you are in the running.
          </p>
        </div>
        {!user && (
          <Link href="/login" className="btn btn-primary">
            Sign in to see your match
          </Link>
        )}
      </div>

      <div className="grid mt-l" style={{ gap: 14 }}>
        {rows.map(({ o, required, match }) => (
          <Link key={o.id} href={`/opportunities/${o.id}`} className="card card-link">
            <div className="between">
              <div>
                <div className="row" style={{ gap: 8 }}>
                  <span className="tag">{o.type.toLowerCase()}</span>
                  {o.remote && <span className="tag">remote</span>}
                  <span className="small mono">{o.city}</span>
                </div>
                <h3 className="mt-s">{o.title}</h3>
                <div className="small">
                  {o.org} · {o.payText}
                </div>
              </div>
              {user && (
                <div style={{ textAlign: "right", minWidth: 96 }}>
                  <div className="score" style={{ fontSize: 30 }}>
                    {match.score}
                    <small>%</small>
                  </div>
                  <span className={`tag ${match.band === "strong" ? "tag-green" : match.band === "promising" ? "tag-saffron" : ""}`}>
                    {match.band}
                  </span>
                </div>
              )}
            </div>
            <div className="row mt-s">
              {required.map((s) => (
                <span key={s} className={`tag ${match.matched.includes(s) ? "tag-green" : ""}`}>
                  {match.matched.includes(s) ? "✓" : "·"} {s}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
