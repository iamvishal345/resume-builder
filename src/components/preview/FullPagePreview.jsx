import React, { useState } from "react";
import { HStack } from "@astryxdesign/core/Layout";
import { Button } from "@astryxdesign/core/Button";
import { Text } from "@astryxdesign/core/Text";
import { Minus, Plus, Maximize, Palette, Printer, FileDown } from "lucide-react";

const MIN = 0.3;
const MAX = 1.2;
const STEP = 0.1;

const FullPagePreview = ({ children, onDownloadPdf, onDownloadDocx, onCustomize }) => {
  const [zoom, setZoom] = useState(0.55);
  const clamp = (value) => Math.min(MAX, Math.max(MIN, Math.round(value * 100) / 100));

  return (
    <div className="preview-desk">
      <HStack justify="center" width="100%">
        <HStack gap={1} align="center" padding={2} className="preview-toolbar" wrap>
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
        <div
          className="preview-page-slot"
          style={{
            width: `${210 * zoom}mm`,
            height: `${297 * zoom}mm`,
            position: "relative",
          }}
        >
          <div
            style={{
              width: "210mm",
              position: "absolute",
              top: 0,
              left: 0,
              transform: `scale(${zoom})`,
              transformOrigin: "top left",
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullPagePreview;