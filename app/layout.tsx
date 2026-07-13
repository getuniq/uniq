import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Uniq — the open-source, agent-native proposal engine",
  description:
    "Two URLs in, a closing kit out. A personalized email, an HTML pitch page, and a hosted proposal in the prospect's own branding — operable by humans in chat, or by any agent via MCP, API, and CLI.",
  metadataBase: new URL("https://uniq.team"),
  openGraph: {
    title: "Uniq — two URLs in, a closing kit out",
    description: "The open-source, agent-native proposal engine. The artifact layer of the outbound agent stack.",
    url: "https://uniq.team",
    siteName: "Uniq",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
