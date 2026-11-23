import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { matchLearnerToOpportunity, type VerifiedSkill } from "@/lib/match";
import ApplyButton from "@/components/ApplyButton";

export default async function OpportunityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const opportunity = await prisma.opportunity.findUnique({
    where: { id },
    include: { employer: true },
  });
  if (!opportunity) notFound();

  const user = await currentUser();
  const [credentials, application] = await Promise.all([
    user ? prisma.credential.findMany({ where: { userId: user.id } }) : Promise.resolve([]),
    user
      ? prisma.application.findFirst({ where: { opportunityId: id, userId: user.id } })
      : Promise.resolve(null),
  ]);

  const required = JSON.parse(opportunity.skills) as string[];
  const skills: VerifiedSkill[] = credentials.map((c) => ({
    skill: c.skill,
    score: c.score,
    title: c.title,
    publicId: c.publicId,
  }));
  const match = matchLearnerToOpportunity(skills, required, {
    learnerCity: user?.city,
    oppCity: opportunity.city,
    remote: opportunity.remote,
  });

  return (
    <main className="wrap narrow" style={{ padding: "40px 22px 70px" }}>
      <Link href="/opportunities" className="small" style={{ color: "var(--green)", fontWeight: 600 }}>
        ← All opportunities
      </Link>

      <div className="row mt-m">
        <span className="tag">{opportunity.type.toLowerCase()}</span>
        {opportunity.remote && <span className="tag">remote</span>}
        <span className="tag mono">{opportunity.city}</span>
      </div>
      <h1 style={{ fontSize: 38 }} className="mt-s">
        {opportunity.title}
      </h1>
      <p className="lede mt-s">
        {opportunity.org} · {opportunity.payText}
      </p>

      <div className="card mt-m">
        <div className="kicker">What the role is</div>
        <p style={{ marginBottom: 0 }}>{opportunity.description}</p>
      </div>

      <div className="card mt-m">
        <div className="between">
          <div className="kicker">Your match</div>
          <div className="score" style={{ fontSize: 30 }}>
            {match.score}
            <small>%</small>
          </div>
        </div>
        <div className="meter mt-s">
          <span style={{ width: `${match.score}%` }} />
        </div>
        <ul className="list-clean mt-s">
          {required.map((s) => {
            const have = match.matched.includes(s);
            const cred = credentials.find((c) => c.skill.toLowerCase() === s.toLowerCase());
            return (
              <li key={s}>
                <span className={have ? "check" : "cross"}>{have ? "✓" : "✕"}</span>
                <div style={{ flex: 1 }}>
                  <div className="between">
                    <strong style={{ fontSize: 14 }}>{s}</strong>
                    <span className="mono small">{have ? `${cred?.score}/100 verified` : "not yet proven"}</span>
                  </div>
                  {!have && (
                    <div className="small">
                      Take a {s} challenge to unlock this.{" "}
                      <Link href="/challenges" style={{ color: "var(--green)" }}>
                        Browse ↗
                      </Link>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
        <hr className="hr" />
        <div className="kicker">How this number was computed</div>
        <ul className="list-clean mt-s">
          {match.reasons.map((r) => (
            <li key={r}>
              <span className="small mono">·</span>
              <span className="small">{r}</span>
            </li>
          ))}
        </ul>
        <p className="small" style={{ marginBottom: 0 }}>
          Skill coverage counts 60%, verified score quality 30%, location fit 10%. No degree, no college name, no
          resume screening.
        </p>
      </div>

      <div className="mt-l">
        {user ? (
          application ? (
            <div className="notice ok">
              Applied on {new Date(application.createdAt).toLocaleDateString("en-IN")} · status{" "}
              <strong>{application.status.toLowerCase()}</strong> · match {application.matchScore}%
            </div>
          ) : (
            <ApplyButton opportunityId={opportunity.id} score={match.score} />
          )
        ) : (
          <Link href="/login" className="btn btn-primary">
            Sign in to apply with your passport
          </Link>
        )}
      </div>
    </main>
  );
}
