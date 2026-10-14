// Lazy pdfLaTeX via @siglum/engine (MIT, BusyTeX / TeX Live in wasm).
// Engine bytes come from the Siglum CDN the first time and are cached in
// IndexedDB by the compiler. The resume source is compiled locally and is
// not uploaded. CTAN fetching stays off. Lazy bundle reads stay on so
// deferred files such as the T1 cm-super fonts can load. With that off,
// pdfTeX waits on fonts that were never mounted and the compile never
// finishes.

// The package does not export its worker, so the file is served from public/.
const WORKER_URL = "/latex/siglum-worker.js";

const ENGINE_BASE = "https://cdn.siglum.org/tl2025";

let compilerPromise = null;

const loadCompiler = async (onProgress) => {
  if (!compilerPromise) {
    compilerPromise = (async () => {
      const { SiglumCompiler } = await import("@siglum/engine");
      const compiler = new SiglumCompiler({
        bundlesUrl: `${ENGINE_BASE}/bundles`,
        wasmUrl: `${ENGINE_BASE}/busytex.wasm`,
        jsUrl: `${ENGINE_BASE}/busytex.js`,
        workerUrl: WORKER_URL,
        enableCtan: false,
        enableLazyFS: true,
        verbose: false,
        onProgress,
      });
      try {
        await compiler.init();
      } catch (error) {
        compilerPromise = null;
        try {
          compiler.unload?.();
        } catch {
          /* the failed worker is already unusable */
        }
        throw error;
      }
      return compiler;
    })();
  } else if (onProgress) {
    compilerPromise.then((compiler) => {
      compiler.onProgress = onProgress;
    });
  }
  return compilerPromise;
};

export const compileWithSiglum = async (job, { onProgress } = {}) => {
  const compiler = await loadCompiler(onProgress);
  if (onProgress) compiler.onProgress = onProgress;
  const engine = job.engine || "pdflatex";
  let result = await compiler.compile(job.source, { engine });
  // A cached entry can be an empty buffer (pdfTeX wrote no pages). Compile again.
  if (result?.cached && !(result.pdf?.byteLength)) {
    result = await compiler.compile(job.source, { engine, useCache: false });
  }
  return result;
};
