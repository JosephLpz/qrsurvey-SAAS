import { Card, CardContent } from "@/components/ui/card"
import { FileText, QrCode, BarChart3, ArrowRight } from "lucide-react"

export function HowItWorks() {
  const steps = [
    {
      icon: FileText,
      title: "Diseña tu Encuesta",
      description: "Crea formularios inteligentes en minutos con nuestro editor de alta fidelidad.",
      color: "bg-orange-50 text-orange-600"
    },
    {
      icon: QrCode,
      title: "Crea tu Póster PRO",
      description: "Personaliza colores, añade tu logo y utiliza nuestros presets industriales.",
      color: "bg-orange-100 text-orange-700"
    },
    {
      icon: BarChart3,
      title: "Inteligencia de Datos",
      description: "Analiza NPS, tendencias y riesgos con nuestro Dashboard AI en tiempo real.",
      color: "bg-slate-50 text-slate-700"
    },
  ]

  return (
    <section className="py-24 lg:py-32 px-4 bg-white">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-20">
          <div className="text-orange-600 font-black text-xs uppercase tracking-[0.2em] mb-4">El Proceso</div>
          <h2 className="text-4xl lg:text-6xl font-black text-slate-900 tracking-tight mb-6">Mide resultados en <span className="text-orange-600">3 pasos</span></h2>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium">
            Sin complicaciones técnicas. Diseñado para entornos retail, salud y servicios de alta demanda.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-12 relative">
          {/* Connector line for desktop */}
          <div className="hidden lg:block absolute top-1/2 left-0 w-full h-px bg-slate-100 -translate-y-1/2 -z-10" />

          {steps.map((step, index) => (
            <div key={index} className="group relative">
              <Card className="border-none shadow-none bg-transparent text-center transition-all duration-300">
                <CardContent className="pt-0 space-y-6">
                  <div className="relative inline-block">
                    <div className={`w-24 h-24 ${step.color} rounded-3xl flex items-center justify-center transition-transform group-hover:-translate-y-2 duration-500 shadow-xl shadow-transparent group-hover:shadow-orange-100`}>
                      <step.icon className="w-10 h-10" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white border-2 border-slate-100 rounded-2xl flex items-center justify-center font-black text-slate-900 text-sm shadow-sm">
                      0{index + 1}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-2xl font-black text-slate-900">{step.title}</h3>
                    <p className="text-slate-500 font-medium leading-relaxed">{step.description}</p>
                  </div>

                  {index < 2 && (
                    <div className="lg:hidden flex justify-center py-4">
                      <ArrowRight className="h-6 w-6 text-slate-200 rotate-90" />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
