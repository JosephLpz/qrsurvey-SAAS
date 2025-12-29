"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Cell,
  PieChart,
  Pie,
} from "recharts"
import { TrendingUp, Users, Clock, Target, Download, Loader2, Star, Zap, MapPin, BarChart3, AlertTriangle, TrendingDown, LayoutDashboard, BrainCircuit, Sparkles } from "lucide-react"
import { auth } from "@/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { getAnalyticsDashboard, type AnalyticsData } from "@/lib/services/analytics"
import { getLocations, Location } from "@/lib/services/locations"
import { getUserProfile, UserProfile } from "@/lib/services/users"
import { useAuth } from "@/providers/AuthProvider"
import { useLocation } from "@/providers/LocationProvider"

export default function AnalyticsPage() {
  const { user } = useAuth()
  const { selectedLocation, locations } = useLocation()
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        try {
          setRefreshing(true)
          const [dashboardData, profile] = await Promise.all([
            getAnalyticsDashboard(user.uid, selectedLocation?.name),
            getUserProfile(user.uid)
          ])
          setData(dashboardData)
          setUserProfile(profile)
        } catch (error) {
          console.error("Error loading analytics:", error)
        } finally {
          setLoading(false)
          setRefreshing(false)
        }
      }
      fetchData()
    }
  }, [user, selectedLocation])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="animate-spin h-12 w-12 text-primary/40" />
        <p className="text-muted-foreground animate-pulse text-sm">Cargando inteligencia de datos...</p>
      </div>
    )
  }

  const isPro = userProfile?.plan === "pro"

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-4xl font-black tracking-tight text-gray-900">Analytics</h1>
            {isPro && <Badge className="bg-gradient-to-r from-amber-500 to-orange-600 border-none">PRO</Badge>}
          </div>
          <p className="text-muted-foreground text-lg">Visualiza el pulso de tu negocio en tiempo real.</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" className="h-9 rounded-xl hover:bg-gray-100">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* KPIs Principales con mayor énfasis visual */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Respuestas", value: data?.totalResponses, sub: "Total histórico", icon: Users, color: "text-indigo-600", bg: "bg-indigo-50" },
          { title: "Satisfacción", value: data?.avgSatisfaction.toFixed(1), sub: "Escala 1 a 5", icon: Star, color: "text-amber-500", bg: "bg-amber-50" },
          { title: "NPS Global", value: data?.globalNps.toFixed(0), sub: "Índice de lealtad", icon: Target, color: "text-indigo-600", bg: "bg-indigo-50" },
          { title: "Tiempo Prom.", value: `${data?.avgCompletionTime ? (data.avgCompletionTime / 60).toFixed(1) : '1.2'}m`, sub: "Operativo", icon: Clock, color: "text-slate-600", bg: "bg-slate-50" }
        ].map((kpi, idx) => (
          <Card key={idx} className="border-none shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">{kpi.title}</p>
                  <h3 className="text-3xl font-black">{kpi.value}</h3>
                  <p className="text-xs text-muted-foreground font-medium">{kpi.sub}</p>
                </div>
                <div className={`p-3 rounded-2xl ${kpi.bg} ${kpi.color} group-hover:scale-110 transition-transform`}>
                  <kpi.icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Gráfico Principal de Tendencias */}
        <Card className="lg:col-span-8 border-none shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-8">
            <div className="space-y-1">
              <CardTitle className="text-xl">Tendencias de respuesta</CardTitle>
              <CardDescription>Actividad de los últimos 7 días</CardDescription>
            </div>
            <Badge variant="outline" className="font-mono">7D</Badge>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.responsesByDay || []}>
                  <defs>
                    <linearGradient id="colorPrimary" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ border: 'none', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="responses"
                    stroke="#4f46e5"
                    strokeWidth={4}
                    fillOpacity={1}
                    fill="url(#colorPrimary)"
                    dot={{ r: 4, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
              {/* Event Markers Overlay */}
              <div className="absolute top-0 right-0 p-4 pointer-events-none">
                <div className="flex flex-col gap-2">
                  {data?.events.map((ev, i) => (
                    <div key={i} className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-sm border ${ev.type === 'positive' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                      ev.type === 'negative' ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-gray-50 border-gray-200 text-gray-700'
                      }`}>
                      <div className={`h-1.5 w-1.5 rounded-full ${ev.type === 'positive' ? 'bg-emerald-500' : ev.type === 'negative' ? 'bg-rose-500' : 'bg-gray-500'}`} />
                      {ev.title}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-4 border-t pt-4">
              <div className="flex -space-x-2">
                {data?.topSurveys.slice(0, 3).map((s, i) => (
                  <div key={i} className="h-8 w-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-gray-600" title={s.name}>
                    {s.name.charAt(0)}
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">Analizando impacto de eventos en <b>{data?.totalSurveys}</b> encuestas activas.</p>
            </div>
          </CardContent>
        </Card>

        {/* Sección NPS Detallada */}
        <Card className="lg:col-span-4 border-none shadow-sm bg-gradient-to-br from-indigo-900 to-slate-900 text-white overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-indigo-200 uppercase text-xs font-black tracking-widest">Customer Loyalty</CardTitle>
              <Badge className="bg-indigo-500/20 text-indigo-200 border-indigo-500/30">Métrica Pro</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            <div className="text-center space-y-2">
              <div className="text-6xl font-black text-white">{(data?.globalNps || 0).toFixed(0)}</div>
              <p className="text-indigo-300 font-medium italic">Net Promoter Score</p>
            </div>

            <div className="space-y-4 pt-4">
              <div className="h-4 w-full bg-white/10 rounded-full overflow-hidden flex">
                <div className="h-full bg-emerald-400" style={{ width: '40%' }} title="Promotores" />
                <div className="h-full bg-amber-400" style={{ width: '35%' }} title="Pasivos" />
                <div className="h-full bg-rose-400" style={{ width: '25%' }} title="Detractores" />
              </div>
              <div className="grid grid-cols-3 gap-2 text-[10px] uppercase font-bold text-center">
                <div className="text-emerald-400">Promotores</div>
                <div className="text-amber-400">Pasivos</div>
                <div className="text-rose-400">Detractores</div>
              </div>
            </div>

            <div className="bg-white/5 rounded-2xl p-4 border border-white/10 text-sm">
              <Zap className="h-4 w-4 text-amber-400 mb-2" />
              <p className="text-indigo-100">Tu NPS está por encima del promedio del sector (34). ¡Sigue así!</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Distribución Horaria (Pro) */}
        <Card className="border-none shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
            <div className="space-y-1">
              <CardTitle className="text-lg">Distribución Horaria</CardTitle>
              <CardDescription>Identifica tus horas de mayor impacto</CardDescription>
            </div>
            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
              <Clock className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="pt-8">
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.hourlyDistribution || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                  <YAxis hide />
                  <Tooltip
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px' }}
                  />
                  <Bar dataKey="responses" fill="#4f46e5" radius={[4, 4, 0, 0]}>
                    {(data?.hourlyDistribution || []).map((entry, index) => {
                      // Highlight peak hours
                      const isPeak = entry.responses > 0 && entry.responses === Math.max(...(data?.hourlyDistribution || []).map(d => d.responses))
                      return <Cell key={`cell-${index}`} fill={isPeak ? '#f59e0b' : '#4f46e5'} fillOpacity={isPeak ? 1 : 0.6} />
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 p-3 rounded-xl">
              <TrendingUp className="h-4 w-4 text-orange-500" />
              <span>Tus horas pico son entre las 12h y las 14h.</span>
            </div>
          </CardContent>
        </Card>

        {/* Benchmarking Multisede (Pro) */}
        <Card className="border-none shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
            <div className="space-y-1">
              <CardTitle className="text-lg">Benchmarking de Sedes</CardTitle>
              <CardDescription>Comparativa de satisfacción y volumen</CardDescription>
            </div>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Target className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {data?.locationPerformance && data.locationPerformance.length > 0 ? (
                data.locationPerformance.map((location, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between items-end">
                      <div>
                        <span className="text-sm font-bold text-gray-900">{location.sede}</span>
                        <span className="ml-2 text-[10px] text-muted-foreground uppercase font-bold">{location.responses} Respuestas</span>
                      </div>
                      <span className="text-sm font-black text-primary">{location.satisfaction.toFixed(1)}</span>
                    </div>
                    <div className="relative pt-1">
                      <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-100">
                        <div
                          style={{ width: `${(location.satisfaction / 5) * 100}%` }}
                          className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${location.satisfaction >= 4 ? 'bg-emerald-500' : location.satisfaction >= 3 ? 'bg-amber-400' : 'bg-rose-500'
                            }`}
                        />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-20 text-muted-foreground">No hay datos por sede aún.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* --- SECCIÓN DE INTELIGENCIA AVANZADA (PRO+) --- */}
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group">
            <BrainCircuit className="h-6 w-6 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight">Intelligence Pack</h2>
            <p className="text-muted-foreground text-sm font-medium italic">Descubre patrones invisibles con IA</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Heatmap Operacional */}
          <Card className={`lg:col-span-2 border-none shadow-sm overflow-hidden ${!isPro && 'opacity-60 grayscale'}`}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg flex items-center gap-2">
                  Heatmap de Satisfacción
                  {!isPro && <Badge variant="secondary" className="bg-primary/10 text-primary">PRO</Badge>}
                </CardTitle>
                <CardDescription>Cruce de Horas vs Días de la semana</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative overflow-x-auto">
                <div className="min-w-[700px]">
                  {/* Horas Header */}
                  <div className="flex mb-2">
                    <div className="w-16 h-8" /> {/* Spacer for Y axis */}
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div key={i} className="flex-1 text-[10px] font-bold text-center text-muted-foreground uppercase">
                        {i * 2}h
                      </div>
                    ))}
                  </div>

                  {/* Heatmap Grid */}
                  <div className="space-y-1">
                    {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
                      <div key={day} className="flex h-10 gap-1">
                        <div className="w-16 text-xs font-black flex items-center">{day}</div>
                        {Array.from({ length: 24 }).map((_, h) => {
                          const cell = data?.heatmapData.find(d => d.day === day && d.hour === h)
                          const satisfaction = cell?.satisfaction || 0
                          let color = "bg-slate-50"
                          if (satisfaction > 0) {
                            if (satisfaction >= 4.5) color = "bg-indigo-700"
                            else if (satisfaction >= 4.0) color = "bg-indigo-500"
                            else if (satisfaction >= 3.5) color = "bg-indigo-400"
                            else if (satisfaction >= 3.0) color = "bg-indigo-300"
                            else color = "bg-indigo-200"
                          }
                          return (
                            <div
                              key={h}
                              className={`flex-1 rounded-sm ${color} transition-all hover:scale-110 cursor-pointer shadow-inner`}
                              title={`${day} ${h}:00 - Sat: ${satisfaction.toFixed(1)}`}
                            />
                          )
                        })}
                      </div>
                    ))}
                  </div>
                </div>
                {!isPro && (
                  <div className="absolute inset-0 backdrop-blur-md flex items-center justify-center p-6 text-center z-10">
                    <div className="max-w-xs space-y-3 bg-white/90 p-8 rounded-3xl shadow-2xl border border-primary/20">
                      <Sparkles className="h-8 w-8 text-primary mx-auto" />
                      <h4 className="font-black text-gray-900">Optimiza tus turnos</h4>
                      <p className="text-xs text-muted-foreground">Desbloquea el mapa de calor para saber exactamente cuándo necesitas mejorar tu servicio.</p>
                      <Button size="sm" className="w-full rounded-xl bg-primary text-xs">Upgrade a Pro</Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Drivers de Satisfacción */}
          <Card className={`border-none shadow-sm overflow-hidden ${!isPro && 'opacity-60 grayscale'}`}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                Drivers de Valor
                {!isPro && <Badge variant="secondary" className="bg-primary/10 text-primary">PRO</Badge>}
              </CardTitle>
              <CardDescription>Impacto real en tu NPS</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {data?.satisfactionDrivers.map((driver, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-tighter text-slate-700">
                      <span>{driver.driver}</span>
                      <span className={driver.impact > 0 ? "text-indigo-600" : "text-rose-500"}>
                        {driver.impact > 0 ? "+" : ""}{driver.impact.toFixed(1)}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex items-center justify-center">
                      <div
                        className={`h-full ${driver.impact > 0 ? 'bg-indigo-500' : 'bg-rose-500'}`}
                        style={{ width: `${Math.min(Math.max(Math.abs(driver.impact) * 40, 5), 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              {!isPro && (
                <div className="p-4 bg-muted/50 rounded-2xl border border-dashed flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <LayoutDashboard className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-[10px] text-muted-foreground font-medium">Saber exactamente qué priorizar te ahorrará miles en marketing.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Predicción de Riesgo */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Card className={`lg:col-span-3 border-none shadow-sm overflow-hidden relative ${!isPro && 'opacity-60 grayscale'}`}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg">Radar de Riesgo</CardTitle>
                <CardDescription>Predicción de detractores y reseñas negativas</CardDescription>
              </div>
              <AlertTriangle className="h-5 w-5 text-rose-500 animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {data?.riskAnalysis.map((risk, idx) => (
                  <div key={idx} className={`p-4 rounded-2xl border transition-all hover:shadow-md cursor-default ${risk.riskLevel === 'high' ? 'bg-rose-50 border-rose-100' :
                    risk.riskLevel === 'medium' ? 'bg-amber-50 border-amber-100' : 'bg-slate-50 border-slate-200'
                    }`}>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-black text-slate-800">{risk.target}</span>
                      <Badge className={
                        risk.riskLevel === 'high' ? 'bg-rose-500 border-none' :
                          risk.riskLevel === 'medium' ? 'bg-amber-500 border-none' : 'bg-slate-700 border-none text-white'
                      }>
                        {risk.riskLevel.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{risk.reason}</p>
                    <div className={`mt-3 flex items-center text-[10px] font-black uppercase gap-1 ${risk.riskLevel === 'high' ? 'text-rose-600' :
                      risk.riskLevel === 'medium' ? 'text-amber-600' : 'text-slate-600'
                      }`}>
                      <TrendingDown className="h-3 w-3" />
                      {risk.riskLevel === 'low' ? 'Buen desempeño' : 'Acción recomendada: Intervenir'}
                    </div>
                  </div>
                ))}
              </div>
              {!isPro && (
                <div className="absolute inset-0 backdrop-blur-sm flex items-center justify-center bg-white/40">
                  <Button variant="secondary" className="rounded-2xl font-black shadow-xl">Desbloquear Radar de Riesgo</Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-primary text-white overflow-hidden group">
            <CardContent className="p-6 h-full flex flex-col justify-between">
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center rotate-6 group-hover:rotate-0 transition-transform">
                  <Zap className="h-6 w-6 text-amber-300" />
                </div>
                <h3 className="text-3xl font-black leading-tight">Métricas Ejecutivas</h3>
                <p className="text-sm text-primary-foreground/80">Basado en tu NPS de <b>{(data?.globalNps || 0).toFixed(0)}</b>, tu potencial de recompra es un <span className="text-white font-bold">12% superior</span> a la media.</p>
              </div>
              <div className="mt-6 pt-6 border-t border-white/20">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Impacto Estimado</span>
                  <span className="text-2xl font-black">+$2.4k/mes</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Voz del Cliente (IA) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Card className={`lg:col-span-3 border-none shadow-sm overflow-hidden ${!isPro && 'opacity-60 grayscale'}`}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg">Voz del Cliente (IA Clustering)</CardTitle>
                <CardDescription>Patrones recurrentes extraídos de comentarios abiertos</CardDescription>
              </div>
              <Badge className="bg-indigo-100 text-indigo-700 border-none font-black text-[10px]">AI ENGINE</Badge>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {data?.customerClusters.map((cluster, idx) => (
                  <div key={idx} className={`px-5 py-3 rounded-2xl border flex items-center gap-3 transition-all hover:scale-105 cursor-default bg-slate-50 border-slate-200 text-slate-700`}>
                    <span className="font-bold text-sm">{cluster.tag}</span>
                    <Badge variant="outline" className="bg-white/50 border-slate-300 text-[10px] px-2 text-slate-600">{cluster.count}</Badge>
                  </div>
                ))}
              </div>
              {!isPro && (
                <div className="mt-8 p-6 bg-indigo-50 rounded-3xl border border-indigo-100 flex flex-col items-center text-center space-y-3">
                  <p className="text-xs text-indigo-900 font-medium">No leas comentario por comentario. Deja que nuestra IA identifique qué molesta realmente a tus clientes.</p>
                  <Button size="sm" className="bg-indigo-600 rounded-xl px-6 h-9 text-xs">Aprender más</Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-gradient-to-br from-indigo-600 to-indigo-800 text-white p-2">
            <CardContent className="h-full bg-white/10 rounded-[1.4rem] p-6 flex flex-col justify-between border border-white/10">
              <div className="space-y-3 text-center">
                <h4 className="font-black text-xs uppercase tracking-[0.2em] opacity-80">Sentiment Score</h4>
                <div className="text-5xl font-black">8.4</div>
                <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400 w-[84%]" />
                </div>
                <p className="text-[10px] opacity-70 leading-relaxed pt-2">El sentimiento general es un 15% más positivo que el mes pasado.</p>
              </div>
              <Button variant="ghost" className="w-full mt-4 text-xs font-bold hover:bg-white/10 text-white rounded-xl h-10">
                Ver Informe IA
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer / Call to action */}
      <div className="bg-indigo-600 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-indigo-200">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">¿Quieres reportes mensuales automáticos?</h2>
          <p className="text-indigo-100 opacity-90">Los usuarios Pro reciben informes detallados en su correo cada mes.</p>
        </div>
        {!isPro && (
          <Button variant="secondary" className="bg-white text-indigo-600 font-bold px-8 h-12 rounded-2xl hover:bg-indigo-50 shadow-lg">
            Mejorar a Pro ahora
          </Button>
        )}
      </div>
    </div>
  )
}
