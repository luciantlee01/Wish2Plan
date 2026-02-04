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
import { X, Filter, SlidersHorizontal } from "lucide-react"

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
  const [showLegend, setShowLegend] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
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
      attributionControl: false, // We'll add custom attribution
    })

    // Add custom attribution
    map.current.addControl(new mapboxgl.AttributionControl({
      compact: true,
    }), 'bottom-right')

    // Wait for map to load before adding markers
    map.current.on("load", () => {
      console.log("Map loaded successfully")
      // Resize map to ensure proper rendering
      map.current?.resize()
    })

    // Handle resize
    const handleResize = () => {
      if (map.current) {
        setTimeout(() => {
          map.current?.resize()
        }, 100)
      }
    }
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
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


  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Resize map when container size changes
  useEffect(() => {
    if (map.current && mapContainer.current) {
      const resizeObserver = new ResizeObserver(() => {
        setTimeout(() => {
          map.current?.resize()
        }, 100)
      })
      resizeObserver.observe(mapContainer.current)
      return () => resizeObserver.disconnect()
    }
  }, [map.current])

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
    <div className="flex flex-col lg:flex-row w-full h-[calc(100vh-4rem)] lg:h-screen">
      <div className="flex-1 relative w-full h-full min-h-[400px]">
        <div ref={mapContainer} className="w-full h-full absolute inset-0" />
        
        {/* Filters - Mobile: button with dropdown, Desktop: always visible card */}
        {isMobile ? (
          <>
            <div className="absolute top-2 left-2 z-10">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="shadow-lg"
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
            {showFilters && (
              <>
                <div
                  className="fixed inset-0 bg-black/50 z-40"
                  onClick={() => setShowFilters(false)}
                />
                <Card className="absolute top-12 left-2 right-2 z-50 shadow-xl max-h-[60vh] overflow-y-auto">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Filters</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowFilters(false)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 pb-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Category</label>
                      <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="h-10">
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
                        <SelectTrigger className="h-10">
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
                    <Button
                      variant="default"
                      className="w-full"
                      onClick={() => setShowFilters(false)}
                    >
                      Apply Filters
                    </Button>
                  </CardContent>
                </Card>
              </>
            )}
          </>
        ) : (
          <div className="absolute top-4 left-4 z-10">
            <Card className="w-64">
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Filters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="h-10">
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
                    <SelectTrigger className="h-10">
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
          </div>
        )}

        {/* Legend - Mobile: collapsible button, Desktop: always visible */}
        {isMobile ? (
          <div className="absolute bottom-4 right-4 z-10">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowLegend(!showLegend)}
              className="shadow-lg"
            >
              {showLegend ? "Hide" : "Legend"}
            </Button>
            {showLegend && (
              <Card className="absolute bottom-12 right-0 w-48 shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Legend</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-5 h-5 rounded-full bg-red-500 border-2 border-white flex items-center justify-center text-[10px] flex-shrink-0">
                      💕
                    </div>
                    <span>Date</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-5 h-5 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-[10px] flex-shrink-0">
                      🎁
                    </div>
                    <span>Gift</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-5 h-5 rounded-full bg-green-500 border-2 border-white flex items-center justify-center text-[10px] flex-shrink-0">
                      🍽️
                    </div>
                    <span>Meal</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div className="absolute top-4 left-[280px] z-10">
            <Card className="w-48">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Legend</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-6 h-6 rounded-full bg-red-500 border-2 border-white flex items-center justify-center text-xs flex-shrink-0">
                    💕
                  </div>
                  <span>Date</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-xs flex-shrink-0">
                    🎁
                  </div>
                  <span>Gift</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-6 h-6 rounded-full bg-green-500 border-2 border-white flex items-center justify-center text-xs flex-shrink-0">
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
        )}
      </div>

      {/* Selected Idea Panel - Mobile: modal overlay, Desktop: side panel */}
      {selectedIdea && (
        <>
          {isMobile && (
            <div
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setSelectedIdea(null)}
            />
          )}
          <div
            className={`${
              isMobile
                ? "fixed inset-x-4 bottom-4 top-20 z-50 max-h-[70vh]"
                : "w-96 border-l bg-background"
            } overflow-auto shadow-lg lg:shadow-none`}
          >
            <Card className={`${isMobile ? "h-full" : "border-0 rounded-none h-full"}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-2">
                    <CardTitle className="text-lg sm:text-xl">{selectedIdea.title}</CardTitle>
                    {selectedIdea.description && (
                      <CardDescription className="mt-2 line-clamp-3">
                        {selectedIdea.description}
                      </CardDescription>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedIdea(null)}
                    className="p-1 hover:bg-accent rounded transition-colors flex-shrink-0"
                    aria-label="Close"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2 flex-wrap">
                  <Badge
                    variant="secondary"
                    className={
                      selectedIdea.category === "DATE"
                        ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        : selectedIdea.category === "GIFT"
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                        : selectedIdea.category === "MEAL"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : ""
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
                    onClick={() => (window.location.href = `/app/ideas/${selectedIdea.id}`)}
                  >
                    View Full Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}

