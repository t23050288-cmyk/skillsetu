# SkillSetu

**Proof over paper.** A verified skill passport for learners in underserved communities, built for
wHACKiest 2026, Track 04 (UnlockED).

The problem statement names three gaps: learning is hard to access, ability is hard to showcase, and
opportunities are hard to find. SkillSetu attacks the middle one, because it is the one nobody builds:
a learner does a short, real task, an AI assessor grades it against a published rubric, and the result
becomes a tamper-evident passport entry that an employer can verify in one click and match against a role.

## What is in the box

| Surface | Route | What it does |
| --- | --- | --- |
| Landing | `/` | Problem framing, how the loop works, trust argument |
| Auth | `/login` | Email + 6-digit code, no password (demo mode shows the code on screen) |
| Learner dashboard | `/dashboard` | Verified skills, average score, AI "next best step", applications |
| Challenges | `/challenges`, `/challenges/[slug]` | 6 real tasks with a rubric published before submission |
| Grading | `POST /api/submissions` | AI assessor, per-dimension scores, feedback, auto-issued credential |
| Passport | `/passport`, `/p/[passportId]` | Shareable public page with scores, evidence links, QR, hash |
| Opportunities | `/opportunities`, `/opportunities/[id]` | Roles with explainable match %, apply with passport |
| Employer | `/employer`, `/employer/new` | Post roles, see applicants ranked by proof, shortlist/pass |

## Quickstart

```bash
npm install
cp .env.example .env
npx prisma db push        # creates prisma/dev.db (SQLite, zero setup)
node prisma/seed.mjs      # 6 challenges, 6 users, 10 credentials, 5 roles
npm run dev               # http://localhost:3000
```

Demo accounts (any code shown on screen works; the code is printed in the UI in demo mode):

- Learner: `arjun@skillsetu.in` (3 verified skills, 1 application)
- Employer: `meera@kiranaworks.in` (3 roles, 2 applicants)

Public passport to show a judge: `http://localhost:3000/p/demo`

## Environment

Everything except `DATABASE_URL` is optional. With no AI keys the app uses the deterministic local
grader (`lib/grade.ts`), so the demo never dies on venue wifi.

```bash
DATABASE_URL="file:./dev.db"          # or a Supabase / Neon Postgres URL
SESSION_SECRET="long-random-string"
GEMINI_API_KEY=""                     # free tier, recommended
GROQ_API_KEY=""                       # free tier, fast fallback
OPENROUTER_API_KEY=""                 # free models
AI_BASE_URL="http://localhost:20128/v1"  # OmniRoute free gateway (npx -y omniroute)
ELEVENLABS_API_KEY=""                 # voice for low-literacy users
```

## Switching to Postgres (Supabase free tier)

1. Create a Supabase project, copy the pooled connection string.
2. In `prisma/schema.prisma`, change `provider = "sqlite"` to `provider = "postgresql"`.
3. Set `DATABASE_URL` to the Supabase URL, then `npx prisma db push && node prisma/seed.mjs`.

Nothing else changes: the schema deliberately avoids Postgres-only types, so both providers work.

## Deploy

- **Vercel (free):** import the repo, add env vars, build command `prisma generate && next build`.
- **AWS Amplify (free tier):** same repo, same env vars. Using AWS here plus ElevenLabs for voice is
  what qualifies for the two sponsor prizes.

## Repo map

```
app/            routes (server components) + API handlers
components/     client islands: forms, apply, status, listen, passport view
lib/            db, auth, ai provider chain, heuristic grader, matching, i18n, qr
prisma/         schema + seed
docs/           ARCHITECTURE.md, SPEC.md
```

## Honest limits

- OTP is printed on screen because no SMTP is configured; production swaps in Resend or SES.
- One credential per learner per skill (best score wins). Multiple attempts are stored as submissions.
- Voice input is a link to a recording, not in-browser recording yet.
- Matching is deterministic, not learned. That is a feature for a 24-hour demo: a judge can audit it.
