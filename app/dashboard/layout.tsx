"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/providers/AuthProvider"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardTopbar } from "@/components/dashboard/topbar"
import { getUserProfile, UserProfile } from "@/lib/services/users"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const FREE_ALLOWED_PATHS = ["/dashboard/crear", "/dashboard/encuestas", "/dashboard/ajustes"]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
      return
    }

    if (user) {
      const fetchProfile = async () => {
        try {
          const profile = await getUserProfile(user.uid)
          setUserProfile(profile)

          // RBAC logic
          if (profile?.plan === "free") {
            const isAllowed = FREE_ALLOWED_PATHS.some(path => pathname.startsWith(path))
            if (!isAllowed) {
              router.push("/dashboard/encuestas")
            }
          }
        } catch (error) {
          console.error("Error fetching user profile:", error)
        } finally {
          setLoading(false)
        }
      }
      fetchProfile()
    }
  }, [user, authLoading, router, pathname])

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  if (loading) {
    // ... existing loading state ...
  }

  return (
    <div className="min-h-screen bg-white">
      <DashboardSidebar
        plan={userProfile?.plan || "free"}
        isCollapsed={isSidebarCollapsed}
      />
      <div className={cn(
        "transition-all duration-500 ease-in-out",
        isSidebarCollapsed ? "lg:pl-20" : "lg:pl-72"
      )}>
        <DashboardTopbar
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
        <main className="pt-24 p-6 lg:p-10">{children}</main>
      </div>
    </div>
  )
}
