import { Button } from "@/components/ui/button"
import { QrCode, TrendingUp, Sparkles, CheckCircle2 } from "lucide-react"
import Link from "next/link"

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-white">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 -mr-24 -mt-24 w-[600px] h-[600px] bg-orange-50 rounded-full blur-3xl opacity-50" />
      <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-[400px] h-[400px] bg-orange-50/50 rounded-full blur-3xl opacity-50" />

      <div className="container mx-auto px-4 relative z-10 text-center lg:text-left">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          <div className="flex-1 space-y-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-100 text-orange-700 text-sm font-black uppercase tracking-wider animate-fade-in">
              <Sparkles className="h-4 w-4" />
              Intelligence QR System
            </div>

            <h1 className="text-6xl lg:text-8xl font-black text-slate-900 tracking-tighter leading-[0.9] text-balance">
              Crea, <span className="text-orange-600 block">Imprime</span> <span className="italic font-serif font-extralight text-slate-400">&</span> Mide.
            </h1>

            <p className="text-xl lg:text-2xl text-slate-500 max-w-xl font-medium leading-relaxed">
              La plataforma definitiva para feedback industrial. Genera posters PRO en segundos, imprime y analiza la satisfacción de tus clientes en tiempo real.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 pt-4">
              <Link href="/signup">
                <Button className="h-16 px-10 bg-orange-600 hover:bg-orange-700 text-white font-black text-lg rounded-2xl shadow-2xl shadow-orange-200 transition-all hover:scale-105 active:scale-95 group">
                  Empezar ahora
                  <TrendingUp className="ml-2 h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </Button>
              </Link>
              <Button variant="ghost" className="h-16 px-10 text-slate-600 font-bold text-lg hover:bg-slate-50 rounded-2xl border-2 border-slate-100">
                Ver demo interactiva
              </Button>
            </div>

            <div className="flex items-center gap-8 pt-8">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-orange-500" />
                <span className="text-sm font-bold text-slate-700">QR Design Studio PRO</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-orange-500" />
                <span className="text-sm font-bold text-slate-700">Analytics Pro Lab</span>
              </div>
            </div>
          </div>

          <div className="flex-1 relative w-full max-w-2xl lg:max-w-none">
            {/* Visual Composition */}
            <div className="relative z-10 w-full aspect-square bg-slate-50/50 rounded-3xl border border-slate-100 p-8 flex items-center justify-center filter drop-shadow-2xl">
              {/* Simulated QR Pro Design */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] aspect-[3/4] bg-white rounded-2xl shadow-2xl overflow-hidden border-8 border-white group hover:rotate-2 transition-transform duration-500">
                <div className="bg-orange-600 h-16 flex items-center justify-center">
                  <span className="text-white font-black tracking-widest text-xs uppercase">SÍGUENOS</span>
                </div>
                <div className="p-8 text-center space-y-4">
                  <h3 className="font-black text-2xl text-slate-900 leading-tight">¡Tu opinión nos importa!</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Escanea el código para dejarnos tus comentarios</p>
                  <div className="w-full aspect-square bg-slate-50 rounded-xl flex items-center justify-center p-6 border-2 border-slate-100 border-dashed">
                    <QrCode className="w-full h-full text-slate-800" />
                  </div>
                </div>
                <div className="absolute bottom-4 left-0 right-0 text-center">
                  <span className="text-[8px] font-black text-slate-300 tracking-[0.3em] uppercase">Premium Scan Protocol</span>
                </div>
              </div>

              {/* Dashboard Float Card */}
              <div className="absolute -bottom-8 -right-8 w-64 p-6 bg-white rounded-2xl shadow-2xl border border-slate-100 animate-bounce-slow">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Satisfacción</span>
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-black text-slate-900">4.88</div>
                  <div className="text-[10px] font-bold text-green-500 flex items-center gap-1">
                    +12.4% <span className="text-slate-400 font-medium">vs mes pasado</span>
                  </div>
                </div>
                <div className="mt-4 flex gap-1 items-end h-12">
                  {[40, 70, 55, 90, 65, 85].map((h, i) => (
                    <div key={i} className="flex-1 bg-orange-100 rounded-t-sm" style={{ height: `${h}%` }}>
                      <div className="w-full bg-orange-500 rounded-t-sm" style={{ height: `${i === 3 ? '100%' : '0%'}` }} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Scannability Badge */}
              <div className="absolute -top-6 -left-6 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3">
                <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center font-black">100</div>
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Scan Score</div>
                  <div className="text-xs font-bold text-slate-900">Perfect Contrast</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
