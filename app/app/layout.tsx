import { redirect } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { auth } from "@/lib/auth-server"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar />
      <main className="flex-1 overflow-y-auto pt-16 lg:pt-0 scrollbar-thin">
        <div className="w-full px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}

