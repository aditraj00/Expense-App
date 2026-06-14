import type { Metadata } from "next";
import "./globals.css";
import BackButton from "@/components/back-button";

export const metadata: Metadata = {
  title: "Spreetail Shared Expenses",
  description: "Shared expenses app for changing group membership and messy CSV imports."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <div className="app-shell">
          <header className="topbar">
            <BackButton />
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}