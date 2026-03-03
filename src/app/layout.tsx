import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/layout/navigation";
import { ToastProvider } from "@/components/ui/toast";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "My Life",
  description: "My Life app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="bg-slate-50 min-h-screen pb-20 md:pb-0">
          <ToastProvider>
            <Navigation />
            {children}
          </ToastProvider>
        </div>
      </body>
    </html>
  );
}
