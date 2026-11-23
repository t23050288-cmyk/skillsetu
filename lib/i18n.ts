export type Lang = "en" | "hi";

const dict = {
  en: {
    tagline: "Proof over paper.",
    passport: "Skill passport",
    verified: "Verified skills",
    evidence: "Evidence",
    issued: "Issued",
    verify: "Verify this passport",
    skills: "Skills",
    score: "Score",
    opportunities: "Opportunities",
    match: "Match",
    apply: "Apply with my passport",
    applied: "Applied",
    challenges: "Challenges",
    employerView: "Employer view",
    languages: "Language",
  },
  hi: {
    tagline: "कागज़ नहीं, काबिलियत।",
    passport: "कौशल पासपोर्ट",
    verified: "सत्यापित कौशल",
    evidence: "प्रमाण",
    issued: "जारी",
    verify: "इस पासपोर्ट को सत्यापित करें",
    skills: "कौशल",
    score: "स्कोर",
    opportunities: "अवसर",
    match: "मेल",
    apply: "अपने पासपोर्ट से आवेदन करें",
    applied: "आवेदन किया",
    challenges: "चुनौतियाँ",
    employerView: "नियोक्ता दृश्य",
    languages: "भाषा",
  },
} as const;

export type Dict = { [K in keyof (typeof dict)["en"]]: string };

export function t(lang: string | null | undefined): Dict {
  return lang === "hi" ? dict.hi : dict.en;
}
