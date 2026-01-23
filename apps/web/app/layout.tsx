import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "../components/theme-provider";

const geistMono = localFont({
  src: "../fonts/Geist_Mono/GeistMono-VariableFont_wght.ttf",
  variable: "--font-geistmono-regular",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Stroke",
  description: "Can you draw a perfect circle?",
  openGraph: {
    title: "Stroke",
    description: "Can you draw a perfect circle?",
    images: [
      {
        url: "/preview.png",
        width: 1200,
        height: 630,
        alt: "Stroke - Perfect Circle Challenge",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Stroke",
    description: "Can you draw a perfect circle?",
    images: ["/preview.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistMono.className}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
