"use client";

import { useState } from "react";

type Step = { skill: string; why: string; challenge: string };

export default function PathButton() {
  const [steps, setSteps] = useState<Step[] | null>(null);
  const [source, setSource] = useState("");
  const [busy, setBusy] = useState(false);

  async function run() {
    setBusy(true);
    try {
      const res = await fetch("/api/ai/path", { method: "POST" });
      const json = await res.json();
      setSteps(json.steps || []);
      setSource(json.source || "");
    } finally {
      setBusy(false);
    }
  }

  if (steps) {
    return (
      <div className="stack mt-s" style={{ gap: 10, width: "100%" }}>
        {steps.map((s, i) => (
          <div key={i} className="card card-tint" style={{ padding: 14 }}>
            <strong style={{ fontSize: 14 }}>
              {i + 1}. {s.skill}
            </strong>
            <div className="small mt-s" style={{ marginTop: 4 }}>
              {s.why}
            </div>
            <div className="small" style={{ marginTop: 4, color: "var(--ink-2)" }}>
              {s.challenge}
            </div>
          </div>
        ))}
        <div className="small mono">engine: {source}</div>
      </div>
    );
  }

  return (
    <button className="btn btn-sm btn-primary" onClick={run} disabled={busy}>
      {busy ? "Thinking…" : "Show me"}
    </button>
  );
}
