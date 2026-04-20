import Image from "next/image"
import Link from "next/link"
import { UserMenu } from "./user-menu"

export function MobileHeader() {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur lg:hidden">
      <Link
        href="/"
        className="flex items-center gap-2 text-base font-semibold tracking-tight text-foreground"
      >
        <Image
          src="/mascot/lappi.png"
          alt=""
          width={36}
          height={36}
          className="size-8 object-contain dark:invert"
          priority
        />
        Lappi
      </Link>
      <UserMenu compact />
    </header>
  )
}
