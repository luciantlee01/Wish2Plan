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
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Quickly add and manage your ideas</p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Quick Add</CardTitle>
          <CardDescription>
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
            />
            <Button type="submit" disabled={loading || !text.trim()}>
              <Plus className="mr-2 h-4 w-4" />
              {loading ? "Processing..." : "Add Idea(s)"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Recent Ideas</h2>
          <Button variant="outline" asChild>
            <Link href="/app/ideas">View All</Link>
          </Button>
        </div>

        {recentIdeas.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Lightbulb className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">No ideas yet. Start by adding one above!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentIdeas.map((idea) => (
              <Card key={idea.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <Link href={`/app/ideas/${idea.id}`}>
                  <CardHeader>
                    <CardTitle className="text-lg">{idea.title}</CardTitle>
                    {idea.description && (
                      <CardDescription className="line-clamp-2">
                        {idea.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  {idea.imageUrl && (
                    <CardContent>
                      <img
                        src={idea.imageUrl}
                        alt={idea.title}
                        className="w-full h-32 object-cover rounded"
                      />
                    </CardContent>
                  )}
                </Link>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

