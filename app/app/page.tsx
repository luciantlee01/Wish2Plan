"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Plus, Lightbulb } from "lucide-react"
import Link from "next/link"

interface Idea {
  id: string
  title: string
  description: string | null
  category: string
  status: string
  imageUrl: string | null
  createdAt: string
}

export default function DashboardPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [text, setText] = useState("")
  const [loading, setLoading] = useState(false)
  const [recentIdeas, setRecentIdeas] = useState<Idea[]>([])

  useEffect(() => {
    fetchRecentIdeas()
  }, [])

  const fetchRecentIdeas = async () => {
    try {
      const res = await fetch("/api/ideas?limit=5")
      if (res.ok) {
        const ideas = await res.json()
        setRecentIdeas(ideas.slice(0, 5))
      }
    } catch (error) {
      console.error("Failed to fetch ideas:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return

    setLoading(true)
    try {
      const res = await fetch("/api/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      })

      if (!res.ok) throw new Error("Failed to process")

      const drafts = await res.json()

      // Create ideas from drafts
      for (const draft of drafts) {
        await fetch("/api/ideas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(draft),
        })
      }

      toast({
        title: "Success",
        description: `Created ${drafts.length} idea(s)`,
      })

      setText("")
      fetchRecentIdeas()
      router.push("/app/ideas")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save ideas",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          Quickly add and manage your ideas
        </p>
      </div>

      <Card className="mb-6 sm:mb-8">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Quick Add</CardTitle>
          <CardDescription className="text-sm">
            Paste a URL or text to save an idea
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              placeholder="Paste a URL or type your idea here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              className="min-h-[100px] resize-none"
            />
            <Button type="submit" disabled={loading || !text.trim()} className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              {loading ? "Processing..." : "Add Idea(s)"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div>
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-xl sm:text-2xl font-semibold">Recent Ideas</h2>
          <Button variant="outline" asChild className="w-full sm:w-auto">
            <Link href="/app/ideas">View All</Link>
          </Button>
        </div>

        {recentIdeas.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16">
              <Lightbulb className="mb-4 h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground" />
              <p className="text-sm sm:text-base text-muted-foreground text-center px-4">
                No ideas yet. Start by adding one above!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {recentIdeas.map((idea) => (
              <Card
                key={idea.id}
                className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
              >
                <Link href={`/app/ideas/${idea.id}`} className="block">
                  {idea.imageUrl && (
                    <div className="relative w-full h-40 sm:h-48 overflow-hidden rounded-t-lg">
                      <img
                        src={idea.imageUrl}
                        alt={idea.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader className={idea.imageUrl ? "" : "pb-3"}>
                    <CardTitle className="text-base sm:text-lg line-clamp-2">
                      {idea.title}
                    </CardTitle>
                    {idea.description && (
                      <CardDescription className="line-clamp-2 text-sm mt-1">
                        {idea.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

