import { PageHeader } from "@/components/layout/page-header"
import { AssetForm } from "@/components/assets/asset-form"

export default function NewAssetPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Register New Asset"
        breadcrumbs={[
          { label: "Assets", href: "/assets" },
          { label: "New" },
        ]}
      />
      <AssetForm />
    </div>
  )
}
