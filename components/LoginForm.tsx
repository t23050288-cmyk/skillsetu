"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("arjun@skillsetu.in");
  const [role, setRole] = useState("LEARNER");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [devCode, setDevCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function requestCode(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/auth/request", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, role, name }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not send the code");
      setSent(true);
      setDevCode(json.devCode || "");
      setCode(json.devCode || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Wrong or expired code");
      router.push(json.role === "EMPLOYER" ? "/employer" : "/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setBusy(false);
    }
  }

  return (
    <div>
      {!sent ? (
        <form onSubmit={requestCode}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="name">Your name (new accounts)</label>
            <input
              id="name"
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Only used if this email is new"
            />
          </div>
          <div className="field">
            <label htmlFor="role">I am a</label>
            <select id="role" className="input" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="LEARNER">Learner looking for work</option>
              <option value="EMPLOYER">Employer or programme</option>
            </select>
          </div>
          <button className="btn btn-primary" disabled={busy}>
            {busy ? "Sending…" : "Send me a code"}
          </button>
        </form>
      ) : (
        <form onSubmit={verify}>
          <div className="notice ok">
            Code sent to <strong>{email}</strong>. {devCode && <>Demo code: <strong className="mono">{devCode}</strong></>}
          </div>
          <div className="field mt-m">
            <label htmlFor="code">Six-digit code</label>
            <input
              id="code"
              className="input mono"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={6}
              inputMode="numeric"
              required
            />
          </div>
          <div className="row">
            <button className="btn btn-primary" disabled={busy}>
              {busy ? "Checking…" : "Verify and continue"}
            </button>
            <button type="button" className="btn btn-sm" onClick={() => setSent(false)}>
              Use another email
            </button>
          </div>
        </form>
      )}
      {error && (
        <p className="small mt-m" style={{ color: "var(--red)" }}>
          {error}
        </p>
      )}
    </div>
  );
}
