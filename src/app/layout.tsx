import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/AuthContext";
import { ThemeProvider } from "@/lib/theme";

export const metadata: Metadata = {
  title: "JJCET IEEE Student Branch",
  description: "J.J. College of Engineering and Technology (Autonomous) IEEE Student Branch - IEEE Chapter Website",
  keywords: ["IEEE", "JJCET", "Engineering", "Student Branch", "Technology"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className="bg-background text-foreground antialiased">
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
