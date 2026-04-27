import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fintech | MyLegal.ma",
  description: "Prototype premium de gestion financiere"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
