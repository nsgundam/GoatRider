import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans"; // ใช้ชื่อที่ถูกต้องตาม Library
import { GeistMono } from "geist/font/mono"; // ใช้ชื่อที่ถูกต้องตาม Library
import "./globals.css";

// --- Web3 & Query Imports ---
import '@rainbow-me/rainbowkit/styles.css';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// เปลี่ยนมาใช้ Relative Path
import { config } from '@/utils/wagmi'; 
// '@/utils/wagmi' จะทำงานได้ถ้าคุณตั้งค่า Path Alias ใน tsconfig.json แล้ว 
// ถ้าไม่ ให้ใช้ './utils/wagmi' แทน (แต่ '@/utils' คือ Best Practice)

const queryClient = new QueryClient();

// Note: ถ้าคุณใช้ next/font/google (ตามโค้ดเดิม) ให้ใช้:
// const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] }); 
// แต่ผมเปลี่ยนไปใช้ 'geist/font' ซึ่งเป็นวิธีที่ได้รับความนิยมกว่า

export const metadata: Metadata = {
  title: "Goat Ridder Web3 Game",
  description: "A real-time Web3 game built with Next.js and Tailwind.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // WagmiProvider ต้องห่อ QueryClientProvider
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {/* Providers ต้องห่อ <html> tag ด้วย 
            และเราใช้ตัวแปร Font ที่ถูกต้อง (GeistSans, GeistMono)
          */}
          <html 
            lang="en" 
            className={`${GeistSans.variable} ${GeistMono.variable} scroll-smooth`}
          >
            {/* เราห่อ body ด้วย Provider แล้ว และส่ง children เข้าไป 
              ห้ามมี </body> และ </html> ซ้ำอีกครั้ง
            */}
            <body>{children}</body>
          </html>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}