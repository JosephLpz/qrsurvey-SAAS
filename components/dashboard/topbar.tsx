"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Menu, Settings, LogOut, ChevronDown, Building2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { auth } from "@/lib/firebase"
import { useAuth } from "@/providers/AuthProvider"
import { useLocation } from "@/providers/LocationProvider"
import { signOut } from "firebase/auth"
import { useRouter } from "next/navigation"
import { useState, useRef, useEffect } from "react"

export function DashboardTopbar({
  isSidebarCollapsed = false,
  onToggleSidebar
}: {
  isSidebarCollapsed?: boolean,
  onToggleSidebar?: () => void
}) {
  const router = useRouter()
  const { user } = useAuth()
  const { locations, selectedLocation, setSelectedLocation, loading: locationsLoading } = useLocation()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const locationDropdownRef = useRef<HTMLDivElement>(null)

  const handleLogout = async () => {
    try {
      await signOut(auth)
      router.push("/login")
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  const handleSettings = () => {
    router.push("/dashboard/ajustes")
    setIsDropdownOpen(false)
  }

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
      if (locationDropdownRef.current && !locationDropdownRef.current.contains(event.target as Node)) {
        setIsLocationDropdownOpen(false)
      }
    }

    if (isDropdownOpen || isLocationDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isDropdownOpen, isLocationDropdownOpen])

  return (
    <header className={cn(
      "fixed top-0 right-0 z-[45] h-16 bg-white border-b border-slate-100 shadow-sm transition-all duration-500 ease-in-out",
      isSidebarCollapsed ? "left-0 lg:left-20" : "left-0 lg:left-72"
    )}>
      <div className="flex h-16 items-center justify-between px-6">
        {/* Botón para colapsar/expandir sidebar */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="rounded-xl hover:bg-orange-50 hover:text-orange-600 transition-all"
        >
          <Menu className={cn("h-5 w-5 transition-transform duration-500", isSidebarCollapsed && "rotate-90")} />
        </Button>

        {/* Sedes y Usuario */}
        <div className="flex items-center gap-3">
          {/* Dropdown de Sedes */}
          <div className="hidden md:flex items-center gap-3 relative" ref={locationDropdownRef}>
            <Button
              variant="ghost"
              className="gap-2 h-10 px-3 rounded-xl hover:bg-slate-50 transition-all group"
              onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
            >
              <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center group-hover:bg-orange-100 transition-colors">
                <Building2 className="h-4 w-4 text-orange-600" />
              </div>
              <div className="text-left hidden lg:block">
                <p className="text-xs text-slate-500 leading-none mb-0.5">Sede</p>
                <p className="text-sm font-bold text-slate-900 leading-tight">
                  {selectedLocation?.name || "Todas"}
                </p>
              </div>
              <ChevronDown className={cn(
                "h-4 w-4 text-slate-400 group-hover:text-orange-600 transition-all hidden lg:block",
                isLocationDropdownOpen && "rotate-180"
              )} />
            </Button>

            {/* Dropdown de sedes */}
            {isLocationDropdownOpen && (
              <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl border border-slate-100 shadow-lg p-2 z-[9999] max-h-96 overflow-y-auto">
                <button
                  onClick={() => {
                    setSelectedLocation(null)
                    setIsLocationDropdownOpen(false)
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 rounded-lg py-2.5 px-3 font-medium cursor-pointer hover:bg-slate-50 transition-colors text-left",
                    !selectedLocation && "bg-orange-50 text-orange-600"
                  )}
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                    <Building2 className="h-4 w-4 text-slate-500" />
                  </div>
                  <span>Todas las sedes</span>
                </button>

                {locationsLoading ? (
                  <div className="py-6 text-center text-sm text-slate-400">
                    Cargando sedes...
                  </div>
                ) : locations.length === 0 ? (
                  <div className="py-6 text-center text-sm text-slate-400">
                    No hay sedes registradas
                  </div>
                ) : (
                  <div className="mt-2 pt-2 border-t border-slate-100 space-y-1">
                    {locations.map((location) => (
                      <button
                        key={location.id}
                        onClick={() => {
                          setSelectedLocation(location)
                          setIsLocationDropdownOpen(false)
                        }}
                        className={cn(
                          "w-full flex items-center gap-3 rounded-lg py-2.5 px-3 font-medium cursor-pointer hover:bg-slate-50 transition-colors text-left",
                          selectedLocation?.id === location.id && "bg-orange-50 text-orange-600"
                        )}
                      >
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center",
                          selectedLocation?.id === location.id ? "bg-orange-100" : "bg-slate-100"
                        )}>
                          <Building2 className={cn(
                            "h-4 w-4",
                            selectedLocation?.id === location.id ? "text-orange-600" : "text-slate-500"
                          )} />
                        </div>
                        <span className="flex-1 truncate">{location.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Dropdown de Usuario */}
          <div className="flex items-center gap-3 relative" ref={dropdownRef}>
            <Button
              variant="ghost"
              className="gap-2 h-10 px-3 rounded-xl hover:bg-slate-50 transition-all group"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <Avatar className="h-8 w-8 ring-2 ring-slate-100 group-hover:ring-orange-100 transition-all">
                <AvatarImage src={user?.photoURL || ""} />
                <AvatarFallback className="bg-orange-600 text-white font-bold text-xs">
                  {user?.displayName?.substring(0, 2).toUpperCase() || user?.email?.substring(0, 2).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-bold text-slate-900 leading-tight">
                  {user?.displayName || user?.email?.split('@')[0] || "Usuario"}
                </p>
              </div>
              <ChevronDown className={cn(
                "h-4 w-4 text-slate-400 group-hover:text-orange-600 transition-all hidden sm:block",
                isDropdownOpen && "rotate-180"
              )} />
            </Button>

            {/* Dropdown personalizado */}
            {isDropdownOpen && (
              <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl border border-slate-100 shadow-lg p-2 z-[9999]">
                <div className="px-3 py-2 border-b border-slate-100 mb-2">
                  <p className="text-sm font-bold text-slate-900 truncate">
                    {user?.displayName || "Usuario"}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {user?.email}
                  </p>
                </div>
                <button
                  onClick={handleSettings}
                  className="w-full flex items-center rounded-lg py-2 px-3 font-medium cursor-pointer hover:bg-slate-50 transition-colors text-left"
                >
                  <Settings className="h-4 w-4 mr-2 text-slate-400" />
                  <span>Configuración</span>
                </button>
                <div className="my-2 h-px bg-slate-100" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center rounded-lg py-2 px-3 font-bold text-red-600 hover:bg-red-50 cursor-pointer transition-colors text-left"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
