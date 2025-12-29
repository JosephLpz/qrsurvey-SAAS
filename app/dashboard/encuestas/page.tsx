"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Filter, Plus, Eye, Edit, Copy, QrCode, MoreHorizontal, Star, X, Sparkles, Trash2, Pause, Play, Link as LinkIcon } from "lucide-react"
import Link from "next/link"
import { type Survey, getSurveys, deleteSurvey, updateSurvey } from "@/lib/services/surveys"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { auth, db } from "@/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"

// ... imports
import { duplicateSurvey } from "@/lib/services/surveys"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function EncuestasPage() {
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sedeFilter, setSedeFilter] = useState("all")
  const router = useRouter()

  const fetchSurveys = async (uid: string) => {
    try {
      const data = await getSurveys(uid)
      setSurveys(data)
    } catch (error) {
      console.error("Error fetching surveys:", error)
    } finally {
      setLoading(false)
    }
  }

  const [userPlan, setUserPlan] = useState<"free" | "pro">("free")

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await fetchSurveys(user.uid)
        // Fetch user plan
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid))
          if (userDoc.exists()) {
            setUserPlan(userDoc.data().plan || "free")
          }
        } catch (error) {
          console.error("Error fetching user plan:", error)
        }
      }
    })

    return () => unsubscribe()
  }, [])

  const handleDuplicate = async (survey: Survey) => {
    if (!auth.currentUser || !survey.id) return

    const toastId = toast.loading("Duplicando encuesta...")
    try {
      await duplicateSurvey(survey.id, auth.currentUser.uid)
      await fetchSurveys(auth.currentUser.uid) // Refresh list
      toast.dismiss(toastId)
      toast.success("Encuesta duplicada correctamente")
    } catch (error) {
      console.error(error)
      toast.dismiss(toastId)
      toast.error("Error al duplicar la encuesta")
    }
  }

  const handleDelete = async (survey: Survey) => {
    if (!survey.id) return
    const confirmed = confirm(`¿Estás seguro de que deseas eliminar "${survey.name}"? Esta acción no se puede deshacer.`)
    if (!confirmed) return

    const toastId = toast.loading("Eliminando encuesta...")
    try {
      await deleteSurvey(survey.id)
      if (auth.currentUser) await fetchSurveys(auth.currentUser.uid)
      toast.success("Encuesta eliminada", { id: toastId })
    } catch (error) {
      console.error(error)
      toast.error("Error al eliminar", { id: toastId })
    }
  }

  const handleStatusToggle = async (survey: Survey) => {
    if (!survey.id) return
    const newStatus = survey.status === "Publicada" ? "Pausada" : "Publicada"
    const toastId = toast.loading("Actualizando estado...")
    try {
      await updateSurvey(survey.id, { status: newStatus })
      if (auth.currentUser) await fetchSurveys(auth.currentUser.uid)
      toast.success(`Encuesta ${newStatus.toLowerCase()}`, { id: toastId })
    } catch (error) {
      console.error(error)
      toast.error("Error al actualizar estado", { id: toastId })
    }
  }

  const handleCopyLink = (id: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const url = `${origin}/s/${id}`
    navigator.clipboard.writeText(url)
    toast.success("Enlace copiado al portapapeles")
  }

  // Filter Logic
  const filteredSurveys = surveys.filter(survey => {
    const matchesSearch = survey.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      survey.description?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" ||
      (statusFilter === "published" && survey.status === "Publicada") ||
      (statusFilter === "draft" && survey.status === "Borrador") ||
      (statusFilter === "paused" && survey.status === "Pausada") ||
      (statusFilter === "finished" && survey.status === "Finalizada")

    const matchesSede = sedeFilter === "all" ||
      survey.sede?.toLowerCase() === sedeFilter.toLowerCase()

    return matchesSearch && matchesStatus && matchesSede
  })

  // clear filters
  const clearFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
    setSedeFilter("all")
  }

  // Get unique sedes from surveys for the filter dropdown
  const uniqueSedes = Array.from(new Set(surveys.map(s => s.sede).filter(Boolean)))

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-4xl font-black tracking-tight text-gray-900">Mis encuestas</h1>
          </div>
          <p className="text-muted-foreground text-lg">Gestiona todas tus encuestas desde un solo lugar.</p>
        </div>
        <Link href="/dashboard/crear">
          <Button className="h-12 px-8 rounded-2xl font-bold bg-primary shadow-xl shadow-primary/20 hover:scale-105 transition-transform active:scale-95">
            <Plus className="h-4 w-4 mr-2" />
            Crear encuesta
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Total", value: surveys.length, sub: "Encuestas creadas", icon: Filter, color: "text-blue-600", bg: "bg-blue-50" },
          { title: "Activas", value: surveys.filter(s => s.status === 'Publicada').length, sub: "Recibiendo datos", icon: Plus, color: "text-emerald-600", bg: "bg-emerald-50" },
          { title: "Respuestas", value: surveys.reduce((acc, s) => acc + (s.responses || 0), 0), sub: "Volumen total", icon: Search, color: "text-amber-500", bg: "bg-amber-50" },
          { title: "Rating", value: (surveys.reduce((acc, s) => acc + (s.avgRating || 0), 0) / (surveys.filter(s => s.avgRating > 0).length || 1)).toFixed(1), sub: "Calidad promedio", icon: Star, color: "text-purple-600", bg: "bg-purple-50" }
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

      {/* Filtros y búsqueda con estilo Pro */}
      <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-white">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o descripción..."
                className="pl-12 h-12 rounded-xl border-gray-200 focus:ring-primary/20"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[160px] h-12 rounded-xl border-gray-200">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="published">Publicada</SelectItem>
                  <SelectItem value="draft">Borrador</SelectItem>
                  <SelectItem value="paused">Pausada</SelectItem>
                  <SelectItem value="finished">Finalizada</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sedeFilter} onValueChange={setSedeFilter}>
                <SelectTrigger className="w-full sm:w-[160px] h-12 rounded-xl border-gray-200">
                  <SelectValue placeholder="Sede" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las sedes</SelectItem>
                  {uniqueSedes.map(sede => (
                    <SelectItem key={sede} value={sede.toLowerCase()}>{sede}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {(searchTerm || statusFilter !== "all" || sedeFilter !== "all") && (
                <Button
                  variant="ghost"
                  className="h-12 rounded-xl text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                  onClick={clearFilters}
                >
                  <X className="h-4 w-4 mr-2" />
                  Limpiar
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de encuestas */}
      <Card>
        <CardHeader>
          <CardTitle>Encuestas ({filteredSurveys.length})</CardTitle>
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
                <TableHead>Completado</TableHead>
                <TableHead>Fecha creación</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10">
                    Cargando encuestas...
                  </TableCell>
                </TableRow>
              ) : filteredSurveys.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10">
                    <p className="text-muted-foreground">No se encontraron encuestas.</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredSurveys.map((survey) => (
                  <TableRow key={survey.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div>{survey.name}</div>
                        <div className="text-xs text-muted-foreground">{survey.description?.substring(0, 30)}...</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          survey.status === "Publicada"
                            ? "default"
                            : survey.status === "Borrador"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {survey.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{survey.responses || 0}</TableCell>
                    <TableCell>{survey.sede || "-"}</TableCell>
                    <TableCell>
                      {survey.avgRating > 0 ? (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>{survey.avgRating.toFixed(1)}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-muted rounded-full h-2">
                          <div className="bg-primary h-2 rounded-full" style={{ width: `0%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground">0%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {survey.createdAt
                        ? formatDistanceToNow(new Date(survey.createdAt), {
                          addSuffix: true,
                          locale: es,
                        })
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Link href={`/dashboard/resultados?surveyId=${survey.id}`}>
                          <Button variant="ghost" size="icon" title="Ver resultados">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>

                        <Link href={`/dashboard/crear?edit=${survey.id}`}>
                          <Button variant="ghost" size="icon" title="Editar">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>

                        <Button
                          variant="ghost"
                          size="icon"
                          title="Copiar Enlace"
                          onClick={() => handleCopyLink(survey.id!)}
                        >
                          <LinkIcon className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          title={survey.status === "Publicada" ? "Pausar" : "Reanudar"}
                          onClick={() => handleStatusToggle(survey)}
                        >
                          {survey.status === "Publicada" ? (
                            <Pause className="h-4 w-4 text-amber-500" />
                          ) : (
                            <Play className="h-4 w-4 text-green-500" />
                          )}
                        </Button>

                        {userPlan === "pro" && (
                          <Link href={`/dashboard/qr-editor?surveyId=${survey.id}`}>
                            <Button variant="ghost" size="icon" title="Elite QR Studio (Póster Pro)" className="text-orange-600 hover:text-orange-700 hover:bg-orange-50">
                              <Sparkles className="h-4 w-4" />
                            </Button>
                          </Link>
                        )}

                        <Link href={`/dashboard/qr-generator?surveyId=${survey.id}`}>
                          <Button variant="ghost" size="icon" title="Generador de QR">
                            <QrCode className="h-4 w-4" />
                          </Button>
                        </Link>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" title="Más opciones">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => handleDuplicate(survey)}>
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-rose-600 focus:text-rose-600 focus:bg-rose-50"
                              onClick={() => handleDelete(survey)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
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
