import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-muted p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl space-y-8 sm:space-y-10 lg:space-y-12 text-center">
        <div className="space-y-3 sm:space-y-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            Wish2Plan
          </h1>
          <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground">
            Save and organize your favorite date ideas
          </p>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            Paste URLs, extract ideas, and plan your perfect dates
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
          <Button asChild size="lg" className="w-full sm:w-auto text-sm sm:text-base h-11 sm:h-12">
            <Link href="/app">Get Started</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto text-sm sm:text-base h-11 sm:h-12">
            <Link href="/login">Sign In</Link>
          </Button>
        </div>

        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 pt-4">
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Save Ideas</CardTitle>
              <CardDescription className="text-sm">
                Paste URLs or text to save your favorite date ideas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Automatically extracts metadata from TikTok, Instagram, and other links
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Organize</CardTitle>
              <CardDescription className="text-sm">
                Categorize and track your ideas on an interactive map
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Filter by category, status, and see all your ideas on a map
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-200 sm:col-span-2 lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Plan</CardTitle>
              <CardDescription className="text-sm">
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

