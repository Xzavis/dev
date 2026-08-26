"use client"

import { useTheme } from "next-themes"
import { useEffect, useRef } from "react"

interface Dot {
  x: number
  y: number
  originX: number
  originY: number
}

/**
 * Interactive canvas dot field background inspired by hafidznoor.com.
 * Renders fine, subtle micro-dots strictly in the left and right gutters,
 * leaving the central content column clean and keeping all horizontal
 * screen-lines and borders completely intact.
 */
export function InteractiveDotsField({
  dotRadius = 1,
  dotSpacing = 16,
  cursorRadius = 260,
  bulgeStrength = 48,
}: {
  dotRadius?: number
  dotSpacing?: number
  cursorRadius?: number
  bulgeStrength?: number
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d", { alpha: true })
    if (!ctx) return

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches

    let animationFrameId: number | null = null
    let running = false
    let width = 0
    let height = 0
    let dots: Dot[] = []
    let lastPointerAt = Number.NEGATIVE_INFINITY

    const mouse = {
      x: -9999,
      y: -9999,
      targetX: -9999,
      targetY: -9999,
    }

    // After the pointer stops, the dots spring back to origin within a few
    // frames. Once they have fully settled AND the pointer has been idle past
    // this window, every frame would be a byte-identical repaint, so the loop
    // stops until the pointer moves again. The result is visually identical -
    // the field simply stops burning battery drawing still pixels.
    const IDLE_TIMEOUT_MS = 600

    const cursorRadiusSq = cursorRadius * cursorRadius

    const initGrid = () => {
      if (window.innerWidth < 640) {
        width = 0
        height = 0
        dots = []
        canvas.width = 0
        canvas.height = 0
        return
      }

      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = window.innerWidth
      height = window.innerHeight
      const contentWidth = width >= 768 ? 720 : width - 16
      const gutterStart = (width - contentWidth) / 2
      const gutterEnd = width - gutterStart

      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`

      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.scale(dpr, dpr)

      const spacing = dotRadius * 2 + dotSpacing
      const cols = Math.floor(width / spacing) + 1
      const rows = Math.floor(height / spacing) + 1
      const offsetX = (width % spacing) / 2
      const offsetY = (height % spacing) / 2

      dots = []
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = offsetX + c * spacing
          const y = offsetY + r * spacing

          if (x > gutterStart && x < gutterEnd) continue

          dots.push({
            x,
            y,
            originX: x,
            originY: y,
          })
        }
      }
    }

    const getIsDark = () => {
      if (resolvedTheme === "dark") return true
      if (resolvedTheme === "light") return false
      return document.documentElement.classList.contains("dark")
    }

    const drawField = () => {
      if (dots.length === 0) return

      ctx.clearRect(0, 0, width, height)

      const isDark = getIsDark()
      ctx.fillStyle = isDark
        ? "rgba(255, 255, 255, 0.18)"
        : "rgba(0, 0, 0, 0.22)"

      ctx.beginPath()
      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i]
        ctx.moveTo(dot.x + dotRadius, dot.y)
        ctx.arc(dot.x, dot.y, dotRadius, 0, Math.PI * 2)
      }
      ctx.fill()
    }

    const observer = new MutationObserver(() => {
      drawField()
    })
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })

    const render = () => {
      animationFrameId = null

      // A hidden tab does not need a repainting background. The loop resumes
      // on the next visibilitychange without losing any state.
      if (document.hidden) {
        running = false
        return
      }

      // Smooth mouse tracking
      mouse.x += (mouse.targetX - mouse.x) * 0.18
      mouse.y += (mouse.targetY - mouse.y) * 0.18

      let moved = false

      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i]
        const prevX = dot.x
        const prevY = dot.y

        // Distance from cursor to dot origin
        const diffX = mouse.x - dot.originX
        const diffY = mouse.y - dot.originY
        const distSq = diffX * diffX + diffY * diffY

        if (distSq < cursorRadiusSq && distSq > 0) {
          const distance = Math.sqrt(distSq)
          const factor = (1 - distance / cursorRadius) ** 2
          const angle = Math.atan2(diffY, diffX)
          const force = factor * bulgeStrength

          const pushX = dot.originX - Math.cos(angle) * force
          const pushY = dot.originY - Math.sin(angle) * force

          dot.x += (pushX - dot.x) * 0.25
          dot.y += (pushY - dot.y) * 0.25
        } else {
          // Spring back to perfectly still origin
          dot.x += (dot.originX - dot.x) * 0.15
          dot.y += (dot.originY - dot.y) * 0.15

          // Snap to exact position when settle threshold reached
          if (Math.abs(dot.x - dot.originX) < 0.05) dot.x = dot.originX
          if (Math.abs(dot.y - dot.originY) < 0.05) dot.y = dot.originY
        }

        if (dot.x !== prevX || dot.y !== prevY) moved = true
      }

      drawField()

      // Stop once the dots have settled and the pointer has been idle - every
      // subsequent frame would repaint identical pixels.
      const idle = performance.now() - lastPointerAt > IDLE_TIMEOUT_MS
      if (!moved && idle) {
        running = false
        return
      }

      animationFrameId = requestAnimationFrame(render)
    }

    const start = () => {
      if (running || reducedMotion || dots.length === 0) return
      running = true
      render()
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (dots.length === 0) return

      mouse.targetX = e.clientX
      mouse.targetY = e.clientY
      lastPointerAt = performance.now()
      start()
    }

    const handleMouseLeave = () => {
      if (dots.length === 0) return

      mouse.targetX = -9999
      mouse.targetY = -9999
      lastPointerAt = performance.now()
      start()
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        running = false
        if (animationFrameId !== null) {
          cancelAnimationFrame(animationFrameId)
          animationFrameId = null
        }
      } else {
        start()
      }
    }

    const handleResize = () => {
      initGrid()
      if (dots.length === 0) return

      if (reducedMotion) {
        drawField()
      } else {
        lastPointerAt = performance.now()
        start()
      }
    }

    initGrid()

    if (reducedMotion) {
      // Static field only: draw a single frame and never run the RAF loop or
      // attach pointer listeners. The dots still re-render on resize.
      drawField()
      window.addEventListener("resize", handleResize)
      return () => {
        observer.disconnect()
        window.removeEventListener("resize", handleResize)
      }
    }

    window.addEventListener("mousemove", handleMouseMove, { passive: true })
    window.addEventListener("mouseleave", handleMouseLeave)
    window.addEventListener("resize", handleResize)
    document.addEventListener("visibilitychange", handleVisibilityChange)
    start()

    return () => {
      observer.disconnect()
      running = false
      if (animationFrameId !== null) cancelAnimationFrame(animationFrameId)
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseleave", handleMouseLeave)
      window.removeEventListener("resize", handleResize)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [dotRadius, dotSpacing, cursorRadius, bulgeStrength, resolvedTheme])

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 hidden overflow-hidden select-none sm:block"
    >
      <canvas ref={canvasRef} className="absolute inset-0 size-full" />
    </div>
  )
}
