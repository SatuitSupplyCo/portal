"use client"

import { useEffect, useRef, useState } from "react"

interface InlineSvgProps {
  src: string
  className?: string
  alt?: string
  /**
   * ID substrings of `<g>` layer groups to physically remove from the
   * SVG DOM before rendering. More reliable than CSS `display: none`
   * because it bypasses all cascade / specificity issues.
   *
   * Example: `["GRID", "ANNOTATION"]` removes any `<g>` whose id
   * contains "GRID" or "ANNOTATION".
   */
  hideLayers?: string[]
}

// ─── Scoping ────────────────────────────────────────────────────────
// Each inlined SVG shares the document's CSS cascade, so class names
// like `.outline` or `.grid` in one SVG's <style> will bleed into
// every other inlined SVG on the page. We fix this by:
//
// 1. Adding a unique data attribute to the <svg> element
// 2. Prefixing every CSS selector in its <style> with that attribute
// 3. Renaming all internal IDs (patterns, masks, clip-paths) and
//    updating url(#…) / href="#…" references so they don't collide

let instanceCounter = 0

function scopeSvgMarkup(
  raw: string,
  scope: string,
  hideLayers?: string[],
): string {
  const parser = new DOMParser()
  const doc = parser.parseFromString(raw, "image/svg+xml")
  const svg = doc.querySelector("svg")
  if (!svg) return raw

  // 0. Remove unwanted layers before any other processing ──────────
  if (hideLayers && hideLayers.length > 0) {
    svg.querySelectorAll("g[id]").forEach((g) => {
      const id = g.getAttribute("id") || ""
      if (hideLayers.some((pattern) => id.includes(pattern))) {
        g.remove()
      }
    })
  }

  // 1. Rename internal IDs ─────────────────────────────────────────
  const idMap = new Map<string, string>()
  svg.querySelectorAll("[id]").forEach((el) => {
    const oldId = el.getAttribute("id")!
    const newId = `${scope}_${oldId}`
    idMap.set(oldId, newId)
    el.setAttribute("id", newId)
  })

  // 2. Scope <style> selectors ─────────────────────────────────────
  const attr = `[data-svgs="${scope}"]`
  svg.querySelectorAll("style").forEach((style) => {
    if (!style.textContent) return
    style.textContent = style.textContent.replace(
      /([^{}]+)\{/g,
      (_match, sels: string) => {
        // Don't touch @-rules
        if (sels.trim().startsWith("@")) return `${sels}{`
        const scoped = sels
          .split(",")
          .map((s: string) => {
            const t = s.trim()
            return t ? `${attr} ${t}` : t
          })
          .join(", ")
        return `${scoped} {`
      },
    )
  })

  // 3. Serialize & fix url(#id) / href="#id" references ────────────
  let out = new XMLSerializer().serializeToString(svg)
  for (const [oldId, newId] of idMap) {
    out = out.split(`url(#${oldId})`).join(`url(#${newId})`)
    out = out.split(`href="#${oldId}"`).join(`href="#${newId}"`)
  }

  return out
}

// ─── Component ──────────────────────────────────────────────────────

export function InlineSvg({
  src,
  className,
  alt,
  hideLayers,
}: InlineSvgProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const scopeRef = useRef("")
  if (!scopeRef.current) scopeRef.current = `isvg${++instanceCounter}`

  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoaded(false)

    fetch(src)
      .then((r) => r.text())
      .then((raw) => {
        if (cancelled || !containerRef.current) return

        const html = scopeSvgMarkup(raw, scopeRef.current, hideLayers)
        containerRef.current.innerHTML = html

        const svg = containerRef.current.querySelector("svg")
        if (svg) {
          svg.setAttribute("data-svgs", scopeRef.current)
          svg.setAttribute("role", "img")
          if (alt) svg.setAttribute("aria-label", alt)
          svg.removeAttribute("width")
          svg.removeAttribute("height")
          svg.style.width = "100%"
          svg.style.height = "100%"
        }

        setLoaded(true)
      })
      .catch(() => {
        // Silently fail — the container stays empty
      })

    return () => {
      cancelled = true
    }
  }, [src, alt, hideLayers])

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ opacity: loaded ? 1 : 0, transition: "opacity 0.15s" }}
    />
  )
}
