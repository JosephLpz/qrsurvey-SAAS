import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, ArrowRight } from "lucide-react"
import Link from "next/link"

export function Pricing() {
  const plans = [
    {
      name: "Starter",
      price: "0",
      period: "Gratis por siempre",
      description: "Ideal para validación rápida",
      features: [
        "3 encuestas activas",
        "100 respuestas totales",
        "Diseño QR Básico",
        "Dashboard Estándar",
        "Soporte Comunitario"
      ],
      cta: "Empezar Gratis",
      popular: false,
      color: "border-slate-100"
    },
    {
      name: "Pro",
      price: "19",
      period: "USD / mes",
      description: "Para negocios crecientes",
      features: [
        "50 encuestas activas",
        "5,000 respuestas / mes",
        "QR Design Studio PRO",
        "Analytics Pro Lab",
        "Exportación de Datos",
        "Gestión Multi-Sede (1 activo)",
        "Soporte Prioritario"
      ],
      cta: "Mejorar a Pro",
      popular: true,
      color: "border-indigo-600 ring-4 ring-indigo-50"
    },
    {
      name: "Business",
      price: "49",
      period: "USD / mes",
      description: "Para escalas industriales",
      features: [
        "Encuestas Ilimitadas",
        "50,000 respuestas / mes",
        "Voz del Cliente AI",
        "Multi-Sede Ilimitada",
        "Roles y Permisos",
        "Branding Completo White-Label",
        "API & Webhooks Pro"
      ],
      cta: "Contratar Business",
      popular: false,
      color: "border-slate-100"
    },
  ]

  return (
    <section id="precios" className="py-24 lg:py-32 px-4 bg-white relative overflow-hidden">
      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="text-center mb-20">
          <div className="text-orange-600 font-black text-xs uppercase tracking-[0.2em] mb-4">Inversión</div>
          <h2 className="text-4xl lg:text-6xl font-black text-slate-900 tracking-tight mb-6">Planes que <span className="text-orange-600">escalan</span> contigo</h2>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium">
            Sin contratos ocultos. Cambia de plan en cualquier momento desde tu panel.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <Card key={index} className={`flex flex-col border-2 rounded-[2.5rem] p-4 transition-all duration-500 hover:shadow-2xl ${plan.color} ${plan.popular ? 'scale-105 z-20 bg-white border-orange-600 ring-4 ring-orange-50' : 'bg-slate-50/50'}`}>
              <CardHeader className="text-center space-y-4 pt-10">
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-orange-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-lg">
                    Recomendado
                  </div>
                )}
                <div>
                  <h3 className="text-2xl font-black text-slate-900">{plan.name}</h3>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">{plan.description}</p>
                </div>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-black text-slate-900 tracking-tighter">${plan.price}</span>
                  <span className="text-slate-400 font-bold text-sm tracking-tight">{plan.period}</span>
                </div>
              </CardHeader>

              <CardContent className="flex-1 space-y-6 pt-6">
                <div className="h-px bg-slate-100 w-full" />
                <ul className="space-y-4">
                  {plan.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-center gap-3">
                      <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${plan.popular ? 'bg-orange-600' : 'bg-slate-200'}`}>
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-sm font-bold text-slate-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="pb-10 pt-6">
                <Link href="/signup" className="w-full">
                  <Button
                    className={`w-full h-14 rounded-2xl font-black text-lg transition-all ${plan.popular
                      ? 'bg-orange-600 hover:bg-orange-700 text-white shadow-xl shadow-orange-100 hover:scale-[1.02]'
                      : 'bg-white border-2 border-slate-200 text-slate-900 hover:bg-slate-50'
                      }`}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>

        <p className="text-center text-slate-400 font-bold text-xs uppercase tracking-widest mt-12">
          Todos los planes incluyen prueba gratuita. No se requiere tarjeta de crédito.
        </p>
      </div>
    </section>
  )
}
