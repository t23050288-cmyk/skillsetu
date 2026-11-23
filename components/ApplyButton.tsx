"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ApplyButton({ opportunityId, score }: { opportunityId: string; score: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function apply() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ opportunityId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not apply");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <button className="btn btn-primary" onClick={apply} disabled={busy}>
        {busy ? "Sending…" : "Apply with my passport"}
      </button>
      <p className="small mt-s" style={{ marginBottom: 0 }}>
        Sends your verified passport at {score}% match. No form, no PDF, no cover letter.
      </p>
      {error && (
        <p className="small" style={{ color: "var(--red)" }}>
          {error}
        </p>
      )}
    </div>
  );
}
