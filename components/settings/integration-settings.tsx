"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { ExternalLink, Key, Zap, Mail, Database, Webhook } from "lucide-react"

const integrations = [
  {
    id: "google-sheets",
    name: "Google Sheets",
    description: "Exporta automáticamente las respuestas a una hoja de cálculo",
    icon: Database,
    connected: true,
    category: "Exportación",
  },
  {
    id: "webhooks",
    name: "Webhooks",
    description: "Envía datos en tiempo real a tu aplicación",
    icon: Webhook,
    connected: false,
    category: "Desarrollo",
  },
  {
    id: "zapier",
    name: "Zapier",
    description: "Conecta con más de 5,000 aplicaciones",
    icon: Zap,
    connected: false,
    category: "Automatización",
  },
  {
    id: "mailchimp",
    name: "Mailchimp",
    description: "Sincroniza contactos y segmenta audiencias",
    icon: Mail,
    connected: true,
    category: "Marketing",
  },
]

export function IntegrationSettings() {
  return (
    <div className="space-y-6 opacity-80 cursor-not-allowed">
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-6 mb-6">
        <h3 className="text-lg font-bold text-primary flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Módulo en Desarrollo
        </h3>
        <p className="text-sm text-primary/80 mt-1">
          Estamos trabajando para conectar QRSurvey con tus herramientas favoritas.
          Las integraciones con Google Sheets, Zapier y Webhooks estarán disponibles próximamente.
        </p>
      </div>

      <Card className="pointer-events-none grayscale-[0.5]">
        <CardHeader>
          <CardTitle>Integraciones disponibles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {integrations.map((integration) => (
              <div key={integration.id} className="p-4 border rounded-lg bg-muted/30">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/5 rounded-lg flex items-center justify-center">
                      <integration.icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <h4 className="font-medium text-muted-foreground">{integration.name}</h4>
                      <Badge variant="outline" className="text-[10px] uppercase font-bold text-muted-foreground/50">
                        {integration.category}
                      </Badge>
                    </div>
                  </div>
                  <Switch checked={false} disabled />
                </div>
                <p className="text-sm text-muted-foreground/60 mb-3">{integration.description}</p>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="bg-slate-100 text-slate-400">
                    Próximamente
                  </Badge>
                  <Button variant="outline" size="sm" disabled className="bg-transparent opacity-50">
                    Conectar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="pointer-events-none grayscale-[0.5]">
        <CardHeader>
          <CardTitle>API y Webhooks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="opacity-50">
              <Label htmlFor="api-key">Clave API</Label>
              <div className="flex gap-2 mt-2">
                <Input id="api-key" type="password" value="sk_live_••••••••••••••••••••••••••••••••" readOnly disabled />
                <Button variant="outline" size="icon" className="bg-transparent" disabled>
                  <Key className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-1 text-xs">Acceso API restringido en beta</p>
            </div>

            <Separator />

            <div className="opacity-50">
              <Label htmlFor="webhook-url">URL del Webhook</Label>
              <div className="flex gap-2 mt-2">
                <Input id="webhook-url" placeholder="https://tu-app.com/webhook" disabled />
                <Button variant="outline" className="bg-transparent" disabled>
                  Probar
                </Button>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <Button disabled className="opacity-50">Guardar configuración</Button>
            <Button variant="outline" className="bg-transparent opacity-50" disabled>
              <ExternalLink className="h-4 w-4 mr-2" />
              Ver documentación
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
