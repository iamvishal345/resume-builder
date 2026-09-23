// Single source of truth for site-level metadata.
// Canonical URLs, Open Graph, robots.txt, and sitemap.xml all derive from here.
// Set `url` to the real production domain before launch.
export const SITE = {
  name: "Cavren",
  legalName: "Cavren",
  tagline: "Build a resume that gets you hired.",
  description:
    "A fast, free, and private resume builder. Guided sections, live preview, and honest PDF or DOCX export — no sign-up, no tracking, data stays on your device.",
  url: "https://resume-builder.example.com",
  email: "findvishalsharma@gmail.com",
  ownerName: "Vishal Sharma",
  bmcUrl: "https://buymeacoffee.com/findvishal",
  bmcQr: "/bmc_qr.png",
  ogImage: "/og.svg",
  twitter: "@cavren",
};

export const routes = [
  { path: "/", priority: "1.0" },
  { path: "/features", priority: "0.9" },
  { path: "/about", priority: "0.5" },
  { path: "/privacy", priority: "0.3" },
  { path: "/contact", priority: "0.5" },
];
