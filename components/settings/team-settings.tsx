"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { UserPlus, MoreHorizontal, Mail, Trash2 } from "lucide-react"

const teamMembers = [
  {
    id: 1,
    name: "María González",
    email: "maria.gonzalez@empresa.com",
    role: "Admin",
    status: "Activo",
    joinedAt: "15 Mar 2024",
  },
  {
    id: 2,
    name: "Carlos Ruiz",
    email: "carlos.ruiz@empresa.com",
    role: "Editor",
    status: "Activo",
    joinedAt: "12 Mar 2024",
  },
  {
    id: 3,
    name: "Ana Martínez",
    email: "ana.martinez@empresa.com",
    role: "Visor",
    status: "Pendiente",
    joinedAt: "10 Mar 2024",
  },
]

export function TeamSettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Invitar miembro del equipo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input id="email" type="email" placeholder="usuario@empresa.com" />
            </div>
            <div className="space-y-2">
              <Label>Rol</Label>
              <Select defaultValue="editor">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">
                    <div>
                      <div className="font-medium">Admin</div>
                      <div className="text-xs text-muted-foreground">Acceso completo</div>
                    </div>
                  </SelectItem>
                  <SelectItem value="editor">
                    <div>
                      <div className="font-medium">Editor</div>
                      <div className="text-xs text-muted-foreground">Crear y editar encuestas</div>
                    </div>
                  </SelectItem>
                  <SelectItem value="viewer">
                    <div>
                      <div className="font-medium">Visor</div>
                      <div className="text-xs text-muted-foreground">Solo ver resultados</div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button className="w-full">
                <UserPlus className="h-4 w-4 mr-2" />
                Enviar invitación
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Miembros del equipo ({teamMembers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Se unió</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teamMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/placeholder.svg" />
                        <AvatarFallback>
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{member.name}</div>
                        <div className="text-sm text-muted-foreground">{member.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={member.role === "Admin" ? "default" : member.role === "Editor" ? "secondary" : "outline"}
                    >
                      {member.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={member.status === "Activo" ? "default" : "secondary"}>{member.status}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{member.joinedAt}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {member.status === "Pendiente" && (
                        <Button variant="ghost" size="icon" title="Reenviar invitación">
                          <Mail className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" title="Eliminar">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" title="Más opciones">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Permisos por rol</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Admin</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Gestionar equipo y roles</li>
                  <li>• Crear y editar encuestas</li>
                  <li>• Ver todos los resultados</li>
                  <li>• Configurar integraciones</li>
                  <li>• Gestionar facturación</li>
                </ul>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Editor</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Crear y editar encuestas</li>
                  <li>• Ver resultados asignados</li>
                  <li>• Exportar datos</li>
                  <li>• Generar códigos QR</li>
                </ul>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Visor</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Ver resultados asignados</li>
                  <li>• Exportar datos básicos</li>
                  <li>• Ver dashboard</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
