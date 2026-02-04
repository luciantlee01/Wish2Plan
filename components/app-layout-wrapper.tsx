"use client"

import { usePathname } from "next/navigation"

export function AppLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isMapPage = pathname === "/app/map"

  return (
    <main className={`flex-1 overflow-hidden pt-16 lg:pt-0 ${isMapPage ? "" : "overflow-y-auto scrollbar-thin"}`}>
      {isMapPage ? (
        <div className="w-full h-full">
          {children}
        </div>
      ) : (
        <div className="w-full px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-7xl mx-auto">
          {children}
        </div>
      )}
    </main>
  )
}

