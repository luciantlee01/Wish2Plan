"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Download, Plus, Trash2, X } from "lucide-react"
import { format } from "date-fns"

interface Plan {
  id: string
  title: string
  scheduledFor: string
  notes: string | null
  planItems: Array<{
    id: string
    sortOrder: number
    idea: {
      id: string
      title: string
      description: string | null
      category: string
      status: string
    }
  }>
}

interface Idea {
  id: string
  title: string
  description: string | null
  category: string
}

export default function PlanDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [plan, setPlan] = useState<Plan | null>(null)
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [formData, setFormData] = useState({
    title: "",
    scheduledFor: "",
    notes: "",
  })

  useEffect(() => {
    fetchPlan()
    fetchIdeas()
  }, [params.id])

  const fetchPlan = async () => {
    try {
      const res = await fetch(`/api/plans/${params.id}`)
      if (res.ok) {
        const data = await res.json()
        setPlan(data)
        setFormData({
          title: data.title,
          scheduledFor: new Date(data.scheduledFor).toISOString().slice(0, 16),
          notes: data.notes || "",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch plan",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
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

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/plans/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          scheduledFor: new Date(formData.scheduledFor).toISOString(),
          notes: formData.notes || null,
        }),
      })

      if (!res.ok) throw new Error("Failed to update")

      toast({
        title: "Success",
        description: "Plan updated successfully",
      })

      fetchPlan()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update plan",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleAddIdea = async (ideaId: string) => {
    try {
      const res = await fetch(`/api/plans/${params.id}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ideaId,
          sortOrder: plan?.planItems.length || 0,
        }),
      })

      if (!res.ok) throw new Error("Failed to add idea")

      toast({
        title: "Success",
        description: "Idea added to plan",
      })

      setAddDialogOpen(false)
      fetchPlan()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add idea",
        variant: "destructive",
      })
    }
  }

  const handleRemoveIdea = async (itemId: string) => {
    try {
      const res = await fetch(`/api/plans/${params.id}/items/${itemId}`, {
        method: "DELETE",
      })

      if (!res.ok) throw new Error("Failed to remove idea")

      toast({
        title: "Success",
        description: "Idea removed from plan",
      })

      fetchPlan()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove idea",
        variant: "destructive",
      })
    }
  }

  const handleExport = async () => {
    try {
      const res = await fetch(`/api/plans/${params.id}/export`)
      if (!res.ok) throw new Error("Failed to export")

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${plan?.title.replace(/[^a-z0-9]/gi, "_")}.ics`
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

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  if (!plan) {
    return <div className="p-8">Plan not found</div>
  }

  const availableIdeas = ideas.filter(
    (idea) => !plan.planItems.some((item) => item.idea.id === idea.id)
  )

  const filteredIdeas = availableIdeas.filter(
    (idea) =>
      idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (idea.description && idea.description.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Plan Details</h1>
          <p className="text-muted-foreground">
            {format(new Date(plan.scheduledFor), "PPP p")}
          </p>
        </div>
        <Button onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Export .ics
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Plan Information</CardTitle>
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
              <Label htmlFor="scheduledFor">Date & Time</Label>
              <Input
                id="scheduledFor"
                type="datetime-local"
                value={formData.scheduledFor}
                onChange={(e) => setFormData({ ...formData, scheduledFor: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={4}
              />
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Ideas in Plan</CardTitle>
              <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Idea
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add Idea to Plan</DialogTitle>
                    <DialogDescription>
                      Search and select ideas to add to this plan
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      placeholder="Search ideas..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <div className="max-h-96 overflow-auto space-y-2">
                      {filteredIdeas.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No ideas found
                        </p>
                      ) : (
                        filteredIdeas.map((idea) => (
                          <Card key={idea.id} className="cursor-pointer hover:bg-accent">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="font-medium">{idea.title}</h4>
                                  {idea.description && (
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                      {idea.description}
                                    </p>
                                  )}
                                  <Badge variant="secondary" className="mt-2">
                                    {idea.category}
                                  </Badge>
                                </div>
                                <Button
                                  size="sm"
                                  onClick={() => handleAddIdea(idea.id)}
                                >
                                  Add
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {plan.planItems.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No ideas in this plan yet
              </p>
            ) : (
              <div className="space-y-2">
                {plan.planItems.map((item) => (
                  <Card key={item.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{item.idea.title}</h4>
                          {item.idea.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {item.idea.description}
                            </p>
                          )}
                          <div className="flex gap-2 mt-2">
                            <Badge variant="secondary">{item.idea.category}</Badge>
                            <Badge variant="outline">{item.idea.status}</Badge>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveIdea(item.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

