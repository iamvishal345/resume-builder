import React from "react";
import { Document, Page, View, Text } from "@react-pdf/renderer";
import { getPalette } from "@features/resume/palettes";
import { getFont } from "@features/resume/fonts";
import { resolveTemplate } from "@features/resume/templates";
import { RESUME_STYLE_DEFAULTS, clamp } from "@features/resume/style";
import { availableSections, effectiveOrder } from "@features/resume/order";
import { registerPdfFonts, PDF_FONTS } from "./fonts";
import { SITE } from "@data/site";

registerPdfFonts();

const round = (value) => Math.round(value);

const decodeHtml = (value = "") =>
  value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"');

// Converts simple rich text (exported by the editor as <p>/<ul> HTML) into
// printable paragraphs and bullet lines.
export const htmlLines = (html) => {
  const text = decodeHtml(html || "");
  if (!text.trim()) return [];
  const out = [];
  text.replace(/<(p|li)[^>]*>([\s\S]*?)<\/\1>/gi, (match, tag, inner) => {
    const clean = inner.replace(/<[^>]*>/g, "").trim();
    if (clean)
      out.push({ type: tag === "li" ? "bullet" : "para", text: clean });
    return match;
  });
  if (!out.length) {
    const clean = text
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (clean) out.push({ type: "para", text: clean });
  }
  return out;
};

export const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
};

export const rangeText = (start, end, disabledEnd) => {
  const from = formatDate(start);
  const to = disabledEnd || end === "Present" ? "Present" : formatDate(end);
  if (!from && !to) return "";
  return [from, to].filter(Boolean).join(" – ");
};

export const pdfContactParts = (pd, socialLinks) => {
  const location = [pd.address, pd.city, pd.state, pd.country, pd.pinCode]
    .filter(Boolean)
    .join(", ");
  return [
    pd.email,
    pd.contactNumber,
    location,
    ...socialLinks.map((link) =>
      link.value ? `${link.descriptionValue || "Link"}: ${link.value}` : "",
    ),
  ].filter(Boolean);
};

// Runtime token model mirroring buildResumeStyle (style.js) so the PDF matches
// the on-screen preview: same colors, rhythm and density scale.
const pdfTokens = ({ palette, font, settings }) => {
  const density = settings.density === "dense";
  const s = density ? 0.88 : 1;
  const fontSize = round(clamp(settings.fontSize, 11, 18) * s);
  const sectionSpacing = round(clamp(settings.sectionSpacing, 8, 28) * s);
  const lineHeight = clamp(settings.lineHeight, 1.15, 1.9);
  return {
    accent: settings.primaryColor || palette.accent,
    accentSoft: palette.accentSoft,
    accentInk: palette.accentInk,
    ink: settings.textColor || palette.ink,
    muted: palette.muted,
    rule: palette.rule,
    surface: palette.surface,
    bg: settings.bgColor || "#ffffff",
    fontFamily: PDF_FONTS[font.id] || PDF_FONTS.sans,
    fontSize,
    lineHeight,
    sectionSpacing,
    entryGap: round(sectionSpacing * 0.72),
    headingGap: round(sectionSpacing * 0.45),
    richGap: round(sectionSpacing * 0.28),
    padX: round(26 * s),
    padY: round(30 * s),
    colGap: round(24 * s),
    nameSize: round(27 * s),
  };
};

/* ---------- Shared pieces ---------- */

const Section = ({ t, heading, children, noRule }) => (
  <View style={{ marginBottom: t.sectionSpacing }}>
    <View
      style={{
        flexDirection: "row",
        borderBottomWidth: noRule ? 0 : 1,
        borderBottomColor: noRule ? "transparent" : t.rule,
        paddingBottom: Math.max(2, round(t.headingGap * 0.6)),
        marginBottom: t.headingGap,
      }}
    >
      <Text
        style={{
          fontSize: round(t.fontSize * 0.86),
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: round(t.fontSize * 0.12),
          color: t.accent,
        }}
      >
        {heading}
      </Text>
    </View>
    <View wrap={true}>{children}</View>
  </View>
);

const Rich = ({ t, html }) => {
  const lines = htmlLines(html);
  if (!lines.length) return null;
  return (
    <View style={{ gap: t.richGap, marginTop: t.richGap }}>
      {lines.map((line, i) => (
        <Text
          key={i}
          style={{
            fontSize: t.fontSize,
            lineHeight: t.lineHeight,
            color: t.ink,
          }}
        >
          {line.type === "bullet" ? `•  ${line.text}` : line.text}
        </Text>
      ))}
    </View>
  );
};

const skillsDots = (level) =>
  level > 0 ? "•".repeat(Math.min(5, Math.max(1, level))) : "";

const SkillsRow = ({ t, items }) => {
  const list = (items || []).filter((item) => item.name);
  if (!list.length) return null;
  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        gap: round(t.colGap * 0.4),
      }}
    >
      {list.map((item) => (
        <Text
          key={item.key || item.name}
          style={{ fontSize: round(t.fontSize * 0.9), color: t.ink }}
        >
          {item.name}
          {skillsDots(item.level) ? (
            <Text
              style={{
                fontSize: round(t.fontSize * 0.65),
                letterSpacing: 1.4,
                color: t.accentSoft,
              }}
            >
              {" "}
              {skillsDots(item.level)}
            </Text>
          ) : null}
        </Text>
      ))}
    </View>
  );
};

const Entry = ({ t, title, org, meta, dates, children, timeline }) => {
  const titleNode = (
    <Text style={{ fontSize: t.fontSize, fontWeight: 600, color: t.ink }}>
      {title}
      {org ? (
        <Text style={{ fontWeight: 400, color: t.muted }}>, {org}</Text>
      ) : null}
    </Text>
  );
  const metaNode = meta ? (
    <Text
      style={{
        fontSize: round(t.fontSize * 0.88),
        color: t.muted,
        marginTop: 1,
      }}
    >
      {meta}
    </Text>
  ) : null;
  const datesNode = dates ? (
    <Text
      style={{
        fontSize: round(t.fontSize * 0.88),
        color: timeline ? t.accent : t.muted,
        fontWeight: timeline ? 600 : 400,
      }}
    >
      {dates}
    </Text>
  ) : null;

  if (timeline) {
    return (
      <View style={{ marginBottom: t.entryGap }}>
        <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
          <View style={{ width: "22%", paddingRight: t.colGap * 0.5 }}>
            {datesNode}
          </View>
          <View
            style={{
              flex: 1,
              paddingLeft: t.colGap,
              borderLeftWidth: 2,
              borderLeftColor: t.accentSoft,
            }}
          >
            {titleNode}
            {metaNode}
            {children}
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={{ marginBottom: t.entryGap }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "baseline",
        }}
      >
        <View style={{ flex: 1, paddingRight: t.colGap }}>{titleNode}</View>
        <View style={{ flexShrink: 0 }}>{datesNode}</View>
      </View>
      {metaNode}
      {children}
    </View>
  );
};

/* ---------- Section-by-id renderer (matches DOM BuildSections) ---------- */

const sectionNode = (id, { t, data }, opts) => {
  switch (id) {
    case "summary":
      return (
        <Section key={id} t={t} heading="Summary" noRule={opts?.noRule}>
          <Rich t={t} html={data.summary} />
        </Section>
      );
    case "experience":
      return (
        <Section key={id} t={t} heading="Experience" noRule={opts?.noRule}>
          {(data.experience || [])
            .filter(
              (entry) =>
                entry.positionTitle || entry.companyName || entry.workSummary,
            )
            .map((entry, i) => (
              <Entry
                key={entry.key ?? i}
                t={t}
                title={entry.positionTitle}
                org={
                  entry.positionTitle && entry.companyName
                    ? entry.companyName
                    : ""
                }
                meta={[
                  entry.positionTitle ? "" : entry.companyName,
                  entry.location,
                ]
                  .filter(Boolean)
                  .join(" · ")}
                dates={rangeText(
                  entry.startDate,
                  entry.endDate,
                  entry.disabledendDate,
                )}
              >
                <Rich t={t} html={entry.workSummary} />
              </Entry>
            ))}
        </Section>
      );
    case "education":
      return (
        <Section key={id} t={t} heading="Education" noRule={opts?.noRule}>
          {(data.education || [])
            .filter(
              (entry) =>
                entry.schoolName || entry.degree || entry.educationSummary,
            )
            .map((entry, i) => (
              <Entry
                key={entry.key ?? i}
                t={t}
                title={
                  [entry.degree, entry.fieldOfStudy]
                    .filter(Boolean)
                    .join(", ") +
                  (entry.schoolName ? ` — ${entry.schoolName}` : "")
                }
                meta={entry.location}
                dates={rangeText(
                  entry.startDate,
                  entry.endDate,
                  entry.disabledendDate,
                )}
              >
                <Rich t={t} html={entry.educationSummary} />
              </Entry>
            ))}
        </Section>
      );
    case "skills":
      return (
        <Section key={id} t={t} heading="Skills" noRule={opts?.noRule}>
          <SkillsRow t={t} items={data.skills} />
        </Section>
      );
    default: {
      const extra = (data.extras || []).find(
        (section) => `extra:${section.id}` === id,
      );
      if (id === "extra:5") {
        return (
          <Section key={id} t={t} heading="Languages" noRule={opts?.noRule}>
            <SkillsRow t={t} items={extra?.data} />
          </Section>
        );
      }
      return (
        <Section
          key={id}
          t={t}
          heading={extra?.title || id}
          noRule={opts?.noRule}
        >
          {null}
        </Section>
      );
    }
  }
};

const renderColumn = (ids, ctx, opts = {}) => (
  <View>{ids.map((id) => sectionNode(id, ctx, opts))}</View>
);

/* ---------- Headers ---------- */

const ContactLine = ({ t, data, ink = t.muted, sep = t.rule }) => {
  const parts = pdfContactParts(data.pd, data.socialLinks);
  if (!parts.length) return null;
  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 4,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {parts.map((part, i) => (
        <React.Fragment key={i}>
          <Text
            style={{
              fontSize: round(t.fontSize * 0.88),
              color: ink,
              lineHeight: 1.35,
            }}
          >
            {part}
          </Text>
          {i < parts.length - 1 ? (
            <Text style={{ color: sep, fontSize: round(t.fontSize * 0.75) }}>
              {" "}
              •{" "}
            </Text>
          ) : null}
        </React.Fragment>
      ))}
    </View>
  );
};

const HeaderClassic = ({ t, data, center, rule = 2, nameRatio = 1 }) => {
  const name =
    [data.pd.firstName, data.pd.lastName].filter(Boolean).join(" ") ||
    "Your Name";
  return (
    <View
      style={{
        borderBottomWidth: rule,
        borderBottomColor: t.rule,
        paddingBottom: round(t.sectionSpacing * 0.5),
        marginBottom: t.sectionSpacing,
        ...(center ? { alignItems: "center" } : {}),
      }}
    >
      <Text
        style={{
          fontSize: round(t.nameSize * nameRatio),
          fontWeight: 700,
          lineHeight: 1.15,
          letterSpacing: 0.3,
          color: t.accent,
        }}
      >
        {name}
      </Text>
      <Text
        style={{
          fontSize: round(t.fontSize * 0.95),
          fontWeight: 600,
          color: t.accentSoft,
          marginTop: 3,
          marginBottom: 6,
        }}
      >
        {data.pd.designation || "Job Title"}
      </Text>
      <ContactLine t={t} data={data} />
    </View>
  );
};

const HeaderMinimal = ({ t, data }) => {
  const name =
    [data.pd.firstName, data.pd.lastName].filter(Boolean).join(" ") ||
    "Your Name";
  return (
    <View style={{ marginBottom: t.sectionSpacing }}>
      <Text
        style={{
          fontSize: round(t.nameSize * 0.92),
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: round(t.nameSize * 0.06),
          color: t.accent,
        }}
      >
        {name}
      </Text>
      <Text
        style={{
          fontSize: round(t.fontSize * 0.82),
          fontWeight: 500,
          textTransform: "uppercase",
          letterSpacing: round(t.fontSize * 0.14),
          color: t.accentSoft,
          marginTop: 4,
        }}
      >
        {data.pd.designation || "Job Title"}
      </Text>
      <View
        style={{
          borderTopWidth: 1,
          borderBottomWidth: 1,
          borderColor: t.rule,
          paddingVertical: round(t.fontSize * 0.5),
          marginTop: round(t.fontSize * 0.55),
        }}
      >
        <ContactLine t={t} data={data} />
      </View>
    </View>
  );
};

const HeaderBand = ({ t, data, surface = false }) => (
  <View
    style={{
      backgroundColor: surface ? t.surface : t.accent,
      paddingVertical: t.padY,
      paddingHorizontal: t.padX,
      alignItems: "center",
    }}
  >
    <Text
      style={{
        fontSize: t.nameSize,
        fontWeight: 700,
        lineHeight: 1.15,
        color: surface ? t.accent : t.accentInk,
      }}
    >
      {[data.pd.firstName, data.pd.lastName].filter(Boolean).join(" ") ||
        "Your Name"}
    </Text>
    <Text
      style={{
        fontSize: round(t.fontSize * 0.95),
        fontWeight: 600,
        color: surface ? t.accentSoft : t.accentInk,
        opacity: 0.85,
        marginTop: 3,
        marginBottom: 6,
      }}
    >
      {data.pd.designation || "Job Title"}
    </Text>
    <ContactLine
      t={t}
      data={data}
      ink={surface ? t.muted : t.accentInk}
      sep={surface ? t.rule : t.accentInk}
    />
  </View>
);

/* ---------- Column helpers ---------- */

const columnsWithSide = (ids) => {
  const side = ids.filter(
    (id) => id === "summary" || id === "skills" || /^extra:/.test(id),
  );
  const main = ids.filter((id) => !side.includes(id));
  return [side, main];
};

const columnsSplit = (ids) => {
  const left = ids.filter((id) => id === "summary" || id === "experience");
  const right = ids.filter((id) => !left.includes(id));
  return [left, right];
};

/* ---------- Layouts ---------- */

const contentPad = (t, top) => ({
  paddingLeft: t.padX,
  paddingRight: t.padX,
  paddingTop: top ?? t.padY,
  paddingBottom: t.padY,
});

// Classic header used above both single-column and two-column layouts.
const niceHeader = (config, data, t) =>
  config.headerStyle === "color" ? (
    <HeaderBand t={t} data={data} />
  ) : (
    <View style={contentPad(t)}>
      <HeaderClassic
        t={t}
        data={data}
        center={config.headerStyle !== "color"}
      />
    </View>
  );

const SingleColumnBody = ({ ids, t, data }) => renderColumn(ids, { t, data });

const SingleLayout = ({ data, ids, t, config }) => {
  const band = config.headerStyle === "color";
  return (
    <Page size="A4" style={{ fontFamily: t.fontFamily, backgroundColor: t.bg }}>
      {niceHeader(config, data, t)}
      <View style={contentPad(t, band ? t.sectionSpacing : 0)}>
        <SingleColumnBody ids={ids} t={t} data={data} />
      </View>
    </Page>
  );
};

const MinimalLayout = ({ data, ids, t, config }) => {
  const band = config.headerStyle === "color";
  return (
    <Page size="A4" style={{ fontFamily: t.fontFamily, backgroundColor: t.bg }}>
      {band ? (
        <HeaderBand t={t} data={data} />
      ) : (
        <View style={contentPad(t)}>
          <HeaderMinimal t={t} data={data} />
        </View>
      )}
      <View style={contentPad(t, band ? t.sectionSpacing : 0)}>
        <SingleColumnBody ids={ids} t={t} data={data} />
      </View>
    </Page>
  );
};

const BandLayout = ({ data, ids, t }) => (
  <Page size="A4" style={{ fontFamily: t.fontFamily, backgroundColor: t.bg }}>
    <HeaderBand t={t} data={data} />
    <View style={contentPad(t, t.sectionSpacing)}>
      <SingleColumnBody ids={ids} t={t} data={data} />
    </View>
  </Page>
);

const TwoColumnLayout = ({
  data,
  ids,
  t,
  config,
  surface,
  noRule,
  headerRatio,
}) => {
  const band = config.headerStyle === "color";
  const [side, main] = columnsWithSide(ids);
  return (
    <Page size="A4" style={{ fontFamily: t.fontFamily, backgroundColor: t.bg }}>
      {band ? (
        <HeaderBand t={t} data={data} />
      ) : (
        <View style={contentPad(t)}>
          <HeaderClassic
            t={t}
            data={data}
            center={false}
            rule={headerRatio ? 3 : 2}
            nameRatio={headerRatio || 1}
          />
        </View>
      )}
      <View style={contentPad(t)}>
        <View style={{ flexDirection: "row", gap: t.colGap }}>
          <View
            style={{
              flex: 0.72,
              ...(surface
                ? {
                    backgroundColor: t.surface,
                    borderRadius: round(
                      (t.fontSize / 14) * (headerRatio ? 10 : 6),
                    ),
                    padding: round(t.padX * 0.8),
                  }
                : {
                    borderLeftWidth: 1,
                    borderLeftColor: t.rule,
                    paddingLeft: t.colGap,
                  }),
            }}
          >
            {renderColumn(side, { t, data }, { noRule })}
          </View>
          <View style={{ flex: 1.28 }}>{renderColumn(main, { t, data })}</View>
        </View>
      </View>
    </Page>
  );
};

const SidebarLayout = ({ data, ids, t, config }) =>
  TwoColumnLayout({ data, ids, t, config, surface: true });

const ModernLayout = ({ data, ids, t, config }) =>
  TwoColumnLayout({
    data,
    ids,
    t,
    config,
    surface: true,
    noRule: true,
    headerRatio: 1.12,
  });

const SplitLayout = ({ data, ids, t, config }) => {
  const [left, right] = columnsSplit(ids);
  return (
    <Page size="A4" style={{ fontFamily: t.fontFamily, backgroundColor: t.bg }}>
      <HeaderBand t={t} data={data} surface />
      <View style={contentPad(t, t.sectionSpacing)}>
        <View style={{ flexDirection: "row", gap: t.colGap }}>
          <View style={{ flex: 1.28 }}>{renderColumn(left, { t, data })}</View>
          <View
            style={{
              flex: 0.72,
              borderLeftWidth: 1,
              borderLeftColor: t.rule,
              paddingLeft: t.colGap,
            }}
          >
            {renderColumn(right, { t, data })}
          </View>
        </View>
      </View>
    </Page>
  );
};

const TimelineLayout = ({ data, ids, t, config }) => {
  const band = config.headerStyle === "color";
  const railEntry = (id) => {
    const isExp = id === "experience";
    const base = data[id === "experience" ? "experience" : "education"];
    const ok = (entry) =>
      isExp
        ? entry.positionTitle || entry.companyName || entry.workSummary
        : entry.schoolName || entry.degree || entry.educationSummary;
    return (
      <View key={id} style={{ marginBottom: t.sectionSpacing }}>
        <SectionHead t={t} heading={isExp ? "Experience" : "Education"} />
        {(base || []).filter(ok).map((entry, i) => (
          <Entry
            key={entry.key ?? i}
            t={t}
            title={
              isExp
                ? entry.positionTitle
                : [entry.degree, entry.fieldOfStudy]
                    .filter(Boolean)
                    .join(", ") +
                  (entry.schoolName ? ` — ${entry.schoolName}` : "")
            }
            org={isExp && entry.companyName ? entry.companyName : ""}
            meta={entry.location}
            dates={rangeText(
              entry.startDate,
              entry.endDate,
              entry.disabledendDate,
            )}
            timeline
          >
            <Rich
              t={t}
              html={isExp ? entry.workSummary : entry.educationSummary}
            />
          </Entry>
        ))}
      </View>
    );
  };
  return (
    <Page size="A4" style={{ fontFamily: t.fontFamily, backgroundColor: t.bg }}>
      {niceHeader(config, data, t)}
      <View style={contentPad(t, band ? t.sectionSpacing : 0)}>
        {ids.map((id) =>
          id === "experience" || id === "education"
            ? railEntry(id)
            : sectionNode(id, { t, data }),
        )}
      </View>
    </Page>
  );
};

const SectionHead = ({ t, heading, noRule }) => (
  <View
    style={{
      borderBottomWidth: noRule ? 0 : 1,
      borderBottomColor: noRule ? "transparent" : t.rule,
      paddingBottom: Math.max(2, round(t.headingGap * 0.6)),
      marginBottom: t.headingGap,
    }}
  >
    <Text
      style={{
        fontSize: round(t.fontSize * 0.86),
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: round(t.fontSize * 0.12),
        color: t.accent,
      }}
    >
      {heading}
    </Text>
  </View>
);

/* ---------- Registry ---------- */

const PDF_LAYOUTS = {
  single: SingleLayout,
  minimal: MinimalLayout,
  sidebar: SidebarLayout,
  topband: BandLayout,
  split: SplitLayout,
  modern: ModernLayout,
  timeline: TimelineLayout,
};

export const PdfResume = ({
  data,
  templateId,
  paletteId,
  fontId,
  settings,
}) => {
  const template = resolveTemplate(templateId);
  const palette = getPalette(paletteId ?? template.palette);
  const font = getFont(fontId ?? template.font);
  const merged = { ...RESUME_STYLE_DEFAULTS, ...settings };
  const t = pdfTokens({ palette, font, settings: merged });
  const layoutId = settings?.layoutId || template.layout;
  const Layout = PDF_LAYOUTS[layoutId] || PDF_LAYOUTS.single;
  const available = availableSections(data);
  const ids = effectiveOrder(
    settings?.sectionOrder,
    available.map((entry) => entry.id),
    data,
  );
  const info = {
    author:
      [data.pd.firstName, data.pd.lastName].filter(Boolean).join(" ") ||
      "Resume",
    title: "Resume",
  };
  return (
    <Document
      author={info.author}
      creator={SITE.name}
      producer={SITE.name}
      title={info.title}
      subject={info.title}
    >
      <Layout
        data={data}
        ids={ids}
        t={t}
        config={{ headerStyle: merged.headerStyle, density: merged.density }}
      />
    </Document>
  );
};

export default PdfResume;
