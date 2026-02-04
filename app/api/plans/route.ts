import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth-server"
import { db } from "@/lib/db"
import { planCreateSchema } from "@/lib/validation"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const plans = await db.plan.findMany({
      where: { userId: session.user.id },
      include: {
        planItems: {
          include: {
            idea: true,
          },
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: { scheduledFor: "asc" },
    })

    return NextResponse.json(plans)
  } catch (error) {
    console.error("Get plans error:", error)
    return NextResponse.json(
      { error: "Failed to fetch plans" },
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
    const data = planCreateSchema.parse(body)

    const plan = await db.plan.create({
      data: {
        ...data,
        scheduledFor: new Date(data.scheduledFor),
        userId: session.user.id,
      },
    })

    return NextResponse.json(plan)
  } catch (error) {
    console.error("Create plan error:", error)
    return NextResponse.json(
      { error: "Failed to create plan" },
      { status: 500 }
    )
  }
}

