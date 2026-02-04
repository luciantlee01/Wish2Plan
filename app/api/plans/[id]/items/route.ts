import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth-server"
import { db } from "@/lib/db"
import { planItemCreateSchema } from "@/lib/validation"

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const plan = await db.plan.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 })
    }

    const body = await req.json()
    const { ideaId, sortOrder } = planItemCreateSchema.parse({
      ...body,
      planId: params.id,
    })

    // Check if idea belongs to user
    const idea = await db.idea.findFirst({
      where: {
        id: ideaId,
        userId: session.user.id,
      },
    })

    if (!idea) {
      return NextResponse.json({ error: "Idea not found" }, { status: 404 })
    }

    // Check if item already exists
    const existing = await db.planItem.findFirst({
      where: {
        planId: params.id,
        ideaId,
      },
    })

    if (existing) {
      return NextResponse.json({ error: "Idea already in plan" }, { status: 400 })
    }

    const planItem = await db.planItem.create({
      data: {
        planId: params.id,
        ideaId,
        sortOrder: sortOrder || 0,
      },
    })

    return NextResponse.json(planItem)
  } catch (error) {
    console.error("Add plan item error:", error)
    return NextResponse.json(
      { error: "Failed to add idea to plan" },
      { status: 500 }
    )
  }
}

