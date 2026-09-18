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
  styles: stylesFromConfig(config),
  ...overrides,
});

export const renderColumn = (ids, ctx, opts = {}) => (
  <View>{ids.map((id) => sectionNode(id, ctx, opts))}</View>
);

export const columnsWithSide = (ids) => {
  const side = ids.filter(
    (id) => id === "summary" || id === "skills" || /^extra:/.test(id),
  );
  const main = ids.filter((id) => !side.includes(id));
  return [side, main];
};

export const columnsSplit = (ids) => {
  const left = ids.filter((id) => id === "summary" || id === "experience");
  const right = ids.filter((id) => !left.includes(id));
  return [left, right];
};

const isBand = (config) =>
  config?.headerStyle === "band" || config?.headerStyle === "color";

const sideToneStyle = (t, tone, reverse) => {
  if (tone === "dark") {
    return {
      backgroundColor: t.accent,
      padding: round(t.padX * 0.85),
      paddingVertical: t.padY,
    };
  }
  if (tone === "accent") {
    return {
      backgroundColor: t.surface,
      padding: round(t.padX * 0.7),
      paddingVertical: round(t.padY * 0.8),
      ...(reverse
        ? { borderRightWidth: 3, borderRightColor: t.accent }
        : { borderLeftWidth: 3, borderLeftColor: t.accent }),
    };
  }
  // light
  return {
    backgroundColor: t.surface,
    borderRadius: 4,
    padding: round(t.padX * 0.7),
    paddingVertical: round(t.padY * 0.75),
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
  const [side, main] = columnsWithSide(ids);
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
        flex: 0.72,
        ...sideToneStyle(t, tone, reverse),
      }}
    >
      {darkIdentity ? <SidebarIdentity t={t} data={data} /> : null}
      {renderColumn(side, sideCtx, sideOpts)}
    </View>
  );
  const mainCol = (
    <View
      style={{
        flex: 1.28,
        ...(darkIdentity
          ? { padding: t.padX, paddingVertical: t.padY }
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
        <View style={{ flexDirection: "row", flexGrow: 1 }}>
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
  const [left, right] = columnsSplit(ids);
  const band = isBand(config);
  const center = (config?.headerAlign || "left") === "center";
  const ctx = makeCtx(t, data, config);

  const header = band ? (
    <HeaderBand t={t} data={data} center={center} />
  ) : (
    <View style={contentPad(t)}>
      <HeaderClassic
        t={t}
        data={data}
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
              borderLeftWidth: 1,
              borderLeftColor: t.rule,
              paddingLeft: t.colGap,
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
