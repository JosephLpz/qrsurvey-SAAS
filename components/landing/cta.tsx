import { Button } from "@/components/ui/button"
import { Sparkles, ArrowRight } from "lucide-react"
import Link from "next/link"

export function CTA() {
  return (
    <section className="py-24 lg:py-40 px-4 relative overflow-hidden">
      {/* Premium Gradient Background */}
      <div className="absolute inset-0 bg-slate-900" />
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(79,70,229,0.15),transparent)]" />
      <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.1),transparent)]" />

      <div className="container mx-auto max-w-5xl text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-orange-300 text-xs font-black uppercase tracking-widest mb-10">
          <Sparkles className="h-4 w-4" />
          Únete a la élite del feedback
        </div>

        <h2 className="text-5xl lg:text-7xl font-black text-white mb-8 tracking-tighter leading-tight">
          ¿Listo para <span className="text-orange-400">transformar</span> tus datos?
        </h2>

        <p className="text-xl lg:text-2xl text-slate-400 mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
          Empieza a medir la satisfacción de tus clientes hoy mismo con la tecnología QR Pro.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <Link href="/signup">
            <Button className="h-16 px-12 bg-orange-600 hover:bg-orange-700 text-white font-black text-xl rounded-2xl shadow-2xl shadow-orange-500/20 transition-all hover:scale-105 active:scale-95 group">
              Crear mi primera encuesta
              <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        <p className="text-sm font-bold text-slate-500 uppercase tracking-[0.2em] mt-8">
          Pruébalo gratis • Sin tarjeta • Setup en 2 minutos
        </p>
      </div>
    </section>
  )
}
