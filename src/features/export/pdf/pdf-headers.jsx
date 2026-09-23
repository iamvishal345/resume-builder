import React from "react";
import { View, Text, Image } from "@react-pdf/renderer";
import { ContactLine } from "./pdf-blocks";
import { withSection } from "./pdf-tokens";
import { round } from "./pdf-utils";

export const contentPad = (t, top) => ({
  paddingLeft: t.padX,
  paddingRight: t.padX,
  paddingTop: top ?? t.padY,
  paddingBottom: t.padY,
});

const showPhotoOf = (data, config) =>
  Boolean(data?.pd?.photoDataUrl) && config?.showPhoto !== false;

const PhotoBadge = ({ t, data, config, inkBorder }) => {
  if (!showPhotoOf(data, config)) return null;
  const size = Math.max(40, round(t.photoSize || 72));
  return (
    <Image
      src={data.pd.photoDataUrl}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        objectFit: "cover",
        borderWidth: Math.max(1, round(t.photoBorder || 2)),
        borderColor: inkBorder || t.accent,
        flexShrink: 0,
      }}
    />
  );
};

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
          lineHeight: t.nameLineHeight,
          letterSpacing: t.nameLetterSpacing,
          color: nameColor || t.accent,
        }}
      >
        {name}
      </Text>
      <Text
        style={{
          fontSize: t.titleSize,
          fontWeight: 600,
          color: titleColor || t.accentSoft,
          marginTop: round(t.titleMarginTop),
          marginBottom: round(t.titleMarginBottom),
        }}
      >
        {data.pd.designation || "Job Title"}
      </Text>
      <ContactLine
        t={t}
        data={data}
        ink={contactInk || t.muted}
        sep={contactSep || t.contactSep || t.rule}
        align={contactAlign || (center ? "center" : "left")}
      />
    </View>
  );
};

const HeaderWithPhoto = ({ t, data, config, center, children, inkBorder }) => {
  const photo = showPhotoOf(data, config) ? (
    <PhotoBadge t={t} data={data} config={config} inkBorder={inkBorder} />
  ) : null;
  if (!photo) return children;
  if (center) {
    return (
      <View style={{ alignItems: "center", gap: round(t.headerPhotoGap || 14) }}>
        {photo}
        {children}
      </View>
    );
  }
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "flex-start",
        gap: round(t.headerPhotoGap || 14),
      }}
    >
      {photo}
      <View style={{ flex: 1, minWidth: 0 }}>{children}</View>
    </View>
  );
};

/** Classic header with plain / rule / double / accent treatments. */
export const HeaderClassic = ({
  t,
  data,
  config,
  center = false,
  headerStyle = "rule",
  nameRatio = 1,
}) => {
  const isDouble = headerStyle === "double";
  const isAccent = headerStyle === "accent";
  const isPlain = headerStyle === "plain";
  const rule = isPlain ? 0 : isDouble ? t.headerDoubleWidth : t.headerRuleWidth;

  return (
    <View
      style={{
        borderBottomWidth: rule,
        borderBottomColor: isDouble || rule ? t.accent : t.rule,
        borderLeftWidth: isAccent ? t.accentBarWidth : 0,
        borderLeftColor: t.accent,
        paddingLeft: isAccent ? round(t.accentBarInset) : 0,
        paddingBottom: isAccent ? 0 : round(t.headerPad),
        marginBottom: t.sectionSpacing,
        ...(center ? { alignItems: "center" } : {}),
      }}
    >
      <HeaderWithPhoto t={t} data={data} config={config} center={center}>
        <NameBlock t={t} data={data} center={center} nameRatio={nameRatio} />
      </HeaderWithPhoto>
    </View>
  );
};

export const HeaderMinimal = ({ t, data, config }) => {
  const name =
    [data.pd.firstName, data.pd.lastName].filter(Boolean).join(" ") ||
    "Your Name";
  return (
    <View style={{ marginBottom: t.sectionSpacing }}>
      <HeaderWithPhoto t={t} data={data} config={config} center={false}>
        <View>
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
              marginTop: round(t.titleMarginTop),
            }}
          >
            {data.pd.designation || "Job Title"}
          </Text>
          <View
            style={{
              borderTopWidth: t.sectionRuleWidth,
              borderBottomWidth: t.sectionRuleWidth,
              borderColor: t.rule,
              paddingVertical: round(t.darkContactPadY),
              marginTop: round(t.darkContactMarginY),
            }}
          >
            <ContactLine t={t} data={data} />
          </View>
        </View>
      </HeaderWithPhoto>
    </View>
  );
};

export const HeaderBand = ({
  t,
  data,
  config,
  surface = false,
  center = true,
}) => (
  <View
    style={{
      backgroundColor: surface ? t.surface : t.accent,
      paddingVertical: t.padY,
      paddingHorizontal: t.padX,
      alignItems: center ? "center" : "flex-start",
    }}
  >
    <HeaderWithPhoto
      t={t}
      data={data}
      config={config}
      center={center}
      inkBorder={surface ? t.accent : t.accentInk}
    >
      <NameBlock
        t={t}
        data={data}
        center={center}
        nameColor={surface ? t.accent : t.accentInk}
        titleColor={surface ? t.accentSoft : t.accentInk}
        contactInk={surface ? t.muted : t.accentInk}
        contactSep={surface ? t.contactSep || t.rule : t.accentInk}
        contactAlign={center ? "center" : "left"}
      />
    </HeaderWithPhoto>
  </View>
);

/** In-sidebar identity for dark sidebar tone. */
export const SidebarIdentity = ({ t, data, config }) => (
  <View style={{ marginBottom: t.sectionSpacing }}>
    <HeaderWithPhoto
      t={t}
      data={data}
      config={config}
      center={false}
      inkBorder={t.accentInk}
    >
      <NameBlock
        t={t}
        data={data}
        center={false}
        nameColor={t.accentInk}
        titleColor={t.accentInk}
        contactInk={t.accentInk}
        contactSep={t.accentInk}
        contactAlign="left"
      />
    </HeaderWithPhoto>
  </View>
);

/** Resolve headerStyle + headerAlign into the right header component. */
export const niceHeader = (config, data, t) => {
  const style = config?.headerStyle || "plain";
  const center = (config?.headerAlign || "left") === "center";
  const band = style === "band" || style === "color";
  const ht = withSection(t, config, config?.sectionStyles?.header);

  if (band) {
    return <HeaderBand t={ht} data={data} config={config} center={center} />;
  }

  return (
    <View style={contentPad(t)}>
      <HeaderClassic
        t={ht}
        data={data}
        config={config}
        center={center}
        headerStyle={style === "normal" ? "plain" : style}
      />
    </View>
  );
};
