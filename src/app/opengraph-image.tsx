import { ImageResponse } from "next/og"

import profile from "@/content/profile.json"

import { PROFILE_IMAGE_DATA_URI } from "./seo-logo-loader"

export const alt = `${profile.displayName} - AI & Machine Learning Engineer`
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = "image/png"

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          padding: "80px",
          background: "#09090b",
          color: "#fafafa",
          fontFamily: "sans-serif",
        }}
      >
        <img
          src={PROFILE_IMAGE_DATA_URI}
          width={100}
          height={100}
          alt=""
          style={{ borderRadius: 16 }}
        />

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div
            style={{
              fontSize: 72,
              fontWeight: 700,
              letterSpacing: -2,
              lineHeight: 1.1,
            }}
          >
            {profile.displayName}
          </div>
          <div style={{ fontSize: 32, color: "#a1a1aa" }}>{profile.jobTitle}</div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 20,
            color: "#71717a",
            fontFamily: "monospace",
          }}
        >
          zickrian.dev
        </div>
      </div>
    ),
    { ...size }
  )
}
