# Migración de Stripe a Flow

Este documento explica los cambios realizados para migrar de Stripe a Flow como pasarela de pagos.

## Cambios Realizados

### 1. Nuevo archivo: `lib/flow.ts`
- Configuración base de Flow API
- Helper function `flowRequest` para hacer llamadas autenticadas a Flow

### 2. Actualizado: `app/api/checkout/route.ts`
- Reemplazado Stripe Checkout por Flow Payment
- Ajusta los parámetros según la documentación de Flow API

### 3. Actualizado: `app/api/webhook/route.ts`
- Reemplazado webhooks de Stripe por webhooks de Flow
- Ajusta los tipos de eventos según Flow

### 4. Actualizado: `lib/services/users.ts`
- Cambiado `stripeCustomerId` por `flowCustomerId` en la interfaz `UserProfile`

### 5. Actualizado: `components/settings/billing-settings.tsx`
- Eliminado manejo del portal de facturación (Flow no tiene uno similar)
- El botón "Gestionar suscripción" ahora muestra un mensaje informativo

### 6. Actualizado: `app/api/portal/route.ts`
- Retorna error 501 ya que Flow no tiene portal de facturación

## Pasos para Completar la Migración

### 1. Variables de Entorno

Agrega estas variables a tu archivo `.env.local`:

```env
# Flow API Configuration
FLOW_API_KEY=tu_api_key_de_flow
FLOW_SECRET_KEY=tu_secret_key_de_flow
FLOW_API_URL=https://api.flow.cl/api  # Ajusta según la URL real de Flow

# Precio del plan Pro (en centavos o la unidad que use Flow)
FLOW_PRO_PRICE=19000
```

### 2. Ajustar la Configuración de Flow (`lib/flow.ts`)

Revisa la documentación de Flow y ajusta:
- El método de autenticación (Bearer Token, API Key, etc.)
- La URL base de la API
- Los headers necesarios

### 3. Ajustar el Endpoint de Checkout (`app/api/checkout/route.ts`)

Según la documentación de Flow, ajusta:
- El endpoint para crear pagos (ejemplo: `/payment/create`, `/checkout`, etc.)
- Los campos requeridos en `checkoutData`
- El campo que contiene la URL de pago en la respuesta
- El formato del monto (centavos, pesos, etc.)

### 4. Ajustar Webhooks (`app/api/webhook/route.ts`)

Revisa la documentación de Flow sobre webhooks y ajusta:
- La validación de la firma del webhook
- Los tipos de eventos/estados que Flow envía
- Los campos que Flow envía en el payload
- El campo que contiene el `userId` o identificador del usuario

### 5. Migración de Datos Existentes (Opcional)

Si tienes usuarios existentes con `stripeCustomerId`, puedes:

1. Mantener ambos campos durante un periodo de transición
2. O migrar los datos existentes

```typescript
// Script de migración (ejecutar una vez)
// Importa esto en una función temporal y ejecútala
const migrateStripeToFlow = async () => {
  const usersSnapshot = await dbAdmin.collection("users").get()
  
  for (const doc of usersSnapshot.docs) {
    const data = doc.data()
    if (data.stripeCustomerId && !data.flowCustomerId) {
      // Opcionalmente migrar o simplemente dejar que se actualice naturalmente
      await doc.ref.update({
        // Mantener stripeCustomerId para referencia histórica si es necesario
      })
    }
  }
}
```

### 6. Configurar Webhook en Flow

1. Accede al panel de administración de Flow
2. Configura un webhook que apunte a: `https://tu-dominio.com/api/webhook`
3. Copia el secret del webhook y agrégalo a las variables de entorno si es necesario
4. Implementa la validación de firma en `app/api/webhook/route.ts`

### 7. Eliminar Dependencias de Stripe (Opcional)

Una vez que todo funcione con Flow, puedes eliminar:

```bash
npm uninstall stripe @stripe/stripe-js
```

Y eliminar `lib/stripe.ts` si ya no lo necesitas.

## Notas Importantes

1. **Portal de Facturación**: Flow no tiene un portal de facturación como Stripe. Los usuarios necesitarán gestionar sus suscripciones desde su cuenta de Flow o desde una página personalizada que implementes.

2. **Suscripciones**: Si Flow maneja suscripciones de forma diferente, puede que necesites ajustar la lógica de renovación y cancelación.

3. **Testing**: Prueba exhaustivamente con la cuenta de sandbox/test de Flow antes de hacer el cambio en producción.

4. **Documentación**: Mantén a mano la documentación oficial de Flow API para referencia rápida.

## Recursos

- Documentación de Flow API: [https://www.flow.cl/docs](https://www.flow.cl/docs) (ajusta según la URL real)
- Panel de Flow: [https://www.flow.cl](https://www.flow.cl) (ajusta según la URL real)

## Soporte

Si encuentras problemas, revisa:
1. Los logs del servidor para errores de API
2. Los webhooks en el panel de Flow
3. La documentación oficial de Flow API
4. Los comentarios en el código marcados con `// Ajusta según Flow`

