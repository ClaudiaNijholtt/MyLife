import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/layout/navigation";
import { ToastProvider } from "@/components/ui/toast";
import { AuthProvider } from "@/lib/auth/context";

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
        <AuthProvider>
          <Navigation />
          <div className="bg-slate-50 min-h-screen pb-20 md:pb-0">
            <ToastProvider>
              {children}
            </ToastProvider>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
