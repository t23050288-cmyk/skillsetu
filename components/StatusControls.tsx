"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function StatusControls({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [current, setCurrent] = useState(status);

  async function update(next: string) {
    setBusy(true);
    try {
      const res = await fetch("/api/applications", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id, status: next }),
      });
      if (res.ok) {
        setCurrent(next);
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="row" style={{ gap: 6 }}>
      <span className={`tag ${current === "SHORTLISTED" ? "tag-green" : current === "REJECTED" ? "tag-red" : ""}`}>
        {current.toLowerCase()}
      </span>
      {current !== "SHORTLISTED" && (
        <button className="btn btn-sm" disabled={busy} onClick={() => update("SHORTLISTED")}>
          Shortlist
        </button>
      )}
      {current !== "REJECTED" && (
        <button className="btn btn-sm" disabled={busy} onClick={() => update("REJECTED")}>
          Pass
        </button>
      )}
    </div>
  );
}
