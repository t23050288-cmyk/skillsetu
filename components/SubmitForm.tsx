"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Dimension = { key: string; label: string; weight: number; score: number; note: string };
type Result = {
  score: number;
  level: string;
  dimensions: Dimension[];
  feedback: string;
  strength: string;
  gap: string;
  grader: string;
  publicId: string;
};

export default function SubmitForm({ slug }: { slug: string }) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slug, content, evidenceUrl }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not grade this submission");
      setResult(json);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  if (result) {
    return (
      <div className="card">
        <div className="between">
          <div className="kicker">Graded</div>
          <span className={`tag ${result.score >= 70 ? "tag-green" : "tag-saffron"}`}>{result.level}</span>
        </div>
        <div className="score mt-s" style={{ fontSize: 46 }}>
          {result.score}
          <small>/100</small>
        </div>
        <p className="small mt-s">{result.feedback}</p>

        <hr className="hr" />
        <div className="kicker">Dimension breakdown</div>
        <div className="mt-s">
          {result.dimensions.map((d) => (
            <div key={d.key}>
              <div className="dim-row">
                <span className="small">{d.label}</span>
                <div className="meter">
                  <span style={{ width: `${d.score}%` }} />
                </div>
                <span className="mono small">{d.score}</span>
              </div>
              <div className="small" style={{ margin: "-4px 0 10px 142px" }}>
                {d.note}
              </div>
            </div>
          ))}
        </div>

        <div className="row mt-s">
          <span className="tag tag-green">strength · {result.strength}</span>
          <span className="tag tag-saffron">gap · {result.gap}</span>
        </div>

        <hr className="hr" />
        <div className="between">
          <span className="small mono">engine: {result.grader}</span>
          <Link href="/passport" className="btn btn-primary btn-sm">
            See it on my passport
          </Link>
        </div>
        <button
          className="btn btn-sm mt-m"
          onClick={() => {
            setResult(null);
            setContent("");
            setEvidenceUrl("");
          }}
        >
          Submit another attempt
        </button>
      </div>
    );
  }

  return (
    <form className="card" onSubmit={submit}>
      <div className="kicker">Your submission</div>
      <div className="field mt-s">
        <label htmlFor="content">The work itself</label>
        <textarea
          id="content"
          className="textarea"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Paste your answer, code, transcript or plan. Hindi, English or Hinglish all work."
          required
        />
      </div>
      <div className="field">
        <label htmlFor="evidence">Artefact link (optional, raises your evidence score)</label>
        <input
          id="evidence"
          className="input"
          value={evidenceUrl}
          onChange={(e) => setEvidenceUrl(e.target.value)}
          placeholder="Drive, Colab, GitHub, voice note…"
        />
      </div>
      <button className="btn btn-primary" disabled={busy || content.trim().length < 20}>
        {busy ? "Grading…" : "Submit for grading"}
      </button>
      <p className="small mt-s" style={{ marginBottom: 0 }}>
        A credential is issued automatically. A higher-scoring attempt replaces the old score on your passport.
      </p>
      {error && (
        <p className="small mt-s" style={{ color: "var(--red)" }}>
          {error}
        </p>
      )}
    </form>
  );
}
