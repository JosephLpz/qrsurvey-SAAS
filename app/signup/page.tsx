"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
import { doc, setDoc, Timestamp } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { toast } from "sonner"

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (formData.password !== formData.confirmPassword) {
      toast.error("Las contraseñas no coinciden")
      setIsLoading(false)
      return
    }

    try {
      // 1. Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password)
      const user = userCredential.user

      // 2. Update profile with name
      await updateProfile(user, {
        displayName: formData.name,
      })

      // 3. Create user document in Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: formData.name,
        email: formData.email,
        role: "user", // Default role
        plan: "free", // Default plan
        createdAt: Timestamp.now(),
      })

      toast.success("Cuenta creada exitosamente")
      router.push("/dashboard")
    } catch (error: any) {
      console.error("Error creating account:", error)
      let errorMessage = "Error al crear la cuenta"
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "El correo electrónico ya está en uso"
      } else if (error.code === "auth/weak-password") {
        errorMessage = "La contraseña es muy débil"
      }
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 -mr-24 -mt-24 w-[500px] h-[500px] bg-orange-50 rounded-full blur-3xl opacity-50" />
      <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-[400px] h-[400px] bg-orange-50/50 rounded-full blur-3xl opacity-50" />

      <Card className="w-full max-w-md border-none shadow-2xl shadow-orange-100/50 rounded-[2.5rem] relative z-10 p-4">
        <CardHeader className="text-center space-y-6 pt-10">
          <Link href="/" className="text-3xl font-black tracking-tight flex items-center justify-center gap-2">
            <span className="text-orange-600">Nexava</span>
            <span className="text-slate-900">QRSurvey</span>
          </Link>
          <div className="space-y-2">
            <CardTitle className="text-4xl font-black text-slate-900 tracking-tight">Crear cuenta</CardTitle>
            <CardDescription className="text-slate-500 font-medium text-balance">Comienza gratis y crea tu primera encuesta inteligente en segundos</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pb-12">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-700 font-bold ml-1">Nombre completo</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Tu nombre"
                value={formData.name}
                onChange={handleChange}
                required
                className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-orange-500/20 transition-all font-medium"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700 font-bold ml-1">Correo electrónico</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="tu@email.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-orange-500/20 transition-all font-medium"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700 font-bold ml-1">Contraseña</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-orange-500/20 transition-all font-medium"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-slate-700 font-bold ml-1">Confirmar contraseña</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                minLength={6}
                className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-orange-500/20 transition-all font-medium"
              />
            </div>
            <Button type="submit" className="w-full h-14 bg-orange-600 hover:bg-orange-700 text-white font-black text-lg rounded-2xl shadow-xl shadow-orange-200 transition-all hover:scale-[1.02] active:scale-95 mt-4" disabled={isLoading}>
              {isLoading ? "Creando cuenta..." : "Comenzar gratis"}
            </Button>
          </form>

          <div className="text-center pt-4">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">
              ¿Ya tienes cuenta?{" "}
              <Link href="/login" className="text-orange-600 hover:text-orange-700 transition-colors">
                Iniciar sesión
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
