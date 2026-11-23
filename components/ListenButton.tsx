"use client";

import { useState } from "react";

export default function ListenButton({ text }: { text: string }) {
  const [busy, setBusy] = useState(false);

  async function play() {
    setBusy(true);
    try {
      const res = await fetch("/api/voice", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        await new Audio(url).play();
        return;
      }
      speakLocally();
    } catch {
      speakLocally();
    } finally {
      setBusy(false);
    }
  }

  function speakLocally() {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = /[\u0900-\u097F]/.test(text) ? "hi-IN" : "en-IN";
    window.speechSynthesis.speak(utter);
  }

  return (
    <button className="btn btn-sm" onClick={play} disabled={busy}>
      {busy ? "…" : "▶ Listen"}
    </button>
  );
}
