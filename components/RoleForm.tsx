"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RoleForm({ org, city }: { org: string; city: string }) {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    org,
    city,
    type: "JOB",
    remote: false,
    payText: "",
    skills: "",
    description: "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/opportunities", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not post the role");
      router.push("/employer");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit}>
      <div className="field">
        <label htmlFor="title">Role title</label>
        <input id="title" className="input" value={form.title} onChange={(e) => set("title", e.target.value)} required />
      </div>
      <div className="grid g2">
        <div className="field">
          <label htmlFor="org">Organisation</label>
          <input id="org" className="input" value={form.org} onChange={(e) => set("org", e.target.value)} required />
        </div>
        <div className="field">
          <label htmlFor="city">City</label>
          <input id="city" className="input" value={form.city} onChange={(e) => set("city", e.target.value)} required />
        </div>
      </div>
      <div className="grid g2">
        <div className="field">
          <label htmlFor="type">Type</label>
          <select id="type" className="input" value={form.type} onChange={(e) => set("type", e.target.value)}>
            <option value="JOB">Job</option>
            <option value="INTERNSHIP">Internship</option>
            <option value="GIG">Gig</option>
            <option value="SCHOLARSHIP">Scholarship</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="pay">Pay</label>
          <input
            id="pay"
            className="input"
            value={form.payText}
            onChange={(e) => set("payText", e.target.value)}
            placeholder="₹15,000 / month"
          />
        </div>
      </div>
      <div className="field">
        <label htmlFor="skills">Required skills (comma separated)</label>
        <input
          id="skills"
          className="input"
          value={form.skills}
          onChange={(e) => set("skills", e.target.value)}
          placeholder="Python, Communication"
          required
        />
        <span className="small">These must match challenge skill names for matching to work.</span>
      </div>
      <div className="field">
        <label htmlFor="description">What the person will actually do</label>
        <textarea
          id="description"
          className="textarea"
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          required
        />
      </div>
      <label className="row" style={{ gap: 8, marginBottom: 16 }}>
        <input type="checkbox" checked={form.remote} onChange={(e) => set("remote", e.target.checked)} />
        <span className="small">Remote friendly</span>
      </label>
      <button className="btn btn-primary" disabled={busy}>
        {busy ? "Posting…" : "Post role"}
      </button>
      {error && (
        <p className="small mt-s" style={{ color: "var(--red)" }}>
          {error}
        </p>
      )}
    </form>
  );
}
