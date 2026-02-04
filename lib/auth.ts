import { PrismaAdapter } from "@auth/prisma-adapter"
import GitHubProvider from "next-auth/providers/github"
import GoogleProvider from "next-auth/providers/google"
import { db } from "./db"

export const authOptions = {
  adapter: PrismaAdapter(db) as any,
  session: {
    strategy: "database" as const,
  },
  providers: [
    GitHubProvider({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
    }),
    ...(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
          }),
        ]
      : []),
  ],
  callbacks: {
    session: async ({ session, user }: { session: any; user: any }) => {
      if (session?.user && user) {
        session.user.id = user.id
      }
      return session
    },
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      // If there's a callbackUrl in the URL, use it
      if (url.includes("callbackUrl")) {
        const urlObj = new URL(url, baseUrl)
        const callbackUrl = urlObj.searchParams.get("callbackUrl")
        if (callbackUrl) {
          return `${baseUrl}${callbackUrl}`
        }
      }
      // Default redirect to /app
      if (url === baseUrl || url === `${baseUrl}/`) {
        return `${baseUrl}/app`
      }
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      if (new URL(url).origin === baseUrl) return url
      return `${baseUrl}/app`
    },
  },
  pages: {
    signIn: '/login',
  },
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}

