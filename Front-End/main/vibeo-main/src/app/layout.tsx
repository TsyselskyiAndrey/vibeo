import type { Metadata } from "next";
import Script from "next/script";
import Providers from "@/providers/Providers";
import { Orbitron, Inter } from "next/font/google";
import "./globals.css";
import ThemeToggle from "@/features/theme/components/ThemeToggle/ThemeToggle";
import AnimatedBackground from "@/components/effects/AnimatedBackground/AnimatedBackground";

const orbitron = Orbitron({ subsets: ["latin"], weight: ["700", "900"], variable: "--font-orbitron" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const themeInitScript = `
(function() {
  try {
    var stored = localStorage.getItem('theme');
    var isManual = localStorage.getItem('theme-manual') === 'true';
    var theme = (stored === 'dark' || stored === 'light') && isManual
      ? stored
      : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {}
})();
`;

export const metadata: Metadata = {
  title: "Vibeo",
  description: "Video-hosting platform with a focus on privacy and security. Watch videos without ads, tracking, or censorship.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${orbitron.variable} ${inter.variable}`} suppressHydrationWarning>
      <body>
        <Script id="theme-init" strategy="beforeInteractive">
          {themeInitScript}
        </Script>
        <Providers>
          <ThemeToggle />
          <AnimatedBackground variant="random" />
          {children}
        </Providers>
      </body>
    </html>
  );
}
