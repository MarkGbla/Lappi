import { readFileSync } from "node:fs"
import { join } from "node:path"
import { ImageResponse } from "next/og"

export const alt = "Lappi — Asset Tracking for Christex Foundation"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function Image() {
  const mascotBuffer = readFileSync(
    join(process.cwd(), "public", "mascot", "lappi.png"),
  )
  const mascotDataUrl = `data:image/png;base64,${mascotBuffer.toString("base64")}`

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background: "#ffffff",
          color: "#000000",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 48 }}>
          <img src={mascotDataUrl} width={220} height={198} alt="" />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                fontSize: 24,
                letterSpacing: 3,
                textTransform: "uppercase",
                color: "#555",
              }}
            >
              Christex Foundation
            </div>
            <div style={{ fontSize: 140, fontWeight: 700, lineHeight: 1, marginTop: 8 }}>
              Lappi
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 44, fontWeight: 600, color: "#111", lineHeight: 1.15, maxWidth: 960 }}>
            Asset tracking for devices, repairs, and tech requests.
          </div>
          <div style={{ fontSize: 28, color: "#666" }}>
            Built for staff and community members in Freetown, Sierra Leone.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "2px solid #000",
            paddingTop: 24,
            marginTop: 8,
          }}
        >
          <div style={{ fontSize: 24, color: "#000", fontWeight: 600 }}>
            lappi.vercel.app
          </div>
          <div style={{ fontSize: 22, color: "#555" }}>christex.foundation</div>
        </div>
      </div>
    ),
    size,
  )
}
