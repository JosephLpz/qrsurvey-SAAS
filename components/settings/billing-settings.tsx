"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CreditCard, Download, ArrowUpRight, Calendar, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { getUserProfile } from "@/lib/services/users"
import { auth } from "@/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { toast } from "sonner"
import { getUserUsage, PLAN_LIMITS, UserUsage } from "@/lib/services/quotas"

const billingHistory = [
  {
    id: 1,
    date: "15 Mar 2024",
    description: "Plan Pro - Marzo 2024",
    amount: "$19.00",
    status: "Pagado",
    invoice: "INV-001",
  },
  {
    id: 2,
    date: "15 Feb 2024",
    description: "Plan Pro - Febrero 2024",
    amount: "$19.00",
    status: "Pagado",
    invoice: "INV-002",
  },
  {
    id: 3,
    date: "15 Ene 2024",
    description: "Plan Pro - Enero 2024",
    amount: "$19.00",
    status: "Pagado",
    invoice: "INV-003",
  },
]

export function BillingSettings() {
  const [plan, setPlan] = useState<"free" | "pro">("free")
  const [userProfile, setUserProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [usage, setUsage] = useState<UserUsage | null>(null)

  useEffect(() => {
    let pollInterval: NodeJS.Timeout

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const [profile, usageData] = await Promise.all([
            getUserProfile(user.uid),
            getUserUsage(user.uid)
          ])
          if (profile) {
            setPlan(profile.plan)
            setUserProfile(profile)
            setUsage(usageData)

            // If we are waiting for a success confirmation but plan is still free
            const params = new URLSearchParams(window.location.search)
            if (params.get("success") && profile.plan === "free") {
              setLoading(true)
              // Poll every 2 seconds to see if the plan has changed
              pollInterval = setInterval(async () => {
                const updatedProfile = await getUserProfile(user.uid)
                if (updatedProfile?.plan === "pro") {
                  setPlan("pro")
                  setUserProfile(updatedProfile)
                  setLoading(false)
                  clearInterval(pollInterval)
                  toast.success("¡Bienvenido al plan Pro!", {
                    description: "Tu suscripción se ha activado correctamente."
                  })
                }
              }, 2000)
            } else if (params.get("success") && profile.plan === "pro") {
              toast.success("¡Bienvenido al plan Pro!", {
                description: "Tu suscripción se ha activado correctamente."
              })
            }
          }
        } catch (error) {
          console.error("Error fetching billing data:", error)
        } finally {
          const params = new URLSearchParams(window.location.search)
          if (!params.get("success") || (userProfile && userProfile.plan === "pro")) {
            setLoading(false)
          }
        }
      }
    })

    // Handle query params for Payment feedback
    const params = new URLSearchParams(window.location.search)
    if (params.get("canceled")) {
      toast.error("Pago cancelado", {
        description: "No se realizó ningún cargo en tu tarjeta."
      })
    }
    if (params.get("pending")) {
      toast.info("Pago en proceso", {
        description: "Estamos esperando la confirmación de Flow. Esto puede tardar unos minutos."
      })
    }
    if (params.get("error")) {
      toast.error("Error en el proceso de pago", {
        description: "Hubo un problema al procesar tu pago. Por favor, intenta de nuevo o contacta a soporte."
      })
    }

    return () => {
      unsubscribe()
      if (pollInterval) clearInterval(pollInterval)
    }
  }, [])

  const handleUpgrade = async () => {
    try {
      setIsRedirecting(true)
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userProfile.uid,
          userEmail: userProfile.email,
        }),
      })

      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        toast.error("Error al iniciar el pago")
      }
    } catch (error) {
      console.error("Upgrade error:", error)
      toast.error("Ocurrió un error inesperado")
    } finally {
      setIsRedirecting(false)
    }
  }

  const handleManageSubscription = async () => {
    toast.info("Gestión de suscripción", {
      description: "Por favor, gestiona tu suscripción desde tu panel de Flow.cl o contacta a soporte si necesitas ayuda."
    })
  }

  if (loading) return (
    <div className="flex justify-center p-12">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Plan actual</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold">Plan {plan === "pro" ? "Profesional" : "Gratuito"}</h3>
              <p className="text-muted-foreground">{plan === "pro" ? "$19.00 USD/mes" : "$0 USD/mes"}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge className={plan === "pro" ? "bg-primary" : "bg-slate-400"}>
                {userProfile?.cancelAtPeriodEnd ? "Cancelación pendiente" : "Activo"}
              </Badge>
              {userProfile?.cancelAtPeriodEnd && (
                <span className="text-xs text-amber-600 font-medium">No se renovará</span>
              )}
            </div>
          </div>

          {userProfile?.cancelAtPeriodEnd && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
              <p className="font-semibold">Suscripción cancelada</p>
              <p>Tu acceso Pro seguirá activo hasta el final del periodo facturado. Después volverás al plan gratuito.</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Respuestas utilizadas</span>
                <span>{usage?.responses.toLocaleString() || 0} / {plan === "pro" ? PLAN_LIMITS.pro.responses.toLocaleString() : PLAN_LIMITS.free.responses.toLocaleString()}</span>
              </div>
              <Progress value={usage ? (usage.responses / (plan === "pro" ? PLAN_LIMITS.pro.responses : PLAN_LIMITS.free.responses)) * 100 : 0} className="h-2" />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Encuestas creadas</span>
                <span>{usage?.surveys || 0} / {plan === "pro" ? PLAN_LIMITS.pro.surveys : PLAN_LIMITS.free.surveys}</span>
              </div>
              <Progress value={usage ? (usage.surveys / (plan === "pro" ? PLAN_LIMITS.pro.surveys : PLAN_LIMITS.free.surveys)) * 100 : 0} className="h-2" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">
                  {userProfile?.cancelAtPeriodEnd ? "Vence el" : "Próxima facturación"}
                </div>
                <div className="font-medium">
                  {plan === "pro"
                    ? (userProfile?.currentPeriodEnd ? new Date(userProfile.currentPeriodEnd).toLocaleDateString() : "Cargando...")
                    : "-"
                  }
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Método de pago</div>
                <div className="font-medium">{plan === "pro" ? "•••• •••• •••• 4242" : "No configurado"}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Estado</div>
                <div className="font-medium text-green-600">
                  {userProfile?.cancelAtPeriodEnd ? "Finalizando" : plan === "pro" ? "Al día" : "Gratis"}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            {plan === "free" ? (
              <Button
                onClick={handleUpgrade}
                disabled={isRedirecting}
                className="bg-primary hover:bg-primary/90 font-bold shadow-lg shadow-primary/20"
              >
                {isRedirecting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ArrowUpRight className="h-4 w-4 mr-2" />}
                Pasar a Pro ahora
              </Button>
            ) : (
              <>
                <Button
                  onClick={handleManageSubscription}
                  disabled={isRedirecting}
                  variant="outline"
                >
                  {isRedirecting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CreditCard className="h-4 w-4 mr-2" />}
                  Gestionar suscripción
                </Button>
                <Button
                  onClick={handleManageSubscription}
                  disabled={isRedirecting}
                  variant="outline"
                  className="text-destructive hover:bg-red-50 hover:text-destructive"
                >
                  Cancelar plan
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Comparar planes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg relative">
              {plan === "free" && <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2">Actual</Badge>}
              <div className="text-center mb-4">
                <h4 className="font-bold text-lg">Starter</h4>
                <div className="text-2xl font-bold">$0</div>
                <div className="text-sm text-muted-foreground">Gratis para siempre</div>
              </div>
              <ul className="text-sm space-y-2">
                <li>• 1 sede activa</li>
                <li>• {PLAN_LIMITS.free.responses} respuestas</li>
                <li>• {PLAN_LIMITS.free.surveys} encuestas</li>
                <li>• Branding básico</li>
              </ul>
            </div>

            <div className={`p-4 rounded-lg relative ${plan === "pro" ? "border-2 border-primary" : "border"}`}>
              {plan === "pro" && <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2">Actual</Badge>}
              <div className="text-center mb-4">
                <h4 className="font-bold text-lg">Pro</h4>
                <div className="text-2xl font-bold">$19</div>
                <div className="text-sm text-muted-foreground">USD/mes</div>
              </div>
              <ul className="text-sm space-y-2">
                <li>• {PLAN_LIMITS.pro.surveys} encuestas activas</li>
                <li>• {PLAN_LIMITS.pro.responses.toLocaleString()} respuestas/mes</li>
                <li>• Dashboard avanzado</li>
                <li>• Exportación de datos</li>
                <li>• Multi-sede activa</li>
              </ul>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="text-center mb-4">
                <h4 className="font-bold text-lg">Business</h4>
                <div className="text-2xl font-bold">$49</div>
                <div className="text-sm text-muted-foreground">USD/mes</div>
              </div>
              <ul className="text-sm space-y-2">
                <li>• Todo lo de Pro</li>
                <li>• 50,000 respuestas/mes</li>
                <li>• Encuestas ilimitadas</li>
                <li>• Roles y usuarios</li>
                <li>• Soporte prioritario</li>
              </ul>
              <Button
                onClick={handleUpgrade}
                disabled={isRedirecting} // Business not implemented yet
                className="w-full mt-4 bg-transparent"
                variant="outline"
              >
                {isRedirecting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {plan === "free" ? "MEJORAR AHORA" : "Actualizar"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historial de facturación</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Importe</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Factura</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {billingHistory.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.date}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell className="font-medium">{item.amount}</TableCell>
                  <TableCell>
                    <Badge variant="default">{item.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      {item.invoice}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
