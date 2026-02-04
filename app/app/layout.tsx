import { redirect } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { auth } from "@/lib/auth-server"
import { AppLayoutWrapper } from "@/components/app-layout-wrapper"

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
      <AppLayoutWrapper>
        {children}
      </AppLayoutWrapper>
    </div>
  )
}

