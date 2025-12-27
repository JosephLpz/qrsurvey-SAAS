"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { BarChart3, FileText, Settings, Plus, TrendingUp, PieChart, FileBarChart } from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: BarChart3, requiredPlan: "pro" },
  { name: "Crear encuesta", href: "/dashboard/crear", icon: Plus, requiredPlan: "free" },
  { name: "Mis encuestas", href: "/dashboard/encuestas", icon: FileText, requiredPlan: "free" },
  { name: "Resultados", href: "/dashboard/resultados", icon: PieChart, requiredPlan: "pro" },
  { name: "Analytics", href: "/dashboard/analytics", icon: TrendingUp, requiredPlan: "pro" },
  { name: "Reportes", href: "/dashboard/reportes", icon: FileBarChart, requiredPlan: "pro" },
  { name: "Ajustes", href: "/dashboard/ajustes", icon: Settings, requiredPlan: "free" },
]

export function DashboardSidebar({
  plan = "free",
  isCollapsed = false
}: {
  plan?: "free" | "pro",
  isCollapsed?: boolean
}) {
  const pathname = usePathname()

  const filteredNavigation = navigation.filter(item => {
    if (plan === "pro") return true // Pro sees everything
    return item.requiredPlan === "free"
  })

  return (
    <div className={cn(
      "fixed inset-y-0 left-0 z-50 bg-white border-r border-slate-100 lg:block hidden transition-all duration-500 ease-in-out overflow-hidden",
      isCollapsed ? "w-20" : "w-72"
    )}>
      <div className={cn(
        "flex h-20 items-center border-b border-slate-50 transition-all duration-500",
        isCollapsed ? "px-6" : "px-8"
      )}>
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-2xl font-black text-orange-600 shrink-0">N</span>
          {!isCollapsed && (
            <div className="flex items-center gap-1 animate-in fade-in slide-in-from-left-2 duration-500">
              <span className="text-2xl font-black text-orange-600">exava</span>
              <span className="text-2xl font-black text-slate-900">QRS</span>
            </div>
          )}
        </Link>
      </div>

      <nav className={cn(
        "mt-8 transition-all duration-500",
        isCollapsed ? "px-3" : "px-4"
      )}>
        <ul className="space-y-2">
          {filteredNavigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  title={isCollapsed ? item.name : ""}
                  className={cn(
                    "flex items-center rounded-2xl transition-all duration-300 group overflow-hidden",
                    isCollapsed ? "justify-center w-12 h-12 mx-auto p-0" : "gap-3 px-4 py-3.5",
                    isActive
                      ? "bg-orange-600 text-white shadow-lg shadow-orange-100"
                      : "text-slate-500 hover:bg-orange-50 hover:text-orange-600",
                  )}
                >
                  <item.icon className={cn(
                    "h-5 w-5 shrink-0 transition-transform duration-300",
                    isActive ? "text-white" : "text-slate-400 group-hover:text-orange-600 group-hover:scale-110"
                  )} />
                  {!isCollapsed && (
                    <span className="font-bold text-sm truncate animate-in fade-in slide-in-from-left-2 duration-500">
                      {item.name}
                    </span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Pro Badge in Sidebar */}
      {plan === "free" && (
        <div className={cn(
          "absolute bottom-8 transition-all duration-500",
          isCollapsed ? "left-2 right-2" : "left-4 right-4"
        )}>
          <div className={cn(
            "bg-slate-900 rounded-[2rem] text-white relative overflow-hidden group transition-all duration-500",
            isCollapsed ? "p-3 h-12 flex items-center justify-center rounded-2xl" : "p-6"
          )}>
            <div className="absolute top-0 right-0 -mr-4 -mt-4 w-20 h-20 bg-orange-600 rounded-full blur-2xl opacity-50 group-hover:opacity-80 transition-opacity" />

            {isCollapsed ? (
              <TrendingUp className="h-5 w-5 text-orange-500 relative z-10" />
            ) : (
              <div className="relative z-10 space-y-3 animate-in fade-in duration-500">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">Upgrade</div>
                <h4 className="text-sm font-black leading-tight">Desbloquea el poder del Analytics Lab</h4>
                <Link href="/dashboard/ajustes?tab=billing">
                  <button className="w-full mt-2 py-2 bg-white text-slate-900 text-xs font-black rounded-xl hover:bg-orange-600 hover:text-white transition-colors">
                    Prueba Pro
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
