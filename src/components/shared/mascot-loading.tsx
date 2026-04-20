import Image from "next/image"

type Props = {
  size?: number
  className?: string
}

export function MascotLoading({ size = 180, className }: Props) {
  return (
    <Image
      src="/mascot/lappi.png"
      width={size}
      height={size}
      alt="Lappi mascot"
      className={`${className ?? ""} dark:invert`}
      priority
    />
  )
}
