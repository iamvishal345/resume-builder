import { Font } from "@react-pdf/renderer";
// @ts-nocheck — Vite ?inline returns a base64 data-URL string for the asset.
// Uses .woff (not .woff2): fontkit 2.0.4 cannot embed the .woff2 builds of
// these families ("Offset is outside the bounds of the DataView"); .woff
// parses and embeds reliably.
import figtree400 from "@fontsource/figtree/files/figtree-latin-400-normal.woff?inline";
import figtree500 from "@fontsource/figtree/files/figtree-latin-500-normal.woff?inline";
import figtree600 from "@fontsource/figtree/files/figtree-latin-600-normal.woff?inline";
import figtree700 from "@fontsource/figtree/files/figtree-latin-700-normal.woff?inline";
import grotesk400 from "@fontsource/space-grotesk/files/space-grotesk-latin-400-normal.woff?inline";
import grotesk500 from "@fontsource/space-grotesk/files/space-grotesk-latin-500-normal.woff?inline";
import grotesk600 from "@fontsource/space-grotesk/files/space-grotesk-latin-600-normal.woff?inline";
import grotesk700 from "@fontsource/space-grotesk/files/space-grotesk-latin-700-normal.woff?inline";
import lora400 from "@fontsource/lora/files/lora-latin-400-normal.woff?inline";
import lora500 from "@fontsource/lora/files/lora-latin-500-normal.woff?inline";
import lora600 from "@fontsource/lora/files/lora-latin-600-normal.woff?inline";
import lora700 from "@fontsource/lora/files/lora-latin-700-normal.woff?inline";
import playfair400 from "@fontsource/playfair-display/files/playfair-display-latin-400-normal.woff?inline";
import playfair500 from "@fontsource/playfair-display/files/playfair-display-latin-500-normal.woff?inline";
import playfair600 from "@fontsource/playfair-display/files/playfair-display-latin-600-normal.woff?inline";
import playfair700 from "@fontsource/playfair-display/files/playfair-display-latin-700-normal.woff?inline";
import slab400 from "@fontsource/roboto-slab/files/roboto-slab-latin-400-normal.woff?inline";
import slab500 from "@fontsource/roboto-slab/files/roboto-slab-latin-500-normal.woff?inline";
import slab600 from "@fontsource/roboto-slab/files/roboto-slab-latin-600-normal.woff?inline";
import slab700 from "@fontsource/roboto-slab/files/roboto-slab-latin-700-normal.woff?inline";

// Maps the resume font ids (fonts.js) to PDF families. `serif` uses the PDF
// built-in Times-Roman so no asset is needed, matching the "Classic Serif"
// Georgia/Times fallback of the DOM preview.
export const PDF_FONTS = {
  sans: "Figtree",
  grotesk: "Space Grotesk",
  serif: "Times-Roman",
  elegant: "Lora",
  display: "Playfair Display",
  slab: "Roboto Slab",
};

let registered = false;

export const registerPdfFonts = () => {
  if (registered) return;
  registered = true;
  const reg = (family, src, fontWeight) =>
    Font.register({ family, src, fontWeight });

  reg("Figtree", figtree400, 400);
  reg("Figtree", figtree500, 500);
  reg("Figtree", figtree600, 600);
  reg("Figtree", figtree700, 700);

  reg("Space Grotesk", grotesk400, 400);
  reg("Space Grotesk", grotesk500, 500);
  reg("Space Grotesk", grotesk600, 600);
  reg("Space Grotesk", grotesk700, 700);

  reg("Lora", lora400, 400);
  reg("Lora", lora500, 500);
  reg("Lora", lora600, 600);
  reg("Lora", lora700, 700);

  reg("Playfair Display", playfair400, 400);
  reg("Playfair Display", playfair500, 500);
  reg("Playfair Display", playfair600, 600);
  reg("Playfair Display", playfair700, 700);

  reg("Roboto Slab", slab400, 400);
  reg("Roboto Slab", slab500, 500);
  reg("Roboto Slab", slab600, 600);
  reg("Roboto Slab", slab700, 700);
};

registerPdfFonts();