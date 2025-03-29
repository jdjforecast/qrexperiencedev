import Image from "next/image"
import type { ImageProps } from "next/image"

interface AccessibleImageProps extends Omit<ImageProps, "alt"> {
  alt: string // Make alt required and not optional
}

export function AccessibleImage({ alt, ...props }: AccessibleImageProps) {
  return <Image alt={alt} {...props} />
}
// Usage:
;<AccessibleImage src="/path/to/image.jpg" alt="Descriptive text about this product" width={300} height={200} />

