import { MascotLoading } from "@/components/shared/mascot-loading"

export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <MascotLoading size={180} />
    </div>
  )
}
