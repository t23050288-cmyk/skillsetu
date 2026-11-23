import Link from "next/link";
import { qrSvg } from "@/lib/qr";
import { t } from "@/lib/i18n";
import ListenButton from "./ListenButton";

type CredentialRow = {
  publicId: string;
  title: string;
  skill: string;
  score: number;
  level: string;
  issuedAt: Date;
  evidenceHash: string;
  evidenceUrl?: string | null;
};

export default async function PassportView({
  user,
  credentials,
  publicUrl,
  lang,
  basePath,
}: {
  user: { name: string; city?: string | null; headline?: string | null; language: string };
  credentials: CredentialRow[];
  publicUrl: string;
  lang?: string | null;
  basePath: string;
}) {
  const copy = t(lang || user.language);
  const qr = await qrSvg(publicUrl);
  const avg = credentials.length
    ? Math.round(credentials.reduce((a, c) => a + c.score, 0) / credentials.length)
    : 0;
  const initials = user.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="stack" style={{ gap: 18 }}>
      <div className="card">
        <div className="between">
          <div className="row" style={{ gap: 14 }}>
            <div className="avatar" style={{ width: 54, height: 54, fontSize: 20 }}>
              {initials}
            </div>
            <div>
              <div className="kicker">{copy.passport}</div>
              <h2 style={{ fontSize: 30 }}>{user.name}</h2>
              <div className="small">
                {user.city || "India"} {user.headline ? `· ${user.headline}` : ""}
              </div>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="score">
              {avg}
              <small>/100</small>
            </div>
            <div className="small">{credentials.length} {copy.verified.toLowerCase()}</div>
          </div>
        </div>

        <hr className="hr" />

        <div className="between">
          <div>
            <div className="kicker">{copy.verify}</div>
            <p className="small mt-s" style={{ marginBottom: 6 }}>
              Every score below is tied to a graded submission. The hash changes if the record is edited.
            </p>
            <div className="hashbox">{publicUrl}</div>
          </div>
          <div className="row" style={{ alignItems: "center" }}>
            <div className="qr" dangerouslySetInnerHTML={{ __html: qr }} />
          </div>
        </div>

        <div className="row mt-m no-print">
          <span className="tag tag-green">verified</span>
          <span className="tag mono">sha-256 attested</span>
          <ListenButton
            text={`${user.name}. Verified skills: ${credentials
              .map((c) => `${c.skill}, ${c.score} out of 100`)
              .join(". ")}.`}
          />
          {lang !== "hi" ? (
            <Link className="btn btn-sm" href={`${basePath}?lang=hi`}>
              हिंदी
            </Link>
          ) : (
            <Link className="btn btn-sm" href={basePath}>
              English
            </Link>
          )}
        </div>
      </div>

      {credentials.length === 0 && (
        <div className="card card-tint">
          <p style={{ margin: 0 }}>No credentials yet. Finish one challenge and this page fills itself in.</p>
        </div>
      )}

      <div className="grid g2">
        {credentials.map((c) => (
          <div key={c.publicId} className="card">
            <div className="between">
              <div>
                <h3>{c.skill}</h3>
                <div className="small">{c.title}</div>
              </div>
              <span className={`tag ${c.score >= 80 ? "tag-green" : "tag-saffron"}`}>{c.level}</span>
            </div>
            <div className="mt-s" style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span className="score" style={{ fontSize: 28 }}>
                {c.score}
              </span>
              <span className="small mono">/100 weighted rubric</span>
            </div>
            <div className="meter mt-s">
              <span style={{ width: `${c.score}%` }} />
            </div>
            <div className="between mt-m">
              <span className="small mono">{copy.issued} {new Date(c.issuedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
              {c.evidenceUrl && (
                <a className="small" href={c.evidenceUrl} target="_blank" rel="noreferrer" style={{ color: "var(--green)", fontWeight: 600 }}>
                  {copy.evidence} ↗
                </a>
              )}
            </div>
            <div className="hashbox mt-s">#{c.evidenceHash}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
