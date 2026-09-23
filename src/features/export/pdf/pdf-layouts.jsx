import React from "react";
import { Page, View } from "@react-pdf/renderer";
import { sectionNode } from "./pdf-blocks";
import {
  HeaderBand,
  HeaderClassic,
  SidebarIdentity,
  contentPad,
  niceHeader,
} from "./pdf-headers";
import {
  columnsSplit,
  columnsWithSide,
} from "@features/resume/order";
import { round } from "./pdf-utils";

/* ---------- Column helpers ---------- */

const stylesFromConfig = (config = {}) => ({
  skillStyle: config.skillStyle || "chips",
  languageStyle: config.languageStyle || "dots",
  experienceStyle: config.experienceStyle || "standard",
});

const makeCtx = (t, data, config, overrides = {}) => ({
  t,
  data,
  config,
  styles: stylesFromConfig(config),
  ...overrides,
});

export const renderColumn = (ids, ctx, opts = {}) => (
  <View>{ids.map((id) => sectionNode(id, ctx, opts))}</View>
);

const isBand = (config) =>
  config?.headerStyle === "band" || config?.headerStyle === "color";

const sideToneStyle = (t, tone, reverse) => {
  if (tone === "dark") {
    return {
      backgroundColor: t.accent,
      paddingHorizontal: round(t.sidebarBleedPadX),
      paddingVertical: t.sidebarBleedPadY,
    };
  }
  if (tone === "accent") {
    return {
      backgroundColor: t.surface,
      paddingHorizontal: round(t.sidebarPadX),
      paddingVertical: round(t.sidebarPadY),
      ...(reverse
        ? { borderRightWidth: t.accentBarWidth, borderRightColor: t.accent }
        : { borderLeftWidth: t.accentBarWidth, borderLeftColor: t.accent }),
    };
  }
  // light
  return {
    backgroundColor: t.surface,
    borderRadius: t.radiusSm,
    paddingHorizontal: round(t.sidebarPadX),
    paddingVertical: round(t.sidebarPadY),
  };
};

/* ---------- Layouts ---------- */

export const SingleLayout = ({ data, ids, t, config }) => {
  const band = isBand(config);
  const ctx = makeCtx(t, data, config);
  return (
    <Page size="A4" style={{ fontFamily: t.fontFamily, backgroundColor: t.bg }}>
      {niceHeader(config, data, t)}
      <View style={contentPad(t, band ? t.sectionSpacing : 0)}>
        {renderColumn(ids, ctx)}
      </View>
    </Page>
  );
};

const darkSidebarTokens = (t) => ({
  ...t,
  ink: t.accentInk,
  muted: t.accentInk,
  accent: t.accentInk,
  accentSoft: "rgba(255,255,255,0.35)",
  rule: "rgba(255,255,255,0.28)",
});

const SidebarLayoutBase = ({ data, ids, t, config, reverse = false }) => {
  const [side, main] = columnsWithSide(ids, config?.sectionCols, data?.extras || []);
  const tone = config?.sidebarTone || "light";
  const darkIdentity = tone === "dark";
  const band = isBand(config);
  const ctx = makeCtx(t, data, config);
  const sideT = darkIdentity ? darkSidebarTokens(t) : t;
  const sideCtx = makeCtx(sideT, data, config);
  const sideOpts = { noRule: darkIdentity || tone === "accent" };

  const sideCol = (
    <View
      style={{
        width: `${t.sidebarWidth}%`,
        flexGrow: 0,
        flexShrink: 0,
        ...sideToneStyle(t, tone, reverse),
      }}
    >
      {darkIdentity ? <SidebarIdentity t={t} data={data} config={config} /> : null}
      {renderColumn(side, sideCtx, sideOpts)}
    </View>
  );
  const mainCol = (
    <View
      style={{
        flex: 1,
        ...(darkIdentity
          ? {
              paddingVertical: t.padY,
              // Outer edge only — gap (t.colGap) spaces sidebar ↔ main.
              ...(reverse
                ? { paddingLeft: t.padX, paddingRight: 0 }
                : { paddingLeft: 0, paddingRight: t.padX }),
            }
          : {}),
      }}
    >
      {renderColumn(main, ctx)}
    </View>
  );

  return (
    <Page size="A4" style={{ fontFamily: t.fontFamily, backgroundColor: t.bg }}>
      {!darkIdentity ? niceHeader(config, data, t) : null}
      {darkIdentity ? (
        <View style={{ flexDirection: "row", flexGrow: 1, gap: t.colGap }}>
          {reverse ? (
            <>
              {mainCol}
              {sideCol}
            </>
          ) : (
            <>
              {sideCol}
              {mainCol}
            </>
          )}
        </View>
      ) : (
        <View style={contentPad(t, band ? t.sectionSpacing : 0)}>
          <View style={{ flexDirection: "row", gap: t.colGap }}>
            {reverse ? (
              <>
                {mainCol}
                {sideCol}
              </>
            ) : (
              <>
                {sideCol}
                {mainCol}
              </>
            )}
          </View>
        </View>
      )}
    </Page>
  );
};

export const SidebarLayout = (props) => (
  <SidebarLayoutBase {...props} reverse={false} />
);

export const SidebarRightLayout = (props) => (
  <SidebarLayoutBase {...props} reverse={true} />
);

export const SplitLayout = ({ data, ids, t, config }) => {
  const [left, right] = columnsSplit(ids, config?.sectionCols);
  const band = isBand(config);
  const center = (config?.headerAlign || "left") === "center";
  const ctx = makeCtx(t, data, config);

  const header = band ? (
    <HeaderBand t={t} data={data} config={config} center={center} />
  ) : (
    <View style={contentPad(t)}>
      <HeaderClassic
        t={t}
        data={data}
        config={config}
        center={center}
        headerStyle={config?.headerStyle || "plain"}
      />
    </View>
  );

  return (
    <Page size="A4" style={{ fontFamily: t.fontFamily, backgroundColor: t.bg }}>
      {header}
      <View style={contentPad(t, band ? t.sectionSpacing : 0)}>
        <View style={{ flexDirection: "row", gap: t.colGap }}>
          <View style={{ flex: 1 }}>{renderColumn(left, ctx)}</View>
          <View
            style={{
              flex: 1,
              borderLeftWidth: t.sectionRuleWidth,
              borderLeftColor: t.rule,
            }}
          >
            {renderColumn(right, ctx)}
          </View>
        </View>
      </View>
    </Page>
  );
};

/* ---------- Registry (compositional layout ids only) ---------- */

export const PDF_LAYOUTS = {
  single: SingleLayout,
  sidebar: SidebarLayout,
  "sidebar-right": SidebarRightLayout,
  split: SplitLayout,
};
