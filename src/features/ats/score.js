const ACTION_VERBS = new Set([
  "accelerated", "achieved", "automated", "built", "championed", "collaborated",
  "created", "cut", "delivered", "designed", "developed", "drove", "engineered",
  "established", "executed", "grew", "implemented", "improved", "increased",
  "initiated", "introduced", "launched", "led", "managed", "migrated",
  "modernized", "negotiated", "optimized", "orchestrated", "oversaw", "owned",
  "reduced", "redesigned", "scaled", "shipped", "slashed", "spearheaded",
  "streamlined", "strengthened", "supervised", "transformed", "unified",
]);

const cleanText = (html) =>
  (html || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

const startsWithActionVerb = (html) => {
  const first = cleanText(html).split(" ")[0];
  return first ? ACTION_VERBS.has(first.toLowerCase()) : false;
};

const anyEntryHasBullets = (entries) => entries.some((e) => cleanText(e.workSummary).length);

const enter = (id, step, label, ok, hint) => ({ id, step, label, ok, hint });

export const computeResumeScore = (data) => {
  const pd = data.pd || {};
  const experience = data.experience || [];
  const education = data.education || [];
  const skills = (data.skills || []).filter((s) => s.name);
  const summary = cleanText(data.summary);
  const words = summary ? summary.split(" ").length : 0;
  const name = [pd.firstName, pd.lastName].filter(Boolean).join(" ");

  const bulletsHtml = experience
    .map((e) => e.workSummary)
    .filter(Boolean);

  const checks = [
    enter("name", 0, "Your name is set", !!name, "Add your first and last name in Personal Details."),
    enter("email", 0, "Email address is present", !!pd.email, "Recruiters expect an email to contact you."),
    enter("phone", 0, "Phone number is present", !!pd.contactNumber, "Add a phone number recruiters can call."),
    enter("summary", 1, "Summary is 40–160 words", words >= 40 && words <= 160, words ? "Your summary is currently " + words + " words." : "Add a 2–4 sentence professional summary."),
    enter("experience", 2, "At least one role with a title", experience.some((e) => e.positionTitle), "Add your most recent position under Professional Experience."),
    enter("bullets", 2, "Roles include responsibilities", anyEntryHasBullets(experience), "Describe each role with bullets, not just a title."),
    enter("verbs", 2, "Bullets start with action verbs", bulletsHtml.every(startsWithActionVerb), "Start each bullet with a strong verb like 'Built', 'Led', 'Shipped'."),
    enter("dates", 2, "Roles have dates", experience.every((e) => e.startDate), "Add start/end dates so recruiters can read your timeline."),
    enter("education", 3, "Education is listed", education.some((e) => e.schoolName || e.degree), "Add your degree and school under Education."),
    enter("skills", 4, "At least 3 skills are listed", skills.length >= 3, "List 3+ relevant skills to get past keyword filters."),
    enter("filler", 1, "No placeholder text remains", !/lorem|your name|sample text/i.test(summary + name), "Replace placeholder text with your real details."),
    enter("polish", 5, "No empty sections remain", true, "Remove optional sections you left blank before exporting."),
  ];

  const passed = checks.filter((c) => c.ok).length;
  const score = Math.round((passed / checks.length) * 100);

  return { score, checks, passed, total: checks.length };
};

export const scoreColor = (score) =>
  score >= 90 ? "success" : score >= 70 ? "warning" : "error";