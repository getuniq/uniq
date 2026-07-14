import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Uniq — two URLs in, a closing kit out";

export default function OG() {
  return new ImageResponse(
    (
      <div style={{
        width: "100%", height: "100%", display: "flex", flexDirection: "column",
        justifyContent: "center", padding: 90,
        background: "linear-gradient(135deg, #0E1116 0%, #1A1030 100%)",
        color: "#F9FAFB", fontFamily: "sans-serif",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
          <svg width="86" height="86" viewBox="0 0 64 64" fill="none">
            <path d="M14 8 V32 a18 18 0 0 0 36 0 V8" stroke="#7C3AED" strokeWidth="7" strokeLinecap="round" fill="none" />
            <path d="M25 8 V31 a7 7 0 0 0 14 0 V8" stroke="#A78BFA" strokeWidth="6" strokeLinecap="round" fill="none" />
            <circle cx="32" cy="56" r="6" fill="#10B981" />
          </svg>
          <div style={{ display: "flex", fontSize: 84, fontWeight: 800, letterSpacing: -4 }}>
            uniq<span style={{ color: "#A78BFA" }}>.</span>
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 58, fontWeight: 700, letterSpacing: -2, marginTop: 44 }}>
          Two URLs in. A closing kit out.
        </div>
        <div style={{ display: "flex", fontSize: 30, color: "#9CA3AF", marginTop: 22 }}>
          The open-source, agent-native proposal engine — MCP · API · CLI
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: 46 }}>
          <div style={{ display: "flex", padding: "10px 24px", borderRadius: 999, border: "2px solid #7C3AED", color: "#C4B5FD", fontSize: 24, fontWeight: 600 }}>AGPL-3.0</div>
          <div style={{ display: "flex", padding: "10px 24px", borderRadius: 999, border: "2px solid #10B981", color: "#6EE7B7", fontSize: 24, fontWeight: 600 }}>agent-native</div>
          <div style={{ display: "flex", padding: "10px 24px", borderRadius: 999, border: "2px solid #4B5563", color: "#D1D5DB", fontSize: 24, fontWeight: 600 }}>github.com/getuniq/uniq</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
