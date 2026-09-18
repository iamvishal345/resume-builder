/**
 * Build a local interview packet from a resume + JD notes.
 * Pure data — export as JSON download; PDFs are triggered by the caller.
 */
export const buildInterviewPacket = ({
  resumeDoc,
  jobDescription = "",
  talkingPoints = [],
  coverLetter,
}) => ({
  type: "cavren/interview-packet",
  version: 1,
  createdAt: new Date().toISOString(),
  jobDescription,
  talkingPoints: talkingPoints.filter(Boolean),
  resume: {
    name: resumeDoc?.name,
    data: resumeDoc?.data,
  },
  coverLetter: coverLetter || resumeDoc?.data?.coverLetter || null,
});

export const defaultTalkingPointsFromJd = (jd = "") => {
  const lines = String(jd)
    .split(/[\n•\-]/)
    .map((l) => l.trim())
    .filter((l) => l.length > 20 && l.length < 160)
    .slice(0, 6);
  return lines.map((l) => `Be ready to discuss: ${l}`);
};
