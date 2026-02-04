"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Plus, Search } from "lucide-react"
import Image from "next/image"

interface Idea {
  id: string
  title: string
  description: string | null
  url: string | null
  category: string
  status: string
  imageUrl: string | null
  placeName: string | null
  createdAt: string
}

export default function IdeasPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  useEffect(() => {
    fetchIdeas()
  }, [categoryFilter, statusFilter, search])

  const fetchIdeas = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (categoryFilter !== "all") params.append("category", categoryFilter)
      if (statusFilter !== "all") params.append("status", statusFilter)
      if (search) params.append("search", search)

      const res = await fetch(`/api/ideas?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setIdeas(data)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch ideas",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Ideas</h1>
          <p className="text-muted-foreground">Manage your saved ideas</p>
        </div>
        <Button asChild>
          <Link href="/app/ideas/new">
            <Plus className="mr-2 h-4 w-4" />
            New Idea
          </Link>
        </Button>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search ideas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="DATE">Date</SelectItem>
            <SelectItem value="GIFT">Gift</SelectItem>
            <SelectItem value="MEAL">Meal</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="SAVED">Saved</SelectItem>
            <SelectItem value="PLANNED">Planned</SelectItem>
            <SelectItem value="DONE">Done</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : ideas.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No ideas found</p>
            <Button asChild>
              <Link href="/app/ideas/new">Create your first idea</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ideas.map((idea) => (
            <Card key={idea.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <Link href={`/app/ideas/${idea.id}`}>
                {idea.imageUrl && (
                  <div className="relative h-48 w-full">
                    <Image
                      src={idea.imageUrl}
                      alt={idea.title}
                      fill
                      className="object-cover rounded-t-lg"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg flex-1">{idea.title}</CardTitle>
                    <div className="flex gap-1 flex-shrink-0">
                      <Badge variant="secondary">{idea.category}</Badge>
                      <Badge variant="outline">{idea.status}</Badge>
                    </div>
                  </div>
                  {idea.description && (
                    <CardDescription className="line-clamp-2">
                      {idea.description}
                    </CardDescription>
                  )}
                  {idea.placeName && (
                    <CardDescription className="text-xs">
                      📍 {idea.placeName}
                    </CardDescription>
                  )}
                </CardHeader>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

