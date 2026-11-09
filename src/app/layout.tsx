import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: {
    default: "Pixelspace AI Classroom",
    template: "%s · Pixelspace AI Classroom",
  },
  description:
    "Platform pembelajaran AI untuk sekolah rendah dan menengah Malaysia.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ms" className={`${poppins.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-xl focus:border focus:border-border focus:bg-card focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:shadow-soft-lg"
        >
          Langkau ke kandungan utama
        </a>
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
