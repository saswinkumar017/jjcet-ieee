// import type { Metadata } from "next";
// import "./globals.css";
// import { AuthProvider } from "@/lib/AuthContext";
// import { ThemeProvider } from "@/lib/theme";

// export const metadata: Metadata = {
//   title: "JJCET IEEE Student Branch",
//   description: "J.J. College of Engineering and Technology (Autonomous) IEEE Student Branch - IEEE Chapter Website",
//   keywords: ["IEEE", "JJCET", "Engineering", "Student Branch", "Technology"],
// };

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html lang="en">
//       <head>
//         <link rel="icon" href="/favicon.png" type="image/png" />
//       </head>
//       <body className="bg-background text-foreground antialiased">
//         <ThemeProvider>
//           <AuthProvider>
//             {children}
//           </AuthProvider>
//         </ThemeProvider>
//       </body>
//     </html>
//   );
// }
import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/AuthContext";
import { ThemeProvider } from "@/lib/theme";
import Script from "next/script";

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
        <link rel="icon" href="/favicon.png" type="image/png" />

        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-SWBBLHQS0S"
          strategy="afterInteractive"
        />

        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-SWBBLHQS0S');
          `}
        </Script>

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