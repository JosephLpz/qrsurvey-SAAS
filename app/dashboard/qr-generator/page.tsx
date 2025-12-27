"use client"

import { useEffect, useState, useRef, Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Download, Share, Copy, Loader2, QrCode } from "lucide-react"
import { auth } from "@/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { getSurveys, Survey } from "@/lib/services/surveys"
import { QRCodeCanvas } from "qrcode.react"
import { toast } from "sonner"
import { useSearchParams } from "next/navigation"

const posterTemplates = [
  { id: "modern", name: "Moderno", description: "Diseño limpio y minimalista" },
  { id: "classic", name: "Clásico", description: "Estilo tradicional y elegante" },
  { id: "colorful", name: "Colorido", description: "Vibrante y llamativo" },
  { id: "minimal", name: "Minimal", description: "Máxima simplicidad" },
]

function QRGeneratorContent() {
  const [surveys, setSurveys] = useState<Survey[]>([])
  const searchParams = useSearchParams()
  const initialSurveyId = searchParams.get("surveyId")
  const [selectedSurveyId, setSelectedSurveyId] = useState(initialSurveyId || "")

  // Design State
  const [selectedTemplate, setSelectedTemplate] = useState("modern")
  const [primaryColor, setPrimaryColor] = useState("#000000")
  const [logo, setLogo] = useState<string | null>(null)

  const [customText, setCustomText] = useState("¡Tu opinión nos importa!")
  const [instructions, setInstructions] = useState("")
  const [qrSize, setQrSize] = useState(256)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const fetchedSurveys = await getSurveys(user.uid)
          setSurveys(fetchedSurveys)

          let targetSurveyId = initialSurveyId
          if (fetchedSurveys.length > 0 && !targetSurveyId) {
            targetSurveyId = fetchedSurveys[0].id
          }

          if (targetSurveyId) {
            const exists = fetchedSurveys.find(s => s.id === targetSurveyId)
            if (exists) {
              setSelectedSurveyId(exists.id!)
              // Apply design from survey
              if (exists.design) {
                setSelectedTemplate(exists.design.template ?? "modern")
                setPrimaryColor(exists.design.primaryColor ?? "#000000")
                setLogo(exists.design.logo ?? null)
              }
            } else if (fetchedSurveys.length > 0) {
              // Fallback to first if param invalid
              setSelectedSurveyId(fetchedSurveys[0].id!)
              if (fetchedSurveys[0].design) {
                setSelectedTemplate(fetchedSurveys[0].design.template ?? "modern")
                setPrimaryColor(fetchedSurveys[0].design.primaryColor ?? "#000000")
                setLogo(fetchedSurveys[0].design.logo ?? null)
              }
            }
          }
        } catch (error) {
          console.error("Error fetching surveys:", error)
        } finally {
          setLoading(false)
        }
      }
    })
    return () => unsubscribe()
  }, [])

  // Update design when selection changes manually
  const handleSurveyChange = (surveyId: string) => {
    setSelectedSurveyId(surveyId)
    const survey = surveys.find(s => s.id === surveyId)
    if (survey && survey.design) {
      setSelectedTemplate(survey.design.template || "modern")
      setPrimaryColor(survey.design.primaryColor || "#000000")
      setLogo(survey.design.logo || null)
    }
  }

  const selectedSurvey = surveys.find(s => s.id === selectedSurveyId)
  const surveyUrl = selectedSurveyId
    ? `${window.location.origin}/s/${selectedSurveyId}`
    : "https://nexava.com"

  const handleDownload = (type: 'png' | 'pdf') => {
    if (!selectedSurveyId) return

    const previewElement = document.getElementById('poster-preview')
    if (previewElement) {
      // Simple download logic for now, utilizing the QR canvas directly for higher quality if needed, 
      // or we could use html2canvas if we wanted the full poster. 
      // For consistency with previous logic, let's stick to downloading the QR or we can enhance to download poster.
      // User asked for "Descargar PNG" usually referring to the QR. 
      // If we want the *poster*, we need html2canvas. Let's stick to QR download for safety unless requested otherwise,
      // BUT the user interface implies "Descargar PNG" of the preview? 
      // limit: The previous code downloaded just the QR canvas. Let's keep that for stability, 
      // but maybe the user wants the WHOLE poster? The design step had "Descargar póster (PDF)".
      // Let's stick to the existing functioning QR download to avoid breaking it, but rename button if needed.

      const canvas = document.getElementById('qr-code-canvas') as HTMLCanvasElement
      if (canvas) {
        const pngUrl = canvas.toDataURL("image/png")
        const downloadLink = document.createElement("a")
        downloadLink.href = pngUrl
        downloadLink.download = `qrcode-${selectedSurveyId}.png`
        document.body.appendChild(downloadLink)
        downloadLink.click()
        document.body.removeChild(downloadLink)
        toast.success("Código QR descargado")
      }
    }
  }

  const handleCopyUrl = () => {
    if (!selectedSurveyId) return
    navigator.clipboard.writeText(surveyUrl)
    toast.success("URL copiada al portapapeles")
  }

  if (loading) {
    return <div className="flex justify-center p-10"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
  }

  // Styles helpers
  const isClassic = selectedTemplate === "classic"
  const isColorful = selectedTemplate === "colorful"
  const isMinimal = selectedTemplate === "minimal"

  return (
    <div className="space-y-8 pb-10">
      <div className="space-y-1">
        <h1 className="text-4xl font-black tracking-tight text-gray-900">Generador de QR</h1>
        <p className="text-muted-foreground text-lg italic font-medium">Obtén el código y el póster premium para tu encuesta.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuración */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="survey">Seleccionar encuesta</Label>
                <Select value={selectedSurveyId} onValueChange={handleSurveyChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Elige una encuesta" />
                  </SelectTrigger>
                  <SelectContent>
                    {surveys.map((survey) => (
                      <SelectItem key={survey.id} value={survey.id || ""}>
                        <div className="flex items-center gap-2">
                          {survey.name}
                          <Badge variant="outline" className={`text-xs ${survey.status === 'Publicada' ? 'bg-green-50 text-green-700 border-green-200' : ''}`}>
                            {survey.status}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  El diseño se carga automáticamente de la configuración de la encuesta.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="size">Tamaño del QR</Label>
                <Select value={qrSize.toString()} onValueChange={(val) => setQrSize(parseInt(val))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="128">Pequeño (128px)</SelectItem>
                    <SelectItem value="256">Mediano (256px)</SelectItem>
                    <SelectItem value="512">Grande (512px)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="text">Texto del póster</Label>
                <Input
                  id="text"
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="Ej: ¡Tu opinión nos importa!"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructions">Instrucciones pie de página</Label>
                <Textarea
                  id="instructions"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Ej: Escanea con tu móvil"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Estilo detectado</CardTitle>
              <p className="text-sm text-muted-foreground">Basado en el diseño de tu encuesta</p>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium">Plantilla</span>
                  <Badge variant="secondary" className="capitalize">{selectedTemplate}</Badge>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium">Color</span>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full border" style={{ backgroundColor: primaryColor }} />
                    <span className="text-xs text-muted-foreground">{primaryColor}</span>
                  </div>
                </div>
                {logo && (
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium">Logo</span>
                    <span className="text-xs text-green-600 font-medium flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span> Activo
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Vista previa */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Vista previa del póster</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/30 rounded-xl p-8 flex justify-center">
                {/* Poster Preview matching Design Step logic */}
                <div
                  id="poster-preview"
                  className={`bg-white rounded-lg shadow-xl w-full max-w-sm aspect-[3/4] p-6 relative flex flex-col overflow-hidden transition-all duration-300`}
                >
                  {/* Top Bar for Colorful/General */}
                  {!isMinimal && (
                    <div className="h-2 w-full absolute top-0 left-0" style={{ backgroundColor: primaryColor }} />
                  )}

                  {/* Content */}
                  <div className={`flex-1 flex flex-col items-center justify-center text-center space-y-4 z-10 ${isClassic ? 'font-serif' : 'font-sans'}`}>
                    {logo ? (
                      <img src={logo} alt="Logo" className="h-12 object-contain mb-2" />
                    ) : (
                      <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-2">
                        <span className="text-xs text-gray-400">Logo</span>
                      </div>
                    )}

                    <h3 className="text-xl font-bold" style={{ color: primaryColor }}>
                      {customText}
                    </h3>
                    {instructions && (
                      <p className="text-sm text-gray-600 max-w-[80%]">{instructions}</p>
                    )}
                  </div>

                  {/* QR Code */}
                  <div className="mt-auto flex flex-col items-center z-10 pb-4">
                    <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-100 mb-2">
                      {selectedSurveyId ? (
                        <QRCodeCanvas
                          id="qr-code-canvas"
                          value={surveyUrl}
                          size={200}
                          level={"H"}
                          includeMargin={true}
                        />
                      ) : (
                        <div className="h-[200px] w-[200px] bg-gray-100 flex items-center justify-center">
                          <QrCode className="h-16 w-16 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">
                      {selectedSurveyId ? `NAV.ID: ${selectedSurveyId.substring(0, 6)}` : "SCAN ME"}
                    </p>
                  </div>

                  {/* Background Effects */}
                  {isColorful && (
                    <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-gray-50 opacity-50 z-0 pointer-events-none" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Descargas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" disabled={!selectedSurveyId} onClick={() => handleDownload('png')}>
                <Download className="h-4 w-4 mr-2" />
                Descargar Código QR (PNG)
              </Button>
              <Button variant="outline" className="w-full" disabled={!selectedSurveyId} onClick={handleCopyUrl}>
                <Copy className="h-4 w-4 mr-2" />
                Copiar Enlace Directo
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function QRGeneratorPage() {
  return (
    <Suspense fallback={<div className="flex justify-center p-20"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>}>
      <QRGeneratorContent />
    </Suspense>
  )
}
