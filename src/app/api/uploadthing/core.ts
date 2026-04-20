import { createUploadthing, type FileRouter } from "uploadthing/next"
import { UploadThingError } from "uploadthing/server"
import { getSession } from "@/lib/auth-helpers"

const f = createUploadthing()

export const ourFileRouter = {
  assetImage: f(
    { image: { maxFileSize: "4MB", maxFileCount: 5 } },
    // We only use `res[0].key` on the client — we don't read `serverData`.
    // Turning this off prevents startUpload from hanging when the dev-mode
    // callback stream from the ingest service back to our localhost server
    // stalls (Next 16 + Turbopack seem to choke on that recursive POST).
    { awaitServerData: false },
  )
    .middleware(async ({ req }) => {
      const user = await getSession()
      if (!user) {
        if (process.env.NODE_ENV !== "production") {
          const cookieHeader = req.headers.get("cookie") ?? ""
          const hasSessionCookie =
            cookieHeader.includes("authjs.session-token") ||
            cookieHeader.includes("__Secure-authjs.session-token")
          console.error("[uploadthing] auth failed in middleware", {
            hasSessionCookie,
            cookieNames: cookieHeader
              .split(";")
              .map((c) => c.trim().split("=")[0])
              .filter(Boolean),
          })
        }
        throw new UploadThingError({
          code: "FORBIDDEN",
          message: "Not authenticated — please sign in again and retry",
        })
      }
      return { userId: user.id }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId, url: file.ufsUrl }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
