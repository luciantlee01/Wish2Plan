"use client"

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted p-4 sm:p-6">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-2 text-center px-6 pt-8 pb-6">
          <CardTitle className="text-2xl sm:text-3xl font-bold tracking-tight">
            Welcome to Wish2Plan
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Sign in to start saving and organizing your date ideas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 px-6 pb-8">
          <Button
            className="w-full h-11 text-sm sm:text-base"
            onClick={() => signIn("github", { callbackUrl: "/app" })}
          >
            Sign in with GitHub
          </Button>
          {process.env.NEXT_PUBLIC_GOOGLE_ENABLED === "true" && (
            <Button
              variant="outline"
              className="w-full h-11 text-sm sm:text-base"
              onClick={() => signIn("google", { callbackUrl: "/app" })}
            >
              Sign in with Google
            </Button>
          )}
          <div className="text-center text-sm text-muted-foreground pt-2">
            <Link href="/" className="underline hover:text-foreground transition-colors">
              Back to home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

