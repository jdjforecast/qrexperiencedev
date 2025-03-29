"use client"

/**
 * AppIcon component provides optimized SVG icons for different contexts
 * Handles proper sizing and viewBox settings for icons
 */
export function AppIcon({
  size = 192,
  type = "default",
  className = "",
}: {
  size?: number
  type?: "default" | "apple" | "favicon"
  className?: string
}) {
  // The aspect ratio from the original SVG
  const aspectRatio = 2.5 // Approximate for pharmasummitnestlehorizontal.svg
  const width = size
  const height = size / aspectRatio

  // Common SVG props
  const svgProps = {
    width,
    height,
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 400 160", // Approximate for the original SVG
    className: `app-icon ${className}`,
    fill: "none",
  }

  // Use proper path to the SVG based on type
  const iconPath = "/pharmasummitnestlehorizontal.svg"

  return (
    <svg {...svgProps}>
      <use href={`${iconPath}#icon`} />
      <image href={iconPath} width="100%" height="100%" preserveAspectRatio="xMidYMid meet" />
    </svg>
  )
}

/**
 * Function to generate a complete data URL for an SVG icon
 * Used for manifest and other places where a direct image URL is needed
 */
export function getSvgDataUrl(size = 192): string {
  const aspectRatio = 2.5
  const width = size
  const height = size / aspectRatio

  // This could be expanded to include the full SVG data inline
  // For now we're just returning the path to the actual SVG
  return `/pharmasummitnestlehorizontal.svg`
}

