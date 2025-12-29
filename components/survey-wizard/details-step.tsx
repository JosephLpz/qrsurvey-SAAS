import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEffect, useState } from "react"
import { getLocations, Location } from "@/lib/services/locations"
import { auth } from "@/lib/firebase"
import { Loader2 } from "lucide-react"

interface SurveyDetails {
  name: string
  description: string
  sede: string
  language: string
}

interface SurveyDetailsStepProps {
  data: SurveyDetails
  onChange: (data: SurveyDetails) => void
}

export function SurveyDetailsStep({ data, onChange }: SurveyDetailsStepProps) {
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLocations = async () => {
      const user = auth.currentUser
      if (user) {
        try {
          const fetchedLocations = await getLocations(user.uid)
          setLocations(fetchedLocations)
        } catch (error) {
          console.error("Error fetching locations:", error)
        } finally {
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
    }
    fetchLocations()
  }, [])

  const handleChange = (field: keyof SurveyDetails, value: string) => {
    onChange({ ...data, [field]: value })
  }

  return (
    <Card className="border-none shadow-2xl shadow-slate-100 rounded-[2.5rem] overflow-hidden bg-white">
      <CardHeader className="pb-4 pt-8 px-8">
        <CardTitle className="text-2xl font-black text-slate-900">Detalles de la encuesta</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8 px-8 pb-10">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-slate-700 font-black ml-1 uppercase text-[10px] tracking-widest">Nombre de la encuesta *</Label>
          <Input
            id="name"
            placeholder="Ej: Satisfacción del Cliente 2024"
            value={data.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-orange-500/20 transition-all font-bold text-slate-900"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-slate-700 font-black ml-1 uppercase text-[10px] tracking-widest">Descripción</Label>
          <Textarea
            id="description"
            placeholder="Describe el propósito de esta encuesta para orientar a tus analistas..."
            value={data.description}
            onChange={(e) => handleChange("description", e.target.value)}
            rows={4}
            className="rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-orange-500/20 transition-all font-medium text-slate-700 p-4"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="sede" className="text-slate-700 font-black ml-1 uppercase text-[10px] tracking-widest">Sede *</Label>
            <Select value={data.sede} onValueChange={(value) => handleChange("sede", value)}>
              <SelectTrigger disabled={loading} className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-orange-500/20 transition-all font-bold text-slate-900">
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Cargando sedes...</span>
                  </div>
                ) : (
                  <SelectValue placeholder="Selecciona una sede" />
                )}
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-slate-100">
                {locations.length === 0 && !loading ? (
                  <SelectItem value="none" disabled>No hay sedes creadas</SelectItem>
                ) : (
                  locations.map((loc) => (
                    <SelectItem key={loc.id} value={loc.name} className="font-bold">
                      {loc.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="language" className="text-slate-700 font-black ml-1 uppercase text-[10px] tracking-widest">Idioma de Interfaz</Label>
            <Select value={data.language} onValueChange={(value) => handleChange("language", value)}>
              <SelectTrigger className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-orange-500/20 transition-all font-bold text-slate-900">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-slate-100">
                <SelectItem value="es" className="font-bold">Español (Latinoamérica)</SelectItem>
                <SelectItem value="en" className="font-bold">English (International)</SelectItem>
                <SelectItem value="pt" className="font-bold">Português (Brasil)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="bg-orange-50/50 border border-orange-100 p-8 rounded-[2.5rem] relative overflow-hidden group">
          <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-orange-200 rounded-full blur-2xl opacity-40" />
          <h4 className="font-black text-orange-900 mb-6 flex items-center gap-2 uppercase text-xs tracking-[0.2em] relative z-10">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
            Estrategia de Recolección
          </h4>
          <ul className="text-sm text-slate-600 space-y-4 font-medium relative z-10">
            <li className="flex gap-4 items-start">
              <div className="h-6 w-6 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                <span className="text-orange-600 font-black text-[10px]">01</span>
              </div>
              <span className="pt-0.5">Usa un nombre claro y descriptivo para segmentar tus reportes.</span>
            </li>
            <li className="flex gap-4 items-start">
              <div className="h-6 w-6 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                <span className="text-orange-600 font-black text-[10px]">02</span>
              </div>
              <span className="pt-0.5">La descripción es interna, úsala para definir KPIs específicos.</span>
            </li>
            <li className="flex gap-4 items-start">
              <div className="h-6 w-6 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                <span className="text-orange-600 font-black text-[10px]">03</span>
              </div>
              <span className="pt-0.5">Vincula la sede correcta para habilitar el Benchmarking inteligente.</span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
