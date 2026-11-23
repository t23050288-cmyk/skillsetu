# Spec: SkillSetu (Track 04, UnlockED)

Written spec-first (spec-kit style): the spec below is what the code implements, not a description of
what the code happens to do.

## Problem

Learners in underserved communities cannot convert what they can do into something an employer will
believe. Free content exists; verified proof does not.

## Users

- **Learner**: 18-28, phone-first, 2G, Hindi or English, no laptop, no degree brand, has real ability.
- **Employer**: small business or non-profit hiring for practical roles, drowning in unverifiable resumes.
- **Training partner** (v2): NGO or ITI that wants to issue evidence on a learner's behalf.

## User stories and acceptance criteria

### L1 - Prove a skill in one sitting
Given a signed-in learner, when they submit a challenge, then within one request they receive a score out
of 100, four dimension scores with notes, one strength, one gap, and a credential on their passport.
**Done when:** `POST /api/submissions` returns all of the above and `/passport` shows the new score.

### L2 - The score must be explainable
Given any credential, when a judge asks why it is 82, then the rubric weights and the per-dimension scores
sum to the total, and the engine that produced it is displayed.

### L3 - Improve, do not inflate
Given an existing credential for a skill, when a learner submits again with a lower score, then the
passport keeps the higher score and the attempt is still stored.

### L4 - Share proof without an account
Given a passport, when anyone opens `/p/[passportId]`, then they see verified skills, evidence links,
issue dates, a QR code and a hash, with no login.

### L5 - Apply without a resume
Given a learner with at least one credential, when they apply to a role, then an application is created
with a stored match score and a human-readable reason string, and re-applying does not duplicate it.

### E1 - Rank on proof
Given an employer with open roles, when they open `/employer`, then applicants appear ordered by match
score with the passport one click away.

### E2 - Own your pipeline only
Given an employer, when they try to change the status of an application on another employer's role, then
the API returns 403. **Verified in testing.**

### A1 - Degrade, never die
Given no AI provider keys or a dead network, when a learner submits, then grading still completes using
the deterministic engine and the response names that engine.

### A2 - Two languages, one product
Given a learner with language `hi`, when they view their passport, then headings, labels and the verify
line render in Hindi and the challenge briefs show Hindi where authored.

### A3 - Read aloud
Given a passport, when the user taps Listen, then audio plays from ElevenLabs if configured, otherwise
from the browser's speech synthesis. Never a silent failure.

## Non-goals (v1)

- Course hosting, video lessons, or a content marketplace.
- Payments, subscriptions, or paid certificates.
- Real degree or document verification.
- Native apps, offline sync, or multi-tenant org administration.

## Success measures for the hackathon

1. A judge can complete the full loop (submit → credential → match → shortlist) unassisted in under 3 minutes.
2. Every number on screen can be traced to a rubric line or a stored reason.
3. The app runs with zero paid services.
