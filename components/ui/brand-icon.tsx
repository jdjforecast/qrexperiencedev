"use client"
import Image from "next/image"

type IconName = "logo" | "pharma" | "summit" | "nestle" | "icon"

interface BrandIconProps {
  name: IconName
  className?: string
  width?: number
  height?: number
}

export function BrandIcon({ name, className = "", width = 24, height = 24 }: BrandIconProps) {
  const iconPaths = {
    logo: "/nestledigitalpharmasummitvertical.svg",
    pharma: "/pharma-icon.svg",
    summit: "/summit-icon.svg",
    nestle: "/nestle-logo.svg",
    icon: "/placeholder-logo.svg",
  }

  return (
    <div className={className}>
      <Image src={iconPaths[name]} alt={`${name} icon`} width={width} height={height} />
    </div>
  )
}

