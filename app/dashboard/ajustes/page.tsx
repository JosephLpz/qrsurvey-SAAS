"use client"

import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AccountSettings } from "@/components/settings/account-settings"
import { TeamSettings } from "@/components/settings/team-settings"
import { LocationSettings } from "@/components/settings/location-settings"
import { BillingSettings } from "@/components/settings/billing-settings"
import { IntegrationSettings } from "@/components/settings/integration-settings"
import { getUserProfile } from "@/lib/services/users"
import { auth } from "@/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { Loader2, Lock, Sparkles } from "lucide-react"

export default function AjustesPage() {
  const [activeTab, setActiveTab] = useState("cuenta")
  const [userPlan, setUserPlan] = useState<"free" | "pro">("free")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const profile = await getUserProfile(user.uid)
          if (profile) setUserPlan(profile.plan)
        } catch (error) {
          console.error("Error fetching user profile:", error)
        } finally {
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
    })
    return () => unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="space-y-1">
        <h1 className="text-4xl font-black tracking-tight text-gray-900">Ajustes</h1>
        <p className="text-muted-foreground text-lg">Gestiona tu cuenta, equipo y configuraciones globales.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="flex flex-wrap h-auto p-1 bg-white/50 border rounded-2xl shadow-sm">
          <TabsTrigger value="cuenta" className="flex-1 min-w-[100px] h-11 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:font-bold transition-all">Cuenta</TabsTrigger>
          <TabsTrigger value="equipo" className="flex-1 min-w-[100px] h-11 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:font-bold transition-all flex items-center justify-center gap-2">
            Equipo
            {userPlan === "free" && <Lock className="h-3 w-3 text-muted-foreground" />}
          </TabsTrigger>
          <TabsTrigger value="sedes" className="flex-1 min-w-[100px] h-11 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:font-bold transition-all">Sedes</TabsTrigger>
          <TabsTrigger value="facturacion" className="flex-1 min-w-[100px] h-11 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:font-bold transition-all">Facturación</TabsTrigger>
          <TabsTrigger value="integraciones" className="flex-1 min-w-[100px] h-11 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:font-bold transition-all flex items-center justify-center gap-2">
            Integraciones
            {userPlan === "free" && <Lock className="h-3 w-3 text-muted-foreground" />}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cuenta">
          <AccountSettings />
        </TabsContent>

        <TabsContent value="equipo">
          {userPlan === "pro" ? (
            <TeamSettings />
          ) : (
            <ProGuard title="Gestión de Equipo" description="Invita a colaboradores, asigna roles y gestiona permisos avanzados de acceso." />
          )}
        </TabsContent>

        <TabsContent value="sedes">
          <LocationSettings />
        </TabsContent>

        <TabsContent value="facturacion">
          <BillingSettings />
        </TabsContent>

        <TabsContent value="integraciones">
          {userPlan === "pro" ? (
            <IntegrationSettings />
          ) : (
            <ProGuard title="Integraciones Avanzadas" description="Conecta QRSurvey con tus herramientas favoritas como HubSpot, Salesforce y más." />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ProGuard({ title, description }: { title: string, description: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-16 text-center bg-white border border-gray-100 rounded-[2.5rem] shadow-xl shadow-slate-200/50 space-y-6 max-w-2xl mx-auto my-10">
      <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center rotate-3 hover:rotate-0 transition-transform duration-500">
        <Sparkles className="h-10 w-10 text-primary animate-pulse" />
      </div>
      <div className="space-y-3">
        <h3 className="text-3xl font-black text-gray-900 tracking-tight">{title} <span className="bg-primary/10 text-primary px-3 py-1 rounded-full italic text-xl ml-2 uppercase">PRO</span></h3>
        <p className="text-slate-500 text-lg leading-relaxed">{description}</p>
      </div>
      <button className="bg-primary hover:bg-primary/90 text-white px-10 py-4 rounded-2xl font-black text-lg shadow-2xl shadow-primary/30 transition-all transform hover:scale-105 active:scale-95">
        Mejorar a Pro ahora
      </button>
      <div className="flex items-center gap-2 pt-2">
        <div className="h-[1px] w-8 bg-slate-200" />
        <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em]">Desbloquea todo el potencial de tu negocio</p>
        <div className="h-[1px] w-8 bg-slate-200" />
      </div>
    </div>
  )
}
