import { saveVersion } from "./versions";

/**
 * Best-effort local snapshot before a destructive style/content action.
 * Never throws — snapshots must not block the user action.
 */
export const snapshotBefore = async (resumeId, data, name) => {
  if (!resumeId || !data) return null;
  try {
    return await saveVersion(resumeId, data, name);
  } catch {
    return null;
  }
};
