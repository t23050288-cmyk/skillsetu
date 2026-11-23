import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "SkillSetu · Proof over paper",
  description:
    "A verified skill passport for learners in underserved communities. Do real work, get graded on a rubric, and get matched to opportunities on evidence instead of degrees.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Nav />
        {children}
        <footer className="footer">
          <div className="wrap">
            <div className="between">
              <div>
                <div className="brand" style={{ marginBottom: 8 }}>
                  <span className="brand-mark">से</span> SkillSetu
                </div>
                <p className="small">
                  Built for wHACKiest 2026, Track 04 UnlockED. Next.js + Prisma + Postgres, free-tier AI with a
                  deterministic fallback grader so the demo never dies on venue wifi.
                </p>
              </div>
              <div className="small mono">
                <div>learn · prove · connect</div>
                <div style={{ marginTop: 6 }}>v1.0 · hackathon build</div>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
