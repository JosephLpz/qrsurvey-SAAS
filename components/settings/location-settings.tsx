"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Building2,
  Plus,
  Edit,
  Trash2,
  Loader2,
  Power,
  PowerOff,
  CheckCircle2,
  XCircle
} from "lucide-react"
import { auth } from "@/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"
import {
  getLocations,
  createLocation,
  updateLocation,
  deleteLocation,
  type Location
} from "@/lib/services/locations"
import { getUserProfile } from "@/lib/services/users"
import { toast } from "sonner"
import { Sparkles, Lock } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export function LocationSettings() {
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [userPlan, setUserPlan] = useState<"free" | "pro">("free")

  // Form State
  const [name, setName] = useState("")
  const [manager, setManager] = useState("")
  const [address, setAddress] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")

  // Edit State
  const [editLocation, setEditLocation] = useState<Location | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u)
        loadLocations(u.uid)

        // Fetch plan
        try {
          const profile = await getUserProfile(u.uid)
          if (profile) setUserPlan(profile.plan)
        } catch (error) {
          console.error("Error fetching plan:", error)
        }
      }
    })
    return () => unsubscribe()
  }, [])

  async function loadLocations(uid: string) {
    try {
      setLoading(true)
      const data = await getLocations(uid)
      setLocations(data)
    } catch (error) {
      console.error("Error loading locations:", error)
      toast.error("Error al cargar las sedes")
    } finally {
      setLoading(false)
    }
  }

  const handleAddLocation = async () => {
    if (userPlan === "free" && locations.length >= 1) {
      toast.error("Límite alcanzado: El plan gratuito solo permite 1 sede.", {
        description: "Mejora a Pro para sedes ilimitadas.",
        duration: 5000,
      })
      return
    }

    if (!name || !address) {
      toast.error("El nombre y la dirección son obligatorios")
      return
    }

    try {
      setSaving(true)
      await createLocation(user.uid, {
        name,
        manager,
        address,
        phone,
        email
      })
      toast.success("Sede añadida con éxito")
      // Reset form
      setName("")
      setManager("")
      setAddress("")
      setPhone("")
      setEmail("")
      loadLocations(user.uid)
    } catch (error) {
      toast.error("Error al crear la sede")
    } finally {
      setSaving(false)
    }
  }

  const handleToggleStatus = async (location: Location) => {
    const newStatus = location.status === "Activa" ? "Inactiva" : "Activa"
    try {
      await updateLocation(location.id, { status: newStatus })
      setLocations(locations.map(l => l.id === location.id ? { ...l, status: newStatus } : l))
      toast.success(`Sede ${newStatus.toLowerCase()}`)
    } catch (error) {
      toast.error("Error al cambiar el estado")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta sede?")) return
    try {
      await deleteLocation(id)
      setLocations(locations.filter(l => l.id !== id))
      toast.success("Sede eliminada")
    } catch (error) {
      toast.error("Error al eliminar")
    }
  }

  const handleUpdate = async () => {
    if (!editLocation) return
    try {
      setSaving(true)
      await updateLocation(editLocation.id, {
        name: editLocation.name,
        manager: editLocation.manager,
        address: editLocation.address,
        phone: editLocation.phone,
        email: editLocation.email,
      })
      toast.success("Sede actualizada")
      setIsEditDialogOpen(false)
      loadLocations(user.uid)
    } catch (error) {
      toast.error("Error al actualizar")
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
      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle>Añadir nueva sede</CardTitle>
          <CardDescription>Configura un nueva ubicación para tus encuestas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="locationName">Nombre de la sede</Label>
              <Input
                id="locationName"
                placeholder="Ej: Sucursal Centro"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="manager">Responsable</Label>
              <Input
                id="manager"
                placeholder="Nombre del responsable"
                value={manager}
                onChange={(e) => setManager(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Dirección</Label>
            <Input
              id="address"
              placeholder="Dirección completa"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                placeholder="+34 600 123 456"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="sede@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <Button
            onClick={handleAddLocation}
            disabled={saving || (userPlan === "free" && locations.length >= 1)}
            className="shadow-lg shadow-primary/20"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : (userPlan === "free" && locations.length >= 1 ? <Lock className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />)}
            {userPlan === "free" && locations.length >= 1 ? "Límite de sede alcanzado" : "Añadir sede"}
          </Button>

          {userPlan === "free" && locations.length >= 1 && (
            <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-primary" />
                <div className="text-xs">
                  <span className="font-bold">¿Necesitas más sedes?</span>
                  <p className="text-muted-foreground">El plan Pro incluye sedes ilimitadas y soporte multi-sede.</p>
                </div>
              </div>
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-[10px] font-bold h-7">MEJORAR A PRO</Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Sedes Activas</CardTitle>
            <CardDescription>Gestiona las ubicaciones registradas en tu sistema</CardDescription>
          </div>
          <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-4 py-1">
            {locations.length} Total
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="pl-6">Sede</TableHead>
                <TableHead>Responsable</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right pr-6">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {locations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-20 text-muted-foreground">
                    No tienes sedes registradas todavía.
                  </TableCell>
                </TableRow>
              ) : (
                locations.map((location) => (
                  <TableRow key={location.id} className="group hover:bg-muted/30 transition-colors">
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${location.status === "Activa" ? "bg-primary/10 text-primary" : "bg-slate-100 text-slate-400"
                          }`}>
                          <Building2 className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-bold">{location.name}</div>
                          <div className="text-xs text-muted-foreground">{location.address}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{location.manager || "-"}</div>
                      <div className="text-[10px] text-muted-foreground uppercase">{location.email}</div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`rounded-full px-3 font-semibold ${location.status === "Activa"
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-slate-50 text-slate-500 border-slate-200"
                          }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full mr-2 ${location.status === "Activa" ? "bg-green-600" : "bg-slate-400"
                          }`} />
                        {location.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          title={location.status === "Activa" ? "Desactivar" : "Activar"}
                          onClick={() => handleToggleStatus(location)}
                          className={location.status === "Activa" ? "text-orange-500 hover:bg-orange-50" : "text-green-500 hover:bg-green-50"}
                        >
                          {location.status === "Activa" ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Editar"
                          onClick={() => {
                            setEditLocation(location)
                            setIsEditDialogOpen(true)
                          }}
                          className="text-primary hover:bg-primary/10"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Eliminar"
                          onClick={() => handleDelete(location.id)}
                          className="text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Sede</DialogTitle>
            <DialogDescription>
              Modifica la información de {editLocation?.name}
            </DialogDescription>
          </DialogHeader>
          {editLocation && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Nombre de la sede</Label>
                <Input
                  value={editLocation.name}
                  onChange={(e) => setEditLocation({ ...editLocation, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Responsable</Label>
                <Input
                  value={editLocation.manager}
                  onChange={(e) => setEditLocation({ ...editLocation, manager: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Dirección</Label>
                <Input
                  value={editLocation.address}
                  onChange={(e) => setEditLocation({ ...editLocation, address: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Teléfono</Label>
                  <Input
                    value={editLocation.phone}
                    onChange={(e) => setEditLocation({ ...editLocation, phone: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Email</Label>
                  <Input
                    value={editLocation.email}
                    onChange={(e) => setEditLocation({ ...editLocation, email: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleUpdate} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
