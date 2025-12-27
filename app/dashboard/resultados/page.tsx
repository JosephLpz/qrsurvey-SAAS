"use client"

import { useEffect, useState, Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import { Download, Star, Loader2, Users, TrendingUp, QrCode } from "lucide-react"
import { auth } from "@/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { getSurveys, Survey } from "@/lib/services/surveys"
import { getSurveyResults, ResultsData } from "@/lib/services/results"
import { toast } from "sonner"
import { useSearchParams } from "next/navigation"

function ResultadosContent() {
  const [surveys, setSurveys] = useState<Survey[]>([])
  const searchParams = useSearchParams()
  const initialSurveyId = searchParams.get("surveyId")
  const [selectedSurveyId, setSelectedSurveyId] = useState(initialSurveyId || "")
  const [results, setResults] = useState<ResultsData | null>(null)
  const [loadingSurveys, setLoadingSurveys] = useState(true)
  const [loadingResults, setLoadingResults] = useState(false)

  // 1. Fetch Surveys
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const fetchedSurveys = await getSurveys(user.uid)
          setSurveys(fetchedSurveys)
          if (fetchedSurveys.length > 0 && !selectedSurveyId) {
            if (!initialSurveyId) {
              setSelectedSurveyId(fetchedSurveys[0].id || "")
            } else {
              const exists = fetchedSurveys.find(s => s.id === initialSurveyId)
              if (!exists) setSelectedSurveyId(fetchedSurveys[0].id || "")
            }
          }
        } catch (error) {
          console.error("Error fetching surveys:", error)
        } finally {
          setLoadingSurveys(false)
        }
      }
    })
    return () => unsubscribe()
  }, [])

  // 2. Fetch Results when survey changes
  useEffect(() => {
    if (!selectedSurveyId) return

    const fetchResults = async () => {
      setLoadingResults(true)
      try {
        const data = await getSurveyResults(selectedSurveyId)
        setResults(data)
      } catch (error) {
        console.error("Error fetching results:", error)
        toast.error("Error al cargar resultados")
      } finally {
        setLoadingResults(false)
      }
    }

    fetchResults()
  }, [selectedSurveyId])

  const selectedSurvey = surveys.find(s => s.id === selectedSurveyId)

  if (loadingSurveys) {
    return <div className="flex justify-center p-10"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
  }

  if (surveys.length === 0) {
    return (
      <div className="text-center p-10">
        <h2 className="text-xl font-semibold mb-2">No tienes encuestas creadas</h2>
        <p className="text-muted-foreground">Crea una encuesta y obtén respuestas para ver los resultados aquí.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-gray-900">Resultados</h1>
          <p className="text-muted-foreground text-lg">Analiza el rendimiento detallado de tus encuestas.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Select value={selectedSurveyId} onValueChange={setSelectedSurveyId}>
            <SelectTrigger className="w-full sm:w-64 h-12 rounded-xl border-gray-200 shadow-sm bg-white">
              <SelectValue placeholder="Seleccionar encuesta" />
            </SelectTrigger>
            <SelectContent>
              {surveys.map(survey => (
                <SelectItem key={survey.id} value={survey.id || ""}>
                  {survey.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" className="h-12 px-6 rounded-xl border-gray-200 hover:bg-gray-50 font-bold transition-all">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {loadingResults || !results ? (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
          <p className="text-muted-foreground animate-pulse font-medium">Procesando respuestas...</p>
        </div>
      ) : (
        <>
          {/* Resumen de la encuesta con estilo Pro */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Respuestas", value: results.totalResponses, sub: "Total histórico", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
              { title: "Rating Promedio", value: results.avgRating.toFixed(1), sub: "Escala 1 a 5", icon: Star, color: "text-amber-500", bg: "bg-amber-50" },
              { title: "Semanales", value: results.responsesByDay.reduce((a, b) => a + b.responses, 0), sub: "Últimos 7 días", icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50" },
              { title: "Completado", value: "100%", sub: "Tasa de éxito", icon: QrCode, color: "text-emerald-600", bg: "bg-emerald-50" }
            ].map((kpi, idx) => (
              <Card key={idx} className="border-none shadow-sm hover:shadow-md transition-all rounded-2xl overflow-hidden group">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{kpi.title}</p>
                      <h3 className="text-3xl font-black">{kpi.value}</h3>
                      <p className="text-[10px] text-muted-foreground font-bold">{kpi.sub}</p>
                    </div>
                    <div className={`p-3 rounded-xl ${kpi.bg} ${kpi.color} group-hover:scale-110 transition-transform`}>
                      <kpi.icon className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Detailed Question Results */}
          <div className="grid grid-cols-1 gap-8">
            {results.questionResults.map((qResult, idx) => (
              <Card key={qResult.questionId} className="overflow-hidden border-none shadow-md">
                <CardHeader className="bg-muted/30 pb-4">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="h-6 w-6 flex items-center justify-center p-0 rounded-full bg-primary/10 text-primary border-primary/20">
                      {idx + 1}
                    </Badge>
                    <CardTitle className="text-lg font-semibold">{qResult.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  {qResult.total === 0 ? (
                    <div className="text-center py-10 text-muted-foreground bg-gray-50/50 rounded-lg border border-dashed">
                      Sin respuestas para esta pregunta aún.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                      {/* Chart Area */}
                      <div className="lg:col-span-7 h-[300px]">
                        {qResult.type === 'text' ? (
                          <div className="space-y-3 max-h-[280px] overflow-y-auto pr-2 custom-scrollbar">
                            {qResult.data.map((comment: any, cIdx: number) => (
                              <div key={cIdx} className="bg-muted/20 p-3 rounded-lg border text-sm">
                                <p className="mb-1">{comment.text}</p>
                                <div className="flex justify-between text-[10px] text-muted-foreground">
                                  <span>{comment.sede}</span>
                                  <span>{comment.date}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <ResponsiveContainer width="100%" height="100%">
                            {qResult.type === 'nps' ? (
                              <PieChart>
                                <Pie
                                  data={qResult.data}
                                  cx="50%" cy="50%"
                                  innerRadius={60} outerRadius={80}
                                  dataKey="value"
                                >
                                  {qResult.data.map((entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                  ))}
                                </Pie>
                                <Tooltip />
                              </PieChart>
                            ) : (
                              <BarChart data={qResult.data} layout={qResult.type === 'rating' ? 'vertical' : 'horizontal'}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis
                                  type={qResult.type === 'rating' ? 'number' : 'category'}
                                  dataKey={qResult.type === 'rating' ? undefined : 'name'}
                                  fontSize={12}
                                  tickLine={false}
                                  axisLine={false}
                                />
                                <YAxis
                                  type={qResult.type === 'rating' ? 'category' : 'number'}
                                  dataKey={qResult.type === 'rating' ? 'name' : undefined}
                                  fontSize={12}
                                  width={80}
                                  tickLine={false}
                                  axisLine={false}
                                />
                                <Tooltip
                                  cursor={{ fill: '#f1f5f9', opacity: 0.5 }}
                                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                                />
                                <Bar
                                  dataKey="value"
                                  fill={qResult.type === 'rating' ? '#10b981' : '#3b82f6'}
                                  radius={qResult.type === 'rating' ? [0, 4, 4, 0] : [4, 4, 0, 0]}
                                />
                              </BarChart>
                            )}
                          </ResponsiveContainer>
                        )}
                      </div>

                      {/* Legend / Stats Area */}
                      <div className="lg:col-span-5 space-y-4">
                        <div className="text-center lg:text-left mb-4">
                          <div className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Total Respuestas</div>
                          <div className="text-4xl font-bold text-primary">{qResult.total}</div>
                        </div>

                        <div className="space-y-3">
                          {qResult.type !== 'text' && qResult.data.map((item: any, iIdx: number) => (
                            <div key={iIdx} className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span className="font-medium flex items-center gap-2">
                                  {qResult.type === 'nps' && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />}
                                  {item.name}
                                </span>
                                <span className="text-muted-foreground">{item.value} ({item.percentage || 0}%)</span>
                              </div>
                              <Progress value={item.percentage || 0} className="h-1.5" />
                            </div>
                          ))}
                          {qResult.type === 'text' && (
                            <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                              <p className="text-sm font-medium text-primary">Análisis de Texto</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Se muestran los comentarios más recientes. Utiliza el buscador para encontrar términos clave.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Activity Chart */}
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle>Actividad Semanal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={results.responsesByDay}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} fontSize={12} />
                    <YAxis axisLine={false} tickLine={false} fontSize={12} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="responses"
                      stroke="#3b82f6"
                      strokeWidth={4}
                      dot={{ r: 6, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 8, strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

export default function ResultadosPage() {
  return (
    <Suspense fallback={<div className="flex justify-center p-20"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>}>
      <ResultadosContent />
    </Suspense>
  )
}
