import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function Benefits() {
  const useCases = [
    {
      title: "Restaurantes",
      description: "Mide la satisfacción de tus comensales y mejora tu servicio",
      badge: "Hostelería",
      image: "/restaurant-interior-with-qr-code-on-table.jpg",
    },
    {
      title: "Clínicas",
      description: "Evalúa la experiencia del paciente y optimiza la atención médica",
      badge: "Salud",
      image: "/modern-medical-clinic-waiting-room.jpg",
    },
    {
      title: "Retail",
      description: "Conoce la opinión de tus clientes sobre productos y atención",
      badge: "Comercio",
      image: "/modern-retail-store-with-customer-service.jpg",
    },
  ]

  return (
    <section className="py-16 px-4 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">Perfecto para cualquier negocio</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Miles de empresas ya confían en QRSurvey para mejorar su experiencia de cliente
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {useCases.map((useCase, index) => (
            <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                <img
                  src={useCase.image || "/placeholder.svg"}
                  alt={useCase.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <div className="mb-3">
                  <Badge variant="secondary">{useCase.badge}</Badge>
                </div>
                <h3 className="text-xl font-semibold mb-3">{useCase.title}</h3>
                <p className="text-muted-foreground">{useCase.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
