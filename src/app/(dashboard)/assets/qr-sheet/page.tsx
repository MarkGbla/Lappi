import QRCode from "qrcode"
import { prisma } from "@/lib/db"
import { getBaseUrl } from "@/lib/base-url"
import { PageHeader } from "@/components/layout/page-header"
import { PrintButton } from "@/components/shared/print-button"

export default async function QrSheetPage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string }>
}) {
  const { ids } = await searchParams
  const idList = ids?.split(",").filter(Boolean)

  const assets = await prisma.asset.findMany({
    where: idList?.length ? { id: { in: idList } } : { status: { not: "RETIRED" } },
    orderBy: { name: "asc" },
  })

  const baseUrl = getBaseUrl()
  const labels = await Promise.all(
    assets.map(async (a) => ({
      ...a,
      dataUrl: await QRCode.toDataURL(`${baseUrl}/scan/${a.id}`, {
        margin: 1,
        width: 200,
      }),
    }))
  )

  return (
    <div className="space-y-6">
      <div className="print:hidden">
        <PageHeader
          title="Asset Label Sheet"
          breadcrumbs={[
            { label: "Assets", href: "/assets" },
            { label: "Label Sheet" },
          ]}
          action={<PrintButton />}
        />
        <p className="text-sm text-muted-foreground">
          {labels.length} label{labels.length === 1 ? "" : "s"}. Print on
          adhesive label paper — 8 labels per A4/Letter page.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 print:grid-cols-4 print:gap-0">
        {labels.map((asset) => (
          <div
            key={asset.id}
            className="flex flex-col items-center border border-border rounded-lg p-3 print:rounded-none print:border-dashed print:break-inside-avoid"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={asset.dataUrl}
              alt={`QR for ${asset.name}`}
              className="w-28 h-28"
            />
            <div className="text-center mt-2">
              <p className="text-xs font-semibold line-clamp-2">{asset.name}</p>
              {asset.serialNumber && (
                <p className="text-[10px] font-mono text-muted-foreground">
                  {asset.serialNumber}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
