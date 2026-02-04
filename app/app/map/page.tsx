"use client"

import { useEffect, useRef, useState } from "react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { X } from "lucide-react"

interface Idea {
  id: string
  title: string
  description: string | null
  category: string
  status: string
  placeName: string | null
  lat: number | null
  lng: number | null
}

export default function MapPage() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<any>(null)
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const markersRef = useRef<any[]>([])

  useEffect(() => {
    if (!mapContainer.current) return

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
    if (!token) {
      console.error("NEXT_PUBLIC_MAPBOX_TOKEN is not set")
      return
    }

    mapboxgl.accessToken = token

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [-74.006, 40.7128],
      zoom: 10,
    })

    // Wait for map to load before adding markers
    map.current.on("load", () => {
      console.log("Map loaded successfully")
    })

    return () => {
      map.current?.remove()
    }
  }, [])

  useEffect(() => {
    fetchIdeas()
  }, [categoryFilter, statusFilter])

  useEffect(() => {
    if (!map.current) return

    const addMarkersToMap = () => {
      // Clear existing markers
      markersRef.current.forEach((marker) => marker.remove())
      markersRef.current = []

      // Add markers for ideas with coordinates
      const ideasWithCoords = ideas.filter(
        (idea) => idea.lat !== null && idea.lng !== null && !isNaN(idea.lat) && !isNaN(idea.lng)
      )

      console.log(`Found ${ideasWithCoords.length} ideas with coordinates out of ${ideas.length} total ideas`)

      if (ideasWithCoords.length === 0) {
        console.log("No ideas with coordinates found. Ideas:", ideas)
        return
      }

      // Category colors
      const getCategoryColor = (category: string) => {
        switch (category) {
          case "DATE":
            return "#ef4444" // red-500
          case "GIFT":
            return "#3b82f6" // blue-500
          case "MEAL":
            return "#10b981" // green-500
          default:
            return "#6b7280" // gray-500
        }
      }

      const getCategoryIcon = (category: string) => {
        switch (category) {
          case "DATE":
            return "💕"
          case "GIFT":
            return "🎁"
          case "MEAL":
            return "🍽️"
          default:
            return "📍"
        }
      }

      ideasWithCoords.forEach((idea) => {
        const el = document.createElement("div")
        const color = getCategoryColor(idea.category)
        const icon = getCategoryIcon(idea.category)
        
        el.style.cursor = "pointer"
        el.style.width = "32px"
        el.style.height = "32px"
        el.style.borderRadius = "50%"
        el.style.backgroundColor = color
        el.style.border = "3px solid white"
        el.style.boxShadow = "0 2px 8px rgba(0,0,0,0.4)"
        el.style.display = "flex"
        el.style.alignItems = "center"
        el.style.justifyContent = "center"
        el.style.fontSize = "16px"
        el.style.transition = "all 0.2s ease"
        el.style.transformOrigin = "center center"
        el.style.zIndex = "100"
        el.style.position = "relative"
        el.title = idea.title // Tooltip on hover

        // Add icon/text inside
        el.textContent = icon

        // Hover effect - use box shadow and border instead of scale to avoid movement
        el.addEventListener("mouseenter", () => {
          el.style.boxShadow = "0 4px 12px rgba(0,0,0,0.6)"
          el.style.borderWidth = "4px"
          el.style.zIndex = "1000"
        })
        el.addEventListener("mouseleave", () => {
          el.style.boxShadow = "0 2px 8px rgba(0,0,0,0.4)"
          el.style.borderWidth = "3px"
        })

        // Mapbox uses [lng, lat] format
        // Use 'center' anchor to ensure marker stays in place
        const marker = new mapboxgl.Marker({
          element: el,
          anchor: "center",
        })
          .setLngLat([idea.lng!, idea.lat!])
          .addTo(map.current!)

        // Create a popup that shows on click
        const popup = new mapboxgl.Popup({ offset: 25 })
          .setText(idea.title)

        marker.setPopup(popup)

        // Click to show details in side panel
        const handleClick = (e: MouseEvent) => {
          e.stopPropagation()
          e.preventDefault()
          setSelectedIdea(idea)
        }

        el.addEventListener("click", handleClick)
        marker.getElement().addEventListener("click", handleClick)

        markersRef.current.push(marker)
      })

      // Fit map to bounds if there are markers
      if (ideasWithCoords.length > 0 && map.current) {
        const bounds = new mapboxgl.LngLatBounds()
        ideasWithCoords.forEach((idea) => {
          bounds.extend([idea.lng!, idea.lat!])
        })
        map.current.fitBounds(bounds, { padding: 50 })
      }
    }

    // Wait for map to be fully loaded
    if (!map.current.loaded()) {
      map.current.once("load", () => {
        addMarkersToMap()
      })
      return
    }

    addMarkersToMap()
  }, [ideas])


  const fetchIdeas = async () => {
    try {
      const params = new URLSearchParams()
      if (categoryFilter !== "all") params.append("category", categoryFilter)
      if (statusFilter !== "all") params.append("status", statusFilter)

      const res = await fetch(`/api/ideas?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        console.log("Fetched ideas:", data)
        console.log("Ideas with coordinates:", data.filter((i: Idea) => i.lat !== null && i.lng !== null))
        setIdeas(data)
      } else {
        console.error("Failed to fetch ideas:", res.status, res.statusText)
      }
    } catch (error) {
      console.error("Failed to fetch ideas:", error)
    }
  }

  return (
    <div className="flex w-full h-full">
      <div className="flex-1 relative w-full h-full">
        <div ref={mapContainer} className="w-full h-full" />
        <div className="absolute top-4 left-4 z-10 space-y-4">
          <Card className="w-64">
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="DATE">Date</SelectItem>
                    <SelectItem value="GIFT">Gift</SelectItem>
                    <SelectItem value="MEAL">Meal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="SAVED">Saved</SelectItem>
                    <SelectItem value="PLANNED">Planned</SelectItem>
                    <SelectItem value="DONE">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="w-64">
            <CardHeader>
              <CardTitle>Legend</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-6 h-6 rounded-full bg-red-500 border-2 border-white flex items-center justify-center text-xs">
                  💕
                </div>
                <span>Date</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-xs">
                  🎁
                </div>
                <span>Gift</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-6 h-6 rounded-full bg-green-500 border-2 border-white flex items-center justify-center text-xs">
                  🍽️
                </div>
                <span>Meal</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Click a marker to see details
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {selectedIdea && (
        <div className="w-96 border-l bg-background overflow-auto">
          <Card className="border-0 rounded-none h-full">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl">{selectedIdea.title}</CardTitle>
                  {selectedIdea.description && (
                    <CardDescription className="mt-2">
                      {selectedIdea.description}
                    </CardDescription>
                  )}
                </div>
                <button
                  onClick={() => setSelectedIdea(null)}
                  className="p-1 hover:bg-accent rounded transition-colors"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Badge 
                  variant="secondary"
                  className={
                    selectedIdea.category === "DATE" ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" :
                    selectedIdea.category === "GIFT" ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" :
                    selectedIdea.category === "MEAL" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" :
                    ""
                  }
                >
                  {selectedIdea.category}
                </Badge>
                <Badge variant="outline">{selectedIdea.status}</Badge>
              </div>
              {selectedIdea.placeName && (
                <div>
                  <p className="text-sm font-medium mb-1">📍 Location</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedIdea.placeName}
                  </p>
                </div>
              )}
              <div className="pt-4 border-t">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.location.href = `/app/ideas/${selectedIdea.id}`}
                >
                  View Full Details
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

