import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import StatusControls from "@/components/StatusControls";

export default async function EmployerHome() {
  const user = await currentUser();
  if (!user) redirect("/login");

  const opportunities = await prisma.opportunity.findMany({
    where: { employerId: user.id },
    include: {
      applications: {
        include: { user: { include: { credentials: true } } },
        orderBy: { matchScore: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalApplicants = opportunities.reduce((a, o) => a + o.applications.length, 0);

  return (
    <main className="wrap" style={{ padding: "40px 22px 70px" }}>
      <div className="between">
        <div>
          <div className="kicker">Employer view</div>
          <h1 style={{ fontSize: 40 }} className="mt-s">
            Candidates ranked by proof.
          </h1>
          <p className="lede mt-s">
            {opportunities.length} open roles, {totalApplicants} applicants. Ranking uses verified skill scores and
            the evidence attached to each one, not college names.
          </p>
        </div>
        <Link href="/employer/new" className="btn btn-primary">
          Post a role
        </Link>
      </div>

      {user.role !== "EMPLOYER" && (
        <div className="notice mt-m">
          You are signed in as a learner. This page shows the employer side of the same data, so you can see what a
          recruiter sees when your passport arrives.
        </div>
      )}

      <div className="stack mt-l" style={{ gap: 20 }}>
        {opportunities.map((o) => (
          <div key={o.id} className="card">
            <div className="between">
              <div>
                <div className="row" style={{ gap: 8 }}>
                  <span className="tag">{o.type.toLowerCase()}</span>
                  <span className="tag mono">{o.city}</span>
                  {o.remote && <span className="tag">remote</span>}
                </div>
                <h3 className="mt-s">{o.title}</h3>
                <div className="small">
                  {JSON.parse(o.skills).join(" · ")} · {o.payText}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="score" style={{ fontSize: 26 }}>
                  {o.applications.length}
                </div>
                <div className="small">applicants</div>
              </div>
            </div>

            <hr className="hr" />

            {o.applications.length === 0 ? (
              <p className="small" style={{ marginBottom: 0 }}>
                No applicants yet. Share the role link with a training partner.
              </p>
            ) : (
              <div className="stack" style={{ gap: 12 }}>
                {o.applications.map((a) => (
                  <div key={a.id} className="card card-tint" style={{ padding: 14 }}>
                    <div className="between">
                      <div className="row" style={{ gap: 12 }}>
                        <div className="avatar">
                          {a.user.name
                            .split(" ")
                            .map((w) => w[0])
                            .join("")
                            .slice(0, 2)}
                        </div>
                        <div>
                          <strong style={{ fontSize: 14 }}>{a.user.name}</strong>
                          <div className="small">
                            {a.user.city} ·{" "}
                            {a.user.credentials
                              .slice(0, 3)
                              .map((c) => `${c.skill} ${c.score}`)
                              .join(" · ")}
                          </div>
                        </div>
                      </div>
                      <div className="row" style={{ gap: 10 }}>
                        <div style={{ textAlign: "right" }}>
                          <div className="mono" style={{ fontWeight: 700 }}>
                            {a.matchScore}%
                          </div>
                          <div className="small">match</div>
                        </div>
                        <Link href={`/p/${a.user.passportId || a.user.id}`} className="btn btn-sm">
                          Passport
                        </Link>
                        <StatusControls id={a.id} status={a.status} />
                      </div>
                    </div>
                    {a.matchNote && (
                      <div className="small mt-s" style={{ marginTop: 8, color: "var(--ink-2)" }}>
                        {a.matchNote}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
