import React, { useState } from "react";
import { Resume } from "@features/resume/Resume";
import { SAMPLE_RESUME } from "@features/resume/sample";
import { RESUME_TEMPLATES } from "@features/resume/templates";

const CELL = "rgba(255,255,255,1)";

const Harness = () => {
  const [checked, setChecked] = useState({ fototop: true, darksidebar: true });
  return (
    <div style={{ padding: 24, background: "#eef2f6", fontFamily: "system-ui" }}>
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 22, margin: "0 0 8px" }}>
          Template Overhaul Harness — {RESUME_TEMPLATES.length} templates
        </h1>
        <p style={{ margin: 0, color: "#64748b", fontSize: 13 }}>
          Hover a card to highlight it. Click cells for layout-only render.
        </p>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: 20,
        }}
      >
        {RESUME_TEMPLATES.map((t) => (
          <div
            key={t.id}
            style={{ borderRadius: 8, overflow: "hidden", boxShadow: "0 2px 8px rgba(15,23,42,.08)" }}
          >
            <div
              style={{
                padding: "6px 10px",
                background: "#0f172a",
                color: "#fff",
                fontSize: 12,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <strong>{t.name}</strong>
              <span style={{ opacity: 0.7 }}>{t.layoutId}</span>
            </div>
            <div className="sheen" style={{ background: "#fff" }}>
              <Resume
                data={SAMPLE_RESUME}
                templateId={t.id}
                settings={{ layoutId: t.layout, paletteId: t.palette, fontId: t.font }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Harness;
