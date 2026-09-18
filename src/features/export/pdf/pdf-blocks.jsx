import React from "react";
import { View, Text } from "@react-pdf/renderer";
import {
  htmlLines,
  rangeText,
  pdfContactParts,
  round,
} from "./pdf-utils";

export const Section = ({ t, heading, children, noRule, headingColor }) => (
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
  const size = round(t.fontSize * 0.45);
  return (
    <View style={{ flexDirection: "row", gap: round(size * 0.45) }}>
      {Array.from({ length: 5 }, (_, i) => (
        <View
          key={i}
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: i < n ? t.accent : t.accentSoft,
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
        flex: 1,
        height: round(t.fontSize * 0.45),
        backgroundColor: trackColor || t.accentSoft,
        borderRadius: 2,
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

const skillNameStyle = (t, ink) => ({
  fontSize: round(t.fontSize * 0.9),
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
      <View style={{ gap: round(t.richGap * 0.8) }}>
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
          <View key={i} style={{ flex: 1, gap: round(t.richGap * 0.8) }}>
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
      <View style={{ gap: round(t.richGap) }}>
        {list.map((item) => (
          <View
            key={item.key || item.name}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              gap: round(t.colGap * 0.4),
            }}
          >
            <Text style={{ ...skillNameStyle(t, textInk), flex: 1 }}>
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
      <View style={{ gap: round(t.richGap) }}>
        {list.map((item) => (
          <View
            key={item.key || item.name}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: round(t.colGap * 0.5),
            }}
          >
            <Text
              style={{
                ...skillNameStyle(t, textInk),
                width: "38%",
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
        gap: round(t.colGap * 0.35),
      }}
    >
      {list.map((item) => (
        <View
          key={item.key || item.name}
          style={{
            borderWidth: 1,
            borderColor: t.rule,
            borderRadius: 3,
            paddingHorizontal: round(t.fontSize * 0.45),
            paddingVertical: round(t.fontSize * 0.2),
          }}
        >
          <Text style={skillNameStyle(t, textInk)}>{item.name}</Text>
        </View>
      ))}
    </View>
  );
};

export const Entry = ({
  t,
  title,
  org,
  meta,
  dates,
  children,
  timeline,
  compact,
}) => {
  const gap = compact ? round(t.entryGap * 0.75) : t.entryGap;
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
      <View style={{ marginBottom: gap }}>
        <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
          <View style={{ width: "22%", paddingRight: t.colGap * 0.5 }}>
            {datesNode}
          </View>
          <View
            style={{
              flex: 1,
              paddingLeft: t.colGap * 0.65,
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
    <View style={{ marginBottom: gap }}>
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

export const ContactLine = ({
  t,
  data,
  ink = t.muted,
  sep = t.rule,
  align = "center",
}) => {
  const parts = pdfContactParts(data.pd, data.socialLinks);
  if (!parts.length) return null;
  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 4,
        alignItems: "center",
        justifyContent: align === "left" ? "flex-start" : "center",
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

export const SectionHead = ({ t, heading, noRule }) => (
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

/* ---------- Section-by-id renderer (matches DOM BuildSections) ---------- */

export const sectionNode = (id, { t, data, styles = {} }, opts) => {
  const experienceStyle = styles.experienceStyle || "standard";
  const skillStyle = styles.skillStyle || "chips";
  const languageStyle = styles.languageStyle || "dots";
  const timeline = experienceStyle === "timeline";
  const compact = experienceStyle === "compact";
  const ink = opts?.ink;

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
                timeline={timeline}
                compact={compact}
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
                timeline={timeline}
                compact={compact}
              >
                <Rich t={t} html={entry.educationSummary} />
              </Entry>
            ))}
        </Section>
      );
    case "skills":
      return (
        <Section key={id} t={t} heading="Skills" noRule={opts?.noRule}>
          <SkillsRow t={t} items={data.skills} style={skillStyle} ink={ink} />
        </Section>
      );
    default: {
      const extra = (data.extras || []).find(
        (section) => `extra:${section.id}` === id,
      );
      const items = (extra?.data || []).filter(Boolean);
      const heading =
        (extra?.title && String(extra.title).trim()) ||
        (id === "extra:1" ? "Custom Section" : id);

      if (id === "extra:5") {
        return (
          <Section key={id} t={t} heading="Languages" noRule={opts?.noRule}>
            <SkillsRow
              t={t}
              items={items}
              style={languageStyle}
              ink={ink}
            />
          </Section>
        );
      }

      if (id === "extra:7") {
        const hasLevels = items.some((item) => Number(item.level) > 0);
        return (
          <Section key={id} t={t} heading={heading} noRule={opts?.noRule}>
            <SkillsRow
              t={t}
              items={items}
              style={hasLevels ? languageStyle : "chips"}
              ink={ink}
            />
          </Section>
        );
      }

      if (id === "extra:1" || id === "extra:2") {
        return (
          <Section key={id} t={t} heading={heading} noRule={opts?.noRule}>
            {items.map((item, i) => (
              <View key={item.key ?? i} style={{ marginBottom: t.entryGap }}>
                {item.title ? (
                  <Text
                    style={{
                      fontSize: t.fontSize,
                      fontWeight: 700,
                      color: t.ink,
                    }}
                  >
                    {item.title}
                  </Text>
                ) : null}
                <Rich t={t} html={item.description} />
              </View>
            ))}
          </Section>
        );
      }

      if (id === "extra:3") {
        return (
          <Section key={id} t={t} heading={heading} noRule={opts?.noRule}>
            {items.map((item, i) => (
              <Entry
                key={item.key ?? i}
                t={t}
                title={item.role}
                org={item.organization}
                meta={item.location}
                dates={rangeText(
                  item.startDate,
                  item.endDate,
                  item.current || item.disabledendDate,
                )}
              >
                <Rich t={t} html={item.description} />
              </Entry>
            ))}
          </Section>
        );
      }

      if (id === "extra:4") {
        return (
          <Section key={id} t={t} heading={heading} noRule={opts?.noRule}>
            {items.map((item, i) => (
              <Entry
                key={item.key ?? i}
                t={t}
                title={item.name}
                org={item.issuer}
                meta={[item.credentialId, item.url].filter(Boolean).join(" · ")}
                dates={item.date || ""}
              />
            ))}
          </Section>
        );
      }

      if (id === "extra:6") {
        return (
          <Section key={id} t={t} heading={heading} noRule={opts?.noRule}>
            {items.map((item, i) => (
              <Entry
                key={item.key ?? i}
                t={t}
                title={item.name}
                org={[item.role, item.organization].filter(Boolean).join(" · ")}
                meta={[item.email, item.phone].filter(Boolean).join(" · ")}
              />
            ))}
          </Section>
        );
      }

      return (
        <Section key={id} t={t} heading={heading} noRule={opts?.noRule}>
          {null}
        </Section>
      );
    }
  }
};
