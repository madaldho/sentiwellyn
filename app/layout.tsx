import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sentiwellyn — evidence-backed data reliability for DataHub",
  description:
    "Sentiwellyn scans DataHub metadata, estimates reliability risk from cited evidence, proposes safe metadata fixes, and verifies approved write-back.",
};

/**
 * Applied before first paint so the stored theme never flashes the wrong palette.
 * Kept inline and tiny on purpose: no dependency, no hydration round-trip.
 */
const themeBootstrap = `
(function () {
  try {
    var stored = localStorage.getItem('sentiwellyn-theme');
    var theme = stored || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    document.documentElement.dataset.theme = theme;
  } catch (e) {
    document.documentElement.dataset.theme = 'dark';
  }
})();
`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="dark" className="antialiased" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
