import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function Landing() {
  const [challenges, credentials, opportunities] = await Promise.all([
    prisma.challenge.count(),
    prisma.credential.count(),
    prisma.opportunity.count(),
  ]);

  return (
    <main>
      <section className="hero">
        <div className="wrap hero-grid">
          <div>
            <div className="kicker">wHACKiest 2026 · Track 04 · UnlockED</div>
            <h1 className="mt-s">
              Proof over <em>paper</em>.
            </h1>
            <p className="lede mt-m">
              Quality education and real jobs stay out of reach because the middle step is missing: a way to{" "}
              <strong>prove what you can actually do</strong>. SkillSetu turns finished work into a verified skill
              passport, and lets employers hire on evidence instead of a degree line.
            </p>
            <div className="row mt-l">
              <Link href="/challenges" className="btn btn-primary">
                Start a challenge
              </Link>
              <Link href="/p/demo" className="btn">
                See a live passport
              </Link>
            </div>
            <p className="small mt-m">
              Works on a ₹6,000 phone, 2G, Hindi or English, no laptop. Grading is rubric-based and every score is
              explainable.
            </p>
          </div>

          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "16px 18px", borderBottom: "1px solid var(--line)", background: "var(--paper-2)" }}>
              <div className="between">
                <span className="kicker">Skill passport</span>
                <span className="tag tag-green">verified</span>
              </div>
              <div className="row mt-s" style={{ gap: 10 }}>
                <div className="avatar">AN</div>
                <div>
                  <div style={{ fontWeight: 600 }}>Arjun Nair</div>
                  <div className="small">Bengaluru · B.Com · night-shift learner</div>
                </div>
              </div>
            </div>
            <div style={{ padding: 18 }}>
              {[
                { skill: "Python", score: 84, note: "Built a bill-splitter that handles zero and duplicates" },
                { skill: "Communication", score: 71, note: "Explained UPI to a 12-year-old in 120 words" },
                { skill: "Excel", score: 66, note: "20-order tracker with a late-order flag" },
              ].map((s) => (
                <div key={s.skill} style={{ marginBottom: 16 }}>
                  <div className="between" style={{ marginBottom: 6 }}>
                    <strong style={{ fontSize: 14 }}>{s.skill}</strong>
                    <span className="mono small">{s.score}/100</span>
                  </div>
                  <div className="meter">
                    <span style={{ width: `${s.score}%` }} />
                  </div>
                  <div className="small" style={{ marginTop: 6 }}>
                    {s.note}
                  </div>
                </div>
              ))}
              <hr className="hr" />
              <div className="between">
                <span className="small mono">tamper-evident · sha-256</span>
                <span className="tag tag-saffron">3 employers matched</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="kicker">The gap the problem statement describes</div>
          <h2 className="mt-s">Three doors, one missing key.</h2>
          <div className="grid g3 mt-l">
            {[
              {
                t: "Learning is not the bottleneck",
                d: "Free courses are everywhere. What is missing is a reason to finish one and something to show at the end of it.",
              },
              {
                t: "Ability has no receipt",
                d: "A learner who can do the work looks identical to one who cannot, because nothing they have done is verifiable.",
              },
              {
                t: "Opportunity filters on pedigree",
                d: "Screening starts with college and marks, so demonstrated skill never reaches the person making the decision.",
              },
            ].map((x) => (
              <div key={x.t} className="card card-flat">
                <h3>{x.t}</h3>
                <p className="small" style={{ marginBottom: 0 }}>
                  {x.d}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap split">
          <div>
            <div className="kicker">How it works</div>
            <h2 className="mt-s">Four steps, fifteen minutes each.</h2>
            <div className="stack mt-l steps">
              {[
                {
                  t: "Pick a challenge that mirrors real work",
                  d: "Explain a hard idea, write a function that fixes a chore, handle an angry customer. Short tasks an employer would actually assign.",
                },
                {
                  t: "Submit the work, not a resume",
                  d: "Type the answer, paste the code, attach the sheet or the voice note. Any language. Evidence beats polish.",
                },
                {
                  t: "An AI assessor grades against a published rubric",
                  d: "Every score comes with dimension-level notes, a strength, and the exact gap to close. If the AI is unavailable, a deterministic grader takes over, so the same work never grades differently.",
                },
                {
                  t: "The passport becomes the application",
                  d: "A verified public page with scores, artefacts and a tamper-evident hash. Employers match on proven skills and can see the evidence in one click.",
                },
              ].map((s) => (
                <div key={s.t} className="step">
                  <h3>{s.t}</h3>
                  <p className="small" style={{ marginBottom: 0 }}>
                    {s.d}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="kicker">Why an employer can trust it</div>
            <ul className="list-clean mt-s">
              {[
                "The rubric is published before the work is submitted, so the target cannot move.",
                "Scores are weighted per dimension, not a single number out of nowhere.",
                "Every credential links to the artefact that earned it.",
                "Each passport carries a hash of the graded submission, so edited screenshots do not survive verification.",
                "Matching is explainable: which skills matched, at what score, and what is missing.",
              ].map((x) => (
                <li key={x}>
                  <span className="check">✓</span>
                  <span className="small">{x}</span>
                </li>
              ))}
            </ul>
            <hr className="hr" />
            <div className="row">
              <span className="tag">{challenges} challenges live</span>
              <span className="tag">{credentials} credentials issued</span>
              <span className="tag">{opportunities} opportunities</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="kicker">Designed for the constraint, not the demo</div>
          <h2 className="mt-s">Built for the people the problem names.</h2>
          <div className="grid g4 mt-l">
            {[
              { t: "2G first", d: "Server-rendered pages, no heavy client bundle, no video required." },
              { t: "Hindi or English", d: "Challenge briefs and passport labels ship in both. Hinglish is accepted by the grader." },
              { t: "Voice, not typing", d: "A voice pitch is a valid submission. ElevenLabs reads a passport aloud for low-literacy users." },
              { t: "No laptop", d: "Every screen is one column on a phone. Nothing needs a desktop." },
            ].map((x) => (
              <div key={x.t} className="card card-tint">
                <strong style={{ fontSize: 14 }}>{x.t}</strong>
                <p className="small" style={{ marginBottom: 0, marginTop: 6 }}>
                  {x.d}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap between">
          <div>
            <h2>Try the whole loop in two minutes.</h2>
            <p className="lede mt-s" style={{ marginBottom: 0 }}>
              Sign in as a learner, submit a challenge, watch a credential get issued, then switch to the employer
              side and see the match explanation.
            </p>
          </div>
          <div className="row">
            <Link href="/login" className="btn btn-primary">
              Sign in
            </Link>
            <Link href="/employer" className="btn">
              Employer view
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
