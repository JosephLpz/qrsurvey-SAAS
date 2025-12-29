"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
} from "recharts"
import { TrendingUp, Users, Star, QrCode, Eye, Download, MoreHorizontal, Loader2 } from "lucide-react"
import Link from "next/link"
import { type Survey, getSurveys } from "@/lib/services/surveys"
import { type AnalyticsData, getAnalyticsDashboard } from "@/lib/services/analytics"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { useAuth } from "@/providers/AuthProvider"
import { useLocation } from "@/providers/LocationProvider"
import { getUserUsage, PLAN_LIMITS, UserUsage } from "@/lib/services/quotas"
import { getUserProfile, UserProfile } from "@/lib/services/users"
import { Progress } from "@/components/ui/progress"

export default function DashboardPage() {
  const { user } = useAuth()
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [usage, setUsage] = useState<UserUsage | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        try {
          setLoading(true)
          const [surveysData, analyticsData, usageData, profile] = await Promise.all([
            getSurveys(user.uid),
            getAnalyticsDashboard(user.uid),
            getUserUsage(user.uid),
            getUserProfile(user.uid)
          ])
          setSurveys(surveysData)
          setAnalytics(analyticsData)
          setUsage(usageData)
          setUserProfile(profile)
        } catch (error) {
          console.error("Error fetching dashboard data:", error)
        } finally {
          setLoading(false)
        }
      }
      fetchData()
    }
  }, [user])

  // Calculate some extra insights if data exists
  const bestSede = analytics?.locationPerformance && analytics.locationPerformance.length > 0
    ? analytics.locationPerformance.reduce((prev, current) =>
      (prev.satisfaction > current.satisfaction) ? prev : current
      , analytics.locationPerformance[0])
    : null

  const topInsightsData = [
    {
      title: "Encuestas Activas",
      value: surveys.filter(s => s.status === 'Publicada').length,
      description: "Recibiendo respuestas",
      trend: "Online",
    },
    {
      title: "Mejor Sede",
      value: bestSede?.sede || "-",
      description: bestSede ? `${bestSede.satisfaction.toFixed(1)} estrellas promedio` : "Sin datos",
      trend: "Top rating",
    },
    {
      title: "Crecimiento Total",
      value: analytics?.totalResponses || 0,
      description: "Respuestas acumuladas",
      trend: "+100%",
    },
  ]

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Cargando tu resumen...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-gray-900">Dashboard</h1>
          <p className="text-muted-foreground text-lg">Resumen inteligente de tu actividad y métricas.</p>
        </div>
        <div className="flex flex-col md:flex-row gap-2">
          {userProfile?.plan === 'free' && (
            <Card className="border-none shadow-sm bg-indigo-50 px-4 py-2 flex items-center gap-3 rounded-2xl">
              <div className="text-[10px] font-black text-indigo-700 uppercase tracking-widest">Plan Free</div>
              <div className="flex gap-2 items-center">
                <div className="w-24 h-1.5 bg-indigo-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 transition-all"
                    style={{ width: `${Math.min(((usage?.surveys || 0) / PLAN_LIMITS.free.surveys) * 100, 100)}%` }}
                  />
                </div>
                <span className="text-[10px] font-bold text-indigo-900">{usage?.surveys}/{PLAN_LIMITS.free.surveys} Encuestas</span>
              </div>
              <div className="h-4 w-px bg-indigo-200 mx-1 hidden sm:block" />
              <div className="flex gap-2 items-center">
                <div className="w-24 h-1.5 bg-indigo-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 transition-all"
                    style={{ width: `${Math.min(((usage?.responses || 0) / PLAN_LIMITS.free.responses) * 100, 100)}%` }}
                  />
                </div>
                <span className="text-[10px] font-bold text-indigo-900">{usage?.responses}/{PLAN_LIMITS.free.responses} Respuestas</span>
              </div>
            </Card>
          )}
          <Link href="/dashboard/crear">
            <Button className="h-12 px-8 rounded-2xl font-bold bg-primary shadow-xl shadow-primary/20 hover:scale-105 transition-transform active:scale-95">
              Crear nueva encuesta
            </Button>
          </Link>
        </div>
      </div>

      {/* Métricas principales con estilo Pro */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Respuestas", value: analytics?.totalResponses || 0, sub: "Global acumulado", icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50" },
          { title: "Satisfacción", value: (analytics?.avgSatisfaction || 0).toFixed(1), sub: "Calificación general", icon: Star, color: "text-amber-500", bg: "bg-amber-50" },
          { title: "Encuestas", value: surveys.length, sub: "Total creadas", icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
          { title: "Sedes", value: analytics?.locationPerformance.length || 0, sub: "Localizaciones activas", icon: QrCode, color: "text-emerald-600", bg: "bg-emerald-50" }
        ].map((kpi, idx) => (
          <Card key={idx} className="border-none shadow-sm hover:shadow-md transition-all rounded-2xl overflow-hidden group">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">{kpi.title}</p>
                  <h3 className="text-3xl font-black">{kpi.value}</h3>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">{kpi.sub}</p>
                </div>
                <div className={`p-3 rounded-2xl ${kpi.bg} ${kpi.color} group-hover:scale-110 transition-transform`}>
                  <kpi.icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Insights principales rediseñados */}
      <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-gradient-to-br from-slate-50 to-white">
        <CardHeader className="border-b bg-white/50 pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Eye className="h-4 w-4" />
            </div>
            <CardTitle className="text-lg font-bold">Insights estratégicos</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-8 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {topInsightsData.map((insight, index) => (
              <div key={index} className="relative p-6 bg-white rounded-2xl border shadow-sm hover:border-primary/30 transition-colors group">
                <div className="space-y-2">
                  <h3 className="font-bold text-xs text-muted-foreground uppercase tracking-widest">{insight.title}</h3>
                  <div className="text-3xl font-black text-gray-900 group-hover:text-primary transition-colors">{insight.value}</div>
                  <p className="text-sm text-gray-500 leading-relaxed font-medium">{insight.description}</p>
                </div>
                <Badge className="absolute top-4 right-4 bg-primary/5 text-primary border-none font-bold text-[10px]">
                  {insight.trend}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Gráfica de respuestas por día */}
        <Card className="lg:col-span-7 border-none shadow-sm rounded-3xl overflow-hidden">
          <CardHeader className="pb-8">
            <CardTitle className="text-xl font-bold">Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics?.responsesByDay || []}>
                  <defs>
                    <linearGradient id="colorDash" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ border: 'none', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    cursor={{ stroke: '#3b82f6', strokeWidth: 1 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="responses"
                    stroke="#3b82f6"
                    strokeWidth={4}
                    fillOpacity={1}
                    fill="url(#colorDash)"
                    dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Gráfica de satisfacción por sede */}
        <Card className="lg:col-span-5 border-none shadow-sm rounded-3xl overflow-hidden">
          <CardHeader className="pb-8">
            <CardTitle className="text-xl font-bold">Satisfacción por sede</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[320px] overflow-x-auto custom-scrollbar">
              <div style={{
                minWidth: analytics?.locationPerformance && analytics.locationPerformance.length > 8
                  ? `${analytics.locationPerformance.length * 60}px`
                  : '100%'
              }} className="h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics?.locationPerformance || []}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="sede"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: '#64748b' }}
                      interval={0}
                    />
                    <YAxis hide domain={[0, 5]} />
                    <Tooltip
                      cursor={{ fill: '#f8fafc', opacity: 1 }}
                      contentStyle={{ border: 'none', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="satisfaction" fill="#10b981" radius={[8, 8, 0, 0]} barSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de encuestas recientes */}
      <Card className="border-none shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Mis Encuestas Recientes</CardTitle>
          <Link href="/dashboard/encuestas">
            <Button variant="ghost" className="text-primary text-xs font-semibold hover:bg-primary/5">Ver todas →</Button>
          </Link>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Respuestas</TableHead>
                <TableHead>Sede</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Actualización</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {surveys.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                    No tienes encuestas creadas aún.
                  </TableCell>
                </TableRow>
              ) : (
                surveys.slice(0, 5).map((survey) => (
                  <TableRow key={survey.id} className="hover:bg-muted/50 transition-colors group">
                    <TableCell className="font-semibold">
                      <Link href={`/dashboard/resultados?survey=${survey.id}`} className="hover:text-primary transition-colors">
                        {survey.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={survey.status === "Publicada" ? "default" : "secondary"}
                        className={survey.status === "Publicada" ? "bg-green-500 hover:bg-green-600" : ""}
                      >
                        {survey.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{survey.responses}</TableCell>
                    <TableCell className="text-xs">{survey.sede}</TableCell>
                    <TableCell>
                      {survey.avgRating > 0 ? (
                        <div className="flex items-center gap-1 font-bold">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span>{survey.avgRating.toFixed(1)}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {survey.createdAt
                        ? formatDistanceToNow(new Date(survey.createdAt), {
                          addSuffix: true,
                          locale: es,
                        })
                        : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/dashboard/resultados?survey=${survey.id}`}>
                        <Button variant="outline" size="sm" className="h-8 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                          Resultados
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
