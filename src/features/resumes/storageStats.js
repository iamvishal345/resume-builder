import { listResumes } from "@features/resumes/db";
import { countAllVersions } from "@features/resumes/versions";
import { isDemoResumeId } from "@features/resumes/seedDemo";
import { formatBytes } from "@lib/format";

/** Local storage meter — cheap counts + optional quota estimate. */
export const estimateLocalStorage = async () => {
  const docs = await listResumes();
  const versions = await countAllVersions();
  let usage = null;
  let quota = null;
  if (typeof navigator !== "undefined" && navigator.storage?.estimate) {
    try {
      const est = await navigator.storage.estimate();
      usage = est.usage ?? null;
      quota = est.quota ?? null;
    } catch {
      /* private / unsupported */
    }
  }
  return {
    resumes: docs.length,
    demos: docs.filter((d) => isDemoResumeId(d.id)).length,
    versions,
    usage,
    quota,
    usageLabel: usage != null ? formatBytes(usage) : null,
    quotaLabel: quota != null ? formatBytes(quota) : null,
  };
};
