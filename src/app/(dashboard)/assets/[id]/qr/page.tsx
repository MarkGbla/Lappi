import { notFound } from "next/navigation"
import QRCode from "qrcode"
import { prisma } from "@/lib/db"
import { PageHeader } from "@/components/layout/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { PrintButton } from "@/components/shared/print-button"

export default async function AssetQrPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const asset = await prisma.asset.findUnique({ where: { id } })
  if (!asset) notFound()

  const baseUrl = process.env.NEXTAUTH_URL ?? ""
  const targetUrl = `${baseUrl}/assets/${asset.id}`
  const dataUrl = await QRCode.toDataURL(targetUrl, { margin: 1, width: 400 })

  return (
    <div className="space-y-6">
      <PageHeader
        title={`QR Code: ${asset.name}`}
        breadcrumbs={[
          { label: "Assets", href: "/assets" },
          { label: asset.name, href: `/assets/${asset.id}` },
          { label: "QR Code" },
        ]}
        action={<PrintButton />}
      />

      <Card>
        <CardContent className="pt-6 flex flex-col items-center gap-4 print:shadow-none print:border-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={dataUrl}
            alt={`QR code for ${asset.name}`}
            className="w-64 h-64"
          />
          <div className="text-center">
            <p className="font-semibold">{asset.name}</p>
            {asset.serialNumber && (
              <p className="text-sm font-mono text-muted-foreground">
                {asset.serialNumber}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-2 break-all">
              {targetUrl}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
