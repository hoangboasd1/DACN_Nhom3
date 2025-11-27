import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { ChatProvider } from "../components/chat/ChatProvider";
import { CartProvider } from "../contexts/CartContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LazyShop",
  description: "Your one-stop shop for fashion",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 2000,
            style: {
              background: '#ffffff',
              color: '#000000',
              border: '1px solid #e5e7eb',
              borderRadius: '0px',
              fontSize: '14px',
              fontWeight: '400',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            },
            success: {
              style: {
                background: '#ffffff',
                color: '#000000',
                border: '1px solid #000000',
              },
              iconTheme: {
                primary: '#000000',
                secondary: '#ffffff',
              },
            },
            error: {
              style: {
                background: '#ffffff',
                color: '#000000',
                border: '1px solid #ef4444',
              },
              iconTheme: {
                primary: '#ef4444',
                secondary: '#ffffff',
              },
              duration: 3000,
            },
          }}
        />
        <ChatProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </ChatProvider>
      </body>
    </html>
  );
}
