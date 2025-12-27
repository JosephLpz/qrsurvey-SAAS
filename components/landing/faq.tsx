import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function FAQ() {
  const faqs = [
    {
      question: "¿Cómo garantizan la privacidad de los datos?",
      answer:
        "Cumplimos estrictamente con RGPD y LGPD. Todos los datos están encriptados y almacenados en servidores seguros. Nunca compartimos información personal con terceros.",
    },
    {
      question: "¿Hay límites en el número de respuestas?",
      answer:
        "Cada plan tiene límites específicos: Starter (100/mes), Pro (5,000/mes), Business (50,000/mes). Si necesitas más, podemos crear un plan personalizado.",
    },
    {
      question: "¿Puedo personalizar completamente el diseño del QR?",
      answer:
        "Sí, puedes añadir tu logo, cambiar colores, elegir entre diferentes plantillas y personalizar el texto. En el plan Business tienes control total del branding.",
    },
    {
      question: "¿Qué formatos de exportación están disponibles?",
      answer:
        "Puedes exportar los resultados en CSV, PDF y Excel. También ofrecemos integración con Google Sheets y webhooks para automatizar el flujo de datos.",
    },
    {
      question: "¿Puedo cancelar mi suscripción en cualquier momento?",
      answer:
        "Absolutamente. No hay contratos ni penalizaciones. Puedes cancelar desde tu panel de control y mantendrás acceso hasta el final del período pagado.",
    },
    {
      question: "¿Qué tipo de soporte ofrecen?",
      answer:
        "Ofrecemos soporte por email para todos los planes. Los usuarios Pro tienen soporte estándar y Business incluye soporte prioritario con respuesta en menos de 4 horas.",
    },
  ]

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">Preguntas frecuentes</h2>
          <p className="text-xl text-muted-foreground">Resolvemos las dudas más comunes sobre QRSurvey</p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
