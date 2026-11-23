# SkillSetu architecture

## 1. The problem, restated as three failures

The UnlockED statement says quality education, skills and jobs are out of reach, and asks for a bridge
between learning and employment. Broken into parts:

1. **Access** - content is scarce, expensive, or English-only.
2. **Proof** - there is no verifiable record of what a person can do. A capable learner and an incapable
   one look identical on paper.
3. **Discovery** - hiring filters on college, marks and resumes before skill is ever observed.

Most teams will build (1) again: another course app. SkillSetu builds (2) and (3), and treats (1) as
solved by everyone else's free content. The product thesis: **make ability portable and verifiable, then
let matching do the hiring.**

## 2. System shape

```
                    ┌──────────────────────────────────────────────┐
  Learner (phone)   │  Next.js 15 App Router (SSR, ~100 kB JS)     │
  Employer (desktop)│  ├─ server components: pages read Prisma     │
                    │  └─ client islands: forms, apply, listen     │
                    └───────────────┬──────────────────────────────┘
                                    │  route handlers (/api/*)
                    ┌───────────────┴──────────────────────────────┐
                    │  Domain layer (pure functions, testable)      │
                    │  lib/grade.ts    rubric → score (deterministic)│
                    │  lib/match.ts    skills → match % + reasons   │
                    │  lib/ai.ts       provider chain + JSON guard  │
                    │  lib/auth.ts     HMAC session, OTP, hashing   │
                    └───────────────┬──────────────────────────────┘
                                    │  Prisma
                    ┌───────────────┴──────────────────────────────┐
                    │  SQLite locally  →  Postgres (Supabase) prod  │
                    └──────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴──────────────────────────────┐
                    │  AI: OmniRoute → Gemini → Groq → OpenRouter   │
                    │      then deterministic grader (always works) │
                    │  Voice: ElevenLabs → browser speechSynthesis  │
                    └──────────────────────────────────────────────┘
```

Design rule: **the product never depends on a model being reachable.** Every AI path has a deterministic
twin, and the UI labels which engine produced the result (`grader` field). Judges ask "what if the API
dies"; the answer is a demo that keeps running.

## 3. The three flows that matter

### Flow A: work becomes a credential

```
POST /api/submissions {slug, content, evidenceUrl}
  → load challenge + rubric (rubric is fixed at authoring time, never at grading time)
  → gradeWithAi():  provider chain, strict JSON, validated per rubric key
                    if every provider fails → heuristicGrade() on structure/evidence signals
  → Submission row (content, dimensions, feedback, grader)
  → Credential upsert per (user, skill): keep the best score, refresh evidenceHash
  → response: score, dimensions, feedback, strength, gap, publicId
```

Trust mechanics:

- **Rubric first.** Weights are published on the challenge page before submission, so the target cannot move.
- **Weighted, not vibes.** Total = Σ(dimension score × weight). Any number can be explained line by line.
- **Evidence hash.** `sha256(submissionId : content : score)` truncated to 24 chars, shown on the passport.
  Edit the record and the hash no longer matches what a verifier can recompute.
- **One credential per skill.** Repeated attempts raise the score instead of padding the passport.

### Flow B: passport becomes an application

```
POST /api/applications {opportunityId}
  → require ≥1 credential (no empty passports in the pipeline)
  → matchLearnerToOpportunity(): deterministic, explainable
  → Application row with matchScore + matchNote (the reasons, stored as text)
```

### Flow C: employer sees proof, not pedigree

```
GET /employer → opportunities owned by this employer
              → applications ordered by matchScore desc
              → each row links straight to /p/[passportId]
PATCH /api/applications {id, status}
              → ownership check: application.opportunity.employerId === session.user.id
              → 403 otherwise
```

## 4. Matching, written down

```
coverage  = matched required skills / required skills        (0..1)
quality   = mean verified score of matched skills / 100      (0..1)
location  = 10 if remote or same city, else 0

match %   = round(coverage × 60 + quality × 30 + location)
band      = strong ≥ 70 · promising ≥ 45 · developing < 45
```

Why these weights: coverage is the gate (a role that needs Python should not rank a poet highly),
quality differentiates inside the gate, location is a nudge, not a filter. Every applicant row stores the
human-readable reason string so a rejected candidate can see exactly what was missing. That is the
difference between a ranking and a black box.

## 5. Data model

| Model | Key fields | Purpose |
| --- | --- | --- |
| `User` | email, role, city, language, passportId | Learner or employer; passportId makes the public URL readable |
| `Otp` | email, code, expiresAt, consumed | Passwordless login, 10-minute TTL, single use |
| `Challenge` | slug, skill, minutes, brief (+Hindi), rubric JSON | The task and the published standard |
| `Submission` | content, evidenceUrl, score, dimensions JSON, grader | Every attempt, kept for audit |
| `Credential` | publicId, skill, score, level, evidenceHash | The passport entry; best score per skill |
| `Opportunity` | employerId, skills JSON, city, remote, payText | Role with explicit skill requirements |
| `Application` | matchScore, matchNote, status | One per learner per role, with stored reasoning |

Deliberate omission: no `Degree`, no `Resume`, no `College`. If a field cannot be verified by evidence,
it does not belong in the hiring path.

## 6. API surface

| Method | Route | Auth | Notes |
| --- | --- | --- | --- |
| POST | `/api/auth/request` | public | Creates OTP; returns it in demo mode only |
| POST | `/api/auth/verify` | public | Sets HMAC-signed httpOnly cookie |
| POST | `/api/auth/logout` | user | Clears cookie |
| POST | `/api/submissions` | learner | Grade + issue/update credential |
| POST | `/api/applications` | learner | Apply, recompute match at apply time |
| PATCH | `/api/applications` | employer owner | Shortlist or pass |
| POST | `/api/opportunities` | employer | Create a role |
| POST | `/api/ai/path` | learner | Next best step from live demand minus verified skills |
| POST | `/api/voice` | public | ElevenLabs TTS, 501 → client falls back to browser speech |

## 7. Free stack, and why each piece

| Layer | Choice | Free tier | Why |
| --- | --- | --- | --- |
| DB | Supabase Postgres | 500 MB, 2 projects | Real Postgres, auth and storage if needed later; SQLite keeps local dev instant |
| ORM | Prisma | free | One schema, two providers, typed queries |
| Host | Vercel | hobby | Zero-config Next.js, instant preview URL for judges |
| AI (primary) | Gemini 2.5 Flash | generous free tier, no card | Best quality per free token, JSON mode |
| AI (speed) | Groq Llama 3.3 70B | free tier | Sub-second grading, good for live demo |
| AI (gateway) | OmniRoute | 150+ free providers, one OpenAI-compatible endpoint | Auto-fallback across free tiers; `npx -y omniroute` |
| AI (spare) | OpenRouter free models | free | Third fallback, no cost |
| Voice | ElevenLabs | free credits | Regional-language narration for low-literacy users, plus sponsor prize |
| Deploy alt | AWS Amplify | free tier | Sponsor prize eligibility |

## 8. Security and abuse

- Session cookie is HMAC-SHA256 signed, httpOnly, sameSite=lax, 30-day TTL; comparison is timing-safe.
- OTP: 6 digits, 10-minute expiry, consumed on use, one row per request.
- Employer actions check ownership of the opportunity, not just a role flag (verified with a live 403 test).
- Submitted work is **untrusted input to the grader**: truncated to 6000 chars, the system prompt fixes the
  output shape, and the response is parsed and clamped per rubric key before it reaches the database.
- No secrets in client code; AI keys are server-only env vars.

## 9. File tree

```
app/
  page.tsx                     landing
  layout.tsx, globals.css      shell + design system
  login/page.tsx
  dashboard/page.tsx           learner home
  challenges/page.tsx
  challenges/[slug]/page.tsx   brief + rubric + submit
  passport/page.tsx            own passport
  p/[passportId]/page.tsx      public, verifiable passport
  opportunities/page.tsx
  opportunities/[id]/page.tsx  match breakdown + apply
  employer/page.tsx            ranked applicants
  employer/new/page.tsx        post a role
  api/auth/{request,verify,logout}/route.ts
  api/submissions/route.ts
  api/applications/route.ts
  api/opportunities/route.ts
  api/ai/path/route.ts
  api/voice/route.ts
components/
  Nav.tsx, PassportView.tsx, LoginForm.tsx, SubmitForm.tsx,
  ApplyButton.tsx, StatusControls.tsx, RoleForm.tsx, PathButton.tsx, ListenButton.tsx
lib/
  db.ts, auth.ts, ai.ts, grade.ts, match.ts, i18n.ts, qr.ts
prisma/
  schema.prisma, seed.mjs
docs/
  ARCHITECTURE.md, SPEC.md
```

## 10. What to add during the 24-hour sprint

Ranked by judge impact per hour:

1. **In-browser voice submission** (MediaRecorder → Supabase storage) so a learner with low literacy never types.
2. **Employer-side skill search** ("show me everyone verified in Excel above 70 in Patna").
3. **Credential verification endpoint** (`/verify/:hash`) returning a signed JSON receipt.
4. **Challenge authoring UI** so a training partner can add their own tasks.
5. **WhatsApp delivery** of the challenge brief and the passport link (Twilio sandbox or WhatsApp Cloud API free tier).

## 11. 90-second demo script

1. Land on `/`. Say the one line: "Every learner can do something. Nothing they do is verifiable."
2. Open `/p/demo`. Show scores, evidence links, QR, hash. "This is what an employer receives instead of a resume."
3. As Arjun, open a challenge. Point at the rubric. Submit the UPI explanation. Score appears with four
   dimensions and one specific gap. "The score is auditable, and the engine is named."
4. Back to `/passport`: the Communication score moved from 71 to 82, hash changed.
5. `/opportunities`: match % per role with the missing skill flagged. Apply in one click.
6. Switch to Meera at `/employer`: applicants ranked, passport one click away, shortlist.
7. Close: "No degree field exists in this database. That is the design."

## 12. Known risks

- **AI grader drift**: mitigated by the deterministic twin and by publishing the rubric.
- **Gaming submissions**: evidence links plus the follow-up question in the sprint; a human attestation
  layer (trainer or NGO staff) is the natural v2.
- **Skill taxonomy drift**: challenge `skill` strings and opportunity `skills` must match; v2 moves to a
  controlled `Skill` table.
