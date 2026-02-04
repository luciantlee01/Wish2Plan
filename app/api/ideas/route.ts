import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth-server"
import { db } from "@/lib/db"
import { ideaCreateSchema, ideasQuerySchema } from "@/lib/validation"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const query = ideasQuerySchema.parse({
      category: searchParams.get("category") || undefined,
      status: searchParams.get("status") || undefined,
      search: searchParams.get("search") || undefined,
    })

    const where: any = {
      userId: session.user.id,
    }

    if (query.category) {
      where.category = query.category
    }

    if (query.status) {
      where.status = query.status
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: "insensitive" } },
        { description: { contains: query.search, mode: "insensitive" } },
        { placeName: { contains: query.search, mode: "insensitive" } },
      ]
    }

    const ideas = await db.idea.findMany({
      where,
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(ideas)
  } catch (error) {
    console.error("Get ideas error:", error)
    return NextResponse.json(
      { error: "Failed to fetch ideas" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const data = ideaCreateSchema.parse(body)

    const idea = await db.idea.create({
      data: {
        ...data,
        userId: session.user.id,
        category: data.category || "DATE",
        status: data.status || "SAVED",
      },
    })

    return NextResponse.json(idea)
  } catch (error) {
    console.error("Create idea error:", error)
    return NextResponse.json(
      { error: "Failed to create idea" },
      { status: 500 }
    )
  }
}

