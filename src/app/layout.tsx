import type { Metadata } from "next";
import "@fontsource-variable/plus-jakarta-sans";
import "./globals.css";
import { APYEA_LOGO_ALT, APYEA_LOGO_SRC } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Andhra Pradesh Yoga Educators Association (APYEA)",
  description:
    "APYEA is a professional platform bringing together qualified Yoga teachers, educators, researchers and practitioners across Andhra Pradesh.",
  icons: {
    icon: APYEA_LOGO_SRC,
    apple: APYEA_LOGO_SRC,
  },
  openGraph: {
    title: "APYEA",
    description:
      "Andhra Pradesh Yoga Educators Association — professional unity for Yoga teachers and educators.",
    images: [{ url: APYEA_LOGO_SRC, alt: APYEA_LOGO_ALT }],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
