const APP_ID = process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID

export function keyToUrl(key: string): string {
  if (!APP_ID) {
    // Fallback to the generic endpoint — slower but still works.
    return `https://utfs.io/f/${key}`
  }
  return `https://${APP_ID}.ufs.sh/f/${key}`
}
