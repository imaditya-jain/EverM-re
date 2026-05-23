import type { Metadata } from "next";
import { Sora, Inter } from "next/font/google";
import "./styles/globals.css";
import StoreProvider from "./providers/StoreProvider";
import { ToastContainer } from "react-toastify";
import AuthSessionProvide from "./providers/auth-session-provider";

const sora = Sora({
  weight:['100', '200', '300', '400', '500', '600', '700', '800' ],
  variable: "--font-sora"
})

const inter = Inter({
  weight:['100', '200', '300', '400', '500', '600', '700', '800', '900' ],
  variable: "--font-inter"
})

export const metadata: Metadata = {
  title: "StorePilot AI | AI Shopify Growth Platform",
  description: "Optimize Shopify SEO, product syncs, and store workflows with AI.",
  icons: {
    icon: "/favicon.ico?v=storepilot-ai",
    shortcut: "/favicon.ico?v=storepilot-ai",
    apple: "/images/favicon192.png?v=storepilot-ai",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${sora.variable} ${inter.variable}  antialiased`}>
        <StoreProvider>
          <AuthSessionProvide>
            <ToastContainer />
            {children}
          </AuthSessionProvide>
        </StoreProvider>
      </body>
    </html>
  );
}
