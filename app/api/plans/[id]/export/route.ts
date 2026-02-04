import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth-server"
import { db } from "@/lib/db"
import { createEvent } from "ics"

export async function GET(
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
      include: {
        planItems: {
          include: {
            idea: true,
          },
          orderBy: { sortOrder: "asc" },
        },
      },
    })

    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 })
    }

    const scheduledDate = new Date(plan.scheduledFor)
    const year = scheduledDate.getFullYear()
    const month = scheduledDate.getMonth() + 1
    const day = scheduledDate.getDate()
    const hour = scheduledDate.getHours()
    const minute = scheduledDate.getMinutes()

    const ideaTitles = plan.planItems.map((item) => item.idea.title).join(", ")
    const description = [
      plan.notes,
      plan.planItems.length > 0 ? `Ideas: ${ideaTitles}` : null,
    ]
      .filter(Boolean)
      .join("\n\n")

    const { error, value } = createEvent({
      title: plan.title,
      description: description || undefined,
      start: [year, month, day, hour, minute],
      duration: { hours: 2 },
      status: "CONFIRMED",
      busyStatus: "BUSY",
    })

    if (error) {
      console.error("ICS creation error:", error)
      return NextResponse.json(
        { error: "Failed to generate calendar file" },
        { status: 500 }
      )
    }

    return new NextResponse(value, {
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename="${plan.title.replace(/[^a-z0-9]/gi, "_")}.ics"`,
      },
    })
  } catch (error) {
    console.error("Export plan error:", error)
    return NextResponse.json(
      { error: "Failed to export plan" },
      { status: 500 }
    )
  }
}

