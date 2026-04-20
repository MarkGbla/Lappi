import { notFound } from "next/navigation"
import { prisma } from "@/lib/db"
import { PageHeader } from "@/components/layout/page-header"
import { AssetForm } from "@/components/assets/asset-form"

export default async function EditAssetPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const asset = await prisma.asset.findUnique({ where: { id } })
  if (!asset) notFound()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Asset"
        breadcrumbs={[
          { label: "Assets", href: "/assets" },
          { label: asset.name, href: `/assets/${asset.id}` },
          { label: "Edit" },
        ]}
      />
      <AssetForm asset={asset} />
    </div>
  )
}
