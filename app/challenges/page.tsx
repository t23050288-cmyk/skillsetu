import Link from "next/link";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/auth";

export default async function Challenges() {
  const user = await currentUser();
  const [challenges, credentials] = await Promise.all([
    prisma.challenge.findMany({ where: { active: true }, orderBy: { minutes: "asc" } }),
    user ? prisma.credential.findMany({ where: { userId: user.id } }) : Promise.resolve([]),
  ]);
  const verified = new Map(credentials.map((c) => [c.skill.toLowerCase(), c.score]));

  return (
    <main className="wrap" style={{ padding: "40px 22px 70px" }}>
      <div className="kicker">Real tasks, not quizzes</div>
      <h1 style={{ fontSize: 44 }} className="mt-s">
        Challenges
      </h1>
      <p className="lede mt-s">
        Each one takes 15 to 30 minutes and produces something an employer would actually ask for. The rubric is
        published before you start, so you know exactly what earns the score.
      </p>

      <div className="grid g2 mt-l">
        {challenges.map((c) => {
          const have = verified.get(c.skill.toLowerCase());
          return (
            <Link key={c.id} href={`/challenges/${c.slug}`} className="card card-link">
              <div className="between">
                <span className="tag">{c.skill}</span>
                {have ? <span className="tag tag-green">verified {have}/100</span> : <span className="tag">{c.level}</span>}
              </div>
              <h3 className="mt-s">{c.title}</h3>
              <p className="small" style={{ marginBottom: 10 }}>
                {c.brief.slice(0, 130)}…
              </p>
              <div className="between">
                <span className="small mono">{c.minutes} min</span>
                <span className="small" style={{ color: "var(--green)", fontWeight: 600 }}>
                  {have ? "Improve score ↗" : "Start ↗"}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
