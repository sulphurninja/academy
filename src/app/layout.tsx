import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ZapAcademy · Build your AI marketing agency",
  description:
    "8 weeks. Real clients. Real revenue. The gamified academy that turns Zaptick power-users into ₹1 Cr/year AI marketing agencies.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_ACADEMY_URL || "https://academy.zaptick.io"
  ),
  openGraph: {
    title: "ZapAcademy · Build your AI marketing agency",
    description:
      "8 weeks. Real clients. Real revenue. Co-presented with Meta. Win ₹1,00,000 in the Zaptick Showdown.",
    type: "website",
  },
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased bg-slate-50 text-slate-900 selection:bg-emerald-200/60 selection:text-emerald-900">
        {children}
      </body>
    </html>
  );
}
