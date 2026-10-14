import { useLayoutEffect, useRef, useState } from "react";
import { Banner } from "@astryxdesign/core/Banner";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { HStack, VStack } from "@astryxdesign/core/Layout";
import {
  SegmentedControl,
  SegmentedControlItem,
} from "@astryxdesign/core/SegmentedControl";
import { Spinner } from "@astryxdesign/core/Spinner";
import { Text } from "@astryxdesign/core/Text";
import { downloadResumeLatex, latexTemplateIdOf } from "@features/export/latex";
import { compileResumeLatex } from "@features/export/latex/compile.js";
import { displayName, latexIsBlank } from "@features/export/latex/model.js";
import { downloadBlob, safeFilename } from "@lib/download";
import { useI18n } from "@features/i18n/useI18n";
import { useStore } from "@store";

let pdfjsPromise = null;
const loadPdfjs = () => {
  if (!pdfjsPromise) {
    pdfjsPromise = import("pdfjs-dist").then((module) => {
      module.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url,
      ).toString();
      return module;
    });
  }
  return pdfjsPromise;
};

const LatexPdfSheet = ({ bytes, pageLabel, loadingLabel }) => {
  const [pageCount, setPageCount] = useState(0);
  const canvases = useRef([]);
  const docRef = useRef(null);

  useLayoutEffect(() => {
    let cancelled = false;
    setPageCount(0);
    (async () => {
      const pdfjs = await loadPdfjs();
      const doc = await pdfjs.getDocument({ data: bytes.slice() }).promise;
      if (cancelled) {
        await doc.destroy();
        return;
      }
      docRef.current = doc;
      setPageCount(doc.numPages);
    })();
    return () => {
      cancelled = true;
      const doc = docRef.current;
      docRef.current = null;
      doc?.destroy?.();
    };
  }, [bytes]);

  useLayoutEffect(() => {
    const doc = docRef.current;
    if (!doc || pageCount < 1) return undefined;
    let cancelled = false;
    const tasks = [];
    (async () => {
      for (let index = 1; index <= pageCount; index += 1) {
        if (cancelled) return;
        const canvas = canvases.current[index - 1];
        if (!canvas) continue;
        const page = await doc.getPage(index);
        if (cancelled) {
          page.cleanup();
          return;
        }
        const viewport = page.getViewport({ scale: 1.5 });
        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          page.cleanup();
          continue;
        }
        const task = page.render({ canvasContext: ctx, viewport });
        tasks.push(task);
        try {
          await task.promise;
        } catch {
          if (cancelled) return;
        }
        page.cleanup();
      }
    })();
    return () => {
      cancelled = true;
      for (const task of tasks) task.cancel?.();
    };
  }, [bytes, pageCount]);

  if (!pageCount) {
    return (
      <VStack align="center" width="100%" padding={6}>
        <Spinner size="lg" label={loadingLabel} />
      </VStack>
    );
  }

  return (
    <Card padding={0} variant="transparent">
      <VStack gap={3} width="100%" className="editor-latex-sheet">
        {Array.from({ length: pageCount }, (_, index) => (
          <canvas
            key={index}
            ref={(node) => {
              canvases.current[index] = node;
            }}
            className="editor-latex-page"
            aria-label={pageLabel(index + 1)}
          />
        ))}
      </VStack>
    </Card>
  );
};

const LatexEditor = () => {
  const { t } = useI18n();
  const personalDetails = useStore((state) => state.personalDetails);
  const socialLinks = useStore((state) => state.socialLinks);
  const resumeSummary = useStore((state) => state.resumeSummary);
  const workHistory = useStore((state) => state.workHistory);
  const education = useStore((state) => state.education);
  const skills = useStore((state) => state.skills);
  const additionalSections = useStore((state) => state.additionalSections);
  const resumeSettings = useStore((state) => state.resumeSettings);
  const setResumeSettings = useStore((state) => state.setResumeSettings);
  const data = {
    personalDetails,
    socialLinks,
    resumeSummary,
    workHistory,
    education,
    skills,
    additionalSections,
    resumeSettings,
  };
  const templateId = latexTemplateIdOf(data);
  const blank = latexIsBlank(data);
  const [status, setStatus] = useState(blank ? "empty" : "loading");
  const [error, setError] = useState("");
  const [pdfBytes, setPdfBytes] = useState(null);
  const [previewKey, setPreviewKey] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const requestRef = useRef(0);
  const templateRef = useRef(null);

  useLayoutEffect(() => {
    const requestId = ++requestRef.current;
    if (blank) {
      setStatus("empty");
      setPdfBytes(null);
      setError("");
      return undefined;
    }
    const templateChanged = templateRef.current !== templateId;
    templateRef.current = templateId;
    setStatus("loading");
    setPdfBytes(null);
    setError("");
    const handle = setTimeout(() => {
      compileResumeLatex(data)
        .then((result) => {
          if (requestId !== requestRef.current) return;
          const pdf = result.pdf?.slice ? result.pdf.slice() : result.pdf;
          setPdfBytes(pdf);
          setPreviewKey((value) => value + 1);
          setStatus("ready");
        })
        .catch((err) => {
          if (requestId !== requestRef.current) return;
          setPdfBytes(null);
          setStatus("error");
          setError(err?.message || t("editor.latexFailed"));
        });
    }, templateChanged ? 0 : 400);
    return () => {
      clearTimeout(handle);
      requestRef.current += 1;
    };
    // The resume slices are the compile input. `data` is a fresh object each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    attempt,
    blank,
    templateId,
    personalDetails,
    socialLinks,
    resumeSummary,
    workHistory,
    education,
    skills,
    additionalSections,
    resumeSettings,
    t,
  ]);

  const downloadPdf = () => {
    if (!pdfBytes) return;
    const name = safeFilename(displayName(data) || "resume");
    downloadBlob(
      new Blob([pdfBytes], { type: "application/pdf" }),
      `${name}.pdf`,
    );
  };

  const downloadTex = () => {
    downloadResumeLatex(data, displayName(data) || "resume");
  };

  return (
    <VStack gap={3} width="100%" className="editor-latex">
      <Banner
        status="info"
        title={t("editor.latexBetaTitle")}
        description={t("editor.latexBetaBody")}
      />
      <HStack justify="between" align="center" gap={3} width="100%" wrap="wrap">
        <SegmentedControl
          value={templateId}
          onChange={(id) => setResumeSettings({ latexTemplateId: id })}
          label={t("editor.latexTemplate")}
          size="sm"
        >
          <SegmentedControlItem
            value="classic"
            label={t("editor.latexTemplateClassic")}
          />
          <SegmentedControlItem
            value="compact"
            label={t("editor.latexTemplateCompact")}
          />
        </SegmentedControl>
        <HStack gap={2} wrap="wrap">
          <Button
            variant="primary"
            size="sm"
            label={t("editor.latexDownloadPdf")}
            isDisabled={!pdfBytes || status !== "ready"}
            onClick={downloadPdf}
          />
          <Button
            variant="secondary"
            size="sm"
            label={t("editor.latexDownload")}
            onClick={downloadTex}
          />
        </HStack>
      </HStack>
      {blank ? (
        <Text type="inherit" size="sm" color="secondary" role="status">
          {t("editor.latexEmpty")}
        </Text>
      ) : null}
      {!blank && status === "loading" ? (
        <VStack align="center" width="100%" padding={6}>
          <Spinner size="lg" label={t("editor.latexTypesetting")} />
        </VStack>
      ) : null}
      {!blank && status === "error" ? (
        <VStack gap={2} width="100%">
          <Text type="inherit" size="sm" color="accent" role="alert">
            {error}
          </Text>
          <HStack>
            <Button
              variant="secondary"
              size="sm"
              label={t("editor.latexRetry")}
              onClick={() => setAttempt((value) => value + 1)}
            />
          </HStack>
        </VStack>
      ) : null}
      {!blank && status === "ready" && pdfBytes ? (
        <LatexPdfSheet
          key={`${templateId}-${previewKey}`}
          bytes={pdfBytes}
          loadingLabel={t("editor.latexTypesetting")}
          pageLabel={(page) => t("editor.latexPage", { page })}
        />
      ) : null}
    </VStack>
  );
};

export default LatexEditor;
