"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Download, QrCode, Upload, Sparkles, Sliders, Trash2, CheckCircle } from "lucide-react"
import Link from "next/link"

interface SurveyDesign {
  template: string
  primaryColor: string
  logo: string | null
  qrPosition: string
}

interface SurveyDesignStepProps {
  data: SurveyDesign
  onChange: (data: SurveyDesign) => void
  plan?: "free" | "pro"
}

const templates = [
  { id: "modern", name: "Moderno", description: "Diseño limpio y minimalista" },
  { id: "classic", name: "Clásico", description: "Estilo tradicional y elegante" },
  { id: "colorful", name: "Colorido", description: "Vibrante y llamativo" },
  { id: "minimal", name: "Minimal", description: "Máxima simplicidad" },
]

const colors = [
  { name: "Naranja QRSurvey", value: "#FF7A00" },
  { name: "Azul", value: "#0EA5E9" },
  { name: "Verde", value: "#10B981" },
  { name: "Púrpura", value: "#8B5CF6" },
  { name: "Rosa", value: "#EC4899" },
  { name: "Gris", value: "#6B7280" },
]

export function SurveyDesignStep({ data, onChange, plan = "free" }: SurveyDesignStepProps) {
  const handleChange = (field: keyof SurveyDesign, value: string) => {
    onChange({ ...data, [field]: value })
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("El archivo es demasiado grande. Máximo 2MB.")
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        onChange({ ...data, logo: reader.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  // Helper to render a mini preview of the template style
  const renderTemplatePreview = (templateId: string) => {
    const isClassic = templateId === "classic"
    const isColorful = templateId === "colorful"
    const isMinimal = templateId === "minimal"

    return (
      <div className={`w-full h-full rounded flex flex-col p-2 overflow-hidden ${isColorful ? "bg-gradient-to-br from-white to-gray-50 border-t-4" : "bg-white"
        }`} style={isColorful ? { borderTopColor: data.primaryColor } : {}}>
        {!isMinimal && <div className="h-1 w-full mb-1 rounded-full" style={{ backgroundColor: data.primaryColor }} />}
        <div className={`mt-1 space-y-1 ${isClassic ? "font-serif" : "font-sans"}`}>
          <div className="h-1 w-2/3 bg-gray-200 rounded" />
          <div className="h-1 w-1/2 bg-gray-200 rounded" />
        </div>
        <div className="mt-2 space-y-1">
          <div className={`h-4 w-full border border-dashed rounded ${isMinimal ? "border-0 bg-gray-50" : "border-gray-200"}`}></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <Card className="border-none shadow-2xl shadow-slate-100 rounded-[2.5rem] overflow-hidden bg-white">
        <CardHeader className="pt-8 px-8 pb-4">
          <CardTitle className="text-2xl font-black text-slate-900">Estilo de la encuesta</CardTitle>
          <p className="text-sm text-slate-500 font-medium uppercase tracking-widest">Interfaz de Usuario</p>
        </CardHeader>
        <CardContent className="px-8 pb-10">
          <div className="grid grid-cols-2 gap-6">
            {templates.map((template) => (
              <div
                key={template.id}
                className={`relative p-5 border-2 rounded-3xl cursor-pointer transition-all duration-300 group ${data.template === template.id
                  ? "border-orange-600 bg-orange-50/30 ring-4 ring-orange-50"
                  : "border-slate-100 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-100/20"
                  }`}
                onClick={() => handleChange("template", template.id)}
              >
                <div className="aspect-[3/4] bg-white rounded-2xl mb-4 p-3 border border-slate-100 shadow-sm overflow-hidden group-hover:scale-[1.02] transition-transform">
                  {/* Mini Preview Implementation */}
                  {renderTemplatePreview(template.id)}
                </div>
                <h4 className="font-black text-slate-900">{template.name}</h4>
                <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">{template.description}</p>
                {data.template === template.id && (
                  <Badge className="absolute top-4 right-4 bg-orange-600 text-white font-black text-[9px] uppercase tracking-widest py-1 px-3 shadow-lg shadow-orange-200">
                    Seleccionado
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-2xl shadow-slate-100 rounded-[2.5rem] overflow-hidden bg-white">
        <CardHeader className="pt-8 px-8 pb-4">
          <CardTitle className="text-2xl font-black text-slate-900">Personalización de Marca</CardTitle>
          <p className="text-sm text-slate-500 font-medium uppercase tracking-widest">Identidad Visual</p>
        </CardHeader>
        <CardContent className="space-y-10 px-8 pb-10">
          <div className="space-y-4">
            <Label className="text-slate-700 font-black ml-1 uppercase text-[10px] tracking-widest">Paleta Corporativa</Label>
            <div className="flex flex-wrap gap-4">
              {colors.map((color) => (
                <button
                  key={color.value}
                  className={`group relative flex items-center justify-center p-1.5 rounded-full border-2 transition-all duration-300 ${data.primaryColor === color.value
                    ? "border-orange-600 scale-110 shadow-lg shadow-orange-100"
                    : "border-transparent hover:scale-105"
                    }`}
                  onClick={() => handleChange("primaryColor", color.value)}
                  title={color.name}
                >
                  <div className="w-10 h-10 rounded-full shadow-inner" style={{ backgroundColor: color.value }} />
                  {data.primaryColor === color.value && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-2.5 h-2.5 bg-white rounded-full shadow-sm" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-slate-700 font-black ml-1 uppercase text-[10px] tracking-widest">Logotipo de Campaña</Label>
            <div className={`border-2 border-dashed rounded-[2rem] p-10 text-center transition-all duration-500 bg-slate-50/50 ${data.logo ? "border-orange-600/30 bg-orange-50/10" : "border-slate-200 hover:border-orange-600/50 hover:bg-orange-50/20"}`}>
              {data.logo ? (
                <div className="relative group inline-block">
                  <div className="p-4 bg-white rounded-2xl shadow-xl border border-slate-100">
                    <img src={data.logo} alt="Logo" className="h-20 max-w-[200px] object-contain" />
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-3 -right-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    onClick={(e) => {
                      e.stopPropagation();
                      onChange({ ...data, logo: null });
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mx-auto">
                    <Upload className="h-8 w-8 text-slate-300" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-900">Configura tu identidad</p>
                    <div className="relative inline-block mt-2">
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/jpg"
                        onChange={handleLogoUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <Button variant="outline" className="h-10 px-6 rounded-xl border-slate-200 font-black text-xs hover:bg-white hover:text-orange-600 hover:border-orange-600 transition-all">
                        Seleccionar Archivo
                      </Button>
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-4">PNG, JPG hasta 2MB</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-slate-700 font-black ml-1 uppercase text-[10px] tracking-widest">Enfoque del Código QR</Label>
            <Select value={data.qrPosition} onValueChange={(value) => handleChange("qrPosition", value)}>
              <SelectTrigger className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-orange-500/20 transition-all font-bold text-slate-900">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-slate-100">
                <SelectItem value="bottom-right" className="font-bold">Anclaje Inferior Derecho</SelectItem>
                <SelectItem value="bottom-center" className="font-bold">Centrado Inferior</SelectItem>
                <SelectItem value="bottom-left" className="font-bold">Anclaje Inferior Izquierdo</SelectItem>
                <SelectItem value="center" className="font-bold">Punto Central Focal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-2xl shadow-slate-100 rounded-[2.5rem] overflow-hidden bg-white">
        <CardHeader className="pt-8 px-8 pb-4">
          <CardTitle className="text-2xl font-black text-slate-900">Estrategia de Visualización</CardTitle>
          <p className="text-sm text-slate-500 font-medium uppercase tracking-widest">Mockup de Punto de Venta</p>
        </CardHeader>
        <CardContent className="px-8 pb-10">
          <div className="bg-slate-50/50 p-12 rounded-[2rem] border border-slate-100 flex justify-center">
            {/* Real Impact Mockup */}
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm aspect-[3/4] p-8 relative flex flex-col overflow-hidden border-8 border-white group hover:rotate-2 transition-transform duration-500">
              <div className="absolute top-0 left-0 w-full h-24 overflow-hidden">
                <div className="w-full h-full bg-orange-600 transition-colors" style={{ backgroundColor: data.primaryColor }} />
              </div>

              <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-6 pt-12">
                {data.logo ? (
                  <div className="p-2 bg-white rounded-xl shadow-lg border border-slate-50">
                    <img src={data.logo} alt="Logo" className="h-14 object-contain" />
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border-2 border-white/50 text-white">
                    <Sparkles className="h-8 w-8" />
                  </div>
                )}

                <div className="space-y-2">
                  <h3 className="text-2xl font-black italic tracking-tighter uppercase leading-none" style={{ color: data.primaryColor === '#FF7A00' ? '#FF7A00' : data.primaryColor }}>
                    Tu Voz Importa
                  </h3>
                  <div className="h-1 w-12 bg-slate-900 mx-auto rounded-full" />
                </div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-relaxed">
                  Ayúdanos a evolucionar<br />con tu experiencia
                </p>
              </div>

              <div className="mt-auto flex flex-col items-center z-10 space-y-4">
                <div className="relative p-2 bg-white rounded-2xl shadow-2xl border border-slate-100">
                  <div className="p-3 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-inner">
                    <QrCode className="w-24 h-24" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-orange-600 rounded-full border-4 border-white flex items-center justify-center">
                    <CheckCircle className="h-3 w-3 text-white" />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Scannable Integrity OK</p>
                  <p className="text-[8px] font-mono text-slate-300 mt-1">NEXAVA-SECURE-ENTRY</p>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-slate-50 rounded-full blur-3xl opacity-50" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
