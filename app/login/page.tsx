"use client"

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold">Welcome to Wish2Plan</CardTitle>
          <CardDescription>
            Sign in to start saving and organizing your date ideas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            className="w-full"
            onClick={() => signIn("github", { callbackUrl: "/app" })}
          >
            Sign in with GitHub
          </Button>
          {process.env.NEXT_PUBLIC_GOOGLE_ENABLED === "true" && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => signIn("google", { callbackUrl: "/app" })}
            >
              Sign in with Google
            </Button>
          )}
          <div className="text-center text-sm text-muted-foreground">
            <Link href="/" className="underline">
              Back to home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

