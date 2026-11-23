import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();
const hash = (s) => crypto.createHash("sha256").update(s).digest("hex").slice(0, 24);
const pid = () => crypto.randomBytes(9).toString("base64url").replace(/[^a-zA-Z0-9]/g, "").slice(0, 10);

const rubric = (items) => JSON.stringify(items);

const challenges = [
  {
    slug: "explain-clearly",
    title: "Explain a hard idea in 100 words",
    titleHi: "कठिन बात 100 शब्दों में समझाएँ",
    skill: "Communication",
    level: "beginner",
    minutes: 15,
    brief:
      "Pick something you understand well (UPI payments, a cricket rule, how your phone battery charges) and explain it to a 12-year-old in 100 to 150 words. No jargon. Then paste one example that proves the explanation works.",
    briefHi:
      "कोई ऐसी चीज़ चुनें जो आप अच्छी तरह समझते हैं और उसे 12 साल के बच्चे को 100-150 शब्दों में समझाएँ। कठिन शब्द नहीं।",
    rubric: rubric([
      { key: "clarity", label: "Clarity for a non-expert", weight: 0.35, hint: "Short sentences, no unexplained jargon" },
      { key: "depth", label: "Correct and complete", weight: 0.3, hint: "Covers the parts that actually matter" },
      { key: "evidence", label: "Uses a concrete example", weight: 0.2, hint: "One real example or number" },
      { key: "originality", label: "Own words, own analogy", weight: 0.15, hint: "Not copied from a textbook" },
    ]),
    sample: "Think of UPI like a courier that only carries a signed note...",
  },
  {
    slug: "python-chore",
    title: "Write a Python function that fixes a real chore",
    titleHi: "असली काम आसान करने वाला Python फंक्शन",
    skill: "Python",
    level: "beginner",
    minutes: 30,
    brief:
      "Write a small Python function that solves a chore you or your family actually does by hand (splitting a bill, tracking a milk delivery, counting attendance). Paste the code, then explain in 3 lines what it takes in and what it returns. Attach a screenshot or a Colab link as evidence.",
    briefHi: "घर के किसी असली काम को हल करने वाला छोटा Python फंक्शन लिखें और कोड समझाएँ।",
    rubric: rubric([
      { key: "clarity", label: "Code is readable", weight: 0.3, hint: "Names make sense, indentation is clean" },
      { key: "depth", label: "Logic handles edge cases", weight: 0.35, hint: "Empty input, zero, duplicates" },
      { key: "evidence", label: "Proof it runs", weight: 0.2, hint: "Output, screenshot or link" },
      { key: "originality", label: "Solves a real problem", weight: 0.15, hint: "Not a tutorial copy-paste" },
    ]),
  },
  {
    slug: "voice-pitch",
    title: "Record a 60-second self pitch",
    titleHi: "60 सेकंड का अपना परिचय",
    skill: "Spoken English",
    level: "beginner",
    minutes: 20,
    brief:
      "Record a 60-second voice note introducing yourself to an employer: who you are, one thing you can do well, and one thing you want to learn. Any language is fine, English or Hindi. Paste the transcript here and attach the audio link (Drive, WhatsApp export, anywhere public).",
    briefHi: "60 सेकंड का वॉइस नोट रिकॉर्ड करें: आप कौन हैं, क्या अच्छा कर सकते हैं, क्या सीखना चाहते हैं।",
    rubric: rubric([
      { key: "clarity", label: "Easy to follow", weight: 0.35, hint: "Steady pace, clear structure" },
      { key: "depth", label: "Specific about ability", weight: 0.3, hint: "Names a concrete skill, not 'hardworking'" },
      { key: "evidence", label: "Audio attached", weight: 0.2, hint: "Playable link" },
      { key: "originality", label: "Sounds like you", weight: 0.15, hint: "Not a memorised template" },
    ]),
  },
  {
    slug: "data-story",
    title: "Read a table and tell the story",
    titleHi: "तालिका पढ़कर कहानी बताएँ",
    skill: "Data literacy",
    level: "intermediate",
    minutes: 25,
    brief:
      "Below is a week of sales from a small shop. Write 4 to 6 lines telling the owner what happened and what to do next. Use at least two numbers from the table.\n\nMon 1200, Tue 900, Wed 1400, Thu 1350, Fri 2600, Sat 3100, Sun 700. Returns: 4 on Sat, 0 on Sun.",
    briefHi: "एक हफ़्ते की बिक्री देखकर दुकानदार को 4-6 पंक्तियों में बताएँ कि क्या हुआ और आगे क्या करें।",
    rubric: rubric([
      { key: "clarity", label: "Plain, decisive summary", weight: 0.3, hint: "One clear takeaway first" },
      { key: "depth", label: "Right reading of the data", weight: 0.35, hint: "Peak, dip, returns handled correctly" },
      { key: "evidence", label: "Uses the actual numbers", weight: 0.2, hint: "Quotes at least two figures" },
      { key: "originality", label: "Actionable recommendation", weight: 0.15, hint: "A specific next step" },
    ]),
  },
  {
    slug: "angry-customer",
    title: "Handle an angry customer message",
    titleHi: "नाराज़ ग्राहक को संभालें",
    skill: "Customer support",
    level: "intermediate",
    minutes: 20,
    brief:
      "A customer writes: 'I ordered a mixer 9 days ago, it still has not arrived, and nobody replies. This is cheating. I want my money back.' Write the reply you would send. Then write one line on what you would change internally so this does not repeat.",
    briefHi: "नाराज़ ग्राहक के संदेश का जवाब लिखें और बताएँ कि आगे ऐसा न हो, इसके लिए क्या बदलेंगे।",
    rubric: rubric([
      { key: "clarity", label: "Calm, short, clear", weight: 0.3, hint: "Acknowledge, then act" },
      { key: "depth", label: "Solves the actual problem", weight: 0.35, hint: "Concrete timeline, no vague promises" },
      { key: "evidence", label: "Uses order facts", weight: 0.2, hint: "References the 9 days and refund" },
      { key: "originality", label: "Fixes the root cause", weight: 0.15, hint: "A process change, not an apology" },
    ]),
  },
  {
    slug: "excel-tracker",
    title: "Build a tracker that survives a real month",
    titleHi: "महीने भर चलने वाला ट्रैकर बनाएँ",
    skill: "Excel",
    level: "beginner",
    minutes: 30,
    brief:
      "Describe a spreadsheet you would build to track 20 monthly orders for a small business: the exact columns, the three formulas you would use, and how you would spot a late order at a glance. Attach a link to a sample sheet if you have one.",
    briefHi: "20 ऑर्डर ट्रैक करने वाली शीट के कॉलम, तीन फ़ॉर्मूले और देर से चल रहे ऑर्डर पहचानने का तरीका बताएँ।",
    rubric: rubric([
      { key: "clarity", label: "Structure is obvious", weight: 0.3, hint: "Columns named for a human" },
      { key: "depth", label: "Formulas do real work", weight: 0.35, hint: "Not just SUM" },
      { key: "evidence", label: "Sheet attached", weight: 0.2, hint: "Viewable link" },
      { key: "originality", label: "Fits a small business", weight: 0.15, hint: "Not an enterprise template" },
    ]),
  },
];

const users = [
  {
    email: "arjun@skillsetu.in",
    name: "Arjun Nair",
    city: "Bengaluru",
    language: "en",
    role: "LEARNER",
    phone: "+91 90000 11111",
    headline: "B.Com graduate, night-shift learner. Python + numbers.",
  },
  {
    email: "ritu@skillsetu.in",
    name: "Ritu Kumari",
    city: "Jaipur",
    language: "hi",
    role: "LEARNER",
    phone: "+91 90000 22222",
    headline: "Hindi-first learner. Wants a desk job near home.",
  },
  {
    email: "imran@skillsetu.in",
    name: "Imran Sheikh",
    city: "Hyderabad",
    language: "en",
    role: "LEARNER",
    phone: "+91 90000 33333",
    headline: "Self-taught coder, first-generation graduate.",
  },
  {
    email: "sunita@skillsetu.in",
    name: "Sunita Devi",
    city: "Patna",
    language: "hi",
    role: "LEARNER",
    phone: "+91 90000 44444",
    headline: "BPO aspirant. Voice practice every morning.",
  },
  {
    email: "meera@kiranaworks.in",
    name: "Meera Raghavan",
    city: "Bengaluru",
    language: "en",
    role: "EMPLOYER",
    headline: "Hiring for KiranaWorks, a 40-person D2C grocery brand.",
  },
  {
    email: "hiring@sakhilearning.org",
    name: "Sakhi Learning",
    city: "Patna",
    language: "en",
    role: "EMPLOYER",
    headline: "Non-profit running rural learning and placement programmes.",
  },
];

const credentials = [
  ["arjun@skillsetu.in", "Python", "python-chore", 84, "advanced", "2026-11-10"],
  ["arjun@skillsetu.in", "Communication", "explain-clearly", 71, "advanced", "2026-11-14"],
  ["arjun@skillsetu.in", "Excel", "excel-tracker", 66, "intermediate", "2026-11-18"],
  ["ritu@skillsetu.in", "Communication", "explain-clearly", 79, "advanced", "2026-11-12"],
  ["ritu@skillsetu.in", "Excel", "excel-tracker", 74, "advanced", "2026-11-16"],
  ["ritu@skillsetu.in", "Data literacy", "data-story", 58, "intermediate", "2026-11-20"],
  ["imran@skillsetu.in", "Python", "python-chore", 91, "expert", "2026-11-08"],
  ["imran@skillsetu.in", "Data literacy", "data-story", 77, "advanced", "2026-11-19"],
  ["sunita@skillsetu.in", "Spoken English", "voice-pitch", 63, "intermediate", "2026-11-15"],
  ["sunita@skillsetu.in", "Customer support", "angry-customer", 82, "advanced", "2026-11-21"],
];

const opportunities = [
  {
    employer: "meera@kiranaworks.in",
    title: "Junior Python developer (apprentice)",
    org: "KiranaWorks",
    city: "Bengaluru",
    type: "JOB",
    remote: false,
    payText: "₹18,000 / month",
    skills: ["Python", "Communication"],
    description:
      "Build small internal tools for our warehouse team: stock alerts, order exports, a WhatsApp summary at 8pm. You will pair with one senior dev for the first month. We hire on demonstrated work, not college tier.",
  },
  {
    employer: "meera@kiranaworks.in",
    title: "Reporting associate",
    org: "KiranaWorks",
    city: "Bengaluru",
    type: "JOB",
    remote: false,
    payText: "₹15,000 / month",
    skills: ["Excel", "Data literacy"],
    description:
      "Own the weekly sales and returns report. You read the numbers, explain what changed, and tell the ops team what to do about it. Sheets-heavy role, no coding needed.",
  },
  {
    employer: "hiring@sakhilearning.org",
    title: "Customer support, Hindi and English",
    org: "Sakhi Learning",
    city: "Patna",
    type: "JOB",
    remote: true,
    payText: "₹16,000 / month",
    skills: ["Customer support", "Spoken English"],
    description:
      "Answer learner queries on WhatsApp and phone, mostly in Hindi. We care about calm, clear replies more than perfect grammar. Work from anywhere with a phone and a quiet hour.",
  },
  {
    employer: "meera@kiranaworks.in",
    title: "Field sales intern",
    org: "KiranaWorks",
    city: "Jaipur",
    type: "INTERNSHIP",
    remote: false,
    payText: "₹8,000 stipend + travel",
    skills: ["Sales", "Communication"],
    description:
      "Visit 8 kirana stores a day, demo our catalogue, log orders on a phone. 3-month internship with a full-time offer for anyone who hits target twice.",
  },
  {
    employer: "hiring@sakhilearning.org",
    title: "Scholarship: 12-week Android bootcamp",
    org: "Sakhi Learning",
    city: "Online",
    type: "SCHOLARSHIP",
    remote: true,
    payText: "Fully funded + ₹5,000 device grant",
    skills: ["Python"],
    description:
      "For learners who already write basic code. 12 weeks, evenings, Hindi and English. Selection is based on your passport evidence and one live task, not marksheets.",
  },
];

async function main() {
  await prisma.application.deleteMany();
  await prisma.credential.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.opportunity.deleteMany();
  await prisma.challenge.deleteMany();
  await prisma.otp.deleteMany();
  await prisma.user.deleteMany();

  const challengeRows = {};
  for (const c of challenges) {
    challengeRows[c.slug] = await prisma.challenge.create({ data: c });
  }

  const passportIds = {
    "arjun@skillsetu.in": "demo",
    "ritu@skillsetu.in": "ritu-kumari",
    "imran@skillsetu.in": "imran-sheikh",
    "sunita@skillsetu.in": "sunita-devi",
  };
  const userRows = {};
  for (const u of users) {
    userRows[u.email] = await prisma.user.create({
      data: { ...u, passportId: passportIds[u.email] ?? "org-" + pid().toLowerCase() },
    });
  }

  for (const [email, skill, slug, score, level, date] of credentials) {
    const challenge = challengeRows[slug];
    const submission = await prisma.submission.create({
      data: {
        userId: userRows[email].id,
        challengeId: challenge.id,
        content: `Seeded submission for ${challenge.title} by ${userRows[email].name}.`,
        evidenceUrl: "https://example.org/evidence/" + slug,
        score,
        level,
        dimensions: JSON.stringify([
          { key: "clarity", label: "Clarity", weight: 0.3, score: Math.min(100, score + 4), note: "Clear opening, easy to follow." },
          { key: "depth", label: "Depth", weight: 0.4, score, note: "Handles the main cases with one gap." },
          { key: "evidence", label: "Evidence", weight: 0.2, score: Math.max(0, score - 6), note: "Artefact attached." },
          { key: "originality", label: "Originality", weight: 0.1, score: Math.min(100, score + 2), note: "Own examples." },
        ]),
        feedback: `Verified at ${score}/100. The work holds up under a follow-up question, and the artefact is attached.`,
        strength: "Clarity",
        gap: "Depth on edge cases",
        grader: "skillsetu-heuristic-v1",
      },
    });
    await prisma.credential.create({
      data: {
        publicId: pid(),
        userId: userRows[email].id,
        challengeId: challenge.id,
        submissionId: submission.id,
        title: challenge.title,
        skill,
        score,
        level,
        evidenceHash: hash(submission.id + skill + score),
        issuedAt: new Date(date),
      },
    });
  }

  const oppRows = [];
  for (const o of opportunities) {
    oppRows.push(
      await prisma.opportunity.create({
        data: {
          employerId: userRows[o.employer].id,
          title: o.title,
          org: o.org,
          city: o.city,
          type: o.type,
          remote: o.remote,
          payText: o.payText,
          skills: JSON.stringify(o.skills),
          description: o.description,
        },
      }),
    );
  }

  await prisma.application.create({
    data: {
      opportunityId: oppRows[0].id,
      userId: userRows["imran@skillsetu.in"].id,
      status: "SHORTLISTED",
      matchScore: 82,
      matchNote: "2/2 required skills proven, Python 91/100.",
    },
  });
  await prisma.application.create({
    data: {
      opportunityId: oppRows[0].id,
      userId: userRows["arjun@skillsetu.in"].id,
      status: "APPLIED",
      matchScore: 74,
      matchNote: "2/2 required skills proven, Python 84/100.",
    },
  });
  await prisma.application.create({
    data: {
      opportunityId: oppRows[2].id,
      userId: userRows["sunita@skillsetu.in"].id,
      status: "APPLIED",
      matchScore: 78,
      matchNote: "2/2 required skills proven, support 82/100.",
    },
  });

  const counts = {
    challenges: await prisma.challenge.count(),
    users: await prisma.user.count(),
    credentials: await prisma.credential.count(),
    opportunities: await prisma.opportunity.count(),
    applications: await prisma.application.count(),
  };
  console.log("Seeded:", counts);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
