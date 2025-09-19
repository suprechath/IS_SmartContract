// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import { Web3Provider } from "@/contexts/Web3Provider";
import { Header } from "@/components/Header";
import { AuthProvider } from "@/contexts/AuthProvider"; // Import the new provider


const inter = Inter({ subsets: ["latin"]});

export const metadata: Metadata = {
  title: "CommEfficient",
  description: "Crowdfunding for Energy Efficiency",
};

export default function RootLayout({children}: Readonly<{children: React.ReactNode;}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Web3Provider>
          <AuthProvider>
            <Header />
            {children}
          </AuthProvider>
        </Web3Provider> 
      </body>
    </html>
  );
}
