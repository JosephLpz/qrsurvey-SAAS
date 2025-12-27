import { Card, CardContent } from "@/components/ui/card"
import { FileText, Palette, BarChart3, Users, Zap, Shield, SearchIcon, Layers, Newspaper } from "lucide-react"

export function Features() {
  const features = [
    {
      icon: Palette,
      title: "QR Design Studio PRO",
      description: "Personalización milimétrica para posters A4/A5. Control total de marca y legibilidad industrial.",
      badge: "ELITE"
    },
    {
      icon: BarChart3,
      title: "Analytics Pro Lab",
      description: "Dashboard avanzado con NPS, Mapas de Calor, Drivers de Satisfacción y Análisis de Riesgo.",
      badge: "ADVANCED"
    },
    {
      icon: SearchIcon,
      title: "Voz del Cliente AI",
      description: "Clustering inteligente de comentarios abiertos para detectar patrones de quejas y alabanzas automáticamente.",
      badge: "NEW"
    },
    {
      icon: Users,
      title: "Gestión Multi-Sede",
      description: "Controla múltiples locales desde un solo lugar. Rankings y comparativas de rendimiento inteligentes.",
      badge: "PRO"
    },
    {
      icon: Zap,
      title: "Alertas en Tiempo Real",
      description: "Notificaciones instantáneas vía Webhooks ante caídas críticas de satisfacción o nuevos detractors.",
      badge: "SMART"
    },
    {
      icon: Shield,
      title: "Protocolo Industrial",
      description: "Diseño optimizado para larga distancia de escaneo, altos contrastes y persistencia en entornos físicos.",
      badge: "QUALITY"
    },
  ]

  return (
    <section id="funciones" className="py-24 lg:py-32 px-4 bg-slate-50/50">
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-20">
          <div className="max-w-2xl">
            <div className="text-orange-600 font-black text-xs uppercase tracking-[0.2em] mb-4">Funcionalidades</div>
            <h2 className="text-4xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight">
              Diseñado para la <span className="text-slate-400">excelencia</span> operativa.
            </h2>
          </div>
          <p className="text-xl text-slate-500 max-w-md font-medium">
            Olvídate de las encuestas aburridas. QRSurvey te da el poder analítico de una multinacional.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border-none shadow-none bg-white rounded-[2.5rem] p-4 transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-orange-100 group">
              <CardContent className="p-8 space-y-6">
                <div className="flex justify-between items-start">
                  <div className="w-16 h-16 bg-slate-50 text-orange-600 rounded-2xl flex items-center justify-center transition-colors group-hover:bg-orange-600 group-hover:text-white duration-500">
                    <feature.icon className="w-8 h-8" />
                  </div>
                  <span className="text-[10px] font-black text-orange-500 bg-orange-50 px-3 py-1.5 rounded-full tracking-widest uppercase">
                    {feature.badge}
                  </span>
                </div>

                <div className="space-y-3 pt-2">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">{feature.title}</h3>
                  <p className="text-slate-500 font-medium leading-relaxed">{feature.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
