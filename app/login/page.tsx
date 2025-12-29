"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { toast } from "sonner"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await signInWithEmailAndPassword(auth, email, password)
      toast.success("Has iniciado sesión correctamente")
      router.push("/dashboard")
    } catch (error: any) {
      console.error("Error logging in:", error)
      let errorMessage = "Error al iniciar sesión"
      if (error.code === "auth/invalid-credential") {
        errorMessage = "Correo o contraseña incorrectos"
      } else if (error.code === "auth/user-not-found") {
        // Fallback for older instances or if protection is disabled
        errorMessage = "No existe una cuenta registrada con este correo"
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Contraseña incorrecta"
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Demasiados intentos fallidos. Intenta más tarde."
      }
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 -mr-24 -mt-24 w-[500px] h-[500px] bg-orange-50 rounded-full blur-3xl opacity-50" />
      <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-[400px] h-[400px] bg-orange-50/50 rounded-full blur-3xl opacity-50" />

      <Card className="w-full max-w-md border-none shadow-2xl shadow-orange-100/50 rounded-[2.5rem] relative z-10 p-4">
        <CardHeader className="text-center space-y-6 pt-10">
          <Link href="/" className="text-3xl font-black tracking-tight flex items-center justify-center gap-2">
            <span className="text-orange-600">QR</span>
            <span className="text-slate-900">Survey</span>
          </Link>
          <div className="space-y-2">
            <CardTitle className="text-4xl font-black text-slate-900 tracking-tight">Iniciar sesión</CardTitle>
            <CardDescription className="text-slate-500 font-medium">Ingresa para gestionar tus encuestas inteligentes</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pb-12">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700 font-bold ml-1">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-orange-500/20 transition-all font-medium"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700 font-bold ml-1">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-orange-500/20 transition-all font-medium"
              />
            </div>
            <Button type="submit" className="w-full h-14 bg-orange-600 hover:bg-orange-700 text-white font-black text-lg rounded-2xl shadow-xl shadow-orange-200 transition-all hover:scale-[1.02] active:scale-95" disabled={isLoading}>
              {isLoading ? "Iniciando sesión..." : "Acceder ahora"}
            </Button>
          </form>

          <div className="text-center pt-4">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">
              ¿No tienes cuenta?{" "}
              <Link href="/signup" className="text-orange-600 hover:text-orange-700 transition-colors">
                Regístrate gratis
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
