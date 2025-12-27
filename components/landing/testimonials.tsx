import { Card } from "@/components/ui/card"
import { Star } from "lucide-react"

export function Testimonials() {
  const testimonials = [
    {
      name: "María González",
      role: "Gerente de Operaciones",
      company: "Restaurante El Jardín",
      content:
        "QRSurvey nos ha ayudado a mejorar significativamente la experiencia de nuestros clientes. Los reportes son muy claros y fáciles de entender.",
      rating: 5,
    },
    {
      name: "Dr. Carlos Ruiz",
      role: "Director Médico",
      company: "Clínica San Rafael",
      content:
        "La facilidad para crear encuestas y la rapidez en obtener feedback de nuestros pacientes ha sido increíble. Muy recomendado.",
      rating: 5,
    },
    {
      name: "Ana Martínez",
      role: "Directora de Marketing",
      company: "Tiendas ModaStyle",
      content:
        "El dashboard en tiempo real nos permite tomar decisiones rápidas. La integración con nuestras herramientas existentes fue muy sencilla.",
      rating: 5,
    },
  ]

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">Lo que dicen nuestros clientes</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Más de 1,000 empresas confían en QRSurvey para mejorar su experiencia de cliente
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="p-6">
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                ))}
              </div>
              <blockquote className="text-muted-foreground mb-6 italic">"{testimonial.content}"</blockquote>
              <div>
                <div className="font-semibold">{testimonial.name}</div>
                <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                <div className="text-sm text-primary font-medium">{testimonial.company}</div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
