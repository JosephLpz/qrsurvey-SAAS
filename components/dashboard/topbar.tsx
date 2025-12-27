


"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Search, Bell, ChevronDown, Building2, User, CreditCard, LogOut, Loader2, Menu, TrendingUp, Plus, Eye } from "lucide-react"
import { cn } from "@/lib/utils"
import { auth } from "@/lib/firebase"
import { useAuth } from "@/providers/AuthProvider"
import { signOut } from "firebase/auth"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getLocations, type Location } from "@/lib/services/locations"

export function DashboardTopbar({
  isSidebarCollapsed = false,
  onToggleSidebar
}: {
  isSidebarCollapsed?: boolean,
  onToggleSidebar?: () => void
}) {
  const router = useRouter()
  const { user } = useAuth()
  const [locations, setLocations] = useState<Location[]>([])
  const [selectedSede, setSelectedSede] = useState("Todas las sedes")
  const [loadingLocations, setLoadingLocations] = useState(true)

  useEffect(() => {
    const fetchLocations = async () => {
      const currentUser = auth.currentUser
      if (currentUser) {
        try {
          setLoadingLocations(true)
          const fetchedLocations = await getLocations(currentUser.uid)
          setLocations(fetchedLocations)
        } catch (error) {
          console.error("Error fetching locations:", error)
          setLocations([])
        } finally {
          setLoadingLocations(false)
        }
      } else {
        setLoadingLocations(false)
      }
    }
    fetchLocations()
  }, [])

  const handleLogout = async () => {
    try {
      await signOut(auth)
      router.push("/login")
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  return (
    <header className={cn(
      "fixed top-0 right-0 z-[100] h-20 bg-white/80 backdrop-blur-xl border-b border-slate-100 transition-all duration-500 ease-in-out",
      isSidebarCollapsed ? "left-0 lg:left-20" : "left-0 lg:left-72"
    )} style={{ zIndex: 100, overflow: 'visible' }}>
      <div className="flex h-20 items-center justify-between px-8" style={{ overflow: 'visible' }}>
        <div className="flex items-center gap-6 flex-1 max-w-2xl">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="hidden lg:flex rounded-xl hover:bg-orange-50 hover:text-orange-600 transition-all"
          >
            <Menu className={cn("h-5 w-5 transition-transform duration-500", isSidebarCollapsed && "rotate-90")} />
          </Button>

          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-orange-600 transition-colors" />
            <Input
              type="text"
              placeholder="Buscar encuestas por nombre o ID..."
              className="h-12 pl-12 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-orange-500/20 transition-all font-medium text-slate-900 border-none shadow-inner"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Selector de sede estilo Elite */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="hidden md:flex gap-3 h-12 px-5 rounded-2xl border-slate-100 bg-white hover:bg-orange-50 hover:border-orange-100 transition-all shadow-sm group"
              >
                <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center group-hover:bg-white transition-colors">
                  <Building2 className="h-4 w-4 text-orange-600 shrink-0" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">Sucursal</p>
                  <p className="text-sm font-black text-slate-900 leading-none">{selectedSede}</p>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-400 shrink-0 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 p-2 rounded-2xl border-slate-100 bg-white shadow-2xl" sideOffset={12} style={{ zIndex: 10000 }}>
              <DropdownMenuItem onClick={() => setSelectedSede("Todas las sedes")} className="rounded-xl py-3 px-4 font-bold cursor-pointer">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center mr-3">
                  <Building2 className="h-4 w-4 text-slate-500" />
                </div>
                Todas las sedes
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-2 bg-slate-50" />
              <div className="max-h-[300px] overflow-y-auto space-y-1">
                {loadingLocations ? (
                  <div className="flex justify-center p-6">
                    <Loader2 className="h-6 w-6 animate-spin text-orange-600" />
                  </div>
                ) : locations.length === 0 ? (
                  <div className="px-4 py-6 text-xs text-slate-400 text-center italic font-medium">
                    No hay sedes registradas en tu red.
                  </div>
                ) : (
                  locations.map((loc) => (
                    <DropdownMenuItem
                      key={loc.id}
                      onClick={() => setSelectedSede(loc.name)}
                      className="rounded-xl py-3 px-4 font-bold cursor-pointer hover:bg-orange-50 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center mr-3">
                        <Building2 className="h-4 w-4 text-orange-600" />
                      </div>
                      <span className="flex-1 truncate">{loc.name}</span>
                    </DropdownMenuItem>
                  ))
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notificaciones estilo Elite */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative group bg-slate-50 hover:bg-orange-50 h-12 w-12 rounded-2xl transition-all">
                <Bell className="h-5 w-5 text-slate-400 group-hover:text-orange-600 transition-colors" />
                <span className="absolute top-3 right-3 h-2 w-2 bg-orange-600 rounded-full border-2 border-white ring-4 ring-orange-500/10" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-0 rounded-[2rem] border-slate-100 bg-white shadow-2xl overflow-hidden" sideOffset={12} style={{ zIndex: 10000 }}>
              <div className="p-6 bg-slate-900 text-white">
                <h4 className="font-black text-lg tracking-tight">Notificaciones</h4>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Novedades del centro</p>
              </div>
              <div className="max-h-[350px] overflow-y-auto p-2">
                <DropdownMenuItem className="p-4 rounded-2xl cursor-pointer focus:bg-orange-50 mb-1">
                  <div className="flex gap-4">
                    <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                      <TrendingUp className="h-5 w-5 text-orange-600" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-black text-slate-900 text-sm leading-tight">Nueva respuesta</p>
                      <p className="text-xs text-slate-500 font-medium italic">Satisfacción del cliente - hace 5 min</p>
                    </div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="p-4 rounded-2xl cursor-pointer focus:bg-orange-50 mb-1">
                  <div className="flex gap-4">
                    <div className="h-10 w-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                      <Plus className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-black text-slate-900 text-sm leading-tight">Meta alcanzada</p>
                      <p className="text-xs text-slate-500 font-medium italic">Experiencia en tienda - hace 1 hora</p>
                    </div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="p-4 rounded-2xl cursor-pointer focus:bg-orange-50">
                  <div className="flex gap-4">
                    <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                      <Eye className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-black text-slate-900 text-sm leading-tight">Revisar resultados</p>
                      <p className="text-xs text-slate-500 font-medium italic">Feedback mensual - hace 2 horas</p>
                    </div>
                  </div>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="h-10 w-px bg-slate-100 ml-2" />

          {/* Usuario estilo Elite */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-3 h-14 pl-2 pr-2 sm:pr-5 rounded-2xl hover:bg-slate-50 transition-all group">
                <div className="relative">
                  <Avatar className="h-10 w-10 ring-4 ring-slate-100 group-hover:ring-orange-100 transition-all border-2 border-white">
                    <AvatarImage src={user?.photoURL || ""} />
                    <AvatarFallback className="bg-orange-600 text-white font-black text-xs uppercase">
                      {user?.displayName?.substring(0, 2).toUpperCase() || "UN"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-black text-slate-900 leading-none mb-1">{user?.displayName || "Usuario Nexava"}</p>
                  <div className="flex items-center gap-1.5 leading-none">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                    <span className="text-[10px] font-black uppercase tracking-tighter text-orange-600">Plan Elite Pro</span>
                  </div>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-orange-600 transition-colors hidden sm:block ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 p-2 rounded-2xl border-slate-100 bg-white shadow-2xl" sideOffset={12} style={{ zIndex: 10000 }}>
              <div className="p-4 border-b border-slate-50 mb-2">
                <p className="text-sm font-black text-slate-900 truncate">{user?.displayName || "Usuario Nexava"}</p>
                <p className="text-xs text-slate-500 font-medium truncate italic">{user?.email}</p>
              </div>
              <DropdownMenuItem onClick={() => router.push("/dashboard/ajustes")} className="rounded-xl py-3 px-4 font-bold cursor-pointer hover:bg-slate-50 transition-colors">
                <User className="h-4 w-4 mr-3 opacity-40" />
                <span>Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/dashboard/ajustes?tab=billing")} className="rounded-xl py-3 px-4 font-bold cursor-pointer hover:bg-slate-50 transition-colors">
                <CreditCard className="h-4 w-4 mr-3 opacity-40" />
                <span>Facturación</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-2 bg-slate-50" />
              <DropdownMenuItem
                className="rounded-xl py-3 px-4 font-black text-red-600 focus:bg-red-50 focus:text-red-700 cursor-pointer transition-colors"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-3" />
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

