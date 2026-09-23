import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { withSection } from "./pdf-tokens";
import { findExtraByRef, kindFromRef } from "@features/resume/order";
import {
  htmlLines,
  rangeText,
  pdfContactParts,
  round,
} from "./pdf-utils";

export const Section = ({ t, heading, children, noRule, headingColor }) => (
  <View
    style={{
      marginTop: t.marginTop ?? 0,
      marginBottom: (t.marginBottom ?? 0) + t.sectionSpacing,
    }}
  >
    <View
      style={{
        flexDirection: "row",
        borderBottomWidth: noRule ? 0 : t.sectionRuleWidth,
        borderBottomColor: noRule ? "transparent" : t.rule,
        paddingBottom: Math.max(2, round(t.headingGap * 0.6)),
        marginBottom: t.headingGap,
      }}
    >
      <Text
        style={{
          fontSize: t.headingSize,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: t.headingLetterSpacing,
          color: headingColor || t.accent,
        }}
      >
        {heading}
      </Text>
    </View>
    <View wrap={true}>{children}</View>
  </View>
);

export const Rich = ({ t, html }) => {
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

export const skillsDots = (level) =>
  level > 0 ? "•".repeat(Math.min(5, Math.max(1, level))) : "";

const LevelDots = ({ t, level }) => {
  const n = Math.min(5, Math.max(0, Number(level) || 0));
  const size = t.levelDotSize;
  return (
    <View
      style={{
        flexDirection: "row",
        gap: t.levelDotGap,
      }}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <View
          key={i}
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: i < n ? t.accent : t.rule,
          }}
        />
      ))}
    </View>
  );
};

const LevelBar = ({ t, level, fillColor, trackColor }) => {
  const pct = Math.min(100, Math.max(0, ((Number(level) || 0) / 5) * 100));
  return (
    <View
      style={{
        flexBasis: `${t.levelBarWidth}%`,
        maxWidth: t.levelBarMax,
        height: t.levelBarHeight,
        backgroundColor: trackColor || t.rule,
        borderRadius: t.radiusSm,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          width: `${pct}%`,
          height: "100%",
          backgroundColor: fillColor || t.accent,
        }}
      />
    </View>
  );
};

// Screen parity: chips scale with --r-skill-size (0.9), bullets/columns with
// the section font, dot/bar labels with --r-skill-name-size (0.92).
const skillNameStyle = (t, ink, ratio = 1) => ({
  fontSize: ratio === "name" ? t.skillNameSize : ratio === "chip" ? t.skillSize : t.fontSize,
  color: ink || t.ink,
});

export const SkillsRow = ({ t, items, style = "chips", ink }) => {
  const list = (items || []).filter((item) => item.name);
  if (!list.length) return null;
  const textInk = ink || t.ink;

  if (style === "comma") {
    return (
      <Text style={{ ...skillNameStyle(t, textInk), lineHeight: t.lineHeight }}>
        {list.map((item) => item.name).join(", ")}
      </Text>
    );
  }

  if (style === "list") {
    return (
      <View style={{ gap: t.skillListGap }}>
        {list.map((item) => (
          <Text key={item.key || item.name} style={skillNameStyle(t, textInk)}>
            •  {item.name}
          </Text>
        ))}
      </View>
    );
  }

  if (style === "columns") {
    const mid = Math.ceil(list.length / 2);
    const cols = [list.slice(0, mid), list.slice(mid)];
    return (
      <View style={{ flexDirection: "row", gap: t.colGap }}>
        {cols.map((col, i) => (
          <View key={i} style={{ flex: 1, gap: t.skillListGap }}>
            {col.map((item) => (
              <Text
                key={item.key || item.name}
                style={skillNameStyle(t, textInk)}
              >
                •  {item.name}
              </Text>
            ))}
          </View>
        ))}
      </View>
    );
  }

  if (style === "dots") {
    return (
      <View style={{ gap: t.skillStackGap }}>
        {list.map((item) => (
          <View
            key={item.key || item.name}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              gap: t.skillRowGap,
            }}
          >
            <Text style={{ ...skillNameStyle(t, textInk, "name"), flex: 1 }}>
              {item.name}
            </Text>
            <LevelDots t={t} level={item.level} />
          </View>
        ))}
      </View>
    );
  }

  if (style === "bars") {
    return (
      <View style={{ gap: t.skillStackGap }}>
        {list.map((item) => (
          <View
            key={item.key || item.name}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: t.skillRowGap,
            }}
          >
            <Text
              style={{
                ...skillNameStyle(t, textInk, "name"),
                flex: 1,
              }}
            >
              {item.name}
            </Text>
            <LevelBar t={t} level={item.level} />
          </View>
        ))}
      </View>
    );
  }

  // chips (default)
  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        columnGap: t.chipColGap,
        rowGap: t.chipRowGap,
      }}
    >
      {list.map((item) => (
        <View
          key={item.key || item.name}
          style={{
            borderWidth: 1,
            borderColor: t.rule,
            borderRadius: t.radiusSm,
            paddingHorizontal: t.chipPadX,
            paddingVertical: t.chipPadY,
          }}
        >
          <Text style={skillNameStyle(t, textInk, "chip")}>{item.name}</Text>
        </View>
      ))}
    </View>
  );
};

export const Entry = ({
  t,
  title,
  org,
  location,
  dates,
  children,
  timeline,
  compact,
  below,
}) => {
  const gap = compact ? round(t.entryGap * 0.75) : t.entryGap;
  const titleNode = title ? (
    <Text
      style={{
        fontSize: compact ? t.compactTitleSize : t.entryTitleSize,
        fontWeight: 600,
        color: t.ink,
      }}
    >
      {title}
    </Text>
  ) : null;
  const orgNode = org ? (
    <Text
      style={{ fontSize: t.entryOrgSize, fontWeight: 400, color: t.muted }}
    >
      {org}
    </Text>
  ) : null;
  const metaSize = { fontSize: t.metaSize, color: t.muted, lineHeight: t.lineHeight };
  const datesNode = dates ? (
    <Text
      style={{
        ...metaSize,
        color: timeline ? t.accent : t.muted,
        fontWeight: timeline ? 600 : 400,
      }}
    >
      {dates}
    </Text>
  ) : null;
  const locationNode = location ? (
    <Text style={metaSize}>{location}</Text>
  ) : null;
  const rightCol = locationNode || datesNode ? (
    <View
      style={{
        flexShrink: 0,
        alignItems: "flex-end",
        gap: t.metaStackGap,
      }}
    >
      {locationNode}
      {datesNode}
    </View>
  ) : null;

  if (timeline) {
    return (
      <View style={{ marginBottom: gap }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            gap: t.colGap,
          }}
        >
          <View
            style={{
              width: "22%",
              minWidth: t.timelineRailMin,
              paddingTop: t.timelineRailTopPad,
            }}
          >
            {datesNode}
          </View>
          <View
            style={{
              flex: 1,
              paddingLeft: t.timelineContentInset,
              borderLeftWidth: t.timelineRailWidth,
              borderLeftColor: t.accentSoft,
            }}
          >
            {titleNode}
            {orgNode}
            {locationNode}
            {children}
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={{ marginBottom: gap }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "baseline",
        }}
      >
        <View style={{ flex: 1, paddingRight: t.colGap }}>
          {titleNode}
          {orgNode}
        </View>
        {rightCol}
      </View>
      {below}
      {children}
    </View>
  );
};

export const ContactLine = ({
  t,
  data,
  ink = t.muted,
  sep = t.contactSep || t.rule,
  align = "center",
}) => {
  const parts = pdfContactParts(data.pd, data.socialLinks);
  if (!parts.length) return null;
  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        columnGap: t.contactGapCol,
        rowGap: t.contactGapRow,
        alignItems: "center",
        justifyContent: align === "left" ? "flex-start" : "center",
      }}
    >
      {parts.map((part, i) => (
        <React.Fragment key={i}>
          <Text
            style={{
              fontSize: t.contactSize,
              color: ink,
              lineHeight: t.lineHeight,
            }}
          >
            {part}
          </Text>
          {i < parts.length - 1 ? (
            <Text style={{ color: sep, fontSize: t.contactSepSize }}>
              {" "}
              •{" "}
            </Text>
          ) : null}
        </React.Fragment>
      ))}
    </View>
  );
};

export const SectionHead = ({ t, heading, noRule }) => (
  <View
    style={{
      borderBottomWidth: noRule ? 0 : t.sectionRuleWidth,
      borderBottomColor: noRule ? "transparent" : t.rule,
      paddingBottom: Math.max(2, round(t.headingGap * 0.6)),
      marginBottom: t.headingGap,
    }}
  >
    <Text
      style={{
        fontSize: t.headingSize,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: t.headingLetterSpacing,
        color: t.accent,
      }}
    >
      {heading}
    </Text>
  </View>
);

/* ---------- Section-by-id renderer (matches DOM BuildSections) ---------- */

export const sectionNode = (id, { t, data, styles = {}, config }, opts) => {
  const experienceStyle = styles.experienceStyle || "standard";
  const skillStyle = styles.skillStyle || "chips";
  const languageStyle = styles.languageStyle || "dots";
  const timeline = experienceStyle === "timeline";
  const compact = experienceStyle === "compact";
  const ink = opts?.ink;
  // Per-section overrides recompute the scale for this section alone.
  const sectionT = withSection(t, config, config?.sectionStyles?.[id]);

  switch (id) {
    case "summary":
      return (
        <Section key={id} t={sectionT} heading="Summary" noRule={opts?.noRule}>
          <Rich t={sectionT} html={data.summary} />
        </Section>
      );
    case "experience":
      return (
        <Section key={id} t={sectionT} heading="Experience" noRule={opts?.noRule}>
          {(data.experience || [])
            .filter(
              (entry) =>
                entry.positionTitle || entry.companyName || entry.workSummary,
            )
            .map((entry, i) => (
              <Entry
                key={entry.key ?? i}
                t={sectionT}
                title={entry.positionTitle}
                org={entry.companyName}
                location={entry.location}
                dates={rangeText(
                  entry.startDate,
                  entry.endDate,
                  entry.disabledendDate,
                )}
                timeline={timeline}
                compact={compact}
              >
                <Rich t={sectionT} html={entry.workSummary} />
              </Entry>
            ))}
        </Section>
      );
    case "education":
      return (
        <Section key={id} t={sectionT} heading="Education" noRule={opts?.noRule}>
          {(data.education || [])
            .filter(
              (entry) =>
                entry.schoolName || entry.degree || entry.educationSummary,
            )
            .map((entry, i) => (
              <Entry
                key={entry.key ?? i}
                t={sectionT}
                title={[entry.degree, entry.fieldOfStudy].filter(Boolean).join(", ")}
                org={entry.schoolName}
                location={entry.location}
                dates={rangeText(
                  entry.startDate,
                  entry.endDate,
                  entry.disabledendDate,
                )}
                timeline={timeline}
                compact={compact}
              >
                <Rich t={sectionT} html={entry.educationSummary} />
              </Entry>
            ))}
        </Section>
      );
    case "skills":
      return (
        <Section key={id} t={sectionT} heading="Skills" noRule={opts?.noRule}>
          <SkillsRow t={sectionT} items={data.skills} style={skillStyle} ink={ink} />
        </Section>
      );
    default: {
      const extra = findExtraByRef(data.extras || [], id);
      const items = (extra?.data || []).filter(Boolean);
      const kind = kindFromRef(id, data.extras || []);
      const heading =
        (extra?.title && String(extra.title).trim()) ||
        (kind === 1 ? "Custom Section" : id);

      if (kind === 5) {
        return (
          <Section key={id} t={sectionT} heading="Languages" noRule={opts?.noRule}>
            <SkillsRow
              t={sectionT}
              items={items}
              style={languageStyle}
              ink={ink}
            />
          </Section>
        );
      }

      if (kind === 7) {
        const hasLevels = items.some((item) => Number(item.level) > 0);
        return (
          <Section key={id} t={sectionT} heading={heading} noRule={opts?.noRule}>
            <SkillsRow
              t={sectionT}
              items={items}
              style={hasLevels ? languageStyle : "chips"}
              ink={ink}
            />
          </Section>
        );
      }

      if (kind === 1 || kind === 2) {
        return (
          <Section key={id} t={sectionT} heading={heading} noRule={opts?.noRule}>
            {items.map((item, i) => (
              <View key={item.key ?? i} style={{ marginBottom: sectionT.entryGap }}>
                {item.title ? (
                  <Text
                    style={{
                      fontSize: sectionT.entryTitleSize,
                      fontWeight: 600,
                      color: sectionT.ink,
                    }}
                  >
                    {item.title}
                  </Text>
                ) : null}
                <Rich t={sectionT} html={item.description} />
              </View>
            ))}
          </Section>
        );
      }

      if (kind === 3) {
        return (
          <Section key={id} t={sectionT} heading={heading} noRule={opts?.noRule}>
            {items.map((item, i) => (
              <Entry
                key={item.key ?? i}
                t={sectionT}
                title={item.role}
                org={item.organization}
                location={item.location}
                dates={rangeText(
                  item.startDate,
                  item.endDate,
                  item.current || item.disabledendDate,
                )}
              >
                <Rich t={sectionT} html={item.description} />
              </Entry>
            ))}
          </Section>
        );
      }

      if (kind === 4) {
        return (
          <Section key={id} t={sectionT} heading={heading} noRule={opts?.noRule}>
            {items.map((item, i) => (
              <Entry
                key={item.key ?? i}
                t={sectionT}
                title={item.name}
                org={item.issuer}
                dates={item.date || ""}
                below={
                  <>
                    {item.credentialId ? (
                      <Text
                        style={{
                          fontSize: sectionT.certMetaSize,
                          color: sectionT.muted,
                          marginTop: sectionT.referenceMarginTop,
                        }}
                      >
                        ID: {item.credentialId}
                      </Text>
                    ) : null}
                    {item.url ? (
                      <Text
                        style={{
                          fontSize: sectionT.certMetaSize,
                          color: sectionT.accent,
                          marginTop: sectionT.certMarginTop,
                        }}
                      >
                        Verify
                      </Text>
                    ) : null}
                  </>
                }
              />
            ))}
          </Section>
        );
      }

      if (kind === 6) {
        return (
          <Section key={id} t={sectionT} heading={heading} noRule={opts?.noRule}>
            {items.map((item, i) => (
              <Entry
                key={item.key ?? i}
                t={sectionT}
                title={item.name}
                below={
                  <>
                    {(item.role || item.organization) ? (
                      <Text
                        style={{
                          fontSize: sectionT.referenceMetaSize,
                          color: sectionT.muted,
                          marginTop: sectionT.referenceMarginTop,
                        }}
                      >
                        {[item.role, item.organization].filter(Boolean).join(" · ")}
                      </Text>
                    ) : null}
                    {(item.email || item.phone) ? (
                      <Text
                        style={{
                          fontSize: sectionT.referenceMetaSize,
                          color: sectionT.muted,
                          marginTop: sectionT.referenceMarginTop,
                        }}
                      >
                        {[item.email, item.phone].filter(Boolean).join(" · ")}
                      </Text>
                    ) : null}
                  </>
                }
              />
            ))}
          </Section>
        );
      }

      return (
        <Section key={id} t={sectionT} heading={heading} noRule={opts?.noRule}>
          {null}
        </Section>
      );
    }
  }
};