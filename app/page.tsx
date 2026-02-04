import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-muted p-4">
      <div className="w-full max-w-4xl space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
            Wish2Plan
          </h1>
          <p className="text-xl text-muted-foreground sm:text-2xl">
            Save and organize your favorite date ideas
          </p>
          <p className="text-lg text-muted-foreground">
            Paste URLs, extract ideas, and plan your perfect dates
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Button asChild size="lg">
            <Link href="/app">Get Started</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/login">Sign In</Link>
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Save Ideas</CardTitle>
              <CardDescription>
                Paste URLs or text to save your favorite date ideas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Automatically extracts metadata from TikTok, Instagram, and other links
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Organize</CardTitle>
              <CardDescription>
                Categorize and track your ideas on an interactive map
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Filter by category, status, and see all your ideas on a map
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Plan</CardTitle>
              <CardDescription>
                Create plans and export to your calendar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Schedule your dates and export as .ics files
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

