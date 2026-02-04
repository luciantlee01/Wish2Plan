"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { MapPin, ExternalLink, Trash2 } from "lucide-react"
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
  placeAddress: string | null
  lat: number | null
  lng: number | null
  rawText: string | null
}

interface GeocodeResult {
  id: string
  placeName: string
  placeAddress: string
  lat: number
  lng: number
}

export default function IdeaDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [idea, setIdea] = useState<Idea | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [placeSearch, setPlaceSearch] = useState("")
  const [placeResults, setPlaceResults] = useState<GeocodeResult[]>([])
  const [showPlaceSearch, setShowPlaceSearch] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "DATE",
    status: "SAVED",
  })

  useEffect(() => {
    fetchIdea()
  }, [params.id])

  useEffect(() => {
    if (placeSearch.length > 2) {
      const timeout = setTimeout(() => {
        searchPlaces()
      }, 500)
      return () => clearTimeout(timeout)
    } else {
      setPlaceResults([])
    }
  }, [placeSearch])

  const fetchIdea = async () => {
    try {
      const res = await fetch(`/api/ideas`)
      if (res.ok) {
        const ideas = await res.json()
        const found = ideas.find((i: Idea) => i.id === params.id)
        if (found) {
          setIdea(found)
          setFormData({
            title: found.title,
            description: found.description || "",
            category: found.category,
            status: found.status,
          })
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch idea",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const searchPlaces = async () => {
    try {
      const res = await fetch("/api/geocode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: placeSearch }),
      })

      if (res.ok) {
        const results = await res.json()
        setPlaceResults(results)
      }
    } catch (error) {
      console.error("Geocode error:", error)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/ideas/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!res.ok) throw new Error("Failed to update")

      toast({
        title: "Success",
        description: "Idea updated successfully",
      })

      fetchIdea()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update idea",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleAttachPlace = async (place: GeocodeResult) => {
    setSaving(true)
    try {
      const res = await fetch(`/api/ideas/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          placeName: place.placeName,
          placeAddress: place.placeAddress,
          lat: place.lat,
          lng: place.lng,
        }),
      })

      if (!res.ok) throw new Error("Failed to attach place")

      toast({
        title: "Success",
        description: "Place attached successfully",
      })

      setPlaceSearch("")
      setPlaceResults([])
      setShowPlaceSearch(false)
      fetchIdea()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to attach place",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this idea?")) return

    try {
      const res = await fetch(`/api/ideas/${params.id}`, {
        method: "DELETE",
      })

      if (!res.ok) throw new Error("Failed to delete")

      toast({
        title: "Success",
        description: "Idea deleted successfully",
      })

      router.push("/app/ideas")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete idea",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  if (!idea) {
    return <div className="p-8">Idea not found</div>
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Edit Idea</h1>
          <p className="text-muted-foreground">Update your idea details</p>
        </div>
        <Button variant="destructive" onClick={handleDelete}>
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DATE">Date</SelectItem>
                    <SelectItem value="GIFT">Gift</SelectItem>
                    <SelectItem value="MEAL">Meal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SAVED">Saved</SelectItem>
                    <SelectItem value="PLANNED">Planned</SelectItem>
                    <SelectItem value="DONE">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {idea.imageUrl && (
            <Card>
              <CardContent className="p-0">
                <div className="relative h-64 w-full">
                  <Image
                    src={idea.imageUrl}
                    alt={idea.title}
                    fill
                    className="object-cover rounded-t-lg"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {idea.placeName ? (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4" />
                    <span className="font-medium">{idea.placeName}</span>
                  </div>
                  {idea.placeAddress && (
                    <p className="text-sm text-muted-foreground ml-6">
                      {idea.placeAddress}
                    </p>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      setShowPlaceSearch(true)
                      setPlaceSearch("")
                    }}
                  >
                    Change Location
                  </Button>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    No location attached
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setShowPlaceSearch(true)}
                  >
                    <MapPin className="mr-2 h-4 w-4" />
                    Attach a Place
                  </Button>
                </div>
              )}

              {showPlaceSearch && (
                <div className="space-y-2">
                  <Input
                    placeholder="Search for a place..."
                    value={placeSearch}
                    onChange={(e) => setPlaceSearch(e.target.value)}
                  />
                  {placeResults.length > 0 && (
                    <div className="border rounded-lg divide-y max-h-48 overflow-auto">
                      {placeResults.map((place) => (
                        <button
                          key={place.id}
                          className="w-full text-left p-3 hover:bg-accent transition-colors"
                          onClick={() => handleAttachPlace(place)}
                        >
                          <div className="font-medium">{place.placeName}</div>
                          <div className="text-sm text-muted-foreground">
                            {place.placeAddress}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowPlaceSearch(false)
                      setPlaceSearch("")
                      setPlaceResults([])
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {idea.url && (
            <Card>
              <CardHeader>
                <CardTitle>Source</CardTitle>
              </CardHeader>
              <CardContent>
                <a
                  href={idea.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-primary hover:underline"
                >
                  <ExternalLink className="h-4 w-4" />
                  {idea.url}
                </a>
              </CardContent>
            </Card>
          )}

          {idea.rawText && (
            <Card>
              <CardHeader>
                <CardTitle>Original Text</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{idea.rawText}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

