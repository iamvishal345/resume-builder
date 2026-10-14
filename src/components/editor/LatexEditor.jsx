import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Banner } from "@astryxdesign/core/Banner";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { HStack, VStack } from "@astryxdesign/core/Layout";
import {
  SegmentedControl,
  SegmentedControlItem,
} from "@astryxdesign/core/SegmentedControl";
import { Text } from "@astryxdesign/core/Text";
import { downloadResumeLatex, latexTemplateIdOf } from "@features/export/latex";
import { compileResumeLatex } from "@features/export/latex/compile.js";
import { downloadBlob, safeFilename } from "@lib/download";
import { displayName } from "@features/export/latex/model.js";
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

const LatexPdfSheet = ({ bytes, pageLabel }) => {
  const [pageCount, setPageCount] = useState(0);
  const canvases = useRef([]);
  const docRef = useRef(null);

  useEffect(() => {
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
    (async () => {
      for (let index = 1; index <= pageCount; index += 1) {
        if (cancelled) return;
        const canvas = canvases.current[index - 1];
        if (!canvas) continue;
        const page = await doc.getPage(index);
        const viewport = page.getViewport({ scale: 1.5 });
        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        const ctx = canvas.getContext("2d");
        if (ctx) await page.render({ canvasContext: ctx, viewport }).promise;
        page.cleanup();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [bytes, pageCount]);

  if (!pageCount) return null;

  return (
    <Card padding={0} variant="transparent">
      <VStack gap={3} width="100%" className="preview-sheet-wrap">
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
  const [status, setStatus] = useState("loading");
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [pdfBytes, setPdfBytes] = useState(null);
  const [attempt, setAttempt] = useState(0);
  const requestRef = useRef(0);

  useEffect(() => {
    const requestId = ++requestRef.current;
    const handle = setTimeout(() => {
      setStatus("loading");
      setPdfBytes(null);
      setError("");
      setProgress("");
      compileResumeLatex(data, {
        onProgress: (stage, detail) => {
          if (requestId !== requestRef.current) return;
          const next = [detail, stage].filter(Boolean).join(" · ");
          if (next) setProgress(next);
        },
      })
        .then((result) => {
          if (requestId !== requestRef.current) return;
          setPdfBytes(result.pdf);
          setStatus("ready");
        })
        .catch((err) => {
          if (requestId !== requestRef.current) return;
          setPdfBytes(null);
          setStatus("error");
          setError(err?.message || t("editor.latexFailed"));
        });
    }, 400);
    return () => {
      clearTimeout(handle);
      requestRef.current += 1;
    };
    // The resume slices are the compile input. `data` is a fresh object each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    attempt,
    templateId,
    personalDetails,
    socialLinks,
    resumeSummary,
    workHistory,
    education,
    skills,
    additionalSections,
    resumeSettings,
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
      <HStack justify="between" align="end" gap={3} width="100%" wrap="wrap">
        <VStack gap={1}>
          <Text type="inherit" size="lg" weight="semibold" color="primary">
            {t("editor.latexTitle")}
          </Text>
          <Text type="inherit" size="sm" color="secondary">
            {t("editor.latexSubtitle")}
          </Text>
        </VStack>
        <HStack gap={2} wrap="wrap">
          <Button
            variant="primary"
            size="sm"
            label={t("editor.latexDownloadPdf")}
            isDisabled={!pdfBytes || status === "loading"}
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
      <VStack gap={2} width="100%">
        <Text type="inherit" size="xs" weight="medium" color="secondary">
          {t("editor.latexTemplate")}
        </Text>
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
        <Text type="inherit" size="sm" color="secondary">
          {t("editor.latexTemplateClassic")}: {t("editor.latexTemplateClassicDesc")}
        </Text>
        <Text type="inherit" size="sm" color="secondary">
          {t("editor.latexTemplateCompact")}: {t("editor.latexTemplateCompactDesc")}
        </Text>
      </VStack>
      <Text type="inherit" size="sm" color="secondary">
        {t("editor.latexNote")}
      </Text>
      {status === "loading" ? (
        <Text type="inherit" size="sm" color="secondary" role="status">
          {t("editor.latexLoading")}
          {progress ? ` ${progress}` : ""}
        </Text>
      ) : null}
      {status === "error" ? (
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
      {pdfBytes ? (
        <LatexPdfSheet
          bytes={pdfBytes}
          pageLabel={(page) => t("editor.latexPage", { page })}
        />
      ) : null}
    </VStack>
  );
};

export default LatexEditor;
