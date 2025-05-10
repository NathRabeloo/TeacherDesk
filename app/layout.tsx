import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "@/app/components/theme-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Teacher Desk",
  description: "Software desenvolvido pela equipe SearchBytes, FATEC Sorocaba 2025",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider 
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <main className="min-h-screen flex flex-col items-center w-full"> 
            <div className="flex-1 w-full flex flex-col items-center overflow-y-auto overflow-x-hidden"> 
              <div className="flex flex-col w-full">
                {children}
              </div>
              {/* <Toaster /> */}
            </div>

          </main>

        </ThemeProvider>
      </body>
    </html>
  );
}