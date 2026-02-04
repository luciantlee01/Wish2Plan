import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth-server"
import { geocodeSchema } from "@/lib/validation"
import { geocodePlace } from "@/lib/geocode"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { query } = geocodeSchema.parse(body)

    const results = await geocodePlace(query)

    return NextResponse.json(results)
  } catch (error) {
    console.error("Geocode error:", error)
    return NextResponse.json(
      { error: "Failed to geocode place" },
      { status: 500 }
    )
  }
}

