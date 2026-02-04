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
    <div className="w-full">
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Ideas</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Manage your saved ideas
          </p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/app/ideas/new">
            <Plus className="mr-2 h-4 w-4" />
            New Idea
          </Link>
        </Button>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search ideas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 sm:h-11"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[180px] h-10 sm:h-11">
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
          <SelectTrigger className="w-full sm:w-[180px] h-10 sm:h-11">
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
        <div className="text-center py-12 sm:py-16 text-muted-foreground">
          Loading...
        </div>
      ) : ideas.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16">
            <p className="text-sm sm:text-base text-muted-foreground mb-4">
              No ideas found
            </p>
            <Button asChild>
              <Link href="/app/ideas/new">Create your first idea</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {ideas.map((idea) => (
            <Card
              key={idea.id}
              className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02] overflow-hidden"
            >
              <Link href={`/app/ideas/${idea.id}`} className="block">
                {idea.imageUrl && (
                  <div className="relative h-40 sm:h-48 w-full overflow-hidden">
                    <Image
                      src={idea.imageUrl}
                      alt={idea.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <CardHeader className={idea.imageUrl ? "" : "pb-3"}>
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <CardTitle className="text-base sm:text-lg flex-1 line-clamp-2">
                      {idea.title}
                    </CardTitle>
                    <div className="flex gap-1 flex-wrap sm:flex-nowrap flex-shrink-0">
                      <Badge variant="secondary" className="text-xs">
                        {idea.category}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {idea.status}
                      </Badge>
                    </div>
                  </div>
                  {idea.description && (
                    <CardDescription className="line-clamp-2 text-sm mt-1">
                      {idea.description}
                    </CardDescription>
                  )}
                  {idea.placeName && (
                    <CardDescription className="text-xs mt-1">
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

