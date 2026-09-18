import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { ContactLine } from "./pdf-blocks";
import { round } from "./pdf-utils";

export const contentPad = (t, top) => ({
  paddingLeft: t.padX,
  paddingRight: t.padX,
  paddingTop: top ?? t.padY,
  paddingBottom: t.padY,
});

const NameBlock = ({
  t,
  data,
  center,
  nameColor,
  titleColor,
  contactInk,
  contactSep,
  nameRatio = 1,
  contactAlign,
}) => {
  const name =
    [data.pd.firstName, data.pd.lastName].filter(Boolean).join(" ") ||
    "Your Name";
  return (
    <View style={center ? { alignItems: "center" } : undefined}>
      <Text
        style={{
          fontSize: round(t.nameSize * nameRatio),
          fontWeight: 700,
          lineHeight: 1.15,
          letterSpacing: 0.3,
          color: nameColor || t.accent,
        }}
      >
        {name}
      </Text>
      <Text
        style={{
          fontSize: round(t.fontSize * 0.95),
          fontWeight: 600,
          color: titleColor || t.accentSoft,
          marginTop: 3,
          marginBottom: 6,
        }}
      >
        {data.pd.designation || "Job Title"}
      </Text>
      <ContactLine
        t={t}
        data={data}
        ink={contactInk || t.muted}
        sep={contactSep || t.rule}
        align={contactAlign || (center ? "center" : "left")}
      />
    </View>
  );
};

/** Classic header with plain / rule / double / accent treatments. */
export const HeaderClassic = ({
  t,
  data,
  center = false,
  headerStyle = "rule",
  nameRatio = 1,
}) => {
  const isDouble = headerStyle === "double";
  const isAccent = headerStyle === "accent";
  const isPlain = headerStyle === "plain";
  const rule = isPlain || isAccent ? 0 : isDouble ? 3 : 2;

  return (
    <View
      style={{
        borderBottomWidth: rule,
        borderBottomColor: isDouble ? t.accent : t.rule,
        borderLeftWidth: isAccent ? 4 : 0,
        borderLeftColor: t.accent,
        paddingLeft: isAccent ? round(t.colGap * 0.55) : 0,
        paddingBottom: isPlain || isAccent ? 0 : round(t.sectionSpacing * 0.5),
        marginBottom: t.sectionSpacing,
        ...(center ? { alignItems: "center" } : {}),
      }}
    >
      <NameBlock t={t} data={data} center={center} nameRatio={nameRatio} />
    </View>
  );
};

export const HeaderMinimal = ({ t, data }) => {
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

export const HeaderBand = ({ t, data, surface = false, center = true }) => (
  <View
    style={{
      backgroundColor: surface ? t.surface : t.accent,
      paddingVertical: t.padY,
      paddingHorizontal: t.padX,
      alignItems: center ? "center" : "flex-start",
    }}
  >
    <NameBlock
      t={t}
      data={data}
      center={center}
      nameColor={surface ? t.accent : t.accentInk}
      titleColor={surface ? t.accentSoft : t.accentInk}
      contactInk={surface ? t.muted : t.accentInk}
      contactSep={surface ? t.rule : t.accentInk}
      contactAlign={center ? "center" : "left"}
    />
  </View>
);

/** In-sidebar identity for dark sidebar tone. */
export const SidebarIdentity = ({ t, data }) => (
  <View style={{ marginBottom: t.sectionSpacing }}>
    <NameBlock
      t={t}
      data={data}
      center={false}
      nameColor={t.accentInk}
      titleColor={t.accentInk}
      contactInk={t.accentInk}
      contactSep={t.accentInk}
      contactAlign="left"
      nameRatio={0.85}
    />
  </View>
);

/** Resolve headerStyle + headerAlign into the right header component. */
export const niceHeader = (config, data, t) => {
  const style = config?.headerStyle || "plain";
  const center = (config?.headerAlign || "left") === "center";
  const band = style === "band" || style === "color";

  if (band) {
    return <HeaderBand t={t} data={data} center={center} />;
  }

  return (
    <View style={contentPad(t)}>
      <HeaderClassic
        t={t}
        data={data}
        center={center}
        headerStyle={style === "normal" ? "plain" : style}
      />
    </View>
  );
};
