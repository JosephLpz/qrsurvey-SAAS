"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, Save, Upload, Trash2 } from "lucide-react"
import { auth, db } from "@/lib/firebase"
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore"
import { updateProfile } from "firebase/auth"
import { toast } from "sonner"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"

export function AccountSettings() {
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    bio: "",
    avatar: "",
    language: "es",
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser
      if (user) {
        try {
          const docRef = doc(db, "users", user.uid)
          const docSnap = await getDoc(docRef)

          if (docSnap.exists()) {
            const data = docSnap.data()
            setUserData({
              name: data.name || user.displayName || "",
              email: data.email || user.email || "",
              phone: data.phone || "",
              company: data.company || "",
              bio: data.bio || "",
              avatar: data.avatar || user.photoURL || "",
              language: data.language || "es",
            })
          } else {
            setUserData({
              name: user.displayName || "",
              email: user.email || "",
              phone: "",
              company: "",
              bio: "",
              avatar: user.photoURL || "",
              language: "es",
            })
          }
        } catch (error) {
          console.error("Error fetching user data:", error)
          toast.error("Error al cargar datos del perfil")
        } finally {
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [])

  const updateField = async (field: string, value: string) => {
    const user = auth.currentUser
    if (!user) return
    try {
      const docRef = doc(db, "users", user.uid)
      await setDoc(docRef, { [field]: value }, { merge: true })
      setUserData(prev => ({ ...prev, [field]: value }))
      if (field === 'language') toast.success("Idioma actualizado")
    } catch (error) {
      toast.error("Error al actualizar")
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const user = auth.currentUser

    if (!user) {
      toast.error("Debes estar autenticado")
      return
    }

    try {
      // Update Firebase Auth Profile
      if (userData.name !== user.displayName) {
        await updateProfile(user, { displayName: userData.name })
      }

      // Update Firestore User Doc
      const docRef = doc(db, "users", user.uid)
      await setDoc(docRef, {
        name: userData.name,
        company: userData.company,
        phone: userData.phone,
        bio: userData.bio,
        language: userData.language,
        updatedAt: new Date(),
      }, { merge: true })

      toast.success("Perfil actualizado correctamente")
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Error al actualizar el perfil")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="flex justify-center p-12">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Información personal</CardTitle>
          <CardDescription>Actualiza tu información personal y foto de perfil</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6 pb-4 border-b">
            <div className="relative group">
              <Avatar className="h-24 w-24 border-2 border-primary/10 shadow-lg transition-transform group-hover:scale-105">
                <AvatarImage src={userData.avatar} alt="Avatar" />
                <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">
                  {userData.name?.substring(0, 2).toUpperCase() || "UN"}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1.5 shadow-md border group-hover:bg-primary group-hover:text-white transition-colors">
                <Camera className="h-4 w-4" />
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-lg">{userData.name || "Usuario Nexava"}</h3>
              <p className="text-sm text-muted-foreground">{userData.email}</p>
              <div className="flex gap-2 mt-2">
                <Button variant="outline" size="sm" className="h-8">
                  <Upload className="h-3.5 w-3.5 mr-2" />
                  Subir Imagen
                </Button>
                {userData.avatar && (
                  <Button variant="ghost" size="sm" className="h-8 text-red-500 hover:text-red-600 hover:bg-red-50">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre completo</Label>
                <Input
                  id="name"
                  value={userData.name}
                  onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  value={userData.email}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Empresa</Label>
                <Input
                  id="company"
                  value={userData.company}
                  onChange={(e) => setUserData({ ...userData, company: e.target.value })}
                  placeholder="Nombre de tu empresa"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  value={userData.phone}
                  onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                  placeholder="+123456789"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Descripción</Label>
              <Textarea
                id="bio"
                value={userData.bio}
                onChange={(e) => setUserData({ ...userData, bio: e.target.value })}
                placeholder="Cuéntanos sobre ti..."
                rows={3}
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Guardando..." : "Guardar cambios"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferencias</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Idioma</Label>
            <Select
              value={userData.language}
              onValueChange={(val) => updateField('language', val)}
            >
              <SelectTrigger className="w-full md:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="pt">Português</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
