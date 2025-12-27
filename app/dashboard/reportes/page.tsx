"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Download, FileText, Search, Eye, Share, Trash2, Loader2, Plus } from "lucide-react"
import { auth } from "@/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { getReports, createReport, deleteReport, getFilteredResponses, exportToCSV, type Report } from "@/lib/services/reports"
import { getSurveys, type Survey } from "@/lib/services/surveys"
import { toast } from "sonner"

const reportTemplates = [
  {
    name: "Reporte básico de satisfacción",
    description: "Métricas principales y gráficos de satisfacción",
    duration: "~5 min",
    format: "PDF",
    type: "Mensual"
  },
  {
    name: "Análisis completo por sede",
    description: "Comparativa detallada entre todas las sedes",
    duration: "~10 min",
    format: "Excel + PDF",
    type: "Trimestral"
  },
  {
    name: "Reporte de NPS detallado",
    description: "Net Promoter Score con análisis de comentarios",
    duration: "~8 min",
    format: "PDF",
    type: "Especializado"
  },
  {
    name: "Dashboard ejecutivo",
    description: "Resumen ejecutivo con KPIs principales",
    duration: "~3 min",
    format: "PDF",
    type: "Ejecutivo"
  },
]

export default function ReportesPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")

  // Filtros
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  // Form State
  const [newReportName, setNewReportName] = useState("")
  const [selectedSurveyIds, setSelectedSurveyIds] = useState<string[]>([])
  const [isSubmitLoading, setIsSubmitLoading] = useState(false)

  useEffect(() => {
    const user = auth.currentUser
    if (user) {
      setUser(user)
      loadData(user.uid)
    }

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u)
        loadData(u.uid)
      } else {
        setLoading(false)
      }
    })
    return () => unsubscribe()
  }, [])

  async function loadData(uid: string) {
    if (!uid) return
    setLoading(true)

    // Load surveys independently
    try {
      const surveysData = await getSurveys(uid)
      setSurveys(surveysData)
    } catch (error) {
      console.error("Error loading surveys:", error)
      toast.error("No se pudieron cargar las encuestas")
    }

    // Load reports independently
    try {
      const reportsData = await getReports(uid)
      setReports(reportsData)
    } catch (error) {
      console.error("Error loading reports:", error)
      // Only show error if it's not a missing index (though we removed orderBy)
      toast.error("No se pudieron cargar tus reportes guardados")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateReport = async (templateName?: string, templateType?: string) => {
    const name = templateName || newReportName
    const type = templateType || (selectedSurveyIds.length > 1 ? "Combinado" : "Individual")

    if (!name || selectedSurveyIds.length === 0) {
      toast.error("Por favor, selecciona al menos una encuesta")
      setIsCreating(true) // Abrir modal si no estaba abierto
      return
    }

    try {
      setIsSubmitLoading(true)
      await createReport(user.uid, {
        name: name,
        type: type,
        format: "CSV",
        surveyIds: selectedSurveyIds,
        sedes: ["Todas"],
      })
      toast.success("Reporte generado con éxito")
      setIsCreating(false)
      setNewReportName("")
      setSelectedSurveyIds([])
      await loadData(user.uid)
    } catch (error) {
      console.error("Error creating report:", error)
      toast.error("Error al guardar el reporte")
    } finally {
      setIsSubmitLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este reporte?")) return
    try {
      await deleteReport(id)
      setReports(reports.filter(r => r.id !== id))
      toast.success("Reporte eliminado")
    } catch (error) {
      toast.error("Error al eliminar")
    }
  }

  const handleDownload = async (report: Report) => {
    try {
      toast.info("Generando archivo...")
      const responses = await getFilteredResponses(report.surveyIds, report.sedes)
      if (responses.length === 0) {
        toast.warning("No hay respuestas para los filtros de este reporte")
        return
      }
      exportToCSV(responses, report.name)
      toast.success("Descarga iniciada")
    } catch (error) {
      toast.error("Error al exportar")
    }
  }

  const filteredReports = reports.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === "all" || r.type === typeFilter
    const matchesStatus = statusFilter === "all" || r.status === statusFilter
    return matchesSearch && matchesType && matchesStatus
  })

  if (loading) {
    return <div className="flex flex-col items-center justify-center p-20 space-y-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-muted-foreground">Cargando tus reportes...</p>
    </div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-heading">Reportes</h1>
          <p className="text-muted-foreground">Genera y gestiona reportes personalizados</p>
        </div>

        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button className="shadow-lg shadow-primary/20">
              <FileText className="h-4 w-4 mr-2" />
              Crear reporte
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Configurar reporte personalizado</DialogTitle>
              <DialogDescription>
                Selecciona las encuestas que deseas incluir en este reporte consolidado.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nombre del reporte</Label>
                <Input
                  id="name"
                  placeholder="Ej: Reporte Mensual Q1"
                  value={newReportName}
                  onChange={(e) => setNewReportName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label>Encuestas a incluir</Label>
                <div className="border rounded-md p-3 max-h-[200px] overflow-y-auto space-y-2">
                  {surveys.map((survey) => (
                    <div key={survey.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={survey.id}
                        checked={survey.id ? selectedSurveyIds.includes(survey.id) : false}
                        onCheckedChange={(checked) => {
                          if (!survey.id) return
                          if (checked) setSelectedSurveyIds([...selectedSurveyIds, survey.id])
                          else setSelectedSurveyIds(selectedSurveyIds.filter(id => id !== survey.id))
                        }}
                      />
                      <label htmlFor={survey.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        {survey.name} ({survey.responses})
                      </label>
                    </div>
                  ))}
                  {surveys.length === 0 && <p className="text-center text-xs text-muted-foreground py-2">No tienes encuestas creadas</p>}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreating(false)}>Cancelar</Button>
              <Button onClick={() => handleCreateReport()} disabled={isSubmitLoading}>
                {isSubmitLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                Generar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">{reports.length}</div>
            <p className="text-xs text-muted-foreground">Reportes generados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-accent">{reports.length * 5}</div>
            <p className="text-xs text-muted-foreground">Descargas estimadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">0</div>
            <p className="text-xs text-muted-foreground">Reportes programados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-accent">Realtime</div>
            <p className="text-xs text-muted-foreground">Sincronización</p>
          </CardContent>
        </Card>
      </div>

      {/* Plantillas de reportes */}
      <Card>
        <CardHeader>
          <CardTitle>Plantillas de reportes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reportTemplates.map((template, index) => (
              <div key={index} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold">{template.name}</h3>
                  <Badge variant="outline">{template.format}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{template.duration}</span>
                  <Button size="sm" onClick={() => {
                    const firstSurvey = surveys[0]?.id;
                    if (firstSurvey) {
                      setSelectedSurveyIds([firstSurvey]);
                      handleCreateReport(template.name, template.type);
                    } else {
                      toast.error("Crea una encuesta primero para usar plantillas");
                    }
                  }}>
                    Usar plantilla
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar reportes..."
                className="pl-10 h-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Tipo de reporte" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="Individual">Individual</SelectItem>
                <SelectItem value="Combinado">Combinado</SelectItem>
                <SelectItem value="Mensual">Mensual</SelectItem>
                <SelectItem value="Trimestral">Trimestral</SelectItem>
                <SelectItem value="Especializado">Especializado</SelectItem>
                <SelectItem value="Ejecutivo">Ejecutivo</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="Completado">Completado</SelectItem>
                <SelectItem value="Procesando">Procesando</SelectItem>
                <SelectItem value="Programado">Programado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de reportes */}
      <Card>
        <CardHeader>
          <CardTitle>Mis reportes ({filteredReports.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Métricas</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                    No se encontraron reportes.
                  </TableCell>
                </TableRow>
              ) : (
                filteredReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{report.name}</div>
                        <div className="text-xs text-muted-foreground">{report.format}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{report.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          report.status === "Completado"
                            ? "default"
                            : report.status === "Procesando"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {report.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {report.createdAt?.toLocaleDateString() || "-"}
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-muted-foreground">
                        {report.surveyIds.length} encuestas incluidas
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" title="Descargar" onClick={() => handleDownload(report)}>
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Eliminar" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(report.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Compartir">
                          <Share className="h-4 w-4" />
                        </Button>
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
