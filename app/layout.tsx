"use client"

import type React from "react"
import { Orbitron, Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { DivisionProvider, useDivision } from "@/context/DivisionContext" 
import "./globals.css"

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  weight: ["400", "500", "600", "700", "800", "900"],
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

function RootContent({ children }: { children: React.ReactNode }) {
  const { division } = useDivision();

  // Forzamos la comparación a minúsculas para evitar el error de overlap 
  // o usamos el valor exacto del tipo Division.
  const isIndustrial = division.toLowerCase() === "industrial";

  return (
    <body 
      className={`${orbitron.variable} ${inter.variable} font-sans antialiased transition-colors duration-700 ${
        isIndustrial ? "industrial" : ""
      }`}
    >
      {children}
      <Analytics />
    </body>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <DivisionProvider>
        <RootContent>
          {children}
        </RootContent>
      </DivisionProvider>
    </html>
  )
}