"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Plus, Calendar, Download, Sparkles } from "lucide-react"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"

interface Plan {
  id: string
  title: string
  scheduledFor: string
  notes: string | null
  planItems: Array<{
    id: string
    idea: {
      id: string
      title: string
    }
  }>
}

interface Idea {
  id: string
  title: string
  description: string | null
  category: string
  placeName: string | null
  lat: number | null
  lng: number | null
}

export default function PlansPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [itineraryDialogOpen, setItineraryDialogOpen] = useState(false)
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [selectedIdeas, setSelectedIdeas] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState("")
  const [itineraryLoading, setItineraryLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    scheduledFor: "",
    notes: "",
  })

  useEffect(() => {
    fetchPlans()
  }, [])

  useEffect(() => {
    if (itineraryDialogOpen) {
      fetchIdeas()
    }
  }, [itineraryDialogOpen])

  const fetchPlans = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/plans")
      if (res.ok) {
        const data = await res.json()
        setPlans(data)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch plans",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Convert datetime-local to ISO string
      const scheduledForISO = formData.scheduledFor
        ? new Date(formData.scheduledFor).toISOString()
        : null

      if (!scheduledForISO) {
        toast({
          title: "Error",
          description: "Please provide a valid date and time",
          variant: "destructive",
        })
        return
      }

      const res = await fetch("/api/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          scheduledFor: scheduledForISO,
          notes: formData.notes || null,
        }),
      })

      if (!res.ok) throw new Error("Failed to create plan")

      toast({
        title: "Success",
        description: "Plan created successfully",
      })

      setDialogOpen(false)
      setFormData({ title: "", scheduledFor: "", notes: "" })
      fetchPlans()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create plan",
        variant: "destructive",
      })
    }
  }

  const fetchIdeas = async () => {
    try {
      const res = await fetch("/api/ideas")
      if (res.ok) {
        const data = await res.json()
        setIdeas(data)
      }
    } catch (error) {
      console.error("Failed to fetch ideas:", error)
    }
  }

  const handleToggleIdea = (ideaId: string) => {
    const newSelected = new Set(selectedIdeas)
    if (newSelected.has(ideaId)) {
      newSelected.delete(ideaId)
    } else {
      newSelected.add(ideaId)
    }
    setSelectedIdeas(newSelected)
  }

  const getFilteredIdeas = () => {
    return ideas.filter((idea) =>
      idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (idea.description &&
        idea.description.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  }

  const handleSelectAll = () => {
    const filtered = getFilteredIdeas()
    if (selectedIdeas.size === filtered.length) {
      setSelectedIdeas(new Set())
    } else {
      setSelectedIdeas(new Set(filtered.map((i) => i.id)))
    }
  }

  // Optimize order by location if coordinates exist
  const optimizeOrder = (ideaIds: string[]): string[] => {
    const ideasWithCoords = ideaIds
      .map((id) => {
        const idea = ideas.find((i) => i.id === id)
        return idea && idea.lat && idea.lng ? { id, lat: idea.lat, lng: idea.lng } : null
      })
      .filter((item): item is { id: string; lat: number; lng: number } => item !== null)

    const ideasWithoutCoords = ideaIds.filter(
      (id) => !ideasWithCoords.some((item) => item.id === id)
    )

    // Simple nearest neighbor for ideas with coordinates
    if (ideasWithCoords.length <= 1) {
      return [...ideasWithCoords.map((i) => i.id), ...ideasWithoutCoords]
    }

    const ordered: string[] = []
    const remaining = [...ideasWithCoords]
    let current = remaining.shift()!

    ordered.push(current.id)

    while (remaining.length > 0) {
      let nearest = remaining[0]
      let minDist = Infinity

      for (const item of remaining) {
        const dist = Math.sqrt(
          Math.pow(item.lat - current.lat, 2) + Math.pow(item.lng - current.lng, 2)
        )
        if (dist < minDist) {
          minDist = dist
          nearest = item
        }
      }

      ordered.push(nearest.id)
      current = nearest
      const index = remaining.findIndex((i) => i.id === nearest.id)
      remaining.splice(index, 1)
    }

    return [...ordered, ...ideasWithoutCoords]
  }

  const handleCreateItinerary = async () => {
    if (selectedIdeas.size === 0) {
      toast({
        title: "Error",
        description: "Please select at least one idea",
        variant: "destructive",
      })
      return
    }

    if (!formData.title || !formData.scheduledFor) {
      toast({
        title: "Error",
        description: "Please provide a title and date",
        variant: "destructive",
      })
      return
    }

    setItineraryLoading(true)
    try {
      // Convert datetime-local to ISO string
      const scheduledForISO = formData.scheduledFor
        ? new Date(formData.scheduledFor).toISOString()
        : null

      if (!scheduledForISO) {
        toast({
          title: "Error",
          description: "Please provide a valid date and time",
          variant: "destructive",
        })
        setItineraryLoading(false)
        return
      }

      // Create the plan
      const planRes = await fetch("/api/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          scheduledFor: scheduledForISO,
          notes: formData.notes || null,
        }),
      })

      if (!planRes.ok) throw new Error("Failed to create plan")

      const plan = await planRes.json()

      // Optimize order
      const orderedIdeaIds = optimizeOrder(Array.from(selectedIdeas))

      // Add all ideas to the plan
      for (let i = 0; i < orderedIdeaIds.length; i++) {
        const ideaId = orderedIdeaIds[i]
        const itemRes = await fetch(`/api/plans/${plan.id}/items`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ideaId,
            sortOrder: i,
          }),
        })

        if (!itemRes.ok) {
          console.error(`Failed to add idea ${ideaId} to plan`)
        }
      }

      toast({
        title: "Success",
        description: `Created itinerary with ${selectedIdeas.size} idea(s)`,
      })

      setItineraryDialogOpen(false)
      setSelectedIdeas(new Set())
      setFormData({ title: "", scheduledFor: "", notes: "" })
      setSearchQuery("")
      fetchPlans()
      router.push(`/app/plans/${plan.id}`)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create itinerary",
        variant: "destructive",
      })
    } finally {
      setItineraryLoading(false)
    }
  }

  const handleExport = async (planId: string) => {
    try {
      const res = await fetch(`/api/plans/${planId}/export`)
      if (!res.ok) throw new Error("Failed to export")

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `plan.ics`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "Success",
        description: "Plan exported successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export plan",
        variant: "destructive",
      })
    }
  }

  const filteredIdeas = getFilteredIdeas()

  return (
    <div className="w-full">
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Plans</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Create and manage your date plans
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Dialog open={itineraryDialogOpen} onOpenChange={setItineraryDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="default">
                <Sparkles className="mr-2 h-4 w-4" />
                Auto Itinerary
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
              <DialogHeader>
                <DialogTitle>Create Auto Itinerary</DialogTitle>
                <DialogDescription>
                  Select ideas and we'll create an optimized plan for you
                </DialogDescription>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="itinerary-title">Plan Title *</Label>
                    <Input
                      id="itinerary-title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., Saturday Date Night"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="itinerary-date">Date & Time *</Label>
                    <Input
                      id="itinerary-date"
                      type="datetime-local"
                      value={formData.scheduledFor}
                      onChange={(e) => setFormData({ ...formData, scheduledFor: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="itinerary-notes">Notes</Label>
                    <Textarea
                      id="itinerary-notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={2}
                      placeholder="Optional notes about this plan..."
                    />
                  </div>
                </div>

                <div className="space-y-3 border-t pt-4">
                  <div className="flex items-center justify-between">
                    <Label>Select Ideas ({selectedIdeas.size} selected)</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleSelectAll}
                    >
                      {selectedIdeas.size === filteredIdeas.length && filteredIdeas.length > 0
                        ? "Deselect All"
                        : "Select All"}
                    </Button>
                  </div>
                  <Input
                    placeholder="Search ideas..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {filteredIdeas.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        No ideas found
                      </p>
                    ) : (
                      filteredIdeas.map((idea) => (
                        <Card
                          key={idea.id}
                          className={`cursor-pointer transition-colors ${
                            selectedIdeas.has(idea.id)
                              ? "border-primary bg-primary/5"
                              : "hover:bg-accent"
                          }`}
                          onClick={() => handleToggleIdea(idea.id)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <Checkbox
                                checked={selectedIdeas.has(idea.id)}
                                onCheckedChange={() => handleToggleIdea(idea.id)}
                                onClick={(e) => e.stopPropagation()}
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm sm:text-base">{idea.title}</h4>
                                {idea.description && (
                                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mt-1">
                                    {idea.description}
                                  </p>
                                )}
                                <div className="flex gap-2 mt-2 flex-wrap">
                                  <Badge variant="secondary" className="text-xs">
                                    {idea.category}
                                  </Badge>
                                  {idea.placeName && (
                                    <Badge variant="outline" className="text-xs">
                                      📍 {idea.placeName}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setItineraryDialogOpen(false)
                    setSelectedIdeas(new Set())
                    setSearchQuery("")
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateItinerary}
                  disabled={itineraryLoading || selectedIdeas.size === 0}
                >
                  {itineraryLoading ? "Creating..." : `Create Itinerary (${selectedIdeas.size})`}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                New Plan
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Plan</DialogTitle>
                <DialogDescription>
                  Schedule a date and add ideas to it
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scheduledFor">Date & Time *</Label>
                  <Input
                    id="scheduledFor"
                    type="datetime-local"
                    value={formData.scheduledFor}
                    onChange={(e) => setFormData({ ...formData, scheduledFor: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                  />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 sm:py-16 text-muted-foreground">Loading...</div>
      ) : plans.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16">
            <Calendar className="mb-4 h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground" />
            <p className="text-sm sm:text-base text-muted-foreground mb-4 text-center">
              No plans yet
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button onClick={() => setItineraryDialogOpen(true)}>
                <Sparkles className="mr-2 h-4 w-4" />
                Create Auto Itinerary
              </Button>
              <Button variant="outline" onClick={() => setDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Plan
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
            >
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl line-clamp-2">{plan.title}</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  {format(new Date(plan.scheduledFor), "PPP p")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {plan.notes && (
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                    {plan.notes}
                  </p>
                )}
                <div>
                  <p className="text-xs sm:text-sm font-medium mb-2">
                    {plan.planItems.length} idea{plan.planItems.length !== 1 ? "s" : ""}
                  </p>
                  <ul className="text-xs sm:text-sm text-muted-foreground space-y-1">
                    {plan.planItems.slice(0, 3).map((item) => (
                      <li key={item.id} className="line-clamp-1">• {item.idea.title}</li>
                    ))}
                    {plan.planItems.length > 3 && (
                      <li>... and {plan.planItems.length - 3} more</li>
                    )}
                  </ul>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 text-xs sm:text-sm" asChild>
                    <Link href={`/app/plans/${plan.id}`}>View</Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleExport(plan.id)}
                    className="flex-shrink-0"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
