import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth-server"
import { ingestSchema } from "@/lib/validation"
import { extractUrls, getSourceFromUrl } from "@/lib/utils"
import { fetchMetadata } from "@/lib/metadata"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { text } = ingestSchema.parse(body)

    const urls = extractUrls(text)

    if (urls.length === 0) {
      // No URLs found, return a text-based idea
      return NextResponse.json([
        {
          title: text.slice(0, 60) + (text.length > 60 ? "..." : ""),
          description: text.length > 60 ? text : null,
          url: null,
          source: "TEXT" as const,
          imageUrl: null,
          rawText: text,
        },
      ])
    }

    // Process each URL
    const drafts = await Promise.all(
      urls.map(async (url) => {
        try {
          const source = getSourceFromUrl(url)
          const metadata = await fetchMetadata(url, source)

          return {
            title: metadata.title,
            description: metadata.description,
            url,
            source,
            imageUrl: metadata.imageUrl,
            rawText: text,
          }
        } catch (error) {
          console.error(`Error processing URL ${url}:`, error)
          return {
            title: new URL(url).hostname,
            description: null,
            url,
            source: getSourceFromUrl(url),
            imageUrl: null,
            rawText: text,
          }
        }
      })
    )

    return NextResponse.json(drafts)
  } catch (error) {
    console.error("Ingest error:", error)
    return NextResponse.json(
      { error: "Failed to process input" },
      { status: 500 }
    )
  }
}

