import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "RequestHub | 社内申請ポータル",
  description: "SharePointとつながる、わかりやすい社内申請・承認ポータル。",
  metadataBase: new URL("https://requesthub.example.com"),
  openGraph: {
    title: "RequestHub | 社内申請ポータル",
    description: "申請業務を、もっとスマートに。",
    type: "website",
    images: [{ url: "https://requesthub.example.com/og.png", width: 1730, height: 909, alt: "RequestHub — 申請業務を、もっとスマートに。" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "RequestHub | 社内申請ポータル",
    description: "申請業務を、もっとスマートに。",
    images: ["https://requesthub.example.com/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${notoSansJP.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
