import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div style={{ width: 64, height: 64, display: "flex", alignItems: "center", justifyContent: "center", background: "#0E1116", borderRadius: 14 }}>
        <svg width="44" height="44" viewBox="0 0 64 64" fill="none">
          <path d="M14 10 V32 a18 18 0 0 0 36 0 V10" stroke="#7C3AED" strokeWidth="7" strokeLinecap="round" fill="none" />
          <path d="M25 10 V31 a7 7 0 0 0 14 0 V10" stroke="#A78BFA" strokeWidth="6" strokeLinecap="round" fill="none" />
          <circle cx="32" cy="56" r="5.5" fill="#10B981" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
