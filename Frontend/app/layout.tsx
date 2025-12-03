// Frontend/app/layout.tsx
import React from "react";
import "./globals.css"; // ปรับชื่อถ้าคุณใช้ไฟล์ css อื่น
import { Baloo_2 } from "next/font/google";
const baloo = Baloo_2({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-baloo",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
<html lang="en" className={baloo.className}>
      <body>

        <main>{children}</main>
      </body>
    </html>
  );
}
