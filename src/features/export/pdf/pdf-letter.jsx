import React from "react";
import { Document, Page, View, Text } from "@react-pdf/renderer";
import { registerPdfFonts, PDF_FONTS } from "./fonts";
import { htmlLines } from "./pdf-utils";
import { SITE } from "@data/site";
import { resolvePaper } from "@features/resume/paper";

registerPdfFonts();

const today = () =>
  new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const LINE_HEIGHT = 1.65;

export const PdfLetter = ({
  personalDetails = {},
  socialLinks = [],
  coverLetter = { recipient: "", body: "" },
  fontId = "sans",
  paperSize = "a4",
}) => {
  const pd = personalDetails;
  const name = [pd.firstName, pd.lastName].filter(Boolean).join(" ") || "";
  const contact = [
    pd.email,
    pd.contactNumber,
    [pd.city, pd.state].filter(Boolean).join(", "),
  ].filter(Boolean);
  const social = (socialLinks || [])
    .map((link) => link.value || link.descriptionValue)
    .filter(Boolean);
  const contactLine = [...contact, ...social].join("  ·  ");

  const fontFamily = PDF_FONTS[fontId] || PDF_FONTS.sans;
  const ink = "#111827";
  const muted = "#374151";
  const faint = "#6b7280";
  const accent = "#1e3a8a";
  const pageSize = resolvePaper(paperSize).pdf;

  return (
    <Document
      author={name || "Letter"}
      creator={SITE.name}
      producer={SITE.name}
      title="Cover letter"
      subject={name ? `Cover letter — ${name}` : "Cover letter"}
    >
      <Page
        size={pageSize}
        style={{
          fontFamily,
          fontSize: 13.5,
          lineHeight: LINE_HEIGHT,
          color: ink,
          paddingTop: 48,
          paddingBottom: 48,
          paddingLeft: 60,
          paddingRight: 60,
          backgroundColor: "#ffffff",
        }}
      >
        {name ? (
          <View
            style={{
              borderBottomWidth: 2,
              borderBottomColor: accent,
              paddingBottom: 14,
              marginBottom: 12,
            }}
          >
            <Text style={{ fontSize: 19, fontWeight: 700, color: ink }}>
              {name}
            </Text>
            {pd.designation ? (
              <Text style={{ fontSize: 12.5, color: muted }}>
                {pd.designation}
              </Text>
            ) : null}
            {contactLine ? (
              <Text style={{ fontSize: 12, color: faint, marginTop: 2 }}>
                {contactLine}
              </Text>
            ) : null}
          </View>
        ) : null}
        <Text style={{ color: muted, marginTop: 14 }}>{today()}</Text>
        {coverLetter.recipient ? (
          <Text style={{ color: muted, marginTop: 14 }}>
            {coverLetter.recipient}
          </Text>
        ) : null}
        <View style={{ marginTop: 16, gap: 12 }}>
          {htmlLines(coverLetter.body).map((line, i) => (
            <Text key={i} style={{ color: ink, marginBottom: 12 }}>
              {line.type === "bullet" ? `•  ${line.text}` : line.text}
            </Text>
          ))}
        </View>
        <View style={{ marginTop: 24 }}>
          <Text style={{ color: muted }}>Sincerely,</Text>
          <Text
            style={{ color: ink, fontWeight: 600, fontSize: 14, marginTop: 6 }}
          >
            {name || "Your name"}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default PdfLetter;
