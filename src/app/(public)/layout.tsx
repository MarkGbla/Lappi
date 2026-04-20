import Image from "next/image"

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto max-w-xl px-4 py-3 flex items-center gap-2">
          <Image
            src="/icon-192.png"
            alt=""
            width={28}
            height={28}
            className="rounded-md"
          />
          <div className="leading-tight">
            <p className="text-sm font-semibold">Lappi</p>
            <p className="text-[11px] text-muted-foreground">
              Christex Foundation
            </p>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-xl px-4 py-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
        {children}
      </main>
    </div>
  )
}
