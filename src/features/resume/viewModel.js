/** Map store / resume-doc content slices to the shape Resume & exporters expect. */
export function resumeViewModel(state = {}) {
  return {
    pd: state.personalDetails,
    socialLinks: state.socialLinks,
    summary: state.resumeSummary,
    experience: state.workHistory,
    education: state.education,
    skills: state.skills,
    extras: state.additionalSections,
  };
}
