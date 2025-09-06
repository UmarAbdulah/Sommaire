import type { Metadata } from "next";
import { Source_Sans_3  as FontSans } from "next/font/google";
import "./globals.css";

const fontSans = FontSans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight : ["200","300","400","500","600","700","800","900"]
});

export const metadata: Metadata = {
  title: "Sommaire - AI-Powered PDF Summarization",
  description: "Save hours of reading time with AI-powered PDF summarization.Transform Lengthy PDFs into Concise AND Accurate Summaries in Seconds with out advance AI technology.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${fontSans.variable} font-sans  antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
