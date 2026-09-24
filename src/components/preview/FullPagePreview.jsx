import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { HStack, VStack } from "@astryxdesign/core/Layout";
import { Button } from "@astryxdesign/core/Button";
import { Text } from "@astryxdesign/core/Text";
import {
  Minus,
  Plus,
  Maximize,
  Palette,
  Printer,
  FileDown,
  Loader2,
} from "lucide-react";
import { useStore } from "@store";
import { resumeViewModel } from "@features/resume/viewModel";
import { resolvePaper } from "@features/resume/paper";
import { renderResumePdfPreview } from "@features/export/pdf/preview";
import { downloadPdfPage } from "@features/export/pdf/pageExtract";

const MIN = 0.3;
const MAX = 1.2;
const STEP = 0.1;
const RENDER_DELAY = 400;

const PdfPageCanvas = ({ source, zoom, widthMm, heightMm }) => {
  const canvasRef = useRef(null);
  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && source) {
      canvas.width = source.width;
      canvas.height = source.height;
      canvas.getContext("2d").drawImage(source, 0, 0);
    }
  }, [source]);
  return (
    <canvas
      ref={canvasRef}
      style={{
        width: `calc(${widthMm}mm * ${zoom})`,
        height: `calc(${heightMm}mm * ${zoom})`,
        display: "block",
      }}
    />
  );
};

const FullPagePreview = ({
  onDownloadPdf,
  onDownloadDocx,
  onCustomize,
}) => {
  const [zoom, setZoom] = useState(0.55);
  const [pages, setPages] = useState([]);
  const [pdfBlob, setPdfBlob] = useState(null);
  const [busy, setBusy] = useState(true);
  const [pageBusy, setPageBusy] = useState(null);
  const [error, setError] = useState(null);
  const renderId = useRef(0);
  const clamp = (value) =>
    Math.min(MAX, Math.max(MIN, Math.round(value * 100) / 100));

  const personalDetails = useStore((state) => state.personalDetails);
  const socialLinks = useStore((state) => state.socialLinks);
  const resumeSummary = useStore((state) => state.resumeSummary);
  const workHistory = useStore((state) => state.workHistory);
  const education = useStore((state) => state.education);
  const skills = useStore((state) => state.skills);
  const additionalSections = useStore((state) => state.additionalSections);
  const resumeSettings = useStore((state) => state.resumeSettings);

  const data = useMemo(
    () =>
      resumeViewModel({
        personalDetails,
        socialLinks,
        resumeSummary,
        workHistory,
        education,
        skills,
        additionalSections,
      }),
    [
      personalDetails,
      socialLinks,
      resumeSummary,
      workHistory,
      education,
      skills,
      additionalSections,
    ],
  );

  const templateId = resumeSettings.templateId;
  const paletteId = resumeSettings.paletteId;
  const fontId = resumeSettings.fontId;
  const paper = resolvePaper(resumeSettings.paperSize);
  const [retryCount, setRetryCount] = useState(0);

  const fileBase =
    [personalDetails?.firstName, personalDetails?.lastName]
      .filter(Boolean)
      .join("-") || "resume";

  const renderPages = useMemo(
    () => () =>
      renderResumePdfPreview({
        data,
        templateId,
        paletteId,
        fontId,
        settings: resumeSettings,
      }),
    [data, templateId, paletteId, fontId, resumeSettings],
  );

  useEffect(() => {
    const id = renderId.current + 1;
    renderId.current = id;
    setBusy(true);
    setError(null);
    const timer = window.setTimeout(async () => {
      try {
        const result = await renderPages();
        if (renderId.current !== id) return;
        setPages(result.pages);
        setPdfBlob(result.blob || null);
      } catch (err) {
        if (renderId.current !== id) return;
        setError(err?.message || "Could not render the PDF preview.");
        setPdfBlob(null);
      } finally {
        if (renderId.current === id) setBusy(false);
      }
    }, RENDER_DELAY);
    return () => window.clearTimeout(timer);
  }, [renderPages, retryCount]);

  const exportPage = async (pageIndex) => {
    if (!pdfBlob) return;
    setPageBusy(pageIndex);
    try {
      await downloadPdfPage(pdfBlob, pageIndex, fileBase);
    } catch (err) {
      setError(err?.message || "Could not export that page.");
    } finally {
      setPageBusy(null);
    }
  };

  return (
    <div className="preview-desk">
      <HStack justify="center" width="100%">
        <HStack
          gap={1}
          align="center"
          padding={2}
          className="preview-toolbar"
          wrap
        >
          <Button
            variant="secondary"
            size="sm"
            icon={<Minus size={14} />}
            label="Zoom out"
            onClick={() => setZoom((z) => clamp(z - STEP))}
          />
          <Button
            variant="ghost"
            size="sm"
            icon={<Maximize size={14} />}
            label="Reset view"
            onClick={() => setZoom(0.55)}
          />
          <Text type="inherit" size="sm" weight="medium" color="secondary">
            {Math.round(zoom * 100)}%
          </Text>
          <Button
            variant="secondary"
            size="sm"
            icon={<Plus size={14} />}
            label="Zoom in"
            onClick={() => setZoom((z) => clamp(z + STEP))}
          />
          {pages.length > 1 && (
            <Text type="inherit" size="sm" color="secondary">
              · {pages.length} pages
            </Text>
          )}
          <span className="preview-toolbar-extra">
            <HStack gap={1} align="center">
              <Button
                variant="secondary"
                size="sm"
                icon={<Palette size={14} />}
                label="Customize"
                onClick={onCustomize}
              />
              <Button
                variant="secondary"
                size="sm"
                icon={<FileDown size={14} />}
                label="DOCX"
                onClick={onDownloadDocx}
              />
            </HStack>
          </span>
          <Button
            variant="primary"
            size="sm"
            icon={<Printer size={14} />}
            label="PDF"
            onClick={onDownloadPdf}
          />
        </HStack>
      </HStack>
      <div className="preview-stage">
        {pages.length ? (
          <VStack gap={4} width="100%" align="center">
            {pages.map((canvas, i) => (
              <div key={i} className="preview-page-meta">
                <div className="preview-page-sheet">
                  <PdfPageCanvas
                    source={canvas}
                    zoom={zoom}
                    widthMm={paper.widthMm}
                    heightMm={paper.heightMm}
                  />
                </div>
                <HStack gap={2} align="center" justify="center" wrap>
                  {pages.length > 1 ? (
                    <Text type="small" color="secondary">
                      Page {i + 1} of {pages.length}
                    </Text>
                  ) : null}
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<FileDown size={14} />}
                    label={
                      pageBusy === i
                        ? "Exporting…"
                        : pages.length > 1
                          ? "Export this page"
                          : "Export page"
                    }
                    disabled={!pdfBlob || pageBusy != null}
                    onClick={() => exportPage(i)}
                  />
                </HStack>
              </div>
            ))}
          </VStack>
        ) : (
          <VStack gap={2} width="100%" align="center">
            {error ? (
              <>
                <Text type="small" color="danger">
                  {error}
                </Text>
                <Button
                  variant="secondary"
                  size="sm"
                  label="Try again"
                  onClick={() => setRetryCount((c) => c + 1)}
                />
              </>
            ) : (
              <HStack gap={1} align="center">
                <Loader2 size={14} className="preview-spinner" />
                <Text type="small" color="secondary">
                  Rendering pages…
                </Text>
              </HStack>
            )}
          </VStack>
        )}
        {busy && pages.length > 0 && (
          <HStack
            gap={1}
            align="center"
            className="preview-busy-indicator"
          >
            <Loader2 size={14} className="preview-spinner" />
            <Text type="small" color="secondary">
              Rendering…
            </Text>
          </HStack>
        )}
      </div>
    </div>
  );
};

export default FullPagePreview;
