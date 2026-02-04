"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Loader2, CheckCircle2, XCircle } from "lucide-react"

export default function AddPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [url, setUrl] = useState<string | null>(null)
  const [count, setCount] = useState<number>(0)

  useEffect(() => {
    const urlParam = searchParams.get("url")
    if (urlParam) {
      setUrl(decodeURIComponent(urlParam))
      handleAdd(decodeURIComponent(urlParam))
    } else {
      setError("No URL provided")
      setLoading(false)
    }
  }, [searchParams])

  const handleAdd = async (urlToAdd: string) => {
    setLoading(true)
    setError(null)
    setSuccess(false)
    
    try {
      // Process the URL
      const res = await fetch("/api/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: urlToAdd }),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to process URL")
      }

      const drafts = await res.json()

      if (!drafts || drafts.length === 0) {
        throw new Error("No ideas were created from the URL")
      }

      // Create ideas from drafts
      let successCount = 0
      for (const draft of drafts) {
        const createRes = await fetch("/api/ideas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(draft),
        })
        
        if (createRes.ok) {
          successCount++
        }
      }

      setCount(successCount)
      setSuccess(true)

      toast({
        title: "Success",
        description: `Added ${successCount} idea(s) successfully`,
      })

      // Redirect after a short delay
      setTimeout(() => {
        router.push("/app/ideas")
      }, 2000)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to add idea"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Processing your idea...</p>
            {url && (
              <p className="text-sm text-muted-foreground mt-2 text-center px-4 break-all">
                {url}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
            <CardTitle className="mb-2">Success!</CardTitle>
            <CardDescription className="text-center">
              Added {count} idea(s) successfully
            </CardDescription>
            <p className="text-sm text-muted-foreground mt-4 text-center px-4">
              Redirecting to your ideas...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <XCircle className="h-12 w-12 text-destructive mb-4" />
            <CardTitle className="mb-2">Error</CardTitle>
            <CardDescription className="text-center mb-4">
              {error}
            </CardDescription>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.push("/app")}>
                Go to Dashboard
              </Button>
              <Button onClick={() => router.push("/app/ideas")}>
                View Ideas
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full">
      <Card>
        <CardHeader>
          <CardTitle>Add Idea</CardTitle>
          <CardDescription>
            {url ? `Processing: ${url}` : "No URL provided"}
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}

