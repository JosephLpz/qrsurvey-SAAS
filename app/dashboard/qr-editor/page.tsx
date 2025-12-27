"use client"

import { useState, useEffect } from "react"
import { QRCodeCustomizer, QRSettings } from "@/components/dashboard/qr-customizer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Sparkles, Loader2, Save } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { auth } from "@/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"

export default function QREditorPage() {
    const [loading, setLoading] = useState(true)
    const [isPro, setIsPro] = useState(false) // This will be our "Bypass" for now

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                // En desarrollo, permitimos previsualizar
                setIsPro(true)
            }
            setLoading(false)
        })
        return () => unsubscribe()
    }, [])

    const handleSave = (settings: QRSettings) => {
        console.log("Saving Pro QR Settings:", settings)
        toast.success("Configuración Pro guardada (Simulado)")
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 space-y-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="font-bold text-muted-foreground animate-pulse">Invocando el laboratorio Pro...</p>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-2">
                    <Link href="/dashboard" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-2">
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Volver al dashboard
                    </Link>
                    <div className="flex items-center gap-3">
                        <h1 className="text-4xl font-black tracking-tight">QR Design Studio</h1>
                        <Badge className="bg-gradient-to-r from-orange-400 to-orange-600 text-[10px] font-black italic px-3 border-none shadow-lg">
                            PRO LAB
                        </Badge>
                    </div>
                    <p className="text-muted-foreground max-w-xl italic">
                        Bienvenido al editor de alta fidelidad. Aquí tienes control total sobre la estética de tus pósters y códigos QR.
                    </p>
                </div>

                <div className="flex items-center gap-2 p-1 bg-muted/50 rounded-xl border border-muted-foreground/10">
                    <div className="px-4 py-2 text-xs font-bold text-muted-foreground">MODO ALPHA</div>
                    <Button variant="ghost" size="sm" className="bg-background shadow-sm hover:shadow-md transition-all">
                        <Sparkles className="h-3 w-3 mr-2 text-orange-500" />
                        IA Suggest
                    </Button>
                </div>
            </div>

            <div className="relative">
                <div className="absolute -top-10 -right-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />
                <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-accent/5 rounded-full blur-3xl -z-10" />

                <QRCodeCustomizer
                    initialValue="https://qrsurvey.com/s/joseph-limited-edition"
                    onSave={handleSave}
                />
            </div>

            {/* Instrucción de activación para el usuario */}
            <Card className="border-dashed border-2 border-primary/20 bg-primary/5">
                <div className="p-6 flex flex-col md:flex-row items-center gap-6 justify-between">
                    <div className="space-y-1">
                        <h3 className="font-bold text-primary flex items-center gap-2">
                            <Save className="h-4 w-4" />
                            ¿Como activar para todos?
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Esta sección está en modo "SandBox". Para activarla en el flujo de creación de encuestas, solo debes cambiar el flag <code className="bg-primary/10 px-1 rounded text-primary">ENABLE_PRO_QR</code> a true en el componente Wizard.
                        </p>
                    </div>
                    <Button className="shrink-0 bg-primary hover:bg-primary/90">
                        Generar Versión Final
                    </Button>
                </div>
            </Card>
        </div>
    )
}

// Simple Card placeholder since I used it in instructions
function Card({ children, className }: { children: React.ReactNode, className?: string }) {
    return <div className={`rounded-xl border bg-card text-card-foreground shadow-sm ${className}`}>{children}</div>
}
