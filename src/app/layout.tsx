import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RUN HUB | 대한민국 모든 마라톤 일정",
  description: "전국 마라톤 대회를 가장 트렌디하고 편리하게 탐색하세요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        {children}
        <Script
          src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAPS_CLIENT_ID}&libraries=services&autoload=false`}
          strategy="beforeInteractive"
        />
      </body>
    </html>
  );
}
